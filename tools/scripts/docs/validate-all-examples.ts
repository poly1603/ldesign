#!/usr/bin/env tsx

/**
 * 批量示例验证脚本
 * 验证所有包的示例代码
 */

import { execSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { ExampleValidator } from './example-validator.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const rootDir = resolve(__dirname, '../../..')

interface PackageValidationResult {
  packageName: string
  success: boolean
  totalFiles: number
  totalExamples: number
  successfulExamples: number
  errors: string[]
}

class BatchExampleValidator {
  private packages: string[] = []
  private results: PackageValidationResult[] = []

  /**
   * 验证所有包的示例
   */
  async validateAllExamples(): Promise<void> {
    console.log(chalk.blue('🔍 开始批量验证示例代码...\n'))

    try {
      // 1. 发现所有包
      await this.discoverPackages()

      // 2. 验证每个包的示例
      await this.validatePackageExamples()

      // 3. 生成验证报告
      await this.generateValidationReport()

      // 4. 打印摘要
      this.printSummary()

      console.log(chalk.green('\n🎉 批量示例验证完成!'))
    } catch (error) {
      console.error(chalk.red('❌ 批量示例验证失败:'), error)
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
        const docsPath = join(packagePath, 'docs')

        // 只验证有文档的包
        if (existsSync(docsPath)) {
          this.packages.push(dir)
        }
      }

      console.log(chalk.green(`✅ 发现 ${this.packages.length} 个有文档的包`))
    } catch (error) {
      console.error(chalk.red('发现包失败:'), error)
      throw error
    }
  }

  /**
   * 验证包示例
   */
  private async validatePackageExamples(): Promise<void> {
    console.log(chalk.yellow('🧪 验证包示例...'))

    for (const packageName of this.packages) {
      console.log(chalk.blue(`📦 验证 ${packageName} 示例...`))

      try {
        const packageDir = join(rootDir, 'packages', packageName)
        const config = {
          docsDir: join(packageDir, 'docs'),
          packageName: `@ldesign/${packageName}`,
          timeout: 30000,
          runVueExamples: true,
          runTypeScriptExamples: true,
        }

        const validator = new ExampleValidator(config)
        const validationResults = await validator.validateAll()

        // 统计结果
        const totalFiles = validationResults.length
        const totalExamples = validationResults.reduce(
          (sum, r) => sum + r.examples.length,
          0
        )
        const successfulExamples = validationResults.reduce(
          (sum, r) => sum + r.examples.filter(e => e.success).length,
          0
        )
        const errors = validationResults
          .filter(r => !r.success)
          .flatMap(r => r.errors)

        const result: PackageValidationResult = {
          packageName,
          success: validationResults.every(r => r.success),
          totalFiles,
          totalExamples,
          successfulExamples,
          errors,
        }

        this.results.push(result)

        if (result.success) {
          console.log(
            chalk.green(
              `✅ ${packageName} 验证通过 (${successfulExamples}/${totalExamples} 示例)`
            )
          )
        } else {
          console.log(
            chalk.red(
              `❌ ${packageName} 验证失败 (${successfulExamples}/${totalExamples} 示例)`
            )
          )
        }
      } catch (error) {
        const result: PackageValidationResult = {
          packageName,
          success: false,
          totalFiles: 0,
          totalExamples: 0,
          successfulExamples: 0,
          errors: [error instanceof Error ? error.message : String(error)],
        }

        this.results.push(result)
        console.error(chalk.red(`❌ ${packageName} 验证失败:`), error)
      }
    }
  }

  /**
   * 生成验证报告
   */
  private async generateValidationReport(): Promise<void> {
    console.log(chalk.yellow('📋 生成验证报告...'))

    try {
      const reportContent = this.generateReportContent()
      const reportsDir = join(rootDir, 'reports')

      if (!existsSync(reportsDir)) {
        execSync(`mkdir -p ${reportsDir}`)
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const reportPath = join(reportsDir, `example-validation-${timestamp}.md`)

      writeFileSync(reportPath, reportContent)

      // 也生成一个最新的报告
      const latestReportPath = join(reportsDir, 'example-validation-latest.md')
      writeFileSync(latestReportPath, reportContent)

      console.log(chalk.green(`✅ 验证报告已生成: ${reportPath}`))
    } catch (error) {
      console.error(chalk.red('生成验证报告失败:'), error)
    }
  }

  /**
   * 生成报告内容
   */
  private generateReportContent(): string {
    const timestamp = new Date().toLocaleString('zh-CN')
    const totalPackages = this.results.length
    const successfulPackages = this.results.filter(r => r.success).length
    const totalExamples = this.results.reduce(
      (sum, r) => sum + r.totalExamples,
      0
    )
    const successfulExamples = this.results.reduce(
      (sum, r) => sum + r.successfulExamples,
      0
    )

    return `# 示例代码验证报告

**生成时间**: ${timestamp}

## 总体统计

- **包总数**: ${totalPackages}
- **验证通过的包**: ${successfulPackages}
- **示例总数**: ${totalExamples}
- **验证通过的示例**: ${successfulExamples}
- **包成功率**: ${((successfulPackages / totalPackages) * 100).toFixed(1)}%
- **示例成功率**: ${
      totalExamples > 0
        ? ((successfulExamples / totalExamples) * 100).toFixed(1)
        : 0
    }%

## 详细结果

| 包名 | 状态 | 文件数 | 示例数 | 成功数 | 成功率 |
|------|------|--------|--------|--------|--------|
${this.results
  .map(result => {
    const status = result.success ? '✅' : '❌'
    const successRate =
      result.totalExamples > 0
        ? `${((result.successfulExamples / result.totalExamples) * 100).toFixed(
            1
          )}%`
        : 'N/A'

    return `| ${result.packageName} | ${status} | ${result.totalFiles} | ${result.totalExamples} | ${result.successfulExamples} | ${successRate} |`
  })
  .join('\n')}

## 成功的包

${this.results
  .filter(r => r.success)
  .map(
    result => `
### ✅ ${result.packageName}

- **文件数**: ${result.totalFiles}
- **示例数**: ${result.totalExamples}
- **成功率**: 100%
`
  )
  .join('\n')}

## 失败的包

${this.results
  .filter(r => !r.success)
  .map(
    result => `
### ❌ ${result.packageName}

- **文件数**: ${result.totalFiles}
- **示例数**: ${result.totalExamples}
- **成功数**: ${result.successfulExamples}
- **成功率**: ${
      result.totalExamples > 0
        ? `${((result.successfulExamples / result.totalExamples) * 100).toFixed(
            1
          )}%`
        : 'N/A'
    }

**错误信息**:
${result.errors.map(error => `- ${error}`).join('\n')}
`
  )
  .join('\n')}

## 建议

${this.generateRecommendations()}

## 下一步行动

1. 修复失败的示例代码
2. 添加更多测试用例
3. 改进文档质量
4. 定期运行验证

---

*此报告由 LDesign 示例验证工具自动生成*
`
  }

  /**
   * 生成建议
   */
  private generateRecommendations(): string {
    const failedPackages = this.results.filter(r => !r.success)
    const lowSuccessRatePackages = this.results.filter(r => {
      const rate =
        r.totalExamples > 0 ? r.successfulExamples / r.totalExamples : 1
      return rate < 0.8 && rate > 0
    })

    const recommendations: string[] = []

    if (failedPackages.length > 0) {
      recommendations.push(`### 🔧 修复失败的包

以下包需要立即修复：
${failedPackages
  .map(r => `- **${r.packageName}**: ${r.errors.length} 个错误`)
  .join('\n')}`)
    }

    if (lowSuccessRatePackages.length > 0) {
      recommendations.push(`### 📈 改进成功率较低的包

以下包的示例成功率较低，建议改进：
${lowSuccessRatePackages
  .map(r => {
    const rate = ((r.successfulExamples / r.totalExamples) * 100).toFixed(1)
    return `- **${r.packageName}**: ${rate}% 成功率`
  })
  .join('\n')}`)
    }

    if (this.results.some(r => r.totalExamples === 0)) {
      recommendations.push(`### 📝 添加示例代码

以下包缺少示例代码：
${this.results
  .filter(r => r.totalExamples === 0)
  .map(r => `- **${r.packageName}**`)
  .join('\n')}`)
    }

    if (recommendations.length === 0) {
      recommendations.push(
        '### 🎉 所有包的示例都验证通过！\n\n继续保持高质量的文档和示例代码。'
      )
    }

    return recommendations.join('\n\n')
  }

  /**
   * 打印摘要
   */
  private printSummary(): void {
    console.log(chalk.blue('\n📊 验证摘要'))
    console.log(chalk.blue('='.repeat(50)))

    const totalPackages = this.results.length
    const successfulPackages = this.results.filter(r => r.success).length
    const totalExamples = this.results.reduce(
      (sum, r) => sum + r.totalExamples,
      0
    )
    const successfulExamples = this.results.reduce(
      (sum, r) => sum + r.successfulExamples,
      0
    )

    console.log(`包: ${successfulPackages}/${totalPackages} 通过`)
    console.log(`示例: ${successfulExamples}/${totalExamples} 通过`)
    console.log(
      `包成功率: ${((successfulPackages / totalPackages) * 100).toFixed(1)}%`
    )
    console.log(
      `示例成功率: ${
        totalExamples > 0
          ? ((successfulExamples / totalExamples) * 100).toFixed(1)
          : 0
      }%`
    )

    // 显示失败的包
    const failedPackages = this.results.filter(r => !r.success)
    if (failedPackages.length > 0) {
      console.log(chalk.red('\n❌ 失败的包:'))
      failedPackages.forEach(result => {
        console.log(
          chalk.red(
            `  ${result.packageName}: ${result.successfulExamples}/${result.totalExamples} 示例通过`
          )
        )
      })
    }

    if (successfulPackages === totalPackages) {
      console.log(chalk.green('\n🎉 所有包的示例验证通过！'))
    } else {
      console.log(chalk.yellow('\n⚠️ 部分包的示例验证失败，请查看详细报告'))
    }
  }
}

// CLI 处理
async function main() {
  const validator = new BatchExampleValidator()

  try {
    await validator.validateAllExamples()

    // 检查是否有失败的验证
    const hasFailures = validator.results.some(r => !r.success)
    process.exit(hasFailures ? 1 : 0)
  } catch (error) {
    console.error(chalk.red('批量示例验证失败:'), error)
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error)
}

export { BatchExampleValidator }
