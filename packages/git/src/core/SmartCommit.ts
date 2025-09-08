/**
 * 智能化提交功能模块
 * 提供自动生成提交信息、分析变更、批量提交等功能
 */

import {
  ConsoleLogger,
  PathUtils,
  PromptManager,
  ConsoleTheme
} from '@ldesign/kit'
import { GitOperations } from './GitOperations'
import { GitError, GitErrorType } from '../errors'
import type { GitStatus } from '../types'

/**
 * 提交类型定义
 */
export enum CommitType {
  FEAT = 'feat',        // 新功能
  FIX = 'fix',          // 修复
  DOCS = 'docs',        // 文档
  STYLE = 'style',      // 格式
  REFACTOR = 'refactor',// 重构
  PERF = 'perf',        // 性能
  TEST = 'test',        // 测试
  BUILD = 'build',      // 构建
  CI = 'ci',            // CI
  CHORE = 'chore',      // 杂项
  REVERT = 'revert'     // 回滚
}

/**
 * 提交类型配置
 */
interface CommitTypeConfig {
  type: CommitType
  title: string
  description: string
  emoji?: string
}

/**
 * 智能提交配置
 */
export interface SmartCommitConfig {
  // 是否使用表情符号
  useEmoji?: boolean
  // 是否使用 conventional commits 格式
  useConventional?: boolean
  // 自定义提交类型
  customTypes?: CommitTypeConfig[]
  // 是否自动分析变更
  autoAnalyze?: boolean
  // 是否自动添加 issue 编号
  autoIssue?: boolean
  // issue 编号格式
  issueFormat?: RegExp
  // 是否自动添加 scope
  autoScope?: boolean
  // 最大提交信息长度
  maxLength?: number
  // 是否验证提交信息
  validate?: boolean
  // 自定义验证规则
  validationRules?: Array<(message: string) => boolean | string>
}

/**
 * 变更分析结果
 */
interface ChangeAnalysis {
  type: CommitType
  scope?: string
  breaking: boolean
  files: {
    added: string[]
    modified: string[]
    deleted: string[]
    renamed: string[]
  }
  stats: {
    additions: number
    deletions: number
    changes: number
  }
  suggestedMessage: string
}

/**
 * 智能提交类
 */
export class SmartCommit {
  private git: GitOperations
  private logger: any
  private config: Required<SmartCommitConfig>
  private promptManager: any
  private theme: any

  private static readonly DEFAULT_TYPES: CommitTypeConfig[] = [
    { type: CommitType.FEAT, title: 'Features', description: 'A new feature', emoji: '✨' },
    { type: CommitType.FIX, title: 'Bug Fixes', description: 'A bug fix', emoji: '🐛' },
    { type: CommitType.DOCS, title: 'Documentation', description: 'Documentation only changes', emoji: '📚' },
    { type: CommitType.STYLE, title: 'Styles', description: 'Changes that do not affect the meaning of the code', emoji: '💎' },
    { type: CommitType.REFACTOR, title: 'Code Refactoring', description: 'A code change that neither fixes a bug nor adds a feature', emoji: '📦' },
    { type: CommitType.PERF, title: 'Performance Improvements', description: 'A code change that improves performance', emoji: '🚀' },
    { type: CommitType.TEST, title: 'Tests', description: 'Adding missing tests or correcting existing tests', emoji: '🚨' },
    { type: CommitType.BUILD, title: 'Builds', description: 'Changes that affect the build system or external dependencies', emoji: '🛠' },
    { type: CommitType.CI, title: 'Continuous Integrations', description: 'Changes to our CI configuration files and scripts', emoji: '⚙️' },
    { type: CommitType.CHORE, title: 'Chores', description: 'Other changes that don\'t modify src or test files', emoji: '♻️' },
    { type: CommitType.REVERT, title: 'Reverts', description: 'Reverts a previous commit', emoji: '🗑' }
  ]

  constructor(git: GitOperations, config: SmartCommitConfig = {}, logger?: any) {
    this.git = git
    this.logger = logger || new ConsoleLogger({ level: 'info' })
    this.promptManager = new PromptManager()
    this.theme = new ConsoleTheme()
    
    this.config = {
      useEmoji: config.useEmoji ?? true,
      useConventional: config.useConventional ?? true,
      customTypes: config.customTypes ?? SmartCommit.DEFAULT_TYPES,
      autoAnalyze: config.autoAnalyze ?? true,
      autoIssue: config.autoIssue ?? true,
      issueFormat: config.issueFormat ?? /#(\d+)/,
      autoScope: config.autoScope ?? true,
      maxLength: config.maxLength ?? 100,
      validate: config.validate ?? true,
      validationRules: config.validationRules ?? []
    }
  }

