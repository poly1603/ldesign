import type { QRCodeConfig, QRCodeInstance, GenerateOptions, DownloadOptions, RenderType } from './types';
import { CanvasRenderer } from './renderers/canvas';
import { SVGRenderer } from './renderers/svg';

// Export types
export * from './types';

// Export utilities
export { QRContentHelper } from './utils/content-templates';
export { QRCodePresets, getPreset, getPresetNames, searchPresetsByTag, getAllTags } from './presets';
export { QRCodeValidator, QRCodeOptimizer } from './utils/validator';
export { QRCodeCacheManager, enableCache, clearCache, getCacheStats, cache } from './utils/cache';
export { QRCodeWorkerPool, batchDownload } from './utils/worker';
export { applyAnimation, injectAnimationStyles } from './utils/animation';

// Export scanner
export { QRCodeScanner } from './scanner';
export type { QRCodeScanResult, QRCodeScannerOptions } from './scanner';

// Adapters are available at './adapters/react' and './adapters/vue'
// Scanner adapters are available at './scanner/react' and './scanner/vue'

/**
 * QR Code class
 */
class QRCode implements QRCodeInstance {
  private renderer: CanvasRenderer | SVGRenderer;
  private renderType: RenderType;
  private container?: HTMLElement;

  constructor(config: GenerateOptions) {
    this.renderType = config.renderType || 'canvas';
    this.container = config.container;

    // Create renderer based on type
    if (this.renderType === 'svg') {
      this.renderer = new SVGRenderer(config);
    } else {
      this.renderer = new CanvasRenderer(config);
    }

    // Append to container if provided
    if (this.container) {
      this.container.appendChild(this.getElement()!);
    }
  }

  /**
   * Update QR code configuration
   */
  async update(config: Partial<QRCodeConfig>): Promise<void> {
    if (this.renderer instanceof CanvasRenderer) {
      await this.renderer.update(config);
    } else {
      this.renderer.update(config);
    }
  }

  /**
   * Get data URL (canvas only)
   */
  toDataURL(format: 'png' | 'jpeg' = 'png', quality?: number): string {
    if (this.renderer instanceof CanvasRenderer) {
      return this.renderer.toDataURL(format, quality);
    }
    throw new Error('toDataURL is only available for canvas render type');
  }

  /**
   * Download QR code
   */
  download(options: DownloadOptions = {}): void {
    const { fileName = 'qrcode', format = 'png', quality } = options;

    if (this.renderer instanceof CanvasRenderer) {
      this.renderer.download(`${fileName}.${format}`, format, quality);
    } else {
      this.renderer.download(`${fileName}.svg`);
    }
  }

  /**
   * Get SVG string (SVG only)
   */
  toSVGString(): string {
    if (this.renderer instanceof SVGRenderer) {
      return this.renderer.toString();
    }
    throw new Error('toSVGString is only available for SVG render type');
  }

  /**
   * Destroy QR code instance
   */
  destroy(): void {
    const element = this.getElement();
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  /**
   * Get the rendered element
   */
  getElement(): HTMLCanvasElement | SVGSVGElement | null {
    if (this.renderer instanceof CanvasRenderer) {
      return this.renderer.getCanvas();
    } else {
      return this.renderer.getSVG();
    }
  }
}

/**
 * Create a QR code instance
 */
export function createQRCode(config: GenerateOptions): QRCodeInstance {
  return new QRCode(config);
}

/**
 * Generate QR code and append to container
 */
export function generateQRCode(container: HTMLElement, config: QRCodeConfig): QRCodeInstance {
  return new QRCode({ ...config, container });
}

/**
 * Generate QR code as data URL (canvas only)
 */
export async function toDataURL(
  content: string,
  config?: Omit<QRCodeConfig, 'content'>,
  format: 'png' | 'jpeg' = 'png',
  quality?: number
): Promise<string> {
  const qr = new QRCode({
    ...config,
    content,
    renderType: 'canvas',
  });

  // Wait for rendering to complete (especially for logos)
  await new Promise(resolve => setTimeout(resolve, 100));

  const dataURL = qr.toDataURL(format, quality);
  qr.destroy();
  return dataURL;
}

/**
 * Generate QR code as SVG string
 */
export function toSVGString(
  content: string,
  config?: Omit<QRCodeConfig, 'content'>
): string {
  const qr = new QRCode({
    ...config,
    content,
    renderType: 'svg',
  });

  const svgString = qr.toSVGString();
  qr.destroy();
  return svgString;
}

// Default export
export default {
  createQRCode,
  generateQRCode,
  toDataURL,
  toSVGString,
};
