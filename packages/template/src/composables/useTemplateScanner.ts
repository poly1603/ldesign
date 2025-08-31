/**
 * 模板扫描器组合式函数
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { TemplateMetadata, DeviceType } from '../types/template'
import { TemplateScanner } from '../scanner'

/**
 * 扫描器选项
 */
interface UseTemplateScannerOptions {
  templatesDir?: string
  enableCache?: boolean
  enableHMR?: boolean
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

  let scanner: TemplateScanner | null = null

  /**
   * 初始化扫描器
   */
  const initScanner = () => {
    scanner = new TemplateScanner({
      templatesDir: options.templatesDir || 'src/templates',
      enableCache: options.enableCache ?? true,
      enableHMR: options.enableHMR ?? import.meta.env.DEV
    })
  }

  /**
   * 执行扫描
   */
  const scan = async () => {
    if (!scanner) {
      initScanner()
    }

    loading.value = true
    error.value = null

    try {
      const result = await scanner!.scan()
      templates.value = Array.from(result.templates.values()).flat()
    } catch (err) {
      error.value = err instanceof Error ? err.message : '扫描失败'
      console.error('Template scan failed:', err)
    } finally {
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
      template.name.toLowerCase().includes(lowerQuery) ||
      template.displayName?.toLowerCase().includes(lowerQuery) ||
      template.description?.toLowerCase().includes(lowerQuery) ||
      template.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  onMounted(() => {
    scan()
  })

  onUnmounted(() => {
    if (scanner) {
      scanner.destroy()
    }
  })

  return {
    templates,
    loading,
    error,
    scan,
    getTemplatesByCategory,
    getTemplatesByDevice,
    searchTemplates
  }
}
