/**
 * Git 分析器
 * 提供仓库统计、贡献者分析、代码热力图等功能
 */

import { Git } from '../index.js'
import chalk from 'chalk'
import Table from 'cli-table3'
import ora from 'ora'
import boxen from 'boxen'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface ContributorStats {
  name: string
  email: string
  commits: number
  additions: number
  deletions: number
  firstCommit: Date
  lastCommit: Date
}


export class GitAnalyzer {
  private git: Git
  private spinner?: ora.Ora

  constructor(git: Git) {
    this.git = git
  }

  /**
   * 分析入口
   */
  async analyze(type: string = 'all', options: any = {}): Promise<void> {
    switch (type) {
      case 'commits':
        await this.analyzeCommits(options)
        break
      case 'contributors':
        await this.analyzeContributors(options)
        break
      case 'files':
        await this.analyzeFiles(options)
        break
      case 'branches':
        await this.analyzeBranches(options)
        break
      case 'heatmap':
        await this.generateHeatmap(options)
        break
      case 'trends':
        await this.analyzeTrends(options)
        break
      case 'all':
        await this.generateFullReport(options)
        break
      default:
        console.error(chalk.red(`未知的分析类型: ${type}`))
    }
  }

  /**
   * 分析提交统计
   */
private async analyzeCommits(options: any): Promise<void> {
    void options
    this.spinner = ora('分析提交历史...').start()

    try {
      // 获取提交统计
      const { stdout: totalCommits } = await execAsync('git rev-list --count HEAD')
      const { stdout: authors } = await execAsync('git shortlog -sn --all')
      const { stdout: recentCommits } = await execAsync('git log --oneline -n 20')
      
      // 按时间分析
      const { stdout: dailyStats } = await execAsync(
        'git log --date=short --pretty=format:"%ad" | sort | uniq -c'
      )
      
      const { stdout: weeklyActivity } = await execAsync(
        'git log --pretty=format:"%ad" --date=format:"%w" | sort | uniq -c'
      )

      this.spinner.succeed('提交分析完成!')

      // 显示统计结果
      console.log(boxen(
        chalk.cyan('📊 提交统计\n\n') +
        `总提交数: ${chalk.yellow(totalCommits.trim())}\n` +
        `贡献者数: ${chalk.yellow(authors.split('\n').filter(l => l).length)}\n` +
        `平均每日提交: ${chalk.yellow(this.calculateDailyAverage(dailyStats))}`,
        {
          padding: 1,
          borderStyle: 'round',
          borderColor: 'cyan'
        }
      ))

      // 显示每周活跃度
      console.log(chalk.cyan('\n📅 每周活跃度:'))
      this.displayWeeklyActivity(weeklyActivity)

      // 显示最近提交
      console.log(chalk.cyan('\n🕐 最近提交:'))
      console.log(chalk.gray(recentCommits))

    } catch (error) {
      this.spinner?.fail('分析失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 分析贡献者
   */
  private async analyzeContributors(options: any): Promise<void> {
    this.spinner = ora('分析贡献者...').start()

    try {
      // 获取贡献者统计
      const { stdout } = await execAsync(
        'git log --pretty=format:"%aN|%aE|%ad" --date=iso | sort | uniq'
      )

      const contributors: Map<string, ContributorStats> = new Map()

      // 解析每个贡献者
      const lines = stdout.split('\n').filter(l => l)
      for (const line of lines) {
        const [name, email] = line.split('|')
        const key = `${name}|${email}`
        
        if (!contributors.has(key)) {
          // 获取该贡献者的详细统计
          const { stdout: stats } = await execAsync(
            `git log --author="${name}" --pretty=tformat: --numstat | awk '{ add += $1; subs += $2 } END { printf "%s,%s", add, subs }'`
          )
          
          const [additions, deletions] = stats.split(',').map(s => parseInt(s) || 0)
          const { stdout: commitCount } = await execAsync(
            `git rev-list --count --author="${name}" HEAD`
          )

          contributors.set(key, {
            name,
            email,
            commits: parseInt(commitCount.trim()),
            additions,
            deletions,
            firstCommit: new Date(),
            lastCommit: new Date()
          })
        }
      }

      this.spinner.succeed('贡献者分析完成!')

      // 创建贡献者表格
      const table = new Table({
        head: [
          chalk.cyan('贡献者'),
          chalk.cyan('邮箱'),
          chalk.cyan('提交数'),
          chalk.cyan('添加行数'),
          chalk.cyan('删除行数'),
          chalk.cyan('净贡献')
        ],
        style: {
          head: [],
          border: ['cyan']
        }
      })

      // 排序并显示
      const sortedContributors = Array.from(contributors.values())
        .sort((a, b) => b.commits - a.commits)
        .slice(0, options.limit || 10)

      sortedContributors.forEach(contributor => {
        table.push([
          contributor.name,
          chalk.gray(contributor.email),
          chalk.yellow(contributor.commits.toString()),
          chalk.green('+' + contributor.additions),
          chalk.red('-' + contributor.deletions),
          chalk.blue((contributor.additions - contributor.deletions).toString())
        ])
      })

      console.log('\n' + table.toString())

      // 显示贡献者排行
      this.displayContributorRanking(sortedContributors)

    } catch (error) {
      this.spinner?.fail('分析失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 分析文件变更
   */
private async analyzeFiles(options: any): Promise<void> {
    void options
    this.spinner = ora('分析文件变更...').start()

    try {
      // 获取文件变更统计
      const { stdout } = await execAsync(
        'git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -20'
      )

      this.spinner.succeed('文件分析完成!')

      // 解析并显示热点文件
      console.log(chalk.cyan('\n🔥 热点文件 (变更频率最高):'))
      
      const table = new Table({
        head: [
          chalk.cyan('变更次数'),
          chalk.cyan('文件路径')
        ],
        style: {
          head: [],
          border: ['cyan']
        }
      })

      const lines = stdout.split('\n').filter(l => l.trim())
      lines.forEach(line => {
        const match = line.trim().match(/^(\d+)\s+(.+)$/)
        if (match) {
          const [, count, file] = match
          const heat = this.getHeatIndicator(parseInt(count))
          table.push([
            heat + ' ' + chalk.yellow(count),
            file
          ])
        }
      })

      console.log(table.toString())

      // 文件类型统计
      await this.analyzeFileTypes()

    } catch (error) {
      this.spinner?.fail('分析失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 分析分支活跃度
   */
private async analyzeBranches(options: any): Promise<void> {
    void options
    this.spinner = ora('分析分支活跃度...').start()

    try {
      const branches = await this.git.listBranches(true)
      
      if (!branches.success || !branches.data) {
        this.spinner.fail('获取分支失败')
        return
      }

      this.spinner.succeed('分支分析完成!')

      const table = new Table({
        head: [
          chalk.cyan('分支名'),
          chalk.cyan('最后提交'),
          chalk.cyan('活跃度'),
          chalk.cyan('状态')
        ],
        style: {
          head: [],
          border: ['cyan']
        }
      })

      // 分析每个分支
      for (const branch of branches.data) {
        if (!branch.remote) {
          try {
            const { stdout: lastCommitDate } = await execAsync(
              `git log -1 --format=%cd --date=relative ${branch.name}`
            )
            
            const { stdout: commitCount } = await execAsync(
              `git rev-list --count ${branch.name}`
            )

            const activity = this.calculateBranchActivity(parseInt(commitCount.trim()))
            const status = branch.current ? chalk.green('当前') : chalk.gray('空闲')

            table.push([
              branch.name,
              chalk.gray(lastCommitDate.trim()),
              activity,
              status
            ])
          } catch (error) {
            // 忽略无法访问的分支
          }
        }
      }

      console.log('\n' + table.toString())

    } catch (error) {
      this.spinner?.fail('分析失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 生成代码热力图
   */
private async generateHeatmap(options: any): Promise<void> {
    void options
    this.spinner = ora('生成代码热力图...').start()

    try {
      // 获取最近30天的提交活动
      const { stdout } = await execAsync(
        'git log --pretty=format:"%ad" --date=short --since="30 days ago" | sort | uniq -c'
      )

      this.spinner.succeed('热力图生成完成!')

      console.log(chalk.cyan('\n📈 最近30天提交热力图:'))
      console.log(chalk.gray('═'.repeat(60)))

      const lines = stdout.split('\n').filter(l => l.trim())
      const maxCount = Math.max(...lines.map(l => {
        const match = l.trim().match(/^(\d+)/)
        return match ? parseInt(match[1]) : 0
      }))

      lines.forEach(line => {
        const match = line.trim().match(/^(\d+)\s+(.+)$/)
        if (match) {
          const [, count, date] = match
          const commits = parseInt(count)
          const barLength = Math.round((commits / maxCount) * 40)
          const bar = this.getHeatBar(commits, barLength)
          
          console.log(
            `${chalk.cyan(date)} ${bar} ${chalk.yellow(count)}`
          )
        }
      })

      console.log(chalk.gray('═'.repeat(60)))

    } catch (error) {
      this.spinner?.fail('生成失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 分析趋势
   */
private async analyzeTrends(options: any): Promise<void> {
    void options
    this.spinner = ora('分析开发趋势...').start()

    try {
      // 分析提交趋势
      const { stdout: monthlyTrend } = await execAsync(
        'git log --pretty=format:"%ad" --date=format:"%Y-%m" | sort | uniq -c'
      )

      // 分析代码增长趋势
      const { stdout: codeGrowth } = await execAsync(
        'git log --pretty=tformat: --numstat | awk \'{ add += $1; subs += $2 } END { printf "additions: %s, deletions: %s", add, subs }\''
      )

      this.spinner.succeed('趋势分析完成!')

      console.log(chalk.cyan('\n📈 开发趋势分析:'))
      
      // 显示月度趋势
      console.log(chalk.yellow('\n月度提交趋势:'))
      const monthlyLines = monthlyTrend.split('\n').filter(l => l.trim()).slice(-12)
      
      monthlyLines.forEach(line => {
        const match = line.trim().match(/^(\d+)\s+(.+)$/)
        if (match) {
          const [, count, month] = match
          const commits = parseInt(count)
          const bar = '█'.repeat(Math.min(commits, 50))
          console.log(`${month}: ${chalk.cyan(bar)} ${chalk.yellow(count)}`)
        }
      })

      // 显示代码增长
      console.log(chalk.yellow('\n代码增长统计:'))
      console.log(chalk.gray(codeGrowth))

      // 预测趋势
      this.predictTrend(monthlyLines)

    } catch (error) {
      this.spinner?.fail('分析失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 生成完整报告
   */
  private async generateFullReport(options: any): Promise<void> {
    console.log(chalk.cyan('\n' + '='.repeat(60)))
    console.log(chalk.cyan.bold('             📊 仓库分析报告'))
    console.log(chalk.cyan('='.repeat(60) + '\n'))

    await this.analyzeCommits(options)
    console.log()
    await this.analyzeContributors({ ...options, limit: 5 })
    console.log()
    await this.analyzeFiles(options)
    console.log()
    await this.analyzeBranches(options)
    console.log()
    await this.generateHeatmap(options)
    console.log()
    await this.analyzeTrends(options)

    console.log(chalk.cyan('\n' + '='.repeat(60)))
    console.log(chalk.green.bold('             ✅ 报告生成完成!'))
    console.log(chalk.cyan('='.repeat(60)))
  }

  /**
   * 辅助方法：计算每日平均提交
   */
  private calculateDailyAverage(dailyStats: string): string {
    const lines = dailyStats.split('\n').filter(l => l.trim())
    if (lines.length === 0) return '0'
    
    const total = lines.reduce((sum, line) => {
      const match = line.trim().match(/^(\d+)/)
      return sum + (match ? parseInt(match[1]) : 0)
    }, 0)
    
    return (total / lines.length).toFixed(1)
  }

  /**
   * 辅助方法：显示每周活跃度
   */
  private displayWeeklyActivity(weeklyActivity: string): void {
    const days = ['日', '一', '二', '三', '四', '五', '六']
    const activity = new Array(7).fill(0)
    
    weeklyActivity.split('\n').forEach(line => {
      const match = line.trim().match(/^(\d+)\s+(\d)$/)
      if (match) {
        activity[parseInt(match[2])] = parseInt(match[1])
      }
    })

    const maxActivity = Math.max(...activity)
    
    days.forEach((day, index) => {
      const count = activity[index]
      const barLength = maxActivity > 0 ? Math.round((count / maxActivity) * 20) : 0
      const bar = '█'.repeat(barLength)
      console.log(`周${day}: ${chalk.cyan(bar.padEnd(20))} ${chalk.yellow(count)}`)
    })
  }

  /**
   * 辅助方法：显示贡献者排行
   */
  private displayContributorRanking(contributors: ContributorStats[]): void {
    console.log(chalk.cyan('\n🏆 贡献者排行榜:'))
    
    contributors.slice(0, 3).forEach((contributor, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'
      console.log(
        `${medal} ${contributor.name} - ${chalk.yellow(contributor.commits)} 次提交, ` +
        `${chalk.green('+' + contributor.additions)}/${chalk.red('-' + contributor.deletions)} 行`
      )
    })
  }

  /**
   * 辅助方法：分析文件类型
   */
  private async analyzeFileTypes(): Promise<void> {
    try {
      const { stdout } = await execAsync(
        'git ls-files | sed "s/.*\\.//" | sort | uniq -c | sort -rn | head -10'
      )

      console.log(chalk.cyan('\n📁 文件类型分布:'))
      
      const lines = stdout.split('\n').filter(l => l.trim())
      lines.forEach(line => {
        const match = line.trim().match(/^(\d+)\s+(.+)$/)
        if (match) {
          const [, count, ext] = match
          console.log(`  .${ext}: ${chalk.yellow(count)} 个文件`)
        }
      })
    } catch (error) {
      // 忽略错误
    }
  }

  /**
   * 辅助方法：获取热度指示器
   */
  private getHeatIndicator(count: number): string {
    if (count > 100) return '🔥🔥🔥'
    if (count > 50) return '🔥🔥'
    if (count > 20) return '🔥'
    return '📝'
  }

  /**
   * 辅助方法：计算分支活跃度
   */
  private calculateBranchActivity(commitCount: number): string {
    if (commitCount > 100) return chalk.red('🔥 非常活跃')
    if (commitCount > 50) return chalk.yellow('⚡ 活跃')
    if (commitCount > 10) return chalk.green('✓ 正常')
    return chalk.gray('💤 不活跃')
  }

  /**
   * 辅助方法：获取热力条
   */
  private getHeatBar(count: number, length: number): string {
    if (count > 10) return chalk.red('█'.repeat(length))
    if (count > 5) return chalk.yellow('█'.repeat(length))
    if (count > 2) return chalk.green('█'.repeat(length))
    return chalk.gray('█'.repeat(length))
  }

  /**
   * 辅助方法：预测趋势
   */
  private predictTrend(monthlyData: string[]): void {
    const counts = monthlyData.map(line => {
      const match = line.trim().match(/^(\d+)/)
      return match ? parseInt(match[1]) : 0
    })

    if (counts.length < 3) return

    const recent = counts.slice(-3)
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length
    const trend = recent[2] - recent[0]

    console.log(chalk.cyan('\n🔮 趋势预测:'))
    
    if (trend > 0) {
      console.log(chalk.green(`📈 提交活跃度呈上升趋势 (+${Math.abs(trend)})`))
    } else if (trend < 0) {
      console.log(chalk.yellow(`📉 提交活跃度呈下降趋势 (-${Math.abs(trend)})`))
    } else {
      console.log(chalk.blue('➡️ 提交活跃度保持稳定'))
    }

    console.log(chalk.gray(`平均每月提交: ${avg.toFixed(1)} 次`))
  }
}
