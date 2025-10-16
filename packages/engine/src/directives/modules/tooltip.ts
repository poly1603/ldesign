/**
 * 工具提示指令
 * 显示悬浮提示信息
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface TooltipOptions {
  content?: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  delay?: number
  disabled?: boolean
  trigger?: 'hover' | 'click' | 'focus'
  className?: string
  offset?: number
  html?: boolean
}

export class TooltipDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'tooltip',
      description: '显示工具提示',
      version: '1.0.0',
      category: 'feedback',
      tags: ['tooltip', 'popover', 'hint'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)

    if (config.disabled || !config.content) {
      return
    }

    this.setupTooltip(el, config)
    this.log('Tooltip directive mounted', el)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    this.unmounted(el)
    this.mounted(el, binding)
  }

  public unmounted(el: HTMLElement): void {
    this.cleanupTooltip(el)
    this.log('Tooltip directive unmounted', el)
  }

  private setupTooltip(el: HTMLElement, config: TooltipOptions): void {
    const trigger = config.trigger || 'hover'
    const delay = config.delay || 0
    let showTimer: number | null = null
    let hideTimer: number | null = null

    const showTooltip = (): void => {
      if (hideTimer) {
        clearTimeout(hideTimer)
        hideTimer = null
      }

      showTimer = window.setTimeout(() => {
        const tooltip = this.createTooltip(config)
        this.positionTooltip(el, tooltip, config.placement || 'top', config.offset || 8)
        document.body.appendChild(tooltip)
        directiveUtils.storeData(el, 'tooltip-element', tooltip)

        // Add show animation
        requestAnimationFrame(() => {
          tooltip.style.opacity = '1'
          tooltip.style.transform = 'scale(1)'
        })
      }, delay)

      directiveUtils.storeData(el, 'tooltip-show-timer', showTimer)
    }

    const hideTooltip = (): void => {
      if (showTimer) {
        clearTimeout(showTimer)
        showTimer = null
        directiveUtils.removeData(el, 'tooltip-show-timer')
      }

      const tooltip = directiveUtils.getData(el, 'tooltip-element') as HTMLElement
      if (!tooltip) return

      hideTimer = window.setTimeout(() => {
        tooltip.style.opacity = '0'
        tooltip.style.transform = 'scale(0.95)'

        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip)
          }
          directiveUtils.removeData(el, 'tooltip-element')
        }, 200)
      }, 100)

      directiveUtils.storeData(el, 'tooltip-hide-timer', hideTimer)
    }

    const handlers = {
      show: showTooltip,
      hide: hideTooltip,
    }

    if (trigger === 'hover') {
      el.addEventListener('mouseenter', handlers.show)
      el.addEventListener('mouseleave', handlers.hide)
    } else if (trigger === 'click') {
      el.addEventListener('click', (e: Event) => {
        const tooltip = directiveUtils.getData(el, 'tooltip-element')
        if (tooltip) {
          handlers.hide()
        } else {
          handlers.show()
          e.stopPropagation()
        }
      })

      document.addEventListener('click', handlers.hide)
    } else if (trigger === 'focus') {
      el.addEventListener('focus', handlers.show)
      el.addEventListener('blur', handlers.hide)
    }

    directiveUtils.storeData(el, 'tooltip-handlers', handlers)
    directiveUtils.storeData(el, 'tooltip-trigger', trigger)
  }

  private cleanupTooltip(el: HTMLElement): void {
    const handlers = directiveUtils.getData(el, 'tooltip-handlers') as { show: () => void; hide: () => void } | undefined
    const trigger = directiveUtils.getData(el, 'tooltip-trigger') as string
    const tooltip = directiveUtils.getData(el, 'tooltip-element') as HTMLElement
    const showTimer = directiveUtils.getData(el, 'tooltip-show-timer') as number
    const hideTimer = directiveUtils.getData(el, 'tooltip-hide-timer') as number

    if (showTimer) {
      clearTimeout(showTimer)
    }

    if (hideTimer) {
      clearTimeout(hideTimer)
    }

    if (tooltip && tooltip.parentNode) {
      tooltip.parentNode.removeChild(tooltip)
    }

    if (handlers) {
      if (trigger === 'hover') {
        el.removeEventListener('mouseenter', handlers.show)
        el.removeEventListener('mouseleave', handlers.hide)
      } else if (trigger === 'click') {
        document.removeEventListener('click', handlers.hide)
      } else if (trigger === 'focus') {
        el.removeEventListener('focus', handlers.show)
        el.removeEventListener('blur', handlers.hide)
      }
    }

    directiveUtils.removeData(el, 'tooltip-element')
    directiveUtils.removeData(el, 'tooltip-handlers')
    directiveUtils.removeData(el, 'tooltip-trigger')
    directiveUtils.removeData(el, 'tooltip-show-timer')
    directiveUtils.removeData(el, 'tooltip-hide-timer')
  }

  private createTooltip(config: TooltipOptions): HTMLElement {
    const tooltip = document.createElement('div')
    tooltip.className = `v-tooltip ${config.className || ''}`

    if (config.html) {
      tooltip.innerHTML = config.content || ''
    } else {
      tooltip.textContent = config.content || ''
    }

    // Default styles
    tooltip.style.position = 'fixed'
    tooltip.style.zIndex = '10000'
    tooltip.style.padding = '8px 12px'
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.85)'
    tooltip.style.color = 'white'
    tooltip.style.fontSize = '12px'
    tooltip.style.borderRadius = '4px'
    tooltip.style.pointerEvents = 'none'
    tooltip.style.transition = 'opacity 0.2s, transform 0.2s'
    tooltip.style.opacity = '0'
    tooltip.style.transform = 'scale(0.95)'
    tooltip.style.maxWidth = '300px'
    tooltip.style.wordWrap = 'break-word'
    tooltip.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)'

    return tooltip
  }

  private positionTooltip(
    el: HTMLElement,
    tooltip: HTMLElement,
    placement: string,
    offset: number
  ): void {
    const rect = el.getBoundingClientRect()
    const tooltipRect = {
      width: tooltip.offsetWidth || 100,
      height: tooltip.offsetHeight || 30,
    }

    let top = 0
    let left = 0

    if (placement === 'auto') {
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth

      if (rect.top > viewportHeight / 2) {
        placement = 'top'
      } else {
        placement = 'bottom'
      }

      if (rect.left < 100) {
        placement = 'right'
      } else if (rect.right > viewportWidth - 100) {
        placement = 'left'
      }
    }

    switch (placement) {
      case 'top':
        top = rect.top - tooltipRect.height - offset
        left = rect.left + rect.width / 2 - tooltipRect.width / 2
        break
      case 'bottom':
        top = rect.bottom + offset
        left = rect.left + rect.width / 2 - tooltipRect.width / 2
        break
      case 'left':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2
        left = rect.left - tooltipRect.width - offset
        break
      case 'right':
        top = rect.top + rect.height / 2 - tooltipRect.height / 2
        left = rect.right + offset
        break
    }

    // Keep tooltip within viewport
    const margin = 10
    left = Math.max(margin, Math.min(left, window.innerWidth - tooltipRect.width - margin))
    top = Math.max(margin, Math.min(top, window.innerHeight - tooltipRect.height - margin))

    tooltip.style.top = `${top}px`
    tooltip.style.left = `${left}px`
  }

  private parseConfig(binding: VueDirectiveBinding): TooltipOptions {
    const value = binding.value

    if (typeof value === 'string') {
      return { content: value }
    }

    if (typeof value === 'object' && value !== null) {
      return value as TooltipOptions
    }

    return {}
  }

  public getExample(): string {
    return `
<!-- Basic tooltip -->
<button v-tooltip="'This is a tooltip'">
  Hover me
</button>

<!-- With placement -->
<button v-tooltip="{
  content: 'Top tooltip',
  placement: 'top'
}">
  Top
</button>

<!-- With delay -->
<button v-tooltip="{
  content: 'Delayed tooltip',
  delay: 500
}">
  Hover with delay
</button>

<!-- Click trigger -->
<button v-tooltip="{
  content: 'Click to toggle',
  trigger: 'click'
}">
  Click me
</button>

<!-- HTML content -->
<button v-tooltip="{
  content: '<strong>Bold</strong> <em>italic</em> text',
  html: true
}">
  HTML tooltip
</button>

<!-- Custom styling -->
<button v-tooltip="{
  content: 'Custom styled tooltip',
  className: 'my-custom-tooltip'
}">
  Custom style
</button>

<!-- Auto positioning -->
<button v-tooltip="{
  content: 'Auto-positioned tooltip',
  placement: 'auto'
}">
  Auto position
</button>

<!-- Disabled tooltip -->
<button v-tooltip="{
  content: 'This won\\'t show',
  disabled: isDisabled
}">
  Conditionally disabled
</button>

<script setup>
import { ref } from 'vue'

const isDisabled = ref(false)
</script>

<style>
.my-custom-tooltip {
  background-color: #2196f3 !important;
  font-size: 14px !important;
  padding: 12px 16px !important;
}
</style>
    `
  }
}

// Export the directive definition
export const vTooltip = defineDirective(new TooltipDirective())

// Export default for convenience
export default vTooltip
