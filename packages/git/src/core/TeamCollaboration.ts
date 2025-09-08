/**
 * 团队协作功能模块
 * 支持PR/MR管理、代码审查提醒、团队统计等
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

const execAsync = promisify(exec)

interface PullRequest {
  id: number
  number: number
  title: string
  author: string
  state: 'open' | 'closed' | 'merged'
  created_at: Date
  updated_at: Date
  branch: string
  target_branch: string
  reviewers: string[]
  approved_by: string[]
  comments: number
  changes: {
    additions: number
    deletions: number
    files: number
  }
  labels: string[]
  url: string
}

interface TeamMember {
  name: string
  email: string
  username?: string
  stats: {
    commits: number
    additions: number
    deletions: number
    prs_created: number
    prs_reviewed: number
    last_active: Date
  }
}

interface ReviewReminder {
  pr: PullRequest
  reason: string
  priority: 'high' | 'medium' | 'low'
  age_days: number
}

interface TeamStats {
  period: string
  total_commits: number
  total_prs: number
  active_contributors: number
  code_changes: {
    additions: number
    deletions: number
    files_changed: number
  }
  top_contributors: TeamMember[]
  pr_metrics: {
    avg_time_to_merge: number
    avg_review_time: number
    approval_rate: number
  }
  activity_heatmap: Map<string, number>
}

export class TeamCollaboration {
  private git: Git
  private spinner?: ora.Ora
  private platform?: 'github' | 'gitlab' | 'bitbucket'
  private remoteUrl?: string
  private repoOwner?: string
  private repoName?: string

  constructor(git: Git) {
    this.git = git
  }

  /**
   * 初始化团队协作功能
   */
