/**
 * 时间显示插件
 * 显示当前播放时间和总时长
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata, PluginPosition } from '../types';
import { UIPluginConfig } from '../core/Plugin';

/**
 * 时间显示配置
 */
export interface TimeDisplayConfig extends UIPluginConfig {
  format?: 'current' | 'remaining' | 'both';
  separator?: string;
  showHours?: boolean;
  clickToToggle?: boolean;
}

/**
 * 时间显示插件
 */
export class TimeDisplay extends Plugin {
  private currentTime = 0;
  private duration = 0;
  private showRemaining = false;

  constructor(player: IPlayer, config: TimeDisplayConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'timeDisplay',
      version: '1.0.0',
      type: 'ui',
      description: 'Display current time and duration'
    };

    const defaultConfig: TimeDisplayConfig = {
      position: PluginPosition.CONTROLS_RIGHT,
      className: 'ldesign-time-display',
      format: 'both',
      separator: ' / ',
      showHours: true,
      clickToToggle: true,
      ...config
    };

    super(player, defaultConfig, metadata);
  }

  protected render(): string {
    const config = this._uiConfig as TimeDisplayConfig;
    const timeText = this.getTimeText();

    return `
      <div class="ldesign-time" ${config.clickToToggle ? 'role="button" tabindex="0"' : ''} aria-label="Time display">
        <span class="ldesign-time-text">${timeText}</span>
      </div>
    `;
  }

  protected async onUIInit(): Promise<void> {
    // 监听时间更新
    this.on('media:timeupdate', (data) => {
      this.currentTime = data.currentTime;
      this.duration = data.duration;
      this.updateDisplay();
    });

    this.on('media:loadedmetadata', (data) => {
      this.duration = data.duration;
      this.updateDisplay();
    });

    this.on('media:durationchange', (data) => {
      this.duration = data.duration;
      this.updateDisplay();
    });

    // 初始化状态
    this.currentTime = this.player.currentTime;
    this.duration = this.player.duration;
  }

  protected bindUIEvents(): void {
    if (!this._element) return;

    const config = this._uiConfig as TimeDisplayConfig;
    if (config.clickToToggle) {
      const timeElement = this._element.querySelector('.ldesign-time');
      if (timeElement) {
        timeElement.addEventListener('click', this.handleClick.bind(this));
        timeElement.addEventListener('keydown', this.handleKeyDown.bind(this));
      }
    }
  }

  protected unbindUIEvents(): void {
    if (!this._element) return;

    const timeElement = this._element.querySelector('.ldesign-time');
    if (timeElement) {
      timeElement.removeEventListener('click', this.handleClick.bind(this));
      timeElement.removeEventListener('keydown', this.handleKeyDown.bind(this));
    }
  }

  private handleClick(): void {
    const config = this._uiConfig as TimeDisplayConfig;
    if (config.format === 'both') {
      this.showRemaining = !this.showRemaining;
      this.updateDisplay();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick();
    }
  }

  private updateDisplay(): void {
    if (!this._element) return;

    const textElement = this._element.querySelector('.ldesign-time-text');
    if (textElement) {
      textElement.textContent = this.getTimeText();
    }
  }

  private getTimeText(): string {
    const config = this._uiConfig as TimeDisplayConfig;
    
    switch (config.format) {
      case 'current':
        return this.formatTime(this.currentTime);
      
      case 'remaining':
        const remaining = Math.max(0, this.duration - this.currentTime);
        return `-${this.formatTime(remaining)}`;
      
      case 'both':
      default:
        if (this.showRemaining) {
          const remaining = Math.max(0, this.duration - this.currentTime);
          return `-${this.formatTime(remaining)}`;
        } else {
          const current = this.formatTime(this.currentTime);
          const total = this.formatTime(this.duration);
          return `${current}${config.separator}${total}`;
        }
    }
  }

  private formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00';

    const config = this._uiConfig as TimeDisplayConfig;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (config.showHours && (hours > 0 || this.duration >= 3600)) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * 切换显示模式
   */
  public toggleMode(): void {
    this.handleClick();
  }

  /**
   * 设置显示格式
   */
  public setFormat(format: 'current' | 'remaining' | 'both'): void {
    this.updateConfig({ format });
    this.updateDisplay();
  }

  /**
   * 获取当前时间文本
   */
  public getTimeText(): string {
    return this.getTimeText();
  }
}

/**
 * 创建时间显示插件
 */
export function createTimeDisplay(player: IPlayer, config?: TimeDisplayConfig): TimeDisplay {
  return new TimeDisplay(player, config);
}
