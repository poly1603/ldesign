/**
 * 懒加载模板组件
 * 支持 Intersection Observer API 进行可视区域检测
 */

import type { DeviceType } from '../../types'
import { defineComponent, onMounted, onUnmounted, type PropType, ref } from 'vue'

export interface LazyTemplateProps {
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device: DeviceType
  /** 模板名称 */
  template: string
  /** 占位符高度 */
  placeholderHeight?: number
  /** 根边距 */
  rootMargin?: string
  /** 阈值 */
  threshold?: number
  /** 是否启用懒加载 */
  lazy?: boolean
}

export default defineComponent({
  name: 'LazyTemplate',
  props: {
    category: {
      type: String,
      required: true,
    },
    device: {
      type: String as PropType<DeviceType>,
      required: true,
    },
    template: {
      type: String,
      required: true,
    },
    placeholderHeight: {
      type: Number,
      default: 200,
    },
    rootMargin: {
      type: String,
      default: '50px',
    },
    threshold: {
      type: Number,
      default: 0.1,
    },
    lazy: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['load', 'error', 'visible'],
  setup(props, { emit, slots, expose }) {
    const containerRef = ref<HTMLElement>()
    const isVisible = ref(false)
    const isLoaded = ref(false)
    const isLoading = ref(false)
    const error = ref<Error | null>(null)
    const templateComponent = ref<any>(null)

    let observer: IntersectionObserver | null = null

    // 加载模板
    const loadTemplate = async () => {
      if (isLoaded.value || isLoading.value) return

      isLoading.value = true
      error.value = null

      try {
        // 这里应该调用模板管理器的加载方法
        // 为了演示，我们使用动态导入
        const module = await import(`../../templates/${props.category}/${props.device}/${props.template}/index.tsx`)

        templateComponent.value = module.default
        isLoaded.value = true
        emit('load', templateComponent.value)
      } catch (err) {
        error.value = err as Error
        emit('error', err)
      } finally {
        isLoading.value = false
      }
    }

    // 创建 Intersection Observer
    const createObserver = () => {
      if (!props.lazy) {
        loadTemplate()
        return
      }

      observer = new IntersectionObserver(
        entries => {
          const entry = entries[0]
          if (entry.isIntersecting && !isLoaded.value && !isLoading.value) {
            isVisible.value = true
            emit('visible')
            loadTemplate()
          }
        },
        {
          rootMargin: props.rootMargin,
          threshold: props.threshold,
        }
      )

      if (containerRef.value) {
        observer.observe(containerRef.value)
      }
    }

    // 重试加载
    const retry = () => {
      error.value = null
      loadTemplate()
    }

    onMounted(() => {
      createObserver()
    })

    onUnmounted(() => {
      // 清理 Intersection Observer
      if (observer) {
        observer.disconnect()
        observer = null
      }

      // 清理模板组件引用，防止内存泄漏
      templateComponent.value = null
      error.value = null
    })

    // 暴露状态供测试使用
    expose({
      isVisible,
      isLoaded,
      isLoading,
      error,
      templateComponent,
      loadTemplate,
      retry,
      containerRef,
    })

    return () => {
      const { placeholderHeight } = props

      // 如果已加载，渲染模板组件
      if (isLoaded.value && templateComponent.value) {
        const Component = templateComponent.value
        return <Component {...props} />
      }

      // 如果有错误，显示错误状态
      if (error.value) {
        return (
          <div ref={containerRef} class="lazy-template-error" style={{ minHeight: `${placeholderHeight}px` }}>
            {slots.error?.({ error: error.value, retry }) || (
              <div class="error-content">
                <p>模板加载失败</p>
                <button onClick={retry}>重试</button>
              </div>
            )}
          </div>
        )
      }

      // 如果正在加载，显示加载状态
      if (isLoading.value) {
        return (
          <div ref={containerRef} class="lazy-template-loading" style={{ minHeight: `${placeholderHeight}px` }}>
            {slots.loading?.() || (
              <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>正在加载模板...</p>
              </div>
            )}
          </div>
        )
      }

      // 默认占位符
      return (
        <div ref={containerRef} class="lazy-template-placeholder" style={{ minHeight: `${placeholderHeight}px` }}>
          {slots.placeholder?.() || (
            <div class="placeholder-content">
              <div class="placeholder-skeleton"></div>
            </div>
          )}
        </div>
      )
    }
  },
})
