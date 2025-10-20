/**
 * <lottie-player> Web Component
 * 带控制栏的 Lottie 播放器
 */

import { lottieManager } from '../../core/LottieManager'
import type { ILottieInstance } from '../../types'

export class LottiePlayerElement extends HTMLElement {
  private instance: ILottieInstance | null = null
  private container: HTMLDivElement | null = null
  private currentFrame = 0
  private totalFrames = 0
  private isPlaying = false
  private speed = 1

  static get observedAttributes() {
    return ['src', 'loop', 'autoplay', 'renderer', 'speed', 'controls']
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
      if (name === 'controls') {
        this.render()
      } else {
        this.init()
      }
    }
  }

  private render() {
    if (!this.shadowRoot) return

    const showControls = this.hasAttribute('controls') ? this.getAttribute('controls') !== 'false' : true

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }
        .animation {
          width: 100%;
          height: 400px;
          background: #f9f9f9;
        }
        .controls {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #fff;
          border-top: 1px solid #eee;
        }
        button {
          width: 36px;
          height: 36px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background: #f0f0f0;
        }
        input[type="range"] {
          flex: 1;
        }
        .info {
          font-size: 12px;
          color: #666;
          min-width: 80px;
        }
        select {
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
        }
      </style>
      
      <div class="animation"></div>
      
      ${showControls ? `
        <div class="controls">
          <button id="play-pause" title="播放/暂停">▶</button>
          <button id="stop" title="停止">⏹</button>
          <button id="reset" title="重置">⏮</button>
          <input type="range" id="progress" min="0" max="0" value="0" />
          <span class="info"><span id="current">0</span> / <span id="total">0</span></span>
          <select id="speed">
            <option value="0.5">0.5x</option>
            <option value="1" selected>1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
      ` : ''}
    `

    this.container = this.shadowRoot.querySelector('.animation')
    this.bindEvents()
  }

  private bindEvents() {
    if (!this.shadowRoot) return

    const playPauseBtn = this.shadowRoot.getElementById('play-pause')
    const stopBtn = this.shadowRoot.getElementById('stop')
    const resetBtn = this.shadowRoot.getElementById('reset')
    const progressSlider = this.shadowRoot.getElementById('progress') as HTMLInputElement
    const speedSelect = this.shadowRoot.getElementById('speed') as HTMLSelectElement

    playPauseBtn?.addEventListener('click', () => this.togglePlay())
    stopBtn?.addEventListener('click', () => this.handleStop())
    resetBtn?.addEventListener('click', () => this.handleReset())
    progressSlider?.addEventListener('input', (e) => this.handleFrameChange(e))
    speedSelect?.addEventListener('change', (e) => this.handleSpeedChange(e))
  }

  private async init() {
    if (!this.container) return

    if (this.instance) {
      this.instance.destroy()
    }

    try {
      const src = this.getAttribute('src')
      if (!src) return

      this.speed = this.hasAttribute('speed') ? parseFloat(this.getAttribute('speed')!) : 1

      this.instance = lottieManager.create({
        container: this.container,
        path: src,
        loop: this.hasAttribute('loop') ? this.getAttribute('loop') !== 'false' : true,
        autoplay: this.hasAttribute('autoplay') ? this.getAttribute('autoplay') !== 'false' : false,
        renderer: (this.getAttribute('renderer') as any) || 'svg',
        speed: this.speed,
        events: {
          data_ready: () => {
            if (this.instance?.animation) {
              this.totalFrames = this.instance.animation.totalFrames
              this.updateUI()
            }
            this.dispatchEvent(new CustomEvent('ready'))
          },
          complete: () => {
            this.isPlaying = false
            this.updateUI()
            this.dispatchEvent(new CustomEvent('complete'))
          },
          enterFrame: (e: any) => {
            this.currentFrame = Math.floor(e.currentTime)
            this.updateUI()
          },
          stateChange: (state: string) => {
            this.isPlaying = state === 'playing'
            this.updateUI()
          }
        }
      })

      await this.instance.load()
    } catch (error) {
      console.error('[LottiePlayerElement] Init error:', error)
    }
  }

  private updateUI() {
    if (!this.shadowRoot) return

    const playPauseBtn = this.shadowRoot.getElementById('play-pause')
    const progressSlider = this.shadowRoot.getElementById('progress') as HTMLInputElement
    const currentSpan = this.shadowRoot.getElementById('current')
    const totalSpan = this.shadowRoot.getElementById('total')

    if (playPauseBtn) {
      playPauseBtn.textContent = this.isPlaying ? '⏸' : '▶'
    }

    if (progressSlider) {
      progressSlider.max = String(this.totalFrames - 1)
      progressSlider.value = String(this.currentFrame)
    }

    if (currentSpan) currentSpan.textContent = String(this.currentFrame)
    if (totalSpan) totalSpan.textContent = String(this.totalFrames)
  }

  private togglePlay() {
    if (!this.instance) return
    if (this.isPlaying) {
      this.instance.pause()
    } else {
      this.instance.play()
    }
  }

  private handleStop() {
    this.instance?.stop()
    this.currentFrame = 0
    this.updateUI()
  }

  private handleReset() {
    this.instance?.reset()
    this.currentFrame = 0
    this.updateUI()
  }

  private handleFrameChange(e: Event) {
    const value = parseInt((e.target as HTMLInputElement).value)
    this.currentFrame = value
    this.instance?.goToAndStop(value, true)
  }

  private handleSpeedChange(e: Event) {
    const value = parseFloat((e.target as HTMLSelectElement).value)
    this.speed = value
    this.instance?.setSpeed(value)
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
    this.handleStop()
  }

  reset() {
    this.handleReset()
  }
}

// 自动注册
if (typeof window !== 'undefined' && !customElements.get('lottie-player')) {
  customElements.define('lottie-player', LottiePlayerElement)
}


