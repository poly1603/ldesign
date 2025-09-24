#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1B[0m',
  bright: '\x1B[1m',
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 格式化文件大小
function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

// 分析文件内容
function analyzeFileContent(filePath) {
  if (!existsSync(filePath)) {
    return null
  }

  const content = readFileSync(filePath, 'utf8')
  const size = Buffer.byteLength(content, 'utf8')
  const gzipSize = gzipSync(content).length
  const compressionRatio = ((size - gzipSize) / size * 100).toFixed(1)

  // 分析导入导出
  const imports = content.match(/^import\s+.*$/gm) || []
  const exports = content.match(/^export\s+.*$/gm) || []
  const reExports = content.match(/^export\s+\{[^}]*\}\s+from\s+/gm) || []

  // 分析代码复杂度
  const functions = content.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || []
  const classes = content.match(/class\s+\w+/g) || []
  const interfaces = content.match(/interface\s+\w+/g) || []

  return {
    size,
    gzipSize,
    compressionRatio,
    imports: imports.length,
    exports: exports.length,
    reExports: reExports.length,
    functions: functions.length,
    classes: classes.length,
    interfaces: interfaces.length,
    content
  }
}

// 分析模块依赖
function analyzeDependencies(content) {
  const dependencies = new Set()
  const importMatches = content.match(/from\s+['"]([^'"]+)['"]/g) || []
  
  importMatches.forEach(match => {
    const dep = match.match(/from\s+['"]([^'"]+)['"]/)[1]
    if (!dep.startsWith('.')) {
      dependencies.add(dep)
    }
  })
  
  return Array.from(dependencies)
}

// 主分析函数
function analyzeBundleOptimization() {
  log('🔍 Bundle优化分析', 'cyan')
  log('=' .repeat(50), 'cyan')

  const files = {
    main: join(rootDir, 'src/index.ts'),
    core: join(rootDir, 'src/index-core.ts'),
    lib: join(rootDir, 'src/index-lib.ts'),
    esm: join(rootDir, 'es/index.js'),
    cjs: join(rootDir, 'lib/index.cjs'),
    umd: join(rootDir, 'dist/index.js')
  }

  const analysis = {}

  // 分析源文件
  log('\n📁 源文件分析:', 'yellow')
  Object.entries(files).forEach(([name, path]) => {
    const result = analyzeFileContent(path)
    if (result) {
      analysis[name] = result
      log(`  ${name}: ${formatSize(result.size)} (${formatSize(result.gzipSize)} gzipped, ${result.compressionRatio}% compression)`, 'green')
      log(`    导入: ${result.imports}, 导出: ${result.exports}, 重导出: ${result.reExports}`)
      log(`    函数: ${result.functions}, 类: ${result.classes}, 接口: ${result.interfaces}`)
    } else {
      log(`  ${name}: 文件不存在`, 'red')
    }
  })

  // 分析主入口文件的依赖
  if (analysis.main) {
    log('\n📦 依赖分析:', 'yellow')
    const deps = analyzeDependencies(analysis.main.content)
    deps.forEach(dep => {
      log(`  - ${dep}`, 'blue')
    })
  }

  // 优化建议
  log('\n💡 优化建议:', 'magenta')
  
  if (analysis.main && analysis.main.exports > 50) {
    log('  ⚠️  主入口文件导出过多，考虑拆分为多个入口', 'yellow')
  }
  
  if (analysis.main && analysis.main.reExports > 20) {
    log('  ⚠️  重导出过多，可能影响Tree-shaking效果', 'yellow')
  }

  // Tree-shaking优化建议
  log('\n🌳 Tree-shaking优化建议:', 'magenta')
  log('  1. 使用具名导出而非默认导出')
  log('  2. 避免导出整个模块 (export * from)')
  log('  3. 确保sideEffects配置正确')
  log('  4. 使用动态导入延迟加载非关键模块')

  return analysis
}

// 生成优化报告
function generateOptimizationReport(analysis) {
  const report = {
    timestamp: new Date().toISOString(),
    analysis,
    recommendations: []
  }

  // 添加具体建议
  if (analysis.main) {
    if (analysis.main.size > 100 * 1024) { // 100KB
      report.recommendations.push('主入口文件过大，考虑代码分割')
    }
    
    if (analysis.main.exports > 100) {
      report.recommendations.push('导出项过多，考虑创建子模块入口')
    }
  }

  const reportPath = join(rootDir, 'bundle-optimization-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  log(`\n📊 优化报告已保存到: ${reportPath}`, 'green')
}

// 执行分析
try {
  const analysis = analyzeBundleOptimization()
  generateOptimizationReport(analysis)
  log('\n✅ Bundle优化分析完成!', 'green')
} catch (error) {
  log(`\n❌ 分析失败: ${error.message}`, 'red')
  process.exit(1)
}
