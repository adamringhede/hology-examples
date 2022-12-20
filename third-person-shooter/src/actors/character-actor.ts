import {
  Actor,
  BaseActor,
  inject,
  PhysicsSystem,
  attach,
  ViewController,
  Component,
  ActorComponent,
} from "@hology/core/gameplay"
import {
  CharacterMovementComponent,
  MeshComponent,
  ThirdPartyCameraComponent,
} from "@hology/core/gameplay/actors"
import { Mesh, MeshStandardMaterial, Vector3, AnimationMixer, AnimationClip, Bone, Vector2, Loader, Object3D, AnimationAction, KeyframeTrack, LoopOnce } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from "../three/FBXLoader";

import ShootingComponent from "./shooting-component"
import { AnimationState, AnimationStateMachine } from '../animation/anim-sm';
import { VectorKeyframeTrack } from "three";
import { AnimationObjectGroup } from "three";
import { takeUntil } from 'rxjs';
import { Root } from "react-dom/client";

enum MovementMode {
  walking = 0,
  swimming = 1,
  falling = 2,
  flying = 3
}


@Actor()
class CharacterActor extends BaseActor {
  private physicsSystem = inject(PhysicsSystem)
  private shooting = attach(ShootingComponent)
  private height = 2.5
  private radius = 1.6
  private isCrouching = false

  private viewController = inject(ViewController)

  private animation = attach(CharacterAnimationComponent)

  mesh = attach(MeshComponent)
  thirdPartyCamera = attach(ThirdPartyCameraComponent)

  public readonly movement = attach(CharacterMovementComponent, {
    colliderHeight: 2.2,
    colliderRadius: .6,
    maxSpeed: 3,
    maxSpeedBackwards: 3,
    maxSpeedSprint: 7,
  })

  constructor() {
    super()
  }


  private async createGraph(mesh: Object3D) {
    const loader = new FBXLoader()

    const clips = await loadClips(loader, {
      run: 'assets/rifle run.fbx',
      walking: 'assets/rifle walking.fbx',
      walkForwardLeft: 'assets/walk forward left.fbx',
      walkForwardRight: 'assets/walk forward right.fbx',
      walkingBackwards: 'assets/walking backwards.fbx',
      idle: 'assets/rifle aiming idle.fbx',
      startWalking: 'assets/start walking.fbx',
      jump: 'assets/jump forward.fbx',
      falling: 'assets/falling idle.fbx',
      strafeLeft: 'assets/strafe (2).fbx',
      strafeRight: 'assets/strafe.fbx',
      reload: 'assets/reload.fbx',
      land: 'assets/hard landing.fbx',
    })

    const rootBone = mesh.children.find(c => c instanceof Bone) as Bone
    if (rootBone == null) {
      throw new Error("No root bone found in mesh")
    }
  
    const makeSm = () => {

      const grounded = new AnimationState(clips.idle).named("grounded")
      const groundMovement = grounded.createChild(null, () => this.movement.horizontalSpeed > 0 && this.movement.mode == MovementMode.walking)
      const [sprint, walk] = groundMovement.split(() => this.movement.isSprinting)      

      const walkForward = walk.createChild(RootMotionClip.fromClip(clips.walking), () => this.movement.directionInput.vertical > 0).named("walk forward")
      walkForward.createChild(RootMotionClip.fromClip(clips.walkForwardLeft), () => this.movement.directionInput.horizontal < 0)
      walkForward.createChild(RootMotionClip.fromClip(clips.walkForwardRight), () => this.movement.directionInput.horizontal > 0)

      walk.createChild(RootMotionClip.fromClip(clips.walkingBackwards), () => this.movement.directionInput.vertical < 0)

      const strafe = walk.createChild(null, () => this.movement.directionInput.vertical == 0).named("abstract strafe")
      strafe.createChild(RootMotionClip.fromClip(clips.strafeLeft), () => this.movement.directionInput.horizontal < 0)
      strafe.createChild(RootMotionClip.fromClip(clips.strafeRight), () => this.movement.directionInput.horizontal > 0)
      
      const fall = new AnimationState(clips.falling).named("fall")
      grounded.transitionsTo(fall, () => this.movement.mode === MovementMode.falling)

      const land = new AnimationState(clips.land)

      fall.transitionsTo(grounded, () => this.movement.mode !== MovementMode.falling && this.movement.directionInput.vector.length() > 0)
      fall.transitionsTo(land, () => this.movement.mode !== MovementMode.falling && this.movement.directionInput.vector.length() == 0)
      land.transitionsOnComplete(grounded, () => 
        this.movement.mode === MovementMode.falling || this.movement.directionInput.vector.length() > 0)

      const runForward = sprint.createChild(RootMotionClip.fromClip(clips.run), () => this.movement.directionInput.vertical > 0).named("sprint forward")
      runForward.createChild(RootMotionClip.fromClip(clips.walkForwardLeft), () => this.movement.directionInput.horizontal < 0)
      runForward.createChild(RootMotionClip.fromClip(clips.walkForwardRight), () => this.movement.directionInput.horizontal > 0)
      sprint.createChild(RootMotionClip.fromClip(clips.walkingBackwards), () => this.movement.directionInput.vertical < 0).named("sprint back")
      // This is a shortcut to reuse another state. This should be used with caution though as it may not have expected results
      sprint.transitionsTo(strafe)
      //sprint.transitionsTo(strafeLeft, () => this.movement.directionInput.horizontal < 0)
      //sprint.transitionsTo(strafeRight, () => this.movement.directionInput.horizontal > 0)

      return new AnimationStateMachine(grounded)
    }
    return {sm: makeSm(), clips}
  }

