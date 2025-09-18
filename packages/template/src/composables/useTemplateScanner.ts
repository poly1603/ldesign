/**
 * 模板扫描器组合式函数
 */

import type { DeviceType, TemplateMetadata } from '../types/template'
import { onMounted, ref, type Ref } from 'vue'
import { simpleTemplateScanner } from '../utils/template-scanner-simple'

/**
 * 扫描器选项
 */
interface UseTemplateScannerOptions {
  category?: string
  device?: DeviceType
}

/**
 * 扫描器返回值
 */
interface UseTemplateScannerReturn {
  templates: Ref<TemplateMetadata[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  scan: () => Promise<void>
  getTemplatesByCategory: (category: string) => TemplateMetadata[]
  getTemplatesByDevice: (device: DeviceType) => TemplateMetadata[]
  searchTemplates: (query: string) => TemplateMetadata[]
}

/**
 * 模板扫描器组合式函数
 */
export function useTemplateScanner(options: UseTemplateScannerOptions = {}): UseTemplateScannerReturn {
  const templates = ref<TemplateMetadata[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * 执行扫描
   */
  const scan = async () => {
    loading.value = true
    error.value = null

    try {
      // 使用简化版扫描器获取模板
      let result: TemplateMetadata[]
      
      if (options.category && options.device) {
        // 获取指定分类和设备的模板
        result = await simpleTemplateScanner.getTemplates(options.category, options.device)
      } else {
        // 获取所有模板
        result = await simpleTemplateScanner.getAllTemplates()
      }
      
      templates.value = result
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '扫描失败'
      console.error('Template scan failed:', err)
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 按分类获取模板
   */
  const getTemplatesByCategory = (category: string): TemplateMetadata[] => {
    return templates.value.filter(template => template.category === category)
  }

  /**
   * 按设备类型获取模板
   */
  const getTemplatesByDevice = (device: DeviceType): TemplateMetadata[] => {
    return templates.value.filter(template => template.device === device)
  }

  /**
   * 搜索模板
   */
  const searchTemplates = (query: string): TemplateMetadata[] => {
    const lowerQuery = query.toLowerCase()
    return templates.value.filter(template =>
      template.name.toLowerCase().includes(lowerQuery)
      || template.displayName?.toLowerCase().includes(lowerQuery)
      || template.description?.toLowerCase().includes(lowerQuery)
      || template.tags?.some(tag => tag.toLowerCase().includes(lowerQuery)),
    )
  }

  onMounted(() => {
    scan()
  })

  return {
    templates,
    loading,
    error,
    scan,
    getTemplatesByCategory,
    getTemplatesByDevice,
    searchTemplates,
  }
}
