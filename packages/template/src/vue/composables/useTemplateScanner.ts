/**
 * 模板扫描器 Composable
 * 用于扫描和搜索所有已注册的模板
 */

import type { TemplateMetadata, TemplateQueryOptions } from '../../types'
import { computed, onMounted, ref } from 'vue'
import { useTemplateManager } from './useTemplateManager'

export interface UseTemplateScannerOptions {
  /** 是否自动扫描 */
  autoScan?: boolean
  /** 查询选项 */
  queryOptions?: TemplateQueryOptions
}

export function useTemplateScanner(options: UseTemplateScannerOptions = {}) {
  const { autoScan = true, queryOptions = {} } = options

  // 获取管理器
  const { manager } = useTemplateManager()

  // 响应式状态
  const templates = ref<TemplateMetadata[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 扫描所有模板
  const scan = async () => {
    loading.value = true
    error.value = null

    try {
      const results = manager.query(queryOptions)
      templates.value = results.map(r => r.metadata)
    }
 catch (err) {
      error.value = err as Error
      console.error('[useTemplateScanner] Failed to scan templates:', err)
    }
 finally {
      loading.value = false
    }
  }

  // 搜索模板
  const searchTemplates = (query: string): TemplateMetadata[] => {
    if (!query.trim()) {
      return templates.value
    }

    const lowerQuery = query.toLowerCase()

    return templates.value.filter((t) => {
      // 搜索名称
      if (t.name.toLowerCase().includes(lowerQuery))
return true
      // 搜索显示名
      if (t.displayName?.toLowerCase().includes(lowerQuery))
return true
      // 搜索描述
      if (t.description?.toLowerCase().includes(lowerQuery))
return true
      // 搜索标签
      if (t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)))
return true
      // 搜索作者
      if (t.author?.toLowerCase().includes(lowerQuery))
return true
      // 搜索类别
      if (t.category.toLowerCase().includes(lowerQuery))
return true
      // 搜索设备
      if (t.device.toLowerCase().includes(lowerQuery))
return true

      return false
    })
  }

  // 按类别分组
  const groupByCategory = computed(() => {
    const groups: Record<string, TemplateMetadata[]> = {}

    templates.value.forEach((t) => {
      if (!groups[t.category]) {
        groups[t.category] = []
      }
      groups[t.category].push(t)
    })

    return groups
  })

  // 按设备分组
  const groupByDevice = computed(() => {
    const groups: Record<string, TemplateMetadata[]> = {}

    templates.value.forEach((t) => {
      if (!groups[t.device]) {
        groups[t.device] = []
      }
      groups[t.device].push(t)
    })

    return groups
  })

  // 按类别和设备分组
  const groupByCategoryAndDevice = computed(() => {
    const groups: Record<string, Record<string, TemplateMetadata[]>> = {}

    templates.value.forEach((t) => {
      if (!groups[t.category]) {
        groups[t.category] = {}
      }
      if (!groups[t.category][t.device]) {
        groups[t.category][t.device] = []
      }
      groups[t.category][t.device].push(t)
    })

    return groups
  })

  // 获取所有类别
  const categories = computed(() => {
    const cats = new Set(templates.value.map(t => t.category))
    return Array.from(cats)
  })

  // 获取所有设备类型
  const devices = computed(() => {
    const devs = new Set(templates.value.map(t => t.device))
    return Array.from(devs)
  })

  // 获取所有标签
  const tags = computed(() => {
    const allTags = new Set<string>()
    templates.value.forEach((t) => {
      t.tags?.forEach(tag => allTags.add(tag))
    })
    return Array.from(allTags)
  })

  // 统计信息
  const stats = computed(() => ({
    total: templates.value.length,
    categories: categories.value.length,
    devices: devices.value.length,
    tags: tags.value.length,
  }))

  // 自动扫描
  if (autoScan) {
    onMounted(() => {
      scan()
    })
  }

  return {
    // 状态
    templates: computed(() => templates.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // 分组数据
    groupByCategory,
    groupByDevice,
    groupByCategoryAndDevice,

    // 列表
    categories,
    devices,
    tags,

    // 统计
    stats,

    // 方法
    scan,
    searchTemplates,
  }
}
