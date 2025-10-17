/**
 * 编辑器操作助手类
 * 统一封装常用的编辑器操作，避免代码重复
 */

export class EditorHelper {
  private editor: any
  
  constructor(editor: any) {
    this.editor = editor
  }
  
  /**
   * 获取选中的纯文本
   */
  getSelectedText(): string {
    if (this.editor.getSelectedText) {
      return this.editor.getSelectedText()
    }
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      return ''
    }
    
    return selection.toString()
  }
  
  /**
   * 替换选中的文本
   * @param text 要替换的新文本
   * @param savedRange 保存的选区Range对象（可选）
   */
  replaceSelectedText(text: string, savedRange?: Range | null): boolean {
    if (!this.editor.contentElement) {
      console.error('[EditorHelper] No content element')
      return false
    }
    
    // 聚焦到编辑器
    this.editor.contentElement.focus()
    
    // 如果提供了保存的选区，先恢复它
    if (savedRange) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(savedRange)
      }
    }
    
    // 方法1: 使用 execCommand（最兼容）
    let success = false
    try {
      success = document.execCommand('insertText', false, text)
      if (success) {
        console.log('[EditorHelper] Text replaced using execCommand')
      }
    } catch (e) {
      console.warn('[EditorHelper] execCommand failed:', e)
    }
    
    // 方法2: 如果 execCommand 失败，手动替换
    if (!success) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const textNode = document.createTextNode(text)
        range.insertNode(textNode)
        // 将光标移到插入文本的末尾
        range.setStartAfter(textNode)
        range.setEndAfter(textNode)
        selection.removeAllRanges()
        selection.addRange(range)
        success = true
        console.log('[EditorHelper] Text replaced manually')
      }
    }
    
    // 触发编辑器的输入事件，更新内部状态
    if (success) {
      this.editor.handleInput?.()
    }
    
    return success
  }
  
  /**
   * 在当前光标位置插入文本
   */
  insertText(text: string): boolean {
    if (!this.editor.contentElement) {
      return false
    }
    
    this.editor.contentElement.focus()
    
    // 如果没有选区，创建一个在末尾的选区
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      const range = document.createRange()
      range.selectNodeContents(this.editor.contentElement)
      range.collapse(false) // 光标到末尾
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
    
    return this.replaceSelectedText(text)
  }
  
  /**
   * 保存当前选区
   */
  saveSelection(): Range | null {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      // 确保选区在编辑器内
      if (this.editor.contentElement?.contains(range.commonAncestorContainer)) {
        return range.cloneRange()
      }
    }
    return null
  }
  
  /**
   * 恢复选区
   */
  restoreSelection(range: Range): boolean {
    if (!this.editor.contentElement || !range) {
      return false
    }
    
    // 确保选区仍然有效
    if (!this.editor.contentElement.contains(range.commonAncestorContainer)) {
      return false
    }
    
    try {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
        return true
      }
    } catch (e) {
      console.warn('[EditorHelper] Failed to restore selection:', e)
    }
    
    return false
  }
  
  /**
   * 执行格式化命令
   */
  execCommand(command: string, value?: string): boolean {
    if (!this.editor.contentElement) {
      return false
    }
    
    this.editor.contentElement.focus()
    
    try {
      return document.execCommand(command, false, value)
    } catch (e) {
      console.error('[EditorHelper] execCommand error:', e)
      return false
    }
  }
  
  /**
   * 应用样式到选中文本
   */
  applyStyle(style: { [key: string]: string }): void {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) {
      return
    }
    
    const range = selection.getRangeAt(0)
    const span = document.createElement('span')
    Object.assign(span.style, style)
    
    try {
      range.surroundContents(span)
    } catch (e) {
      // 如果选区跨越多个元素，需要特殊处理
      const content = range.extractContents()
      span.appendChild(content)
      range.insertNode(span)
    }
    
    // 触发更新
    this.editor.handleInput?.()
  }
}

/**
 * 创建编辑器助手实例
 */
export function createEditorHelper(editor: any): EditorHelper {
  return new EditorHelper(editor)
}