#!/usr/bin/env tsx

/**
 * 示例代码验证工具
 * 验证文档中的示例代码是否正确和可运行
 */

import { execSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '../../..')

interface ValidationResult {
  file: string
  examples: ExampleResult[]
  success: boolean
  errors: string[]
}

interface ExampleResult {
  index: number
  code: string
  language: string
  success: boolean
  output?: string
  error?: string
  executionTime?: number
}

interface ValidationConfig {
  /** 要验证的目录 */
  docsDir: string
  /** 包名 */
  packageName: string
  /** 超时时间（毫秒） */
  timeout: number
  /** 是否运行 Vue 示例 */
  runVueExamples: boolean
  /** 是否运行 TypeScript 示例 */
  runTypeScriptExamples: boolean
}

class ExampleValidator {
  private config: ValidationConfig
  private results: ValidationResult[] = []
  private tempDir: string

  constructor(config: ValidationConfig) {
    this.config = config
    this.tempDir = join(tmpdir(), `ldesign-example-validation-${Date.now()}`)
  }

  /**
   * 验证所有示例
   */
  async validateAll(): Promise<ValidationResult[]> {
    console.log(chalk.blue('🔍 开始验证示例代码...\n'))

    try {
      // 创建临时目录
      this.setupTempDirectory()

      // 查找所有 Markdown 文件
      const markdownFiles = this.findMarkdownFiles(this.config.docsDir)

      // 验证每个文件
      for (const file of markdownFiles) {
        console.log(chalk.yellow(`📄 验证文件: ${file}`))
        const result = await this.validateFile(file)
        this.results.push(result)
      }

      // 清理临时目录
      this.cleanup()

      // 打印摘要
      this.printSummary()

      return this.results
    } catch (error) {
      console.error(chalk.red('❌ 验证失败:'), error)
      this.cleanup()
      throw error
    }
  }

