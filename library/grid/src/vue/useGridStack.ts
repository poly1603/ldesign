import { ref, onMounted, onBeforeUnmount, shallowRef, type Ref } from 'vue'
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
  gridRef: Ref<HTMLElement | null>
  /** 是否已初始化 */
  isReady: Ref<boolean>
  /** 网格项列表 */
  items: Ref<GridItemOptions[]>
}

/**
 * Vue 3 Hook for GridStack
 * @param options GridStack 配置选项
 * @returns GridStack 实例和相关方法
 */
export function useGridStack(options: GridStackOptions = {}): UseGridStackReturn {
  const gridRef = ref<HTMLElement | null>(null)
  const isReady = ref(false)
  const items = ref<GridItemOptions[]>([])
  const gridInstance = shallowRef<GridStackCore | null>(null)

  const init = () => {
    if (!gridRef.value) {
      console.warn('Grid container ref is not available')
      return
    }

    try {
      gridInstance.value = new GridStackCore(gridRef.value, options)
      isReady.value = true

      // 监听变化事件以更新 items
      gridInstance.value.on('change', () => {
        if (gridInstance.value) {
          items.value = gridInstance.value.save()
        }
      })
    } catch (error) {
      console.error('Failed to initialize GridStack:', error)
    }
  }

  onMounted(() => {
    init()
  })

  onBeforeUnmount(() => {
    if (gridInstance.value) {
      gridInstance.value.destroy()
      gridInstance.value = null
      isReady.value = false
    }
  })

  // 包装所有方法
  const addWidget = (itemOptions: GridItemOptions): HTMLElement | undefined => {
    return gridInstance.value?.addWidget(itemOptions)
  }

  const addWidgets = (itemsList: GridItemOptions[]): HTMLElement[] => {
    return gridInstance.value?.addWidgets(itemsList) ?? []
  }

  const removeWidget = (el: HTMLElement | string, removeDOM?: boolean): void => {
    gridInstance.value?.removeWidget(el, removeDOM)
  }

  const removeAll = (removeDOM?: boolean): void => {
    gridInstance.value?.removeAll(removeDOM)
  }

  const update = (el: HTMLElement, itemOptions: Partial<GridItemOptions>): void => {
    gridInstance.value?.update(el, itemOptions)
  }

  const enable = (): void => {
    gridInstance.value?.enable()
  }

  const disable = (): void => {
    gridInstance.value?.disable()
  }

  const lock = (el: HTMLElement): void => {
    gridInstance.value?.lock(el)
  }

  const unlock = (el: HTMLElement): void => {
    gridInstance.value?.unlock(el)
  }

  const setStatic = (staticValue: boolean): void => {
    gridInstance.value?.setStatic(staticValue)
  }

  const setAnimation = (animate: boolean): void => {
    gridInstance.value?.setAnimation(animate)
  }

  const column = (col: number, layout?: 'moveScale' | 'move' | 'scale' | 'none'): void => {
    gridInstance.value?.column(col, layout)
  }

  const getColumn = (): number => {
    return gridInstance.value?.getColumn() ?? 0
  }

  const getCellHeight = (): number => {
    return gridInstance.value?.getCellHeight() ?? 0
  }

  const cellHeight = (val: number, updateFlag?: boolean): void => {
    gridInstance.value?.cellHeight(val, updateFlag)
  }

  const batchUpdate = (flag?: boolean): void => {
    gridInstance.value?.batchUpdate(flag)
  }

  const compact = (): void => {
    gridInstance.value?.compact()
  }

  const float = (val: boolean): void => {
    gridInstance.value?.float(val)
  }

  const save = (saveContent?: boolean): GridItemOptions[] => {
    return gridInstance.value?.save(saveContent) ?? []
  }

  const load = (itemsList: GridItemOptions[], addAndRemove?: boolean): void => {
    gridInstance.value?.load(itemsList, addAndRemove)
    items.value = itemsList
  }

  const on = <T extends GridStackEventName>(
    event: T,
    callback: GridStackEventHandler<T>
  ): void => {
    gridInstance.value?.on(event, callback)
  }

  const off = <T extends GridStackEventName>(event: T): void => {
    gridInstance.value?.off(event)
  }

  const cellWidth = (): number => {
    return gridInstance.value?.cellWidth() ?? 0
  }

  const getGridItems = (): HTMLElement[] => {
    return gridInstance.value?.getGridItems() ?? []
  }

  const makeSubGrid = (el: HTMLElement, subOptions?: GridStackOptions) => {
    if (!gridInstance.value) {
      throw new Error('GridStack instance not initialized')
    }
    return gridInstance.value.makeSubGrid(el, subOptions)
  }

  const makeWidget = (el: HTMLElement | string): HTMLElement => {
    if (!gridInstance.value) {
      throw new Error('GridStack instance not initialized')
    }
    return gridInstance.value.makeWidget(el)
  }

  const margin = (value: number | string): void => {
    gridInstance.value?.margin(value)
  }

  const swap = (a: HTMLElement, b: HTMLElement): void => {
    gridInstance.value?.swap(a, b)
  }

  const destroy = (removeDOM?: boolean): void => {
    gridInstance.value?.destroy(removeDOM)
    gridInstance.value = null
    isReady.value = false
  }

  return {
    gridRef,
    isReady,
    items,
    get instance() {
      return gridInstance.value?.instance ?? null
    },
    get el() {
      return gridRef.value
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
