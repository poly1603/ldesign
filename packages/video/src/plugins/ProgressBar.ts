/**
 * 进度条插件
 * 提供视频播放进度显示和拖拽控制功能
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata, PluginPosition } from '../types';
import { UIPluginConfig } from '../core/Plugin';
import { mouseUtils } from '../utils/eventUtils';

/**
 * 进度条配置
 */
export interface ProgressBarConfig extends UIPluginConfig {
  showBuffer?: boolean;
  showThumbnail?: boolean;
  showTooltip?: boolean;
  seekOnClick?: boolean;
  seekOnDrag?: boolean;
  thumbnailUrl?: string;
  thumbnailCount?: number;
}

/**
 * 进度条插件
 */
export class ProgressBar extends Plugin {
  private isDragging = false;
  private currentTime = 0;
  private duration = 0;
  private buffered = 0;
  private dragStartX = 0;
  private dragStartTime = 0;

  constructor(player: IPlayer, config: ProgressBarConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'progressBar',
      version: '1.0.0',
      type: 'ui',
      description: 'Video progress bar with seek functionality'
    };

    const defaultConfig: ProgressBarConfig = {
      position: PluginPosition.CONTROLS_CENTER,
      className: 'ldesign-progress-bar',
      showBuffer: true,
      showThumbnail: false,
      showTooltip: true,
      seekOnClick: true,
      seekOnDrag: true,
      ...config
    };

