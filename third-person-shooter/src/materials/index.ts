import { Parameter, Shader } from "@hology/core/shader/shader";
import { Material, MeshStandardMaterial } from 'three';

class TestShader extends Shader {
  @Parameter()
  opacity: number

  build(): Material {
    return new MeshStandardMaterial({color: 0xff0000, opacity: this.opacity, transparent: true})
  }
}


export default {
  red: TestShader
}
