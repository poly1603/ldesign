#!/usr/bin/env tsx
/** TypeScript 版本的构建产物自动校验工具 */

import { existsSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

export class BuildValidator {
  packageDir: string
  packageJsonPath: string
  packageJson: any
  errors: string[]
  warnings: string[]

  constructor(packageDir: string) {
    this.packageDir = packageDir
    this.packageJsonPath = resolve(packageDir, 'package.json')
    this.packageJson = this.loadPackageJson()
    this.errors = []
    this.warnings = []
  }

  loadPackageJson() {
    if (!existsSync(this.packageJsonPath)) {
      throw new Error(`package.json not found in ${this.packageDir}`)
    }
    return JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'))
  }

  async validate() {
    console.log(`🔍 开始校验构建产物: ${this.packageJson.name}`)
    this.validateFileExistence()
    this.validateFileSizes()
    await this.validateModuleExports()
    this.validatePackageExports()
    this.validateTypeDefinitions()
    return this.generateReport()
  }

  validateFileExistence() {
    console.log('📁 检查文件存在性...')
    const expectedFiles = ['esm/index.js', 'cjs/index.js', 'dist/index.js', 'dist/index.min.js', 'types/index.d.ts']
    if (existsSync(resolve(this.packageDir, 'src/vue'))) {
      expectedFiles.push('esm/vue/index.js', 'cjs/vue/index.js', 'types/vue/index.d.ts')
    }
    expectedFiles.forEach((file) => {
      const filePath = resolve(this.packageDir, file)
      if (!existsSync(filePath)) this.errors.push(`缺少构建产物文件: ${file}`)
      else console.log(`  ✅ ${file}`)
    })
  }

  validateFileSizes() {
    console.log('📏 检查文件大小...')
    const sizeChecks = [
      { file: 'esm/index.js', minSize: 100, maxSize: 1024 * 1024 },
      { file: 'cjs/index.js', minSize: 100, maxSize: 1024 * 1024 },
      { file: 'dist/index.js', minSize: 100, maxSize: 2 * 1024 * 1024 },
      { file: 'dist/index.min.js', minSize: 100, maxSize: 2 * 1024 * 1024 },
    ]
    sizeChecks.forEach(({ file, minSize, maxSize }) => {
      const filePath = resolve(this.packageDir, file)
      if (existsSync(filePath)) {
        const stats = statSync(filePath)
        const size = stats.size
        if (size < minSize) this.errors.push(`文件 ${file} 太小 (${size}B < ${minSize}B)，可能构建失败`)
        else if (size > maxSize) this.warnings.push(`文件 ${file} 较大 (${size}B > ${maxSize}B)，建议检查`)
        else console.log(`  ✅ ${file} (${this.formatSize(size)})`)
      }
    })
  }

  async validateModuleExports() {
    console.log('🔗 检查模块导出...')
    await this.testEsmImport()
    await this.testCjsImport()
  }

  async testEsmImport() {
    try {
      const esmPath = resolve(this.packageDir, 'esm/index.js')
      if (existsSync(esmPath)) {
        const module = await import(`file://${esmPath}`)
        if (Object.keys(module).length === 0) this.errors.push('ESM 模块没有导出任何内容')
        else console.log(`  ✅ ESM 导出: ${Object.keys(module).join(', ')}`)
      }
    } catch (error: any) {
      this.errors.push(`ESM 导入失败: ${error.message}`)
    }
  }

  async testCjsImport() {
    try {
      const cjsPath = resolve(this.packageDir, 'cjs/index.js')
      if (existsSync(cjsPath)) {
        const content = readFileSync(cjsPath, 'utf-8')
        if (content.includes('exports.') || content.includes('module.exports')) console.log('  ✅ CJS 导出: 检测到 CommonJS 导出语法')
        else this.warnings.push('CJS 文件可能缺少 CommonJS 导出语法')
      }
    } catch (error: any) {
      this.errors.push(`CJS 导入检查失败: ${error.message}`)
    }
  }

  validatePackageExports() {
    console.log('📦 检查 package.json exports...')
    const exportsField = this.packageJson.exports
    if (!exportsField) { this.warnings.push('package.json 缺少 exports 字段'); return }
    if (exportsField['.']) this.validateExportEntry('.', exportsField['.'])
    Object.keys(exportsField).forEach((key) => { if (key !== '.') this.validateExportEntry(key, exportsField[key]) })
  }

  validateExportEntry(exportKey: string, exportValue: any) {
    if (typeof exportValue === 'string') this.checkExportFile(exportKey, exportValue)
    else if (typeof exportValue === 'object') Object.entries(exportValue).forEach(([condition, p]) => this.checkExportFile(`${exportKey}[${condition}]`, p))
  }

  checkExportFile(exportKey: string, filePathRel: string) {
    const fullPath = resolve(this.packageDir, filePathRel)
    if (!existsSync(fullPath)) this.errors.push(`exports["${exportKey}"] 指向的文件不存在: ${filePathRel}`)
    else console.log(`  ✅ ${exportKey} -> ${filePathRel}`)
  }

  validateTypeDefinitions() {
    console.log('🔷 检查 TypeScript 类型定义...')
    const typeFiles = ['types/index.d.ts']
    if (existsSync(resolve(this.packageDir, 'src/vue'))) typeFiles.push('types/vue/index.d.ts')
    typeFiles.forEach((file) => {
      const filePath = resolve(this.packageDir, file)
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf-8')
          if (content.trim().length === 0) this.warnings.push(`类型定义文件为空: ${file}`)
          else if (!content.includes('export')) this.warnings.push(`类型定义文件可能缺少导出: ${file}`)
          else console.log(`  ✅ ${file}`)
        } catch (error: any) { this.errors.push(`读取类型定义文件失败: ${file} - ${error.message}`) }
      }
    })
  }

  generateReport() {
    const hasErrors = this.errors.length > 0
    const hasWarnings = this.warnings.length > 0
    console.log('\n📊 校验报告:')
    console.log('='.repeat(50))
    if (hasErrors) { console.log('❌ 错误:'); this.errors.forEach(error => console.log(`  • ${error}`)) }
    if (hasWarnings) { console.log('⚠️  警告:'); this.warnings.forEach(w => console.log(`  • ${w}`)) }
    if (!hasErrors && !hasWarnings) console.log('✅ 所有检查通过！')
    console.log('='.repeat(50))
    return { success: !hasErrors, errors: this.errors, warnings: this.warnings }
  }

  formatSize(bytes: number) { if (bytes < 1024) return `${bytes}B`; if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`; return `${(bytes / (1024 * 1024)).toFixed(1)}MB` }
}

export async function validateBuild(packageDir = process.cwd()) {
  try {
    const validator = new BuildValidator(packageDir)
    const result = await validator.validate()
    if (!result.success) process.exit(1)
    return result
  } catch (error: any) {
    console.error('❌ 校验失败:', error.message)
    process.exit(1)
  }
}

if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  const packageDir = process.argv[2] || process.cwd()
  await validateBuild(packageDir)
}


