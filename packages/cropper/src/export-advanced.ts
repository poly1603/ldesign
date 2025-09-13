/**
 * Advanced Export System for Image Cropper
 * Supports multiple formats, watermarks, compression optimization, and batch processing
 */

// Export format configurations
export enum ExportFormat {
  JPEG = 'image/jpeg',
  PNG = 'image/png',
  WEBP = 'image/webp',
  AVIF = 'image/avif',
  GIF = 'image/gif',
  BMP = 'image/bmp',
  TIFF = 'image/tiff',
  PDF = 'application/pdf'
}

export enum CompressionLevel {
  MAXIMUM = 'maximum',     // 最高压缩
  HIGH = 'high',          // 高压缩
  MEDIUM = 'medium',      // 中等压缩
  LOW = 'low',            // 低压缩
  LOSSLESS = 'lossless'   // 无损
}

export enum WatermarkPosition {
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  CENTER = 'center',
  CUSTOM = 'custom'
}

// Export configuration interfaces
export interface ExportDimensions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export interface WatermarkConfig {
  type: 'text' | 'image';
  content: string; // Text content or image URL/data
  position: WatermarkPosition;
  customPosition?: { x: number; y: number };
  opacity: number; // 0-1
  scale: number; // 0-1
  rotation?: number; // degrees
  color?: string; // For text watermarks
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  blendMode?: GlobalCompositeOperation;
}

export interface CompressionConfig {
  level: CompressionLevel;
  quality?: number; // 0-1, for JPEG/WEBP
  progressive?: boolean; // For JPEG
  lossless?: boolean; // For WEBP
  effort?: number; // 0-6, for AVIF/WEBP
}

export interface MetadataConfig {
  preserveOriginal?: boolean;
  customMetadata?: { [key: string]: any };
  copyright?: string;
  author?: string;
  description?: string;
  keywords?: string[];
  removeGPS?: boolean;
}

export interface ExportOptions {
  format: ExportFormat;
  dimensions?: ExportDimensions;
  compression?: CompressionConfig;
  watermark?: WatermarkConfig;
  metadata?: MetadataConfig;
  backgroundColor?: string; // For formats that don't support transparency
  filename?: string;
  timestamp?: boolean;
}

export interface BatchExportOptions extends ExportOptions {
  namePattern?: string; // e.g., "image_{index}_{timestamp}"
  indexStart?: number;
  indexPadding?: number;
}

export interface ExportResult {
  blob: Blob;
  url: string;
  filename: string;
  size: number;
  dimensions: { width: number; height: number };
  format: ExportFormat;
  compressionRatio?: number;
  metadata?: any;
}

