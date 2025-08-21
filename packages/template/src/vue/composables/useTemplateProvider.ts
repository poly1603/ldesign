/**
 * useTemplateProvider 组合式函数
 *
 * 用于在子组件中访问TemplateProvider提供的上下文
 */

import type { DeviceType, TemplateMetadata, TemplateProviderConfig } from '../../types'
import { computed, type ComputedRef, inject } from 'vue'
import { TEMPLATE_PROVIDER_KEY, type TemplateProviderContext } from '../components/TemplateProvider'

/**
 * useTemplateProvider 返回值接口
 */
export interface UseTemplateProviderReturn {
  /** 是否在Provider上下文中 */
  isInProvider: ComputedRef<boolean>
  /** 全局配置 */
  config: ComputedRef<TemplateProviderConfig | null>
  /** 当前设备类型 */
  currentDevice: ComputedRef<DeviceType>
  /** 加载状态 */
  loading: ComputedRef<boolean>
  /** 错误信息 */
  error: ComputedRef<Error | null>
  /** 获取模板列表 */
  getTemplates: (category?: string, device?: DeviceType) => TemplateMetadata[]
  /** 切换模板 */
  switchTemplate: (category: string, device: DeviceType, template: string) => Promise<void>
  /** 刷新模板列表 */
  refreshTemplates: () => Promise<void>
  /** 清空缓存 */
  clearCache: () => void
  /** 检查模板是否存在 */
  hasTemplate: (category: string, device: DeviceType, template: string) => boolean
}

/**
 * useTemplateProvider 组合式函数
 */
export function useTemplateProvider(): UseTemplateProviderReturn {
  // 尝试注入Provider上下文
  const providerContext = inject<TemplateProviderContext | null>(TEMPLATE_PROVIDER_KEY, null)

  // 计算属性
  const isInProvider = computed(() => !!providerContext)

  const config = computed(() => providerContext?.config || null)

  const currentDevice = computed(() => {
    return (providerContext?.state.currentDevice as DeviceType) || 'desktop'
  })

  const loading = computed(() => providerContext?.state.loading || false)

  const error = computed(() => providerContext?.state.error || null)

  // 方法
  const getTemplates = (category?: string, device?: DeviceType): TemplateMetadata[] => {
    if (!providerContext) {
      console.warn('useTemplateProvider: Not in TemplateProvider context')
      return []
    }

    return providerContext.manager.getTemplates(category, device)
  }

  const switchTemplate = async (category: string, device: DeviceType, template: string): Promise<void> => {
    if (!providerContext) {
      throw new Error('useTemplateProvider: Not in TemplateProvider context')
    }

    return providerContext.methods.switchTemplate(category, device, template)
  }

  const refreshTemplates = async (): Promise<void> => {
    if (!providerContext) {
      throw new Error('useTemplateProvider: Not in TemplateProvider context')
    }

    return providerContext.methods.refreshTemplates()
  }

  const clearCache = (): void => {
    if (!providerContext) {
      console.warn('useTemplateProvider: Not in TemplateProvider context')
      return
    }

    providerContext.methods.clearCache()
  }

  const hasTemplate = (category: string, device: DeviceType, template: string): boolean => {
    if (!providerContext) {
      console.warn('useTemplateProvider: Not in TemplateProvider context')
      return false
    }

    return providerContext.manager.hasTemplate(category, device, template)
  }

  return {
    isInProvider,
    config,
    currentDevice,
    loading,
    error,
    getTemplates,
    switchTemplate,
    refreshTemplates,
    clearCache,
    hasTemplate,
  }
}

/**
 * 创建模板Provider配置的辅助函数
 */
export function createTemplateProviderConfig(config: Partial<TemplateProviderConfig> = {}): TemplateProviderConfig {
  return {
    enableCache: true,
    autoDetectDevice: true,
    debug: false,
    enableGlobalState: true,
    storage: {
      key: 'ldesign-template-provider',
      storage: 'localStorage',
    },
    defaultSelectorConfig: {
      enabled: true,
      position: 'top',
      showPreview: true,
      showSearch: true,
      layout: 'grid',
      columns: 3,
      showInfo: true,
      showTitle: true,
      collapsible: false,
      defaultExpanded: true,
      animation: true,
      animationDuration: 300,
    },
    theme: {
      primaryColor: '#1890ff',
      borderRadius: '4px',
      spacing: '16px',
    },
    ...config,
  }
}

export default useTemplateProvider
