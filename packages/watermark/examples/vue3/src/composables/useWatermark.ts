/**
 * 示例项目中的水印组合式API
 * 这是对核心库useWatermark的简化封装
 */

import type { WatermarkConfig, WatermarkInstance } from '@ldesign/watermark'
import type { Ref } from 'vue'
import { createWatermark, destroyWatermark } from '@ldesign/watermark'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'

export interface UseWatermarkReturn {
  instance: Ref<WatermarkInstance | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  isCreated: Readonly<Ref<boolean>>
  isActive: Readonly<Ref<boolean>> // 别名，保持向后兼容
  create: (content: string, config?: Partial<WatermarkConfig>) => Promise<void>
  update: (config: Partial<WatermarkConfig>) => Promise<void>
  destroy: () => Promise<void>
  toggle: () => Promise<void>
  clearError: () => void
}

/**
 * 水印组合式API
 */
export function useWatermark(
  container?: Ref<HTMLElement | undefined>,
): UseWatermarkReturn {
  // 状态管理
  const instance = ref<WatermarkInstance | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 计算属性
  const isCreated = computed(() => instance.value !== null)
  const isActive = isCreated // 别名，保持向后兼容

  /**
   * 销毁水印
   */
  const destroy = async (): Promise<void> => {
    if (!instance.value || loading.value)
      return

    try {
      loading.value = true
      error.value = null

      await destroyWatermark(instance.value)
      instance.value = null
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 创建水印
   */
  const create = async (
    content: string,
    config: Partial<WatermarkConfig> = {},
  ): Promise<void> => {
    if (loading.value)
      return

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
      const newInstance = await createWatermark(containerElement, {
        content,
        ...config,
      })

      instance.value = newInstance
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 更新水印
   */
  const update = async (config: Partial<WatermarkConfig>): Promise<void> => {
    if (!instance.value || loading.value)
      return

    try {
      loading.value = true
      error.value = null

      // 重新创建水印（简化实现）
      const containerElement = container?.value
      if (!containerElement) {
        throw new Error('Container element is required')
      }

      await destroy()
      const newInstance = await createWatermark(containerElement, {
        ...instance.value.config,
        ...config,
      })
      instance.value = newInstance
    }
    catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      throw err
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 切换水印显示状态
   */
  const toggle = async (): Promise<void> => {
    if (instance.value) {
      await destroy()
    } else {
      // 需要默认内容，这里使用简单的默认值
      await create('Toggle Watermark')
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
          if (newContainer && currentConfig.content) {
            await create(currentConfig.content as string, currentConfig)
          }
        }
      },
      { flush: 'post' },
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
    isActive,
    create,
    update,
    destroy,
    toggle,
    clearError,
  }
}
