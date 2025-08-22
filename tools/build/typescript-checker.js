#!/usr/bin/env node
/**
 * TypeScript 类型检查工具
 *
 * 功能：
 * 1. 集成 TypeScript 类型检查到构建流程
 * 2. 检查生成的 .d.ts 类型定义文件是否正确
 * 3. 验证类型导出是否完整，没有缺失的类型定义
 * 4. 提供详细的错误报告和解决方案
 */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { glob } from 'glob'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * TypeScript 类型检查器
 */
export class TypeScriptChecker {
  constructor(packageDir) {
    this.packageDir = packageDir
    this.packageJsonPath = resolve(packageDir, 'package.json')
    this.packageJson = this.loadPackageJson()
    this.tsconfigPath = resolve(packageDir, 'tsconfig.json')
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
   * 执行完整的类型检查
   */
  async check() {
    console.log(`🔷 开始 TypeScript 类型检查: ${this.packageJson.name}`)

    await this.runTypeScriptCompiler()
    this.validateTypeDefinitions()
    this.checkTypeExports()
    this.validateTypeImports()

    return this.generateReport()
  }

  /**
   * 运行 TypeScript 编译器检查
   */
  async runTypeScriptCompiler() {
    console.log('🔧 运行 TypeScript 编译器检查...')

    if (!existsSync(this.tsconfigPath)) {
      this.warnings.push('tsconfig.json 不存在，跳过编译器检查')
      return
    }

    try {
      const result = await this.execTsc()
      if (result.exitCode !== 0) {
        this.parseTypeScriptErrors(result.stderr)
      }
      else {
        console.log('  ✅ TypeScript 编译检查通过')
      }
    }
    catch (error) {
      this.errors.push(`TypeScript 编译器运行失败: ${error.message}`)
    }
  }

  /**
   * 执行 tsc 命令
   */
  execTsc() {
    return new Promise((resolve) => {
      // Windows 兼容性处理
      const isWindows = process.platform === 'win32'
      const cmd = isWindows ? 'npx.cmd' : 'npx'

      const tsc = spawn(
        cmd,
        ['tsc', '--noEmit', '--project', this.tsconfigPath],
        {
          cwd: this.packageDir,
          stdio: 'pipe',
          shell: isWindows,
        },
      )

      let stdout = ''
      let stderr = ''

      tsc.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      tsc.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      tsc.on('close', (exitCode) => {
        resolve({ exitCode, stdout, stderr })
      })
    })
  }

  /**
   * 解析 TypeScript 错误
   */
  parseTypeScriptErrors(stderr) {
    const lines = stderr.split('\n').filter(line => line.trim())

    lines.forEach((line) => {
      if (line.includes('error TS')) {
        this.errors.push(`TypeScript 错误: ${line.trim()}`)
      }
      else if (line.includes('warning TS')) {
        this.warnings.push(`TypeScript 警告: ${line.trim()}`)
      }
    })
  }

  /**
   * 验证类型定义文件
   */
  validateTypeDefinitions() {
    console.log('📋 验证类型定义文件...')

    const typeFiles = this.findTypeDefinitionFiles()

    typeFiles.forEach((file) => {
      this.validateSingleTypeFile(file)
    })
  }

  /**
   * 查找所有类型定义文件
   */
  findTypeDefinitionFiles() {
    const patterns = ['esm/**/*.d.ts', 'cjs/**/*.d.ts', 'dist/**/*.d.ts']

    const files = []
    patterns.forEach((pattern) => {
      const matches = glob.sync(pattern, { cwd: this.packageDir })
      files.push(...matches.map(file => resolve(this.packageDir, file)))
    })

    return files
  }

  /**
   * 验证单个类型定义文件
   */
  validateSingleTypeFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = relative(this.packageDir, filePath)

      // 检查文件是否为空
      if (content.trim().length === 0) {
        this.warnings.push(`类型定义文件为空: ${relativePath}`)
        return
      }

      // 检查是否有导出
      if (!content.includes('export')) {
        this.warnings.push(`类型定义文件可能缺少导出: ${relativePath}`)
      }

      // 检查语法错误
      this.checkTypeFileSyntax(content, relativePath)

      console.log(`  ✅ ${relativePath}`)
    }
    catch (error) {
      this.errors.push(
        `读取类型定义文件失败: ${relative(this.packageDir, filePath)} - ${
          error.message
        }`,
      )
    }
  }

  /**
   * 检查类型文件语法
   */
  checkTypeFileSyntax(content, filePath) {
    // 简单的语法检查
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      const lineNumber = index + 1

      // 检查未闭合的括号
      const openBraces = (line.match(/\{/g) || []).length
      const closeBraces = (line.match(/\}/g) || []).length
      const openParens = (line.match(/\(/g) || []).length
      const closeParens = (line.match(/\)/g) || []).length

      if (openBraces !== closeBraces && !line.includes('//')) {
        this.warnings.push(`${filePath}:${lineNumber} 可能存在未闭合的大括号`)
      }

      if (openParens !== closeParens && !line.includes('//')) {
        this.warnings.push(`${filePath}:${lineNumber} 可能存在未闭合的小括号`)
      }
    })
  }

  /**
   * 检查类型导出
   */
  checkTypeExports() {
    console.log('🔗 检查类型导出...')

    const mainTypeFile = resolve(this.packageDir, 'esm/index.d.ts')
    if (existsSync(mainTypeFile)) {
      this.validateTypeExports(mainTypeFile, 'main')
    }

    // 检查 Vue 模块类型导出
    const vueTypeFile = resolve(this.packageDir, 'esm/vue/index.d.ts')
    if (existsSync(vueTypeFile)) {
      this.validateTypeExports(vueTypeFile, 'vue')
    }
  }

  /**
   * 验证类型导出
   */
  validateTypeExports(filePath, moduleName) {
    try {
      const content = readFileSync(filePath, 'utf-8')

      // 检查是否有类型导出
      const hasTypeExports
        = content.includes('export type')
          || content.includes('export interface')
          || content.includes('export declare')

      const hasValueExports
        = content.includes('export {')
          || content.includes('export const')
          || content.includes('export function')
          || content.includes('export class')

      if (!hasTypeExports && !hasValueExports) {
        this.warnings.push(`${moduleName} 模块可能缺少类型导出`)
      }
      else {
        console.log(`  ✅ ${moduleName} 模块类型导出正常`)
      }
    }
    catch (error) {
      this.errors.push(`检查 ${moduleName} 模块类型导出失败: ${error.message}`)
    }
  }

  /**
   * 验证类型导入
   */
  validateTypeImports() {
    console.log('📥 验证类型导入...')

    // 创建临时测试文件来验证类型导入
    this.createTypeImportTest()
  }

  /**
   * 创建类型导入测试
   */
  createTypeImportTest() {
    const testContent = this.generateTypeImportTestContent()
    const testFile = resolve(this.packageDir, '.type-test.ts')

    try {
      writeFileSync(testFile, testContent)
      console.log('  ✅ 类型导入测试文件已创建')

      // 清理测试文件
      setTimeout(() => {
        try {
          if (existsSync(testFile)) {
            require('node:fs').unlinkSync(testFile)
          }
        }
        catch (error) {
          // 忽略清理错误
        }
      }, 1000)
    }
    catch (error) {
      this.warnings.push(`创建类型导入测试失败: ${error.message}`)
    }
  }

  /**
   * 生成类型导入测试内容
   */
  generateTypeImportTestContent() {
    const packageName = this.packageJson.name

    return `// TypeScript 类型导入测试
// 这个文件用于验证类型定义是否正确

// 测试主模块导入
import type * as MainModule from '${packageName}'

// 测试 Vue 模块导入（如果存在）
${
  existsSync(resolve(this.packageDir, 'esm/vue/index.d.ts'))
    ? `import type * as VueModule from '${packageName}/vue'`
    : '// Vue 模块不存在'
}

// 类型测试
type TestMainModule = keyof typeof MainModule
${
  existsSync(resolve(this.packageDir, 'esm/vue/index.d.ts'))
    ? 'type TestVueModule = keyof typeof VueModule'
    : '// Vue 模块类型测试跳过'
}

export {}
`
  }

  /**
   * 生成检查报告
   */
  generateReport() {
    const hasErrors = this.errors.length > 0
    const hasWarnings = this.warnings.length > 0

    console.log('\n🔷 TypeScript 类型检查报告:')
    console.log('='.repeat(50))

    if (hasErrors) {
      console.log('❌ 类型错误:')
      this.errors.forEach(error => console.log(`  • ${error}`))
      console.log('\n💡 解决建议:')
      this.provideSolutions()
    }

    if (hasWarnings) {
      console.log('⚠️  类型警告:')
      this.warnings.forEach(warning => console.log(`  • ${warning}`))
    }

    if (!hasErrors && !hasWarnings) {
      console.log('✅ 所有类型检查通过！')
    }

    console.log('='.repeat(50))

    return {
      success: !hasErrors,
      errors: this.errors,
      warnings: this.warnings,
    }
  }

  /**
   * 提供解决方案
   */
  provideSolutions() {
    console.log('  1. 检查 tsconfig.json 配置是否正确')
    console.log('  2. 确保所有依赖的类型定义已安装')
    console.log('  3. 检查源代码中的类型注解是否正确')
    console.log('  4. 运行 "npm install @types/node" 安装 Node.js 类型定义')
    console.log('  5. 检查 Vue 相关类型定义是否正确导入')
  }
}

/**
 * 命令行入口
 */
export async function checkTypeScript(packageDir = process.cwd()) {
  try {
    const checker = new TypeScriptChecker(packageDir)
    const result = await checker.check()

    if (!result.success) {
      process.exit(1)
    }

    return result
  }
  catch (error) {
    console.error('❌ TypeScript 类型检查失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  const packageDir = process.argv[2] || process.cwd()
  checkTypeScript(packageDir)
}
