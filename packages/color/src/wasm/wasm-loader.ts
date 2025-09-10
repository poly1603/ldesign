/**
 * WebAssembly 模块加载器
 * 提供高性能的颜色计算加速
 */

/**
 * WASM 模块接口
 */
export interface WasmColorModule {
  // 颜色转换
  hex_to_rgb(hex: number): Uint8Array
  rgb_to_hex(r: number, g: number, b: number): number
  rgb_to_hsl(r: number, g: number, b: number): Float32Array
  hsl_to_rgb(h: number, s: number, l: number): Uint8Array
  
  // 颜色计算
  blend_colors(color1: number, color2: number, ratio: number): number
  calculate_contrast(color1: number, color2: number): number
  generate_palette(base_color: number, count: number): Uint32Array
  
  // 批量处理
  batch_convert_hex_to_rgb(hex_array: Uint32Array): Uint8Array
  batch_calculate_contrast(colors: Uint32Array): Float32Array
  
  // 高级算法
  kmeans_clustering(data: Float32Array, k: number, max_iter: number): Float32Array
  neural_network_forward(input: Float32Array, weights: Float32Array): Float32Array
  
  // 内存管理
  allocate(size: number): number
  deallocate(ptr: number): void
  memory: WebAssembly.Memory
}

/**
 * WASM 加载配置
 */
export interface WasmConfig {
  wasmPath?: string
  fallback?: boolean
  cache?: boolean
  streaming?: boolean
  memory?: {
    initial?: number
    maximum?: number
    shared?: boolean
  }
}

/**
 * WASM 加载器
 */
export class WasmLoader {
  private module: WebAssembly.Module | null = null
  private instance: WebAssembly.Instance | null = null
  private exports: WasmColorModule | null = null
  private config: Required<WasmConfig>
  private isLoaded = false
  private loadPromise: Promise<void> | null = null

  constructor(config: WasmConfig = {}) {
    this.config = {
      wasmPath: config.wasmPath || '/wasm/color_engine.wasm',
      fallback: config.fallback !== false,
      cache: config.cache !== false,
      streaming: config.streaming !== false,
      memory: {
        initial: config.memory?.initial || 256,
        maximum: config.memory?.maximum || 2048,
        shared: config.memory?.shared || false,
      },
    }
  }

  /**
   * 加载 WASM 模块
   */
  async load(): Promise<void> {
    if (this.isLoaded) return
    if (this.loadPromise) return this.loadPromise

    this.loadPromise = this._load()
    await this.loadPromise
  }

  private async _load(): Promise<void> {
    try {
      // 检查 WebAssembly 支持
      if (!this.isWebAssemblySupported()) {
        throw new Error('WebAssembly is not supported in this environment')
      }

      // 尝试从缓存加载
      if (this.config.cache) {
        const cached = await this.loadFromCache()
        if (cached) {
          this.module = cached
        }
      }

      // 如果没有缓存，从网络加载
      if (!this.module) {
        this.module = await this.loadFromNetwork()
        
        // 缓存模块
        if (this.config.cache && this.module) {
          await this.saveToCache(this.module)
        }
      }

      // 实例化模块
      if (this.module) {
        await this.instantiate()
      }

      this.isLoaded = true
    } catch (error) {
      console.error('Failed to load WASM module:', error)
      
      if (this.config.fallback) {
        console.warn('Falling back to JavaScript implementation')
        this.setupFallback()
      } else {
        throw error
      }
    }
  }

  /**
   * 检查 WebAssembly 支持
   */
  private isWebAssemblySupported(): boolean {
    return typeof WebAssembly !== 'undefined' &&
           typeof WebAssembly.instantiate === 'function'
  }

