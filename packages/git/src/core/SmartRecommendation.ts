/**
 * 智能命令推荐模块
 * 基于使用历史、上下文分析和模式识别提供智能命令建议
 */

import { Git } from '../index.js'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'
import Table from 'cli-table3'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import fuzzysort from 'fuzzysort'

const execAsync = promisify(exec)

interface CommandHistory {
  command: string
  timestamp: Date
  success: boolean
  context: CommandContext
  executionTime: number
  exitCode?: number
}

interface CommandContext {
  branch?: string
  workingDirectory?: string
  filesChanged?: number
  staged?: number
  unstaged?: number
  untracked?: number
  lastCommitHash?: string
  remoteStatus?: 'ahead' | 'behind' | 'diverged' | 'up-to-date'
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night'
  dayOfWeek?: number
}

interface CommandPattern {
  sequence: string[]
  frequency: number
  lastUsed: Date
  successRate: number
  averageInterval: number
}

interface Recommendation {
  command: string
  score: number
  reason: string
  category: 'frequent' | 'contextual' | 'workflow' | 'predictive' | 'helpful' | 'recovery'
  confidence: number
  metadata?: any
}

interface WorkflowTemplate {
  name: string
  description: string
  steps: WorkflowStep[]
  triggers?: WorkflowTrigger[]
  tags?: string[]
}

interface WorkflowStep {
  command: string
  description?: string
  condition?: string
  continueOnError?: boolean
}

interface WorkflowTrigger {
  type: 'file-change' | 'branch-change' | 'time' | 'manual'
  pattern?: string
  value?: any
}

interface LearningModel {
  commandFrequency: Map<string, number>
  commandPairs: Map<string, Map<string, number>>
  contextPatterns: Map<string, CommandContext[]>
  timePatterns: Map<string, number[]>
  errorRecovery: Map<string, string[]>
  workflowSequences: CommandPattern[]
}

export class SmartRecommendation {
  private git: Git
  private historyFile: string
  private modelFile: string
  private history: CommandHistory[] = []
  private model: LearningModel
  private spinner?: ora.Ora
  private maxHistorySize = 10000
  private maxRecommendations = 10

  constructor(git: Git) {
    this.git = git
    const configDir = path.join(os.homedir(), '.lgit')
    this.historyFile = path.join(configDir, 'command-history.json')
    this.modelFile = path.join(configDir, 'learning-model.json')
    this.model = this.initializeModel()
  }

  /**
   * 初始化智能推荐系统
   */
async initialize(): Promise<void> {
    void this.git
    await this.loadHistory()
    await this.loadModel()
    await this.analyzePatterns()
  }