  /**
   * 执行智能提交
   */
  async commit(options: {
    message?: string
    type?: CommitType
    scope?: string
    breaking?: boolean
    issues?: string[]
    body?: string
    footer?: string
    interactive?: boolean
  } = {}): Promise<string> {
    const status = await this.git.status()
    
    if (status.staged.length === 0) {
      throw new GitError(GitErrorType.INVALID_ARGUMENT, 'No staged changes to commit')
    }

    let commitMessage: string

    if (options.interactive !== false && !options.message) {
      // 交互式生成提交信息
      commitMessage = await this.interactiveCommit(status, options)
    } else if (options.message) {
      // 使用提供的消息
      commitMessage = options.message
    } else {
      // 自动生成提交信息
      const analysis = await this.analyzeChanges(status)
      commitMessage = this.buildCommitMessage({
        type: options.type || analysis.type,
        scope: options.scope || analysis.scope,
        subject: analysis.suggestedMessage,
        breaking: options.breaking || analysis.breaking,
        issues: options.issues,
        body: options.body,
        footer: options.footer
      })
    }

    // 验证提交信息
    if (this.config.validate) {
      this.validateCommitMessage(commitMessage)
    }

    // 执行提交
    return await this.git.commit(commitMessage)
  }

  /**
   * 交互式提交
   */
  private async interactiveCommit(
    status: GitStatus,
    options: any
  ): Promise<string> {
    let analysis: ChangeAnalysis | undefined

    if (this.config.autoAnalyze) {
      this.logger.info('Analyzing changes...')
      analysis = await this.analyzeChanges(status)
      this.displayAnalysis(analysis)
    }

    // 选择提交类型
    const type = options.type || await this.selectCommitType(analysis?.type)

    // 输入 scope
    let scope: string | undefined
    if (this.config.autoScope) {
      scope = options.scope || await this.inputScope(analysis?.scope)
    }

    // 输入提交主题
    const subject = await this.inputSubject(analysis?.suggestedMessage)

    // 是否为破坏性变更
    const breaking = options.breaking ?? await this.confirmBreaking()

    // 输入详细描述
    const body = options.body || await this.inputBody()

    // 输入 issues
    const issues = options.issues || await this.inputIssues()

    // 输入 footer
    const footer = options.footer || await this.inputFooter()

    return this.buildCommitMessage({
      type,
      scope,
      subject,
      breaking,
      issues,
      body,
      footer
    })
  }

  /**
   * 分析变更
   */
  private async analyzeChanges(status: GitStatus): Promise<ChangeAnalysis> {
    const diff = await this.git.diff({ cached: true, numstat: true })
    const stats = this.parseDiffStats(diff)

    // 分析文件类型分布
    const fileTypes = this.analyzeFileTypes(status)
    
    // 推断提交类型
    const type = this.inferCommitType(status, fileTypes)
    
    // 推断 scope
    const scope = this.inferScope(status.staged)
    
    // 检查是否为破坏性变更
    const breaking = await this.checkBreakingChanges(status)
    
    // 生成建议的提交信息
    const suggestedMessage = this.generateSuggestedMessage(type, status)

    return {
      type,
      scope,
      breaking,
      files: {
        added: status.staged.filter(f => !status.modified.includes(f)),
        modified: status.modified,
        deleted: status.deleted,
        renamed: status.renamed
      },
      stats,
      suggestedMessage
    }
  }

  /**
   * 解析 diff 统计信息
   */
  private parseDiffStats(diff: string): ChangeAnalysis['stats'] {
    const lines = diff.split('\n').filter(Boolean)
    let additions = 0
    let deletions = 0

    for (const line of lines) {
      const parts = line.split('\t')
      if (parts.length >= 3) {
        additions += parseInt(parts[0]) || 0
        deletions += parseInt(parts[1]) || 0
      }
    }

    return {
      additions,
      deletions,
      changes: additions + deletions
    }
  }

  /**
   * 分析文件类型分布
   */
  private analyzeFileTypes(status: GitStatus): Map<string, number> {
    const types = new Map<string, number>()
    const allFiles = [
      ...status.staged,
      ...status.modified,
      ...status.deleted,
      ...status.renamed
    ]

    for (const file of allFiles) {
      const ext = PathUtils.extname(file).toLowerCase()
      types.set(ext, (types.get(ext) || 0) + 1)
    }

    return types
  }

