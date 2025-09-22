/**
 * 简化播放按钮插件
 * 专为控制栏设计的播放按钮组件
 */

import type { IPlayer, PluginConfig } from '../types';

/**
 * 播放按钮配置接口
 */
export interface SimplePlayButtonConfig extends PluginConfig {
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 播放图标 */
  playIcon?: string;
  /** 暂停图标 */
  pauseIcon?: string;
  /** 加载图标 */
  loadingIcon?: string;
}

/**
 * 简化播放按钮插件类
 */
export class SimplePlayButton {
  public readonly name = 'simplePlayButton';
  public readonly player: IPlayer;
  public readonly config: SimplePlayButtonConfig;
  public element!: HTMLElement;

  private _isPlaying = false;
  private _isLoading = false;

  constructor(player: IPlayer, config: SimplePlayButtonConfig = {}) {
    this.player = player;
    this.config = {
      showLabel: false,
      playIcon: `<svg class="icon" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z"/>
      </svg>`,
      pauseIcon: `<svg class="icon" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
      </svg>`,
      loadingIcon: `<svg class="icon" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
        </circle>
      </svg>`,
      ...config
    };
  }

  /**
   * 初始化插件
   */
  async init(): Promise<void> {
    this.createElement();
    this.updatePlayingState();
    this.setupEventListeners();
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
   * 渲染播放按钮DOM结构
   */
  private render(): string {
    const { showLabel } = this.config;
    const icon = this.getCurrentIcon();
    const label = this.getCurrentLabel();

    return `
      <button class="ldesign-control-button ldesign-play-button" type="button" aria-label="${label}">
        ${icon}
        ${showLabel ? `<span class="label">${label}</span>` : ''}
      </button>
    `;
  }

  /**
   * 获取当前图标
   */
  private getCurrentIcon(): string {
    if (this._isLoading) {
      return this.config.loadingIcon || '';
    }
    return this._isPlaying ? (this.config.pauseIcon || '') : (this.config.playIcon || '');
  }

  /**
   * 获取当前标签
   */
  private getCurrentLabel(): string {
    if (this._isLoading) {
      return '加载中';
    }
    return this._isPlaying ? '暂停' : '播放';
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 直接监听视频元素事件
    if (this.player.element) {
      this.player.element.addEventListener('play', this.onPlay.bind(this));
      this.player.element.addEventListener('pause', this.onPause.bind(this));
      this.player.element.addEventListener('waiting', this.onWaiting.bind(this));
      this.player.element.addEventListener('canplay', this.onCanPlay.bind(this));
      this.player.element.addEventListener('ended', this.onEnded.bind(this));
    }

    // 按钮点击事件
    if (this.element) {
      const button = this.element.querySelector('button');
      if (button) {
        button.addEventListener('click', this.onButtonClick.bind(this));
      }
    }
  }

  /**
   * 更新播放状态
   */
  private updatePlayingState(): void {
    if (this.player.element) {
      this._isPlaying = !this.player.element.paused;
    }
  }

  /**
   * 更新按钮显示
   */
  private updateButton(): void {
    if (!this.element) return;

    const button = this.element.querySelector('button');
    if (!button) return;

    const icon = this.getCurrentIcon();
    const label = this.getCurrentLabel();

    // 更新图标
    const iconElement = button.querySelector('.icon');
    if (iconElement && icon) {
      iconElement.outerHTML = icon;
    }

    // 更新标签
    const labelElement = button.querySelector('.label');
    if (labelElement && this.config.showLabel) {
      labelElement.textContent = label;
    }

    // 更新 aria-label
    button.setAttribute('aria-label', label);
    button.disabled = this._isLoading;
  }

  // 事件处理方法
  private onPlay(): void {
    this._isPlaying = true;
    this._isLoading = false;
    this.updateButton();
  }

  private onPause(): void {
    this._isPlaying = false;
    this._isLoading = false;
    this.updateButton();
  }

  private onWaiting(): void {
    this._isLoading = true;
    this.updateButton();
  }

  private onCanPlay(): void {
    this._isLoading = false;
    this.updateButton();
  }

  private onEnded(): void {
    this._isPlaying = false;
    this._isLoading = false;
    this.updateButton();
  }

  private async onButtonClick(): Promise<void> {
    if (!this.player.element) return;

    try {
      if (this._isPlaying) {
        this.player.element.pause();
      } else {
        this._isLoading = true;
        this.updateButton();
        await this.player.element.play();
      }
    } catch (error) {
      this._isLoading = false;
      this.updateButton();
      console.error('Play/pause error:', error);
    }
  }

  /**
   * 获取当前播放状态
   */
  isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * 获取当前加载状态
   */
  isLoading(): boolean {
    return this._isLoading;
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    // 移除按钮事件监听器
    if (this.element) {
      const button = this.element.querySelector('button');
      if (button) {
        button.removeEventListener('click', this.onButtonClick.bind(this));
      }
    }

    // 移除DOM元素
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * 创建简化播放按钮插件实例
 */
export function createSimplePlayButton(player: IPlayer, config?: SimplePlayButtonConfig): SimplePlayButton {
  return new SimplePlayButton(player, config);
}
