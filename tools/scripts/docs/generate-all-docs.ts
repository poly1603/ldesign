#!/usr/bin/env tsx

/**
 * 批量文档生成脚本
 * 为所有包生成完整的文档
 */

import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { DocumentationGenerator } from './documentation-generator.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '../../..')

interface PackageInfo {
  name: string
  path: string
  hasSource: boolean
  hasExistingDocs: boolean
}

class BatchDocumentationGenerator {
  private packages: PackageInfo[] = []
  private results: Map<string, boolean> = new Map()

  /**
   * 生成所有包的文档
   */
  async generateAllDocs(): Promise<void> {
    console.log(chalk.blue('📚 开始批量生成文档...\n'))

    try {
      // 1. 发现所有包
      await this.discoverPackages()

      // 2. 生成每个包的文档
      await this.generatePackageDocs()

      // 3. 生成总览文档
      await this.generateOverviewDocs()

      // 4. 打印摘要
      this.printSummary()

      console.log(chalk.green('\n🎉 批量文档生成完成!'))
    }
    catch (error) {
      console.error(chalk.red('❌ 批量文档生成失败:'), error)
      throw error
    }
  }

  /**
   * 发现所有包
   */
  private async discoverPackages(): Promise<void> {
    console.log(chalk.yellow('🔍 发现包...'))

    const packagesDir = join(rootDir, 'packages')
    if (!existsSync(packagesDir)) {
      throw new Error('packages 目录不存在')
    }

    try {
      const dirs = execSync('ls', { cwd: packagesDir, encoding: 'utf-8' })
        .trim()
        .split('\n')
        .filter(Boolean)

      for (const dir of dirs) {
        const packagePath = join(packagesDir, dir)
        const packageJsonPath = join(packagePath, 'package.json')
        const srcPath = join(packagePath, 'src')
        const docsPath = join(packagePath, 'docs')

        if (existsSync(packageJsonPath)) {
          this.packages.push({
            name: dir,
            path: packagePath,
            hasSource: existsSync(srcPath),
            hasExistingDocs: existsSync(docsPath),
          })
        }
      }

      console.log(chalk.green(`✅ 发现 ${this.packages.length} 个包`))
    }
    catch (error) {
      console.error(chalk.red('发现包失败:'), error)
      throw error
    }
  }

  /**
   * 生成包文档
   */
  private async generatePackageDocs(): Promise<void> {
    console.log(chalk.yellow('📝 生成包文档...'))

    for (const pkg of this.packages) {
      if (!pkg.hasSource) {
        console.log(chalk.gray(`⏭️ 跳过 ${pkg.name} (无源码)`))
        this.results.set(pkg.name, true)
        continue
      }

      console.log(chalk.blue(`📦 生成 ${pkg.name} 文档...`))

      try {
        const config = {
          packageName: `@ldesign/${pkg.name}`,
          sourceDir: join(pkg.path, 'src'),
          outputDir: join(pkg.path, 'docs'),
          generateExamples: true,
          generatePlayground: true,
        }

        const generator = new DocumentationGenerator(config)
        await generator.generateDocs()

        this.results.set(pkg.name, true)
        console.log(chalk.green(`✅ ${pkg.name} 文档生成成功`))
      }
      catch (error) {
        this.results.set(pkg.name, false)
        console.error(chalk.red(`❌ ${pkg.name} 文档生成失败:`), error)
      }
    }
  }

  /**
   * 生成总览文档
   */
  private async generateOverviewDocs(): Promise<void> {
    console.log(chalk.yellow('📋 生成总览文档...'))

    try {
      // 生成包列表文档
      const packageListContent = this.generatePackageListDoc()
      const docsDir = join(rootDir, 'docs')

      if (!existsSync(docsDir)) {
        execSync(`mkdir -p ${docsDir}`)
      }

      // 写入包列表文档
      const fs = await import('node:fs/promises')
      await fs.writeFile(join(docsDir, 'packages.md'), packageListContent)

      // 生成 API 索引
      const apiIndexContent = this.generateAPIIndexDoc()
      await fs.writeFile(join(docsDir, 'api-index.md'), apiIndexContent)

      console.log(chalk.green('✅ 总览文档生成完成'))
    }
    catch (error) {
      console.error(chalk.red('总览文档生成失败:'), error)
    }
  }

