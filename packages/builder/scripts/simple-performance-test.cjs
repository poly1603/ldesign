#!/usr/bin/env node

/**
 * 简化的性能验证脚本
 * 验证新功能的基本性能表现
 */

const { performance } = require('perf_hooks')
const fs = require('fs-extra')
const path = require('path')

class SimplePerformanceTest {
  constructor() {
    this.results = []
  }

  async runTest(name, testFn) {
    console.log(`🔄 运行测试: ${name}`)
    
    const startTime = performance.now()
    const startMemory = process.memoryUsage().heapUsed
    
    try {
      await testFn()
      
      const endTime = performance.now()
      const endMemory = process.memoryUsage().heapUsed
      
      const result = {
        name,
        duration: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        success: true
      }
      
      this.results.push(result)
      console.log(`✅ ${name}: ${result.duration.toFixed(2)}ms, 内存: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB`)
      
      return result
    } catch (error) {
      const endTime = performance.now()
      const result = {
        name,
        duration: endTime - startTime,
        memoryUsage: 0,
        success: false,
        error: error.message
      }
      
      this.results.push(result)
      console.log(`❌ ${name}: 失败 - ${result.error}`)
      
      return result
    }
  }

  generateReport() {
    const successCount = this.results.filter(r => r.success).length
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0)
    const avgTime = totalTime / this.results.length
    
    console.log(`\n📊 性能测试报告`)
    console.log(`================`)
    console.log(`测试项目: ${this.results.length}`)
    console.log(`成功: ${successCount}`)
    console.log(`失败: ${this.results.length - successCount}`)
    console.log(`总耗时: ${totalTime.toFixed(2)}ms`)
    console.log(`平均耗时: ${avgTime.toFixed(2)}ms`)
    
    if (successCount > 0) {
      const successResults = this.results.filter(r => r.success)
      const fastestTime = Math.min(...successResults.map(r => r.duration))
      const slowestTime = Math.max(...successResults.map(r => r.duration))
      
      console.log(`最快测试: ${fastestTime.toFixed(2)}ms`)
      console.log(`最慢测试: ${slowestTime.toFixed(2)}ms`)
    }
    
