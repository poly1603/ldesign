#!/usr/bin/env node

/**
 * 使用 @ldesign/builder 构建 shared 库
 */

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { LibraryBuilder, analyze } from '@ldesign/builder'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 项目根目录
const rootDir = resolve(__dirname, '..')

console.log('\x1b[34m\x1b[1m🚀 Building @ldesign/shared with LDesign Builder\x1b[0m')
console.log('==========================================\n')

async function buildShared() {
  try {
    // 1. 分析项目
    console.log('\x1b[36m📊 Analyzing project...\x1b[0m')
    const analysis = await analyze(rootDir)
    
    console.log('\x1b[32m✓ Analysis completed\x1b[0m')
    console.log('  Project Type:', '\x1b[33m' + analysis.projectType + '\x1b[0m')
    console.log('  Has TypeScript:', analysis.hasTypeScript ? '\x1b[32mYes\x1b[0m' : '\x1b[31mNo\x1b[0m')
    console.log('  Has Vue:', analysis.hasVue ? '\x1b[32mYes\x1b[0m' : '\x1b[31mNo\x1b[0m')
    console.log('  Has TSX:', analysis.hasTsx ? '\x1b[32mYes\x1b[0m' : '\x1b[31mNo\x1b[0m')
    console.log('  Has Less:', analysis.hasLess ? '\x1b[32mYes\x1b[0m' : '\x1b[31mNo\x1b[0m')
    console.log('  Entry file:', '\x1b[34m' + (analysis.entry || 'Not detected') + '\x1b[0m')
    console.log('  Package name:', '\x1b[34m' + (analysis.packageName || 'Unknown') + '\x1b[0m')
    
    console.log('\n  📁 File Statistics:')
    console.log(`    TypeScript: ${analysis.fileStats.typescript.length} files`)
    console.log(`    TSX: ${analysis.fileStats.tsx.length} files`)
    console.log(`    Vue: ${analysis.fileStats.vue.length} files`)
    console.log(`    Less: ${analysis.fileStats.less.length} files`)
    console.log(`    CSS: ${analysis.fileStats.css.length} files`)

    // 2. 创建构建器
    console.log('\x1b[36m\n📦 Creating builder...\x1b[0m')
    
    const builder = new LibraryBuilder({
      rootDir,
      srcDir: 'src',
      entry: 'src/index-basic.ts', // 使用 shared 库的主入口
      output: {
        cjs: 'cjs',      // CommonJS 输出到 cjs 目录
        es: 'es',        // ES 模块输出到 es 目录
        umd: 'dist'      // UMD 输出到 dist 目录
      },
      name: 'LDesignShared', // UMD 全局变量名
      // 外部依赖 - Vue 作为 peer dependency
      external: ['vue', 'lodash-es', 'raf'],
      globals: {
        vue: 'Vue',
        'lodash-es': 'lodash',
        raf: 'raf'
      },
      minify: false,        // 暂时禁用压缩以避免问题
      sourcemap: false,     // 暂时禁用 source map
      dts: true,            // 生成 TypeScript 声明
      extractCss: true,     // 提取样式
      clean: true,          // 清理输出目录
      validate: true,       // 验证构建产物
      validatorConfig: {
        checkDts: true,
        checkStyles: true,
        checkSourceMaps: false, // 由于禁用了 sourcemap
        maxFileSize: 10 * 1024 * 1024,     // 10MB 单文件限制
        maxTotalSize: 100 * 1024 * 1024    // 100MB 总大小限制
      },
      // 传统 TypeScript 库预设而不是 Vue3 组件库，以避免复杂的 Vue 插件问题
      // 使用自定义外部函数强制项目类型
      external: (id) => {
        // Vue 相关的库作为外部依赖
        if (id === 'vue' || id.startsWith('@vue/') || id.startsWith('vue/')) return true
        // lodash 和 raf
        if (id === 'lodash-es' || id === 'raf') return true
        // 所有 node_modules 中的包
        if (id.includes('node_modules')) return true
        return false
      }
    })

    // 3. 执行构建
    console.log('\x1b[36m\n🔨 Building library...\x1b[0m')
    const startTime = Date.now()
    
    const result = await builder.build()
    
    // 4. 显示构建结果
    console.log('\n==========================================')
    if (result.success) {
      const duration = Date.now() - startTime
      console.log('\x1b[32m\x1b[1m✅ BUILD SUCCESSFUL!\x1b[0m')
      console.log('\x1b[90m⏱️  Build completed in ' + duration + 'ms\x1b[0m')
      
      // 显示验证统计信息
      if (result.validation) {
        const stats = result.validation.stats
        console.log('\n📈 Build Statistics:')
        console.log(`  📁 Total Files: ${stats.totalFiles}`)
        console.log(`  📦 Total Size: ${formatSize(stats.totalSize)}`)
        console.log(`  🎯 Formats: ${Object.entries(stats.formats)
          .filter(([_, enabled]) => enabled)
          .map(([format]) => format.toUpperCase())
          .join(', ')}`)
        console.log(`  📝 TypeScript Declarations: ${stats.hasDts ? '\x1b[32mYes\x1b[0m' : '\x1b[31mNo\x1b[0m'}`)
        console.log(`  🎨 Styles: ${stats.hasStyles ? '\x1b[32mYes\x1b[0m' : '\x1b[31mNo\x1b[0m'}`)
        console.log(`  🗺️  Source Maps: ${stats.hasSourceMaps ? '\x1b[32mYes\x1b[0m' : '\x1b[31mNo\x1b[0m'}`)
        
        // 文件类型分布
        if (Object.keys(stats.filesByType).length > 0) {
          console.log('\n  📊 File Types:')
          Object.entries(stats.filesByType).forEach(([ext, count]) => {
            console.log(`    ${ext}: ${count} files`)
          })
        }
        
        // 显示警告
        if (result.validation.warnings.length > 0) {
          console.log('\x1b[33m\n⚠️  Warnings:\x1b[0m')
          result.validation.warnings.forEach((warning, i) => {
            console.log('\x1b[33m' + `  ${i + 1}. [${warning.type.toUpperCase()}] ${warning.message}` + '\x1b[0m')
            if (warning.file) {
              console.log('\x1b[90m' + `     File: ${warning.file}` + '\x1b[0m')
            }
          })
        }
        
        // 显示错误
        if (result.validation.errors.length > 0) {
          console.log('\x1b[31m\n❌ Validation Errors:\x1b[0m')
          result.validation.errors.forEach((error, i) => {
            console.log('\x1b[31m' + `  ${i + 1}. [${error.type.toUpperCase()}] ${error.message}` + '\x1b[0m')
            if (error.file) {
              console.log('\x1b[90m' + `     File: ${error.file}` + '\x1b[0m')
            }
          })
        }
      }
      
      console.log('\x1b[32m\n✨ Shared library built successfully!\x1b[0m')
      console.log('\x1b[90mOutput directories:\x1b[0m')
      console.log('\x1b[90m  - ./cjs/    (CommonJS)\x1b[0m')
      console.log('\x1b[90m  - ./es/     (ES Modules)\x1b[0m')
      console.log('\x1b[90m  - ./dist/   (UMD Bundle)\x1b[0m')
      
    } else {
      console.log('\x1b[31m\x1b[1m❌ BUILD FAILED!\x1b[0m')
      
      if (result.errors.length > 0) {
        console.log('\x1b[31m\nBuild Errors:\x1b[0m')
        result.errors.forEach((error, i) => {
          console.log('\x1b[31m' + `  ${i + 1}. ${error.message}` + '\x1b[0m')
          if (error.stack) {
            console.log('\x1b[90m' + `     ${error.stack.split('\n')[1]?.trim()}` + '\x1b[0m')
          }
        })
      }
      
      process.exit(1)
    }
    
  } catch (error) {
    console.error('\x1b[31m\x1b[1m\n💥 Unexpected Error:\x1b[0m')
    console.error('\x1b[31m' + error.message + '\x1b[0m')
    if (error.stack) {
      console.error('\x1b[90m' + error.stack + '\x1b[0m')
    }
    process.exit(1)
  }
}

/**
 * 格式化文件大小
 */
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

// 执行构建
buildShared().catch(console.error)
