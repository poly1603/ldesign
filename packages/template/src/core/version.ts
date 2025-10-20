/**
 * 模板版本控制系统
 */

import type { Template } from '../types'
import { deepClone } from '../utils/helpers'

/**
 * 版本信息
 */
export interface TemplateVersion {
  /**
   * 版本号
   */
  version: string
  
  /**
   * 创建时间
   */
  createdAt: Date
  
  /**
   * 更新时间
   */
  updatedAt: Date
  
  /**
   * 作者
   */
  author?: string
  
  /**
   * 描述
   */
  description?: string
  
  /**
   * 标签
   */
  tags?: string[]
  
  /**
   * 是否已发布
   */
  published?: boolean
  
  /**
   * 是否已废弃
   */
  deprecated?: boolean
  
  /**
   * 废弃信息
   */
  deprecationInfo?: {
    reason: string
    alternative?: string
    removeIn?: string
  }
}

/**
 * 版本化模板
 */
export interface VersionedTemplate extends Template {
  /**
   * 版本信息
   */
  version: TemplateVersion
  
  /**
   * 变更历史
   */
  changelog?: ChangeLog[]
  
  /**
   * 迁移配置
   */
  migrations?: Migration[]
}

/**
 * 变更日志
 */
export interface ChangeLog {
  /**
   * 版本号
   */
  version: string
  
  /**
   * 日期
   */
  date: Date
  
  /**
   * 类型
   */
  type: 'major' | 'minor' | 'patch' | 'hotfix'
  
  /**
   * 变更内容
   */
  changes: ChangeEntry[]
  
  /**
   * 破坏性变更
   */
  breaking?: string[]
}

/**
 * 变更条目
 */
export interface ChangeEntry {
  /**
   * 类型
   */
  type: 'added' | 'changed' | 'fixed' | 'removed' | 'security' | 'deprecated'
  
  /**
   * 描述
   */
  description: string
  
  /**
   * 相关issue
   */
  issues?: string[]
}

/**
 * 迁移配置
 */
export interface Migration {
  /**
   * 源版本
   */
  from: string
  
  /**
   * 目标版本
   */
  to: string
  
  /**
   * 迁移函数
   */
  migrate: MigrationFunction
  
  /**
   * 回滚函数
   */
  rollback?: MigrationFunction
  
  /**
   * 描述
   */
  description?: string
  
  /**
   * 是否自动执行
   */
  auto?: boolean
}

/**
 * 迁移函数
 */
export type MigrationFunction = (
  template: Template,
  options?: MigrationOptions
) => Promise<Template> | Template

/**
 * 迁移选项
 */
export interface MigrationOptions {
  /**
   * 是否备份
   */
  backup?: boolean
  
  /**
   * 是否验证
   */
  validate?: boolean
  
  /**
   * 自定义数据
   */
  data?: Record<string, any>
}

/**
 * 版本比较结果
 */
export interface VersionComparison {
  /**
   * 是否相同
   */
  equal: boolean
  
  /**
   * 是否更新
   */
  newer: boolean
  
  /**
   * 是否更旧
   */
  older: boolean
  
  /**
   * 主版本差异
   */
  majorDiff: number
  
  /**
   * 次版本差异
   */
  minorDiff: number
  
  /**
   * 补丁版本差异
   */
  patchDiff: number
}

/**
 * 版本管理器
 */
export class TemplateVersionManager {
  private versions: Map<string, Map<string, VersionedTemplate>> = new Map()
  private migrations: Map<string, Migration[]> = new Map()
  private currentVersions: Map<string, string> = new Map()
  private backups: Map<string, VersionedTemplate[]> = new Map()
  
  /**
   * 注册版本
   */
  registerVersion(
    templateId: string,
    version: string,
    template: Template,
    versionInfo?: Partial<TemplateVersion>
  ): void {
    if (!this.versions.has(templateId)) {
      this.versions.set(templateId, new Map())
    }
    
    const versionedTemplate: VersionedTemplate = {
      ...template,
      version: {
        version,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...versionInfo
      }
    }
    
    this.versions.get(templateId)!.set(version, versionedTemplate)
    
    // 设置为当前版本
    if (!this.currentVersions.has(templateId) || versionInfo?.published) {
      this.currentVersions.set(templateId, version)
    }
  }
  
