/**
 * Git 命令执行工具
 */

import { GitError, GitErrorType } from '../errors/index.js'
import type { GitOperationResult } from '../types/index.js'

/**
 * 包装 Git 操作结果
 * @param operation 操作函数
 * @returns 操作结果
 */
export async function wrapGitOperation<T>(
  operation: () => Promise<T>
): Promise<GitOperationResult<T>> {
  try {
    const data = await operation()
    return {
      success: true,
      data
    }
  } catch (error) {
    const gitError = error instanceof GitError
      ? error
      : GitError.fromError(error as Error)

    return {
      success: false,
      error: gitError.message,
      output: gitError.output
    }
  }
}

/**
 * 处理 simple-git 错误
 * @param error 原始错误
 * @param operation 操作名称
 * @returns GitError
 */
export function handleSimpleGitError(error: any, operation: string): GitError {
  const message = error.message || 'Unknown error'
  const output = error.git?.output || error.stdout || error.stderr || ''

  // 根据错误信息判断错误类型
  if (message.includes('not a git repository')) {
    return new GitError(
      GitErrorType.REPOSITORY_NOT_FOUND,
      'Not a git repository',
      error,
      output
    )
  }

  if (message.includes('already exists')) {
    return new GitError(
      GitErrorType.REPOSITORY_EXISTS,
      'Repository already exists',
      error,
      output
    )
  }

  if (message.includes('branch') && message.includes('not found')) {
    return new GitError(
      GitErrorType.BRANCH_NOT_FOUND,
      'Branch not found',
      error,
      output
    )
  }

  if (message.includes('remote') && message.includes('not found')) {
    return new GitError(
      GitErrorType.REMOTE_NOT_FOUND,
      'Remote not found',
      error,
      output
    )
  }

  if (message.includes('merge conflict') || message.includes('CONFLICT')) {
    return new GitError(
      GitErrorType.MERGE_CONFLICT,
      'Merge conflict detected',
      error,
      output
    )
  }

  if (message.includes('permission denied') || message.includes('Permission denied')) {
    return new GitError(
      GitErrorType.PERMISSION_DENIED,
      'Permission denied',
      error,
      output
    )
  }

  if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
    return new GitError(
      GitErrorType.NETWORK_ERROR,
      'Network error',
      error,
      output
    )
  }

  // 默认为命令执行失败
  return new GitError(
    GitErrorType.COMMAND_FAILED,
    `Git ${operation} failed: ${message}`,
    error,
    output
  )
}

/**
 * 格式化 Git 日志输出
 * @param logOutput 日志输出
 * @returns 格式化后的提交信息数组
 */
export function parseGitLog(logOutput: string): any[] {
  if (!logOutput || logOutput.trim().length === 0) {
    return []
  }

  const commits = []
  const lines = logOutput.split('\n')
  let currentCommit: any = {}

  for (const line of lines) {
    if (line.startsWith('commit ')) {
      if (currentCommit.hash) {
        commits.push(currentCommit)
      }
      currentCommit = {
        hash: line.replace('commit ', '').trim()
      }
    } else if (line.startsWith('Author: ')) {
      const authorMatch = line.match(/Author: (.+) <(.+)>/)
      if (authorMatch) {
        currentCommit.author_name = authorMatch[1].trim()
        currentCommit.author_email = authorMatch[2].trim()
      }
    } else if (line.startsWith('Date: ')) {
      currentCommit.date = line.replace('Date: ', '').trim()
    } else if (line.trim() && !line.startsWith(' ')) {
      // 提交消息
      if (!currentCommit.message) {
        currentCommit.message = line.trim()
      }
    }
  }

  if (currentCommit.hash) {
    commits.push(currentCommit)
  }

  return commits
}

/**
 * 解析 Git 状态输出
 * @param statusOutput 状态输出
 * @returns 解析后的状态信息
 */
export function parseGitStatus(statusOutput: any): any {
  return {
    current: statusOutput.current || null,
    tracking: statusOutput.tracking || null,
    ahead: statusOutput.ahead || 0,
    behind: statusOutput.behind || 0,
    staged: statusOutput.staged || [],
    not_added: statusOutput.not_added || [],
    modified: statusOutput.modified || [],
    deleted: statusOutput.deleted || [],
    renamed: statusOutput.renamed || [],
    conflicted: statusOutput.conflicted || [],
    created: statusOutput.created || []
  }
}

/**
 * 解析分支列表输出
 * @param branchOutput 分支输出
 * @returns 解析后的分支信息数组
 */
export function parseGitBranches(branchOutput: any): any[] {
  if (!branchOutput) {
    return []
  }

  // 处理 simple-git 的不同输出格式
  let branches: string[] = []

  if (branchOutput.all) {
    branches = branchOutput.all
  } else if (Array.isArray(branchOutput)) {
    branches = branchOutput
  } else if (branchOutput.branches) {
    branches = Object.keys(branchOutput.branches)
  }

  return branches.map((branch: string) => {
    // 清理分支名称
    const cleanName = branch.replace(/^\*\s*/, '').replace(/^remotes\//, '').trim()

    return {
      name: cleanName,
      current: branch.includes('*') || branch.startsWith('*'),
      remote: branch.includes('remotes/') || branch.includes('origin/')
    }
  })
}

/**
 * 格式化文件路径为 Git 兼容格式
 * @param filePath 文件路径
 * @returns 格式化后的路径
 */
export function formatGitPath(filePath: string): string {
  // 将 Windows 路径分隔符转换为 Unix 格式
  return filePath.replace(/\\/g, '/')
}

/**
 * 检查是否为有效的 Git 哈希
 * @param hash Git 哈希值
 * @returns 是否有效
 */
export function isValidGitHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') {
    return false
  }

  // Git 哈希值为 40 位十六进制字符（SHA-1）或 64 位（SHA-256）
  const hashPattern = /^[a-f0-9]{7,64}$/i
  return hashPattern.test(hash.trim())
}

/**
 * 检查是否为有效的 Git 引用
 * @param ref Git 引用
 * @returns 是否有效
 */
export function isValidGitRef(ref: string): boolean {
  if (!ref || typeof ref !== 'string') {
    return false
  }

  const trimmedRef = ref.trim()

  // 检查是否为哈希值
  if (isValidGitHash(trimmedRef)) {
    return true
  }

  // 检查是否为有效的分支/标签名称
  const invalidChars = /[~^:?*[\]\\]/
  if (invalidChars.test(trimmedRef)) {
    return false
  }

  if (trimmedRef.startsWith('-') || trimmedRef.endsWith('.')) {
    return false
  }

  if (trimmedRef.includes('..') || trimmedRef.includes('@{')) {
    return false
  }

  return true
}
