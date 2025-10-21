/**
 * AI 优化命令
 * 
 * 提供智能优化建议和自动优化功能
 */

import { Logger } from '../../utils/logger'
import { createAIOptimizer } from '../../ai/optimizer'
import { createPerformanceOptimizer } from '../../core/PerformanceOptimizer'
import { createDevExperience } from '../../core/DevExperience'
import chalk from 'chalk'
import inquirer from 'inquirer'

export interface AICommandOptions {
  /** 分析路径 */
  path?: string
  /** 自动应用建议 */
  auto?: boolean
  /** 导出报告 */
  export?: string
  /** 只分析不给建议 */
  analyzeOnly?: boolean
}

/**
 * AI 命令类
 */
export class AICommand {
  name = 'ai'
  description = '智能优化分析和建议'
  alias = 'optimize'

  options = [
    {
      name: 'path',
      alias: 'p',
      description: '项目路径',
      type: 'string' as const,
      default: process.cwd()
    },
    {
      name: 'auto',
      alias: 'a',
      description: '自动应用优化建议',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'export',
      alias: 'e',
      description: '导出报告到文件',
      type: 'string' as const
    },
    {
      name: 'analyzeOnly',
      description: '只分析不给建议',
      type: 'boolean' as const,
      default: false
    }
  ]

  examples = [
    {
      command: 'launcher ai',
      description: '分析当前项目并给出优化建议'
    },
    {
      command: 'launcher ai --auto',
      description: '自动应用优化建议'
    },
    {
      command: 'launcher ai --export report.md',
      description: '导出分析报告'
    },
    {
      command: 'launcher ai --path ./my-project',
      description: '分析指定项目'
    }
  ]

  private logger: Logger
  private aiOptimizer = createAIOptimizer()

  constructor() {
    this.logger = new Logger('AICommand')
  }

  /**
   * 执行命令
   */
  async execute(options: AICommandOptions): Promise<void> {
    try {
      const projectPath = options.path || process.cwd()

      console.log('\n🤖 AI 项目优化器')
      console.log('═'.repeat(50))

      // 分析项目
      console.log('\n📊 正在分析项目...')
      const analysis = await this.aiOptimizer.analyzeProject(projectPath)

      // 显示分析结果
      this.displayAnalysis(analysis)

      if (options.analyzeOnly) {
        return
      }

      // 收集性能数据
      const performanceOptimizer = createPerformanceOptimizer()
      const devExperience = createDevExperience()
      const performanceMetrics = performanceOptimizer.getMetrics()
      const devMetrics = devExperience.getMetrics()

      // 生成建议
      console.log('\n💡 正在生成优化建议...')
      const suggestions = await this.aiOptimizer.generateSuggestions(
        analysis,
        performanceMetrics,
        devMetrics
      )

      if (suggestions.length === 0) {
        console.log('\n✅ 项目状态良好，暂无优化建议')
        return
      }

      // 显示建议
      this.displaySuggestions(suggestions)

      // 处理建议
      if (options.auto) {
        await this.autoApplySuggestions(suggestions)
      } else {
        await this.interactiveMode(suggestions)
      }

      // 导出报告
      if (options.export) {
        await this.exportReport(options.export)
      }

    } catch (error) {
      this.logger.error('AI 分析失败:', error)
      process.exit(1)
    }
  }

  /**
   * 显示分析结果
   */
  private displayAnalysis(analysis: any): void {
    console.log('\n📋 项目分析结果')
    console.log('─'.repeat(50))

    const info = [
      ['项目类型', analysis.projectType],
      ['框架', analysis.framework],
      ['文件总数', analysis.fileStats.total],
      ['JavaScript', `${analysis.fileStats.js} 个`],
      ['TypeScript', `${analysis.fileStats.ts} 个`],
      ['CSS', `${analysis.fileStats.css} 个`],
      ['依赖数量', analysis.dependencies.total],
      ['大型依赖', analysis.dependencies.large.length > 0 ?
        analysis.dependencies.large.join(', ') : '无']
    ]

    info.forEach(([label, value]) => {
      console.log(`  ${chalk.gray(label)}: ${chalk.white(value)}`)
    })
  }

