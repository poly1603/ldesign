/**
 * @file 实时滤镜引擎
 * @description 提供Instagram风格的实时滤镜和特效处理
 */

import type { Size } from '@/types'

/**
 * 滤镜参数接口
 */
export interface FilterParams {
  /** 亮度 (-100 到 100) */
  brightness?: number
  /** 对比度 (-100 到 100) */
  contrast?: number
  /** 饱和度 (-100 到 100) */
  saturation?: number
  /** 色相 (-180 到 180) */
  hue?: number
  /** 伽马值 (0.1 到 3.0) */
  gamma?: number
  /** 曝光 (-100 到 100) */
  exposure?: number
  /** 高光 (-100 到 100) */
  highlights?: number
  /** 阴影 (-100 到 100) */
  shadows?: number
  /** 清晰度 (-100 到 100) */
  clarity?: number
  /** 自然饱和度 (-100 到 100) */
  vibrance?: number
  /** 温度 (-100 到 100) */
  temperature?: number
  /** 色调 (-100 到 100) */
  tint?: number
  /** 晕影强度 (0 到 100) */
  vignette?: number
  /** 模糊强度 (0 到 10) */
  blur?: number
  /** 锐化强度 (0 到 100) */
  sharpen?: number
  /** 噪点强度 (0 到 100) */
  noise?: number
}

/**
 * 预设滤镜定义
 */
export interface FilterPreset {
  /** 滤镜名称 */
  name: string
  /** 显示名称 */
  displayName: string
  /** 滤镜参数 */
  params: FilterParams
  /** 预览图标 */
  icon?: string
  /** 滤镜类别 */
  category: 'basic' | 'vintage' | 'modern' | 'artistic' | 'black-white'
  /** 滤镜描述 */
  description?: string
}

/**
 * 滤镜历史记录
 */
export interface FilterHistory {
  /** 时间戳 */
  timestamp: number
  /** 滤镜参数 */
  params: FilterParams
  /** 操作描述 */
  description: string
}

/**
 * 滤镜引擎配置
 */
export interface FilterEngineConfig {
  /** 是否启用硬件加速 */
  useWebGL: boolean
  /** 最大历史记录数量 */
  maxHistory: number
  /** 是否启用实时预览 */
  enableRealTimePreview: boolean
  /** 预览质量 (0.1 到 1.0) */
  previewQuality: number
}

/**
 * 实时滤镜引擎
 */
export class FilterEngine {
  /** Canvas元素 */
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  
  /** WebGL上下文（如果支持） */
  private gl: WebGLRenderingContext | null = null
  private glProgram: WebGLProgram | null = null
  
  /** 当前滤镜参数 */
  private currentParams: FilterParams = {}
  
  /** 原始图像数据 */
  private originalImageData: ImageData | null = null
  
  /** 滤镜历史记录 */
  private history: FilterHistory[] = []
  
  /** 配置选项 */
  private config: FilterEngineConfig
  
  /** 预设滤镜 */
  private presets: FilterPreset[] = []

  /** 默认配置 */
  private static readonly DEFAULT_CONFIG: FilterEngineConfig = {
    useWebGL: true,
    maxHistory: 50,
    enableRealTimePreview: true,
    previewQuality: 0.5
  }

  /**
   * 构造函数
   */
  constructor(canvas: HTMLCanvasElement, config: Partial<FilterEngineConfig> = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.config = { ...FilterEngine.DEFAULT_CONFIG, ...config }
    
    // 尝试初始化WebGL
    if (this.config.useWebGL) {
      this.initWebGL()
    }
    
    // 初始化预设滤镜
    this.initializePresets()
  }

  /**
   * 初始化WebGL
   */
  private initWebGL(): void {
    try {
      this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')
      
      if (this.gl) {
        this.createShaderProgram()
      }
    } catch (error) {
      console.warn('WebGL initialization failed, falling back to Canvas 2D:', error)
      this.gl = null
    }
  }

