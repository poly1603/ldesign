/**
 * @ldesign/theme - useThemeDecorations 组合式函数
 *
 * 提供装饰元素管理的响应式接口
 */

import {
  inject,
  ref,
  computed,
  onUnmounted,
  type Ref,
  type ComputedRef,
} from 'vue'
import type {
  UseThemeDecorationsReturn,
  VueThemeContext,
  DecorationConfig,
} from '../types'
import { VueThemeContextKey } from '../types'

/**
 * 使用主题装饰的组合式函数
 */
export function useThemeDecorations(): UseThemeDecorationsReturn {
  // 注入主题上下文
  const themeContext = inject<VueThemeContext>(VueThemeContextKey)

  if (!themeContext) {
    throw new Error('useThemeDecorations must be used within a ThemeProvider')
  }

  // 装饰元素列表
  const decorations = ref<DecorationConfig[]>([])

  // 更新装饰列表
  const updateDecorations = () => {
    if (themeContext.themeManager.value) {
      decorations.value = themeContext.themeManager.value.getDecorations()
    }
  }

  // 监听装饰变化事件
  if (themeContext.themeManager.value) {
    themeContext.themeManager.value.on('decoration-added', updateDecorations)
    themeContext.themeManager.value.on('decoration-removed', updateDecorations)
  }

  /**
   * 添加装饰元素
   */
  const addDecoration = (decoration: DecorationConfig): void => {
    if (!themeContext.themeManager.value) {
      throw new Error('Theme manager is not initialized')
    }

    themeContext.themeManager.value.addDecoration(decoration)
    updateDecorations()
  }

  /**
   * 移除装饰元素
   */
  const removeDecoration = (id: string): void => {
    if (!themeContext.themeManager.value) {
      return
    }

    themeContext.themeManager.value.removeDecoration(id)
    updateDecorations()
  }

  /**
   * 更新装饰元素
   */
  const updateDecoration = (
    id: string,
    updates: Partial<DecorationConfig>
  ): void => {
    if (!themeContext.themeManager.value) {
      return
    }

    themeContext.themeManager.value.updateDecoration(id, updates)
    updateDecorations()
  }

  /**
   * 清空所有装饰元素
   */
  const clearDecorations = (): void => {
    if (!themeContext.themeManager.value) {
      return
    }

    const currentDecorations = decorations.value
    currentDecorations.forEach(decoration => {
      themeContext.themeManager.value!.removeDecoration(decoration.id)
    })

    updateDecorations()
  }

  /**
   * 检查装饰元素是否可见
   */
  const isDecorationVisible = (id: string): ComputedRef<boolean> => {
    return computed(() => {
      return decorations.value.some(decoration => decoration.id === id)
    })
  }

  /**
   * 获取装饰元素
   */
  const getDecoration = (
    id: string
  ): ComputedRef<DecorationConfig | undefined> => {
    return computed(() => {
      return decorations.value.find(decoration => decoration.id === id)
    })
  }

  // 初始化装饰列表
  updateDecorations()

  // 清理事件监听器
  onUnmounted(() => {
    if (themeContext.themeManager.value) {
      themeContext.themeManager.value.off('decoration-added', updateDecorations)
      themeContext.themeManager.value.off(
        'decoration-removed',
        updateDecorations
      )
    }
  })

  return {
    decorations,
    addDecoration,
    removeDecoration,
    updateDecoration,
    clearDecorations,
    isDecorationVisible,
    getDecoration,
  }
}

/**
 * 使用装饰元素过滤的组合式函数
 */
export function useDecorationFilter(): {
  filteredDecorations: ComputedRef<DecorationConfig[]>
  filterByType: (type: string) => void
  filterByTag: (tag: string) => void
  filterByVisible: (visible: boolean) => void
  clearFilter: () => void
  currentFilter: Ref<{
    type?: string
    tag?: string
    visible?: boolean
  }>
} {
  const { decorations } = useThemeDecorations()

  const currentFilter = ref<{
    type?: string
    tag?: string
    visible?: boolean
  }>({})

  const filteredDecorations = computed(() => {
    let filtered = decorations.value

    if (currentFilter.value.type) {
      filtered = filtered.filter(
        decoration => decoration.type === currentFilter.value.type
      )
    }

    if (currentFilter.value.visible !== undefined) {
      // 这里可以添加可见性检查逻辑
      // filtered = filtered.filter(decoration => checkVisibility(decoration) === currentFilter.value.visible)
    }

    return filtered
  })

  const filterByType = (type: string) => {
    currentFilter.value.type = type
  }

  const filterByTag = (tag: string) => {
    currentFilter.value.tag = tag
  }

  const filterByVisible = (visible: boolean) => {
    currentFilter.value.visible = visible
  }

  const clearFilter = () => {
    currentFilter.value = {}
  }

  return {
    filteredDecorations,
    filterByType,
    filterByTag,
    filterByVisible,
    clearFilter,
    currentFilter,
  }
}

/**
 * 使用装饰元素批量操作的组合式函数
 */
export function useDecorationBatch(): {
  selectedDecorations: Ref<string[]>
  selectDecoration: (id: string) => void
  deselectDecoration: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  toggleSelection: (id: string) => void
  removeSelected: () => void
  updateSelected: (updates: Partial<DecorationConfig>) => void
  isSelected: (id: string) => ComputedRef<boolean>
} {
  const { decorations, removeDecoration, updateDecoration } =
    useThemeDecorations()

  const selectedDecorations = ref<string[]>([])

  const selectDecoration = (id: string) => {
    if (!selectedDecorations.value.includes(id)) {
      selectedDecorations.value.push(id)
    }
  }

  const deselectDecoration = (id: string) => {
    const index = selectedDecorations.value.indexOf(id)
    if (index > -1) {
      selectedDecorations.value.splice(index, 1)
    }
  }

  const selectAll = () => {
    selectedDecorations.value = decorations.value.map(
      decoration => decoration.id
    )
  }

  const deselectAll = () => {
    selectedDecorations.value = []
  }

  const toggleSelection = (id: string) => {
    if (selectedDecorations.value.includes(id)) {
      deselectDecoration(id)
    } else {
      selectDecoration(id)
    }
  }

  const removeSelected = () => {
    selectedDecorations.value.forEach(id => {
      removeDecoration(id)
    })
    selectedDecorations.value = []
  }

  const updateSelected = (updates: Partial<DecorationConfig>) => {
    selectedDecorations.value.forEach(id => {
      updateDecoration(id, updates)
    })
  }

  const isSelected = (id: string): ComputedRef<boolean> => {
    return computed(() => selectedDecorations.value.includes(id))
  }

  return {
    selectedDecorations,
    selectDecoration,
    deselectDecoration,
    selectAll,
    deselectAll,
    toggleSelection,
    removeSelected,
    updateSelected,
    isSelected,
  }
}
