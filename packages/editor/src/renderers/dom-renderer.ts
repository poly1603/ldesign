/**
 * DOM渲染器
 * 负责编辑器的DOM渲染和更新
 */

import { createElement, addClass, removeClass } from '../utils'

/**
 * DOM节点类型
 */
export interface DOMNode {
  type: 'element' | 'text'
  tag?: string
  text?: string
  attributes?: Record<string, string>
  children?: DOMNode[]
  element?: HTMLElement | Text
}

/**
 * 渲染选项
 */
export interface RenderOptions {
  /** 是否启用虚拟DOM */
  enableVirtualDOM?: boolean
  /** 是否启用增量更新 */
  enableIncrementalUpdate?: boolean
  /** 渲染批次大小 */
  batchSize?: number
}

/**
 * DOM渲染器实现
 * 提供高效的DOM渲染和更新功能
 */
export class DOMRenderer {
  /** 容器元素 */
  private container: HTMLElement

  /** 渲染选项 */
  private options: Required<RenderOptions>

  /** 虚拟DOM树 */
  private virtualDOM: DOMNode | null = null

  /** 渲染队列 */
  private renderQueue: Array<() => void> = []

  /** 是否正在渲染 */
  private isRendering = false

  /** 渲染帧ID */
  private renderFrameId: number | null = null

  constructor(container: HTMLElement, options: RenderOptions = {}) {
    this.container = container
    this.options = {
      enableVirtualDOM: options.enableVirtualDOM ?? true,
      enableIncrementalUpdate: options.enableIncrementalUpdate ?? true,
      batchSize: options.batchSize ?? 100
    }
  }

  /**
   * 渲染内容
   * @param content HTML内容或虚拟DOM节点
   */
  render(content: string | DOMNode): void {
    if (typeof content === 'string') {
      this.renderHTML(content)
    } else {
      this.renderVirtualDOM(content)
    }
  }

  /**
   * 渲染HTML内容
   * @param html HTML字符串
   */
  renderHTML(html: string): void {
    if (this.options.enableVirtualDOM) {
      // 解析HTML为虚拟DOM
      const virtualDOM = this.parseHTMLToVirtualDOM(html)
      this.renderVirtualDOM(virtualDOM)
    } else {
      // 直接设置innerHTML
      this.container.innerHTML = html
    }
  }

  /**
   * 渲染虚拟DOM
   * @param vdom 虚拟DOM节点
   */
  renderVirtualDOM(vdom: DOMNode): void {
    if (this.options.enableIncrementalUpdate && this.virtualDOM) {
      // 增量更新
      this.updateVirtualDOM(this.virtualDOM, vdom)
    } else {
      // 全量渲染
      this.fullRenderVirtualDOM(vdom)
    }
    
    this.virtualDOM = vdom
  }

  /**
   * 批量更新DOM
   * @param updates 更新函数数组
   */
  batchUpdate(updates: Array<() => void>): void {
    this.renderQueue.push(...updates)
    this.scheduleRender()
  }

  /**
   * 创建元素
   * @param vnode 虚拟DOM节点
   * @returns DOM元素
   */
  createElement(vnode: DOMNode): HTMLElement | Text {
    if (vnode.type === 'text') {
      const textNode = document.createTextNode(vnode.text || '')
      vnode.element = textNode
      return textNode
    }

    if (vnode.type === 'element' && vnode.tag) {
      const element = createElement(vnode.tag, vnode.attributes || {})
      
      // 渲染子节点
      if (vnode.children) {
        vnode.children.forEach(child => {
          const childElement = this.createElement(child)
          element.appendChild(childElement)
        })
      }
      
      vnode.element = element
      return element
    }

    throw new Error('Invalid virtual DOM node')
  }

  /**
   * 更新元素
   * @param element DOM元素
   * @param oldVNode 旧虚拟DOM节点
   * @param newVNode 新虚拟DOM节点
   */
  updateElement(element: HTMLElement, oldVNode: DOMNode, newVNode: DOMNode): void {
    // 更新属性
    if (newVNode.attributes) {
      Object.entries(newVNode.attributes).forEach(([key, value]) => {
        if (oldVNode.attributes?.[key] !== value) {
          element.setAttribute(key, value)
        }
      })
    }

    // 移除不存在的属性
    if (oldVNode.attributes) {
      Object.keys(oldVNode.attributes).forEach(key => {
        if (!newVNode.attributes?.[key]) {
          element.removeAttribute(key)
        }
      })
    }
  }

  /**
   * 解析HTML为虚拟DOM
   * @param html HTML字符串
   * @returns 虚拟DOM节点
   */
  private parseHTMLToVirtualDOM(html: string): DOMNode {
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = html
    
    return this.domToVirtualDOM(tempDiv.firstChild as HTMLElement) || {
      type: 'element',
      tag: 'div',
      children: []
    }
  }

