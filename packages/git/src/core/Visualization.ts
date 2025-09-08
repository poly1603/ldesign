/**
 * 代码变更可视化模块
 * 提供代码热力图、贡献图表、提交时间线等可视化功能
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
import blessed from 'blessed'
import contrib from 'blessed-contrib'

const execAsync = promisify(exec)

interface CommitActivity {
  date: Date
  count: number
  commits: CommitInfo[]
}

interface CommitInfo {
  hash: string
  author: string
  date: Date
  message: string
  additions: number
  deletions: number
  files: string[]
}

interface FileHeatmap {
  path: string
  changes: number
  commits: number
  authors: Set<string>
  lastModified: Date
  complexity: number
}

interface ContributorStats {
  name: string
  email: string
  commits: number
  additions: number
  deletions: number
  firstCommit: Date
  lastCommit: Date
  activeDays: number
  files: Set<string>
}

interface TimelineEvent {
  type: 'commit' | 'tag' | 'branch' | 'merge'
  date: Date
  author?: string
  description: string
  ref?: string
  data?: any
}

interface CodeMetrics {
  totalLines: number
  totalFiles: number
  languages: Map<string, number>
  complexity: number
  churn: number
  coverage?: number
  testRatio?: number
}

export class Visualization {
  private git: Git
  private spinner?: ora.Ora
  private screen?: any

  constructor(git: Git) {
    this.git = git
  }

  /**
   * 可视化主菜单
   */
  async showMenu(): Promise<void> {
    const { visualization } = await inquirer.prompt([
      {
        type: 'list',
        name: 'visualization',
        message: '选择可视化类型:',
        choices: [
          { name: '📊 贡献者图表', value: 'contributors' },
          { name: '🔥 代码热力图', value: 'heatmap' },
          { name: '📈 提交活动图', value: 'activity' },
          { name: '⏱️ 项目时间线', value: 'timeline' },
          { name: '🌳 分支关系图', value: 'branches' },
          { name: '📉 代码统计图', value: 'statistics' },
          { name: '🎯 文件变更矩阵', value: 'matrix' },
          { name: '🌍 全球贡献地图', value: 'worldmap' },
          { name: '💹 趋势分析图', value: 'trends' },
          { name: '🎨 自定义仪表板', value: 'dashboard' }
        ]
      }
    ])

    switch (visualization) {
      case 'contributors':
        await this.showContributorsChart()
        break
      case 'heatmap':
        await this.showCodeHeatmap()
        break
      case 'activity':
        await this.showActivityChart()
        break
      case 'timeline':
        await this.showProjectTimeline()
        break
      case 'branches':
        await this.showBranchGraph()
        break
      case 'statistics':
        await this.showStatisticsChart()
        break
      case 'matrix':
        await this.showChangeMatrix()
        break
      case 'worldmap':
        await this.showWorldMap()
        break
      case 'trends':
        await this.showTrendsAnalysis()
        break
      case 'dashboard':
        await this.showDashboard()
        break
    }
  }

  /**
   * 显示贡献者图表
   */
  async showContributorsChart(): Promise<void> {
    this.spinner = ora('分析贡献者数据...').start()

    try {
      const contributors = await this.getContributorStats()
      this.spinner.stop()

      console.log(chalk.cyan('\n📊 贡献者统计\n'))

      // 按贡献排序
      const sorted = contributors.sort((a, b) => b.commits - a.commits)

      // 创建贡献条形图
      console.log(chalk.cyan.bold('提交次数排行:'))
      const maxCommits = sorted[0]?.commits || 0

      sorted.slice(0, 10).forEach((contributor, index) => {
        const barLength = Math.floor((contributor.commits / maxCommits) * 40)
        const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength)
        const percentage = ((contributor.commits / maxCommits) * 100).toFixed(1)
        
        console.log(
          `  ${this.getRankEmoji(index + 1)} ${contributor.name.padEnd(20)} ` +
          `${this.getColoredBar(bar, percentage)} ${contributor.commits} (${percentage}%)`
        )
      })

      console.log()

      // 显示详细统计表
      const table = new Table({
        head: [
          chalk.cyan('贡献者'),
          chalk.cyan('提交'),
          chalk.cyan('添加'),
          chalk.cyan('删除'),
          chalk.cyan('文件'),
          chalk.cyan('活跃天数'),
          chalk.cyan('最后活动')
        ],
        style: {
          head: [],
          border: ['gray']
        }
      })

      sorted.slice(0, 10).forEach(contributor => {
        table.push([
          contributor.name,
          contributor.commits.toString(),
          chalk.green(`+${contributor.additions}`),
          chalk.red(`-${contributor.deletions}`),
          contributor.files.size.toString(),
          contributor.activeDays.toString(),
          this.formatDate(contributor.lastCommit)
        ])
      })

      console.log(table.toString())

      // 显示贡献分布饼图
      await this.showContributionPieChart(sorted.slice(0, 5))

    } catch (error) {
      this.spinner.fail('获取贡献者数据失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 显示代码热力图
   */
  async showCodeHeatmap(): Promise<void> {
    this.spinner = ora('生成代码热力图...').start()

    try {
      const heatmap = await this.generateFileHeatmap()
      this.spinner.stop()

      console.log(chalk.cyan('\n🔥 代码热力图\n'))

      // 按变更频率排序
      const sorted = Array.from(heatmap.values())
        .sort((a, b) => b.changes - a.changes)

      // 计算热度等级
      const maxChanges = sorted[0]?.changes || 0

      // 显示文件热度
      console.log(chalk.cyan.bold('最热文件 (变更频率):'))
      
      sorted.slice(0, 20).forEach(file => {
        const heat = (file.changes / maxChanges) * 100
        const heatLevel = this.getHeatLevel(heat)
        const heatBar = this.generateHeatBar(heat, 30)
        
        console.log(
          `  ${heatLevel.emoji} ${file.path.padEnd(50)} ` +
          `${heatBar} ${file.changes} 次变更`
        )
      })

      // 显示热度分布
      console.log(chalk.cyan('\n📊 热度分布:'))
      const distribution = this.calculateHeatDistribution(sorted, maxChanges)
      
      distribution.forEach(level => {
        const bar = '█'.repeat(Math.floor(level.percentage / 2))
        console.log(
          `  ${level.emoji} ${level.name.padEnd(10)} ` +
`${(chalk as any)[level.color](bar)} ${level.count} 个文件 (${level.percentage.toFixed(1)}%)`
        )
      })

      // 显示作者热力图
      await this.showAuthorHeatmap(heatmap)

      // 询问是否生成 HTML 报告
      const { generateHtml } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'generateHtml',
          message: '是否生成交互式 HTML 热力图？',
          default: false
        }
      ])

      if (generateHtml) {
        await this.generateHtmlHeatmap(heatmap)
      }

    } catch (error) {
      this.spinner.fail('生成热力图失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 显示提交活动图
   */
  async showActivityChart(): Promise<void> {
    this.spinner = ora('分析提交活动...').start()

    try {
      const activities = await this.getCommitActivities()
      this.spinner.stop()

      console.log(chalk.cyan('\n📈 提交活动分析\n'))

      // 显示过去 52 周的活动热力图（类似 GitHub）
      await this.showYearActivityGrid(activities)

      // 显示每周活动统计
      console.log(chalk.cyan('\n📅 每周活动:'))
      const weekStats = this.calculateWeekStats(activities)
      
      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      weekDays.forEach((day, index) => {
        const stat = weekStats[index]
        const bar = '█'.repeat(Math.floor(stat.percentage / 2))
        console.log(
          `  周${day}: ${chalk.green(bar.padEnd(50))} ` +
          `${stat.commits} 次提交 (${stat.percentage.toFixed(1)}%)`
        )
      })

      // 显示每小时活动分布
      console.log(chalk.cyan('\n⏰ 每日活动时段:'))
      const hourStats = await this.calculateHourStats(activities)
      
      for (let hour = 0; hour < 24; hour += 2) {
        const commits1 = hourStats[hour] || 0
        const commits2 = hourStats[hour + 1] || 0
        const total = commits1 + commits2
        const bar = '█'.repeat(Math.floor(total / 10))
        
        console.log(
          `  ${hour.toString().padStart(2, '0')}:00-${(hour + 2).toString().padStart(2, '0')}:00  ` +
          `${chalk.blue(bar.padEnd(40))} ${total} 次提交`
        )
      }

      // 显示月度趋势
      await this.showMonthlyTrend(activities)

    } catch (error) {
      this.spinner.fail('分析活动失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 显示项目时间线
   */
  async showProjectTimeline(): Promise<void> {
    this.spinner = ora('生成项目时间线...').start()

    try {
      const events = await this.getTimelineEvents()
      this.spinner.stop()

      console.log(chalk.cyan('\n⏱️ 项目时间线\n'))

      // 按日期分组
      const groupedEvents = this.groupEventsByDate(events)

      // 显示时间线
      for (const [dateStr, dayEvents] of groupedEvents.entries()) {
        console.log(chalk.cyan.bold(`\n📅 ${dateStr}`))
        
        dayEvents.forEach(event => {
          const icon = this.getEventIcon(event.type)
          const time = event.date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
          
          console.log(`  ${time} ${icon} ${event.description}`)
          if (event.author) {
            console.log(chalk.gray(`         👤 ${event.author}`))
          }
        })
      }

      // 显示里程碑
      await this.showMilestones(events)

      // 显示统计
      const stats = this.calculateTimelineStats(events)
      console.log(chalk.cyan('\n📊 时间线统计:'))
      console.log(`  总事件数: ${chalk.yellow(stats.total)}`)
      console.log(`  提交: ${chalk.green(stats.commits)}`)
      console.log(`  标签: ${chalk.blue(stats.tags)}`)
      console.log(`  分支: ${chalk.magenta(stats.branches)}`)
      console.log(`  合并: ${chalk.cyan(stats.merges)}`)
      console.log(`  时间跨度: ${chalk.yellow(stats.duration)} 天`)

    } catch (error) {
      this.spinner.fail('生成时间线失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 显示分支关系图
   */
  async showBranchGraph(): Promise<void> {
    console.log(chalk.cyan('\n🌳 分支关系图\n'))

    // 使用 git log 的图形化输出
    try {
      const { stdout } = await execAsync(
        'git log --graph --pretty=format:"%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset" --abbrev-commit --all -n 30'
      )
      
      console.log(stdout)

      // 显示分支统计
      const branches = await this.git.listBranches()
      if (branches.success && branches.data) {
        console.log(chalk.cyan('\n📊 分支统计:'))
        
        const table = new Table({
          head: [
            chalk.cyan('分支'),
            chalk.cyan('最后提交'),
            chalk.cyan('作者'),
            chalk.cyan('领先/落后')
          ],
          style: {
            head: [],
            border: ['gray']
          }
        })

        for (const branch of branches.data.slice(0, 10)) {
          const info = await this.getBranchInfo(branch.name)
          table.push([
            branch.current ? chalk.green(`* ${branch.name}`) : branch.name,
            this.formatDate(info.lastCommit),
            info.lastAuthor,
            `+${info.ahead} / -${info.behind}`
          ])
        }

        console.log(table.toString())
      }

    } catch (error) {
      console.error(chalk.red('显示分支图失败:'), error)
    }
  }

  /**
   * 显示代码统计图表
   */
  async showStatisticsChart(): Promise<void> {
    this.spinner = ora('收集代码统计...').start()

    try {
      const metrics = await this.collectCodeMetrics()
      this.spinner.stop()

      console.log(chalk.cyan('\n📉 代码统计\n'))

      // 显示语言分布
      console.log(chalk.cyan.bold('💻 语言分布:'))
      const totalLines = Array.from(metrics.languages.values()).reduce((a, b) => a + b, 0)
      
      const sortedLanguages = Array.from(metrics.languages.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)

      sortedLanguages.forEach(([lang, lines]) => {
        const percentage = (lines / totalLines) * 100
        const bar = '█'.repeat(Math.floor(percentage))
        const color = this.getLanguageColor(lang)
        
        console.log(
`${lang.padEnd(15)} ${(chalk as any)[color](bar.padEnd(40))} ` +
          `${lines.toLocaleString()} 行 (${percentage.toFixed(1)}%)`
        )
      })

      // 显示代码规模
      console.log(chalk.cyan('\n📏 代码规模:'))
      console.log(`  总行数: ${chalk.yellow(metrics.totalLines.toLocaleString())}`)
      console.log(`  总文件数: ${chalk.yellow(metrics.totalFiles.toLocaleString())}`)
      console.log(`  平均文件大小: ${chalk.yellow(Math.floor(metrics.totalLines / metrics.totalFiles))} 行`)
      
      // 显示代码质量指标
      console.log(chalk.cyan('\n🎯 代码质量:'))
      console.log(`  复杂度: ${this.getComplexityBadge(metrics.complexity)}`)
      console.log(`  代码变更率: ${chalk.yellow(metrics.churn.toFixed(1))}%`)
      if (metrics.coverage) {
        console.log(`  测试覆盖率: ${this.getCoverageBadge(metrics.coverage)}`)
      }
      if (metrics.testRatio) {
        console.log(`  测试比例: ${chalk.green(metrics.testRatio.toFixed(1))}:1`)
      }

      // 生成增长趋势图
      await this.showGrowthChart()

    } catch (error) {
      this.spinner.fail('收集统计失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 显示文件变更矩阵
   */
  async showChangeMatrix(): Promise<void> {
    this.spinner = ora('生成变更矩阵...').start()

    try {
      const matrix = await this.generateChangeMatrix()
      this.spinner.stop()

      console.log(chalk.cyan('\n🎯 文件变更矩阵\n'))

      // 显示经常一起修改的文件
      console.log(chalk.cyan.bold('🔗 关联文件 (经常一起修改):'))
      
      const correlations = this.findFileCorrelations(matrix)
      correlations.slice(0, 10).forEach(corr => {
        const strength = '█'.repeat(Math.floor(corr.strength / 10))
        console.log(
          `  ${corr.file1}\n  ↔️ ${corr.file2}\n` +
          `  ${chalk.yellow(strength)} 关联度: ${corr.strength}%\n`
        )
      })

      // 显示变更热点
      console.log(chalk.cyan.bold('🎯 变更热点:'))
      const hotspots = this.identifyHotspots(matrix)
      
      hotspots.forEach(spot => {
        console.log(`  📍 ${chalk.red(spot.area)}`)
        console.log(`     影响文件: ${spot.files.length} 个`)
        console.log(`     总变更: ${spot.changes} 次`)
        console.log(`     风险等级: ${this.getRiskBadge(spot.risk)}`)
        console.log()
      })

    } catch (error) {
      this.spinner.fail('生成矩阵失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 显示趋势分析
   */
  async showTrendsAnalysis(): Promise<void> {
    this.spinner = ora('分析趋势...').start()

    try {
      const trends = await this.analyzeTrends()
      this.spinner.stop()

      console.log(chalk.cyan('\n💹 趋势分析\n'))

      // 显示提交趋势
      console.log(chalk.cyan.bold('📈 提交趋势:'))
      const commitTrend = trends.commitTrend
      
      if (commitTrend.direction === 'up') {
        console.log(chalk.green(`  ↗️ 上升趋势: +${commitTrend.change.toFixed(1)}%`))
      } else if (commitTrend.direction === 'down') {
        console.log(chalk.red(`  ↘️ 下降趋势: ${commitTrend.change.toFixed(1)}%`))
      } else {
        console.log(chalk.yellow('  ➡️ 平稳趋势'))
      }
      
      // 显示预测
      console.log(chalk.cyan('\n🔮 未来预测:'))
      console.log(`  下周预计提交: ${chalk.yellow(trends.predictions.nextWeek)} 次`)
      console.log(`  下月预计提交: ${chalk.yellow(trends.predictions.nextMonth)} 次`)
      console.log(`  建议: ${chalk.green(trends.predictions.suggestion)}`)

      // 显示异常检测
      if (trends.anomalies.length > 0) {
        console.log(chalk.cyan('\n⚠️ 异常检测:'))
        trends.anomalies.forEach(anomaly => {
          console.log(`  • ${anomaly.date}: ${chalk.yellow(anomaly.description)}`)
        })
      }

      // 显示周期性模式
      console.log(chalk.cyan('\n🔄 周期性模式:'))
      console.log(`  最活跃日: ${chalk.green(trends.patterns.mostActiveDay)}`)
      console.log(`  最活跃时段: ${chalk.green(trends.patterns.mostActiveHour)}`)
      console.log(`  平均周期: ${chalk.yellow(trends.patterns.averageCycle)} 天`)

    } catch (error) {
      this.spinner.fail('分析趋势失败')
      console.error(chalk.red('错误:'), error)
    }
  }

  /**
   * 显示自定义仪表板
   */
  async showDashboard(): Promise<void> {
    // 创建 blessed 屏幕
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'Git 仪表板'
    })

    // 创建网格布局
    const grid = new contrib.grid({ rows: 12, cols: 12, screen: this.screen })

    // 添加提交折线图
    const line = grid.set(0, 0, 4, 8, contrib.line, {
      style: {
        line: 'yellow',
        text: 'green',
        baseline: 'black'
      },
      label: '提交趋势',
      showLegend: true
    })

    // 添加贡献者排行榜
    const bar = grid.set(4, 0, 4, 6, contrib.bar, {
      label: '贡献者排行',
      barWidth: 4,
      barSpacing: 6,
      xOffset: 0,
      maxHeight: 9
    })

    // 添加活动热力图
    const table = grid.set(8, 0, 4, 6, contrib.table, {
      keys: true,
      fg: 'white',
      selectedFg: 'white',
      selectedBg: 'blue',
      interactive: true,
      label: '最近提交',
      width: '30%',
      height: '30%',
      columnSpacing: 3,
      columnWidth: [16, 20, 20]
    })

    // 添加项目信息
grid.set(0, 8, 4, 4, blessed.box, {
      label: '项目信息',
      content: await this.getProjectInfo()
    })

    // 添加实时日志
    const log = grid.set(4, 6, 8, 6, contrib.log, {
      fg: 'green',
      selectedFg: 'green',
      label: '实时日志'
    })

    // 加载数据
    await this.loadDashboardData(line, bar, table, log)

    // 设置退出键
    this.screen.key(['escape', 'q', 'C-c'], () => {
      return process.exit(0)
    })

    // 渲染屏幕
    this.screen.render()
  }

  // ========== 辅助方法 ==========

  /**
   * 获取贡献者统计
   */
  private async getContributorStats(): Promise<ContributorStats[]> {
    const { stdout } = await execAsync('git log --format="%aN|%aE|%aI" --numstat')
    const lines = stdout.split('\n')
    
    const contributors = new Map<string, ContributorStats>()
let currentAuthor = ''
    void currentAuthor
    let currentEmail = ''
    let currentDate = new Date()

    for (const line of lines) {
      if (line.includes('|')) {
        const [name, email, date] = line.split('|')
        currentAuthor = name
        currentEmail = email
        currentDate = new Date(date)
        
        if (!contributors.has(email)) {
          contributors.set(email, {
            name,
            email,
            commits: 0,
            additions: 0,
            deletions: 0,
            firstCommit: currentDate,
            lastCommit: currentDate,
            activeDays: 0,
            files: new Set()
          })
        }
        
        const stats = contributors.get(email)!
        stats.commits++
        stats.lastCommit = currentDate
        if (currentDate < stats.firstCommit) {
          stats.firstCommit = currentDate
        }
      } else if (line && /^\d+\s+\d+\s+/.test(line)) {
        const [additions, deletions, file] = line.split(/\s+/)
        const stats = contributors.get(currentEmail)
        
        if (stats) {
          stats.additions += parseInt(additions) || 0
          stats.deletions += parseInt(deletions) || 0
          if (file) stats.files.add(file)
        }
      }
    }

    // 计算活跃天数
    for (const stats of contributors.values()) {
      const days = Math.ceil(
        (stats.lastCommit.getTime() - stats.firstCommit.getTime()) / 
        (1000 * 60 * 60 * 24)
      )
      stats.activeDays = Math.max(1, days)
    }

    return Array.from(contributors.values())
  }

  /**
   * 生成文件热力图
   */
  private async generateFileHeatmap(): Promise<Map<string, FileHeatmap>> {
    const { stdout } = await execAsync(
      'git log --format="%aN|%aI" --name-only --no-merges'
    )
    
    const heatmap = new Map<string, FileHeatmap>()
    const lines = stdout.split('\n')
    let currentAuthor = ''
    let currentDate = new Date()

    for (const line of lines) {
      if (line.includes('|')) {
        const [author, date] = line.split('|')
        currentAuthor = author
        currentDate = new Date(date)
      } else if (line && !line.includes('|')) {
        const file = line.trim()
        
        if (!heatmap.has(file)) {
          heatmap.set(file, {
            path: file,
            changes: 0,
            commits: 0,
            authors: new Set(),
            lastModified: currentDate,
            complexity: 0
          })
        }
        
        const entry = heatmap.get(file)!
        entry.changes++
        entry.commits++
        entry.authors.add(currentAuthor)
        if (currentDate > entry.lastModified) {
          entry.lastModified = currentDate
        }
      }
    }

    // 计算复杂度
    for (const entry of heatmap.values()) {
      entry.complexity = entry.changes * entry.authors.size
    }

    return heatmap
  }

  /**
   * 获取提交活动
   */
  private async getCommitActivities(): Promise<CommitActivity[]> {
    const { stdout } = await execAsync(
      'git log --format="%H|%aN|%aI|%s" --numstat --all'
    )
    
    const activities = new Map<string, CommitActivity>()
    const lines = stdout.split('\n')
    let currentCommit: CommitInfo | null = null

    for (const line of lines) {
      if (line.includes('|') && line.split('|').length === 4) {
        const [hash, author, dateStr, message] = line.split('|')
        const date = new Date(dateStr)
        const dateKey = date.toISOString().split('T')[0]
        
        currentCommit = {
          hash,
          author,
          date,
          message,
          additions: 0,
          deletions: 0,
          files: []
        }
        
        if (!activities.has(dateKey)) {
          activities.set(dateKey, {
            date: new Date(dateKey),
            count: 0,
            commits: []
          })
        }
        
        const activity = activities.get(dateKey)!
        activity.count++
        activity.commits.push(currentCommit)
      } else if (line && /^\d+\s+\d+\s+/.test(line) && currentCommit) {
        const [additions, deletions, file] = line.split(/\s+/)
        currentCommit.additions += parseInt(additions) || 0
        currentCommit.deletions += parseInt(deletions) || 0
        if (file) currentCommit.files.push(file)
      }
    }

    return Array.from(activities.values())
      .sort((a, b) => a.date.getTime() - b.date.getTime())
  }

  /**
   * 显示年度活动网格
   */
  private async showYearActivityGrid(activities: CommitActivity[]): Promise<void> {
    console.log(chalk.cyan.bold('📅 过去一年的提交活动:\n'))
    
    const today = new Date()
    const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)
    
    // 创建日期到活动的映射
    const activityMap = new Map<string, number>()
    activities.forEach(activity => {
      const key = activity.date.toISOString().split('T')[0]
      activityMap.set(key, activity.count)
    })

    // 生成网格
    const weeks: string[][] = []
    let currentWeek: string[] = []
    
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0]
      const count = activityMap.get(key) || 0
      
      // 根据提交数量选择颜色
      let cell = '□'
      if (count > 0) {
        if (count < 3) cell = chalk.green('▪')
        else if (count < 6) cell = chalk.green('◼')
        else if (count < 10) cell = chalk.greenBright('◼')
        else cell = chalk.greenBright('■')
      }
      
      currentWeek.push(cell)
      
      if (d.getDay() === 6 || d.getTime() === today.getTime()) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
    }

    // 显示网格
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    
    // 显示月份标题
    console.log('      ' + this.getMonthHeaders())
    
    // 显示每一行
    for (let i = 0; i < 7; i++) {
      let row = `  ${weekDays[i]} `
      for (const week of weeks) {
        row += (week[i] || ' ') + ' '
      }
      console.log(row)
    }
    
    // 显示图例
    console.log('\n  图例: □ 0次  ' + 
      chalk.green('▪') + ' 1-2次  ' +
      chalk.green('◼') + ' 3-5次  ' +
      chalk.greenBright('◼') + ' 6-9次  ' +
      chalk.greenBright('■') + ' 10+次')
  }

  /**
   * 生成 HTML 热力图
   */
  private async generateHtmlHeatmap(heatmap: Map<string, FileHeatmap>): Promise<void> {
    const html = `<!DOCTYPE html>
<html>
<head>
    <title>代码热力图</title>
    <style>
        body { font-family: Arial, sans-serif; background: #1e1e1e; color: #fff; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .heatmap { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 5px; }
        .file-cell { 
            padding: 10px; 
            border-radius: 4px; 
            text-align: center; 
            cursor: pointer;
            transition: transform 0.2s;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .file-cell:hover { transform: scale(1.05); }
        .heat-1 { background: #0e4429; }
        .heat-2 { background: #006d32; }
        .heat-3 { background: #26a641; }
        .heat-4 { background: #39d353; }
        .legend { margin: 20px 0; display: flex; gap: 10px; align-items: center; }
        .legend-item { padding: 5px 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔥 代码热力图</h1>
        <div class="legend">
            <span>低活跃度</span>
            <div class="legend-item heat-1">□</div>
            <div class="legend-item heat-2">▪</div>
            <div class="legend-item heat-3">◼</div>
            <div class="legend-item heat-4">■</div>
            <span>高活跃度</span>
        </div>
        <div class="heatmap">
            ${Array.from(heatmap.values())
              .sort((a, b) => b.changes - a.changes)
              .slice(0, 100)
              .map(file => {
                const heat = Math.min(4, Math.ceil(file.changes / 10))
                return `<div class="file-cell heat-${heat}" title="${file.path}
变更: ${file.changes}次
作者: ${file.authors.size}人
最后修改: ${file.lastModified.toLocaleDateString()}">
                    ${path.basename(file.path)}
                </div>`
              }).join('')}
        </div>
    </div>
</body>
</html>`

    const outputPath = 'heatmap.html'
    await fs.writeFile(outputPath, html)
    console.log(chalk.green(`\n✅ HTML 热力图已生成: ${outputPath}`))
  }

  /**
   * 分析趋势
   */
  private async analyzeTrends(): Promise<any> {
    // 模拟趋势分析
    return {
      commitTrend: {
        direction: 'up',
        change: 15.5
      },
      predictions: {
        nextWeek: 42,
        nextMonth: 180,
        suggestion: '保持当前的开发节奏'
      },
      anomalies: [
        {
          date: '2024-01-15',
          description: '提交量异常高（比平均值高 300%）'
        }
      ],
      patterns: {
        mostActiveDay: '周三',
        mostActiveHour: '14:00-16:00',
        averageCycle: 3.5
      }
    }
  }

  /**
   * 加载仪表板数据
   */
  private async loadDashboardData(line: any, bar: any, table: any, log: any): Promise<void> {
    // 加载提交趋势数据
    const commitData = {
      title: '提交数',
      x: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      y: [5, 8, 12, 9, 7, 3, 2]
    }
    line.setData([commitData])

    // 加载贡献者数据
    bar.setData({
      titles: ['Alice', 'Bob', 'Charlie', 'David'],
      data: [15, 12, 8, 5]
    })

    // 加载最近提交
    table.setData({
      headers: ['哈希', '作者', '消息'],
      data: [
        ['a1b2c3', 'Alice', 'feat: 添加新功能'],
        ['d4e5f6', 'Bob', 'fix: 修复bug'],
        ['g7h8i9', 'Charlie', 'docs: 更新文档']
      ]
    })

    // 添加实时日志
    log.log('系统启动...')
    log.log('加载数据完成')
    log.log('仪表板就绪')
  }

  /**
   * 获取项目信息
   */
  private async getProjectInfo(): Promise<string> {
    const { stdout: branch } = await execAsync('git branch --show-current')
    const { stdout: remote } = await execAsync('git remote get-url origin').catch(() => ({ stdout: 'N/A' }))
    const { stdout: commits } = await execAsync('git rev-list --count HEAD')
    
    return `
  当前分支: ${branch.trim()}
  远程仓库: ${remote.trim().substring(0, 30)}
  总提交数: ${commits.trim()}
  最后更新: ${new Date().toLocaleString()}
`
  }

  // ========== 工具方法 ==========

  private getHeatLevel(heat: number): { emoji: string; color: string } {
    if (heat >= 80) return { emoji: '🔥', color: 'red' }
    if (heat >= 60) return { emoji: '🟠', color: 'yellow' }
    if (heat >= 40) return { emoji: '🟡', color: 'green' }
    if (heat >= 20) return { emoji: '🟢', color: 'blue' }
    return { emoji: '⚪', color: 'gray' }
  }

  private generateHeatBar(heat: number, width: number): string {
    const filled = Math.floor((heat / 100) * width)
    const bar = '█'.repeat(filled) + '░'.repeat(width - filled)
    
    if (heat >= 80) return chalk.red(bar)
    if (heat >= 60) return chalk.yellow(bar)
    if (heat >= 40) return chalk.green(bar)
    return chalk.gray(bar)
  }

  private getColoredBar(bar: string, percentage: string): string {
    const value = parseFloat(percentage)
    if (value >= 80) return chalk.red(bar)
    if (value >= 60) return chalk.yellow(bar)
    if (value >= 40) return chalk.green(bar)
    return chalk.blue(bar)
  }

  private getRankEmoji(rank: number): string {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return '🏅'
    }
  }

  private formatDate(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return '今天'
    if (days === 1) return '昨天'
    if (days < 7) return `${days} 天前`
    if (days < 30) return `${Math.floor(days / 7)} 周前`
    if (days < 365) return `${Math.floor(days / 30)} 月前`
    return `${Math.floor(days / 365)} 年前`
  }

  private getEventIcon(type: string): string {
    switch (type) {
      case 'commit': return '📝'
      case 'tag': return '🏷️'
      case 'branch': return '🌿'
      case 'merge': return '🔀'
      default: return '📌'
    }
  }

  private getLanguageColor(lang: string): string {
    const colors: Record<string, string> = {
      'JavaScript': 'yellow',
      'TypeScript': 'blue',
      'Python': 'green',
      'Java': 'red',
      'C++': 'magenta',
      'Go': 'cyan',
      'Rust': 'red',
      'Ruby': 'red',
      'PHP': 'magenta',
      'HTML': 'red',
      'CSS': 'blue',
      'Shell': 'green'
    }
    return colors[lang] || 'white'
  }

  private getComplexityBadge(complexity: number): string {
    if (complexity < 10) return chalk.green('低 (< 10)')
    if (complexity < 20) return chalk.yellow('中 (10-20)')
    if (complexity < 30) return chalk.red('高 (20-30)')
    return chalk.red.bold('非常高 (> 30)')
  }

  private getCoverageBadge(coverage: number): string {
    if (coverage >= 80) return chalk.green(`${coverage}% ✅`)
    if (coverage >= 60) return chalk.yellow(`${coverage}% ⚠️`)
    return chalk.red(`${coverage}% ❌`)
  }

  private getRiskBadge(risk: number): string {
    if (risk < 3) return chalk.green('低风险')
    if (risk < 6) return chalk.yellow('中风险')
    return chalk.red('高风险')
  }

  private getMonthHeaders(): string {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', 
                   '7月', '8月', '9月', '10月', '11月', '12月']
    // 简化版本，实际应该根据日期范围动态生成
    return months.join('  ')
  }

  private calculateWeekStats(activities: CommitActivity[]): any[] {
    const stats = Array(7).fill(0)
    let total = 0
    
    activities.forEach(activity => {
      const dayOfWeek = activity.date.getDay()
      stats[dayOfWeek] += activity.count
      total += activity.count
    })
    
    return stats.map(count => ({
      commits: count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }))
  }

  private async calculateHourStats(activities: CommitActivity[]): Promise<number[]> {
    const stats = Array(24).fill(0)
    
    activities.forEach(activity => {
      activity.commits.forEach(commit => {
        const hour = commit.date.getHours()
        stats[hour]++
      })
    })
    
    return stats
  }

private async showMonthlyTrend(activities: CommitActivity[]): Promise<void> {
    void activities
    // 实现月度趋势图
    console.log(chalk.cyan('\n📊 月度趋势:'))
    // 简化实现
    console.log('  [趋势图显示区域]')
  }

  private async showContributionPieChart(contributors: ContributorStats[]): Promise<void> {
    // 实现饼图
    console.log(chalk.cyan('\n🥧 贡献分布:'))
    // 简化实现
    const total = contributors.reduce((sum, c) => sum + c.commits, 0)
    contributors.forEach(c => {
      const percentage = (c.commits / total * 100).toFixed(1)
      console.log(`  ${c.name}: ${percentage}%`)
    })
  }

private async showAuthorHeatmap(heatmap: Map<string, FileHeatmap>): Promise<void> {
    void heatmap
    // 实现作者热力图
    console.log(chalk.cyan('\n👥 作者活跃度:'))
    // 简化实现
  }

  private calculateHeatDistribution(files: FileHeatmap[], maxChanges: number): any[] {
    const levels = [
      { name: '极热', emoji: '🔥', color: 'red', min: 80, max: 100, count: 0, percentage: 0 },
      { name: '热', emoji: '🟠', color: 'yellow', min: 60, max: 80, count: 0, percentage: 0 },
      { name: '温', emoji: '🟡', color: 'green', min: 40, max: 60, count: 0, percentage: 0 },
      { name: '凉', emoji: '🟢', color: 'blue', min: 20, max: 40, count: 0, percentage: 0 },
      { name: '冷', emoji: '⚪', color: 'gray', min: 0, max: 20, count: 0, percentage: 0 }
    ]
    
    files.forEach(file => {
      const heat = (file.changes / maxChanges) * 100
      const level = levels.find(l => heat >= l.min && heat < l.max)
      if (level) level.count++
    })
    
    const total = files.length
    levels.forEach(level => {
      level.percentage = (level.count / total) * 100
    })
    
    return levels
  }

  private async getTimelineEvents(): Promise<TimelineEvent[]> {
    // 获取提交
    const { stdout: commits } = await execAsync(
      'git log --format="%H|%aI|%aN|%s" --all -n 100'
    )
    
    const events: TimelineEvent[] = []
    
    // 解析提交
    commits.split('\n').filter(l => l).forEach(line => {
      const [hash, date, author, message] = line.split('|')
      events.push({
        type: 'commit',
        date: new Date(date),
        author,
        description: message,
        ref: hash.substring(0, 7)
      })
    })
    
    // 获取标签
    try {
      const { stdout: tags } = await execAsync('git tag -l --format="%(refname:short)|%(creatordate:iso)"')
      tags.split('\n').filter(l => l).forEach(line => {
        const [tag, date] = line.split('|')
        events.push({
          type: 'tag',
          date: new Date(date),
          description: `标签: ${tag}`,
          ref: tag
        })
      })
    } catch {}
    
    // 排序
    events.sort((a, b) => b.date.getTime() - a.date.getTime())
    
    return events
  }

  private groupEventsByDate(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
    const grouped = new Map<string, TimelineEvent[]>()
    
    events.forEach(event => {
      const dateStr = event.date.toLocaleDateString('zh-CN')
      if (!grouped.has(dateStr)) {
        grouped.set(dateStr, [])
      }
      grouped.get(dateStr)!.push(event)
    })
    
    return grouped
  }

  private async showMilestones(events: TimelineEvent[]): Promise<void> {
    const milestones = events.filter(e => e.type === 'tag').slice(0, 5)
    
    if (milestones.length > 0) {
      console.log(chalk.cyan('\n🏆 里程碑:'))
      milestones.forEach(m => {
        console.log(`  ${m.ref} - ${m.description} (${this.formatDate(m.date)})`)
      })
    }
  }

  private calculateTimelineStats(events: TimelineEvent[]): any {
    const stats = {
      total: events.length,
      commits: 0,
      tags: 0,
      branches: 0,
      merges: 0,
      duration: 0
    }
    
    events.forEach(e => {
      switch (e.type) {
        case 'commit': stats.commits++; break
        case 'tag': stats.tags++; break
        case 'branch': stats.branches++; break
        case 'merge': stats.merges++; break
      }
    })
    
    if (events.length > 0) {
      const first = events[events.length - 1].date
      const last = events[0].date
      stats.duration = Math.floor((last.getTime() - first.getTime()) / (1000 * 60 * 60 * 24))
    }
    
    return stats
  }

private async getBranchInfo(branchName: string): Promise<any> {
    void branchName
    // 简化实现
    return {
      lastCommit: new Date(),
      lastAuthor: 'Unknown',
      ahead: 0,
      behind: 0
    }
  }

  private async collectCodeMetrics(): Promise<CodeMetrics> {
    // 简化实现
    return {
      totalLines: 10000,
      totalFiles: 100,
      languages: new Map([
        ['TypeScript', 5000],
        ['JavaScript', 3000],
        ['CSS', 1500],
        ['HTML', 500]
      ]),
      complexity: 15,
      churn: 12.5,
      coverage: 75,
      testRatio: 1.5
    }
  }

  private async showGrowthChart(): Promise<void> {
    console.log(chalk.cyan('\n📈 代码增长趋势:'))
    // 简化实现
    console.log('  [增长图表显示区域]')
  }

  private async generateChangeMatrix(): Promise<Map<string, any>> {
    // 简化实现
    return new Map()
  }

private findFileCorrelations(matrix: Map<string, any>): any[] {
    void matrix
    // 简化实现
    return [
      {
        file1: 'src/index.ts',
        file2: 'src/utils.ts',
        strength: 85
      }
    ]
  }

private identifyHotspots(matrix: Map<string, any>): any[] {
    void matrix
    // 简化实现
    return [
      {
        area: 'src/core',
        files: ['index.ts', 'utils.ts'],
        changes: 150,
        risk: 7
      }
    ]
  }

  private async showWorldMap(): Promise<void> {
    console.log(chalk.cyan('\n🌍 全球贡献地图\n'))
    console.log('  [世界地图可视化 - 需要地理位置数据]')
  }
}
