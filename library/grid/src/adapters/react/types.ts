/**
 * React adapter types
 */

import type { ReactNode } from 'react'
import type { GridOptions, GridItemOptions, DragSourceOptions } from '../../types'

/**
 * GridStack component props
 */
export interface GridStackProps {
  options?: GridOptions
  children?: ReactNode
  onChange?: (items: GridItemOptions[]) => void
  onAdded?: (item: GridItemOptions) => void
  onRemoved?: (item: GridItemOptions) => void
  onDragStart?: (item: GridItemOptions) => void
  onDragStop?: (item: GridItemOptions) => void
  onResizeStart?: (item: GridItemOptions) => void
  onResizeStop?: (item: GridItemOptions) => void
  onDropped?: (data: any) => void
  className?: string
  style?: React.CSSProperties
}

/**
 * GridItem component props
 */
export interface GridItemProps extends GridItemOptions {
  id: string
  children?: ReactNode
  className?: string
  style?: React.CSSProperties
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
  children?: ReactNode
  className?: string
  style?: React.CSSProperties
}