    super(player, defaultConfig, metadata);
  }

  protected render(): string {
    const config = this._uiConfig as ProgressBarConfig;
    
    return `
      <div class="ldesign-progress" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        ${config.showBuffer ? '<div class="ldesign-progress-buffer"></div>' : ''}
        <div class="ldesign-progress-played"></div>
        <div class="ldesign-progress-thumb"></div>
        ${config.showTooltip ? '<div class="ldesign-progress-tooltip"></div>' : ''}
        ${config.showThumbnail ? '<div class="ldesign-progress-thumbnail"></div>' : ''}
      </div>
    `;
  }

  protected async onUIInit(): Promise<void> {
    // 监听播放器事件
    this.on('media:timeupdate', (data) => {
      this.currentTime = data.currentTime;
      this.duration = data.duration;
      this.updateProgress();
    });

    this.on('media:loadedmetadata', (data) => {
      this.duration = data.duration;
      this.updateProgress();
    });

    this.on('media:progress', () => {
      this.updateBuffer();
    });

    this.on('media:seeking', () => {
      this.updateProgress();
    });

    this.on('media:seeked', () => {
      this.updateProgress();
    });

    // 初始化状态
    this.currentTime = this.player.currentTime;
    this.duration = this.player.duration;
    this.updateProgress();
    this.updateBuffer();
  }

  protected bindUIEvents(): void {
    if (!this._element) return;

    const progressElement = this._element.querySelector('.ldesign-progress') as HTMLElement;
    if (!progressElement) return;

    // 点击事件
    if ((this._uiConfig as ProgressBarConfig).seekOnClick) {
      progressElement.addEventListener('click', this.handleClick.bind(this));
    }

    // 拖拽事件
    if ((this._uiConfig as ProgressBarConfig).seekOnDrag) {
      progressElement.addEventListener('mousedown', this.handleMouseDown.bind(this));
      document.addEventListener('mousemove', this.handleMouseMove.bind(this));
      document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    }

    // 悬停事件
    if ((this._uiConfig as ProgressBarConfig).showTooltip) {
      progressElement.addEventListener('mousemove', this.handleMouseMove.bind(this));
      progressElement.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
    }

    // 键盘事件
    progressElement.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  protected unbindUIEvents(): void {
    if (!this._element) return;

    const progressElement = this._element.querySelector('.ldesign-progress') as HTMLElement;
    if (!progressElement) return;

    progressElement.removeEventListener('click', this.handleClick.bind(this));
    progressElement.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    progressElement.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    progressElement.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
    progressElement.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private handleClick(event: MouseEvent): void {
    if (this.isDragging) return;

    const progressElement = this._element!.querySelector('.ldesign-progress') as HTMLElement;
    const percentage = mouseUtils.getRelativePercentage(event, progressElement).x;
    const seekTime = percentage * this.duration;
    
    this.player.seek(seekTime);
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.button !== 0) return; // 只处理左键

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartTime = this.currentTime;

    const progressElement = this._element!.querySelector('.ldesign-progress') as HTMLElement;
    progressElement.classList.add('ldesign-progress-dragging');

    event.preventDefault();
  }

  private handleMouseMove(event: MouseEvent): void {
    const progressElement = this._element!.querySelector('.ldesign-progress') as HTMLElement;
    
    if (this.isDragging) {
      // 拖拽中
      const percentage = mouseUtils.getRelativePercentage(event, progressElement).x;
      const seekTime = Math.max(0, Math.min(this.duration, percentage * this.duration));
      
      // 实时更新进度显示
      this.updateProgressDisplay(seekTime / this.duration);
      
      // 更新 tooltip
      this.updateTooltip(event, seekTime);
    } else if ((this._uiConfig as ProgressBarConfig).showTooltip) {
      // 悬停显示 tooltip
      const percentage = mouseUtils.getRelativePercentage(event, progressElement).x;
      const hoverTime = percentage * this.duration;
      this.updateTooltip(event, hoverTime);
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!this.isDragging) return;

    this.isDragging = false;

    const progressElement = this._element!.querySelector('.ldesign-progress') as HTMLElement;
    progressElement.classList.remove('ldesign-progress-dragging');

    // 执行跳转
    const percentage = mouseUtils.getRelativePercentage(event, progressElement).x;
    const seekTime = Math.max(0, Math.min(this.duration, percentage * this.duration));
    
    this.player.seek(seekTime);
  }

  private handleMouseLeave(): void {
    if (!this.isDragging) {
      this.hideTooltip();
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const step = this.duration * 0.05; // 5% 步长

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.player.seek(Math.max(0, this.currentTime - step));
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.player.seek(Math.min(this.duration, this.currentTime + step));
        break;
      case 'Home':
        event.preventDefault();
        this.player.seek(0);
        break;
      case 'End':
        event.preventDefault();
        this.player.seek(this.duration);
        break;
    }
  }

  private updateProgress(): void {
    if (this.isDragging) return;

    const percentage = this.duration > 0 ? this.currentTime / this.duration : 0;
    this.updateProgressDisplay(percentage);
    this.updateAriaValues();
  }

  private updateProgressDisplay(percentage: number): void {
    if (!this._element) return;

    const playedElement = this._element.querySelector('.ldesign-progress-played') as HTMLElement;
    const thumbElement = this._element.querySelector('.ldesign-progress-thumb') as HTMLElement;

    if (playedElement) {
      playedElement.style.width = `${percentage * 100}%`;
    }

    if (thumbElement) {
      thumbElement.style.left = `${percentage * 100}%`;
    }
  }

  private updateBuffer(): void {
    if (!this._element) return;

    const bufferElement = this._element.querySelector('.ldesign-progress-buffer') as HTMLElement;
    if (!bufferElement) return;

    const buffered = this.player.buffered;
    if (buffered.length > 0 && this.duration > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      const percentage = bufferedEnd / this.duration;
      bufferElement.style.width = `${percentage * 100}%`;
    }
  }

  private updateTooltip(event: MouseEvent, time: number): void {
    const tooltipElement = this._element!.querySelector('.ldesign-progress-tooltip') as HTMLElement;
    if (!tooltipElement) return;

    const formattedTime = this.formatTime(time);
    tooltipElement.textContent = formattedTime;
    tooltipElement.style.display = 'block';

    const progressElement = this._element!.querySelector('.ldesign-progress') as HTMLElement;
    const position = mouseUtils.getRelativePosition(event, progressElement);
    tooltipElement.style.left = `${position.x}px`;
    tooltipElement.style.transform = 'translateX(-50%)';
  }

  private hideTooltip(): void {
    const tooltipElement = this._element!.querySelector('.ldesign-progress-tooltip') as HTMLElement;
    if (tooltipElement) {
      tooltipElement.style.display = 'none';
    }
  }

  private updateAriaValues(): void {
    const progressElement = this._element!.querySelector('.ldesign-progress') as HTMLElement;
    if (progressElement) {
      const percentage = this.duration > 0 ? (this.currentTime / this.duration) * 100 : 0;
      progressElement.setAttribute('aria-valuenow', percentage.toFixed(1));
      progressElement.setAttribute('aria-valuetext', `${this.formatTime(this.currentTime)} of ${this.formatTime(this.duration)}`);
    }
  }

  private formatTime(seconds: number): string {
    if (!isFinite(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }
}

/**
 * 创建进度条插件
 */
export function createProgressBar(player: IPlayer, config?: ProgressBarConfig): ProgressBar {
  return new ProgressBar(player, config);
}
