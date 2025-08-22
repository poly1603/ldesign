#!/usr/bin/env tsx

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

type ColorName = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray' | 'reset'

const colors: Record<ColorName, string> = {
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

function log(message: string, color: ColorName = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

interface ValidatorOptions {
  packageRoot?: string
  config?: string
}

class BundleValidator {
  packageRoot: string
  config: any
  packageJson: any

  constructor(options: ValidatorOptions = {}) {
    this.packageRoot = options.packageRoot || process.cwd()
    this.config = this.loadConfig(options.config)
    this.packageJson = this.loadPackageJson()
  }

  loadConfig(configPath?: string) {
    const defaultConfig = {
      formats: ['umd', 'es', 'cjs', 'types'],
      checks: {
        testFiles: true,
        imports: true,
        bundleSize: true,
        sourceMaps: true,
        moduleFormats: true,
        dependencies: true,
      },
      thresholds: {
        maxBundleSize: 2 * 1024 * 1024,
        maxWarningSize: 500 * 1024,
      },
      testPatterns: [/\.test\./, /\.spec\./, /__tests__/, /__mocks__/],
      buildDirs: ['dist', 'es', 'lib', 'types'],
    }

    if (configPath && fs.existsSync(configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
        return { ...defaultConfig, ...userConfig }
      } catch (err: any) {
        log(`⚠️  配置文件加载失败，使用默认配置: ${err.message}`, 'yellow')
      }
    }

    const packageConfigPath = path.join(this.packageRoot, 'package.json')
    if (fs.existsSync(packageConfigPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageConfigPath, 'utf8'))
        if (packageJson.bundleValidator) {
          return { ...defaultConfig, ...packageJson.bundleValidator }
        }
      } catch { }
    }

    return defaultConfig
  }

  loadPackageJson() {
    const packageJsonPath = path.join(this.packageRoot, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      try {
        return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      } catch (err: any) {
        log(`⚠️  package.json加载失败: ${err.message}`, 'yellow')
      }
    }
    return {}
  }

  checkTestFiles() {
    if (!this.config.checks.testFiles) return true
    log('🔍 检查是否包含测试文件...', 'cyan')
    let hasTestFiles = false
    for (const dir of this.config.buildDirs) {
      const dirPath = path.join(this.packageRoot, dir)
      if (!fs.existsSync(dirPath)) continue
      const files = this.getAllFiles(dirPath)
      for (const file of files) {
        const relativePath = path.relative(this.packageRoot, file)
        for (const pattern of this.config.testPatterns as RegExp[]) {
          if (pattern.test(relativePath)) {
            log(`❌ 发现测试文件: ${relativePath}`, 'red')
            hasTestFiles = true
          }
        }
      }
    }
    if (!hasTestFiles) log('✅ 未发现测试文件', 'green')
    return !hasTestFiles
  }

  async checkImports() {
    if (!this.config.checks.imports) return true
    log('🔍 检查模块导入...', 'cyan')
    try {
      const results: boolean[] = []
      if (this.config.formats.includes('es')) {
        const esPath = path.join(this.packageRoot, 'es/index.js')
        if (fs.existsSync(esPath)) {
          try {
            const moduleUrl = `file://${path.resolve(esPath).replace(/\\/g, '/')}`
            const module: any = await import(moduleUrl)
            const expectedExports = ['createEngine', 'default']
            let foundExport = false
            for (const exportName of expectedExports) {
              if (typeof module[exportName] === 'function' || module[exportName]) {
                log(`✅ ES模块 导入成功，找到导出: ${exportName}`, 'green')
                foundExport = true
                break
              }
            }
            if (!foundExport) {
              const exports = Object.keys(module).filter(key => key !== '__esModule')
              if (exports.length > 0) {
                log(`✅ ES模块 导入成功，找到导出: ${exports.slice(0, 3).join(', ')}${exports.length > 3 ? '...' : ''}`, 'green')
                foundExport = true
              } else {
                log(`❌ ES模块 没有找到任何导出`, 'red')
              }
            }
            results.push(foundExport)
          } catch (err: any) {
            log(`❌ ES模块 导入失败: ${err.message}`, 'red')
            results.push(false)
          }
        }
      }
      if (this.config.formats.includes('types')) {
        const typesPath = path.join(this.packageRoot, 'types/index.d.ts')
        if (fs.existsSync(typesPath)) {
          const content = fs.readFileSync(typesPath, 'utf8')
          const hasExports = content.includes('export') || content.includes('declare')
          if (hasExports) {
            log('✅ 类型定义包含导出声明', 'green')
            results.push(true)
          } else {
            log('❌ 类型定义缺少导出声明', 'red')
            results.push(false)
          }
        }
      }
      return results.length === 0 || results.every(Boolean)
    } catch (err: any) {
      log(`❌ 导入检查失败: ${err.message}`, 'red')
      return false
    }
  }

  checkBundleSize() {
    if (!this.config.checks.bundleSize) return true
    log('🔍 检查包大小...', 'cyan')
    const files = [
      { name: 'UMD (未压缩)', path: 'dist/index.js' },
      { name: 'UMD (压缩)', path: 'dist/index.min.js' },
      { name: 'ES模块', path: 'es/index.js' },
      { name: 'CommonJS', path: 'lib/index.js' },
    ]
    let allSizesOk = true
    for (const file of files) {
      const filePath = path.join(this.packageRoot, file.path)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        const sizeKB = (stats.size / 1024).toFixed(2)
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2)
        let color: ColorName = 'green'
        let status = '✅'
        if (stats.size > this.config.thresholds.maxBundleSize) {
          color = 'red'
          status = '❌'
          allSizesOk = false
        } else if (stats.size > this.config.thresholds.maxWarningSize) {
          color = 'yellow'
          status = '⚠️ '
        }
        log(`${status} ${file.name}: ${sizeKB}KB (${sizeMB}MB)`, color)
      }
    }
    return allSizesOk
  }

  checkSourceMaps() {
    if (!this.config.checks.sourceMaps) return true
    log('🔍 检查源码映射...', 'cyan')
    const mapFiles = ['dist/index.js.map', 'dist/index.min.js.map', 'es/index.js.map', 'lib/index.js.map']
    let hasSourceMaps = false
    for (const mapFile of mapFiles) {
      const mapPath = path.join(this.packageRoot, mapFile)
      if (fs.existsSync(mapPath)) {
        try {
          const mapContent = JSON.parse(fs.readFileSync(mapPath, 'utf8'))
          if (mapContent.sources && mapContent.sources.length > 0) {
            log(`✅ 找到有效的源码映射: ${mapFile}`, 'green')
            hasSourceMaps = true
          }
        } catch {
          log(`❌ 源码映射文件损坏: ${mapFile}`, 'red')
        }
      }
    }
    if (!hasSourceMaps) log('⚠️  未找到源码映射文件', 'yellow')
    return true
  }

  getAllFiles(dir: string) {
    const files: string[] = []
    function traverse(currentDir: string) {
      try {
        const items = fs.readdirSync(currentDir)
        for (const item of items) {
          const itemPath = path.join(currentDir, item)
          const stat = fs.statSync(itemPath)
          if (stat.isDirectory()) traverse(itemPath)
          else files.push(itemPath)
        }
      } catch { }
    }
    traverse(dir)
    return files
  }

  async validate() {
    log('🚀 开始构建产物校验...', 'cyan')
    log(`📦 包名: ${this.packageJson.name || '未知'}`, 'blue')
    log(`📍 路径: ${this.packageRoot}`, 'gray')
    log('')
    const results: boolean[] = []
    results.push(this.checkTestFiles())
    results.push(await this.checkImports())
    results.push(this.checkBundleSize())
    results.push(this.checkSourceMaps())
    log('')
    const allPassed = results.every(Boolean)
    if (allPassed) log('✅ 所有检查通过！', 'green')
    else log('❌ 部分检查失败，请修复问题后重新构建', 'red')
    return allPassed
  }
}

async function main() {
  const args = process.argv.slice(2)
  const options: ValidatorOptions = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--config' && args[i + 1]) { options.config = args[i + 1]; i++ }
    else if (arg === '--package-root' && args[i + 1]) { options.packageRoot = args[i + 1]; i++ }
    else if (arg === '--help') {
      console.log(`
使用方法: tsx bundle-validator.ts [选项]

选项:
  --config <path>        指定配置文件路径
  --package-root <path>  指定包根目录路径
  --help                 显示帮助信息

示例:
  tsx bundle-validator.ts
  tsx bundle-validator.ts --config ./validator.config.json
  tsx bundle-validator.ts --package-root ./packages/my-package
      `)
      process.exit(0)
    }
  }
  const validator = new BundleValidator(options)
  const success = await validator.validate()
  process.exit(success ? 0 : 1)
}

if (import.meta.url.endsWith('bundle-validator.ts')) {
  await main()
}

export { BundleValidator }


