/**
 * 元素大小监听指令
 * 监听元素尺寸变化并触发回调
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface ResizeOptions {
  callback?: (entry: ResizeObserverEntry) => void
  debounce?: number
  immediate?: boolean
  disabled?: boolean
}

export class ResizeDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'resize',
      description: '监听元素尺寸变化',
      version: '1.0.0',
      category: 'interaction',
      tags: ['resize', 'observer', 'dimension'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (config.disabled) {
      return
    }

    const observer = this.createObserver(el, config)
    directiveUtils.storeData(el, 'resize-observer', observer)
    directiveUtils.storeData(el, 'resize-config', config)

    observer.observe(el)
    this.log('Resize observer attached', el)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    const newConfig = this.parseConfig(binding)
    const oldConfig = directiveUtils.getData(el, 'resize-config') as ResizeOptions

    if (JSON.stringify(newConfig) === JSON.stringify(oldConfig)) {
      return
    }

    this.unmounted(el)

    if (!newConfig.disabled) {
      this.mounted(el, binding)
    }
  }

  public unmounted(el: HTMLElement): void {
    const observer = directiveUtils.getData(el, 'resize-observer') as ResizeObserver
    const timer = directiveUtils.getData(el, 'resize-timer') as number

    // 清理定时器
    if (timer) {
      clearTimeout(timer)
      directiveUtils.removeData(el, 'resize-timer')
    }

    // 断开并清理 ResizeObserver
    if (observer) {
      observer.unobserve(el) // 先取消观察
      observer.disconnect()   // 再断开连接
      directiveUtils.removeData(el, 'resize-observer')
    }

    // 清理配置数据
    directiveUtils.removeData(el, 'resize-config')
    
    // 清理元素引用
    if (el && typeof el === 'object') {
      (el as any).__resizeObserver = null
    }
    
    this.log('Resize observer detached', el)
  }

  private createObserver(el: HTMLElement, config: ResizeOptions): ResizeObserver {
    let isFirstCall = true

    const callback = (entries: ResizeObserverEntry[]): void => {
      if (!config.immediate && isFirstCall) {
        isFirstCall = false
        return
      }
      isFirstCall = false

      for (const entry of entries) {
        if (config.debounce && config.debounce > 0) {
          const timer = directiveUtils.getData(el, 'resize-timer') as number
          if (timer) {
            clearTimeout(timer)
          }

          const newTimer = window.setTimeout(() => {
            config.callback?.(entry)
            this.emitEvent(el, 'resize', {
              width: entry.contentRect.width,
              height: entry.contentRect.height,
              entry,
            })
          }, config.debounce)

          directiveUtils.storeData(el, 'resize-timer', newTimer)
        } else {
          config.callback?.(entry)
          this.emitEvent(el, 'resize', {
            width: entry.contentRect.width,
            height: entry.contentRect.height,
            entry,
          })
        }
      }
    }

    return new ResizeObserver(callback)
  }

  private parseConfig(binding: VueDirectiveBinding): ResizeOptions {
    const value = binding.value

    if (typeof value === 'function') {
      return { callback: value as (entry: ResizeObserverEntry) => void }
    }

    if (typeof value === 'object' && value !== null) {
      return value as ResizeOptions
    }

    return {}
  }

  private emitEvent(el: HTMLElement, eventName: string, detail: unknown): void {
    el.dispatchEvent(
      new CustomEvent(eventName, {
        detail,
        bubbles: true,
        cancelable: true,
      })
    )
  }

  public getExample(): string {
    return `
<!-- Basic resize detection -->
<div v-resize="onResize" class="resizable">
  Resize me!
</div>

<!-- With debounce -->
<div v-resize="{
  callback: onResize,
  debounce: 300
}" class="chart-container">
  Chart will re-render after resize
</div>

<!-- Immediate callback -->
<div v-resize="{
  callback: handleResize,
  immediate: true
}">
  Gets initial size immediately
</div>

<!-- Conditional monitoring -->
<div v-resize="{
  callback: onResize,
  disabled: !isMonitoring
}">
  Conditionally monitored element
</div>

<!-- Listen via event -->
<div 
  v-resize="{}"
  @resize="onResizeEvent"
>
  Listen to resize events
</div>

<script setup>
import { ref } from 'vue'

const isMonitoring = ref(true)

const onResize = (entry) => {
  
}

const handleResize = (entry) => {
  const { width, height } = entry.contentRect
  
}

const onResizeEvent = (event) => {
  
}
</script>

<style>
.resizable {
  resize: both;
  overflow: auto;
  border: 1px solid #ccc;
  padding: 20px;
  min-width: 200px;
  min-height: 100px;
}

.chart-container {
  width: 100%;
  height: 400px;
}
</style>
    `
  }
}

// Export the directive definition
export const vResize = defineDirective(new ResizeDirective())

// Export default for convenience
export default vResize
