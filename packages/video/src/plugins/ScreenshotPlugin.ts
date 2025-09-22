import { UIPlugin } from '../core/UIPlugin';
import { Player } from '../core/Player';
import { PluginConfig } from '../types/plugin';

export interface ScreenshotConfig extends PluginConfig {
  format?: 'png' | 'jpeg' | 'webp';
  quality?: number; // 0-1 for jpeg/webp
  filename?: string;
  watermark?: {
    text?: string;
    image?: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    opacity?: number;
  };
  autoDownload?: boolean;
}

export class ScreenshotPlugin extends UIPlugin {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: ScreenshotConfig;

  constructor(player: Player, config: ScreenshotConfig = {}) {
    super(player, {
      name: 'screenshot',
      displayName: '截图',
      ...config
    });

    this.config = {
      format: 'png',
      quality: 0.9,
      filename: 'screenshot',
      autoDownload: true,
      ...config
    };

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  protected createUI(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'ldesign-screenshot-plugin';
    container.innerHTML = `
      <button class="ldesign-screenshot-btn" title="截图">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
      <div class="ldesign-screenshot-menu" style="display: none;">
        <div class="ldesign-screenshot-options">
          <label>
            格式:
            <select class="ldesign-screenshot-format">
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
            </select>
          </label>
          <label class="ldesign-screenshot-quality-label" style="display: none;">
            质量:
            <input type="range" class="ldesign-screenshot-quality" min="0.1" max="1" step="0.1" value="0.9">
            <span class="ldesign-screenshot-quality-value">90%</span>
          </label>
          <label>
            文件名:
            <input type="text" class="ldesign-screenshot-filename" value="screenshot">
          </label>
          <div class="ldesign-screenshot-actions">
            <button class="ldesign-screenshot-capture">立即截图</button>
            <button class="ldesign-screenshot-cancel">取消</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(container);
    return container;
  }

  private bindEvents(container: HTMLElement): void {
    const btn = container.querySelector('.ldesign-screenshot-btn') as HTMLButtonElement;
    const menu = container.querySelector('.ldesign-screenshot-menu') as HTMLElement;
    const formatSelect = container.querySelector('.ldesign-screenshot-format') as HTMLSelectElement;
    const qualityLabel = container.querySelector('.ldesign-screenshot-quality-label') as HTMLElement;
    const qualityInput = container.querySelector('.ldesign-screenshot-quality') as HTMLInputElement;
    const qualityValue = container.querySelector('.ldesign-screenshot-quality-value') as HTMLElement;
    const filenameInput = container.querySelector('.ldesign-screenshot-filename') as HTMLInputElement;
    const captureBtn = container.querySelector('.ldesign-screenshot-capture') as HTMLButtonElement;
    const cancelBtn = container.querySelector('.ldesign-screenshot-cancel') as HTMLButtonElement;

    // 显示/隐藏菜单
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = menu.style.display !== 'none';
      menu.style.display = isVisible ? 'none' : 'block';
    });

    // 点击外部关闭菜单
    document.addEventListener('click', () => {
      menu.style.display = 'none';
    });

    menu.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 格式变化时显示/隐藏质量选项
    formatSelect.addEventListener('change', () => {
      const format = formatSelect.value;
      qualityLabel.style.display = (format === 'jpeg' || format === 'webp') ? 'block' : 'none';
    });

    // 质量滑块变化
    qualityInput.addEventListener('input', () => {
      const quality = parseFloat(qualityInput.value);
      qualityValue.textContent = `${Math.round(quality * 100)}%`;
    });

    // 截图按钮
    captureBtn.addEventListener('click', () => {
      this.captureScreenshot({
        format: formatSelect.value as any,
        quality: parseFloat(qualityInput.value),
        filename: filenameInput.value || 'screenshot'
      });
      menu.style.display = 'none';
    });

    // 取消按钮
    cancelBtn.addEventListener('click', () => {
      menu.style.display = 'none';
    });

    // 设置初始状态
    formatSelect.value = this.config.format!;
    qualityInput.value = this.config.quality!.toString();
    qualityValue.textContent = `${Math.round(this.config.quality! * 100)}%`;
    filenameInput.value = this.config.filename!;
    
    if (this.config.format === 'jpeg' || this.config.format === 'webp') {
      qualityLabel.style.display = 'block';
    }
  }

  public async captureScreenshot(options: Partial<ScreenshotConfig> = {}): Promise<string> {
    const config = { ...this.config, ...options };
    const video = this.player.getVideoElement();

    if (!video || video.readyState < 2) {
      throw new Error('视频未准备就绪，无法截图');
    }

    // 设置canvas尺寸
    this.canvas.width = video.videoWidth;
    this.canvas.height = video.videoHeight;

    // 绘制视频帧
    this.ctx.drawImage(video, 0, 0, this.canvas.width, this.canvas.height);

    // 添加水印
    if (config.watermark) {
      await this.addWatermark(config.watermark);
    }

    // 生成图片数据
    const mimeType = `image/${config.format}`;
    const dataURL = config.format === 'png' 
      ? this.canvas.toDataURL(mimeType)
      : this.canvas.toDataURL(mimeType, config.quality);

    // 触发截图事件
    this.player.emit('screenshot', {
      dataURL,
      format: config.format,
      quality: config.quality,
      filename: config.filename,
      timestamp: this.player.getCurrentTime()
    });

    // 自动下载
    if (config.autoDownload) {
      this.downloadImage(dataURL, config.filename!, config.format!);
    }

    return dataURL;
  }

  private async addWatermark(watermark: NonNullable<ScreenshotConfig['watermark']>): Promise<void> {
    const { text, image, position = 'bottom-right', opacity = 0.7 } = watermark;

    this.ctx.save();
    this.ctx.globalAlpha = opacity;

    if (text) {
      this.addTextWatermark(text, position);
    }

    if (image) {
      await this.addImageWatermark(image, position);
    }

    this.ctx.restore();
  }

  private addTextWatermark(text: string, position: string): void {
    const fontSize = Math.max(16, this.canvas.width / 40);
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = 'white';
    this.ctx.strokeStyle = 'black';
    this.ctx.lineWidth = 2;

    const metrics = this.ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;

    let x: number, y: number;

    switch (position) {
      case 'top-left':
        x = 20;
        y = 20 + textHeight;
        break;
      case 'top-right':
        x = this.canvas.width - textWidth - 20;
        y = 20 + textHeight;
        break;
      case 'bottom-left':
        x = 20;
        y = this.canvas.height - 20;
        break;
      case 'bottom-right':
        x = this.canvas.width - textWidth - 20;
        y = this.canvas.height - 20;
        break;
      case 'center':
        x = (this.canvas.width - textWidth) / 2;
        y = (this.canvas.height + textHeight) / 2;
        break;
      default:
        x = this.canvas.width - textWidth - 20;
        y = this.canvas.height - 20;
    }

    this.ctx.strokeText(text, x, y);
    this.ctx.fillText(text, x, y);
  }

  private async addImageWatermark(imageSrc: string, position: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = Math.min(this.canvas.width, this.canvas.height) / 4;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        const width = img.width * scale;
        const height = img.height * scale;

        let x: number, y: number;

        switch (position) {
          case 'top-left':
            x = 20;
            y = 20;
            break;
          case 'top-right':
            x = this.canvas.width - width - 20;
            y = 20;
            break;
          case 'bottom-left':
            x = 20;
            y = this.canvas.height - height - 20;
            break;
          case 'bottom-right':
            x = this.canvas.width - width - 20;
            y = this.canvas.height - height - 20;
            break;
          case 'center':
            x = (this.canvas.width - width) / 2;
            y = (this.canvas.height - height) / 2;
            break;
          default:
            x = this.canvas.width - width - 20;
            y = this.canvas.height - height - 20;
        }

        this.ctx.drawImage(img, x, y, width, height);
        resolve();
      };
      img.onerror = reject;
      img.src = imageSrc;
    });
  }

  private downloadImage(dataURL: string, filename: string, format: string): void {
    const link = document.createElement('a');
    link.download = `${filename}-${Date.now()}.${format}`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public destroy(): void {
    super.destroy();
    this.canvas = null as any;
    this.ctx = null as any;
  }
}
