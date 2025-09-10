/**
 * 复制到剪贴板指令
 * 点击元素时复制指定内容到剪贴板
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface CopyOptions {
  text?: string
  target?: string | HTMLElement
  onSuccess?: (text: string) => void
  onError?: (error: Error) => void
  successClass?: string
  errorClass?: string
  successDuration?: number
  fallback?: boolean
}

export class CopyDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'copy',
      description: '复制内容到剪贴板',
      version: '1.0.0',
      category: 'utility',
      tags: ['copy', 'clipboard', 'utility'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    const handler = async (event: Event) => {
      event.preventDefault()

      try {
        const textToCopy = this.getTextToCopy(el, config)

        if (!textToCopy) {
          throw new Error('No text to copy')
        }

        await this.copyToClipboard(textToCopy, config.fallback)

        // 成功回调
        config.onSuccess?.(textToCopy)

        // 添加成功样式
        if (config.successClass) {
          this.addClass(el, config.successClass)

          setTimeout(() => {
            this.removeClass(el, config.successClass!)
          }, config.successDuration || 1000)
        }

        this.log('Text copied successfully:', textToCopy)
      } catch (error) {
        const err = error as Error

        // 错误回调
        config.onError?.(err)

        // 添加错误样式
        if (config.errorClass) {
          this.addClass(el, config.errorClass)

          setTimeout(() => {
            this.removeClass(el, config.errorClass!)
          }, config.successDuration || 1000)
        }

        this.error_log('Failed to copy text:', err.message)
      }
    }

    // 添加点击事件
    this.addEventListener(el, 'click', handler)

    // 添加复制样式
    el.style.cursor = 'pointer'

    this.log('Copy directive mounted')
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    if (directiveUtils.isValueChanged(binding)) {
      this.unmounted(el)
      this.mounted(el, binding)
    }
  }

  public unmounted(el: HTMLElement): void {
    this.removeAllEventListeners(el)

    // 恢复样式
    el.style.cursor = ''

    this.log('Copy directive unmounted')
  }

  private parseConfig(binding: VueDirectiveBinding): CopyOptions {
    const value = binding.value

    if (typeof value === 'string') {
      return { text: value }
    }

    if (typeof value === 'object' && value !== null) {
      const obj = value as Partial<CopyOptions>
      return {
        text: obj.text,
        target: obj.target,
        onSuccess: obj.onSuccess,
        onError: obj.onError,
        successClass: obj.successClass || 'copy-success',
        errorClass: obj.errorClass || 'copy-error',
        successDuration: obj.successDuration,
        fallback: obj.fallback !== false,
      }
    }

    return {}
  }

  private getTextToCopy(el: HTMLElement, config: CopyOptions): string {
    // 优先使用配置中的文本
    if (config.text) {
      return config.text
    }

    // 使用目标元素的文本
    if (config.target) {
      const targetEl =
        typeof config.target === 'string'
          ? (document.querySelector(config.target) as HTMLElement)
          : config.target

      if (targetEl) {
        return this.getElementText(targetEl)
      }
    }

    // 使用当前元素的文本
    return this.getElementText(el)
  }

  private getElementText(el: HTMLElement): string {
    // 如果是输入元素，获取其值
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      return el.value
    }

    // 如果有data-copy属性，使用该属性值
    const dataCopy = el.getAttribute('data-copy')
    if (dataCopy) {
      return dataCopy
    }

    // 使用元素的文本内容
    return el.textContent || ''
  }

  private async copyToClipboard(text: string, fallback = true): Promise<void> {
    // 优先使用现代API
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text)
        return
      } catch (error) {
        if (!fallback) {
          throw error
        }
        // 如果现代API失败且允许fallback，继续使用传统方法
      }
    }

    // 传统方法
    if (fallback) {
      this.fallbackCopyToClipboard(text)
    } else {
      throw new Error('Clipboard API not available')
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'

    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      const successful = document.execCommand('copy')
      if (!successful) {
        throw new Error('execCommand copy failed')
      }
    } finally {
      document.body.removeChild(textArea)
    }
  }
}

// 创建Vue指令
export const vCopy = defineDirective('copy', {
  mounted(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = new CopyDirective()
    directive.mounted(el, binding)

    if (!el._engineDirectives) {
      el._engineDirectives = new Map()
    }
    el._engineDirectives.set('copy', directive)
  },

  updated(el: HTMLElement, binding: VueDirectiveBinding) {
    const directive = el._engineDirectives?.get(
      'copy'
    ) as unknown as CopyDirective
    if (directive) {
      directive.updated(el, binding)
    }
  },

  unmounted(el: HTMLElement) {
    const directive = el._engineDirectives?.get(
      'copy'
    ) as unknown as CopyDirective
    if (directive) {
      directive.unmounted(el)
      el._engineDirectives?.delete('copy')
    }
  },
})

// 导出指令实例
export const copyDirective = new CopyDirective()

// 使用示例
/*
<template>
  <!-- 基础用法 - 复制元素文本 -->
  <button v-copy>复制我</button>

  <!-- 复制指定文本 -->
  <button v-copy="'Hello World'">复制Hello World</button>

  <!-- 复制其他元素的内容 -->
  <button v-copy="{ target: '#target-element' }">复制目标元素</button>

  <!-- 完整配置 -->
  <button v-copy="{
    text: 'Custom text',
    onSuccess: handleSuccess,
    onError: handleError,
    successClass: 'copy-success',
    errorClass: 'copy-error',
    successDuration: 2000
  }">
    高级复制
  </button>

  <!-- 使用data-copy属性 -->
  <span v-copy data-copy="Secret text">点击复制隐藏文本</span>
</template>

<script setup>
const handleSuccess = (text) => {
  console.log('复制成功:', text)
}

const handleError = (error) => {
  console.error('复制失败:', error)
}
</script>

<style>
.copy-success {
  background-color: #4caf50;
  color: white;
}

.copy-error {
  background-color: #f44336;
  color: white;
}
</style>
*/
