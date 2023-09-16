
import { attributes, clamp, colorToNormal, dot, float, FloatNode, fragmentLinearEyeDepth, linearEyeDepth, max, mix, normalize, pow, reflect, rgb, rgba, RgbaNode, saturate, select, sin, standardMaterial, textureSampler2d, timeUniforms, transformed, translateZ, uniforms, varyingAttributes, varyingVec2, varyingVec3, vec2, vec3, vec4 } from '@hology/core/shader-nodes';
import { Parameter } from '@hology/core/shader/parameter';
import { NodeShader, NodeShaderOutput } from '@hology/core/shader/shader';
import { OneMinusSrcColorFactor, RepeatWrapping, SrcColorFactor, Texture } from 'three';

export class Water extends NodeShader {
  @Parameter() normalMap: Texture
  @Parameter() normalSampleScale: FloatNode = float(0.01)
  @Parameter() dudvMap: Texture
  @Parameter({range: [0, 1]}) normalScale: FloatNode = float(1)
  @Parameter() opaqueDepth = float(4.5)
  @Parameter() waterOpacity = float(0.8)
  @Parameter() waterSpeed = float(0.4)

  // How much the viewing angle should contribute to the transparency. 
  // Higher vale means that more light is reflected so the surface is less transparent
  // A higher value leads to a sharper edge
  @Parameter() fresnel = float(.4)

  output(): NodeShaderOutput {
    const waterBaseColor = rgb(0x1fcce3)
    const waterShallowColor = rgb(0x24d19d)

    if (this.normalMap) {
      this.normalMap.wrapS = RepeatWrapping
      this.normalMap.wrapT = RepeatWrapping
    }

    if (this.dudvMap) {
      this.dudvMap.wrapS = RepeatWrapping
      this.dudvMap.wrapT = RepeatWrapping
    }

    const worldPosition = uniforms.modelMatrix.multiplyVec(vec4(attributes.position, 1));
    const uv = varyingVec2(worldPosition.xz())

    const time = timeUniforms.elapsed
    const shiftedUv = uv.addScalar(this.waterSpeed.multiply(time))
    const shiftedUv2 = uv.add(vec2(1,-.5).multiplyScalar(float(.001).multiply(sin(time))))

    const distortionFactor = float(.8)
    const distorionScale = float(.02)

    const sampledDistortion = textureSampler2d(this.dudvMap).sample(shiftedUv2.multiplyScalar(distorionScale)).xy()
    const distortion = sampledDistortion.multiplyScalar(distortionFactor)

    const normalColor = textureSampler2d(this.normalMap).sample(
      shiftedUv.add(distortion).multiplyScalar(this.normalSampleScale)
    )
    const normal = colorToNormal(normalColor, this.normalScale)

    const shineDamper = float(20)
    const reflectivity = float(0.2)

    var depth = linearEyeDepth.subtract(fragmentLinearEyeDepth)

    const depthAlpha = clamp(depth.divide(this.opaqueDepth), float(0), float(1))
      .multiply(this.waterOpacity)

    const surfaceNormal = normalize(varyingVec3(transformed.normal))
    const viewDir = vec3( 0.0, 0.0, 1.0 )
    const angle = dot(surfaceNormal, viewDir)
    const fresnelFactor = float(1).subtract(clamp(angle, float(0), float(1)))

    // The extra alpha added is so that it looks more transparent in shallow areas depending on your viewing angle
    // This makes sense as when the fresnel is high, more light would be reflected from the surface. 
    const fresnelAlpha = (float(1).subtract(depthAlpha)).multiply(fresnelFactor).multiply(this.fresnel)
    const alpha = depthAlpha.add(fresnelAlpha)

    // Specularity
    const lightPosition = vec3(30, 100, 30)
    const fromLightVector = varyingVec3(transformed.position.xyz().subtract(lightPosition))

    const reflectedLight = reflect(normalize(fromLightVector), normal)
    const specular0 = max(dot(reflectedLight, viewDir), float(0))
    const specular = pow(specular0, shineDamper)
    
    const specularHighlights = specular.multiply(reflectivity)
      // Using fresnel to be less reflective when looked at from above
      .multiply(max(fresnelFactor, float(0.3)))
      // Use the depth to limit the specular highlights to be further from the edge of the water
      .multiply(clamp(depth.divide(float(1)), float(0), float(1)))
    const specularColor = vec3(specularHighlights,specularHighlights,specularHighlights)

    // Diffuse color
    const waterColor = mix(waterShallowColor, waterBaseColor, clamp(depth.divide(float(10)), float(0), float(1)))

    const foamThreshold = saturate(sin(time).multiply(float(.2)).add(float(0.3)))
    const isFoam = depth.lt(foamThreshold)
    const foamAlpha = select(isFoam, float(.5), float(0))
    const foamColor = rgb(0xadfff4)

    // Animate surface level
    // The added delay is so that the foam starts after the water has risen
    const offsetStrength = float(.007)
    const foamDelay = float(1)
    const translationAmount = sin(time.add(foamDelay)).multiply(offsetStrength)
    const transform = translateZ(translationAmount)

    return {
      color: rgba(select(isFoam, foamColor, waterColor.add(specularColor)), max(alpha, foamAlpha)),
      transparent: true
    }
  }

  build() {
    const material = super.build();
    material.blendSrc = OneMinusSrcColorFactor
    material.blendDst = SrcColorFactor
    return material
  }

}