  /**
   * 获取智能推荐
   */
  async getRecommendations(currentContext?: Partial<CommandContext>): Promise<Recommendation[]> {
    const context = await this.getCurrentContext(currentContext)
    const recommendations: Recommendation[] = []

    // 1. 基于频率的推荐
    recommendations.push(...await this.getFrequentCommands(context))

    // 2. 基于上下文的推荐
    recommendations.push(...await this.getContextualCommands(context))

    // 3. 基于工作流的推荐
    recommendations.push(...await this.getWorkflowCommands(context))

    // 4. 预测性推荐
    recommendations.push(...await this.getPredictiveCommands(context))

    // 5. 帮助性推荐
    recommendations.push(...await this.getHelpfulCommands(context))

    // 6. 错误恢复推荐
    recommendations.push(...await this.getRecoveryCommands(context))

    // 去重并排序
    const uniqueRecommendations = this.deduplicateRecommendations(recommendations)
    return uniqueRecommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxRecommendations)
  }

  /**
   * 显示推荐界面
   */
  async showRecommendations(): Promise<void> {
    console.log(chalk.cyan('\n🤖 智能命令推荐\n'))

    this.spinner = ora('分析上下文...').start()
    
    try {
      const context = await this.getCurrentContext()
      const recommendations = await this.getRecommendations(context)
      
      this.spinner.stop()

      if (recommendations.length === 0) {
        console.log(chalk.yellow('暂无推荐'))
        return
      }

      // 显示当前上下文
      this.displayContext(context)

      // 按类别分组显示推荐
      this.displayRecommendationsByCategory(recommendations)

      // 交互式选择
      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: '选择操作:',
          choices: [
            ...recommendations.map((r, i) => ({
              name: `${this.getCategoryEmoji(r.category)} ${r.command} - ${chalk.gray(r.reason)}`,
              value: `execute:${i}`
            })),
            new inquirer.Separator(),
            { name: '📚 查看命令详情', value: 'details' },
            { name: '🎯 自定义工作流', value: 'workflow' },
            { name: '📊 查看使用统计', value: 'stats' },
            { name: '🔍 搜索命令', value: 'search' },
            { name: '❌ 退出', value: 'exit' }
          ]
        }
      ])

      if (action.startsWith('execute:')) {
        const index = parseInt(action.split(':')[1])
        await this.executeCommand(recommendations[index])
      } else {
        switch (action) {
          case 'details':
            await this.showCommandDetails(recommendations)
            break
          case 'workflow':
            await this.createCustomWorkflow()
            break
          case 'stats':
            await this.showUsageStatistics()
            break
          case 'search':
            await this.searchCommands()
            break
        }
      }

    } catch (error) {
      this.spinner?.fail('获取推荐失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 记录命令执行
   */
  async recordCommand(
    command: string, 
    success: boolean, 
    executionTime: number, 
    exitCode?: number
  ): Promise<void> {
    const context = await this.getCurrentContext()
    
    const entry: CommandHistory = {
      command,
      timestamp: new Date(),
      success,
      context,
      executionTime,
      exitCode
    }

    this.history.push(entry)
    
    // 限制历史大小
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize)
    }

    // 更新学习模型
    await this.updateModel(entry)
    
    // 保存到磁盘
    await this.saveHistory()
    await this.saveModel()
  }

  /**
   * 创建智能工作流
   */
  async createSmartWorkflow(): Promise<void> {
    console.log(chalk.cyan('\n🎯 智能工作流生成器\n'))

    const { scenario } = await inquirer.prompt([
      {
        type: 'list',
        name: 'scenario',
        message: '选择工作场景:',
        choices: [
          { name: '🚀 功能开发', value: 'feature' },
          { name: '🐛 Bug 修复', value: 'bugfix' },
          { name: '🔀 代码合并', value: 'merge' },
          { name: '📦 发布准备', value: 'release' },
          { name: '🧹 代码清理', value: 'cleanup' },
          { name: '🔍 代码审查', value: 'review' },
          { name: '⚡ 性能优化', value: 'optimize' },
          { name: '📝 文档更新', value: 'docs' },
          { name: '🎨 自定义', value: 'custom' }
        ]
      }
    ])

    const workflow = await this.generateWorkflow(scenario)
    
    console.log(chalk.cyan(`\n生成的工作流: ${workflow.name}\n`))
    console.log(chalk.gray(workflow.description))
    console.log()

    // 显示工作流步骤
    const table = new Table({
      head: [chalk.cyan('步骤'), chalk.cyan('命令'), chalk.cyan('说明')],
      style: { head: [], border: ['gray'] }
    })

    workflow.steps.forEach((step, index) => {
      table.push([
        `${index + 1}`,
        chalk.yellow(step.command),
        step.description || ''
      ])
    })

    console.log(table.toString())

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择操作:',
        choices: [
          { name: '▶️ 执行工作流', value: 'execute' },
          { name: '💾 保存工作流', value: 'save' },
          { name: '✏️ 编辑工作流', value: 'edit' },
          { name: '🔄 重新生成', value: 'regenerate' },
          { name: '❌ 取消', value: 'cancel' }
        ]
      }
    ])

    switch (action) {
      case 'execute':
        await this.executeWorkflow(workflow)
        break
      case 'save':
        await this.saveWorkflow(workflow)
        break
      case 'edit':
        await this.editWorkflow(workflow)
        break
      case 'regenerate':
        await this.createSmartWorkflow()
        break
    }
  }

  /**
   * 学习模式
   */
  async enableLearningMode(): Promise<void> {
    console.log(chalk.cyan('\n🧠 学习模式已启用\n'))
    console.log(chalk.gray('系统将记录您的命令使用模式，以提供更好的推荐'))
    
    // 设置命令拦截器
    await this.setupCommandInterceptor()
    
    console.log(chalk.green('\n✅ 学习模式配置完成'))
    console.log(chalk.gray('提示: 使用 "lgit recommend" 查看个性化推荐'))
  }

  /**
   * 命令预测
   */
  async predictNextCommand(): Promise<string | null> {
    if (this.history.length === 0) return null

    const lastCommand = this.history[this.history.length - 1].command
    const predictions = this.model.commandPairs.get(lastCommand)

    if (!predictions || predictions.size === 0) return null

    // 找出最可能的下一个命令
    let maxCount = 0
    let predictedCommand = null

    predictions.forEach((count, command) => {
      if (count > maxCount) {
        maxCount = count
        predictedCommand = command
      }
    })

    return predictedCommand
  }

  // ========== 推荐算法 ==========

  /**
   * 获取频繁使用的命令
   */
