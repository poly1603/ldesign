/**
 * 响应式模板切换 Hook
 * 
 * 实现设备切换时的自动模板切换和手动模板切换功能
 */

import { ref, computed, watch, nextTick, type Ref } from 'vue'
import { useDeviceDetection } from './useDeviceDetection'
import { useTemplate } from './useTemplate'
import type { DeviceType, TemplateMetadata } from '../types/template'

/**
 * 响应式模板切换选项
 */
interface UseResponsiveTemplateOptions {
  /** 模板分类 */
  category: string
  /** 初始模板名称 */
  initialTemplate?: string
  /** 初始设备类型 */
  initialDevice?: DeviceType
  /** 是否启用自动设备切换 */
  enableAutoDeviceSwitch?: boolean
  /** 是否启用过渡动画 */
  enableTransition?: boolean
  /** 过渡动画持续时间（毫秒） */
  transitionDuration?: number
  /** 设备切换时的模板映射 */
  deviceTemplateMap?: Partial<Record<DeviceType, string>>
  /** 切换防抖延迟（毫秒） */
  switchDebounce?: number
}

/**
 * 响应式模板切换返回值
 */
interface UseResponsiveTemplateReturn {
  /** 当前设备类型 */
  currentDevice: Ref<DeviceType>
  /** 当前模板名称 */
  currentTemplate: Ref<string>
  /** 当前模板元数据 */
  currentTemplateMetadata: Ref<TemplateMetadata | null>
  /** 是否正在切换 */
  isSwitching: Ref<boolean>
  /** 是否正在加载 */
  isLoading: Ref<boolean>
  /** 切换错误信息 */
  switchError: Ref<string | null>
  /** 手动切换设备类型 */
  switchDevice: (device: DeviceType) => Promise<void>
  /** 手动切换模板 */
  switchTemplate: (template: string, device?: DeviceType) => Promise<void>
  /** 获取可用的模板列表 */
  getAvailableTemplates: (device?: DeviceType) => TemplateMetadata[]
  /** 重置到默认状态 */
  reset: () => void
}

/**
 * 响应式模板切换 Hook
 */
