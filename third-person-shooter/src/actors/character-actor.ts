import { CapsuleCollisionShape, SphereCollisionShape } from "@hology/core"
import {
  Actor,
  BaseActor,
  inject,
  PhysicsSystem,
  attach,
  ViewController,
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

    const mixer = new AnimationMixer(mesh)
    let currentAction: AnimationAction

    const upperBone = findBone(mesh, 'mixamorigSpine2')
    const remainingBones = new Set<string>()
    upperBone.traverse(b => {
      remainingBones.add(b.name)
    })
    clips.reload.tracks = clips.reload.tracks.filter(t => remainingBones.has(t.name.split('.')[0]))
    const upperBodyMixer = new AnimationMixer(mesh)
    const upperBodyAction = upperBodyMixer.clipAction(clips.reload)
    upperBodyAction.clampWhenFinished = true
    upperBodyAction.setLoop(LoopOnce, 0)
    upperBodyAction.play()
    setInterval(() => {
      upperBodyAction.play()
    }, 6000)
  
    upperBodyMixer.addEventListener('finished', (e) => {
      upperBodyAction.stop()
    })

    const getDisplacement = memoize(clip => clip.uuid, (clip: AnimationClip): number => {
        const rootTrack = clip.tracks.find(t => t.name === `${rootBone.name}.position`)
        if (rootTrack == null) {
          console.warn("Could not find a displacement for clip", clip)
          return 0
        }
        const startPosition = new Vector3().fromArray(rootTrack.values, 0).multiplyScalar(1/50)
        const endPosition = new Vector3().fromArray(rootTrack.values, rootTrack.values.length - 3).multiplyScalar(1/50)
        return endPosition.distanceTo(startPosition)
    })

    const play = (clip: AnimationClip, inplace = false) => {
      if (currentAction != null && currentAction.getClip().uuid === clip.uuid) {
        return
      }

      if (inplace) {
        clip = makeClipInPlace(clip, rootBone)
      }

      if (currentAction) {
        const startAction = currentAction
        const endAction = currentAction = mixer.clipAction( clip );
        endAction.play()
        endAction.enabled = true
        endAction.setEffectiveTimeScale( 1 );
        endAction.setEffectiveWeight( 1 );
        endAction.time = 0.0
        startAction.crossFadeTo(endAction, 0.2, true)
      } else {
        mixer.stopAllAction()
        currentAction = mixer.clipAction( clip );
        currentAction?.fadeIn(0.3);
        currentAction?.play();
      }
    }

    const updateTimescale = (clip: AnimationClip) => {
      if (currentAction == null) return
      currentAction.timeScale = clip.duration / getDisplacement(clip) * this.movement.horizontalSpeed
    }

    let currentActionLastTime = 0

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

    const sm = makeSm()

    return {
      update: (deltaTime: number) => {
        sm.step(deltaTime)
        if (sm.current.clip) {
          const clip = sm.current.clip
          // Whether it is in place or not should probably be handled by the clip
          play(clip)
          if (clip instanceof RootMotionClip && clip.displacement > 0) {
            currentAction.timeScale = clip.duration / (clip.displacement * mesh.scale.x) * this.movement.horizontalSpeed
          }
        } else {
          console.log("clip is null", sm.current.name)
        }
        mixer.update(deltaTime)
      }
    }
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
    const animationsGroup = await loader.loadAsync('assets/strafe.fbx')
    mesh.scale.multiplyScalar(meshRescaleFactor)

    const graph = await this.createGraph(mesh)

    this.viewController.tick.subscribe(deltaTime => {
      graph.update(deltaTime)
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

function afterDelay(ms: number) {
  var result = false
  setTimeout(() => {
    result = true
  }, ms)
  return () => {
    return result
  }
}

class RootMotionClip extends AnimationClip {
  public readonly motionTrack: VectorKeyframeTrack
  // Distance of the root motion translation in the scale of the animation.
  // If the mesh has been scaled, multiply this value with the scale
  public readonly displacement: number = 0
  constructor(source: AnimationClip) {
    super(source.name, source.duration, source.tracks, source.blendMode)
    this.motionTrack = source.tracks.find(t => t instanceof VectorKeyframeTrack)
    if (this.motionTrack) {
      this.tracks.splice(this.tracks.indexOf(this.motionTrack), 1)
      const startPosition = new Vector3().fromArray(this.motionTrack.values, 0)
      const endPosition = new Vector3().fromArray(this.motionTrack.values, this.motionTrack.values.length - 3)
      this.displacement = endPosition.distanceTo(startPosition)
    } else {
      console.warn("Could not find root motion track", source)
    }
  }
}