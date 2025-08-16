/**
 * useTemplate 组合式函数 - 重构版本
 *
 * 提供响应式的模板管理功能
 */

import type {
  DeviceType,
  TemplateLoadResult,
  TemplateMetadata,
  TemplateRenderOptions,
  TemplateScanResult,
  UseTemplateOptions,
  UseTemplateReturn,
} from '../../types'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { TemplateManager } from '../../core/manager'

/**
 * 创建模板管理器实例
 */
export function createTemplateManager(options?: UseTemplateOptions) {
  return new TemplateManager(options)
}

/**
 * useTemplate 组合式函数
 */
export function useTemplate(options: UseTemplateOptions = {}): UseTemplateReturn {
  // 创建管理器实例
  const manager = new TemplateManager(options)

  // 响应式状态
  const currentDevice = ref<DeviceType>('desktop')
  const currentTemplate = ref<TemplateMetadata | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const templates = ref<TemplateMetadata[]>([])

  // 计算属性
  const availableTemplates = computed(() => templates.value)

  // 扫描模板
  const scanTemplates = async (): Promise<TemplateScanResult> => {
    loading.value = true
    error.value = null

    try {
      const result = await manager.scanTemplates()
      templates.value = result.templates
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  // 渲染模板
  const render = async (options: TemplateRenderOptions): Promise<TemplateLoadResult> => {
    loading.value = true
    error.value = null

    try {
      const result = await manager.render(options)
      currentTemplate.value = result.metadata
      return result
    } catch (err) {
      error.value = err as Error
      throw err
    } finally {
      loading.value = false
    }
  }

  // 切换模板
  const switchTemplate = async (category: string, device: DeviceType, template: string): Promise<void> => {
    await render({ category, device, template })
  }

  // 获取模板列表
  const getTemplates = (category?: string, device?: DeviceType): TemplateMetadata[] => {
    return manager.getTemplates(category, device)
  }

  // 检查模板是否存在
  const hasTemplate = (category: string, device: DeviceType, template: string): boolean => {
    return manager.hasTemplate(category, device, template)
  }

  // 清空缓存
  const clearCache = (): void => {
    manager.clearCache()
  }

  // 刷新模板列表
  const refresh = async (): Promise<void> => {
    await manager.refresh()
    templates.value = manager.getTemplates()
  }

  // 设置事件监听器
  const setupEventListeners = () => {
    manager.on('device:change', (event: any) => {
      currentDevice.value = event.newDevice
    })

    manager.on('template:change', (event: any) => {
      currentTemplate.value = event.newTemplate
    })

    manager.on('scan:complete', (event: any) => {
      templates.value = event.scanResult.templates
    })
  }

  // 生命周期
  onMounted(async () => {
    setupEventListeners()
    currentDevice.value = manager.getCurrentDevice()

    if (options.autoScan !== false) {
      await scanTemplates()
    }

    if (options.initialTemplate) {
      const { category, device, template } = options.initialTemplate
      await switchTemplate(category, device || currentDevice.value, template)
    }
  })

  onUnmounted(() => {
    manager.destroy()
  })

  return {
    // 状态
    currentDevice,
    currentTemplate,
    loading,
    error,
    availableTemplates,

    // 方法
    scanTemplates,
    render,
    switchTemplate,
    getTemplates,
    hasTemplate,
    clearCache,
    refresh,
  }
}
