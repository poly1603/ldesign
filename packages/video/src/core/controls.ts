/**
 * 播放器控制栏组件
 * 实现播放控制、进度条、音量调节等UI控件
 */

import { EventEmitter } from '../utils/events'
import { createElement, addClass, removeClass, setStyle } from '../utils/dom'
import { formatTime } from '../utils/format'
import { generateId } from '../utils/common'
import type { IVideoPlayer, PlayerEvent } from '../types/player'

/**
 * 控制栏配置选项
 */
export interface ControlsOptions {
  /** 是否显示播放按钮 */
  showPlayButton?: boolean
  /** 是否显示进度条 */
  showProgressBar?: boolean
  /** 是否显示时间显示 */
  showTimeDisplay?: boolean
  /** 是否显示音量控制 */
  showVolumeControl?: boolean
  /** 是否显示全屏按钮 */
  showFullscreenButton?: boolean
  /** 是否显示画中画按钮 */
  showPipButton?: boolean
  /** 是否显示播放速度控制 */
  showPlaybackRateControl?: boolean
  /** 自动隐藏延迟（毫秒） */
  autoHideDelay?: number
  /** 是否在移动设备上隐藏 */
  hideOnMobile?: boolean
}

/**
 * 播放器控制栏实现
 */
export class PlayerControls extends EventEmitter {
  private player: IVideoPlayer
  private options: ControlsOptions
  private container: HTMLElement
  private controlsElement: HTMLElement
  private playButton: HTMLElement
  private progressBar: HTMLElement
  private progressTrack: HTMLElement
  private progressBuffer: HTMLElement
  private progressThumb: HTMLElement
  private timeDisplay: HTMLElement
  private volumeControl: HTMLElement
  private volumeButton: HTMLElement
  private volumeSlider: HTMLElement
  private fullscreenButton: HTMLElement
  private pipButton: HTMLElement
  private playbackRateButton: HTMLElement
  
  private isDragging = false
  private autoHideTimer: NodeJS.Timeout | null = null
  private visible = true

  constructor(player: IVideoPlayer, options: ControlsOptions = {}) {
    super()
    
    this.player = player
    this.options = {
      showPlayButton: true,
      showProgressBar: true,
      showTimeDisplay: true,
      showVolumeControl: true,
      showFullscreenButton: true,
      showPipButton: true,
      showPlaybackRateControl: true,
      autoHideDelay: 3000,
      hideOnMobile: false,
      ...options
    }
    
    this.container = player.container
    this.createControls()
    this.bindEvents()
    this.updateControls()
  }

  /**
   * 显示控制栏
   */
  show(): void {
    if (!this.visible) {
      this.visible = true
      removeClass(this.controlsElement, 'lv-controls--hidden')
      this.emit('show')
    }
    
    this.resetAutoHideTimer()
  }

  /**
   * 隐藏控制栏
   */
  hide(): void {
    if (this.visible && !this.isDragging) {
      this.visible = false
      addClass(this.controlsElement, 'lv-controls--hidden')
      this.emit('hide')
    }
  }

  /**
   * 切换控制栏显示状态
   */
  toggle(): void {
    if (this.visible) {
      this.hide()
    } else {
      this.show()
    }
  }

  /**
   * 销毁控制栏
   */
  destroy(): void {
    this.clearAutoHideTimer()
    this.unbindEvents()
    
    if (this.controlsElement.parentNode) {
      this.controlsElement.parentNode.removeChild(this.controlsElement)
    }
    
    this.removeAllListeners()
  }

