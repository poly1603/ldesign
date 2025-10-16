/**
 * 节流指令
 * 限制事件触发频率，在指定时间内最多执行一次
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface ThrottleOptions {
  handler?: (...args: unknown[]) => void
  delay?: number
  event?: string
  disabled?: boolean
  leading?: boolean
  trailing?: boolean
}

export class ThrottleDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'throttle',
      description: '节流处理，限制触发频率',
      version: '1.0.0',
      category: 'performance',
      tags: ['throttle', 'performance', 'event'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (!config.handler || typeof config.handler !== 'function') {
      this.warn('Throttle directive requires a handler function')
      return
    }

    const delay = config.delay ?? 200
    const event = config.event ?? 'click'
    const leading = config.leading ?? true
    const trailing = config.trailing ?? true

    let lastTime = 0
    let timeoutId: NodeJS.Timeout | null = null
    let lastArgs: unknown[] = []

    const throttledHandler = (...args: unknown[]) => {
      if (config.disabled) return

      const now = Date.now()
      const remaining = delay - (now - lastTime)

      lastArgs = args

      const execute = () => {
        if (config.handler) {
          config.handler(...lastArgs)
        }
        lastTime = Date.now()
        timeoutId = null
      }

      if (remaining <= 0 || remaining > delay) {
        // If leading is enabled and enough time has passed
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        if (leading) {
          execute()
        } else {
          lastTime = now
        }

        if (trailing && !timeoutId) {
          timeoutId = setTimeout(() => {
            execute()
          }, delay)
        }
      } else if (!timeoutId && trailing) {
        // Schedule trailing execution
        timeoutId = setTimeout(() => {
          execute()
        }, remaining)
      }
    }

    // Store handlers and config for cleanup
    directiveUtils.storeData(el, 'throttle-handler', throttledHandler)
    directiveUtils.storeData(el, 'throttle-event', event)
    directiveUtils.storeData(el, 'throttle-timeout', timeoutId)

    // Add event listener
    el.addEventListener(event, throttledHandler)

    this.log(`Throttle directive mounted on element with ${delay}ms delay`, el)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    // Clean up old handler
    const oldHandler = directiveUtils.getData(el, 'throttle-handler')
    const oldEvent = directiveUtils.getData(el, 'throttle-event')
    const oldTimeout = directiveUtils.getData(el, 'throttle-timeout')

    if (oldHandler && oldEvent) {
      el.removeEventListener(oldEvent as string, oldHandler as EventListener)
    }

    if (oldTimeout) {
      clearTimeout(oldTimeout as NodeJS.Timeout)
    }

    // Re-mount with new config
    this.mounted(el, binding)

    this.log(`Throttle directive updated on element`, el)
  }

  public unmounted(el: HTMLElement): void {
    const handler = directiveUtils.getData(el, 'throttle-handler')
    const event = directiveUtils.getData(el, 'throttle-event')
    const timeout = directiveUtils.getData(el, 'throttle-timeout')

    if (handler && event) {
      el.removeEventListener(event as string, handler as EventListener)
    }

    if (timeout) {
      clearTimeout(timeout as NodeJS.Timeout)
    }

    directiveUtils.removeData(el, 'throttle-handler')
    directiveUtils.removeData(el, 'throttle-event')
    directiveUtils.removeData(el, 'throttle-timeout')

    this.log(`Throttle directive unmounted from element`, el)
  }

  private parseConfig(binding: VueDirectiveBinding): ThrottleOptions {
    const value = binding.value

    // Handle function as handler
    if (typeof value === 'function') {
      return { handler: value as (...args: unknown[]) => void }
    }

    // Handle object config
    if (typeof value === 'object' && value !== null) {
      return value as ThrottleOptions
    }

    return {}
  }

  public getExample(): string {
    return `
<!-- Basic throttle with default 200ms delay -->
<button v-throttle="handleClick">
  Throttled Click
</button>

<!-- Custom delay -->
<div v-throttle="{
  handler: handleScroll,
  event: 'scroll',
  delay: 500
}" class="scrollable">
  Scroll me (throttled)
</div>

<!-- Leading and trailing options -->
<button v-throttle="{
  handler: handleInput,
  delay: 300,
  leading: false,
  trailing: true
}">
  Trailing only
</button>

<!-- Different event -->
<input v-throttle="{
  handler: handleKeyPress,
  event: 'keydown',
  delay: 100
}" placeholder="Type here (throttled)">

<!-- Conditional throttle -->
<button v-throttle="{
  handler: saveProgress,
  delay: 1000,
  disabled: isSaving
}">
  Auto-save
</button>

<script setup>
const handleClick = () => {
  ')
}

const handleScroll = (event) => {
  
}

const handleInput = () => {
  ')
}

const handleKeyPress = (event) => {
  
}

const saveProgress = () => {
  
}
</script>
    `
  }
}

// Export the directive definition
export const vThrottle = defineDirective(new ThrottleDirective())

// Export default for convenience
export default vThrottle
