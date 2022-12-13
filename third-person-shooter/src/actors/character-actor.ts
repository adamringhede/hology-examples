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
import { Mesh, BoxGeometry, MeshStandardMaterial, Vector3, AnimationMixer, AnimationClip, Bone, Vector2 } from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from "../three/FBXLoader";

import ShootingComponent from "./shooting-component"

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
    maxSpeedSprint: 9,
  })

  constructor() {
    super()
  }

  async onInit(): Promise<void> {
    const loader = new FBXLoader()
    const gloader = new GLTFLoader()
    const mesh = await loader.loadAsync('assets/X Bot.fbx') as unknown as Mesh
    
    const meshRescaleFactor = 1/50
    const animationsGroup = await loader.loadAsync('assets/walking.fbx')
    const animations = animationsGroup.animations as AnimationClip[]
    console.log(animations)
    mesh.scale.multiplyScalar(meshRescaleFactor)

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

    // Root motion montages should take full control of the actor's position to also include 
    // repositioning the collider and anything else to not clip through objects. 
    // Root motion montages are processed together with the movement control.

    // TODO There must be a nicer way to subscribe with cleanup
    // This is another reason why most logic should lay outside actors and components.

    this.physicsSystem.afterStep.subscribe(deltaTime => {
      mixer.timeScale = clip.duration / displacement * this.movement.horizontalSpeed
      mixer.update(deltaTime)
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
