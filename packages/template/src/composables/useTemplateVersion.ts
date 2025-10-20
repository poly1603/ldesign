/**
 * 模板版本控制组合式函数
 */

import type { Ref } from 'vue';
import type {
  ChangeLog,
  Migration,
  MigrationOptions,
  TemplateVersion,
  VersionComparison,
  VersionedTemplate} from '../core/version';
import type { Template } from '../types'
import { computed, reactive, ref, watch } from 'vue'
import {
  createMigration,
  createVersionedTemplate,
  versionManager
} from '../core/version'

/**
 * 版本控制选项
 */
export interface UseTemplateVersionOptions {
  /**
   * 初始版本
   */
  initialVersion?: string
  
  /**
   * 是否自动注册
   */
  autoRegister?: boolean
  
  /**
   * 是否自动迁移
   */
  autoMigrate?: boolean
  
  /**
   * 是否启用备份
   */
  enableBackup?: boolean
  
  /**
   * 保留版本数量
   */
  keepVersions?: number
  
  /**
   * 版本信息
   */
  versionInfo?: Partial<TemplateVersion>
}

/**
 * 版本状态
 */
export interface VersionState {
  /**
   * 当前版本
   */
  current: string
  
  /**
   * 可用版本列表
   */
  available: string[]
  
  /**
   * 是否有新版本
   */
  hasUpdate: boolean
  
  /**
   * 是否已废弃
   */
  isDeprecated: boolean
  
  /**
   * 迁移进度
   */
  migrationProgress?: {
    from: string
    to: string
    step: number
    total: number
  }
}

/**
 * 使用模板版本控制
 */
export function useTemplateVersion(
  template: Ref<Template> | Template,
  options: UseTemplateVersionOptions = {}
) {
  const {
    initialVersion = '1.0.0',
    autoRegister = true,
    autoMigrate = false,
    enableBackup = true,
    keepVersions = 10,
    versionInfo = {}
  } = options
  
  // 响应式模板
  const templateRef = ref(template)
  const currentTemplate = computed<Template>(() => 
    'value' in templateRef.value ? templateRef.value.value : templateRef.value
  )
  
  // 版本状态
  const versionState = reactive<VersionState>({
    current: initialVersion,
    available: [],
    hasUpdate: false,
    isDeprecated: false
  })
  
  // 版本化模板
  const versionedTemplate = ref<VersionedTemplate | null>(null)
  
  // 变更日志
  const changelog = ref<ChangeLog[]>([])
  
  // 迁移队列
  const migrationQueue = ref<Migration[]>([])
  
  // 是否正在迁移
  const isMigrating = ref(false)
  
  // 初始化
  const initialize = () => {
    const templateId = currentTemplate.value.id
    if (!templateId) {
      console.warn('Template must have an id for version control')
      return
    }
    
    // 创建版本化模板
    const versioned = createVersionedTemplate(
      currentTemplate.value,
      initialVersion,
      versionInfo
    )
    
    if (autoRegister) {
      versionManager.registerVersion(
        templateId,
        initialVersion,
        currentTemplate.value,
        versionInfo
      )
    }
    
    versionedTemplate.value = versioned
    updateVersionState()
  }
  
  // 更新版本状态
  function updateVersionState() {
    const templateId = currentTemplate.value.id
    if (!templateId) return
    
    const allVersions = versionManager.getAllVersions(templateId)
    versionState.available = allVersions.map(v => v.version.version)
    
    const current = versionManager.getVersion(templateId)
    if (current) {
      versionState.current = current.version.version
      versionState.isDeprecated = current.version.deprecated || false
      
      // 检查更新
      const latest = allVersions[0]
      if (latest) {
        const comparison = versionManager.compareVersions(
          latest.version.version,
          versionState.current
        )
        versionState.hasUpdate = comparison.newer
      }
    }
    
    // 更新变更日志
    changelog.value = versionManager.getChangelog(templateId)
  }
  
  /**
   * 创建新版本
   */
  const createVersion = (
    version: string,
    changes: Partial<Template>,
    info?: Partial<TemplateVersion>
  ): VersionedTemplate | undefined => {
    const templateId = currentTemplate.value.id
    if (!templateId) return undefined
    
    const newVersion = versionManager.createVersion(
      templateId,
      version,
      changes,
      info
    )
    
    versionedTemplate.value = newVersion
    updateVersionState()
    
    // 清理旧版本
    if (keepVersions > 0) {
      versionManager.cleanupOldVersions(templateId, keepVersions)
    }
    
    return newVersion
  }
  
  /**
   * 切换版本
   */
  const switchVersion = async (version: string): Promise<boolean> => {
    const templateId = currentTemplate.value.id
    if (!templateId) return false
    
    const targetVersion = versionManager.getVersion(templateId, version)
    if (!targetVersion) {
      console.error(`Version ${version} not found`)
      return false
    }
    
    // 检查是否需要迁移
    if (autoMigrate && versionState.current !== version) {
      const migrated = await migrate(versionState.current, version)
      if (migrated) {
        versionedTemplate.value = migrated
        updateVersionState()
        return true
      }
      return false
    }
    
    versionedTemplate.value = targetVersion
    versionState.current = version
    updateVersionState()
    
    return true
  }
  
  /**
   * 执行迁移
   */
  async function migrate(
    from: string,
    to: string,
    migrationOptions?: MigrationOptions
  ): Promise<VersionedTemplate | null> {
    const templateId = currentTemplate.value.id
    if (!templateId) return null
    
    isMigrating.value = true
    
    try {
      const options: MigrationOptions = {
        backup: enableBackup,
        validate: true,
        ...migrationOptions
      }
      
      const result = await versionManager.migrate(
        templateId,
        from,
        to,
        options
      )
      
      versionedTemplate.value = result
      updateVersionState()
      
      return result
    } catch (error) {
      console.error('Migration failed:', error)
      return null
    } finally {
      isMigrating.value = false
    }
  }
  
  /**
   * 注册迁移
   */
  const registerMigration = (migration: Migration) => {
    const templateId = currentTemplate.value.id
    if (!templateId) return
    
    versionManager.registerMigration(templateId, migration)
    migrationQueue.value.push(migration)
  }
  
  /**
   * 创建并注册迁移
   */
  const addMigration = (
    from: string,
    to: string,
    migrateFn: Migration['migrate'],
    rollbackFn?: Migration['rollback']
  ) => {
    const migration = createMigration(from, to, migrateFn, {
      rollback: rollbackFn,
      auto: autoMigrate
    })
    
    registerMigration(migration)
  }
  
  /**
   * 发布版本
   */
  const publish = (version?: string) => {
    const templateId = currentTemplate.value.id
    if (!templateId) return
    
    const targetVersion = version || versionState.current
    versionManager.publishVersion(templateId, targetVersion)
    updateVersionState()
  }
  
  /**
   * 废弃版本
   */
  const deprecate = (
    version: string,
    reason: string,
    alternative?: string
  ) => {
    const templateId = currentTemplate.value.id
    if (!templateId) return
    
    versionManager.deprecateVersion(templateId, version, reason, alternative)
    updateVersionState()
  }
  
  /**
   * 比较版本
   */
  const compareVersions = (v1: string, v2: string): VersionComparison => {
    return versionManager.compareVersions(v1, v2)
  }
  
  /**
   * 恢复备份
   */
  const restoreBackup = (index?: number): VersionedTemplate | undefined => {
    const templateId = currentTemplate.value.id
    if (!templateId) return undefined
    
    const restored = versionManager.restoreBackup(templateId, index)
    if (restored) {
      versionedTemplate.value = restored
      updateVersionState()
    }
    
    return restored
  }
  
  /**
   * 获取版本详情
   */
  const getVersionDetails = (version?: string): VersionedTemplate | undefined => {
    const templateId = currentTemplate.value.id
    if (!templateId) return undefined
    
    return versionManager.getVersion(templateId, version)
  }
  
  /**
   * 获取版本历史
   */
  const getVersionHistory = (): VersionedTemplate[] => {
    const templateId = currentTemplate.value.id
    if (!templateId) return []
    
    return versionManager.getAllVersions(templateId)
  }
  
  // 监听模板变化
  watch(currentTemplate, () => {
    initialize()
  }, { immediate: true })
  
  return {
    // 状态
    versionState,
    versionedTemplate,
    changelog,
    migrationQueue,
    isMigrating,
    
    // 方法
    createVersion,
    switchVersion,
    migrate,
    registerMigration,
    addMigration,
    publish,
    deprecate,
    compareVersions,
    restoreBackup,
    getVersionDetails,
    getVersionHistory,
    updateVersionState
  }
}

