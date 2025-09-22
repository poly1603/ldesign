/**
 * 画中画插件
 * 提供画中画模式功能
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata, PluginPosition } from '../types';
import { UIPluginConfig } from '../core/Plugin';

/**
 * 画中画配置
 */
export interface PictureInPictureConfig extends UIPluginConfig {
  showLabel?: boolean;
  enterIcon?: string;
  exitIcon?: string;
  autoEnterOnMinimize?: boolean;
}

/**
 * 画中画插件
 */
export class PictureInPicture extends Plugin {
  private isPiPActive = false;
  private isSupported = false;

  constructor(player: IPlayer, config: PictureInPictureConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'pictureInPicture',
      version: '1.0.0',
      type: 'ui',
      description: 'Picture-in-Picture mode toggle'
    };

    const defaultConfig: PictureInPictureConfig = {
      position: PluginPosition.CONTROLS_RIGHT,
      className: 'ldesign-pip-button',
      showLabel: false,
      autoEnterOnMinimize: false,
      enterIcon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M19 11h-8v6h8v-6zm4 8V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zm-2 .02H3V4.97h18v14.05z"/>
      </svg>`,
      exitIcon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"/>
      </svg>`,
      ...config
    };

    super(player, defaultConfig, metadata);
  }

  protected render(): string {
    if (!this.isSupported) {
      return '';
    }

    const config = this._uiConfig as PictureInPictureConfig;
    const icon = this.isPiPActive ? config.exitIcon : config.enterIcon;
    const label = config.showLabel 
      ? `<span class="ldesign-button-label">${this.isPiPActive ? 'Exit PiP' : 'Picture in Picture'}</span>`
      : '';

    return `
      <button class="ldesign-control-button" type="button" aria-label="${this.isPiPActive ? 'Exit picture-in-picture' : 'Enter picture-in-picture'}">
        ${icon}
        ${label}
      </button>
    `;
  }

  protected async onUIInit(): Promise<void> {
    // 检查浏览器支持
    this.isSupported = this.checkSupport();
    
    if (!this.isSupported) {
      this.hide();
      return;
    }

    // 监听画中画事件
    this.player.element.addEventListener('enterpictureinpicture', this.handleEnterPiP.bind(this));
    this.player.element.addEventListener('leavepictureinpicture', this.handleLeavePiP.bind(this));

    // 监听页面可见性变化
    if ((this._uiConfig as PictureInPictureConfig).autoEnterOnMinimize) {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }

    // 初始化状态
    this.isPiPActive = document.pictureInPictureElement === this.player.element;
  }

  protected async onUIDestroy(): Promise<void> {
    if (this.isSupported) {
      this.player.element.removeEventListener('enterpictureinpicture', this.handleEnterPiP.bind(this));
      this.player.element.removeEventListener('leavepictureinpicture', this.handleLeavePiP.bind(this));
      document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }

  protected bindUIEvents(): void {
    if (!this._element || !this.isSupported) return;

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

  private checkSupport(): boolean {
    return !!(document as any).pictureInPictureEnabled && 
           !this.player.element.disablePictureInPicture &&
           typeof (this.player.element as any).requestPictureInPicture === 'function';
  }

  private async handleClick(): Promise<void> {
    try {
      if (this.isPiPActive) {
        await this.exitPictureInPicture();
      } else {
        await this.enterPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-Picture toggle error:', error);
      this.emit('pip:error', { error });
    }
  }

  private async enterPictureInPicture(): Promise<void> {
    if (!this.isSupported || this.isPiPActive) return;

    try {
      await (this.player.element as any).requestPictureInPicture();
    } catch (error) {
      throw new Error(`Failed to enter picture-in-picture: ${error}`);
    }
  }

  private async exitPictureInPicture(): Promise<void> {
    if (!this.isSupported || !this.isPiPActive) return;

    try {
      await (document as any).exitPictureInPicture();
    } catch (error) {
      throw new Error(`Failed to exit picture-in-picture: ${error}`);
    }
  }

  private handleEnterPiP(): void {
    this.isPiPActive = true;
    this.updateButton();
    this.emit('pip:enter', { element: this.player.element });
  }

  private handleLeavePiP(): void {
    this.isPiPActive = false;
    this.updateButton();
    this.emit('pip:exit', { element: this.player.element });
  }

  private handleVisibilityChange(): void {
    const config = this._uiConfig as PictureInPictureConfig;
    
    if (config.autoEnterOnMinimize && 
        document.hidden && 
        !this.player.paused && 
        !this.isPiPActive) {
      this.enterPictureInPicture().catch(console.error);
    }
  }

  private updateButton(): void {
    if (!this._element) return;

    const button = this._element.querySelector('button');
    if (!button) return;

    const config = this._uiConfig as PictureInPictureConfig;
    const icon = this.isPiPActive ? config.exitIcon : config.enterIcon;

    const iconElement = button.querySelector('.ldesign-icon');
    if (iconElement) {
      iconElement.outerHTML = icon || '';
    }

    const labelElement = button.querySelector('.ldesign-button-label');
    if (labelElement) {
      labelElement.textContent = this.isPiPActive ? 'Exit PiP' : 'Picture in Picture';
    }

    button.setAttribute('aria-label', this.isPiPActive ? 'Exit picture-in-picture' : 'Enter picture-in-picture');
  }

  /**
   * 获取画中画支持状态
   */
  public get supported(): boolean {
    return this.isSupported;
  }

  /**
   * 获取当前画中画状态
   */
  public get active(): boolean {
    return this.isPiPActive;
  }
}

/**
 * 创建画中画插件
 */
export function createPictureInPicture(player: IPlayer, config?: PictureInPictureConfig): PictureInPicture {
  return new PictureInPicture(player, config);
}