  /**
   * 获取版本
   */
  getVersion(templateId: string, version?: string): VersionedTemplate | undefined {
    const versions = this.versions.get(templateId)
    if (!versions) return undefined
    
    if (version) {
      return versions.get(version)
    }
    
    // 获取当前版本
    const currentVersion = this.currentVersions.get(templateId)
    return currentVersion ? versions.get(currentVersion) : undefined
  }
  
  /**
   * 获取所有版本
   */
  getAllVersions(templateId: string): VersionedTemplate[] {
    const versions = this.versions.get(templateId)
    if (!versions) return []
    
    return Array.from(versions.values()).sort((a, b) => 
      this.compareVersions(b.version.version, a.version.version).newer ? 1 : -1
    )
  }
  
  /**
   * 比较版本
   */
  compareVersions(v1: string, v2: string): VersionComparison {
    const parse = (v: string) => {
      const [major = 0, minor = 0, patch = 0] = v.split('.').map(Number)
      return { major, minor, patch }
    }
    
    const ver1 = parse(v1)
    const ver2 = parse(v2)
    
    const majorDiff = ver1.major - ver2.major
    const minorDiff = ver1.minor - ver2.minor
    const patchDiff = ver1.patch - ver2.patch
    
    return {
      equal: majorDiff === 0 && minorDiff === 0 && patchDiff === 0,
      newer: majorDiff > 0 || (majorDiff === 0 && minorDiff > 0) || 
             (majorDiff === 0 && minorDiff === 0 && patchDiff > 0),
      older: majorDiff < 0 || (majorDiff === 0 && minorDiff < 0) || 
             (majorDiff === 0 && minorDiff === 0 && patchDiff < 0),
      majorDiff,
      minorDiff,
      patchDiff
    }
  }
  
  /**
   * 注册迁移
   */
  registerMigration(templateId: string, migration: Migration): void {
    if (!this.migrations.has(templateId)) {
      this.migrations.set(templateId, [])
    }
    
    this.migrations.get(templateId)!.push(migration)
  }
  
  /**
   * 执行迁移
   */
  async migrate(
    templateId: string,
    fromVersion: string,
    toVersion: string,
    options?: MigrationOptions
  ): Promise<VersionedTemplate> {
    const migrations = this.findMigrationPath(templateId, fromVersion, toVersion)
    
    if (!migrations.length) {
      throw new Error(`No migration path found from ${fromVersion} to ${toVersion}`)
    }
    
    let currentTemplate = this.getVersion(templateId, fromVersion)
    if (!currentTemplate) {
      throw new Error(`Version ${fromVersion} not found for template ${templateId}`)
    }
    
    // 备份
    if (options?.backup) {
      this.backup(templateId, currentTemplate)
    }
    
    // 执行迁移
    for (const migration of migrations) {
      try {
        const result = await migration.migrate(currentTemplate, options)
        currentTemplate = {
          ...result,
          version: {
            ...currentTemplate.version,
            version: migration.to,
            updatedAt: new Date()
          }
        }
        
        // 验证
        if (options?.validate) {
          this.validateTemplate(currentTemplate)
        }
      } catch (error) {
        console.error(`Migration failed from ${migration.from} to ${migration.to}:`, error)
        
        // 尝试回滚
        if (migration.rollback) {
          await migration.rollback(currentTemplate, options)
        }
        
        throw error
      }
    }
    
    // 更新版本
    this.registerVersion(
      templateId,
      toVersion,
      currentTemplate,
      currentTemplate.version
    )
    
    return currentTemplate
  }
  
  /**
   * 查找迁移路径
   */
  private findMigrationPath(
    templateId: string,
    fromVersion: string,
    toVersion: string
  ): Migration[] {
    const migrations = this.migrations.get(templateId) || []
    const path: Migration[] = []
    
    // 简单的线性迁移路径
    let currentVersion = fromVersion
    
    while (currentVersion !== toVersion) {
      const migration = migrations.find(m => m.from === currentVersion)
      if (!migration) break
      
      path.push(migration)
      currentVersion = migration.to
    }
    
    return currentVersion === toVersion ? path : []
  }
  
