/**
 * 原生 JavaScript 适配器
 */

import type {
  FormConfig,
  FormManagerOptions,
  AdaptiveFormProps,
} from '../types'
import { FormManager, createFormManager } from '../core/form-manager'
import { createElement, addClass, removeClass } from '../utils/dom'

export interface NativeAdapterOptions extends FormManagerOptions {
  /** 容器类名 */
  containerClass?: string
  /** 主题 */
  theme?: 'light' | 'dark' | 'auto'
  /** 是否自动挂载样式 */
  autoMountStyles?: boolean
}

export class NativeFormAdapter {
  private formManager: FormManager
  private container: HTMLElement
  private options: Required<NativeAdapterOptions>
  private styleElement?: HTMLStyleElement

  constructor(
    container: string | HTMLElement,
    config: FormConfig,
    options: NativeAdapterOptions = {}
  ) {
    // 获取容器元素
    this.container = typeof container === 'string'
      ? document.querySelector(container) as HTMLElement
      : container
      
    if (!this.container) {
      throw new Error('Container element not found')
    }
    
    // 合并选项
    this.options = {
      containerClass: options.containerClass ?? 'adaptive-form',
      theme: options.theme ?? 'auto',
      autoMountStyles: options.autoMountStyles ?? true,
      ...options,
    }
    
    // 初始化容器
    this.initializeContainer()
    
    // 挂载样式
    if (this.options.autoMountStyles) {
      this.mountStyles()
    }
    
    // 创建表单管理器
    this.formManager = createFormManager(
      this.container,
      config,
      this.options
    )
    
    // 设置主题
    this.setTheme(this.options.theme)
  }

  /**
   * 初始化容器
   */
  private initializeContainer(): void {
    addClass(this.container, this.options.containerClass)
    addClass(this.container, 'adaptive-form-container')
    
    // 设置基本属性
    this.container.setAttribute('role', 'form')
    this.container.setAttribute('data-adaptive-form', 'true')
  }

  /**
   * 挂载样式
   */
  private mountStyles(): void {
    if (this.styleElement) return
    
    this.styleElement = document.createElement('style')
    this.styleElement.setAttribute('data-adaptive-form-styles', 'true')
    this.styleElement.textContent = this.getDefaultStyles()
    
    document.head.appendChild(this.styleElement)
  }

  /**
   * 获取默认样式
   */
  private getDefaultStyles(): string {
    return `
      .adaptive-form-container {
        position: relative;
        width: 100%;
        box-sizing: border-box;
      }
      
      .adaptive-form-container * {
        box-sizing: border-box;
      }
      
      .adaptive-form-grid {
        display: grid;
        gap: 16px;
        width: 100%;
      }
      
      .adaptive-form-item {
        position: relative;
        min-height: 40px;
      }
      
      .adaptive-form-label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        color: var(--form-label-color, #374151);
        font-size: 14px;
        line-height: 1.4;
      }
      
      .adaptive-form-label.required::after {
        content: ' *';
        color: var(--form-error-color, #ef4444);
      }
      
      .adaptive-form-input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid var(--form-border-color, #d1d5db);
        border-radius: 6px;
        font-size: 14px;
        line-height: 1.4;
        background-color: var(--form-input-bg, #ffffff);
        color: var(--form-input-color, #374151);
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      
      .adaptive-form-input:focus {
        outline: none;
        border-color: var(--form-focus-color, #3b82f6);
        box-shadow: 0 0 0 3px var(--form-focus-shadow, rgba(59, 130, 246, 0.1));
      }
      
      .adaptive-form-input:disabled {
        background-color: var(--form-disabled-bg, #f9fafb);
        color: var(--form-disabled-color, #9ca3af);
        cursor: not-allowed;
      }
      
      .adaptive-form-input.error {
        border-color: var(--form-error-color, #ef4444);
      }
      
      .adaptive-form-textarea {
        resize: vertical;
        min-height: 80px;
      }
      
      .adaptive-form-select {
        cursor: pointer;
      }
      
      .adaptive-form-checkbox,
      .adaptive-form-radio {
        width: auto;
        margin-right: 8px;
      }
      
      .adaptive-form-checkbox-wrapper,
      .adaptive-form-radio-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .adaptive-form-checkbox-wrapper:last-child,
      .adaptive-form-radio-wrapper:last-child {
        margin-bottom: 0;
      }
      
      .adaptive-form-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }
      
      .adaptive-form-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .adaptive-form-switch-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--form-switch-bg, #ccc);
        transition: 0.2s;
        border-radius: 24px;
      }
      
      .adaptive-form-switch-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.2s;
        border-radius: 50%;
      }
      
      .adaptive-form-switch input:checked + .adaptive-form-switch-slider {
        background-color: var(--form-switch-active-bg, #3b82f6);
      }
      
      .adaptive-form-switch input:checked + .adaptive-form-switch-slider:before {
        transform: translateX(20px);
      }
      
      .adaptive-form-error {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: var(--form-error-color, #ef4444);
        line-height: 1.4;
      }
      
      .adaptive-form-item.hidden {
        display: none;
      }
      
      .adaptive-form-group {
        margin-bottom: 24px;
      }
      
      .adaptive-form-group-title {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--form-group-title-color, #111827);
        cursor: pointer;
        display: flex;
        align-items: center;
      }
      
      .adaptive-form-group-title::before {
        content: '▼';
        margin-right: 8px;
        transition: transform 0.2s;
        font-size: 12px;
      }
      
      .adaptive-form-group.collapsed .adaptive-form-group-title::before {
        transform: rotate(-90deg);
      }
      
      .adaptive-form-group.collapsed .adaptive-form-group-content {
        display: none;
      }
      
      .adaptive-form-expand-toggle {
        position: absolute;
        top: 16px;
        right: 16px;
        background: var(--form-button-bg, #3b82f6);
        color: var(--form-button-color, white);
        border: none;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .adaptive-form-expand-toggle:hover {
        background: var(--form-button-hover-bg, #2563eb);
      }
      
      .adaptive-form-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      
      .adaptive-form-modal-content {
        background: var(--form-modal-bg, white);
        border-radius: 8px;
        padding: 24px;
        max-width: 90vw;
        max-height: 90vh;
        overflow: auto;
        position: relative;
      }
      
      .adaptive-form-modal-close {
        position: absolute;
        top: 16px;
        right: 16px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--form-text-color, #6b7280);
      }
      
      /* 深色主题 */
      .adaptive-form-container[data-theme="dark"] {
        --form-label-color: #f3f4f6;
        --form-border-color: #4b5563;
        --form-input-bg: #1f2937;
        --form-input-color: #f3f4f6;
        --form-disabled-bg: #374151;
        --form-disabled-color: #6b7280;
        --form-group-title-color: #f9fafb;
        --form-modal-bg: #1f2937;
        --form-text-color: #9ca3af;
      }
      
      /* 响应式设计 */
      @media (max-width: 768px) {
        .adaptive-form-container {
          padding: 16px;
        }
        
        .adaptive-form-grid {
          gap: 12px;
        }
        
        .adaptive-form-modal-content {
          padding: 16px;
          margin: 16px;
        }
      }
      
      /* 动画 */
      .adaptive-form-item {
        transition: opacity 0.2s, transform 0.2s;
      }
      
      .adaptive-form-item.entering {
        opacity: 0;
        transform: translateY(-10px);
      }
      
      .adaptive-form-item.entered {
        opacity: 1;
        transform: translateY(0);
      }
      
      .adaptive-form-item.exiting {
        opacity: 0;
        transform: translateY(-10px);
      }
    `
  }

