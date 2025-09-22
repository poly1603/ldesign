/**
 * 简化播放速度控制插件
 * 专为控制栏设计的播放速度控制组件
 */

import type { IPlayer, PluginConfig } from '../types';

/**
 * 播放速度控制配置接口
 */
export interface SimplePlaybackRateConfig extends PluginConfig {
  /** 可选的播放速度 */
  rates?: number[];
  /** 默认播放速度 */
  defaultRate?: number;
  /** 是否显示速度标签 */
  showLabel?: boolean;
}

/**
 * 简化播放速度控制插件类
 */
export class SimplePlaybackRate {
  public readonly name = 'simplePlaybackRate';
  public readonly player: IPlayer;
  public readonly config: SimplePlaybackRateConfig;
  public element!: HTMLElement;

  private _currentRate = 1;
  private _isMenuOpen = false;

  constructor(player: IPlayer, config: SimplePlaybackRateConfig = {}) {
    this.player = player;
    this.config = {
      rates: [0.5, 0.75, 1, 1.25, 1.5, 2],
      defaultRate: 1,
      showLabel: true,
      ...config
    };
    this._currentRate = this.config.defaultRate || 1;
  }

  /**
   * 初始化插件
   */
  async init(): Promise<void> {
    this.createElement();
    this.setupEventListeners();
    this.updatePlaybackRate();
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
   * 渲染播放速度控制DOM结构
   */
  private render(): string {
    const { showLabel, rates } = this.config;
    const rateText = this._currentRate === 1 ? '倍速' : `${this._currentRate}x`;

    return `
      <div class="ldesign-playback-rate">
        <button class="ldesign-control-button rate-button" type="button" aria-label="播放速度">
          ${showLabel ? `<span class="rate-text">${rateText}</span>` : '⚡'}
        </button>
        <div class="rate-menu ${this._isMenuOpen ? 'open' : ''}">
          ${rates?.map(rate => `
            <button 
              class="rate-option ${rate === this._currentRate ? 'active' : ''}" 
              data-rate="${rate}"
              type="button"
            >
              ${rate === 1 ? '正常' : `${rate}x`}
            </button>
          `).join('') || ''}
        </div>
      </div>
    `;
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 直接监听视频元素事件
    if (this.player.element) {
      this.player.element.addEventListener('ratechange', this.onRateChange.bind(this));
    }

    // DOM 事件
    if (this.element) {
      const button = this.element.querySelector('.rate-button');
      if (button) {
        button.addEventListener('click', this.onButtonClick.bind(this));
      }

      // 速度选项点击事件
      const options = this.element.querySelectorAll('.rate-option');
      options.forEach(option => {
        option.addEventListener('click', this.onOptionClick.bind(this));
      });

      // 点击外部关闭菜单
      document.addEventListener('click', this.onDocumentClick.bind(this));
    }
  }

  /**
   * 更新播放速度
   */
  private updatePlaybackRate(): void {
    if (this.player.element) {
      this.player.element.playbackRate = this._currentRate;
    }
  }

  /**
   * 更新UI显示
   */
  private updateUI(): void {
    if (!this.element) return;

    // 更新按钮文本
    const button = this.element.querySelector('.rate-button');
    if (button && this.config.showLabel) {
      const rateText = this._currentRate === 1 ? '倍速' : `${this._currentRate}x`;
      const textElement = button.querySelector('.rate-text');
      if (textElement) {
        textElement.textContent = rateText;
      }
    }

    // 更新选项状态
    const options = this.element.querySelectorAll('.rate-option');
    options.forEach(option => {
      const rate = parseFloat(option.getAttribute('data-rate') || '1');
      if (rate === this._currentRate) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }

  /**
   * 设置播放速度
   */
  setPlaybackRate(rate: number): void {
    if (!this.config.rates?.includes(rate)) {
      console.warn(`Unsupported playback rate: ${rate}`);
      return;
    }

    this._currentRate = rate;
    this.updatePlaybackRate();
    this.updateUI();
    this.closeMenu();
  }

  /**
   * 打开菜单
   */
  openMenu(): void {
    this._isMenuOpen = true;
    const menu = this.element.querySelector('.rate-menu');
    if (menu) {
      menu.classList.add('open');
    }
  }

  /**
   * 关闭菜单
   */
  closeMenu(): void {
    this._isMenuOpen = false;
    const menu = this.element.querySelector('.rate-menu');
    if (menu) {
      menu.classList.remove('open');
    }
  }

  /**
   * 切换菜单状态
   */
  toggleMenu(): void {
    if (this._isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  // 事件处理方法
  private onRateChange(): void {
    if (this.player.element) {
      this._currentRate = this.player.element.playbackRate;
      this.updateUI();
    }
  }

  private onButtonClick(event: Event): void {
    event.stopPropagation();
    this.toggleMenu();
  }

  private onOptionClick(event: Event): void {
    event.stopPropagation();
    const option = event.target as HTMLElement;
    const rate = parseFloat(option.getAttribute('data-rate') || '1');
    this.setPlaybackRate(rate);
  }

  private onDocumentClick(event: Event): void {
    if (this._isMenuOpen && this.element && !this.element.contains(event.target as Node)) {
      this.closeMenu();
    }
  }

  /**
   * 获取当前播放速度
   */
  getCurrentRate(): number {
    return this._currentRate;
  }

  /**
   * 获取可用播放速度列表
   */
  getAvailableRates(): number[] {
    return this.config.rates || [1];
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    // 移除事件监听器
    if (this.element) {
      const button = this.element.querySelector('.rate-button');
      if (button) {
        button.removeEventListener('click', this.onButtonClick.bind(this));
      }

      const options = this.element.querySelectorAll('.rate-option');
      options.forEach(option => {
        option.removeEventListener('click', this.onOptionClick.bind(this));
      });
    }

    document.removeEventListener('click', this.onDocumentClick.bind(this));

    // 移除DOM元素
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * 创建简化播放速度控制插件实例
 */
export function createSimplePlaybackRate(player: IPlayer, config?: SimplePlaybackRateConfig): SimplePlaybackRate {
  return new SimplePlaybackRate(player, config);
}