private async getFrequentCommands(context: CommandContext): Promise<Recommendation[]> {
    void context
    const recommendations: Recommendation[] = []
    
    // 按时间权重计算频率
    const weightedFrequency = new Map<string, number>()
    const now = Date.now()
    
    this.history.forEach(entry => {
      const age = now - entry.timestamp.getTime()
      const weight = Math.exp(-age / (30 * 24 * 60 * 60 * 1000)) // 30天衰减
      
      const current = weightedFrequency.get(entry.command) || 0
      weightedFrequency.set(entry.command, current + weight)
    })

    // 转换为推荐
    const sorted = Array.from(weightedFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    sorted.forEach(([command, frequency]) => {
      recommendations.push({
        command,
        score: frequency * 10,
        reason: `常用命令 (最近30天使用 ${Math.round(frequency)} 次)`,
        category: 'frequent',
        confidence: Math.min(frequency / 10, 1)
      })
    })

    return recommendations
  }

  /**
   * 获取上下文相关命令
   */
  private async getContextualCommands(context: CommandContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = []

    // 基于分支的推荐
    if (context.branch) {
      if (context.branch.startsWith('feature/')) {
        recommendations.push({
          command: 'git push -u origin HEAD',
          score: 80,
          reason: '功能分支通常需要推送到远程',
          category: 'contextual',
          confidence: 0.8
        })
      } else if (context.branch === 'main' || context.branch === 'master') {
        recommendations.push({
          command: 'git pull --rebase',
          score: 85,
          reason: '主分支建议先更新',
          category: 'contextual',
          confidence: 0.9
        })
      }
    }

    // 基于文件状态的推荐
    if (context.unstaged && context.unstaged > 0) {
      recommendations.push({
        command: 'git add .',
        score: 90,
        reason: `有 ${context.unstaged} 个未暂存的更改`,
        category: 'contextual',
        confidence: 0.95
      })
    }

    if (context.staged && context.staged > 0) {
      recommendations.push({
        command: 'git commit -m ""',
        score: 92,
        reason: `有 ${context.staged} 个已暂存的更改`,
        category: 'contextual',
        confidence: 0.95
      })
    }

    // 基于远程状态的推荐
    if (context.remoteStatus === 'behind') {
      recommendations.push({
        command: 'git pull',
        score: 95,
        reason: '本地分支落后于远程',
        category: 'contextual',
        confidence: 1.0
      })
    } else if (context.remoteStatus === 'ahead') {
      recommendations.push({
        command: 'git push',
        score: 88,
        reason: '本地分支领先于远程',
        category: 'contextual',
        confidence: 0.9
      })
    }

    return recommendations
  }

  /**
   * 获取工作流相关命令
   */
private async getWorkflowCommands(context: CommandContext): Promise<Recommendation[]> {
    void context
    const recommendations: Recommendation[] = []

    // 分析最近的命令序列
    if (this.history.length >= 2) {
      const recentCommands = this.history.slice(-5).map(h => h.command)
      
      // 检测常见工作流模式
      if (recentCommands.includes('git checkout -b')) {
        recommendations.push({
          command: 'git push -u origin HEAD',
          score: 75,
          reason: '新分支创建后通常需要推送',
          category: 'workflow',
          confidence: 0.7
        })
      }

      if (recentCommands.includes('git add') && !recentCommands.includes('git commit')) {
        recommendations.push({
          command: 'git commit -m ""',
          score: 85,
          reason: '添加文件后通常需要提交',
          category: 'workflow',
          confidence: 0.85
        })
      }

      if (recentCommands.filter(c => c.startsWith('git commit')).length >= 3) {
        recommendations.push({
          command: 'git push',
          score: 78,
          reason: '多次提交后建议推送',
          category: 'workflow',
          confidence: 0.75
        })
      }
    }

    return recommendations
  }

  /**
   * 获取预测性命令
   */
private async getPredictiveCommands(context: CommandContext): Promise<Recommendation[]> {
    void context
    const recommendations: Recommendation[] = []

    // 基于时间模式的预测
    const hour = new Date().getHours()
    const dayOfWeek = new Date().getDay()

    // 工作日早晨
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 8 && hour <= 10) {
      recommendations.push({
        command: 'git pull',
        score: 70,
        reason: '工作日早晨通常需要同步代码',
        category: 'predictive',
        confidence: 0.6
      })
    }

    // 周五下午
    if (dayOfWeek === 5 && hour >= 15) {
      recommendations.push({
        command: 'git push',
        score: 72,
        reason: '周末前建议推送所有更改',
        category: 'predictive',
        confidence: 0.65
      })
    }

    // 基于历史模式的预测
    const nextCommand = await this.predictNextCommand()
    if (nextCommand) {
      recommendations.push({
        command: nextCommand,
        score: 82,
        reason: '基于您的使用习惯预测',
        category: 'predictive',
        confidence: 0.8
      })
    }

    return recommendations
  }

  /**
   * 获取帮助性命令
   */
