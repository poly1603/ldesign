/**
 * <lottie-animation> Web Component
 * 基于标准 Web Components API 的 Lottie 元素
 */

import { lottieManager } from '../../core/LottieManager'
import type { ILottieInstance } from '../../types'

export class LottieElement extends HTMLElement {
  private instance: ILottieInstance | null = null
  private container: HTMLDivElement | null = null

  // 观察的属性
  static get observedAttributes() {
    return ['src', 'loop', 'autoplay', 'renderer', 'speed']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this.render()
    this.init()
  }

  disconnectedCallback() {
    this.destroy()
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue && this.isConnected) {
      this.init()
    }
  }

  private render() {
    if (!this.shadowRoot) return

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          overflow: hidden;
        }
        .container {
          width: 100%;
          height: 100%;
        }
      </style>
      <div class="container"></div>
    `

    this.container = this.shadowRoot.querySelector('.container')
  }

  private async init() {
    if (!this.container) return

    // 销毁旧实例
    if (this.instance) {
      this.instance.destroy()
    }

    try {
      const src = this.getAttribute('src')
      if (!src) return

      this.instance = lottieManager.create({
        container: this.container,
        path: src,
        loop: this.hasAttribute('loop') ? this.getAttribute('loop') !== 'false' : true,
        autoplay: this.hasAttribute('autoplay') ? this.getAttribute('autoplay') !== 'false' : true,
        renderer: (this.getAttribute('renderer') as any) || 'svg',
        speed: this.hasAttribute('speed') ? parseFloat(this.getAttribute('speed')!) : 1,
        events: {
          data_ready: () => this.dispatchEvent(new CustomEvent('ready')),
          complete: () => this.dispatchEvent(new CustomEvent('complete')),
          loopComplete: () => this.dispatchEvent(new CustomEvent('loopcomplete')),
          data_failed: (error: Error) => {
            this.dispatchEvent(new CustomEvent('error', { detail: error }))
          }
        }
      })

      await this.instance.load()
    } catch (error) {
      console.error('[LottieElement] Init error:', error)
      this.dispatchEvent(new CustomEvent('error', { detail: error }))
    }
  }

  private destroy() {
    if (this.instance) {
      this.instance.destroy()
      this.instance = null
    }
  }

  // 公开方法
  play() {
    this.instance?.play()
  }

  pause() {
    this.instance?.pause()
  }

  stop() {
    this.instance?.stop()
  }

  reset() {
    this.instance?.reset()
  }

  setSpeed(speed: number) {
    this.instance?.setSpeed(speed)
  }

  setDirection(direction: 1 | -1) {
    this.instance?.setDirection(direction)
  }

  goToFrame(frame: number, play = false) {
    if (play) {
      this.instance?.goToAndPlay(frame, true)
    } else {
      this.instance?.goToAndStop(frame, true)
    }
  }

  // Getter
  get animation() {
    return this.instance
  }
}

// 自动注册
if (typeof window !== 'undefined' && !customElements.get('lottie-animation')) {
  customElements.define('lottie-animation', LottieElement)
}


