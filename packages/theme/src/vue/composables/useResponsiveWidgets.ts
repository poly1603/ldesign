/**
 * @file useResponsiveWidgets 组合式函数
 * @description 响应式挂件管理的组合式函数
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'
import type { WidgetConfig } from '../../core/types'
import type { UseResponsiveWidgetsReturn } from '../types'

/**
 * 使用响应式挂件管理的组合式函数
 * 
 * @returns 响应式挂件管理相关的响应式数据和方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useResponsiveWidgets } from '@ldesign/theme/vue'
 * 
 * const {
 *   isMobile,
 *   isTablet,
 *   isDesktop,
 *   screenWidth,
 *   screenHeight,
 *   filterWidgetsByDevice
 * } = useResponsiveWidgets()
 * 
 * // 根据设备类型过滤挂件
 * const widgets = [
 *   { id: 'widget1', responsive: { mobile: true, tablet: false, desktop: true } },
 *   { id: 'widget2', responsive: { mobile: false, tablet: true, desktop: true } }
 * ]
 * const filteredWidgets = filterWidgetsByDevice(widgets)
 * </script>
 * ```
 */
export function useResponsiveWidgets(): UseResponsiveWidgetsReturn {
  // 响应式状态
  const screenWidth = ref<number>(window.innerWidth)
  const screenHeight = ref<number>(window.innerHeight)

  // 设备类型判断
  const isMobile = computed(() => screenWidth.value < 768)
  const isTablet = computed(() => screenWidth.value >= 768 && screenWidth.value < 1024)
  const isDesktop = computed(() => screenWidth.value >= 1024)

  // 窗口大小变化处理
  const handleResize = () => {
    screenWidth.value = window.innerWidth
    screenHeight.value = window.innerHeight
  }

  // 根据设备类型过滤挂件
  const filterWidgetsByDevice = (widgets: WidgetConfig[]): WidgetConfig[] => {
    return widgets.filter(widget => {
      // 如果挂件没有响应式配置，默认在所有设备上显示
      if (!widget.responsive) {
        return true
      }

      // 检查当前设备类型是否支持该挂件
      if (isMobile.value && widget.customProps?.responsive?.mobile === false) {
        return false
      }
      if (isTablet.value && widget.customProps?.responsive?.tablet === false) {
        return false
      }
      if (isDesktop.value && widget.customProps?.responsive?.desktop === false) {
        return false
      }

      return true
    })
  }

  // 生命周期
  onMounted(() => {
    window.addEventListener('resize', handleResize)
    // 初始化屏幕尺寸
    handleResize()
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
    filterWidgetsByDevice
  }
}
