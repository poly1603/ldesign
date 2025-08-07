#!/usr/bin/env node

/**
 * 高级包分析工具
 * 分析包大小、依赖关系、重复代码等
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageRoot = path.resolve(__dirname, '..')

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
}

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

class BundleAnalyzer {
  constructor() {
    this.packageJson = JSON.parse(
      fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')
    )
  }

  // 分析包大小
  analyzeBundleSize() {
    log('\n📦 包大小分析', 'cyan')

    const files = [
      { name: 'UMD (未压缩)', path: 'dist/index.js' },
      { name: 'UMD (压缩)', path: 'dist/index.min.js' },
      { name: 'ES模块', path: 'es/index.js' },
      { name: 'CommonJS', path: 'lib/index.js' },
      { name: '类型定义', path: 'types/index.d.ts' },
    ]

    const sizes = []

    for (const file of files) {
      const filePath = path.join(packageRoot, file.path)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        const sizeKB = (stats.size / 1024).toFixed(2)
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

        sizes.push({
          name: file.name,
          path: file.path,
          bytes: stats.size,
          kb: parseFloat(sizeKB),
          mb: parseFloat(sizeMB),
        })

        let color = 'green'
        if (stats.size > 500 * 1024) color = 'yellow' // > 500KB
        if (stats.size > 1024 * 1024) color = 'red' // > 1MB

        log(
          `  ${file.name.padEnd(15)} ${sizeKB.padStart(8)}KB (${sizeMB}MB)`,
          color
        )
      }
    }

    // 计算压缩比
    const uncompressed = sizes.find(s => s.name === 'UMD (未压缩)')
    const compressed = sizes.find(s => s.name === 'UMD (压缩)')

    if (uncompressed && compressed) {
      const ratio = ((1 - compressed.bytes / uncompressed.bytes) * 100).toFixed(
        1
      )
      log(`  压缩比: ${ratio}%`, 'blue')
    }

    return sizes
  }

  // 分析目录结构
  analyzeDirectoryStructure() {
    log('\n📁 目录结构分析', 'cyan')

    const buildDirs = ['dist', 'es', 'lib', 'types']

    for (const dir of buildDirs) {
      const dirPath = path.join(packageRoot, dir)
      if (fs.existsSync(dirPath)) {
        const files = this.getAllFiles(dirPath)
        const totalSize = files.reduce((sum, file) => {
          return sum + fs.statSync(file).size
        }, 0)

        const sizeKB = (totalSize / 1024).toFixed(2)
        log(
          `  ${dir.padEnd(8)} ${files.length
            .toString()
            .padStart(3)} 文件, ${sizeKB.padStart(8)}KB`,
          'white'
        )

        // 显示最大的几个文件
        const fileSizes = files
          .map(file => ({
            path: path.relative(packageRoot, file),
            size: fs.statSync(file).size,
          }))
          .sort((a, b) => b.size - a.size)
          .slice(0, 3)

        fileSizes.forEach(file => {
          const sizeKB = (file.size / 1024).toFixed(2)
          log(`    └─ ${file.path} (${sizeKB}KB)`, 'gray')
        })
      }
    }
  }

  // 分析依赖关系
  analyzeDependencies() {
    log('\n🔗 依赖关系分析', 'cyan')

    try {
      // 分析 ES 模块的导入
      const esIndexPath = path.join(packageRoot, 'es/index.js')
      if (fs.existsSync(esIndexPath)) {
        const content = fs.readFileSync(esIndexPath, 'utf8')

        // 提取导入语句
        const imports = content.match(/from\s+['"][^'"]+['"]/g) || []
        const uniqueImports = [
          ...new Set(
            imports.map(imp => imp.replace(/from\s+['"]([^'"]+)['"]/, '$1'))
          ),
        ]

        log(`  ES模块导入数量: ${uniqueImports.length}`, 'white')

        // 分类导入
        const internalImports = uniqueImports.filter(
          imp => imp.startsWith('./') || imp.startsWith('../')
        )
        const externalImports = uniqueImports.filter(
          imp => !imp.startsWith('./') && !imp.startsWith('../')
        )

        log(`    内部模块: ${internalImports.length}`, 'blue')
        log(`    外部依赖: ${externalImports.length}`, 'yellow')

        if (externalImports.length > 0) {
          log('    外部依赖列表:', 'yellow')
          externalImports.forEach(dep => {
            log(`      - ${dep}`, 'gray')
          })
        }
      }
    } catch (err) {
      log(`  依赖分析失败: ${err.message}`, 'red')
    }
  }

  // 检查代码质量
  analyzeCodeQuality() {
    log('\n✨ 代码质量分析', 'cyan')

    const checks = [
      {
        name: '源码映射',
        check: () => {
          const mapFiles = [
            'dist/index.js.map',
            'es/index.js.map',
            'lib/index.js.map',
          ]
          return mapFiles.some(file =>
            fs.existsSync(path.join(packageRoot, file))
          )
        },
      },
      {
        name: '类型定义',
        check: () => {
          return fs.existsSync(path.join(packageRoot, 'types/index.d.ts'))
        },
      },
      {
        name: 'UMD格式',
        check: () => {
          const umdPath = path.join(packageRoot, 'dist/index.js')
          if (!fs.existsSync(umdPath)) return false

          const content = fs.readFileSync(umdPath, 'utf8')
          return (
            content.includes('typeof exports') &&
            content.includes('typeof module') &&
            content.includes('typeof define')
          )
        },
      },
      {
        name: 'ES模块格式',
        check: () => {
          const esPath = path.join(packageRoot, 'es/index.js')
          if (!fs.existsSync(esPath)) return false

          const content = fs.readFileSync(esPath, 'utf8')
          return content.includes('export')
        },
      },
      {
        name: 'CommonJS格式',
        check: () => {
          const cjsPath = path.join(packageRoot, 'lib/index.js')
          if (!fs.existsSync(cjsPath)) return false

          const content = fs.readFileSync(cjsPath, 'utf8')
          return content.includes('exports')
        },
      },
    ]

    checks.forEach(check => {
      const result = check.check()
      const status = result ? '✅' : '❌'
      const color = result ? 'green' : 'red'
      log(`  ${status} ${check.name}`, color)
    })
  }

  // 性能建议
  generatePerformanceRecommendations(sizes) {
    log('\n💡 性能建议', 'cyan')

    const recommendations = []

    // 检查包大小
    const umdSize = sizes.find(s => s.name === 'UMD (未压缩)')
    if (umdSize && umdSize.kb > 500) {
      recommendations.push('UMD包较大，考虑拆分或移除不必要的功能')
    }

    const minSize = sizes.find(s => s.name === 'UMD (压缩)')
    if (minSize && minSize.kb > 200) {
      recommendations.push('压缩后的包仍然较大，考虑使用Tree Shaking优化')
    }

    // 检查是否有重复代码
    try {
      const esPath = path.join(packageRoot, 'es')
      const libPath = path.join(packageRoot, 'lib')

      if (fs.existsSync(esPath) && fs.existsSync(libPath)) {
        const esFiles = this.getAllFiles(esPath).length
        const libFiles = this.getAllFiles(libPath).length

        if (Math.abs(esFiles - libFiles) > 5) {
          recommendations.push(
            'ES模块和CommonJS模块文件数量差异较大，检查构建配置'
          )
        }
      }
    } catch (err) {
      // 忽略错误
    }

    if (recommendations.length === 0) {
      log('  🎉 包大小和结构都很好！', 'green')
    } else {
      recommendations.forEach((rec, index) => {
        log(`  ${index + 1}. ${rec}`, 'yellow')
      })
    }
  }

  // 获取所有文件
  getAllFiles(dir) {
    const files = []

    function traverse(currentDir) {
      try {
        const items = fs.readdirSync(currentDir)

        for (const item of items) {
          const itemPath = path.join(currentDir, item)
          const stat = fs.statSync(itemPath)

          if (stat.isDirectory()) {
            traverse(itemPath)
          } else {
            files.push(itemPath)
          }
        }
      } catch (err) {
        // 忽略无法访问的目录
      }
    }

    traverse(dir)
    return files
  }

  // 运行完整分析
  analyze() {
    log('🔍 开始包分析...', 'cyan')

    const sizes = this.analyzeBundleSize()
    this.analyzeDirectoryStructure()
    this.analyzeDependencies()
    this.analyzeCodeQuality()
    this.generatePerformanceRecommendations(sizes)

    log('\n✨ 分析完成！', 'green')
  }
}

// 运行分析
const analyzer = new BundleAnalyzer()
analyzer.analyze()
