/**
 * LDesign 社区贡献系统
 * 管理社区贡献、代码审查、奖励机制等
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import chalk from 'chalk'

export interface Contributor {
  /** 贡献者 ID */
  id: string
  /** 用户名 */
  username: string
  /** 显示名称 */
  displayName: string
  /** 邮箱 */
  email: string
  /** 头像 */
  avatar?: string
  /** 个人主页 */
  website?: string
  /** GitHub 用户名 */
  github?: string
  /** 加入时间 */
  joinedAt: string
  /** 贡献统计 */
  stats: ContributorStats
  /** 徽章 */
  badges: Badge[]
  /** 等级 */
  level: ContributorLevel
}

export interface ContributorStats {
  /** 总贡献数 */
  totalContributions: number
  /** 代码提交数 */
  commits: number
  /** PR 数量 */
  pullRequests: number
  /** Issue 数量 */
  issues: number
  /** 插件发布数 */
  plugins: number
  /** 文档贡献 */
  documentation: number
  /** 代码审查 */
  reviews: number
  /** 社区帮助 */
  communityHelp: number
  /** 获得的星星数 */
  stars: number
}

export interface Badge {
  /** 徽章 ID */
  id: string
  /** 徽章名称 */
  name: string
  /** 徽章描述 */
  description: string
  /** 徽章图标 */
  icon: string
  /** 徽章颜色 */
  color: string
  /** 获得时间 */
  earnedAt: string
  /** 徽章类型 */
  type: BadgeType
}

export type BadgeType =
  | 'contribution'
  | 'milestone'
  | 'special'
  | 'community'
  | 'technical'
  | 'leadership'

export type ContributorLevel =
  | 'newcomer'
  | 'contributor'
  | 'regular'
  | 'veteran'
  | 'expert'
  | 'maintainer'
  | 'core'

export interface Contribution {
  /** 贡献 ID */
  id: string
  /** 贡献者 ID */
  contributorId: string
  /** 贡献类型 */
  type: ContributionType
  /** 贡献标题 */
  title: string
  /** 贡献描述 */
  description: string
  /** 相关链接 */
  url?: string
  /** 贡献状态 */
  status: ContributionStatus
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
  /** 审查者 */
  reviewers: string[]
  /** 标签 */
  tags: string[]
  /** 影响范围 */
  impact: ContributionImpact
  /** 奖励积分 */
  points: number
}

export type ContributionType =
  | 'code'
  | 'plugin'
  | 'documentation'
  | 'bug-report'
  | 'feature-request'
  | 'design'
  | 'testing'
  | 'translation'
  | 'community'
  | 'tutorial'

export type ContributionStatus =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'approved'
  | 'merged'
  | 'rejected'
  | 'closed'

export type ContributionImpact = 'minor' | 'moderate' | 'major' | 'critical'

export interface ContributionReward {
  /** 奖励类型 */
  type: 'points' | 'badge' | 'recognition' | 'swag'
  /** 奖励值 */
  value: number | string
  /** 奖励描述 */
  description: string
}

export class CommunityContributionManager {
  private dataDir: string
  private contributorsFile: string
  private contributionsFile: string
  private badgesFile: string

  constructor(options: { dataDir?: string } = {}) {
    this.dataDir =
      options.dataDir || resolve(process.cwd(), '.ldesign/community')
    this.contributorsFile = join(this.dataDir, 'contributors.json')
    this.contributionsFile = join(this.dataDir, 'contributions.json')
    this.badgesFile = join(this.dataDir, 'badges.json')

    this.ensureDirectories()
    this.initializeBadges()
  }

  /**
   * 注册新贡献者
   */
  async registerContributor(
    contributorData: Partial<Contributor>
  ): Promise<Contributor> {
    console.log(chalk.blue(`👋 注册新贡献者: ${contributorData.username}`))

    const contributor: Contributor = {
      id: this.generateId(),
      username: contributorData.username!,
      displayName: contributorData.displayName || contributorData.username!,
      email: contributorData.email!,
      avatar: contributorData.avatar,
      website: contributorData.website,
      github: contributorData.github,
      joinedAt: new Date().toISOString(),
      stats: {
        totalContributions: 0,
        commits: 0,
        pullRequests: 0,
        issues: 0,
        plugins: 0,
        documentation: 0,
        reviews: 0,
        communityHelp: 0,
        stars: 0,
      },
      badges: [],
      level: 'newcomer',
    }

    // 保存贡献者信息
    await this.saveContributor(contributor)

    // 颁发新人徽章
    await this.awardBadge(contributor.id, 'newcomer')

    console.log(chalk.green(`✅ 贡献者 ${contributor.username} 注册成功`))
    return contributor
  }

