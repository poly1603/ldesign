/**
 * 水印相关的 Composition API Hooks
 */

import { ref, computed, onUnmounted, watch, type Ref } from 'vue'
import {
  createWatermark,
  destroyWatermark,
  type WatermarkInstance,
  type WatermarkConfig
} from '../mock/watermark'

/**
 * 基础水印 Hook
 */
export function useWatermark(containerRef: Ref<HTMLElement | undefined>): any {
  const instance = ref<WatermarkInstance | null>(null)

  // 计算属性
  const isActive = computed(() => !!instance.value)

  // 创建水印
  const create = async (content: string, config?: Partial<WatermarkConfig>) => {
    if (!containerRef.value) {
      throw new Error('Container element not found')
    }

    // 如果已存在实例，先销毁
    if (instance.value) {
      await destroy()
    }

    try {
      instance.value = await createWatermark(containerRef.value, {
        content,
        ...config
      })
    } catch (error) {
      console.error('Failed to create watermark:', error)
      throw error
    }
  }

  // 销毁水印
  const destroy = async () => {
    if (instance.value) {
      try {
        await destroyWatermark(instance.value)
        instance.value = null
      } catch (error) {
        console.error('Failed to destroy watermark:', error)
        throw error
      }
    }
  }

  // 切换水印显示状态
  const toggle = async () => {
    if (isActive.value) {
      await destroy()
    } else {
      await create('Default Watermark')
    }
  }

  // 更新水印配置
  const update = async (config: Partial<WatermarkConfig>) => {
    if (!instance.value || !containerRef.value) return

    const currentContent = instance.value.config.content
    await destroy()
    await create(currentContent as string, config)
  }

  // 组件卸载时自动清理
  onUnmounted(async () => {
    await destroy()
  })

  return {
    instance,
    isActive,
    create,
    destroy,
    toggle,
    update
  }
}

/**
 * 高级水印 Hook - 包含更多状态管理
 */
export function useAdvancedWatermark(
  containerRef: Ref<HTMLElement | undefined>,
  defaultConfig?: Partial<WatermarkConfig>
): any {
  const instance = ref<WatermarkInstance | null>(null)
  const status = ref<'idle' | 'creating' | 'active' | 'updating' | 'destroying'>('idle')
  const error = ref<Error | null>(null)
  const updateCount = ref(0)
  const createdAt = ref<Date | null>(null)

  // 计算属性
  const isActive = computed(() => status.value === 'active')
  const isLoading = computed(() => ['creating', 'updating', 'destroying'].includes(status.value))

  // 创建水印
  const create = async (config?: Partial<WatermarkConfig>) => {
    if (!containerRef.value) {
      error.value = new Error('Container element not found')
      return
    }

    status.value = 'creating'
    error.value = null

    try {
      // 如果已存在实例，先销毁
      if (instance.value) {
        await destroy()
      }

      const finalConfig = {
        content: 'Advanced Watermark',
        style: {
          fontSize: 16,
          color: 'rgba(0, 0, 0, 0.15)',
          opacity: 0.8
        },
        ...defaultConfig,
        ...config
      }

      instance.value = await createWatermark(containerRef.value, finalConfig)
      status.value = 'active'
      createdAt.value = new Date()
      updateCount.value = 0

    } catch (err) {
      error.value = err as Error
      status.value = 'idle'
      console.error('Failed to create watermark:', err)
    }
  }

  // 更新水印
  const update = async (config?: Partial<WatermarkConfig>) => {
    if (!instance.value || !containerRef.value) return

    status.value = 'updating'
    error.value = null

    try {
      const currentConfig = instance.value.config
      const newConfig = {
        ...currentConfig,
        ...config
      }

      await destroyWatermark(instance.value)
      instance.value = await createWatermark(containerRef.value, newConfig)

      status.value = 'active'
      updateCount.value++

    } catch (err) {
      error.value = err as Error
      status.value = 'idle'
      console.error('Failed to update watermark:', err)
    }
  }

  // 销毁水印
  const destroy = async () => {
    if (!instance.value) return

    status.value = 'destroying'
    error.value = null

    try {
      await destroyWatermark(instance.value)
      instance.value = null
      status.value = 'idle'
      createdAt.value = null
      updateCount.value = 0

    } catch (err) {
      error.value = err as Error
      status.value = 'active' // 回滚状态
      console.error('Failed to destroy watermark:', err)
    }
  }

  // 切换显示状态
  const toggle = async () => {
    if (isActive.value) {
      await destroy()
    } else {
      await create()
    }
  }

  // 重置错误状态
  const clearError = () => {
    error.value = null
  }

  // 获取统计信息
  const getStats = () => {
    return {
      isActive: isActive.value,
      status: status.value,
      updateCount: updateCount.value,
      createdAt: createdAt.value,
      uptime: createdAt.value ? Date.now() - createdAt.value.getTime() : 0,
      hasError: !!error.value
    }
  }

  // 组件卸载时自动清理
  onUnmounted(async () => {
    await destroy()
  })

  return {
    // 状态
    instance,
    status,
    error,
    updateCount,
    createdAt,

    // 计算属性
    isActive,
    isLoading,

    // 方法
    create,
    update,
    destroy,
    toggle,
    clearError,
    getStats
  }
}

/**
 * 响应式水印 Hook - 自动响应配置变化
 */
export function useReactiveWatermark(
  containerRef: Ref<HTMLElement | undefined>,
  config: Ref<WatermarkConfig | null>
): any {
  const { instance, create, destroy } = useWatermark(containerRef)

  // 监听配置变化
  watch(
    config,
    async (newConfig, oldConfig) => {
      if (!newConfig) {
        await destroy()
        return
      }

      if (!oldConfig || JSON.stringify(newConfig) !== JSON.stringify(oldConfig)) {
        await create(newConfig.content as string, newConfig)
      }
    },
    { immediate: true, deep: true }
  )

  return {
    instance,
    isActive: computed(() => !!instance.value)
  }
}

/**
 * 批量水印管理 Hook
 */
export function useWatermarkManager(): any {
  const instances = ref<Map<string, WatermarkInstance>>(new Map())

  // 创建水印
  const create = async (
    id: string,
    container: HTMLElement,
    config: Partial<WatermarkConfig>
  ) => {
    // 如果已存在，先销毁
    if (instances.value.has(id)) {
      await destroy(id)
    }

    try {
      const instance = await createWatermark(container, config)
      instances.value.set(id, instance)
      return instance
    } catch (error) {
      console.error(`Failed to create watermark ${id}:`, error)
      throw error
    }
  }

  // 销毁指定水印
  const destroy = async (id: string) => {
    const instance = instances.value.get(id)
    if (instance) {
      try {
        await destroyWatermark(instance)
        instances.value.delete(id)
      } catch (error) {
        console.error(`Failed to destroy watermark ${id}:`, error)
        throw error
      }
    }
  }

  // 销毁所有水印
  const destroyAll = async () => {
    const promises = Array.from(instances.value.keys()).map(id => destroy(id))
    await Promise.all(promises)
  }

  // 获取指定水印
  const get = (id: string) => {
    return instances.value.get(id)
  }

  // 获取所有水印ID
  const getAllIds = () => {
    return Array.from(instances.value.keys())
  }

  // 获取水印数量
  const count = computed(() => instances.value.size)

  // 组件卸载时清理所有实例
  onUnmounted(async () => {
    await destroyAll()
  })

  return {
    instances,
    count,
    create,
    destroy,
    destroyAll,
    get,
    getAllIds
  }
}
