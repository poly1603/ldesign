/**
 * AI 辅助提交信息生成
 * 根据代码变更自动生成规范的提交信息
 */

import chalk from 'chalk'
import ora from 'ora'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

/**
 * 提交类型映射
 */
const COMMIT_TYPES = {
  feat: { emoji: '✨', description: '新功能' },
  fix: { emoji: '🐛', description: '修复bug' },
  docs: { emoji: '📝', description: '文档更新' },
  style: { emoji: '💄', description: '代码格式（不影响功能）' },
  refactor: { emoji: '♻️', description: '重构（不影响功能）' },
  perf: { emoji: '⚡', description: '性能优化' },
  test: { emoji: '✅', description: '测试相关' },
  build: { emoji: '📦', description: '构建系统或依赖更新' },
  ci: { emoji: '👷', description: 'CI配置' },
  chore: { emoji: '🔧', description: '其他杂项' },
  revert: { emoji: '⏪', description: '回滚提交' }
}

/**
 * 文件类型规则
 */
const FILE_PATTERNS = {
  docs: /\.(md|txt|doc|docx|pdf)$/i,
  test: /\.(test|spec)\.(js|ts|jsx|tsx)$/i,
  style: /\.(css|scss|sass|less|styl)$/i,
  config: /\.(json|yaml|yml|toml|ini|conf|config\.(js|ts))$/i,
  build: /(webpack|rollup|vite|gulp|grunt|package\.json|tsconfig\.json)$/i,
  ci: /\.(github|gitlab|travis|circle|jenkins|drone)/i
}

/**
 * AI 提交助手类
 */
export class AICommitHelper {
  private spinner?: ora.Ora

  /**
   * 生成智能提交信息
   */
  async generateCommitMessage(options: {
    files?: string[]
    interactive?: boolean
    useEmoji?: boolean
    language?: 'en' | 'zh'
  } = {}): Promise<string> {
    this.spinner = ora('分析代码变更...').start()

    try {
      // 获取变更信息
      const changes = await this.analyzeChanges(options.files)
      
      // 推断提交类型
      const type = this.inferCommitType(changes)
      
      // 生成提交范围
      const scope = this.inferScope(changes)
      
      // 生成提交描述
      const description = await this.generateDescription(changes, options.language || 'zh')
      
      // 生成详细说明
      const body = await this.generateBody(changes, options.language || 'zh')
      
      // 检测破坏性变更
      const breaking = this.detectBreakingChanges(changes)

      this.spinner.succeed('提交信息生成完成!')

      // 构建提交信息
      return this.buildCommitMessage({
        type,
        scope,
        description,
        body,
        breaking,
        useEmoji: options.useEmoji !== false
      })

    } catch (error) {
      this.spinner?.fail('生成失败')
      console.error(chalk.red('错误:'), error)
      throw error
    }
  }

