/**
 * 简化时间显示插件
 * 专为控制栏设计的时间显示组件
 */

import type { IPlayer, PluginConfig } from '../types';

/**
 * 时间显示格式
 */
export enum TimeFormat {
  CURRENT = 'current',      // 只显示当前时间
  DURATION = 'duration',    // 只显示总时长
  BOTH = 'both',           // 显示当前时间/总时长
  REMAINING = 'remaining'   // 显示剩余时间
}

/**
 * 时间显示配置接口
 */
export interface SimpleTimeDisplayConfig extends PluginConfig {
  /** 显示格式 */
  format?: TimeFormat;
  /** 是否可点击切换格式 */
  clickToToggle?: boolean;
  /** 是否显示毫秒 */
  showMilliseconds?: boolean;
}

/**
 * 简化时间显示插件类
 */
export class SimpleTimeDisplay {
  public readonly name = 'simpleTimeDisplay';
  public readonly player: IPlayer;
  public readonly config: SimpleTimeDisplayConfig;
  public element!: HTMLElement;

  private _currentTime = 0;
  private _duration = 0;
  private _currentFormat: TimeFormat;

  constructor(player: IPlayer, config: SimpleTimeDisplayConfig = {}) {
    this.player = player;
    this.config = {
      format: TimeFormat.BOTH,
      clickToToggle: true,
      showMilliseconds: false,
      ...config
    };

    this._currentFormat = this.config.format as TimeFormat;
  }

  /**
   * 初始化插件
   */
  async init(): Promise<void> {
    this.createElement();
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
   * 渲染时间显示DOM结构
   */
  private render(): string {
    return `
      <div class="ldesign-time-display" ${this.config.clickToToggle ? 'role="button" tabindex="0"' : ''}>
        <span class="current-time">00:00</span>
        <span class="separator">/</span>
        <span class="duration">00:00</span>
      </div>
    `;
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 直接监听视频元素事件
    if (this.player.element) {
      this.player.element.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
      this.player.element.addEventListener('durationchange', this.onDurationChange.bind(this));
      this.player.element.addEventListener('loadedmetadata', this.onLoadedMetadata.bind(this));
    }

    // DOM 事件
    if (this.config.clickToToggle && this.element) {
      this.element.addEventListener('click', this.onToggleFormat.bind(this));
      this.element.addEventListener('keydown', this.onKeyDown.bind(this));
    }
  }

  /**
   * 格式化时间显示
   */
  private formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) {
      return '00:00';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    let timeString = '';

    if (hours > 0) {
      timeString = `${hours.toString().padStart(2, '0')}:`;
    }

    timeString += `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (this.config.showMilliseconds) {
      timeString += `.${milliseconds.toString().padStart(3, '0')}`;
    }

    return timeString;
  }

  /**
   * 更新时间显示
   */
  private updateDisplay(): void {
    if (!this.element) return;

    const currentTimeElement = this.element.querySelector('.current-time') as HTMLElement;
    const separatorElement = this.element.querySelector('.separator') as HTMLElement;
    const durationElement = this.element.querySelector('.duration') as HTMLElement;

    switch (this._currentFormat) {
      case TimeFormat.CURRENT:
        currentTimeElement.textContent = this.formatTime(this._currentTime);
        separatorElement.style.display = 'none';
        durationElement.style.display = 'none';
        break;

      case TimeFormat.DURATION:
        currentTimeElement.style.display = 'none';
        separatorElement.style.display = 'none';
        durationElement.textContent = this.formatTime(this._duration);
        durationElement.style.display = 'inline';
        break;

      case TimeFormat.REMAINING:
        const remaining = Math.max(0, this._duration - this._currentTime);
        currentTimeElement.textContent = `-${this.formatTime(remaining)}`;
        separatorElement.style.display = 'none';
        durationElement.style.display = 'none';
        break;

      case TimeFormat.BOTH:
      default:
        currentTimeElement.textContent = this.formatTime(this._currentTime);
        currentTimeElement.style.display = 'inline';
        separatorElement.style.display = 'inline';
        separatorElement.textContent = '/';
        durationElement.textContent = this.formatTime(this._duration);
        durationElement.style.display = 'inline';
        break;
    }
  }

  /**
   * 切换显示格式
   */
  private toggleFormat(): void {
    const formats = [TimeFormat.BOTH, TimeFormat.CURRENT, TimeFormat.REMAINING, TimeFormat.DURATION];
    const currentIndex = formats.indexOf(this._currentFormat);
    const nextIndex = (currentIndex + 1) % formats.length;
    this._currentFormat = formats[nextIndex];

    this.updateDisplay();

    // 触发格式变化事件
    console.log('formatChanged', { format: this._currentFormat });
  }

  // 事件处理方法
  private onTimeUpdate(): void {
    const currentTime = this.player.element.currentTime;
    if (Math.abs(currentTime - this._currentTime) >= 0.1) { // 避免频繁更新
      this._currentTime = currentTime;
      this.updateDisplay();
    }
  }

  private onDurationChange(): void {
    this._duration = this.player.element.duration || 0;
    this.updateDisplay();
  }

  private onLoadedMetadata(): void {
    this._duration = this.player.element.duration || 0;
    this._currentTime = this.player.element.currentTime || 0;
    this.updateDisplay();
  }

  private onToggleFormat(): void {
    this.toggleFormat();
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleFormat();
    }
  }

  /**
   * 设置显示格式
   */
  setFormat(format: TimeFormat): void {
    this._currentFormat = format;
    this.updateDisplay();
  }

  /**
   * 获取当前显示格式
   */
  getFormat(): TimeFormat {
    return this._currentFormat;
  }

  /**
   * 获取当前时间信息
   */
  getTimeInfo(): { currentTime: number; duration: number; remaining: number } {
    return {
      currentTime: this._currentTime,
      duration: this._duration,
      remaining: Math.max(0, this._duration - this._currentTime)
    };
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    // 移除事件监听器
    if (this.config.clickToToggle && this.element) {
      this.element.removeEventListener('click', this.onToggleFormat.bind(this));
      this.element.removeEventListener('keydown', this.onKeyDown.bind(this));
    }

    // 移除DOM元素
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * 创建简化时间显示插件实例
 */
export function createSimpleTimeDisplay(player: IPlayer, config?: SimpleTimeDisplayConfig): SimpleTimeDisplay {
  return new SimpleTimeDisplay(player, config);
}
