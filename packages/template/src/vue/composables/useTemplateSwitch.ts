/**
 * 智能模板切换组合式API
 */

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getDeviceInfo, watchDeviceChange, type DeviceType, type DeviceInfo } from '../../core/device'
import { getTemplate, getDefaultTemplate, getTemplatesByDevice, type TemplateInfo } from '../../core/template-manager'
import { getCachedTemplate, setCachedTemplate } from '../../core/cache'

export interface UseTemplateSwitchOptions {
  category: string
  initialVariant?: string
  autoSwitch?: boolean // 是否自动切换设备类型对应的模板
  cacheEnabled?: boolean // 是否启用缓存
  onDeviceChange?: (oldDevice: DeviceType, newDevice: DeviceType) => void
  onTemplateChange?: (template: TemplateInfo | null) => void
}

export interface UseTemplateSwitchReturn {
  // 状态
  deviceInfo: Readonly<Ref<DeviceInfo>>
  currentTemplate: Readonly<Ref<TemplateInfo | null>>
  currentVariant: Readonly<Ref<string>>
  availableTemplates: Readonly<Ref<TemplateInfo[]>>
  isLoading: Readonly<Ref<boolean>>
  
  // 方法
  switchTemplate: (variant: string) => Promise<boolean>
  switchToDefault: () => Promise<boolean>
  refreshDevice: () => void
  getTemplateComponent: () => any
  
  // 工具方法
  isCurrentTemplate: (variant: string) => boolean
  hasTemplate: (variant: string) => boolean
  getTemplateInfo: (variant: string) => TemplateInfo | null
}

export function useTemplateSwitch(options: UseTemplateSwitchOptions): UseTemplateSwitchReturn {
  const {
    category,
    initialVariant = '',
    autoSwitch = true,
    cacheEnabled = true,
    onDeviceChange,
    onTemplateChange
  } = options

  // 响应式状态
  const deviceInfo = ref<DeviceInfo>(getDeviceInfo())
  const currentVariant = ref<string>(initialVariant)
  const isLoading = ref<boolean>(false)
  const unwatchDevice = ref<(() => void) | null>(null)

  // 计算属性
  const availableTemplates = computed(() => {
    return getTemplatesByDevice(category, deviceInfo.value.type)
  })

  const currentTemplate = computed(() => {
    if (!currentVariant.value) return null
    return getTemplate(category, deviceInfo.value.type, currentVariant.value)
  })

  // 获取默认模板变体
  const getDefaultVariant = (): string => {
    // 1. 如果启用缓存，优先从缓存获取
    if (cacheEnabled) {
      const cached = getCachedTemplate(category, deviceInfo.value.type)
      if (cached && availableTemplates.value.some(t => t.variant === cached)) {
        return cached
      }
    }

    // 2. 获取设备类型的默认模板
    const defaultTemplate = getDefaultTemplate(category, deviceInfo.value.type)
    if (defaultTemplate) {
      return defaultTemplate.variant
    }

    // 3. 返回第一个可用模板
    return availableTemplates.value[0]?.variant || ''
  }

  // 切换模板
  const switchTemplate = async (variant: string): Promise<boolean> => {
    if (isLoading.value) return false

    const template = getTemplate(category, deviceInfo.value.type, variant)
    if (!template) {
      console.warn(`Template not found: ${category}/${deviceInfo.value.type}/${variant}`)
      return false
    }

    isLoading.value = true

    try {
      // 更新当前变体
      currentVariant.value = variant

      // 缓存用户选择
      if (cacheEnabled) {
        setCachedTemplate(category, deviceInfo.value.type, variant)
      }

      // 触发回调
      onTemplateChange?.(template)

      return true
    } catch (error) {
      console.error('Failed to switch template:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  // 切换到默认模板
  const switchToDefault = async (): Promise<boolean> => {
    const defaultVariant = getDefaultVariant()
    if (!defaultVariant) return false

    return await switchTemplate(defaultVariant)
  }

  // 刷新设备信息
  const refreshDevice = (): void => {
    deviceInfo.value = getDeviceInfo()
  }

  // 获取模板组件
  const getTemplateComponent = (): any => {
    return currentTemplate.value?.component || null
  }

  // 工具方法
  const isCurrentTemplate = (variant: string): boolean => {
    return currentVariant.value === variant
  }

  const hasTemplate = (variant: string): boolean => {
    return availableTemplates.value.some(t => t.variant === variant)
  }

  const getTemplateInfo = (variant: string): TemplateInfo | null => {
    return availableTemplates.value.find(t => t.variant === variant) || null
  }

  // 处理设备变化
  const handleDeviceChange = async (newDeviceInfo: DeviceInfo): Promise<void> => {
    const oldDevice = deviceInfo.value.type
    deviceInfo.value = newDeviceInfo

    if (oldDevice !== newDeviceInfo.type) {
      // 触发设备变化回调
      onDeviceChange?.(oldDevice, newDeviceInfo.type)

      // 如果启用自动切换，切换到新设备类型的默认模板
      if (autoSwitch) {
        const newVariant = getDefaultVariant()
        if (newVariant && newVariant !== currentVariant.value) {
          await switchTemplate(newVariant)
        }
      }
    }
  }

  // 监听当前变体变化
  watch(currentTemplate, (newTemplate) => {
    onTemplateChange?.(newTemplate)
  })

  // 初始化
  onMounted(async () => {
    // 如果没有初始变体，使用默认变体
    if (!currentVariant.value) {
      const defaultVariant = getDefaultVariant()
      if (defaultVariant) {
        currentVariant.value = defaultVariant
      }
    }

    // 监听设备变化
    unwatchDevice.value = watchDeviceChange(handleDeviceChange)
  })

  // 清理
  onUnmounted(() => {
    if (unwatchDevice.value) {
      unwatchDevice.value()
    }
  })

  return {
    // 状态
    deviceInfo: readonly(deviceInfo),
    currentTemplate: readonly(currentTemplate),
    currentVariant: readonly(currentVariant),
    availableTemplates: readonly(availableTemplates),
    isLoading: readonly(isLoading),
    
    // 方法
    switchTemplate,
    switchToDefault,
    refreshDevice,
    getTemplateComponent,
    
    // 工具方法
    isCurrentTemplate,
    hasTemplate,
    getTemplateInfo
  }
}

// 类型导出
export type { UseTemplateSwitchOptions, UseTemplateSwitchReturn }