  /**
   * 从网络加载 WASM
   */
  private async loadFromNetwork(): Promise<WebAssembly.Module> {
    const response = await fetch(this.config.wasmPath)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch WASM module: ${response.statusText}`)
    }

    if (this.config.streaming && WebAssembly.instantiateStreaming) {
      const { module } = await WebAssembly.instantiateStreaming(response, this.getImports())
      return module
    } else {
      const buffer = await response.arrayBuffer()
      const { module } = await WebAssembly.instantiate(buffer, this.getImports())
      return module
    }
  }

  /**
   * 从缓存加载
   */
  private async loadFromCache(): Promise<WebAssembly.Module | null> {
    if (!('caches' in self)) return null

    try {
      const cache = await caches.open('wasm-cache-v1')
      const response = await cache.match(this.config.wasmPath)
      
      if (response) {
        const buffer = await response.arrayBuffer()
        return await WebAssembly.compile(buffer)
      }
    } catch (error) {
      console.warn('Failed to load from cache:', error)
    }

    return null
  }

  /**
   * 保存到缓存
   */
  private async saveToCache(_module: WebAssembly.Module): Promise<void> {
    // Cache saving is not directly supported for compiled modules
    // The browser will cache the fetched WASM file automatically
    return
  }

  /**
   * 实例化模块
   */
  private async instantiate(): Promise<void> {
    if (!this.module) {
      throw new Error('Module not loaded')
    }

    this.instance = await WebAssembly.instantiate(this.module, this.getImports())
    this.exports = this.instance.exports as unknown as WasmColorModule
  }

  /**
   * 获取导入对象
   */
  private getImports(): WebAssembly.Imports {
    const memory = new WebAssembly.Memory({
      initial: this.config.memory.initial!,
      maximum: this.config.memory.maximum,
      shared: this.config.memory.shared,
    })

    return {
      env: {
        memory,
        // 数学函数
        Math_sin: Math.sin,
        Math_cos: Math.cos,
        Math_sqrt: Math.sqrt,
        Math_pow: Math.pow,
        Math_abs: Math.abs,
        Math_min: Math.min,
        Math_max: Math.max,
        Math_floor: Math.floor,
        Math_ceil: Math.ceil,
        Math_round: Math.round,
        Math_random: Math.random,
        
        // 日志函数
        console_log: (ptr: number, len: number) => {
          const buffer = new Uint8Array(memory.buffer, ptr, len)
          const text = new TextDecoder().decode(buffer)
          console.log('[WASM]:', text)
        },
        
        // 性能计时
        performance_now: () => performance.now(),
        
        // 内存操作
        memcpy: (dest: number, src: number, n: number) => {
          const destView = new Uint8Array(memory.buffer, dest, n)
          const srcView = new Uint8Array(memory.buffer, src, n)
          destView.set(srcView)
        },
        
        memset: (ptr: number, value: number, n: number) => {
          const view = new Uint8Array(memory.buffer, ptr, n)
          view.fill(value)
        },
      },
    }
  }

  /**
   * 设置 JavaScript 降级实现
   */
  private setupFallback(): void {
    this.exports = this.createFallbackImplementation()
    this.isLoaded = true
  }

  /**
   * 创建降级实现
   */
  private createFallbackImplementation(): WasmColorModule {
    return {
      hex_to_rgb: (hex: number): Uint8Array => {
        const r = (hex >> 16) & 0xFF
        const g = (hex >> 8) & 0xFF
        const b = hex & 0xFF
        return new Uint8Array([r, g, b])
      },

      rgb_to_hex: (r: number, g: number, b: number): number => {
        return (r << 16) | (g << 8) | b
      },

      rgb_to_hsl: (r: number, g: number, b: number): Float32Array => {
        r /= 255
        g /= 255
        b /= 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const l = (max + min) / 2
        let h = 0
        let s = 0

        if (max !== min) {
          const d = max - min
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          
          switch (max) {
            case r:
              h = ((g - b) / d + (g < b ? 6 : 0)) / 6
              break
            case g:
              h = ((b - r) / d + 2) / 6
              break
            case b:
              h = ((r - g) / d + 4) / 6
              break
          }
        }

        return new Float32Array([h * 360, s * 100, l * 100])
      },

      hsl_to_rgb: (h: number, s: number, l: number): Uint8Array => {
        h /= 360
        s /= 100
        l /= 100

        let r, g, b

        if (s === 0) {
          r = g = b = l
        } else {
          const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1/6) return p + (q - p) * 6 * t
            if (t < 1/2) return q
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
            return p
          }

          const q = l < 0.5 ? l * (1 + s) : l + s - l * s
          const p = 2 * l - q
          r = hue2rgb(p, q, h + 1/3)
          g = hue2rgb(p, q, h)
          b = hue2rgb(p, q, h - 1/3)
        }

        return new Uint8Array([
          Math.round(r * 255),
          Math.round(g * 255),
          Math.round(b * 255)
        ])
      },

      blend_colors: (color1: number, color2: number, ratio: number): number => {
        const r1 = (color1 >> 16) & 0xFF
        const g1 = (color1 >> 8) & 0xFF
        const b1 = color1 & 0xFF
        
        const r2 = (color2 >> 16) & 0xFF
        const g2 = (color2 >> 8) & 0xFF
        const b2 = color2 & 0xFF
        
        const r = Math.round(r1 * (1 - ratio) + r2 * ratio)
        const g = Math.round(g1 * (1 - ratio) + g2 * ratio)
        const b = Math.round(b1 * (1 - ratio) + b2 * ratio)
        
        return (r << 16) | (g << 8) | b
      },

      calculate_contrast: (color1: number, color2: number): number => {
        const getLuminance = (color: number): number => {
          const r = ((color >> 16) & 0xFF) / 255
          const g = ((color >> 8) & 0xFF) / 255
          const b = (color & 0xFF) / 255
          
          const [rs, gs, bs] = [r, g, b].map(c => 
            c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
          )
          
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
        }
        
        const l1 = getLuminance(color1)
        const l2 = getLuminance(color2)
        
        const lighter = Math.max(l1, l2)
        const darker = Math.min(l1, l2)
        
        return (lighter + 0.05) / (darker + 0.05)
      },

      generate_palette: (base_color: number, count: number): Uint32Array => {
        const palette = new Uint32Array(count)
        const r = (base_color >> 16) & 0xFF
        const g = (base_color >> 8) & 0xFF
        const b = base_color & 0xFF
        
        // Simple palette generation
        for (let i = 0; i < count; i++) {
          const factor = i / count
          const newR = Math.round(r * (1 - factor) + 255 * factor) % 256
          const newG = Math.round(g * (1 - factor) + 255 * factor) % 256
          const newB = Math.round(b * (1 - factor) + 255 * factor) % 256
          palette[i] = (newR << 16) | (newG << 8) | newB
        }
        
        return palette
      },

      batch_convert_hex_to_rgb: (hex_array: Uint32Array): Uint8Array => {
        const result = new Uint8Array(hex_array.length * 3)
        for (let i = 0; i < hex_array.length; i++) {
          const hex = hex_array[i]
          result[i * 3] = (hex >> 16) & 0xFF
          result[i * 3 + 1] = (hex >> 8) & 0xFF
          result[i * 3 + 2] = hex & 0xFF
        }
        return result
      },

      batch_calculate_contrast: (colors: Uint32Array): Float32Array => {
        const n = colors.length
        const result = new Float32Array((n * (n - 1)) / 2)
        let idx = 0
        
        const getLuminance = (color: number): number => {
          const r = ((color >> 16) & 0xFF) / 255
          const g = ((color >> 8) & 0xFF) / 255
          const b = (color & 0xFF) / 255
          
          const [rs, gs, bs] = [r, g, b].map(c => 
            c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
          )
          
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
        }
        
        for (let i = 0; i < n - 1; i++) {
          for (let j = i + 1; j < n; j++) {
            const l1 = getLuminance(colors[i])
            const l2 = getLuminance(colors[j])
            const lighter = Math.max(l1, l2)
            const darker = Math.min(l1, l2)
            result[idx++] = (lighter + 0.05) / (darker + 0.05)
          }
        }
        
        return result
      },

      kmeans_clustering: (data: Float32Array, k: number, max_iter: number): Float32Array => {
        // 简化的 K-means 实现
        const n = data.length / 3 // 假设是 RGB 数据
        const centroids = new Float32Array(k * 3)
        const assignments = new Float32Array(n)
        
        // 随机初始化质心
        for (let i = 0; i < k; i++) {
          const idx = Math.floor(Math.random() * n) * 3
          centroids[i * 3] = data[idx]
          centroids[i * 3 + 1] = data[idx + 1]
          centroids[i * 3 + 2] = data[idx + 2]
        }
        
        for (let iter = 0; iter < max_iter; iter++) {
          // 分配点到最近的质心
          for (let i = 0; i < n; i++) {
            let minDist = Infinity
            let minIdx = 0
            
            for (let j = 0; j < k; j++) {
              const dx = data[i * 3] - centroids[j * 3]
              const dy = data[i * 3 + 1] - centroids[j * 3 + 1]
              const dz = data[i * 3 + 2] - centroids[j * 3 + 2]
              const dist = dx * dx + dy * dy + dz * dz
              
              if (dist < minDist) {
                minDist = dist
                minIdx = j
              }
            }
            
            assignments[i] = minIdx
          }
          
          // 更新质心
          const counts = new Float32Array(k)
          centroids.fill(0)
          
          for (let i = 0; i < n; i++) {
            const cluster = assignments[i]
            centroids[cluster * 3] += data[i * 3]
            centroids[cluster * 3 + 1] += data[i * 3 + 1]
            centroids[cluster * 3 + 2] += data[i * 3 + 2]
            counts[cluster]++
          }
          
          for (let i = 0; i < k; i++) {
            if (counts[i] > 0) {
              centroids[i * 3] /= counts[i]
              centroids[i * 3 + 1] /= counts[i]
              centroids[i * 3 + 2] /= counts[i]
            }
          }
        }
        
        return centroids
      },

      neural_network_forward: (input: Float32Array, weights: Float32Array): Float32Array => {
        // 简化的前向传播
        const inputSize = 3
        const hiddenSize = 4
        const outputSize = 1
        
        // 隐藏层
        const hidden = new Float32Array(hiddenSize)
        for (let i = 0; i < hiddenSize; i++) {
          let sum = 0
          for (let j = 0; j < inputSize; j++) {
            sum += input[j] * weights[i * inputSize + j]
          }
          hidden[i] = Math.max(0, sum) // ReLU
        }
        
        // 输出层
        const output = new Float32Array(outputSize)
        for (let i = 0; i < outputSize; i++) {
          let sum = 0
          for (let j = 0; j < hiddenSize; j++) {
            sum += hidden[j] * weights[inputSize * hiddenSize + i * hiddenSize + j]
          }
          output[i] = 1 / (1 + Math.exp(-sum)) // Sigmoid
        }
        
        return output
      },

      allocate: (_size: number): number => {
        // 简化的内存分配（JavaScript 中不需要）
        return 0
      },

      deallocate: (_ptr: number): void => {
        // 简化的内存释放（JavaScript 中不需要）
      },

      memory: new WebAssembly.Memory({ initial: 256 }),
    }
  }

  /**
   * 获取导出的函数
   */
  getExports(): WasmColorModule {
    if (!this.exports) {
      throw new Error('WASM module not loaded')
    }
    return this.exports
  }

  /**
   * 检查是否已加载
   */
  isReady(): boolean {
    return this.isLoaded
  }

  /**
   * 卸载模块
   */
  unload(): void {
    this.module = null
    this.instance = null
    this.exports = null
    this.isLoaded = false
    this.loadPromise = null
  }
}

/**
 * 全局 WASM 加载器实例
 */
let globalWasmLoader: WasmLoader | null = null

/**
 * 获取全局 WASM 加载器
 */
export function getWasmLoader(): WasmLoader {
  if (!globalWasmLoader) {
    globalWasmLoader = new WasmLoader()
  }
  return globalWasmLoader
}

/**
 * 加载 WASM 模块
 */
export async function loadWasm(config?: WasmConfig): Promise<WasmColorModule> {
  const loader = config ? new WasmLoader(config) : getWasmLoader()
  await loader.load()
  return loader.getExports()
}

/**
 * WASM 加速的颜色转换
 */
export class WasmColorConverter {
  private wasm: WasmColorModule | null = null

  async init(): Promise<void> {
    this.wasm = await loadWasm()
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!this.wasm) return null
    
    const hexNum = parseInt(hex.slice(1), 16)
    const rgb = this.wasm.hex_to_rgb(hexNum)
    
    return {
      r: rgb[0],
      g: rgb[1],
      b: rgb[2],
    }
  }

  rgbToHex(r: number, g: number, b: number): string {
    if (!this.wasm) return '#000000'
    
    const hex = this.wasm.rgb_to_hex(r, g, b)
    return '#' + hex.toString(16).padStart(6, '0')
  }

  batchConvert(colors: string[]): Array<{ r: number; g: number; b: number }> {
    if (!this.wasm) return []
    
    const hexArray = new Uint32Array(colors.map(c => parseInt(c.slice(1), 16)))
    const rgbArray = this.wasm.batch_convert_hex_to_rgb(hexArray)
    
    const result: Array<{ r: number; g: number; b: number }> = []
    for (let i = 0; i < colors.length; i++) {
      result.push({
        r: rgbArray[i * 3],
        g: rgbArray[i * 3 + 1],
        b: rgbArray[i * 3 + 2],
      })
    }
    
    return result
  }
}
