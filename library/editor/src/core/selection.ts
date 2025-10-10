/**
 * Selection - 选区管理
 * 处理光标和选中内容
 */

import type { Selection as SelectionType, Range } from '../types'

export class Selection {
  public anchor: number
  public head: number

  constructor(anchor: number, head?: number) {
    this.anchor = anchor
    this.head = head !== undefined ? head : anchor
  }

  /**
   * 是否为空选区（光标）
   */
  get empty(): boolean {
    return this.anchor === this.head
  }

  /**
   * 选区起始位置
   */
  get from(): number {
    return Math.min(this.anchor, this.head)
  }

  /**
   * 选区结束位置
   */
  get to(): number {
    return Math.max(this.anchor, this.head)
  }

  /**
   * 获取范围
   */
  get range(): Range {
    return {
      from: this.from,
      to: this.to
    }
  }

  /**
   * 转换为类型
   */
  toJSON(): SelectionType {
    return {
      anchor: this.anchor,
      head: this.head,
      empty: this.empty
    }
  }

  /**
   * 从类型创建
   */
  static fromJSON(json: SelectionType): Selection {
    return new Selection(json.anchor, json.head)
  }

  /**
   * 创建空选区（光标）
   */
  static cursor(pos: number): Selection {
    return new Selection(pos, pos)
  }

  /**
   * 创建范围选区
   */
  static range(from: number, to: number): Selection {
    return new Selection(from, to)
  }

  /**
   * 比较两个选区是否相等
   */
  equals(other: Selection): boolean {
    return this.anchor === other.anchor && this.head === other.head
  }

  /**
   * 克隆选区
   */
  clone(): Selection {
    return new Selection(this.anchor, this.head)
  }
}

/**
 * 选区管理器
 * 管理 DOM 选区和编辑器选区的同步
 */
export class SelectionManager {
  private editor: any
  private selection: Selection

  constructor(editor: any) {
    this.editor = editor
    this.selection = Selection.cursor(0)
  }

  /**
   * 获取当前选区
   */
  getSelection(): Selection {
    return this.selection
  }

  /**
   * 设置选区
   */
  setSelection(selection: Selection): void {
    this.selection = selection
    this.syncToDOM()
  }

  /**
   * 从 DOM 同步选区
   */
  syncFromDOM(): void {
    const domSelection = window.getSelection()
    if (!domSelection || domSelection.rangeCount === 0) return

    const range = domSelection.getRangeAt(0)
    const anchor = this.domPositionToEditorPosition(range.startContainer, range.startOffset)
    const head = this.domPositionToEditorPosition(range.endContainer, range.endOffset)

    this.selection = new Selection(anchor, head)
  }

  /**
   * 同步到 DOM
   */
  syncToDOM(): void {
    const domSelection = window.getSelection()
    if (!domSelection) return

    const range = this.editorRangeToDOMRange(this.selection.range)
    if (range) {
      domSelection.removeAllRanges()
      domSelection.addRange(range)
    }
  }

  /**
   * DOM 位置转编辑器位置
   */
  private domPositionToEditorPosition(node: Node, offset: number): number {
    // 简化实现，实际需要遍历 DOM 树计算位置
    return offset
  }

  /**
   * 编辑器范围转 DOM 范围
   */
  private editorRangeToDOMRange(range: Range): Range | null {
    // 简化实现，实际需要将编辑器位置转换为 DOM 位置
    return null
  }

  /**
   * 清除选区
   */
  clear(): void {
    this.selection = Selection.cursor(0)
    window.getSelection()?.removeAllRanges()
  }
}
