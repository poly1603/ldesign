import React, { useRef, useEffect } from 'react'
import { useGridStackContext } from './GridStack'
import type { GridItemOptions } from '../types'

export interface GridStackItemProps extends GridItemOptions {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

/**
 * GridStackItem 组件
 */
export const GridStackItem: React.FC<GridStackItemProps> = ({
  id,
  x,
  y,
  w = 1,
  h = 1,
  minW,
  maxW,
  minH,
  maxH,
  noResize = false,
  noMove = false,
  locked = false,
  autoPosition = false,
  children,
  className = '',
  style = {},
  ...rest
}) => {
  const itemRef = useRef<HTMLDivElement>(null)
  const gridInstance = useGridStackContext()

  useEffect(() => {
    // 组件挂载时，GridStack 会自动识别具有 grid-stack-item 类的元素
    if (gridInstance && itemRef.current) {
      try {
        gridInstance.makeWidget(itemRef.current)
      } catch (error) {
        // 如果已经是 widget，会抛出错误，忽略即可
      }
    }

    // 清理
    return () => {
      if (gridInstance && itemRef.current) {
        try {
          gridInstance.removeWidget(itemRef.current, true)
        } catch (error) {
          // 忽略错误
        }
      }
    }
  }, [gridInstance])

  // 清理 rest props，移除 GridItemOptions 属性
  const { content, sizeToContent, resizeToContentParent, subGrid, subGridOpts, ...htmlProps } = rest

  return (
    <div
      ref={itemRef}
      className={`grid-stack-item ${className}`}
      gs-id={id}
      gs-x={x}
      gs-y={y}
      gs-w={w}
      gs-h={h}
      gs-min-w={minW}
      gs-max-w={maxW}
      gs-min-h={minH}
      gs-max-h={maxH}
      gs-no-resize={noResize ? 'true' : undefined}
      gs-no-move={noMove ? 'true' : undefined}
      gs-locked={locked ? 'true' : undefined}
      gs-auto-position={autoPosition ? 'true' : undefined}
      style={style}
      {...(htmlProps as React.HTMLAttributes<HTMLDivElement>)}
    >
      <div className="grid-stack-item-content">
        {children}
      </div>
    </div>
  )
}
