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
import { destroyGlobalTemplateManager } from '../plugin'

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
  // 创建管理器实例，启用存储功能
  const manager = new TemplateManager({
    ...options,
    storage: {
      key: 'ldesign-template-selections',
      storage: 'localStorage',
      ...options.storage,
    },
  })

  // 响应式状态
  const currentDevice = ref<DeviceType>('desktop')
  const currentTemplate = ref<TemplateMetadata | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const templates = ref<TemplateMetadata[]>([])

  // 计算属性 - 根据选项过滤模板
  const availableTemplates = computed(() => {
    let filtered = templates.value

    if (options.category) {
      filtered = filtered.filter(t => t.category === options.category)
    }

    if (options.deviceType) {
      filtered = filtered.filter(t => t.device === options.deviceType)
    }

    return filtered
  })

  // 计算属性 - 可用分类列表
  const availableCategories = computed(() => {
    const categories = new Set(templates.value.map(t => t.category))
    return Array.from(categories)
  })

  // 计算属性 - 可用设备类型列表
  const availableDevices = computed(() => {
    const devices = new Set(templates.value.map(t => t.device))
    return Array.from(devices)
  })

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

    // 保存用户的模板选择到存储
    if (manager.storageManager) {
      manager.storageManager.saveSelection(category, device, template)

      if (options.debug) {
        console.log(`💾 保存模板选择: ${category}:${device} -> ${template}`)
      }
    }
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

  // 自动切换设备模板
  const autoSwitchDeviceTemplate = async (newDevice: DeviceType, category?: string) => {
    if (!category && options.category) {
      category = options.category
    }

    if (!category) {
      console.warn('无法自动切换模板：未指定分类')
      return
    }

    // 获取新设备类型的可用模板
    const deviceTemplates = templates.value.filter(t => t.category === category && t.device === newDevice)

    if (deviceTemplates.length === 0) {
      console.warn(`没有找到 ${newDevice} 设备的 ${category} 模板`)
      return
    }

    let targetTemplate: any = null

    // 1. 优先使用用户之前保存的选择
    if (manager.storageManager) {
      const savedSelection = manager.storageManager.getSelection(category, newDevice)
      if (savedSelection) {
        targetTemplate = deviceTemplates.find(t => t.template === savedSelection.template)

        if (targetTemplate && options.debug) {
          console.log(`📋 使用保存的模板选择: ${savedSelection.template}`)
        }
      }
    }

    // 2. 如果没有保存的选择，优先选择当前模板在新设备上的对应版本
    if (!targetTemplate) {
      targetTemplate = deviceTemplates.find(t => t.template === currentTemplate.value?.template)
    }

    // 3. 如果当前模板在新设备上不存在，选择第一个可用模板
    if (!targetTemplate) {
      targetTemplate = deviceTemplates[0]
    }

    try {
      await switchTemplate(category, newDevice, targetTemplate.template)

      if (options.debug) {
        console.log(`🔄 自动切换到 ${newDevice} 设备模板: ${targetTemplate.template}`)
      }
    } catch (error) {
      console.error('自动切换模板失败:', error)
    }
  }

  // 设置事件监听器
  const setupEventListeners = () => {
    manager.on('device:change', async (event: any) => {
      const oldDevice = currentDevice.value
      const newDevice = event.newDevice

      currentDevice.value = newDevice

      // 如果启用了自动设备检测，自动切换模板
      if (options.autoDetectDevice !== false && oldDevice !== newDevice) {
        await autoSwitchDeviceTemplate(newDevice)
      }
    })

    manager.on('template:change', (event: any) => {
      currentTemplate.value = event.newTemplate
    })

    manager.on('scan:complete', (event: any) => {
      templates.value = event.scanResult.templates
    })
  }

  // 初始化模板选择
  const initializeTemplate = async () => {
    const device = currentDevice.value
    const category = options.category

    if (!category) return

    // 1. 优先使用 initialTemplate 配置
    if (options.initialTemplate) {
      const { category: initCategory, device: initDevice, template } = options.initialTemplate
      await switchTemplate(initCategory, initDevice || device, template)
      return
    }

    // 2. 尝试恢复用户之前保存的选择
    if (manager.storageManager) {
      const savedSelection = manager.storageManager.getSelection(category, device)
      if (savedSelection) {
        // 检查保存的模板是否仍然可用
        const isTemplateAvailable = templates.value.some(
          t => t.category === category && t.device === device && t.template === savedSelection.template
        )

        if (isTemplateAvailable) {
          await switchTemplate(category, device, savedSelection.template)

          if (options.debug) {
            console.log(`🔄 恢复保存的模板选择: ${savedSelection.template}`)
          }
          return
        } else if (options.debug) {
          console.warn(`保存的模板 ${savedSelection.template} 不再可用`)
        }
      }
    }

    // 3. 如果没有保存的选择，使用第一个可用模板
    const availableForDevice = templates.value.filter(t => t.category === category && t.device === device)

    if (availableForDevice.length > 0) {
      await switchTemplate(category, device, availableForDevice[0].template)

      if (options.debug) {
        console.log(`🎯 使用默认模板: ${availableForDevice[0].template}`)
      }
    }
  }

  // 生命周期
  onMounted(async () => {
    setupEventListeners()
    currentDevice.value = manager.getCurrentDevice()

    if (options.autoScan !== false) {
      await scanTemplates()
    }

    // 初始化模板选择
    await initializeTemplate()
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
    availableCategories,
    availableDevices,

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

/**
 * 销毁全局模板管理器（测试用）
 */
export function destroyGlobalManager(): void {
  destroyGlobalTemplateManager()
}
