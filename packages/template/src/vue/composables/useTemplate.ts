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

  // 优先使用注入的管理器，如果没有则创建新的
  const manager = injectedManager || new TemplateManager(options)

  // 响应式状态
  const currentTemplate = ref<TemplateInfo | null>(null)
  const currentDevice = ref<DeviceType>(manager.getCurrentDevice() || 'desktop')
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const availableTemplates = ref<TemplateInfo[]>([])
  const availableCategories = ref<string[]>([])
  const availableDevices = ref<DeviceType[]>([])
  const initialized = ref(false) // 总是需要检查初始化状态

  // 计算属性
  const isReady = computed(() => initialized.value && !loading.value)

  // 方法
  const updateState = () => {
    availableTemplates.value = manager.getTemplates()
    availableCategories.value = manager.getCategories()
    currentDevice.value = manager.getCurrentDevice()
  }

  // 如果使用注入的管理器，立即更新状态
  if (injectedManager) {
    updateState()
  } else if (!initialized.value) {
    // 只有在没有注入管理器时才初始化新的管理器
    manager.initialize().catch(console.error)
  }

  // 监听全局模板注册事件
  const handleTemplatesRegistered = (event: CustomEvent) => {
    if (injectedManager) {
      // 如果使用注入的管理器，直接更新状态
      updateState()
    } else if (event.detail?.templates) {
      // 如果当前使用的是独立的管理器实例，也注册这些模板
      const templates = event.detail.templates

      // 直接注册模板（内置模板已经包含组件加载器）
      for (const template of templates) {
        manager.registerTemplate(template)
      }
      updateState()
      console.log(`useTemplate: 同步注册了 ${templates.length} 个模板`)
    }
  }

  // 在浏览器环境中监听事件
  if (typeof window !== 'undefined') {
    window.addEventListener('templates-registered', handleTemplatesRegistered as EventListener)
  }

  const initialize = async () => {
    if (initialized.value) return

    try {
      loading.value = true
      error.value = null

      // 如果使用注入的管理器，等待它初始化完成
      if (injectedManager) {
        // 等待注入的管理器初始化完成
        let retries = 0
        const maxRetries = 50 // 最多等待5秒
        while (!injectedManager.isInitialized && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100))
          retries++
        }

        if (!injectedManager.isInitialized) {
          console.warn('Injected template manager is not initialized after waiting')
        }
      } else {
        // 确保管理器已初始化
        if (!manager.isInitialized) {
          await manager.initialize()
        }
      }

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
    // 使用响应式的 availableTemplates 而不是直接调用 manager
    let templates = availableTemplates.value

    // 按分类过滤
    if (category) {
      templates = templates.filter(t => t.category === category)
    }

    // 按设备类型过滤
    if (deviceType) {
      templates = templates.filter(t => t.deviceType === deviceType)
    }

    return templates
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
    if (typeof window !== 'undefined') {
      window.removeEventListener('templates-registered', handleTemplatesRegistered as EventListener)
    }
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
