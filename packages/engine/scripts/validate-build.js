#!/usr/bin/env node

/**
 * 打包产物校验工具
 * 检查构建产物是否正确，是否包含测试文件，是否能正常运行
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

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

function error(message) {
  log(`❌ ${message}`, 'red')
}

function success(message) {
  log(`✅ ${message}`, 'green')
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue')
}

class BuildValidator {
  constructor() {
    this.errors = []
    this.warnings = []
    this.packageJson = JSON.parse(
      fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')
    )
  }

  // 检查必要的构建产物是否存在
  checkBuildArtifacts() {
    info('检查构建产物...')

    const requiredFiles = [
      'dist/index.js',
      'dist/index.min.js',
      'dist/index.d.ts',
      'es/index.js',
      'lib/index.js',
      'types/index.d.ts',
    ]

    const requiredDirs = ['dist', 'es', 'lib', 'types']

    // 检查目录
    for (const dir of requiredDirs) {
      const dirPath = path.join(packageRoot, dir)
      if (!fs.existsSync(dirPath)) {
        this.errors.push(`缺少构建目录: ${dir}`)
      } else {
        success(`构建目录存在: ${dir}`)
      }
    }

    // 检查文件
    for (const file of requiredFiles) {
      const filePath = path.join(packageRoot, file)
      if (!fs.existsSync(filePath)) {
        this.errors.push(`缺少构建文件: ${file}`)
      } else {
        success(`构建文件存在: ${file}`)
      }
    }
  }

  // 检查是否包含测试文件
  checkForTestFiles() {
    info('检查是否包含测试文件...')

    const buildDirs = ['dist', 'es', 'lib', 'types']
    const testPatterns = [
      /\.test\./,
      /\.spec\./,
      /__tests__/,
      /__mocks__/,
      /test.*\.js$/,
      /spec.*\.js$/,
    ]

    let foundTestFiles = false

    for (const dir of buildDirs) {
      const dirPath = path.join(packageRoot, dir)
      if (!fs.existsSync(dirPath)) continue

      const files = this.getAllFiles(dirPath)

      for (const file of files) {
        const relativePath = path.relative(packageRoot, file)

        for (const pattern of testPatterns) {
          if (pattern.test(relativePath)) {
            this.errors.push(`发现测试文件在构建产物中: ${relativePath}`)
            foundTestFiles = true
          }
        }
      }
    }

    if (!foundTestFiles) {
      success('构建产物中未发现测试文件')
    }
  }

  // 检查包大小
  checkBundleSize() {
    info('检查包大小...')

    const files = ['dist/index.js', 'dist/index.min.js']

    for (const file of files) {
      const filePath = path.join(packageRoot, file)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        const sizeKB = (stats.size / 1024).toFixed(2)
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2)

        info(`${file}: ${sizeKB}KB (${sizeMB}MB)`)

        // 检查是否过大
        if (stats.size > 5 * 1024 * 1024) {
          // 5MB
          this.warnings.push(`${file} 文件过大: ${sizeMB}MB`)
        }
      }
    }
  }

  // 检查模块导入
  checkModuleImports() {
    info('检查模块导入...')

    try {
      // 检查 ES 模块
      const esIndexPath = path.join(packageRoot, 'es/index.js')
      if (fs.existsSync(esIndexPath)) {
        const content = fs.readFileSync(esIndexPath, 'utf8')

        // 检查是否有相对路径导入
        const relativeImports = content.match(
          /from\s+['"][^'"]*\.\.\/[^'"]*['"]/g
        )
        if (relativeImports) {
          this.warnings.push(
            `ES模块中发现相对路径导入: ${relativeImports.join(', ')}`
          )
        }

        success('ES模块导入检查通过')
      }

      // 检查 CommonJS 模块
      const cjsIndexPath = path.join(packageRoot, 'lib/index.js')
      if (fs.existsSync(cjsIndexPath)) {
        const content = fs.readFileSync(cjsIndexPath, 'utf8')

        // 检查是否有相对路径require
        const relativeRequires = content.match(
          /require\(['"][^'"]*\.\.\/[^'"]*['"]\)/g
        )
        if (relativeRequires) {
          this.warnings.push(
            `CommonJS模块中发现相对路径require: ${relativeRequires.join(', ')}`
          )
        }

        success('CommonJS模块导入检查通过')
      }
    } catch (err) {
      this.errors.push(`模块导入检查失败: ${err.message}`)
    }
  }

  // 检查类型定义
  checkTypeDefinitions() {
    info('检查类型定义...')

    try {
      // 使用 TypeScript 编译器检查类型定义
      const tscPath = path.join(packageRoot, 'node_modules/.bin/tsc')
      const typesPath = path.join(packageRoot, 'types/index.d.ts')

      if (fs.existsSync(typesPath)) {
        // 创建临时测试文件
        const testFile = path.join(packageRoot, 'temp-type-test.ts')
        const testContent = `
import { createEngine } from './types/index';

// 测试基本类型
const engine = createEngine({
  config: {
    appName: 'Test'
  }
});

// 测试方法调用
engine.state.set('test', 'value');
const value = engine.state.get('test');
`

        fs.writeFileSync(testFile, testContent)

        try {
          execSync(`${tscPath} --noEmit --skipLibCheck ${testFile}`, {
            cwd: packageRoot,
            stdio: 'pipe',
          })
          success('类型定义检查通过')
        } catch (err) {
          this.errors.push(`类型定义检查失败: ${err.message}`)
        } finally {
          // 清理临时文件
          if (fs.existsSync(testFile)) {
            fs.unlinkSync(testFile)
          }
        }
      }
    } catch (err) {
      this.warnings.push(`类型定义检查跳过: ${err.message}`)
    }
  }

  // 检查运行时加载
  checkRuntimeLoading() {
    info('检查运行时加载...')

    try {
      // 测试 CommonJS 加载
      const cjsPath = path.join(packageRoot, 'lib/index.js')
      if (fs.existsSync(cjsPath)) {
        try {
          const module = require(cjsPath)
          if (typeof module.createEngine === 'function') {
            success('CommonJS模块加载成功')
          } else {
            this.errors.push('CommonJS模块缺少 createEngine 导出')
          }
        } catch (err) {
          this.errors.push(`CommonJS模块加载失败: ${err.message}`)
        }
      }

      // 测试 UMD 加载（在浏览器环境中）
      const umdPath = path.join(packageRoot, 'dist/index.js')
      if (fs.existsSync(umdPath)) {
        const umdContent = fs.readFileSync(umdPath, 'utf8')

        // 检查 UMD 模式
        if (
          umdContent.includes('typeof exports') &&
          umdContent.includes('typeof module') &&
          umdContent.includes('typeof define')
        ) {
          success('UMD模块格式正确')
        } else {
          this.warnings.push('UMD模块格式可能不正确')
        }
      }
    } catch (err) {
      this.errors.push(`运行时加载检查失败: ${err.message}`)
    }
  }

  // 检查 package.json 配置
  checkPackageJson() {
    info('检查 package.json 配置...')

    const requiredFields = ['main', 'module', 'types']
    const expectedPaths = {
      main: 'lib/index.js',
      module: 'es/index.js',
      types: 'types/index.d.ts',
    }

    for (const field of requiredFields) {
      if (!this.packageJson[field]) {
        this.errors.push(`package.json 缺少 ${field} 字段`)
      } else if (
        expectedPaths[field] &&
        this.packageJson[field] !== expectedPaths[field]
      ) {
        this.warnings.push(
          `package.json ${field} 字段值可能不正确: ${this.packageJson[field]}`
        )
      } else {
        success(`package.json ${field} 字段正确`)
      }
    }

    // 检查文件是否存在
    for (const [field, expectedPath] of Object.entries(expectedPaths)) {
      if (this.packageJson[field]) {
        const filePath = path.join(packageRoot, this.packageJson[field])
        if (!fs.existsSync(filePath)) {
          this.errors.push(
            `package.json ${field} 指向的文件不存在: ${this.packageJson[field]}`
          )
        }
      }
    }
  }

  // 获取目录下所有文件
  getAllFiles(dir) {
    const files = []

    function traverse(currentDir) {
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
    }

    traverse(dir)
    return files
  }

  // 运行所有检查
  async validate() {
    log('\n🔍 开始验证构建产物...', 'cyan')

    this.checkBuildArtifacts()
    this.checkForTestFiles()
    this.checkBundleSize()
    this.checkModuleImports()
    this.checkTypeDefinitions()
    this.checkRuntimeLoading()
    this.checkPackageJson()

    // 输出结果
    log('\n📊 验证结果:', 'cyan')

    if (this.errors.length === 0 && this.warnings.length === 0) {
      success('✨ 所有检查通过！构建产物质量良好。')
      return true
    }

    if (this.warnings.length > 0) {
      log('\n⚠️  警告:', 'yellow')
      this.warnings.forEach(warning => warning(warning))
    }

    if (this.errors.length > 0) {
      log('\n❌ 错误:', 'red')
      this.errors.forEach(err => error(err))
      log('\n💡 请修复上述错误后重新构建。', 'yellow')
      return false
    }

    if (this.warnings.length > 0) {
      warning('\n⚠️  存在警告，但构建产物可以使用。')
      return true
    }
  }
}

// 运行验证
const validator = new BuildValidator()
validator
  .validate()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(err => {
    error(`验证过程出错: ${err.message}`)
    process.exit(1)
  })