/**
 * 使用版本比较
 */
export function useVersionComparison(v1: Ref<string>, v2: Ref<string>) {
  const comparison = computed(() => {
    return versionManager.compareVersions(v1.value, v2.value)
  })
  
  const isNewer = computed(() => comparison.value.newer)
  const isOlder = computed(() => comparison.value.older)
  const isEqual = computed(() => comparison.value.equal)
  
  const majorDiff = computed(() => comparison.value.majorDiff)
  const minorDiff = computed(() => comparison.value.minorDiff)
  const patchDiff = computed(() => comparison.value.patchDiff)
  
  const needsMajorUpdate = computed(() => majorDiff.value > 0)
  const needsMinorUpdate = computed(() => minorDiff.value > 0)
  const needsPatchUpdate = computed(() => patchDiff.value > 0)
  
  return {
    comparison,
    isNewer,
    isOlder,
    isEqual,
    majorDiff,
    minorDiff,
    patchDiff,
    needsMajorUpdate,
    needsMinorUpdate,
    needsPatchUpdate
  }
}

/**
 * 使用自动迁移
 */
export function useAutoMigration(
  templateId: string,
  targetVersion: string,
  options?: MigrationOptions
) {
  const isRunning = ref(false)
  const progress = ref(0)
  const error = ref<Error | null>(null)
  const result = ref<VersionedTemplate | null>(null)
  
  const run = async () => {
    isRunning.value = true
    error.value = null
    progress.value = 0
    
    try {
      const current = versionManager.getVersion(templateId)
      if (!current) {
        throw new Error(`Template ${templateId} not found`)
      }
      
      const migrated = await versionManager.migrate(
        templateId,
        current.version.version,
        targetVersion,
        {
          ...options,
          data: {
            ...options?.data,
            onProgress: (p: number) => {
              progress.value = p
            }
          }
        }
      )
      
      result.value = migrated
      progress.value = 100
      
      return migrated
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isRunning.value = false
    }
  }
  
  return {
    run,
    isRunning,
    progress,
    error,
    result
  }
}