/**
 * useTemplate 组合式函数
 * 提供模板管理的响应式接口
 */

// 导入 Vue 类型
import type { Ref } from 'vue'
// Vue 类型兼容性处理
import type { VueComponent } from '../../types'
import type {
  DeviceType,
  EventData,
  TemplateInfo,
  TemplateManagerConfig,
} from '../../types'

import { TemplateManager } from '../../core/manager'

let vueRef: any, vueComputed: any, vueOnMounted: any, vueOnUnmounted: any, vueWatch: any
try {
  const vue = require('vue')
  vueRef = vue.ref
  vueComputed = vue.computed
  vueOnMounted = vue.onMounted
  vueOnUnmounted = vue.onUnmounted
  vueWatch = vue.watch
}
catch {
  // 在非Vue环境中提供mock实现
  vueRef = (value: any) => ({ value })
  vueComputed = (_fn: any) => ({ value: _fn() })
  vueOnMounted = (_fn: any) => _fn()
  vueOnUnmounted = (_fn: any) => { }
  vueWatch = (_source: any, _callback: any) => { }
}

const ref = vueRef
const computed = vueComputed
const onMounted = vueOnMounted
const onUnmounted = vueOnUnmounted
const watch = vueWatch

/**
 * useTemplate 选项接口
 */
export interface UseTemplateOptions {
  template: string
  deviceType?: DeviceType
  scanPaths?: string | string[]
  autoLoad?: boolean
  config?: TemplateManagerConfig
}

/**
 * useTemplate 返回值接口
 */
export interface UseTemplateReturn {
  // 状态
  templateComponent: any
  loading: any
  error: any
  currentDeviceType: any
  templateInfo: any
  currentTemplate: any
  isLoading: any
  templates: any

  // 方法
  loadTemplate: (template: string, deviceType?: DeviceType) => Promise<void>
  clearCache: (template?: string, deviceType?: DeviceType) => void
  preloadTemplate: (template: string, deviceType?: DeviceType) => Promise<void>
  getTemplateInfo: (template: string, deviceType?: DeviceType) => TemplateInfo | null
  hasTemplate: (template: string, deviceType?: DeviceType) => boolean
  scanTemplates: () => Promise<void>
  switchTemplate: (template: string) => Promise<void>
  render: (template: string) => Promise<any>
  refresh: () => Promise<void>

  // 管理器实例
  manager: TemplateManager
}

// 全局管理器实例缓存
const managerCache = new Map<string, TemplateManager>()

/**
 * 获取或创建管理器实例
 */
function getManager(config?: TemplateManagerConfig): TemplateManager {
  const configKey = JSON.stringify(config || {})

  if (!managerCache.has(configKey)) {
    const manager = new TemplateManager(config)
    managerCache.set(configKey, manager)
  }

  return managerCache.get(configKey)!
}

/**
 * useTemplate 组合式函数
 */
