import { CapsuleCollisionShape, SphereCollisionShape } from "@hology/core"
import {
  Actor,
  BaseActor,
  inject,
  PhysicsSystem,
  attach,
  PhysicsBodyType,
} from "@hology/core/gameplay"
import {
  CharacterMovementComponent,
  MeshComponent,
  ThirdPartyCameraComponent,
} from "@hology/core/gameplay/actors"
import { ShapeMeshInstance } from "@hology/core/scene/materializer"
import {
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  Vector3,
  MeshLambertMaterial,
  SphereGeometry,
} from "three"
import ShootingComponent from "./shooting-component"

@Actor()
class BallActor extends BaseActor {
  private physicsSystem = inject(PhysicsSystem)
  private radius = 0.4

  // TODO Need to be able to pass in physics options to mesh component

  // The reason for dealing with collision in the mesh component
  // is to handle collision meshes inside the loaded mesh.

  mesh = attach(MeshComponent, {
    mesh: new ShapeMeshInstance(
      new SphereGeometry(this.radius, 20, 10),
      new MeshStandardMaterial({ color: 0xeff542 }),
      new SphereCollisionShape(this.radius)
    ),
    mass: 1,
    bodyType: 1,
  })

  constructor() {
    super()
  }

  // TODO Remove this when it is possible
  public setupPhysics() {
    this.physicsSystem.removeActor(this)
    this.physicsSystem.addActor(this, [new SphereCollisionShape(this.radius)], {
      isTrigger: false,
      mass: 1,
      type: 1,
    })
  }

  public shoot(direction: Vector3) {
    // TODO Apply impulse on the actor
    //this.physicsSystem.applyImpulse()
    // TODO Need a way to remove the ball after some time.
  }

  moveTo(position: Vector3) {
    this.container.position.copy(position)
    this.physicsSystem.updateActorTransform(this)
  }
}

export default BallActor
