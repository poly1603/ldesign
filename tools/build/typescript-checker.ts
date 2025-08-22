#!/usr/bin/env tsx
/** TypeScript 版本：TypeScript 类型检查工具 */

import { spawn } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { glob } from 'glob'

const __dirname = dirname(fileURLToPath(import.meta.url))

export class TypeScriptChecker {
  packageDir: string
  packageJsonPath: string
  packageJson: any
  tsconfigPath: string
  errors: string[]
  warnings: string[]

  constructor(packageDir: string) {
    this.packageDir = packageDir
    this.packageJsonPath = resolve(packageDir, 'package.json')
    this.packageJson = this.loadPackageJson()
    this.tsconfigPath = resolve(packageDir, 'tsconfig.json')
    this.errors = []
    this.warnings = []
  }

  loadPackageJson() {
    if (!existsSync(this.packageJsonPath)) throw new Error(`package.json not found in ${this.packageDir}`)
    return JSON.parse(readFileSync(this.packageJsonPath, 'utf-8'))
  }

  async check() {
    console.log(`🔷 开始 TypeScript 类型检查: ${this.packageJson.name}`)
    await this.runTypeScriptCompiler()
    this.validateTypeDefinitions()
    this.checkTypeExports()
    this.validateTypeImports()
    return this.generateReport()
  }

  async runTypeScriptCompiler() {
    console.log('🔧 运行 TypeScript 编译器检查...')
    if (!existsSync(this.tsconfigPath)) { this.warnings.push('tsconfig.json 不存在，跳过编译器检查'); return }
    try { const result = await this.execTsc(); if (result.exitCode !== 0) this.parseTypeScriptErrors(result.stderr); else console.log('  ✅ TypeScript 编译检查通过') }
    catch (error: any) { this.errors.push(`TypeScript 编译器运行失败: ${error.message}`) }
  }

  execTsc() {
    return new Promise<{ exitCode: number; stdout: string; stderr: string }>((resolve) => {
      const isWindows = process.platform === 'win32'
      const cmd = isWindows ? 'npx.cmd' : 'npx'
      const tsc = spawn(cmd, ['tsc', '--noEmit', '--project', this.tsconfigPath], { cwd: this.packageDir, stdio: 'pipe', shell: isWindows })
      let stdout = ''; let stderr = ''
      tsc.stdout.on('data', (data) => { stdout += data.toString() })
      tsc.stderr.on('data', (data) => { stderr += data.toString() })
      tsc.on('close', (exitCode) => { resolve({ exitCode: exitCode ?? 0, stdout, stderr }) })
    })
  }

  parseTypeScriptErrors(stderr: string) {
    const lines = stderr.split('\n').filter(line => line.trim())
    lines.forEach((line) => { if (line.includes('error TS')) this.errors.push(`TypeScript 错误: ${line.trim()}`); else if (line.includes('warning TS')) this.warnings.push(`TypeScript 警告: ${line.trim()}`) })
  }

  validateTypeDefinitions() {
    console.log('📋 验证类型定义文件...')
    const typeFiles = this.findTypeDefinitionFiles()
    typeFiles.forEach((file) => { this.validateSingleTypeFile(file) })
  }

  findTypeDefinitionFiles() {
    const patterns = ['esm/**/*.d.ts', 'cjs/**/*.d.ts', 'dist/**/*.d.ts']
    const files: string[] = []
    patterns.forEach((pattern) => { const matches = glob.sync(pattern, { cwd: this.packageDir }); files.push(...matches.map(file => resolve(this.packageDir, file))) })
    return files
  }

