/**
 * 补充的 Git 类型定义
 */

export interface GitStatus {
  branch: string
  upstream?: string
  ahead: number
  behind: number
  staged: string[]
  modified: string[]
  deleted: string[]
  renamed: string[]
  untracked: string[]
  conflicted: string[]
}

export interface GitCommit {
  hash: string
  author: string
  email?: string
  date: Date
  message?: string
  subject?: string
  body?: string
  files?: string[]
  stats?: {
    additions: number
    deletions: number
  }
}

export interface GitBranch {
  name: string
  current?: boolean
  remote?: boolean
  upstream?: string
  lastCommit?: string
}

export interface GitRemote {
  name: string
  url?: string
  fetchUrl?: string
  pushUrl?: string
  type?: 'fetch' | 'push'
}

export interface GitConfig {
  user?: {
    name?: string
    email?: string
  }
  core?: {
    editor?: string
    autocrlf?: boolean | 'input'
  }
  [key: string]: any
}

export interface GitFileStatus {
  path: string
  status: 'added' | 'modified' | 'deleted' | 'renamed' | 'untracked' | 'conflicted'
  staged: boolean
}

export interface GitDiffOptions {
  cached?: boolean
  nameOnly?: boolean
  stat?: boolean
  numstat?: boolean
  color?: boolean
  noColor?: boolean
  base?: string
  head?: string
  paths?: string[]
}

export interface GitMergeOptions {
  noCommit?: boolean
  noFf?: boolean
  ffOnly?: boolean
  squash?: boolean
  strategy?: string
  message?: string
}

export interface GitStash {
  id: string
  branch: string
  message: string
  date: Date
}

export interface SyncOptions {
  remote?: string
  branch?: string
  rebase?: boolean
  force?: boolean
  stash?: boolean
  tags?: boolean
  prune?: boolean
  depth?: number
  autoMerge?: boolean
  strategy?: 'merge' | 'rebase' | 'fast-forward'
}

export interface ConflictResolution {
  file: string
  resolution: 'ours' | 'theirs' | 'manual'
  content?: string
}

export interface GitCredentials {
  username?: string
  password?: string
  token?: string
  sshKey?: string
  sshPassphrase?: string
}

// Public API result types
export interface BranchCompareResult {
  baseBranch: string
  compareBranch: string
  diff: string
  hasChanges: boolean
}

export interface GitStatsFile {
  file: string
  additions: number
  deletions: number
}

export interface GitStatsSummary {
  filesChanged: number
  insertions: number
  deletions: number
}

export interface GitStatsResult {
  fromCommit?: string
  toCommit?: string
  files: GitStatsFile[]
  summary: GitStatsSummary
  raw?: string
}