  /**
   * DOM节点转虚拟DOM
   * @param node DOM节点
   * @returns 虚拟DOM节点
   */
  private domToVirtualDOM(node: Node): DOMNode | null {
    if (node.nodeType === Node.TEXT_NODE) {
      return {
        type: 'text',
        text: node.textContent || '',
        element: node as Text
      }
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement
      const attributes: Record<string, string> = {}
      
      // 获取属性
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i]
        attributes[attr.name] = attr.value
      }

      // 获取子节点
      const children: DOMNode[] = []
      for (let i = 0; i < element.childNodes.length; i++) {
        const child = this.domToVirtualDOM(element.childNodes[i])
        if (child) {
          children.push(child)
        }
      }

      return {
        type: 'element',
        tag: element.tagName.toLowerCase(),
        attributes,
        children,
        element
      }
    }

    return null
  }

  /**
   * 全量渲染虚拟DOM
   * @param vdom 虚拟DOM节点
   */
  private fullRenderVirtualDOM(vdom: DOMNode): void {
    // 清空容器
    this.container.innerHTML = ''
    
    // 创建并添加新元素
    const element = this.createElement(vdom)
    if (vdom.type === 'element') {
      // 如果是元素节点，添加其子节点
      if (vdom.children) {
        vdom.children.forEach(child => {
          const childElement = this.createElement(child)
          this.container.appendChild(childElement)
        })
      }
    } else {
      this.container.appendChild(element)
    }
  }

  /**
   * 更新虚拟DOM
   * @param oldVDOM 旧虚拟DOM
   * @param newVDOM 新虚拟DOM
   */
  private updateVirtualDOM(oldVDOM: DOMNode, newVDOM: DOMNode): void {
    // 简化的diff算法
    if (oldVDOM.type !== newVDOM.type || oldVDOM.tag !== newVDOM.tag) {
      // 节点类型或标签不同，直接替换
      this.fullRenderVirtualDOM(newVDOM)
      return
    }

    if (oldVDOM.type === 'text') {
      // 文本节点
      if (oldVDOM.text !== newVDOM.text && oldVDOM.element) {
        oldVDOM.element.textContent = newVDOM.text || ''
      }
      return
    }

    if (oldVDOM.type === 'element' && oldVDOM.element) {
      // 元素节点
      this.updateElement(oldVDOM.element as HTMLElement, oldVDOM, newVDOM)
      
      // 更新子节点
      this.updateChildren(oldVDOM, newVDOM)
    }
  }

  /**
   * 更新子节点
   * @param oldVDOM 旧虚拟DOM
   * @param newVDOM 新虚拟DOM
   */
  private updateChildren(oldVDOM: DOMNode, newVDOM: DOMNode): void {
    const oldChildren = oldVDOM.children || []
    const newChildren = newVDOM.children || []
    const maxLength = Math.max(oldChildren.length, newChildren.length)

    for (let i = 0; i < maxLength; i++) {
      const oldChild = oldChildren[i]
      const newChild = newChildren[i]

      if (!oldChild && newChild) {
        // 新增子节点
        const element = this.createElement(newChild)
        oldVDOM.element?.appendChild(element)
      } else if (oldChild && !newChild) {
        // 删除子节点
        if (oldChild.element?.parentNode) {
          oldChild.element.parentNode.removeChild(oldChild.element)
        }
      } else if (oldChild && newChild) {
        // 更新子节点
        this.updateVirtualDOM(oldChild, newChild)
      }
    }
  }

  /**
   * 调度渲染
   */
  private scheduleRender(): void {
    if (this.isRendering || this.renderFrameId !== null) {
      return
    }

    this.renderFrameId = requestAnimationFrame(() => {
      this.processRenderQueue()
      this.renderFrameId = null
    })
  }

  /**
   * 处理渲染队列
   */
  private processRenderQueue(): void {
    if (this.isRendering) {
      return
    }

    this.isRendering = true
    
    try {
      // 批量处理更新
      const batch = this.renderQueue.splice(0, this.options.batchSize)
      batch.forEach(update => {
        try {
          update()
        } catch (error) {
          console.error('Error in render update:', error)
        }
      })

      // 如果还有待处理的更新，继续调度
      if (this.renderQueue.length > 0) {
        this.scheduleRender()
      }
    } finally {
      this.isRendering = false
    }
  }

  /**
   * 获取虚拟DOM
   * @returns 当前虚拟DOM
   */
  getVirtualDOM(): DOMNode | null {
    return this.virtualDOM
  }

  /**
   * 清空渲染器
   */
  clear(): void {
    this.container.innerHTML = ''
    this.virtualDOM = null
    this.renderQueue = []
    
    if (this.renderFrameId !== null) {
      cancelAnimationFrame(this.renderFrameId)
      this.renderFrameId = null
    }
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    this.clear()
    this.isRendering = false
  }
}
