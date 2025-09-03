/**
 * Git 操作自定义错误类
 * 提供统一的错误处理和错误信息格式化
 */

/**
 * Git 错误类型枚举
 */
export enum GitErrorType {
  /** 仓库不存在 */
  REPOSITORY_NOT_FOUND = 'REPOSITORY_NOT_FOUND',
  /** 仓库已存在 */
  REPOSITORY_EXISTS = 'REPOSITORY_EXISTS',
  /** 分支不存在 */
  BRANCH_NOT_FOUND = 'BRANCH_NOT_FOUND',
  /** 分支已存在 */
  BRANCH_EXISTS = 'BRANCH_EXISTS',
  /** 远程仓库不存在 */
  REMOTE_NOT_FOUND = 'REMOTE_NOT_FOUND',
  /** 远程仓库已存在 */
  REMOTE_EXISTS = 'REMOTE_EXISTS',
  /** 提交失败 */
  COMMIT_FAILED = 'COMMIT_FAILED',
  /** 推送失败 */
  PUSH_FAILED = 'PUSH_FAILED',
  /** 拉取失败 */
  PULL_FAILED = 'PULL_FAILED',
  /** 克隆失败 */
  CLONE_FAILED = 'CLONE_FAILED',
  /** 合并冲突 */
  MERGE_CONFLICT = 'MERGE_CONFLICT',
  /** 权限不足 */
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  /** 网络错误 */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** 配置错误 */
  CONFIG_ERROR = 'CONFIG_ERROR',
  /** 命令执行失败 */
  COMMAND_FAILED = 'COMMAND_FAILED',
  /** 参数无效 */
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  /** 操作超时 */
  TIMEOUT = 'TIMEOUT',
  /** 未知错误 */
  UNKNOWN = 'UNKNOWN'
}

/**
 * Git 自定义错误类
 */
export class GitError extends Error {
  /** 错误类型 */
  public readonly type: GitErrorType
  /** 错误代码 */
  public readonly code: string
  /** 原始错误 */
  public readonly originalError?: Error
  /** 命令输出 */
  public readonly output?: string
  /** 错误发生时间 */
  public readonly timestamp: Date

  /**
   * 构造函数
   * @param type 错误类型
   * @param message 错误消息
   * @param originalError 原始错误
   * @param output 命令输出
   */
  constructor(
    type: GitErrorType,
    message: string,
    originalError?: Error,
    output?: string
  ) {
    super(message)
    
    this.name = 'GitError'
    this.type = type
    this.code = type
    this.originalError = originalError
    this.output = output
    this.timestamp = new Date()

    // 确保错误堆栈正确显示
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GitError)
    }
  }

  /**
   * 获取格式化的错误信息
   */
  public getFormattedMessage(): string {
    const parts = [
      `[${this.type}] ${this.message}`
    ]

    if (this.output) {
      parts.push(`Output: ${this.output}`)
    }

    if (this.originalError) {
      parts.push(`Original Error: ${this.originalError.message}`)
    }

    return parts.join('\n')
  }

  /**
   * 转换为 JSON 格式
   */
  public toJSON(): object {
    return {
      name: this.name,
      type: this.type,
      code: this.code,
      message: this.message,
      output: this.output,
      timestamp: this.timestamp.toISOString(),
      originalError: this.originalError ? {
        name: this.originalError.name,
        message: this.originalError.message,
        stack: this.originalError.stack
      } : undefined
    }
  }

  /**
   * 创建仓库不存在错误
   */
  static repositoryNotFound(path: string, originalError?: Error): GitError {
    return new GitError(
      GitErrorType.REPOSITORY_NOT_FOUND,
      `Git repository not found at path: ${path}`,
      originalError
    )
  }

  /**
   * 创建仓库已存在错误
   */
  static repositoryExists(path: string): GitError {
    return new GitError(
      GitErrorType.REPOSITORY_EXISTS,
      `Git repository already exists at path: ${path}`
    )
  }

  /**
   * 创建分支不存在错误
   */
  static branchNotFound(branchName: string): GitError {
    return new GitError(
      GitErrorType.BRANCH_NOT_FOUND,
      `Branch '${branchName}' not found`
    )
  }

  /**
   * 创建分支已存在错误
   */
  static branchExists(branchName: string): GitError {
    return new GitError(
      GitErrorType.BRANCH_EXISTS,
      `Branch '${branchName}' already exists`
    )
  }

  /**
   * 创建远程仓库不存在错误
   */
  static remoteNotFound(remoteName: string): GitError {
    return new GitError(
      GitErrorType.REMOTE_NOT_FOUND,
      `Remote '${remoteName}' not found`
    )
  }

  /**
   * 创建命令执行失败错误
   */
  static commandFailed(command: string, output: string, originalError?: Error): GitError {
    return new GitError(
      GitErrorType.COMMAND_FAILED,
      `Git command failed: ${command}`,
      originalError,
      output
    )
  }

  /**
   * 创建网络错误
   */
  static networkError(message: string, originalError?: Error): GitError {
    return new GitError(
      GitErrorType.NETWORK_ERROR,
      `Network error: ${message}`,
      originalError
    )
  }

  /**
   * 创建权限错误
   */
  static permissionDenied(operation: string, path?: string): GitError {
    const message = path 
      ? `Permission denied for ${operation} at path: ${path}`
      : `Permission denied for ${operation}`
    
    return new GitError(
      GitErrorType.PERMISSION_DENIED,
      message
    )
  }

  /**
   * 创建合并冲突错误
   */
  static mergeConflict(conflictedFiles: string[]): GitError {
    return new GitError(
      GitErrorType.MERGE_CONFLICT,
      `Merge conflict in files: ${conflictedFiles.join(', ')}`
    )
  }

  /**
   * 创建参数无效错误
   */
  static invalidArgument(argumentName: string, value: any): GitError {
    return new GitError(
      GitErrorType.INVALID_ARGUMENT,
      `Invalid argument '${argumentName}': ${value}`
    )
  }

  /**
   * 创建操作超时错误
   */
  static timeout(operation: string, timeoutMs: number): GitError {
    return new GitError(
      GitErrorType.TIMEOUT,
      `Operation '${operation}' timed out after ${timeoutMs}ms`
    )
  }

  /**
   * 从原始错误创建 GitError
   */
  static fromError(error: Error, type: GitErrorType = GitErrorType.UNKNOWN): GitError {
    return new GitError(
      type,
      error.message,
      error
    )
  }
}
