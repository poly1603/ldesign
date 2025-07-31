import {
  type Component,
  type PropType,
  computed,
  defineComponent,
  h,
  onMounted,
  ref,
  watch,
} from 'vue'
import type { DeviceType } from '../../types'
import { useTemplate } from '../composables/useTemplate'

/**
 * 默认加载组件
 */
const DefaultLoadingComponent = defineComponent({
  name: 'DefaultLoading',
  setup() {
    return () => (
      <div class="template-loading">
        <div class="template-loading__spinner"></div>
        <div class="template-loading__text">正在加载模板...</div>
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
      type: Object as PropType<Error>,
      required: true
    },
    retry: {
      type: Function as PropType<() => void>,
      required: true
    }
  },
  setup(props) {
    return () => (
      <div class="template-error">
        <div class="template-error__icon">⚠️</div>
        <div class="template-error__title">模板加载失败</div>
        <div class="template-error__message">{props.error.message}</div>
        <button class="template-error__retry" onClick={props.retry}>
          重试
        </button>
      </div>
    )
  }
})

/**
 * 默认空状态组件
 */
const DefaultEmptyComponent = defineComponent({
  name: 'DefaultEmpty',
  setup() {
    return () => (
      <div class="template-empty">
        <div class="template-empty__icon">📄</div>
        <div class="template-empty__text">未找到指定模板</div>
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
    /** 模板分类 */
    category: {
      type: String,
      required: true
    },
    /** 设备类型 */
    device: {
      type: String as PropType<DeviceType>,
      default: undefined
    },
    /** 模板名称 */
    template: {
      type: String,
      required: true
    },
    /** 传递给模板的属性 */
    templateProps: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({})
    },
    /** 是否启用缓存 */
    cache: {
      type: Boolean,
      default: true
    },
    /** 加载组件 */
    loading: {
      type: Object as PropType<Component>,
      default: undefined
    },
    /** 错误组件 */
    error: {
      type: Object as PropType<Component>,
      default: undefined
    },
    /** 空状态组件 */
    empty: {
      type: Object as PropType<Component>,
      default: undefined
    },
    /** 加载超时时间 */
    timeout: {
      type: Number,
      default: 10000
    },
    /** 是否自动重试 */
    autoRetry: {
      type: Boolean,
      default: false
    },
    /** 重试次数 */
    retryCount: {
      type: Number,
      default: 3
    }
  },
  emits: {
    load: (_component: Component) => true,
    error: (_error: Error) => true,
    retry: (_attempt: number) => true
  },
  setup(props, { emit, slots }) {
    const {
      manager,
      currentDevice,
      loading,
      error,
      hasTemplate
    } = useTemplate({ autoScan: true })

    const renderedComponent = ref<Component | null>(null)
    const retryAttempts = ref(0)
    const isTemplateExists = ref(false)

    // 计算实际使用的设备类型
    const actualDevice = computed(() => props.device || currentDevice.value)

    // 计算组件
    const LoadingComponent = computed(() => props.loading || DefaultLoadingComponent)
    const ErrorComponent = computed(() => props.error || DefaultErrorComponent)
    const EmptyComponent = computed(() => props.empty || DefaultEmptyComponent)

    /**
     * 加载模板
     */
    const loadTemplate = async (): Promise<void> => {
      try {
        loading.value = true
        error.value = null

        // 检查模板是否存在
        const exists = await hasTemplate(props.category, actualDevice.value, props.template)
        isTemplateExists.value = exists

        if (!exists) {
          return
        }

        // 渲染模板
        const component = await manager.render({
          category: props.category,
          device: actualDevice.value,
          template: props.template,
          props: props.templateProps,
          cache: props.cache,
          timeout: props.timeout
        })

        renderedComponent.value = component
        emit('load', component)
        retryAttempts.value = 0
      }
      catch (err) {
        const errorObj = err as Error
        error.value = errorObj
        emit('error', errorObj)

        // 自动重试
        if (props.autoRetry && retryAttempts.value < props.retryCount) {
          retryAttempts.value++
          emit('retry', retryAttempts.value)
          setTimeout(() => {
            loadTemplate()
          }, 1000 * retryAttempts.value) // 递增延迟
        }
      }
      finally {
        loading.value = false
      }
    }

    /**
     * 手动重试
     */
    const retry = (): void => {
      retryAttempts.value++
      emit('retry', retryAttempts.value)
      loadTemplate()
    }

    // 监听属性变化，重新加载模板
    watch(
      [() => props.category, () => props.template, actualDevice],
      () => {
        renderedComponent.value = null
        loadTemplate()
      },
      { immediate: false }
    )

    // 监听模板属性变化
    watch(
      () => props.templateProps,
      () => {
        if (renderedComponent.value) {
          loadTemplate()
        }
      },
      { deep: true }
    )

    // 组件挂载时加载模板
    onMounted(() => {
      loadTemplate()
    })

    return () => {
      // 加载状态
      if (loading.value) {
        return slots.loading?.() || h(LoadingComponent.value)
      }

      // 错误状态
      if (error.value) {
        return slots.error?.({ error: error.value, retry }) || h(ErrorComponent.value, { error: error.value, retry })
      }

      // 模板不存在
      if (!isTemplateExists.value) {
        return slots.empty?.() || h(EmptyComponent.value)
      }

      // 渲染模板
      if (renderedComponent.value) {
        const TemplateComponent = renderedComponent.value
        return h(TemplateComponent, props.templateProps)
      }

      // 默认状态
      return slots.default?.() || null
    }
  }
})

export default TemplateRenderer
