import { Shader } from "@hology/core/shader/shader";
import { Material, MeshStandardMaterial } from 'three';

class TestShader extends Shader {
  build(): Material {
    return new MeshStandardMaterial({color: 0xff0000})
  }
}


export default {
  red: TestShader
}
