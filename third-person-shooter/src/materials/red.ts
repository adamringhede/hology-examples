import { Parameter, Shader } from "@hology/core/shader/shader";
import { Material, MeshStandardMaterial } from 'three';

export class TestShader extends Shader {
  @Parameter()
  opacity: number

  build(): Material {
    return new MeshStandardMaterial({color: 0x00ff00, opacity: this.opacity, transparent: true})
  }
}

