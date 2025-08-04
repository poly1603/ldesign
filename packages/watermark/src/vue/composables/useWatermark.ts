/**
 * useWatermark 组合式API
 */

import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Ref } from 'vue'
import { WatermarkCore } from '../../core'
import type { WatermarkConfig, WatermarkInstance } from '../../types'
import type { UseWatermarkOptions, UseWatermarkReturn } from '../types'

/**
 * 水印组合式API
 */
export function useWatermark(
  container?: Ref<HTMLElement | undefined>,
  options: UseWatermarkOptions = {}
): UseWatermarkReturn {
  const {
    immediate = true,
    enableSecurity = true,
    enableResponsive = true
  } = options

  // 状态管理
  const instance = ref<WatermarkInstance | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const core = new WatermarkCore()

  // 计算属性
  const isCreated = computed(() => instance.value !== null)

  /**
   * 创建水印
   */
  const create = async (config: Partial<WatermarkConfig>): Promise<void> => {
    if (loading.value) return
    
    try {
      loading.value = true
      error.value = null

      // 等待DOM更新
      await nextTick()

      // 获取容器元素
      const containerElement = container?.value
      if (!containerElement) {
        throw new Error('Container element is required')
      }

      // 销毁现有实例
      if (instance.value) {
        await destroy()
      }

      // 创建新实例
      const newInstance = await core.create({
        ...config,
        container: containerElement
      }, {
        enableSecurity,
        enableResponsive,
        immediate: true
      })

      instance.value = newInstance
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新水印
   */
  const update = async (config: Partial<WatermarkConfig>): Promise<void> => {
    if (!instance.value || loading.value) return

    try {
      loading.value = true
      error.value = null

      await core.update(instance.value.id, config)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 销毁水印
   */
  const destroy = async (): Promise<void> => {
    if (!instance.value || loading.value) return

    try {
      loading.value = true
      error.value = null

      await core.destroy(instance.value.id)
      instance.value = null
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 暂停水印
   */
  const pause = async (): Promise<void> => {
    if (!instance.value || loading.value) return

    try {
      loading.value = true
      error.value = null

      await core.pause(instance.value.id)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 恢复水印
   */
  const resume = async (): Promise<void> => {
    if (!instance.value || loading.value) return

    try {
      loading.value = true
      error.value = null

      await core.resume(instance.value.id)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 清除错误
   */
  const clearError = (): void => {
    error.value = null
  }

  // 监听容器变化
  if (container) {
    watch(
      container,
      async (newContainer, oldContainer) => {
        if (newContainer !== oldContainer && instance.value) {
          // 容器变化时重新创建水印
          const currentConfig = { ...instance.value.config }
          await destroy()
          if (newContainer) {
            await create(currentConfig)
          }
        }
      },
      { flush: 'post' }
    )
  }

  // 组件卸载时清理
  onUnmounted(async () => {
    if (instance.value) {
      await destroy()
    }
  })

  return {
    instance,
    loading,
    error,
    isCreated,
    create,
    update,
    destroy,
    pause,
    resume,
    clearError
  }
}

/**
 * 简化版useWatermark，直接传入配置
 */
export function useSimpleWatermark(
  config: Ref<Partial<WatermarkConfig>> | Partial<WatermarkConfig>,
  container?: Ref<HTMLElement | undefined>,
  options: UseWatermarkOptions = {}
): UseWatermarkReturn {
  const watermark = useWatermark(container, options)
  const configRef = ref(config)

  // 监听配置变化
  watch(
    configRef,
    async (newConfig) => {
      if (watermark.isCreated.value) {
        await watermark.update(newConfig)
      } else if (container?.value && options.immediate !== false) {
        await watermark.create(newConfig)
      }
    },
    { deep: true, immediate: options.immediate !== false }
  )

  return watermark
}