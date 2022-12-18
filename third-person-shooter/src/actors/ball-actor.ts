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
import { takeUntil } from "rxjs"
import { Color } from "three"
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
      //new BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2),
      new MeshStandardMaterial({ color: 0xeff542, roughness: .3 }),
      new SphereCollisionShape(this.radius)
    ),
    mass: 1,
    bodyType: PhysicsBodyType.dynamic,
  })

  constructor() {
    super()
  }

  onInit(): void | Promise<void> {
    this.physicsSystem.onCollisionWithActorType(this, BallActor).pipe(takeUntil(this.disposed)).subscribe(other => {
      const material = other.mesh.mesh.material
      if (material instanceof MeshStandardMaterial) {
        material.color = new Color(Math.random(), Math.random(), Math.random())
      }
    })
  }

  public shoot(direction: Vector3) {
    // TODO Apply impulse on the actor
    //this.physicsSystem.applyImpulse()
    // TODO Need a way to remove the ball after some time.
  }

  moveTo(position: Vector3) {
    // TODO Make changin position with physics easier maybe
    // Maybe for kinematic actors, always copy the transform from the actor.
    // Also need to handle dynamic bodies. 
    this.container.position.copy(position)
    this.physicsSystem.updateActorTransform(this)
  }
}

export default BallActor