  /**
   * 设置主题
   */
  setTheme(theme: 'light' | 'dark' | 'auto'): void {
    this.options.theme = theme
    
    // 移除旧主题类
    removeClass(this.container, 'theme-light')
    removeClass(this.container, 'theme-dark')
    
    // 设置主题属性
    if (theme === 'auto') {
      // 自动检测系统主题
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.container.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
      
      // 监听主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        this.container.setAttribute('data-theme', e.matches ? 'dark' : 'light')
      })
    } else {
      this.container.setAttribute('data-theme', theme)
    }
    
    addClass(this.container, `theme-${theme}`)
  }

  /**
   * 获取表单管理器
   */
  getFormManager(): FormManager {
    return this.formManager
  }

  /**
   * 更新配置
   */
  updateConfig(config: FormConfig): void {
    this.formManager.updateConfig(config)
  }

  /**
   * 获取表单值
   */
  getValues(): Record<string, any> {
    return this.formManager.getValues()
  }

  /**
   * 设置表单值
   */
  setValues(values: Record<string, any>): void {
    this.formManager.setValues(values)
  }

  /**
   * 验证表单
   */
  async validate(): Promise<boolean> {
    return await this.formManager.validateForm()
  }

  /**
   * 重置表单
   */
  reset(): void {
    this.formManager.reset()
  }

  /**
   * 监听事件
   */
  on<K extends keyof import('../core/form-manager').FormManagerEvents>(
    event: K,
    handler: (data: import('../core/form-manager').FormManagerEvents[K]) => void
  ): void {
    this.formManager.on(event, handler)
  }

  /**
   * 移除事件监听器
   */
  off<K extends keyof import('../core/form-manager').FormManagerEvents>(
    event: K,
    handler?: (data: import('../core/form-manager').FormManagerEvents[K]) => void
  ): void {
    this.formManager.off(event, handler)
  }

  /**
   * 销毁适配器
   */
  destroy(): void {
    // 销毁表单管理器
    this.formManager.destroy()
    
    // 移除样式
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement)
    }
    
    // 清理容器
    removeClass(this.container, this.options.containerClass)
    removeClass(this.container, 'adaptive-form-container')
    removeClass(this.container, `theme-${this.options.theme}`)
    this.container.removeAttribute('role')
    this.container.removeAttribute('data-adaptive-form')
    this.container.removeAttribute('data-theme')
    
    // 清空容器内容
    this.container.innerHTML = ''
  }
}

/**
 * 创建原生表单适配器
 */
export function createNativeForm(
  container: string | HTMLElement,
  config: FormConfig,
  options?: NativeAdapterOptions
): NativeFormAdapter {
  return new NativeFormAdapter(container, config, options)
}

/**
 * 自动初始化表单
 */
export function autoInitForms(selector = '[data-adaptive-form-config]'): NativeFormAdapter[] {
  const elements = document.querySelectorAll(selector)
  const forms: NativeFormAdapter[] = []
  
  elements.forEach((element) => {
    try {
      const configAttr = element.getAttribute('data-adaptive-form-config')
      if (!configAttr) return
      
      const config = JSON.parse(configAttr) as FormConfig
      const optionsAttr = element.getAttribute('data-adaptive-form-options')
      const options = optionsAttr ? JSON.parse(optionsAttr) : {}
      
      const form = new NativeFormAdapter(element as HTMLElement, config, options)
      forms.push(form)
    } catch (error) {
      console.error('Failed to initialize adaptive form:', error)
    }
  })
  
  return forms
}

/**
 * DOM 加载完成后自动初始化
 */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoInitForms())
  } else {
    // 延迟执行，确保所有脚本都已加载
    setTimeout(() => autoInitForms(), 0)
  }
}

// 导出类型
export type { FormConfig, FormManagerOptions, AdaptiveFormProps }