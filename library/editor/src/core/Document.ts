/**
 * Document - 文档模型
 * 管理文档内容和结构
 */

import type { Node } from '../types'
import { Schema, defaultSchema } from './Schema'

export class Document {
  public root: Node
  public schema: Schema

  constructor(content?: Node | string, schema: Schema = defaultSchema) {
    this.schema = schema

    if (typeof content === 'string') {
      this.root = this.fromHTML(content)
    } else if (content) {
      this.root = content
    } else {
      // 默认创建空文档
      this.root = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }]
      }
    }
  }

  /**
   * 从 HTML 解析文档
   */
  fromHTML(html: string): Node {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    return this.parseDOM(doc.body)
  }

  /**
   * 转换为 HTML
   */
  toHTML(): string {
    return this.nodeToHTML(this.root)
  }

  /**
   * 转换为 JSON
   */
  toJSON(): Node {
    return JSON.parse(JSON.stringify(this.root))
  }

  /**
   * 从 JSON 创建文档
   */
  static fromJSON(json: Node, schema?: Schema): Document {
    return new Document(json, schema)
  }

  /**
   * 解析 DOM 节点
   */
  private parseDOM(dom: HTMLElement): Node {
    const children: Node[] = []

    // 遍历子节点
    for (let i = 0; i < dom.childNodes.length; i++) {
      const child = dom.childNodes[i]

      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || ''
        if (text.trim()) {
          children.push({
            type: 'text',
            text
          })
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement
        const node = this.parseElement(element)
        if (node) {
          children.push(node)
        }
      }
    }

    // 如果是根节点
    if (dom.tagName === 'BODY' || !dom.tagName) {
      return {
        type: 'doc',
        content: children.length > 0 ? children : [{ type: 'paragraph', content: [] }]
      }
    }

    return {
      type: 'paragraph',
      content: children
    }
  }

  /**
   * 解析元素节点
   */
  private parseElement(element: HTMLElement): Node | null {
    const tagName = element.tagName.toLowerCase()

    // 段落
    if (tagName === 'p') {
      return {
        type: 'paragraph',
        content: this.parseInlineContent(element)
      }
    }

    // 标题
    if (/^h[1-6]$/.test(tagName)) {
      return {
        type: 'heading',
        attrs: { level: parseInt(tagName[1]) },
        content: this.parseInlineContent(element)
      }
    }

    // 引用
    if (tagName === 'blockquote') {
      return {
        type: 'blockquote',
        content: Array.from(element.children).map(child =>
          this.parseElement(child as HTMLElement)
        ).filter(Boolean) as Node[]
      }
    }

    // 代码块
    if (tagName === 'pre') {
      const code = element.querySelector('code')
      return {
        type: 'codeBlock',
        content: [{
          type: 'text',
          text: (code || element).textContent || ''
        }]
      }
    }

    // 水平线
    if (tagName === 'hr') {
      return { type: 'horizontalRule' }
    }

    // 列表
    if (tagName === 'ul') {
      return {
        type: 'bulletList',
        content: Array.from(element.children)
          .filter(child => child.tagName.toLowerCase() === 'li')
          .map(child => ({
            type: 'listItem' as const,
            content: [this.parseDOM(child as HTMLElement)]
          }))
      }
    }

    if (tagName === 'ol') {
      return {
        type: 'orderedList',
        attrs: { start: parseInt(element.getAttribute('start') || '1') },
        content: Array.from(element.children)
          .filter(child => child.tagName.toLowerCase() === 'li')
          .map(child => ({
            type: 'listItem' as const,
            content: [this.parseDOM(child as HTMLElement)]
          }))
      }
    }

    // 图片
    if (tagName === 'img') {
      return {
        type: 'image',
        attrs: {
          src: element.getAttribute('src'),
          alt: element.getAttribute('alt'),
          title: element.getAttribute('title')
        }
      }
    }

    // 视频
    if (tagName === 'video') {
      // 优先从 <source> 子节点读取 src/type
      let src = element.getAttribute('src')
      let type = element.getAttribute('type')
      const source = element.querySelector('source')
      if (source) {
        src = src || source.getAttribute('src') || undefined as any
        type = type || source.getAttribute('type') || undefined as any
      }
      return {
        type: 'video',
        attrs: {
          src,
          type,
          controls: element.hasAttribute('controls') ? true : undefined
        }
      }
    }

    // 音频
    if (tagName === 'audio') {
      let src = element.getAttribute('src')
      let type = element.getAttribute('type')
      const source = element.querySelector('source')
      if (source) {
        src = src || source.getAttribute('src') || undefined as any
        type = type || source.getAttribute('type') || undefined as any
      }
      return {
        type: 'audio',
        attrs: {
          src,
          type,
          controls: element.hasAttribute('controls') ? true : undefined
        }
      }
    }

    // 表格 - 保留原始 HTML
    if (tagName === 'table') {
      return {
        type: 'table',
        attrs: {
          html: element.outerHTML
        }
      }
    }

    // 忽略表格内部元素（它们会被表格整体处理）
    if (tagName === 'thead' || tagName === 'tbody' || tagName === 'tr' || tagName === 'th' || tagName === 'td') {
      return null
    }

    // 默认作为段落处理
    return {
      type: 'paragraph',
      content: this.parseInlineContent(element)
    }
  }

  /**
   * 解析内联内容
   */
  private parseInlineContent(element: HTMLElement): Node[] {
    const nodes: Node[] = []

    const parseNode = (node: ChildNode, marks: any[] = []): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        if (text) {
          nodes.push({
            type: 'text',
            text,
            marks: marks.length > 0 ? marks : undefined
          })
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        const tag = el.tagName.toLowerCase()
        let newMarks = [...marks]

        // 解析标记
        if (tag === 'strong' || tag === 'b') {
          newMarks.push({ type: 'bold' })
        } else if (tag === 'em' || tag === 'i') {
          newMarks.push({ type: 'italic' })
        } else if (tag === 'u') {
          newMarks.push({ type: 'underline' })
        } else if (tag === 's' || tag === 'strike') {
          newMarks.push({ type: 'strike' })
        } else if (tag === 'code') {
          newMarks.push({ type: 'code' })
        } else if (tag === 'a') {
          newMarks.push({
            type: 'link',
            attrs: {
              href: el.getAttribute('href'),
              title: el.getAttribute('title')
            }
          })
        } else if (tag === 'img') {
          nodes.push({
            type: 'image',
            attrs: {
              src: el.getAttribute('src'),
              alt: el.getAttribute('alt'),
              title: el.getAttribute('title')
            }
          })
          return
        }

        // 递归处理子节点
        el.childNodes.forEach(child => parseNode(child, newMarks))
      }
    }

    element.childNodes.forEach(node => parseNode(node))
    return nodes
  }

  /**
   * 节点转 HTML
   */
  private nodeToHTML(node: Node): string {
    if (node.type === 'text') {
      let html = this.escapeHTML(node.text || '')

      // 应用标记
      if (node.marks) {
        node.marks.forEach(mark => {
          html = this.wrapMark(html, mark)
        })
      }

      return html
    }

    // 获取子内容
    const content = node.content?.map(child => this.nodeToHTML(child)).join('') || ''

    // 根据节点类型生成 HTML
    switch (node.type) {
      case 'doc':
        return content
      case 'paragraph':
        return `<p>${content}</p>`
      case 'heading':
        return `<h${node.attrs?.level || 1}>${content}</h${node.attrs?.level || 1}>`
      case 'blockquote':
        return `<blockquote>${content}</blockquote>`
      case 'codeBlock':
        return `<pre><code>${content}</code></pre>`
      case 'horizontalRule':
        return '<hr>'
      case 'bulletList':
        return `<ul>${content}</ul>`
      case 'orderedList':
        return `<ol start="${node.attrs?.start || 1}">${content}</ol>`
      case 'listItem':
        return `<li>${content}</li>`
      case 'image':
        return `<img src="${node.attrs?.src || ''}" alt="${node.attrs?.alt || ''}" ${node.attrs?.title ? `title=\"${node.attrs.title}\"` : ''}>`
      case 'video': {
        const src = node.attrs?.src || ''
        const type = node.attrs?.type ? ` type=\"${node.attrs.type}\"` : ''
        const controls = node.attrs?.controls === false ? '' : ' controls'
        // 使用 video[src] 简化生成，保证样式匹配
        return `<video${controls} src="${src}"${type} style="max-width: 100%; height: auto; display: block; margin: 10px auto;"></video>`
      }
      case 'audio': {
        const src = node.attrs?.src || ''
        const type = node.attrs?.type ? ` type=\"${node.attrs.type}\"` : ''
        const controls = node.attrs?.controls === false ? '' : ' controls'
        return `<audio${controls} src="${src}"${type} style="width: 100%; max-width: 400px; display: block; margin: 10px auto;"></audio>`
      }
      case 'table':
        // 直接返回原始的表格 HTML
        return node.attrs?.html || '<table></table>'
      default:
        return content
    }
  }

  /**
   * 包装标记
   */
  private wrapMark(html: string, mark: any): string {
    switch (mark.type) {
      case 'bold':
        return `<strong>${html}</strong>`
      case 'italic':
        return `<em>${html}</em>`
      case 'underline':
        return `<u>${html}</u>`
      case 'strike':
        return `<s>${html}</s>`
      case 'code':
        return `<code>${html}</code>`
      case 'link':
        return `<a href="${mark.attrs?.href || ''}" ${mark.attrs?.title ? `title="${mark.attrs.title}"` : ''}>${html}</a>`
      default:
        return html
    }
  }

  /**
   * 转义 HTML
   */
  private escapeHTML(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }

  /**
   * 获取文档大小
   */
  get size(): number {
    return this.getNodeSize(this.root)
  }

  /**
   * 计算节点大小
   */
  private getNodeSize(node: Node): number {
    if (node.type === 'text') {
      return node.text?.length || 0
    }

    let size = 1 // 节点开始
    if (node.content) {
      node.content.forEach(child => {
        size += this.getNodeSize(child)
      })
    }
    size += 1 // 节点结束

    return size
  }
}