  /**
   * 生成包列表文档
   */
  private generatePackageListDoc(): string {
    const successfulPackages = this.packages.filter(pkg =>
      this.results.get(pkg.name),
    )
    const failedPackages = this.packages.filter(
      pkg => !this.results.get(pkg.name),
    )

    return `# LDesign 包列表

## 概览

LDesign 是一个模块化的前端工具库，包含以下包：

## 可用包

${successfulPackages
  .map((pkg) => {
    const packageJsonPath = join(pkg.path, 'package.json')
    let description = ''
    let version = ''

    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
      description = packageJson.description || '暂无描述'
      version = packageJson.version || '0.0.0'
    }
    catch {
      description = '暂无描述'
      version = '0.0.0'
    }

    return `### [@ldesign/${pkg.name}](./packages/${pkg.name}/) v${version}

${description}

- [API 文档](./packages/${pkg.name}/docs/api/)
- [示例代码](./packages/${pkg.name}/docs/examples/)
- [在线演示](./packages/${pkg.name}/docs/playground/)
`
  })
  .join('\n')}

## 安装

### 安装所有包

\`\`\`bash
pnpm add @ldesign/engine @ldesign/color @ldesign/crypto @ldesign/device @ldesign/http @ldesign/i18n @ldesign/router @ldesign/store @ldesign/template
\`\`\`

### 按需安装

\`\`\`bash
# 只安装需要的包
pnpm add @ldesign/engine @ldesign/color
\`\`\`

## 快速开始

\`\`\`typescript
import { Engine } from '@ldesign/engine'
import { ColorUtils } from '@ldesign/color'

// 创建引擎实例
const engine = new Engine()

// 使用颜色工具
const color = ColorUtils.hexToRgb('#ff0000')
console.log(color) // { r: 255, g: 0, b: 0 }
\`\`\`

## 开发状态

| 包名 | 状态 | 文档 | 测试覆盖率 |
|------|------|------|------------|
${this.packages
  .map((pkg) => {
    const status = this.results.get(pkg.name) ? '✅ 稳定' : '🚧 开发中'
    const docs = pkg.hasExistingDocs ? '✅ 完整' : '📝 进行中'
    return `| @ldesign/${pkg.name} | ${status} | ${docs} | - |`
  })
  .join('\n')}

${
  failedPackages.length > 0
    ? `
## 待完善包

以下包的文档生成失败，需要进一步完善：

${failedPackages.map(pkg => `- @ldesign/${pkg.name}`).join('\n')}
`
    : ''
}

## 贡献指南

欢迎贡献代码和文档！请查看 [贡献指南](./CONTRIBUTING.md) 了解详情。

## 许可证

MIT License
`
  }

  /**
   * 生成 API 索引文档
   */
  private generateAPIIndexDoc(): string {
    return `# API 索引

## 按包分类

${this.packages
  .filter(pkg => this.results.get(pkg.name))
  .map(
    pkg => `
### @ldesign/${pkg.name}

- [完整 API 文档](./packages/${pkg.name}/docs/api/)
- [示例代码](./packages/${pkg.name}/docs/examples/)
`,
  )
  .join('\n')}

## 按功能分类

### 核心功能
- [@ldesign/engine](./packages/engine/docs/api/) - 核心引擎和插件系统

### 工具类
- [@ldesign/color](./packages/color/docs/api/) - 颜色处理工具
- [@ldesign/crypto](./packages/crypto/docs/api/) - 加密解密工具
- [@ldesign/device](./packages/device/docs/api/) - 设备检测工具
- [@ldesign/http](./packages/http/docs/api/) - HTTP 客户端

### 框架集成
- [@ldesign/router](./packages/router/docs/api/) - 路由管理
- [@ldesign/store](./packages/store/docs/api/) - 状态管理
- [@ldesign/i18n](./packages/i18n/docs/api/) - 国际化

### 模板和渲染
- [@ldesign/template](./packages/template/docs/api/) - 模板引擎

## 搜索 API

使用浏览器的搜索功能 (Ctrl+F / Cmd+F) 在此页面搜索特定的 API。

## 常用 API 快速链接

### 颜色处理
- [ColorUtils.hexToRgb](./packages/color/docs/api/colorutils#hexToRgb)
- [ColorUtils.rgbToHex](./packages/color/docs/api/colorutils#rgbToHex)

### 加密解密
- [AESCrypto.encrypt](./packages/crypto/docs/api/aescrypto#encrypt)
- [AESCrypto.decrypt](./packages/crypto/docs/api/aescrypto#decrypt)

### 设备检测
- [DeviceDetector.isMobile](./packages/device/docs/api/devicedetector#isMobile)
- [DeviceDetector.getBrowser](./packages/device/docs/api/devicedetector#getBrowser)

### HTTP 请求
- [HttpClient.get](./packages/http/docs/api/httpclient#get)
- [HttpClient.post](./packages/http/docs/api/httpclient#post)
`
  }

  /**
   * 打印摘要
   */
  private printSummary(): void {
    console.log(chalk.blue('\n📊 文档生成摘要'))
    console.log(chalk.blue('='.repeat(50)))

    const totalPackages = this.packages.length
    const successfulPackages = Array.from(this.results.values()).filter(
      Boolean,
    ).length
    const failedPackages = totalPackages - successfulPackages

    console.log(`总包数: ${totalPackages}`)
    console.log(`成功: ${successfulPackages}`)
    console.log(`失败: ${failedPackages}`)
    console.log(
      `成功率: ${((successfulPackages / totalPackages) * 100).toFixed(1)}%`,
    )

    if (failedPackages > 0) {
      console.log(chalk.red('\n❌ 失败的包:'))
      for (const [name, success] of this.results) {
        if (!success) {
          console.log(chalk.red(`  - ${name}`))
        }
      }
    }
  }
}

// CLI 处理
async function main() {
  const generator = new BatchDocumentationGenerator()

  try {
    await generator.generateAllDocs()
    process.exit(0)
  }
  catch (error) {
    console.error(chalk.red('批量文档生成失败:'), error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { BatchDocumentationGenerator }
