/**
 * 诊断命令
 * 
 * 检查项目健康状况和环境配置
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { Command } from 'commander'
import { Logger } from '../../utils/logger'
import ora from 'ora'
import fs from 'node:fs/promises'
import path from 'node:path'
import { execSync } from 'node:child_process'

export interface DoctorCommandOptions {
  /** 详细模式 */
  verbose?: boolean
  /** 输出格式 */
  format?: 'text' | 'json' | 'markdown'
  /** 输出文件 */
  output?: string
  /** 检查类型 */
  check?: 'all' | 'env' | 'deps' | 'config' | 'performance'
}

export interface CheckResult {
  name: string
  status: 'pass' | 'warn' | 'fail'
  message: string
  details?: string
  suggestion?: string
}

export class DoctorCommand {
  private logger: Logger
  private results: CheckResult[] = []

  constructor() {
    this.logger = new Logger('Doctor')
  }

  /**
   * 创建诊断命令
   */
  createCommand(): Command {
    return new Command('doctor')
      .description('检查项目健康状况')
      .option('-v, --verbose', '详细输出', false)
      .option('-f, --format <format>', '输出格式 (text|json|markdown)', 'text')
      .option('-o, --output <path>', '输出文件路径')
      .option('-c, --check <type>', '检查类型 (all|env|deps|config|performance)', 'all')
      .action(async (options: DoctorCommandOptions) => {
        await this.execute(options)
      })
  }

  /**
   * 执行诊断
   */
  private async execute(options: DoctorCommandOptions): Promise<void> {
    try {
      this.logger.info('开始项目健康检查...')
      
      const spinner = ora('正在检查项目...').start()
      
      try {
        // 执行各种检查
        await this.runChecks(options.check || 'all')
        
        spinner.succeed('检查完成')
        
        // 显示结果
        this.displayResults(options)
        
        // 输出到文件
        if (options.output) {
          await this.outputToFile(options)
        }
        
        // 显示总结
        this.displaySummary()
        
      } catch (error) {
        spinner.fail('检查失败')
        throw error
      }
      
    } catch (error) {
      this.logger.error('诊断失败', { error: (error as Error).message })
      process.exit(1)
    }
  }

  /**
   * 运行检查
   */
  private async runChecks(checkType: string): Promise<void> {
    switch (checkType) {
      case 'all':
        await this.checkEnvironment()
        await this.checkDependencies()
        await this.checkConfiguration()
        await this.checkPerformance()
        break
      case 'env':
        await this.checkEnvironment()
        break
      case 'deps':
        await this.checkDependencies()
        break
      case 'config':
        await this.checkConfiguration()
        break
      case 'performance':
        await this.checkPerformance()
        break
    }
  }

  /**
   * 检查环境
   */
  private async checkEnvironment(): Promise<void> {
    // 检查 Node.js 版本
    const nodeVersion = process.version
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
    
    this.addResult({
      name: 'Node.js 版本',
      status: majorVersion >= 16 ? 'pass' : 'fail',
      message: `当前版本: ${nodeVersion}`,
      suggestion: majorVersion < 16 ? '建议升级到 Node.js 16 或更高版本' : undefined
    })

    // 检查包管理器
    const packageManagers = ['npm', 'yarn', 'pnpm']
    for (const pm of packageManagers) {
      try {
        const version = execSync(`${pm} --version`, { encoding: 'utf8', stdio: 'pipe' }).trim()
        this.addResult({
          name: `${pm.toUpperCase()} 可用性`,
          status: 'pass',
          message: `版本: ${version}`
        })
      } catch {
        this.addResult({
          name: `${pm.toUpperCase()} 可用性`,
          status: 'warn',
          message: '未安装或不可用'
        })
      }
    }

    // 检查 Git
    try {
      const gitVersion = execSync('git --version', { encoding: 'utf8', stdio: 'pipe' }).trim()
      this.addResult({
        name: 'Git 可用性',
        status: 'pass',
        message: gitVersion
      })
    } catch {
      this.addResult({
        name: 'Git 可用性',
        status: 'warn',
        message: '未安装或不可用',
        suggestion: '建议安装 Git 以获得更好的开发体验'
      })
    }

    // 检查环境变量
    const requiredEnvVars = ['NODE_ENV', 'PATH']
    for (const envVar of requiredEnvVars) {
      const value = process.env[envVar]
      this.addResult({
        name: `环境变量 ${envVar}`,
        status: value ? 'pass' : 'warn',
        message: value ? '已设置' : '未设置',
        details: value ? `值: ${value.slice(0, 50)}${value.length > 50 ? '...' : ''}` : undefined
      })
    }
  }

