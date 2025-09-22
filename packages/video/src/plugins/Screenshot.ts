/**
 * 截图插件
 * 提供视频截图功能
 */

import { Plugin } from '../core/Plugin';
import type { IPlayer, PluginMetadata, PluginPosition } from '../types';
import { UIPluginConfig } from '../core/Plugin';

/**
 * 截图配置
 */
export interface ScreenshotConfig extends UIPluginConfig {
  showLabel?: boolean;
  icon?: string;
  quality?: number;
  format?: 'png' | 'jpeg' | 'webp';
  filename?: string | ((timestamp: number) => string);
  autoDownload?: boolean;
  includeTimestamp?: boolean;
}

/**
 * 截图数据
 */
export interface ScreenshotData {
  blob: Blob;
  dataUrl: string;
  filename: string;
  timestamp: number;
  width: number;
  height: number;
}

/**
 * 截图插件
 */
export class Screenshot extends Plugin {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor(player: IPlayer, config: ScreenshotConfig = {}) {
    const metadata: PluginMetadata = {
      name: 'screenshot',
      version: '1.0.0',
      type: 'ui',
      description: 'Video screenshot capture'
    };

    const defaultConfig: ScreenshotConfig = {
      position: PluginPosition.CONTROLS_RIGHT,
      className: 'ldesign-screenshot-button',
      showLabel: false,
      quality: 0.9,
      format: 'png',
      autoDownload: true,
      includeTimestamp: true,
      filename: (timestamp: number) => `screenshot-${timestamp}.png`,
      icon: `<svg class="ldesign-icon" viewBox="0 0 24 24">
        <path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zM17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z"/>
      </svg>`,
      ...config
    };

    super(player, defaultConfig, metadata);

    // 创建画布
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
  }

  protected render(): string {
    const config = this._uiConfig as ScreenshotConfig;
    const label = config.showLabel 
      ? `<span class="ldesign-button-label">Screenshot</span>`
      : '';

    return `
      <button class="ldesign-control-button" type="button" aria-label="Take screenshot">
        ${config.icon}
        ${label}
      </button>
    `;
  }

  protected bindUIEvents(): void {
    if (!this._element) return;

    const button = this._element.querySelector('button');
    if (button) {
      button.addEventListener('click', this.handleClick.bind(this));
    }

    // 监听键盘快捷键
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  protected unbindUIEvents(): void {
    if (!this._element) return;

    const button = this._element.querySelector('button');
    if (button) {
      button.removeEventListener('click', this.handleClick.bind(this));
    }

    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }

  private async handleClick(): Promise<void> {
    try {
      const screenshotData = await this.capture();
      
      if ((this._uiConfig as ScreenshotConfig).autoDownload) {
        this.download(screenshotData);
      }

      this.emit('screenshot:capture', screenshotData);
    } catch (error) {
      console.error('Screenshot capture error:', error);
      this.emit('screenshot:error', { error });
    }
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Ctrl/Cmd + Shift + S 快捷键
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
      event.preventDefault();
      this.handleClick();
    }
  }

  /**
   * 捕获截图
   */
  public async capture(): Promise<ScreenshotData> {
    const video = this.player.element;
    const config = this._uiConfig as ScreenshotConfig;

    // 设置画布尺寸
    this.canvas.width = video.videoWidth || video.clientWidth;
    this.canvas.height = video.videoHeight || video.clientHeight;

    // 绘制视频帧到画布
    this.context.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);

    // 添加时间戳水印
    if (config.includeTimestamp) {
      this.addTimestamp();
    }

    // 生成图片数据
    const dataUrl = this.canvas.toDataURL(`image/${config.format}`, config.quality);
    const blob = await this.dataUrlToBlob(dataUrl);
    
    const timestamp = Date.now();
    const filename = typeof config.filename === 'function' 
      ? config.filename(timestamp)
      : config.filename || `screenshot-${timestamp}.${config.format}`;

    return {
      blob,
      dataUrl,
      filename,
      timestamp,
      width: this.canvas.width,
      height: this.canvas.height
    };
  }

  /**
   * 下载截图
   */
  public download(screenshotData: ScreenshotData): void {
    const link = document.createElement('a');
    link.href = screenshotData.dataUrl;
    link.download = screenshotData.filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 复制到剪贴板
   */
  public async copyToClipboard(screenshotData?: ScreenshotData): Promise<void> {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('Clipboard API not supported');
    }

    const data = screenshotData || await this.capture();
    
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [data.blob.type]: data.blob
        })
      ]);
    } catch (error) {
      throw new Error(`Failed to copy to clipboard: ${error}`);
    }
  }

  private addTimestamp(): void {
    const currentTime = this.player.currentTime;
    const timeText = this.formatTime(currentTime);
    
    // 设置文字样式
    this.context.font = '16px Arial, sans-serif';
    this.context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.context.textAlign = 'right';
    this.context.textBaseline = 'bottom';

    // 计算文字位置
    const padding = 10;
    const x = this.canvas.width - padding;
    const y = this.canvas.height - padding;

    // 绘制背景
    const textMetrics = this.context.measureText(timeText);
    const textWidth = textMetrics.width;
    const textHeight = 20;
    
    this.context.fillRect(
      x - textWidth - 8,
      y - textHeight - 4,
      textWidth + 16,
      textHeight + 8
    );

    // 绘制文字
    this.context.fillStyle = 'white';
    this.context.fillText(timeText, x, y);
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

  private async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return response.blob();
  }

  /**
   * 设置截图质量
   */
  public setQuality(quality: number): void {
    this.updateConfig({ quality: Math.max(0, Math.min(1, quality)) });
  }

  /**
   * 设置截图格式
   */
  public setFormat(format: 'png' | 'jpeg' | 'webp'): void {
    this.updateConfig({ format });
  }

  /**
   * 获取支持的格式
   */
  public getSupportedFormats(): string[] {
    const formats = ['png', 'jpeg'];
    
    // 检查 WebP 支持
    const canvas = document.createElement('canvas');
    if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
      formats.push('webp');
    }
    
    return formats;
  }
}

/**
 * 创建截图插件
 */
export function createScreenshot(player: IPlayer, config?: ScreenshotConfig): Screenshot {
  return new Screenshot(player, config);
}