export function useTemplate(
  config?: TemplateManagerConfig,
  options?: UseTemplateOptions
): UseTemplateReturn
export function useTemplate(
  optionsOrConfig?: UseTemplateOptions | TemplateManagerConfig
): UseTemplateReturn
export function useTemplate(
  configOrOptions?: TemplateManagerConfig | UseTemplateOptions,
  options?: UseTemplateOptions,
): UseTemplateReturn {
  // 处理参数重载
  let config: TemplateManagerConfig | undefined
  let templateOptions: UseTemplateOptions

  if (arguments.length === 1) {
    // 单参数情况，判断是config还是options
    const arg = configOrOptions as any
    if (arg && ('template' in arg || 'deviceType' in arg || 'scanPaths' in arg)) {
      // 是UseTemplateOptions
      templateOptions = arg as UseTemplateOptions
      config = undefined
    }
    else {
      // 是TemplateManagerConfig
      config = arg as TemplateManagerConfig
      templateOptions = { template: '', autoLoad: false }
    }
  }
  else {
    // 双参数情况
    config = configOrOptions as TemplateManagerConfig
    templateOptions = options || { template: '', autoLoad: false }
  }
  // 响应式状态
  const templateComponent = ref(null) as Ref<VueComponent | null>
  const loading = ref(false)
  const error = ref(null) as Ref<Error | null>
  const currentDeviceType = ref('desktop') as Ref<DeviceType>
  const templateInfo = ref(null) as Ref<TemplateInfo | null>
  const currentTemplate = ref(null) as Ref<any>
  const isLoading = ref(false)
  const templates = ref([]) as Ref<any[]>

  // 获取管理器实例
  const manager = getManager(config || templateOptions.config)

  // 计算属性
  const isInitialized = computed(() => manager.getStatus().initialized)

  // 事件监听器
  const eventListeners = new Map<string, (data: EventData) => void>()

  /**
   * 设置事件监听器
   */
  const setupEventListeners = () => {
    // 设备变化监听
    const deviceChangeListener = (data: EventData) => {
      if (data.data?.newDeviceType) {
        currentDeviceType.value = data.data.newDeviceType
        // 自动重新加载当前模板
        if (options?.template && options?.autoLoad) {
          loadTemplate(options.template)
        }
      }
    }

    // 模板加载事件监听
    const loadStartListener = () => {
      loading.value = true
      error.value = null
    }

    const loadCompleteListener = (data: EventData) => {
      loading.value = false
      if (data.data?.component) {
        templateComponent.value = data.data.component
      }
    }

    const loadErrorListener = (data: EventData) => {
      loading.value = false
      error.value = data.data?.error || new Error('Unknown error')
      templateComponent.value = null
    }

    // 注册监听器
    manager.on('device:change', deviceChangeListener)
    manager.on('template:load:start', loadStartListener)
    manager.on('template:load:complete', loadCompleteListener)
    manager.on('template:load:error', loadErrorListener)

    // 保存监听器引用以便清理
    eventListeners.set('device:change', deviceChangeListener)
    eventListeners.set('template:load:start', loadStartListener)
    eventListeners.set('template:load:complete', loadCompleteListener)
    eventListeners.set('template:load:error', loadErrorListener)
  }

  /**
   * 清理事件监听器
   */
  const cleanupEventListeners = () => {
    eventListeners.forEach((listener, event) => {
      manager.off(event, listener)
    })
    eventListeners.clear()
  }

  /**
   * 加载模板
   */
  const loadTemplate = async (template: string, deviceType?: DeviceType): Promise<void> => {
    try {
      loading.value = true
      error.value = null

      // 确保管理器已初始化
      if (!isInitialized.value) {
        await manager.initialize()
      }

      // 渲染模板
      const result = await manager.render(template, deviceType)

      if (result.success && result.component) {
        templateComponent.value = result.component
        templateInfo.value = result.templateInfo
        currentDeviceType.value = result.templateInfo.deviceType
      }
      else {
        throw result.error || new Error('Failed to load template')
      }
    }
    catch (err) {
      error.value = err as Error
      templateComponent.value = null
      templateInfo.value = null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 清除缓存
   */
  const clearCache = (template?: string, deviceType?: DeviceType): void => {
    manager.clearCache(template, deviceType)
  }

  /**
   * 预加载模板
   */
  const preloadTemplate = async (template: string, deviceType?: DeviceType): Promise<void> => {
    try {
      await manager.preloadTemplate(template, deviceType)
    }
    catch (err) {
      console.warn('Failed to preload template:', template, err)
    }
  }

  /**
   * 获取模板信息
   */
  const getTemplateInfo = (template: string, deviceType?: DeviceType): TemplateInfo | null => {
    return manager.getTemplateInfo(template, deviceType)
  }

  /**
   * 检查模板是否存在
   */
  const hasTemplate = (template: string, deviceType?: DeviceType): boolean => {
    return manager.hasTemplate(template, deviceType)
  }

  /**
   * 初始化
   */
  const initialize = async () => {
    try {
      // 设置事件监听器
      setupEventListeners()

      // 更新当前设备类型
      currentDeviceType.value = manager.getCurrentDevice()

      // 如果启用自动加载，加载初始模板
      if (templateOptions.autoLoad && templateOptions.template) {
        await loadTemplate(templateOptions.template, templateOptions.deviceType)
      }
    }
    catch (err) {
      console.error('Failed to initialize useTemplate:', err)
      error.value = err as Error
    }
  }

  // 监听选项变化
  watch(() => templateOptions.template, (newTemplate: any, oldTemplate: any) => {
    if (newTemplate !== oldTemplate && templateOptions.autoLoad) {
      loadTemplate(newTemplate, templateOptions.deviceType)
    }
  })

  watch(() => templateOptions.deviceType, (newDeviceType: any, oldDeviceType: any) => {
    if (newDeviceType !== oldDeviceType && templateOptions.template && templateOptions.autoLoad) {
      loadTemplate(templateOptions.template, newDeviceType)
    }
  })

  // 生命周期钩子
  onMounted(() => {
    initialize()
  })

  onUnmounted(() => {
    cleanupEventListeners()
  })

  // 添加缺失的方法
  const scanTemplates = async (): Promise<void> => {
    await manager.scanTemplates()
  }

  const switchTemplate = async (category: string, deviceType?: DeviceType) => {
    return await loadTemplate(category, deviceType)
  }

  const render = async (category: string, deviceType?: DeviceType) => {
    return await manager.render(category, deviceType)
  }

  const refresh = async () => {
    return await manager.refresh()
  }

  return {
    // 状态
    templateComponent,
    loading,
    error,
    currentDeviceType,
    templateInfo,
    currentTemplate,
    isLoading,
    templates,

    // 方法
    loadTemplate,
    clearCache,
    preloadTemplate,
    getTemplateInfo,
    hasTemplate,
    scanTemplates,
    switchTemplate,
    render,
    refresh,

    // 管理器实例
    manager,
  }
}

/**
 * useTemplateScanner 组合式函数
 * 提供模板扫描功能
 */
export interface UseTemplateScannerReturn {
  // 状态
  scanning: Ref<boolean>
  templateIndex: Ref<any>
  scanError: Ref<Error | null>

  // 方法
  rescan: (paths?: string | string[]) => Promise<void>
  getTemplateInfo: (category: string) => any
  hasTemplate: (category: string, deviceType?: DeviceType) => boolean
  getCategories: () => string[]
  getAvailableDeviceTypes: (category: string) => DeviceType[]
}

export function useTemplateScanner(config?: TemplateManagerConfig): UseTemplateScannerReturn {
  const scanning = ref(false)
  const templateIndex = ref(null)
  const scanError = ref(null) as Ref<Error | null>

  const manager = getManager(config)

  const rescan = async (paths?: string | string[]) => {
    try {
      scanning.value = true
      scanError.value = null

      if (paths) {
        // 更新扫描路径
        manager.updateConfig({
          scanner: { scanPaths: paths },
        })
      }

      const result = await manager.rescan()
      if (result.success) {
        templateIndex.value = result.index
      }
      else {
        throw new Error('Scan failed')
      }
    }
    catch (err) {
      scanError.value = err as Error
    }
    finally {
      scanning.value = false
    }
  }

  const getTemplateInfo = (category: string) => {
    return manager.getTemplateInfo(category)
  }

  const hasTemplate = (category: string, deviceType?: DeviceType): boolean => {
    return manager.hasTemplate(category, deviceType)
  }

  const getCategories = (): string[] => {
    return manager.getCategories()
  }

  const getAvailableDeviceTypes = (category: string): DeviceType[] => {
    return manager.getAvailableDeviceTypes(category)
  }

  // 初始化时获取当前索引
  onMounted(() => {
    const status = manager.getStatus()
    if (status.initialized) {
      templateIndex.value = manager.getAllTemplates()
    }
  })

  return {
    scanning,
    templateIndex,
    scanError,
    rescan,
    getTemplateInfo,
    hasTemplate,
    getCategories,
    getAvailableDeviceTypes,
  }
}

/**
 * useTemplateCache 组合式函数
 * 提供缓存管理功能
 */
export interface UseTemplateCacheReturn {
  // 状态
  cacheStats: Ref<any>

  // 方法
  clearCache: (template?: string, deviceType?: DeviceType) => void
  getCacheStats: () => any
  preloadTemplates: (templates: Array<{ category: string, deviceType?: DeviceType }>) => Promise<void>
}

export function useTemplateCache(config?: TemplateManagerConfig): UseTemplateCacheReturn {
  const cacheStats = ref({})

  const manager = getManager(config)

  const clearCache = (template?: string, deviceType?: DeviceType) => {
    manager.clearCache(template, deviceType)
    updateCacheStats()
  }

  const getCacheStats = () => {
    return manager.getCacheStats()
  }

  const preloadTemplates = async (templates: Array<{ category: string, deviceType?: DeviceType }>) => {
    const promises = templates.map(({ category, deviceType }) =>
      manager.preloadTemplate(category, deviceType),
    )
    await Promise.allSettled(promises)
    updateCacheStats()
  }

  const updateCacheStats = () => {
    cacheStats.value = getCacheStats()
  }

  // 定期更新缓存统计
  onMounted(() => {
    updateCacheStats()
    const timer = setInterval(updateCacheStats, 5000) // 每5秒更新一次

    onUnmounted(() => {
      clearInterval(timer)
    })
  })

  return {
    cacheStats,
    clearCache,
    getCacheStats,
    preloadTemplates,
  }
}
