import React, { useEffect, useRef, createContext, useContext } from 'react'
import { GridStackCore } from '../core'
import type { GridStackOptions, GridItemOptions } from '../types'

export interface GridStackProps {
  /** 网格配置选项 */
  options?: GridStackOptions
  /** 网格项列表 */
  items?: GridItemOptions[]
  /** 列数 */
  column?: number
  /** 单元格高度 */
  cellHeight?: number | string
  /** 是否启用动画 */
  animate?: boolean
  /** 是否浮动布局 */
  float?: boolean
  /** 是否静态网格 */
  staticGrid?: boolean
  /** 子元素 */
  children?: React.ReactNode
  /** 类名 */
  className?: string
  /** 样式 */
  style?: React.CSSProperties
  /** 准备就绪回调 */
  onReady?: (instance: GridStackCore) => void
  /** 变化回调 */
  onChange?: (items: GridItemOptions[]) => void
  /** 添加回调 */
  onAdded?: (items: GridItemOptions[]) => void
  /** 移除回调 */
  onRemoved?: (items: GridItemOptions[]) => void
  /** 拖拽开始 */
  onDragStart?: (item: GridItemOptions) => void
  /** 拖拽中 */
  onDrag?: (item: GridItemOptions) => void
  /** 拖拽结束 */
  onDragStop?: (item: GridItemOptions) => void
  /** 调整大小开始 */
  onResizeStart?: (item: GridItemOptions) => void
  /** 调整大小中 */
  onResize?: (item: GridItemOptions) => void
  /** 调整大小结束 */
  onResizeStop?: (item: GridItemOptions) => void
}

// 创建 Context
const GridStackContext = createContext<GridStackCore | null>(null)

export const useGridStackContext = () => {
  return useContext(GridStackContext)
}

/**
 * GridStack 组件
 */
export const GridStack: React.FC<GridStackProps> = ({
  options = {},
  items = [],
  column = 12,
  cellHeight = 70,
  animate = true,
  float = false,
  staticGrid = false,
  children,
  className = '',
  style = {},
  onReady,
  onChange,
  onAdded,
  onRemoved,
  onDragStart,
  onDrag,
  onDragStop,
  onResizeStart,
  onResize,
  onResizeStop
}) => {
  const gridRef = useRef<HTMLDivElement>(null)
  const gridInstanceRef = useRef<GridStackCore | null>(null)

  // 合并配置
  const getOptions = (): GridStackOptions => {
    return {
      column,
      cellHeight,
      animate,
      float,
      staticGrid,
      ...options
    }
  }

  // 初始化
  useEffect(() => {
    if (!gridRef.current) return

    try {
      gridInstanceRef.current = new GridStackCore(gridRef.current, getOptions())

      // 设置事件监听
      setupEvents()

      // 加载初始项
      if (items && items.length > 0) {
        gridInstanceRef.current.load(items)
      }

      // 触发就绪回调
      if (onReady) {
        onReady(gridInstanceRef.current)
      }
    } catch (error) {
      console.error('GridStack initialization error:', error)
    }

    // 清理
    return () => {
      if (gridInstanceRef.current) {
        gridInstanceRef.current.destroy()
        gridInstanceRef.current = null
      }
    }
  }, [])

  // 设置事件监听
  const setupEvents = () => {
    if (!gridInstanceRef.current) return

    if (onChange) {
      gridInstanceRef.current.on('change', () => {
        const gridItems = gridInstanceRef.current?.save() ?? []
        onChange(gridItems)
      })
    }

    if (onAdded) {
      gridInstanceRef.current.on('added', (event, addedItems) => {
        onAdded(addedItems as GridItemOptions[])
      })
    }

    if (onRemoved) {
      gridInstanceRef.current.on('removed', (event, removedItems) => {
        onRemoved(removedItems as GridItemOptions[])
      })
    }

    if (onDragStart) {
      gridInstanceRef.current.on('dragstart', (event, item) => {
        onDragStart(item as GridItemOptions)
      })
    }

    if (onDrag) {
      gridInstanceRef.current.on('drag', (event, item) => {
        onDrag(item as GridItemOptions)
      })
    }

    if (onDragStop) {
      gridInstanceRef.current.on('dragstop', (event, item) => {
        onDragStop(item as GridItemOptions)
      })
    }

    if (onResizeStart) {
      gridInstanceRef.current.on('resizestart', (event, item) => {
        onResizeStart(item as GridItemOptions)
      })
    }

    if (onResize) {
      gridInstanceRef.current.on('resize', (event, item) => {
        onResize(item as GridItemOptions)
      })
    }

    if (onResizeStop) {
      gridInstanceRef.current.on('resizestop', (event, item) => {
        onResizeStop(item as GridItemOptions)
      })
    }
  }

  // 监听 items 变化
  useEffect(() => {
    if (gridInstanceRef.current && items) {
      gridInstanceRef.current.load(items, true)
    }
  }, [items])

  // 监听配置变化
  useEffect(() => {
    if (gridInstanceRef.current && column) {
      gridInstanceRef.current.column(column)
    }
  }, [column])

  useEffect(() => {
    if (gridInstanceRef.current) {
      gridInstanceRef.current.setStatic(staticGrid)
    }
  }, [staticGrid])

  useEffect(() => {
    if (gridInstanceRef.current) {
      gridInstanceRef.current.setAnimation(animate)
    }
  }, [animate])

  return (
    <GridStackContext.Provider value={gridInstanceRef.current}>
      <div
        ref={gridRef}
        className={`grid-stack ${className}`}
        style={style}
      >
        {children}
      </div>
    </GridStackContext.Provider>
  )
}
