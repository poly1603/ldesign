import type { QRCodeConfig, QRCodeStyle, LogoConfig, LogoShape, LogoAspectRatio, EffectType } from '../types';
import { DotStyle } from '../types';
import { QRCodeGenerator } from '../core/generator';
import { drawDot } from './styles/dots';
import { createCanvasGradient } from './styles/gradients';
import { drawEye, getEyePositions, isInEye } from './styles/eyes';
import { applyShadow, clearShadow, drawBackgroundImage } from './styles/effects';
import { renderLiquidFlow } from './styles/liquid-flow'
import { renderImprovedLiquidFlow, renderLiquidWithRegions } from './styles/improved-liquid'

/**
 * Default style configuration
 */
const DEFAULT_STYLE: Partial<QRCodeStyle> & { fgColor: string; bgColor: string; size: number; margin: number; cornerRadius: number; dotStyle: DotStyle; rotate: 0; invert: false } = {
  fgColor: '#000000',
  bgColor: '#ffffff',
  size: 200,
  margin: 4,
  cornerRadius: 0,
  dotStyle: DotStyle.Square,
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
  private style: typeof DEFAULT_STYLE & Partial<QRCodeStyle>;

  constructor(config: QRCodeConfig) {
    this.config = config;
    this.style = { ...DEFAULT_STYLE, ...config.style } as typeof DEFAULT_STYLE & Partial<QRCodeStyle>;
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

    // Apply transform if configured (perspective and scale)
    const transform = this.config.style?.transform;
    if (transform) {
      this.ctx.save();
      const centerX = this.style.size / 2;
      const centerY = this.style.size / 2;
      this.ctx.translate(centerX, centerY);

      // Apply perspective using transform matrix
      if (transform.perspectiveX || transform.perspectiveY) {
        const px = transform.perspectiveX || 0;
        const py = transform.perspectiveY || 0;
        // Simplified perspective effect using setTransform
        // This creates a skew-like effect that simulates 3D perspective
        this.ctx.transform(1, py, px, 1, 0, 0);
      }

      // Apply scale
      if (transform.scale && transform.scale !== 1) {
        this.ctx.scale(transform.scale, transform.scale);
      }

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

    // Draw margin noise if enabled
    if (this.config.style?.marginNoise) {
      this.drawMarginNoise(moduleCount, margin, moduleSize);
    }

    // Get eye positions
    const eyePositions = getEyePositions(moduleCount);
    const dotStyle = (this.config.style?.dotStyle || DEFAULT_STYLE.dotStyle) as DotStyle;
    
    // Check if we need special rendering for liquid/flow styles
    if (dotStyle === DotStyle.SmoothFlow || dotStyle === DotStyle.Liquid) {
      // Use smooth flow rendering for connected liquid modules
      this.renderSmoothFlow(moduleCount, margin, moduleSize);
    } else if (dotStyle === DotStyle.UltraSmooth) {
      // Use ultra-smooth liquid rendering for the best flowing effect
      this.renderUltraSmoothLiquid(moduleCount, margin, moduleSize);
    } else {

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

      // Get render layer setting
      const renderLayer = this.config.style?.renderLayer || 'all';

      // Draw QR modules (excluding eyes if custom eye style is configured)
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (this.generator.isDark(row, col)) {
            // Check if this module should be rendered based on renderLayer setting
            const isInEyeArea = isInEye(row, col, eyePositions);
            const isFunctionModule = this.generator.isFunctionModule(row, col);
            const isDataModule = this.generator.isDataModule(row, col);
            const isTimingModule = this.generator.isTimingPattern(row, col);

            // Filter based on renderLayer
            if (renderLayer === 'function' && !isFunctionModule) continue;
            if (renderLayer === 'data' && !isDataModule) continue;
            if (renderLayer === 'guide' && !isTimingModule) continue;
            if (renderLayer === 'marker' && !isInEyeArea) continue;

            // Skip if this module is part of an eye and custom eye style is configured
            if (this.config.style?.eyeStyle && isInEyeArea) {
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
    }

    // Apply other visual effects if configured (not smooth-flow)
    if (this.config.style?.effect && this.config.style.effect !== 'none' && this.config.style.effect !== 'smooth-flow') {
      this.applyEffect(this.config.style.effect);
    }

    // Draw logo if configured
    if (this.config.logo) {
      await this.drawLogo(this.config.logo);
    }

    // Restore canvas state if transform was applied
    if (transform) {
      this.ctx.restore();
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
   * Draw margin noise (decorative dots in margin area)
   */
  private drawMarginNoise(moduleCount: number, margin: number, moduleSize: number): void {
    const seed = this.config.style?.seed || Date.now();
    const random = this.seededRandom(seed);
    const density = 0.15; // 15% of margin cells will have noise

    const totalSize = moduleCount + margin * 2;
    this.ctx.fillStyle = this.style.fgColor;
    this.ctx.globalAlpha = 0.2; // Make noise subtle

    for (let row = 0; row < totalSize; row++) {
      for (let col = 0; col < totalSize; col++) {
        // Check if in margin area
        const inMargin = row < margin || row >= moduleCount + margin ||
                        col < margin || col >= moduleCount + margin;

        if (inMargin && random() < density) {
          const x = col * moduleSize + moduleSize / 2;
          const y = row * moduleSize + moduleSize / 2;
          const size = moduleSize * (0.2 + random() * 0.3);

          this.ctx.beginPath();
          this.ctx.arc(x, y, size, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
    }

    this.ctx.globalAlpha = 1.0; // Reset alpha
  }

  /**
   * Seeded pseudo-random number generator
   */
  private seededRandom(seed: number): () => number {
    let current = seed;
    return () => {
      current = (current * 9301 + 49297) % 233280;
      return current / 233280;
    };
  }

  /**
   * Apply visual effect to canvas
   */
  private applyEffect(effectType: EffectType): void {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    if (effectType === 'crystalize') {
      // Crystalize effect: creates crystalline patterns
      this.applyCrystalizeEffect(imageData);
    }
    
    this.ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Apply crystalize effect
   */
  private applyCrystalizeEffect(imageData: ImageData): void {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const blockSize = 4; // Size of crystalline blocks

    // Create a copy of the original data
    const original = new Uint8ClampedArray(data);

    for (let y = 0; y < height; y += blockSize) {
      for (let x = 0; x < width; x += blockSize) {
        // Calculate average color for this block
        let r = 0, g = 0, b = 0, a = 0, count = 0;

        for (let by = 0; by < blockSize && y + by < height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4;
            r += original[idx];
            g += original[idx + 1];
            b += original[idx + 2];
            a += original[idx + 3];
            count++;
          }
        }

        // Average color
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        a = Math.round(a / count);

        // Apply averaged color to all pixels in block
        for (let by = 0; by < blockSize && y + by < height; by++) {
          for (let bx = 0; bx < blockSize && x + bx < width; bx++) {
            const idx = ((y + by) * width + (x + bx)) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = a;
          }
        }
      }
    }
  }

  /**
   * Render QR code with ultra-smooth liquid effect
   */
  private renderUltraSmoothLiquid(moduleCount: number, margin: number, moduleSize: number): void {
    // Create a 2D array of boolean values for modules
    const modules: boolean[][] = [];
    const eyePositions = getEyePositions(moduleCount);
    
    for (let row = 0; row < moduleCount; row++) {
      modules[row] = [];
      for (let col = 0; col < moduleCount; col++) {
        // Exclude eye areas if custom eye style is configured
        if (this.config.style?.eyeStyle && isInEye(row, col, eyePositions)) {
          modules[row][col] = false;
        } else {
          modules[row][col] = this.generator.isDark(row, col);
        }
      }
    }
    
    // Apply shadow if configured
    if (this.config.style?.shadow) {
      applyShadow(this.ctx, this.config.style.shadow);
    }
    
    // Setup fill style
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
    
    // Use the improved liquid flow rendering
    // You can switch between different implementations:
    // renderLiquidFlow(this.ctx, modules, moduleSize, margin); // Original
    renderImprovedLiquidFlow(this.ctx, modules, moduleSize, margin); // Improved marching squares
    // renderLiquidWithRegions(this.ctx, modules, moduleSize, margin); // Region-based
    
    // Clear shadow before drawing eyes
    if (this.config.style?.shadow) {
      clearShadow(this.ctx);
    }
    
    // Draw custom eye styles if configured
    if (this.config.style?.eyeStyle) {
      this.drawEyes(eyePositions, moduleSize, margin);
    }
  }

  /**
   * Render QR code with smooth flow effect (liquid style)
   */
  private renderSmoothFlow(moduleCount: number, margin: number, moduleSize: number): void {
    // Get eye positions
    const eyePositions = getEyePositions(moduleCount);
    
    // Apply shadow if configured
    if (this.config.style?.shadow) {
      applyShadow(this.ctx, this.config.style.shadow);
    }
    
    // Setup fill style for modules
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
    
    // First pass: collect all dark modules into connected groups
    const visited = new Set<string>();
    const groups: Array<Array<{row: number, col: number}>> = [];
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const key = `${row},${col}`;
        if (this.generator.isDark(row, col) && !visited.has(key)) {
          // Start a new group
          const group: Array<{row: number, col: number}> = [];
          const queue = [{row, col}];
          
          while (queue.length > 0) {
            const current = queue.shift()!;
            const currentKey = `${current.row},${current.col}`;
            
            if (visited.has(currentKey)) continue;
            visited.add(currentKey);
            group.push(current);
            
            // Check all 8 neighbors for liquid grouping
            const neighbors = [
              {r: current.row - 1, c: current.col},     // top
              {r: current.row - 1, c: current.col + 1}, // top-right
              {r: current.row, c: current.col + 1},     // right
              {r: current.row + 1, c: current.col + 1}, // bottom-right
              {r: current.row + 1, c: current.col},     // bottom
              {r: current.row + 1, c: current.col - 1}, // bottom-left
              {r: current.row, c: current.col - 1},     // left
              {r: current.row - 1, c: current.col - 1}  // top-left
            ];
            
            for (const n of neighbors) {
              if (n.r >= 0 && n.r < moduleCount && n.c >= 0 && n.c < moduleCount) {
                const nKey = `${n.r},${n.c}`;
                if (this.generator.isDark(n.r, n.c) && !visited.has(nKey)) {
                  queue.push({row: n.r, col: n.c});
                }
              }
            }
          }
          
          groups.push(group);
        }
      }
    }
    
    // Second pass: draw each module with neighbor awareness
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (this.generator.isDark(row, col)) {
          const x = (col + margin) * moduleSize;
          const y = (row + margin) * moduleSize;
          
          // Check if in eye area
          if (this.config.style?.eyeStyle && isInEye(row, col, eyePositions)) {
            continue; // Skip, will be drawn by drawEyes
          }
          
          // Check orthogonal neighbors for liquid connection
          const hasTop = row > 0 && this.generator.isDark(row - 1, col);
          const hasRight = col < moduleCount - 1 && this.generator.isDark(row, col + 1);
          const hasBottom = row < moduleCount - 1 && this.generator.isDark(row + 1, col);
          const hasLeft = col > 0 && this.generator.isDark(row, col - 1);
          
          // Check diagonal neighbors for smoother connections
          const hasTopLeft = row > 0 && col > 0 && this.generator.isDark(row - 1, col - 1);
          const hasTopRight = row > 0 && col < moduleCount - 1 && this.generator.isDark(row - 1, col + 1);
          const hasBottomLeft = row < moduleCount - 1 && col > 0 && this.generator.isDark(row + 1, col - 1);
          const hasBottomRight = row < moduleCount - 1 && col < moduleCount - 1 && this.generator.isDark(row + 1, col + 1);
          
          // Draw liquid-style module with diagonal awareness
          this.drawLiquidModuleEnhanced(
            x, y, moduleSize,
            hasTop, hasRight, hasBottom, hasLeft,
            hasTopLeft, hasTopRight, hasBottomLeft, hasBottomRight
          );
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
  }
  
  /**
   * Enhanced liquid module drawing with diagonal neighbor awareness
   */
  private drawLiquidModuleEnhanced(
    x: number,
    y: number,
    size: number,
    hasTop: boolean,
    hasRight: boolean,
    hasBottom: boolean,
    hasLeft: boolean,
    hasTopLeft: boolean,
    hasTopRight: boolean,
    hasBottomLeft: boolean,
    hasBottomRight: boolean
  ): void {
    const radius = size * 0.45; // Optimized radius for smoother flow
    const smoothness = 0.35; // Control point distance for bezier curves
    
    this.ctx.beginPath();
    
    // Draw based on connection patterns for organic blob effect
    const cx = x + size / 2;
    const cy = y + size / 2;
    
    // If isolated or only diagonal neighbors, draw a smooth circle
    if (!hasTop && !hasRight && !hasBottom && !hasLeft) {
      this.ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
      this.ctx.fill();
      return;
    }
    
    // Simplified smooth path drawing for better liquid effect
    const connectionCount = (hasTop ? 1 : 0) + (hasRight ? 1 : 0) + 
                           (hasBottom ? 1 : 0) + (hasLeft ? 1 : 0);
    
    // For modules with many connections, use a more fluid approach
    if (connectionCount >= 3) {
      // Draw a filled rectangle with smoothed corners where not connected
      this.ctx.moveTo(x + (hasLeft || hasTop ? 0 : radius), y + (hasTop ? 0 : radius));
    
      // Top edge
      if (hasTop) {
        this.ctx.lineTo(x + size - (hasRight || hasTop ? 0 : radius), y);
      } else {
        // Smooth arc for disconnected top
        this.ctx.arcTo(x + size / 2, y, x + size - (hasRight ? 0 : radius), y + (hasRight ? 0 : radius), radius);
      }
    
      // Top-right corner
      if (!hasTop && !hasRight) {
        this.ctx.arcTo(x + size, y, x + size, y + radius, radius);
      } else if (hasTop && hasRight && !hasTopRight) {
        // Inner corner smoothing
        this.ctx.lineTo(x + size, y);
      } else {
        this.ctx.lineTo(x + size, y + (hasRight ? 0 : radius));
      }
    
      // Right edge
      if (hasRight) {
        this.ctx.lineTo(x + size, y + size - (hasBottom || hasRight ? 0 : radius));
      } else {
        this.ctx.arcTo(x + size, y + size / 2, x + size - (hasBottom ? 0 : radius), y + size, radius);
      }
    
      // Bottom-right corner
      if (!hasBottom && !hasRight) {
        this.ctx.arcTo(x + size, y + size, x + size - radius, y + size, radius);
      } else if (hasBottom && hasRight && !hasBottomRight) {
        this.ctx.lineTo(x + size, y + size);
      } else {
        this.ctx.lineTo(x + (hasBottom ? size : size - radius), y + size);
      }
    
      // Bottom edge
      if (hasBottom) {
        this.ctx.lineTo(x + (hasLeft || hasBottom ? 0 : radius), y + size);
      } else {
        this.ctx.arcTo(x + size / 2, y + size, x + (hasLeft ? 0 : radius), y + size - (hasLeft ? 0 : radius), radius);
      }
    
      // Bottom-left corner
      if (!hasBottom && !hasLeft) {
        this.ctx.arcTo(x, y + size, x, y + size - radius, radius);
      } else if (hasBottom && hasLeft && !hasBottomLeft) {
        this.ctx.lineTo(x, y + size);
      } else {
        this.ctx.lineTo(x, y + (hasLeft ? size : size - radius));
      }
    
      // Left edge
      if (hasLeft) {
        this.ctx.lineTo(x, y + (hasTop || hasLeft ? 0 : radius));
      } else {
        this.ctx.arcTo(x, y + size / 2, x + (hasTop ? 0 : radius), y, radius);
      }
    
      // Top-left corner (closing)
      if (!hasTop && !hasLeft) {
        this.ctx.arcTo(x, y, x + radius, y, radius);
      } else if (hasTop && hasLeft && !hasTopLeft) {
        this.ctx.lineTo(x, y);
      }
      
      this.ctx.closePath();
      this.ctx.fill();
      return;
    }
    
    // For modules with fewer connections, use a more organic approach
    // This creates smoother, more liquid-like connections
    const cp = size * smoothness; // Control point offset
    
    // Start from a strategic point
    if (hasLeft) {
      this.ctx.moveTo(x, y + size * 0.3);
    } else if (hasTop) {
      this.ctx.moveTo(x + size * 0.3, y);
    } else {
      this.ctx.moveTo(x + radius, y + radius * 0.5);
    }
    
    // Draw smooth curves based on connections
    if (hasTop) {
      this.ctx.lineTo(x + size * 0.7, y);
      if (!hasRight) {
        this.ctx.bezierCurveTo(
          x + size - cp, y,
          x + size, y + cp,
          x + size - radius * 0.3, y + radius
        );
      } else {
        this.ctx.lineTo(x + size, y);
      }
    } else {
      this.ctx.bezierCurveTo(
        x + size * 0.5, y - cp * 0.3,
        x + size * 0.8, y + cp * 0.5,
        x + size - (hasRight ? 0 : radius), y + (hasRight ? 0 : radius)
      );
    }
    
    if (hasRight) {
      this.ctx.lineTo(x + size, y + size * 0.7);
      if (!hasBottom) {
        this.ctx.bezierCurveTo(
          x + size, y + size - cp,
          x + size - cp, y + size,
          x + size - radius, y + size - radius * 0.3
        );
      } else {
        this.ctx.lineTo(x + size, y + size);
      }
    } else {
      this.ctx.bezierCurveTo(
        x + size + cp * 0.3, y + size * 0.5,
        x + size - cp * 0.5, y + size * 0.8,
        x + (hasBottom ? size : size - radius), y + size - (hasBottom ? 0 : radius)
      );
    }
    
    if (hasBottom) {
      this.ctx.lineTo(x + size * 0.3, y + size);
      if (!hasLeft) {
        this.ctx.bezierCurveTo(
          x + cp, y + size,
          x, y + size - cp,
          x + radius * 0.3, y + size - radius
        );
      } else {
        this.ctx.lineTo(x, y + size);
      }
    } else {
      this.ctx.bezierCurveTo(
        x + size * 0.5, y + size + cp * 0.3,
        x + size * 0.2, y + size - cp * 0.5,
        x + (hasLeft ? 0 : radius), y + size - (hasLeft ? 0 : radius)
      );
    }
    
    if (hasLeft) {
      this.ctx.lineTo(x, y + size * 0.3);
      if (!hasTop) {
        this.ctx.bezierCurveTo(
          x, y + cp,
          x + cp, y,
          x + radius, y + radius * 0.3
        );
      } else {
        this.ctx.lineTo(x, y);
      }
    } else {
      this.ctx.bezierCurveTo(
        x - cp * 0.3, y + size * 0.5,
        x + cp * 0.5, y + size * 0.2,
        x + (hasTop ? 0 : radius), y + (hasTop ? 0 : radius)
      );
    }
    
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  /**
   * Draw a liquid-style module that connects smoothly with neighbors
   */
  private drawLiquidModule(
    x: number,
    y: number,
    size: number,
    hasTop: boolean,
    hasRight: boolean,
    hasBottom: boolean,
    hasLeft: boolean
  ): void {
    const radius = size * 0.45; // Larger radius for more fluid look
    const inset = size * 0.08; // Small inset for organic feel
    
    this.ctx.beginPath();
    
    // Top-left corner
    if (hasTop && hasLeft) {
      this.ctx.moveTo(x, y);
    } else if (hasTop) {
      this.ctx.moveTo(x + inset, y);
      this.ctx.quadraticCurveTo(x, y, x, y + inset);
    } else if (hasLeft) {
      this.ctx.moveTo(x, y + inset);
      this.ctx.quadraticCurveTo(x, y, x + inset, y);
    } else {
      this.ctx.moveTo(x + radius, y);
      this.ctx.quadraticCurveTo(x, y, x, y + radius);
    }
    
    // Top edge
    if (hasTop) {
      this.ctx.lineTo(x + size - (hasRight ? 0 : inset), y);
    } else {
      this.ctx.lineTo(x + size - radius, y);
    }
    
    // Top-right corner
    if (hasTop && hasRight) {
      this.ctx.lineTo(x + size, y);
    } else if (hasTop) {
      this.ctx.quadraticCurveTo(x + size, y, x + size, y + inset);
    } else if (hasRight) {
      this.ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
    } else {
      this.ctx.quadraticCurveTo(x + size, y, x + size, y + radius);
    }
    
    // Right edge
    if (hasRight) {
      this.ctx.lineTo(x + size, y + size - (hasBottom ? 0 : inset));
    } else {
      this.ctx.lineTo(x + size, y + size - radius);
    }
    
    // Bottom-right corner
    if (hasBottom && hasRight) {
      this.ctx.lineTo(x + size, y + size);
    } else if (hasBottom) {
      this.ctx.quadraticCurveTo(x + size, y + size, x + size - inset, y + size);
    } else if (hasRight) {
      this.ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
    } else {
      this.ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size);
    }
    
    // Bottom edge
    if (hasBottom) {
      this.ctx.lineTo(x + (hasLeft ? 0 : inset), y + size);
    } else {
      this.ctx.lineTo(x + radius, y + size);
    }
    
    // Bottom-left corner
    if (hasBottom && hasLeft) {
      this.ctx.lineTo(x, y + size);
    } else if (hasBottom) {
      this.ctx.quadraticCurveTo(x, y + size, x, y + size - inset);
    } else if (hasLeft) {
      this.ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
    } else {
      this.ctx.quadraticCurveTo(x, y + size, x, y + size - radius);
    }
    
    // Left edge
    if (hasLeft) {
      this.ctx.lineTo(x, y + (hasTop ? 0 : inset));
    } else {
      this.ctx.lineTo(x, y + radius);
    }
    
    // Close path with smooth curve if needed
    if (!hasTop && !hasLeft) {
      this.ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    
    this.ctx.closePath();
    this.ctx.fill();
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