  async onInit(): Promise<void> {
    const loader = new FBXLoader()
    const gloader = new GLTFLoader()
    const characterMeshPath = 'assets/X Bot.fbx'
    // Some models are using a different rig which are not compatible with some animations
    //const characterMeshPath = 'assets/Ch22_nonPBR.fbx'
    const mesh = await loader.loadAsync(characterMeshPath) as unknown as Mesh

    const characterMaterial = new MeshStandardMaterial({color: 0x999999})
    mesh.traverse(o => {
      if (o instanceof Mesh) {
        o.material = characterMaterial
      }
    })
    
    console.log(mesh)
    const meshRescaleFactor = 1/50
    mesh.scale.multiplyScalar(meshRescaleFactor)

    const {sm, clips} = await this.createGraph(mesh)
    
    this.animation.playStateMachine(sm)
    this.animation.setup(mesh, [findBone(mesh, "mixamorigSpine2")])
    
    this.viewController.tick.subscribe(deltaTime => {
      this.animation.movementSpeed = this.movement.horizontalSpeed / mesh.scale.x
    })

    // Need a way to play just the reload animation
    const reloadClip = RootMotionClip.fromClip(clips.reload)
    reloadClip.fixedInPlace = false
    reloadClip.duration -= 1 // Cut off the end of it 
    setInterval(() => {
      this.animation.playUpper(reloadClip)
    }, 5000)

    this.mesh.replaceMesh(mesh as unknown as Mesh)
  }

  shoot() {
    this.shooting.camera = this.thirdPartyCamera.camera.instance
    this.shooting.trigger()
  }

  moveTo(position: Vector3) {
    this.container.position.copy(position)
    this.physicsSystem.updateActorTransform(this)
  }
}

export default CharacterActor


// There is a way to support n-ary function better 
// https://boopathi.blog/memoizing-an-n-ary-function-in-typescript
function memoize<T, R>(keyFn: (T) => string, fn: (value: T, ...other: any[]) => R) {
  const cache = new Map<string, R>()
  return (value: T, ...other: any[]) => {
    const key = keyFn(value)
    if (!cache.has(key)) {
      cache.set(key, fn(value, ...other))
    }
    return cache.get(key)
  }
}

const makeClipInPlace = memoize(clip => clip.uuid, (clip: AnimationClip, rootBone: Bone): AnimationClip => {
  const copy = clip.clone()
  const rootTrack = copy.tracks.find(t => t.name === `${rootBone.name}.position`)
  if (rootTrack == null) {
    console.warn('Can not find root bone track in clip with root bone name ' + rootBone.name, clip)
    return copy
  }
  for (let i = 3; i < rootTrack.values.length; i += 3) {
    rootTrack.values[i] = rootTrack.values[0]
    rootTrack.values[i+1] = rootTrack.values[1]
    rootTrack.values[i+2] = rootTrack.values[2]
  }
  copy.uuid = clip.uuid
  return copy
})

async function getClip(file: string, loader: Loader, name?: string) {
  const group = await loader.loadAsync(file)
  const clips = group.animations as AnimationClip[]
  if (name != null) {
    return clips.find(c => c.name === 'name')
  }
  return clips[0]
}

async function loadClips<T extends {[name: string]: string}>(loader: Loader, paths: T): Promise<{[Property in keyof T]: AnimationClip}>  {
  const entries = await Promise.all(Object.entries(paths).map(([name, path]) => Promise.all([name, getClip(path, loader)])))
  return Object.fromEntries(entries) as {[Property in keyof T]: AnimationClip}
}

