/**
 * 音量控制插件
 * 提供音量调节和静音功能
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata, PluginPosition } from '../types';
import { UIPluginConfig } from '../core/Plugin';
import { mouseUtils } from '../utils/eventUtils';

/**
 * 音量控制配置
 */
export interface VolumeControlConfig extends UIPluginConfig {
  showSlider?: boolean;
  showPercentage?: boolean;
  orientation?: 'horizontal' | 'vertical';
  muteIcon?: string;
  volumeIcon?: string;
  volumeLowIcon?: string;
  volumeHighIcon?: string;
}

/**
 * 音量控制插件
 */
export class VolumeControl extends Plugin {
  private volume = 1;
  private muted = false;
  private isDragging = false;
  private previousVolume = 1;

  constructor(player: IPlayer, config: VolumeControlConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'volumeControl',
      version: '1.0.0',
      type: 'ui',
      description: 'Volume control with mute functionality'
    };

    const defaultConfig: VolumeControlConfig = {
      position: PluginPosition.CONTROLS_RIGHT,
      className: 'ldesign-volume-control',
      showSlider: true,
      showPercentage: false,
      orientation: 'horizontal',
      muteIcon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
      </svg>`,
      volumeIcon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>`,
      volumeLowIcon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
      </svg>`,
      volumeHighIcon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>`,
      ...config
    };

