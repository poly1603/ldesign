/**
 * 代码简化工具
 * 提供更简洁的API，减少样板代码
 */

import type { Editor } from '../core/Editor'
import { getIconManager } from '../icons/IconManager'
import { getI18n } from '../i18n'

/**
 * DOM快捷操作
 */
export const $ = {
  /**
   * 创建元素
   */
  create<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    props?: Partial<HTMLElementTagNameMap[K]> & { className?: string; style?: string; html?: string; text?: string },
    children?: (HTMLElement | string)[]
  ): HTMLElementTagNameMap[K] {
    const el = document.createElement(tag)
    
    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        if (key === 'className') {
          el.className = value as string
        } else if (key === 'style' && typeof value === 'string') {
          el.style.cssText = value
        } else if (key === 'html') {
          el.innerHTML = value as string
        } else if (key === 'text') {
          el.textContent = value as string
        } else {
          (el as any)[key] = value
        }
      })
    }
    
    if (children) {
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child))
        } else {
          el.appendChild(child)
        }
      })
    }
    
    return el
  },
  
  /**
   * 选择元素
   */
  select<T extends HTMLElement = HTMLElement>(selector: string): T | null {
    return document.querySelector(selector) as T | null
  },
  
  /**
   * 选择所有元素
   */
  selectAll<T extends HTMLElement = HTMLElement>(selector: string): T[] {
    return Array.from(document.querySelectorAll(selector)) as T[]
  },
  
  /**
   * 添加样式
   */
  style(el: HTMLElement, styles: Partial<CSSStyleDeclaration> | string): void {
    if (typeof styles === 'string') {
      el.style.cssText = styles
    } else {
      Object.assign(el.style, styles)
    }
  },
  
  /**
   * 添加类
   */
  addClass(el: HTMLElement, ...classes: string[]): void {
    el.classList.add(...classes)
  },
  
  /**
   * 移除类
   */
  removeClass(el: HTMLElement, ...classes: string[]): void {
    el.classList.remove(...classes)
  },
  
  /**
   * 切换类
   */
  toggleClass(el: HTMLElement, className: string, force?: boolean): void {
    el.classList.toggle(className, force)
  },
  
  /**
   * 移除元素
   */
  remove(el: HTMLElement): void {
    el.remove()
  },
  
  /**
   * 清空内容
   */
  empty(el: HTMLElement): void {
    el.innerHTML = ''
  },
  
  /**
   * 显示/隐藏
   */
  show(el: HTMLElement): void {
    el.style.display = ''
  },
  
  hide(el: HTMLElement): void {
    el.style.display = 'none'
  },
  
  toggle(el: HTMLElement): void {
    el.style.display = el.style.display === 'none' ? '' : 'none'
  }
}

/**
 * 事件快捷操作
 */
export const on = {
  /**
   * 绑定事件
   */
  click(el: HTMLElement, handler: (e: MouseEvent) => void): void {
    el.addEventListener('click', handler)
  },
  
  change(el: HTMLElement, handler: (e: Event) => void): void {
    el.addEventListener('change', handler)
  },
  
  input(el: HTMLElement, handler: (e: Event) => void): void {
    el.addEventListener('input', handler)
  },
  
  keydown(el: HTMLElement, handler: (e: KeyboardEvent) => void): void {
    el.addEventListener('keydown', handler)
  },
  
  /**
   * 绑定一次性事件
   */
  once(el: HTMLElement, event: string, handler: EventListener): void {
    el.addEventListener(event, handler, { once: true })
  },
  
  /**
   * 解绑事件
   */
  off(el: HTMLElement, event: string, handler: EventListener): void {
    el.removeEventListener(event, handler)
  }
}

/**
 * 编辑器命令快捷操作
 */