  /**
   * 提交贡献
   */
  async submitContribution(
    contributionData: Partial<Contribution>
  ): Promise<Contribution> {
    console.log(chalk.blue(`📝 提交贡献: ${contributionData.title}`))

    const contribution: Contribution = {
      id: this.generateId(),
      contributorId: contributionData.contributorId!,
      type: contributionData.type!,
      title: contributionData.title!,
      description: contributionData.description!,
      url: contributionData.url,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewers: [],
      tags: contributionData.tags || [],
      impact: contributionData.impact || 'minor',
      points: this.calculatePoints(
        contributionData.type!,
        contributionData.impact || 'minor'
      ),
    }

    // 保存贡献
    await this.saveContribution(contribution)

    // 更新贡献者统计
    await this.updateContributorStats(
      contribution.contributorId,
      contribution.type
    )

    // 检查并颁发徽章
    await this.checkAndAwardBadges(contribution.contributorId)

    console.log(chalk.green(`✅ 贡献 ${contribution.title} 提交成功`))
    return contribution
  }

  /**
   * 审查贡献
   */
  async reviewContribution(
    contributionId: string,
    reviewerId: string,
    status: ContributionStatus,
    feedback?: string
  ): Promise<void> {
    console.log(chalk.blue(`🔍 审查贡献: ${contributionId}`))

    const contribution = await this.getContribution(contributionId)
    if (!contribution) {
      throw new Error(`贡献不存在: ${contributionId}`)
    }

    // 更新贡献状态
    contribution.status = status
    contribution.updatedAt = new Date().toISOString()

    if (!contribution.reviewers.includes(reviewerId)) {
      contribution.reviewers.push(reviewerId)
    }

    await this.saveContribution(contribution)

    // 如果贡献被批准，给予奖励
    if (status === 'approved' || status === 'merged') {
      await this.rewardContribution(contribution)
    }

    // 更新审查者统计
    await this.updateReviewerStats(reviewerId)

    console.log(chalk.green(`✅ 贡献审查完成: ${status}`))
  }

  /**
   * 获取贡献者排行榜
   */
  async getLeaderboard(limit = 10): Promise<Contributor[]> {
    const contributors = await this.loadContributors()

    return Object.values(contributors)
      .sort((a, b) => b.stats.totalContributions - a.stats.totalContributions)
      .slice(0, limit)
  }

  /**
   * 获取贡献统计
   */
  async getContributionStats(): Promise<{
    totalContributors: number
    totalContributions: number
    contributionsByType: Record<ContributionType, number>
    contributionsByMonth: Record<string, number>
  }> {
    const contributors = await this.loadContributors()
    const contributions = await this.loadContributions()

    const contributionsByType: Record<string, number> = {}
    const contributionsByMonth: Record<string, number> = {}

    Object.values(contributions).forEach(contribution => {
      // 按类型统计
      contributionsByType[contribution.type] =
        (contributionsByType[contribution.type] || 0) + 1

      // 按月份统计
      const month = contribution.createdAt.substring(0, 7) // YYYY-MM
      contributionsByMonth[month] = (contributionsByMonth[month] || 0) + 1
    })

    return {
      totalContributors: Object.keys(contributors).length,
      totalContributions: Object.keys(contributions).length,
      contributionsByType: contributionsByType as Record<
        ContributionType,
        number
      >,
      contributionsByMonth,
    }
  }

