import { AnimationClip } from "three"

type TransitionPredicate = (timeElapsed: number) => boolean

let $uuid = 0

class Transition {
  constructor(public readonly state: AnimationState, public readonly predicate: TransitionPredicate) {}
}

export class AnimationState {
  public readonly uuid = $uuid++
  public parent: AnimationState
  public readonly transitions: Transition[] = []
  public name: string

  // An animation montage or more complex animation graph
  // could be used instead of a simple clip here for more functionality like emitting events
  // blending and or chaining animations, masking specific bones. 
  // Whatever plays the animation will need to somehow delegate the event emitted. 

  /**
   * An animation clip does not need to be specified. 
   * This is is to treat the animation state as a conduit to transition to other states.
   * This works both for standalone states as well as child states to group multiple children together
   * under the same transition predicate. 
   */
  constructor(public readonly clip?: AnimationClip) {}

  named(name: string): this {
    this.name = name
    return this
  }

  getAncestors(): AnimationState[] {
    return this.parent != null
      ? [this, ...this.parent.getAncestors()]
      : [this]
  }

  getRoot(): AnimationState {
    return this.parent != null
      ? this.parent.getRoot()
      : this
  }

  createChild(clip: AnimationClip, predicate: TransitionPredicate) {
      const child = new AnimationState(clip)
      child.parent = this
      this.transitionsTo(child, predicate)
      return child
  }

  split(predicate: TransitionPredicate) {
    return [
      this.createChild(null, predicate),
      this.createChild(null, inversePredicate(predicate)),
    ]
  }

  transitionsTo(state: AnimationState, predicate: TransitionPredicate = () => true) {
    this.transitions.push(new Transition(state, predicate))
  }

  transitionsOnComplete(state: AnimationState, predicate?: TransitionPredicate) {
    // The duration of the clip is reduced as some time has to go to the fading
    this.transitionsTo(state, timeElapsed =>  
      (predicate ? predicate(timeElapsed) : false) ||
      timeElapsed >= this.clip.duration - .5)
  }

  transitionsBetween(state: AnimationState, predicate: TransitionPredicate) {
    this.transitionsTo(state, predicate)
    state.transitionsTo(this, inversePredicate(predicate))
  }
}

export class AnimationStateMachine {
  public current: AnimationState
  public timer = 0

  constructor(private initialState: AnimationState) {
      this.current = initialState
  }

  step(deltaTime: number) {
    this.timer += deltaTime
    return this._getNext()
  }

  // Avoid an infinite loop by limiting the number of found nodes on each step
  private _getNext(iterations = 1) {
      //let found = false
      // A state also inherits the transitions of any of its ancestors so that it can exist this
      // state and transition to whatever the ancestor has transitions tod
      //let searchNode = this.current
      //let prevChild = this.current
      /**
       * The problem I have now is that it does not try to transition out from this transition 
       * if an inherited transition is valid.
       * 
       * Evaluating all transitiosn from the ancestor down sort of works. 
       * However, it might get stuck somewhere
       */
      //while (!found && searchNode != null) {
      
          /*for (const transition of this.current.getAllTransitions().reverse()) {
              if (transition.predicate()) {
                  this.current = transition.state
                  found = true
              }
          }*/
         //prevChild = this.current
         //searchNode = searchNode.parent
      //}

      const resolvedState = traverse(this.current.getRoot(), this.timer)
      if (resolvedState.uuid !== this.current.uuid) {
        this.timer = 0
        this.current = resolvedState
      }
      return --iterations > 0 ? this._getNext(iterations) : this.current
  }
}

function traverse(s: AnimationState, timeElapsed: number): AnimationState {
  for (const transition of s.transitions) {
    if (transition.predicate(timeElapsed)) {
        return traverse(transition.state, timeElapsed)
    }
  }
  if (s.clip == null) {
    return s.getAncestors().find(p => p.clip != null) ?? s
  }
  return s
}

const inversePredicate = (predicate: TransitionPredicate) => (time: number) => !predicate(time) 