  /**
   * 推断提交类型
   */
  private inferCommitType(status: GitStatus, fileTypes: Map<string, number>): CommitType {
    // 如果有测试文件变更
    if (this.hasTestFiles(status.staged)) {
      return CommitType.TEST
    }

    // 如果只有文档变更
    if (this.isDocumentationOnly(fileTypes)) {
      return CommitType.DOCS
    }

    // 如果有配置文件变更
    if (this.hasConfigFiles(status.staged)) {
      return CommitType.BUILD
    }

    // 如果有样式文件变更
    if (this.hasStyleFiles(fileTypes)) {
      return CommitType.STYLE
    }

    // 如果有删除文件
    if (status.deleted.length > 0) {
      return CommitType.REFACTOR
    }

    // 默认为新功能
    return CommitType.FEAT
  }

  /**
   * 推断 scope
   */
  private inferScope(files: string[]): string | undefined {
    if (files.length === 0) return undefined

    // 找出最常见的目录
    const dirs = new Map<string, number>()
    
    for (const file of files) {
      const parts = file.split('/')
      if (parts.length > 1) {
        const dir = parts[0]
        dirs.set(dir, (dirs.get(dir) || 0) + 1)
      }
    }

    if (dirs.size === 0) return undefined

    // 返回最常见的目录作为 scope
    let maxCount = 0
    let scope: string | undefined

    for (const [dir, count] of dirs) {
      if (count > maxCount) {
        maxCount = count
        scope = dir
      }
    }

    return scope
  }

  /**
   * 检查是否有破坏性变更
   */
  private async checkBreakingChanges(status: GitStatus): Promise<boolean> {
    // 检查是否有 API 变更、接口变更等
    const apiFiles = status.staged.filter(f => 
      f.includes('api') || 
      f.includes('interface') || 
      f.includes('public')
    )

    return apiFiles.length > 0
  }

  /**
   * 生成建议的提交信息
   */
  private generateSuggestedMessage(type: CommitType, status: GitStatus): string {
    const fileCount = status.staged.length
    
    switch (type) {
      case CommitType.FEAT:
        return `add ${fileCount > 1 ? 'new features' : 'new feature'}`
      case CommitType.FIX:
        return `fix ${fileCount > 1 ? 'issues' : 'issue'}`
      case CommitType.DOCS:
        return 'update documentation'
      case CommitType.STYLE:
        return 'improve code style'
      case CommitType.REFACTOR:
        return 'refactor code structure'
      case CommitType.TEST:
        return `add ${fileCount > 1 ? 'tests' : 'test'}`
      case CommitType.BUILD:
        return 'update build configuration'
      case CommitType.PERF:
        return 'improve performance'
      default:
        return 'update code'
    }
  }

  /**
   * 显示分析结果
   */
  private displayAnalysis(analysis: ChangeAnalysis): void {
    console.log(this.theme.header('\n📊 Change Analysis:'))
    console.log(this.theme.info(`  Type: ${analysis.type}`))
    if (analysis.scope) {
      console.log(this.theme.info(`  Scope: ${analysis.scope}`))
    }
    console.log(this.theme.info(`  Files: +${analysis.files.added.length} ~${analysis.files.modified.length} -${analysis.files.deleted.length}`))
    console.log(this.theme.info(`  Changes: +${analysis.stats.additions} -${analysis.stats.deletions}`))
    if (analysis.breaking) {
      console.log(this.theme.warning('  ⚠️  Possible breaking changes detected'))
    }
    console.log()
  }

  /**
   * 选择提交类型
   */
  private async selectCommitType(defaultType?: CommitType): Promise<CommitType> {
    const choices = this.config.customTypes.map(t => ({
      name: `${this.config.useEmoji ? t.emoji + ' ' : ''}${t.type}: ${t.description}`,
      value: t.type
    }))

    const answer = await this.promptManager.select({
      message: 'Select commit type:',
      choices,
      default: defaultType
    })

    return answer as CommitType
  }

  /**
   * 输入 scope
   */
  private async inputScope(defaultScope?: string): Promise<string | undefined> {
    const answer = await this.promptManager.input({
      message: 'Enter commit scope (optional):',
      default: defaultScope
    })

    return answer || undefined
  }

