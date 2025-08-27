import type { PropType } from 'vue'
import type { WatermarkConfig } from '../../types'
import type { WatermarkProviderContext } from '../types'
import { computed, defineComponent, inject, onMounted, ref, watch } from 'vue'
import { useWatermark } from '../composables/useWatermark'
import styles from './Watermark.module.less'
import '../jsx'

export interface WatermarkProps {
  config?: Partial<WatermarkConfig>
  content?: string | string[]
  security?: boolean
  responsive?: boolean
  immediate?: boolean
  style?: WatermarkConfig['style']
  layout?: WatermarkConfig['layout']
  animation?: WatermarkConfig['animation']
  showError?: boolean
}

export interface WatermarkEmits {
  created: (instance: any) => void
  updated: (instance: any) => void
  destroyed: (instanceId: string) => void
  error: (error: Error) => void
  securityViolation: (event: any) => void
}

export default defineComponent({
  name: 'Watermark',
  props: {
    config: Object as PropType<Partial<WatermarkConfig>>,
    content: [String, Array] as PropType<string | string[]>,
    security: { type: Boolean, default: true },
    responsive: { type: Boolean, default: true },
    immediate: { type: Boolean, default: true },
    style: Object as PropType<WatermarkConfig['style']>,
    layout: Object as PropType<WatermarkConfig['layout']>,
    animation: Object as PropType<WatermarkConfig['animation']>,
    showError: { type: Boolean, default: true },
  },
  emits: {
    created: (instance: any) => true,
    updated: (instance: any) => true,
    destroyed: (instanceId: string) => typeof instanceId === 'string',
    error: (error: Error) => error instanceof Error,
    securityViolation: (event: any) => true,
  },
  setup(props, { emit, slots }) {
    // 模板引用
    const containerRef = ref<HTMLElement>()

    // 注入Provider上下文
    const providerContext = inject<WatermarkProviderContext>(
      'watermarkProvider',
      {} as WatermarkProviderContext,
    )

    // 合并配置
    const mergedConfig = computed((): Partial<WatermarkConfig> => {
      const baseConfig: Partial<WatermarkConfig> = {
        content:
          typeof props.content === 'string'
            ? props.content
            : { text: props.content?.[0] },
        style: props.style,
        layout: props.layout,
        animation: props.animation,
        ...props.config,
      }

      // 如果有Provider上下文，合并全局配置
      if (providerContext) {
        return providerContext.mergeConfig(baseConfig)
      }

      return baseConfig
    })

    // 安全配置
    const securityEnabled = computed(() => {
      if (props.security !== undefined) {
        return props.security
      }
      return providerContext?.globalSecurity.value ?? true
    })

    // 响应式配置
    const responsiveEnabled = computed(() => {
      if (props.responsive !== undefined) {
        return props.responsive
      }
      return providerContext?.globalResponsive.value ?? true
    })

    // 使用水印Hook
    const {
      instance,
      loading,
      error,
      isCreated,
      create,
      update,
      destroy,
      pause,
      resume,
      clearError: clearWatermarkError,
    } = useWatermark(containerRef, {
      immediate: props.immediate,
      enableSecurity: securityEnabled.value,
      enableResponsive: responsiveEnabled.value,
    })

    // 清除错误
    function clearError() {
      clearWatermarkError()
      if (error.value) {
        emit('error', error.value)
      }
    }

    // 监听配置变化
    watch(
      mergedConfig,
      async (newConfig) => {
        if (!containerRef.value)
          return

        try {
          if (isCreated.value) {
            await update(newConfig)
            if (instance.value) {
              emit('updated', instance.value)
            }
          }
          else if (props.immediate) {
            await create(newConfig)
            if (instance.value) {
              emit('created', instance.value)
            }
          }
        }
        catch (err) {
          emit('error', err as Error)
        }
      },
      { deep: true },
    )

    // 监听实例变化
    watch(instance, (newInstance, oldInstance) => {
      if (newInstance && !oldInstance) {
        emit('created', newInstance)
      }
      else if (!newInstance && oldInstance) {
        emit('destroyed', oldInstance.id)
      }
    })

    // 监听错误
    watch(error, (newError) => {
      if (newError) {
        emit('error', newError)
      }
    })

    // 组件挂载后创建水印
    onMounted(async () => {
      if (props.immediate && containerRef.value) {
        try {
          await create(mergedConfig.value)
        }
        catch (err) {
          emit('error', err as Error)
        }
      }
    })

    return {
      containerRef,
      loading,
      error,
      clearError,
      instance,
      isCreated,
      create,
      update,
      destroy,
      pause,
      resume,
    }
  },
  render() {
    return (
      <div
        ref="containerRef"
        class={[
          styles['watermark-container'],
          {
            [styles['watermark-loading']]: this.loading,
            [styles['watermark-error']]: !!this.error,
          },
        ]}
      >
        {this.$slots.default?.()}

        {/* 错误提示 */}
        {this.error && this.showError && (
          <div
            class={styles['watermark-error-message']}
            onClick={this.clearError}
          >
            {this.error.message}
          </div>
        )}
      </div>
    )
  },
})
