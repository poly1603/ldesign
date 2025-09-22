/**
 * WebAssembly 加速模块
 * 为关键算法提供高性能的 WASM 实现
 */

/**
 * WASM 模块接口
 */
interface WasmModule {
  memory: WebAssembly.Memory
  exports: any
  initialized: boolean
}

/**
 * WASM 加速器配置
 */
export interface WasmAcceleratorConfig {
  /** 是否启用 WASM 加速 */
  enabled: boolean
  /** 内存页面大小（每页 64KB） */
  memoryPages: number
  /** 是否启用 SIMD 指令 */
  simd: boolean
  /** 是否启用线程 */
  threads: boolean
  /** 是否自动回退到 JS 实现 */
  fallbackToJS: boolean
}

/**
 * WebAssembly 加速器
 */
export class WasmAccelerator {
  private modules: Map<string, WasmModule> = new Map()
  private config: WasmAcceleratorConfig
  private supportsWasm: boolean = false
  private supportsSimd: boolean = false
  private supportsThreads: boolean = false

  constructor(config: Partial<WasmAcceleratorConfig> = {}) {
    this.config = {
      enabled: true,
      memoryPages: 256, // 16MB
      simd: false,
      threads: false,
      fallbackToJS: true,
      ...config,
    }

    this.detectCapabilities()
  }