  /**
   * 输入提交主题
   */
  private async inputSubject(defaultSubject?: string): Promise<string> {
    const answer = await this.promptManager.input({
      message: 'Enter commit subject:',
      default: defaultSubject,
      validate: (input: string) => {
        if (!input) {
          return 'Subject is required'
        }
        if (input.length > this.config.maxLength) {
          return `Subject must be less than ${this.config.maxLength} characters`
        }
        return true
      }
    })

    return answer
  }

  /**
   * 确认是否为破坏性变更
   */
  private async confirmBreaking(): Promise<boolean> {
    return await this.promptManager.confirm({
      message: 'Is this a breaking change?',
      default: false
    })
  }

  /**
   * 输入详细描述
   */
  private async inputBody(): Promise<string | undefined> {
    const answer = await this.promptManager.editor({
      message: 'Enter commit body (optional):'
    })

    return answer || undefined
  }

  /**
   * 输入相关 issues
   */
  private async inputIssues(): Promise<string[] | undefined> {
    const answer = await this.promptManager.input({
      message: 'Enter related issues (comma separated, optional):'
    })

    if (!answer) return undefined

    return answer.split(',').map(s => s.trim()).filter(Boolean)
  }

  /**
   * 输入 footer
   */
  private async inputFooter(): Promise<string | undefined> {
    const answer = await this.promptManager.input({
      message: 'Enter commit footer (optional):'
    })

    return answer || undefined
  }

  /**
   * 构建提交信息
   */
  private buildCommitMessage(options: {
    type: CommitType
    scope?: string
    subject: string
    breaking?: boolean
    issues?: string[]
    body?: string
    footer?: string
  }): string {
    let message = ''

    // 添加表情符号
    if (this.config.useEmoji) {
      const typeConfig = this.config.customTypes.find(t => t.type === options.type)
      if (typeConfig?.emoji) {
        message += typeConfig.emoji + ' '
      }
    }

    // 添加类型
    if (this.config.useConventional) {
      message += options.type
      
      // 添加 scope
      if (options.scope) {
        message += `(${options.scope})`
      }
      
      // 添加破坏性变更标记
      if (options.breaking) {
        message += '!'
      }
      
      message += ': '
    }

    // 添加主题
    message += options.subject

    // 添加 issues
    if (options.issues && options.issues.length > 0) {
      message += ' (' + options.issues.map(i => `#${i}`).join(', ') + ')'
    }

    // 添加 body
    if (options.body) {
      message += '\n\n' + options.body
    }

    // 添加 footer
    if (options.footer) {
      message += '\n\n' + options.footer
    }

    // 添加破坏性变更说明
    if (options.breaking && !options.footer) {
      message += '\n\nBREAKING CHANGE: This commit contains breaking changes'
    }

    return message
  }

  /**
   * 验证提交信息
   */
  private validateCommitMessage(message: string): void {
    // 检查长度
    const firstLine = message.split('\n')[0]
    if (firstLine.length > this.config.maxLength) {
      throw new GitError(
        GitErrorType.INVALID_ARGUMENT,
        `Commit message first line exceeds ${this.config.maxLength} characters`
      )
    }

    // 检查格式
    if (this.config.useConventional) {
      const pattern = /^(?:[\w\s]+:\s)?(?:\w+)(?:\([\w\-]+\))?!?:\s.+/
      if (!pattern.test(firstLine)) {
        throw new GitError(
          GitErrorType.INVALID_ARGUMENT,
          'Commit message does not follow conventional format'
        )
      }
    }

    // 执行自定义验证规则
    for (const rule of this.config.validationRules) {
      const result = rule(message)
      if (result !== true) {
        throw new GitError(
          GitErrorType.INVALID_ARGUMENT,
          typeof result === 'string' ? result : 'Commit message validation failed'
        )
      }
    }
  }

  /**
   * 批量提交
   */
  async batchCommit(options: {
    groupBy?: 'type' | 'scope' | 'directory'
    interactive?: boolean
  } = {}): Promise<string[]> {
    const status = await this.git.status()
    
    if (status.staged.length === 0) {
      // 添加所有修改的文件
      await this.git.add('.')
      const newStatus = await this.git.status()
      if (newStatus.staged.length === 0) {
        throw new GitError(
          GitErrorType.INVALID_ARGUMENT,
          'No changes to commit'
        )
      }
    }

    // 根据分组策略分组文件
    const groups = this.groupFiles(status.staged, options.groupBy || 'type')
    const commits: string[] = []

    this.logger.info(`Found ${groups.size} groups to commit`)

    for (const [group, files] of groups) {
      // 重置暂存区
      await this.git.reset({ mode: 'mixed' })
      
      // 添加当前组的文件
      await this.git.add(files)
      
      // 生成提交信息
      const message = await this.generateGroupCommitMessage(group, files, options.interactive)
      
      // 执行提交
      const hash = await this.git.commit(message)
      commits.push(hash)
      
      this.logger.success(`Committed group '${group}': ${hash}`)
    }

    return commits
  }