  /**
   * 显示优化建议
   */
  private displaySuggestions(suggestions: any[]): void {
    console.log('\n💡 优化建议')
    console.log('─'.repeat(50))

    // 按优先级分组
    const high = suggestions.filter(s => s.priority === 'high')
    const medium = suggestions.filter(s => s.priority === 'medium')
    const low = suggestions.filter(s => s.priority === 'low')

    if (high.length > 0) {
      console.log('\n🔴 高优先级建议:')
      high.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.title} `)
        console.log(`     ${s.description} `)
      })
    }

    if (medium.length > 0) {
      console.log('\n🟡 中优先级建议:')
      medium.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.title} `)
      })
    }

    if (low.length > 0) {
      console.log('\n🟢 低优先级建议:')
      low.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s.title} `)
      })
    }
  }

  /**
   * 交互模式
   */
  private async interactiveMode(suggestions: any[]): Promise<void> {


    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '请选择操作:',
        choices: [
          { name: '查看详细建议', value: 'view' },
          { name: '选择应用建议', value: 'select' },
          { name: '应用所有高优先级建议', value: 'high' },
          { name: '导出报告', value: 'export' },
          { name: '退出', value: 'exit' }
        ]
      }
    ])

    switch (action) {
      case 'view':
        await this.viewDetailedSuggestions(suggestions)
        break

      case 'select':
        await this.selectSuggestions(suggestions)
        break

      case 'high':
        const highPriority = suggestions.filter(s => s.priority === 'high')
        await this.applySuggestions(highPriority)
        break

      case 'export':
        const { filename } = await inquirer.prompt([
          {
            type: 'input',
            name: 'filename',
            message: '输入报告文件名:',
            default: 'ai-optimization-report.md'
          }
        ])
        await this.exportReport(filename)
        break

      case 'exit':
        console.log('\n👋 再见!')
        break
    }
  }

  /**
   * 查看详细建议
   */
  private async viewDetailedSuggestions(suggestions: any[]): Promise<void> {
    for (const suggestion of suggestions) {
      console.log('\n' + '═'.repeat(50))
      console.log(`\n${suggestion.title}`)
      console.log(`优先级: ${this.getPriorityColor(suggestion.priority)(suggestion.priority.toUpperCase())}`)
      console.log(`描述: ${suggestion.description}`)
      console.log(`影响: ${suggestion.impact}`)
      console.log(`预期收益: ${suggestion.expectedBenefit.metric} ${suggestion.expectedBenefit.improvement}`)
      console.log('\n📝 实施步骤:')
      suggestion.implementation.forEach((step: string, i: number) => {
        console.log(`  ${i + 1}. ${step}`)
      })

      if (suggestion.references && suggestion.references.length > 0) {
        console.log('\n📚 参考资料:')
        suggestion.references.forEach((ref: string) => {
          console.log(`  - ${ref}`)
        })
      }

      const { next } = await inquirer.prompt([
        {
          type: 'list',
          name: 'next',
          message: '操作:',
          choices: [
            { name: '应用此建议', value: 'apply' },
            { name: '查看下一个', value: 'next' },
            { name: '返回', value: 'back' }
          ]
        }
      ])

      if (next === 'apply') {
        await this.applySuggestions([suggestion])
      } else if (next === 'back') {
        break
      }
    }
  }

  /**
   * 选择建议
   */
  private async selectSuggestions(suggestions: any[]): Promise<void> {
    const { selected } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selected',
        message: '选择要应用的建议:',
        choices: suggestions.map(s => ({
          name: `[${s.priority.toUpperCase()}]${s.title}`,
          value: s.id,
          checked: s.priority === 'high'
        }))
      }
    ])

    const selectedSuggestions = suggestions.filter(s => selected.includes(s.id))

    if (selectedSuggestions.length > 0) {
      await this.applySuggestions(selectedSuggestions)
    }
  }

  /**
   * 应用建议
   */
  private async applySuggestions(suggestions: any[]): Promise<void> {
    console.log('\n🔧 应用优化建议...')
    console.log('─'.repeat(50))

    for (const suggestion of suggestions) {
      console.log(`\n正在应用: ${suggestion.title}`)

      try {
        await this.aiOptimizer.applySuggestion(suggestion.id)
        console.log(chalk.green('✓ 应用成功'))
      } catch (error) {
        console.log(chalk.red(`✗ 应用失败: ${(error as Error).message}`))
      }
    }

    console.log('\n✅ 所有建议已应用完成')
  }

  /**
   * 自动应用建议
   */
  private async autoApplySuggestions(suggestions: any[]): Promise<void> {
    const highPriority = suggestions.filter(s => s.priority === 'high')

    if (highPriority.length === 0) {
      console.log('没有高优先级的建议需要自动应用')
      return
    }

    console.log(`\n自动应用 ${highPriority.length} 个高优先级建议...`)

    await this.applySuggestions(highPriority)
  }

  /**
   * 导出报告
   */
  private async exportReport(filename: string): Promise<void> {
    const fs = await import('fs-extra')
    const path = await import('path')

    const report = this.aiOptimizer.exportReport()
    const filepath = path.resolve(process.cwd(), filename)

    await fs.writeFile(filepath, report, 'utf-8')

    console.log(`\n报告已导出到: ${filepath}`)
  }

  /**
   * 获取优先级颜色
   */
  private getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return chalk.red
      case 'medium': return chalk.yellow
      case 'low': return chalk.blue
      default: return chalk.gray
    }
  }
}