function findRootBone(object: Object3D): Bone {
  let found: Bone
  object.traverse(o => {
    if (o instanceof Bone) {
      if (found == null) {
        found = o
      }
    }
  })
  return found
}


function findBone(object: Object3D, name: string): Bone {
  let found: Bone
  object.traverse(o => {
    if (o instanceof Bone && o.name === name) {
      if (!found || found.children.length < o.children.length) {
        found = o
      }
    }
  })
  return found
}


/**
 * A root motion clip removes the movement track from the clip but stores 
 * it so that it can be reused by a movement controller. 
 * The clip can be configured to be fixed in place which is usually appropriate
 * for animations that should not affect the character's position like normal
 * movement animations like walking and jumping which should be controlled
 * by game logic and physics rather than animation tracks. 
 * Wrapping the animation in root motion though helps the character animation
 * system to use the movement information embedded in the source clip
 * to determine how fast or slow to play the animation.
 * 
 * TODO Replace root motion clip with something else. Should not need to subclass animation clip.
 * Instead the play function should support a more complex type like an animation blueprint/graph/sequence. 
 */
class RootMotionClip extends AnimationClip {
  public motionTrack: VectorKeyframeTrack
  // Distance of the root motion translation in the scale of the animation.
  // If the mesh has been scaled, multiply this value with the scale
  public displacement: number = 0
  public fixedInPlace = true // TODO should be false by defualt but need a nicer way of setting this
  private source: AnimationClip

  public static fromClip(source: AnimationClip, rootBone?: Bone): RootMotionClip {
    const copy = new RootMotionClip(source.name, source.duration, source.tracks.slice(), source.blendMode)
    copy.source = source
    copy.uuid = source.uuid
    copy.motionTrack = rootBone != null
      ? source.tracks.find(t => t.name === `${rootBone.name}.position`)
      : source.tracks.find(t => t instanceof VectorKeyframeTrack)
    if (copy.motionTrack) {
      copy.tracks.splice(copy.tracks.indexOf(copy.motionTrack), 1)
      const startPosition = new Vector3().fromArray(copy.motionTrack.values, 0)
      const endPosition = new Vector3().fromArray(copy.motionTrack.values, copy.motionTrack.values.length - 3)
      copy.displacement = endPosition.distanceTo(startPosition)
    } else {
      console.error("Could not find root motion track", source, rootBone)
    }
    return copy
  }

  clone(): this {
    const copy = RootMotionClip.fromClip(this.source.clone()) 
    // @ts-ignore
    return copy
  }
}

type PlayOptions = Partial<{
  inPlace: boolean
  loop: boolean
  layer: BoneLayer
}>

type BoneLayerId = number
let $uuid: BoneLayerId = 53912381
class BoneLayer {
  uuid: BoneLayerId = $uuid++
  order: number = 0
  boneMask: Bone[] = []
}

class ActionStack {
  actions: AnimationAction[]
  add(action: AnimationAction) {
    this.actions.push(action)
  }
  top(): AnimationAction {
    return this.actions.length > 0 ? this.actions[this.actions.length-1] : null
  }
  pop() {
    this.remove(this.top())
  }
  remove(action: AnimationAction) {
    this.actions.splice(this.actions.indexOf(action), 1)
  }
  removeClip(clip: AnimationClip) {
    this.actions.splice(this.actions.findIndex(a => a.getClip().uuid === clip.uuid), 1)
  }
}

@Component()
class CharacterAnimationComponent extends ActorComponent {
  private viewController = inject(ViewController)
  private mixer: AnimationMixer
  private stateMachines: AnimationStateMachine[] = []
  private fadeTime = .2
  // TODO Supoprt multiple current actions. Maintain one per subtree. 
  //private currentAction: AnimationAction
  // Having multiple actions managed at once using layers still needs to be designed.
  //private layerActions = new Map<BoneLayer, ActionStack>() 
  public movementSpeed = null
  
  // Maybe if first action is not looping, it should not be overriden by a looping action?
  // This is very simplictic. 
  // The full body action is intended to be driven by a state machine so it is possible to get back the previous state.
  private fullBodyAction: AnimationAction
  private upperBodyAction: AnimationAction
  private fullBodyClip: AnimationClip
  private fullBodyMask: Bone[]
  private upperBodyMask: Bone[]

  private upperBodyTimer = 0
  private upperBodyOverride = false

  onInit(): void | Promise<void> {
    this.viewController.tick
      .pipe(takeUntil(this.disposed))
      .subscribe(deltaTime => this.updateInternal(deltaTime))
  }