export function cmd(editor: Editor) {
  return {
    /**
     * 切换格式
     */
    toggle(format: string): boolean {
      return editor.commands.execute(`toggle${capitalize(format)}`)
    },
    
    /**
     * 插入内容
     */
    insert(type: string, data?: any): boolean {
      return editor.commands.execute(`insert${capitalize(type)}`, data)
    },
    
    /**
     * 设置格式
     */
    set(property: string, value: any): boolean {
      return editor.commands.execute(`set${capitalize(property)}`, value)
    },
    
    /**
     * 执行命令
     */
    exec(command: string, ...args: any[]): boolean {
      return editor.commands.execute(command, ...args)
    }
  }
}

/**
 * UI快捷操作
 */
export const ui = {
  /**
   * 创建按钮
   */
  button(text: string, onClick: () => void, icon?: string): HTMLButtonElement {
    const btn = $.create('button', {
      text,
      className: 'btn',
      style: `
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        background: var(--editor-color-primary, #3b82f6);
        color: white;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      `
    })
    
    if (icon) {
      const iconEl = getIconManager().createIconElement(icon, { size: 16 })
      btn.insertBefore(iconEl, btn.firstChild)
    }
    
    on.click(btn, onClick)
    
    return btn
  },
  
  /**
   * 创建输入框
   */
  input(placeholder: string, onChange?: (value: string) => void): HTMLInputElement {
    const input = $.create('input', {
      type: 'text',
      placeholder,
      className: 'input',
      style: `
        padding: 8px 12px;
        border: 1px solid var(--editor-color-border, #d1d5db);
        border-radius: 6px;
        font-size: 14px;
      `
    })
    
    if (onChange) {
      on.input(input, (e) => onChange((e.target as HTMLInputElement).value))
    }
    
    return input
  },
  
  /**
   * 创建对话框
   */
  dialog(title: string, content: HTMLElement | string): HTMLElement {
    const overlay = $.create('div', {
      className: 'dialog-overlay',
      style: `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      `
    })
    
    const dialog = $.create('div', {
      className: 'dialog',
      style: `
        background: white;
        border-radius: 8px;
        min-width: 400px;
        max-width: 600px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      `
    })
    
    const header = $.create('div', {
      html: `<h2 style="margin: 0;">${title}</h2>`,
      style: `
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
      `
    })
    
    const body = $.create('div', {
      className: 'dialog-body',
      style: 'padding: 20px;'
    })
    
    if (typeof content === 'string') {
      body.innerHTML = content
    } else {
      body.appendChild(content)
    }
    
    dialog.appendChild(header)
    dialog.appendChild(body)
    overlay.appendChild(dialog)
    
    on.click(overlay, (e) => {
      if (e.target === overlay) {
        $.remove(overlay)
      }
    })
    
    return overlay
  },
  
  /**
   * 显示提示
   */
  toast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      info: '#3b82f6'
    }
    
    const toast = $.create('div', {
      text: message,
      className: 'toast',
      style: `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${colors[type]};
        color: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10001;
        animation: slideIn 0.3s ease;
      `
    })
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => $.remove(toast), 300)
    }, 3000)
  }
}

/**
 * 字符串工具
 */
export const str = {
  /**
   * 首字母大写
   */
  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
  },
  
  /**
   * 驼峰转短横线
   */
  kebab(s: string): string {
    return s.replace(/[A-Z]/g, m => '-' + m.toLowerCase())
  },
  
  /**
   * 短横线转驼峰
   */
  camel(s: string): string {
    return s.replace(/-([a-z])/g, (_, m) => m.toUpperCase())
  },
  
  /**
   * 截断
   */
  truncate(s: string, maxLength: number, suffix: string = '...'): string {
    if (s.length <= maxLength) return s
    return s.slice(0, maxLength - suffix.length) + suffix
  }
}

/**
 * 首字母大写
 */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * 创建样式对象
 */
export function css(styles: Record<string, string | number>): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())
      return `${cssKey}: ${value}${typeof value === 'number' && key !== 'opacity' && key !== 'zIndex' ? 'px' : ''}`
    })
    .join('; ')
}

/**
 * 组合类名
 */
export function classNames(...args: (string | false | undefined | null)[]): string {
  return args.filter(Boolean).join(' ')
}




