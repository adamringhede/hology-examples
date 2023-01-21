import { BoxCollisionShape, SphereCollisionShape, PhysicalShapeMesh } from "@hology/core"
import {
  Actor, ActorComponent, Attach, attach, BaseActor,
  Component,
  inject, PhysicsBodyType, PhysicsSystem
} from "@hology/core/gameplay"
import {
  MeshComponent, SpawnPoint
} from "@hology/core/gameplay/actors"
import { Parameter } from "@hology/core/shader/parameter"
import { takeUntil } from "rxjs"
import { BoxGeometry, Color, MeshStandardMaterial, SphereGeometry, Vector3 } from "three"

@Actor()
class BallActor extends BaseActor {
  private physicsSystem = inject(PhysicsSystem)

  @Parameter()
  public radius: number = 0.3

  // I can not refer to the character actor here because that results in a circular dependency lookup
  // I should detect this error and show an appropriate message when compiling
  @Parameter()
  public player: SpawnPoint

  // TODO Need to be able to pass in physics options to mesh component

  // The reason for dealing with collision in the mesh component
  // is to handle collision meshes inside the loaded mesh.

  // I can't use the attach decorator.
  // I have to use some other decorator just in order to get the type information in the editor.
  // Using parameter makes sense. It is in general the way to 
  // It could also be called Serialized to match Unity but it can also be confusing.
  // It makes it clear that you want this to be exposed in the editor.
  // You may have components that you don't want to expose as that could just create unnecessary clutter. 
  // and you may not be able to support it to be configured differently.
  // I should probably be able to support instantiating custom components as well
  // as it hear requires a call to attach. 
  // This might be possible by finding the component types during materialization.
  // As that requires the actual types, which can be custom types, it 
  // needs the actual type. This may not be possible to achieve, possibly only by passing in the type to the decorator
  mesh: MeshComponent

  a: AComponent = attach(AComponent)

  constructor() {
    super()
    this.mesh = attach(MeshComponent, {
      mass: 1,
      bodyType: PhysicsBodyType.dynamic,
      continousCollisionDetection: true
    })
  }

  onInit(): void | Promise<void> {
    // if attach is called in the on init method, then oninit will not be called on components
    // several solutons to this
    // - call on init twice when starting
    // - force user to call init when attaching
    // - use another life cycle event for setting up stuff that makes use of parameters
    // Call on init on the actor before children to enable defining them on the on init.
    // The downside with that is if you for some reason are relying on them to be setup before accessing them.

    this.mesh.replaceMesh(execRandom(
      /*() => new PhysicalShapeMesh(
        new BoxGeometry(this.radius * 2, this.radius * 2, this.radius * 2),
        new MeshStandardMaterial({ color: 0xeff542, roughness: .3 }),
        new BoxCollisionShape(new Vector3(this.radius * 2, this.radius * 2, this.radius * 2))
      ),*/
      () => new PhysicalShapeMesh(
        new SphereGeometry(this.radius, 20, 10),
        new MeshStandardMaterial({ color: 0xeff542, roughness: .3 }),
        new SphereCollisionShape(this.radius)
      ),
    ))
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

@Component()
class BComponent extends ActorComponent {
  foo = 3
}

@Component()
class AComponent extends ActorComponent {
  b = attach(BComponent)
}