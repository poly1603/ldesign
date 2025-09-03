import { GitOperationResult } from '../types/index.js'

// 前向声明 Git 类型，避免循环依赖
interface Git {
  getStatus(): Promise<any>
  repository: {
    executeGitCommand(args: string[]): Promise<any>
  }
  add(files: string | string[]): Promise<any>
}

/**
 * 冲突文件信息
 */
export interface ConflictFile {
  path: string
  status: 'both_modified' | 'added_by_us' | 'added_by_them' | 'deleted_by_us' | 'deleted_by_them'
  conflictMarkers: boolean
}

/**
 * 冲突解决选项
 */
export interface ConflictResolutionOptions {
  strategy?: 'ours' | 'theirs' | 'manual'
  files?: string[]
  autoResolve?: boolean
}

/**
 * 冲突解决结果
 */
export interface ConflictResolutionResult {
  resolved: boolean
  conflictFiles: ConflictFile[]
  unresolvedFiles: string[]
  strategy: string
  message: string
}

/**
 * Git 冲突解决器
 * 提供智能的冲突检测和解决功能
 */
export class ConflictResolver {
  private git: Git

  constructor(git: Git) {
    this.git = git
  }

  /**
   * 检测是否存在合并冲突
   * @returns 是否有冲突
   */
  async hasConflicts(): Promise<boolean> {
    try {
      const status = await this.git.getStatus()
      return status.success && (status.data?.conflicted?.length || 0) > 0
    } catch (error) {
      return false
    }
  }

  /**
   * 获取冲突文件列表
   * @returns 冲突文件信息
   */
  async getConflictFiles(): Promise<GitOperationResult<ConflictFile[]>> {
    try {
      const status = await this.git.getStatus()

      if (!status.success || !status.data) {
        return {
          success: false,
          error: '无法获取仓库状态'
        }
      }

      const conflictFiles: ConflictFile[] = []

      // 检查冲突文件
      for (const file of status.data.conflicted || []) {
        const conflictInfo = await this.analyzeConflictFile(file)
        conflictFiles.push(conflictInfo)
      }

      return {
        success: true,
        data: conflictFiles
      }
    } catch (error: any) {
      return {
        success: false,
        error: `获取冲突文件失败: ${error?.message || error}`
      }
    }
  }

  /**
   * 分析单个冲突文件
   * @param filePath - 文件路径
   * @returns 冲突文件信息
   */
  private async analyzeConflictFile(filePath: string): Promise<ConflictFile> {
    try {
      // 检查文件是否包含冲突标记
      const fs = await import('fs/promises')
      const content = await fs.readFile(filePath, 'utf-8')
      const hasConflictMarkers = /^<{7}|^={7}|^>{7}/m.test(content)

      return {
        path: filePath,
        status: 'both_modified', // 简化处理，实际可以更详细分析
        conflictMarkers: hasConflictMarkers
      }
    } catch (error: any) {
      return {
        path: filePath,
        status: 'both_modified',
        conflictMarkers: false
      }
    }
  }

  /**
   * 自动解决冲突
   * @param options - 解决选项
   * @returns 解决结果
   */
  async resolveConflicts(options: ConflictResolutionOptions = {}): Promise<ConflictResolutionResult> {
    try {
      const conflictFiles = await this.getConflictFiles()

      if (!conflictFiles.success || !conflictFiles.data) {
        return {
          resolved: false,
          conflictFiles: [],
          unresolvedFiles: [],
          strategy: 'none',
          message: '无法获取冲突文件信息'
        }
      }

      if (conflictFiles.data.length === 0) {
        return {
          resolved: true,
          conflictFiles: [],
          unresolvedFiles: [],
          strategy: 'none',
          message: '没有冲突需要解决'
        }
      }

      const { strategy = 'manual', files, autoResolve = false } = options

      // 根据策略解决冲突
      switch (strategy) {
        case 'ours':
          await this.resolveWithStrategy('ours', files)
          break
        case 'theirs':
          await this.resolveWithStrategy('theirs', files)
          break
        case 'manual':
          if (!autoResolve) {
            // 手动解决，返回冲突信息供用户处理
            return {
              resolved: false,
              conflictFiles: conflictFiles.data,
              unresolvedFiles: conflictFiles.data.map(f => f.path),
              strategy: 'manual',
              message: '需要手动解决冲突'
            }
          }
          break
      }

      // 检查是否还有未解决的冲突
      const remainingConflicts = await this.getConflictFiles()
      const hasRemaining = remainingConflicts.success &&
        (remainingConflicts.data?.length || 0) > 0

      return {
        resolved: !hasRemaining,
        conflictFiles: conflictFiles.data,
        unresolvedFiles: hasRemaining ?
          (remainingConflicts.data?.map(f => f.path) || []) : [],
        strategy,
        message: hasRemaining ? '部分冲突未解决' : '所有冲突已解决'
      }
    } catch (error: any) {
      return {
        resolved: false,
        conflictFiles: [],
        unresolvedFiles: [],
        strategy: 'error',
        message: `解决冲突失败: ${error?.message || error}`
      }
    }
  }