  /**
   * 检查依赖
   */
  private async checkDependencies(): Promise<void> {
    try {
      // 检查 package.json
      const packageJsonPath = path.join(process.cwd(), 'package.json')
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
      
      this.addResult({
        name: 'package.json',
        status: 'pass',
        message: '文件存在且有效',
        details: `项目名称: ${packageJson.name}, 版本: ${packageJson.version}`
      })

      // 检查 node_modules
      try {
        await fs.access(path.join(process.cwd(), 'node_modules'))
        this.addResult({
          name: 'node_modules',
          status: 'pass',
          message: '依赖已安装'
        })
      } catch {
        this.addResult({
          name: 'node_modules',
          status: 'fail',
          message: '依赖未安装',
          suggestion: '运行 npm install 或 yarn install 安装依赖'
        })
      }

      // 检查锁文件
      const lockFiles = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml']
      let lockFileFound = false
      
      for (const lockFile of lockFiles) {
        try {
          await fs.access(path.join(process.cwd(), lockFile))
          this.addResult({
            name: '锁文件',
            status: 'pass',
            message: `找到 ${lockFile}`
          })
          lockFileFound = true
          break
        } catch {
          // 继续检查下一个
        }
      }
      
      if (!lockFileFound) {
        this.addResult({
          name: '锁文件',
          status: 'warn',
          message: '未找到锁文件',
          suggestion: '建议使用包管理器安装依赖以生成锁文件'
        })
      }

      // 检查安全漏洞
      try {
        execSync('npm audit --json', { stdio: 'pipe' })
        this.addResult({
          name: '安全审计',
          status: 'pass',
          message: '未发现安全漏洞'
        })
      } catch (error) {
        this.addResult({
          name: '安全审计',
          status: 'warn',
          message: '发现安全漏洞',
          suggestion: '运行 npm audit fix 修复漏洞'
        })
      }

    } catch (error) {
      this.addResult({
        name: 'package.json',
        status: 'fail',
        message: '文件不存在或无效',
        suggestion: '确保在正确的项目目录中运行命令'
      })
    }
  }

  /**
   * 检查配置
   */
  private async checkConfiguration(): Promise<void> {
    // 检查 Vite 配置
    const viteConfigs = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs']
    let viteConfigFound = false
    
    for (const config of viteConfigs) {
      try {
        await fs.access(path.join(process.cwd(), config))
        this.addResult({
          name: 'Vite 配置',
          status: 'pass',
          message: `找到 ${config}`
        })
        viteConfigFound = true
        break
      } catch {
        // 继续检查下一个
      }
    }
    
    if (!viteConfigFound) {
      this.addResult({
        name: 'Vite 配置',
        status: 'warn',
        message: '未找到 Vite 配置文件',
        suggestion: '考虑创建 vite.config.ts 以自定义构建配置'
      })
    }

    // 检查 Launcher 配置
    const launcherConfigs = [
      'launcher.config.ts',
      'launcher.config.js',
      '.ldesign/launcher.config.ts',
      '.ldesign/launcher.development.config.ts',
      '.ldesign/launcher.production.config.ts'
    ]
    
    let launcherConfigFound = false
    for (const config of launcherConfigs) {
      try {
        await fs.access(path.join(process.cwd(), config))
        this.addResult({
          name: 'Launcher 配置',
          status: 'pass',
          message: `找到 ${config}`
        })
        launcherConfigFound = true
        break
      } catch {
        // 继续检查下一个
      }
    }
    
    if (!launcherConfigFound) {
      this.addResult({
        name: 'Launcher 配置',
        status: 'warn',
        message: '未找到 Launcher 配置文件',
        suggestion: '考虑创建 launcher.config.ts 以自定义启动器配置'
      })
    }

    // 检查 TypeScript 配置
    try {
      await fs.access(path.join(process.cwd(), 'tsconfig.json'))
      this.addResult({
        name: 'TypeScript 配置',
        status: 'pass',
        message: '找到 tsconfig.json'
      })
    } catch {
      this.addResult({
        name: 'TypeScript 配置',
        status: 'warn',
        message: '未找到 tsconfig.json',
        suggestion: '如果使用 TypeScript，建议创建 tsconfig.json'
      })
    }

    // 检查 ESLint 配置
    const eslintConfigs = ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js']
    let eslintConfigFound = false
    
    for (const config of eslintConfigs) {
      try {
        await fs.access(path.join(process.cwd(), config))
        this.addResult({
          name: 'ESLint 配置',
          status: 'pass',
          message: `找到 ${config}`
        })
        eslintConfigFound = true
        break
      } catch {
        // 继续检查下一个
      }
    }
    
    if (!eslintConfigFound) {
      this.addResult({
        name: 'ESLint 配置',
        status: 'warn',
        message: '未找到 ESLint 配置',
        suggestion: '建议配置 ESLint 以保证代码质量'
      })
    }
  }

