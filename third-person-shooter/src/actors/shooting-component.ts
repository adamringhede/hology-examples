import {
  ActorComponent,
  Component,
  inject,
  PhysicsSystem,
  ViewController,
  World,
} from "@hology/core/gameplay"
import {
  Camera,
  Mesh,
  MeshLambertMaterial,
  Raycaster,
  SphereGeometry,
  Vector3,
} from "three"

const raycaster = new Raycaster()
const screenCenter = { x: 0, y: 0 }

@Component()
class ShootingComponent extends ActorComponent {
  private physics = inject(PhysicsSystem)
  public camera: Camera
  private world = inject(World)

  public trigger() {
    if (this.camera == null) {
      console.warn("Camera not set on shooting component")
      return
    }

    console.log("triggered")

    /*  const from = new Vector3()
      .copy(this.actor.position)
      .add(new Vector3(0, 2.5, 0))
      */

    raycaster.setFromCamera(screenCenter, this.camera)
    raycaster.ray.origin

    const from = raycaster.ray.origin
    const to = from.clone().add(raycaster.ray.direction.multiplyScalar(100))

    // Ray test to find the hit location
    const result = this.physics.rayTest(from, to, null, {
      debugColor: 0xff0000,
      debugLifetime: 5000,
    })

    if (result.hasHit) {
      const hitMesh = new Mesh(
        new SphereGeometry(0.3, 4, 4),
        new MeshLambertMaterial({ color: 0xff0000 })
      )
      hitMesh.position.copy(result.hitPoint)

      this.world.scene.add(hitMesh)

      setTimeout(() => {
        this.world.scene.remove(hitMesh)
      }, 1000)
    }

    // Bullet traces should origin from the gun to the hit location
  }
}

export default ShootingComponent
