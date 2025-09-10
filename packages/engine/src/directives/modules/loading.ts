/**
 * 加载状态指令
 * 显示加载状态和加载动画
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective } from '../base/vue-directive-adapter'

export interface LoadingOptions {
  loading?: boolean
  text?: string
  spinner?: 'default' | 'dots' | 'pulse' | 'bounce' | 'custom'
  size?: 'small' | 'medium' | 'large'
  color?: string
  background?: string
  opacity?: number
  zIndex?: number
  customSpinner?: string
  position?: 'absolute' | 'fixed' | 'relative'
  fullscreen?: boolean
  lock?: boolean
  target?: string | HTMLElement
}

export class LoadingDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'loading',
      description: '加载状态指令，显示加载动画和遮罩',
      version: '1.0.0',
      category: 'ui',
      tags: ['loading', 'spinner', 'ui', 'feedback'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    // 存储配置
    el._loadingConfig = config

    // 如果初始状态为加载中，显示加载
    if (config.loading) {
      this.showLoading(el, config)
    }

    this.log('Loading directive mounted')
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)
    const oldConfig = el._loadingConfig

    // 更新配置
    el._loadingConfig = config

    // 检查加载状态是否改变
    if (oldConfig?.loading !== config.loading) {
      if (config.loading) {
        this.showLoading(el, config)
      } else {
        this.hideLoading(el)
      }
    }
  }

  public unmounted(el: HTMLElement): void {
    this.hideLoading(el)
    delete el._loadingConfig

    this.log('Loading directive unmounted')
  }

  private parseConfig(binding: VueDirectiveBinding): LoadingOptions {
    const value = binding.value

    if (typeof value === 'boolean') {
      return { loading: value }
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Partial<LoadingOptions>
      return {
        loading: obj.loading !== false,
        text: obj.text || '加载中...',
        spinner: obj.spinner || 'default',
        size: obj.size || 'medium',
        color: obj.color || '#409eff',
        background: obj.background || 'rgba(255, 255, 255, 0.9)',
        opacity: obj.opacity ?? 0.9,
        zIndex: obj.zIndex ?? 2000,
        customSpinner: obj.customSpinner,
        position: obj.position || 'absolute',
        fullscreen: obj.fullscreen || false,
        lock: obj.lock !== false,
        target: obj.target,
      }
    }

    return {
      loading: true,
      text: '加载中...',
      spinner: 'default',
      size: 'medium',
      color: '#409eff',
      background: 'rgba(255, 255, 255, 0.9)',
      opacity: 0.9,
      zIndex: 2000,
      position: 'absolute',
      lock: true,
    }
  }

  private showLoading(el: HTMLElement, config: LoadingOptions): void {
    // 如果已经有加载遮罩，先移除
    this.hideLoading(el)

    const target = this.getTarget(el, config)
    const loadingEl = this.createLoadingElement(config)

    // 设置目标元素样式
    if (config.position === 'absolute' && target !== document.body) {
      const position = getComputedStyle(target).position
      if (position === 'static') {
        target.style.position = 'relative'
        target._originalPosition = 'static'
      }
    }

    // 如果需要锁定滚动
    if (config.lock && (config.fullscreen || target === document.body)) {
      document.body.style.overflow = 'hidden'
      target._scrollLocked = true
    }

    // 添加加载元素
    target.appendChild(loadingEl)
    target._loadingElement = loadingEl

    // 添加动画
    requestAnimationFrame(() => {
      loadingEl.style.opacity = '1'
    })
  }

  private hideLoading(el: HTMLElement): void {
    const config = el._loadingConfig
    if (!config) return

    const target = this.getTarget(el, config)
    const loadingEl = target._loadingElement

    if (loadingEl) {
      // 淡出动画
      loadingEl.style.opacity = '0'

      setTimeout(() => {
        if (loadingEl.parentNode) {
          loadingEl.parentNode.removeChild(loadingEl)
        }
        delete target._loadingElement
      }, 300)
    }

    // 恢复原始样式
    if (target._originalPosition) {
      target.style.position = target._originalPosition
      delete target._originalPosition
    }

    // 解锁滚动
    if (target._scrollLocked) {
      document.body.style.overflow = ''
      delete target._scrollLocked
    }
  }

  private getTarget(el: HTMLElement, config: LoadingOptions): HTMLElement {
    if (config.fullscreen) {
      return document.body
    }

    if (config.target) {
      if (typeof config.target === 'string') {
        return (document.querySelector(config.target) as HTMLElement) || el
      }
      return config.target
    }

    return el
  }

  private createLoadingElement(config: LoadingOptions): HTMLElement {
    const loadingEl = document.createElement('div')
    loadingEl.className = 'engine-loading-mask'

    // 设置遮罩样式
    Object.assign(loadingEl.style, {
      position: config.position,
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      background: config.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      zIndex: config.zIndex?.toString(),
      opacity: '0',
      transition: 'opacity 0.3s ease',
    })

    // 创建加载内容
    const contentEl = document.createElement('div')
    contentEl.className = 'engine-loading-content'

    // 创建加载动画
    const spinnerEl = this.createSpinner(config)
    contentEl.appendChild(spinnerEl)

    // 创建加载文本
    if (config.text) {
      const textEl = document.createElement('div')
      textEl.className = 'engine-loading-text'
      textEl.textContent = config.text
      textEl.style.marginTop = '12px'
      textEl.style.color = config.color || '#409eff'
      textEl.style.fontSize = '14px'
      contentEl.appendChild(textEl)
    }

    loadingEl.appendChild(contentEl)
    return loadingEl
  }

  private createSpinner(config: LoadingOptions): HTMLElement {
    const spinnerEl = document.createElement('div')
    spinnerEl.className = `engine-loading-spinner engine-loading-spinner-${config.spinner}`

    const sizeMap = {
      small: '24px',
      medium: '32px',
      large: '48px',
    }

    const size = sizeMap[config.size || 'medium']

    if (config.customSpinner) {
      spinnerEl.innerHTML = config.customSpinner
    } else {
      switch (config.spinner) {
        case 'dots':
          spinnerEl.innerHTML = this.createDotsSpinner(size, config.color)
          break
        case 'pulse':
          spinnerEl.innerHTML = this.createPulseSpinner(size, config.color)
          break
        case 'bounce':
          spinnerEl.innerHTML = this.createBounceSpinner(size, config.color)
          break
        default:
          spinnerEl.innerHTML = this.createDefaultSpinner(size, config.color)
      }
    }

    return spinnerEl
  }

  private createDefaultSpinner(size: string, color?: string): string {
    return `
      <div style="
        width: ${size};
        height: ${size};
        border: 3px solid #f3f3f3;
        border-top: 3px solid ${color || '#409eff'};
        border-radius: 50%;
        animation: engine-loading-spin 1s linear infinite;
      "></div>
      <style>
        @keyframes engine-loading-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `
  }

  private createDotsSpinner(size: string, color?: string): string {
    const dotSize = `calc(${size} / 4)`
    return `
      <div style="display: flex; gap: 4px;">
        <div style="
          width: ${dotSize};
          height: ${dotSize};
          background: ${color || '#409eff'};
          border-radius: 50%;
          animation: engine-loading-dots 1.4s ease-in-out infinite both;
          animation-delay: -0.32s;
        "></div>
        <div style="
          width: ${dotSize};
          height: ${dotSize};
          background: ${color || '#409eff'};
          border-radius: 50%;
          animation: engine-loading-dots 1.4s ease-in-out infinite both;
          animation-delay: -0.16s;
        "></div>
        <div style="
          width: ${dotSize};
          height: ${dotSize};
          background: ${color || '#409eff'};
          border-radius: 50%;
          animation: engine-loading-dots 1.4s ease-in-out infinite both;
        "></div>
      </div>
      <style>
        @keyframes engine-loading-dots {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      </style>
    `
  }

  private createPulseSpinner(size: string, color?: string): string {
    return `
      <div style="
        width: ${size};
        height: ${size};
        background: ${color || '#409eff'};
        border-radius: 50%;
        animation: engine-loading-pulse 1.5s ease-in-out infinite;
      "></div>
      <style>
        @keyframes engine-loading-pulse {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(1); opacity: 0; }
        }
      </style>
    `
  }

  private createBounceSpinner(size: string, color?: string): string {
    const ballSize = `calc(${size} / 3)`
    return `
      <div style="display: flex; gap: 2px;">
        <div style="
          width: ${ballSize};
          height: ${ballSize};
          background: ${color || '#409eff'};
          border-radius: 50%;
          animation: engine-loading-bounce 1.4s ease-in-out infinite both;
          animation-delay: -0.32s;
        "></div>
        <div style="
          width: ${ballSize};
          height: ${ballSize};
          background: ${color || '#409eff'};
          border-radius: 50%;
          animation: engine-loading-bounce 1.4s ease-in-out infinite both;
          animation-delay: -0.16s;
        "></div>
        <div style="
          width: ${ballSize};
          height: ${ballSize};
          background: ${color || '#409eff'};
          border-radius: 50%;
          animation: engine-loading-bounce 1.4s ease-in-out infinite both;
        "></div>
      </div>
      <style>
        @keyframes engine-loading-bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      </style>
    `
  }
}

// 创建Vue指令
export const vLoading = defineDirective('loading', {
  mounted(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = new LoadingDirective()
    directive.mounted(el, binding)

    if (!el._engineDirectives) {
      el._engineDirectives = new Map()
    }
    el._engineDirectives.set('loading', directive)
  },

  updated(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'loading'
    ) as unknown as LoadingDirective
    if (directive) {
      directive.updated(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    const directive = el._engineDirectives?.get(
      'loading'
    ) as unknown as LoadingDirective
    if (directive) {
      directive.unmounted(el)
      el._engineDirectives?.delete('loading')
    }
  },
})

// 扩展HTMLElement类型
declare global {
  interface HTMLElement {
    _loadingConfig?: LoadingOptions
    _loadingElement?: HTMLElement
    _originalPosition?: string
    _scrollLocked?: boolean
  }
}

// 导出指令实例
export const loadingDirective = new LoadingDirective()

// 使用示例
/*
<template>
  <!-- 基础用法 -->
  <div v-loading="isLoading" style="height: 200px;">
    内容区域
  </div>

  <!-- 自定义文本和样式 -->
  <div v-loading="{
    loading: isLoading,
    text: '数据加载中...',
    spinner: 'dots',
    size: 'large',
    color: '#ff6b6b'
  }">
    自定义加载样式
  </div>

  <!-- 全屏加载 -->
  <button v-loading="{
    loading: isFullscreenLoading,
    text: '处理中，请稍候...',
    fullscreen: true,
    background: 'rgba(0, 0, 0, 0.8)',
    color: '#fff'
  }">
    全屏加载
  </button>

  <!-- 指定目标元素 -->
  <div v-loading="{
    loading: isTargetLoading,
    target: '.target-container'
  }">
    指定目标加载
  </div>
</template>

<script setup>
import { ref } from 'vue'

const isLoading = ref(false)
const isFullscreenLoading = ref(false)
const isTargetLoading = ref(false)

const startLoading = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 3000)
}
</script>
*/
