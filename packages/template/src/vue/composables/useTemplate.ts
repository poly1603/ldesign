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
  const currentDevice = ref<DeviceType>(manager.getCurrentDevice()) // 立即检测设备类型
  const currentTemplate = ref<TemplateMetadata | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const templates = ref<TemplateMetadata[]>([])



  // 计算属性 - 根据选项过滤模板
  const availableTemplates = computed(() => {
    let filtered = templates.value

    if (options.category) {
      filtered = filtered.filter((t: any) => t.category === options.category)
    }

    if (options.deviceType) {
      filtered = filtered.filter((t: any) => t.device === options.deviceType)
    }

    return filtered
  })

  // 计算属性 - 可用分类列表
  const availableCategories = computed(() => {
    const categories = new Set(templates.value.map((t: any) => t.category))
    return Array.from(categories)
  })

  // 计算属性 - 可用设备类型列表
  const availableDevices = computed(() => {
    const devices = new Set(templates.value.map((t: any) => t.device))
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
    const deviceTemplates = templates.value.filter((t: any) => t.category === category && t.device === newDevice)

    if (deviceTemplates.length === 0) {
      console.warn(`没有找到 ${newDevice} 设备的 ${category} 模板`)
      return
    }

    let targetTemplate: any = null

    // 1. 优先使用用户之前保存的选择
    if (manager.storageManager) {
      const savedSelection = manager.storageManager.getSelection(category, newDevice)
      if (savedSelection) {
        targetTemplate = deviceTemplates.find((t: any) => t.template === savedSelection.template)

        if (targetTemplate && options.debug) {
          console.log(`📋 使用保存的模板选择: ${savedSelection.template}`)
        }
      }
    }

    // 2. 如果没有保存的选择，优先选择当前模板在新设备上的对应版本
    if (!targetTemplate && currentTemplate.value) {
      targetTemplate = deviceTemplates.find((t: any) => t.template === currentTemplate.value?.template)

      if (targetTemplate && options.debug) {
        console.log(`🎯 找到相同名称的模板: ${targetTemplate.template}`)
      }
    }

    // 3. 如果当前模板在新设备上不存在，使用智能回退策略
    if (!targetTemplate) {
      // 使用 manager 的智能回退逻辑
      targetTemplate = manager.findFallbackTemplate(category, newDevice, currentTemplate.value?.template || '')

      if (targetTemplate && options.debug) {
        console.log(`🔄 使用智能回退模板: ${targetTemplate.template}`)
      }
    }

    // 4. 最后的保险：使用第一个可用模板
    if (!targetTemplate) {
      targetTemplate = deviceTemplates[0]

      if (options.debug) {
        console.log(`⚠️ 使用第一个可用模板: ${targetTemplate.template}`)
      }
    }

    try {
      await switchTemplate(category, newDevice, targetTemplate.template)

      if (options.debug) {
        console.log(`✅ 成功切换到 ${newDevice} 设备模板: ${targetTemplate.template}`)
      }
    } catch (error) {
      console.error('❌ 自动切换模板失败:', error)

      // 如果切换失败，尝试使用默认模板
      try {
        const defaultTemplate = deviceTemplates.find((t: any) => t.template === 'default') || deviceTemplates[0]
        if (defaultTemplate) {
          await switchTemplate(category, newDevice, defaultTemplate.template)
          console.log(`🔄 回退到默认模板: ${defaultTemplate.template}`)
        }
      } catch (fallbackError) {
        console.error('❌ 回退模板也失败了:', fallbackError)
      }
    }
  }

  // 设置事件监听器
  const setupEventListeners = () => {
    manager.on('device:change', async (event: any) => {
      const oldDevice = currentDevice.value
      const newDevice = event.newDevice

      if (options.debug) {
        console.log(`🎯 useTemplate 接收到设备变化事件: ${oldDevice} -> ${newDevice}`)
      }

      currentDevice.value = newDevice

      // 如果启用了自动设备检测，自动切换模板
      if (options.autoDetectDevice !== false && oldDevice !== newDevice) {
        if (options.debug) {
          console.log(`🔄 useTemplate 自动切换设备模板: ${oldDevice} -> ${newDevice}`)
        }
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
          (t: any) => t.category === category && t.device === device && t.template === savedSelection.template
        )

        if (isTemplateAvailable) {
          await switchTemplate(category, device, savedSelection.template)
          return
        }
      }
    }

    // 3. 如果没有保存的选择，使用第一个可用模板
    const availableForDevice = templates.value.filter((t: any) => t.category === category && t.device === device)

    if (availableForDevice.length > 0) {
      await switchTemplate(category, device, availableForDevice[0].template)
    }
  }

  // 生命周期
  onMounted(async () => {
    setupEventListeners()

    // 确保设备类型是最新的（可能在初始化后发生了变化）
    const latestDevice = manager.getCurrentDevice()
    if (latestDevice !== currentDevice.value) {
      currentDevice.value = latestDevice
    }

    // 先扫描模板
    if (options.autoScan !== false) {
      await scanTemplates()
    }

    // 然后初始化模板选择
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
