/**
 * 模板列表 Composable
 * 用于获取特定类别和设备的可用模板列表
 */

import type { DeviceType, TemplateMetadata } from '../../types'
import { computed, onMounted, ref, type Ref, unref, watch } from 'vue'

import { useTemplateManager } from './useTemplateManager'

export interface UseTemplateListOptions {
  /** 模板类别 */
  category: string
  /** 设备类型 */
  device: DeviceType
  /** 是否自动加载 */
  autoLoad?: boolean
  /** 是否启用缓存 */
  enableCache?: boolean
}

export function useTemplateList(
  category: string | Ref<string>,
  device: DeviceType | Ref<DeviceType>,
  options: Partial<Omit<UseTemplateListOptions, 'category' | 'device'>> = {},
) {
  const { autoLoad = true, enableCache = true } = options

  // 获取管理器
  const { manager } = useTemplateManager()

  // 响应式状态
  const templates = ref<TemplateMetadata[]>([])
  const availableTemplates = computed(() => templates.value)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 缓存
  let cache: TemplateMetadata[] | null = null

  // 加载模板列表
  const load = async () => {
    loading.value = true
    error.value = null

    try {
      const currentCategory = unref(category)
      const currentDevice = unref(device)

      // 检查缓存
      const cacheKey = `templates:${currentCategory}:${currentDevice}`
      if (enableCache && cache) {
        templates.value = cache
        loading.value = false
        return
      }

      // 查询模板
      const results = manager.query({ category: currentCategory, device: currentDevice })
      const metadataList = results.map(r => r.metadata)

      // 更新状态
      templates.value = metadataList
      if (enableCache) {
        cache = metadataList
      }
    }
 catch (err) {
      error.value = err as Error
      console.error('[useTemplateList] Failed to load templates:', err)
    }
 finally {
      loading.value = false
    }
  }

  // 重新加载
  const refresh = async () => {
    cache = null
    await load()
  }

  // 按名称查找模板
  const findByName = (name: string): TemplateMetadata | undefined => {
    return templates.value.find(t => t.name === name)
  }

  // 按标签过滤
  const filterByTags = (...tags: string[]): TemplateMetadata[] => {
    return templates.value.filter(t =>
      t.tags && tags.some(tag => t.tags!.includes(tag)),
    )
  }

  // 获取默认模板
  const getDefault = (): TemplateMetadata | undefined => {
    return templates.value.find(t => t.isDefault)
  }

  // 监听类别和设备变化
  watch(
    () => [unref(category), unref(device)],
    () => {
      cache = null // 清空缓存
      if (autoLoad) {
        load()
      }
    },
  )

  // 自动加载
  if (autoLoad) {
    onMounted(() => {
      load()
    })
  }

  return {
    // 状态
    templates: availableTemplates,
    availableTemplates,
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // 方法
    load,
    refresh,
    findByName,
    filterByTags,
    getDefault,
  }
}
