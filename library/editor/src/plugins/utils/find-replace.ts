/**
 * 查找替换插件
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

/**
 * 查找文本选项
 */
export interface SearchOptions {
  caseSensitive?: boolean
  wholeWord?: boolean
  useRegex?: boolean
  fuzzySearch?: boolean
}

/**
 * 查找文本
 */
function findText(editorElement: HTMLElement, searchText: string, options: SearchOptions = {}): number {
  if (!searchText) return 0

  // 清除之前的高亮
  clearHighlights(editorElement)

  const content = editorElement.textContent || ''
  let pattern: RegExp

  try {
    if (options.fuzzySearch) {
      // 模糊搜索：将搜索文本转换为允许字符间有其他字符的模式
      const fuzzyPattern = searchText
        .split('')
        .map(char => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*?')
      pattern = new RegExp(fuzzyPattern, options.caseSensitive ? 'g' : 'gi')
    } else if (options.useRegex) {
      pattern = new RegExp(searchText, options.caseSensitive ? 'g' : 'gi')
    } else {
      const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const wordBoundary = options.wholeWord ? '\\b' : ''
      pattern = new RegExp(
        `${wordBoundary}${escapedText}${wordBoundary}`,
        options.caseSensitive ? 'g' : 'gi'
      )
    }
  } catch (e) {
    console.error('Invalid regex pattern:', e)
    return 0
  }

  let count = 0
  const walker = document.createTreeWalker(
    editorElement,
    NodeFilter.SHOW_TEXT,
    null
  )

  const nodesToProcess: { node: Text; matches: RegExpMatchArray[] }[] = []

  // 收集所有匹配的文本节点
  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const text = node.textContent || ''
    const matches: RegExpMatchArray[] = []
    let match: RegExpExecArray | null

    pattern.lastIndex = 0
    while ((match = pattern.exec(text)) !== null) {
      matches.push([...match] as RegExpMatchArray)
      if (!pattern.global) break
    }

    if (matches.length > 0) {
      nodesToProcess.push({ node, matches })
      count += matches.length
    }
  }

  // 高亮所有匹配
  nodesToProcess.forEach(({ node, matches }) => {
    highlightMatches(node, matches, pattern)
  })

  // 滚动到第一个匹配
  const firstHighlight = editorElement.querySelector('.editor-highlight')
  if (firstHighlight) {
    firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' })
    firstHighlight.classList.add('editor-highlight-active')
  }

  return count
}

/**
 * 高亮匹配的文本
 */
function highlightMatches(node: Text, matches: RegExpMatchArray[], pattern: RegExp): void {
  const parent = node.parentNode
  if (!parent) return

  const text = node.textContent || ''
  const fragments: Node[] = []
  let lastIndex = 0

  // 按匹配位置排序
  matches.sort((a, b) => (a.index || 0) - (b.index || 0))

  matches.forEach(match => {
    const matchIndex = match.index || 0
    const matchText = match[0]

    // 添加匹配前的文本
    if (matchIndex > lastIndex) {
      fragments.push(document.createTextNode(text.slice(lastIndex, matchIndex)))
    }

    // 添加高亮的匹配文本
    const span = document.createElement('span')
    span.className = 'editor-highlight'
    span.textContent = matchText
    fragments.push(span)

    lastIndex = matchIndex + matchText.length
  })

  // 添加剩余文本
  if (lastIndex < text.length) {
    fragments.push(document.createTextNode(text.slice(lastIndex)))
  }

  // 替换原节点
  fragments.forEach(fragment => {
    parent.insertBefore(fragment, node)
  })
  parent.removeChild(node)
}

/**
 * 替换文本
 */
function replaceText(
  editorElement: HTMLElement,
  searchText: string,
  replaceText: string,
  options: SearchOptions = {}
): number {
  if (!searchText) return 0

  let count = 0
  const selection = window.getSelection()
  
  // 保存选区
  const savedSelection = selection && selection.rangeCount > 0 
    ? selection.getRangeAt(0).cloneRange() 
    : null

  // 执行替换
  const walker = document.createTreeWalker(
    editorElement,
    NodeFilter.SHOW_TEXT,
    null
  )

  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    let text = node.textContent || ''
    let replaced = false

    if (options.useRegex) {
      const pattern = new RegExp(
        searchText,
        options.caseSensitive ? 'g' : 'gi'
      )
      const newText = text.replace(pattern, replaceText)
      if (newText !== text) {
        node.textContent = newText
        replaced = true
        count++
      }
    } else {
      const escapedText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const wordBoundary = options.wholeWord ? '\\b' : ''
      const pattern = new RegExp(
        `${wordBoundary}${escapedText}${wordBoundary}`,
        options.caseSensitive ? 'g' : 'gi'
      )
      const newText = text.replace(pattern, replaceText)
      if (newText !== text) {
        node.textContent = newText
        replaced = true
        count++
      }
    }
  }

  // 恢复选区
  if (savedSelection && selection) {
    selection.removeAllRanges()
    selection.addRange(savedSelection)
  }

  // 清除高亮
  clearHighlights(editorElement)

  return count
}

