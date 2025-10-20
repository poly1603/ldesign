import type { Deck } from '@deck.gl/core';

/**
 * 导出格式类型
 */
export type ExportFormat = 'png' | 'jpeg' | 'webp';

/**
 * 导出配置选项
 */
export interface ExportOptions {
  format?: ExportFormat;
  quality?: number;  // 0-1，仅用于jpeg和webp
  filename?: string;
  width?: number;
  height?: number;
  scale?: number;  // 缩放因子，用于高分辨率导出
}

/**
 * ExportUtil - 地图导出工具
 * 提供将地图导出为图片的功能
 */
export class ExportUtil {
  /**
   * 导出地图为图片
   * @param deck Deck.gl 实例
   * @param options 导出选项
   * @returns Promise<Blob> 图片数据
   */
  static async exportToImage(
    deck: Deck | null,
    options: ExportOptions = {}
  ): Promise<Blob> {
    if (!deck) {
      throw new Error('Deck instance is required for export');
    }

    const {
      format = 'png',
      quality = 0.92,
      width,
      height,
      scale = 1
    } = options;

    // 获取 canvas 元素
    const canvas = (deck as any).canvas as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Canvas element not found');
    }

    // 如果需要缩放，创建新的 canvas
    let exportCanvas = canvas;
    if (scale !== 1 || width || height) {
      exportCanvas = document.createElement('canvas');
      const targetWidth = width || canvas.width * scale;
      const targetHeight = height || canvas.height * scale;
      exportCanvas.width = targetWidth;
      exportCanvas.height = targetHeight;

      const ctx = exportCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // 绘制原始 canvas 到新 canvas
      ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
    }

    // 转换为 Blob
    return new Promise((resolve, reject) => {
      exportCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to export canvas to blob'));
          }
        },
        `image/${format}`,
        quality
      );
    });
  }

  /**
   * 下载地图为图片文件
   * @param deck Deck.gl 实例
   * @param options 导出选项
   */
  static async downloadAsImage(
    deck: Deck | null,
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      format = 'png',
      filename = `map-export-${Date.now()}.${format}`
    } = options;

    try {
      const blob = await this.exportToImage(deck, options);
      const url = URL.createObjectURL(blob);

      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 释放 URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Failed to download map image:', error);
      throw error;
    }
  }

  /**
   * 将地图导出为 Base64 字符串
   * @param deck Deck.gl 实例
   * @param options 导出选项
   * @returns Promise<string> Base64 字符串
   */
  static async exportToBase64(
    deck: Deck | null,
    options: ExportOptions = {}
  ): Promise<string> {
    const blob = await this.exportToImage(deck, options);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * 打印地图
   * @param deck Deck.gl 实例
   * @param options 导出选项
   */
  static async print(deck: Deck | null, options: ExportOptions = {}): Promise<void> {
    try {
      const base64 = await this.exportToBase64(deck, options);

      // 创建打印窗口
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window');
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print Map</title>
            <style>
              body { margin: 0; padding: 0; }
              img { width: 100%; height: auto; }
              @media print {
                body { margin: 0; }
                img { width: 100%; height: auto; page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <img src="${base64}" onload="window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error('Failed to print map:', error);
      throw error;
    }
  }

  /**
   * 将地图截图复制到剪贴板
   * @param deck Deck.gl 实例
   * @param options 导出选项
   */
  static async copyToClipboard(
    deck: Deck | null,
    options: ExportOptions = {}
  ): Promise<void> {
    if (!navigator.clipboard) {
      throw new Error('Clipboard API not supported');
    }

    try {
      const blob = await this.exportToImage(deck, options);
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
    } catch (error) {
      console.error('Failed to copy map to clipboard:', error);
      throw error;
    }
  }
}


