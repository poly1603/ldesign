import { type Component, type Ref, onMounted, onUnmounted, ref } from 'vue'
import type {
  DeviceType,
  TemplateManagerConfig,
  TemplateMetadata,
  TemplateRenderOptions,
} from '../../types'
import { TemplateManager } from '../../core/TemplateManager'

/**
 * 模板 Composable 选项
 */
export interface UseTemplateOptions extends TemplateManagerConfig {
  /** 是否自动扫描模板 */
  autoScan?: boolean
  /** 是否自动检测设备变化 */
  autoDetectDevice?: boolean
  /** 初始模板配置 */
  initialTemplate?: {
    category: string
    device?: DeviceType
    template: string
  }
}

/**
 * 模板 Composable 返回值
 */
export interface UseTemplateReturn {
  /** 模板管理器实例 */
  manager: TemplateManager
  /** 当前模板 */
  currentTemplate: Ref<TemplateMetadata | undefined>
  /** 当前设备类型 */
  currentDevice: Ref<DeviceType>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 可用模板列表 */
  availableTemplates: Ref<TemplateMetadata[]>
  /** 可用分类列表 */
  availableCategories: Ref<string[]>
  /** 可用设备类型列表 */
  availableDevices: Ref<DeviceType[]>

  // 方法
  /** 扫描模板 */
  scanTemplates: () => Promise<void>
  /** 渲染模板 */
  render: (options: TemplateRenderOptions) => Promise<Component>
  /** 切换模板 */
  switchTemplate: (category: string, device: DeviceType, template: string) => Promise<void>
  /** 获取模板列表 */
  getTemplates: (category?: string, device?: DeviceType) => Promise<TemplateMetadata[]>
  /** 检查模板是否存在 */
  hasTemplate: (category: string, device: DeviceType, template: string) => Promise<boolean>
  /** 清空缓存 */
  clearCache: () => void
  /** 刷新模板列表 */
  refresh: () => Promise<void>
}

/**
 * 全局模板管理器实例
 */
let globalManager: TemplateManager | null = null

/**
 * 获取全局模板管理器
 */
function getGlobalManager(config?: TemplateManagerConfig): TemplateManager {
  if (!globalManager) {
    globalManager = new TemplateManager(config)
  }
  return globalManager
}

/**
 * 模板管理 Composable
 */
export function useTemplate(options: UseTemplateOptions = {}): UseTemplateReturn {
  const {
    autoScan = true,
    autoDetectDevice = true,
    initialTemplate,
    ...managerConfig
  } = options

  // 获取或创建管理器实例
  const manager = getGlobalManager(managerConfig)

  // 响应式状态
  const currentTemplate = ref<TemplateMetadata | undefined>(manager.getCurrentTemplate())
  const currentDevice = ref<DeviceType>(manager.getCurrentDevice())
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const availableTemplates = ref<TemplateMetadata[]>([])
  const availableCategories = ref<string[]>([])
  const availableDevices = ref<DeviceType[]>([])

  // 计算属性
  // const isReady = computed(() => !loading.value && !error.value)

  // 事件监听器清理函数
  const cleanupFunctions: (() => void)[] = []

  /**
   * 扫描模板
   */
  const scanTemplates = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await manager.scanTemplates()
      await updateAvailableData()
    }
    catch (err) {
      error.value = err as Error
      console.error('Failed to scan templates:', err)
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 更新可用数据
   */
  const updateAvailableData = async (): Promise<void> => {
    try {
      const [templates, categories, devices] = await Promise.all([
        manager.getAvailableTemplates(),
        manager.getAvailableCategories(),
        manager.getAvailableDevices()
      ])

      availableTemplates.value = templates
      availableCategories.value = categories
      availableDevices.value = devices
    }
    catch (err) {
      console.warn('Failed to update available data:', err)
    }
  }

  /**
   * 渲染模板
   */
  const render = async (options: TemplateRenderOptions): Promise<Component> => {
    loading.value = true
    error.value = null

    try {
      const component = await manager.render(options)
      return component
    }
    catch (err) {
      error.value = err as Error
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 切换模板
   */
  const switchTemplate = async (
    category: string,
    device: DeviceType,
    template: string
  ): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      await manager.switch(category, device, template)
      currentTemplate.value = manager.getCurrentTemplate()
    }
    catch (err) {
      error.value = err as Error
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 获取模板列表
   */
  const getTemplates = async (
    category?: string,
    device?: DeviceType
  ): Promise<TemplateMetadata[]> => {
    return manager.getAvailableTemplates(category, device)
  }

  /**
   * 检查模板是否存在
   */
  const hasTemplate = async (
    category: string,
    device: DeviceType,
    template: string
  ): Promise<boolean> => {
    return manager.hasTemplate(category, device, template)
  }

  /**
   * 清空缓存
   */
  const clearCache = (): void => {
    manager.clearCache()
  }

  /**
   * 刷新模板列表
   */
  const refresh = async (): Promise<void> => {
    manager.clearCache()
    await scanTemplates()
  }

  // 设置事件监听器
  onMounted(() => {
    // 监听模板变化
    const unsubscribeTemplateChange = manager.on('template:change', (event) => {
      currentTemplate.value = event.to
    })
    cleanupFunctions.push(unsubscribeTemplateChange)

    // 监听设备变化
    if (autoDetectDevice) {
      const unsubscribeDeviceChange = manager.on('device:change', (device) => {
        currentDevice.value = device
      })
      cleanupFunctions.push(unsubscribeDeviceChange)
    }

    // 监听错误
    const unsubscribeError = manager.on('template:error', (err) => {
      error.value = err
    })
    cleanupFunctions.push(unsubscribeError)

    // 自动扫描模板
    if (autoScan) {
      scanTemplates().then(() => {
        // 如果指定了初始模板，尝试切换到该模板
        if (initialTemplate) {
          const { category, template } = initialTemplate
          const device = initialTemplate.device || currentDevice.value
          switchTemplate(category, device, template).catch(console.warn)
        }
      })
    }
  })

  // 清理资源
  onUnmounted(() => {
    cleanupFunctions.forEach(cleanup => cleanup())
    cleanupFunctions.length = 0
  })

  return {
    manager,
    currentTemplate,
    currentDevice,
    loading,
    error,
    availableTemplates,
    availableCategories,
    availableDevices,
    scanTemplates,
    render,
    switchTemplate,
    getTemplates,
    hasTemplate,
    clearCache,
    refresh
  }
}

/**
 * 创建独立的模板管理器实例
 */
export function createTemplateManager(config?: TemplateManagerConfig): TemplateManager {
  return new TemplateManager(config)
}

/**
 * 销毁全局模板管理器
 */
export function destroyGlobalManager(): void {
  if (globalManager) {
    globalManager.destroy()
    globalManager = null
  }
}
