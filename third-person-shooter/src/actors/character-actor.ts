import {
  Actor, AnimationState,
  AnimationStateMachine, AssetLoader, attach, BaseActor,
  inject,
  RootMotionClip, ViewController
} from "@hology/core/gameplay";
import {
  CharacterAnimationComponent,
  CharacterMovementComponent,
  CharacterMovementMode,
  ThirdPartyCameraComponent
} from "@hology/core/gameplay/actors";
import { ActionInput } from "@hology/core/gameplay/input";
import * as THREE from 'three';
import { AnimationClip, Bone, Loader, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import ShootingComponent from "./shooting-component";


@Actor()
class CharacterActor extends BaseActor {
  private viewController = inject(ViewController)
  private assetLoader = inject(AssetLoader)

  private shooting = attach(ShootingComponent)
  private animation = attach(CharacterAnimationComponent)
  public movement = attach(CharacterMovementComponent, {
    maxSpeed: 6,
    maxSpeedSprint: 14,
    maxSpeedBackwards: 4,
    snapToGround: 0.3,
    autoStepMaxHeight: 0.7,
    fallingReorientation: true,
    fallingMovementControl: 0.2
  })
  public thirdPartyCamera: ThirdPartyCameraComponent = attach(ThirdPartyCameraComponent)


  public shootAction = new ActionInput()

  private muzzleObject: Object3D

  async onInit(): Promise<void> {
    this.shooting.camera = this.thirdPartyCamera.camera.instance
    this.shootAction.onStart(() => {
      this.shoot()
    })

    // TODO Use the default loaders instead.
    const loader = new FBXLoader()
    const glbLoader = new GLTFLoader()

    const characterMeshPath = 'assets/X Bot.fbx'
    const mesh = await this.assetLoader.getModelAtPath(characterMeshPath)

    const weaponMeshGroup = (await this.assetLoader.geGltfAtPath('assets/weapon.glb')).scene as THREE.Group
    // Why am I doing this? Maybe just fix the mesh instaed.
    weaponMeshGroup.children.shift() // Remove first armature
    // TODO Change gltf loader to be able to exclude armatures
    const weaponMesh = weaponMeshGroup
    weaponMesh.scale.multiplyScalar(20)

    let handBone: Object3D
    mesh.traverse(o => {
      if (o.name.includes('mixamorigRightHand') && handBone == null) {
        handBone = o
      }
    })
    handBone.add(weaponMesh)

    weaponMesh.traverse(o => {
      if (o.name === 'SO_Muzzle') {
        this.muzzleObject = o
      }
    })

    const characterMaterial = new MeshStandardMaterial({color: 0x999999})
    mesh.traverse(o => {
      if (o instanceof Mesh) {
        o.material = characterMaterial
        o.castShadow = true
      }
    })
    
    const sm = await this.createGraph(loader, mesh)
    
    this.animation.playStateMachine(sm)
    this.animation.setup(mesh, [findBone(mesh, "mixamorigSpine2")])
    
    this.viewController.onUpdate(this).subscribe(deltaTime => {
      // TODO Does this need to hapen per frame? Actually should happen after the movement controller has been
      // updated. I wonder if relying on events like this is good or if explicit update calls 
      // would make it easier to debug and understand code. Also could lead to less bugs 
      // also should happen before tha animation is updated
      // subscriptions are meant for streams of data rather than synchronous updates.
      // i think it might be bad to be so reliant on it.

      // In order to syncronise the walking animation with the speed of the character,
      // we can pass the movement speed from the movement component to the animation component.
      // Because we are also scaling our mesh, we need to factor this in. 
      this.animation.movementSpeed = this.movement.horizontalSpeed / mesh.scale.x
    })

    const spineBone = findBone(mesh, "mixamorigSpine1")

    // TODO Have an event triggered for after animation. This could also be done 
    // if I have some update function or the tick function itself can 
    // take a parameter. Something like late update could be used
    // TODO should be possible to register listeneres for these events
    // in such a way. Maybe make tick a function like onTick that 
    // takes the actor.
    // This would also allow the view controller to potentially skips 
    // calling tick on actors that are deemed to far away. 
    // it could also reduce the frequency it is called based on distance
    // Another l

    // Need a way to play just the reload animation
    // When running out of ammo, reload or whenever the player clicks reload
  /*  const reloadClip = RootMotionClip.fromClip(clips.reload)
    reloadClip.fixedInPlace = false
    reloadClip.duration -= 1 // Cut off the end of it 
    setInterval(() => {
      //this.animation.playUpper(reloadClip, {priority: 5, loop: false})
    }, 6000)*/

    const meshRescaleFactor = 1/50
    mesh.scale.multiplyScalar(meshRescaleFactor)
    this.object.add(mesh)

  }
  
  onLateUpdate(deltaTime: number): void {
    const spineBone = findBone(this.object, "mixamorigSpine1")
    if (this.movement.mode !== CharacterMovementMode.falling) {
      const meshWorldRotation = this.object.getWorldQuaternion(new THREE.Quaternion())
      const worldRotation = spineBone.getWorldQuaternion(new THREE.Quaternion())
      // Todo this vector should not be defined every time. 
      const axis = new Vector3(-1,0,0).normalize()
      axis.applyQuaternion(worldRotation.invert().multiply(meshWorldRotation))
      spineBone.rotateOnAxis(axis, Math.asin(-this.thirdPartyCamera.rotationInput.rotation.x))
    }
  }

  private async createGraph(loader: FBXLoader, mesh: Object3D) {
    const clips = await loadClips(this.assetLoader, {
      run: 'assets/rifle run.fbx',
      walking: 'assets/walking.fbx',
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
  
    return this.createStateMachine(clips)
  }

  private createStateMachine(clips: Record<string, AnimationClip>) {

    const grounded = new AnimationState(clips.idle).named("grounded")
    const groundMovement = grounded.createChild(null, () => this.movement.horizontalSpeed > 0 && this.movement.mode == CharacterMovementMode.walking)
    const [sprint, walk] = groundMovement.split(() => this.movement.isSprinting)      

    const walkForward = walk.createChild(RootMotionClip.fromClip(clips.walking, true), () => this.movement.directionInput.vertical > 0).named("walk forward")
    walkForward.createChild(RootMotionClip.fromClip(clips.walkForwardLeft, true), () => this.movement.directionInput.horizontal < 0)
    walkForward.createChild(RootMotionClip.fromClip(clips.walkForwardRight, true), () => this.movement.directionInput.horizontal > 0)

    walk.createChild(RootMotionClip.fromClip(clips.walkingBackwards, true), () => this.movement.directionInput.vertical < 0)

    // todo have a method for creating an abstract node or group node.
    const strafe = walk.createChild(null, () => this.movement.directionInput.vertical == 0).named("abstract strafe")
    // Maybe use another name instead of boolean. 
    // Fixed in place argument name is confusing. Also add documentation to all parameters.
    // TODO Don't rely on direction input for this. Use the actual state of the character for animations
    // The intent of the player should not drive the animation but rahter tha movement's actual state. 
    strafe.createChild(RootMotionClip.fromClip(clips.strafeLeft, true), () => this.movement.directionInput.horizontal < 0)
    strafe.createChild(RootMotionClip.fromClip(clips.strafeRight, true), () => this.movement.directionInput.horizontal > 0)
    
    const fall = new AnimationState(clips.falling).named("fall")
    grounded.transitionsTo(fall, () => this.movement.mode === CharacterMovementMode.falling)

    const land = new AnimationState(clips.land)

    fall.transitionsTo(grounded, () => this.movement.mode !== CharacterMovementMode.falling && this.movement.directionInput.vector.length() > 0)
    fall.transitionsTo(land, () => this.movement.mode !== CharacterMovementMode.falling && this.movement.directionInput.vector.length() == 0)
    land.transitionsOnComplete(grounded, () => 
    // I am confused by this. Why check if falling 
    // TODO Landing should be additive so that it can be added to whatever whatever animation happens. 
    // This can maybe be done by using a more comlex animation state.
    // It will not just be one clip but potentially multiple clips that can dynamically
    // be created based on state and combine multiple clips with a weight, sequence of clips, etc. 
      this.movement.mode === CharacterMovementMode.falling || this.movement.directionInput.vector.length() > 0)

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

  shoot() {
    this.muzzleObject.getWorldPosition(ballWorldPosition)
    this.shooting.trigger(ballWorldPosition)
  }

}

export default CharacterActor

const ballWorldPosition = new Vector3()

/**
 * Use something similar to this that also works with assets.
 * You provide a an object to hold all clips to load and you pass in some sort 
 * of reference for each of them to the animation clip asset.
 * 
 * This reduces a lot of boilerplate. 
 * I could even use code generation to load it.
 */

async function getClip(file: string, assetLoader: AssetLoader, name?: string) {
  try {
    const group = await assetLoader.getModelAtPath(file)
    const clips = group.animations
    if (name != null) {
      return clips.find(c => c.name === 'name')
    }
    return clips[0]
  } catch (e) {
    debugger
    return null;
  }

}

async function loadClips<T extends {[name: string]: string}>(assetLoader: AssetLoader, paths: T): Promise<{[Property in keyof T]: AnimationClip}>  {
  const entries = await Promise.all(Object.entries(paths).map(([name, path]) => Promise.all([name, getClip(path, assetLoader)])))
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

