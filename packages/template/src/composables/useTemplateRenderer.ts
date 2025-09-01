/**
 * 模板渲染器组合式函数
 */

import type { TemplateMetadata } from '../types/template'
import { type Component, markRaw, ref, type Ref } from 'vue'
import { componentCache } from '../utils/cache'
import { componentLoader } from '../utils/loader'

/**
 * 渲染器选项
 */
interface UseTemplateRendererOptions {
  enableCache?: boolean
  autoLoad?: boolean
}

/**
 * 渲染器返回值
 */
interface UseTemplateRendererReturn {
  currentTemplate: Ref<TemplateMetadata | null>
  currentComponent: Ref<Component | null>
  loading: Ref<boolean>
  error: Ref<string | null>
  renderTemplate: (template: TemplateMetadata) => Promise<void>
  clearTemplate: () => void
  retryLoad: () => Promise<void>
  preloadTemplate: (template: TemplateMetadata) => Promise<void>
}

/**
 * 模板渲染器组合式函数
 */
export function useTemplateRenderer(options: UseTemplateRendererOptions = {}): UseTemplateRendererReturn {
  const currentTemplate = ref<TemplateMetadata | null>(null)
  const currentComponent = ref<Component | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const { enableCache = true, autoLoad = true } = options

  /**
   * 渲染模板
   */
  const renderTemplate = async (template: TemplateMetadata) => {
    if (!template) {
      clearTemplate()
      return
    }

    // 如果是同一个模板，不重复加载
    if (currentTemplate.value?.componentPath === template.componentPath) {
      return
    }

    loading.value = true
    error.value = null

    try {
      let component: Component | null = null

      // 尝试从缓存获取
      if (enableCache) {
        component = componentCache.get(template.category, template.device, template.name)
      }

      // 如果缓存中没有，则加载组件
      if (!component) {
        if (template.componentLoader) {
          component = await template.componentLoader()
        }
        else {
          component = await componentLoader.loadComponent(template.componentPath)
        }

        // 缓存组件
        if (enableCache && component) {
          componentCache.set(template.category, template.device, template.name, component)
        }
      }

      if (component) {
        currentTemplate.value = template
        currentComponent.value = markRaw(component)
      }
      else {
        throw new Error(`Failed to load component: ${template.componentPath}`)
      }
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : '加载模板失败'
      console.error('Template render failed:', err)
      currentTemplate.value = null
      currentComponent.value = null
    }
    finally {
      loading.value = false
    }
  }

  /**
   * 清除当前模板
   */
  const clearTemplate = () => {
    currentTemplate.value = null
    currentComponent.value = null
    error.value = null
  }

  /**
   * 重试加载
   */
  const retryLoad = async () => {
    if (currentTemplate.value) {
      await renderTemplate(currentTemplate.value)
    }
  }

  /**
   * 预加载模板
   */
  const preloadTemplate = async (template: TemplateMetadata) => {
    if (!template || !enableCache) {
      return
    }

    try {
      // 检查缓存中是否已存在
      const cached = componentCache.get(template.category, template.device, template.name)
      if (cached) {
        return
      }

      // 加载组件
      let component: Component | null = null
      if (template.componentLoader) {
        component = await template.componentLoader()
      }
      else {
        component = await componentLoader.loadComponent(template.componentPath)
      }

      // 缓存组件
      if (component) {
        componentCache.set(template.category, template.device, template.name, component)
      }
    }
    catch (err) {
      console.warn('Template preload failed:', err)
    }
  }

  return {
    currentTemplate,
    currentComponent,
    loading,
    error,
    renderTemplate,
    clearTemplate,
    retryLoad,
    preloadTemplate,
  }
}