private async getHelpfulCommands(context: CommandContext): Promise<Recommendation[]> {
    void context
    const recommendations: Recommendation[] = []

    // 新手帮助
    if (this.history.length < 100) {
      recommendations.push({
        command: 'git status',
        score: 60,
        reason: '查看仓库当前状态',
        category: 'helpful',
        confidence: 0.5
      })

      recommendations.push({
        command: 'git log --oneline -10',
        score: 55,
        reason: '查看最近的提交历史',
        category: 'helpful',
        confidence: 0.5
      })
    }

    // 高级功能推荐
    if (this.history.length > 500) {
      const advancedCommands = [
        'git reflog',
        'git bisect',
        'git cherry-pick',
        'git rebase -i'
      ]

      const unusedAdvanced = advancedCommands.filter(cmd => 
        !this.history.some(h => h.command.startsWith(cmd))
      )

      if (unusedAdvanced.length > 0) {
        recommendations.push({
          command: unusedAdvanced[0],
          score: 50,
          reason: '尝试高级Git功能',
          category: 'helpful',
          confidence: 0.4
        })
      }
    }

    return recommendations
  }

  /**
   * 获取错误恢复命令
   */
private async getRecoveryCommands(context: CommandContext): Promise<Recommendation[]> {
    void context
    const recommendations: Recommendation[] = []

    // 检查最近的失败命令
    const recentFailures = this.history
      .slice(-10)
      .filter(h => !h.success)

    if (recentFailures.length > 0) {
      const lastFailure = recentFailures[recentFailures.length - 1]

      // 基于失败类型推荐恢复命令
      if (lastFailure.command.includes('merge')) {
        recommendations.push({
          command: 'git merge --abort',
          score: 95,
          reason: '取消失败的合并',
          category: 'recovery',
          confidence: 0.95
        })
      }

      if (lastFailure.command.includes('rebase')) {
        recommendations.push({
          command: 'git rebase --abort',
          score: 95,
          reason: '取消失败的变基',
          category: 'recovery',
          confidence: 0.95
        })
      }

      if (lastFailure.command.includes('commit')) {
        recommendations.push({
          command: 'git reset --soft HEAD~1',
          score: 85,
          reason: '撤销最后一次提交',
          category: 'recovery',
          confidence: 0.8
        })
      }
    }

    return recommendations
  }

  // ========== 工作流管理 ==========

  /**
   * 生成工作流
   */
  private async generateWorkflow(scenario: string): Promise<WorkflowTemplate> {
    const workflows: Record<string, WorkflowTemplate> = {
      feature: {
        name: '功能开发工作流',
        description: '创建新功能的标准流程',
        steps: [
          { command: 'git checkout main', description: '切换到主分支' },
          { command: 'git pull', description: '更新主分支' },
          { command: 'git checkout -b feature/new-feature', description: '创建功能分支' },
          { command: 'git add .', description: '暂存更改' },
          { command: 'git commit -m "feat: "', description: '提交更改' },
          { command: 'git push -u origin HEAD', description: '推送分支' }
        ]
      },
      bugfix: {
        name: 'Bug修复工作流',
        description: '修复紧急问题的流程',
        steps: [
          { command: 'git stash', description: '保存当前工作' },
          { command: 'git checkout main', description: '切换到主分支' },
          { command: 'git pull', description: '更新代码' },
          { command: 'git checkout -b bugfix/issue-fix', description: '创建修复分支' },
          { command: 'git add .', description: '暂存修复' },
          { command: 'git commit -m "fix: "', description: '提交修复' },
          { command: 'git push -u origin HEAD', description: '推送修复' }
        ]
      },
      release: {
        name: '发布准备工作流',
        description: '准备新版本发布的流程',
        steps: [
          { command: 'git checkout main', description: '切换到主分支' },
          { command: 'git pull', description: '更新代码' },
          { command: 'git tag -a v1.0.0 -m "Release version 1.0.0"', description: '创建标签' },
          { command: 'git push origin v1.0.0', description: '推送标签' },
          { command: 'git checkout -b release/1.0.0', description: '创建发布分支' },
          { command: 'git push -u origin HEAD', description: '推送发布分支' }
        ]
      }
    }

    return workflows[scenario] || workflows.feature
  }

  /**
   * 执行工作流
   */
  private async executeWorkflow(workflow: WorkflowTemplate): Promise<void> {
    console.log(chalk.cyan(`\n▶️ 执行工作流: ${workflow.name}\n`))

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i]
      console.log(chalk.blue(`步骤 ${i + 1}/${workflow.steps.length}: ${step.description || step.command}`))

      const { action } = await inquirer.prompt([
        {
          type: 'list',
          name: 'action',
          message: `执行: ${chalk.yellow(step.command)}`,
          choices: [
            { name: '✅ 执行', value: 'execute' },
            { name: '⏭️ 跳过', value: 'skip' },
            { name: '✏️ 编辑命令', value: 'edit' },
            { name: '❌ 中止工作流', value: 'abort' }
          ]
        }
      ])

      if (action === 'abort') {
        console.log(chalk.yellow('工作流已中止'))
        return
      }

      if (action === 'skip') {
        console.log(chalk.gray('已跳过'))
        continue
      }

      let commandToExecute = step.command

      if (action === 'edit') {
        const { edited } = await inquirer.prompt([
          {
            type: 'input',
            name: 'edited',
            message: '编辑命令:',
            default: step.command
          }
        ])
        commandToExecute = edited
      }

      // 执行命令
      try {
        const startTime = Date.now()
        console.log(chalk.gray(`执行: ${commandToExecute}`))
        const { stdout, stderr } = await execAsync(commandToExecute)
        
        if (stdout) console.log(stdout)
        if (stderr) console.error(chalk.yellow(stderr))
        
        const executionTime = Date.now() - startTime
        await this.recordCommand(commandToExecute, true, executionTime)
        
        console.log(chalk.green('✅ 完成\n'))
      } catch (error: any) {
        console.error(chalk.red('❌ 失败'), error.message)
        
        if (!step.continueOnError) {
          const { continueFlow } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'continueFlow',
              message: '是否继续执行工作流？',
              default: false
            }
          ])

          if (!continueFlow) {
            console.log(chalk.yellow('工作流已中止'))
            return
          }
        }
      }
    }

    console.log(chalk.green('\n✅ 工作流执行完成！'))
  }

  // ========== 辅助方法 ==========

  /**
   * 获取当前上下文
   */
  private async getCurrentContext(partial?: Partial<CommandContext>): Promise<CommandContext> {
    const context: CommandContext = { ...partial }

    try {
      // 获取分支信息
      const { stdout: branch } = await execAsync('git branch --show-current')
      context.branch = branch.trim()

      // 获取文件状态
      const { stdout: status } = await execAsync('git status --porcelain')
      const lines = status.split('\n').filter(l => l)
      
      context.filesChanged = lines.length
      context.staged = lines.filter(l => l[0] !== ' ' && l[0] !== '?').length
      context.unstaged = lines.filter(l => l[1] !== ' ' && l[1] !== '?').length
      context.untracked = lines.filter(l => l.startsWith('??')).length

      // 获取远程状态
      try {
        const { stdout: upstream } = await execAsync('git rev-list --left-right --count HEAD...@{u}')
        const [ahead, behind] = upstream.trim().split('\t').map(Number)
        
        if (ahead > 0 && behind > 0) {
          context.remoteStatus = 'diverged'
        } else if (ahead > 0) {
          context.remoteStatus = 'ahead'
        } else if (behind > 0) {
          context.remoteStatus = 'behind'
        } else {
          context.remoteStatus = 'up-to-date'
        }
      } catch {
        // 没有上游分支
      }

      // 时间上下文
      const hour = new Date().getHours()
      if (hour >= 6 && hour < 12) {
        context.timeOfDay = 'morning'
      } else if (hour >= 12 && hour < 18) {
        context.timeOfDay = 'afternoon'
      } else if (hour >= 18 && hour < 22) {
        context.timeOfDay = 'evening'
      } else {
        context.timeOfDay = 'night'
      }

      context.dayOfWeek = new Date().getDay()

    } catch (error) {
      // Git仓库不可用
    }

    return context
  }

  /**
   * 初始化模型
   */
  private initializeModel(): LearningModel {
    return {
      commandFrequency: new Map(),
      commandPairs: new Map(),
      contextPatterns: new Map(),
      timePatterns: new Map(),
      errorRecovery: new Map(),
      workflowSequences: []
    }
  }

  /**
   * 更新学习模型
   */
  private async updateModel(entry: CommandHistory): Promise<void> {
    // 更新命令频率
    const freq = this.model.commandFrequency.get(entry.command) || 0
    this.model.commandFrequency.set(entry.command, freq + 1)

    // 更新命令对
    if (this.history.length >= 2) {
      const prevCommand = this.history[this.history.length - 2].command
      if (!this.model.commandPairs.has(prevCommand)) {
        this.model.commandPairs.set(prevCommand, new Map())
      }
      const pairs = this.model.commandPairs.get(prevCommand)!
      const count = pairs.get(entry.command) || 0
      pairs.set(entry.command, count + 1)
    }

    // 更新上下文模式
this.getContextKey(entry.context)
    if (!this.model.contextPatterns.has(entry.command)) {
      this.model.contextPatterns.set(entry.command, [])
    }
    this.model.contextPatterns.get(entry.command)!.push(entry.context)

    // 更新时间模式
    const hour = entry.timestamp.getHours()
    if (!this.model.timePatterns.has(entry.command)) {
      this.model.timePatterns.set(entry.command, Array(24).fill(0))
    }
    const timePattern = this.model.timePatterns.get(entry.command)!
    timePattern[hour]++

    // 更新错误恢复模式
    if (!entry.success && this.history.length > 1) {
      const nextSuccessful = this.history
        .slice(this.history.indexOf(entry) + 1)
        .find(h => h.success)
      
      if (nextSuccessful) {
        if (!this.model.errorRecovery.has(entry.command)) {
          this.model.errorRecovery.set(entry.command, [])
        }
        this.model.errorRecovery.get(entry.command)!.push(nextSuccessful.command)
      }
    }

    // 分析工作流序列
    await this.analyzeWorkflowPatterns()
  }

  /**
   * 分析工作流模式
   */
  private async analyzeWorkflowPatterns(): Promise<void> {
    const sequences = new Map<string, CommandPattern>()
    const windowSize = 5

    for (let i = 0; i <= this.history.length - windowSize; i++) {
      const window = this.history.slice(i, i + windowSize)
      const sequence = window.map(h => h.command).join(' -> ')
      
      if (!sequences.has(sequence)) {
        sequences.set(sequence, {
          sequence: window.map(h => h.command),
          frequency: 0,
          lastUsed: new Date(0),
          successRate: 0,
          averageInterval: 0
        })
      }

      const pattern = sequences.get(sequence)!
      pattern.frequency++
      pattern.lastUsed = window[window.length - 1].timestamp
      pattern.successRate = window.filter(h => h.success).length / window.length

      // 计算平均间隔
      const intervals = []
      for (let j = 1; j < window.length; j++) {
        intervals.push(
          window[j].timestamp.getTime() - window[j - 1].timestamp.getTime()
        )
      }
      pattern.averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    }

    this.model.workflowSequences = Array.from(sequences.values())
      .filter(p => p.frequency >= 3)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 50)
  }

  /**
   * 去重推荐
   */
  private deduplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set<string>()
    return recommendations.filter(r => {
      const key = r.command.trim().toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  /**
   * 显示上下文
   */
  private displayContext(context: CommandContext): void {
    console.log(chalk.cyan('📍 当前上下文:'))
    
    if (context.branch) {
      console.log(`  分支: ${chalk.yellow(context.branch)}`)
    }
    
    if (context.filesChanged !== undefined) {
      console.log(`  文件变更: ${chalk.yellow(context.filesChanged)} 个`)
      if (context.staged) console.log(`    已暂存: ${chalk.green(context.staged)}`)
      if (context.unstaged) console.log(`    未暂存: ${chalk.red(context.unstaged)}`)
      if (context.untracked) console.log(`    未跟踪: ${chalk.gray(context.untracked)}`)
    }
    
    if (context.remoteStatus) {
      const statusColor = {
        'ahead': 'green',
        'behind': 'yellow',
        'diverged': 'red',
        'up-to-date': 'gray'
      }[context.remoteStatus] as any
      
console.log(`  远程状态: ${(chalk as any)[statusColor](context.remoteStatus)}`)
    }

    console.log()
  }

  /**
   * 按类别显示推荐
   */
  private displayRecommendationsByCategory(recommendations: Recommendation[]): void {
    const categories = {
      contextual: { name: '📍 上下文推荐', items: [] as Recommendation[] },
      frequent: { name: '⭐ 常用命令', items: [] as Recommendation[] },
      workflow: { name: '🔄 工作流推荐', items: [] as Recommendation[] },
      predictive: { name: '🔮 预测推荐', items: [] as Recommendation[] },
      helpful: { name: '💡 帮助建议', items: [] as Recommendation[] },
      recovery: { name: '🚑 错误恢复', items: [] as Recommendation[] }
    }

    recommendations.forEach(r => {
      categories[r.category].items.push(r)
    })

Object.entries(categories).forEach(([, cat]) => {
      if (cat.items.length > 0) {
        console.log(chalk.cyan.bold(cat.name))
        cat.items.slice(0, 3).forEach(r => {
          const confidence = '●'.repeat(Math.floor(r.confidence * 5))
          console.log(
            `  ${chalk.yellow(r.command)}\n` +
            `    ${chalk.gray(r.reason)} ${chalk.green(confidence)}`
          )
        })
        console.log()
      }
    })
  }

  /**
   * 执行命令
   */
  private async executeCommand(recommendation: Recommendation): Promise<void> {
    console.log(chalk.cyan(`\n执行: ${recommendation.command}\n`))

    try {
      const startTime = Date.now()
      const { stdout, stderr } = await execAsync(recommendation.command)
      
      if (stdout) console.log(stdout)
      if (stderr) console.error(chalk.yellow(stderr))
      
      const executionTime = Date.now() - startTime
      await this.recordCommand(recommendation.command, true, executionTime)
      
      console.log(chalk.green('\n✅ 命令执行成功'))
    } catch (error: any) {
      const executionTime = Date.now()
      await this.recordCommand(recommendation.command, false, executionTime, error.code)
      
      console.error(chalk.red('\n❌ 命令执行失败'), error.message)
      
      // 提供恢复建议
      const recoveries = await this.getRecoveryCommands(await this.getCurrentContext())
      if (recoveries.length > 0) {
        console.log(chalk.yellow('\n💡 建议的恢复操作:'))
        recoveries.forEach(r => {
          console.log(`  • ${chalk.cyan(r.command)} - ${chalk.gray(r.reason)}`)
        })
      }
    }
  }

  /**
   * 显示命令详情
   */
  private async showCommandDetails(recommendations: Recommendation[]): Promise<void> {
    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: '选择要查看的命令:',
        choices: recommendations.map(r => ({
          name: `${r.command} - ${r.reason}`,
          value: r
        }))
      }
    ])

    console.log(chalk.cyan('\n📚 命令详情\n'))
    console.log(`命令: ${chalk.yellow(selected.command)}`)
    console.log(`类别: ${selected.category}`)
    console.log(`置信度: ${(selected.confidence * 100).toFixed(0)}%`)
    console.log(`推荐原因: ${selected.reason}`)
    
    // 显示历史使用情况
    const usage = this.history.filter(h => h.command === selected.command)
    if (usage.length > 0) {
      console.log(chalk.cyan('\n📊 使用统计:'))
      console.log(`  总使用次数: ${usage.length}`)
      console.log(`  成功率: ${(usage.filter(u => u.success).length / usage.length * 100).toFixed(0)}%`)
      console.log(`  最后使用: ${this.formatDate(usage[usage.length - 1].timestamp)}`)
      
      const avgTime = usage.reduce((sum, u) => sum + u.executionTime, 0) / usage.length
      console.log(`  平均执行时间: ${avgTime.toFixed(0)}ms`)
    }

    // 显示相关命令
    const related = this.model.commandPairs.get(selected.command)
    if (related && related.size > 0) {
      console.log(chalk.cyan('\n🔗 相关命令:'))
      Array.from(related.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([cmd, count]) => {
          console.log(`  • ${cmd} (${count}次)`)
        })
    }
  }

  /**
   * 创建自定义工作流
   */
  private async createCustomWorkflow(): Promise<void> {
    console.log(chalk.cyan('\n🎨 创建自定义工作流\n'))

    const { name, description } = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: '工作流名称:',
        validate: input => input.length > 0 || '请输入名称'
      },
      {
        type: 'input',
        name: 'description',
        message: '工作流描述:'
      }
    ])

    const steps: WorkflowStep[] = []
    let addMore = true

    while (addMore) {
      const { command, stepDescription, continueOnError, another } = await inquirer.prompt([
        {
          type: 'input',
          name: 'command',
          message: `步骤 ${steps.length + 1} 命令:`,
          validate: input => input.length > 0 || '请输入命令'
        },
        {
          type: 'input',
          name: 'stepDescription',
          message: '步骤描述 (可选):'
        },
        {
          type: 'confirm',
          name: 'continueOnError',
          message: '失败后继续执行？',
          default: false
        },
        {
          type: 'confirm',
          name: 'another',
          message: '添加更多步骤？',
          default: true
        }
      ])

      steps.push({
        command,
        description: stepDescription,
        continueOnError
      })

      addMore = another
    }

    const workflow: WorkflowTemplate = {
      name,
      description,
      steps
    }

    await this.saveWorkflow(workflow)
    console.log(chalk.green(`\n✅ 工作流 "${name}" 已创建`))
  }

  /**
   * 显示使用统计
   */
  private async showUsageStatistics(): Promise<void> {
    console.log(chalk.cyan('\n📊 命令使用统计\n'))

    // 总体统计
    console.log(chalk.cyan.bold('总体统计:'))
    console.log(`  总命令数: ${this.history.length}`)
    console.log(`  成功率: ${(this.history.filter(h => h.success).length / this.history.length * 100).toFixed(1)}%`)
    console.log(`  唯一命令: ${this.model.commandFrequency.size}`)
    console.log()

    // Top 10 命令
    console.log(chalk.cyan.bold('Top 10 常用命令:'))
    const table = new Table({
      head: [chalk.cyan('#'), chalk.cyan('命令'), chalk.cyan('使用次数'), chalk.cyan('成功率')],
      style: { head: [], border: ['gray'] }
    })

    Array.from(this.model.commandFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([cmd, count], index) => {
        const usage = this.history.filter(h => h.command === cmd)
        const successRate = (usage.filter(u => u.success).length / usage.length * 100).toFixed(0)
        table.push([
          (index + 1).toString(),
          cmd.substring(0, 40),
          count.toString(),
          `${successRate}%`
        ])
      })

    console.log(table.toString())
  }

  /**
   * 搜索命令
   */
  private async searchCommands(): Promise<void> {
    const { query } = await inquirer.prompt([
      {
        type: 'input',
        name: 'query',
        message: '搜索命令:',
        validate: input => input.length > 0 || '请输入搜索词'
      }
    ])

    // 从历史和Git命令库中搜索
    const allCommands = Array.from(this.model.commandFrequency.keys())
    const gitCommands = [
      'git add', 'git commit', 'git push', 'git pull', 'git checkout',
      'git merge', 'git rebase', 'git stash', 'git reset', 'git log'
    ]
    
    const searchPool = [...new Set([...allCommands, ...gitCommands])]
    const results = fuzzysort.go(query, searchPool)

    if (results.length === 0) {
      console.log(chalk.yellow('没有找到匹配的命令'))
      return
    }

    console.log(chalk.cyan('\n🔍 搜索结果:\n'))
    results.slice(0, 10).forEach((result, index) => {
      const usage = this.history.filter(h => h.command === result.target).length
      console.log(`  ${index + 1}. ${chalk.yellow(result.target)} ${usage > 0 ? chalk.gray(`(使用 ${usage} 次)`) : ''}`)
    })
  }

  // ========== 持久化 ==========

  /**
   * 加载历史
   */
  private async loadHistory(): Promise<void> {
    try {
      const data = await fs.readFile(this.historyFile, 'utf-8')
      const parsed = JSON.parse(data)
      this.history = parsed.map((h: any) => ({
        ...h,
        timestamp: new Date(h.timestamp)
      }))
    } catch {
      // 文件不存在或解析失败
      this.history = []
    }
  }

  /**
   * 保存历史
   */
  private async saveHistory(): Promise<void> {
    const dir = path.dirname(this.historyFile)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(this.historyFile, JSON.stringify(this.history, null, 2))
  }

  /**
   * 加载模型
   */
  private async loadModel(): Promise<void> {
    try {
      const data = await fs.readFile(this.modelFile, 'utf-8')
      const parsed = JSON.parse(data)
      
      // 恢复 Map 对象
      this.model.commandFrequency = new Map(parsed.commandFrequency)
      this.model.commandPairs = new Map(
        parsed.commandPairs.map(([k, v]: [string, any]) => [k, new Map(v)])
      )
      this.model.contextPatterns = new Map(parsed.contextPatterns)
      this.model.timePatterns = new Map(parsed.timePatterns)
      this.model.errorRecovery = new Map(parsed.errorRecovery)
      this.model.workflowSequences = parsed.workflowSequences
    } catch {
      // 使用默认模型
    }
  }

  /**
   * 保存模型
   */
  private async saveModel(): Promise<void> {
    const dir = path.dirname(this.modelFile)
    await fs.mkdir(dir, { recursive: true })
    
    // 转换 Map 为数组以便序列化
    const serializable = {
      commandFrequency: Array.from(this.model.commandFrequency.entries()),
      commandPairs: Array.from(this.model.commandPairs.entries()).map(
        ([k, v]) => [k, Array.from(v.entries())]
      ),
      contextPatterns: Array.from(this.model.contextPatterns.entries()),
      timePatterns: Array.from(this.model.timePatterns.entries()),
      errorRecovery: Array.from(this.model.errorRecovery.entries()),
      workflowSequences: this.model.workflowSequences
    }
    
    await fs.writeFile(this.modelFile, JSON.stringify(serializable, null, 2))
  }

  /**
   * 保存工作流
   */
  private async saveWorkflow(workflow: WorkflowTemplate): Promise<void> {
    const workflowDir = path.join(os.homedir(), '.lgit', 'workflows')
    await fs.mkdir(workflowDir, { recursive: true })
    
    const filename = `${workflow.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.json`
    const filepath = path.join(workflowDir, filename)
    
    await fs.writeFile(filepath, JSON.stringify(workflow, null, 2))
  }

  /**
   * 编辑工作流
   */
