/**
 * 复制到剪贴板指令
 * 点击元素时复制指定内容到剪贴板
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface CopyOptions {
  text?: string | (() => string)
  onSuccess?: (text: string) => void
  onError?: (error: Error) => void
  disabled?: boolean
  immediate?: boolean
}

export class CopyDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'copy',
      description: '点击复制内容到剪贴板',
      version: '1.0.0',
      category: 'interaction',
      tags: ['copy', 'clipboard', 'interaction'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    const handleClick = async () => {
      if (config.disabled) {
        return
      }

      try {
        const textToCopy = this.getText(config, el)
        await this.copyToClipboard(textToCopy)

        if (config.onSuccess) {
          config.onSuccess(textToCopy)
        }

        this.log(`Copied to clipboard: ${textToCopy}`)
      } catch (error) {
        const err = error as Error
        if (config.onError) {
          config.onError(err)
        }
        this.warn(`Failed to copy: ${err.message}`)
      }
    }

    // Store handler for cleanup
    directiveUtils.storeData(el, 'copy-handler', handleClick)

    // Add click listener
    el.addEventListener('click', handleClick)

    // Add cursor style
    el.style.cursor = 'pointer'

    // Execute immediately if specified
    if (config.immediate) {
      handleClick()
    }

    this.log(`Copy directive mounted on element`, el)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    // Remove old handler
    const oldHandler = directiveUtils.getData(el, 'copy-handler')
    if (oldHandler) {
      el.removeEventListener('click', oldHandler as EventListener)
    }

    // Re-mount with new config
    this.mounted(el, binding)

    this.log(`Copy directive updated on element`, el)
  }

  public unmounted(el: HTMLElement): void {
    const handler = directiveUtils.getData(el, 'copy-handler')

    if (handler) {
      el.removeEventListener('click', handler as EventListener)
      directiveUtils.removeData(el, 'copy-handler')
    }

    // Reset cursor style
    el.style.cursor = ''

    this.log(`Copy directive unmounted from element`, el)
  }

  private getText(config: CopyOptions, el: HTMLElement): string {
    if (config.text) {
      return typeof config.text === 'function' ? config.text() : config.text
    }

    // Try to get text from element
    const input = el as HTMLInputElement
    if (input.value !== undefined) {
      return input.value
    }

    return el.textContent || ''
  }

  private async copyToClipboard(text: string): Promise<void> {
    // Try modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return
    }

    // Fallback to older method
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    textarea.style.left = '-999999px'

    document.body.appendChild(textarea)
    textarea.select()

    try {
      const successful = document.execCommand('copy')
      if (!successful) {
        throw new Error('Copy command failed')
      }
    } finally {
      document.body.removeChild(textarea)
    }
  }

  private parseConfig(binding: VueDirectiveBinding): CopyOptions {
    const value = binding.value

    if (typeof value === 'string') {
      return { text: value }
    }

    if (typeof value === 'function') {
      return { text: value as () => string }
    }

    if (typeof value === 'object' && value !== null) {
      return value as CopyOptions
    }

    return {}
  }

  public getExample(): string {
    return `
<!-- Copy static text -->
<button v-copy="'Hello, World!'">
  Copy Text
</button>

<!-- Copy from element content -->
<div v-copy>
  This content will be copied
</div>

<!-- Copy from input value -->
<input v-copy value="Copy this value" />

<!-- With options -->
<button v-copy="{
  text: 'Custom text to copy',
  onSuccess: (text) => ,
  onError: (error) => console.error('Failed:', error),
  disabled: false
}">
  Copy with Options
</button>

<!-- Dynamic text -->
<button v-copy="{
  text: () => new Date().toISOString(),
  onSuccess: () => showToast('Copied!')
}">
  Copy Current Time
</button>
    `
  }
}

// Export the directive definition
export const vCopy = defineDirective(new CopyDirective())

// Export default for convenience
export default vCopy
