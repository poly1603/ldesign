/**
 * Git 操作相关的类型定义
 */

import { SimpleGit } from 'simple-git'

// 导出补充的类型定义
export * from './git-types'

/**
 * Git 仓库配置选项
 */
export interface GitRepositoryOptions {
  /** 仓库路径 */
  baseDir?: string
  /** Git 可执行文件路径 */
  binary?: string
  /** 最大并发数 */
  maxConcurrentProcesses?: number
  /** 超时时间（毫秒） */
  timeout?: number
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * Git 提交信息
 */
export interface GitCommitInfo {
  /** 提交哈希 */
  hash: string
  /** 提交日期 */
  date: string
  /** 提交消息 */
  message: string
  /** 作者名称 */
  author_name: string
  /** 作者邮箱 */
  author_email: string
  /** 提交者名称 */
  committer_name?: string
  /** 提交者邮箱 */
  committer_email?: string
  /** 修改的文件列表 */
  files?: string[]
}

/**
 * Git 分支信息
 */
export interface GitBranchInfo {
  /** 分支名称 */
  name: string
  /** 是否为当前分支 */
  current: boolean
  /** 是否为远程分支 */
  remote: boolean
  /** 最后提交哈希 */
  commit?: string
  /** 最后提交消息 */
  label?: string
}

/**
 * Git 状态信息
 */
export interface GitStatusInfo {
  /** 当前分支 */
  current: string | null
  /** 跟踪的分支 */
  tracking: string | null
  /** 领先的提交数 */
  ahead: number
  /** 落后的提交数 */
  behind: number
  /** 已暂存的文件 */
  staged: string[]
  /** 未暂存的文件 */
  not_added: string[]
  /** 已修改的文件 */
  modified: string[]
  /** 已删除的文件 */
  deleted: string[]
  /** 重命名的文件 */
  renamed: Array<{ from: string; to: string }>
  /** 冲突的文件 */
  conflicted: string[]
  /** 新增的文件 */
  created: string[]
}

/**
 * Git 远程仓库信息
 */
export interface GitRemoteInfo {
  /** 远程仓库名称 */
  name: string
  /** 远程仓库 URL */
  refs: {
    fetch: string
    push: string
  }
}

/**
 * Git 差异信息
 */
export interface GitDiffInfo {
  /** 文件路径 */
  file: string
  /** 变更类型 */
  changes: number
  /** 新增行数 */
  insertions: number
  /** 删除行数 */
  deletions: number
  /** 是否为二进制文件 */
  binary: boolean
}

/**
 * Git 标签信息
 */
export interface GitTagInfo {
  /** 标签名称 */
  name: string
  /** 标签哈希 */
  hash: string
  /** 标签日期 */
  date: string
  /** 标签消息 */
  message: string
  /** 关联的提交 */
  commit: string
}

/**
 * Git 克隆选项
 */
export interface GitCloneOptions {
  /** 目标目录 */
  targetDir?: string
  /** 克隆深度 */
  depth?: number
  /** 指定分支 */
  branch?: string
  /** 是否为单分支克隆 */
  singleBranch?: boolean
  /** 是否递归克隆子模块 */
  recursive?: boolean
}

/**
 * Git 推送选项
 */
export interface GitPushOptions {
  /** 远程仓库名称 */
  remote?: string
  /** 分支名称 */
  branch?: string
  /** 是否强制推送 */
  force?: boolean
  /** 是否设置上游分支 */
  setUpstream?: boolean
  /** 推送标签 */
  tags?: boolean
}

/**
 * Git 拉取选项
 */
export interface GitPullOptions {
  /** 远程仓库名称 */
  remote?: string
  /** 分支名称 */
  branch?: string
  /** 是否使用 rebase */
  rebase?: boolean
  /** 是否强制拉取 */
  force?: boolean
}

/**
 * Git 日志查询选项
 */
export interface GitLogOptions {
  /** 最大条数 */
  maxCount?: number
  /** 起始提交 */
  from?: string
  /** 结束提交 */
  to?: string
  /** 文件路径过滤 */
  file?: string
  /** 作者过滤 */
  author?: string
  /** 日期范围 */
  since?: string
  /** 日期范围 */
  until?: string
  /** 是否包含合并提交 */
  merges?: boolean
  /** 格式化选项 */
  format?: {
    hash: string
    date: string
    message: string
    author_name: string
    author_email: string
  }
}

/**
 * Git 操作结果
 */
export interface GitOperationResult<T = any> {
  /** 操作是否成功 */
  success: boolean
  /** 返回数据 */
  data?: T
  /** 错误信息 */
  error?: string
  /** 命令输出 */
  output?: string
}

/**
 * Git 实例类型
 */
export type GitInstance = SimpleGit

/**
 * Git 事件类型
 */
export type GitEventType =
  | 'init'
  | 'clone'
  | 'add'
  | 'commit'
  | 'push'
  | 'pull'
  | 'checkout'
  | 'branch'
  | 'merge'
  | 'tag'
  | 'status'
  | 'log'
  | 'diff'
  | 'show'
  | 'remote'
  | 'error'

/**
 * Git 事件监听器
 */
export interface GitEventListener {
  (event: GitEventType, data?: any): void
}

/**
 * Git 配置项
 */
export interface GitConfigItem {
  /** 配置键 */
  key: string
  /** 配置值 */
  value: string
  /** 配置作用域 */
  scope?: 'local' | 'global' | 'system'
}
