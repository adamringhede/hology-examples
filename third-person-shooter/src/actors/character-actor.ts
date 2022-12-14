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
import { Mesh, BoxGeometry, MeshStandardMaterial, Vector3, AnimationMixer, AnimationClip, Bone, Vector2, Loader, Object3D, AnimationAction } from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from "../three/FBXLoader";

import ShootingComponent from "./shooting-component"

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
  private radius = 0.5
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

  private async getClip(file: string, loader: Loader, name?: string) {
    const group = await loader.loadAsync(file)
    const clips = group.animations as AnimationClip[]
    if (name != null) {
      return clips.find(c => c.name === 'name')
    }
    return clips[0]
  }

  private async createGraph(mesh: Object3D) {
    const loader = new FBXLoader()

    // TODO Should not need to wait for these
    const runClip = await this.getClip('assets/rifle run.fbx', loader)
    const walkingClip = await this.getClip('assets/walking.fbx', loader)
    const walkingBackwardsClip = await this.getClip('assets/walking backwards.fbx', loader)
    const idleClip = await this.getClip('assets/rifle aiming idle.fbx', loader)
    const startWalkingClip = await this.getClip('assets/start walking.fbx', loader)
    const jumpClip = await this.getClip('assets/jump forward.fbx', loader)


    const rootBone = mesh.children.find(c => c instanceof Bone) as Bone

    const mixer = new AnimationMixer(mesh)
    let currentAction: AnimationAction

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
        //startAction.clampWhenFinished = false
        const endAction = currentAction = mixer.clipAction( clip );
        //endAction.fadeIn(fadeIn)
        endAction.play()
        endAction.enabled = true
        endAction.setEffectiveTimeScale( 1 );
        endAction.setEffectiveWeight( 1 );
        endAction.time = 0.0
        startAction.crossFadeTo(endAction, 0.3, true)
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

    let wasWalking = false
    let wasJumping = false
    let currentActionLastTime = 0
    let animationEnded = false

    return {
      update: (deltaTime: number) => {
        if (currentAction != null) {
          animationEnded = currentAction.time < currentActionLastTime || currentAction.time > currentAction.getClip().duration
          currentActionLastTime = currentAction.time
        }

        // If jumped, then play jump animation
        // If jump animation finish, check if grounded to determine if falling
      
        switch (this.movement.mode) {
          case MovementMode.falling:
            if (this.movement.pressedJump) {
              if (!wasJumping) {
                play(jumpClip, true)
                /**
                 * The jump animation should be slowed down so it plays until the character reaches its apex.
                 * 
                 * Alternatively, let the animation control the actor position using root motion. 
                 * To control the jump height, change the jump animation.
                 * 
                 */
                if (animationEnded) {
                  // play looping falling animation
                }
              }
              /**
               * 
               */
            }
            break
          case MovementMode.walking:
            if (this.movement.directionInput.vertical < 0) {
              play(walkingBackwardsClip, true)
              updateTimescale(walkingBackwardsClip)
            } else if (this.movement.directionInput.vertical > 0) {
              if (this.movement.isSprinting) {
                // maybe based it on speed instead
                play(runClip, true)
                updateTimescale(runClip)
              } else {
                if (wasWalking) {
                  play(walkingClip, true)
                  updateTimescale(walkingClip)
                } else {
                  play(startWalkingClip, true)
                  updateTimescale(startWalkingClip)
                  if (animationEnded) {
                    wasWalking = true
                  }
                  //console.log(currentAction.getClip().duration)
                  // play one time animation
                  // When that animation is done, 
                }
              }
            } else {
              play(idleClip)
              currentAction.timeScale = 1
              wasWalking = false
            }
            break;
        }
        mixer.update(deltaTime)
      }
    }
  }

  async onInit(): Promise<void> {
    const loader = new FBXLoader()
    const gloader = new GLTFLoader()
    const mesh = await loader.loadAsync('assets/X Bot.fbx') as unknown as Mesh
    
    const meshRescaleFactor = 1/50
    const animationsGroup = await loader.loadAsync('assets/strafe.fbx')
    const animations = animationsGroup.animations as AnimationClip[]
    mesh.scale.multiplyScalar(meshRescaleFactor)
/*
    const mixer = new AnimationMixer(mesh)
    
    const clip = animations[0]
    const action = mixer.clipAction(clip)
    action.play()

    // Find the root bone, get the total distance traveled and direction.

    // The root bone should be the root of the bone tree
    const rootBoneName = mesh.children.find(c => c instanceof Bone).name
    console.log(rootBoneName)
    const rootTrack = clip.tracks.find(t => t.name === `${rootBoneName}.position`)
    const startPosition = new Vector3().fromArray(rootTrack.values, 0).multiplyScalar(meshRescaleFactor)
    const endPosition = new Vector3().fromArray(rootTrack.values, rootTrack.values.length - 3).multiplyScalar(meshRescaleFactor)

    console.log(rootTrack)
    console.log(startPosition, endPosition)

    const displacement = endPosition.distanceTo(startPosition)
    for (let i = 0; i < rootTrack.values.length; i += 3) {
      // Zero out horizontal movement.
      rootTrack.values[i] = 0
      rootTrack.values[i+2] = 0
    }

    const speed = displacement / clip.duration
    */
    

    // Root motion montages should take full control of the actor's position to also include 
    // repositioning the collider and anything else to not clip through objects. 
    // Root motion montages are processed together with the movement control.

    // TODO There must be a nicer way to subscribe with cleanup
    // This is another reason why most logic should lay outside actors and components.
/*
    this.physicsSystem.afterStep.subscribe(deltaTime => {
      // Setting the time scale like this only makes sense for some animations.
      action.timeScale = clip.duration / displacement * this.movement.horizontalSpeed
      mixer.update(deltaTime)
    })
*/

    const graph = await this.createGraph(mesh)

    this.physicsSystem.afterStep.subscribe(deltaTime => {
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
  for (let i = 3; i < rootTrack.values.length; i += 3) {
    rootTrack.values[i] = rootTrack.values[0]
    rootTrack.values[i+1] = rootTrack.values[1]
    rootTrack.values[i+2] = rootTrack.values[2]
  }
  copy.uuid = clip.uuid
  return copy
})