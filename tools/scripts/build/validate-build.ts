#!/usr/bin/env tsx

/**
 * 统一构建产物校验工具（TypeScript 版本）
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { BundleAnalyzer } from './bundle-analyzer'
import { BundleValidator } from './bundle-validator'

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

interface BuildValidatorOptions {
  packageRoot?: string
  config?: string
  verbose?: boolean
}

class BuildValidator {
  packageRoot: string
  config: any
  options: BuildValidatorOptions

  constructor(options: BuildValidatorOptions = {}) {
    this.packageRoot = options.packageRoot || process.cwd()
    this.config = this.loadConfig(options.config)
    this.options = options
  }

  loadConfig(configPath?: string) {
    const defaultConfig = {
      steps: {
        validate: true,
        analyze: true,
        browserTest: false,
      },
      validator: {
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
      },
      analyzer: {
        analysis: {
          bundleSize: true,
          directoryStructure: true,
          dependencies: true,
          codeQuality: true,
          performance: true,
          duplicates: true,
        },
      },
      browserTester: {
        formats: ['umd', 'es'],
        browsers: ['chromium'],
        headless: true,
        tests: {
          moduleLoading: true,
          basicFunctionality: true,
          errorHandling: true,
        },
      },
    }

    const configPaths = [
      configPath,
      path.join(this.packageRoot, 'build-validator.config.json'),
      path.join(this.packageRoot, '.build-validator.json'),
    ].filter(Boolean) as string[]

    for (const configFile of configPaths) {
      if (fs.existsSync(configFile)) {
        try {
          const userConfig = JSON.parse(fs.readFileSync(configFile, 'utf8'))
          return this.mergeConfig(defaultConfig, userConfig)
        } catch (err: any) {
          log(`⚠️  配置文件加载失败: ${configFile} - ${err.message}`, 'yellow')
        }
      }
    }

    const packageJsonPath = path.join(this.packageRoot, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        if (packageJson.buildValidator) {
          return this.mergeConfig(defaultConfig, packageJson.buildValidator)
        }
      } catch { }
    }

    return defaultConfig
  }

  mergeConfig(defaultConfig: any, userConfig: any) {
    const merged: any = { ...defaultConfig }
    for (const key in userConfig) {
      if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
        merged[key] = { ...defaultConfig[key], ...userConfig[key] }
      } else {
        merged[key] = userConfig[key]
      }
    }
    return merged
  }

  async runValidation() {
    if (!this.config.steps.validate) {
      log('⏭️  跳过基础校验', 'gray')
      return true
    }
    log('🔍 运行基础校验...', 'cyan')
    const validator = new BundleValidator({
      packageRoot: this.packageRoot,
      config: this.config.validator,
    } as any)
    return await validator.validate()
  }

  async runAnalysis() {
    if (!this.config.steps.analyze) {
      log('⏭️  跳过包分析', 'gray')
      return true
    }
    log('\n🔍 运行包分析...', 'cyan')
    const analyzer = new BundleAnalyzer({
      packageRoot: this.packageRoot,
      config: this.config.analyzer,
    } as any)
    analyzer.analyze()
    return true
  }

  async runBrowserTests() {
    if (!this.config.steps.browserTest) {
      log('⏭️  跳过浏览器测试', 'gray')
      return true
    }

    try {
      await import('playwright')
    } catch {
      log('⚠️  未安装playwright，跳过浏览器测试', 'yellow')
      log('   安装命令: npm install -D playwright', 'gray')
      return true
    }

    log('\n🧪 运行浏览器测试...', 'cyan')
    const { BrowserTester } = await import('./browser-tester')
    const tester = new (BrowserTester as any)({
      packageRoot: this.packageRoot,
      config: this.config.browserTester,
    })
    return await tester.runTests()
  }

  generateReport(results: { validation: boolean; analysis: boolean; browserTest: boolean }) {
    log('\n📊 校验报告', 'cyan')
    log('=' * 50 as unknown as any, 'gray')
    const { validation, analysis, browserTest } = results
    if (this.config.steps.validate) {
      const status = validation ? '✅ 通过' : '❌ 失败'
      const color: ColorName = validation ? 'green' : 'red'
      log(`基础校验: ${status}`, color)
    }
    if (this.config.steps.analyze) {
      log(`包分析: ✅ 完成`, 'green')
    }
    if (this.config.steps.browserTest) {
      const status = browserTest ? '✅ 通过' : '❌ 失败'
      const color: ColorName = browserTest ? 'green' : 'red'
      log(`浏览器测试: ${status}`, color)
    }
    log('=' * 50 as unknown as any, 'gray')
    const allPassed = validation && analysis && browserTest
    if (allPassed) log('🎉 所有校验通过！构建产物质量良好', 'green')
    else log('❌ 部分校验失败，请查看上述详细信息', 'red')
    return allPassed
  }

  async validate() {
    log('🚀 开始构建产物完整校验...', 'cyan')
    const packageJson = this.loadPackageJson()
    log(`📦 包名: ${packageJson.name || '未知'}`, 'blue')
    log(`📍 路径: ${this.packageRoot}`, 'gray')
    log('')
    const results = { validation: true, analysis: true, browserTest: true }
    try {
      results.validation = await this.runValidation()
      results.analysis = await this.runAnalysis()
      results.browserTest = await this.runBrowserTests()
      const success = this.generateReport(results)
      return success
    } catch (err: any) {
      log(`❌ 校验过程出错: ${err.message}`, 'red')
      if (this.options.verbose) console.error(err.stack)
      return false
    }
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

  static createConfigTemplate(outputPath: string) {
    const template = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      title: 'Build Validator Configuration',
      description: 'Configuration for build artifact validation',
      steps: { validate: true, analyze: true, browserTest: false },
      validator: {
        formats: ['umd', 'es', 'cjs', 'types'],
        checks: {
          testFiles: true,
          imports: true,
          bundleSize: true,
          sourceMaps: true,
          moduleFormats: true,
          dependencies: true,
        },
        thresholds: { maxBundleSize: 2097152, maxWarningSize: 512000 },
        testPatterns: ['.test.', '.spec.', '__tests__', '__mocks__'],
        buildDirs: ['dist', 'es', 'lib', 'types'],
      },
      analyzer: {
        analysis: {
          bundleSize: true,
          directoryStructure: true,
          dependencies: true,
          codeQuality: true,
          performance: true,
          duplicates: true,
        },
        thresholds: { maxBundleSize: 2097152, maxWarningSize: 512000, maxCompressionRatio: 70 },
      },
      browserTester: {
        formats: ['umd', 'es'],
        browsers: ['chromium'],
        headless: true,
        timeout: 30000,
        viewport: { width: 1280, height: 720 },
        tests: {
          moduleLoading: true,
          basicFunctionality: true,
          errorHandling: true,
          externalDependencies: false,
        },
      },
    }
    fs.writeFileSync(outputPath, JSON.stringify(template, null, 2))
    log(`✅ 配置文件模板已创建: ${outputPath}`, 'green')
  }
}

async function main() {
  const args = process.argv.slice(2)
  const options: BuildValidatorOptions = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--config' && args[i + 1]) {
      options.config = args[i + 1]
      i++
    } else if (arg === '--package-root' && args[i + 1]) {
      options.packageRoot = args[i + 1]
      i++
    } else if (arg === '--verbose') {
      options.verbose = true
    } else if (arg === '--create-config' && args[i + 1]) {
      BuildValidator.createConfigTemplate(args[i + 1])
      process.exit(0)
    } else if (arg === '--help') {
      console.log(`
使用方法: tsx validate-build.ts [选项]

选项:
  --config <path>        指定配置文件路径
  --package-root <path>  指定包根目录路径
  --verbose              显示详细信息
  --create-config <path> 创建配置文件模板
  --help                 显示帮助信息

示例:
  tsx validate-build.ts
  tsx validate-build.ts --config ./build-validator.config.json
  tsx validate-build.ts --package-root ./packages/my-package
  tsx validate-build.ts --create-config ./build-validator.config.json
      `)
      process.exit(0)
    }
  }

  try {
    const validator = new BuildValidator(options)
    const success = await validator.validate()
    process.exit(success ? 0 : 1)
  } catch (err: any) {
    log(`❌ 校验过程出错: ${err.message}`, 'red')
    if (options.verbose) console.error(err.stack)
    process.exit(1)
  }
}

if (import.meta.url.endsWith('validate-build.ts')) {
  await main()
}

export { BuildValidator }