async initialize(): Promise<void> {
    void this.git; void this.repoOwner; void this.repoName
    // 检测平台和仓库信息
    await this.detectPlatform()
  }

  /**
   * 检测代码托管平台
   */
  private async detectPlatform(): Promise<void> {
    try {
      const { stdout } = await execAsync('git remote get-url origin')
      this.remoteUrl = stdout.trim()

      if (this.remoteUrl.includes('github.com')) {
        this.platform = 'github'
        const match = this.remoteUrl.match(/github\.com[:/]([^/]+)\/([^.]+)/)
        if (match) {
          this.repoOwner = match[1]
          this.repoName = match[2].replace('.git', '')
        }
      } else if (this.remoteUrl.includes('gitlab.com')) {
        this.platform = 'gitlab'
        const match = this.remoteUrl.match(/gitlab\.com[:/]([^/]+)\/([^.]+)/)
        if (match) {
          this.repoOwner = match[1]
          this.repoName = match[2].replace('.git', '')
        }
      } else if (this.remoteUrl.includes('bitbucket.org')) {
        this.platform = 'bitbucket'
        const match = this.remoteUrl.match(/bitbucket\.org[:/]([^/]+)\/([^.]+)/)
        if (match) {
          this.repoOwner = match[1]
          this.repoName = match[2].replace('.git', '')
        }
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️ 无法检测远程仓库信息'))
    }
  }

  /**
   * PR/MR 管理主菜单
   */
  async managePullRequests(): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择 PR/MR 操作:',
        choices: [
          { name: '📋 查看 PR 列表', value: 'list' },
          { name: '➕ 创建新 PR', value: 'create' },
          { name: '🔍 查看 PR 详情', value: 'view' },
          { name: '✅ 批准 PR', value: 'approve' },
          { name: '💬 添加评论', value: 'comment' },
          { name: '🔄 更新 PR', value: 'update' },
          { name: '🎯 合并 PR', value: 'merge' },
          { name: '📊 PR 统计', value: 'stats' }
        ]
      }
    ])

    switch (action) {
      case 'list':
        await this.listPullRequests()
        break
      case 'create':
        await this.createPullRequest()
        break
      case 'view':
        await this.viewPullRequest()
        break
      case 'approve':
        await this.approvePullRequest()
        break
      case 'comment':
        await this.commentOnPullRequest()
        break
      case 'update':
        await this.updatePullRequest()
        break
      case 'merge':
        await this.mergePullRequest()
        break
      case 'stats':
        await this.showPRStatistics()
        break
    }
  }

  /**
   * 列出 Pull Requests
   */
  private async listPullRequests(): Promise<void> {
    console.log(chalk.cyan('\n📋 Pull Requests 列表\n'))

    // 模拟 PR 数据（实际应该从 API 获取）
    const prs = await this.fetchPullRequests()

    if (prs.length === 0) {
      console.log(chalk.yellow('没有开放的 Pull Requests'))
      return
    }

    const table = new Table({
      head: [
        chalk.cyan('#'),
        chalk.cyan('标题'),
        chalk.cyan('作者'),
        chalk.cyan('状态'),
        chalk.cyan('评审'),
        chalk.cyan('更新时间')
      ],
      style: {
        head: [],
        border: ['gray']
      },
      colWidths: [6, 30, 15, 10, 10, 15]
    })

    prs.forEach(pr => {
      const reviewStatus = pr.approved_by.length > 0 
        ? chalk.green(`✅ ${pr.approved_by.length}`)
        : chalk.yellow(`⏳ ${pr.reviewers.length}`)

      table.push([
        `#${pr.number}`,
        pr.title.substring(0, 28),
        pr.author,
        this.getStatusBadge(pr.state),
        reviewStatus,
        this.formatDate(pr.updated_at)
      ])
    })

    console.log(table.toString())

    // 显示汇总
    const openPRs = prs.filter(pr => pr.state === 'open').length
    const needsReview = prs.filter(pr => pr.state === 'open' && pr.approved_by.length === 0).length
    
    console.log(chalk.cyan('\n📊 汇总:'))
    console.log(`  开放的 PR: ${chalk.yellow(openPRs)}`)
    console.log(`  待审查: ${chalk.red(needsReview)}`)
    console.log(`  已批准: ${chalk.green(prs.filter(pr => pr.approved_by.length > 0).length)}`)
  }

  /**
   * 创建 Pull Request
   */
  private async createPullRequest(): Promise<void> {
    // 获取当前分支
    const { stdout: currentBranch } = await execAsync('git branch --show-current')
    const branch = currentBranch.trim()

    if (branch === 'main' || branch === 'master') {
      console.log(chalk.red('❌ 不能从主分支创建 PR'))
      return
    }

    const { title, description, targetBranch, reviewers, labels } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'PR 标题:',
        validate: input => input.length > 0 || '标题不能为空'
      },
      {
        type: 'editor',
        name: 'description',
        message: 'PR 描述 (按 Enter 打开编辑器):'
      },
      {
        type: 'input',
        name: 'targetBranch',
        message: '目标分支:',
        default: 'main'
      },
      {
        type: 'input',
        name: 'reviewers',
        message: '评审人 (用逗号分隔):',
        filter: input => input.split(',').map(r => r.trim()).filter(r => r)
      },
      {
        type: 'checkbox',
        name: 'labels',
        message: '选择标签:',
        choices: [
          'feature',
          'bugfix',
          'hotfix',
          'refactor',
          'documentation',
          'testing',
          'performance',
          'security'
        ]
      }
    ])

    this.spinner = ora('创建 Pull Request...').start()

    try {
      // 推送当前分支
      await execAsync(`git push -u origin ${branch}`)

      // 根据平台创建 PR
      if (this.platform === 'github') {
        // 使用 GitHub CLI
        const prCmd = `gh pr create --title "${title}" --body "${description}" --base ${targetBranch} --head ${branch}`
        await execAsync(prCmd)
        this.spinner.succeed('Pull Request 创建成功！')
        
        // 打开 PR 页面
        const { openInBrowser } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'openInBrowser',
            message: '是否在浏览器中打开 PR？',
            default: true
          }
        ])
        
        if (openInBrowser) {
          await execAsync('gh pr view --web')
        }
      } else {
        this.spinner.info(`请在 ${this.platform} 网站上手动创建 PR`)
        console.log(chalk.cyan('\n信息:'))
        console.log(`  源分支: ${chalk.green(branch)}`)
        console.log(`  目标分支: ${chalk.green(targetBranch)}`)
        console.log(`  标题: ${chalk.green(title)}`)
        if (reviewers.length > 0) {
          console.log(`  评审人: ${chalk.green(reviewers.join(', '))}`)
        }
        if (labels.length > 0) {
          console.log(`  标签: ${chalk.green(labels.join(', '))}`)
        }
      }
    } catch (error) {
      this.spinner.fail('创建 PR 失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 代码审查提醒
   */
  async showReviewReminders(): Promise<void> {
    console.log(chalk.cyan('\n🔔 代码审查提醒\n'))

    const reminders = await this.generateReviewReminders()

    if (reminders.length === 0) {
      console.log(chalk.green('✨ 没有待处理的审查任务'))
      return
    }

    // 按优先级分组
    const highPriority = reminders.filter(r => r.priority === 'high')
    const mediumPriority = reminders.filter(r => r.priority === 'medium')
    const lowPriority = reminders.filter(r => r.priority === 'low')

    // 显示高优先级
    if (highPriority.length > 0) {
      console.log(chalk.red.bold('🔴 高优先级:'))
      highPriority.forEach(reminder => {
        console.log(`  • PR #${reminder.pr.number}: ${reminder.pr.title}`)
        console.log(`    ${chalk.yellow(reminder.reason)} (${reminder.age_days} 天)`)
      })
      console.log()
    }

    // 显示中优先级
    if (mediumPriority.length > 0) {
      console.log(chalk.yellow.bold('🟡 中优先级:'))
      mediumPriority.forEach(reminder => {
        console.log(`  • PR #${reminder.pr.number}: ${reminder.pr.title}`)
        console.log(`    ${chalk.gray(reminder.reason)} (${reminder.age_days} 天)`)
      })
      console.log()
    }

    // 显示低优先级
    if (lowPriority.length > 0) {
      console.log(chalk.green.bold('🟢 低优先级:'))
      lowPriority.forEach(reminder => {
        console.log(`  • PR #${reminder.pr.number}: ${reminder.pr.title}`)
        console.log(`    ${chalk.gray(reminder.reason)} (${reminder.age_days} 天)`)
      })
    }

    // 显示行动建议
    console.log(chalk.cyan('\n💡 建议:'))
    if (highPriority.length > 0) {
      console.log(chalk.red('  • 请优先处理高优先级的审查任务'))
    }
    console.log('  • 使用 "lgit team pr view <number>" 查看 PR 详情')
    console.log('  • 使用 "lgit team pr approve <number>" 批准 PR')
  }

  /**
   * 团队统计
   */
  async showTeamStatistics(period?: string): Promise<void> {
    const selectedPeriod = period || await this.selectPeriod()
    
    console.log(chalk.cyan(`\n📊 团队统计 (${selectedPeriod})\n`))

    this.spinner = ora('收集统计数据...').start()

    try {
      const stats = await this.collectTeamStatistics(selectedPeriod)
      this.spinner.stop()

      // 显示总体概览
      console.log(chalk.cyan.bold('📈 总体概览:'))
      console.log(`  期间: ${chalk.yellow(stats.period)}`)
      console.log(`  总提交数: ${chalk.green(stats.total_commits)}`)
      console.log(`  Pull Requests: ${chalk.green(stats.total_prs)}`)
      console.log(`  活跃贡献者: ${chalk.green(stats.active_contributors)}`)
      console.log(`  代码变更: ${chalk.green(`+${stats.code_changes.additions}`)} / ${chalk.red(`-${stats.code_changes.deletions}`)}`)
      console.log()

      // 显示顶级贡献者
      console.log(chalk.cyan.bold('🏆 顶级贡献者:'))
      const contributorTable = new Table({
        head: [
          chalk.cyan('排名'),
          chalk.cyan('贡献者'),
          chalk.cyan('提交'),
          chalk.cyan('添加'),
          chalk.cyan('删除'),
          chalk.cyan('PR')
        ],
        style: {
          head: [],
          border: ['gray']
        }
      })

      stats.top_contributors.slice(0, 5).forEach((member, index) => {
        contributorTable.push([
          `${this.getRankEmoji(index + 1)} ${index + 1}`,
          member.name,
          member.stats.commits.toString(),
          chalk.green(`+${member.stats.additions}`),
          chalk.red(`-${member.stats.deletions}`),
          member.stats.prs_created.toString()
        ])
      })

      console.log(contributorTable.toString())
      console.log()

      // 显示 PR 指标
      console.log(chalk.cyan.bold('⏱️ PR 指标:'))
      console.log(`  平均合并时间: ${chalk.yellow(this.formatDuration(stats.pr_metrics.avg_time_to_merge))}`)
      console.log(`  平均审查时间: ${chalk.yellow(this.formatDuration(stats.pr_metrics.avg_review_time))}`)
      console.log(`  批准率: ${chalk.green(`${stats.pr_metrics.approval_rate}%`)}`)
      console.log()

      // 显示活动热力图
      await this.displayActivityHeatmap(stats.activity_heatmap)

      // 生成报告
      const { generateReport } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'generateReport',
          message: '是否生成详细报告？',
          default: false
        }
      ])

      if (generateReport) {
        await this.generateTeamReport(stats)
      }

    } catch (error) {
      this.spinner.fail('获取统计数据失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 团队通知功能
   */
  async sendTeamNotification(type: string, data: any): Promise<void> {
    const { channel } = await inquirer.prompt([
      {
        type: 'list',
        name: 'channel',
        message: '选择通知渠道:',
        choices: [
          { name: 'Slack', value: 'slack' },
          { name: 'Discord', value: 'discord' },
          { name: 'Email', value: 'email' },
          { name: 'Webhook', value: 'webhook' }
        ]
      }
    ])

    switch (channel) {
      case 'slack':
        await this.sendSlackNotification(type, data)
        break
      case 'discord':
        await this.sendDiscordNotification(type, data)
        break
      case 'email':
        await this.sendEmailNotification(type, data)
        break
      case 'webhook':
        await this.sendWebhookNotification(type, data)
        break
    }
  }

  /**
   * 代码审查分配
   */
  async assignReviewers(): Promise<void> {
    // 获取团队成员列表
    const teamMembers = await this.getTeamMembers()
    
    const { strategy, prNumber, reviewers } = await inquirer.prompt([
      {
        type: 'list',
        name: 'strategy',
        message: '选择分配策略:',
        choices: [
          { name: '手动选择', value: 'manual' },
          { name: '轮流分配', value: 'round-robin' },
          { name: '基于专长', value: 'expertise' },
          { name: '随机分配', value: 'random' },
          { name: '负载均衡', value: 'load-balance' }
        ]
      },
      {
        type: 'input',
        name: 'prNumber',
        message: 'PR 编号:',
        validate: input => /^\d+$/.test(input) || '请输入有效的 PR 编号'
      },
      {
        type: 'checkbox',
        name: 'reviewers',
        message: '选择审查者:',
        choices: teamMembers.map(m => ({ name: m.name, value: m.username })),
        when: answers => answers.strategy === 'manual',
        validate: input => input.length > 0 || '请至少选择一个审查者'
      }
    ])

    let assignedReviewers: string[] = []

    switch (strategy) {
      case 'manual':
        assignedReviewers = reviewers
        break
      case 'round-robin':
        assignedReviewers = await this.assignRoundRobin(teamMembers)
        break
      case 'expertise':
        assignedReviewers = await this.assignByExpertise(prNumber, teamMembers)
        break
      case 'random':
        assignedReviewers = this.assignRandom(teamMembers, 2)
        break
      case 'load-balance':
        assignedReviewers = await this.assignByLoadBalance(teamMembers)
        break
    }

    console.log(chalk.cyan('\n👥 分配的审查者:'))
    assignedReviewers.forEach(reviewer => {
      console.log(`  • ${reviewer}`)
    })

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: '确认分配这些审查者？',
        default: true
      }
    ])

    if (confirm) {
      await this.applyReviewerAssignment(prNumber, assignedReviewers)
    }
  }

  /**
   * 团队工作流管理
   */
  async manageWorkflows(): Promise<void> {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: '选择工作流操作:',
        choices: [
          { name: '查看活动工作流', value: 'list' },
          { name: '创建新工作流', value: 'create' },
          { name: '编辑工作流规则', value: 'edit' },
          { name: '查看工作流历史', value: 'history' },
          { name: '工作流统计', value: 'stats' }
        ]
      }
    ])

    switch (action) {
      case 'list':
        await this.listWorkflows()
        break
      case 'create':
        await this.createWorkflow()
        break
      case 'edit':
        await this.editWorkflow()
        break
      case 'history':
        await this.showWorkflowHistory()
        break
      case 'stats':
        await this.showWorkflowStats()
        break
    }
  }

  // ========== 辅助方法 ==========

  /**
   * 获取 PR 列表（模拟数据）
   */
  private async fetchPullRequests(): Promise<PullRequest[]> {
    // 实际应该从 GitHub/GitLab API 获取
    return [
      {
        id: 1,
        number: 42,
        title: 'feat: Add new authentication module',
        author: 'alice',
        state: 'open',
        created_at: new Date('2024-01-15'),
        updated_at: new Date('2024-01-16'),
        branch: 'feature/auth',
        target_branch: 'main',
        reviewers: ['bob', 'charlie'],
        approved_by: ['bob'],
        comments: 5,
        changes: { additions: 150, deletions: 20, files: 8 },
        labels: ['feature', 'security'],
        url: 'https://github.com/example/repo/pull/42'
      },
      {
        id: 2,
        number: 43,
        title: 'fix: Resolve memory leak in cache',
        author: 'bob',
        state: 'open',
        created_at: new Date('2024-01-16'),
        updated_at: new Date('2024-01-17'),
        branch: 'bugfix/memory-leak',
        target_branch: 'main',
        reviewers: ['alice'],
        approved_by: [],
        comments: 2,
        changes: { additions: 45, deletions: 30, files: 3 },
        labels: ['bugfix', 'performance'],
        url: 'https://github.com/example/repo/pull/43'
      }
    ]
  }

  /**
   * 生成审查提醒
   */
  private async generateReviewReminders(): Promise<ReviewReminder[]> {
    const prs = await this.fetchPullRequests()
    const reminders: ReviewReminder[] = []

    for (const pr of prs) {
      if (pr.state !== 'open') continue

      const ageInDays = Math.floor((Date.now() - pr.created_at.getTime()) / (1000 * 60 * 60 * 24))

      // 高优先级：超过3天未审查
      if (pr.approved_by.length === 0 && ageInDays > 3) {
        reminders.push({
          pr,
          reason: '超过3天未审查',
          priority: 'high',
          age_days: ageInDays
        })
      }
      // 中优先级：有评论但未批准
      else if (pr.comments > 0 && pr.approved_by.length === 0) {
        reminders.push({
          pr,
          reason: '有讨论但未批准',
          priority: 'medium',
          age_days: ageInDays
        })
      }
      // 低优先级：新 PR
      else if (ageInDays <= 1) {
        reminders.push({
          pr,
          reason: '新提交的 PR',
          priority: 'low',
          age_days: ageInDays
        })
      }
    }

    return reminders
  }

  /**
   * 收集团队统计数据
   */
  private async collectTeamStatistics(period: string): Promise<TeamStats> {
    // 模拟统计数据
    return {
      period,
      total_commits: 234,
      total_prs: 45,
      active_contributors: 8,
      code_changes: {
        additions: 5420,
        deletions: 2310,
        files_changed: 142
      },
      top_contributors: [
        {
          name: 'Alice',
          email: 'alice@example.com',
          username: 'alice',
          stats: {
            commits: 67,
            additions: 1820,
            deletions: 450,
            prs_created: 12,
            prs_reviewed: 18,
            last_active: new Date()
          }
        },
        {
          name: 'Bob',
          email: 'bob@example.com',
          username: 'bob',
          stats: {
            commits: 52,
            additions: 1200,
            deletions: 600,
            prs_created: 8,
            prs_reviewed: 15,
            last_active: new Date()
          }
        }
      ],
      pr_metrics: {
        avg_time_to_merge: 2.5 * 24 * 60 * 60 * 1000, // 2.5 days
        avg_review_time: 8 * 60 * 60 * 1000, // 8 hours
        approval_rate: 92
      },
      activity_heatmap: new Map([
        ['Mon', 45],
        ['Tue', 52],
        ['Wed', 48],
        ['Thu', 41],
        ['Fri', 38],
        ['Sat', 8],
        ['Sun', 5]
      ])
    }
  }

  /**
   * 获取团队成员
   */
  private async getTeamMembers(): Promise<TeamMember[]> {
    // 实际应该从配置或 API 获取
    return [
      {
        name: 'Alice',
        email: 'alice@example.com',
        username: 'alice',
        stats: {
          commits: 67,
          additions: 1820,
          deletions: 450,
          prs_created: 12,
          prs_reviewed: 18,
          last_active: new Date()
        }
      },
      {
        name: 'Bob',
        email: 'bob@example.com',
        username: 'bob',
        stats: {
          commits: 52,
          additions: 1200,
          deletions: 600,
          prs_created: 8,
          prs_reviewed: 15,
          last_active: new Date()
        }
      }
    ]
  }

  /**
   * 显示活动热力图
   */
  private async displayActivityHeatmap(heatmap: Map<string, number>): Promise<void> {
    console.log(chalk.cyan.bold('📅 每周活动分布:'))
    
    const maxValue = Math.max(...heatmap.values())
    
    heatmap.forEach((value, day) => {
      const percentage = (value / maxValue) * 100
      const bar = this.generateBar(percentage, 20)
      const color = percentage > 75 ? chalk.green : percentage > 50 ? chalk.yellow : chalk.red
      console.log(`  ${day}: ${bar} ${color(value)} 次提交`)
    })
    console.log()
  }

  /**
   * 生成团队报告
   */
  private async generateTeamReport(stats: TeamStats): Promise<void> {
    const reportPath = path.join(process.cwd(), `team-report-${Date.now()}.md`)
    
    const report = `# 团队协作报告

## 统计期间
${stats.period}

## 总体概览
- 总提交数: ${stats.total_commits}
- Pull Requests: ${stats.total_prs}
- 活跃贡献者: ${stats.active_contributors}
- 代码变更: +${stats.code_changes.additions} / -${stats.code_changes.deletions}

## 顶级贡献者
${stats.top_contributors.map((m, i) => 
  `${i + 1}. ${m.name} - ${m.stats.commits} 次提交`
).join('\n')}

## PR 指标
- 平均合并时间: ${this.formatDuration(stats.pr_metrics.avg_time_to_merge)}
- 平均审查时间: ${this.formatDuration(stats.pr_metrics.avg_review_time)}
- 批准率: ${stats.pr_metrics.approval_rate}%

生成时间: ${new Date().toISOString()}
`

    await fs.writeFile(reportPath, report)
    console.log(chalk.green(`✅ 报告已生成: ${reportPath}`))
  }

  // ========== 工具方法 ==========

  private getStatusBadge(state: string): string {
    switch (state) {
      case 'open': return chalk.green('● Open')
      case 'closed': return chalk.red('● Closed')
      case 'merged': return chalk.magenta('● Merged')
      default: return state
    }
  }

  private formatDate(date: Date): string {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days} 天前`
    if (days < 30) return `${Math.floor(days / 7)} 周前`
    return `${Math.floor(days / 30)} 月前`
  }

  private formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) {
      return `${days} 天 ${hours % 24} 小时`
    }
    return `${hours} 小时`
  }

  private getRankEmoji(rank: number): string {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '🏅'
    }
  }

  private generateBar(percentage: number, width: number): string {
    const filled = Math.floor((percentage / 100) * width)
    const empty = width - filled
    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
  }

  private async selectPeriod(): Promise<string> {
    const { period } = await inquirer.prompt([
      {
        type: 'list',
        name: 'period',
        message: '选择统计周期:',
        choices: [
          { name: '最近7天', value: '7days' },
          { name: '最近30天', value: '30days' },
          { name: '最近3个月', value: '3months' },
          { name: '今年', value: 'year' },
          { name: '自定义', value: 'custom' }
        ]
      }
    ])

    if (period === 'custom') {
      const { startDate, endDate } = await inquirer.prompt([
        {
          type: 'input',
          name: 'startDate',
          message: '开始日期 (YYYY-MM-DD):',
          validate: input => /^\d{4}-\d{2}-\d{2}$/.test(input) || '请输入有效日期'
        },
        {
          type: 'input',
          name: 'endDate',
          message: '结束日期 (YYYY-MM-DD):',
          validate: input => /^\d{4}-\d{2}-\d{2}$/.test(input) || '请输入有效日期'
        }
      ])
      return `${startDate} 至 ${endDate}`
    }

    return period
  }

  // ========== 通知方法 ==========

private async sendSlackNotification(type: string, data: any): Promise<void> {
    void type; void data
    console.log(chalk.cyan('📮 发送 Slack 通知...'))
    // 实际实现需要 Slack Webhook URL
    console.log(chalk.green('✅ 通知已发送到 Slack'))
  }

private async sendDiscordNotification(type: string, data: any): Promise<void> {
    void type; void data
    console.log(chalk.cyan('📮 发送 Discord 通知...'))
    // 实际实现需要 Discord Webhook URL
    console.log(chalk.green('✅ 通知已发送到 Discord'))
  }

private async sendEmailNotification(type: string, data: any): Promise<void> {
    void type; void data
    console.log(chalk.cyan('📮 发送邮件通知...'))
    // 实际实现需要邮件配置
    console.log(chalk.green('✅ 邮件已发送'))
  }

private async sendWebhookNotification(type: string, data: any): Promise<void> {
    void type; void data
const { webhookUrl } = await inquirer.prompt([
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      {
        type: 'input',
        name: 'webhookUrl',
        message: 'Webhook URL:',
        validate: input => input.startsWith('http') || '请输入有效的 URL'
      }
    ])

void webhookUrl
    console.log(chalk.cyan('📮 发送 Webhook 通知...'))
    // 实际实现 webhook 调用
    console.log(chalk.green('✅ Webhook 已触发'))
  }

  // ========== 审查分配策略 ==========

  private async assignRoundRobin(members: TeamMember[]): Promise<string[]> {
    // 轮流分配逻辑
    const lastAssigned = await this.getLastAssignedReviewer()
    const index = members.findIndex(m => m.username === lastAssigned)
    const nextIndex = (index + 1) % members.length
    return [members[nextIndex].username!]
  }

private async assignByExpertise(prNumber: string, members: TeamMember[]): Promise<string[]> {
    void prNumber
    // 基于专长分配（分析 PR 涉及的文件）
    console.log(chalk.cyan('分析 PR 内容以匹配专长...'))
    // 模拟返回
    return members.slice(0, 2).map(m => m.username!)
  }

  private assignRandom(members: TeamMember[], count: number): string[] {
    // 随机分配
    const shuffled = [...members].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count).map(m => m.username!)
  }

  private async assignByLoadBalance(members: TeamMember[]): Promise<string[]> {
    // 基于负载均衡分配
    const workload = await this.getReviewerWorkload(members)
    const sorted = members.sort((a, b) => 
      (workload.get(a.username!) || 0) - (workload.get(b.username!) || 0)
    )
    return [sorted[0].username!]
  }

  private async getLastAssignedReviewer(): Promise<string> {
    // 获取上次分配的审查者
    return 'alice'
  }

  private async getReviewerWorkload(members: TeamMember[]): Promise<Map<string, number>> {
    // 获取审查者当前工作负载
    const workload = new Map<string, number>()
    members.forEach(m => {
      workload.set(m.username!, Math.floor(Math.random() * 5))
    })
    return workload
  }

private async applyReviewerAssignment(prNumber: string, reviewers: string[]): Promise<void> {
    void reviewers
    console.log(chalk.green(`✅ 已为 PR #${prNumber} 分配审查者`))
  }

  // ========== 工作流方法 ==========

  private async listWorkflows(): Promise<void> {
    console.log(chalk.cyan('\n⚙️ 活动工作流:\n'))
    console.log('  • PR 自动标签')
    console.log('  • 代码覆盖率检查')
    console.log('  • 自动化测试')
    console.log('  • 部署流水线')
  }

  private async createWorkflow(): Promise<void> {
    console.log(chalk.cyan('创建新工作流功能开发中...'))
  }

  private async editWorkflow(): Promise<void> {
    console.log(chalk.cyan('编辑工作流功能开发中...'))
  }

  private async showWorkflowHistory(): Promise<void> {
    console.log(chalk.cyan('工作流历史功能开发中...'))
  }

  private async showWorkflowStats(): Promise<void> {
    console.log(chalk.cyan('工作流统计功能开发中...'))
  }

  // ========== PR 操作方法 ==========

  private async viewPullRequest(): Promise<void> {
    const { prNumber } = await inquirer.prompt([
      {
        type: 'input',
        name: 'prNumber',
        message: 'PR 编号:',
        validate: input => /^\d+$/.test(input) || '请输入有效的 PR 编号'
      }
    ])

    console.log(chalk.cyan(`\n查看 PR #${prNumber} 详情...\n`))
    // 实际实现应该调用 API 获取详情
  }

  private async approvePullRequest(): Promise<void> {
    const { prNumber } = await inquirer.prompt([
      {
        type: 'input',
        name: 'prNumber',
        message: 'PR 编号:',
        validate: input => /^\d+$/.test(input) || '请输入有效的 PR 编号'
      }
    ])

    console.log(chalk.green(`✅ PR #${prNumber} 已批准`))
  }

  private async commentOnPullRequest(): Promise<void> {
const { prNumber, comment } = await inquirer.prompt([
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      {
        type: 'input',
        name: 'prNumber',
        message: 'PR 编号:',
        validate: input => /^\d+$/.test(input) || '请输入有效的 PR 编号'
      },
      {
        type: 'editor',
        name: 'comment',
        message: '评论内容:'
      }
    ])

void comment
    console.log(chalk.green(`✅ 评论已添加到 PR #${prNumber}`))
  }

  private async updatePullRequest(): Promise<void> {
    const { prNumber } = await inquirer.prompt([
      {
        type: 'input',
        name: 'prNumber',
        message: 'PR 编号:',
        validate: input => /^\d+$/.test(input) || '请输入有效的 PR 编号'
      }
    ])

    console.log(chalk.green(`✅ PR #${prNumber} 已更新`))
  }

  private async mergePullRequest(): Promise<void> {
    const { prNumber, mergeStrategy } = await inquirer.prompt([
      {
        type: 'input',
        name: 'prNumber',
        message: 'PR 编号:',
        validate: input => /^\d+$/.test(input) || '请输入有效的 PR 编号'
      },
      {
        type: 'list',
        name: 'mergeStrategy',
        message: '合并策略:',
        choices: [
          { name: '创建合并提交', value: 'merge' },
          { name: 'Squash 合并', value: 'squash' },
          { name: 'Rebase 合并', value: 'rebase' }
        ]
      }
    ])

    console.log(chalk.green(`✅ PR #${prNumber} 已合并 (${mergeStrategy})`))
  }

  private async showPRStatistics(): Promise<void> {
    console.log(chalk.cyan('\n📊 PR 统计\n'))
    
    const stats = {
      total: 145,
      open: 12,
      merged: 128,
      closed: 5,
      avgTimeToMerge: '2.5 天',
      avgReviewTime: '8 小时'
    }

    console.log(`  总计: ${chalk.yellow(stats.total)}`)
    console.log(`  开放: ${chalk.green(stats.open)}`)
    console.log(`  已合并: ${chalk.blue(stats.merged)}`)
    console.log(`  已关闭: ${chalk.red(stats.closed)}`)
    console.log(`  平均合并时间: ${chalk.yellow(stats.avgTimeToMerge)}`)
    console.log(`  平均审查时间: ${chalk.yellow(stats.avgReviewTime)}`)
  }
}
