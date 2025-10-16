/**
 * 点击外部区域指令
 * 当用户点击元素外部时触发回调
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface ClickOutsideOptions {
  handler?: (event: Event) => void
  exclude?: string[] | HTMLElement[]
  capture?: boolean
  disabled?: boolean
}

export class ClickOutsideDirective extends DirectiveBase {
  private documentHandler: ((e: Event) => void) | null = null

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

      // Check if click is inside the element
      if (el.contains(target)) {
        return
      }

      // Check excluded elements
      if (config.exclude && config.exclude.length > 0) {
        const isExcluded = config.exclude.some((item) => {
          if (typeof item === 'string') {
            const excludeEl = document.querySelector(item)
            return excludeEl && excludeEl.contains(target)
          } else if (item instanceof HTMLElement) {
            return item.contains(target)
          }
          return false
        })

        if (isExcluded) {
          return
        }
      }

      // Trigger the handler
      if (config.handler) {
        config.handler(event)
      }
    }

    // Store handler for cleanup
    this.documentHandler = handler
    directiveUtils.storeData(el, 'click-outside-handler', handler)

    // Add event listener
    document.addEventListener('click', handler, config.capture ?? true)

    this.log(`Directive mounted on element`, el)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    const oldHandler = directiveUtils.getData(el, 'click-outside-handler')

    // Remove old handler if exists
    if (oldHandler) {
      document.removeEventListener('click', oldHandler as EventListener, true)
      document.removeEventListener('click', oldHandler as EventListener, false)
    }

    // Mount new handler
    this.mounted(el, binding)

    this.log(`Directive updated on element`, el)
  }

  public unmounted(el: HTMLElement): void {
    const handler = directiveUtils.getData(el, 'click-outside-handler')

    if (handler) {
      document.removeEventListener('click', handler as EventListener, true)
      document.removeEventListener('click', handler as EventListener, false)
      directiveUtils.removeData(el, 'click-outside-handler')
    }

    this.documentHandler = null
    this.log(`Directive unmounted from element`, el)
  }

  private parseConfig(binding: VueDirectiveBinding): ClickOutsideOptions {
    const value = binding.value

    // Handle different binding formats
    if (typeof value === 'function') {
      return { handler: value as (event: Event) => void }
    }

    if (typeof value === 'object' && value !== null) {
      const v = value as Partial<ClickOutsideOptions>
      return {
        handler: v.handler as (event: Event) => void,
        exclude: v.exclude,
        capture: v.capture,
        disabled: v.disabled,
      }
    }

    return {}
  }

  public getExample(): string {
    return `
<!-- Basic usage -->
<div v-click-outside="handleClickOutside">
  Click outside me
</div>

<!-- With options -->
<div v-click-outside="{
  handler: handleClickOutside,
  exclude: ['.modal', '#dropdown'],
  capture: true,
  disabled: false
}">
  Advanced click outside
</div>

<script setup>
const handleClickOutside = (event) => {
  
  // Close dropdown, modal, etc.
}
</script>
    `
  }
}

// Export the directive definition
export const vClickOutside = defineDirective(new ClickOutsideDirective())

// Export default for convenience
export default vClickOutside
