import type { QRCodeConfig, QRCodeStyle, LogoConfig, DotStyle, LogoShape, LogoAspectRatio } from '../types';
import { QRCodeGenerator } from '../core/generator';
import { drawDot } from './styles/dots';
import { createCanvasGradient } from './styles/gradients';
import { drawEye, getEyePositions, isInEye } from './styles/eyes';
import { applyShadow, clearShadow, drawBackgroundImage } from './styles/effects';

/**
 * Default style configuration
 */
const DEFAULT_STYLE: Required<Omit<QRCodeStyle, 'gradient' | 'backgroundGradient' | 'backgroundImage' | 'eyeStyle' | 'shadow' | 'stroke' | 'dotStyle'>> & Pick<QRCodeStyle, 'dotStyle'> = {
  fgColor: '#000000',
  bgColor: '#ffffff',
  size: 200,
  margin: 4,
  cornerRadius: 0,
  dotStyle: 'square' as DotStyle,
  rotate: 0,
  invert: false,
};

/**
 * Canvas renderer for QR codes
 */
export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private generator: QRCodeGenerator;
  private config: QRCodeConfig;
  private style: Required<QRCodeStyle>;

  constructor(config: QRCodeConfig) {
    this.config = config;
    this.style = { ...DEFAULT_STYLE, ...config.style };
    this.generator = new QRCodeGenerator(config);

    this.canvas = document.createElement('canvas');
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas 2D context');
    }
    this.ctx = ctx;

    this.render();
  }

  /**
   * Render QR code to canvas
   */
  private async render(): Promise<void> {
    const moduleCount = this.generator.getModuleCount();
    const margin = this.style.margin;
    const totalModules = moduleCount + margin * 2;
    const moduleSize = this.style.size / totalModules;

    // Set canvas size
    this.canvas.width = this.style.size;
    this.canvas.height = this.style.size;

    // Apply rotation if configured
    const rotate = this.config.style?.rotate || 0;
    if (rotate !== 0) {
      this.ctx.save();
      const centerX = this.style.size / 2;
      const centerY = this.style.size / 2;
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate((rotate * Math.PI) / 180);
      this.ctx.translate(-centerX, -centerY);
    }

    // Apply invert (swap foreground and background colors)
    if (this.config.style?.invert) {
      const temp = this.style.fgColor;
      this.style.fgColor = this.style.bgColor;
      this.style.bgColor = temp;
    }

    // Draw background
    await this.drawBackground();

    // Get eye positions
    const eyePositions = getEyePositions(moduleCount);
    const dotStyle = (this.config.style?.dotStyle || DEFAULT_STYLE.dotStyle) as DotStyle;

    // Apply shadow if configured
    if (this.config.style?.shadow) {
      applyShadow(this.ctx, this.config.style.shadow);
    }

    // Setup fill style (gradient or solid color)
    if (this.config.style?.gradient) {
      const gradient = createCanvasGradient(
        this.ctx,
        this.config.style.gradient,
        this.style.size,
        this.style.size
      );
      this.ctx.fillStyle = gradient;
    } else {
      this.ctx.fillStyle = this.style.fgColor;
    }

    // Draw QR modules (excluding eyes if custom eye style is specified)
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (this.generator.isDark(row, col)) {
          // Skip if this module is part of an eye and custom eye style is configured
          if (this.config.style?.eyeStyle && isInEye(row, col, eyePositions)) {
            continue;
          }

          const x = (col + margin) * moduleSize;
          const y = (row + margin) * moduleSize;

          drawDot(this.ctx, x, y, moduleSize, dotStyle, this.style.cornerRadius);
        }
      }
    }

    // Clear shadow before drawing eyes
    if (this.config.style?.shadow) {
      clearShadow(this.ctx);
    }

    // Draw custom eye styles if configured
    if (this.config.style?.eyeStyle) {
      this.drawEyes(eyePositions, moduleSize, margin);
    }

    // Draw logo if configured
    if (this.config.logo) {
      await this.drawLogo(this.config.logo);
    }

    // Restore canvas state if rotation was applied
    if (rotate !== 0) {
      this.ctx.restore();
    }
  }

  /**
   * Draw background (solid color, gradient, or image)
   */
  private async drawBackground(): Promise<void> {
    // Draw background image first if configured
    if (this.config.style?.backgroundImage) {
      try {
        await drawBackgroundImage(
          this.ctx,
          this.config.style.backgroundImage,
          this.style.size,
          this.style.size,
          0.1
        );
      } catch (error) {
        console.warn('Failed to draw background image:', error);
      }
    }

    // Draw background gradient or solid color on top
    if (this.config.style?.backgroundGradient) {
      const gradient = createCanvasGradient(
        this.ctx,
        this.config.style.backgroundGradient,
        this.style.size,
        this.style.size
      );
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.style.size, this.style.size);
    } else if (!this.config.style?.backgroundImage) {
      this.ctx.fillStyle = this.style.bgColor;
      this.ctx.fillRect(0, 0, this.style.size, this.style.size);
    }
  }

  /**
   * Draw custom eye styles
   */
  private drawEyes(
    eyePositions: Array<{ row: number; col: number; size: number }>,
    moduleSize: number,
    margin: number
  ): void {
    if (!this.config.style?.eyeStyle) return;

    const eyeStyles = Array.isArray(this.config.style.eyeStyle)
      ? this.config.style.eyeStyle
      : [this.config.style.eyeStyle, this.config.style.eyeStyle, this.config.style.eyeStyle];

    eyePositions.forEach((eye, index) => {
      const eyeStyle = eyeStyles[index] || eyeStyles[0];
      drawEye(
        this.ctx,
        eye,
        moduleSize,
        margin,
        eyeStyle,
        (row, col) => this.generator.isDark(row, col),
        this.style.size
      );
    });
  }

  /**
   * Draw rounded rectangle
   */
  private drawRoundedRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Draw logo on QR code
   */
  private async drawLogo(logoConfig: LogoConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      if (logoConfig.crossOrigin) {
        img.crossOrigin = logoConfig.crossOrigin;
      }

      img.onload = () => {
        const size = this.style.size;
        let logoWidth = typeof logoConfig.width === 'number'
          ? logoConfig.width
          : size * (parseFloat(logoConfig.width || '20%') / 100);
        let logoHeight = typeof logoConfig.height === 'number'
          ? logoConfig.height
          : size * (parseFloat(logoConfig.height || '20%') / 100);

        // Handle aspect ratio
        const aspectRatio = logoConfig.aspectRatio || ('keep' as LogoAspectRatio);
        const imgAspect = img.width / img.height;
        const logoAspect = logoWidth / logoHeight;

        if (aspectRatio === 'keep') {
          // Keep original aspect ratio, adjust size to fit
          if (imgAspect > logoAspect) {
            logoHeight = logoWidth / imgAspect;
          } else {
            logoWidth = logoHeight * imgAspect;
          }
        } else if (aspectRatio === 'cover') {
          // Cover the area, may crop
          if (imgAspect > logoAspect) {
            logoWidth = logoHeight * imgAspect;
          } else {
            logoHeight = logoWidth / imgAspect;
          }
        }
        // 'fill' and 'contain' use the specified dimensions

        let x = (size - logoWidth) / 2;
        let y = (size - logoHeight) / 2;

        // Draw logo background if configured
        if (logoConfig.logoBackground) {
          const bgPadding = logoConfig.logoBackgroundPadding || 0;
          const bgColor = logoConfig.logoBackgroundColor || '#ffffff';

          this.ctx.fillStyle = bgColor;

          const bgX = x - bgPadding;
          const bgY = y - bgPadding;
          const bgWidth = logoWidth + bgPadding * 2;
          const bgHeight = logoHeight + bgPadding * 2;

          const logoShape = logoConfig.logoShape || ('auto' as LogoShape);
          if (logoShape === 'circle') {
            const radius = Math.max(bgWidth, bgHeight) / 2;
            const centerX = size / 2;
            const centerY = size / 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
          } else if (logoConfig.borderRadius) {
            this.drawRoundedRect(bgX, bgY, bgWidth, bgHeight, logoConfig.borderRadius);
          } else {
            this.ctx.fillRect(bgX, bgY, bgWidth, bgHeight);
          }
        }

        // Draw border if configured
        if (logoConfig.border) {
          const borderWidth = logoConfig.borderWidth || 2;
          const borderRadius = logoConfig.borderRadius || 0;

          this.ctx.fillStyle = logoConfig.borderColor || '#ffffff';
          this.drawRoundedRect(
            x - borderWidth,
            y - borderWidth,
            logoWidth + borderWidth * 2,
            logoHeight + borderWidth * 2,
            borderRadius
          );
        }

        // Apply logo shape clipping
        const logoShape = logoConfig.logoShape || ('auto' as LogoShape);
        this.ctx.save();

        if (logoShape === 'circle') {
          const radius = Math.min(logoWidth, logoHeight) / 2;
          const centerX = x + logoWidth / 2;
          const centerY = y + logoHeight / 2;
          this.ctx.beginPath();
          this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          this.ctx.clip();
        } else if (logoShape === 'rounded' || logoConfig.borderRadius) {
          const radius = logoConfig.borderRadius || Math.min(logoWidth, logoHeight) * 0.1;
          this.drawRoundedRectPath(x, y, logoWidth, logoHeight, radius);
          this.ctx.clip();
        } else if (logoShape === 'square') {
          // For square, ensure it's actually square
          const squareSize = Math.min(logoWidth, logoHeight);
          x = (size - squareSize) / 2;
          y = (size - squareSize) / 2;
          logoWidth = squareSize;
          logoHeight = squareSize;
        }

        this.ctx.drawImage(img, x, y, logoWidth, logoHeight);
        this.ctx.restore();

        resolve();
      };

      img.onerror = () => {
        reject(new Error(`Failed to load logo image: ${logoConfig.src}`));
      };

      img.src = logoConfig.src;
    });
  }

  /**
   * Create rounded rectangle path for clipping
   */
  private drawRoundedRectPath(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  /**
   * Update QR code
   */
  async update(config: Partial<QRCodeConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    if (config.style) {
      this.style = { ...this.style, ...config.style };
    }
    this.generator.update(this.config);
    await this.render();
  }

  /**
   * Get canvas element
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get data URL
   */
  toDataURL(format: 'png' | 'jpeg' = 'png', quality?: number): string {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    return this.canvas.toDataURL(mimeType, quality);
  }

  /**
   * Download as image
   */
  download(fileName: string = 'qrcode.png', format: 'png' | 'jpeg' = 'png', quality?: number): void {
    const dataURL = this.toDataURL(format, quality);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataURL;
    link.click();
  }
}