  /**
   * 创建着色器程序
   */
  private createShaderProgram(): void {
    if (!this.gl) return

    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `

    const fragmentShaderSource = `
      precision mediump float;
      
      uniform sampler2D u_texture;
      uniform float u_brightness;
      uniform float u_contrast;
      uniform float u_saturation;
      uniform float u_hue;
      uniform float u_gamma;
      uniform float u_exposure;
      uniform float u_temperature;
      uniform float u_tint;
      uniform float u_vignette;
      
      varying vec2 v_texCoord;
      
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
      
      vec3 adjustTemperature(vec3 color, float temp) {
        float t = temp / 100.0;
        mat3 tempMatrix = mat3(
          1.0 + t * 0.1, 0.0, 0.0,
          0.0, 1.0, 0.0,
          0.0, 0.0, 1.0 - t * 0.1
        );
        return tempMatrix * color;
      }
      
      void main() {
        vec4 color = texture2D(u_texture, v_texCoord);
        
        // 亮度调整
        color.rgb += u_brightness / 100.0;
        
        // 对比度调整
        color.rgb = (color.rgb - 0.5) * (1.0 + u_contrast / 100.0) + 0.5;
        
        // 曝光调整
        color.rgb *= pow(2.0, u_exposure / 100.0);
        
        // 伽马校正
        color.rgb = pow(color.rgb, vec3(1.0 / u_gamma));
        
        // HSV调整
        vec3 hsv = rgb2hsv(color.rgb);
        hsv.x += u_hue / 360.0;
        hsv.y *= 1.0 + u_saturation / 100.0;
        color.rgb = hsv2rgb(hsv);
        
        // 温度调整
        if (u_temperature != 0.0) {
          color.rgb = adjustTemperature(color.rgb, u_temperature);
        }
        
        // 色调调整
        color.rb += u_tint / 100.0 * vec2(0.1, -0.1);
        
        // 晕影效果
        if (u_vignette > 0.0) {
          float dist = distance(v_texCoord, vec2(0.5));
          float vignetteFactor = 1.0 - smoothstep(0.3, 0.7, dist * u_vignette / 100.0);
          color.rgb *= vignetteFactor;
        }
        
        // 确保颜色在有效范围内
        color.rgb = clamp(color.rgb, 0.0, 1.0);
        
        gl_FragColor = color;
      }
    `

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource)

    if (vertexShader && fragmentShader) {
      this.glProgram = this.gl.createProgram()!
      this.gl.attachShader(this.glProgram, vertexShader)
      this.gl.attachShader(this.glProgram, fragmentShader)
      this.gl.linkProgram(this.glProgram)

      if (!this.gl.getProgramParameter(this.glProgram, this.gl.LINK_STATUS)) {
        console.error('Shader program failed to link:', this.gl.getProgramInfoLog(this.glProgram))
        this.glProgram = null
      }
    }
  }

  /**
   * 创建着色器
   */
  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null

    const shader = this.gl.createShader(type)!
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader))
      this.gl.deleteShader(shader)
      return null
    }

    return shader
  }

  /**
   * 初始化预设滤镜
   */
  private initializePresets(): void {
    this.presets = [
      // 基础调整
      {
        name: 'original',
        displayName: '原图',
        params: {},
        category: 'basic',
        description: '原始图片，无滤镜效果'
      },
      {
        name: 'bright',
        displayName: '明亮',
        params: { brightness: 20, contrast: 10 },
        category: 'basic',
        description: '提升亮度和对比度'
      },
      {
        name: 'vivid',
        displayName: '鲜艳',
        params: { saturation: 30, vibrance: 20, contrast: 15 },
        category: 'basic',
        description: '增强色彩饱和度'
      },

      // 复古风格
      {
        name: 'vintage',
        displayName: '复古',
        params: {
          brightness: -10,
          contrast: 15,
          saturation: -20,
          temperature: 10,
          vignette: 30
        },
        category: 'vintage',
        description: '经典复古胶片风格'
      },
      {
        name: 'sepia',
        displayName: '褐色',
        params: {
          saturation: -80,
          temperature: 40,
          brightness: -5,
          contrast: 10
        },
        category: 'vintage',
        description: '怀旧褐色调'
      },
      {
        name: 'film',
        displayName: '胶片',
        params: {
          contrast: 20,
          brightness: 5,
          saturation: -10,
          gamma: 1.2,
          vignette: 20
        },
        category: 'vintage',
        description: '胶片摄影风格'
      },

      // 现代风格
      {
        name: 'instagram',
        displayName: 'Instagram',
        params: {
          brightness: 10,
          contrast: 20,
          saturation: 15,
          highlights: -20,
          shadows: 20,
          clarity: 15
        },
        category: 'modern',
        description: '社交媒体风格'
      },
      {
        name: 'vsco',
        displayName: 'VSCO',
        params: {
          contrast: -10,
          brightness: 5,
          saturation: -5,
          temperature: 5,
          tint: -5,
          clarity: 10
        },
        category: 'modern',
        description: 'VSCO滤镜风格'
      },

      // 艺术风格
      {
        name: 'dramatic',
        displayName: '戏剧化',
        params: {
          contrast: 40,
          brightness: -10,
          saturation: 20,
          clarity: 30,
          vignette: 40
        },
        category: 'artistic',
        description: '戏剧化效果'
      },
      {
        name: 'dreamy',
        displayName: '梦幻',
        params: {
          brightness: 15,
          contrast: -20,
          saturation: 10,
          blur: 1,
          highlights: 20
        },
        category: 'artistic',
        description: '柔和梦幻效果'
      },

      // 黑白风格
      {
        name: 'bw',
        displayName: '黑白',
        params: { saturation: -100 },
        category: 'black-white',
        description: '经典黑白照片'
      },
      {
        name: 'bw_contrast',
        displayName: '高对比黑白',
        params: {
          saturation: -100,
          contrast: 30,
          clarity: 20
        },
        category: 'black-white',
        description: '高对比度黑白'
      }
    ]
  }

  /**
   * 设置源图像
   */
  setSourceImage(image: HTMLImageElement | ImageData): void {
    if (image instanceof HTMLImageElement) {
      this.canvas.width = image.naturalWidth
      this.canvas.height = image.naturalHeight
      this.ctx.drawImage(image, 0, 0)
      this.originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
    } else {
      this.canvas.width = image.width
      this.canvas.height = image.height
      this.originalImageData = image
      this.ctx.putImageData(image, 0, 0)
    }
  }

  /**
   * 应用滤镜参数
   */
  async applyFilter(params: FilterParams, preview = false): Promise<ImageData | null> {
    if (!this.originalImageData) {
      console.warn('No source image set')
      return null
    }

    // 合并参数
    const mergedParams = { ...this.currentParams, ...params }

    try {
      let result: ImageData

      // 优先使用WebGL加速
      if (this.gl && this.glProgram && !preview) {
        result = await this.applyFilterWebGL(mergedParams)
      } else {
        result = await this.applyFilterCanvas(mergedParams, preview)
      }

      // 更新当前参数
      if (!preview) {
        this.currentParams = mergedParams
        this.addToHistory(mergedParams, 'Manual adjustment')
      }

      return result
    } catch (error) {
      console.error('Filter application failed:', error)
      return null
    }
  }

  /**
   * 使用WebGL应用滤镜
   */
  private async applyFilterWebGL(params: FilterParams): Promise<ImageData> {
    if (!this.gl || !this.glProgram || !this.originalImageData) {
      throw new Error('WebGL not available')
    }

    const gl = this.gl
    const program = this.glProgram

    // 设置视口
    gl.viewport(0, 0, this.canvas.width, this.canvas.height)

    // 使用着色器程序
    gl.useProgram(program)

    // 创建纹理
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.originalImageData)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)

    // 设置uniform变量
    this.setUniforms(params)

    // 设置顶点数据
    this.setupVertexData()

    // 绘制
    gl.drawArrays(gl.TRIANGLES, 0, 6)

    // 读取像素数据
    const pixels = new Uint8ClampedArray(this.canvas.width * this.canvas.height * 4)
    gl.readPixels(0, 0, this.canvas.width, this.canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    // 清理资源
    gl.deleteTexture(texture)

    return new ImageData(pixels, this.canvas.width, this.canvas.height)
  }

  /**
   * 设置WebGL uniform变量
   */
  private setUniforms(params: FilterParams): void {
    if (!this.gl || !this.glProgram) return

    const gl = this.gl
    const program = this.glProgram

    // 设置滤镜参数
    gl.uniform1f(gl.getUniformLocation(program, 'u_brightness'), params.brightness || 0)
    gl.uniform1f(gl.getUniformLocation(program, 'u_contrast'), params.contrast || 0)
    gl.uniform1f(gl.getUniformLocation(program, 'u_saturation'), params.saturation || 0)
    gl.uniform1f(gl.getUniformLocation(program, 'u_hue'), params.hue || 0)
    gl.uniform1f(gl.getUniformLocation(program, 'u_gamma'), params.gamma || 1)
    gl.uniform1f(gl.getUniformLocation(program, 'u_exposure'), params.exposure || 0)
    gl.uniform1f(gl.getUniformLocation(program, 'u_temperature'), params.temperature || 0)
    gl.uniform1f(gl.getUniformLocation(program, 'u_tint'), params.tint || 0)
    gl.uniform1f(gl.getUniformLocation(program, 'u_vignette'), params.vignette || 0)
  }

  /**
   * 设置WebGL顶点数据
   */
  private setupVertexData(): void {
    if (!this.gl || !this.glProgram) return

    const gl = this.gl
    const program = this.glProgram

    // 顶点坐标和纹理坐标
    const vertices = new Float32Array([
      -1, -1, 0, 1,   // 左下
       1, -1, 1, 1,   // 右下
      -1,  1, 0, 0,   // 左上
      -1,  1, 0, 0,   // 左上
       1, -1, 1, 1,   // 右下
       1,  1, 1, 0    // 右上
    ])

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW)

    // 位置属性
    const positionLocation = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0)

    // 纹理坐标属性
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord')
    gl.enableVertexAttribArray(texCoordLocation)
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8)
  }

  /**
   * 使用Canvas 2D应用滤镜
   */
  private async applyFilterCanvas(params: FilterParams, preview = false): Promise<ImageData> {
    if (!this.originalImageData) {
      throw new Error('No source image data')
    }

    // 为预览创建小尺寸版本
    let sourceData = this.originalImageData
    if (preview && this.config.previewQuality < 1) {
      sourceData = this.createPreviewImageData(this.originalImageData, this.config.previewQuality)
    }

    const data = new Uint8ClampedArray(sourceData.data)
    
    // 应用各种滤镜效果
    this.applyBrightnessContrast(data, params.brightness || 0, params.contrast || 0)
    this.applySaturation(data, params.saturation || 0)
    this.applyHue(data, params.hue || 0)
    this.applyGamma(data, params.gamma || 1)
    this.applyTemperatureTint(data, params.temperature || 0, params.tint || 0)

    // 特殊效果
    if (params.vignette) {
      this.applyVignette(data, sourceData.width, sourceData.height, params.vignette)
    }

    if (params.blur && params.blur > 0) {
      this.applyBlur(data, sourceData.width, sourceData.height, params.blur)
    }

    return new ImageData(data, sourceData.width, sourceData.height)
  }

  /**
   * 创建预览用的小尺寸图像数据
   */
  private createPreviewImageData(original: ImageData, scale: number): ImageData {
    const previewWidth = Math.floor(original.width * scale)
    const previewHeight = Math.floor(original.height * scale)
    
    const previewCanvas = document.createElement('canvas')
    previewCanvas.width = previewWidth
    previewCanvas.height = previewHeight
    
    const previewCtx = previewCanvas.getContext('2d')!
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = original.width
    tempCanvas.height = original.height
    
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.putImageData(original, 0, 0)
    
    previewCtx.drawImage(tempCanvas, 0, 0, previewWidth, previewHeight)
    return previewCtx.getImageData(0, 0, previewWidth, previewHeight)
  }

  /**
   * 应用亮度和对比度
   */
  private applyBrightnessContrast(data: Uint8ClampedArray, brightness: number, contrast: number): void {
    const brightnessFactor = brightness / 100 * 255
    const contrastFactor = (259 * (contrast + 255)) / (255 * (259 - contrast))

    for (let i = 0; i < data.length; i += 4) {
      // 应用亮度
      data[i] = Math.max(0, Math.min(255, data[i] + brightnessFactor))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightnessFactor))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightnessFactor))

      // 应用对比度
      if (contrast !== 0) {
        data[i] = Math.max(0, Math.min(255, contrastFactor * (data[i] - 128) + 128))
        data[i + 1] = Math.max(0, Math.min(255, contrastFactor * (data[i + 1] - 128) + 128))
        data[i + 2] = Math.max(0, Math.min(255, contrastFactor * (data[i + 2] - 128) + 128))
      }
    }
  }

  /**
   * 应用饱和度
   */
  private applySaturation(data: Uint8ClampedArray, saturation: number): void {
    if (saturation === 0) return

    const factor = (saturation + 100) / 100

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      
      data[i] = Math.max(0, Math.min(255, gray + (data[i] - gray) * factor))
      data[i + 1] = Math.max(0, Math.min(255, gray + (data[i + 1] - gray) * factor))
      data[i + 2] = Math.max(0, Math.min(255, gray + (data[i + 2] - gray) * factor))
    }
  }

  /**
   * 应用色相
   */
  private applyHue(data: Uint8ClampedArray, hue: number): void {
    if (hue === 0) return

    const hueRadians = hue * Math.PI / 180

    for (let i = 0; i < data.length; i += 4) {
      const [h, s, v] = this.rgbToHsv(data[i], data[i + 1], data[i + 2])
      const newH = (h + hueRadians) % (2 * Math.PI)
      const [r, g, b] = this.hsvToRgb(newH, s, v)
      
      data[i] = Math.max(0, Math.min(255, r))
      data[i + 1] = Math.max(0, Math.min(255, g))
      data[i + 2] = Math.max(0, Math.min(255, b))
    }
  }

  /**
   * 应用伽马校正
   */
  private applyGamma(data: Uint8ClampedArray, gamma: number): void {
    if (gamma === 1) return

    const gammaCorrection = 1 / gamma

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, 255 * Math.pow(data[i] / 255, gammaCorrection)))
      data[i + 1] = Math.max(0, Math.min(255, 255 * Math.pow(data[i + 1] / 255, gammaCorrection)))
      data[i + 2] = Math.max(0, Math.min(255, 255 * Math.pow(data[i + 2] / 255, gammaCorrection)))
    }
  }

  /**
   * 应用温度和色调
   */
  private applyTemperatureTint(data: Uint8ClampedArray, temperature: number, tint: number): void {
    if (temperature === 0 && tint === 0) return

    const tempFactor = temperature / 100
    const tintFactor = tint / 100

    for (let i = 0; i < data.length; i += 4) {
      // 温度调整（影响红蓝通道）
      if (tempFactor !== 0) {
        data[i] = Math.max(0, Math.min(255, data[i] * (1 + tempFactor * 0.1)))     // 红色
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * (1 - tempFactor * 0.1))) // 蓝色
      }

      // 色调调整（影响绿色和洋红色）
      if (tintFactor !== 0) {
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * (1 + tintFactor * 0.1))) // 绿色
      }
    }
  }

  /**
   * 应用晕影效果
   */
  private applyVignette(data: Uint8ClampedArray, width: number, height: number, intensity: number): void {
    const centerX = width / 2
    const centerY = height / 2
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)
    const vignetteFactor = intensity / 100

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
        const factor = 1 - (distance / maxDistance) * vignetteFactor
        const clampedFactor = Math.max(0, Math.min(1, factor))

        const index = (y * width + x) * 4
        data[index] *= clampedFactor
        data[index + 1] *= clampedFactor
        data[index + 2] *= clampedFactor
      }
    }
  }

  /**
   * 应用模糊效果
   */
  private applyBlur(data: Uint8ClampedArray, width: number, height: number, radius: number): void {
    const blurRadius = Math.floor(radius)
    if (blurRadius <= 0) return

    const original = new Uint8ClampedArray(data)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0

        for (let dy = -blurRadius; dy <= blurRadius; dy++) {
          for (let dx = -blurRadius; dx <= blurRadius; dx++) {
            const px = Math.max(0, Math.min(width - 1, x + dx))
            const py = Math.max(0, Math.min(height - 1, y + dy))
            const index = (py * width + px) * 4

            r += original[index]
            g += original[index + 1]
            b += original[index + 2]
            a += original[index + 3]
            count++
          }
        }

        const index = (y * width + x) * 4
        data[index] = r / count
        data[index + 1] = g / count
        data[index + 2] = b / count
        data[index + 3] = a / count
      }
    }
  }

  /**
   * RGB转HSV
   */
  private rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const delta = max - min

    let h = 0
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6
      else if (max === g) h = (b - r) / delta + 2
      else h = (r - g) / delta + 4
      h *= Math.PI / 3
    }

    const s = max === 0 ? 0 : delta / max
    const v = max

    return [h, s, v]
  }

  /**
   * HSV转RGB
   */
  private hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const c = v * s
    const x = c * (1 - Math.abs((h / (Math.PI / 3)) % 2 - 1))
    const m = v - c

    let r = 0, g = 0, b = 0

    if (0 <= h && h < Math.PI / 3) {
      r = c; g = x; b = 0
    } else if (Math.PI / 3 <= h && h < 2 * Math.PI / 3) {
      r = x; g = c; b = 0
    } else if (2 * Math.PI / 3 <= h && h < Math.PI) {
      r = 0; g = c; b = x
    } else if (Math.PI <= h && h < 4 * Math.PI / 3) {
      r = 0; g = x; b = c
    } else if (4 * Math.PI / 3 <= h && h < 5 * Math.PI / 3) {
      r = x; g = 0; b = c
    } else if (5 * Math.PI / 3 <= h && h < 2 * Math.PI) {
      r = c; g = 0; b = x
    }

    return [(r + m) * 255, (g + m) * 255, (b + m) * 255]
  }

  /**
   * 应用预设滤镜
   */
  async applyPreset(presetName: string): Promise<ImageData | null> {
    const preset = this.presets.find(p => p.name === presetName)
    if (!preset) {
      console.warn('Preset not found:', presetName)
      return null
    }

    return this.applyFilter(preset.params)
  }

  /**
   * 获取所有预设滤镜
   */
  getPresets(): FilterPreset[] {
    return [...this.presets]
  }

  /**
   * 获取分类的预设滤镜
   */
  getPresetsByCategory(category: string): FilterPreset[] {
    return this.presets.filter(p => p.category === category)
  }

  /**
   * 添加自定义预设
   */
  addCustomPreset(preset: FilterPreset): void {
    this.presets.push(preset)
  }

  /**
   * 重置滤镜
   */
  reset(): void {
    this.currentParams = {}
    if (this.originalImageData) {
      this.ctx.putImageData(this.originalImageData, 0, 0)
    }
  }

  /**
   * 获取当前滤镜参数
   */
  getCurrentParams(): FilterParams {
    return { ...this.currentParams }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(params: FilterParams, description: string): void {
    this.history.push({
      timestamp: Date.now(),
      params: { ...params },
      description
    })

    // 限制历史记录数量
    if (this.history.length > this.config.maxHistory) {
      this.history.shift()
    }
  }

  /**
   * 获取历史记录
   */
  getHistory(): FilterHistory[] {
    return [...this.history]
  }

  /**
   * 销毁滤镜引擎
   */
  destroy(): void {
    if (this.gl) {
      if (this.glProgram) {
        this.gl.deleteProgram(this.glProgram)
      }
      // WebGL上下文会在Canvas被清理时自动清理
    }
    
    this.originalImageData = null
    this.currentParams = {}
    this.history = []
  }
}