    super(player, defaultConfig, metadata);
  }

  protected render(): string {
    const config = this._uiConfig as VolumeControlConfig;
    const icon = this.getVolumeIcon();
    
    return `
      <div class="ldesign-volume">
        <button class="ldesign-control-button ldesign-volume-button" type="button" aria-label="${this.muted ? 'Unmute' : 'Mute'}">
          ${icon}
        </button>
        ${config.showSlider ? this.renderSlider() : ''}
        ${config.showPercentage ? `<span class="ldesign-volume-percentage">${Math.round(this.volume * 100)}%</span>` : ''}
      </div>
    `;
  }

  private renderSlider(): string {
    const config = this._uiConfig as VolumeControlConfig;
    const isVertical = config.orientation === 'vertical';
    
    return `
      <div class="ldesign-volume-slider ${isVertical ? 'ldesign-volume-slider-vertical' : ''}" 
           role="slider" 
           aria-label="Volume" 
           aria-valuemin="0" 
           aria-valuemax="100" 
           aria-valuenow="${Math.round(this.volume * 100)}">
        <div class="ldesign-volume-track"></div>
        <div class="ldesign-volume-level"></div>
        <div class="ldesign-volume-thumb"></div>
      </div>
    `;
  }

  protected async onUIInit(): Promise<void> {
    // 监听播放器音量变化
    this.on('media:volumechange', () => {
      this.volume = this.player.volume;
      this.muted = this.player.muted;
      this.updateDisplay();
    });

    // 初始化状态
    this.volume = this.player.volume;
    this.muted = this.player.muted;
    this.previousVolume = this.volume || 1;
  }

  protected bindUIEvents(): void {
    if (!this._element) return;

    // 静音按钮事件
    const button = this._element.querySelector('.ldesign-volume-button');
    if (button) {
      button.addEventListener('click', this.handleMuteClick.bind(this));
    }

    // 滑块事件
    const slider = this._element.querySelector('.ldesign-volume-slider');
    if (slider) {
      slider.addEventListener('mousedown', this.handleSliderMouseDown.bind(this));
      slider.addEventListener('click', this.handleSliderClick.bind(this));
      slider.addEventListener('wheel', this.handleWheel.bind(this));
      slider.addEventListener('keydown', this.handleKeyDown.bind(this));
      
      document.addEventListener('mousemove', this.handleMouseMove.bind(this));
      document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }
  }

  protected unbindUIEvents(): void {
    if (!this._element) return;

    const button = this._element.querySelector('.ldesign-volume-button');
    if (button) {
      button.removeEventListener('click', this.handleMuteClick.bind(this));
    }

    const slider = this._element.querySelector('.ldesign-volume-slider');
    if (slider) {
      slider.removeEventListener('mousedown', this.handleSliderMouseDown.bind(this));
      slider.removeEventListener('click', this.handleSliderClick.bind(this));
      slider.removeEventListener('wheel', this.handleWheel.bind(this));
      slider.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }

    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleMuteClick(): void {
    if (this.muted) {
      this.player.muted = false;
      this.player.volume = this.previousVolume;
    } else {
      this.previousVolume = this.volume || 1;
      this.player.muted = true;
    }
  }

  private handleSliderClick(event: MouseEvent): void {
    if (this.isDragging) return;

    const slider = this._element!.querySelector('.ldesign-volume-slider') as HTMLElement;
    const config = this._uiConfig as VolumeControlConfig;
    
    let percentage: number;
    if (config.orientation === 'vertical') {
      percentage = 1 - mouseUtils.getRelativePercentage(event, slider).y;
    } else {
      percentage = mouseUtils.getRelativePercentage(event, slider).x;
    }
    
    this.setVolume(Math.max(0, Math.min(1, percentage)));
  }

  private handleSliderMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return;

    this.isDragging = true;
    event.preventDefault();
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;

    const slider = this._element!.querySelector('.ldesign-volume-slider') as HTMLElement;
    const config = this._uiConfig as VolumeControlConfig;
    
    let percentage: number;
    if (config.orientation === 'vertical') {
      percentage = 1 - mouseUtils.getRelativePercentage(event, slider).y;
    } else {
      percentage = mouseUtils.getRelativePercentage(event, slider).x;
    }
    
    this.setVolume(Math.max(0, Math.min(1, percentage)));
  }

  private handleMouseUp(): void {
    this.isDragging = false;
  }

  private handleWheel(event: WheelEvent): void {
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? -0.05 : 0.05;
    const newVolume = Math.max(0, Math.min(1, this.volume + delta));
    
    this.setVolume(newVolume);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const config = this._uiConfig as VolumeControlConfig;
    const step = 0.1;

    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        event.preventDefault();
        this.setVolume(Math.min(1, this.volume + step));
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        event.preventDefault();
        this.setVolume(Math.max(0, this.volume - step));
        break;
      case 'Home':
        event.preventDefault();
        this.setVolume(1);
        break;
      case 'End':
        event.preventDefault();
        this.setVolume(0);
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.handleMuteClick();
        break;
    }
  }

  private setVolume(volume: number): void {
    this.volume = volume;
    this.player.volume = volume;
    
    if (volume > 0 && this.muted) {
      this.player.muted = false;
    }
    
    this.updateDisplay();
  }

  private updateDisplay(): void {
    this.updateIcon();
    this.updateSlider();
    this.updatePercentage();
    this.updateAriaValues();
  }

  private updateIcon(): void {
    const button = this._element!.querySelector('.ldesign-volume-button');
    if (!button) return;

    const icon = this.getVolumeIcon();
    const iconElement = button.querySelector('.ldesign-icon');
    if (iconElement) {
      iconElement.outerHTML = icon;
    }

    button.setAttribute('aria-label', this.muted ? 'Unmute' : 'Mute');
  }

  private updateSlider(): void {
    const levelElement = this._element!.querySelector('.ldesign-volume-level') as HTMLElement;
    const thumbElement = this._element!.querySelector('.ldesign-volume-thumb') as HTMLElement;
    
    if (!levelElement || !thumbElement) return;

    const config = this._uiConfig as VolumeControlConfig;
    const percentage = this.muted ? 0 : this.volume;
    
    if (config.orientation === 'vertical') {
      levelElement.style.height = `${percentage * 100}%`;
      thumbElement.style.bottom = `${percentage * 100}%`;
    } else {
      levelElement.style.width = `${percentage * 100}%`;
      thumbElement.style.left = `${percentage * 100}%`;
    }
  }

  private updatePercentage(): void {
    const percentageElement = this._element!.querySelector('.ldesign-volume-percentage');
    if (percentageElement) {
      percentageElement.textContent = `${Math.round(this.volume * 100)}%`;
    }
  }

  private updateAriaValues(): void {
    const slider = this._element!.querySelector('.ldesign-volume-slider');
    if (slider) {
      const percentage = Math.round(this.volume * 100);
      slider.setAttribute('aria-valuenow', percentage.toString());
      slider.setAttribute('aria-valuetext', `${percentage}%`);
    }
  }

  private getVolumeIcon(): string {
    const config = this._uiConfig as VolumeControlConfig;
    
    if (this.muted || this.volume === 0) {
      return config.muteIcon || '';
    } else if (this.volume < 0.5) {
      return config.volumeLowIcon || config.volumeIcon || '';
    } else {
      return config.volumeHighIcon || config.volumeIcon || '';
    }
  }
}

/**
 * 创建音量控制插件
 */
export function createVolumeControl(player: IPlayer, config?: VolumeControlConfig): VolumeControl {
  return new VolumeControl(player, config);
}
