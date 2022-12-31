import {
  Actor,
  BaseActor,
  inject,
  PhysicsSystem,
  attach,
  ViewController,
  Component,
  ActorComponent,
  AnimationState,
  AnimationStateMachine,
  RootMotionClip,
} from "@hology/core/gameplay"
import {
  CharacterAnimationComponent,
  CharacterMovementComponent,
  MeshComponent,
  ThirdPartyCameraComponent,
} from "@hology/core/gameplay/actors"
import { Mesh, MeshStandardMaterial, Vector3, AnimationMixer, AnimationClip, Bone, Vector2, Loader, Object3D, AnimationAction, KeyframeTrack, LoopOnce } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from "../three/FBXLoader";

import ShootingComponent from "./shooting-component"
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
    autoStepMaxHeight: 0,
    colliderHeight: 2.2,
    colliderRadius: .6,
    maxWalkingSlopeAngle: 70,
    maxSpeed: 3,
    maxSpeedBackwards: 3,
    maxSpeedSprint: 7,
  })

  constructor() {
    super()
  }


  private async createGraph(loader: FBXLoader, mesh: Object3D) {
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

      const walkForward = walk.createChild(RootMotionClip.fromClip(clips.walking, true), () => this.movement.directionInput.vertical > 0).named("walk forward")
      walkForward.createChild(RootMotionClip.fromClip(clips.walkForwardLeft, true), () => this.movement.directionInput.horizontal < 0)
      walkForward.createChild(RootMotionClip.fromClip(clips.walkForwardRight, true), () => this.movement.directionInput.horizontal > 0)

      walk.createChild(RootMotionClip.fromClip(clips.walkingBackwards, true), () => this.movement.directionInput.vertical < 0)

      const strafe = walk.createChild(null, () => this.movement.directionInput.vertical == 0).named("abstract strafe")
      strafe.createChild(RootMotionClip.fromClip(clips.strafeLeft, true), () => this.movement.directionInput.horizontal < 0)
      strafe.createChild(RootMotionClip.fromClip(clips.strafeRight, true), () => this.movement.directionInput.horizontal > 0)
      
      const fall = new AnimationState(clips.falling).named("fall")
      grounded.transitionsTo(fall, () => this.movement.mode === MovementMode.falling)

      const land = new AnimationState(clips.land)

      fall.transitionsTo(grounded, () => this.movement.mode !== MovementMode.falling && this.movement.directionInput.vector.length() > 0)
      fall.transitionsTo(land, () => this.movement.mode !== MovementMode.falling && this.movement.directionInput.vector.length() == 0)
      land.transitionsOnComplete(grounded, () => 
        this.movement.mode === MovementMode.falling || this.movement.directionInput.vector.length() > 0)

      const runForward = sprint.createChild(RootMotionClip.fromClip(clips.run, true), () => this.movement.directionInput.vertical > 0).named("sprint forward")
      runForward.createChild(RootMotionClip.fromClip(clips.walkForwardLeft, true), () => this.movement.directionInput.horizontal < 0)
      runForward.createChild(RootMotionClip.fromClip(clips.walkForwardRight, true), () => this.movement.directionInput.horizontal > 0)
      sprint.createChild(RootMotionClip.fromClip(clips.walkingBackwards, true), () => this.movement.directionInput.vertical < 0).named("sprint back")
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
    const characterMeshPath = 'assets/X Bot.fbx'
    const mesh = await loader.loadAsync(characterMeshPath) as unknown as Mesh

    const characterMaterial = new MeshStandardMaterial({color: 0x999999})
    mesh.traverse(o => {
      if (o instanceof Mesh) {
        o.material = characterMaterial
      }
    })
    
    const meshRescaleFactor = 1/50
    mesh.scale.multiplyScalar(meshRescaleFactor)

    const {sm, clips} = await this.createGraph(loader, mesh)
    
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
      //this.animation.playUpper(reloadClip, {priority: 5, loop: false})
    }, 6000)

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


/**
 * Use something similar to this that also works with assets.
 * You provide a an object to hold all clips to load and you pass in some sort 
 * of reference for each of them to the animation clip asset.
 * 
 * This reduces a lot of boilerplate. 
 * I could even use code generation to load it.
 */

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