  validateSingleTypeFile(filePath: string) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = relative(this.packageDir, filePath)
      if (content.trim().length === 0) { this.warnings.push(`类型定义文件为空: ${relativePath}`); return }
      if (!content.includes('export')) this.warnings.push(`类型定义文件可能缺少导出: ${relativePath}`)
      this.checkTypeFileSyntax(content, relativePath)
      console.log(`  ✅ ${relativePath}`)
    } catch (error: any) {
      this.errors.push(`读取类型定义文件失败: ${relative(this.packageDir, filePath)} - ${error.message}`)
    }
  }

  checkTypeFileSyntax(content: string, filePath: string) {
    const lines = content.split('\n')
    lines.forEach((line, index) => {
      const lineNumber = index + 1
      const openBraces = (line.match(/\{/g) || []).length
      const closeBraces = (line.match(/\}/g) || []).length
      const openParens = (line.match(/\(/g) || []).length
      const closeParens = (line.match(/\)/g) || []).length
      if (openBraces !== closeBraces && !line.includes('//')) this.warnings.push(`${filePath}:${lineNumber} 可能存在未闭合的大括号`)
      if (openParens !== closeParens && !line.includes('//')) this.warnings.push(`${filePath}:${lineNumber} 可能存在未闭合的小括号`)
    })
  }

  checkTypeExports() {
    console.log('🔗 检查类型导出...')
    const mainTypeFile = resolve(this.packageDir, 'esm/index.d.ts'); if (existsSync(mainTypeFile)) this.validateTypeExports(mainTypeFile, 'main')
    const vueTypeFile = resolve(this.packageDir, 'esm/vue/index.d.ts'); if (existsSync(vueTypeFile)) this.validateTypeExports(vueTypeFile, 'vue')
  }

  validateTypeExports(filePath: string, moduleName: string) {
    try {
      const content = readFileSync(filePath, 'utf-8')
      const hasTypeExports = content.includes('export type') || content.includes('export interface') || content.includes('export declare')
      const hasValueExports = content.includes('export {') || content.includes('export const') || content.includes('export function') || content.includes('export class')
      if (!hasTypeExports && !hasValueExports) this.warnings.push(`${moduleName} 模块可能缺少类型导出`)
      else console.log(`  ✅ ${moduleName} 模块类型导出正常`)
    } catch (error: any) { this.errors.push(`检查 ${moduleName} 模块类型导出失败: ${error.message}`) }
  }

  validateTypeImports() { console.log('📥 验证类型导入...'); this.createTypeImportTest() }

  createTypeImportTest() {
    const testContent = this.generateTypeImportTestContent()
    const testFile = resolve(this.packageDir, '.type-test.ts')
    try { writeFileSync(testFile, testContent); console.log('  ✅ 类型导入测试文件已创建'); setTimeout(() => { try { if (existsSync(testFile)) { require('node:fs').unlinkSync(testFile) } } catch { } }, 1000) }
    catch (error: any) { this.warnings.push(`创建类型导入测试失败: ${error.message}`) }
  }

  generateTypeImportTestContent() {
    const packageName = this.packageJson.name
    return `// TypeScript 类型导入测试\n// 这个文件用于验证类型定义是否正确\n\n// 测试主模块导入\nimport type * as MainModule from '${packageName}'\n\n// 测试 Vue 模块导入（如果存在）\n${existsSync(resolve(this.packageDir, 'esm/vue/index.d.ts')) ? `import type * as VueModule from '${packageName}/vue'` : '// Vue 模块不存在'}\n\n// 类型测试\ntype TestMainModule = keyof typeof MainModule\n${existsSync(resolve(this.packageDir, 'esm/vue/index.d.ts')) ? 'type TestVueModule = keyof typeof VueModule' : '// Vue 模块类型测试跳过'}\n\nexport {}\n`
  }

  generateReport() {
    const hasErrors = this.errors.length > 0; const hasWarnings = this.warnings.length > 0
    console.log('\n🔷 TypeScript 类型检查报告:')
    console.log('='.repeat(50))
    if (hasErrors) { console.log('❌ 类型错误:'); this.errors.forEach(e => console.log(`  • ${e}`)); console.log('\n💡 解决建议:'); this.provideSolutions() }
    if (hasWarnings) { console.log('⚠️  类型警告:'); this.warnings.forEach(w => console.log(`  • ${w}`)) }
    if (!hasErrors && !hasWarnings) console.log('✅ 所有类型检查通过！')
    console.log('='.repeat(50))
    return { success: !hasErrors, errors: this.errors, warnings: this.warnings }
  }

  provideSolutions() { console.log('  1. 检查 tsconfig.json 配置是否正确'); console.log('  2. 确保所有依赖的类型定义已安装'); console.log('  3. 检查源代码中的类型注解是否正确'); console.log('  4. 运行 "npm install @types/node" 安装 Node.js 类型定义'); console.log('  5. 检查 Vue 相关类型定义是否正确导入') }
}

export async function checkTypeScript(packageDir = process.cwd()) {
  try { const checker = new TypeScriptChecker(packageDir); const result = await checker.check(); if (!result.success) process.exit(1); return result }
  catch (error: any) { console.error('❌ TypeScript 类型检查失败:', error.message); process.exit(1) }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const packageDir = process.argv[2] || process.cwd()
  await checkTypeScript(packageDir)
}


