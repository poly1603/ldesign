import type { SerializableValue } from '../types'

import type { CacheManager } from './cache-manager'

/**
 * 版本迁移函数类型
 */
export type MigrationFunction = (data: SerializableValue) => SerializableValue | Promise<SerializableValue>

/**
 * 版本配置
 */
export interface VersionConfig {
  /** 当前版本号 */
  version: string
  /** 版本键前缀 */
  versionKey?: string
  /** 是否自动迁移 */
  autoMigrate?: boolean
  /** 是否在版本不匹配时清空缓存 */
  clearOnMismatch?: boolean
}

/**
 * 迁移配置
 */
export interface MigrationConfig {
  /** 源版本 */
  from: string
  /** 目标版本 */
  to: string
  /** 迁移函数 */
  migrate: MigrationFunction
  /** 迁移描述 */
  description?: string
}

/**
 * 缓存版本管理器
 * 
 * 管理缓存数据的版本，支持版本迁移和自动清理
 * 
 * @example
 * ```typescript
 * const versionManager = new VersionManager(cache, {
 *   version: '2.0.0',
 *   autoMigrate: true
 * })
 * 
 * // 注册迁移
 * versionManager.registerMigration({
 *   from: '1.0.0',
 *   to: '2.0.0',
 *   migrate: (data) => {
 *     // 转换数据结构
 *     return { ...data, newField: 'value' }
 *   }
 * })
 * 
 * // 初始化版本检查
 * await versionManager.initialize()
 * ```
 */
export class VersionManager {
  private migrations: Map<string, MigrationConfig> = new Map()
  private currentVersion: string
  private versionKey: string
  private autoMigrate: boolean
  private clearOnMismatch: boolean

  constructor(
    private cache: CacheManager,
    config: VersionConfig,
  ) {
    this.currentVersion = config.version
    this.versionKey = config.versionKey || '__cache_version__'
    this.autoMigrate = config.autoMigrate ?? true
    this.clearOnMismatch = config.clearOnMismatch ?? false
  }

  /**
   * 注册版本迁移
   */
  registerMigration(config: MigrationConfig): void {
    const key = `${config.from}->${config.to}`
    this.migrations.set(key, config)
  }

  /**
   * 批量注册迁移
   */
  registerMigrations(configs: MigrationConfig[]): void {
    configs.forEach(config => this.registerMigration(config))
  }

  /**
   * 初始化版本检查
   */
  async initialize(): Promise<void> {
    const storedVersion = await this.getStoredVersion()

    if (!storedVersion) {
      // 首次使用，设置当前版本
      await this.setStoredVersion(this.currentVersion)
      return
    }

    if (storedVersion === this.currentVersion) {
      // 版本匹配，无需操作
      return
    }

    // 版本不匹配
    if (this.clearOnMismatch) {
      // 清空缓存
      await this.cache.clear()
      await this.setStoredVersion(this.currentVersion)
      return
    }

    if (this.autoMigrate) {
      // 尝试自动迁移
      await this.migrate(storedVersion, this.currentVersion)
    }
  }

  /**
   * 执行版本迁移
   */
  async migrate(fromVersion: string, toVersion: string): Promise<void> {
    const migrationPath = this.findMigrationPath(fromVersion, toVersion)

    if (!migrationPath) {
      throw new Error(`No migration path found from ${fromVersion} to ${toVersion}`)
    }

    // 获取所有缓存键
    const keys = await this.cache.keys()

    // 对每个缓存项执行迁移
    for (const key of keys) {
      if (key === this.versionKey) { continue }

      try {
        const data = await this.cache.get(key)
        if (data === null) { continue }

        let migratedData: SerializableValue = data

        // 按顺序执行迁移链
        for (const migration of migrationPath) {
          migratedData = await migration.migrate(migratedData)
        }

        // 更新缓存
        await this.cache.set(key, migratedData)
      }
      catch (error) {
        console.error(`Failed to migrate key ${key}:`, error)
        // 继续迁移其他键
      }
    }

    // 更新版本号
    await this.setStoredVersion(toVersion)
  }

  /**
   * 查找迁移路径
   */
  private findMigrationPath(from: string, to: string): MigrationConfig[] | null {
    // 直接迁移
    const directKey = `${from}->${to}`
    if (this.migrations.has(directKey)) {
      return [this.migrations.get(directKey)!]
    }

    // 尝试查找迁移链（简单实现，可以优化为图搜索）
    const path: MigrationConfig[] = []
    let current = from

    // 最多尝试10步迁移
    for (let i = 0; i < 10; i++) {
      let found = false

    for (const [_key, migration] of this.migrations) {
        if (migration.from === current) {
          path.push(migration)
          current = migration.to

          if (current === to) {
            return path
          }

          found = true
          break
        }
      }

      if (!found) { break }
    }

    return null
  }

  /**
   * 获取存储的版本号
   */
  private async getStoredVersion(): Promise<string | null> {
    return this.cache.get<string>(this.versionKey)
  }

  /**
   * 设置存储的版本号
   */
  private async setStoredVersion(version: string): Promise<void> {
    await this.cache.set(this.versionKey, version)
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion(): string {
    return this.currentVersion
  }

  /**
   * 检查版本是否匹配
   */
  async checkVersion(): Promise<boolean> {
    const storedVersion = await this.getStoredVersion()
    return storedVersion === this.currentVersion
  }

  /**
   * 强制更新版本号（不执行迁移）
   */
  async forceUpdateVersion(version?: string): Promise<void> {
    await this.setStoredVersion(version || this.currentVersion)
  }

  /**
   * 获取所有已注册的迁移
   */
  getMigrations(): MigrationConfig[] {
    return Array.from(this.migrations.values())
  }

  /**
   * 清除所有迁移配置
   */
  clearMigrations(): void {
    this.migrations.clear()
  }
}

/**
 * 创建版本管理器
 */
export function createVersionManager(
  cache: CacheManager,
  config: VersionConfig,
): VersionManager {
  return new VersionManager(cache, config)
}

