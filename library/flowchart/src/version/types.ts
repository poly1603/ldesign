/**
 * 版本控制系统类型定义
 */

import type { FlowchartData, FlowchartNode, FlowchartEdge } from '../types'

/**
 * 版本信息
 */
export interface Version {
  /** 版本ID */
  id: string
  /** 版本号 */
  version: string
  /** 版本名称 */
  name?: string
  /** 版本描述 */
  description?: string
  /** 创建时间 */
  createdAt: number
  /** 创建者 */
  author: string
  /** 父版本ID */
  parentId?: string
  /** 分支名称 */
  branch: string
  /** 版本标签 */
  tags: string[]
  /** 流程图数据 */
  data: FlowchartData
  /** 变更摘要 */
  changeSummary: ChangeSummary
  /** 是否为主版本 */
  isMajor: boolean
  /** 版本状态 */
  status: VersionStatus
  /** 元数据 */
  metadata: Record<string, any>
}

/**
 * 版本状态
 */
export type VersionStatus = 'draft' | 'published' | 'archived' | 'deprecated'

/**
 * 变更摘要
 */
export interface ChangeSummary {
  /** 添加的节点数量 */
  nodesAdded: number
  /** 删除的节点数量 */
  nodesRemoved: number
  /** 修改的节点数量 */
  nodesModified: number
  /** 添加的边数量 */
  edgesAdded: number
  /** 删除的边数量 */
  edgesRemoved: number
  /** 修改的边数量 */
  edgesModified: number
  /** 变更详情 */
  changes: Change[]
}

/**
 * 变更记录
 */
export interface Change {
  /** 变更ID */
  id: string
  /** 变更类型 */
  type: ChangeType
  /** 变更目标类型 */
  targetType: 'node' | 'edge' | 'property'
  /** 目标ID */
  targetId: string
  /** 变更前的值 */
  oldValue?: any
  /** 变更后的值 */
  newValue?: any
  /** 变更路径 */
  path?: string
  /** 变更时间 */
  timestamp: number
  /** 变更描述 */
  description?: string
}

/**
 * 变更类型
 */
export type ChangeType = 'add' | 'remove' | 'modify' | 'move' | 'rename'

/**
 * 分支信息
 */
export interface Branch {
  /** 分支名称 */
  name: string
  /** 分支描述 */
  description?: string
  /** 创建时间 */
  createdAt: number
  /** 创建者 */
  author: string
  /** 基础版本ID */
  baseVersionId: string
  /** 最新版本ID */
  latestVersionId: string
  /** 分支状态 */
  status: BranchStatus
  /** 是否为主分支 */
  isMain: boolean
  /** 分支标签 */
  tags: string[]
}

/**
 * 分支状态
 */
export type BranchStatus = 'active' | 'merged' | 'archived'

/**
 * 版本比较结果
 */
export interface VersionComparison {
  /** 源版本 */
  sourceVersion: Version
  /** 目标版本 */
  targetVersion: Version
  /** 差异摘要 */
  summary: DiffSummary
  /** 详细差异 */
  differences: Difference[]
  /** 冲突 */
  conflicts: Conflict[]
}

/**
 * 差异摘要
 */
export interface DiffSummary {
  /** 总变更数 */
  totalChanges: number
  /** 节点变更数 */
  nodeChanges: number
  /** 边变更数 */
  edgeChanges: number
  /** 属性变更数 */
  propertyChanges: number
  /** 兼容性评分 */
  compatibilityScore: number
}

/**
 * 差异记录
 */
export interface Difference {
  /** 差异ID */
  id: string
  /** 差异类型 */
  type: DifferenceType
  /** 目标类型 */
  targetType: 'node' | 'edge' | 'property'
  /** 目标ID */
  targetId: string
  /** 源值 */
  sourceValue?: any
  /** 目标值 */
  targetValue?: any
  /** 差异路径 */
  path?: string
  /** 差异描述 */
  description: string
  /** 严重程度 */
  severity: 'low' | 'medium' | 'high'
}

/**
 * 差异类型
 */
export type DifferenceType = 'added' | 'removed' | 'modified' | 'moved' | 'renamed'

/**
 * 冲突信息
 */
export interface Conflict {
  /** 冲突ID */
  id: string
  /** 冲突类型 */
  type: ConflictType
  /** 目标类型 */
  targetType: 'node' | 'edge' | 'property'
  /** 目标ID */
  targetId: string
  /** 源值 */
  sourceValue: any
  /** 目标值 */
  targetValue: any
  /** 冲突描述 */
  description: string
  /** 解决策略 */
  resolutionStrategy?: ConflictResolutionStrategy
  /** 是否已解决 */
  resolved: boolean
}

/**
 * 冲突类型
 */
export type ConflictType = 'content' | 'structure' | 'property' | 'reference'

/**
 * 冲突解决策略
 */
export type ConflictResolutionStrategy = 'keep_source' | 'keep_target' | 'merge' | 'manual'

/**
 * 合并选项
 */
export interface MergeOptions {
  /** 目标分支 */
  targetBranch: string
  /** 源分支 */
  sourceBranch: string
  /** 合并策略 */
  strategy: MergeStrategy
  /** 是否创建合并提交 */
  createMergeCommit: boolean
  /** 合并消息 */
  message?: string
  /** 冲突解决策略 */
  conflictResolution: ConflictResolutionStrategy
  /** 是否快进合并 */
  fastForward: boolean
}

/**
 * 合并策略
 */
export type MergeStrategy = 'auto' | 'manual' | 'ours' | 'theirs'

/**
 * 合并结果
 */
