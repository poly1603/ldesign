#!/usr/bin/env node

/**
 * 测试 LibraryBuilder 打包功能
 * 使用 packages/shared 作为测试项目
 */

import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { LibraryBuilder, analyze } from './src/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 测试项目路径
const testProjectPath = resolve(__dirname, '../shared')

console.log('========================================')
console.log('🚀 LibraryBuilder Test')
console.log('========================================\n')

async function runTest() {
  try {
    // 1. 先分析项目
    console.log('📊 Analyzing project...')
    const analysis = await analyze(testProjectPath)
    
    console.log('\n📝 Analysis Result:')
    console.log('  Project Type:', analysis.projectType)
    console.log('  Has TypeScript:', analysis.hasTypeScript)
    console.log('  Has Vue:', analysis.hasVue)
    console.log('  Has Less:', analysis.hasLess)
    console.log('  Has TSX:', analysis.hasTsx)
    console.log('  Entry:', analysis.entry)
    console.log('  Package Name:', analysis.packageName)
    console.log('\n  File Statistics:')
    console.log('    TypeScript files:', analysis.fileStats.typescript.length)
    console.log('    JavaScript files:', analysis.fileStats.javascript.length)
    console.log('    Vue files:', analysis.fileStats.vue.length)
    console.log('    TSX files:', analysis.fileStats.tsx.length)
    console.log('    Less files:', analysis.fileStats.less.length)
    console.log('    CSS files:', analysis.fileStats.css.length)

    // 2. 构建项目
    console.log('\n========================================')
    console.log('📦 Building library...')
    console.log('========================================\n')

    const builder = new LibraryBuilder({
      rootDir: testProjectPath,
      srcDir: 'src',
      output: {
        cjs: 'lib',
        es: 'es',
        umd: 'dist'
      },
      name: 'LDesignShared',
      minify: true,
      sourcemap: true,
      dts: true,
      extractCss: true,
      clean: true,
      validate: true,
      // 暂时不使用 Kit builder，使用我们自己的实现
      useKitBuilder: false,
      validatorConfig: {
        checkDts: true,
        checkStyles: true,
        checkSourceMaps: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxTotalSize: 100 * 1024 * 1024 // 100MB
      }
    })

    const result = await builder.build()

    // 3. 显示结果
    console.log('\n========================================')
    console.log('📊 Build Result')
    console.log('========================================\n')

    if (result.success) {
      console.log('✅ Build SUCCESSFUL!')
      console.log(`⏱  Duration: ${result.duration}ms`)
      
      if (result.validation) {
        console.log('\n📈 Validation Stats:')
        console.log('  Total Files:', result.validation.stats.totalFiles)
        console.log('  Total Size:', formatSize(result.validation.stats.totalSize))
        console.log('  Formats:', Object.entries(result.validation.stats.formats)
          .filter(([_, v]) => v)
          .map(([k]) => k.toUpperCase())
          .join(', '))
        console.log('  Has TypeScript Declarations:', result.validation.stats.hasDts ? 'Yes' : 'No')
        console.log('  Has Styles:', result.validation.stats.hasStyles ? 'Yes' : 'No')
        console.log('  Has Source Maps:', result.validation.stats.hasSourceMaps ? 'Yes' : 'No')
        
        if (result.validation.warnings.length > 0) {
          console.log('\n⚠️  Warnings:')
          result.validation.warnings.forEach(warning => {
            console.log(`  - [${warning.type}] ${warning.message}`)
          })
        }
        
        if (result.validation.errors.length > 0) {
          console.log('\n❌ Errors:')
          result.validation.errors.forEach(error => {
            console.log(`  - [${error.type}] ${error.message}`)
          })
        }
      }
    } else {
      console.log('❌ Build FAILED!')
      if (result.errors.length > 0) {
        console.log('\nErrors:')
        result.errors.forEach(error => {
          console.log(`  - ${error.message}`)
          if (error.stack) {
            console.log('    Stack:', error.stack.split('\n')[1])
          }
        })
      }
    }

    console.log('\n========================================')
    console.log('✨ Test Complete!')
    console.log('========================================')

  } catch (error) {
    console.error('\n❌ Test Failed!')
    console.error(error)
    process.exit(1)
  }
}

function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

// 运行测试
runTest().catch(console.error)
