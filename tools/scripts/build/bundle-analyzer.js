#!/usr/bin/env node

/**
 * 通用构建产物分析工具
 * 提供详细的包大小、依赖关系、代码质量分析
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 颜色输出
const colors = {
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  blue: '\x1B[34m',
  magenta: '\x1B[35m',
  cyan: '\x1B[36m',
  white: '\x1B[37m',
  gray: '\x1B[90m',
  reset: '\x1B[0m',
}

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

class BundleAnalyzer {
  constructor(options = {}) {
    this.packageRoot = options.packageRoot || process.cwd()
    this.config = this.loadConfig(options.config)
    this.packageJson = this.loadPackageJson()
  }

  // 加载配置文件
  loadConfig(configPath) {
    const defaultConfig = {
      formats: ['umd', 'es', 'cjs', 'types'],
      analysis: {
        bundleSize: true,
        directoryStructure: true,
        dependencies: true,
        codeQuality: true,
        performance: true,
        duplicates: true,
      },
      thresholds: {
        maxBundleSize: 2 * 1024 * 1024, // 2MB
        maxWarningSize: 500 * 1024, // 500KB
        maxCompressionRatio: 70, // 70%
      },
      buildDirs: ['dist', 'es', 'lib', 'types'],
    }

    if (configPath && fs.existsSync(configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        return { ...defaultConfig, ...userConfig }
      }
      catch (err) {
        log(`⚠️  配置文件加载失败，使用默认配置: ${err.message}`, 'yellow')
      }
    }

    return defaultConfig
  }

  // 加载package.json
  loadPackageJson() {
    const packageJsonPath = path.join(this.packageRoot, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      try {
        return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      }
      catch (err) {
        log(`⚠️  package.json加载失败: ${err.message}`, 'yellow')
      }
    }
    return {}
  }

  // 分析包大小
  analyzeBundleSize() {
    if (!this.config.analysis.bundleSize)
      return []

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
      const filePath = path.join(this.packageRoot, file.path)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        const sizeKB = (stats.size / 1024).toFixed(2)
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

        sizes.push({
          name: file.name,
          path: file.path,
          bytes: stats.size,
          kb: Number.parseFloat(sizeKB),
          mb: Number.parseFloat(sizeMB),
        })

        let color = 'green'
        if (stats.size > this.config.thresholds.maxWarningSize)
          color = 'yellow'
        if (stats.size > this.config.thresholds.maxBundleSize)
          color = 'red'

        log(
          `  ${file.name.padEnd(15)} ${sizeKB.padStart(8)}KB (${sizeMB}MB)`,
          color,
        )
      }
    }

    // 计算压缩比
    const uncompressed = sizes.find(s => s.name === 'UMD (未压缩)')
    const compressed = sizes.find(s => s.name === 'UMD (压缩)')

    if (uncompressed && compressed) {
      const ratio = ((1 - compressed.bytes / uncompressed.bytes) * 100).toFixed(
        1,
      )
      const color
        = Number.parseFloat(ratio) > this.config.thresholds.maxCompressionRatio
          ? 'green'
          : 'yellow'
      log(`  压缩比: ${ratio}%`, color)
    }

    return sizes
  }

  // 分析目录结构
  analyzeDirectoryStructure() {
    if (!this.config.analysis.directoryStructure)
      return

    log('\n📁 目录结构分析', 'cyan')

    for (const dir of this.config.buildDirs) {
      const dirPath = path.join(this.packageRoot, dir)
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
          'white',
        )

        // 显示最大的几个文件
        const fileSizes = files
          .map(file => ({
            path: path.relative(this.packageRoot, file),
            size: fs.statSync(file).size,
          }))
          .sort((a, b) => b.size - a.size)
          .slice(0, 3)

        fileSizes.forEach((file) => {
          const sizeKB = (file.size / 1024).toFixed(2)
          log(`    └─ ${file.path} (${sizeKB}KB)`, 'gray')
        })
      }
    }
  }

  // 分析依赖关系
  analyzeDependencies() {
    if (!this.config.analysis.dependencies)
      return

    log('\n🔗 依赖关系分析', 'cyan')

    try {
      // 分析 ES 模块的导入
      const esIndexPath = path.join(this.packageRoot, 'es/index.js')
      if (fs.existsSync(esIndexPath)) {
        const content = fs.readFileSync(esIndexPath, 'utf8')

        // 提取导入语句
        const imports = content.match(/from\s+['"][^'"]+['"]/g) || []
        const uniqueImports = [
          ...new Set(
            imports.map(imp => imp.replace(/from\s+['"]([^'"]+)['"]/, '$1')),
          ),
        ]

        log(`  ES模块导入数量: ${uniqueImports.length}`, 'white')

        // 分类导入
        const internalImports = uniqueImports.filter(
          imp => imp.startsWith('./') || imp.startsWith('../'),
        )
        const externalImports = uniqueImports.filter(
          imp => !imp.startsWith('./') && !imp.startsWith('../'),
        )

        log(`    内部模块: ${internalImports.length}`, 'blue')
        log(`    外部依赖: ${externalImports.length}`, 'yellow')

        if (externalImports.length > 0) {
          log('    外部依赖列表:', 'yellow')
          externalImports.forEach((dep) => {
            log(`      - ${dep}`, 'gray')
          })
        }

        // 检查是否有循环依赖
        this.checkCircularDependencies(internalImports)
      }
    }
    catch (err) {
      log(`  依赖分析失败: ${err.message}`, 'red')
    }
  }

  // 检查循环依赖
  checkCircularDependencies(imports) {
    // 简单的循环依赖检查
    const importGraph = new Map()

    // 这里可以实现更复杂的循环依赖检测逻辑
    // 目前只是一个占位符
    if (imports.length > 10) {
      log('    ⚠️  导入数量较多，建议检查是否存在循环依赖', 'yellow')
    }
  }

  // 检查代码质量
  analyzeCodeQuality() {
    if (!this.config.analysis.codeQuality)
      return

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
            fs.existsSync(path.join(this.packageRoot, file)),
          )
        },
      },
      {
        name: '类型定义',
        check: () => {
          return fs.existsSync(path.join(this.packageRoot, 'types/index.d.ts'))
        },
      },
      {
        name: 'UMD格式',
        check: () => {
          const umdPath = path.join(this.packageRoot, 'dist/index.js')
          if (!fs.existsSync(umdPath))
            return false

          const content = fs.readFileSync(umdPath, 'utf8')
          return (
            content.includes('typeof exports')
            && content.includes('typeof module')
            && content.includes('typeof define')
          )
        },
      },
      {
        name: 'ES模块格式',
        check: () => {
          const esPath = path.join(this.packageRoot, 'es/index.js')
          if (!fs.existsSync(esPath))
            return false

          const content = fs.readFileSync(esPath, 'utf8')
          return content.includes('export')
        },
      },
      {
        name: 'CommonJS格式',
        check: () => {
          const cjsPath = path.join(this.packageRoot, 'lib/index.js')
          if (!fs.existsSync(cjsPath))
            return false

          const content = fs.readFileSync(cjsPath, 'utf8')
          return content.includes('exports')
        },
      },
      {
        name: 'Tree Shaking支持',
        check: () => {
          const packageJson = this.packageJson
          return (
            packageJson.sideEffects === false
            || Array.isArray(packageJson.sideEffects)
          )
        },
      },
    ]

    checks.forEach((check) => {
      const result = check.check()
      const status = result ? '✅' : '❌'
      const color = result ? 'green' : 'red'
      log(`  ${status} ${check.name}`, color)
    })
  }

  // 检查重复代码
  analyzeDuplicates() {
    if (!this.config.analysis.duplicates)
      return

    log('\n🔍 重复代码分析', 'cyan')

    try {
      const esPath = path.join(this.packageRoot, 'es')
      const libPath = path.join(this.packageRoot, 'lib')

      if (fs.existsSync(esPath) && fs.existsSync(libPath)) {
        const esFiles = this.getAllFiles(esPath).length
        const libFiles = this.getAllFiles(libPath).length

        const difference = Math.abs(esFiles - libFiles)

        if (difference === 0) {
          log('  ✅ ES模块和CommonJS模块文件数量一致', 'green')
        }
        else if (difference <= 2) {
          log(
            `  ⚠️  ES模块和CommonJS模块文件数量略有差异 (${difference}个文件)`,
            'yellow',
          )
        }
        else {
          log(
            `  ❌ ES模块和CommonJS模块文件数量差异较大 (${difference}个文件)`,
            'red',
          )
        }
      }
    }
    catch (err) {
      log(`  重复代码分析失败: ${err.message}`, 'red')
    }
  }

  // 性能建议
  generatePerformanceRecommendations(sizes) {
    if (!this.config.analysis.performance)
      return

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

    // 检查Tree Shaking
    if (!this.packageJson.sideEffects) {
      recommendations.push(
        '建议在package.json中设置sideEffects字段以支持Tree Shaking',
      )
    }

    // 检查模块格式
    if (!this.packageJson.module) {
      recommendations.push('建议在package.json中设置module字段指向ES模块入口')
    }

    if (recommendations.length === 0) {
      log('  🎉 包大小和结构都很好！', 'green')
    }
    else {
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
          }
          else {
            files.push(itemPath)
          }
        }
      }
      catch (err) {
        // 忽略无法访问的目录
      }
    }

    traverse(dir)
    return files
  }

  // 运行完整分析
  analyze() {
    log('🔍 开始包分析...', 'cyan')
    log(`📦 包名: ${this.packageJson.name || '未知'}`, 'blue')
    log(`📍 路径: ${this.packageRoot}`, 'gray')

    const sizes = this.analyzeBundleSize()
    this.analyzeDirectoryStructure()
    this.analyzeDependencies()
    this.analyzeCodeQuality()
    this.analyzeDuplicates()
    this.generatePerformanceRecommendations(sizes)

    log('\n✨ 分析完成！', 'green')
    return sizes
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2)
  const options = {}

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--config' && args[i + 1]) {
      options.config = args[i + 1]
      i++
    }
    else if (arg === '--package-root' && args[i + 1]) {
      options.packageRoot = args[i + 1]
      i++
    }
    else if (arg === '--help') {
      console.log(`
使用方法: node bundle-analyzer.js [选项]

选项:
  --config <path>        指定配置文件路径
  --package-root <path>  指定包根目录路径
  --help                 显示帮助信息

示例:
  node bundle-analyzer.js
  node bundle-analyzer.js --config ./analyzer.config.json
  node bundle-analyzer.js --package-root ./packages/my-package
      `)
      process.exit(0)
    }
  }

  try {
    const analyzer = new BundleAnalyzer(options)
    analyzer.analyze()
  }
  catch (err) {
    log(`❌ 分析过程出错: ${err.message}`, 'red')
    console.error(err.stack)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (import.meta.url.endsWith('bundle-analyzer.js')) {
  main()
}

export { BundleAnalyzer }