  getRootMotionAction(): AnimationAction {
    // Root motion has to be affecting the full body layer to be able to drive motion
    if (this.fullBodyAction.getClip() instanceof RootMotionClip) {
      return this.fullBodyAction
    }
    // When supporting layers, the root motion should be taken from here instead. 
    /*for (const stack of Array.from(this.layerActions.values())) {
      const action = stack.top()
      if (action.getClip() instanceof RootMotionClip) {
        return action
      }
    }*/
  }

  /**
   * @param root 
   * @param rootBone The bone should be configured on a skeletal mesh component.
   */
  setup(root: Object3D, upperBodyMask?: Bone[], rootBone?: Bone) {
    // It should be possible to call this multiple times in case 
    // Also, not sure if this should be a component or just part of the mesh component
    if (upperBodyMask != null) {
      this.upperBodyMask = flattenMask(upperBodyMask)
      this.fullBodyMask = inverseMask(findRootBone(root), upperBodyMask)
    }

    if (this.mixer != null) {
      this.mixer.stopAllAction()
    }
    this.mixer = new AnimationMixer(root)
  }
  /**
   * This class should take care of current actions, one stack of actions per subtree. 
   */

  private updateStateMachines(deltaTime: number) {
    this.stateMachines.forEach(sm => {
      sm.step(deltaTime)
      const clip = sm.current.clip
      if (clip != null) {
        this.play(clip)
      }
    })
  }

  private updateInternal(deltaTime: number) {
    if (this.mixer == null) return
    this.upperBodyTimer += deltaTime
    // This assumes that upper body animations are only ever to just run once
    if (this.upperBodyAction && this.upperBodyOverride && this.upperBodyAction.getClip().duration - this.fadeTime*2 < this.upperBodyTimer) {
      this.upperBodyOverride = false
      this.transition(this.upperBodyAction, this.getUpperBodyClip(this.fullBodyClip))
    }

    this.updateStateMachines(deltaTime)
    this.syncMovementSpeed(this.fullBodyAction)
    if (!this.upperBodyOverride) {
      
      this.syncMovementSpeed(this.upperBodyAction)
    }
    
    this.mixer.update(deltaTime)
  }

  private syncMovementSpeed(action: AnimationAction) {
    if (action != null) {
      const clip = action.getClip()
      if (clip instanceof RootMotionClip && clip.fixedInPlace && this.movementSpeed != null) {
        action.timeScale = clip.duration / clip.displacement * this.movementSpeed
      }
    }
  }

  playStateMachine(sm: AnimationStateMachine) {
    this.stateMachines.push(sm)
  }

  playUpper(clip: AnimationClip) {
    this.upperBodyAction = this.transition(this.upperBodyAction, this.getUpperBodyClip(clip))
    //this.upperBodyAction.setLoop(LoopOnce, 0)
    this.upperBodyTimer = 0
    this.upperBodyOverride = true
    // Need to somehow cross fade into the full body action
  }

  private getFullBodyClip = memoize(clip => clip.uuid, (clip: AnimationClip) => {
    return maskClip(this.fullBodyMask, clip)
  })

  private getUpperBodyClip = memoize(clip => clip.uuid, (clip: AnimationClip) => {
    return maskClip(this.upperBodyMask, clip)
  })

