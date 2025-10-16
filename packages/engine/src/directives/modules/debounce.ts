/**
 * 防抖指令
 * 防止事件频繁触发，在指定时间内只执行最后一次
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface DebounceOptions {
  handler?: (...args: unknown[]) => void
  delay?: number
  event?: string
  immediate?: boolean
  disabled?: boolean
}

export class DebounceDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'debounce',
      description: '防抖处理，避免频繁触发',
      version: '1.0.0',
      category: 'performance',
      tags: ['debounce', 'throttle', 'performance', 'event'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (!config.handler || typeof config.handler !== 'function') {
      this.warn('Debounce directive requires a handler function')
      return
    }

    const delay = config.delay ?? 300
    const event = config.event ?? 'click'
    const immediate = config.immediate ?? false

    let timeoutId: NodeJS.Timeout | null = null

    const debouncedHandler = (...args: unknown[]) => {
      if (config.disabled) {
        return
      }

      const later = () => {
        timeoutId = null
        if (!immediate && config.handler) {
          config.handler(...args)
          this.log(`Debounced event triggered after ${delay}ms`)
        }
      }

      const callNow = immediate && !timeoutId

      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(later, delay)

      if (callNow && config.handler) {
        config.handler(...args)
        this.log(`Immediate debounced event triggered`)
      }
    }

    // Store handlers and config for cleanup
    directiveUtils.storeData(el, 'debounce-handler', debouncedHandler)
    directiveUtils.storeData(el, 'debounce-event', event)
    directiveUtils.storeData(el, 'debounce-timeout', timeoutId)

    // Add event listener
    el.addEventListener(event, debouncedHandler)

    this.log(`Debounce directive mounted on element with ${delay}ms delay`, el)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    // Clean up old handler
    const oldHandler = directiveUtils.getData(el, 'debounce-handler')
    const oldEvent = directiveUtils.getData(el, 'debounce-event')
    const oldTimeout = directiveUtils.getData(el, 'debounce-timeout')

    if (oldHandler && oldEvent) {
      el.removeEventListener(oldEvent as string, oldHandler as EventListener)
    }

    if (oldTimeout) {
      clearTimeout(oldTimeout as NodeJS.Timeout)
    }

    // Re-mount with new config
    this.mounted(el, binding)

    this.log(`Debounce directive updated on element`, el)
  }

  public unmounted(el: HTMLElement): void {
    const handler = directiveUtils.getData(el, 'debounce-handler')
    const event = directiveUtils.getData(el, 'debounce-event')
    const timeout = directiveUtils.getData(el, 'debounce-timeout')

    if (handler && event) {
      el.removeEventListener(event as string, handler as EventListener)
    }

    if (timeout) {
      clearTimeout(timeout as NodeJS.Timeout)
    }

    directiveUtils.removeData(el, 'debounce-handler')
    directiveUtils.removeData(el, 'debounce-event')
    directiveUtils.removeData(el, 'debounce-timeout')

    this.log(`Debounce directive unmounted from element`, el)
  }

  private parseConfig(binding: VueDirectiveBinding): DebounceOptions {
    const value = binding.value

    // Handle function as handler
    if (typeof value === 'function') {
      return { handler: value as (...args: unknown[]) => void }
    }

    // Handle object config
    if (typeof value === 'object' && value !== null) {
      return value as DebounceOptions
    }

    return {}
  }

  public getExample(): string {
    return `
<!-- Basic debounce with default 300ms delay -->
<input v-debounce="handleSearch" placeholder="Search...">

<!-- Custom delay -->
<button v-debounce="{
  handler: handleClick,
  delay: 500
}">
  Debounced Click (500ms)
</button>

<!-- Different event -->
<input v-debounce="{
  handler: handleInput,
  event: 'input',
  delay: 300
}" placeholder="Type something...">

<!-- Immediate mode (triggers on leading edge) -->
<button v-debounce="{
  handler: saveData,
  delay: 1000,
  immediate: true
}">
  Save (immediate)
</button>

<!-- Conditional debounce -->
<button v-debounce="{
  handler: submitForm,
  delay: 500,
  disabled: isSubmitting
}">
  Submit
</button>

<script setup>
const handleSearch = (event) => {
  
}

const handleClick = () => {
  
}

const handleInput = (event) => {
  
}

const saveData = () => {
  
}

const submitForm = () => {
  
}
</script>
    `
  }
}

// Export the directive definition
export const vDebounce = defineDirective(new DebounceDirective())

// Export default for convenience
export default vDebounce