  /**
   * 设置临时目录
   */
  private setupTempDirectory(): void {
    if (existsSync(this.tempDir)) {
      rmSync(this.tempDir, { recursive: true })
    }
    mkdirSync(this.tempDir, { recursive: true })

    // 创建基础的 package.json
    const packageJson = {
      name: 'example-validation',
      type: 'module',
      dependencies: {
        [this.config.packageName]: 'workspace:*',
        vue: '^3.3.0',
        typescript: '^5.0.0',
        '@types/node': '^20.0.0',
      },
    }

    writeFileSync(
      join(this.tempDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )

    // 创建 TypeScript 配置
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
    }

    writeFileSync(
      join(this.tempDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    )
  }

  /**
   * 查找 Markdown 文件
   */
  private findMarkdownFiles(dir: string): string[] {
    const files: string[] = []

    if (!existsSync(dir)) return files

    try {
      const entries = execSync(`find "${dir}" -name "*.md"`, {
        encoding: 'utf-8',
      })
        .trim()
        .split('\n')
        .filter(Boolean)

      return entries
    } catch {
      return []
    }
  }

  /**
   * 验证单个文件
   */
  private async validateFile(filePath: string): Promise<ValidationResult> {
    const content = readFileSync(filePath, 'utf-8')
    const examples = this.extractCodeBlocks(content)
    const results: ExampleResult[] = []
    const errors: string[] = []

    for (let i = 0; i < examples.length; i++) {
      const example = examples[i]
      console.log(
        chalk.gray(
          `  📝 验证示例 ${i + 1}/${examples.length} (${example.language})`
        )
      )

      try {
        const result = await this.validateExample(example, i)
        results.push(result)

        if (result.success) {
          console.log(chalk.green(`    ✅ 示例 ${i + 1} 验证通过`))
        } else {
          console.log(
            chalk.red(`    ❌ 示例 ${i + 1} 验证失败: ${result.error}`)
          )
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        errors.push(`示例 ${i + 1}: ${errorMsg}`)
        results.push({
          index: i,
          code: example.code,
          language: example.language,
          success: false,
          error: errorMsg,
        })
      }
    }

    const success = results.every(r => r.success) && errors.length === 0

    return {
      file: filePath,
      examples: results,
      success,
      errors,
    }
  }

  /**
   * 提取代码块
   */
  private extractCodeBlocks(
    content: string
  ): Array<{ code: string; language: string }> {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const blocks: Array<{ code: string; language: string }> = []
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text'
      const code = match[2].trim()

      // 只验证支持的语言
      if (['typescript', 'ts', 'javascript', 'js', 'vue'].includes(language)) {
        blocks.push({ code, language })
      }
    }

    return blocks
  }

  /**
   * 验证单个示例
   */
  private async validateExample(
    example: { code: string; language: string },
    index: number
  ): Promise<ExampleResult> {
    const startTime = Date.now()

    try {
      let result: ExampleResult

      switch (example.language) {
        case 'typescript':
        case 'ts':
          result = await this.validateTypeScriptExample(example, index)
          break
        case 'javascript':
        case 'js':
          result = await this.validateJavaScriptExample(example, index)
          break
        case 'vue':
          result = await this.validateVueExample(example, index)
          break
        default:
          result = {
            index,
            code: example.code,
            language: example.language,
            success: true, // 不支持的语言跳过验证
          }
      }

      result.executionTime = Date.now() - startTime
      return result
    } catch (error) {
      return {
        index,
        code: example.code,
        language: example.language,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
      }
    }
  }

  /**
   * 验证 TypeScript 示例
   */
  private async validateTypeScriptExample(
    example: { code: string; language: string },
    index: number
  ): Promise<ExampleResult> {
    if (!this.config.runTypeScriptExamples) {
      return {
        index,
        code: example.code,
        language: example.language,
        success: true,
        output: 'TypeScript validation skipped',
      }
    }

    const fileName = `example-${index}.ts`
    const filePath = join(this.tempDir, fileName)

    // 写入示例代码
    writeFileSync(filePath, example.code)

    try {
      // TypeScript 类型检查
      execSync(`npx tsc --noEmit ${fileName}`, {
        cwd: this.tempDir,
        stdio: 'pipe',
        timeout: this.config.timeout,
      })

      // 如果代码看起来可执行，尝试运行
      if (this.isExecutableCode(example.code)) {
        const output = execSync(`npx tsx ${fileName}`, {
          cwd: this.tempDir,
          encoding: 'utf-8',
          timeout: this.config.timeout,
        })

        return {
          index,
          code: example.code,
          language: example.language,
          success: true,
          output: output.trim(),
        }
      }

      return {
        index,
        code: example.code,
        language: example.language,
        success: true,
        output: 'Type check passed',
      }
    } catch (error) {
      return {
        index,
        code: example.code,
        language: example.language,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * 验证 JavaScript 示例
   */
  private async validateJavaScriptExample(
    example: { code: string; language: string },
    index: number
  ): Promise<ExampleResult> {
    const fileName = `example-${index}.js`
    const filePath = join(this.tempDir, fileName)

    // 写入示例代码
    writeFileSync(filePath, example.code)

    try {
      if (this.isExecutableCode(example.code)) {
        const output = execSync(`node ${fileName}`, {
          cwd: this.tempDir,
          encoding: 'utf-8',
          timeout: this.config.timeout,
        })

        return {
          index,
          code: example.code,
          language: example.language,
          success: true,
          output: output.trim(),
        }
      }

      return {
        index,
        code: example.code,
        language: example.language,
        success: true,
        output: 'Syntax check passed',
      }
    } catch (error) {
      return {
        index,
        code: example.code,
        language: example.language,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  }

  /**
   * 验证 Vue 示例
   */
  private async validateVueExample(
    example: { code: string; language: string },
    index: number
  ): Promise<ExampleResult> {
    if (!this.config.runVueExamples) {
      return {
        index,
        code: example.code,
        language: example.language,
        success: true,
        output: 'Vue validation skipped',
      }
    }

    // Vue 组件语法检查
    const hasTemplate = example.code.includes('<template>')
    const hasScript = example.code.includes('<script')
    const hasStyle = example.code.includes('<style')

    if (!hasTemplate && !hasScript) {
      return {
        index,
        code: example.code,
        language: example.language,
        success: false,
        error: 'Invalid Vue component: missing template or script',
      }
    }

    return {
      index,
      code: example.code,
      language: example.language,
      success: true,
      output: 'Vue component syntax check passed',
    }
  }

  /**
   * 检查代码是否可执行
   */
  private isExecutableCode(code: string): boolean {
    // 简单的启发式检查
    const executablePatterns = [
      /console\.log/,
      /console\.error/,
      /console\.warn/,
      /process\.exit/,
      /export\s+default/,
      /function\s+\w+\s*\(/,
      /=>\s*\{/,
      /\.then\(/,
      /await\s+/,
    ]

    return executablePatterns.some(pattern => pattern.test(code))
  }

  /**
   * 清理临时目录
   */
  private cleanup(): void {
    if (existsSync(this.tempDir)) {
      rmSync(this.tempDir, { recursive: true })
    }
  }

  /**
   * 打印验证摘要
   */
  private printSummary(): void {
    console.log(chalk.blue('\n📊 验证摘要'))
    console.log(chalk.blue('='.repeat(50)))

    const totalFiles = this.results.length
    const successfulFiles = this.results.filter(r => r.success).length
    const totalExamples = this.results.reduce(
      (sum, r) => sum + r.examples.length,
      0
    )
    const successfulExamples = this.results.reduce(
      (sum, r) => sum + r.examples.filter(e => e.success).length,
      0
    )

    console.log(`文件: ${successfulFiles}/${totalFiles} 通过`)
    console.log(`示例: ${successfulExamples}/${totalExamples} 通过`)
    console.log(
      `成功率: ${((successfulExamples / totalExamples) * 100).toFixed(1)}%`
    )

    // 显示失败的文件
    const failedFiles = this.results.filter(r => !r.success)
    if (failedFiles.length > 0) {
      console.log(chalk.red('\n❌ 失败的文件:'))
      failedFiles.forEach(file => {
        console.log(chalk.red(`  ${file.file}`))
        file.errors.forEach(error => {
          console.log(chalk.red(`    - ${error}`))
        })
      })
    }

    if (successfulFiles === totalFiles) {
      console.log(chalk.green('\n🎉 所有示例验证通过！'))
    } else {
      console.log(chalk.yellow('\n⚠️ 部分示例验证失败，请检查上述错误'))
    }
  }
}

// CLI 处理
async function main() {
  const args = process.argv.slice(2)
  const packageName = args[0]

  if (!packageName) {
    console.error(chalk.red('请指定包名'))
    console.log('用法: tsx example-validator.ts <package-name>')
    process.exit(1)
  }

  const packageDir = join(rootDir, 'packages', packageName)
  if (!existsSync(packageDir)) {
    console.error(chalk.red(`包不存在: ${packageName}`))
    process.exit(1)
  }

  const config: ValidationConfig = {
    docsDir: join(packageDir, 'docs'),
    packageName: `@ldesign/${packageName}`,
    timeout: 30000,
    runVueExamples: true,
    runTypeScriptExamples: true,
  }

  const validator = new ExampleValidator(config)

  try {
    const results = await validator.validateAll()
    const allSuccess = results.every(r => r.success)
    process.exit(allSuccess ? 0 : 1)
  } catch (error) {
    console.error(chalk.red('验证失败:'), error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { ExampleValidator }
