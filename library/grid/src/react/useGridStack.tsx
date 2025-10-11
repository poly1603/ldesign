import { useEffect, useRef, useState, useCallback } from 'react'
import { GridStackCore } from '../core'
import type {
  GridStackOptions,
  GridItemOptions,
  IGridStackInstance,
  GridStackEventName,
  GridStackEventHandler
} from '../types'

/**
 * useGridStack Hook 返回类型
 */
export interface UseGridStackReturn extends IGridStackInstance {
  /** 网格容器引用 */
  gridRef: React.RefObject<HTMLDivElement>
  /** 是否已初始化 */
  isReady: boolean
  /** 网格项列表 */
  items: GridItemOptions[]
}

/**
 * React Hook for GridStack
 * @param options GridStack 配置选项
 * @returns GridStack 实例和相关方法
 */
export function useGridStack(options: GridStackOptions = {}): UseGridStackReturn {
  const gridRef = useRef<HTMLDivElement>(null)
  const gridInstanceRef = useRef<GridStackCore | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [items, setItems] = useState<GridItemOptions[]>([])

  // 初始化
  useEffect(() => {
    if (!gridRef.current) return

    try {
      gridInstanceRef.current = new GridStackCore(gridRef.current, options)
      setIsReady(true)

      // 监听变化事件
      gridInstanceRef.current.on('change', () => {
        if (gridInstanceRef.current) {
          setItems(gridInstanceRef.current.save())
        }
      })
    } catch (error) {
      console.error('Failed to initialize GridStack:', error)
    }

    // 清理
    return () => {
      if (gridInstanceRef.current) {
        gridInstanceRef.current.destroy()
        gridInstanceRef.current = null
        setIsReady(false)
      }
    }
  }, []) // 空依赖数组，只初始化一次

  // 包装方法
  const addWidget = useCallback((itemOptions: GridItemOptions): HTMLElement | undefined => {
    return gridInstanceRef.current?.addWidget(itemOptions)
  }, [])

  const addWidgets = useCallback((itemsList: GridItemOptions[]): HTMLElement[] => {
    return gridInstanceRef.current?.addWidgets(itemsList) ?? []
  }, [])

  const removeWidget = useCallback((el: HTMLElement | string, removeDOM?: boolean): void => {
    gridInstanceRef.current?.removeWidget(el, removeDOM)
  }, [])

  const removeAll = useCallback((removeDOM?: boolean): void => {
    gridInstanceRef.current?.removeAll(removeDOM)
  }, [])

  const update = useCallback((el: HTMLElement, itemOptions: Partial<GridItemOptions>): void => {
    gridInstanceRef.current?.update(el, itemOptions)
  }, [])

  const enable = useCallback((): void => {
    gridInstanceRef.current?.enable()
  }, [])

  const disable = useCallback((): void => {
    gridInstanceRef.current?.disable()
  }, [])

  const lock = useCallback((el: HTMLElement): void => {
    gridInstanceRef.current?.lock(el)
  }, [])

  const unlock = useCallback((el: HTMLElement): void => {
    gridInstanceRef.current?.unlock(el)
  }, [])

  const setStatic = useCallback((staticValue: boolean): void => {
    gridInstanceRef.current?.setStatic(staticValue)
  }, [])

  const setAnimation = useCallback((animate: boolean): void => {
    gridInstanceRef.current?.setAnimation(animate)
  }, [])

  const column = useCallback((col: number, layout?: 'moveScale' | 'move' | 'scale' | 'none'): void => {
    gridInstanceRef.current?.column(col, layout)
  }, [])

  const getColumn = useCallback((): number => {
    return gridInstanceRef.current?.getColumn() ?? 0
  }, [])

  const getCellHeight = useCallback((): number => {
    return gridInstanceRef.current?.getCellHeight() ?? 0
  }, [])

  const cellHeight = useCallback((val: number, updateFlag?: boolean): void => {
    gridInstanceRef.current?.cellHeight(val, updateFlag)
  }, [])

  const batchUpdate = useCallback((flag?: boolean): void => {
    gridInstanceRef.current?.batchUpdate(flag)
  }, [])

  const compact = useCallback((): void => {
    gridInstanceRef.current?.compact()
  }, [])

  const float = useCallback((val: boolean): void => {
    gridInstanceRef.current?.float(val)
  }, [])

  const save = useCallback((saveContent?: boolean): GridItemOptions[] => {
    return gridInstanceRef.current?.save(saveContent) ?? []
  }, [])

  const load = useCallback((itemsList: GridItemOptions[], addAndRemove?: boolean): void => {
    gridInstanceRef.current?.load(itemsList, addAndRemove)
    setItems(itemsList)
  }, [])

  const on = useCallback(<T extends GridStackEventName>(
    event: T,
    callback: GridStackEventHandler<T>
  ): void => {
    gridInstanceRef.current?.on(event, callback)
  }, [])

  const off = useCallback(<T extends GridStackEventName>(event: T): void => {
    gridInstanceRef.current?.off(event)
  }, [])

  const cellWidth = useCallback((): number => {
    return gridInstanceRef.current?.cellWidth() ?? 0
  }, [])

  const getGridItems = useCallback((): HTMLElement[] => {
    return gridInstanceRef.current?.getGridItems() ?? []
  }, [])

  const makeSubGrid = useCallback((el: HTMLElement, subOptions?: GridStackOptions) => {
    if (!gridInstanceRef.current) {
      throw new Error('GridStack instance not initialized')
    }
    return gridInstanceRef.current.makeSubGrid(el, subOptions)
  }, [])

  const makeWidget = useCallback((el: HTMLElement | string): HTMLElement => {
    if (!gridInstanceRef.current) {
      throw new Error('GridStack instance not initialized')
    }
    return gridInstanceRef.current.makeWidget(el)
  }, [])

  const margin = useCallback((value: number | string): void => {
    gridInstanceRef.current?.margin(value)
  }, [])

  const swap = useCallback((a: HTMLElement, b: HTMLElement): void => {
    gridInstanceRef.current?.swap(a, b)
  }, [])

  const destroy = useCallback((removeDOM?: boolean): void => {
    gridInstanceRef.current?.destroy(removeDOM)
    gridInstanceRef.current = null
    setIsReady(false)
  }, [])

  return {
    gridRef,
    isReady,
    items,
    get instance() {
      return gridInstanceRef.current?.instance ?? null
    },
    get el() {
      return gridRef.current
    },
    addWidget,
    addWidgets,
    removeWidget,
    removeAll,
    update,
    enable,
    disable,
    lock,
    unlock,
    setStatic,
    setAnimation,
    column,
    getColumn,
    getCellHeight,
    cellHeight,
    batchUpdate,
    compact,
    float,
    save,
    load,
    on,
    off,
    cellWidth,
    getGridItems,
    makeSubGrid,
    makeWidget,
    margin,
    swap,
    destroy
  }
}