  /**
   * The clip should be replaced with something more complex which has information about looping, masks, 
   * 
   * 
   * Have one play method meant for representing movement like walking etc,
   * 
   * Have one method for driving the entire character's animation. It should basically just stup any upper body animation 
   * and then trigger the full body animation.
   */
  play(clip: AnimationClip, options: PlayOptions = {}) {
    assert(this.mixer != null, "Can't play animation before setup is called")

    // If playing a one time upper body animation, it should not override it here. 
    // Need to ensure this one has ended. Also, when the upper ends, it should blend into the clip used for full body.
    
    // TODO Handle looping upper body animations.
    if (!this.upperBodyOverride) {
      this.upperBodyAction = this.transition(this.upperBodyAction, this.getUpperBodyClip(clip))
    }
    // The requested clip to run when upper body is done
    this.fullBodyClip = clip

  
    // Need to maintain oen action for lower body and upper body
    this.fullBodyAction = this.transition(this.fullBodyAction, this.getFullBodyClip(clip))

    if (this.fullBodyAction.getClip().uuid == this.upperBodyAction.getClip().uuid) {
      this.upperBodyAction.syncWith(this.fullBodyAction)
    }

/*

    if (options.layer != null) {
      // Stop all action on this layer and below (higher order value)
      for (const [layer, stack] of Array.from(this.layerActions.entries())) {
        if (options.layer.order <= layer.order) {
          // Stop and remove (replace) actions on lower layers
        } else {
          // for higher layers like full body, stop if lower 

          // This is become incredibly complex very quickly.
          // I should probably start with something simple like just having one bull body and one mask so that I can get 
          // the partial full layer. Otherwise I will have to modify clips while they are running and syncing different actions
          // which becomes very har to get right. 
        }
      }
    }
*/
    /**
     * If it is playing for a specific subtree, find the top of the stack for that subtree
     * and use it as the current action when transitioning. 
     * After calling play, place the new action on top of that stack. 
     */

    /**
     * Looping and one off animations
     * If the play commmand is saying to not loop the animation, then the action should be removed from the stack 
     * when done. 
     * 
     * When animation is soon to be done, transition to the previous animation. However, only do this if the anmiation
     * is not currently on top. 
     * However, this might be a weird transition. It might be better to replace the previous animation rather than playing 
     * another on top of it. Instead, maybe if the previous animation was only targeting the same or finer subtree,
     * then replace it. If the new animation is a subtree of the other, then add to stack rather than replace it as 
     * this is an indication that another animation is playing in the background like for example a jumping animation
     * which even though it is also not a looping animation, it should be resumed if you do some upper body animation mid jump.
     * This is a similar idea as the animation groups I saw somewhere else that had the default behaviour of replacing other a
     * animations in the same group.
     * 
     * Replace of same subtree and lower (layer) and non-looping animation. For looping animation, it should support fading back to to other one.
     * For example, a full body root motion should replace all current animations but then fade back into whatever looping happens on the 
     * full body layer. 
     *
     * Find nested layers by any bone layer that contains a subset of the bones of the provided mask.
     * This might be difficult computationally. An ordering of layers could be computed every time a new layer is added. 
     * When adding a new layer, push to the right/down if all the bones of the new layer is contained by the layer it is compared to.
     * Alternatively, just have the user submit a layering ordering. Then regardless of the mask,
     * Masks should be possible to generate using a helper function that takes 
     *
     */
  }

  private onActionDone(animationAction: AnimationAction): Promise<AnimationAction> {
    return new Promise((resolve) => {
      const callback = (e: {target: AnimationAction}) => {
        if (e.target === animationAction) {
          resolve(e.target)
          this.mixer.removeEventListener('finished', callback)
        }
      }
      this.mixer.addEventListener('finished', callback)
    })
  }

  /**
   * 
   * @param currentAction The action that should be transitioned from. 
   * @param clip 
   * @param inplace 
   * @returns 
   */
  transition(currentAction: AnimationAction, clip: AnimationClip) {
    if (currentAction != null && currentAction.getClip().uuid === clip.uuid) {
      return currentAction
    }

    if (currentAction) {
      const startAction = currentAction
      const endAction = currentAction = this.mixer.clipAction( clip );
      endAction.play()
      endAction.enabled = true
      endAction.setEffectiveTimeScale( 1 );
      endAction.setEffectiveWeight( 1 );
      endAction.time = 0.0
      startAction.crossFadeTo(endAction, this.fadeTime, true)
    } else {
      // This makes no sense when having multiple active actions per layer
      //this.mixer.stopAllAction()
      currentAction = this.mixer.clipAction( clip );
      currentAction?.fadeIn(0.3);
      currentAction?.play();
    }
    return currentAction
  }
}

function inverseMask(bone: Bone, boneMask: Bone[]): Bone[] {
  const mask = new Set(flattenMask(boneMask).map(b => b.uuid))
  const inverseMask: Bone[] = []
  bone.traverse(b => {
    if (b instanceof Bone && !mask.has(b.uuid)) {
      inverseMask.push(b)
    }
  })
  return inverseMask
}

function maskClip(boneMask: Bone[], clip: AnimationClip): AnimationClip {
  const copy = clip.clone()
  const mask = new Set(boneMask.map(b => b.name))
  copy.tracks = copy.tracks.filter(t => mask.has(t.name.split('.')[0]))
  return copy
}

function flattenMask(boneMask: Bone[]): Bone[] {
  return boneMask.flatMap(b => flattenTree(b)).filter(o => o instanceof Bone) as Bone[]
}

function flattenTree(obj: Object3D): Object3D[] {
  const results = []
  obj.traverse(o => {
    results.push(o)
  })
  return results
}


function assert(expression: boolean | (() => boolean), message: string) {
  if (expression === false || (typeof expression === 'function' && expression() === false)) {
    throw new Error(message)
  } 
}