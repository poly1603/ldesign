/**
 * 测试命令
 * 
 * 提供测试运行、覆盖率检查等功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Logger } from '../../utils/logger'
import { TestIntegration, createTestIntegration } from '../../core/TestIntegration'
import type { TestFramework } from '../../core/TestIntegration'
import chalk from 'chalk'

export interface TestCommandOptions {
  /** 测试框架 */
  framework?: TestFramework
  /** 启用监听模式 */
  watch?: boolean
  /** 启用覆盖率 */
  coverage?: boolean
  /** 配置文件路径 */
  config?: string
  /** 并行运行测试 */
  parallel?: boolean
  /** 测试超时时间 */
  timeout?: number
  /** 测试文件匹配模式 */
  match?: string
  /** 排除模式 */
  exclude?: string
}

/**
 * 测试命令类
 */
export class TestCommand {
  name = 'test'
  description = '运行测试'
  alias = 't'
  
  options = [
    {
      name: 'framework',
      alias: 'f',
      description: '测试框架 (vitest, jest, mocha, cypress, playwright)',
      type: 'string' as const,
      choices: ['vitest', 'jest', 'mocha', 'cypress', 'playwright']
    },
    {
      name: 'watch',
      alias: 'w',
      description: '启用监听模式',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'coverage',
      alias: 'c',
      description: '生成覆盖率报告',
      type: 'boolean' as const,
      default: false
    },
    {
      name: 'config',
      description: '配置文件路径',
      type: 'string' as const
    },
    {
      name: 'parallel',
      alias: 'p',
      description: '并行运行测试',
      type: 'boolean' as const,
      default: true
    },
    {
      name: 'timeout',
      alias: 't',
      description: '测试超时时间 (ms)',
      type: 'number' as const,
      default: 5000
    },
    {
      name: 'match',
      alias: 'm',
      description: '测试文件匹配模式',
      type: 'string' as const
    },
    {
      name: 'exclude',
      alias: 'e',
      description: '排除文件模式',
      type: 'string' as const
    }
  ]

  examples = [
    {
      command: 'launcher test',
      description: '运行所有测试'
    },
    {
      command: 'launcher test --framework vitest',
      description: '使用 Vitest 运行测试'
    },
    {
      command: 'launcher test --watch',
      description: '监听模式运行测试'
    },
    {
      command: 'launcher test --coverage',
      description: '生成覆盖率报告'
    },
    {
      command: 'launcher test --match "**/*.unit.test.ts"',
      description: '只运行单元测试'
    }
  ]

  private logger: Logger
  private testIntegration?: TestIntegration

  constructor() {
    this.logger = new Logger('TestCommand')
  }

  /**
   * 执行命令
   */
  async execute(options: TestCommandOptions): Promise<void> {
    try {
      // 检测可用的测试框架
      const framework = options.framework || await this.detectTestFramework()
      
      if (!framework) {
        this.logger.error('未检测到测试框架，请安装 vitest、jest 或其他支持的测试框架')
        process.exit(1)
      }

      this.logger.info(`使用 ${chalk.cyan(framework)} 运行测试`)

      // 创建测试集成实例
      this.testIntegration = createTestIntegration({
        framework,
        watch: options.watch,
        coverage: options.coverage,
        parallel: options.parallel,
        timeout: options.timeout,
        configFile: options.config,
        testMatch: options.match ? [options.match] : undefined,
        exclude: options.exclude ? [options.exclude] : undefined
      })

      // 监听测试事件
      this.setupEventListeners()

      if (options.watch) {
        // 启动监听模式
        await this.testIntegration.startWatchMode()
        
        // 保持进程运行
        process.stdin.resume()
        process.on('SIGINT', () => {
          this.cleanup()
          process.exit(0)
        })
      } else {
        // 运行一次测试
        const result = await this.testIntegration.runTests()
        
        // 显示结果
        this.displayResults(result)
        
        // 检查覆盖率阈值
        if (options.coverage) {
          const thresholdMet = this.testIntegration.checkCoverageThreshold()
          if (!thresholdMet) {
            this.logger.warn('覆盖率未达到设定阈值')
          }
        }
        
        // 根据测试结果设置退出码
        process.exit(result.passed ? 0 : 1)
      }
    } catch (error) {
      this.logger.error('测试执行失败:', error)
      process.exit(1)
    }
  }

  /**
   * 检测可用的测试框架
   */
  private async detectTestFramework(): Promise<TestFramework | null> {
    const fs = await import('fs-extra')
    const path = await import('path')
    
    try {
      const packageJsonPath = path.resolve(process.cwd(), 'package.json')
      const packageJson = await fs.readJson(packageJsonPath)
      
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      }
      
      // 按优先级检测框架
      if (allDeps.vitest) return 'vitest'
      if (allDeps.jest) return 'jest'
      if (allDeps.mocha) return 'mocha'
      if (allDeps.cypress) return 'cypress'
      if (allDeps.playwright || allDeps['@playwright/test']) return 'playwright'
      
      return null
    } catch (error) {
      this.logger.debug('无法读取 package.json')
      return null
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.testIntegration) return

    this.testIntegration.on('start', () => {
      this.logger.info('开始运行测试...')
    })

    this.testIntegration.on('complete', (result) => {
      if (result.passed) {
        this.logger.success(`测试通过! (${result.passed_count}/${result.total})`)
      } else {
        this.logger.error(`测试失败! (${result.failed} 失败, ${result.passed_count} 通过)`)
      }
    })

    this.testIntegration.on('error', (error) => {
      this.logger.error('测试错误:', error)
    })

    this.testIntegration.on('watch-error', (error) => {
      this.logger.error('监听模式错误:', error)
    })
  }

  /**
   * 显示测试结果
   */
  private displayResults(result: any): void {
    console.log()
    console.log(chalk.bold('测试结果:'))
    console.log(chalk.gray('─'.repeat(50)))
    
    // 显示统计信息
    const stats = [
      ['总计', result.total],
      ['通过', chalk.green(result.passed_count)],
      ['失败', result.failed > 0 ? chalk.red(result.failed) : result.failed],
      ['跳过', result.skipped > 0 ? chalk.yellow(result.skipped) : result.skipped],
      ['耗时', `${result.duration}ms`]
    ]
    
    stats.forEach(([label, value]) => {
      console.log(`  ${chalk.gray(label + ':')} ${value}`)
    })
    
    // 显示覆盖率信息
    if (result.coverage) {
      console.log()
      console.log(chalk.bold('覆盖率:'))
      console.log(chalk.gray('─'.repeat(50)))
      
      const coverage = [
        ['行覆盖率', `${result.coverage.lines}%`],
        ['分支覆盖率', `${result.coverage.branches}%`],
        ['函数覆盖率', `${result.coverage.functions}%`],
        ['语句覆盖率', `${result.coverage.statements}%`]
      ]
      
      coverage.forEach(([label, value]) => {
        const percentage = parseFloat(value)
        const coloredValue = percentage >= 80 ? chalk.green(value) :
                           percentage >= 60 ? chalk.yellow(value) :
                           chalk.red(value)
        console.log(`  ${chalk.gray(label + ':')} ${coloredValue}`)
      })
    }
    
    // 显示错误信息
    if (result.errors && result.errors.length > 0) {
      console.log()
      console.log(chalk.bold.red('错误:'))
      console.log(chalk.gray('─'.repeat(50)))
      result.errors.forEach((error: string) => {
        console.log(chalk.red(`  • ${error}`))
      })
    }
    
    console.log(chalk.gray('─'.repeat(50)))
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    if (this.testIntegration) {
      this.testIntegration.stop()
    }
  }
}