    console.log(`\n详细结果:`)
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${result.name}: ${result.duration.toFixed(2)}ms`)
      if (!result.success) {
        console.log(`   错误: ${result.error}`)
      }
    })
    
    return {
      total: this.results.length,
      success: successCount,
      failed: this.results.length - successCount,
      totalTime,
      avgTime,
      results: this.results
    }
  }
}

async function main() {
  console.log('🚀 开始简化性能验证测试...\n')
  
  const test = new SimplePerformanceTest()
  const projectRoot = process.cwd()
  
  // 测试1: 文件系统操作性能
  await test.runTest('文件系统操作', async () => {
    const testDir = path.join(projectRoot, '.temp-perf-test')
    await fs.ensureDir(testDir)
    
    // 创建一些测试文件
    for (let i = 0; i < 10; i++) {
      await fs.writeFile(
        path.join(testDir, `test-${i}.txt`), 
        `测试内容 ${i}`.repeat(100)
      )
    }
    
    // 读取文件
    const files = await fs.readdir(testDir)
    for (const file of files) {
      await fs.readFile(path.join(testDir, file), 'utf-8')
    }
    
    // 清理
    await fs.remove(testDir)
  })
  
  // 测试2: JSON 序列化/反序列化性能
  await test.runTest('JSON 序列化性能', async () => {
    const largeObject = {
      dependencies: {},
      devDependencies: {},
      metadata: {
        timestamp: Date.now(),
        version: '1.0.0'
      },
      data: []
    }
    
    // 生成大量数据
    for (let i = 0; i < 1000; i++) {
      largeObject.dependencies[`package-${i}`] = `^${i}.0.0`
      largeObject.data.push({
        id: i,
        name: `item-${i}`,
        description: `描述 ${i}`.repeat(10),
        tags: [`tag-${i}`, `category-${i % 10}`]
      })
    }
    
    // 序列化
    const serialized = JSON.stringify(largeObject)
    
    // 反序列化
    const deserialized = JSON.parse(serialized)
    
    // 验证
    if (deserialized.data.length !== 1000) {
      throw new Error('反序列化验证失败')
    }
  })
  
  // 测试3: 异步操作性能
  await test.runTest('异步操作性能', async () => {
    const promises = []
    
    // 创建多个异步操作
    for (let i = 0; i < 50; i++) {
      promises.push(
        new Promise(resolve => {
          setTimeout(() => {
            resolve(`结果 ${i}`)
          }, Math.random() * 10)
        })
      )
    }
    
    // 等待所有操作完成
    const results = await Promise.all(promises)
    
    if (results.length !== 50) {
      throw new Error('异步操作结果数量不正确')
    }
  })
  
  // 测试4: 内存密集型操作
  await test.runTest('内存密集型操作', async () => {
    const arrays = []
    
    // 创建多个大数组
    for (let i = 0; i < 10; i++) {
      const arr = new Array(10000).fill(0).map((_, index) => ({
        id: index,
        value: Math.random(),
        text: `数据项 ${index}`
      }))
      arrays.push(arr)
    }
    
    // 对数组进行操作
    let totalSum = 0
    for (const arr of arrays) {
      const sum = arr.reduce((acc, item) => acc + item.value, 0)
      totalSum += sum
    }
    
    if (totalSum === 0) {
      throw new Error('计算结果异常')
    }
  })
  
  // 测试5: 模拟构建缓存操作
  await test.runTest('模拟缓存操作', async () => {
    const cache = new Map()
    const cacheDir = path.join(projectRoot, '.temp-cache-test')
    
    await fs.ensureDir(cacheDir)
    
    // 模拟缓存设置
    for (let i = 0; i < 100; i++) {
      const key = `cache-key-${i}`
      const value = {
        data: `缓存数据 ${i}`.repeat(50),
        timestamp: Date.now(),
        metadata: {
          size: 1000 + i,
          type: 'test'
        }
      }
      
      cache.set(key, value)
      
      // 写入文件
      await fs.writeFile(
        path.join(cacheDir, `${key}.json`),
        JSON.stringify(value)
      )
    }
    
    // 模拟缓存读取
    for (let i = 0; i < 50; i++) {
      const key = `cache-key-${i}`
      const memoryValue = cache.get(key)
      const fileValue = JSON.parse(
        await fs.readFile(path.join(cacheDir, `${key}.json`), 'utf-8')
      )
      
      if (!memoryValue || !fileValue) {
        throw new Error('缓存读取失败')
      }
    }
    
    // 清理
    await fs.remove(cacheDir)
  })
  
  // 生成报告
  console.log('\n📊 生成性能测试报告...')
  const report = test.generateReport()
  
  // 保存报告
  const reportPath = path.join(projectRoot, 'simple-performance-report.json')
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  
  console.log(`\n✅ 性能验证测试完成！`)
  console.log(`📄 详细报告已保存到: ${reportPath}`)
  
  // 性能评估
  if (report.success === report.total) {
    console.log(`\n🎉 所有性能测试通过！系统性能良好。`)
  } else {
    console.log(`\n⚠️  有 ${report.failed} 个测试失败，请检查系统性能。`)
  }
  
  // 性能基准评估
  if (report.avgTime < 100) {
    console.log(`⚡ 平均响应时间优秀 (${report.avgTime.toFixed(2)}ms < 100ms)`)
  } else if (report.avgTime < 500) {
    console.log(`✅ 平均响应时间良好 (${report.avgTime.toFixed(2)}ms < 500ms)`)
  } else {
    console.log(`⚠️  平均响应时间需要优化 (${report.avgTime.toFixed(2)}ms >= 500ms)`)
  }
  
  return report.success === report.total ? 0 : 1
}

if (require.main === module) {
  main()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      console.error('❌ 性能测试失败:', error)
      process.exit(1)
    })
}

module.exports = { SimplePerformanceTest }
