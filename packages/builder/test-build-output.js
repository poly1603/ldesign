/**
 * 测试打包输出的功能验证脚本
 */

import fs from 'fs'
import path from 'path'

async function testBuildOutput() {
  console.log('🧪 测试打包输出功能验证\n')

  // 测试 Rollup 输出
  console.log('📦 测试 Rollup 输出...')
  await testOutput('dist-rollup', 'Rollup')

  console.log('\n📦 测试 Rolldown 输出...')
  await testOutput('dist-rolldown', 'Rolldown')
}

async function testOutput(distDir, bundlerName) {
  try {
    // 检查文件是否存在
    const files = ['index.js', 'index.cjs']
    const missingFiles = []
    
    for (const file of files) {
      const filePath = path.join(distDir, file)
      if (!fs.existsSync(filePath)) {
        missingFiles.push(file)
      }
    }
    
    if (missingFiles.length > 0) {
      console.error(`❌ ${bundlerName} 缺少文件: ${missingFiles.join(', ')}`)
      return
    }
    
    console.log(`✅ ${bundlerName} 所有必要文件存在`)

    // 测试 ESM 导入
    try {
      const esmPath = path.resolve(distDir, 'index.js')
      const esmModule = await import(`file://${esmPath}`)
      
      // 检查主要导出
      const expectedExports = [
        'LibraryBuilder',
        'ConfigManager', 
        'StrategyManager',
        'PluginManager',
        'LibraryDetector',
        'RollupAdapter',
        'RolldownAdapter',
        'defineConfig',
        'createBuilder'
      ]
      
      const missingExports = []
      for (const exportName of expectedExports) {
        if (!(exportName in esmModule)) {
          missingExports.push(exportName)
        }
      }
      
      if (missingExports.length > 0) {
        console.warn(`⚠️  ${bundlerName} ESM 缺少导出: ${missingExports.join(', ')}`)
      } else {
        console.log(`✅ ${bundlerName} ESM 导出完整`)
      }
      
      // 测试主要类的实例化
      try {
        const { LibraryBuilder, ConfigManager } = esmModule
        
        if (typeof LibraryBuilder === 'function') {
          console.log(`✅ ${bundlerName} LibraryBuilder 可实例化`)
        } else {
          console.warn(`⚠️  ${bundlerName} LibraryBuilder 不是构造函数`)
        }
        
        if (typeof ConfigManager === 'function') {
          console.log(`✅ ${bundlerName} ConfigManager 可实例化`)
        } else {
          console.warn(`⚠️  ${bundlerName} ConfigManager 不是构造函数`)
        }
        
      } catch (error) {
        console.error(`❌ ${bundlerName} 类实例化失败:`, error.message)
      }
      
    } catch (error) {
      console.error(`❌ ${bundlerName} ESM 导入失败:`, error.message)
    }

    // 测试 CJS 导入 (在 Node.js 中)
    try {
      // 由于我们在 ES 模块中，我们需要使用 createRequire 来测试 CJS
      const { createRequire } = await import('module')
      const require = createRequire(import.meta.url)
      
      const cjsPath = path.resolve(distDir, 'index.cjs')
      
      // 清除 require 缓存
      delete require.cache[cjsPath]
      
      const cjsModule = require(cjsPath)
      
      // 检查主要导出
      const expectedExports = [
        'LibraryBuilder',
        'ConfigManager', 
        'StrategyManager',
        'PluginManager',
        'LibraryDetector',
        'RollupAdapter',
        'RolldownAdapter',
        'defineConfig',
        'createBuilder'
      ]
      
      const missingExports = []
      for (const exportName of expectedExports) {
        if (!(exportName in cjsModule)) {
          missingExports.push(exportName)
        }
      }
      
      if (missingExports.length > 0) {
        console.warn(`⚠️  ${bundlerName} CJS 缺少导出: ${missingExports.join(', ')}`)
      } else {
        console.log(`✅ ${bundlerName} CJS 导出完整`)
      }
      
    } catch (error) {
      console.error(`❌ ${bundlerName} CJS 导入失败:`, error.message)
    }

    // 检查文件大小合理性
    const indexJsPath = path.join(distDir, 'index.js')
    const indexCjsPath = path.join(distDir, 'index.cjs')
    
    const jsSize = fs.statSync(indexJsPath).size
    const cjsSize = fs.statSync(indexCjsPath).size
    
    // 检查文件不是空的且不是太大
    if (jsSize < 1000) {
      console.warn(`⚠️  ${bundlerName} index.js 文件太小 (${jsSize} bytes)`)
    } else if (jsSize > 10 * 1024 * 1024) {
      console.warn(`⚠️  ${bundlerName} index.js 文件太大 (${jsSize} bytes)`)
    } else {
      console.log(`✅ ${bundlerName} 文件大小合理`)
    }

  } catch (error) {
    console.error(`❌ ${bundlerName} 测试失败:`, error.message)
  }
}

testBuildOutput().catch(console.error)