  /**
   * 检查性能
   */
  private async checkPerformance(): Promise<void> {
    // 检查内存使用
    const memUsage = process.memoryUsage()
    const memMB = memUsage.heapUsed / 1024 / 1024
    
    this.addResult({
      name: '内存使用',
      status: memMB < 512 ? 'pass' : memMB < 1024 ? 'warn' : 'fail',
      message: `${memMB.toFixed(2)}MB`,
      suggestion: memMB > 512 ? '内存使用量较高，考虑优化或重启' : undefined
    })

    // 检查磁盘空间
    try {
      const stats = await fs.stat(process.cwd())
      this.addResult({
        name: '项目目录',
        status: 'pass',
        message: '可访问'
      })
    } catch {
      this.addResult({
        name: '项目目录',
        status: 'fail',
        message: '无法访问',
        suggestion: '检查目录权限'
      })
    }

    // 检查缓存目录
    const cacheDir = path.join(process.cwd(), '.cache')
    try {
      const stats = await fs.stat(cacheDir)
      if (stats.isDirectory()) {
        this.addResult({
          name: '缓存目录',
          status: 'pass',
          message: '存在'
        })
      }
    } catch {
      this.addResult({
        name: '缓存目录',
        status: 'warn',
        message: '不存在',
        suggestion: '缓存目录将在首次运行时自动创建'
      })
    }
  }

  /**
   * 添加检查结果
   */
  private addResult(result: CheckResult): void {
    this.results.push(result)
  }

  /**
   * 显示结果
   */
  private displayResults(options: DoctorCommandOptions): void {
    if (options.format === 'json') {
      )
      return
    }

    )

    for (const result of this.results) {
      const icon = this.getStatusIcon(result.status)
      const color = this.getStatusColor(result.status)
      
      }: ${result.message}`)
      
      if (options.verbose && result.details) {
        }`)
      }
      
      if (result.suggestion) {
        }`)
      }
      
          }
  }

  /**
   * 显示总结
   */
  private displaySummary(): void {
    const passed = this.results.filter(r => r.status === 'pass').length
    const warned = this.results.filter(r => r.status === 'warn').length
    const failed = this.results.filter(r => r.status === 'fail').length
    const total = this.results.length

    )
            
    if (failed > 0) {
      )
      process.exit(1)
    } else if (warned > 0) {
      )
    } else {
      )
    }
  }

  /**
   * 输出到文件
   */
  private async outputToFile(options: DoctorCommandOptions): Promise<void> {
    if (!options.output) return

    let content: string

    switch (options.format) {
      case 'json':
        content = JSON.stringify(this.results, null, 2)
        break
      case 'markdown':
        content = this.generateMarkdownReport()
        break
      default:
        content = this.generateTextReport()
    }

    await fs.writeFile(options.output, content)
    this.logger.success(`报告已保存到: ${options.output}`)
  }

  /**
   * 生成 Markdown 报告
   */
  private generateMarkdownReport(): string {
    let content = '# 项目健康检查报告\n\n'
    content += `生成时间: ${new Date().toISOString()}\n\n`

    for (const result of this.results) {
      const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌'
      content += `## ${icon} ${result.name}\n\n`
      content += `**状态**: ${result.status}\n`
      content += `**信息**: ${result.message}\n`
      
      if (result.details) {
        content += `**详情**: ${result.details}\n`
      }
      
      if (result.suggestion) {
        content += `**建议**: ${result.suggestion}\n`
      }
      
      content += '\n'
    }

    return content
  }

  /**
   * 生成文本报告
   */
  private generateTextReport(): string {
    let content = '项目健康检查报告\n'
    content += '='.repeat(50) + '\n\n'
    content += `生成时间: ${new Date().toISOString()}\n\n`

    for (const result of this.results) {
      content += `${result.name}: ${result.status.toUpperCase()}\n`
      content += `信息: ${result.message}\n`
      
      if (result.details) {
        content += `详情: ${result.details}\n`
      }
      
      if (result.suggestion) {
        content += `建议: ${result.suggestion}\n`
      }
      
      content += '\n'
    }

    return content
  }

  /**
   * 获取状态图标
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'pass': return '✅'
      case 'warn': return '⚠️'
      case 'fail': return '❌'
      default: return '❓'
    }
  }

  /**
   * 获取状态颜色
   */
  private getStatusColor(status: string): 'green' | 'yellow' | 'red' | 'gray' {
    switch (status) {
      case 'pass': return 'green'
      case 'warn': return 'yellow'
      case 'fail': return 'red'
      default: return 'gray'
    }
  }
}

// 导出命令创建函数
export function createDoctorCommand(): Command {
  const doctorCommand = new DoctorCommand()
  return doctorCommand.createCommand()
}
