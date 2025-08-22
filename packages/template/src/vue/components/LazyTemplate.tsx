/**
 * LazyTemplate 组件 - 懒加载模板组件
 *
 * 支持 Intersection Observer API 进行可视区域检测
 * 提供懒加载、占位符、错误处理等功能
 */

import type { PropType } from 'vue'
import type { DeviceType } from '../../types'
import { computed, defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import { TemplateRenderer } from './TemplateRenderer'

export interface LazyTemplateProps {
  category: string
  device?: DeviceType
  template: string
  lazy?: boolean
  placeholderHeight?: number
  rootMargin?: string
  threshold?: number | number[]
}

export const LazyTemplate = defineComponent({
  name: 'LazyTemplate',
  props: {
    category: {
      type: String,
      required: true,
    },
    device: {
      type: String as PropType<DeviceType>,
      default: 'desktop',
    },
    template: {
      type: String,
      required: true,
    },
    lazy: {
      type: Boolean,
      default: true,
    },
    placeholderHeight: {
      type: Number,
      default: 300,
    },
    rootMargin: {
      type: String,
      default: '50px',
    },
    threshold: {
      type: [Number, Array] as PropType<number | number[]>,
      default: 0.1,
    },
  },
  emits: ['load', 'visible', 'error'],
  setup(props: any, { emit, slots }: any) {
    const containerRef = ref<HTMLElement>()
    const isVisible = ref(!props.lazy) // 非懒加载模式下立即可见
    const isLoaded = ref(false)
    const error = ref<Error | null>(null)
    const observer = ref<IntersectionObserver | null>(null)

    // 计算样式
    const containerStyle = computed(() => ({
      minHeight: props.lazy && !isVisible.value ? `${props.placeholderHeight}px` : 'auto',
    }))

    // 初始化 Intersection Observer
    const initObserver = () => {
      if (!props.lazy || !containerRef.value || typeof IntersectionObserver === 'undefined') {
        return
      }

      observer.value = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isVisible.value) {
              isVisible.value = true
              emit('visible')
              // 一旦可见就停止观察
              if (observer.value) {
                observer.value.disconnect()
              }
            }
          })
        },
        {
          rootMargin: props.rootMargin,
          threshold: props.threshold,
        },
      )

      observer.value.observe(containerRef.value)
    }

    // 处理模板加载成功
    const handleLoad = (result: any) => {
      isLoaded.value = true
      error.value = null
      emit('load', result)
    }

    // 处理模板加载错误
    const handleError = (err: Error) => {
      error.value = err
      emit('error', err)
    }

    // 重试加载
    const retry = () => {
      error.value = null
      isLoaded.value = false
    }

    // 监听 lazy 属性变化
    watch(
      () => props.lazy,
      (newLazy) => {
        if (!newLazy) {
          isVisible.value = true
          if (observer.value) {
            observer.value.disconnect()
          }
        }
        else if (!isVisible.value) {
          initObserver()
        }
      },
    )

    onMounted(() => {
      if (props.lazy) {
        initObserver()
      }
    })

    onUnmounted(() => {
      if (observer.value) {
        observer.value.disconnect()
      }
    })

    return () => {
      // 如果不可见，显示占位符
      if (!isVisible.value) {
        return (
          <div ref={containerRef} class="lazy-template-placeholder" style={containerStyle.value}>
            {slots.placeholder?.() || (
              <div class="lazy-template-default-placeholder">
                <div class="lazy-template-skeleton" />
              </div>
            )}
          </div>
        )
      }

      // 如果有错误，显示错误状态
      if (error.value) {
        return (
          <div class="lazy-template-error">
            {slots.error?.({ error: error.value, retry }) || (
              <div class="lazy-template-default-error">
                <p>
                  ❌ 模板加载失败:
                  {error.value.message}
                </p>
                <button onClick={retry}>重试</button>
              </div>
            )}
          </div>
        )
      }

      // 如果正在加载，显示加载状态
      if (!isLoaded.value) {
        return (
          <div class="lazy-template-loading">
            {slots.loading?.() || (
              <div class="lazy-template-default-loading">
                <div class="lazy-template-spinner" />
                <p>正在加载模板...</p>
              </div>
            )}
          </div>
        )
      }

      // 渲染实际模板
      return (
        <div ref={containerRef} class="lazy-template-content">
          <TemplateRenderer
            category={props.category}
            device={props.device}
            template={props.template}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      )
    }
  },
})

export default LazyTemplate
