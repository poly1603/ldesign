#!/usr/bin/env tsx

/**
 * 自动化文档生成工具
 * 从 TypeScript 代码生成 API 文档和示例
 */

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '../../..')

interface DocConfig {
  /** 包名 */
  packageName: string
  /** 源码目录 */
  sourceDir: string
  /** 文档输出目录 */
  outputDir: string
  /** 是否生成示例 */
  generateExamples: boolean
  /** 是否生成交互式演示 */
  generatePlayground: boolean
}

interface APIItem {
  name: string
  type: 'function' | 'class' | 'interface' | 'type' | 'variable'
  description: string
  signature: string
  examples: string[]
  parameters?: Parameter[]
  returns?: string
}

interface Parameter {
  name: string
  type: string
  description: string
  optional: boolean
  defaultValue?: string
}

class DocumentationGenerator {
  private config: DocConfig
  private apiItems: APIItem[] = []

  constructor(config: DocConfig) {
    this.config = config
  }

  /**
   * 生成完整文档
   */
  async generateDocs(): Promise<void> {
    console.log(chalk.blue(`📚 生成 ${this.config.packageName} 文档...`))

    try {
      // 1. 解析 TypeScript 代码
      await this.parseTypeScriptCode()

      // 2. 生成 API 文档
      await this.generateAPIDocumentation()

      // 3. 生成示例代码
      if (this.config.generateExamples) {
        await this.generateExamples()
      }

      // 4. 生成交互式演示
      if (this.config.generatePlayground) {
        await this.generatePlayground()
      }

      // 5. 生成导航和索引
      await this.generateNavigation()

      console.log(chalk.green(`✅ ${this.config.packageName} 文档生成完成`))
    } catch (error) {
      console.error(chalk.red(`❌ 文档生成失败:`), error)
      throw error
    }
  }

  /**
   * 解析 TypeScript 代码
   */
  private async parseTypeScriptCode(): Promise<void> {
    console.log(chalk.yellow('🔍 解析 TypeScript 代码...'))

    try {
      // 使用 TypeDoc 解析 TypeScript
      const typedocConfig = {
        entryPoints: [join(this.config.sourceDir, 'index.ts')],
        out: join(this.config.outputDir, 'typedoc'),
        json: join(this.config.outputDir, 'api.json'),
        excludePrivate: true,
        excludeProtected: true,
        excludeInternal: true,
        readme: 'none',
      }

      // 生成 TypeDoc 配置文件
      const configPath = join(this.config.outputDir, 'typedoc.json')
      writeFileSync(configPath, JSON.stringify(typedocConfig, null, 2))

      // 运行 TypeDoc
      execSync(`npx typedoc --options ${configPath}`, {
        stdio: 'pipe',
        cwd: this.config.sourceDir,
      })

      // 解析生成的 JSON
      const apiJsonPath = join(this.config.outputDir, 'api.json')
      if (existsSync(apiJsonPath)) {
        const apiData = JSON.parse(readFileSync(apiJsonPath, 'utf-8'))
        this.parseAPIData(apiData)
      }

      console.log(
        chalk.green(`✅ 解析完成，发现 ${this.apiItems.length} 个 API 项`)
      )
    } catch (error) {
      console.warn(chalk.yellow('⚠️ TypeScript 解析失败，使用备用方案'))
      await this.parseWithBackupMethod()
    }
  }

  /**
   * 备用解析方法
   */
  private async parseWithBackupMethod(): Promise<void> {
    // 简单的正则表达式解析
    const indexPath = join(this.config.sourceDir, 'index.ts')
    if (!existsSync(indexPath)) return

    const content = readFileSync(indexPath, 'utf-8')

    // 解析导出的函数
    const functionRegex = /export\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g
    let match
    while ((match = functionRegex.exec(content)) !== null) {
      this.apiItems.push({
        name: match[1],
        type: 'function',
        description: `${match[1]} 函数`,
        signature: match[0],
        examples: [],
      })
    }

    // 解析导出的类
    const classRegex = /export\s+class\s+(\w+)/g
    while ((match = classRegex.exec(content)) !== null) {
      this.apiItems.push({
        name: match[1],
        type: 'class',
        description: `${match[1]} 类`,
        signature: match[0],
        examples: [],
      })
    }
  }

