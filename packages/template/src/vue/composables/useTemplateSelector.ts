/**
 * useTemplateSelector 组合式函数
 *
 * 提供模板选择器的响应式功能
 */

import type { DeviceType, TemplateMetadata, UseTemplateSelectorReturn } from '../../types'
import { computed, ref, watch } from 'vue'

/**
 * 模板选择器组合式函数选项
 */
export interface UseTemplateSelectorOptions {
  /** 模板分类 */
  category: string
  /** 设备类型 */
  device?: DeviceType
  /** 初始选中的模板 */
  initialTemplate?: string
  /** 模板列表 */
  templates?: TemplateMetadata[]
  /** 模板变化回调 */
  onTemplateChange?: (template: string) => void
  /** 模板预览回调 */
  onTemplatePreview?: (template: string) => void
}

/**
 * useTemplateSelector 组合式函数
 */
export function useTemplateSelector(options: UseTemplateSelectorOptions): UseTemplateSelectorReturn {
  // 响应式状态
  const searchQuery = ref('')
  const selectedTemplate = ref<string | null>(options.initialTemplate || null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  // 计算属性 - 可用模板列表
  const availableTemplates = computed(() => {
    const templates = Array.isArray(options.templates) ? options.templates : []
    if (templates.length === 0) return []

    return templates.filter(template => {
      // 按分类过滤
      if (template.category !== options.category) return false

      // 按设备类型过滤
      if (options.device && template.device !== options.device) return false

      return true
    })
  })

  // 计算属性 - 过滤后的模板列表
  const filteredTemplates = computed(() => {
    if (!searchQuery.value) return availableTemplates.value

    const query = searchQuery.value.toLowerCase()
    return availableTemplates.value.filter((template: any) => {
      return (
        template.template.toLowerCase().includes(query) ||
        template.config.name.toLowerCase().includes(query) ||
        template.config.description?.toLowerCase().includes(query) ||
        template.config.tags?.some((tag: string) => tag.toLowerCase().includes(query))
      )
    })
  })

  // 选择模板
  const selectTemplate = (template: string) => {
    selectedTemplate.value = template
    options.onTemplateChange?.(template)
  }

  // 预览模板
  const previewTemplate = (template: string) => {
    options.onTemplatePreview?.(template)
  }

  // 搜索模板
  const searchTemplates = (query: string) => {
    searchQuery.value = query
  }

  // 刷新模板列表
  const refreshTemplates = async () => {
    loading.value = true
    error.value = null

    try {
      // 这里可以触发模板重新扫描
      // 具体实现依赖于传入的模板列表更新机制
      await new Promise(resolve => setTimeout(resolve, 100)) // 模拟异步操作
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  // 重置选择器
  const reset = () => {
    searchQuery.value = ''
    selectedTemplate.value = options.initialTemplate || null
    error.value = null
  }

  // 监听选项变化
  watch(
    () => options.category,
    () => {
      // 分类变化时重置选择
      selectedTemplate.value = null
      searchQuery.value = ''
    }
  )

  watch(
    () => options.device,
    () => {
      // 设备类型变化时重置选择
      selectedTemplate.value = null
    }
  )

  return {
    // 状态
    availableTemplates,
    filteredTemplates,
    searchQuery,
    selectedTemplate,
    loading,
    error,

    // 方法
    selectTemplate,
    previewTemplate,
    searchTemplates,
    refreshTemplates,
    reset,
  }
}
