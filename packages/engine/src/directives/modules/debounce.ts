/**
 * 防抖指令
 * 防止事件频繁触发，在指定时间内只执行最后一次
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { getLogger } from '../../logger/unified-logger'
import { DirectiveBase } from '../base/directive-base'

import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface DebounceOptions {
  handler: (event: Event) => void
  delay?: number
  immediate?: boolean
  maxWait?: number
  event?: string
}

export class DebounceDirective extends DirectiveBase {
  private logger = getLogger('DebounceDirective')

  constructor() {
    super({
      name: 'debounce',
      description: '防抖处理，延迟执行函数',
      version: '1.0.0',
      category: 'performance',
      tags: ['debounce', 'performance', 'optimization'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (!config.handler || typeof config.handler !== 'function') {
      this.warn('debounce directive requires a handler function')
      return
    }

    const debounceHandler = this.createDebounceHandler(config)
    const event = config.event || binding.arg || 'click'

    // 存储处理器和配置
    el._debounceHandler = debounceHandler
    el._debounceConfig = config

    // 添加事件监听器
    this.addEventListener(el, event, debounceHandler)

    this.log(`Debounce directive mounted for event: ${event}`)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    if (directiveUtils.isValueChanged(binding)) {
      this.unmounted(el)
      this.mounted(el, binding)
    }
  }

  public unmounted(el: HTMLElement): void {
    // 清理定时器
    if (el._debounceTimer) {
      clearTimeout(el._debounceTimer)
      delete el._debounceTimer
    }

    if (el._debounceMaxTimer) {
      clearTimeout(el._debounceMaxTimer)
      delete el._debounceMaxTimer
    }

    // 清理事件监听器
    this.removeAllEventListeners(el)

    // 清理存储的数据
    delete el._debounceHandler
    delete el._debounceConfig
    delete el._debounceLastCallTime

    this.log('Debounce directive unmounted')
  }

  private parseConfig(binding: VueDirectiveBinding): DebounceOptions {
    const value = binding.value

    if (typeof value === 'function') {
      return {
        handler: value as EventListener,
        delay: 300,
        immediate: false,
      }
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Partial<DebounceOptions> & { callback?: EventListener; event?: string }
      return {
        handler: obj.handler || obj.callback || ((_e: Event) => { }),
        delay: obj.delay ?? 300,
        immediate: obj.immediate ?? false,
        maxWait: obj.maxWait,
        event: obj.event,
      }
    }

    return {
      handler: (_e: Event) => { },
      delay: 300,
      immediate: false,
    }
  }

  private createDebounceHandler(config: DebounceOptions): EventListener {
    return (event: Event) => {
      const el = event.currentTarget as HTMLElement
      const now = Date.now()

      // 清除之前的定时器
      if (el._debounceTimer) {
        clearTimeout(el._debounceTimer)
      }

      // 记录首次调用时间
      if (!el._debounceLastCallTime) {
        el._debounceLastCallTime = now
      }

      // 立即执行逻辑
      if (config.immediate && !el._debounceTimer) {
        config.handler.call(el, event)

        if (!config.maxWait) {
          return
        }
      }

      // 最大等待时间逻辑
      if (config.maxWait) {
        const timeSinceFirstCall = now - el._debounceLastCallTime!

        if (timeSinceFirstCall >= config.maxWait) {
          // 达到最大等待时间，立即执行
          config.handler.call(el, event)
          el._debounceLastCallTime = now
          return
        } else {
          // 设置最大等待定时器
          if (!el._debounceMaxTimer) {
            el._debounceMaxTimer = window.setTimeout(() => {
              config.handler.call(el, event)
              el._debounceLastCallTime = Date.now()
              delete el._debounceMaxTimer
            }, config.maxWait - timeSinceFirstCall)
          }
        }
      }

      // 设置延迟执行定时器
      el._debounceTimer = window.setTimeout(() => {
        if (!config.immediate) {
          config.handler.call(el, event)
        }

        delete el._debounceTimer
        delete el._debounceLastCallTime

        if (el._debounceMaxTimer) {
          clearTimeout(el._debounceMaxTimer)
          delete el._debounceMaxTimer
        }
      }, config.delay)
    }
  }
}

// 创建Vue指令
export const vDebounce = defineDirective('debounce', {
  mounted(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = new DebounceDirective()
    directive.mounted(el, binding)

    if (!el._engineDirectives) {
      el._engineDirectives = new Map()
    }
    el._engineDirectives.set('debounce', directive)
  },

  updated(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'debounce'
    ) as unknown as DebounceDirective
    if (directive) {
      directive.updated(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    const directive = el._engineDirectives?.get(
      'debounce'
    ) as unknown as DebounceDirective
    if (directive) {
      directive.unmounted(el)
      el._engineDirectives?.delete('debounce')
    }
  },
})

// 扩展HTMLElement类型
declare global {
  interface HTMLElement {
    _debounceHandler?: EventListener
    _debounceConfig?: DebounceOptions
    _debounceTimer?: number
    _debounceMaxTimer?: number
    _debounceLastCallTime?: number
  }
}

// 导出指令实例
export const debounceDirective = new DebounceDirective()

// 使用示例
/*
<template>
  <!-- 基础用法 - 默认300ms延迟 -->
  <input v-debounce:input="handleInput" placeholder="防抖输入">

  <!-- 自定义延迟时间 -->
  <button v-debounce:click="{ handler: handleClick, delay: 500 }">
    500ms防抖点击
  </button>

  <!-- 立即执行 + 防抖 -->
  <button v-debounce="{
    handler: handleSubmit,
    delay: 1000,
    immediate: true
  }">
    立即执行防抖
  </button>

  <!-- 最大等待时间 -->
  <input v-debounce:input="{
    handler: handleSearch,
    delay: 300,
    maxWait: 1000
  }" placeholder="最大1秒必执行">

  <!-- 多事件防抖 -->
  <div v-debounce:mouseenter="{
    handler: handleHover,
    delay: 200
  }">
    鼠标悬停防抖
  </div>
</template>

<script setup>
const handleInput = (event) => {
  this.logger.debug('防抖输入:', event.target.value)
}

const handleClick = () => {
  this.logger.debug('防抖点击')
}

const handleSubmit = () => {
  this.logger.debug('提交表单')
}

const handleSearch = (event) => {
  this.logger.debug('搜索:', event.target.value)
}

const handleHover = () => {
  this.logger.debug('鼠标悬停')
}
</script>
*/