  /**
   * 解析 API 数据
   */
  private parseAPIData(data: any): void {
    if (!data.children) return

    for (const child of data.children) {
      if (child.flags?.isExported) {
        const apiItem: APIItem = {
          name: child.name,
          type: this.getAPIType(child),
          description: this.extractDescription(child),
          signature: this.extractSignature(child),
          examples: this.extractExamples(child),
        }

        if (child.signatures) {
          apiItem.parameters = this.extractParameters(child.signatures[0])
          apiItem.returns = this.extractReturns(child.signatures[0])
        }

        this.apiItems.push(apiItem)
      }
    }
  }

  /**
   * 获取 API 类型
   */
  private getAPIType(item: any): APIItem['type'] {
    if (item.kind === 64) return 'function'
    if (item.kind === 128) return 'class'
    if (item.kind === 256) return 'interface'
    if (item.kind === 4194304) return 'type'
    return 'variable'
  }

  /**
   * 提取描述
   */
  private extractDescription(item: any): string {
    if (item.comment?.summary) {
      return item.comment.summary.map((s: any) => s.text).join('')
    }
    return `${item.name} API`
  }

  /**
   * 提取签名
   */
  private extractSignature(item: any): string {
    if (item.signatures?.[0]?.name) {
      return `${item.signatures[0].name}(${this.extractParameterSignature(
        item.signatures[0]
      )})`
    }
    return item.name
  }

  /**
   * 提取参数签名
   */
  private extractParameterSignature(signature: any): string {
    if (!signature.parameters) return ''

    return signature.parameters
      .map((param: any) => {
        const optional = param.flags?.isOptional ? '?' : ''
        const type = param.type?.name || 'any'
        return `${param.name}${optional}: ${type}`
      })
      .join(', ')
  }

  /**
   * 提取示例
   */
  private extractExamples(item: any): string[] {
    const examples: string[] = []

    if (item.comment?.blockTags) {
      for (const tag of item.comment.blockTags) {
        if (tag.tag === '@example') {
          examples.push(tag.content.map((c: any) => c.text).join(''))
        }
      }
    }

    return examples
  }

  /**
   * 提取参数
   */
  private extractParameters(signature: any): Parameter[] {
    if (!signature.parameters) return []

    return signature.parameters.map((param: any) => ({
      name: param.name,
      type: param.type?.name || 'any',
      description:
        param.comment?.summary?.map((s: any) => s.text).join('') || '',
      optional: param.flags?.isOptional || false,
      defaultValue: param.defaultValue,
    }))
  }

  /**
   * 提取返回值
   */
  private extractReturns(signature: any): string {
    if (signature.type?.name) {
      return signature.type.name
    }
    return 'void'
  }

  /**
   * 生成 API 文档
   */
  private async generateAPIDocumentation(): Promise<void> {
    console.log(chalk.yellow('📝 生成 API 文档...'))

    const apiDir = join(this.config.outputDir, 'api')
    if (!existsSync(apiDir)) {
      mkdirSync(apiDir, { recursive: true })
    }

    // 生成总览页面
    const overviewContent = this.generateAPIOverview()
    writeFileSync(join(apiDir, 'index.md'), overviewContent)

    // 为每个 API 项生成详细页面
    for (const item of this.apiItems) {
      const content = this.generateAPIItemPage(item)
      writeFileSync(join(apiDir, `${item.name.toLowerCase()}.md`), content)
    }

    console.log(
      chalk.green(`✅ 生成了 ${this.apiItems.length + 1} 个 API 文档页面`)
    )
  }

