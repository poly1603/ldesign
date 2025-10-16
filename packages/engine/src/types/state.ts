/**
 * 状态管理类型定义
 * 包含状态管理器、状态变更等相关类型
 */

import type {
  StateChangeHandler,
  StateMap,
  StatePath,
  StateValue,
} from './base'

// 状态管理器接口
export interface StateManager<TState extends StateMap = StateMap> {
  get: (<P extends StatePath<TState>>(
    key: P
  ) => StateValue<TState, P> | undefined) &
    (<T = unknown>(key: string) => T | undefined)

  set: (<P extends StatePath<TState>>(
    key: P,
    value: StateValue<TState, P>
  ) => void) &
    (<T = unknown>(key: string, value: T) => void)

  remove: (key: string) => void
  has: (key: string) => boolean
  clear: () => void

  watch: (<P extends StatePath<TState>>(
    key: P,
    callback: StateChangeHandler<StateValue<TState, P>>
  ) => () => void) &
    (<T = unknown>(key: string, callback: StateChangeHandler<T>) => () => void)

  keys: () => string[]
  namespace: (name: string) => StateManager

  // 获取整个状态对象
  getState: () => TState
  // 设置整个状态对象
  setState: (state: Partial<TState>) => void
}

// 状态快照
export interface StateSnapshot<T = unknown> {
  timestamp: number
  data: T
  version: string
  metadata?: Record<string, unknown>
}

// 状态历史记录条目
export interface StateHistoryEntry {
  timestamp: number
  action: string
  key: string
  oldValue: unknown
  newValue: unknown
  metadata?: Record<string, unknown>
}

// 状态持久化接口
export interface StatePersistence {
  save: (state: Record<string, unknown>, key: string) => Promise<void>
  load: (key: string) => Promise<Record<string, unknown> | null>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
}

// 状态同步接口
export interface StateSync {
  sync: (state: Record<string, unknown>) => Promise<void>
  getLastSync: () => Date | null
  isSyncing: () => boolean
  onSync: (callback: (state: Record<string, unknown>) => void) => () => void
  onSyncError: (callback: (error: Error) => void) => void
}

// 状态验证接口
export interface StateValidator {
  validate: (
    state: Record<string, unknown>,
    schema: Record<string, unknown>
  ) => { valid: boolean; errors: string[] }
  sanitize: (
    state: Record<string, unknown>,
    schema: Record<string, unknown>
  ) => Record<string, unknown>
  transform: (
    state: Record<string, unknown>,
    rules: Record<string, unknown>
  ) => Record<string, unknown>
}

// 状态加密接口
export interface StateEncryption {
  encrypt: (data: string, key: string) => string
  decrypt: (data: string, key: string) => string
  generateKey: () => string
  validateKey: (key: string) => boolean
}

// 状态压缩接口
export interface StateCompression {
  compress: (data: string) => string
  decompress: (data: string) => string
  getCompressionRatio: () => number
  isCompressed: (data: string) => boolean
}

// 状态迁移接口
export interface StateMigration {
  migrate: (
    fromVersion: string,
    toVersion: string,
    state: Record<string, unknown>
  ) => Promise<Record<string, unknown>>
  getMigrationPath: (fromVersion: string, toVersion: string) => string[]
  validateMigration: (migration: Record<string, unknown>) => boolean
  rollback: (
    state: Record<string, unknown>,
    targetVersion: string
  ) => Promise<Record<string, unknown>>
}

// 状态备份接口
export interface StateBackup {
  create: (
    state: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ) => Promise<string>
  restore: (backupId: string) => Promise<Record<string, unknown>>
  list: () => Promise<
    Array<{ id: string; timestamp: number; metadata?: Record<string, unknown> }>
  >
  remove: (backupId: string) => Promise<void>
  clear: () => Promise<void>
}

// 状态统计接口
export interface StateStats {
  totalKeys: number
  totalSize: number
  watchers: number
  lastModified: number
  memoryUsage: string
  compressionRatio: number
  backupCount: number
  syncStatus: 'synced' | 'pending' | 'error'
}
