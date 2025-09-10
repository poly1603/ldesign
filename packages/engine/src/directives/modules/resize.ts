/**
 * 元素大小监听指令
 * 监听元素大小变化并触发回调
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective } from '../base/vue-directive-adapter'

export interface ResizeOptions {
  callback: (entry: ResizeObserverEntry) => void
  throttle?: number
  debounce?: number
  immediate?: boolean
  disabled?: boolean
  box?: 'content-box' | 'border-box' | 'device-pixel-content-box'
}

export interface ResizeInfo {
  width: number
  height: number
  contentWidth: number
  contentHeight: number
  borderBoxWidth: number
  borderBoxHeight: number
  devicePixelContentBoxWidth?: number
  devicePixelContentBoxHeight?: number
}

export class ResizeDirective extends DirectiveBase {
  private static observer?: ResizeObserver
  private static observedElements = new WeakMap<HTMLElement, ResizeOptions>()

  constructor() {
    super({
      name: 'resize',
      description: '元素大小监听指令，监听元素尺寸变化',
      version: '1.0.0',
      category: 'utility',
      tags: ['resize', 'observer', 'responsive', 'utility'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (!config.callback || typeof config.callback !== 'function') {
      this.warn('resize directive requires a callback function')
      return
    }

    // 存储配置
    ResizeDirective.observedElements.set(el, config)

    // 如果未禁用，开始观察
    if (!config.disabled) {
      this.startObserving(el, config)
    }

    // 如果需要立即触发
    if (config.immediate) {
      this.triggerImmediate(el, config)
    }

    this.log('Resize directive mounted')
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)
    const oldConfig = ResizeDirective.observedElements.get(el)

    // 更新配置
    ResizeDirective.observedElements.set(el, config)

    // 如果禁用状态改变，重新设置观察
    if (oldConfig?.disabled !== config.disabled) {
      this.stopObserving(el)
      if (!config.disabled) {
        this.startObserving(el, config)
      }
    }
  }

  public unmounted(el: HTMLElement): void {
    this.stopObserving(el)
    ResizeDirective.observedElements.delete(el)

    this.log('Resize directive unmounted')
  }

  private parseConfig(binding: VueDirectiveBinding): ResizeOptions {
    const value = binding.value

    if (typeof value === 'function') {
      return {
        callback: value as (entry: ResizeObserverEntry) => void,
        throttle: 0,
        debounce: 0,
        immediate: false,
        disabled: false,
        box: 'content-box',
      }
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Partial<ResizeOptions> & { handler?: (entry: ResizeObserverEntry) => void }
      return {
        callback: obj.callback || obj.handler || (() => { }),
        throttle: obj.throttle ?? 0,
        debounce: obj.debounce ?? 0,
        immediate: obj.immediate ?? false,
        disabled: obj.disabled ?? false,
        box: obj.box || 'content-box',
      }
    }

    return {
      callback: () => { },
      throttle: 0,
      debounce: 0,
      immediate: false,
      disabled: false,
      box: 'content-box',
    }
  }

  private startObserving(el: HTMLElement, config: ResizeOptions): void {
    // 创建或获取观察器
    if (!ResizeDirective.observer) {
      ResizeDirective.observer = this.createObserver()
    }

    // 开始观察
    ResizeDirective.observer.observe(el, {
      box: config.box,
    })
  }

  private stopObserving(el: HTMLElement): void {
    if (ResizeDirective.observer) {
      ResizeDirective.observer.unobserve(el)
    }

    // 清理定时器
    this.clearTimers(el)
  }

  private createObserver(): ResizeObserver {
    return new ResizeObserver(entries => {
      entries.forEach(entry => {
        const el = entry.target as HTMLElement
        const config = ResizeDirective.observedElements.get(el)

        if (config && !config.disabled) {
          this.handleResize(el, entry, config)
        }
      })
    })
  }

  private handleResize(
    el: HTMLElement,
    entry: ResizeObserverEntry,
    config: ResizeOptions
  ): void {
    // 清理之前的定时器
    this.clearTimers(el)

    const callback = () => {
      try {
        config.callback(entry)
      } catch (error) {
        this.error_log('Resize callback error:', error)
      }
    }

    // 应用防抖或节流
    if (config.debounce && config.debounce > 0) {
      el._resizeDebounceTimer = window.setTimeout(callback, config.debounce)
    } else if (config.throttle && config.throttle > 0) {
      const now = Date.now()
      const lastTime = el._resizeLastTime || 0

      if (now - lastTime >= config.throttle) {
        el._resizeLastTime = now
        callback()
      } else {
        el._resizeThrottleTimer = window.setTimeout(
          () => {
            el._resizeLastTime = Date.now()
            callback()
          },
          config.throttle - (now - lastTime)
        )
      }
    } else {
      callback()
    }
  }

  private triggerImmediate(el: HTMLElement, config: ResizeOptions): void {
    // 创建模拟的 ResizeObserverEntry
    const rect = el.getBoundingClientRect()
    const computedStyle = getComputedStyle(el)

    const paddingLeft = Number.parseFloat(computedStyle.paddingLeft) || 0
    const paddingRight = Number.parseFloat(computedStyle.paddingRight) || 0
    const paddingTop = Number.parseFloat(computedStyle.paddingTop) || 0
    const paddingBottom = Number.parseFloat(computedStyle.paddingBottom) || 0

    const borderLeft = Number.parseFloat(computedStyle.borderLeftWidth) || 0
    const borderRight = Number.parseFloat(computedStyle.borderRightWidth) || 0
    const borderTop = Number.parseFloat(computedStyle.borderTopWidth) || 0
    const borderBottom = Number.parseFloat(computedStyle.borderBottomWidth) || 0

    const contentWidth =
      rect.width - paddingLeft - paddingRight - borderLeft - borderRight
    const contentHeight =
      rect.height - paddingTop - paddingBottom - borderTop - borderBottom

    const mockEntry = {
      target: el,
      contentRect: {
        x: paddingLeft,
        y: paddingTop,
        width: contentWidth,
        height: contentHeight,
        top: paddingTop,
        right: paddingLeft + contentWidth,
        bottom: paddingTop + contentHeight,
        left: paddingLeft,
        toJSON: () => ({}),
      },
      borderBoxSize: [
        {
          inlineSize: rect.width,
          blockSize: rect.height,
        },
      ],
      contentBoxSize: [
        {
          inlineSize: contentWidth,
          blockSize: contentHeight,
        },
      ],
      devicePixelContentBoxSize: [
        {
          inlineSize: contentWidth * window.devicePixelRatio,
          blockSize: contentHeight * window.devicePixelRatio,
        },
      ],
    } as ResizeObserverEntry

    try {
      config.callback(mockEntry)
    } catch (error) {
      this.error_log('Immediate resize callback error:', error)
    }
  }

  private clearTimers(el: HTMLElement): void {
    if (el._resizeDebounceTimer) {
      clearTimeout(el._resizeDebounceTimer)
      delete el._resizeDebounceTimer
    }

    if (el._resizeThrottleTimer) {
      clearTimeout(el._resizeThrottleTimer)
      delete el._resizeThrottleTimer
    }
  }

  // 工具方法：从 ResizeObserverEntry 提取尺寸信息
  static getResizeInfo(entry: ResizeObserverEntry): ResizeInfo {
    const contentBoxSize = entry.contentBoxSize?.[0]
    const borderBoxSize = entry.borderBoxSize?.[0]
    const devicePixelContentBoxSize = entry.devicePixelContentBoxSize?.[0]

    return {
      width: entry.contentRect.width,
      height: entry.contentRect.height,
      contentWidth: contentBoxSize?.inlineSize || entry.contentRect.width,
      contentHeight: contentBoxSize?.blockSize || entry.contentRect.height,
      borderBoxWidth: borderBoxSize?.inlineSize || 0,
      borderBoxHeight: borderBoxSize?.blockSize || 0,
      devicePixelContentBoxWidth: devicePixelContentBoxSize?.inlineSize,
      devicePixelContentBoxHeight: devicePixelContentBoxSize?.blockSize,
    }
  }
}

// 创建Vue指令
export const vResize = defineDirective('resize', {
  mounted(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = new ResizeDirective()
    directive.mounted(el, binding)

    if (!el._engineDirectives) {
      el._engineDirectives = new Map()
    }
    el._engineDirectives.set('resize', directive)
  },

  updated(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'resize'
    ) as unknown as ResizeDirective
    if (directive) {
      directive.updated(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    const directive = el._engineDirectives?.get(
      'resize'
    ) as unknown as ResizeDirective
    if (directive) {
      directive.unmounted(el)
      el._engineDirectives?.delete('resize')
    }
  },
})

// 扩展HTMLElement类型
declare global {
  interface HTMLElement {
    _resizeDebounceTimer?: number
    _resizeThrottleTimer?: number
    _resizeLastTime?: number
  }
}

// 导出指令实例和工具函数
export const resizeDirective = new ResizeDirective()
export const getResizeInfo = ResizeDirective.getResizeInfo

// 使用示例
/*
<template>
  <!-- 基础用法 -->
  <div v-resize="handleResize" class="resizable-box">
    调整我的大小
  </div>

  <!-- 防抖处理 -->
  <div v-resize="{
    callback: handleResizeDebounced,
    debounce: 300
  }" class="debounced-resize">
    防抖大小监听
  </div>

  <!-- 节流处理 -->
  <div v-resize="{
    callback: handleResizeThrottled,
    throttle: 100
  }" class="throttled-resize">
    节流大小监听
  </div>

  <!-- 完整配置 -->
  <div v-resize="{
    callback: handleResizeComplete,
    throttle: 50,
    immediate: true,
    box: 'border-box',
    disabled: isDisabled
  }" class="complete-resize">
    完整配置监听
  </div>

  <!-- 响应式容器 -->
  <div v-resize="handleContainerResize" class="responsive-container">
    <div class="content" :class="containerClass">
      响应式内容
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getResizeInfo } from '@/directives/modules/resize'

const isDisabled = ref(false)
const containerClass = ref('')

const handleResize = (entry) => {
  const info = getResizeInfo(entry)
  console.log('元素大小变化:', info)
}

const handleResizeDebounced = (entry) => {
  console.log('防抖大小变化:', entry.contentRect)
}

const handleResizeThrottled = (entry) => {
  console.log('节流大小变化:', entry.contentRect)
}

const handleResizeComplete = (entry) => {
  const { width, height } = getResizeInfo(entry)
  console.log('完整配置大小变化:', { width, height })
}

const handleContainerResize = (entry) => {
  const { width } = getResizeInfo(entry)

  if (width < 300) {
    containerClass.value = 'small'
  } else if (width < 600) {
    containerClass.value = 'medium'
  } else {
    containerClass.value = 'large'
  }
}
</script>

<style>
.resizable-box {
  width: 200px;
  height: 100px;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  resize: both;
  overflow: auto;
  border: 2px solid #333;
}

.responsive-container {
  width: 100%;
  min-height: 100px;
  border: 1px solid #ddd;
  padding: 20px;
  resize: horizontal;
  overflow: auto;
}

.content.small {
  font-size: 12px;
  background: #ffebee;
}

.content.medium {
  font-size: 14px;
  background: #e3f2fd;
}

.content.large {
  font-size: 16px;
  background: #e8f5e8;
}
</style>
*/
