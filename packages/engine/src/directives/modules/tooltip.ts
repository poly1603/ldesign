/**
 * 工具提示指令
 * 鼠标悬停时显示提示信息
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective } from '../base/vue-directive-adapter'

export interface TooltipOptions {
  content?: string
  placement?:
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'
  | 'right-start'
  | 'right-end'
  trigger?: 'hover' | 'click' | 'focus' | 'manual'
  delay?: number | { show: number; hide: number }
  offset?: number
  disabled?: boolean
  theme?: 'dark' | 'light' | 'custom'
  maxWidth?: string
  zIndex?: number
  arrow?: boolean
  customClass?: string
  html?: boolean
  onShow?: (tooltip: HTMLElement) => void
  onHide?: (tooltip: HTMLElement) => void
}

export class TooltipDirective extends DirectiveBase {
  private logger = getLogger('TooltipDirective')

  private static tooltipContainer?: HTMLElement

  constructor() {
    super({
      name: 'tooltip',
      description: '工具提示指令，显示悬浮提示信息',
      version: '1.0.0',
      category: 'ui',
      tags: ['tooltip', 'popover', 'ui', 'feedback'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    // 存储配置
    el._tooltipConfig = config

    // 如果未禁用，绑定事件
    if (!config.disabled) {
      this.bindEvents(el, config)
    }

    this.log('Tooltip directive mounted')
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)
    const oldConfig = el._tooltipConfig

    // 更新配置
    el._tooltipConfig = config

    // 如果内容改变，更新tooltip
    if (oldConfig?.content !== config.content && el._tooltipElement) {
      this.updateTooltipContent(el._tooltipElement, config)
    }

    // 如果禁用状态改变，重新绑定事件
    if (oldConfig?.disabled !== config.disabled) {
      this.unbindEvents(el)
      if (!config.disabled) {
        this.bindEvents(el, config)
      }
    }
  }

  public unmounted(el: HTMLElement): void {
    this.hideTooltip(el)
    this.unbindEvents(el)
    delete el._tooltipConfig

    this.log('Tooltip directive unmounted')
  }

  private parseConfig(binding: VueDirectiveBinding): TooltipOptions {
    const value = binding.value

    if (typeof value === 'string') {
      const argPlacement = binding.arg as TooltipOptions['placement'] | undefined
      return {
        content: value,
        placement: argPlacement ?? 'top',
      }
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Partial<TooltipOptions> & { title?: string }
      const argPlacement = binding.arg as TooltipOptions['placement'] | undefined
      return {
        content: obj.content || obj.title,
        placement: obj.placement || argPlacement || 'top',
        trigger: obj.trigger || 'hover',
        delay: obj.delay || { show: 100, hide: 100 },
        offset: obj.offset ?? 8,
        disabled: obj.disabled ?? false,
        theme: obj.theme || 'dark',
        maxWidth: obj.maxWidth || '200px',
        zIndex: obj.zIndex ?? 3000,
        arrow: obj.arrow !== false,
        customClass: obj.customClass,
        html: obj.html ?? false,
        onShow: obj.onShow,
        onHide: obj.onHide,
      }
    }

    return {
      content: '',
      placement: 'top',
      trigger: 'hover',
      delay: { show: 100, hide: 100 },
      offset: 8,
      theme: 'dark',
      maxWidth: '200px',
      zIndex: 3000,
      arrow: true,
    }
  }

  private bindEvents(el: HTMLElement, config: TooltipOptions): void {
    const showDelay =
      typeof config.delay === 'number'
        ? config.delay
        : config.delay?.show || 100
    const hideDelay =
      typeof config.delay === 'number'
        ? config.delay
        : config.delay?.hide || 100

    switch (config.trigger) {
      case 'hover':
        this.addEventListener(el, 'mouseenter', () => {
          el._tooltipShowTimer = window.setTimeout(() => {
            this.showTooltip(el, config)
          }, showDelay)
        })

        this.addEventListener(el, 'mouseleave', () => {
          if (el._tooltipShowTimer) {
            clearTimeout(el._tooltipShowTimer)
            delete el._tooltipShowTimer
          }

          el._tooltipHideTimer = window.setTimeout(() => {
            this.hideTooltip(el)
          }, hideDelay)
        })
        break

      case 'click':
        this.addEventListener(el, 'click', event => {
          event.preventDefault()
          if (el._tooltipElement) {
            this.hideTooltip(el)
          } else {
            this.showTooltip(el, config)
          }
        })
        break

      case 'focus':
        this.addEventListener(el, 'focus', () => {
          this.showTooltip(el, config)
        })

        this.addEventListener(el, 'blur', () => {
          this.hideTooltip(el)
        })
        break
    }
  }

  private unbindEvents(el: HTMLElement): void {
    this.removeAllEventListeners(el)

    // 清理定时器
    if (el._tooltipShowTimer) {
      clearTimeout(el._tooltipShowTimer)
      delete el._tooltipShowTimer
    }

    if (el._tooltipHideTimer) {
      clearTimeout(el._tooltipHideTimer)
      delete el._tooltipHideTimer
    }
  }

  private showTooltip(el: HTMLElement, config: TooltipOptions): void {
    if (!config.content || el._tooltipElement) {
      return
    }

    // 创建tooltip容器
    if (!TooltipDirective.tooltipContainer) {
      TooltipDirective.tooltipContainer = document.createElement('div')
      TooltipDirective.tooltipContainer.className = 'engine-tooltip-container'
      document.body.appendChild(TooltipDirective.tooltipContainer)
    }

    // 创建tooltip元素
    const tooltipEl = this.createTooltipElement(config)
    el._tooltipElement = tooltipEl

    // 添加到容器
    TooltipDirective.tooltipContainer.appendChild(tooltipEl)

    // 计算位置
    this.positionTooltip(el, tooltipEl, config)

    // 显示动画
    requestAnimationFrame(() => {
      tooltipEl.style.opacity = '1'
      tooltipEl.style.transform = 'scale(1)'
    })

    // 触发显示回调
    config.onShow?.(tooltipEl)
  }

  private hideTooltip(el: HTMLElement): void {
    const tooltipEl = el._tooltipElement
    if (!tooltipEl) {
      return
    }

    const config = el._tooltipConfig

    // 隐藏动画
    tooltipEl.style.opacity = '0'
    tooltipEl.style.transform = 'scale(0.8)'

    setTimeout(() => {
      if (tooltipEl.parentNode) {
        tooltipEl.parentNode.removeChild(tooltipEl)
      }
      delete el._tooltipElement
    }, 200)

    // 触发隐藏回调
    config?.onHide?.(tooltipEl)
  }

  private createTooltipElement(config: TooltipOptions): HTMLElement {
    const tooltipEl = document.createElement('div')
    tooltipEl.className = `engine-tooltip engine-tooltip-${config.theme}`

    if (config.customClass) {
      tooltipEl.className += ` ${config.customClass}`
    }

    // 设置基础样式
    Object.assign(tooltipEl.style, {
      position: 'absolute',
      maxWidth: config.maxWidth,
      padding: '8px 12px',
      borderRadius: '4px',
      fontSize: '12px',
      lineHeight: '1.4',
      wordWrap: 'break-word',
      zIndex: config.zIndex?.toString(),
      opacity: '0',
      transform: 'scale(0.8)',
      transformOrigin: 'center',
      transition: 'opacity 0.2s ease, transform 0.2s ease',
      pointerEvents: 'none',
    })

    // 设置主题样式
    this.applyThemeStyles(tooltipEl, config.theme!)

    // 设置内容
    this.updateTooltipContent(tooltipEl, config)

    // 添加箭头
    if (config.arrow) {
      const arrowEl = document.createElement('div')
      arrowEl.className = 'engine-tooltip-arrow'
      this.styleArrow(arrowEl, config.theme!)
      tooltipEl.appendChild(arrowEl)
    }

    return tooltipEl
  }

  private updateTooltipContent(
    tooltipEl: HTMLElement,
    config: TooltipOptions
  ): void {
    const contentEl =
      tooltipEl.querySelector('.engine-tooltip-content') || tooltipEl

    if (config.html) {
      contentEl.innerHTML = config.content || ''
    } else {
      contentEl.textContent = config.content || ''
    }
  }

  private applyThemeStyles(tooltipEl: HTMLElement, theme: string): void {
    switch (theme) {
      case 'dark':
        Object.assign(tooltipEl.style, {
          background: '#303133',
          color: '#fff',
          border: '1px solid #303133',
        })
        break
      case 'light':
        Object.assign(tooltipEl.style, {
          background: '#fff',
          color: '#606266',
          border: '1px solid #e4e7ed',
          boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
        })
        break
    }
  }

  private styleArrow(arrowEl: HTMLElement, theme: string): void {
    Object.assign(arrowEl.style, {
      position: 'absolute',
      width: '0',
      height: '0',
      borderStyle: 'solid',
    })

    const borderColor = theme === 'dark' ? '#303133' : '#e4e7ed'
    const backgroundColor = theme === 'dark' ? '#303133' : '#fff'

    // 箭头样式将在定位时设置
    arrowEl.dataset.theme = theme
    arrowEl.dataset.borderColor = borderColor
    arrowEl.dataset.backgroundColor = backgroundColor
  }

  private positionTooltip(
    el: HTMLElement,
    tooltipEl: HTMLElement,
    config: TooltipOptions
  ): void {
    const rect = el.getBoundingClientRect()
    const tooltipRect = tooltipEl.getBoundingClientRect()
    const offset = config.offset || 8

    let top = 0
    let left = 0

    // 根据placement计算位置
    switch (config.placement) {
      case 'top':
        top = rect.top - tooltipRect.height - offset
        left = rect.left + (rect.width - tooltipRect.width) / 2
        break
      case 'bottom':
        top = rect.bottom + offset
        left = rect.left + (rect.width - tooltipRect.width) / 2
        break
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2
        left = rect.left - tooltipRect.width - offset
        break
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2
        left = rect.right + offset
        break
      // 更多placement选项...
    }

    // 边界检测和调整
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }

    if (left < 0) left = 8
    if (left + tooltipRect.width > viewport.width) {
      left = viewport.width - tooltipRect.width - 8
    }
    if (top < 0) top = 8
    if (top + tooltipRect.height > viewport.height) {
      top = viewport.height - tooltipRect.height - 8
    }

    // 设置位置
    tooltipEl.style.top = `${top + window.scrollY}px`
    tooltipEl.style.left = `${left + window.scrollX}px`

    // 设置箭头位置
    if (config.arrow) {
      this.positionArrow(tooltipEl, config.placement!, rect, { top, left })
    }
  }

  private positionArrow(
    tooltipEl: HTMLElement,
    placement: string,
    _targetRect: DOMRect,
    _tooltipPos: { top: number; left: number }
  ): void {
    const arrowEl = tooltipEl.querySelector(
      '.engine-tooltip-arrow'
    ) as HTMLElement
    if (!arrowEl) return

    const borderColor = arrowEl.dataset.borderColor

    // 重置箭头样式
    Object.assign(arrowEl.style, {
      top: 'auto',
      left: 'auto',
      right: 'auto',
      bottom: 'auto',
      borderWidth: '0',
    })

    switch (placement) {
      case 'top':
        Object.assign(arrowEl.style, {
          bottom: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '6px 6px 0 6px',
          borderColor: `${borderColor} transparent transparent transparent`,
        })
        break
      case 'bottom':
        Object.assign(arrowEl.style, {
          top: '-6px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderWidth: '0 6px 6px 6px',
          borderColor: `transparent transparent ${borderColor} transparent`,
        })
        break
      case 'left':
        Object.assign(arrowEl.style, {
          right: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 0 6px 6px',
          borderColor: `transparent transparent transparent ${borderColor}`,
        })
        break
      case 'right':
        Object.assign(arrowEl.style, {
          left: '-6px',
          top: '50%',
          transform: 'translateY(-50%)',
          borderWidth: '6px 6px 6px 0',
          borderColor: `transparent ${borderColor} transparent transparent`,
        })
        break
    }
  }
}

// 创建Vue指令
export const vTooltip = defineDirective('tooltip', {
  mounted(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = new TooltipDirective()
    directive.mounted(el, binding)

    if (!el._engineDirectives) {
      el._engineDirectives = new Map()
    }
    el._engineDirectives.set('tooltip', directive)
  },

  updated(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'tooltip'
    ) as unknown as TooltipDirective
    if (directive) {
      directive.updated(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    const directive = el._engineDirectives?.get(
      'tooltip'
    ) as unknown as TooltipDirective
    if (directive) {
      directive.unmounted(el)
      el._engineDirectives?.delete('tooltip')
    }
  },
})

// 扩展HTMLElement类型
declare global {
  interface HTMLElement {
    _tooltipConfig?: TooltipOptions
    _tooltipElement?: HTMLElement
    _tooltipShowTimer?: number
    _tooltipHideTimer?: number
  }
}

// 导出指令实例
export const tooltipDirective = new TooltipDirective()

// 使用示例
/*
<template>
  <!-- 基础用法 -->
  <button v-tooltip="'这是一个提示'">悬停显示提示</button>

  <!-- 指定位置 -->
  <button v-tooltip:bottom="'底部提示'">底部提示</button>

  <!-- 完整配置 -->
  <button v-tooltip="{
    content: '这是详细的提示信息',
    placement: 'right',
    trigger: 'click',
    theme: 'light',
    delay: { show: 200, hide: 100 },
    maxWidth: '300px',
    arrow: true,
    onShow: handleTooltipShow,
    onHide: handleTooltipHide
  }">
    点击显示提示
  </button>

  <!-- HTML内容 -->
  <span v-tooltip="{
    content: '<strong>粗体文本</strong><br>换行内容',
    html: true,
    theme: 'light'
  }">
    HTML提示
  </span>

  <!-- 禁用状态 -->
  <button v-tooltip="{
    content: '禁用的提示',
    disabled: isDisabled
  }">
    条件提示
  </button>
</template>

<script setup>
import { ref } from 'vue'

import { getLogger } from '../../logger/unified-logger';

const isDisabled = ref(false)

const handleTooltipShow = (tooltip) => {
  this.logger.debug('提示显示:', tooltip)
}

const handleTooltipHide = (tooltip) => {
  this.logger.debug('提示隐藏:', tooltip)
}
</script>
*/