  /**
   * 创建控制栏元素
   */
  private createControls(): void {
    this.controlsElement = createElement('div', {
      className: 'lv-controls',
      attributes: {
        'data-controls-id': generateId('controls')
      }
    })

    // 创建控制栏内容
    const controlsContent = createElement('div', {
      className: 'lv-controls__content'
    })

    // 创建顶部控制栏
    const topControls = createElement('div', {
      className: 'lv-controls__top'
    })

    // 创建底部控制栏
    const bottomControls = createElement('div', {
      className: 'lv-controls__bottom'
    })

    // 创建进度条
    if (this.options.showProgressBar) {
      this.createProgressBar()
      bottomControls.appendChild(this.progressBar)
    }

    // 创建控制按钮区域
    const controlButtons = createElement('div', {
      className: 'lv-controls__buttons'
    })

    // 创建左侧按钮组
    const leftButtons = createElement('div', {
      className: 'lv-controls__buttons-left'
    })

    // 创建播放按钮
    if (this.options.showPlayButton) {
      this.createPlayButton()
      leftButtons.appendChild(this.playButton)
    }

    // 创建时间显示
    if (this.options.showTimeDisplay) {
      this.createTimeDisplay()
      leftButtons.appendChild(this.timeDisplay)
    }

    // 创建右侧按钮组
    const rightButtons = createElement('div', {
      className: 'lv-controls__buttons-right'
    })

    // 创建音量控制
    if (this.options.showVolumeControl) {
      this.createVolumeControl()
      rightButtons.appendChild(this.volumeControl)
    }

    // 创建播放速度控制
    if (this.options.showPlaybackRateControl) {
      this.createPlaybackRateControl()
      rightButtons.appendChild(this.playbackRateButton)
    }

    // 创建画中画按钮
    if (this.options.showPipButton) {
      this.createPipButton()
      rightButtons.appendChild(this.pipButton)
    }

    // 创建全屏按钮
    if (this.options.showFullscreenButton) {
      this.createFullscreenButton()
      rightButtons.appendChild(this.fullscreenButton)
    }

    // 组装控制栏
    controlButtons.appendChild(leftButtons)
    controlButtons.appendChild(rightButtons)
    bottomControls.appendChild(controlButtons)
    
    controlsContent.appendChild(topControls)
    controlsContent.appendChild(bottomControls)
    this.controlsElement.appendChild(controlsContent)
    
    // 添加到容器
    this.container.appendChild(this.controlsElement)
  }

  /**
   * 创建播放按钮
   */
  private createPlayButton(): void {
    this.playButton = createElement('button', {
      className: 'lv-controls__button lv-controls__play-button',
      attributes: {
        'aria-label': '播放/暂停',
        'type': 'button'
      },
      innerHTML: `
        <svg class="lv-icon lv-icon--play" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg class="lv-icon lv-icon--pause" viewBox="0 0 24 24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
      `
    })
  }

  /**
   * 创建进度条
   */
  private createProgressBar(): void {
    this.progressBar = createElement('div', {
      className: 'lv-controls__progress-bar'
    })

    this.progressTrack = createElement('div', {
      className: 'lv-progress__track'
    })

    this.progressBuffer = createElement('div', {
      className: 'lv-progress__buffer'
    })

    const progressPlayed = createElement('div', {
      className: 'lv-progress__played'
    })

    this.progressThumb = createElement('div', {
      className: 'lv-progress__thumb'
    })

    this.progressTrack.appendChild(this.progressBuffer)
    this.progressTrack.appendChild(progressPlayed)
    this.progressTrack.appendChild(this.progressThumb)
    this.progressBar.appendChild(this.progressTrack)
  }

  /**
   * 创建时间显示
   */
  private createTimeDisplay(): void {
    this.timeDisplay = createElement('div', {
      className: 'lv-controls__time',
      innerHTML: `
        <span class="lv-time__current">00:00</span>
        <span class="lv-time__separator">/</span>
        <span class="lv-time__duration">00:00</span>
      `
    })
  }

