import {
  Actor, AnimationState,
  AnimationStateMachine, attach, BaseActor,
  inject,
  PhysicsSystem, RootMotionClip, ViewController, World
} from "@hology/core/gameplay";
import {
  CharacterAnimationComponent,
  CharacterMovementComponent,
  MeshComponent,
  ThirdPartyCameraComponent
} from "@hology/core/gameplay/actors";
import { AnimationClip, Bone, Loader, Mesh, MeshStandardMaterial, Object3D, Vector3 } from 'three';
import { FBXLoader } from "../three/FBXLoader";
import { GLTFLoader } from '../three/GLTFLoader'
import * as THREE from 'three'
import ShootingComponent from "./shooting-component";
import { PhysicalShapeMesh } from "@hology/core";

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
  thirdPartyCamera: ThirdPartyCameraComponent = attach(ThirdPartyCameraComponent)

  public readonly movement = attach(CharacterMovementComponent, {
    maxSpeed: 6,
    maxSpeedSprint: 14,
    maxSpeedBackwards: 4,
    snapToGround: 0.3,
    autoStepMaxHeight: 0.7,

  /*  autoStepMaxHeight: 0,
    autoStepMinWidth: 0,
    colliderHeight: 2.2,
    colliderRadius: .6,
    minSlopeSlideAngle: THREE.MathUtils.degToRad(70),
    maxSlopeClimbAngle: THREE.MathUtils.degToRad(70),
    maxSpeed: 5,
    maxSpeedBackwards: 3,
    maxSpeedSprint: 7,*/
    fallingReorientation: true,
    fallingMovementControl: 0.2
  })

  constructor() {
    super()
    this.physicsSystem.showDebug = false
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

  private world = inject(World)
  private muzzleObject: Object3D

  async onInit(): Promise<void> {
    // Using draco compression can reduce the file size by 2x
    //const dracoLoader = new DRACOLoader();
    //dracoLoader.setDecoderPath('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/js/libs/draco/'); // use a full url path

    const loader = new FBXLoader()
    const glbLoader = new GLTFLoader()
    //glbLoader.setDRACOLoader(dracoLoader);

    const characterMeshPath = 'assets/X Bot.fbx'
    //const mesh = (await glbLoader.loadAsync('assets/X Bot compressed.glb')).scene as unknown as Mesh
    const mesh = await loader.loadAsync(characterMeshPath) as unknown as Mesh

    const weaponMeshGroup = (await glbLoader.loadAsync('assets/weapon.glb')).scene as THREE.Group
    weaponMeshGroup.children.shift() // Remove first armature
    // TODO Change gltf loader to be able to exclude armatures
    const weaponMesh = weaponMeshGroup

    //this.world.scene.add(weaponMesh)
  
    //mesh.rotateY(Math.PI)
    
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
    
    const meshRescaleFactor = 1/50
    mesh.scale.multiplyScalar(meshRescaleFactor)

    const {sm, clips} = await this.createGraph(loader, mesh)
    
    this.animation.playStateMachine(sm)
    this.animation.setup(mesh, [findBone(mesh, "mixamorigSpine2")])
    
    this.viewController.tick.subscribe(deltaTime => {
      this.animation.movementSpeed = this.movement.horizontalSpeed / mesh.scale.x
    })

    const spineBone = findBone(mesh, "mixamorigSpine1")

    // An improvement could be to apply the rotation to a chain of bones uniformly 
    // to get a smoother curve of the upper body

    // This should happen after animation is updated. I am just lucky that it works here
    let elapsedTime = 0
    this.viewController.tick.subscribe(deltaTime => {
      elapsedTime += deltaTime
      if (this.movement.mode !== MovementMode.falling) {
        const meshWorldRotation = this.container.getWorldQuaternion(new THREE.Quaternion())
        const worldRotation = spineBone.getWorldQuaternion(new THREE.Quaternion())
        const axis = new Vector3(-1,0,0).normalize()
        axis.applyQuaternion(worldRotation.invert().multiply(meshWorldRotation))
        //const rotation = Math.PI * Math.sin(elapsedTime) * 0.5
        spineBone.rotateOnAxis(axis, Math.asin(-this.thirdPartyCamera.rotationInput.rotation.x))
      }

    })

    // Need a way to play just the reload animation
    // When running out of ammo, reload or whenever the player clicks reload
    const reloadClip = RootMotionClip.fromClip(clips.reload)
    reloadClip.fixedInPlace = false
    reloadClip.duration -= 1 // Cut off the end of it 
    setInterval(() => {
      //this.animation.playUpper(reloadClip, {priority: 5, loop: false})
    }, 6000)

    this.mesh.replaceMesh(mesh as unknown as Mesh)

    setInterval(() => {
      // Need to run after the movement component is initiated is run
      // I should change it to not override 
      //this.movement.autoStepMinWidth = 0.002
      //this.movement.snapToGround = 0.3
      //this.movement.autoStepMaxHeight = 0.2
      //this.movement['cc'].setMinSlopeSlideAngle(THREE.MathUtils.degToRad(80))
      //this.movement['cc'].setMaxSlopeClimbAngle(THREE.MathUtils.degToRad(100))
    }, 100)
  }

  private isShooting = false
  private shootInterval


  shoot() {
    this.shooting.camera = this.thirdPartyCamera.camera.instance
    this.muzzleObject.getWorldPosition(ballWorldPosition)
    this.shooting.trigger(ballWorldPosition)
  }

  startShooting() {
    if (this.movement.mode === MovementMode.walking) {
      this.isShooting = true
      this.shoot()
      this.shootInterval = setInterval(() => {
        this.shooting.camera = this.thirdPartyCamera.camera.instance
        this.muzzleObject.getWorldPosition(ballWorldPosition)
        this.shooting.trigger(ballWorldPosition)
        if (this.movement.mode !== MovementMode.walking) {
          this.stopShoot()
        }
      }, 600)
    }
  }

  stopShoot() {
    this.isShooting = false
    clearInterval(this.shootInterval)
  }

  moveTo(position: Vector3) {
    this.container.position.copy(position)
    this.physicsSystem.updateActorTransform(this)
  }
}

const ballWorldPosition = new Vector3()
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

