/**
 * 简化进度条插件
 * 专为控制栏设计的进度条组件
 */

import type { IPlayer, PluginConfig } from '../types';

/**
 * 进度条配置接口
 */
export interface SimpleProgressBarConfig extends PluginConfig {
  /** 是否显示缓冲进度 */
  showBuffer?: boolean;
  /** 是否显示时间提示 */
  showTooltip?: boolean;
  /** 是否支持点击跳转 */
  seekOnClick?: boolean;
  /** 是否支持拖拽 */
  seekOnDrag?: boolean;
}

/**
 * 简化进度条插件类
 */
export class SimpleProgressBar {
  public readonly name = 'simpleProgressBar';
  public readonly player: IPlayer;
  public readonly config: SimpleProgressBarConfig;
  public element!: HTMLElement;

  private _isDragging = false;
  private _currentProgress = 0;
  private _bufferProgress = 0;

  constructor(player: IPlayer, config: SimpleProgressBarConfig = {}) {
    this.player = player;
    this.config = {
      showBuffer: true,
      showTooltip: true,
      seekOnClick: true,
      seekOnDrag: true,
      ...config
    };
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
   * 渲染进度条DOM结构
   */
  private render(): string {
    return `
      <div class="ldesign-progress-container">
        <div class="progress-bar">
          <div class="buffer-progress" style="width: 0%"></div>
          <div class="play-progress" style="width: 0%"></div>
        </div>
        <div class="progress-tooltip" style="display: none;">
          <span class="tooltip-time">00:00</span>
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
      this.player.element.addEventListener('timeupdate', this.onTimeUpdate.bind(this));
      this.player.element.addEventListener('progress', this.onProgress.bind(this));
      this.player.element.addEventListener('loadedmetadata', this.onLoadedMetadata.bind(this));
      this.player.element.addEventListener('durationchange', this.onDurationChange.bind(this));
    }

    // DOM 事件
    if (this.element) {
      const progressContainer = this.element.querySelector('.ldesign-progress-container') as HTMLElement;

      if (progressContainer) {
        if (this.config.seekOnClick) {
          progressContainer.addEventListener('click', this.onProgressClick.bind(this));
        }

        if (this.config.seekOnDrag) {
          progressContainer.addEventListener('mousedown', this.onMouseDown.bind(this));
        }

        if (this.config.showTooltip) {
          progressContainer.addEventListener('mousemove', this.onMouseMove.bind(this));
          progressContainer.addEventListener('mouseleave', this.onMouseLeave.bind(this));
        }
      }
    }
  }

  /**
   * 更新播放进度
   */
  private updatePlayProgress(progress: number): void {
    this._currentProgress = Math.max(0, Math.min(100, progress));

    const playProgressElement = this.element.querySelector('.play-progress') as HTMLElement;
    if (playProgressElement) {
      playProgressElement.style.width = `${this._currentProgress}%`;
    }
  }

  /**
   * 更新缓冲进度
   */
  private updateBufferProgress(progress: number): void {
    this._bufferProgress = Math.max(0, Math.min(100, progress));

    const bufferProgressElement = this.element.querySelector('.buffer-progress') as HTMLElement;
    if (bufferProgressElement) {
      bufferProgressElement.style.width = `${this._bufferProgress}%`;
    }
  }

  /**
   * 根据鼠标位置计算进度百分比
   */
  private calculateProgress(event: MouseEvent): number {
    const progressContainer = this.element.querySelector('.ldesign-progress-container') as HTMLElement;
    const rect = progressContainer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const width = rect.width;
    return Math.max(0, Math.min(100, (x / width) * 100));
  }

  /**
   * 格式化时间显示
   */
  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // 事件处理方法
  private onTimeUpdate(): void {
    if (this._isDragging) return;

    const currentTime = this.player.element.currentTime;
    const duration = this.player.element.duration;

    if (duration > 0) {
      const progress = (currentTime / duration) * 100;
      this.updatePlayProgress(progress);
    }
  }

  private onProgress(): void {
    const video = this.player.element;
    if (video.buffered.length > 0) {
      const bufferedEnd = video.buffered.end(video.buffered.length - 1);
      const duration = video.duration;

      if (duration > 0) {
        const bufferProgress = (bufferedEnd / duration) * 100;
        this.updateBufferProgress(bufferProgress);
      }
    }
  }

  private onLoadedMetadata(): void {
    this.updatePlayProgress(0);
    this.updateBufferProgress(0);
  }

  private onDurationChange(): void {
    // 重新计算进度
    this.onTimeUpdate();
    this.onProgress();
  }

  private onProgressClick(event: MouseEvent): void {
    if (this._isDragging) return;

    const progress = this.calculateProgress(event);
    const duration = this.player.element.duration;

    if (duration > 0) {
      const targetTime = (progress / 100) * duration;
      this.player.element.currentTime = targetTime;
    }
  }

  private onMouseDown(event: MouseEvent): void {
    this._isDragging = true;
    this.element.classList.add('dragging');

    const onMouseMove = (e: MouseEvent) => {
      const progress = this.calculateProgress(e);
      this.updatePlayProgress(progress);
    };

    const onMouseUp = () => {
      this._isDragging = false;
      this.element.classList.remove('dragging');

      const duration = this.player.element.duration;
      if (duration > 0) {
        const targetTime = (this._currentProgress / 100) * duration;
        this.player.element.currentTime = targetTime;
      }

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // 立即更新一次进度
    onMouseMove(event);
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.config.showTooltip) return;

    const progress = this.calculateProgress(event);
    const duration = this.player.element.duration;

    if (duration > 0) {
      const targetTime = (progress / 100) * duration;
      const tooltip = this.element.querySelector('.progress-tooltip') as HTMLElement;
      const tooltipTime = tooltip.querySelector('.tooltip-time') as HTMLElement;

      tooltipTime.textContent = this.formatTime(targetTime);

      const progressContainer = this.element.querySelector('.ldesign-progress-container') as HTMLElement;
      const rect = progressContainer.getBoundingClientRect();
      const x = event.clientX - rect.left;

      tooltip.style.display = 'block';
      tooltip.style.left = `${x}px`;
      tooltip.style.transform = 'translateX(-50%)';
    }
  }

  private onMouseLeave(): void {
    if (!this.config.showTooltip) return;

    const tooltip = this.element.querySelector('.progress-tooltip') as HTMLElement;
    tooltip.style.display = 'none';
  }

  /**
   * 销毁插件
   */
  destroy(): void {
    // 移除事件监听器
    if (this.element) {
      const progressContainer = this.element.querySelector('.ldesign-progress-container') as HTMLElement;
      progressContainer.removeEventListener('click', this.onProgressClick.bind(this));
      progressContainer.removeEventListener('mousedown', this.onMouseDown.bind(this));
      progressContainer.removeEventListener('mousemove', this.onMouseMove.bind(this));
      progressContainer.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
    }

    // 移除DOM元素
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

/**
 * 创建简化进度条插件实例
 */
export function createSimpleProgressBar(player: IPlayer, config?: SimpleProgressBarConfig): SimpleProgressBar {
  return new SimpleProgressBar(player, config);
}
