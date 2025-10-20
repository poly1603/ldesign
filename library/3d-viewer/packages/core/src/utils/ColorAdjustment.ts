/**
 * Color adjustment system
 * Adjust brightness, contrast, saturation, hue, etc.
 */
import * as THREE from 'three';

export interface ColorSettings {
  brightness: number; // -1 to 1
  contrast: number; // -1 to 1
  saturation: number; // -1 to 1
  hue: number; // 0 to 360
  exposure: number; // -2 to 2
  temperature: number; // -1 to 1 (cool to warm)
}

export class ColorAdjustment {
  private settings: ColorSettings = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    hue: 0,
    exposure: 0,
    temperature: 0,
  };

  private material: THREE.ShaderMaterial | null = null;

  constructor() {
    this.createMaterial();
  }

  private createMaterial(): void {
    // Fragment shader for color adjustments
    const fragmentShader = `
      uniform sampler2D tDiffuse;
      uniform float brightness;
      uniform float contrast;
      uniform float saturation;
      uniform float hue;
      uniform float exposure;
      uniform float temperature;
      
      varying vec2 vUv;

      vec3 rgb2hsv(vec3 c) {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        vec3 color = texel.rgb;

        // Exposure
        color *= pow(2.0, exposure);

        // Brightness
        color += brightness;

        // Contrast
        color = (color - 0.5) * (1.0 + contrast) + 0.5;

        // Temperature
        color.r += temperature * 0.1;
        color.b -= temperature * 0.1;

        // Saturation & Hue (via HSV)
        vec3 hsv = rgb2hsv(color);
        hsv.x += hue / 360.0;
        hsv.y *= 1.0 + saturation;
        color = hsv2rgb(hsv);

        // Clamp
        color = clamp(color, 0.0, 1.0);

        gl_FragColor = vec4(color, texel.a);
      }
    `;

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        brightness: { value: 0 },
        contrast: { value: 0 },
        saturation: { value: 0 },
        hue: { value: 0 },
        exposure: { value: 0 },
        temperature: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    });
  }

  /**
   * Apply settings to material
   */
  public applyToMaterial(material: THREE.Material): void {
    if (material instanceof THREE.MeshBasicMaterial) {
      // For basic materials, we need to use onBeforeCompile
      material.onBeforeCompile = (shader) => {
        shader.uniforms.brightness = { value: this.settings.brightness };
        shader.uniforms.contrast = { value: this.settings.contrast };
        shader.uniforms.saturation = { value: this.settings.saturation };
        shader.uniforms.hue = { value: this.settings.hue };
        shader.uniforms.exposure = { value: this.settings.exposure };
        shader.uniforms.temperature = { value: this.settings.temperature };

        // Inject uniforms and shader code
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <output_fragment>',
          `
          vec3 adjustedColor = outgoingLight;
          adjustedColor *= pow(2.0, exposure);
          adjustedColor += brightness;
          adjustedColor = (adjustedColor - 0.5) * (1.0 + contrast) + 0.5;
          adjustedColor.r += temperature * 0.1;
          adjustedColor.b -= temperature * 0.1;
          adjustedColor = clamp(adjustedColor, 0.0, 1.0);
          gl_FragColor = vec4(adjustedColor, diffuseColor.a);
          `
        );
      };
      material.needsUpdate = true;
    }
  }

  /**
   * Set brightness (-1 to 1)
   */
  public setBrightness(value: number): void {
    this.settings.brightness = Math.max(-1, Math.min(1, value));
    this.updateUniforms();
  }

  /**
   * Set contrast (-1 to 1)
   */
  public setContrast(value: number): void {
    this.settings.contrast = Math.max(-1, Math.min(1, value));
    this.updateUniforms();
  }

  /**
   * Set saturation (-1 to 1)
   */
  public setSaturation(value: number): void {
    this.settings.saturation = Math.max(-1, Math.min(1, value));
    this.updateUniforms();
  }

  /**
   * Set hue (0 to 360)
   */
  public setHue(value: number): void {
    this.settings.hue = value % 360;
    this.updateUniforms();
  }

  /**
   * Set exposure (-2 to 2)
   */
  public setExposure(value: number): void {
    this.settings.exposure = Math.max(-2, Math.min(2, value));
    this.updateUniforms();
  }

  /**
   * Set temperature (-1 to 1, cool to warm)
   */
  public setTemperature(value: number): void {
    this.settings.temperature = Math.max(-1, Math.min(1, value));
    this.updateUniforms();
  }

  /**
   * Reset all settings to default
   */
  public reset(): void {
    this.settings = {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      exposure: 0,
      temperature: 0,
    };
    this.updateUniforms();
  }

  /**
   * Get current settings
   */
  public getSettings(): ColorSettings {
    return { ...this.settings };
  }

  /**
   * Set all settings at once
   */
  public setSettings(settings: Partial<ColorSettings>): void {
    Object.assign(this.settings, settings);
    this.updateUniforms();
  }

  private updateUniforms(): void {
    if (this.material) {
      this.material.uniforms.brightness.value = this.settings.brightness;
      this.material.uniforms.contrast.value = this.settings.contrast;
      this.material.uniforms.saturation.value = this.settings.saturation;
      this.material.uniforms.hue.value = this.settings.hue;
      this.material.uniforms.exposure.value = this.settings.exposure;
      this.material.uniforms.temperature.value = this.settings.temperature;
    }
  }

  public dispose(): void {
    if (this.material) {
      this.material.dispose();
    }
  }
}