  /**
   * 分析代码变更
   */
  private async analyzeChanges(files?: string[]): Promise<any> {
    const changes = {
      files: [] as any[],
      additions: 0,
      deletions: 0,
      modified: [] as string[],
      added: [] as string[],
      deleted: [] as string[],
      renamed: [] as string[],
      patterns: {} as Record<string, number>
    }

    try {
      // 获取变更文件列表
      const { stdout: diffStat } = await execAsync('git diff --cached --stat')
      const { stdout: diffNameStatus } = await execAsync('git diff --cached --name-status')
      
      // 解析文件状态
      diffNameStatus.split('\n').forEach(line => {
        const [status, ...pathParts] = line.split('\t')
        const path = pathParts.join('\t')
        
        if (!path) return
        
        switch (status) {
          case 'A':
            changes.added.push(path)
            break
          case 'M':
            changes.modified.push(path)
            break
          case 'D':
            changes.deleted.push(path)
            break
          case 'R':
            changes.renamed.push(path)
            break
        }
        
        // 分析文件模式
        for (const [pattern, regex] of Object.entries(FILE_PATTERNS)) {
          if (regex.test(path)) {
            changes.patterns[pattern] = (changes.patterns[pattern] || 0) + 1
          }
        }
      })

      // 获取详细变更
      if (files && files.length > 0) {
        for (const file of files) {
          try {
            const { stdout: diff } = await execAsync(`git diff --cached ${file}`)
            const lines = diff.split('\n')
            
            let additions = 0
            let deletions = 0
            let functions = new Set<string>()
            
            lines.forEach(line => {
              if (line.startsWith('+') && !line.startsWith('+++')) {
                additions++
                // 检测函数变更
                const funcMatch = line.match(/^\+\s*(function|class|const|let|var|export)\s+(\w+)/)
                if (funcMatch) {
                  functions.add(funcMatch[2])
                }
              } else if (line.startsWith('-') && !line.startsWith('---')) {
                deletions++
              }
            })
            
            changes.files.push({
              path: file,
              additions,
              deletions,
              functions: Array.from(functions)
            })
            
            changes.additions += additions
            changes.deletions += deletions
          } catch (error) {
            // 忽略单个文件的错误
          }
        }
      }

      // 分析整体统计
      const statMatch = diffStat.match(/(\d+) insertions?\(\+\).*?(\d+) deletions?\(-\)/)
      if (statMatch) {
        changes.additions = parseInt(statMatch[1])
        changes.deletions = parseInt(statMatch[2])
      }

    } catch (error) {
      console.warn('无法完全分析变更:', error)
    }

    return changes
  }

  /**
   * 推断提交类型
   */
  private inferCommitType(changes: any): string {
    // 基于文件模式推断
    const patterns = changes.patterns
    
    if (patterns.test > 0) return 'test'
    if (patterns.docs > 0 && Object.keys(patterns).length === 1) return 'docs'
    if (patterns.style > 0 && Object.keys(patterns).length === 1) return 'style'
    if (patterns.config > 0) return 'chore'
    if (patterns.build > 0) return 'build'
    if (patterns.ci > 0) return 'ci'
    
    // 基于变更类型推断
    if (changes.deleted.length > changes.added.length) return 'refactor'
    if (changes.added.length > 0 && changes.modified.length === 0) return 'feat'
    if (changes.modified.length > 0 && changes.additions < 50) return 'fix'
    if (changes.additions > 200) return 'feat'
    
    // 默认
    return 'chore'
  }

  /**
   * 推断提交范围
   */
  private inferScope(changes: any): string | undefined {
    const allFiles = [...changes.added, ...changes.modified, ...changes.deleted]
    
    if (allFiles.length === 0) return undefined
    
    // 找出共同目录
    const directories = allFiles.map(file => {
      const parts = file.split('/')
      return parts.length > 1 ? parts[0] : undefined
    }).filter(Boolean)
    
    // 统计最常见的目录
    const dirCount = directories.reduce((acc: any, dir: any) => {
      acc[dir] = (acc[dir] || 0) + 1
      return acc
    }, {})
    
    const sortedDirs = (Object.entries(dirCount) as Array<[string, number]>)
      .sort((a, b) => b[1] - a[1])
    
    if (sortedDirs.length > 0 && sortedDirs[0][1] > allFiles.length * 0.5) {
      return sortedDirs[0][0]
    }
    
    // 检查特定模块
    const modulePatterns = {
      api: /api|controller|route/i,
      ui: /component|view|page/i,
      db: /model|schema|migration/i,
      utils: /util|helper|tool/i,
      core: /core|engine|service/i
    }
    
    for (const [module, pattern] of Object.entries(modulePatterns)) {
      if (allFiles.some(file => pattern.test(file))) {
        return module
      }
    }
    
    return undefined
  }

