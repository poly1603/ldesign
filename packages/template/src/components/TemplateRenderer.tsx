/**
 * 模板渲染器组件
 * 
 * 主渲染组件，支持动态模板加载、设备适配、错误处理等功能
 */

import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  type PropType,
  type Component
} from 'vue'
import type {
  TemplateRendererProps,
  DeviceType
} from '../types/template'
import { useTemplate } from '../composables/useTemplate'
import { useDeviceDetection } from '../composables/useDeviceDetection'
import { useResponsiveTemplate } from '../composables/useResponsiveTemplate'

/**
 * 默认加载组件
 */
const DefaultLoadingComponent = defineComponent({
  name: 'DefaultLoading',
  setup() {
    return () => (
      <div class="template-loading">
        <div class="template-loading__spinner"></div>
        <div class="template-loading__text">加载模板中...</div>
      </div>
    )
  }
})

/**
 * 默认错误组件
 */
const DefaultErrorComponent = defineComponent({
  name: 'DefaultError',
  props: {
    error: {
      type: String,
      required: true
    },
    retry: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    return () => (
      <div class="template-error">
        <div class="template-error__icon">⚠️</div>
        <div class="template-error__message">{props.error}</div>
        <button
          class="template-error__retry"
          onClick={props.retry}
        >
          重试
        </button>
      </div>
    )
  }
})

/**
 * 模板渲染器组件
 */
