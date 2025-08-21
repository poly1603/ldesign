#!/usr/bin/env node
/**
 * 构建产物自动校验工具
 *
 * 功能：
 * 1. 验证构建产物文件存在性
 * 2. 检查文件大小合理性
 * 3. 验证模块导出正确性
 * 4. 检查 package.json exports 字段匹配性
 * 5. TypeScript 类型定义验证
 */

import { existsSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

/**
 * 构建产物校验器
 */
export class BuildValidator {
  constructor(packageDir) {
    this.packageDir = packageDir
    this.packageJsonPath = resolve(packageDir, 'package.json')
    this.packageJson = this.loadPackageJson()
    this.errors = []
    this.warnings = []
  }

  /**
   * 加载 package.json
   */
  loadPackageJson() {
    if (!existsSync(this.packageJsonPath)) {
      throw new Error(`package.json not found in ${this.packageDir}`)
    }
    return JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'))
  }

  /**
   * 执行完整校验
   */
  async validate() {
    console.log(`🔍 开始校验构建产物: ${this.packageJson.name}`)

    this.validateFileExistence()
    this.validateFileSizes()
    await this.validateModuleExports()
    this.validatePackageExports()
    this.validateTypeDefinitions()

    return this.generateReport()
  }

  /**
   * 验证文件存在性
   */
  validateFileExistence() {
    console.log('📁 检查文件存在性...')

    const expectedFiles = [
      'esm/index.js',
      'cjs/index.js',
      'dist/index.js',
      'dist/index.min.js',
      'types/index.d.ts',
    ]

    // 检查是否有 vue 子模块
    if (existsSync(resolve(this.packageDir, 'src/vue'))) {
      expectedFiles.push(
        'esm/vue/index.js',
        'cjs/vue/index.js',
        'types/vue/index.d.ts',
      )
    }

    expectedFiles.forEach((file) => {
      const filePath = resolve(this.packageDir, file)
      if (!existsSync(filePath)) {
        this.errors.push(`缺少构建产物文件: ${file}`)
      }
      else {
        console.log(`  ✅ ${file}`)
      }
    })
  }

  /**
   * 验证文件大小合理性
   */
  validateFileSizes() {
    console.log('📏 检查文件大小...')

    const sizeChecks = [
      { file: 'esm/index.js', minSize: 100, maxSize: 1024 * 1024 }, // 100B - 1MB
      { file: 'cjs/index.js', minSize: 100, maxSize: 1024 * 1024 },
      { file: 'dist/index.js', minSize: 100, maxSize: 2 * 1024 * 1024 }, // 2MB
      { file: 'dist/index.min.js', minSize: 100, maxSize: 2 * 1024 * 1024 }, // 2MB
    ]

    sizeChecks.forEach(({ file, minSize, maxSize }) => {
      const filePath = resolve(this.packageDir, file)
      if (existsSync(filePath)) {
        const stats = statSync(filePath)
        const size = stats.size

        if (size < minSize) {
          this.errors.push(
            `文件 ${file} 太小 (${size}B < ${minSize}B)，可能构建失败`,
          )
        }
        else if (size > maxSize) {
          this.warnings.push(
            `文件 ${file} 较大 (${size}B > ${maxSize}B)，建议检查`,
          )
        }
        else {
          console.log(`  ✅ ${file} (${this.formatSize(size)})`)
        }
      }
    })
  }

  /**
   * 验证模块导出正确性
   */
  async validateModuleExports() {
    console.log('🔗 检查模块导出...')

    // 测试 ESM 导入
    await this.testEsmImport()

    // 测试 CJS 导入
    await this.testCjsImport()
  }

  /**
   * 测试 ESM 导入
   */
  async testEsmImport() {
    try {
      const esmPath = resolve(this.packageDir, 'esm/index.js')
      if (existsSync(esmPath)) {
        const module = await import(`file://${esmPath}`)
        if (Object.keys(module).length === 0) {
          this.errors.push('ESM 模块没有导出任何内容')
        }
        else {
          console.log(`  ✅ ESM 导出: ${Object.keys(module).join(', ')}`)
        }
      }
    }
    catch (error) {
      this.errors.push(`ESM 导入失败: ${error.message}`)
    }
  }

  /**
   * 测试 CJS 导入
   */
  async testCjsImport() {
    try {
      const cjsPath = resolve(this.packageDir, 'cjs/index.js')
      if (existsSync(cjsPath)) {
        // 读取文件内容检查是否有导出
        const content = readFileSync(cjsPath, 'utf-8')

        if (
          content.includes('exports.')
          || content.includes('module.exports')
        ) {
          console.log('  ✅ CJS 导出: 检测到 CommonJS 导出语法')
        }
        else {
          this.warnings.push('CJS 文件可能缺少 CommonJS 导出语法')
        }
      }
    }
    catch (error) {
      this.errors.push(`CJS 导入检查失败: ${error.message}`)
    }
  }

  /**
   * 验证 package.json exports 字段
   */
  validatePackageExports() {
    console.log('📦 检查 package.json exports...')

    const exports = this.packageJson.exports
    if (!exports) {
      this.warnings.push('package.json 缺少 exports 字段')
      return
    }

    // 检查主导出
    if (exports['.']) {
      this.validateExportEntry('.', exports['.'])
    }

    // 检查子模块导出
    Object.keys(exports).forEach((key) => {
      if (key !== '.') {
        this.validateExportEntry(key, exports[key])
      }
    })
  }

  /**
   * 验证单个导出条目
   */
  validateExportEntry(exportKey, exportValue) {
    if (typeof exportValue === 'string') {
      this.checkExportFile(exportKey, exportValue)
    }
    else if (typeof exportValue === 'object') {
      Object.entries(exportValue).forEach(([condition, path]) => {
        this.checkExportFile(`${exportKey}[${condition}]`, path)
      })
    }
  }

  /**
   * 检查导出文件是否存在
   */
  checkExportFile(exportKey, filePath) {
    const fullPath = resolve(this.packageDir, filePath)
    if (!existsSync(fullPath)) {
      this.errors.push(`exports["${exportKey}"] 指向的文件不存在: ${filePath}`)
    }
    else {
      console.log(`  ✅ ${exportKey} -> ${filePath}`)
    }
  }

  /**
   * 验证 TypeScript 类型定义
   */
  validateTypeDefinitions() {
    console.log('🔷 检查 TypeScript 类型定义...')

    const typeFiles = ['types/index.d.ts']

    // 检查是否有 vue 子模块
    if (existsSync(resolve(this.packageDir, 'src/vue'))) {
      typeFiles.push('types/vue/index.d.ts')
    }

    typeFiles.forEach((file) => {
      const filePath = resolve(this.packageDir, file)
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf-8')
          if (content.trim().length === 0) {
            this.warnings.push(`类型定义文件为空: ${file}`)
          }
          else if (!content.includes('export')) {
            this.warnings.push(`类型定义文件可能缺少导出: ${file}`)
          }
          else {
            console.log(`  ✅ ${file}`)
          }
        }
        catch (error) {
          this.errors.push(`读取类型定义文件失败: ${file} - ${error.message}`)
        }
      }
    })
  }

  /**
   * 生成校验报告
   */
  generateReport() {
    const hasErrors = this.errors.length > 0
    const hasWarnings = this.warnings.length > 0

    console.log('\n📊 校验报告:')
    console.log('='.repeat(50))

    if (hasErrors) {
      console.log('❌ 错误:')
      this.errors.forEach(error => console.log(`  • ${error}`))
    }

    if (hasWarnings) {
      console.log('⚠️  警告:')
      this.warnings.forEach(warning => console.log(`  • ${warning}`))
    }

    if (!hasErrors && !hasWarnings) {
      console.log('✅ 所有检查通过！')
    }

    console.log('='.repeat(50))

    return {
      success: !hasErrors,
      errors: this.errors,
      warnings: this.warnings,
    }
  }

  /**
   * 格式化文件大小
   */
  formatSize(bytes) {
    if (bytes < 1024)
      return `${bytes}B`
    if (bytes < 1024 * 1024)
      return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
  }
}

/**
 * 命令行入口
 */
export async function validateBuild(packageDir = process.cwd()) {
  try {
    const validator = new BuildValidator(packageDir)
    const result = await validator.validate()

    if (!result.success) {
      process.exit(1)
    }

    return result
  }
  catch (error) {
    console.error('❌ 校验失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此文件
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  const packageDir = process.argv[2] || process.cwd()
  validateBuild(packageDir)
}