  /**
   * 生成提交描述
   */
  private async generateDescription(changes: any, language: string): Promise<string> {
    const fileCount = changes.added.length + changes.modified.length + changes.deleted.length
    
    if (language === 'zh') {
      // 中文描述
      if (changes.added.length > 0 && changes.modified.length === 0) {
        const mainFile = this.getMainFile(changes.added)
        return `添加${this.describeFile(mainFile)}`
      }
      
      if (changes.modified.length === 1 && changes.added.length === 0) {
        return `更新${this.describeFile(changes.modified[0])}`
      }
      
      if (changes.deleted.length > 0 && changes.added.length === 0 && changes.modified.length === 0) {
        return `删除${changes.deleted.length}个文件`
      }
      
      if (fileCount > 5) {
        return `更新${fileCount}个文件，优化代码结构`
      }
      
      if (changes.additions > 100) {
        return `实现新功能模块`
      }
      
      if (changes.deletions > changes.additions) {
        return `重构代码，优化性能`
      }
      
      return `更新${fileCount}个文件`
      
    } else {
      // 英文描述
      if (changes.added.length > 0 && changes.modified.length === 0) {
        const mainFile = this.getMainFile(changes.added)
        return `Add ${this.describeFile(mainFile)}`
      }
      
      if (changes.modified.length === 1 && changes.added.length === 0) {
        return `Update ${this.describeFile(changes.modified[0])}`
      }
      
      if (changes.deleted.length > 0 && changes.added.length === 0 && changes.modified.length === 0) {
        return `Remove ${changes.deleted.length} files`
      }
      
      if (fileCount > 5) {
        return `Update ${fileCount} files and optimize code structure`
      }
      
      if (changes.additions > 100) {
        return `Implement new feature module`
      }
      
      if (changes.deletions > changes.additions) {
        return `Refactor code and optimize performance`
      }
      
      return `Update ${fileCount} files`
    }
  }

  /**
   * 生成详细说明
   */
  private async generateBody(changes: any, language: string): Promise<string | undefined> {
    const details: string[] = []
    
    if (language === 'zh') {
      // 新增文件
      if (changes.added.length > 0) {
        details.push(`新增文件:`)
        changes.added.slice(0, 5).forEach((file: string) => {
          details.push(`  - ${file}`)
        })
        if (changes.added.length > 5) {
          details.push(`  ... 还有 ${changes.added.length - 5} 个文件`)
        }
      }
      
      // 修改文件
      if (changes.modified.length > 0) {
        details.push(`修改文件:`)
        changes.modified.slice(0, 5).forEach((file: string) => {
          details.push(`  - ${file}`)
        })
        if (changes.modified.length > 5) {
          details.push(`  ... 还有 ${changes.modified.length - 5} 个文件`)
        }
      }
      
      // 删除文件
      if (changes.deleted.length > 0) {
        details.push(`删除文件:`)
        changes.deleted.slice(0, 5).forEach((file: string) => {
          details.push(`  - ${file}`)
        })
        if (changes.deleted.length > 5) {
          details.push(`  ... 还有 ${changes.deleted.length - 5} 个文件`)
        }
      }
      
      // 统计信息
      if (changes.additions > 0 || changes.deletions > 0) {
        details.push('')
        details.push(`变更统计: +${changes.additions} -${changes.deletions}`)
      }
      
    } else {
      // 英文详细说明
      if (changes.added.length > 0) {
        details.push(`Added files:`)
        changes.added.slice(0, 5).forEach((file: string) => {
          details.push(`  - ${file}`)
        })
        if (changes.added.length > 5) {
          details.push(`  ... and ${changes.added.length - 5} more files`)
        }
      }
      
      if (changes.modified.length > 0) {
        details.push(`Modified files:`)
        changes.modified.slice(0, 5).forEach((file: string) => {
          details.push(`  - ${file}`)
        })
        if (changes.modified.length > 5) {
          details.push(`  ... and ${changes.modified.length - 5} more files`)
        }
      }
      
      if (changes.deleted.length > 0) {
        details.push(`Deleted files:`)
        changes.deleted.slice(0, 5).forEach((file: string) => {
          details.push(`  - ${file}`)
        })
        if (changes.deleted.length > 5) {
          details.push(`  ... and ${changes.deleted.length - 5} more files`)
        }
      }
      
      if (changes.additions > 0 || changes.deletions > 0) {
        details.push('')
        details.push(`Changes: +${changes.additions} -${changes.deletions}`)
      }
    }
    
    return details.length > 0 ? details.join('\n') : undefined
  }