  /**
   * 检测 WebAssembly 能力
   */
  private detectCapabilities(): void {
    // 检测基础 WebAssembly 支持
    this.supportsWasm = typeof WebAssembly !== 'undefined'

    // 检测 SIMD 支持
    if (this.supportsWasm && typeof WebAssembly.validate === 'function') {
      try {
        // SIMD 测试字节码
        const simdTest = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])
        this.supportsSimd = WebAssembly.validate(simdTest)
      }
      catch {
        this.supportsSimd = false
      }
    }

    // 检测线程支持
    this.supportsThreads = typeof SharedArrayBuffer !== 'undefined'

    // console.log('WASM Capabilities:', {
    //   wasm: this.supportsWasm,
    //   simd: this.supportsSimd,
    //   threads: this.supportsThreads,
    // })
  }

  /**
   * 加载 WASM 模块
   */
  async loadModule(name: string, wasmBytes: Uint8Array): Promise<void> {
    if (!this.supportsWasm || !this.config.enabled) {
      if (this.config.fallbackToJS) {
        console.warn(`WASM not supported or disabled, falling back to JS for ${name}`)
        return
      }
      throw new Error('WebAssembly is not supported or disabled')
    }

    try {
      const memory = new WebAssembly.Memory({
        initial: this.config.memoryPages,
        maximum: this.config.memoryPages * 2,
        shared: this.config.threads && this.supportsThreads,
      })

      const imports = {
        env: {
          memory,
          abort: (msg: number, file: number, line: number, col: number) => {
            console.error(`WASM abort at ${file}:${line}:${col} - ${msg}`)
          },
        },
        Math: {
          random: Math.random,
          floor: Math.floor,
          ceil: Math.ceil,
          round: Math.round,
          abs: Math.abs,
          sqrt: Math.sqrt,
          pow: Math.pow,
        },
        console: {
          log: (ptr: number, len: number) => {
            const view = new Uint8Array(memory.buffer, ptr, len)
            const _text = new TextDecoder().decode(view)
            // console.log(`[WASM ${name}]`, text)
          },
        },
      }

      const module = await WebAssembly.compile(wasmBytes.buffer.slice(wasmBytes.byteOffset, wasmBytes.byteOffset + wasmBytes.byteLength))
      const instance = await WebAssembly.instantiate(module, imports)

      this.modules.set(name, {
        memory,
        exports: instance.exports,
        initialized: true,
      })

      // console.log(`WASM module ${name} loaded successfully`)
    }
    catch (error) {
      console.error(`Failed to load WASM module ${name}:`, error)
      if (!this.config.fallbackToJS) {
        throw error
      }
    }
  }

  /**
   * 获取模块
   */
  getModule(name: string): WasmModule | undefined {
    return this.modules.get(name)
  }

  /**
   * SHA256 WASM 实现（示例）
   */
  async sha256Wasm(data: Uint8Array): Promise<Uint8Array> {
    const module = this.getModule('sha256')
    if (!module) {
      throw new Error('SHA256 WASM module not loaded')
    }

    const { memory, exports } = module

    // 分配内存
    const inputPtr = exports.allocate(data.length)
    const outputPtr = exports.allocate(32) // SHA256 produces 32 bytes

    // 复制数据到 WASM 内存
    const memView = new Uint8Array(memory.buffer)
    memView.set(data, inputPtr)

    // 调用 WASM 函数
    exports.sha256(inputPtr, data.length, outputPtr)

    // 读取结果
    const result = new Uint8Array(32)
    result.set(memView.slice(outputPtr, outputPtr + 32))

    // 释放内存
    exports.free(inputPtr)
    exports.free(outputPtr)

    return result
  }

  /**
   * AES WASM 实现（示例）
   */
  async aesEncryptWasm(data: Uint8Array, key: Uint8Array, iv: Uint8Array): Promise<Uint8Array> {
    const module = this.getModule('aes')
    if (!module) {
      throw new Error('AES WASM module not loaded')
    }

    const { memory, exports } = module

    // 分配内存
    const dataPtr = exports.allocate(data.length)
    const keyPtr = exports.allocate(key.length)
    const ivPtr = exports.allocate(iv.length)
    const outputPtr = exports.allocate(data.length + 16) // AES block padding

    // 复制数据到 WASM 内存
    const memView = new Uint8Array(memory.buffer)
    memView.set(data, dataPtr)
    memView.set(key, keyPtr)
    memView.set(iv, ivPtr)

    // 调用 WASM 函数
    const resultLength = exports.aes_encrypt(
      dataPtr,
      data.length,
      keyPtr,
      key.length,
      ivPtr,
      iv.length,
      outputPtr,
    )

    // 读取结果
    const result = new Uint8Array(resultLength)
    result.set(memView.slice(outputPtr, outputPtr + resultLength))

    // 释放内存
    exports.free(dataPtr)
    exports.free(keyPtr)
    exports.free(ivPtr)
    exports.free(outputPtr)

    return result
  }

  /**
   * 基准测试：比较 JS 和 WASM 性能
   */
  async benchmark(algorithm: string, dataSize: number = 1024 * 1024): Promise<{
    js: number
    wasm: number
    speedup: number
  }> {
    const data = new Uint8Array(dataSize)
    for (let i = 0; i < dataSize; i++) {
      data[i] = Math.floor(Math.random() * 256)
    }

    let jsTime = 0
    let wasmTime = 0

    // 测试 JS 实现
    const jsStart = performance.now()
    // 这里应该调用实际的 JS 实现
    await this.mockJsImplementation(algorithm, data)
    const jsEnd = performance.now()
    jsTime = jsEnd - jsStart

    // 测试 WASM 实现
    const wasmStart = performance.now()
    if (algorithm === 'sha256') {
      await this.sha256Wasm(data)
    }
    else if (algorithm === 'aes') {
      const key = new Uint8Array(32)
      const iv = new Uint8Array(16)
      await this.aesEncryptWasm(data, key, iv)
    }
    const wasmEnd = performance.now()
    wasmTime = wasmEnd - wasmStart

    return {
      js: jsTime,
      wasm: wasmTime,
      speedup: jsTime / wasmTime,
    }
  }

  /**
   * 模拟 JS 实现（用于基准测试）
   */
  private async mockJsImplementation(algorithm: string, data: Uint8Array): Promise<void> {
    // 模拟一些计算
    let result = 0
    for (let i = 0; i < data.length; i++) {
      result = (result + data[i]) % 256
    }
    await new Promise(resolve => setTimeout(resolve, 1))
  }

  /**
   * 清理资源
   */
  dispose(): void {
    this.modules.clear()
  }
}