export const TemplateRenderer = defineComponent({
  name: 'TemplateRenderer',
  props: {
    /** 模板分类（必需） */
    category: {
      type: String,
      required: true
    },
    /** 设备类型（可选，默认自动检测） */
    device: {
      type: String as PropType<DeviceType>,
      default: undefined
    },
    /** 模板名称（可选，默认使用该分类下的默认模板） */
    templateName: {
      type: String,
      default: undefined
    },
    /** 是否响应式跟随设备（默认: true） */
    responsive: {
      type: Boolean,
      default: true
    },
    /** 是否显示模板选择器（默认: false） */
    showSelector: {
      type: Boolean,
      default: false
    },
    /** 加载失败时的备用模板名称（可选） */
    fallbackTemplate: {
      type: String,
      default: undefined
    },
    /** 自定义加载组件（可选） */
    loadingComponent: {
      type: Object as PropType<Component>,
      default: undefined
    },
    /** 自定义错误组件（可选） */
    errorComponent: {
      type: Object as PropType<Component>,
      default: undefined
    },
    /** 传递给模板的属性（可选） */
    props: {
      type: Object,
      default: () => ({})
    },
    /** 模板切换回调（可选） */
    onTemplateChange: {
      type: Function as PropType<(templateName: string) => void>,
      default: undefined
    },
    /** 加载错误回调（可选） */
    onLoadError: {
      type: Function as PropType<(error: Error) => void>,
      default: undefined
    }
  },
  emits: ['template-change', 'load-error', 'load-success'],
  setup(props, { emit, slots }) {
    // 设备检测
    const { deviceType } = useDeviceDetection({
      initialDevice: props.device,
      enableResponsive: props.responsive && !props.device
    })

    // 当前使用的设备类型
    const currentDevice = computed(() => props.device || deviceType.value)

    // 模板管理
    const {
      currentTemplate,
      currentComponent,
      availableTemplates,
      loading,
      error,
      switchTemplate,
      refreshTemplates
    } = useTemplate({
      category: props.category,
      device: currentDevice.value,
      autoDetectDevice: props.responsive && !props.device,
      enableCache: true
    })

    // 内部状态
    const hasTriedFallback = ref(false)
    const retryCount = ref(0)
    const maxRetries = 3

    // 计算属性
    const LoadingComponent = computed(() =>
      props.loadingComponent || DefaultLoadingComponent
    )

    const ErrorComponent = computed(() =>
      props.errorComponent || DefaultErrorComponent
    )

    const shouldShowSelector = computed(() =>
      props.showSelector && availableTemplates.value.length > 1
    )

    /**
     * 处理模板切换
     */
    const handleTemplateSwitch = async (templateName: string) => {
      try {
        await switchTemplate(templateName)
        hasTriedFallback.value = false
        retryCount.value = 0

        // 触发回调和事件
        props.onTemplateChange?.(templateName)
        emit('template-change', templateName)
        emit('load-success', currentTemplate.value)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        handleLoadError(error)
      }
    }

    /**
     * 处理加载错误
     */
    const handleLoadError = async (err: Error) => {
      console.error('Template load error:', err)

      // 触发错误回调和事件
      props.onLoadError?.(err)
      emit('load-error', err)

      // 尝试备用模板
      if (props.fallbackTemplate && !hasTriedFallback.value) {
        hasTriedFallback.value = true
        try {
          await switchTemplate(props.fallbackTemplate)
          return
        } catch (fallbackErr) {
          console.error('Fallback template also failed:', fallbackErr)
        }
      }

      // 尝试默认模板
      if (!hasTriedFallback.value) {
        const defaultTemplate = availableTemplates.value.find(t => t.isDefault)
        if (defaultTemplate && defaultTemplate.name !== props.templateName) {
          hasTriedFallback.value = true
          try {
            await switchTemplate(defaultTemplate.name)
            return
          } catch (defaultErr) {
            console.error('Default template also failed:', defaultErr)
          }
        }
      }
    }

    /**
     * 重试加载
     */
    const retryLoad = async () => {
      if (retryCount.value >= maxRetries) {
        console.warn('Max retries reached')
        return
      }

      retryCount.value++
      hasTriedFallback.value = false

      try {
        await refreshTemplates()

        if (props.templateName) {
          await handleTemplateSwitch(props.templateName)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Retry failed')
        handleLoadError(error)
      }
    }

    /**
     * 渲染模板选择器
     */
    const renderSelector = () => {
      if (!shouldShowSelector.value) return null

      return (
        <div class="template-selector-trigger">
          <button
            class="template-selector-trigger__button"
            onClick={() => {
              // 这里应该打开模板选择器对话框
              // 暂时简单实现为下拉选择
              console.log('Open template selector')
            }}
          >
            选择模板 ({currentTemplate.value?.displayName || '未选择'})
          </button>
        </div>
      )
    }

    /**
     * 渲染模板内容
     */
    const renderTemplate = () => {
      // 加载状态
      if (loading.value) {
        // 检查是否有自定义加载插槽
        if (slots.loading) {
          return slots.loading()
        }
        return <LoadingComponent.value />
      }

      // 错误状态
      if (error.value) {
        // 检查是否有自定义错误插槽
        if (slots.error) {
          return slots.error({
            error: error.value,
            retry: retryLoad
          })
        }
        return (
          <ErrorComponent.value
            error={error.value}
            retry={retryLoad}
          />
        )
      }

      // 渲染模板组件
      if (currentComponent.value) {
        const TemplateComponent = currentComponent.value
        return (
          <TemplateComponent
            {...props.props}
            v-slots={slots}
          />
        )
      }

      // 无模板状态
      // 检查是否有自定义空状态插槽
      if (slots.empty) {
        return slots.empty()
      }

      return (
        <div class="template-empty">
          <div class="template-empty__message">
            没有找到可用的模板
          </div>
          <button
            class="template-empty__retry"
            onClick={retryLoad}
          >
            重新加载
          </button>
        </div>
      )
    }

    // 监听模板名称变化
    watch(() => props.templateName, async (newName) => {
      if (newName && newName !== currentTemplate.value?.name) {
        await handleTemplateSwitch(newName)
      }
    })

    // 监听设备类型变化
    watch(currentDevice, async () => {
      // 设备变化时重新加载模板列表
      await refreshTemplates()
    })

    // 监听模板列表变化，当模板加载完成后尝试切换到指定模板
    watch(availableTemplates, async (templates) => {
      if (templates.length > 0 && props.templateName && !currentTemplate.value) {
        await handleTemplateSwitch(props.templateName)
      }
    }, { immediate: true })

    // 组件挂载时初始化
    onMounted(async () => {
      // 如果模板已经加载完成，直接切换
      if (availableTemplates.value.length > 0 && props.templateName) {
        await handleTemplateSwitch(props.templateName)
      }
    })

    return () => (
      <div class="template-renderer">
        {shouldShowSelector.value && renderSelector()}
        <div class="template-renderer__content">
          {renderTemplate()}
        </div>
      </div>
    )
  }
})

export default TemplateRenderer
