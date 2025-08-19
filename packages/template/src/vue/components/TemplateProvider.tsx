/**
 * TemplateProvider 组件
 *
 * 提供全局模板配置和状态管理的Provider组件
 */

import type { TemplateProviderConfig, TemplateProviderProps } from '../../types'
import { defineComponent, provide, reactive, ref, onMounted, onUnmounted, type PropType } from 'vue'
import { TemplateManager } from '../../core/manager'

// Provider 注入键
export const TEMPLATE_PROVIDER_KEY = Symbol('template-provider')

/**
 * Provider 上下文接口
 */
export interface TemplateProviderContext {
  /** 模板管理器实例 */
  manager: TemplateManager
  /** 全局配置 */
  config: TemplateProviderConfig
  /** 全局状态 */
  state: {
    currentDevice: string
    loading: boolean
    error: Error | null
  }
  /** 全局方法 */
  methods: {
    switchTemplate: (category: string, device: string, template: string) => Promise<void>
    refreshTemplates: () => Promise<void>
    clearCache: () => void
  }
}

/**
 * TemplateProvider 组件
 */
export const TemplateProvider = defineComponent({
  name: 'TemplateProvider',

  props: {
    /** 提供者配置 */
    config: {
      type: Object as PropType<TemplateProviderConfig>,
      default: () => ({}),
    },
  },

  setup(props, { slots }) {
    // 创建管理器实例
    const manager = new TemplateManager({
      enableCache: true,
      autoDetectDevice: true,
      debug: false,
      storage: {
        key: 'ldesign-template-provider',
        storage: 'localStorage',
      },
      ...props.config,
    })

    // 全局状态
    const state = reactive({
      currentDevice: 'desktop',
      loading: false,
      error: null as Error | null,
    })

    // 全局方法
    const methods = {
      async switchTemplate(category: string, device: string, template: string) {
        state.loading = true
        state.error = null

        try {
          await manager.render({
            category,
            device: device as any,
            template,
            cache: props.config.enableCache !== false,
          })

          // 保存用户选择
          if (manager.storageManager) {
            manager.storageManager.saveSelection(category, device as any, template)
          }
        } catch (error) {
          state.error = error as Error
          throw error
        } finally {
          state.loading = false
        }
      },

      async refreshTemplates() {
        state.loading = true
        state.error = null

        try {
          await manager.refresh()
        } catch (error) {
          state.error = error as Error
          throw error
        } finally {
          state.loading = false
        }
      },

      clearCache() {
        manager.clearCache()
      },
    }

    // 创建Provider上下文
    const providerContext: TemplateProviderContext = {
      manager,
      config: props.config,
      state,
      methods,
    }

    // 提供上下文
    provide(TEMPLATE_PROVIDER_KEY, providerContext)

    // 设置事件监听
    const setupEventListeners = () => {
      manager.on('device:change', (event: any) => {
        state.currentDevice = event.newDevice
      })

      manager.on('template:change', (event: any) => {
        // 可以在这里处理全局模板变化事件
      })

      manager.on('error', (event: any) => {
        state.error = event.error
      })
    }

    // 生命周期
    onMounted(async () => {
      setupEventListeners()

      // 初始化设备检测
      state.currentDevice = manager.getCurrentDevice()

      // 自动扫描模板
      if (props.config.autoScan !== false) {
        try {
          await manager.scanTemplates()
        } catch (error) {
          console.warn('Template scanning failed:', error)
        }
      }
    })

    onUnmounted(() => {
      manager.destroy()
    })

    // 渲染函数
    return () => {
      // 应用主题样式
      const themeStyle = props.config.theme
        ? {
            '--template-primary-color': props.config.theme.primaryColor || '#1890ff',
            '--template-border-radius': props.config.theme.borderRadius || '4px',
            '--template-spacing': props.config.theme.spacing || '16px',
            ...props.config.theme,
          }
        : {}

      return (
        <div
          class="template-provider"
          style={themeStyle}
          data-device={state.currentDevice}
          data-loading={state.loading}
          data-error={!!state.error}
        >
          {slots.default?.()}
        </div>
      )
    }
  },
})

export default TemplateProvider