private async editWorkflow(workflow: WorkflowTemplate): Promise<void> {
    void workflow
    // 简化实现
    console.log(chalk.cyan('工作流编辑功能开发中...'))
  }

  /**
   * 设置命令拦截器
   */
  private async setupCommandInterceptor(): Promise<void> {
    // 这需要系统级的钩子，简化实现
    console.log(chalk.gray('命令记录已启用'))
  }

  /**
   * 获取上下文键
   */
  private getContextKey(context: CommandContext): string {
    return `${context.branch || 'none'}-${context.remoteStatus || 'none'}`
  }

  /**
   * 获取类别表情
   */
  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      frequent: '⭐',
      contextual: '📍',
      workflow: '🔄',
      predictive: '🔮',
      helpful: '💡',
      recovery: '🚑'
    }
    return emojis[category] || '📌'
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes} 分钟前`
    if (hours < 24) return `${hours} 小时前`
    if (days < 7) return `${days} 天前`
    return date.toLocaleDateString()
  }

  /**
   * 分析模式
   */
  private async analyzePatterns(): Promise<void> {
    // 分析命令使用模式
    await this.analyzeWorkflowPatterns()
    
    // 分析时间模式
    this.analyzeTimePatterns()
    
    // 分析错误模式
    this.analyzeErrorPatterns()
  }

  /**
   * 分析时间模式
   */
  private analyzeTimePatterns(): void {
    // 简化实现
  }

  /**
   * 分析错误模式
   */
  private analyzeErrorPatterns(): void {
    // 简化实现
  }
}
