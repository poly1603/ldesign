/**
 * 简化全屏按钮插件
 * 专为控制栏设计的全屏控制组件
 */

import type { IPlayer, PluginConfig } from '../types';

/**
 * 全屏按钮配置接口
 */
export interface SimpleFullscreenButtonConfig extends PluginConfig {
  /** 是否显示标签 */
  showLabel?: boolean;
  /** 进入全屏图标 */
  enterIcon?: string;
  /** 退出全屏图标 */
  exitIcon?: string;
}

/**
 * 简化全屏按钮插件类
 */
export class SimpleFullscreenButton {
  public readonly name = 'simpleFullscreenButton';
  public readonly player: IPlayer;
  public readonly config: SimpleFullscreenButtonConfig;
  public element!: HTMLElement;

  private _isFullscreen = false;

  constructor(player: IPlayer, config: SimpleFullscreenButtonConfig = {}) {
    this.player = player;
    this.config = {
      showLabel: false,
      enterIcon: `<svg class="icon" viewBox="0 0 24 24">
        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
      </svg>`,
      exitIcon: `<svg class="icon" viewBox="0 0 24 24">
        <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
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
    this.updateFullscreenState();
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
   * 渲染全屏按钮DOM结构
   */
  private render(): string {
    const { showLabel, enterIcon } = this.config;

    return `
      <button class="ldesign-control-button ldesign-fullscreen-button" type="button" aria-label="全屏">
        ${enterIcon}
        ${showLabel ? '<span class="label">全屏</span>' : ''}
      </button>
    `;
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 全屏状态变化事件
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));

    // 按钮点击事件
    if (this.element) {
      const button = this.element.querySelector('button');
      if (button) {
        button.addEventListener('click', this.onButtonClick.bind(this));
      }
    }
  }

  /**
   * 检查是否支持全屏API
   */
  private isFullscreenSupported(): boolean {
    const element = this.player.container;
    return !!(
      element.requestFullscreen ||
      (element as any).webkitRequestFullscreen ||
      (element as any).mozRequestFullScreen ||
      (element as any).msRequestFullscreen
    );
  }

  /**
   * 进入全屏
   */
  private async enterFullscreen(): Promise<void> {
    const element = this.player.container;

    try {
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      console.error('fullscreenError', { error, action: 'enter' });
    }
  }

  /**
   * 退出全屏
   */
  private async exitFullscreen(): Promise<void> {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
      console.error('fullscreenError', { error, action: 'exit' });
    }
  }

  /**
   * 切换全屏状态
   */
  private async toggleFullscreen(): Promise<void> {
    if (this._isFullscreen) {
      await this.exitFullscreen();
    } else {
      await this.enterFullscreen();
    }
  }

  /**
   * 更新全屏状态
   */
  private updateFullscreenState(): void {
    const isFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (isFullscreen !== this._isFullscreen) {
      this._isFullscreen = isFullscreen;
      this.updateButton();

      // 触发全屏状态变化事件
      console.log('fullscreenChange', { isFullscreen });

      // 更新播放器容器的全屏类
      if (isFullscreen) {
        this.player.container.classList.add('fullscreen');
      } else {
        this.player.container.classList.remove('fullscreen');
      }
    }
  }

  /**
   * 更新按钮显示
   */
  private updateButton(): void {
    if (!this.element) return;

    const button = this.element.querySelector('button');
    if (!button) return;

    const { enterIcon, exitIcon, showLabel } = this.config;
    const icon = this._isFullscreen ? exitIcon : enterIcon;
    const label = this._isFullscreen ? '退出全屏' : '全屏';

    // 更新图标
    const iconElement = button.querySelector('.icon');
    if (iconElement && icon) {
      iconElement.outerHTML = icon;
    }

    // 更新标签
    const labelElement = button.querySelector('.label');
    if (labelElement && showLabel) {
      labelElement.textContent = label;
    }

    // 更新 aria-label
    button.setAttribute('aria-label', label);
  }

  // 事件处理方法
  private onFullscreenChange(): void {
    this.updateFullscreenState();
  }

  private async onButtonClick(): Promise<void> {
    if (!this.isFullscreenSupported()) {
      console.warn('Fullscreen API is not supported');
      console.error('fullscreenError', {
        error: new Error('Fullscreen API is not supported'),
        action: 'toggle'
      });
      return;
    }

    await this.toggleFullscreen();
  }

  /**
   * 获取当前全屏状态
   */
  isFullscreen(): boolean {
    return this._isFullscreen;
  }

  /**
   * 强制进入全屏
   */
  async requestFullscreen(): Promise<void> {
    if (!this._isFullscreen) {
      await this.enterFullscreen();
    }
  }

  /**
   * 强制退出全屏
   */
  async exitFullscreenMode(): Promise<void> {
    if (this._isFullscreen) {
      await this.exitFullscreen();
    }
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    // 移除全屏事件监听器
    document.removeEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('mozfullscreenchange', this.onFullscreenChange.bind(this));
    document.removeEventListener('MSFullscreenChange', this.onFullscreenChange.bind(this));

    // 移除按钮事件监听器
    if (this.element) {
      const button = this.element.querySelector('button');
      if (button) {
        button.removeEventListener('click', this.onButtonClick.bind(this));
      }
    }

    // 如果当前是全屏状态，退出全屏
    if (this._isFullscreen) {
      this.exitFullscreen();
    }

    // 移除DOM元素
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * 创建简化全屏按钮插件实例
 */
export function createSimpleFullscreenButton(player: IPlayer, config?: SimpleFullscreenButtonConfig): SimpleFullscreenButton {
  return new SimpleFullscreenButton(player, config);
}
