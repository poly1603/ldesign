/**
 * 播放按钮插件
 * 提供播放/暂停控制功能
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata } from '../types';
import { PluginPosition } from '../types';
import { UIPluginConfig } from '../core/Plugin';

/**
 * 播放按钮配置
 */
export interface PlayButtonConfig extends UIPluginConfig {
  showLabel?: boolean;
  playIcon?: string;
  pauseIcon?: string;
  loadingIcon?: string;
}

/**
 * 播放按钮插件
 */
export class PlayButton extends Plugin {
  private isPlaying = false;
  private isLoading = false;

  constructor(player: IPlayer, config: PlayButtonConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'playButton',
      version: '1.0.0',
      type: 'ui',
      description: 'Play/Pause button control'
    };

    const defaultConfig: PlayButtonConfig = {
      position: PluginPosition.CONTROLS_LEFT,
      className: 'ldesign-play-button',
      showLabel: false,
      playIcon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>`,
      pauseIcon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>`,
      loadingIcon: `<svg class="ldesign-icon ldesign-spinner" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>`,
      ...config
    };

    super(player, defaultConfig, metadata);
  }

  protected render(): string {
    const config = this._uiConfig as PlayButtonConfig;
    const icon = this.isLoading
      ? config.loadingIcon
      : this.isPlaying
        ? config.pauseIcon
        : config.playIcon;

    const label = config.showLabel
      ? `<span class="ldesign-button-label">${this.isPlaying ? 'Pause' : 'Play'}</span>`
      : '';

    return `
      <button class="ldesign-control-button" type="button" aria-label="${this.isPlaying ? 'Pause' : 'Play'}">
        ${icon}
        ${label}
      </button>
    `;
  }

  protected async onUIInit(): Promise<void> {
    // 监听播放器状态变化
    this.on('media:play', () => {
      this.isPlaying = true;
      this.isLoading = false;
      this.updateButton();
    });

    this.on('media:pause', () => {
      this.isPlaying = false;
      this.isLoading = false;
      this.updateButton();
    });

    this.on('media:waiting', () => {
      this.isLoading = true;
      this.updateButton();
    });

    this.on('media:canplay', () => {
      this.isLoading = false;
      this.updateButton();
    });

    this.on('media:ended', () => {
      this.isPlaying = false;
      this.isLoading = false;
      this.updateButton();
    });

    // 初始化状态
    this.isPlaying = !this.player.paused;
  }

  protected bindUIEvents(): void {
    if (!this._element) return;

    const button = this._element.querySelector('button');
    if (button) {
      button.addEventListener('click', this.handleClick.bind(this));
    }
  }

  protected unbindUIEvents(): void {
    if (!this._element) return;

    const button = this._element.querySelector('button');
    if (button) {
      button.removeEventListener('click', this.handleClick.bind(this));
    }
  }

  private async handleClick(): Promise<void> {
    try {
      if (this.isPlaying) {
        this.player.pause();
      } else {
        this.isLoading = true;
        this.updateButton();
        await this.player.play();
      }
    } catch (error) {
      this.isLoading = false;
      this.updateButton();
      console.error('Play/pause error:', error);
    }
  }

  private updateButton(): void {
    if (!this._element) return;

    const button = this._element.querySelector('button');
    if (!button) return;

    const config = this._uiConfig as PlayButtonConfig;
    const icon = this.isLoading
      ? config.loadingIcon
      : this.isPlaying
        ? config.pauseIcon
        : config.playIcon;

    const iconElement = button.querySelector('.ldesign-icon');
    if (iconElement) {
      iconElement.outerHTML = icon || '';
    }

    const labelElement = button.querySelector('.ldesign-button-label');
    if (labelElement) {
      labelElement.textContent = this.isPlaying ? 'Pause' : 'Play';
    }

    button.setAttribute('aria-label', this.isPlaying ? 'Pause' : 'Play');
    button.disabled = this.isLoading;
  }
}

/**
 * 创建播放按钮插件
 */
export function createPlayButton(player: IPlayer, config?: PlayButtonConfig): PlayButton {
  return new PlayButton(player, config);
}
