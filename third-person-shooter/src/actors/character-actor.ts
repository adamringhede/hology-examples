import { CapsuleCollisionShape, SphereCollisionShape } from "@hology/core"
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
import { AnimationActionLoopStyles, LoopOnce, LoopPingPong } from 'three';
import { MeshBasicMaterial } from "three";
import { Mesh, BoxGeometry, MeshStandardMaterial, Vector3, AnimationMixer, AnimationClip, Bone, Vector2, Loader, Object3D, AnimationAction } from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from "../three/FBXLoader";

import ShootingComponent from "./shooting-component"
import { AnimationState, AnimationStateMachine } from '../animation/anim-sm';
import { VectorKeyframeTrack } from "three";
import { AnimationObjectGroup } from "three";
import { takeUntil } from 'rxjs';

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

      const walkForward = walk.createChild(new RootMotionClip(clips.walking), () => this.movement.directionInput.vertical > 0).named("walk forward")
      walkForward.createChild(new RootMotionClip(clips.walkForwardLeft), () => this.movement.directionInput.horizontal < 0)
      walkForward.createChild(new RootMotionClip(clips.walkForwardRight), () => this.movement.directionInput.horizontal > 0)

      walk.createChild(new RootMotionClip(clips.walkingBackwards), () => this.movement.directionInput.vertical < 0)

      const strafe = walk.createChild(null, () => this.movement.directionInput.vertical == 0).named("abstract strafe")
      strafe.createChild(new RootMotionClip(clips.strafeLeft), () => this.movement.directionInput.horizontal < 0)
      strafe.createChild(new RootMotionClip(clips.strafeRight), () => this.movement.directionInput.horizontal > 0)
      
      const fall = new AnimationState(clips.falling).named("fall")
      grounded.transitionsTo(fall, () => this.movement.mode === MovementMode.falling)

      const land = new AnimationState(clips.land)

      fall.transitionsTo(grounded, () => this.movement.mode !== MovementMode.falling && this.movement.directionInput.vector.length() > 0)
      fall.transitionsTo(land, () => this.movement.mode !== MovementMode.falling && this.movement.directionInput.vector.length() == 0)
      land.transitionsOnComplete(grounded, () => 
        this.movement.mode === MovementMode.falling || this.movement.directionInput.vector.length() > 0)

      const runForward = sprint.createChild(new RootMotionClip(clips.run), () => this.movement.directionInput.vertical > 0).named("sprint forward")
      runForward.createChild(new RootMotionClip(clips.walkForwardLeft), () => this.movement.directionInput.horizontal < 0)
      runForward.createChild(new RootMotionClip(clips.walkForwardRight), () => this.movement.directionInput.horizontal > 0)
      sprint.createChild(new RootMotionClip(clips.walkingBackwards), () => this.movement.directionInput.vertical < 0).named("sprint back")
      // This is a shortcut to reuse another state. This should be used with caution though as it may not have expected results
      sprint.transitionsTo(strafe)
      //sprint.transitionsTo(strafeLeft, () => this.movement.directionInput.horizontal < 0)
      //sprint.transitionsTo(strafeRight, () => this.movement.directionInput.horizontal > 0)

      return new AnimationStateMachine(grounded)
    }
    return makeSm()
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

    const movementSm = await this.createGraph(mesh)
    
    this.animation.playStateMachine(movementSm)
    this.animation.setup(mesh)
    
    this.viewController.tick.subscribe(deltaTime => {
      this.animation.movementSpeed = this.movement.horizontalSpeed / mesh.scale.x
    })

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

class RootMotionClip extends AnimationClip {
  public readonly motionTrack: VectorKeyframeTrack
  // Distance of the root motion translation in the scale of the animation.
  // If the mesh has been scaled, multiply this value with the scale
  public readonly displacement: number = 0
  constructor(source: AnimationClip) {
    super(source.name, source.duration, source.tracks.slice(), source.blendMode)
    this.motionTrack = source.tracks.find(t => t instanceof VectorKeyframeTrack)
    if (this.motionTrack) {
      this.tracks.splice(this.tracks.indexOf(this.motionTrack), 1)
      const startPosition = new Vector3().fromArray(this.motionTrack.values, 0)
      const endPosition = new Vector3().fromArray(this.motionTrack.values, this.motionTrack.values.length - 3)
      this.displacement = endPosition.distanceTo(startPosition)
    } else {
      console.error("Could not find root motion track", source)
    }
  }
}

type PlayOptions = Partial<{
  inPlace: boolean
  loop: boolean
}>

@Component()
class CharacterAnimationComponent extends ActorComponent {
  private viewController = inject(ViewController)
  private mixer: AnimationMixer
  private stateMachines: AnimationStateMachine[] = []
  // TODO Supoprt multiple current actions. Maintain one per subtree. 
  private currentAction: AnimationAction
  public movementSpeed = null

  onInit(): void | Promise<void> {
    this.viewController.tick
      .pipe(takeUntil(this.disposed))
      .subscribe(deltaTime => this.updateInternal(deltaTime))
  }

  /**
   * 
   * @param root 
   * @param rootBone The bone should be configured on a skeletal mesh component.
   */
  setup(root: Object3D | AnimationObjectGroup, rootBone?: Bone) {
    // It should be possible to call this multiple times in case 
    // Also, not sure if this should be a component or just part of the mesh component
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
    this.updateStateMachines(deltaTime)
    this.mixer.update(deltaTime)
  }

  playStateMachine(sm: AnimationStateMachine) {
    this.stateMachines.push(sm)
  }

  /**
   * The clip should be replaced with something more complex which has information about looping, masks, 
   */
  play(clip: AnimationClip, options: PlayOptions = {}) {
    assert(this.mixer != null, "Can't play animation before setup is called")

    this.currentAction = this.transition(this.currentAction, clip)

    if (clip instanceof RootMotionClip && this.movementSpeed != null && this.currentAction != null) {
      this.currentAction.timeScale = clip.duration / clip.displacement * this.movementSpeed
    }

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
     * I am not sure if adding an event listener is a good approach. It might, be but it also might be very inefficient.
     * Another solution could be to use rxjs. However I should benchmark this before introducing rxjs. 
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
      startAction.crossFadeTo(endAction, 0.2, true)
    } else {
      this.mixer.stopAllAction()
      currentAction = this.mixer.clipAction( clip );
      currentAction?.fadeIn(0.3);
      currentAction?.play();
    }
    return currentAction
  }
}


function assert(expression: boolean | (() => boolean), message: string) {
  if (expression === false || (typeof expression === 'function' && expression() === false)) {
    throw new Error(message)
  } 
}