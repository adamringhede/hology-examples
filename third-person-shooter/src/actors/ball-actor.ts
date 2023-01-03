import { BoxCollisionShape, SphereCollisionShape, PhysicalShapeMesh } from "@hology/core"
import {
  Actor, attach, BaseActor,
  inject, PhysicsBodyType, PhysicsSystem
} from "@hology/core/gameplay"
import {
  MeshComponent
} from "@hology/core/gameplay/actors"
import { Parameter } from "@hology/core/shader/parameter"
import { takeUntil } from "rxjs"
import { BoxGeometry, Color, MeshStandardMaterial, SphereGeometry, Vector3 } from "three"

console.log("shapemesh", new SphereCollisionShape(5) instanceof SphereCollisionShape)

@Actor()
class BallActor extends BaseActor {
  private physicsSystem = inject(PhysicsSystem)

  @Parameter()
  public radius: number = 0.4

  // TODO Need to be able to pass in physics options to mesh component

  // The reason for dealing with collision in the mesh component
  // is to handle collision meshes inside the loaded mesh.

  mesh = attach(MeshComponent, {
    mesh: execRandom(
      () => new PhysicalShapeMesh(
        new BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2),
        new MeshStandardMaterial({ color: 0xeff542, roughness: .3 }),
        new BoxCollisionShape(new Vector3(this.radius * 2, this.radius * 2, this.radius * 2))
      ),
      () => new PhysicalShapeMesh(
        new SphereGeometry(this.radius, 20, 10),
        new MeshStandardMaterial({ color: 0xeff542, roughness: .3 }),
        new SphereCollisionShape(this.radius)
      ),
    ),
    mass: 1,
    bodyType: PhysicsBodyType.dynamic,
    continousCollisionDetection: true
  })

  onInit(): void | Promise<void> {
    this.mesh.mesh.castShadow = true
    this.mesh.mesh.receiveShadow = true
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

function execRandom<T>(...fn: (() => T)[]): T {
  return fn[Math.floor(Math.random()*fn.length)]()
}