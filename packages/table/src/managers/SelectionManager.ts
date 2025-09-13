/**
 * 选择管理器
 * 
 * 负责表格行选择状态的管理
 * 支持单选、多选、全选等功能
 * 提供高效的选择状态同步和查询
 */

import type {
  ISelectionManager,
  IDataManager,
  TableRow,
  TableId
} from '../types'
import { EventManager } from './EventManager'

/**
 * 选择管理器实现类
 * 
 * 功能特性：
 * - 支持单选和多选模式
 * - 支持全选和反选
 * - 高效的选择状态管理
 * - 与数据管理器集成
 * - 选择状态变化通知
 */
export class SelectionManager<T extends TableRow = TableRow> implements ISelectionManager<T> {
  /** 选中的行键集合 */
  private selectedKeys: Set<TableId> = new Set()

  /** 数据管理器引用 */
  private dataManager?: IDataManager<T>

  /** 选择模式 */
  private mode: 'single' | 'multiple' | 'none' = 'multiple'

  /** 事件管理器 */
  private eventManager: EventManager = new EventManager()

  /**
   * 构造函数
   * @param dataManager 数据管理器实例（可选）
   * @param mode 选择模式，默认为multiple
   */
  constructor(dataManager?: IDataManager<T>, mode: 'single' | 'multiple' | 'none' = 'multiple') {
    this.dataManager = dataManager
    this.mode = mode
  }

  /**
   * 选择行
   * @param keys 行键或行键数组
   */
  select(keys: TableId | TableId[]): void {
    if (this.mode === 'none') {
      return
    }

    const keyArray = Array.isArray(keys) ? keys : [keys]

    if (this.mode === 'single') {
      this.selectedKeys.clear()
      if (keyArray.length > 0) {
        this.selectedKeys.add(keyArray[0])
      }
    } else {
      for (const key of keyArray) {
        this.selectedKeys.add(key)
      }
    }

    this.emitSelectionChange('select', keyArray)
  }

  /**
   * 取消选择行
   * @param keys 行键或行键数组
   */
  deselect(keys: TableId | TableId[]): void {
    if (this.mode === 'none') {
      return
    }

    const keyArray = Array.isArray(keys) ? keys : [keys]

    for (const key of keyArray) {
      this.selectedKeys.delete(key)
    }

    this.emitSelectionChange('deselect', keyArray)
  }

  /**
   * 切换行选择状态
   * @param keys 行键或行键数组
   */
  toggle(keys: TableId | TableId[]): void {
    if (this.mode === 'none') {
      return
    }

    const keyArray = Array.isArray(keys) ? keys : [keys]

    for (const key of keyArray) {
      if (this.selectedKeys.has(key)) {
        this.selectedKeys.delete(key)
      } else {
        if (this.mode === 'single') {
          this.selectedKeys.clear()
        }
        this.selectedKeys.add(key)

        if (this.mode === 'single') {
          break
        }
      }
    }

    this.emitSelectionChange('toggle', keyArray)
  }

  /**
   * 选择所有行
   * @param allKeys 所有可选择的行键
   */
  selectAll(allKeys: TableId[]): void {
    if (this.mode !== 'multiple') {
      return
    }

    this.selectedKeys.clear()
    for (const key of allKeys) {
      this.selectedKeys.add(key)
    }

    this.emitSelectionChange('select-all', allKeys)
  }

  /**
   * 取消所有选择
   */
  deselectAll(): void {
    this.selectedKeys.clear()
    this.emitSelectionChange('deselect-all', [])
  }

  /**
   * 清除所有选择
   */
  clear(): void {
    this.selectedKeys.clear()
    this.emitSelectionChange('clear', [])
  }

  /**
   * 切换全选状态
   * @param allKeys 所有可选择的行键
   */
  toggleAll(allKeys: TableId[]): void {
    if (this.mode !== 'multiple') {
      return
    }

    if (this.isAllSelected(allKeys)) {
      this.deselectAll()
    } else {
      this.selectAll(allKeys)
    }
  }

  /**
   * 范围选择
   * @param startKey 开始键
   * @param endKey 结束键
   * @param allKeys 所有可选择的行键
   */
  selectRange(startKey: TableId, endKey: TableId, allKeys: TableId[]): void {
    if (this.mode === 'none') {
      return
    }

    let startIndex = allKeys.indexOf(startKey)
    let endIndex = allKeys.indexOf(endKey)

    // 如果startKey不存在，返回
    if (startIndex === -1) {
      return
    }

    // 如果endKey不存在，使用最后一个索引
    if (endIndex === -1) {
      endIndex = allKeys.length - 1
    }

    const minIndex = Math.min(startIndex, endIndex)
    const maxIndex = Math.max(startIndex, endIndex)

    const rangeKeys = allKeys.slice(minIndex, maxIndex + 1)

    if (this.mode === 'single') {
      this.selectedKeys.clear()
      if (rangeKeys.length > 0) {
        this.selectedKeys.add(rangeKeys[0])
      }
    } else {
      for (const key of rangeKeys) {
        this.selectedKeys.add(key)
      }
    }

    this.emitSelectionChange('select-range', rangeKeys)
  }

