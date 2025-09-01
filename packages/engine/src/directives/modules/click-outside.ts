/**
 * 点击外部区域指令
 * 当用户点击元素外部时触发回调
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface ClickOutsideOptions {
  handler: (event: Event) => void
  exclude?: string[] | HTMLElement[]
  capture?: boolean
  disabled?: boolean
}

export class ClickOutsideDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'click-outside',
      description: '点击元素外部时触发回调',
      version: '1.0.0',
      category: 'interaction',
      tags: ['click', 'outside', 'interaction'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (!config.handler || typeof config.handler !== 'function') {
      this.warn('click-outside directive requires a handler function')
      return
    }

    const handler = (event: Event) => {
      if (config.disabled) {
        return
      }

      const target = event.target as Node

      // 检查点击是否在元素内部
      if (el === target || el.contains(target)) {
        return
      }

      // 检查排除列表
      if (config.exclude) {
        const excludeElements = Array.isArray(config.exclude)
          ? config.exclude
          : [config.exclude]

        for (const exclude of excludeElements) {
          if (typeof exclude === 'string') {
            const excludeEl = document.querySelector(exclude)
            if (
              excludeEl &&
              (excludeEl === target || excludeEl.contains(target))
            ) {
              return
            }
          } else if (exclude instanceof HTMLElement) {
            if (exclude === target || exclude.contains(target)) {
              return
            }
          }
        }
      }

      // 触发回调
      config.handler(event)
    }

    // 存储处理器
    el._clickOutsideHandler = handler

    // 添加事件监听器
    document.addEventListener('click', handler, config.capture || false)

    this.log('Click outside directive mounted')
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    // 如果配置改变，重新绑定
    if (directiveUtils.isValueChanged(binding)) {
      this.unmounted(el)
      this.mounted(el, binding)
    }
  }

  public unmounted(el: HTMLElement): void {
    if (el._clickOutsideHandler) {
      document.removeEventListener('click', el._clickOutsideHandler)
      delete el._clickOutsideHandler
    }

    this.log('Click outside directive unmounted')
  }

  private parseConfig(binding: VueDirectiveBinding): ClickOutsideOptions {
    const value = binding.value

    if (typeof value === 'function') {
      return { handler: value }
    }

    if (typeof value === 'object' && value !== null) {
      return {
        handler: value.handler || value,
        exclude: value.exclude,
        capture: value.capture,
        disabled: value.disabled,
      }
    }

    // 返回一个标记为无效的处理器
    return { handler: null as any }
  }
}

// 创建Vue指令
export const vClickOutside = defineDirective('click-outside', {
  mounted(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = new ClickOutsideDirective()
    directive.mounted(el, binding)

    // 存储指令实例
    if (!el._engineDirectives) {
      el._engineDirectives = new Map()
    }
    el._engineDirectives.set('click-outside', directive)
  },

  updated(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'click-outside'
    ) as unknown as ClickOutsideDirective
    if (directive) {
      directive.updated(el, binding)
    }
  },

  unmounted(el: HTMLElement, _binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'click-outside'
    ) as unknown as ClickOutsideDirective
    if (directive) {
      directive.unmounted(el)
      el._engineDirectives?.delete('click-outside')
    }
  },
})

// 扩展HTMLElement类型
declare global {
  interface HTMLElement {
    _clickOutsideHandler?: (event: Event) => void
  }
}

// 导出指令实例
export const clickOutsideDirective = new ClickOutsideDirective()

// 使用示例
/*
<template>
  <!-- 基础用法 -->
  <div v-click-outside="handleClickOutside">
    点击外部关闭
  </div>

  <!-- 配置用法 -->
  <div v-click-outside="{
    handler: handleClickOutside,
    exclude: ['.exclude-element'],
    capture: true,
    disabled: isDisabled
  }">
    高级配置
  </div>
</template>

<script setup>
const handleClickOutside = (event) => {
  console.log('Clicked outside:', event)
}

const isDisabled = ref(false)
</script>
*/
