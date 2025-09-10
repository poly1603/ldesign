/**
 * 选区管理器
 * 负责编辑器的选区操作，包括获取、设置、操作选区等功能
 */

import type { 
  ISelectionManager, 
  Selection, 
  Range, 
  Position 
} from '../types'
import { 
  getCurrentSelection, 
  getSelectionRange, 
  setSelectionRange, 
  createRange 
} from '../utils'

/**
 * 选区管理器实现
 * 提供完整的选区管理功能
 */
export class SelectionManager implements ISelectionManager {
  /** 编辑器容器元素 */
  private container: HTMLElement

  /** 上一次的选区状态 */
  private lastSelection: Selection | null = null

  constructor(container: HTMLElement) {
    this.container = container
  }

  /**
   * 获取当前选区
   * @returns 选区对象或null
   */
  getSelection(): Selection | null {
    const nativeSelection = getCurrentSelection()
    if (!nativeSelection || nativeSelection.rangeCount === 0) {
      return null
    }

    const range = nativeSelection.getRangeAt(0)
    
    // 检查选区是否在编辑器容器内
    if (!this.isRangeInContainer(range)) {
      return null
    }

    return this.createSelectionFromRange(range)
  }

  /**
   * 设置选区
   * @param selection 选区对象
   */
  setSelection(selection: Selection): void {
    const range = this.createRangeFromSelection(selection)
    if (range) {
      setSelectionRange(range)
      this.lastSelection = selection
    }
  }

  /**
   * 获取选区范围
   * @returns 范围对象或null
   */
  getRange(): Range | null {
    const nativeRange = getSelectionRange()
    if (!nativeRange || !this.isRangeInContainer(nativeRange)) {
      return null
    }

    return {
      startContainer: nativeRange.startContainer,
      startOffset: nativeRange.startOffset,
      endContainer: nativeRange.endContainer,
      endOffset: nativeRange.endOffset,
      collapsed: nativeRange.collapsed
    }
  }

  /**
   * 设置选区范围
   * @param range 范围对象
   */
  setRange(range: Range): void {
    const nativeRange = createRange(
      range.startContainer,
      range.startOffset,
      range.endContainer,
      range.endOffset
    )
    setSelectionRange(nativeRange)
  }

  /**
   * 折叠选区
   * @param toStart 是否折叠到起始位置
   */
  collapse(toStart = false): void {
    const nativeSelection = getCurrentSelection()
    if (nativeSelection && nativeSelection.rangeCount > 0) {
      const range = nativeSelection.getRangeAt(0)
      range.collapse(toStart)
      setSelectionRange(range)
    }
  }

  /**
   * 选择全部内容
   */
  selectAll(): void {
    const range = createRange(this.container, 0)
    range.selectNodeContents(this.container)
    setSelectionRange(range)
  }

  /**
   * 选择指定节点
   * @param node 要选择的节点
   */
  selectNode(node: Node): void {
    const range = createRange(node, 0)
    range.selectNode(node)
    setSelectionRange(range)
  }

  /**
   * 选择节点内容
   * @param node 要选择内容的节点
   */
  selectNodeContents(node: Node): void {
    const range = createRange(node, 0)
    range.selectNodeContents(node)
    setSelectionRange(range)
  }

  /**
   * 在指定位置插入节点
   * @param node 要插入的节点
   * @param position 插入位置，默认为当前选区位置
   */
  insertNode(node: Node, position?: Position): void {
    let range: globalThis.Range

    if (position) {
      range = createRange(position.node, position.offset)
    } else {
      const currentRange = getSelectionRange()
      if (!currentRange) {
        return
      }
      range = currentRange
    }

    range.insertNode(node)
    
    // 将选区移动到插入节点之后
    range.setStartAfter(node)
    range.collapse(true)
    setSelectionRange(range)
  }

  /**
   * 删除选区内容
   */
  deleteContents(): void {
    const range = getSelectionRange()
    if (range && !range.collapsed) {
      range.deleteContents()
      setSelectionRange(range)
    }
  }

  /**
   * 提取选区内容
   * @returns 提取的文档片段
   */
  extractContents(): DocumentFragment | null {
    const range = getSelectionRange()
    if (range && !range.collapsed) {
      const fragment = range.extractContents()
      setSelectionRange(range)
      return fragment
    }
    return null
  }

  /**
   * 克隆选区内容
   * @returns 克隆的文档片段
   */
  cloneContents(): DocumentFragment | null {
    const range = getSelectionRange()
    if (range && !range.collapsed) {
      return range.cloneContents()
    }
    return null
  }

  /**
   * 检查选区是否为空
   * @returns 是否为空
   */
  isEmpty(): boolean {
    const selection = this.getSelection()
    return !selection || selection.collapsed
  }

  /**
   * 获取选区文本
   * @returns 选区文本
   */
  getText(): string {
    const selection = this.getSelection()
    return selection ? selection.text : ''
  }

  /**
   * 获取选区HTML
   * @returns 选区HTML
   */
  getHtml(): string {
    const selection = this.getSelection()
    return selection ? selection.html : ''
  }

  /**
   * 保存当前选区
   */
  saveSelection(): void {
    this.lastSelection = this.getSelection()
  }

  /**
   * 恢复上次保存的选区
   */
  restoreSelection(): void {
    if (this.lastSelection) {
      this.setSelection(this.lastSelection)
    }
  }

  /**
   * 清除选区
   */
  clearSelection(): void {
    const nativeSelection = getCurrentSelection()
    if (nativeSelection) {
      nativeSelection.removeAllRanges()
    }
    this.lastSelection = null
  }

  /**
   * 从原生范围创建选区对象
   * @param range 原生范围对象
   * @returns 选区对象
   */
  private createSelectionFromRange(range: globalThis.Range): Selection {
    const text = range.toString()
    const html = this.getRangeHtml(range)

    return {
      start: {
        node: range.startContainer,
        offset: range.startOffset
      },
      end: {
        node: range.endContainer,
        offset: range.endOffset
      },
      collapsed: range.collapsed,
      text,
      html
    }
  }

  /**
   * 从选区对象创建原生范围
   * @param selection 选区对象
   * @returns 原生范围对象或null
   */
  private createRangeFromSelection(selection: Selection): globalThis.Range | null {
    try {
      return createRange(
        selection.start.node,
        selection.start.offset,
        selection.end.node,
        selection.end.offset
      )
    } catch (error) {
      console.error('Failed to create range from selection:', error)
      return null
    }
  }

  /**
   * 获取范围的HTML内容
   * @param range 范围对象
   * @returns HTML字符串
   */
  private getRangeHtml(range: globalThis.Range): string {
    const fragment = range.cloneContents()
    const div = document.createElement('div')
    div.appendChild(fragment)
    return div.innerHTML
  }

  /**
   * 检查范围是否在容器内
   * @param range 范围对象
   * @returns 是否在容器内
   */
  private isRangeInContainer(range: globalThis.Range): boolean {
    const commonAncestor = range.commonAncestorContainer
    return this.container.contains(commonAncestor) || this.container === commonAncestor
  }

  /**
   * 销毁选区管理器
   */
  destroy(): void {
    this.clearSelection()
    this.lastSelection = null
  }
}
