/**
 * 节流指令
 * 限制事件触发频率，在指定时间内最多执行一次
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface ThrottleOptions {
  handler: (...args: any[]) => void
  delay?: number
  leading?: boolean
  trailing?: boolean
  event?: string
}

export class ThrottleDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'throttle',
      description: '节流处理，限制函数执行频率',
      version: '1.0.0',
      category: 'performance',
      tags: ['throttle', 'performance', 'optimization'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (!config.handler || typeof config.handler !== 'function') {
      this.warn('throttle directive requires a handler function')
      return
    }

    const throttleHandler = this.createThrottleHandler(config)
    const event = config.event || binding.arg || 'click'

    // 存储处理器和配置
    ;(el as any)._throttleHandler = throttleHandler
    el._throttleConfig = config

    // 添加事件监听器
    this.addEventListener(el, event, throttleHandler)

    this.log(`Throttle directive mounted for event: ${event}`)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    if (directiveUtils.isValueChanged(binding)) {
      this.unmounted(el)
      this.mounted(el, binding)
    }
  }

  public unmounted(el: HTMLElement): void {
    // 清理定时器
    if (el._throttleTimer) {
      clearTimeout(el._throttleTimer)
      delete el._throttleTimer
    }

    // 清理事件监听器
    this.removeAllEventListeners(el)

    // 清理存储的数据
    delete el._throttleHandler
    delete el._throttleConfig
    delete el._throttleLastTime
    delete el._throttleLastArgs

    this.log('Throttle directive unmounted')
  }

  private parseConfig(binding: VueDirectiveBinding): ThrottleOptions {
    const value = binding.value

    if (typeof value === 'function') {
      return {
        handler: value,
        delay: 300,
        leading: true,
        trailing: true,
      }
    }

    if (typeof value === 'object' && value !== null) {
      return {
        handler: value.handler || value.callback,
        delay: value.delay || 300,
        leading: value.leading !== false,
        trailing: value.trailing !== false,
        event: value.event,
      }
    }

    return {
      handler: () => {},
      delay: 300,
      leading: true,
      trailing: true,
    }
  }

  private createThrottleHandler(config: ThrottleOptions): EventListener {
    return (event: Event) => {
      const el = event.currentTarget as HTMLElement
      const now = Date.now()

      // 存储最新的参数
      el._throttleLastArgs = [event]

      // 首次调用
      if (!el._throttleLastTime) {
        if (config.leading) {
          config.handler.call(el, event)
          el._throttleLastTime = now
        } else {
          el._throttleLastTime = now
          this.scheduleTrailing(el, config)
        }
        return
      }

      const timeSinceLastCall = now - el._throttleLastTime

      // 在节流期间
      if (timeSinceLastCall < config.delay!) {
        // 如果支持trailing，安排尾部调用
        if (config.trailing) {
          this.scheduleTrailing(el, config)
        }
        return
      }

      // 超过节流时间，可以执行
      config.handler.call(el, event)
      el._throttleLastTime = now

      // 清除可能存在的尾部调用
      if (el._throttleTimer) {
        clearTimeout(el._throttleTimer)
        delete el._throttleTimer
      }
    }
  }

  private scheduleTrailing(el: HTMLElement, config: ThrottleOptions): void {
    // 清除之前的尾部调用
    if (el._throttleTimer) {
      clearTimeout(el._throttleTimer)
    }

    el._throttleTimer = window.setTimeout(
      () => {
        const now = Date.now()
        const timeSinceLastCall = now - el._throttleLastTime!

        if (timeSinceLastCall >= config.delay!) {
          // 执行尾部调用
          if (el._throttleLastArgs) {
            config.handler.apply(el, el._throttleLastArgs)
            el._throttleLastTime = now
          }
        }

        delete el._throttleTimer
      },
      config.delay! - (Date.now() - el._throttleLastTime!)
    )
  }
}

// 创建Vue指令
export const vThrottle = defineDirective('throttle', {
  mounted(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = new ThrottleDirective()
    directive.mounted(el, binding)

    if (!el._engineDirectives) {
      el._engineDirectives = new Map()
    }
    el._engineDirectives.set('throttle', directive)
  },

  updated(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'throttle'
    ) as unknown as ThrottleDirective
    if (directive) {
      directive.updated(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    const directive = el._engineDirectives?.get(
      'throttle'
    ) as unknown as ThrottleDirective
    if (directive) {
      directive.unmounted(el)
      el._engineDirectives?.delete('throttle')
    }
  },
})

// 扩展HTMLElement类型
declare global {
  interface HTMLElement {
    _throttleHandler?: (...args: unknown[]) => void
    _throttleConfig?: ThrottleOptions
    _throttleTimer?: number
    _throttleLastTime?: number
    _throttleLastArgs?: any[]
  }
}

// 导出指令实例
export const throttleDirective = new ThrottleDirective()

// 使用示例
/*
<template>
  <!-- 基础用法 - 默认300ms节流 -->
  <button v-throttle:click="handleClick">节流点击</button>

  <!-- 自定义节流时间 -->
  <div v-throttle:scroll="{ handler: handleScroll, delay: 100 }"
       style="height: 200px; overflow-y: auto;">
    滚动内容...
  </div>

  <!-- 只在开始时执行 -->
  <button v-throttle="{
    handler: handleSubmit,
    delay: 1000,
    leading: true,
    trailing: false
  }">
    只在开始执行
  </button>

  <!-- 只在结束时执行 -->
  <input v-throttle:input="{
    handler: handleInput,
    delay: 500,
    leading: false,
    trailing: true
  }" placeholder="只在结束执行">

  <!-- 鼠标移动节流 -->
  <div v-throttle:mousemove="{
    handler: handleMouseMove,
    delay: 16
  }" style="width: 300px; height: 200px; border: 1px solid #ccc;">
    鼠标移动区域
  </div>

  <!-- 窗口大小调整节流 -->
  <div v-throttle:resize="{
    handler: handleResize,
    delay: 250
  }">
    窗口大小调整
  </div>
</template>

<script setup>
const handleClick = () => {
  console.log('节流点击')
}

const handleScroll = (event) => {
  console.log('滚动位置:', event.target.scrollTop)
}

const handleSubmit = () => {
  console.log('提交表单')
}

const handleInput = (event) => {
  console.log('输入内容:', event.target.value)
}

const handleMouseMove = (event) => {
  console.log('鼠标位置:', event.clientX, event.clientY)
}

const handleResize = () => {
  console.log('窗口大小:', window.innerWidth, window.innerHeight)
}
</script>
*/
