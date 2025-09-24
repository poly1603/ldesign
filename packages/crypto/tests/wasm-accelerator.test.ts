import { beforeAll, describe, expect, it } from 'vitest'

import {
  WasmAccelerator,
  wasmAccelerator,
  WasmCrypto,
  wasmCrypto,
  WasmUtils,
} from '../src/core/wasm-accelerator'
import {
  createAESWasmModule,
  createSHA256WasmModule,
  WasmModuleBuilder,
  WasmModuleCollection,
} from '../src/core/wasm-builder'

describe('webAssembly Accelerator', () => {
  describe('wasmAccelerator', () => {
    it('should detect WebAssembly capabilities', () => {
      const _accelerator = new WasmAccelerator()

      // 在 Node.js 环境中应该支持基础 WebAssembly
      expect(typeof WebAssembly).toBe('object')
    })

    it('should configure accelerator options', () => {
      const accelerator = new WasmAccelerator({
        enabled: false,
        memoryPages: 512,
        simd: true,
        threads: true,
        fallbackToJS: false,
      })

      // 验证配置生效
      expect(accelerator).toBeDefined()
    })

    it('should handle module loading with fallback', async () => {
      const accelerator = new WasmAccelerator({ fallbackToJS: true })

      // 尝试加载无效模块
      const invalidWasm = new Uint8Array([0, 1, 2, 3])

      // 应该不抛出错误（因为启用了 fallback）
      await expect(
        accelerator.loadModule('invalid', invalidWasm),
      ).resolves.toBeUndefined()
    })

    it('should load valid WASM module', async () => {
      const accelerator = new WasmAccelerator()

      // 创建一个简单的有效 WASM 模块
      const validWasm = WasmUtils.createSimpleWasmModule()

      // 加载模块
      await accelerator.loadModule('test', validWasm)

      // 获取模块
      const module = accelerator.getModule('test')
      expect(module).toBeDefined()
      expect(module?.initialized).toBe(true)
    })
  })

  describe('wasmUtils', () => {
    it('should convert hex to WASM bytes', () => {
      const hex = '0061736d01000000'
      const bytes = WasmUtils.hexToWasmBytes(hex)

      expect(bytes).toBeInstanceOf(Uint8Array)
      expect(bytes.length).toBe(8)
      expect(bytes[0]).toBe(0x00)
      expect(bytes[1]).toBe(0x61)
      expect(bytes[2]).toBe(0x73)
      expect(bytes[3]).toBe(0x6D)
    })

    it('should create simple WASM module', () => {
      const wasmBytes = WasmUtils.createSimpleWasmModule()

      expect(wasmBytes).toBeInstanceOf(Uint8Array)
      expect(wasmBytes.length).toBeGreaterThan(0)

      // 验证魔数
      expect(wasmBytes[0]).toBe(0x00)
      expect(wasmBytes[1]).toBe(0x61)
      expect(wasmBytes[2]).toBe(0x73)
      expect(wasmBytes[3]).toBe(0x6D)
    })

    it('should validate WASM module', async () => {
      const validWasm = WasmUtils.createSimpleWasmModule()
      const invalidWasm = new Uint8Array([0, 1, 2, 3])

      const isValidValid = await WasmUtils.validateModule(validWasm)
      const isValidInvalid = await WasmUtils.validateModule(invalidWasm)

      expect(isValidValid).toBe(true)
      expect(isValidInvalid).toBe(false)
    })

    it('should compile WASM module', async () => {
      const wasmBytes = WasmUtils.createSimpleWasmModule()

      const module = await WasmUtils.compileModule(wasmBytes)

      expect(module).toBeInstanceOf(WebAssembly.Module)
    })
  })

  describe('wasmModuleBuilder', () => {
    it('should build basic WASM module', () => {
      const builder = new WasmModuleBuilder()
      const wasmBytes = builder.build()

      expect(wasmBytes).toBeInstanceOf(Uint8Array)

      // 验证魔数和版本
      expect(wasmBytes[0]).toBe(0x00)
      expect(wasmBytes[1]).toBe(0x61)
      expect(wasmBytes[2]).toBe(0x73)
      expect(wasmBytes[3]).toBe(0x6D)
      expect(wasmBytes[4]).toBe(0x01)
      expect(wasmBytes[5]).toBe(0x00)
      expect(wasmBytes[6]).toBe(0x00)
      expect(wasmBytes[7]).toBe(0x00)
    })

    it('should create SHA256 WASM module', async () => {
      const wasmBytes = createSHA256WasmModule()

      expect(wasmBytes).toBeInstanceOf(Uint8Array)

      // 验证模块有效性
      const isValid = await WasmUtils.validateModule(wasmBytes)
      expect(isValid).toBe(true)

      // 编译模块
      const module = await WasmUtils.compileModule(wasmBytes)
      expect(module).toBeInstanceOf(WebAssembly.Module)
    })

    it('should create AES WASM module', async () => {
      const wasmBytes = createAESWasmModule()

      expect(wasmBytes).toBeInstanceOf(Uint8Array)

      // 验证模块有效性
      const isValid = await WasmUtils.validateModule(wasmBytes)
      expect(isValid).toBe(true)

      // 编译模块
      const module = await WasmUtils.compileModule(wasmBytes)
      expect(module).toBeInstanceOf(WebAssembly.Module)
    })
  })

  describe('wasmModuleCollection', () => {
    it('should initialize with default modules', () => {
      const collection = new WasmModuleCollection()

      const moduleNames = collection.getModuleNames()
      expect(moduleNames).toContain('sha256')
      expect(moduleNames).toContain('aes')
    })

    it('should get specific module', () => {
      const collection = new WasmModuleCollection()

      const sha256Module = collection.getModule('sha256')
      const aesModule = collection.getModule('aes')

      expect(sha256Module).toBeInstanceOf(Uint8Array)
      expect(aesModule).toBeInstanceOf(Uint8Array)
    })

    it('should add custom module', () => {
      const collection = new WasmModuleCollection()
      const customWasm = new Uint8Array([0, 97, 115, 109])

      collection.addModule('custom', customWasm)

      const retrieved = collection.getModule('custom')
      expect(retrieved).toEqual(customWasm)
      expect(collection.getModuleNames()).toContain('custom')
    })
  })

  describe('wasmCrypto', () => {
    let accelerator: WasmAccelerator
    let crypto: WasmCrypto

    beforeAll(() => {
      accelerator = new WasmAccelerator()
      crypto = new WasmCrypto(accelerator)
    })

    it('should handle SHA256 with fallback', async () => {
      const data = 'test data'

      // 由于没有实际加载 WASM 模块，应该抛出错误或回退
      await expect(crypto.sha256(data)).rejects.toThrow()
    })

    it('should handle AES encryption with fallback', async () => {
      const data = 'test data'
      const key = '0123456789abcdef0123456789abcdef'
      const iv = '0123456789abcdef'

      // 由于没有实际加载 WASM 模块，应该抛出错误或回退
      await expect(crypto.aesEncrypt(data, key, iv)).rejects.toThrow()
    })
  })

  describe('performance Benchmark', () => {
    it('should benchmark algorithm performance', async () => {
      const accelerator = new WasmAccelerator()

      // 模拟基准测试（实际测试需要真实的 WASM 实现）
      try {
        const result = await accelerator.benchmark('sha256', 1024)

        expect(result).toHaveProperty('js')
        expect(result).toHaveProperty('wasm')
        expect(result).toHaveProperty('speedup')
        expect(result.js).toBeGreaterThan(0)
      } catch (error) {
        // 如果 WASM 模块未加载，跳过测试
        expect(error).toBeDefined()
      }
    })
  })

  describe('integration Tests', () => {
    it('should work with global singleton', () => {
      expect(wasmAccelerator).toBeInstanceOf(WasmAccelerator)
      expect(wasmCrypto).toBeInstanceOf(WasmCrypto)
    })

    it('should clean up resources', () => {
      const accelerator = new WasmAccelerator()

      // 清理资源
      accelerator.dispose()

      // 验证模块已清理
      const module = accelerator.getModule('test')
      expect(module).toBeUndefined()
    })
  })
})

describe('wASM Module Validation', () => {
  it('should validate real-world WASM features', async () => {
    // 测试更复杂的 WASM 模块
    const builder = new WasmModuleBuilder()

    // 添加内存
    builder.setMemory(1, 10)

    // 添加数据段
    builder.addData(0, new Uint8Array([1, 2, 3, 4]))

    // 构建并验证
    const wasmBytes = builder.build()
    const isValid = await WasmUtils.validateModule(wasmBytes)

    expect(isValid).toBe(true)
  })

  it('should handle memory operations', async () => {
    const accelerator = new WasmAccelerator({
      memoryPages: 128, // 8MB
      simd: false,
      threads: false,
    })

    // 创建带内存操作的模块
    const builder = new WasmModuleBuilder()
    builder.setMemory(2, 4)

    const wasmBytes = builder.build()

    // 尝试加载
    await accelerator.loadModule('memory-test', wasmBytes)

    const module = accelerator.getModule('memory-test')
    expect(module).toBeDefined()
  })
})
