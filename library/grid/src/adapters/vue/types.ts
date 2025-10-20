/**
 * Vue 3 adapter types
 */

import type { GridOptions, GridItemOptions, DragSourceOptions } from '../../types'

/**
 * GridStack component props
 */
export interface GridStackProps {
  options?: GridOptions
  modelValue?: GridItemOptions[]
}

/**
 * GridStack component emits
 */
export interface GridStackEmits {
  (e: 'update:modelValue', items: GridItemOptions[]): void
  (e: 'change', items: GridItemOptions[]): void
  (e: 'added', item: GridItemOptions): void
  (e: 'removed', item: GridItemOptions): void
  (e: 'dragstart', item: GridItemOptions): void
  (e: 'dragstop', item: GridItemOptions): void
  (e: 'resizestart', item: GridItemOptions): void
  (e: 'resizestop', item: GridItemOptions): void
  (e: 'dropped', data: any): void
}

/**
 * GridItem component props
 */
export interface GridItemProps extends GridItemOptions {
  id: string
}

/**
 * GridDragSource component props
 */
export interface GridDragSourceProps {
  data?: any
  itemOptions?: GridItemOptions
  preview?: string | HTMLElement
  helper?: 'clone' | 'original'
  revert?: boolean
}













