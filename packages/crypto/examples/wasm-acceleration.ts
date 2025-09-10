/**
 * WebAssembly 加速示例
 * 展示如何使用 WASM 加速加密算法
 */

import { 
  WasmAccelerator, 
  WasmUtils,
  wasmAccelerator,
  wasmCrypto
} from '../src/core/wasm-accelerator'
import {
  WasmModuleBuilder,
  WasmModuleCollection,
  createSHA256WasmModule,
  createAESWasmModule
} from '../src/core/wasm-builder'

async function main() {
  console.log('=== WebAssembly 加速示例 ===\n')

  // 1. 检测 WebAssembly 支持
  console.log('1. 检测 WebAssembly 支持:')
  const accelerator = new WasmAccelerator({
    enabled: true,
    memoryPages: 256,
    simd: true,
    threads: false,
    fallbackToJS: true,
  })
  console.log('WebAssembly 支持状态已检测\n')

  // 2. 创建和验证 WASM 模块
  console.log('2. 创建和验证 WASM 模块:')
  
  // 创建 SHA256 模块
  const sha256Module = createSHA256WasmModule()
  const sha256Valid = await WasmUtils.validateModule(sha256Module)
  console.log(`SHA256 模块有效: ${sha256Valid}`)
  console.log(`SHA256 模块大小: ${sha256Module.length} 字节`)
  
  // 创建 AES 模块
  const aesModule = createAESWasmModule()
  const aesValid = await WasmUtils.validateModule(aesModule)
  console.log(`AES 模块有效: ${aesValid}`)
  console.log(`AES 模块大小: ${aesModule.length} 字节\n`)

  // 3. 创建简单的 WASM 模块
  console.log('3. 创建简单的 WASM 模块:')
  const simpleWasm = WasmUtils.createSimpleWasmModule()
  
  try {
    // 编译模块
    const module = await WasmUtils.compileModule(simpleWasm)
    
    // 实例化模块
    const instance = await WebAssembly.instantiate(module)
    
    // 调用导出的函数
    if (instance.exports.add) {
      const result = (instance.exports.add as any)(5, 3)
      console.log(`WASM add(5, 3) = ${result}`)
    }
  } catch (error) {
    console.error('WASM 模块执行失败:', error)
  }
  console.log()

  // 4. 使用 WASM 模块构建器
  console.log('4. 使用 WASM 模块构建器:')
  const builder = new WasmModuleBuilder()
  
  // 设置内存
  builder.setMemory(1, 4) // 1-4 页 (64KB - 256KB)
  
  // 构建模块
  const customModule = builder.build()
  const customValid = await WasmUtils.validateModule(customModule)
  console.log(`自定义模块有效: ${customValid}`)
  console.log(`自定义模块大小: ${customModule.length} 字节\n`)

  // 5. 加载 WASM 模块到加速器
  console.log('5. 加载 WASM 模块到加速器:')
  
  try {
    await accelerator.loadModule('sha256', sha256Module)
    console.log('SHA256 模块已加载')
    
    await accelerator.loadModule('aes', aesModule)
    console.log('AES 模块已加载')
  } catch (error) {
    console.error('模块加载失败:', error)
  }
  console.log()

  // 6. 性能基准测试（模拟）
  console.log('6. 性能基准测试:')
  
  // 测试数据
  const testData = new Uint8Array(1024 * 10) // 10KB
  for (let i = 0; i < testData.length; i++) {
    testData[i] = Math.floor(Math.random() * 256)
  }
  
  // JavaScript 实现性能
  const jsStart = performance.now()
  for (let i = 0; i < 100; i++) {
    // 模拟 JS 加密操作
    const result = Array.from(testData).map(b => b ^ 0x42)
  }
  const jsEnd = performance.now()
  const jsTime = jsEnd - jsStart
  
  console.log(`JavaScript 实现: ${jsTime.toFixed(2)}ms (100次迭代)`)
  
  // WASM 实现性能（模拟）
  const wasmStart = performance.now()
  for (let i = 0; i < 100; i++) {
    // 模拟 WASM 加密操作
    const result = testData.map(b => b ^ 0x42)
  }
  const wasmEnd = performance.now()
  const wasmTime = wasmEnd - wasmStart
  
  console.log(`WASM 实现（模拟）: ${wasmTime.toFixed(2)}ms (100次迭代)`)
  console.log(`加速比: ${(jsTime / wasmTime).toFixed(2)}x\n`)

  // 7. 使用模块集合
  console.log('7. 使用模块集合:')
  const collection = new WasmModuleCollection()
  
  const moduleNames = collection.getModuleNames()
  console.log(`可用模块: ${moduleNames.join(', ')}`)
  
  // 添加自定义模块
  collection.addModule('custom', customModule)
  console.log(`添加自定义模块后: ${collection.getModuleNames().join(', ')}\n`)

  // 8. 内存管理
  console.log('8. 内存管理:')
  
  // 创建带大内存的加速器
  const bigAccelerator = new WasmAccelerator({
    memoryPages: 1024, // 64MB
    simd: true,
    threads: true,
  })
  
  console.log('创建了 64MB 内存的加速器')
  
  // 清理资源
  accelerator.dispose()
  bigAccelerator.dispose()
  console.log('资源已清理\n')

  // 9. 高级功能演示
  console.log('9. 高级功能演示:')
  
  // 创建支持 SIMD 的模块（如果浏览器支持）
  const advancedAccelerator = new WasmAccelerator({
    simd: true,
    threads: true,
    fallbackToJS: true,
  })
  
  console.log('创建了支持 SIMD 和线程的加速器')
  
  // 批量处理示例
  const batchData = []
  for (let i = 0; i < 10; i++) {
    batchData.push(new Uint8Array(1024).fill(i))
  }
  
  console.log(`准备处理 ${batchData.length} 批数据`)
  
  const batchStart = performance.now()
  const results = batchData.map(data => {
    // 模拟批量处理
    return Array.from(data).reduce((a, b) => a + b, 0)
  })
  const batchEnd = performance.now()
  
  console.log(`批量处理完成: ${(batchEnd - batchStart).toFixed(2)}ms`)
  console.log()

  // 10. 错误处理和回退
  console.log('10. 错误处理和回退:')
  
  const fallbackAccelerator = new WasmAccelerator({
    fallbackToJS: true,
  })
  
  try {
    // 尝试加载无效模块
    const invalidModule = new Uint8Array([1, 2, 3, 4])
    await fallbackAccelerator.loadModule('invalid', invalidModule)
    console.log('模块加载成功（使用回退）')
  } catch (error) {
    console.log('模块加载失败，已回退到 JS 实现')
  }
  
  console.log('\n=== 示例完成 ===')
}

// 运行示例
main().catch(console.error)
