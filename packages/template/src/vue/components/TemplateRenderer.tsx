import type { DeviceType } from '../composables/useTemplateSystem'
import { computed, defineComponent, h, ref, shallowRef, watch } from 'vue'
import { useTemplate } from '../composables/useTemplateSystem'
import TemplateSelector from './TemplateSelector'

export interface TemplateRendererProps {
  category: string
  templateId?: string
  deviceType?: DeviceType
  autoDetectDevice?: boolean
  config?: Record<string, unknown>

  // 模板选择器相关
  /** 是否显示模板选择器 */
  showSelector?: boolean
  /** 选择器显示模式 */
  selectorMode?: 'dropdown' | 'grid' | 'buttons'
  /** 选择器大小 */
  selectorSize?: 'small' | 'medium' | 'large'
  /** 选择器位置 */
  selectorPosition?: 'top' | 'bottom' | 'left' | 'right'
  /** 是否显示设备信息 */
  showDeviceInfo?: boolean

  // 性能优化相关
  /** 是否启用懒加载 */
  lazy?: boolean
  /** 是否启用预加载 */
  preload?: boolean
  /** 占位符高度 */
  placeholderHeight?: number
  /** 是否启用性能监控 */
  enablePerformanceMonitor?: boolean
}

/**
 * 模板渲染组件
 *
 * @example
 * ```vue
 * <template>
 *   <TemplateRenderer
 *     category="login"
 *     :show-selector="true"
 *     @login="handleLogin"
 *   />
 * </template>
 * ```
 */
export const TemplateRenderer = defineComponent({
  name: 'TemplateRenderer',
  props: {
    category: {
      type: String,
      required: true,
    },
    templateId: {
      type: String,
      default: undefined,
    },
    deviceType: {
      type: String,
      default: undefined,
    },
    autoDetectDevice: {
      type: Boolean,
      default: true,
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    showSelector: {
      type: Boolean,
      default: true,
    },
    selectorMode: {
      type: String as () => 'dropdown' | 'grid' | 'buttons',
      default: 'buttons',
    },
    selectorSize: {
      type: String as () => 'small' | 'medium' | 'large',
      default: 'medium',
    },
    selectorPosition: {
      type: String as () => 'top' | 'bottom' | 'left' | 'right',
      default: 'top',
    },
    showDeviceInfo: {
      type: Boolean,
      default: true,
    },
    lazy: {
      type: Boolean,
      default: false,
    },
    preload: {
      type: Boolean,
      default: false,
    },
    placeholderHeight: {
      type: Number,
      default: 200,
    },
    enablePerformanceMonitor: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['template-change', 'device-change', 'render-error', 'performance-update', 'load-start', 'load-end'],
  setup(props, { emit, attrs }) {
    const {
      // currentTemplate, // 暂时注释掉未使用的变量
      currentTemplateId,
      availableTemplates,
      deviceType,
      switchTemplate,
      switchDevice,
      TemplateComponent,
      templateConfig,
    } = useTemplate({
      category: props.category,
      deviceType: props.deviceType as DeviceType,
      defaultTemplate: props.templateId,
      autoSwitch: props.autoDetectDevice,
    })

    // ============ 性能监控系统 ============
    // 使用 shallowRef 优化性能，避免深度响应式监听

    /** 渲染开始时间戳 */
    const renderStartTime = ref<number>(0)

    /** 加载状态标识 */
    const isLoading = ref(false)

    /** 性能数据（使用 shallowRef 优化） */
    const performanceData = shallowRef({
      renderTime: 0,
      componentSize: 0,
      memoryUsage: 0,
    })

    // 开始加载计时
    const startLoadTimer = () => {
      renderStartTime.value = performance.now()
      isLoading.value = true
      emit('load-start')
    }

    // 结束加载计时
    const endLoadTimer = () => {
      const renderTime = performance.now() - renderStartTime.value
      performanceData.value.renderTime = renderTime
      isLoading.value = false
      emit('load-end', { renderTime })

      if (props.enablePerformanceMonitor) {
        emit('performance-update', performanceData.value)
      }
    }

    // 监听模板变化
    watch(currentTemplateId, newTemplateId => {
      emit('template-change', newTemplateId)
    })

    // 监听设备变化
    watch(deviceType, newDevice => {
      emit('device-change', newDevice)
    })

    // 监听组件加载
    watch(
      TemplateComponent,
      newComponent => {
        if (newComponent) {
          endLoadTimer()
        } else {
          startLoadTimer()
        }
      },
      { immediate: true }
    )

    // 自动创建 TemplateSelector 组件
    const createTemplateSelector = () => {
      // 如果用户手动传递了 templateSelector，优先使用
      if (props.config?.templateSelector) {
        return props.config.templateSelector
      }

      // 如果不显示选择器，返回 null
      if (!props.showSelector) {
        return null
      }

      // 如果没有可用模板或只有一个模板，不显示选择器
      if (!availableTemplates.value || availableTemplates.value.length <= 1) {
        return null
      }

      // 自动创建 TemplateSelector
      return h(TemplateSelector, {
        category: props.category,
        value: currentTemplateId.value,
        deviceType: deviceType.value,
        availableTemplates: availableTemplates.value.map(t => ({
          id: t.id,
          name: t.name,
          description: t.description || '',
        })),
        mode: props.selectorMode,
        size: props.selectorSize,
        showDeviceInfo: props.showDeviceInfo,
        disabled: false,
        onTemplateChange: switchTemplate,
        onDeviceChange: switchDevice,
      })
    }

    // 暴露模板切换方法给外部使用
    const templateSelectorProps = computed(() => ({
      category: props.category,
      value: currentTemplateId.value,
      deviceType: deviceType.value,
      availableTemplates: availableTemplates.value,
      onTemplateChange: switchTemplate,
      onDeviceChange: switchDevice,
    }))

    // 渲染模板内容
    const renderContent = () => {
      try {
        if (!TemplateComponent.value) {
          return <div class="template-renderer__error">未找到模板</div>
        }

        // 合并配置，包括模板选择器
        const finalConfig = {
          ...templateConfig.value,
          ...props.config,
          templateSelector: createTemplateSelector(), // 将创建的模板选择器传递给模板
        }

        const Component = TemplateComponent.value
        if (!Component) {
          return <div class="template-renderer__empty">模板组件未找到</div>
        }

        const DynamicComponent = Component as any
        return <DynamicComponent {...finalConfig} {...attrs} />
      } catch (error) {
        emit('render-error', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        return (
          <div class="template-renderer__error">
            模板渲染失败:
            {errorMessage}
          </div>
        )
      }
    }

    // 暴露给外部的方法和数据（供调试使用）
    if (process.env.NODE_ENV === 'development') {
      ;(window as any).__templateRenderer = {
        switchTemplate,
        switchDevice,
        currentTemplateId,
        deviceType,
        availableTemplates,
        templateSelectorProps,
      }
    }

    return () => {
      const content = renderContent()

      // 直接返回内容，模板选择器由模板内部处理
      return (
        <div class="template-renderer">
          <div class="template-renderer__content">{content}</div>
        </div>
      )
    }
  },
})

export default TemplateRenderer
