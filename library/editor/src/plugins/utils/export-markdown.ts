/**
 * 导出为 Markdown 插件
 * 将编辑器内容转换为 Markdown 格式
 */

import { createPlugin } from '../../core/Plugin'
import type { Plugin, Command } from '../../types'

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
      // 标题
      case 'h1':
        markdown += `# ${getTextContent(element)}\n\n`
        break
      case 'h2':
        markdown += `## ${getTextContent(element)}\n\n`
        break
      case 'h3':
        markdown += `### ${getTextContent(element)}\n\n`
        break
      case 'h4':
        markdown += `#### ${getTextContent(element)}\n\n`
        break
      case 'h5':
        markdown += `##### ${getTextContent(element)}\n\n`
        break
      case 'h6':
        markdown += `###### ${getTextContent(element)}\n\n`
        break

      // 段落
      case 'p':
        markdown += `${convertChildNodes(element)}\n\n`
        break

      // 换行
      case 'br':
        markdown += '\n'
        break

      // 粗体
      case 'strong':
      case 'b':
        markdown += `**${convertChildNodes(element)}**`
        break

      // 斜体
      case 'em':
      case 'i':
        markdown += `*${convertChildNodes(element)}*`
        break

      // 删除线
      case 'del':
      case 's':
      case 'strike':
        markdown += `~~${convertChildNodes(element)}~~`
        break

      // 下划线（Markdown 不支持，使用 HTML）
      case 'u':
        markdown += `<u>${convertChildNodes(element)}</u>`
        break

      // 代码
      case 'code':
        if (element.classList.contains('language-')) {
          // 代码块
          const lang = Array.from(element.classList)
            .find(c => c.startsWith('language-'))
            ?.replace('language-', '') || ''
          markdown += `\`\`\`${lang}\n${getTextContent(element)}\n\`\`\`\n\n`
        } else {
          // 行内代码
          markdown += `\`${getTextContent(element)}\``
        }
        break

      // 代码块容器
      case 'pre':
        const codeElement = element.querySelector('code')
        if (codeElement) {
          const lang = Array.from(codeElement.classList)
            .find(c => c.startsWith('language-'))
            ?.replace('language-', '') || ''
          markdown += `\`\`\`${lang}\n${getTextContent(codeElement)}\n\`\`\`\n\n`
        } else {
          markdown += `\`\`\`\n${getTextContent(element)}\n\`\`\`\n\n`
        }
        break

      // 链接
      case 'a':
        const href = element.getAttribute('href') || ''
        const text = convertChildNodes(element)
        markdown += `[${text}](${href})`
        break

      // 图片
      case 'img':
        const src = element.getAttribute('src') || ''
        const alt = element.getAttribute('alt') || ''
        markdown += `![${alt}](${src})`
        break

      // 列表
      case 'ul':
        element.childNodes.forEach((child) => {
          if ((child as HTMLElement).tagName?.toLowerCase() === 'li') {
            markdown += `- ${convertChildNodes(child as HTMLElement)}\n`
          }
        })
        markdown += '\n'
        break

      case 'ol':
        let index = 1
        element.childNodes.forEach((child) => {
          if ((child as HTMLElement).tagName?.toLowerCase() === 'li') {
            markdown += `${index}. ${convertChildNodes(child as HTMLElement)}\n`
            index++
          }
        })
        markdown += '\n'
        break

      // 引用
      case 'blockquote':
        const lines = convertChildNodes(element).split('\n')
        markdown += lines.map(line => `> ${line}`).join('\n') + '\n\n'
        break

      // 表格
      case 'table':
        const rows = Array.from(element.querySelectorAll('tr'))
        if (rows.length > 0) {
          // 表头
          const headerCells = Array.from(rows[0].querySelectorAll('th, td'))
          if (headerCells.length > 0) {
            markdown += '| ' + headerCells.map(cell => getTextContent(cell as HTMLElement)).join(' | ') + ' |\n'
            markdown += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n'
          }
          // 表格内容
          for (let i = 1; i < rows.length; i++) {
            const cells = Array.from(rows[i].querySelectorAll('td'))
            if (cells.length > 0) {
              markdown += '| ' + cells.map(cell => getTextContent(cell as HTMLElement)).join(' | ') + ' |\n'
            }
          }
          markdown += '\n'
        }
        break

      // 水平线
      case 'hr':
        markdown += '---\n\n'
        break

      // 默认递归处理子节点
      default:
        markdown += convertChildNodes(element)
        break
    }
  }

  return markdown
}

/**
 * 转换子节点
 */
function convertChildNodes(element: HTMLElement): string {
  let markdown = ''
  element.childNodes.forEach((child) => {
    markdown += convertNodeToMarkdown(child)
  })
  return markdown
}

/**
 * 获取元素文本内容
 */
function getTextContent(element: HTMLElement): string {
  return element.textContent || ''
}

/**
 * 创建导出 Markdown 命令
 */
const exportMarkdownCommand: Command = {
  id: 'exportMarkdown',
  name: '导出为 Markdown',
  execute: (editor) => {
    const content = editor.getContent()
    const markdown = htmlToMarkdown(content)
    
    // 创建下载链接
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document.md'
    a.click()
    URL.revokeObjectURL(url)

    // 显示成功提示
    console.log('Markdown 已复制到剪贴板')
  }
}

/**
 * 创建导出 Markdown 插件
 */
export const ExportMarkdownPlugin: Plugin = createPlugin({
  name: 'export-markdown',
  version: '1.0.0',
  description: '导出为 Markdown 格式',
  author: 'LDesign Team',
  
  install(editor) {
    // 注册命令
    editor.commands.register(exportMarkdownCommand)
    
    // 添加工具栏按钮
    editor.toolbar.add({
      id: 'export-markdown',
      type: 'button',
      title: '导出 Markdown',
      icon: 'download',
      onClick: () => {
        editor.commands.execute('exportMarkdown')
      }
    })
    
    console.log('Markdown导出插件已复制到剪贴板')
  },
  
  destroy() {
    console.log('销毁导出插件')
  }
})

export default ExportMarkdownPlugin