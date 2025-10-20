/**
 * 历史记录管理（撤销/重做）
 */

import type { Editor } from './Editor'
import { EDITOR_CONFIG } from '../config/constants'
import { createLogger } from '../utils/logger'

const logger = createLogger('History')

/**
 * 历史记录状态
 */
export interface HistoryState {
  /** HTML 内容 */
  html: string
  
  /** 选区信息 */
  selection: {
    start: number
    end: number
  } | null
  
  /** 时间戳 */
  timestamp: number
}

/**
 * 历史记录管理类
 */
export class History {
  private editor: Editor
  private undoStack: HistoryState[] = []
  private redoStack: HistoryState[] = []
  private maxStackSize: number
  private isUndoing: boolean = false
  private isRedoing: boolean = false
  private isSaving: boolean = false
  private lastSavedState: string = ''
  private saveTimeout: number | null = null
  
  constructor(editor: Editor, maxStackSize?: number) {
    this.editor = editor
    this.maxStackSize = maxStackSize || EDITOR_CONFIG.MAX_HISTORY_SIZE
    this.init()
  }
  
  /**
   * 初始化
   */
  private init(): void {
    // 保存初始状态
    this.saveState()
    
    // 监听内容变化
    this.editor.on('update', () => {
      if (!this.isUndoing && !this.isRedoing && !this.isSaving) {
        this.debouncedSave()
      }
    })
    
    logger.debug('History initialized')
  }
  
  /**
   * 防抖保存（避免频繁保存）
   */
  private debouncedSave(): void {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout)
    }
    
    this.saveTimeout = window.setTimeout(() => {
      this.saveState()
      this.saveTimeout = null
    }, EDITOR_CONFIG.DEBOUNCE_DELAY)
  }
  
  /**
   * 保存当前状态
   */
  saveState(): void {
    this.isSaving = true
    
    try {
      const html = this.editor.getHTML()
      
      // 如果内容没变化，不保存
      if (html === this.lastSavedState) {
        return
      }
      
      const state: HistoryState = {
        html,
        selection: this.getCurrentSelection(),
        timestamp: Date.now()
      }
      
      this.undoStack.push(state)
      this.lastSavedState = html
      
      // 限制栈大小
      if (this.undoStack.length > this.maxStackSize) {
        this.undoStack.shift()
      }
      
      // 清空重做栈
      this.redoStack = []
      
      logger.debug('State saved', { stackSize: this.undoStack.length })
    } finally {
      this.isSaving = false
    }
  }
  
  /**
   * 撤销
   */
  undo(): boolean {
    if (this.undoStack.length <= 1) {
      logger.debug('Cannot undo: no more history')
      return false
    }
    
    this.isUndoing = true
    
    try {
      // 将当前状态移到重做栈
      const currentState = this.undoStack.pop()!
      this.redoStack.push(currentState)
      
      // 恢复上一个状态
      const previousState = this.undoStack[this.undoStack.length - 1]
      this.restoreState(previousState)
      
      logger.debug('Undo successful', { 
        undoStackSize: this.undoStack.length,
        redoStackSize: this.redoStack.length
      })
      
      return true
    } finally {
      this.isUndoing = false
    }
  }
  
  /**
   * 重做
   */
  redo(): boolean {
    if (this.redoStack.length === 0) {
      logger.debug('Cannot redo: no redo history')
      return false
    }
    
    this.isRedoing = true
    
    try {
      // 从重做栈取出状态
      const state = this.redoStack.pop()!
      this.undoStack.push(state)
      
      // 恢复状态
      this.restoreState(state)
      
      logger.debug('Redo successful', {
        undoStackSize: this.undoStack.length,
        redoStackSize: this.redoStack.length
      })
      
      return true
    } finally {
      this.isRedoing = false
    }
  }
  
  /**
   * 恢复状态
   */
  private restoreState(state: HistoryState): void {
    // 恢复内容
    this.editor.setHTML(state.html)
    this.lastSavedState = state.html
    
    // 延迟恢复选区（等待 DOM 更新）
    setTimeout(() => {
      if (state.selection) {
        this.restoreSelection(state.selection)
      }
    }, 0)
  }
  
  /**
   * 获取当前选区
   */
  private getCurrentSelection(): { start: number; end: number } | null {
    if (!this.editor.contentElement) {
      return null
    }
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      return null
    }
    
    const range = selection.getRangeAt(0)
    
    try {
      return {
        start: this.getOffset(this.editor.contentElement, range.startContainer, range.startOffset),
        end: this.getOffset(this.editor.contentElement, range.endContainer, range.endOffset)
      }
    } catch (e) {
      logger.warn('Failed to get selection', e)
      return null
    }
  }
  
  /**
   * 恢复选区
   */
  private restoreSelection(selection: { start: number; end: number }): void {
    if (!this.editor.contentElement) {
      return
    }
    
    try {
      const range = this.createRangeFromOffsets(
        this.editor.contentElement,
        selection.start,
        selection.end
      )
      
      if (range) {
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
        logger.debug('Selection restored')
      }
    } catch (e) {
      logger.warn('Failed to restore selection', e)
    }
  }
  
  /**
   * 获取节点在编辑器中的偏移量
   */
  private getOffset(root: Node, node: Node, offset: number): number {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let totalOffset = 0
    let currentNode: Node | null
    
    while ((currentNode = walker.nextNode())) {
      if (currentNode === node) {
        return totalOffset + offset
      }
      totalOffset += currentNode.textContent?.length || 0
    }
    
    return totalOffset
  }
  
  /**
   * 从偏移量创建 Range
   */
  private createRangeFromOffsets(root: Node, start: number, end: number): Range | null {
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let currentOffset = 0
    let startNode: Node | null = null
    let startOffset = 0
    let endNode: Node | null = null
    let endOffset = 0
    let currentNode: Node | null
    
    while ((currentNode = walker.nextNode())) {
      const nodeLength = currentNode.textContent?.length || 0
      
      if (!startNode && currentOffset + nodeLength >= start) {
        startNode = currentNode
        startOffset = start - currentOffset
      }
      
      if (!endNode && currentOffset + nodeLength >= end) {
        endNode = currentNode
        endOffset = end - currentOffset
        break
      }
      
      currentOffset += nodeLength
    }
    
    if (startNode && endNode) {
      const range = document.createRange()
      range.setStart(startNode, Math.min(startOffset, startNode.textContent?.length || 0))
      range.setEnd(endNode, Math.min(endOffset, endNode.textContent?.length || 0))
      return range
    }
    
    return null
  }
  
  /**
   * 清空历史
   */
  clear(): void {
    this.undoStack = []
    this.redoStack = []
    this.lastSavedState = ''
    logger.debug('History cleared')
  }
  
  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.undoStack.length > 1
  }
  
  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.redoStack.length > 0
  }
  
  /**
   * 获取历史记录信息
   */
  getInfo(): {
    undoCount: number
    redoCount: number
    canUndo: boolean
    canRedo: boolean
  } {
    return {
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    }
  }
  
  /**
   * 销毁
   */
  destroy(): void {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout)
      this.saveTimeout = null
    }
    this.clear()
    logger.debug('History destroyed')
  }
}













