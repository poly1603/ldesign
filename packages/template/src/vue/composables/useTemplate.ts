/**
 * 模板管理 Composition API
 * 提供响应式的模板管理功能
 */

import { ref, computed, onMounted, onUnmounted, inject, provide, type Ref } from 'vue'
import { TemplateManager } from '../../core/template-manager'
import type {
  TemplateManagerConfig,
  TemplateInfo,
  DeviceType,
  LoadResult,
  TemplateEvents,
} from '../../types'

// 注入键
export const TEMPLATE_MANAGER_KEY = Symbol('template-manager')

/**
 * useTemplate 选项
 */
export interface UseTemplateOptions extends Partial<TemplateManagerConfig> {
  /** 是否自动初始化 */
  autoInit?: boolean
  /** 是否自动扫描模板 */
  autoScan?: boolean
}

/**
 * useTemplate 返回值
 */
export interface UseTemplateReturn {
  // 状态
  currentTemplate: Ref<TemplateInfo | null>
  currentDevice: Ref<DeviceType>
  loading: Ref<boolean>
  error: Ref<Error | null>
  availableTemplates: Ref<TemplateInfo[]>
  availableCategories: Ref<string[]>
  availableDevices: Ref<DeviceType[]>
  initialized: Ref<boolean>

  // 方法
  initialize: () => Promise<void>
  scanTemplates: () => Promise<{ count: number; templates: TemplateInfo[]; duration: number }>
  render: (category: string, deviceType?: DeviceType, templateName?: string, props?: Record<string, any>) => Promise<LoadResult>
  switchTemplate: (category: string, templateName: string, deviceType?: DeviceType) => Promise<LoadResult>
  getTemplates: (category?: string, deviceType?: DeviceType) => TemplateInfo[]
  hasTemplate: (category: string, deviceType?: DeviceType, templateName?: string) => boolean
  clearCache: (category?: string, deviceType?: DeviceType) => void
  refresh: () => Promise<void>
  setDeviceType: (deviceType: DeviceType) => void

  // 事件
  on: <K extends keyof TemplateEvents>(event: K, listener: TemplateEvents[K]) => void
  off: <K extends keyof TemplateEvents>(event: K, listener: TemplateEvents[K]) => void

  // 管理器实例
  manager: TemplateManager
}

/**
 * 模板管理 Hook
 */
export function useTemplate(options: UseTemplateOptions = {}): UseTemplateReturn {
  // 尝试从上下文获取管理器实例
  const injectedManager = inject<TemplateManager>(TEMPLATE_MANAGER_KEY, null)

  // 创建或使用注入的管理器
  const manager = injectedManager || new TemplateManager(options)

  // 确保管理器已初始化
  if (!injectedManager && !initialized.value) {
    manager.initialize().catch(console.error)
  }

  // 响应式状态
  const currentTemplate = ref<TemplateInfo | null>(null)
  const currentDevice = ref<DeviceType>(manager.getCurrentDevice() || 'desktop')
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const availableTemplates = ref<TemplateInfo[]>([])
  const availableCategories = ref<string[]>([])
  const availableDevices = ref<DeviceType[]>([])
  const initialized = ref(false)

  // 计算属性
  const isReady = computed(() => initialized.value && !loading.value)

  // 方法
  const updateState = () => {
    availableTemplates.value = manager.getTemplates()
    availableCategories.value = manager.getCategories()
    currentDevice.value = manager.getCurrentDevice()
  }

  const initialize = async () => {
    if (initialized.value) return

    try {
      loading.value = true
      error.value = null

      await manager.initialize()
      updateState()
      initialized.value = true
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const scanTemplates = async () => {
    try {
      loading.value = true
      error.value = null

      const result = await manager.scanTemplates()
      updateState()
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const render = async (
    category: string,
    deviceType?: DeviceType,
    templateName?: string,
    props?: Record<string, any>
  ): Promise<LoadResult> => {
    try {
      loading.value = true
      error.value = null

      const result = await manager.render(category, deviceType, templateName, props)
      currentTemplate.value = result.template
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const switchTemplate = async (
    category: string,
    templateName: string,
    deviceType?: DeviceType
  ): Promise<LoadResult> => {
    try {
      loading.value = true
      error.value = null

      const result = await manager.switchTemplate(category, templateName, deviceType)
      currentTemplate.value = result.template
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const getTemplates = (category?: string, deviceType?: DeviceType): TemplateInfo[] => {
    return manager.getTemplates(category, deviceType)
  }

  const hasTemplate = (category: string, deviceType?: DeviceType, templateName?: string): boolean => {
    return manager.hasTemplate(category, deviceType, templateName)
  }

  const clearCache = (category?: string, deviceType?: DeviceType) => {
    manager.clearCache(category, deviceType)
  }

  const refresh = async () => {
    try {
      loading.value = true
      error.value = null

      await manager.refresh()
      updateState()
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  const setDeviceType = (deviceType: DeviceType) => {
    manager.setDeviceType(deviceType)
    currentDevice.value = deviceType
  }

  const on = <K extends keyof TemplateEvents>(event: K, listener: TemplateEvents[K]) => {
    manager.on(event, listener)
  }

  const off = <K extends keyof TemplateEvents>(event: K, listener: TemplateEvents[K]) => {
    manager.off(event, listener)
  }

  // 事件监听
  const setupEventListeners = () => {
    manager.on('device:change', (from, to) => {
      currentDevice.value = to
    })

    manager.on('template:loaded', (template) => {
      currentTemplate.value = template
    })

    manager.on('template:error', (templateId, err) => {
      error.value = err
    })
  }

  // 生命周期
  onMounted(async () => {
    setupEventListeners()

    if (options.autoInit !== false) {
      await initialize()
    }

    if (options.autoScan !== false && initialized.value) {
      await scanTemplates()
    }
  })

  onUnmounted(() => {
    // 清理事件监听器
    // 注意：这里不销毁管理器，因为可能被其他组件使用
  })

  return {
    // 状态
    currentTemplate,
    currentDevice,
    loading,
    error,
    availableTemplates,
    availableCategories,
    availableDevices,
    initialized,

    // 方法
    initialize,
    scanTemplates,
    render,
    switchTemplate,
    getTemplates,
    hasTemplate,
    clearCache,
    refresh,
    setDeviceType,

    // 事件
    on,
    off,

    // 管理器实例
    manager,
  }
}

/**
 * 提供模板管理器到子组件
 */
export function provideTemplateManager(manager: TemplateManager) {
  provide(TEMPLATE_MANAGER_KEY, manager)
}

/**
 * 从上下文注入模板管理器
 */
export function useTemplateManager(): TemplateManager {
  const manager = inject<TemplateManager>(TEMPLATE_MANAGER_KEY)
  if (!manager) {
    throw new Error('Template manager not provided. Use provideTemplateManager() in parent component.')
  }
  return manager
}

/**
 * 模板缓存 Hook
 */
export function useTemplateCache() {
  const manager = useTemplateManager()

  const clearCache = (pattern?: string) => {
    manager.clearCache(pattern)
  }

  const getCacheStats = () => {
    // 这里需要扩展 TemplateManager 来提供缓存统计
    return {
      size: 0,
      hitRate: 0,
    }
  }

  return {
    clearCache,
    getCacheStats,
  }
}

/**
 * 模板扫描器 Hook
 */
export function useTemplateScanner() {
  const manager = useTemplateManager()

  const scan = async () => {
    return await manager.scanTemplates()
  }

  const refresh = async () => {
    return await manager.refresh()
  }

  return {
    scan,
    refresh,
  }
}
