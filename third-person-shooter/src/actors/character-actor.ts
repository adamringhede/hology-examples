import { CapsuleCollisionShape, SphereCollisionShape } from "@hology/core"
import {
  Actor,
  BaseActor,
  inject,
  PhysicsSystem,
  attach,
} from "@hology/core/gameplay"
import {
  CharacterMovementComponent,
  MeshComponent,
  ThirdPartyCameraComponent,
} from "@hology/core/gameplay/actors"
import { Mesh, BoxGeometry, MeshStandardMaterial, Vector3 } from "three"

@Actor()
class CharacterActor extends BaseActor {
  private physicsSystem = inject(PhysicsSystem)
  private height = 2.5
  private radius = 0.5
  private isCrouching = false

  mesh = attach(MeshComponent, {
    mesh: new Mesh(
      new BoxGeometry(1, 3, 1),
      new MeshStandardMaterial({ color: 0xffffff })
    ),
    position: new Vector3(0, 1.5, 0),
  })
  thirdPartyCamera = attach(ThirdPartyCameraComponent)

  public readonly movement = attach(CharacterMovementComponent, {
    colliderHeight: 2,
    maxSpeed: 6,
    maxSpeedBackwards: 3,
    maxSpeedSprint: 9,
  })

  constructor() {
    super()
  }

  moveTo(position: Vector3) {
    this.container.position.copy(position)
    this.physicsSystem.updateActorTransform(this)
  }
}

export default CharacterActor