export interface MergeResult {
  /** 是否成功 */
  success: boolean
  /** 合并后的版本 */
  mergedVersion?: Version
  /** 冲突列表 */
  conflicts: Conflict[]
  /** 错误信息 */
  error?: string
  /** 合并统计 */
  stats: MergeStats
}

/**
 * 合并统计
 */
export interface MergeStats {
  /** 合并的变更数 */
  mergedChanges: number
  /** 冲突数 */
  conflicts: number
  /** 自动解决的冲突数 */
  autoResolvedConflicts: number
  /** 手动解决的冲突数 */
  manualResolvedConflicts: number
}

/**
 * 版本历史查询选项
 */
export interface VersionHistoryOptions {
  /** 分支名称 */
  branch?: string
  /** 作者 */
  author?: string
  /** 开始时间 */
  startDate?: Date
  /** 结束时间 */
  endDate?: Date
  /** 标签 */
  tags?: string[]
  /** 最大数量 */
  limit?: number
  /** 偏移量 */
  offset?: number
  /** 排序方式 */
  sortBy?: 'createdAt' | 'version' | 'author'
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

/**
 * 版本管理器接口
 */
export interface VersionManager {
  /** 创建版本 */
  createVersion(data: FlowchartData, options: CreateVersionOptions): Promise<Version>
  
  /** 获取版本 */
  getVersion(versionId: string): Promise<Version | null>
  
  /** 获取版本历史 */
  getVersionHistory(options?: VersionHistoryOptions): Promise<Version[]>
  
  /** 比较版本 */
  compareVersions(sourceId: string, targetId: string): Promise<VersionComparison>
  
  /** 回滚到指定版本 */
  rollbackToVersion(versionId: string): Promise<Version>
  
  /** 删除版本 */
  deleteVersion(versionId: string): Promise<void>
  
  /** 标记版本 */
  tagVersion(versionId: string, tag: string): Promise<void>
}

/**
 * 分支管理器接口
 */
export interface BranchManager {
  /** 创建分支 */
  createBranch(name: string, baseVersionId: string, options?: CreateBranchOptions): Promise<Branch>
  
  /** 获取分支 */
  getBranch(name: string): Promise<Branch | null>
  
  /** 获取所有分支 */
  getBranches(): Promise<Branch[]>
  
  /** 切换分支 */
  switchBranch(name: string): Promise<Branch>
  
  /** 合并分支 */
  mergeBranch(options: MergeOptions): Promise<MergeResult>
  
  /** 删除分支 */
  deleteBranch(name: string): Promise<void>
}

/**
 * 差异引擎接口
 */
export interface DiffEngine {
  /** 计算差异 */
  calculateDiff(source: FlowchartData, target: FlowchartData): Promise<Difference[]>
  
  /** 应用差异 */
  applyDiff(data: FlowchartData, differences: Difference[]): Promise<FlowchartData>
  
  /** 检测冲突 */
  detectConflicts(differences: Difference[]): Promise<Conflict[]>
  
  /** 解决冲突 */
  resolveConflicts(conflicts: Conflict[], strategy: ConflictResolutionStrategy): Promise<Difference[]>
}

/**
 * 创建版本选项
 */
export interface CreateVersionOptions {
  /** 版本名称 */
  name?: string
  /** 版本描述 */
  description?: string
  /** 作者 */
  author: string
  /** 分支名称 */
  branch?: string
  /** 是否为主版本 */
  isMajor?: boolean
  /** 标签 */
  tags?: string[]
  /** 元数据 */
  metadata?: Record<string, any>
}

/**
 * 创建分支选项
 */
export interface CreateBranchOptions {
  /** 分支描述 */
  description?: string
  /** 作者 */
  author: string
  /** 标签 */
  tags?: string[]
}

/**
 * 版本控制事件
 */
export interface VersionControlEvents {
  'version:created': (version: Version) => void
  'version:updated': (version: Version) => void
  'version:deleted': (versionId: string) => void
  'branch:created': (branch: Branch) => void
  'branch:switched': (branch: Branch) => void
  'branch:merged': (result: MergeResult) => void
  'branch:deleted': (branchName: string) => void
  'conflict:detected': (conflicts: Conflict[]) => void
  'conflict:resolved': (conflict: Conflict) => void
}

/**
 * 版本控制配置
 */
export interface VersionControlConfig {
  /** 是否启用自动版本创建 */
  autoVersioning: boolean
  /** 自动版本创建间隔（毫秒） */
  autoVersionInterval: number
  /** 最大版本历史数量 */
  maxVersionHistory: number
  /** 是否启用版本压缩 */
  enableCompression: boolean
  /** 默认分支名称 */
  defaultBranch: string
  /** 版本命名策略 */
  versionNamingStrategy: 'semantic' | 'timestamp' | 'sequential'
  /** 是否启用版本标签 */
  enableVersionTags: boolean
}

/**
 * 版本存储接口
 */
export interface VersionStorage {
  /** 保存版本 */
  saveVersion(version: Version): Promise<void>
  
  /** 加载版本 */
  loadVersion(versionId: string): Promise<Version | null>
  
  /** 删除版本 */
  deleteVersion(versionId: string): Promise<void>
  
  /** 查询版本 */
  queryVersions(options: VersionHistoryOptions): Promise<Version[]>
  
  /** 保存分支 */
  saveBranch(branch: Branch): Promise<void>
  
  /** 加载分支 */
  loadBranch(name: string): Promise<Branch | null>
  
  /** 删除分支 */
  deleteBranch(name: string): Promise<void>
  
  /** 获取所有分支 */
  getAllBranches(): Promise<Branch[]>
}
