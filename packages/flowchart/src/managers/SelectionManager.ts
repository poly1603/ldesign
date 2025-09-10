/**
 * 选择管理器
 * 负责管理节点和连接线的选择状态，支持单选和多选
 */

import type { Point, Rectangle, EventEmitter } from '@/types/index.js';
import { EventType } from '@/types/index.js';
import { SimpleEventEmitter, pointInRectangle } from '@/utils/index.js';
import type { BaseNode } from '@/nodes/index.js';
import type { BaseEdge } from '@/edges/index.js';

/**
 * 选择项类型
 */
export type SelectableItem = BaseNode | BaseEdge;

/**
 * 选择变更事件
 */
export interface SelectionChangeEvent {
  /** 选中的项目 */
  selected: SelectableItem[];
  /** 新增选中的项目 */
  added: SelectableItem[];
  /** 取消选中的项目 */
  removed: SelectableItem[];
}

/**
 * 选择框
 */
export interface SelectionBox {
  /** 起始点 */
  start: Point;
  /** 当前点 */
  current: Point;
  /** 是否激活 */
  active: boolean;
}

/**
 * 选择管理器类
 */
export class SelectionManager extends SimpleEventEmitter implements EventEmitter {
  private selectedItems: Set<SelectableItem> = new Set();
  private selectionBox: SelectionBox | null = null;
  private multiSelectEnabled = true;
  private selectableNodes: BaseNode[] = [];
  private selectableEdges: BaseEdge[] = [];

  constructor() {
    super();
  }

  /**
   * 设置可选择的节点
   */
  setSelectableNodes(nodes: BaseNode[]): void {
    this.selectableNodes = [...nodes];
  }

  /**
   * 获取全部可选择节点
   */
  getSelectableNodes(): BaseNode[] {
    return [...this.selectableNodes];
  }

  /**
   * 设置可选择的连接线
   */
  setSelectableEdges(edges: BaseEdge[]): void {
    this.selectableEdges = [...edges];
  }

  /**
   * 获取全部可选择连接线
   */
  getSelectableEdges(): BaseEdge[] {
    return [...this.selectableEdges];
  }

  /**
   * 获取选中的项目
   */
  getSelectedItems(): SelectableItem[] {
    return Array.from(this.selectedItems);
  }

  /**
   * 获取选中的节点
   */
  getSelectedNodes(): BaseNode[] {
    return this.getSelectedItems().filter(item => 'type' in item && 'position' in item) as BaseNode[];
  }

  /**
   * 获取选中的连接线
   */
  getSelectedEdges(): BaseEdge[] {
    return this.getSelectedItems().filter(item => 'source' in item && 'target' in item) as BaseEdge[];
  }

  /**
   * 检查项目是否被选中
   */
  isSelected(item: SelectableItem): boolean {
    return this.selectedItems.has(item);
  }

  /**
   * 选中项目
   */
  select(item: SelectableItem, addToSelection = false): void {
    const wasSelected = this.selectedItems.has(item);
    
    if (!addToSelection && !wasSelected) {
      this.clearSelection();
    }

    if (!wasSelected) {
      this.selectedItems.add(item);
      item.select();
      
      this.emitSelectionChange([item], []);
    }
  }

  /**
   * 取消选中项目
   */
  deselect(item: SelectableItem): void {
    if (this.selectedItems.has(item)) {
      this.selectedItems.delete(item);
      item.deselect();
      
      this.emitSelectionChange([], [item]);
    }
  }

  /**
   * 切换项目选中状态
   */
  toggle(item: SelectableItem, addToSelection = false): void {
    if (this.selectedItems.has(item)) {
      if (addToSelection || this.selectedItems.size > 1) {
        this.deselect(item);
      }
    } else {
      this.select(item, addToSelection);
    }
  }

  /**
   * 选中多个项目
   */
  selectMultiple(items: SelectableItem[], addToSelection = false): void {
    if (!addToSelection) {
      this.clearSelection();
    }

    const newlySelected: SelectableItem[] = [];
    
    for (const item of items) {
      if (!this.selectedItems.has(item)) {
        this.selectedItems.add(item);
        item.select();
        newlySelected.push(item);
      }
    }

    if (newlySelected.length > 0) {
      this.emitSelectionChange(newlySelected, []);
    }
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    const deselectedItems = Array.from(this.selectedItems);
    
    for (const item of this.selectedItems) {
      item.deselect();
    }
    
    this.selectedItems.clear();

    if (deselectedItems.length > 0) {
      this.emitSelectionChange([], deselectedItems);
    }
  }

  /**
   * 全选
   */
  selectAll(): void {
    const allItems: SelectableItem[] = [...this.selectableNodes, ...this.selectableEdges];
    this.selectMultiple(allItems);
  }

  /**
   * 反选
   */
  invertSelection(): void {
    const allItems: SelectableItem[] = [...this.selectableNodes, ...this.selectableEdges];
    const currentlySelected = Array.from(this.selectedItems);
    const toSelect = allItems.filter(item => !this.selectedItems.has(item));
    
    this.clearSelection();
    this.selectMultiple(toSelect);
  }

