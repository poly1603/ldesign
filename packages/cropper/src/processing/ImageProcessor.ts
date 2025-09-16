/**
 * @ldesign/cropper - 图像处理器
 * 
 * 提供各种图像处理功能
 */

import type { ImageProcessOptions, Size } from '../types';
import { createCanvas, clamp, degToRad } from '../utils';

/**
 * 滤镜类型
 */
export type FilterType = 
  | 'none'
  | 'grayscale'
  | 'sepia'
  | 'vintage'
  | 'warm'
  | 'cool'
  | 'bright'
  | 'dark'
  | 'high-contrast'
  | 'low-contrast';

/**
 * 图像处理器类
 * 
 * 提供各种图像处理和滤镜功能
 */
export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImageData: ImageData | null = null;

  constructor() {
    this.canvas = createCanvas(1, 1);
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * 设置源图像
   */
  setSourceImage(image: HTMLImageElement): void {
    this.canvas.width = image.naturalWidth;
    this.canvas.height = image.naturalHeight;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(image, 0, 0);
    
    this.originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 应用图像处理选项
   */
  applyProcessing(options: ImageProcessOptions): HTMLCanvasElement {
    if (!this.originalImageData) {
      throw new Error('No source image set');
    }

    // 重置画布
    this.ctx.putImageData(this.originalImageData, 0, 0);

    // 应用基础调整
    this.applyBasicAdjustments(options);

    // 应用滤镜
    if (options.filter) {
      this.applyFilter(options.filter as FilterType);
    }

    // 应用锐化
    if (options.sharpen && options.sharpen > 0) {
      this.applySharpen(options.sharpen);
    }

    // 应用模糊
    if (options.blur && options.blur > 0) {
      this.applyBlur(options.blur);
    }

    return this.canvas;
  }

  /**
   * 应用基础调整
   */
  private applyBasicAdjustments(options: ImageProcessOptions): void {
    const {
      brightness = 0,
      contrast = 0,
      saturation = 0,
      hue = 0
    } = options;

    if (brightness === 0 && contrast === 0 && saturation === 0 && hue === 0) {
      return;
    }

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      // 应用亮度
      if (brightness !== 0) {
        const brightnessFactor = brightness / 100;
        r += 255 * brightnessFactor;
        g += 255 * brightnessFactor;
        b += 255 * brightnessFactor;
      }

      // 应用对比度
      if (contrast !== 0) {
        const contrastFactor = (100 + contrast) / 100;
        r = ((r / 255 - 0.5) * contrastFactor + 0.5) * 255;
        g = ((g / 255 - 0.5) * contrastFactor + 0.5) * 255;
        b = ((b / 255 - 0.5) * contrastFactor + 0.5) * 255;
      }

      // 应用饱和度和色调
      if (saturation !== 0 || hue !== 0) {
        const [h, s, l] = this.rgbToHsl(r, g, b);
        
        // 调整饱和度
        const newS = clamp(s + saturation / 100, 0, 1);
        
        // 调整色调
        const newH = (h + hue / 360) % 1;
        
        [r, g, b] = this.hslToRgb(newH, newS, l);
      }

      // 限制值范围
      data[i] = clamp(r, 0, 255);
      data[i + 1] = clamp(g, 0, 255);
      data[i + 2] = clamp(b, 0, 255);
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * 应用滤镜
   */
  private applyFilter(filterType: FilterType): void {
    if (filterType === 'none') return;

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;

    switch (filterType) {
      case 'grayscale':
        this.applyGrayscaleFilter(data);
        break;
      case 'sepia':
        this.applySepiaFilter(data);
        break;
      case 'vintage':
        this.applyVintageFilter(data);
        break;
      case 'warm':
        this.applyWarmFilter(data);
        break;
      case 'cool':
        this.applyCoolFilter(data);
        break;
      case 'bright':
        this.applyBrightFilter(data);
        break;
      case 'dark':
        this.applyDarkFilter(data);
        break;
      case 'high-contrast':
        this.applyHighContrastFilter(data);
        break;
      case 'low-contrast':
        this.applyLowContrastFilter(data);
        break;
    }

    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * 应用灰度滤镜
   */
  private applyGrayscaleFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }

  /**
   * 应用棕褐色滤镜
   */
  private applySepiaFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
  }

  /**
   * 应用复古滤镜
   */
  private applyVintageFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 增加红色和黄色调
      data[i] = Math.min(255, r * 1.1);
      data[i + 1] = Math.min(255, g * 1.05);
      data[i + 2] = Math.min(255, b * 0.9);
    }
  }

  /**
   * 应用暖色调滤镜
   */
  private applyWarmFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 1.1); // 增加红色
      data[i + 1] = Math.min(255, data[i + 1] * 1.05); // 略微增加绿色
      data[i + 2] = Math.min(255, data[i + 2] * 0.9); // 减少蓝色
    }
  }

  /**
   * 应用冷色调滤镜
   */
  private applyCoolFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] * 0.9); // 减少红色
      data[i + 1] = Math.min(255, data[i + 1] * 1.05); // 略微增加绿色
      data[i + 2] = Math.min(255, data[i + 2] * 1.1); // 增加蓝色
    }
  }

  /**
   * 应用明亮滤镜
   */
  private applyBrightFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + 30);
      data[i + 1] = Math.min(255, data[i + 1] + 30);
      data[i + 2] = Math.min(255, data[i + 2] + 30);
    }
  }

  /**
   * 应用暗色滤镜
   */
  private applyDarkFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, data[i] - 30);
      data[i + 1] = Math.max(0, data[i + 1] - 30);
      data[i + 2] = Math.max(0, data[i + 2] - 30);
    }
  }

  /**
   * 应用高对比度滤镜
   */
  private applyHighContrastFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      data[i] = data[i] > 128 ? Math.min(255, data[i] * 1.3) : Math.max(0, data[i] * 0.7);
      data[i + 1] = data[i + 1] > 128 ? Math.min(255, data[i + 1] * 1.3) : Math.max(0, data[i + 1] * 0.7);
      data[i + 2] = data[i + 2] > 128 ? Math.min(255, data[i + 2] * 1.3) : Math.max(0, data[i + 2] * 0.7);
    }
  }

  /**
   * 应用低对比度滤镜
   */
  private applyLowContrastFilter(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const factor = 0.5;
      data[i] = 128 + (data[i] - 128) * factor;
      data[i + 1] = 128 + (data[i + 1] - 128) * factor;
      data[i + 2] = 128 + (data[i + 2] - 128) * factor;
    }
  }

  /**
   * 应用锐化
   */
  private applySharpen(amount: number): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 锐化卷积核
    const kernel = [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0
    ];

    const newData = new Uint8ClampedArray(data);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c;
              sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          const idx = (y * width + x) * 4 + c;
          newData[idx] = clamp(sum, 0, 255);
        }
      }
    }

    const newImageData = new ImageData(newData, width, height);
    this.ctx.putImageData(newImageData, 0, 0);
  }

  /**
   * 应用模糊
   */
  private applyBlur(radius: number): void {
    // 使用 Canvas 内置的滤镜
    this.ctx.filter = `blur(${radius}px)`;
    const tempCanvas = createCanvas(this.canvas.width, this.canvas.height);
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(this.canvas, 0, 0);
    
    this.ctx.filter = 'none';
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(tempCanvas, 0, 0);
  }

  /**
   * RGB 转 HSL
   */
  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return [h, s, l];
  }

  /**
   * HSL 转 RGB
   */
  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number): number => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
  }

  /**
   * 获取处理后的图像数据
   */
  getProcessedImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 获取处理后的画布
   */
  getProcessedCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 重置到原始图像
   */
  reset(): void {
    if (this.originalImageData) {
      this.ctx.putImageData(this.originalImageData, 0, 0);
    }
  }

  /**
   * 销毁处理器
   */
  destroy(): void {
    this.originalImageData = null;
  }
}