  /**
   * 创建音量控制
   */
  private createVolumeControl(): void {
    this.volumeControl = createElement('div', {
      className: 'lv-controls__volume'
    })

    this.volumeButton = createElement('button', {
      className: 'lv-controls__button lv-controls__volume-button',
      attributes: {
        'aria-label': '音量',
        'type': 'button'
      },
      innerHTML: `
        <svg class="lv-icon lv-icon--volume" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
        <svg class="lv-icon lv-icon--volume-muted" viewBox="0 0 24 24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
      `
    })

    this.volumeSlider = createElement('div', {
      className: 'lv-controls__volume-slider',
      innerHTML: `
        <div class="lv-volume__track">
          <div class="lv-volume__fill"></div>
          <div class="lv-volume__thumb"></div>
        </div>
      `
    })

    this.volumeControl.appendChild(this.volumeButton)
    this.volumeControl.appendChild(this.volumeSlider)
  }

  /**
   * 创建全屏按钮
   */
  private createFullscreenButton(): void {
    this.fullscreenButton = createElement('button', {
      className: 'lv-controls__button lv-controls__fullscreen-button',
      attributes: {
        'aria-label': '全屏',
        'type': 'button'
      },
      innerHTML: `
        <svg class="lv-icon lv-icon--fullscreen" viewBox="0 0 24 24">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        <svg class="lv-icon lv-icon--fullscreen-exit" viewBox="0 0 24 24">
          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
        </svg>
      `
    })
  }

  /**
   * 创建画中画按钮
   */
  private createPipButton(): void {
    this.pipButton = createElement('button', {
      className: 'lv-controls__button lv-controls__pip-button',
      attributes: {
        'aria-label': '画中画',
        'type': 'button'
      },
      innerHTML: `
        <svg class="lv-icon lv-icon--pip" viewBox="0 0 24 24">
          <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
        </svg>
      `
    })
  }

  /**
   * 创建播放速度控制
   */
  private createPlaybackRateControl(): void {
    this.playbackRateButton = createElement('button', {
      className: 'lv-controls__button lv-controls__rate-button',
      attributes: {
        'aria-label': '播放速度',
        'type': 'button'
      },
      textContent: '1x'
    })
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 播放器事件
    this.player.on(PlayerEvent.PLAY, this.updatePlayButton.bind(this))
    this.player.on(PlayerEvent.PAUSE, this.updatePlayButton.bind(this))
    this.player.on(PlayerEvent.TIME_UPDATE, this.updateProgress.bind(this))
    this.player.on(PlayerEvent.PROGRESS, this.updateBuffer.bind(this))
    this.player.on(PlayerEvent.VOLUME_CHANGE, this.updateVolume.bind(this))
    this.player.on(PlayerEvent.RATE_CHANGE, this.updatePlaybackRate.bind(this))
    this.player.on(PlayerEvent.FULLSCREEN_CHANGE, this.updateFullscreenButton.bind(this))
    this.player.on(PlayerEvent.PIP_CHANGE, this.updatePipButton.bind(this))

    // 控制栏事件
    if (this.playButton) {
      this.playButton.addEventListener('click', () => this.player.toggle())
    }

    if (this.fullscreenButton) {
      this.fullscreenButton.addEventListener('click', () => this.player.toggleFullscreen())
    }

    if (this.pipButton) {
      this.pipButton.addEventListener('click', () => this.player.togglePip())
    }

    // 鼠标移动显示控制栏
    this.container.addEventListener('mousemove', this.show.bind(this))
    this.container.addEventListener('mouseleave', this.resetAutoHideTimer.bind(this))
    
    // 触摸事件
    this.container.addEventListener('touchstart', this.show.bind(this))
  }

  /**
   * 解绑事件
   */
  private unbindEvents(): void {
    this.player.off(PlayerEvent.PLAY, this.updatePlayButton.bind(this))
    this.player.off(PlayerEvent.PAUSE, this.updatePlayButton.bind(this))
    this.player.off(PlayerEvent.TIME_UPDATE, this.updateProgress.bind(this))
    this.player.off(PlayerEvent.PROGRESS, this.updateBuffer.bind(this))
    this.player.off(PlayerEvent.VOLUME_CHANGE, this.updateVolume.bind(this))
    this.player.off(PlayerEvent.RATE_CHANGE, this.updatePlaybackRate.bind(this))
    this.player.off(PlayerEvent.FULLSCREEN_CHANGE, this.updateFullscreenButton.bind(this))
    this.player.off(PlayerEvent.PIP_CHANGE, this.updatePipButton.bind(this))
  }

