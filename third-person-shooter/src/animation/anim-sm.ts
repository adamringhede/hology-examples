import { rotateAxis } from "@hology/core/shader-nodes"
import { AnimationClip } from "three"

type TransitionPredicate = () => boolean

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
  // blending and or chaining animations, affecting specific bones. 

  // It is possible to not specify a clip if it is only a group node 
  constructor(public readonly clip?: AnimationClip) {}

  named(name: string): this {
    this.name = name
    return this
  }

  getAllTransitions(): Transition[] {
    return this.parent != null 
      ? this.transitions.concat(...this.parent.getAllTransitions())
      : this.transitions
  }

  getAncestors(): AnimationState[] {
    return this.parent != null
      ? [...this.parent.getAncestors(), this]
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

  transitionsTo(state: AnimationState, predicate: TransitionPredicate) {
    this.transitions.push(new Transition(state, predicate))
  }

  transitionsBetween(state: AnimationState, predicate: TransitionPredicate) {
    this.transitionsTo(state, predicate)
    state.transitionsTo(this, inversePredicate(predicate))
  }
}

export class AnimationStateMachine {
  public current: AnimationState

  constructor(private initialState: AnimationState) {
      this.current = initialState
  }

  step() {
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

      this.current = traverse(this.current.getRoot())

      return --iterations > 0 ? this._getNext(iterations) : this.current
  }
}

function traverse(s: AnimationState): AnimationState {
  for (const transition of s.transitions) {
    if (transition.predicate()) {
        return traverse(transition.state)
    }
  }
  if (s.clip == null) {
    return s.getAncestors().reverse().find(p => p.clip != null) ?? s
  }
  return s
}

const inversePredicate = (predicate: TransitionPredicate) => () => !predicate() 