import { PhysicalShapeMesh, SphereCollisionShape } from "@hology/core"
import {
  Actor, ActorComponent,
  BaseActor,
  Component,
  PhysicsBodyType, PhysicsSystem,
  attach,
  inject
} from "@hology/core/gameplay"
import {
  MeshComponent, SpawnPoint
} from "@hology/core/gameplay/actors"
import { Parameter } from "@hology/core/shader/parameter"
import { MeshStandardMaterial, SphereGeometry, Vector3 } from "three"

@Actor()
class BallActor extends BaseActor {
  private physicsSystem = inject(PhysicsSystem)

  @Parameter()
  public radius: number = 0.3

  // The mesh component is added during the construction phase to be available
  // However, this could also be done dynamically during the on init method. 
  private mesh: MeshComponent = attach(MeshComponent, {
    mass: 1,
    bodyType: PhysicsBodyType.dynamic,
    continousCollisionDetection: true
  })

  onInit(): void | Promise<void> {
    // Because the size of the ball is based on a property with the @Parameter()
    // decorator that can be changed in the editor, we need to create the mesh 
    // here in the init phase so that we can use parameter values. 
    this.mesh.setObject(new PhysicalShapeMesh(
      new SphereGeometry(this.radius, 20, 10),
      new MeshStandardMaterial({ color: 0xeff542, roughness: .3 }),
      new SphereCollisionShape(this.radius)
    ))

    // Meshes don't have shadows by default so these need to be enabled.
    this.mesh.object.castShadow = true
    this.mesh.object.receiveShadow = true
  }

  moveTo(position: Vector3) {
    this.object.position.copy(position)
    this.physicsSystem.updateActorTransform(this)
  }
}

export default BallActor
