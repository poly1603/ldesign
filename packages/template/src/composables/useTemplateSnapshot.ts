import { computed, onUnmounted, ref, type Ref, watch } from 'vue'

/**
 * 快照数据结构
 */
export interface TemplateSnapshot<T = any> {
  id: string
  timestamp: number
  data: T
  metadata?: Record<string, any>
  description?: string
  tags?: string[]
}

/**
 * 快照配置
 */
export interface SnapshotOptions {
  maxSnapshots?: number // 最大快照数量
  autoSave?: boolean // 自动保存
  autoSaveInterval?: number // 自动保存间隔（毫秒）
  compressOldSnapshots?: boolean // 压缩旧快照
  storageKey?: string // 本地存储键名
  enablePersistence?: boolean // 启用持久化
}

/**
 * 时间旅行操作
 */
export interface TimeTravel {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  goto: (snapshotId: string) => void
  reset: () => void
}

/**
 * 使用模板快照
 */
export function useTemplateSnapshot<T = any>(
  initialData: T | Ref<T>,
  options: SnapshotOptions = {}
) {
  const {
    maxSnapshots = 50,
    autoSave = false,
    autoSaveInterval = 5000,
    compressOldSnapshots = false,
    storageKey = 'template-snapshots',
    enablePersistence = false,
  } = options

  // 当前数据
  const currentData = ref(initialData) as Ref<T>
  
  // 快照历史
  const snapshots = ref<TemplateSnapshot<T>[]>([])
  
  // 当前快照索引
  const currentSnapshotIndex = ref(-1)
  
  // 是否正在应用快照（避免触发 watch）
  const isApplyingSnapshot = ref(false)

  // 计算属性
  const canUndo = computed(() => currentSnapshotIndex.value > 0)
  const canRedo = computed(() => currentSnapshotIndex.value < snapshots.value.length - 1)
  const currentSnapshot = computed(() => snapshots.value[currentSnapshotIndex.value] || null)
  const snapshotCount = computed(() => snapshots.value.length)

  /**
   * 生成快照ID
   */
  const generateSnapshotId = () => {
    return `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 深拷贝数据
   */
  const deepClone = <U>(data: U): U => {
    return JSON.parse(JSON.stringify(data))
  }

  /**
   * 压缩快照（简单实现：只保留数据的差异）
   */
  const compressSnapshot = (snapshot: TemplateSnapshot<T>): TemplateSnapshot<T> => {
    if (!compressOldSnapshots) return snapshot
    
    // 简单压缩：如果是旧快照，可以删除一些不必要的元数据
    if (snapshots.value.length > maxSnapshots / 2) {
      // eslint-disable-next-line ts/no-unused-vars
      const { metadata, ...compressed } = snapshot
      return compressed as TemplateSnapshot<T>
    }
    
    return snapshot
  }

  /**
   * 保存快照到本地存储
   */
  const persistSnapshots = () => {
    if (!enablePersistence) return
    
    try {
      const data = {
        snapshots: snapshots.value,
        currentIndex: currentSnapshotIndex.value,
      }
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to persist snapshots:', error)
    }
  }

  /**
   * 从本地存储恢复快照
   */
  const restoreSnapshots = () => {
    if (!enablePersistence) return
    
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        snapshots.value = data.snapshots || []
        currentSnapshotIndex.value = data.currentIndex ?? -1
        
        // 恢复当前数据
        if (currentSnapshotIndex.value >= 0 && snapshots.value[currentSnapshotIndex.value]) {
          currentData.value = deepClone(snapshots.value[currentSnapshotIndex.value].data) as T
        }
      }
    } catch (error) {
      console.error('Failed to restore snapshots:', error)
    }
  }

  /**
   * 创建快照
   */
  const takeSnapshot = (description?: string, metadata?: Record<string, any>, tags?: string[]) => {
    if (isApplyingSnapshot.value) return

    const snapshot: TemplateSnapshot<T> = {
      id: generateSnapshotId(),
      timestamp: Date.now(),
      data: deepClone(currentData.value),
      description,
      metadata,
      tags,
    }

    // 如果当前不在最新快照位置，删除后面的快照
    if (currentSnapshotIndex.value < snapshots.value.length - 1) {
      snapshots.value = snapshots.value.slice(0, currentSnapshotIndex.value + 1)
    }

    // 添加新快照
    snapshots.value.push(compressSnapshot(snapshot) as any)
    currentSnapshotIndex.value = snapshots.value.length - 1

    // 限制快照数量
    if (snapshots.value.length > maxSnapshots) {
      const removeCount = snapshots.value.length - maxSnapshots
      snapshots.value = snapshots.value.slice(removeCount)
      currentSnapshotIndex.value -= removeCount
    }

    persistSnapshots()

    return snapshot
  }

  /**
   * 应用快照
   */
  const applySnapshot = (snapshot: TemplateSnapshot<T>) => {
    isApplyingSnapshot.value = true
    currentData.value = deepClone(snapshot.data) as T
    
    // 使用 nextTick 确保数据已更新
    setTimeout(() => {
      isApplyingSnapshot.value = false
    }, 0)
  }

  /**
   * 撤销
   */
  const undo = () => {
    if (!canUndo.value) return

    currentSnapshotIndex.value--
    const snapshot = snapshots.value[currentSnapshotIndex.value]
    if (snapshot) {
      applySnapshot(snapshot as any)
    }
  }

  /**
   * 重做
   */
  const redo = () => {
    if (!canRedo.value) return

    currentSnapshotIndex.value++
    const snapshot = snapshots.value[currentSnapshotIndex.value]
    if (snapshot) {
      applySnapshot(snapshot as any)
    }
  }

  /**
   * 跳转到指定快照
   */
  const goto = (snapshotId: string) => {
    const index = snapshots.value.findIndex((s) => s.id === snapshotId)
    if (index === -1) {
      console.warn(`Snapshot not found: ${snapshotId}`)
      return
    }

    currentSnapshotIndex.value = index
    applySnapshot(snapshots.value[index] as any)
  }

  /**
   * 跳转到指定索引
   */
  const gotoIndex = (index: number) => {
    if (index < 0 || index >= snapshots.value.length) {
      console.warn(`Invalid snapshot index: ${index}`)
      return
    }

    currentSnapshotIndex.value = index
    applySnapshot(snapshots.value[index] as any)
  }

  /**
   * 重置到初始状态
   */
  const reset = () => {
    snapshots.value = []
    currentSnapshotIndex.value = -1
    currentData.value = (deepClone(initialData) as T) || (initialData as any)
    persistSnapshots()
  }

  /**
   * 清除所有快照
   */
  const clearSnapshots = () => {
    snapshots.value = []
    currentSnapshotIndex.value = -1
    persistSnapshots()
  }

  /**
   * 删除指定快照
   */
  const deleteSnapshot = (snapshotId: string) => {
    const index = snapshots.value.findIndex((s) => s.id === snapshotId)
    if (index === -1) return

    snapshots.value.splice(index, 1)
    
    // 调整当前索引
    if (currentSnapshotIndex.value > index) {
      currentSnapshotIndex.value--
    } else if (currentSnapshotIndex.value === index) {
      // 如果删除的是当前快照，跳转到前一个
      if (currentSnapshotIndex.value > 0) {
        currentSnapshotIndex.value--
        applySnapshot(snapshots.value[currentSnapshotIndex.value] as any)
      } else if (snapshots.value.length > 0) {
        applySnapshot(snapshots.value[0] as any)
      }
    }

    persistSnapshots()
  }

  /**
   * 获取快照列表
   */
  const getSnapshots = () => {
    return snapshots.value.map((snapshot) => ({
      id: snapshot.id,
      timestamp: snapshot.timestamp,
      description: snapshot.description,
      tags: snapshot.tags,
      isCurrent: snapshot.id === currentSnapshot.value?.id,
    }))
  }

  /**
   * 搜索快照
   */
  const searchSnapshots = (query: {
    tags?: string[]
    startTime?: number
    endTime?: number
    description?: string
  }) => {
    return snapshots.value.filter((snapshot) => {
      if (query.tags && query.tags.length > 0) {
        if (!snapshot.tags?.some((tag) => query.tags!.includes(tag))) {
          return false
        }
      }
      
      if (query.startTime && snapshot.timestamp < query.startTime) {
        return false
      }
      
      if (query.endTime && snapshot.timestamp > query.endTime) {
        return false
      }
      
      if (query.description && snapshot.description) {
        if (!snapshot.description.toLowerCase().includes(query.description.toLowerCase())) {
          return false
        }
      }
      
      return true
    })
  }

  /**
   * 比较两个快照
   */
  const compareSnapshots = (snapshotId1: string, snapshotId2: string) => {
    const snapshot1 = snapshots.value.find((s) => s.id === snapshotId1)
    const snapshot2 = snapshots.value.find((s) => s.id === snapshotId2)
    
    if (!snapshot1 || !snapshot2) {
      console.warn('Snapshot not found for comparison')
      return null
    }

    // 简单的对象差异比较
    const getDiff = (obj1: any, obj2: any, path = ''): any[] => {
      const diffs: any[] = []
      
      const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})])
      
      keys.forEach((key) => {
        const newPath = path ? `${path}.${key}` : key
        const val1 = obj1?.[key]
        const val2 = obj2?.[key]
        
        if (typeof val1 === 'object' && typeof val2 === 'object') {
          diffs.push(...getDiff(val1, val2, newPath))
        } else if (val1 !== val2) {
          diffs.push({
            path: newPath,
            oldValue: val1,
            newValue: val2,
          })
        }
      })
      
      return diffs
    }

    return {
      snapshot1: { id: snapshot1.id, timestamp: snapshot1.timestamp },
      snapshot2: { id: snapshot2.id, timestamp: snapshot2.timestamp },
      differences: getDiff(snapshot1.data, snapshot2.data),
    }
  }

  /**
   * 导出快照
   */
  const exportSnapshots = (format: 'json' | 'csv' = 'json') => {
    if (format === 'json') {
      return JSON.stringify({
        snapshots: snapshots.value,
        currentIndex: currentSnapshotIndex.value,
        exportedAt: new Date().toISOString(),
      }, null, 2)
    }
    
    // CSV 导出（简化版本）
    const headers = ['ID', 'Timestamp', 'Description', 'Tags']
    const rows = snapshots.value.map((s) => [
      s.id,
      new Date(s.timestamp).toISOString(),
      s.description || '',
      (s.tags || []).join(';'),
    ])
    
    return [headers, ...rows].map((row) => row.join(',')).join('\n')
  }

  /**
   * 导入快照
   */
  const importSnapshots = (data: string) => {
    try {
      const imported = JSON.parse(data)
      snapshots.value = imported.snapshots || []
      currentSnapshotIndex.value = imported.currentIndex ?? -1
      
      if (currentSnapshotIndex.value >= 0 && snapshots.value[currentSnapshotIndex.value]) {
        applySnapshot(snapshots.value[currentSnapshotIndex.value] as any)
      }
      
      persistSnapshots()
      return true
    } catch (error) {
      console.error('Failed to import snapshots:', error)
      return false
    }
  }

  // 初始化
  if (enablePersistence) {
    restoreSnapshots()
  } else {
    // 创建初始快照
    takeSnapshot('Initial state', { isInitial: true })
  }

  // 自动保存
  let autoSaveTimer: ReturnType<typeof setInterval> | null = null
  if (autoSave) {
    autoSaveTimer = setInterval(() => {
      takeSnapshot('Auto save', { isAutoSave: true })
    }, autoSaveInterval)
  }

  // 监听数据变化（可选）
  const unwatch = watch(
    currentData,
    () => {
      // 可以在这里添加自动创建快照的逻辑
    },
    { deep: true }
  )

  // 清理
  const cleanup = () => {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
    unwatch()
  }

  // 组件卸载时自动清理
  onUnmounted(cleanup)

  return {
    // 状态
    currentData,
    snapshots: computed(() => snapshots.value),
    currentSnapshot,
    currentSnapshotIndex: computed(() => currentSnapshotIndex.value),
    snapshotCount,
    
    // 时间旅行
    canUndo,
    canRedo,
    undo,
    redo,
    goto,
    gotoIndex,
    reset,
    
    // 快照管理
    takeSnapshot,
    clearSnapshots,
    deleteSnapshot,
    getSnapshots,
    searchSnapshots,
    compareSnapshots,
    
    // 导入导出
    exportSnapshots,
    importSnapshots,
    
    // 工具
    cleanup,
  }
}

/**
 * 使用时间旅行（简化版）
 */
export function useTimeTravel<T = any>(initialData: T | Ref<T>, options: SnapshotOptions = {}) {
  const snapshot = useTemplateSnapshot(initialData, options)
  
  return {
    data: snapshot.currentData,
    canUndo: snapshot.canUndo,
    canRedo: snapshot.canRedo,
    undo: snapshot.undo,
    redo: snapshot.redo,
    goto: snapshot.goto,
    reset: snapshot.reset,
    takeSnapshot: snapshot.takeSnapshot,
  }
}
