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
import { BoxGeometry, Color, MeshStandardMaterial, SphereGeometry, Vector3 } from "three"
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry'


@Actor()
class BoxActor extends BaseActor {
  @Parameter()
  private color: Color = new Color(0x0000ff)

  private physics = inject(PhysicsSystem)

  // For some reason collision shapes are not working
  private mesh: MeshComponent = this.attach(MeshComponent, {
    mesh: new PhysicalShapeMesh(
      new RoundedBoxGeometry(1, 1, 1, 4, 0.05),
      new MeshStandardMaterial({color: this.color}),
      new BoxCollisionShape(new Vector3(1,1,1)).withOffset(new Vector3(0, .5, 0)),
    ),
    mass: 10,
    bodyType: PhysicsBodyType.dynamic
  })
  onInit(): void | Promise<void> {
  
    
    const material = this.mesh.mesh.material as MeshStandardMaterial
    if (this.color != null) {
      material.color.copy(this.color)
    }
    this.mesh.mesh.castShadow = true
    this.mesh.mesh.receiveShadow = true
    this.mesh.mesh.geometry.translate(0,.5,0)

    //this.physics.addActor(this, [new BoxCollisionShape(new Vector3(1,1,1)).withOffset(new Vector3(0, .5, 0))], {
    ///  mass: 10, type: PhysicsBodyType.dynamic 
    //})

  }

}

export default BoxActor;