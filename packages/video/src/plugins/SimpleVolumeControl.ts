/**
 * 简化音量控制插件
 * 专为控制栏设计的音量控制组件
 */

import type { IPlayer, PluginConfig } from '../types';

/**
 * 音量控制配置接口
 */
export interface SimpleVolumeControlConfig extends PluginConfig {
  /** 是否显示音量滑块 */
  showSlider?: boolean;
  /** 滑块方向 */
  orientation?: 'horizontal' | 'vertical';
  /** 是否显示音量数值 */
  showValue?: boolean;
  /** 静音图标 */
  muteIcon?: string;
  /** 音量图标 */
  volumeIcon?: string;
}

/**
 * 简化音量控制插件类
 */
export class SimpleVolumeControl {
  public readonly name = 'simpleVolumeControl';
  public readonly player: IPlayer;
  public readonly config: SimpleVolumeControlConfig;
  public element!: HTMLElement;

  private _volume = 1;
  private _muted = false;
  private _isDragging = false;

  constructor(player: IPlayer, config: SimpleVolumeControlConfig = {}) {
    this.player = player;
    this.config = {
      showSlider: true,
      orientation: 'horizontal',
      showValue: false,
      muteIcon: `<svg class="icon" viewBox="0 0 24 24">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      </svg>`,
      volumeIcon: `<svg class="icon" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>`,
      ...config
    };
  }

  /**
   * 初始化插件
   */
  async init(): Promise<void> {
    this.createElement();
    this.setupEventListeners();
    this.updateVolumeState();
  }

  /**
   * 创建DOM元素
   */
  private createElement(): void {
    const div = document.createElement('div');
    div.innerHTML = this.render();
    this.element = div.firstElementChild as HTMLElement;
  }

  /**
   * 渲染音量控制DOM结构
   */
  private render(): string {
    const { showSlider, showValue, orientation } = this.config;
    const icon = this.getCurrentIcon();
    const volumePercent = Math.round(this._volume * 100);

    return `
      <div class="ldesign-volume-control">
        <button class="ldesign-control-button volume-button" type="button" aria-label="${this._muted ? '取消静音' : '静音'}">
          ${icon}
        </button>
        ${showSlider ? `
          <div class="volume-slider-container ${orientation}">
            <input 
              type="range" 
              class="volume-slider" 
              min="0" 
              max="100" 
              value="${volumePercent}"
              aria-label="音量控制"
            />
          </div>
        ` : ''}
        ${showValue ? `<span class="volume-value">${volumePercent}%</span>` : ''}
      </div>
    `;
  }

  /**
   * 获取当前图标
   */
  private getCurrentIcon(): string {
    return this._muted || this._volume === 0 ?
      (this.config.muteIcon || '') :
      (this.config.volumeIcon || '');
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 直接监听视频元素事件
    if (this.player.element) {
      this.player.element.addEventListener('volumechange', this.onVolumeChange.bind(this));
    }

    // DOM 事件
    if (this.element) {
      const button = this.element.querySelector('.volume-button');
      if (button) {
        button.addEventListener('click', this.onButtonClick.bind(this));
      }

      const slider = this.element.querySelector('.volume-slider') as HTMLInputElement;
      if (slider) {
        slider.addEventListener('input', this.onSliderInput.bind(this));
        slider.addEventListener('mousedown', this.onSliderMouseDown.bind(this));
        slider.addEventListener('mouseup', this.onSliderMouseUp.bind(this));
      }

      // 鼠标悬停显示滑块
      this.element.addEventListener('mouseenter', this.onMouseEnter.bind(this));
      this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    }
  }

  /**
   * 更新音量状态
   */
  private updateVolumeState(): void {
    if (this.player.element) {
      this._volume = this.player.element.volume;
      this._muted = this.player.element.muted;
    }
  }

  /**
   * 更新UI显示
   */
  private updateUI(): void {
    if (!this.element) return;

    // 更新按钮图标
    const button = this.element.querySelector('.volume-button');
    if (button) {
      const icon = this.getCurrentIcon();
      const iconElement = button.querySelector('.icon');
      if (iconElement && icon) {
        iconElement.outerHTML = icon;
      }
      button.setAttribute('aria-label', this._muted ? '取消静音' : '静音');
    }

    // 更新滑块值
    const slider = this.element.querySelector('.volume-slider') as HTMLInputElement;
    if (slider) {
      slider.value = String(Math.round(this._volume * 100));
    }

    // 更新数值显示
    const valueElement = this.element.querySelector('.volume-value');
    if (valueElement) {
      valueElement.textContent = `${Math.round(this._volume * 100)}%`;
    }
  }

  /**
   * 设置音量
   */
  setVolume(volume: number): void {
    if (!this.player.element) return;

    volume = Math.max(0, Math.min(1, volume));
    this.player.element.volume = volume;
    this._volume = volume;

    if (volume > 0 && this._muted) {
      this.player.element.muted = false;
      this._muted = false;
    }

    this.updateUI();
  }

  /**
   * 切换静音状态
   */
  toggleMute(): void {
    if (!this.player.element) return;

    this.player.element.muted = !this.player.element.muted;
    this._muted = this.player.element.muted;
    this.updateUI();
  }

  // 事件处理方法
  private onVolumeChange(): void {
    this.updateVolumeState();
    this.updateUI();
  }

  private onButtonClick(): void {
    this.toggleMute();
  }

  private onSliderInput(event: Event): void {
    const slider = event.target as HTMLInputElement;
    const volume = parseInt(slider.value) / 100;
    this.setVolume(volume);
  }

  private onSliderMouseDown(): void {
    this._isDragging = true;
  }

  private onSliderMouseUp(): void {
    this._isDragging = false;
  }

  private onMouseEnter(): void {
    if (this.config.showSlider) {
      const sliderContainer = this.element.querySelector('.volume-slider-container');
      if (sliderContainer) {
        sliderContainer.classList.add('visible');
      }
    }
  }

  private onMouseLeave(): void {
    if (this.config.showSlider && !this._isDragging) {
      const sliderContainer = this.element.querySelector('.volume-slider-container');
      if (sliderContainer) {
        sliderContainer.classList.remove('visible');
      }
    }
  }

  /**
   * 获取当前音量
   */
  getVolume(): number {
    return this._volume;
  }

  /**
   * 获取静音状态
   */
  isMuted(): boolean {
    return this._muted;
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    // 移除事件监听器
    if (this.element) {
      const button = this.element.querySelector('.volume-button');
      if (button) {
        button.removeEventListener('click', this.onButtonClick.bind(this));
      }

      const slider = this.element.querySelector('.volume-slider');
      if (slider) {
        slider.removeEventListener('input', this.onSliderInput.bind(this));
        slider.removeEventListener('mousedown', this.onSliderMouseDown.bind(this));
        slider.removeEventListener('mouseup', this.onSliderMouseUp.bind(this));
      }

      this.element.removeEventListener('mouseenter', this.onMouseEnter.bind(this));
      this.element.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
    }

    // 移除DOM元素
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * 创建简化音量控制插件实例
 */
export function createSimpleVolumeControl(player: IPlayer, config?: SimpleVolumeControlConfig): SimpleVolumeControl {
  return new SimpleVolumeControl(player, config);
}
