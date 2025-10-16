/**
 * 加载状态指令
 * 显示加载状态和加载动画
 */

import type { VueDirectiveBinding } from '../base/vue-directive-adapter'
import { DirectiveBase } from '../base/directive-base'
import { defineDirective, directiveUtils } from '../base/vue-directive-adapter'

export interface LoadingOptions {
  loading?: boolean
  text?: string
  spinner?: string
  background?: string
  fullscreen?: boolean
  lock?: boolean
}

export class LoadingDirective extends DirectiveBase {
  constructor() {
    super({
      name: 'loading',
      description: '显示加载状态',
      version: '1.0.0',
      category: 'feedback',
      tags: ['loading', 'spinner', 'progress'],
    })
  }

  public mounted(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)
    this.toggleLoading(el, config)
    this.log('Loading directive mounted', el)
  }

  public updated(el: HTMLElement, binding: VueDirectiveBinding): void {
    const config = this.parseConfig(binding)
    this.toggleLoading(el, config)
    this.log('Loading directive updated', el)
  }

  public unmounted(el: HTMLElement): void {
    this.removeLoading(el)
    this.log('Loading directive unmounted', el)
  }

  private toggleLoading(el: HTMLElement, config: LoadingOptions): void {
    if (config.loading) {
      this.addLoading(el, config)
    } else {
      this.removeLoading(el)
    }
  }

  private addLoading(el: HTMLElement, config: LoadingOptions): void {
    // Remove existing overlay if any
    this.removeLoading(el)

    const overlay = this.createOverlay(config)

    if (config.fullscreen) {
      document.body.appendChild(overlay)
      if (config.lock) {
        document.body.style.overflow = 'hidden'
      }
    } else {
      if (getComputedStyle(el).position === 'static') {
        el.style.position = 'relative'
      }
      el.appendChild(overlay)
    }

    directiveUtils.storeData(el, 'loading-overlay', overlay)
  }

  private removeLoading(el: HTMLElement): void {
    const overlay = directiveUtils.getData(el, 'loading-overlay') as HTMLElement
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay)
    }
    document.body.style.overflow = ''
    directiveUtils.removeData(el, 'loading-overlay')
  }

  private createOverlay(config: LoadingOptions): HTMLElement {
    const overlay = document.createElement('div')
    overlay.className = 'v-loading-overlay'
    overlay.style.position = config.fullscreen ? 'fixed' : 'absolute'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.right = '0'
    overlay.style.bottom = '0'
    overlay.style.display = 'flex'
    overlay.style.flexDirection = 'column'
    overlay.style.alignItems = 'center'
    overlay.style.justifyContent = 'center'
    overlay.style.background = config.background || 'rgba(255, 255, 255, 0.9)'
    overlay.style.zIndex = '9999'

    const spinner = document.createElement('div')
    spinner.className = 'v-loading-spinner'
    spinner.innerHTML = config.spinner || this.getDefaultSpinner()
    overlay.appendChild(spinner)

    if (config.text) {
      const text = document.createElement('div')
      text.className = 'v-loading-text'
      text.textContent = config.text
      text.style.marginTop = '12px'
      text.style.color = '#666'
      text.style.fontSize = '14px'
      overlay.appendChild(text)
    }

    return overlay
  }

  private getDefaultSpinner(): string {
    const svg = '<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">'
    const circle = '<circle cx="20" cy="20" r="18" stroke="#3498db" stroke-width="3" fill="none" stroke-dasharray="90" stroke-dashoffset="15">'
    const animate = '<animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="1s" repeatCount="indefinite"/>'
    return `${svg + circle + animate}</circle></svg>`
  }

  private parseConfig(binding: VueDirectiveBinding): LoadingOptions {
    const value = binding.value
    if (typeof value === 'boolean') {
      return { loading: value }
    }
    if (typeof value === 'object' && value !== null) {
      return value as LoadingOptions
    }
    return { loading: false }
  }

  public getExample(): string {
    return `
<!-- Basic loading -->
<div v-loading="isLoading">
  Content here
</div>

<!-- With text -->
<div v-loading="{
  loading: isLoading,
  text: 'Loading data...'
}">
  Content here
</div>

<!-- Fullscreen loading -->
<button @click="showFullscreenLoading" v-loading="{
  loading: fullscreenLoading,
  fullscreen: true,
  lock: true,
  text: 'Please wait...'
}">
  Show Fullscreen Loading
</button>

<!-- Custom background -->
<div v-loading="{
  loading: true,
  background: 'rgba(0, 0, 0, 0.8)'
}">
  Dark loading overlay
</div>

<script setup>
import { ref } from 'vue'

const isLoading = ref(false)
const fullscreenLoading = ref(false)

const showFullscreenLoading = () => {
  fullscreenLoading.value = true
  setTimeout(() => {
    fullscreenLoading.value = false
  }, 3000)
}
</script>
    `
  }
}

// Export the directive definition
export const vLoading = defineDirective(new LoadingDirective())

// Export default for convenience
export default vLoading