/**
 * 替换所有文本
 */
function replaceAll(
  editorElement: HTMLElement,
  searchText: string,
  replaceText: string,
  options: SearchOptions = {}
): number {
  return replaceText(editorElement, searchText, replaceText, {
    ...options,
    useRegex: options.useRegex
  })
}

/**
 * 清除高亮
 */
function clearHighlights(editorElement: HTMLElement): void {
  const highlights = editorElement.querySelectorAll('.editor-highlight')
  highlights.forEach(highlight => {
    const parent = highlight.parentNode
    if (!parent) return
    
    const text = highlight.textContent || ''
    const textNode = document.createTextNode(text)
    parent.insertBefore(textNode, highlight)
    parent.removeChild(highlight)
  })
}

/**
 * 显示查找替换对话框 - 无遮罩可拖拽版本
 */
export function showFindReplaceDialog(editor: any): void {
  // 如果对话框已存在，先移除
  const existingDialog = document.querySelector('.find-replace-dialog')
  if (existingDialog) {
    document.body.removeChild(existingDialog)
  }

  // 获取编辑器元素
  const editorElement = editor.contentElement || editor.getElement()
  clearHighlights(editorElement)

  // 创建对话框容器 - 无遮罩，可拖拽
  const dialog = document.createElement('div')
  dialog.className = 'find-replace-dialog'
  dialog.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    z-index: 1000;
    min-width: 400px;
    font-family: system-ui, -apple-system, sans-serif;
  `

  // 拖拽功能变量
  let isDragging = false
  let dragStartX = 0
  let dragStartY = 0
  let dialogStartX = 0
  let dialogStartY = 0

  // 拖拽事件处理
  const startDrag = (e: MouseEvent) => {
    isDragging = true
    dragStartX = e.clientX
    dragStartY = e.clientY
    const rect = dialog.getBoundingClientRect()
    dialogStartX = rect.left
    dialogStartY = rect.top
    dialog.style.cursor = 'grabbing'
    e.preventDefault()
  }

  const onDrag = (e: MouseEvent) => {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartX
    const deltaY = e.clientY - dragStartY
    dialog.style.left = `${dialogStartX + deltaX}px`
    dialog.style.top = `${dialogStartY + deltaY}px`
    dialog.style.right = 'auto'
  }

  const stopDrag = () => {
    if (isDragging) {
      isDragging = false
      dialog.style.cursor = 'move'
    }
  }

  // 清理函数
  const cleanup = () => {
    document.body.removeChild(dialog)
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', stopDrag)
    clearHighlights(editorElement)
  }

  // 标题栏（可拖拽区域）
  const titleBar = document.createElement('div')
  titleBar.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb; cursor: move; user-select: none;">
      <h3 style="margin: 0; font-size: 16px; font-weight: 600;">🔍 查找和替换</h3>
      <button class="close-btn" style="border: none; background: none; font-size: 20px; cursor: pointer; padding: 0; width: 24px; height: 24px; color: #666;">&times;</button>
    </div>
  `
  dialog.appendChild(titleBar)

  // 绑定拖拽
  const title = titleBar.querySelector('h3')!
  title.addEventListener('mousedown', startDrag)
  titleBar.addEventListener('mousedown', (e) => {
    if (e.target === titleBar || e.target === title) startDrag(e)
  })
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)

  // 关闭按钮
  titleBar.querySelector('.close-btn')!.addEventListener('click', cleanup)
  
  // 创建查找输入框
  const findInput = document.createElement('input')
  findInput.type = 'text'
  findInput.placeholder = '查找...'
  findInput.style.cssText = `
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  `
  
  // 实时高亮 - 输入时自动查找
  findInput.addEventListener('input', () => {
    if (findInput.value) {
      findText(editorElement, findInput.value, {
        caseSensitive: caseSensitive.checkbox.checked,
        wholeWord: wholeWord.checkbox.checked,
        useRegex: useRegex.checkbox.checked
      })
    } else {
      clearHighlights(editorElement)
    }
  })

  // 创建替换输入框
  const replaceInput = document.createElement('input')
  replaceInput.type = 'text'
  replaceInput.placeholder = '替换为...'
  replaceInput.style.cssText = `
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  `

  // 创建选项复选框
  const options = document.createElement('div')
  options.style.marginBottom = '10px'
  
  const caseSensitive = createCheckbox('区分大小写')
  const wholeWord = createCheckbox('全词匹配')
  const useRegex = createCheckbox('使用正则表达式')
  
  options.appendChild(caseSensitive.container)
  options.appendChild(wholeWord.container)
  options.appendChild(useRegex.container)

  // 创建按钮组
  const buttons = document.createElement('div')
  buttons.style.cssText = `
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  `

  const findButton = createButton('查找', () => {
    const count = findText(editor.getElement(), findInput.value, {
      caseSensitive: caseSensitive.checkbox.checked,
      wholeWord: wholeWord.checkbox.checked,
      useRegex: useRegex.checkbox.checked
    })
    alert(`找到 ${count} 个匹配项`)
  })

  const replaceButton = createButton('替换', () => {
    const count = replaceText(editor.getElement(), findInput.value, replaceInput.value, {
      caseSensitive: caseSensitive.checkbox.checked,
      wholeWord: wholeWord.checkbox.checked,
      useRegex: useRegex.checkbox.checked
    })
    alert(`替换了 ${count} 处`)
  })

  const replaceAllButton = createButton('全部替换', () => {
    const count = replaceAll(editor.getElement(), findInput.value, replaceInput.value, {
      caseSensitive: caseSensitive.checkbox.checked,
      wholeWord: wholeWord.checkbox.checked,
      useRegex: useRegex.checkbox.checked
    })
    alert(`替换了 ${count} 处`)
  })

  const closeButton = createButton('关闭', cleanup)

  buttons.appendChild(findButton)
  buttons.appendChild(replaceButton)
  buttons.appendChild(replaceAllButton)
  buttons.appendChild(closeButton)

  // 组装对话框
  dialog.appendChild(findInput)
  dialog.appendChild(replaceInput)
  dialog.appendChild(options)
  dialog.appendChild(buttons)

  // 添加到页面
  document.body.appendChild(dialog)

  // 聚焦到查找输入框
  findInput.focus()

  // ESC 键关闭
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      cleanup()
    }
  })
}

