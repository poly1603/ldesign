/**
 * 全屏按钮插件
 * 提供全屏切换功能
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata, PluginPosition } from '../types';
import { UIPluginConfig } from '../core/Plugin';

/**
 * 全屏按钮配置
 */
export interface FullscreenButtonConfig extends UIPluginConfig {
  showLabel?: boolean;
  enterIcon?: string;
  exitIcon?: string;
}

/**
 * 全屏按钮插件
 */
export class FullscreenButton extends Plugin {
  private isFullscreen = false;

  constructor(player: IPlayer, config: FullscreenButtonConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'fullscreenButton',
      version: '1.0.0',
      type: 'ui',
      description: 'Fullscreen toggle button'
    };

    const defaultConfig: FullscreenButtonConfig = {
      position: PluginPosition.CONTROLS_RIGHT,
      className: 'ldesign-fullscreen-button',
      showLabel: false,
      enterIcon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>`,
      exitIcon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
      </svg>`,
      ...config
    };

    super(player, defaultConfig, metadata);
  }

  protected render(): string {
    const config = this._uiConfig as FullscreenButtonConfig;
    const icon = this.isFullscreen ? config.exitIcon : config.enterIcon;
    const label = config.showLabel 
      ? `<span class="ldesign-button-label">${this.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>`
      : '';

    return `
      <button class="ldesign-control-button" type="button" aria-label="${this.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}">
        ${icon}
        ${label}
      </button>
    `;
  }

  protected async onUIInit(): Promise<void> {
    // 监听全屏状态变化
    this.on('fullscreen:enter', () => {
      this.isFullscreen = true;
      this.updateButton();
    });

    this.on('fullscreen:exit', () => {
      this.isFullscreen = false;
      this.updateButton();
    });

    this.on('fullscreen:change', (data) => {
      this.isFullscreen = data.isFullscreen;
      this.updateButton();
    });

    // 监听键盘事件
    document.addEventListener('keydown', this.handleKeyDown.bind(this));

    // 初始化状态
    this.isFullscreen = this.player.isFullscreen;
  }

  protected async onUIDestroy(): Promise<void> {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
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
      if (this.isFullscreen) {
        await this.player.exitFullscreen();
      } else {
        await this.player.enterFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle error:', error);
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // F11 或 Escape 键处理
    if (event.key === 'F11') {
      event.preventDefault();
      this.handleClick();
    } else if (event.key === 'Escape' && this.isFullscreen) {
      // Escape 键退出全屏
      this.player.exitFullscreen();
    }
  }

  private updateButton(): void {
    if (!this._element) return;

    const button = this._element.querySelector('button');
    if (!button) return;

    const config = this._uiConfig as FullscreenButtonConfig;
    const icon = this.isFullscreen ? config.exitIcon : config.enterIcon;

    const iconElement = button.querySelector('.ldesign-icon');
    if (iconElement) {
      iconElement.outerHTML = icon || '';
    }

    const labelElement = button.querySelector('.ldesign-button-label');
    if (labelElement) {
      labelElement.textContent = this.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
    }

    button.setAttribute('aria-label', this.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
  }
}

/**
 * 创建全屏按钮插件
 */
export function createFullscreenButton(player: IPlayer, config?: FullscreenButtonConfig): FullscreenButton {
  return new FullscreenButton(player, config);
}
