/**
 * 导出为 Markdown 插件
 * 将编辑器内容转换为 Markdown 格式
 */

import { createPlugin } from '../core/Plugin'
import type { Plugin, Command } from '../types'

/**
 * HTML 转 Markdown
 */
export function htmlToMarkdown(html: string): string {
  // 创建临时元素来解析 HTML
  const temp = document.createElement('div')
  temp.innerHTML = html

  return convertNodeToMarkdown(temp)
}

/**
 * 递归转换节点为 Markdown
 */
function convertNodeToMarkdown(node: Node): string {
  let markdown = ''

  // 文本节点
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent || ''
  }

  // 元素节点
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement
    const tagName = element.tagName.toLowerCase()

    switch (tagName) {
      case 'h1':
        markdown = '# ' + getTextContent(element) + '\n\n'
        break
      case 'h2':
        markdown = '## ' + getTextContent(element) + '\n\n'
        break
      case 'h3':
        markdown = '### ' + getTextContent(element) + '\n\n'
        break
      case 'h4':
        markdown = '#### ' + getTextContent(element) + '\n\n'
        break
      case 'h5':
        markdown = '##### ' + getTextContent(element) + '\n\n'
        break
      case 'h6':
        markdown = '###### ' + getTextContent(element) + '\n\n'
        break
      case 'p':
        markdown = convertChildrenToMarkdown(element) + '\n\n'
        break
      case 'strong':
      case 'b':
        markdown = '**' + getTextContent(element) + '**'
        break
      case 'em':
      case 'i':
        markdown = '*' + getTextContent(element) + '*'
        break
      case 'u':
        markdown = '<u>' + getTextContent(element) + '</u>'
        break
      case 's':
      case 'strike':
      case 'del':
        markdown = '~~' + getTextContent(element) + '~~'
        break
      case 'code':
        if (element.parentElement?.tagName.toLowerCase() === 'pre') {
          markdown = '```\n' + getTextContent(element) + '\n```\n\n'
        } else {
          markdown = '`' + getTextContent(element) + '`'
        }
        break
      case 'pre':
        const code = element.querySelector('code')
        if (code) {
          markdown = '```\n' + getTextContent(code) + '\n```\n\n'
        } else {
          markdown = '```\n' + getTextContent(element) + '\n```\n\n'
        }
        break
      case 'blockquote':
        const lines = getTextContent(element).split('\n')
        markdown = lines.map(line => '> ' + line).join('\n') + '\n\n'
        break
      case 'ul':
        Array.from(element.children).forEach(li => {
          if (li.tagName.toLowerCase() === 'li') {
            markdown += '- ' + convertChildrenToMarkdown(li as HTMLElement) + '\n'
          }
        })
        markdown += '\n'
        break
      case 'ol':
        Array.from(element.children).forEach((li, index) => {
          if (li.tagName.toLowerCase() === 'li') {
            markdown += `${index + 1}. ` + convertChildrenToMarkdown(li as HTMLElement) + '\n'
          }
        })
        markdown += '\n'
        break
      case 'a':
        const href = element.getAttribute('href') || ''
        markdown = '[' + getTextContent(element) + '](' + href + ')'
        break
      case 'img':
        const src = element.getAttribute('src') || ''
        const alt = element.getAttribute('alt') || ''
        markdown = '![' + alt + '](' + src + ')\n\n'
        break
      case 'hr':
        markdown = '---\n\n'
        break
      case 'table':
        markdown = convertTableToMarkdown(element as HTMLTableElement)
        break
      case 'br':
        markdown = '\n'
        break
      default:
        markdown = convertChildrenToMarkdown(element)
        break
    }
  }

  return markdown
}

/**
 * 转换子节点为 Markdown
 */
function convertChildrenToMarkdown(element: HTMLElement): string {
  let markdown = ''
  Array.from(element.childNodes).forEach(child => {
    markdown += convertNodeToMarkdown(child)
  })
  return markdown
}

/**
 * 获取文本内容
 */
function getTextContent(element: HTMLElement): string {
  return convertChildrenToMarkdown(element)
}

/**
 * 转换表格为 Markdown
 */
function convertTableToMarkdown(table: HTMLTableElement): string {
  let markdown = ''
  const rows = Array.from(table.rows)

  if (rows.length === 0) return ''

  // 表头
  const headerRow = rows[0]
  const headerCells = Array.from(headerRow.cells)
  markdown += '| ' + headerCells.map(cell => cell.textContent?.trim() || '').join(' | ') + ' |\n'
  markdown += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n'

  // 表体
  for (let i = 1; i < rows.length; i++) {
    const cells = Array.from(rows[i].cells)
    markdown += '| ' + cells.map(cell => cell.textContent?.trim() || '').join(' | ') + ' |\n'
  }

  markdown += '\n'
  return markdown
}

/**
 * 导出为 Markdown
 */
const exportMarkdown: Command = (state, dispatch) => {
  if (!dispatch) return true

  const editorContent = document.querySelector('.ldesign-editor-content')
  if (!editorContent) return false

  const html = editorContent.innerHTML
  const markdown = htmlToMarkdown(html)

  // 创建下载链接
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'document.md'
  a.click()
  URL.revokeObjectURL(url)

  return true
}

/**
 * 复制为 Markdown
 */
const copyAsMarkdown: Command = (state, dispatch) => {
  if (!dispatch) return true

  const editorContent = document.querySelector('.ldesign-editor-content')
  if (!editorContent) return false

  const html = editorContent.innerHTML
  const markdown = htmlToMarkdown(html)

  // 复制到剪贴板
  navigator.clipboard.writeText(markdown).then(() => {
    // 可以显示提示消息
    console.log('Markdown 已复制到剪贴板')
  }).catch(err => {
    console.error('复制失败:', err)
  })

  return true
}

/**
 * 导出 Markdown 插件
 */
export const ExportMarkdownPlugin: Plugin = createPlugin({
  name: 'exportMarkdown',
  commands: {
    exportMarkdown,
    copyAsMarkdown
  },
  toolbar: [{
    name: 'exportMarkdown',
    title: '导出为 Markdown',
    icon: 'download',
    command: exportMarkdown
  }]
})