  /**
   * 更新控制栏状态
   */
  private updateControls(): void {
    this.updatePlayButton()
    this.updateProgress()
    this.updateVolume()
    this.updatePlaybackRate()
    this.updateFullscreenButton()
    this.updatePipButton()
  }

  /**
   * 更新播放按钮
   */
  private updatePlayButton(): void {
    if (!this.playButton) return

    const isPlaying = this.player.status.state === 'playing'
    
    if (isPlaying) {
      addClass(this.playButton, 'lv-controls__button--playing')
    } else {
      removeClass(this.playButton, 'lv-controls__button--playing')
    }
  }

  /**
   * 更新进度条
   */
  private updateProgress(): void {
    if (!this.progressBar) return

    const { currentTime, duration } = this.player.status
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0

    const progressPlayed = this.progressTrack.querySelector('.lv-progress__played') as HTMLElement
    if (progressPlayed) {
      setStyle(progressPlayed, { width: `${progress}%` })
    }

    if (this.progressThumb) {
      setStyle(this.progressThumb, { left: `${progress}%` })
    }

    // 更新时间显示
    if (this.timeDisplay) {
      const currentEl = this.timeDisplay.querySelector('.lv-time__current')
      const durationEl = this.timeDisplay.querySelector('.lv-time__duration')
      
      if (currentEl) currentEl.textContent = formatTime(currentTime)
      if (durationEl) durationEl.textContent = formatTime(duration)
    }
  }

  /**
   * 更新缓冲进度
   */
  private updateBuffer(): void {
    if (!this.progressBuffer) return

    const { buffered } = this.player.status
    setStyle(this.progressBuffer, { width: `${buffered}%` })
  }

  /**
   * 更新音量显示
   */
  private updateVolume(): void {
    if (!this.volumeControl) return

    const { volume, muted } = this.player.status
    
    if (muted) {
      addClass(this.volumeButton, 'lv-controls__button--muted')
    } else {
      removeClass(this.volumeButton, 'lv-controls__button--muted')
    }

    const volumeFill = this.volumeSlider?.querySelector('.lv-volume__fill') as HTMLElement
    if (volumeFill) {
      setStyle(volumeFill, { width: `${volume * 100}%` })
    }
  }

  /**
   * 更新播放速度显示
   */
  private updatePlaybackRate(): void {
    if (!this.playbackRateButton) return

    const { playbackRate } = this.player.status
    this.playbackRateButton.textContent = `${playbackRate}x`
  }

  /**
   * 更新全屏按钮
   */
  private updateFullscreenButton(): void {
    if (!this.fullscreenButton) return

    const { fullscreen } = this.player.status
    
    if (fullscreen) {
      addClass(this.fullscreenButton, 'lv-controls__button--fullscreen')
    } else {
      removeClass(this.fullscreenButton, 'lv-controls__button--fullscreen')
    }
  }

  /**
   * 更新画中画按钮
   */
  private updatePipButton(): void {
    if (!this.pipButton) return

    const { pip } = this.player.status
    
    if (pip) {
      addClass(this.pipButton, 'lv-controls__button--pip')
    } else {
      removeClass(this.pipButton, 'lv-controls__button--pip')
    }
  }

  /**
   * 重置自动隐藏定时器
   */
  private resetAutoHideTimer(): void {
    this.clearAutoHideTimer()
    
    if (this.options.autoHideDelay && this.options.autoHideDelay > 0) {
      this.autoHideTimer = setTimeout(() => {
        this.hide()
      }, this.options.autoHideDelay)
    }
  }

  /**
   * 清除自动隐藏定时器
   */
  private clearAutoHideTimer(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer)
      this.autoHideTimer = null
    }
  }
}
