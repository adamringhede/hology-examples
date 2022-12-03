import {
  ActorComponent,
  ActorFactory,
  Component,
  inject,
  PhysicsSystem,
  RayTestResult,
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
import BallActor from "./ball-actor"

const raycaster = new Raycaster()
const screenCenter = { x: 0, y: 0 }

@Component()
class ShootingComponent extends ActorComponent {
  private physics = inject(PhysicsSystem)
  public camera: Camera
  private world = inject(World)
  private actorFactory = inject(ActorFactory)

  private shootingStrength = 50

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
    // Raycasting from the camera should be a built in feature
    const result = this.physics.rayTest(from, to, null, {
      debugColor: 0xff0000,
      debugLifetime: 5000,
    })

    // TODO From should be at the gun
    // The direction should be calculated based on (result.hitPoint ?? to - gun position)
    this.spawnBall(from, raycaster.ray.direction.normalize())

    /**
     * TODO
     *
     * Create a ball that is shot from the player's gun towards the position
     * using physics. It should be able to collide with objects which moves them.
     * This should be a more fun and intriguing experience that also looks impressive.
     */

    // Bullet traces should origin from the gun to the hit location

    //this.addHitMarker(result)
  }

  private spawnBall(start: Vector3, direction: Vector3) {
    // TODO Have a nicer way of calculating variables without ugly tmp variables

    const from = _vec3Tmp.addVectors(start, direction.clone().multiplyScalar(4))
    const ball = this.actorFactory.create(BallActor)
    this.world.addActor(ball, from)
    ball.moveTo(from)
    this.physics.applyImpulse(
      ball,
      _vec3Tmp2.copy(direction).multiplyScalar(this.shootingStrength)
    )
    // Add force to ball
  }

  private addHitMarker(result: RayTestResult) {
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
  }
}

const _vec3Tmp = new Vector3()
const _vec3Tmp2 = new Vector3()

export default ShootingComponent
