/**
 * 热更新 Composable
 * 
 * 提供 Vue 组件中使用热更新的便捷接口
 */

import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import type { Ref } from 'vue'
import {
  type EnhancedHotReloadManager,
  type IncrementalUpdate,
  type UpdateNotification,
  type UpdateType,
  type VersionInfo,
  createEnhancedHotReloadManager,
} from '../utils/hot-reload-enhanced'

/**
 * 热更新状态
 */
export interface HotReloadState {
  /** 是否启用 */
  enabled: boolean
  /** 当前版本 */
  version: string
  /** 待处理更新数量 */
  pendingCount: number
  /** 最后更新时间 */
  lastUpdate: number | null
  /** 更新历史数量 */
  historyCount: number
}

/**
 * 热更新 Composable 返回值
 */
export interface UseHotReloadReturn {
  /** 热更新管理器 */
  manager: EnhancedHotReloadManager
  /** 当前状态 */
  state: Readonly<Ref<HotReloadState>>
  /** 当前版本信息 */
  currentVersion: Readonly<Ref<VersionInfo>>
  /** 通知列表 */
  notifications: Readonly<Ref<UpdateNotification[]>>
  /** 是否有通知 */
  hasNotifications: Readonly<Ref<boolean>>
  /** 监听更新 */
  onUpdate: (type: UpdateType, handler: (update: IncrementalUpdate) => void) => void
  /** 监听所有更新 */
  onAnyUpdate: (handler: (update: IncrementalUpdate) => void) => void
  /** 监听通知 */
  onNotify: (handler: (notification: UpdateNotification) => void) => void
  /** 添加更新 */
  addUpdate: (update: Omit<IncrementalUpdate, 'id' | 'version' | 'timestamp'>) => string
  /** 回滚到指定版本 */
  rollback: (version: string) => Promise<boolean>
  /** 获取历史记录 */
  getHistory: () => Array<{ id: string; version: string; timestamp: number; updateCount: number }>
  /** 清除通知 */
  clearNotifications: () => void
  /** 清除指定通知 */
  clearNotification: (id: string) => void
  /** 设置版本 */
  setVersion: (version: string, message?: string) => void
}

/**
 * 使用热更新
 */
export function useHotReload(): UseHotReloadReturn {
  // 创建或获取热更新管理器
  const manager = createEnhancedHotReloadManager({
    debug: import.meta.env?.DEV === true,
    enabled: import.meta.env?.DEV === true,
  })

  // 状态
  const state = ref<HotReloadState>({
    enabled: import.meta.env?.DEV === true,
    version: manager.getCurrentVersion().version,
    pendingCount: 0,
    lastUpdate: null,
    historyCount: 0,
  })

  // 当前版本
  const currentVersion = ref<VersionInfo>(manager.getCurrentVersion())

  // 通知列表
  const notifications = ref<UpdateNotification[]>([])

  // 是否有通知
  const hasNotifications = computed(() => notifications.value.length > 0)

  // 更新监听器
  const updateListeners = new Map<UpdateType, Set<(update: IncrementalUpdate) => void>>()
  const anyUpdateListeners = new Set<(update: IncrementalUpdate) => void>()

  /**
   * 更新状态
   */
  function updateState() {
    state.value = {
      enabled: import.meta.env?.DEV === true,
      version: manager.getCurrentVersion().version,
      pendingCount: 0,
      lastUpdate: Date.now(),
      historyCount: manager.getHistory().length,
    }
    currentVersion.value = manager.getCurrentVersion()
  }

  /**
   * 监听更新
   */
  function onUpdate(type: UpdateType, handler: (update: IncrementalUpdate) => void) {
    if (!updateListeners.has(type)) {
      updateListeners.set(type, new Set())

      // 注册到管理器
      manager.on(type, (update) => {
        // 通知所有监听器
        const listeners = updateListeners.get(type)
        if (listeners) {
          for (const listener of listeners) {
            listener(update)
          }
        }

        // 通知通用监听器
        for (const listener of anyUpdateListeners) {
          listener(update)
        }

        // 更新状态
        updateState()
      })
    }

    updateListeners.get(type)!.add(handler)
  }

  /**
   * 监听所有更新
   */
  function onAnyUpdate(handler: (update: IncrementalUpdate) => void) {
    anyUpdateListeners.add(handler)
  }

  /**
   * 监听通知
   */
  function onNotify(handler: (notification: UpdateNotification) => void) {
    manager.onNotification((notification) => {
      // 添加到通知列表
      notifications.value.push(notification)

      // 限制通知数量
      if (notifications.value.length > 50) {
        notifications.value.shift()
      }

      // 调用处理器
      handler(notification)
    })
  }

  /**
   * 添加更新
   */
  function addUpdate(update: Omit<IncrementalUpdate, 'id' | 'version' | 'timestamp'>): string {
    const id = manager.addUpdate(update)
    updateState()
    return id
  }

  /**
   * 回滚
   */
  async function rollback(version: string): Promise<boolean> {
    const result = await manager.rollback(version)
    if (result) {
      updateState()
    }
    return result
  }

  /**
   * 获取历史记录
   */
  function getHistory() {
    return manager.getHistory().map((entry) => ({
      id: entry.id,
      version: entry.version.version,
      timestamp: entry.timestamp,
      updateCount: entry.updates.length,
    }))
  }

  /**
   * 清除所有通知
   */
  function clearNotifications() {
    notifications.value = []
  }

  /**
   * 清除指定通知
   */
  function clearNotification(id: string) {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  /**
   * 设置版本
   */
  function setVersion(version: string, message?: string) {
    manager.setVersion(version, message)
    updateState()
  }

  // 生命周期
  onMounted(() => {
    updateState()
  })

  onUnmounted(() => {
    // 清理监听器
    updateListeners.clear()
    anyUpdateListeners.clear()
  })

  return {
    manager,
    state: computed(() => state.value),
    currentVersion: computed(() => currentVersion.value),
    notifications: computed(() => notifications.value),
    hasNotifications,
    onUpdate,
    onAnyUpdate,
    onNotify,
    addUpdate,
    rollback,
    getHistory,
    clearNotifications,
    clearNotification,
    setVersion,
  }
}

/**
 * 使用热更新通知
 * 
 * 简化版本，只处理通知
 */
export function useHotReloadNotifications() {
  const { notifications, hasNotifications, clearNotifications, clearNotification, onNotify } =
    useHotReload()

  // 自动注册通知监听
  onNotify((notification) => {
    console.log('[HMR] 收到通知:', notification)
  })

  return {
    notifications,
    hasNotifications,
    clearNotifications,
    clearNotification,
  }
}

/**
 * 使用热更新版本
 * 
 * 简化版本，只处理版本相关功能
 */
export function useHotReloadVersion() {
  const { currentVersion, setVersion, rollback, getHistory } = useHotReload()

  return {
    currentVersion,
    setVersion,
    rollback,
    getHistory,
  }
}
