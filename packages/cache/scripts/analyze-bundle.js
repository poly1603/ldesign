#!/usr/bin/env node

/**
 * 打包体积分析脚本
 * 分析构建输出的体积和依赖关系
 */

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function analyzeDirectory(dirPath, name) {
  if (!fs.existsSync(dirPath)) {
    console.log(colorize(`❌ ${name} 目录不存在: ${dirPath}`, 'red'))
    return { totalSize: 0, files: [] }
  }

  const files = []
  let totalSize = 0

  function walkDir(currentPath, relativePath = '') {
    const items = fs.readdirSync(currentPath)
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item)
      const relativeItemPath = path.join(relativePath, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        walkDir(fullPath, relativeItemPath)
      } else {
        const size = stat.size
        totalSize += size
        files.push({
          path: relativeItemPath,
          size: size,
          formatted: formatBytes(size)
        })
      }
    }
  }

  walkDir(dirPath)
  
  // 按大小排序
  files.sort((a, b) => b.size - a.size)
  
  return { totalSize, files }
}

function analyzePackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json')
  if (!fs.existsSync(packagePath)) {
    console.log(colorize('❌ package.json 不存在', 'red'))
    return
  }

  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  console.log(colorize('\n📦 包信息分析', 'cyan'))
  console.log(`名称: ${colorize(pkg.name, 'bright')}`)
  console.log(`版本: ${colorize(pkg.version, 'bright')}`)
  console.log(`类型: ${colorize(pkg.type || 'commonjs', 'bright')}`)
  console.log(`副作用: ${colorize(pkg.sideEffects !== undefined ? pkg.sideEffects : '未定义', 'bright')}`)
  
  if (pkg.exports) {
    console.log(colorize('\n📤 导出配置:', 'yellow'))
    Object.entries(pkg.exports).forEach(([key, value]) => {
      console.log(`  ${key}: ${JSON.stringify(value, null, 2).replace(/\n/g, '\n    ')}`)
    })
  }
}

function main() {
  console.log(colorize('🔍 开始分析打包体积...', 'bright'))
  
  // 分析包信息
  analyzePackageJson()
  
  // 分析各种构建输出
  const outputs = [
    { name: 'ES Modules', path: 'es', color: 'green' },
    { name: 'CommonJS', path: 'lib', color: 'blue' },
    { name: 'UMD', path: 'dist', color: 'magenta' },
    { name: 'Types', path: 'es', color: 'yellow', filter: '.d.ts' }
  ]

  let grandTotal = 0
  const summary = []

  for (const output of outputs) {
    const analysis = analyzeDirectory(output.path, output.name)
    grandTotal += analysis.totalSize
    
    console.log(colorize(`\n📊 ${output.name} 分析`, output.color))
    console.log(`总大小: ${colorize(formatBytes(analysis.totalSize), 'bright')}`)
    console.log(`文件数量: ${colorize(analysis.files.length, 'bright')}`)
    
    // 显示最大的文件
    const topFiles = analysis.files.slice(0, 5)
    if (topFiles.length > 0) {
      console.log(colorize('最大的文件:', 'yellow'))
      topFiles.forEach((file, index) => {
        const icon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📄'
        console.log(`  ${icon} ${file.path} - ${colorize(file.formatted, 'bright')}`)
      })
    }
    
    summary.push({
      name: output.name,
      size: analysis.totalSize,
      formatted: formatBytes(analysis.totalSize),
      files: analysis.files.length
    })
  }

  // 总结
  console.log(colorize('\n📈 总体分析', 'cyan'))
  console.log(`总体积: ${colorize(formatBytes(grandTotal), 'bright')}`)
  
  console.log(colorize('\n📋 分类汇总:', 'yellow'))
  summary.forEach(item => {
    const percentage = grandTotal > 0 ? ((item.size / grandTotal) * 100).toFixed(1) : '0'
    console.log(`  ${item.name}: ${colorize(item.formatted, 'bright')} (${percentage}%) - ${item.files} 文件`)
  })

  // 性能建议
  console.log(colorize('\n💡 性能建议:', 'green'))
  
  if (grandTotal > 500 * 1024) { // 500KB
    console.log('  ⚠️  总体积较大，考虑代码分割')
  }
  
  const largestFiles = []
  summary.forEach(item => {
    if (item.size > 50 * 1024) { // 50KB
      largestFiles.push(item.name)
    }
  })
  
  if (largestFiles.length > 0) {
    console.log(`  ⚠️  以下输出较大: ${largestFiles.join(', ')}`)
  }
  
  console.log('  ✅ 启用 gzip 压缩可以显著减小传输体积')
  console.log('  ✅ 考虑使用 Tree Shaking 移除未使用的代码')
  console.log('  ✅ 使用动态导入实现按需加载')
  
  console.log(colorize('\n✨ 分析完成!', 'bright'))
}

// 直接运行主函数
main()

export { analyzeDirectory, formatBytes }