  /**
   * 生成 API 总览
   */
  private generateAPIOverview(): string {
    return `# API 参考

## 概览

${this.config.packageName} 提供了以下 API：

${this.apiItems
  .map(
    item =>
      `- [${item.name}](./${item.name.toLowerCase()}) - ${item.description}`
  )
  .join('\n')}

## 快速索引

### 函数
${this.apiItems
  .filter(item => item.type === 'function')
  .map(item => `- [${item.name}](./${item.name.toLowerCase()})`)
  .join('\n')}

### 类
${this.apiItems
  .filter(item => item.type === 'class')
  .map(item => `- [${item.name}](./${item.name.toLowerCase()})`)
  .join('\n')}

### 接口
${this.apiItems
  .filter(item => item.type === 'interface')
  .map(item => `- [${item.name}](./${item.name.toLowerCase()})`)
  .join('\n')}

### 类型
${this.apiItems
  .filter(item => item.type === 'type')
  .map(item => `- [${item.name}](./${item.name.toLowerCase()})`)
  .join('\n')}
`
  }

  /**
   * 生成 API 项页面
   */
  private generateAPIItemPage(item: APIItem): string {
    let content = `# ${item.name}

${item.description}

## 签名

\`\`\`typescript
${item.signature}
\`\`\`
`

    if (item.parameters && item.parameters.length > 0) {
      content += `
## 参数

| 参数名 | 类型 | 必需 | 默认值 | 描述 |
|--------|------|------|--------|------|
${item.parameters
  .map(
    param =>
      `| ${param.name} | \`${param.type}\` | ${
        param.optional ? '否' : '是'
      } | ${param.defaultValue || '-'} | ${param.description} |`
  )
  .join('\n')}
`
    }

    if (item.returns) {
      content += `
## 返回值

\`${item.returns}\`
`
    }

    if (item.examples.length > 0) {
      content += `
## 示例

${item.examples
  .map(
    (example, index) => `
### 示例 ${index + 1}

\`\`\`typescript
${example}
\`\`\`
`
  )
  .join('\n')}
`
    }

    return content
  }

  /**
   * 生成示例代码
   */
  private async generateExamples(): Promise<void> {
    console.log(chalk.yellow('📋 生成示例代码...'))

    const examplesDir = join(this.config.outputDir, 'examples')
    if (!existsSync(examplesDir)) {
      mkdirSync(examplesDir, { recursive: true })
    }

    // 生成基础示例
    const basicExample = this.generateBasicExample()
    writeFileSync(join(examplesDir, 'basic.md'), basicExample)

    // 生成高级示例
    const advancedExample = this.generateAdvancedExample()
    writeFileSync(join(examplesDir, 'advanced.md'), advancedExample)

    console.log(chalk.green('✅ 示例代码生成完成'))
  }

  /**
   * 生成基础示例
   */
  private generateBasicExample(): string {
    return `# 基础示例

## 安装

