/**
 * 水印 Composition API Hook - 使用核心包
 * Watermark composable using the core package
 */

import { ref, computed, onUnmounted, type Ref } from 'vue'
import {
  createWatermark,
  destroyWatermark,
  type WatermarkInstance,
  type WatermarkConfig
} from '../lib/watermark'

/**
 * 基础水印 Hook
 */
export function useWatermark(containerRef: Ref<HTMLElement | undefined>) {
  const instance = ref<WatermarkInstance | null>(null)
  const isActive = computed(() => !!instance.value)
  const error = ref<Error | null>(null)

  const create = async (content: string | string[], config?: Partial<WatermarkConfig>) => {
    if (!containerRef.value) {
      throw new Error('Container element not found')
    }

    try {
      error.value = null

      if (instance.value) {
        await destroyWatermark(instance.value)
      }

      instance.value = await createWatermark(containerRef.value, {
        content,
        ...config
      })
    } catch (err) {
      error.value = err as Error
      console.error('Failed to create watermark:', err)
      throw err
    }
  }

  const destroy = async () => {
    if (instance.value) {
      try {
        await destroyWatermark(instance.value)
        instance.value = null
        error.value = null
      } catch (err) {
        error.value = err as Error
        console.error('Failed to destroy watermark:', err)
      }
    }
  }

  const update = async (config: Partial<WatermarkConfig>) => {
    if (instance.value && instance.value.update) {
      try {
        await instance.value.update(config)
        error.value = null
      } catch (err) {
        error.value = err as Error
        console.error('Failed to update watermark:', err)
      }
    }
  }

  const toggle = async () => {
    if (isActive.value) {
      await destroy()
    } else {
      await create('Default Watermark')
    }
  }

  // 自动清理
  onUnmounted(async () => {
    await destroy()
  })

  return {
    instance,
    isActive,
    error,
    create,
    destroy,
    update,
    toggle
  }
}

/**
 * 批量水印管理 Hook
 */
export function useWatermarkManager() {
  const instances = ref<Map<string, WatermarkInstance>>(new Map())
  const count = computed(() => instances.value.size)

  const create = async (
    id: string,
    container: HTMLElement,
    content: string | string[],
    config?: Partial<WatermarkConfig>
  ) => {
    if (instances.value.has(id)) {
      await destroy(id)
    }

    try {
      const instance = await createWatermark(container, {
        content,
        ...config
      })
      instances.value.set(id, instance)
      return instance
    } catch (error) {
      console.error(`Failed to create watermark ${id}:`, error)
      throw error
    }
  }

  const destroy = async (id: string) => {
    const instance = instances.value.get(id)
    if (instance) {
      try {
        await destroyWatermark(instance)
        instances.value.delete(id)
      } catch (error) {
        console.error(`Failed to destroy watermark ${id}:`, error)
      }
    }
  }

  const destroyAll = async () => {
    const promises = Array.from(instances.value.keys()).map(id => destroy(id))
    await Promise.all(promises)
  }

  const get = (id: string) => instances.value.get(id)
  const getAllIds = () => Array.from(instances.value.keys())

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