  /**
   * 获取选中的行键
   */
  getSelectedKeys(): TableId[] {
    return Array.from(this.selectedKeys)
  }

  /**
   * 获取选中的行数据
   * @returns 选中的行数据数组
   */
  getSelectedRows(): any[] {
    const selectedKeys = this.getSelectedKeys()
    return selectedKeys.map(key => this.dataManager.getRowByKey(key)).filter(Boolean)
  }

  /**
   * 选择指定的行
   * @param keys 要选择的行键数组
   * @param replace 是否替换当前选择
   */
  selectRows(keys: TableId[], replace: boolean = false): void {
    if (replace) {
      this.selectedKeys.clear()
    }

    keys.forEach(key => {
      this.selectedKeys.add(key)
    })

    this.emitSelectionChange('select', keys)
  }

  /**
   * 取消选择指定的行
   * @param keys 要取消选择的行键数组
   */
  deselectRows(keys: TableId[]): void {
    keys.forEach(key => {
      this.selectedKeys.delete(key)
    })

    this.emitSelectionChange('deselect', keys)
  }

  /**
   * 切换指定行的选择状态
   * @param keys 要切换的行键数组
   */
  toggleRows(keys: TableId[]): void {
    keys.forEach(key => {
      if (this.selectedKeys.has(key)) {
        this.selectedKeys.delete(key)
      } else {
        this.selectedKeys.add(key)
      }
    })

    this.emitSelectionChange('toggle', keys)
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    const previousKeys = this.getSelectedKeys()
    this.selectedKeys.clear()
    this.emitSelectionChange('clear', previousKeys)
  }

  /**
   * 获取选中的行数量
   */
  getSelectedCount(): number {
    return this.selectedKeys.size
  }

  /**
   * 检查行是否被选中
   * @param key 行键
   */
  isSelected(key: TableId): boolean {
    return this.selectedKeys.has(key)
  }

  /**
   * 检查是否全选
   * @param allKeys 所有可选择的行键
   */
  isAllSelected(allKeys: TableId[]): boolean {
    if (this.mode !== 'multiple' || allKeys.length === 0) {
      return false
    }

    return allKeys.every(key => this.selectedKeys.has(key))
  }

  /**
   * 检查是否部分选择（半选状态）
   * @param allKeys 所有可选择的行键
   */
  isIndeterminate(allKeys: TableId[]): boolean {
    if (this.mode !== 'multiple' || allKeys.length === 0) {
      return false
    }

    const selectedCount = allKeys.filter(key => this.selectedKeys.has(key)).length
    return selectedCount > 0 && selectedCount < allKeys.length
  }

  /**
   * 检查是否有选择
   */
  hasSelection(): boolean {
    return this.selectedKeys.size > 0
  }

  /**
   * 设置选择模式
   * @param mode 选择模式
   */
  setMode(mode: 'single' | 'multiple' | 'none'): void {
    this.mode = mode

    // 如果切换到单选模式，只保留第一个选中项
    if (mode === 'single' && this.selectedKeys.size > 1) {
      const firstKey = this.selectedKeys.values().next().value
      this.selectedKeys.clear()
      if (firstKey !== undefined) {
        this.selectedKeys.add(firstKey)
      }
    }

    // 如果切换到禁用模式，清除所有选择
    if (mode === 'none') {
      this.selectedKeys.clear()
    }
  }

  /**
   * 获取选择状态
   */
  getSelectionState() {
    return {
      selectedKeys: this.getSelectedKeys(),
      selectedCount: this.getSelectedCount(),
      mode: this.mode
    }
  }

  /**
   * 设置选择状态
   * @param state 选择状态
   */
  setSelectionState(state: { selectedKeys: TableId[]; selectedCount: number; mode: 'single' | 'multiple' | 'none' }): void {
    this.mode = state.mode
    this.selectedKeys.clear()

    if (this.mode !== 'none') {
      for (const key of state.selectedKeys) {
        this.selectedKeys.add(key)

        // 单选模式只保留第一个
        if (this.mode === 'single') {
          break
        }
      }
    }
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on(event: string, listener: (data: any) => void): void {
    this.eventManager.on(event, listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener?: (data: any) => void): void {
    this.eventManager.off(event, listener)
  }

  /**
   * 触发选择变更事件
   * @param type 变更类型
   * @param keys 相关的键
   */
  private emitSelectionChange(type: string, keys: TableId[]): void {
    this.eventManager.emit('selection-change', {
      type,
      keys,
      selectedKeys: this.getSelectedKeys()
    })
  }

  /**
   * 销毁选择管理器
   */
  destroy(): void {
    this.selectedKeys.clear()
    this.eventManager.destroy()
  }
}