  /**
   * 生成贡献者报告
   */
  async generateContributorReport(contributorId: string): Promise<string> {
    const contributor = await this.getContributor(contributorId)
    if (!contributor) {
      throw new Error(`贡献者不存在: ${contributorId}`)
    }

    const contributions = await this.getContributorContributions(contributorId)

    return `# ${contributor.displayName} 的贡献报告

## 基本信息
- **用户名**: ${contributor.username}
- **等级**: ${contributor.level}
- **加入时间**: ${new Date(contributor.joinedAt).toLocaleDateString('zh-CN')}
- **GitHub**: ${
      contributor.github
        ? `[@${contributor.github}](https://github.com/${contributor.github})`
        : '未设置'
    }

## 贡献统计
- **总贡献数**: ${contributor.stats.totalContributions}
- **代码提交**: ${contributor.stats.commits}
- **Pull Requests**: ${contributor.stats.pullRequests}
- **Issues**: ${contributor.stats.issues}
- **插件发布**: ${contributor.stats.plugins}
- **文档贡献**: ${contributor.stats.documentation}
- **代码审查**: ${contributor.stats.reviews}
- **社区帮助**: ${contributor.stats.communityHelp}

## 获得徽章
${contributor.badges
  .map(badge => `- 🏆 **${badge.name}**: ${badge.description}`)
  .join('\n')}

## 最近贡献
${contributions
  .slice(0, 10)
  .map(
    contribution =>
      `- [${contribution.title}](${contribution.url || '#'}) (${
        contribution.type
      }) - ${new Date(contribution.createdAt).toLocaleDateString('zh-CN')}`
  )
  .join('\n')}

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`
  }

  /**
   * 确保目录存在
   */
  private ensureDirectories(): void {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true })
    }
  }

  /**
   * 初始化徽章系统
   */
  private initializeBadges(): void {
    const badgesPath = this.badgesFile

    if (!existsSync(badgesPath)) {
      const defaultBadges = {
        newcomer: {
          id: 'newcomer',
          name: '新人',
          description: '欢迎加入 LDesign 社区！',
          icon: '👋',
          color: '#22c55e',
          type: 'milestone',
        },
        'first-contribution': {
          id: 'first-contribution',
          name: '首次贡献',
          description: '完成了第一次代码贡献',
          icon: '🎉',
          color: '#3b82f6',
          type: 'contribution',
        },
        'plugin-author': {
          id: 'plugin-author',
          name: '插件作者',
          description: '发布了第一个插件',
          icon: '🔌',
          color: '#8b5cf6',
          type: 'technical',
        },
        'doc-writer': {
          id: 'doc-writer',
          name: '文档贡献者',
          description: '为文档做出了重要贡献',
          icon: '📚',
          color: '#f59e0b',
          type: 'contribution',
        },
        'bug-hunter': {
          id: 'bug-hunter',
          name: 'Bug 猎手',
          description: '发现并报告了重要 Bug',
          icon: '🐛',
          color: '#ef4444',
          type: 'community',
        },
        'code-reviewer': {
          id: 'code-reviewer',
          name: '代码审查员',
          description: '积极参与代码审查',
          icon: '👀',
          color: '#06b6d4',
          type: 'community',
        },
        'community-helper': {
          id: 'community-helper',
          name: '社区助手',
          description: '热心帮助社区成员',
          icon: '🤝',
          color: '#10b981',
          type: 'community',
        },
        'core-contributor': {
          id: 'core-contributor',
          name: '核心贡献者',
          description: '对项目做出了重大贡献',
          icon: '⭐',
          color: '#fbbf24',
          type: 'special',
        },
      }

      writeFileSync(badgesPath, JSON.stringify(defaultBadges, null, 2))
    }
  }

  /**
   * 生成 ID
   */
  private generateId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    )
  }

  /**
   * 计算贡献积分
   */
  private calculatePoints(
    type: ContributionType,
    impact: ContributionImpact
  ): number {
    const basePoints = {
      code: 10,
      plugin: 20,
      documentation: 5,
      'bug-report': 3,
      'feature-request': 2,
      design: 8,
      testing: 6,
      translation: 4,
      community: 3,
      tutorial: 15,
    }

    const impactMultiplier = {
      minor: 1,
      moderate: 1.5,
      major: 2,
      critical: 3,
    }

    return Math.round((basePoints[type] || 1) * impactMultiplier[impact])
  }

  /**
   * 保存贡献者
   */
  private async saveContributor(contributor: Contributor): Promise<void> {
    const contributors = await this.loadContributors()
    contributors[contributor.id] = contributor
    writeFileSync(this.contributorsFile, JSON.stringify(contributors, null, 2))
  }

  /**
   * 保存贡献
   */
  private async saveContribution(contribution: Contribution): Promise<void> {
    const contributions = await this.loadContributions()
    contributions[contribution.id] = contribution
    writeFileSync(
      this.contributionsFile,
      JSON.stringify(contributions, null, 2)
    )
  }

  /**
   * 加载贡献者
   */
  private async loadContributors(): Promise<Record<string, Contributor>> {
    try {
      if (existsSync(this.contributorsFile)) {
        const content = readFileSync(this.contributorsFile, 'utf-8')
        return JSON.parse(content)
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️ 无法加载贡献者数据'))
    }
    return {}
  }

  /**
   * 加载贡献
   */
  private async loadContributions(): Promise<Record<string, Contribution>> {
    try {
      if (existsSync(this.contributionsFile)) {
        const content = readFileSync(this.contributionsFile, 'utf-8')
        return JSON.parse(content)
      }
    } catch (error) {
      console.warn(chalk.yellow('⚠️ 无法加载贡献数据'))
    }
    return {}
  }

  /**
   * 获取贡献者
   */
  private async getContributor(id: string): Promise<Contributor | null> {
    const contributors = await this.loadContributors()
    return contributors[id] || null
  }

  /**
   * 获取贡献
   */
  private async getContribution(id: string): Promise<Contribution | null> {
    const contributions = await this.loadContributions()
    return contributions[id] || null
  }

  /**
   * 获取贡献者的贡献列表
   */
  private async getContributorContributions(
    contributorId: string
  ): Promise<Contribution[]> {
    const contributions = await this.loadContributions()
    return Object.values(contributions)
      .filter(contribution => contribution.contributorId === contributorId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }

  /**
   * 更新贡献者统计
   */
  private async updateContributorStats(
    contributorId: string,
    type: ContributionType
  ): Promise<void> {
    const contributor = await this.getContributor(contributorId)
    if (!contributor) return

    contributor.stats.totalContributions++

    switch (type) {
      case 'code':
        contributor.stats.commits++
        break
      case 'plugin':
        contributor.stats.plugins++
        break
      case 'documentation':
        contributor.stats.documentation++
        break
      case 'bug-report':
      case 'feature-request':
        contributor.stats.issues++
        break
      case 'community':
        contributor.stats.communityHelp++
        break
    }

    // 更新等级
    contributor.level = this.calculateLevel(contributor.stats)

    await this.saveContributor(contributor)
  }

  /**
   * 更新审查者统计
   */
  private async updateReviewerStats(reviewerId: string): Promise<void> {
    const reviewer = await this.getContributor(reviewerId)
    if (!reviewer) return

    reviewer.stats.reviews++
    await this.saveContributor(reviewer)
  }

  /**
   * 计算贡献者等级
   */
  private calculateLevel(stats: ContributorStats): ContributorLevel {
    const total = stats.totalContributions

    if (total >= 100) return 'core'
    if (total >= 50) return 'maintainer'
    if (total >= 25) return 'expert'
    if (total >= 10) return 'veteran'
    if (total >= 5) return 'regular'
    if (total >= 1) return 'contributor'
    return 'newcomer'
  }

  /**
   * 颁发徽章
   */
  private async awardBadge(
    contributorId: string,
    badgeId: string
  ): Promise<void> {
    const contributor = await this.getContributor(contributorId)
    if (!contributor) return

    // 检查是否已经有此徽章
    if (contributor.badges.some(badge => badge.id === badgeId)) {
      return
    }

    const badgesData = JSON.parse(readFileSync(this.badgesFile, 'utf-8'))
    const badgeTemplate = badgesData[badgeId]

    if (badgeTemplate) {
      const badge: Badge = {
        ...badgeTemplate,
        earnedAt: new Date().toISOString(),
      }

      contributor.badges.push(badge)
      await this.saveContributor(contributor)

      console.log(
        chalk.green(`🏆 ${contributor.username} 获得徽章: ${badge.name}`)
      )
    }
  }

  /**
   * 检查并颁发徽章
   */
  private async checkAndAwardBadges(contributorId: string): Promise<void> {
    const contributor = await this.getContributor(contributorId)
    if (!contributor) return

    const stats = contributor.stats

    // 首次贡献徽章
    if (stats.totalContributions === 1) {
      await this.awardBadge(contributorId, 'first-contribution')
    }

    // 插件作者徽章
    if (stats.plugins >= 1) {
      await this.awardBadge(contributorId, 'plugin-author')
    }

    // 文档贡献者徽章
    if (stats.documentation >= 5) {
      await this.awardBadge(contributorId, 'doc-writer')
    }

    // 代码审查员徽章
    if (stats.reviews >= 10) {
      await this.awardBadge(contributorId, 'code-reviewer')
    }

    // 社区助手徽章
    if (stats.communityHelp >= 10) {
      await this.awardBadge(contributorId, 'community-helper')
    }

    // 核心贡献者徽章
    if (stats.totalContributions >= 50) {
      await this.awardBadge(contributorId, 'core-contributor')
    }
  }

  /**
   * 奖励贡献
   */
  private async rewardContribution(contribution: Contribution): Promise<void> {
    const contributor = await this.getContributor(contribution.contributorId)
    if (!contributor) return

    // 增加积分
    contributor.stats.stars += contribution.points

    await this.saveContributor(contributor)

    console.log(
      chalk.green(`⭐ ${contributor.username} 获得 ${contribution.points} 积分`)
    )
  }
}

export function createCommunityContributionManager(options?: {
  dataDir?: string
}): CommunityContributionManager {
  return new CommunityContributionManager(options)
}