  /**
   * 使用指定策略解决冲突
   * @param strategy - 解决策略
   * @param files - 指定文件列表
   */
  private async resolveWithStrategy(strategy: 'ours' | 'theirs', files?: string[]): Promise<void> {
    const conflictFiles = await this.getConflictFiles()

    if (!conflictFiles.success || !conflictFiles.data) {
      throw new Error('无法获取冲突文件')
    }

    const targetFiles = files || conflictFiles.data.map(f => f.path)

    for (const file of targetFiles) {
      try {
        if (strategy === 'ours') {
          await this.git.repository.executeGitCommand(['checkout', '--ours', file])
        } else {
          await this.git.repository.executeGitCommand(['checkout', '--theirs', file])
        }

        // 添加已解决的文件
        await this.git.add(file)
      } catch (error: any) {
        console.warn(`解决文件 ${file} 冲突失败:`, error?.message || error)
      }
    }
  }

  /**
   * 获取冲突解决建议
   * @param conflictFiles - 冲突文件列表
   * @returns 解决建议
   */
  getResolutionSuggestions(conflictFiles: ConflictFile[]): string[] {
    const suggestions: string[] = []

    if (conflictFiles.length === 0) {
      return ['没有冲突需要解决']
    }

    suggestions.push('🔍 检测到以下冲突文件:')
    conflictFiles.forEach(file => {
      suggestions.push(`  - ${file.path} (${file.status})`)
    })

    suggestions.push('')
    suggestions.push('💡 解决建议:')
    suggestions.push('1. 手动编辑冲突文件，解决冲突标记 (<<<<<<<, =======, >>>>>>>)')
    suggestions.push('2. 或使用以下策略自动解决:')
    suggestions.push('   - 保留本地更改: ldesign-git resolve --ours')
    suggestions.push('   - 保留远程更改: ldesign-git resolve --theirs')
    suggestions.push('3. 解决后使用: ldesign-git add <文件> 标记为已解决')
    suggestions.push('4. 最后执行: ldesign-git commit 完成合并')

    return suggestions
  }

  /**
   * 显示冲突文件的详细信息
   * @param filePath - 文件路径
   * @returns 冲突详情
   */
  async showConflictDetails(filePath: string): Promise<GitOperationResult<string>> {
    try {
      const fs = await import('fs/promises')
      const content = await fs.readFile(filePath, 'utf-8')

      // 提取冲突部分
      const conflictSections = this.extractConflictSections(content)

      return {
        success: true,
        data: conflictSections,
        output: content
      }
    } catch (error: any) {
      return {
        success: false,
        error: `读取文件失败: ${error?.message || error}`
      }
    }
  }

  /**
   * 提取冲突部分
   * @param content - 文件内容
   * @returns 冲突部分信息
   */
  private extractConflictSections(content: string): string {
    const lines = content.split('\n')
    const conflicts: string[] = []
    let inConflict = false
    let conflictSection: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.startsWith('<<<<<<<')) {
        inConflict = true
        conflictSection = [line]
      } else if (line.startsWith('>>>>>>>') && inConflict) {
        conflictSection.push(line)
        conflicts.push(`冲突 ${conflicts.length + 1} (行 ${i - conflictSection.length + 2}-${i + 1}):\n${conflictSection.join('\n')}`)
        inConflict = false
        conflictSection = []
      } else if (inConflict) {
        conflictSection.push(line)
      }
    }

    return conflicts.length > 0 ? conflicts.join('\n\n') : '未找到冲突标记'
  }

  /**
   * 中止合并操作
   * @returns 操作结果
   */
  async abortMerge(): Promise<GitOperationResult<void>> {
    try {
      const result = await this.git.repository.executeGitCommand(['merge', '--abort'])
      return result
    } catch (error: any) {
      return {
        success: false,
        error: `中止合并失败: ${error?.message || error}`
      }
    }
  }

  /**
   * 继续合并操作
   * @returns 操作结果
   */
  async continueMerge(): Promise<GitOperationResult<void>> {
    try {
      // 检查是否还有未解决的冲突
      const hasConflicts = await this.hasConflicts()
      if (hasConflicts) {
        return {
          success: false,
          error: '仍有未解决的冲突，无法继续合并'
        }
      }

      const result = await this.git.repository.executeGitCommand(['commit', '--no-edit'])
      return result
    } catch (error: any) {
      return {
        success: false,
        error: `继续合并失败: ${error?.message || error}`
      }
    }
  }
}
