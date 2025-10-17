/**
 * 编辑器工具函数集合
 * 统一管理常用的编辑器操作，避免重复代码
 */

/**
 * 执行编辑器命令
 */
export function execCommand(command: string, value?: string): boolean {
  try {
    return document.execCommand(command, false, value)
  } catch (e) {
    console.error(`[EditorUtils] execCommand '${command}' failed:`, e)
    return false
  }
}

/**
 * 获取当前选区
 */
export function getSelection(): Selection | null {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    return null
  }
  return selection
}

/**
 * 获取选中的文本
 */
export function getSelectedText(): string {
  const selection = getSelection()
  return selection ? selection.toString() : ''
}

/**
 * 保存当前选区
 */
export function saveRange(): Range | null {
  const selection = getSelection()
  if (selection && selection.rangeCount > 0) {
    return selection.getRangeAt(0).cloneRange()
  }
  return null
}

/**
 * 恢复选区
 */
export function restoreRange(range: Range): boolean {
  if (!range) return false
  
  try {
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
      return true
    }
  } catch (e) {
    console.error('[EditorUtils] restoreRange failed:', e)
  }
  return false
}

/**
 * 替换选中的文本
 */
export function replaceSelection(text: string, range?: Range | null): boolean {
  // 如果提供了range，先恢复它
  if (range) {
    restoreRange(range)
  }
  
  // 尝试使用execCommand
  if (execCommand('insertText', text)) {
    return true
  }
  
  // 备用方法：手动替换
  const selection = getSelection()
  if (selection && selection.rangeCount > 0) {
    const currentRange = selection.getRangeAt(0)
    currentRange.deleteContents()
    const textNode = document.createTextNode(text)
    currentRange.insertNode(textNode)
    
    // 移动光标到插入文本之后
    currentRange.setStartAfter(textNode)
    currentRange.setEndAfter(textNode)
    selection.removeAllRanges()
    selection.addRange(currentRange)
    return true
  }
  
  return false
}

/**
 * 在光标位置插入文本
 */
export function insertText(text: string, container?: HTMLElement): boolean {
  const selection = getSelection()
  
  // 如果没有选区且提供了容器，在容器末尾创建选区
  if (!selection && container) {
    container.focus()
    const range = document.createRange()
    range.selectNodeContents(container)
    range.collapse(false)
    const newSelection = window.getSelection()
    newSelection?.removeAllRanges()
    newSelection?.addRange(range)
  }
  
  return replaceSelection(text)
}

/**
 * 应用样式到选中文本
 */
export function applyStyle(style: string, value?: string): boolean {
  switch(style) {
    case 'bold':
      return execCommand('bold')
    case 'italic':
      return execCommand('italic')
    case 'underline':
      return execCommand('underline')
    case 'strike':
      return execCommand('strikeThrough')
    case 'color':
      return execCommand('foreColor', value)
    case 'background':
      return execCommand('hiliteColor', value)
    case 'fontSize':
      return execCommand('fontSize', value)
    case 'fontFamily':
      return execCommand('fontName', value)
    default:
      return false
  }
}

/**
 * 格式化文本对齐
 */
export function setAlignment(align: 'left' | 'center' | 'right' | 'justify'): boolean {
  const commands = {
    'left': 'justifyLeft',
    'center': 'justifyCenter',
    'right': 'justifyRight',
    'justify': 'justifyFull'
  }
  return execCommand(commands[align])
}

/**
 * 插入HTML内容
 */
export function insertHTML(html: string): boolean {
  return execCommand('insertHTML', html)
}

/**
 * 清除格式
 */
export function clearFormat(): boolean {
  return execCommand('removeFormat')
}

/**
 * 撤销/重做
 */
export function undo(): boolean {
  return execCommand('undo')
}

export function redo(): boolean {
  return execCommand('redo')
}

/**
 * 缩进操作
 */
export function indent(): boolean {
  return execCommand('indent')
}

export function outdent(): boolean {
  return execCommand('outdent')
}