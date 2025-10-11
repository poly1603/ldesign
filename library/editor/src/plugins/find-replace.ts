/**
 * 查找替换插件
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'
import { showFindReplaceDialog, type SearchOptions } from '../ui/FindReplaceDialog'

/**
 * 查找文本
 */
function findText(editorElement: HTMLElement, searchText: string, options: SearchOptions): number {
  if (!searchText) return 0

  // 清除之前的高亮
  clearHighlights(editorElement)

  const content = editorElement.textContent || ''
  let pattern: RegExp

  try {
    if (options.useRegex) {
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
  const text = node.textContent || ''
  const parent = node.parentNode
  if (!parent) return

  const fragment = document.createDocumentFragment()
  let lastIndex = 0

  // 重新匹配以获取正确的索引
  pattern.lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // 添加匹配前的文本
    if (match.index > lastIndex) {
      fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.index)))
    }

    // 添加高亮的匹配文本
    const mark = document.createElement('mark')
    mark.className = 'editor-highlight'
    mark.textContent = match[0]
    fragment.appendChild(mark)

    lastIndex = match.index + match[0].length

    if (!pattern.global) break
  }

  // 添加剩余文本
  if (lastIndex < text.length) {
    fragment.appendChild(document.createTextNode(text.substring(lastIndex)))
  }

  parent.replaceChild(fragment, node)
}

/**
 * 清除高亮
 */
function clearHighlights(editorElement: HTMLElement): void {
  const highlights = editorElement.querySelectorAll('.editor-highlight')
  highlights.forEach(mark => {
    const text = mark.textContent || ''
    const textNode = document.createTextNode(text)
    mark.parentNode?.replaceChild(textNode, mark)
  })

  // 合并相邻的文本节点
  editorElement.normalize()
}

/**
 * 替换文本
 */
function replaceText(
  editorElement: HTMLElement,
  searchText: string,
  replaceText: string,
  options: SearchOptions
): number {
  const firstHighlight = editorElement.querySelector('.editor-highlight-active, .editor-highlight')
  if (!firstHighlight) return 0

  const textNode = document.createTextNode(replaceText)
  firstHighlight.parentNode?.replaceChild(textNode, firstHighlight)

  // 继续查找下一个
  return findText(editorElement, searchText, options)
}

/**
 * 替换所有文本
 */
function replaceAllText(
  editorElement: HTMLElement,
  searchText: string,
  replaceText: string,
  options: SearchOptions
): number {
  if (!searchText) return 0

  const content = editorElement.innerHTML
  let pattern: RegExp

  try {
    if (options.useRegex) {
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

  const textContent = editorElement.textContent || ''
  const matches = textContent.match(pattern)
  const count = matches ? matches.length : 0

  if (count > 0) {
    // 使用文本内容进行替换，保持HTML结构
    const walker = document.createTreeWalker(
      editorElement,
      NodeFilter.SHOW_TEXT,
      null
    )

    const nodesToReplace: Text[] = []
    while (walker.nextNode()) {
      const node = walker.currentNode as Text
      if (pattern.test(node.textContent || '')) {
        nodesToReplace.push(node)
      }
      pattern.lastIndex = 0
    }

    nodesToReplace.forEach(node => {
      const newText = (node.textContent || '').replace(pattern, replaceText)
      node.textContent = newText
    })
  }

  return count
}

/**
 * 打开查找替换对话框
 */
const openFindReplace: Command = (state, dispatch) => {
  if (!dispatch) return true

  // 获取编辑器元素
  const editorElement = document.querySelector('.ldesign-editor-content') as HTMLElement
  if (!editorElement) return false

  showFindReplaceDialog({
    onFind: (searchText, options) => {
      const count = findText(editorElement, searchText, options)
      const resultDiv = document.querySelector('.editor-find-result') as HTMLElement
      if (resultDiv) {
        resultDiv.textContent = count > 0 ? `找到 ${count} 个匹配项` : '未找到匹配项'
        resultDiv.style.display = 'block'
      }
    },
    onReplace: (searchText, replaceText, options) => {
      const remaining = replaceText(editorElement, searchText, replaceText, options)
      const resultDiv = document.querySelector('.editor-find-result') as HTMLElement
      if (resultDiv) {
        resultDiv.textContent = remaining > 0 ? `已替换，剩余 ${remaining} 个匹配项` : '已替换所有匹配项'
        resultDiv.style.display = 'block'
      }
    },
    onReplaceAll: (searchText, replaceText, options) => {
      const count = replaceAllText(editorElement, searchText, replaceText, options)
      const resultDiv = document.querySelector('.editor-find-result') as HTMLElement
      if (resultDiv) {
        resultDiv.textContent = count > 0 ? `已替换 ${count} 个匹配项` : '未找到匹配项'
        resultDiv.style.display = 'block'
      }
    },
    onClose: () => {
      clearHighlights(editorElement)
    }
  })

  return true
}

/**
 * 查找替换插件
 */
export const FindReplacePlugin: Plugin = createPlugin({
  name: 'findReplace',
  commands: {
    openFindReplace
  },
  keymaps: {
    'Mod-f': openFindReplace,
    'Mod-h': openFindReplace
  },
  toolbar: [{
    name: 'findReplace',
    title: '查找替换 (Ctrl+F)',
    icon: 'search',
    command: openFindReplace
  }]
})