export function useResponsiveTemplate(options: UseResponsiveTemplateOptions): UseResponsiveTemplateReturn {
  const {
    category,
    initialTemplate = 'default',
    initialDevice,
    enableAutoDeviceSwitch = true,
    enableTransition = true,
    transitionDuration = 300,
    deviceTemplateMap = {},
    switchDebounce = 100
  } = options

  // 设备检测
  const {
    deviceType: detectedDevice,
    setDeviceType
  } = useDeviceDetection({
    initialDevice,
    enableResponsive: enableAutoDeviceSwitch
  })

  // 模板管理
  const {
    availableTemplates: templates,
    loading: templateLoading,
    error: templateError,
    refresh: refreshTemplates
  } = useTemplate({
    category,
    autoDetectDevice: false, // 由当前 Hook 管理设备切换
    enableCache: true
  })

  // 状态管理
  const currentDevice = ref<DeviceType>(initialDevice || detectedDevice.value)
  const currentTemplate = ref<string>(initialTemplate)
  const currentTemplateMetadata = ref<TemplateMetadata | null>(null)
  const isSwitching = ref(false)
  const switchError = ref<string | null>(null)

  // 计算属性
  const isLoading = computed(() => templateLoading.value || isSwitching.value)

  // 工具函数：获取模板
  const getTemplate = (category: string, device: DeviceType, templateName: string) => {
    return templates.value.find(t =>
      t.category === category &&
      t.device === device &&
      t.name === templateName
    )
  }

  // 防抖定时器
  let switchTimer: number | null = null

  /**
   * 获取设备对应的默认模板
   */
  function getDefaultTemplateForDevice(device: DeviceType): string {
    return deviceTemplateMap[device] || initialTemplate
  }

  /**
   * 获取可用的模板列表
   */
  function getAvailableTemplates(device?: DeviceType): TemplateMetadata[] {
    const targetDevice = device || currentDevice.value
    return templates.value.filter(template =>
      template.category === category && template.device === targetDevice
    )
  }

  /**
   * 执行模板切换
   */
  async function performTemplateSwitch(template: string, device: DeviceType): Promise<void> {
    try {
      isSwitching.value = true
      switchError.value = null

      // 查找目标模板
      const targetTemplate = getTemplate(category, device, template)
      if (!targetTemplate) {
        throw new Error(`Template not found: ${category}/${device}/${template}`)
      }

      // 如果启用过渡动画，添加延迟
      if (enableTransition && transitionDuration > 0) {
        await new Promise(resolve => setTimeout(resolve, transitionDuration / 2))
      }

      // 更新状态
      currentDevice.value = device
      currentTemplate.value = template
      currentTemplateMetadata.value = targetTemplate

      // 预加载模板组件
      if (targetTemplate.componentLoader) {
        await targetTemplate.componentLoader()
      }

      // 等待 DOM 更新
      await nextTick()

      // 如果启用过渡动画，等待动画完成
      if (enableTransition && transitionDuration > 0) {
        await new Promise(resolve => setTimeout(resolve, transitionDuration / 2))
      }

    } catch (error) {
      switchError.value = error instanceof Error ? error.message : 'Unknown switch error'
      throw error
    } finally {
      isSwitching.value = false
    }
  }

  /**
   * 防抖切换
   */
  function debouncedSwitch(template: string, device: DeviceType): Promise<void> {
    return new Promise((resolve, reject) => {
      if (switchTimer) {
        clearTimeout(switchTimer)
      }

      switchTimer = window.setTimeout(async () => {
        try {
          await performTemplateSwitch(template, device)
          resolve()
        } catch (error) {
          reject(error)
        } finally {
          switchTimer = null
        }
      }, switchDebounce)
    })
  }

  /**
   * 手动切换设备类型
   */
  async function switchDevice(device: DeviceType): Promise<void> {
    if (device === currentDevice.value) return

    const template = getDefaultTemplateForDevice(device)
    await debouncedSwitch(template, device)

    // 同步设备检测状态
    setDeviceType(device)
  }

  /**
   * 手动切换模板
   */
  async function switchTemplate(template: string, device?: DeviceType): Promise<void> {
    const targetDevice = device || currentDevice.value

    if (template === currentTemplate.value && targetDevice === currentDevice.value) {
      return
    }

    await debouncedSwitch(template, targetDevice)
  }

  /**
   * 重置到默认状态
   */
  function reset(): void {
    currentDevice.value = initialDevice || detectedDevice.value
    currentTemplate.value = initialTemplate
    currentTemplateMetadata.value = null
    isSwitching.value = false
    switchError.value = null

    if (switchTimer) {
      clearTimeout(switchTimer)
      switchTimer = null
    }
  }

  // 监听设备类型变化（自动切换）
  watch(
    detectedDevice,
    async (newDevice) => {
      if (!enableAutoDeviceSwitch || newDevice === currentDevice.value) return

      try {
        const template = getDefaultTemplateForDevice(newDevice)
        await switchDevice(newDevice)
      } catch (error) {
        console.warn('Auto device switch failed:', error)
      }
    },
    { immediate: false }
  )

  // 监听模板加载完成
  watch(
    templates,
    () => {
      if (templates.value.length > 0 && !currentTemplateMetadata.value) {
        const template = getTemplate(category, currentDevice.value, currentTemplate.value)
        if (template) {
          currentTemplateMetadata.value = template
        }
      }
    },
    { immediate: true }
  )

  // 初始化当前模板元数据
  const initialTemplateMetadata = getTemplate(category, currentDevice.value, currentTemplate.value)
  if (initialTemplateMetadata) {
    currentTemplateMetadata.value = initialTemplateMetadata
  }

  return {
    currentDevice,
    currentTemplate,
    currentTemplateMetadata,
    isSwitching,
    isLoading,
    switchError,
    switchDevice,
    switchTemplate,
    getAvailableTemplates,
    reset
  }
}

/**
 * 简化版响应式模板切换 Hook
 */
export function useSimpleResponsiveTemplate(category: string, initialTemplate = 'default') {
  const { currentDevice, currentTemplate, switchDevice, switchTemplate } = useResponsiveTemplate({
    category,
    initialTemplate,
    enableAutoDeviceSwitch: true,
    enableTransition: false
  })

  return {
    currentDevice,
    currentTemplate,
    switchDevice,
    switchTemplate
  }
}