  /**
   * 分组文件
   */
  private groupFiles(files: string[], groupBy: 'type' | 'scope' | 'directory'): Map<string, string[]> {
    const groups = new Map<string, string[]>()

    for (const file of files) {
      let group: string

      switch (groupBy) {
        case 'type':
          group = this.getFileType(file)
          break
        case 'scope':
          group = this.getFileScope(file)
          break
        case 'directory':
          group = PathUtils.dirname(file).split('/')[0] || 'root'
          break
        default:
          group = 'default'
      }

      if (!groups.has(group)) {
        groups.set(group, [])
      }
      groups.get(group)!.push(file)
    }

    return groups
  }

  /**
   * 获取文件类型
   */
  private getFileType(file: string): string {
    const ext = PathUtils.extname(file).toLowerCase()
    
    // 测试文件
    if (file.includes('test') || file.includes('spec')) {
      return 'test'
    }
    
    // 文档文件
    if (['.md', '.txt', '.rst'].includes(ext)) {
      return 'docs'
    }
    
    // 配置文件
    if (['.json', '.yaml', '.yml', '.toml', '.ini'].includes(ext) || file.includes('config')) {
      return 'config'
    }
    
    // 样式文件
    if (['.css', '.scss', '.less', '.sass', '.styl'].includes(ext)) {
      return 'style'
    }
    
    return 'code'
  }

  /**
   * 获取文件 scope
   */
  private getFileScope(file: string): string {
    const parts = file.split('/')
    
    // 如果在 src 目录下，使用第二级目录
    if (parts[0] === 'src' && parts.length > 1) {
      return parts[1]
    }
    
    // 否则使用第一级目录
    return parts[0]
  }

  /**
   * 生成分组提交信息
   */
  private async generateGroupCommitMessage(
    group: string,
    files: string[],
    interactive?: boolean
  ): Promise<string> {
    if (interactive) {
      this.logger.info(`Group: ${group}`)
      this.logger.info(`Files: ${files.join(', ')}`)
      
      return await this.promptManager.input({
        message: `Enter commit message for group '${group}':`
      })
    }

    // 自动生成
    const type = this.getGroupCommitType(group)
    const subject = `update ${group} files`
    
    return this.buildCommitMessage({
      type,
      scope: group,
      subject
    })
  }

  /**
   * 获取分组的提交类型
   */
  private getGroupCommitType(group: string): CommitType {
    switch (group) {
      case 'test':
        return CommitType.TEST
      case 'docs':
        return CommitType.DOCS
      case 'config':
        return CommitType.BUILD
      case 'style':
        return CommitType.STYLE
      default:
        return CommitType.FEAT
    }
  }

  /**
   * 辅助方法：检查是否包含测试文件
   */
  private hasTestFiles(files: string[]): boolean {
    return files.some(f => f.includes('test') || f.includes('spec'))
  }

  /**
   * 辅助方法：检查是否只有文档文件
   */
  private isDocumentationOnly(fileTypes: Map<string, number>): boolean {
    const docExts = ['.md', '.txt', '.rst', '.adoc']
    const totalFiles = Array.from(fileTypes.values()).reduce((a, b) => a + b, 0)
    const docFiles = docExts.reduce((sum, ext) => sum + (fileTypes.get(ext) || 0), 0)
    
    return totalFiles > 0 && totalFiles === docFiles
  }

  /**
   * 辅助方法：检查是否包含配置文件
   */
  private hasConfigFiles(files: string[]): boolean {
    const configPatterns = ['package.json', 'tsconfig', 'webpack', 'rollup', 'vite', '.config.']
    return files.some(f => configPatterns.some(p => f.includes(p)))
  }

  /**
   * 辅助方法：检查是否包含样式文件
   */
  private hasStyleFiles(fileTypes: Map<string, number>): boolean {
    const styleExts = ['.css', '.scss', '.less', '.sass', '.styl']
    return styleExts.some(ext => fileTypes.has(ext))
  }
}