  /**
   * 备份模板
   */
  private backup(templateId: string, template: VersionedTemplate): void {
    if (!this.backups.has(templateId)) {
      this.backups.set(templateId, [])
    }
    
    this.backups.get(templateId)!.push(deepClone(template))
    
    // 限制备份数量
    const backups = this.backups.get(templateId)!
    if (backups.length > 10) {
      backups.shift()
    }
  }
  
  /**
   * 恢复备份
   */
  restoreBackup(templateId: string, index: number = -1): VersionedTemplate | undefined {
    const backups = this.backups.get(templateId)
    if (!backups || !backups.length) return undefined
    
    const backup = index === -1 ? backups[backups.length - 1] : backups[index]
    if (!backup) return undefined
    
    this.registerVersion(
      templateId,
      backup.version.version,
      backup,
      backup.version
    )
    
    return backup
  }
  
  /**
   * 验证模板
   */
  private validateTemplate(template: VersionedTemplate): void {
    if (!template.id) {
      throw new Error('Template must have an id')
    }
    
    if (!template.version?.version) {
      throw new Error('Template must have a version')
    }
    
    // 验证版本格式
    if (!/^\d+\.\d+\.\d+/.test(template.version.version)) {
      throw new Error('Version must be in semver format (x.y.z)')
    }
  }
  
  /**
   * 创建新版本
   */
  createVersion(
    templateId: string,
    newVersion: string,
    changes: Partial<Template>,
    versionInfo?: Partial<TemplateVersion>
  ): VersionedTemplate {
    const currentTemplate = this.getVersion(templateId)
    if (!currentTemplate) {
      throw new Error(`Template ${templateId} not found`)
    }
    
    const newTemplate: VersionedTemplate = {
      ...currentTemplate,
      ...changes,
      version: {
        version: newVersion,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...versionInfo
      }
    }
    
    this.registerVersion(templateId, newVersion, newTemplate, versionInfo)
    
    return newTemplate
  }
  
  /**
   * 发布版本
   */
  publishVersion(templateId: string, version: string): void {
    const template = this.getVersion(templateId, version)
    if (!template) {
      throw new Error(`Version ${version} not found for template ${templateId}`)
    }
    
    template.version.published = true
    template.version.updatedAt = new Date()
    
    // 设置为当前版本
    this.currentVersions.set(templateId, version)
  }
  
  /**
   * 废弃版本
   */
  deprecateVersion(
    templateId: string,
    version: string,
    reason: string,
    alternative?: string
  ): void {
    const template = this.getVersion(templateId, version)
    if (!template) {
      throw new Error(`Version ${version} not found for template ${templateId}`)
    }
    
    template.version.deprecated = true
    template.version.deprecationInfo = {
      reason,
      alternative
    }
    template.version.updatedAt = new Date()
  }
  
  /**
   * 获取变更日志
   */
  getChangelog(templateId: string): ChangeLog[] {
    const versions = this.getAllVersions(templateId)
    const changelog: ChangeLog[] = []
    
    versions.forEach(version => {
      if (version.changelog) {
        changelog.push(...version.changelog)
      }
    })
    
    return changelog.sort((a, b) => b.date.getTime() - a.date.getTime())
  }
  
  /**
   * 清理旧版本
   */
  cleanupOldVersions(
    templateId: string,
    keepCount: number = 5
  ): void {
    const versions = this.getAllVersions(templateId)
    
    if (versions.length <= keepCount) return
    
    const toRemove = versions.slice(keepCount)
    const versionMap = this.versions.get(templateId)
    
    toRemove.forEach(version => {
      if (!version.version.published) {
        versionMap?.delete(version.version.version)
      }
    })
  }
}

// 创建全局实例
export const versionManager = new TemplateVersionManager()

/**
 * 创建版本化模板
 */
export function createVersionedTemplate(
  template: Template,
  version: string,
  versionInfo?: Partial<TemplateVersion>
): VersionedTemplate {
  return {
    ...template,
    version: {
      version,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...versionInfo
    }
  }
}

/**
 * 创建迁移
 */
export function createMigration(
  from: string,
  to: string,
  migrate: MigrationFunction,
  options?: {
    rollback?: MigrationFunction
    description?: string
    auto?: boolean
  }
): Migration {
  return {
    from,
    to,
    migrate,
    ...options
  }
}