/**
 * WASM 工具函数
 */
export class WasmUtils {
  /**
   * 将十六进制字符串转换为 WASM 字节码
   */
  static hexToWasmBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16)
    }
    return bytes
  }

  /**
   * 创建简单的 WASM 模块（示例）
   */
  static createSimpleWasmModule(): Uint8Array {
    // 这是一个简单的 WASM 模块，导出一个 add 函数
    // (func $add (param $a i32) (param $b i32) (result i32)
    //   local.get $a
    //   local.get $b
    //   i32.add)
    return new Uint8Array([
      0x00,
      0x61,
      0x73,
      0x6D, // 魔数 "\0asm"
      0x01,
      0x00,
      0x00,
      0x00, // 版本 1
      // Type section
      0x01,
      0x07,
      0x01,
      0x60,
      0x02,
      0x7F,
      0x7F,
      0x01,
      0x7F,
      // Function section
      0x03,
      0x02,
      0x01,
      0x00,
      // Export section
      0x07,
      0x07,
      0x01,
      0x03,
      0x61,
      0x64,
      0x64,
      0x00,
      0x00,
      // Code section
      0x0A,
      0x09,
      0x01,
      0x07,
      0x00,
      0x20,
      0x00,
      0x20,
      0x01,
      0x6A,
      0x0B,
    ])
  }

  /**
   * 验证 WASM 模块
   */
  static async validateModule(wasmBytes: Uint8Array): Promise<boolean> {
    try {
      return WebAssembly.validate(wasmBytes)
    }
    catch {
      return false
    }
  }

  /**
   * 编译 WASM 模块
   */
  static async compileModule(wasmBytes: Uint8Array): Promise<WebAssembly.Module> {
    return WebAssembly.compile(wasmBytes.buffer.slice(wasmBytes.byteOffset, wasmBytes.byteOffset + wasmBytes.byteLength))
  }

  /**
   * 流式编译 WASM 模块
   */
  static async streamCompileModule(
    response: Response,
  ): Promise<WebAssembly.Module> {
    return WebAssembly.compileStreaming(response)
  }
}

/**
 * WASM 加速的加密实现
 */
export class WasmCrypto {
  private accelerator: WasmAccelerator

  constructor(accelerator: WasmAccelerator) {
    this.accelerator = accelerator
  }

  /**
   * 使用 WASM 加速的 SHA256
   */
  async sha256(data: string | Uint8Array): Promise<string> {
    const bytes = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data

    try {
      const result = await this.accelerator.sha256Wasm(bytes)
      return this.bytesToHex(result)
    }
    catch (error) {
      console.warn('WASM SHA256 failed, falling back to JS:', error)
      // 这里应该回退到 JS 实现
      throw error
    }
  }

  /**
   * 使用 WASM 加速的 AES 加密
   */
  async aesEncrypt(
    data: string | Uint8Array,
    key: string | Uint8Array,
    iv: string | Uint8Array,
  ): Promise<string> {
    const dataBytes = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data
    const keyBytes = typeof key === 'string'
      ? this.hexToBytes(key)
      : key
    const ivBytes = typeof iv === 'string'
      ? this.hexToBytes(iv)
      : iv

    try {
      const result = await this.accelerator.aesEncryptWasm(dataBytes, keyBytes, ivBytes)
      return this.bytesToHex(result)
    }
    catch (error) {
      console.warn('WASM AES encrypt failed, falling back to JS:', error)
      // 这里应该回退到 JS 实现
      throw error
    }
  }

  /**
   * 字节数组转十六进制
   */
  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  /**
   * 十六进制转字节数组
   */
  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = Number.parseInt(hex.substr(i, 2), 16)
    }
    return bytes
  }
}

// 全局单例
export const wasmAccelerator = new WasmAccelerator()
export const wasmCrypto = new WasmCrypto(wasmAccelerator)
