import { Type } from "@hology/core/dist/utils/type"
import { CharacterMovementComponent } from "@hology/core/gameplay/actors"
import { AnimationClip } from 'three';


interface AnimationDelegate {
  play(name: string)
  setTimescale(scale: number)
}

interface StateMachineDelegate<C> {
  setAnimationState(state: AnimationState<C>)
}

export abstract class AnimationState<C> {

  constructor(
    private animationStateDelegate: AnimationDelegate,
    private stateMachineDelegate: StateMachineDelegate<C>,
    protected clips: {[name: string]: AnimationClip},
    protected context: C = null
  ) {}

  // Also need information on which to base the animation transitions

  start() {}
  dispose() {}
  update(deltaTime: number) {}

  // Todo Maybe represent an animation clip by something other than a string
  // Todo Setting an animation maybe should behave differently and should target different bone groups
  setAnimation(name: string) {
    this.animationStateDelegate.play(name)
  }
  setTimescale(scale: number) {
    this.animationStateDelegate.setTimescale(scale)
  }

  setState(stateType: Type<AnimationState<C>>) {
    this.stateMachineDelegate.setAnimationState(new stateType(this.animationStateDelegate, this.stateMachineDelegate, this.clips, this.context))
  }
}


interface CharacterAnimationContext {
  movement: CharacterMovementComponent
}

class CharacterMovementAnimationState extends AnimationState<CharacterAnimationContext> {
  // This method needs to know the current clip
  // Getting the displacement also requires knowing the root bone.
  protected setTimescaleFromGroundMovement() {
    //this.setTimescale(clip.duration / displacement * this.context.movement.horizontalSpeed)
  }
}

class Walking extends CharacterMovementAnimationState {
  start(): void {
    /**
     * The file can contain multiple clips
     * I need to be able to refer to a specific clip to play.
     * I also may need to do some transform of the clip before
     * I then need to extract the timescale factor from the clip.
     * I need a collection of clips that I can refer to
     * I am unlikely going to reuse the same one multiple times. 
     */
    this.setAnimation('walking')
  }
  update(deltaTime: number): void {
    this.setTimescaleFromGroundMovement()
    if (this.context.movement.directionInput.vertical < 0) {
      this.setState(WalkingBackward)
    }
  }
}

class WalkingBackward extends CharacterMovementAnimationState {
  start(): void {
    this.setAnimation('walking backwards')
  }
}