\`\`\`bash
pnpm add ${this.config.packageName}
\`\`\`

## 基本用法

\`\`\`typescript
import { ${this.apiItems[0]?.name || 'main'} } from '${this.config.packageName}'

// 基础使用示例
const result = ${this.apiItems[0]?.name || 'main'}()
console.log(result)
\`\`\`

## Vue 集成

\`\`\`vue
<template>
  <div>
    <!-- 组件使用示例 -->
  </div>
</template>

<script setup lang="ts">
import { ${this.apiItems[0]?.name || 'main'} } from '${this.config.packageName}'

// Vue 组合式 API 使用
const result = ${this.apiItems[0]?.name || 'main'}()
</script>
\`\`\`
`
  }

  /**
   * 生成高级示例
   */
  private generateAdvancedExample(): string {
    return `# 高级示例

## 复杂配置

\`\`\`typescript
import { ${this.apiItems
      .slice(0, 3)
      .map(item => item.name)
      .join(', ')} } from '${this.config.packageName}'

// 高级配置示例
const config = {
  // 配置选项
}

// 使用配置
${this.apiItems
  .slice(0, 3)
  .map(item => `const ${item.name.toLowerCase()}Result = ${item.name}(config)`)
  .join('\n')}
\`\`\`

## 最佳实践

### 错误处理

\`\`\`typescript
try {
  const result = ${this.apiItems[0]?.name || 'main'}()
  // 处理成功结果
} catch (error) {
  // 处理错误
  console.error('操作失败:', error)
}
\`\`\`

### 性能优化

\`\`\`typescript
// 使用缓存
const cache = new Map()

function optimized${this.apiItems[0]?.name || 'Function'}(input: any) {
  if (cache.has(input)) {
    return cache.get(input)
  }
  
  const result = ${this.apiItems[0]?.name || 'main'}(input)
  cache.set(input, result)
  return result
}
\`\`\`
`
  }

  /**
   * 生成交互式演示
   */
  private async generatePlayground(): Promise<void> {
    console.log(chalk.yellow('🎮 生成交互式演示...'))

    const playgroundDir = join(this.config.outputDir, 'playground')
    if (!existsSync(playgroundDir)) {
      mkdirSync(playgroundDir, { recursive: true })
    }

    // 生成演示页面
    const playgroundContent = this.generatePlaygroundPage()
    writeFileSync(join(playgroundDir, 'index.md'), playgroundContent)

    console.log(chalk.green('✅ 交互式演示生成完成'))
  }

  /**
   * 生成演示页面
   */
  private generatePlaygroundPage(): string {
    return `# 在线演示

<script setup>
import { ref } from 'vue'
import { ${this.apiItems[0]?.name || 'main'} } from '${this.config.packageName}'

const input = ref('')
const output = ref('')

function runExample() {
  try {
    const result = ${this.apiItems[0]?.name || 'main'}(input.value)
    output.value = JSON.stringify(result, null, 2)
  } catch (error) {
    output.value = 'Error: ' + error.message
  }
}
</script>

<div class="playground">
  <div class="input-section">
    <h3>输入</h3>
    <textarea v-model="input" placeholder="输入参数..."></textarea>
    <button @click="runExample">运行</button>
  </div>
  
  <div class="output-section">
    <h3>输出</h3>
    <pre>{{ output }}</pre>
  </div>
</div>

<style>
.playground {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

.input-section, .output-section {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
}

textarea {
  width: 100%;
  height: 200px;
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background: #007acc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}
</style>
`
  }

  /**
   * 生成导航
   */
  private async generateNavigation(): Promise<void> {
    console.log(chalk.yellow('🧭 生成导航...'))

    const navContent = `# ${this.config.packageName}

## 快速导航

- [API 参考](./api/)
- [示例代码](./examples/)
- [在线演示](./playground/)

## API 列表

${this.apiItems
  .map(
    item =>
      `- [${item.name}](./api/${item.name.toLowerCase()}) - ${item.description}`
  )
  .join('\n')}
`

    writeFileSync(join(this.config.outputDir, 'index.md'), navContent)
    console.log(chalk.green('✅ 导航生成完成'))
  }
}

// CLI 处理
async function main() {
  const args = process.argv.slice(2)
  const packageName = args[0]

  if (!packageName) {
    console.error(chalk.red('请指定包名'))
    console.log('用法: tsx documentation-generator.ts <package-name>')
    process.exit(1)
  }

  const packageDir = join(rootDir, 'packages', packageName)
  if (!existsSync(packageDir)) {
    console.error(chalk.red(`包不存在: ${packageName}`))
    process.exit(1)
  }

  const config: DocConfig = {
    packageName: `@ldesign/${packageName}`,
    sourceDir: join(packageDir, 'src'),
    outputDir: join(packageDir, 'docs'),
    generateExamples: true,
    generatePlayground: true,
  }

  const generator = new DocumentationGenerator(config)

  try {
    await generator.generateDocs()
    console.log(chalk.green('\n🎉 文档生成完成!'))
  } catch (error) {
    console.error(chalk.red('文档生成失败:'), error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { DocumentationGenerator }
