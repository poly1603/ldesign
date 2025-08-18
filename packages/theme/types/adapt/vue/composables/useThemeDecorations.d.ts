import { UseThemeDecorationsReturn } from '../types.js'
import { Ref, ComputedRef } from 'vue'
import { DecorationConfig } from '../../../core/types.js'

/**
 * @ldesign/theme - useThemeDecorations 组合式函数
 *
 * 提供装饰元素管理的响应式接口
 */

/**
 * 使用主题装饰的组合式函数
 */
declare function useThemeDecorations(): UseThemeDecorationsReturn
/**
 * 使用装饰元素过滤的组合式函数
 */
declare function useDecorationFilter(): {
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
}
/**
 * 使用装饰元素批量操作的组合式函数
 */
declare function useDecorationBatch(): {
  selectedDecorations: Ref<string[]>
  selectDecoration: (id: string) => void
  deselectDecoration: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  toggleSelection: (id: string) => void
  removeSelected: () => void
  updateSelected: (updates: Partial<DecorationConfig>) => void
  isSelected: (id: string) => ComputedRef<boolean>
}

export { useDecorationBatch, useDecorationFilter, useThemeDecorations }
