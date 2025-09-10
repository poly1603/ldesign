/**
 * @file useWidgets 组合式函数
 * @description 挂件管理的组合式函数
 */

import { ref, inject, onMounted, onUnmounted, type Ref } from 'vue'
import type { FestivalThemeManager } from '../../core/theme-manager'
import type { WidgetConfig } from '../../core/types'
import type { UseWidgetsReturn } from '../types'

/**
 * 使用挂件管理的组合式函数
 * 
 * @returns 挂件管理相关的响应式数据和方法
 * 
 * @example
 * ```vue
 * <script setup>
 * import { useWidgets } from '@ldesign/theme/vue'
 * 
 * const {
 *   widgets,
 *   addWidget,
 *   removeWidget,
 *   updateWidget,
 *   clearWidgets,
 *   showWidget,
 *   hideWidget
 * } = useWidgets()
 * 
 * // 添加自定义挂件
 * const customWidget = {
 *   id: 'my-widget',
 *   name: '我的挂件',
 *   type: 'floating',
 *   content: '<div>Hello World</div>',
 *   position: { type: 'fixed', position: { x: '50%', y: '50%' }, anchor: 'center' }
 * }
 * await addWidget(customWidget)
 * </script>
 * ```
 */
export function useWidgets(): UseWidgetsReturn {
  // 注入主题管理器
  const themeManager = inject<FestivalThemeManager>('themeManager')
  
  if (!themeManager) {
    throw new Error('useWidgets must be used within a theme provider or after installing the Vue theme plugin')
  }

  // 响应式状态
  const widgets = ref<WidgetConfig[]>([])

  // 事件监听器
  const handleWidgetsUpdate = (updatedWidgets: WidgetConfig[]) => {
    widgets.value = [...updatedWidgets]
  }

  // 添加挂件
  const addWidget = async (widget: WidgetConfig): Promise<void> => {
    await themeManager.widgetManager.addWidget(widget)
  }

  // 移除挂件
  const removeWidget = async (id: string): Promise<void> => {
    await themeManager.widgetManager.removeWidget(id)
  }

  // 更新挂件
  const updateWidget = async (id: string, updates: Partial<WidgetConfig>): Promise<void> => {
    await themeManager.widgetManager.updateWidget(id, updates)
  }

  // 清空挂件
  const clearWidgets = async (): Promise<void> => {
    await themeManager.widgetManager.clearWidgets()
  }

  // 显示挂件
  const showWidget = async (id: string): Promise<void> => {
    await themeManager.widgetManager.showWidget(id)
  }

  // 隐藏挂件
  const hideWidget = async (id: string): Promise<void> => {
    await themeManager.widgetManager.hideWidget(id)
  }

  // 生命周期
  onMounted(() => {
    // 监听挂件变化事件
    themeManager.widgetManager.on('widgets-updated', handleWidgetsUpdate)

    // 更新初始状态
    widgets.value = [...themeManager.widgetManager.widgets]
  })

  onUnmounted(() => {
    // 移除事件监听器
    themeManager.widgetManager.off('widgets-updated', handleWidgetsUpdate)
  })

  return {
    widgets,
    addWidget,
    removeWidget,
    updateWidget,
    clearWidgets,
    showWidget,
    hideWidget
  }
}
