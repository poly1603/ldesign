/**
 * 模板选择器组合式函数
 */

import type { DeviceType, TemplateMetadata } from '../types/template'
import { computed, type ComputedRef, ref, type Ref, watch } from 'vue'

/**
 * 选择器选项
 */
interface UseTemplateSelectorOptions {
  templates?: TemplateMetadata[]
  defaultCategory?: string
  defaultDevice?: DeviceType
}

/**
 * 选择器返回值
 */
interface UseTemplateSelectorReturn {
  selectedTemplate: Ref<TemplateMetadata | null>
  selectedCategory: Ref<string>
  selectedDevice: Ref<DeviceType>
  searchQuery: Ref<string>
  filteredTemplates: ComputedRef<TemplateMetadata[]>
  availableCategories: ComputedRef<string[]>
  availableDevices: ComputedRef<DeviceType[]>
  selectTemplate: (template: TemplateMetadata) => void
  setCategory: (category: string) => void
  setDevice: (device: DeviceType) => void
  setSearchQuery: (query: string) => void
  reset: () => void
  previewTemplate: (template: TemplateMetadata) => void
}

/**
 * 模板选择器组合式函数
 */
export function useTemplateSelector(options: UseTemplateSelectorOptions = {}): UseTemplateSelectorReturn {
  const selectedTemplate = ref<TemplateMetadata | null>(null)
  const selectedCategory = ref(options.defaultCategory || '')
  const selectedDevice = ref<DeviceType>(options.defaultDevice || 'desktop')
  const searchQuery = ref('')
  const templates = ref<TemplateMetadata[]>(options.templates || [])

  /**
   * 过滤后的模板列表
   */
  const filteredTemplates = computed(() => {
    let filtered = templates.value

    // 按分类过滤
    if (selectedCategory.value) {
      filtered = filtered.filter(template => template.category === selectedCategory.value)
    }

    // 按设备类型过滤
    if (selectedDevice.value) {
      filtered = filtered.filter(template => template.device === selectedDevice.value)
    }

    // 按搜索查询过滤
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(query)
        || template.displayName?.toLowerCase().includes(query)
        || template.description?.toLowerCase().includes(query)
        || template.tags?.some(tag => tag.toLowerCase().includes(query)),
      )
    }

    return filtered
  })

  /**
   * 可用的分类列表
   */
  const availableCategories = computed(() => {
    const categories = new Set(templates.value.map(template => template.category))
    return Array.from(categories).sort()
  })

  /**
   * 可用的设备类型列表
   */
  const availableDevices = computed(() => {
    const devices = new Set(templates.value.map(template => template.device))
    return Array.from(devices).sort() as DeviceType[]
  })

  /**
   * 选择模板
   */
  const selectTemplate = (template: TemplateMetadata) => {
    selectedTemplate.value = template
    selectedCategory.value = template.category
    selectedDevice.value = template.device
  }

  /**
   * 设置分类
   */
  const setCategory = (category: string) => {
    selectedCategory.value = category
    // 如果当前选中的模板不属于新分类，清除选择
    if (selectedTemplate.value && selectedTemplate.value.category !== category) {
      selectedTemplate.value = null
    }
  }

  /**
   * 设置设备类型
   */
  const setDevice = (device: DeviceType) => {
    selectedDevice.value = device
    // 如果当前选中的模板不属于新设备类型，清除选择
    if (selectedTemplate.value && selectedTemplate.value.device !== device) {
      selectedTemplate.value = null
    }
  }

  /**
   * 设置搜索查询
   */
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  /**
   * 重置选择器状态
   */
  const reset = () => {
    selectedTemplate.value = null
    selectedCategory.value = options.defaultCategory || ''
    selectedDevice.value = options.defaultDevice || 'desktop'
    searchQuery.value = ''
  }

  /**
   * 预览模板
   */
  const previewTemplate = (template: TemplateMetadata) => {
    // 这里可以实现预览逻辑
    console.log('Previewing template:', template.name)
  }

  // 监听模板列表变化
  watch(() => options.templates, (newTemplates) => {
    if (newTemplates) {
      templates.value = newTemplates
    }
  }, { immediate: true })

  return {
    selectedTemplate,
    selectedCategory,
    selectedDevice,
    searchQuery,
    filteredTemplates,
    availableCategories,
    availableDevices,
    selectTemplate,
    setCategory,
    setDevice,
    setSearchQuery,
    reset,
    previewTemplate,
  }
}
