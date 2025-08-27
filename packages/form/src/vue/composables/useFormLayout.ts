/**
 * 表单布局组合式函数
 * 
 * 提供布局相关的响应式状态和方法
 */

import { ref, reactive, computed, inject, watch, onMounted, onUnmounted } from 'vue'
import type { LayoutConfig, LayoutResult, BreakpointType } from '../../types'

/**
 * 布局Hook选项
 */
export interface UseFormLayoutOptions {
  // 布局配置
  layoutConfig?: LayoutConfig
  // 容器元素
  container?: HTMLElement
  // 响应式配置
  responsive?: boolean
  // 自动计算
  autoCalculate?: boolean
}

/**
 * 布局Hook返回值
 */
export interface UseFormLayoutReturn {
  // 布局状态
  layoutResult: any
  columns: any
  rows: any
  gap: any
  breakpoint: any
  containerSize: any
  // 响应式状态
  isResponsive: any
  isMobile: any
  isTablet: any
  isDesktop: any
  // 方法
  updateLayout: (config?: LayoutConfig) => void
  recalculate: () => void
  setContainer: (element: HTMLElement) => void
  // 工具方法
  getFieldPosition: (fieldName: string) => any
  getVisibleFields: () => string[]
  getSectionFields: (section: 'default' | 'expanded') => string[]
}

/**
 * 使用表单布局Hook
 */
export function useFormLayout(
  options: UseFormLayoutOptions = {}
): UseFormLayoutReturn {
  const {
    layoutConfig,
    container,
    responsive = true,
    autoCalculate = true
  } = options
  
  // 注入表单实例
  const formInstance = inject('formInstance', ref(null))
  
  // 响应式状态
  const layoutResult = ref<LayoutResult | null>(null)
  const containerElement = ref<HTMLElement | null>(container || null)
  const containerSize = reactive({ width: 0, height: 0 })
  
  // 计算属性
  const columns = computed(() => layoutResult.value?.columns || 3)
  const rows = computed(() => layoutResult.value?.rows || 0)
  const gap = computed(() => layoutResult.value?.gap || { horizontal: 16, vertical: 16 })
  const breakpoint = computed(() => layoutResult.value?.breakpoint || 'md')
  
  const isResponsive = computed(() => responsive)
  const isMobile = computed(() => ['xs', 'sm'].includes(breakpoint.value))
  const isTablet = computed(() => breakpoint.value === 'md')
  const isDesktop = computed(() => ['lg', 'xl'].includes(breakpoint.value))
  
  // 更新布局
  const updateLayout = (config?: LayoutConfig) => {
    if (!formInstance.value) return
    
    if (config) {
      formInstance.value.layoutEngine.updateLayout(config)
    }
    
    recalculate()
  }
  
  // 重新计算布局
  const recalculate = () => {
    if (!formInstance.value || !containerElement.value) return
    
    const width = containerElement.value.offsetWidth
    const height = containerElement.value.offsetHeight
    
    containerSize.width = width
    containerSize.height = height
    
    const result = formInstance.value.layoutEngine.calculate(
      layoutConfig || {},
      width
    )
    
    layoutResult.value = result
  }
  
  // 设置容器元素
  const setContainer = (element: HTMLElement) => {
    containerElement.value = element
    
    if (formInstance.value) {
      formInstance.value.layoutEngine.setContainer(element)
    }
    
    // 立即重新计算
    recalculate()
  }
  
  // 获取字段位置
  const getFieldPosition = (fieldName: string) => {
    if (!formInstance.value) return null
    
    // 这里应该从布局引擎获取字段位置信息
    // 简化实现
    return null
  }
  
  // 获取可见字段
  const getVisibleFields = (): string[] => {
    if (!formInstance.value) return []
    
    return formInstance.value.layoutEngine.getVisibleFields()
  }
  
  // 获取分区字段
  const getSectionFields = (section: 'default' | 'expanded'): string[] => {
    if (!formInstance.value) return []
    
    const sectionResult = formInstance.value.layoutEngine.getLastSectionResult()
    if (!sectionResult) return []
    
    if (section === 'default') {
      return sectionResult.defaultSection.map((field: any) => field.name).filter(Boolean)
    } else {
      return sectionResult.expandedSection.map((field: any) => field.name).filter(Boolean)
    }
  }
  
  // 监听表单实例变化
  watch(formInstance, (newInstance) => {
    if (newInstance) {
      // 监听布局更新事件
      newInstance.eventBus.on('layout:updated', (event: any) => {
        layoutResult.value = event.layoutResult
      })
      
      // 监听响应式变化事件
      newInstance.eventBus.on('layout:responsive', (event: any) => {
        layoutResult.value = { ...layoutResult.value, ...event.layoutResult }
      })
      
      // 设置容器
      if (containerElement.value) {
        newInstance.layoutEngine.setContainer(containerElement.value)
      }
    }
  }, { immediate: true })
  
  // 监听容器尺寸变化
  let resizeObserver: ResizeObserver | null = null
  
  const setupResizeObserver = () => {
    if (!containerElement.value || !window.ResizeObserver) return
    
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        containerSize.width = width
        containerSize.height = height
        
        // 防抖重新计算
        debounceRecalculate()
      }
    })
    
    resizeObserver.observe(containerElement.value)
  }
  
  // 防抖重新计算
  let recalculateTimer: NodeJS.Timeout | null = null
  const debounceRecalculate = () => {
    if (recalculateTimer) {
      clearTimeout(recalculateTimer)
    }
    
    recalculateTimer = setTimeout(() => {
      recalculate()
    }, 100)
  }
  
  // 监听容器元素变化
  watch(containerElement, (newElement, oldElement) => {
    // 清理旧的观察器
    if (resizeObserver && oldElement) {
      resizeObserver.unobserve(oldElement)
    }
    
    // 设置新的观察器
    if (newElement) {
      setupResizeObserver()
      recalculate()
    }
  }, { immediate: true })
  
  // 生命周期
  onMounted(() => {
    if (containerElement.value) {
      setupResizeObserver()
      recalculate()
    }
  })
  
  onUnmounted(() => {
    // 清理观察器
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    
    // 清理定时器
    if (recalculateTimer) {
      clearTimeout(recalculateTimer)
    }
  })
  
  return {
    layoutResult,
    columns,
    rows,
    gap,
    breakpoint,
    containerSize,
    isResponsive,
    isMobile,
    isTablet,
    isDesktop,
    updateLayout,
    recalculate,
    setContainer,
    getFieldPosition,
    getVisibleFields,
    getSectionFields
  }
}