  /**
   * 开始选择框
   */
  startSelectionBox(point: Point): void {
    this.selectionBox = {
      start: { ...point },
      current: { ...point },
      active: true
    };
  }

  /**
   * 更新选择框
   */
  updateSelectionBox(point: Point): void {
    if (this.selectionBox && this.selectionBox.active) {
      this.selectionBox.current = { ...point };
      
      // 实时更新选择框内的项目
      this.updateSelectionBoxItems();
    }
  }

  /**
   * 结束选择框
   */
  endSelectionBox(addToSelection = false): void {
    if (this.selectionBox && this.selectionBox.active) {
      this.finalizeSelectionBox(addToSelection);
      this.selectionBox = null;
    }
  }

  /**
   * 取消选择框
   */
  cancelSelectionBox(): void {
    this.selectionBox = null;
  }

  /**
   * 获取选择框
   */
  getSelectionBox(): SelectionBox | null {
    return this.selectionBox ? { ...this.selectionBox } : null;
  }

  /**
   * 获取选择框矩形
   */
  getSelectionBoxRect(): Rectangle | null {
    if (!this.selectionBox) {
      return null;
    }

    const { start, current } = this.selectionBox;
    
    return {
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      width: Math.abs(current.x - start.x),
      height: Math.abs(current.y - start.y)
    };
  }

  /**
   * 更新选择框内的项目
   */
  private updateSelectionBoxItems(): void {
    const rect = this.getSelectionBoxRect();
    if (!rect) {
      return;
    }

    const itemsInBox = this.getItemsInRect(rect);
    
    // 临时选中选择框内的项目（不触发事件）
    for (const item of [...this.selectableNodes, ...this.selectableEdges]) {
      const shouldBeSelected = itemsInBox.includes(item);
      const isCurrentlySelected = this.selectedItems.has(item);
      
      if (shouldBeSelected && !isCurrentlySelected) {
        item.select();
      } else if (!shouldBeSelected && isCurrentlySelected) {
        item.deselect();
      }
    }
  }

  /**
   * 完成选择框选择
   */
  private finalizeSelectionBox(addToSelection: boolean): void {
    const rect = this.getSelectionBoxRect();
    if (!rect) {
      return;
    }

    const itemsInBox = this.getItemsInRect(rect);
    
    if (!addToSelection) {
      this.clearSelection();
    }
    
    this.selectMultiple(itemsInBox, addToSelection);
  }

  /**
   * 获取矩形内的项目
   */
  private getItemsInRect(rect: Rectangle): SelectableItem[] {
    const items: SelectableItem[] = [];

    // 检查节点
    for (const node of this.selectableNodes) {
      const nodeBounds = node.getBounds();
      if (this.rectIntersects(rect, nodeBounds)) {
        items.push(node);
      }
    }

    // 检查连接线
    for (const edge of this.selectableEdges) {
      const edgeBounds = edge.getBounds();
      if (this.rectIntersects(rect, edgeBounds)) {
        items.push(edge);
      }
    }

    return items;
  }

  /**
   * 检查两个矩形是否相交
   */
  private rectIntersects(rect1: Rectangle, rect2: Rectangle): boolean {
    return !(rect1.x + rect1.width < rect2.x ||
             rect2.x + rect2.width < rect1.x ||
             rect1.y + rect1.height < rect2.y ||
             rect2.y + rect2.height < rect1.y);
  }

  /**
   * 点击选择
   */
  selectAtPoint(point: Point, addToSelection = false): SelectableItem | null {
    // 优先检查节点（节点在连接线上方）
    for (const node of this.selectableNodes) {
      if (node.hitTest(point)) {
        this.select(node, addToSelection);
        return node;
      }
    }

    // 然后检查连接线
    for (const edge of this.selectableEdges) {
      if (edge.hitTest(point)) {
        this.select(edge, addToSelection);
        return edge;
      }
    }

    // 如果没有点击到任何项目，清除选择（除非是多选模式）
    if (!addToSelection) {
      this.clearSelection();
    }

    return null;
  }

  /**
   * 设置是否启用多选
   */
  setMultiSelectEnabled(enabled: boolean): void {
    this.multiSelectEnabled = enabled;
    
    if (!enabled && this.selectedItems.size > 1) {
      // 如果禁用多选且当前有多个选中项，只保留第一个
      const items = Array.from(this.selectedItems);
      const firstItem = items[0];
      this.clearSelection();
      if (firstItem) {
        this.select(firstItem);
      }
    }
  }

  /**
   * 获取是否启用多选
   */
  isMultiSelectEnabled(): boolean {
    return this.multiSelectEnabled;
  }

  /**
   * 发射选择变更事件
   */
  private emitSelectionChange(added: SelectableItem[], removed: SelectableItem[]): void {
    const event: SelectionChangeEvent = {
      selected: Array.from(this.selectedItems),
      added,
      removed
    };

    this.emit(EventType.SELECTION_CHANGE, event);
  }

  /**
   * 销毁选择管理器
   */
  destroy(): void {
    this.clearSelection();
    this.removeAllListeners();
    this.selectableNodes = [];
    this.selectableEdges = [];
    this.selectionBox = null;
  }
}