/**
 * 创建复选框
 */
function createCheckbox(label: string): { container: HTMLElement; checkbox: HTMLInputElement } {
  const container = document.createElement('label')
  container.style.cssText = `
    display: inline-block;
    margin-right: 15px;
    cursor: pointer;
  `

  const checkbox = document.createElement('input')
  checkbox.type = 'checkbox'
  checkbox.style.marginRight = '5px'

  const text = document.createElement('span')
  text.textContent = label

  container.appendChild(checkbox)
  container.appendChild(text)

  return { container, checkbox }
}

/**
 * 创建按钮
 */
function createButton(text: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button')
  button.textContent = text
  button.style.cssText = `
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  `
  button.addEventListener('click', onClick)
  return button
}

/**
 * 查找命令
 */
const findCommand: Command = {
  id: 'find',
  name: '查找',
  execute: (editor) => {
    showFindReplaceDialog(editor)
  }
}

/**
 * 替换命令
 */
const replaceCommand: Command = {
  id: 'replace',
  name: '替换',
  execute: (editor) => {
    showFindReplaceDialog(editor)
  }
}

/**
 * 创建查找替换插件
 */
export const FindReplacePlugin: Plugin = createPlugin({
  name: 'find-replace',
  version: '1.0.0',
  description: '查找和替换文本',
  author: 'LDesign Team',
  
  install(editor) {
    // 注册命令
    editor.commands.register(findCommand)
    editor.commands.register(replaceCommand)
    
    // 添加样式
    const style = document.createElement('style')
    style.textContent = `
      .editor-highlight {
        background-color: #ffeb3b;
        color: inherit;
      }
      .editor-highlight-active {
        background-color: #ff9800;
        color: white;
      }
    `
    document.head.appendChild(style)
    
    // 快捷键
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        showFindReplaceDialog(editor)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        showFindReplaceDialog(editor)
      }
    })
  },
  
  destroy() {
    // 清理资源
  }
})

export default FindReplacePlugin