  /**
   * 检测破坏性变更
   */
  private detectBreakingChanges(changes: any): boolean {
    // 检查是否删除了公共API
    const publicApiDeleted = changes.deleted.some((file: string) => 
      /^(src|lib)\/(api|public|export)/i.test(file)
    )
    
    // 检查是否重命名了重要文件
    const importantRenamed = changes.renamed.some((file: string) =>
      /^(index|main|app|config)\.(js|ts|jsx|tsx)$/i.test(file)
    )
    
    // 检查是否有大量删除
    const massiveDeletion = changes.deletions > 500
    
    return publicApiDeleted || importantRenamed || massiveDeletion
  }

  /**
   * 构建提交信息
   */
  private buildCommitMessage(params: {
    type: string
    scope?: string
    description: string
    body?: string
    breaking: boolean
    useEmoji: boolean
  }): string {
    const { type, scope, description, body, breaking, useEmoji } = params
    
    let message = ''
    
    // 添加emoji
    if (useEmoji && COMMIT_TYPES[type as keyof typeof COMMIT_TYPES]) {
      message += COMMIT_TYPES[type as keyof typeof COMMIT_TYPES].emoji + ' '
    }
    
    // 添加类型
    message += type
    
    // 添加范围
    if (scope) {
      message += `(${scope})`
    }
    
    // 添加描述
    message += `: ${description}`
    
    // 添加正文
    if (body) {
      message += `\n\n${body}`
    }
    
    // 添加破坏性变更标记
    if (breaking) {
      message += '\n\nBREAKING CHANGE: 此次提交包含破坏性变更'
    }
    
    return message
  }

  /**
   * 辅助方法：获取主要文件
   */
  private getMainFile(files: string[]): string {
    if (files.length === 0) return 'files'
    
    // 优先返回重要文件
    const importantFiles = ['index', 'main', 'app', 'README']
    for (const important of importantFiles) {
      const found = files.find(file => file.includes(important))
      if (found) return found
    }
    
    return files[0]
  }

  /**
   * 辅助方法：描述文件
   */
  private describeFile(file: string): string {
    if (!file) return '文件'
    
    const filename = file.split('/').pop() || file
    const ext = filename.split('.').pop()
    
    const descriptions: Record<string, string> = {
      md: '文档',
      ts: 'TypeScript文件',
      js: 'JavaScript文件',
      json: '配置文件',
      css: '样式文件',
      html: 'HTML文件',
      vue: 'Vue组件',
      jsx: 'React组件',
      tsx: 'React组件',
      test: '测试文件',
      spec: '测试文件'
    }
    
    return descriptions[ext || ''] || filename
  }

  /**
   * 交互式生成提交信息
   */
  async interactiveGenerate(): Promise<string> {
    const inquirer = (await import('inquirer')).default
    
    // 分析变更
    const changes = await this.analyzeChanges()
    
    // 推荐的提交类型
    const suggestedType = this.inferCommitType(changes)
    const suggestedScope = this.inferScope(changes)
    
    // 交互式询问
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '选择提交类型:',
        default: suggestedType,
        choices: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
          name: `${value.emoji} ${key}: ${value.description}`,
          value: key
        }))
      },
      {
        type: 'input',
        name: 'scope',
        message: '输入影响范围 (可选):',
        default: suggestedScope
      },
      {
        type: 'input',
        name: 'description',
        message: '简短描述:',
        default: await this.generateDescription(changes, 'zh'),
        validate: (input: string) => input.length > 0 || '描述不能为空'
      },
      {
        type: 'editor',
        name: 'body',
        message: '详细说明 (可选):',
        default: await this.generateBody(changes, 'zh')
      },
      {
        type: 'confirm',
        name: 'breaking',
        message: '是否包含破坏性变更?',
        default: this.detectBreakingChanges(changes)
      },
      {
        type: 'confirm',
        name: 'useEmoji',
        message: '是否使用emoji?',
        default: true
      }
    ])
    
    return this.buildCommitMessage(answers)
  }
}