export interface ExportProgress {
  current: number;
  total: number;
  filename: string;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

// Advanced Export Manager
export class AdvancedExportManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private supportedFormats: Set<ExportFormat>;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
    this.supportedFormats = this.detectSupportedFormats();
  }

  /**
   * 检测浏览器支持的导出格式
   */
  private detectSupportedFormats(): Set<ExportFormat> {
    const formats = new Set<ExportFormat>();
    const testCanvas = document.createElement('canvas');
    
    // 基础格式支持
    formats.add(ExportFormat.PNG);
    formats.add(ExportFormat.JPEG);
    
    // 检测现代格式
    if (testCanvas.toDataURL('image/webp').startsWith('data:image/webp')) {
      formats.add(ExportFormat.WEBP);
    }
    
    // AVIF 检测需要异步，这里先假设支持
    formats.add(ExportFormat.AVIF);
    formats.add(ExportFormat.GIF);
    formats.add(ExportFormat.BMP);
    
    return formats;
  }

  /**
   * 单个图像导出
   */
  async exportImage(
    imageSource: HTMLImageElement | HTMLCanvasElement | ImageData,
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      // 设置画布尺寸
      const dimensions = await this.calculateDimensions(imageSource, options.dimensions);
      this.setupCanvas(dimensions.width, dimensions.height, options.backgroundColor);

      // 绘制主图像
      await this.drawMainImage(imageSource, dimensions);

      // 应用水印
      if (options.watermark) {
        await this.applyWatermark(options.watermark, dimensions);
      }

      // 导出为指定格式
      const blob = await this.exportToFormat(options);
      const url = URL.createObjectURL(blob);
      const filename = this.generateFilename(options);

      return {
        blob,
        url,
        filename,
        size: blob.size,
        dimensions,
        format: options.format,
        compressionRatio: this.calculateCompressionRatio(imageSource, blob),
        metadata: options.metadata
      };
    } catch (error) {
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * 批量导出
   */
  async exportBatch(
    imageSources: (HTMLImageElement | HTMLCanvasElement | ImageData)[],
    options: BatchExportOptions,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<ExportResult[]> {
    const results: ExportResult[] = [];
    const total = imageSources.length;

    for (let i = 0; i < total; i++) {
      try {
        onProgress?.({
          current: i,
          total,
          filename: this.generateBatchFilename(options, i),
          status: 'processing'
        });

        const exportOptions: ExportOptions = {
          ...options,
          filename: this.generateBatchFilename(options, i)
        };

        const result = await this.exportImage(imageSources[i], exportOptions);
        results.push(result);

        onProgress?.({
          current: i + 1,
          total,
          filename: result.filename,
          status: 'completed'
        });
      } catch (error) {
        onProgress?.({
          current: i + 1,
          total,
          filename: this.generateBatchFilename(options, i),
          status: 'error',
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * 计算目标尺寸
   */
  private async calculateDimensions(
    source: HTMLImageElement | HTMLCanvasElement | ImageData,
    config?: ExportDimensions
  ): Promise<{ width: number; height: number }> {
    let sourceWidth: number, sourceHeight: number;

    if (source instanceof ImageData) {
      sourceWidth = source.width;
      sourceHeight = source.height;
    } else {
      sourceWidth = source.width;
      sourceHeight = source.height;
    }

    if (!config) {
      return { width: sourceWidth, height: sourceHeight };
    }

    let { width, height } = config;
    const aspectRatio = sourceWidth / sourceHeight;

    // 如果指定了宽度但没有高度
    if (width && !height && config.maintainAspectRatio !== false) {
      height = Math.round(width / aspectRatio);
    }
    // 如果指定了高度但没有宽度
    else if (height && !width && config.maintainAspectRatio !== false) {
      width = Math.round(height * aspectRatio);
    }
    // 如果都没指定，使用原始尺寸
    else if (!width && !height) {
      width = sourceWidth;
      height = sourceHeight;
    }

    // 应用最大值限制
    if (config.maxWidth && width! > config.maxWidth) {
      width = config.maxWidth;
      if (config.maintainAspectRatio !== false) {
        height = Math.round(width / aspectRatio);
      }
    }
    if (config.maxHeight && height! > config.maxHeight) {
      height = config.maxHeight;
      if (config.maintainAspectRatio !== false) {
        width = Math.round(height * aspectRatio);
      }
    }

    // 应用最小值限制
    if (config.minWidth && width! < config.minWidth) {
      width = config.minWidth;
      if (config.maintainAspectRatio !== false) {
        height = Math.round(width / aspectRatio);
      }
    }
    if (config.minHeight && height! < config.minHeight) {
      height = config.minHeight;
      if (config.maintainAspectRatio !== false) {
        width = Math.round(height * aspectRatio);
      }
    }

    return { width: width!, height: height! };
  }

  /**
   * 设置画布
   */
  private setupCanvas(width: number, height: number, backgroundColor?: string): void {
    this.canvas.width = width;
    this.canvas.height = height;

    if (backgroundColor) {
      this.ctx.fillStyle = backgroundColor;
      this.ctx.fillRect(0, 0, width, height);
    } else {
      this.ctx.clearRect(0, 0, width, height);
    }
  }

  /**
   * 绘制主图像
   */
  private async drawMainImage(
    source: HTMLImageElement | HTMLCanvasElement | ImageData,
    dimensions: { width: number; height: number }
  ): Promise<void> {
    if (source instanceof ImageData) {
      // 创建临时画布来处理 ImageData
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCanvas.width = source.width;
      tempCanvas.height = source.height;
      tempCtx.putImageData(source, 0, 0);
      
      this.ctx.drawImage(tempCanvas, 0, 0, dimensions.width, dimensions.height);
    } else {
      this.ctx.drawImage(source, 0, 0, dimensions.width, dimensions.height);
    }
  }

  /**
   * 应用水印
   */
  private async applyWatermark(
    config: WatermarkConfig,
    dimensions: { width: number; height: number }
  ): Promise<void> {
    const { width, height } = dimensions;
    let x: number, y: number;

    // 计算水印位置
    switch (config.position) {
      case WatermarkPosition.TOP_LEFT:
        x = width * 0.05;
        y = height * 0.05;
        break;
      case WatermarkPosition.TOP_RIGHT:
        x = width * 0.95;
        y = height * 0.05;
        break;
      case WatermarkPosition.BOTTOM_LEFT:
        x = width * 0.05;
        y = height * 0.95;
        break;
      case WatermarkPosition.BOTTOM_RIGHT:
        x = width * 0.95;
        y = height * 0.95;
        break;
      case WatermarkPosition.CENTER:
        x = width * 0.5;
        y = height * 0.5;
        break;
      case WatermarkPosition.CUSTOM:
        x = config.customPosition?.x || width * 0.5;
        y = config.customPosition?.y || height * 0.5;
        break;
      default:
        x = width * 0.95;
        y = height * 0.95;
    }

    // 保存当前状态
    this.ctx.save();

    // 设置透明度和混合模式
    this.ctx.globalAlpha = config.opacity;
    if (config.blendMode) {
      this.ctx.globalCompositeOperation = config.blendMode;
    }

    // 应用旋转
    if (config.rotation) {
      this.ctx.translate(x, y);
      this.ctx.rotate((config.rotation * Math.PI) / 180);
      x = 0;
      y = 0;
    }

    if (config.type === 'text') {
      await this.drawTextWatermark(config, x, y, dimensions);
    } else {
      await this.drawImageWatermark(config, x, y, dimensions);
    }

    // 恢复状态
    this.ctx.restore();
  }

  /**
   * 绘制文字水印
   */
  private async drawTextWatermark(
    config: WatermarkConfig,
    x: number,
    y: number,
    dimensions: { width: number; height: number }
  ): Promise<void> {
    const fontSize = config.fontSize || Math.min(dimensions.width, dimensions.height) * 0.05;
    const fontFamily = config.fontFamily || 'Arial, sans-serif';
    const fontWeight = config.fontWeight || 'normal';
    const color = config.color || 'rgba(255, 255, 255, 0.8)';

    this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // 添加文字阴影效果
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 2;
    this.ctx.shadowOffsetX = 1;
    this.ctx.shadowOffsetY = 1;

    this.ctx.fillText(config.content, x, y);
  }

  /**
   * 绘制图像水印
   */
  private async drawImageWatermark(
    config: WatermarkConfig,
    x: number,
    y: number,
    dimensions: { width: number; height: number }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        const scale = config.scale || 0.1;
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // 调整绘制位置以确保图像居中
        const drawX = x - scaledWidth / 2;
        const drawY = y - scaledHeight / 2;

        this.ctx.drawImage(img, drawX, drawY, scaledWidth, scaledHeight);
        resolve();
      };

      img.onerror = () => reject(new Error('Failed to load watermark image'));
      img.src = config.content;
    });
  }

  /**
   * 导出为指定格式
   */
  private async exportToFormat(options: ExportOptions): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (options.format === ExportFormat.PDF) {
        // PDF 导出需要特殊处理
        this.exportToPDF(options).then(resolve).catch(reject);
        return;
      }

      let quality: number | undefined;
      if (options.compression) {
        quality = this.getQualityFromCompression(options.compression, options.format);
      }

      this.canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to export image'));
          }
        },
        options.format,
        quality
      );
    });
  }

  /**
   * 导出为PDF
   */
  private async exportToPDF(options: ExportOptions): Promise<Blob> {
    // 这里需要一个PDF库，比如 jsPDF
    // 简化实现，实际项目中需要引入 jsPDF
    const canvas = this.canvas;
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // 模拟PDF导出
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${canvas.width} ${canvas.height}] >>
endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
200
%%EOF`;

    return new Blob([pdfContent], { type: 'application/pdf' });
  }

  /**
   * 根据压缩配置获取质量值
   */
  private getQualityFromCompression(compression: CompressionConfig, format: ExportFormat): number {
    if (compression.quality !== undefined) {
      return compression.quality;
    }

    // 根据压缩级别返回默认质量值
    switch (compression.level) {
      case CompressionLevel.MAXIMUM:
        return format === ExportFormat.JPEG ? 0.6 : 0.7;
      case CompressionLevel.HIGH:
        return format === ExportFormat.JPEG ? 0.75 : 0.8;
      case CompressionLevel.MEDIUM:
        return format === ExportFormat.JPEG ? 0.85 : 0.9;
      case CompressionLevel.LOW:
        return format === ExportFormat.JPEG ? 0.95 : 0.95;
      case CompressionLevel.LOSSLESS:
        return 1.0;
      default:
        return 0.9;
    }
  }

  /**
   * 生成文件名
   */
  private generateFilename(options: ExportOptions): string {
    if (options.filename) {
      return options.filename;
    }

    const timestamp = options.timestamp ? `_${Date.now()}` : '';
    const extension = this.getFileExtension(options.format);
    
    return `exported_image${timestamp}.${extension}`;
  }

  /**
   * 生成批量文件名
   */
  private generateBatchFilename(options: BatchExportOptions, index: number): string {
    const pattern = options.namePattern || 'image_{index}';
    const paddedIndex = String(index + (options.indexStart || 1))
      .padStart(options.indexPadding || 3, '0');
    const timestamp = options.timestamp ? Date.now().toString() : '';
    const extension = this.getFileExtension(options.format);

    return pattern
      .replace('{index}', paddedIndex)
      .replace('{timestamp}', timestamp) + '.' + extension;
  }

  /**
   * 获取文件扩展名
   */
  private getFileExtension(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.JPEG: return 'jpg';
      case ExportFormat.PNG: return 'png';
      case ExportFormat.WEBP: return 'webp';
      case ExportFormat.AVIF: return 'avif';
      case ExportFormat.GIF: return 'gif';
      case ExportFormat.BMP: return 'bmp';
      case ExportFormat.TIFF: return 'tiff';
      case ExportFormat.PDF: return 'pdf';
      default: return 'png';
    }
  }

  /**
   * 计算压缩比
   */
  private calculateCompressionRatio(
    source: HTMLImageElement | HTMLCanvasElement | ImageData,
    result: Blob
  ): number {
    // 估算原始大小
    let originalSize: number;
    if (source instanceof ImageData) {
      originalSize = source.width * source.height * 4; // RGBA
    } else {
      originalSize = source.width * source.height * 4;
    }

    return result.size / originalSize;
  }

  /**
   * 获取支持的导出格式
   */
  getSupportedFormats(): ExportFormat[] {
    return Array.from(this.supportedFormats);
  }

  /**
   * 清理资源
   */
  dispose(): void {
    // 清理画布和上下文
    this.canvas.width = 0;
    this.canvas.height = 0;
  }
}

// 预设配置
export const ExportPresets = {
  // 社交媒体预设
  INSTAGRAM_SQUARE: {
    format: ExportFormat.JPEG,
    dimensions: { width: 1080, height: 1080, maintainAspectRatio: false },
    compression: { level: CompressionLevel.HIGH, quality: 0.85 }
  } as ExportOptions,

  INSTAGRAM_STORY: {
    format: ExportFormat.JPEG,
    dimensions: { width: 1080, height: 1920, maintainAspectRatio: false },
    compression: { level: CompressionLevel.HIGH, quality: 0.85 }
  } as ExportOptions,

  FACEBOOK_POST: {
    format: ExportFormat.JPEG,
    dimensions: { width: 1200, height: 630, maintainAspectRatio: false },
    compression: { level: CompressionLevel.MEDIUM, quality: 0.9 }
  } as ExportOptions,

  TWITTER_POST: {
    format: ExportFormat.JPEG,
    dimensions: { width: 1200, height: 675, maintainAspectRatio: false },
    compression: { level: CompressionLevel.MEDIUM, quality: 0.9 }
  } as ExportOptions,

  // 打印预设
  PRINT_4X6: {
    format: ExportFormat.JPEG,
    dimensions: { width: 1800, height: 1200, maintainAspectRatio: false },
    compression: { level: CompressionLevel.LOW, quality: 0.95 }
  } as ExportOptions,

  PRINT_8X10: {
    format: ExportFormat.JPEG,
    dimensions: { width: 3000, height: 2400, maintainAspectRatio: false },
    compression: { level: CompressionLevel.LOW, quality: 0.95 }
  } as ExportOptions,

  // Web 优化预设
  WEB_LARGE: {
    format: ExportFormat.WEBP,
    dimensions: { maxWidth: 1920, maxHeight: 1080, maintainAspectRatio: true },
    compression: { level: CompressionLevel.MEDIUM, quality: 0.85 }
  } as ExportOptions,

  WEB_MEDIUM: {
    format: ExportFormat.WEBP,
    dimensions: { maxWidth: 1200, maxHeight: 800, maintainAspectRatio: true },
    compression: { level: CompressionLevel.HIGH, quality: 0.8 }
  } as ExportOptions,

  WEB_THUMBNAIL: {
    format: ExportFormat.WEBP,
    dimensions: { maxWidth: 400, maxHeight: 300, maintainAspectRatio: true },
    compression: { level: CompressionLevel.HIGH, quality: 0.8 }
  } as ExportOptions
};
