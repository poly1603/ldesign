/**
 * QR Code Validation and Optimization Tools
 */

import type { QRCodeConfig, ErrorCorrectionLevel } from '../types';

export interface ValidationResult {
 valid: boolean;
 warnings: string[];
 errors: string[];
 recommendations: string[];
}

export interface OptimizationResult {
 originalSize: number;
 optimizedSize: number;
 compressionRatio: number;
 optimizedContent: string;
}

/**
 * QR Code Validator
 */
export class QRCodeValidator {
 /**
  * Validate QR code configuration
  */
 static validateConfig(config: QRCodeConfig): ValidationResult {
  const result: ValidationResult = {
   valid: true,
   warnings: [],
   errors: [],
   recommendations: [],
  };

  // Check content
  if (!config.content || config.content.trim().length === 0) {
   result.errors.push('Content is required');
   result.valid = false;
  }

  // Check content length
  if (config.content && config.content.length > 4296) {
   result.errors.push('Content exceeds maximum length (4296 characters)');
   result.valid = false;
  }

  // Check size
  if (config.style?.size) {
   if (config.style.size < 50) {
    result.warnings.push('Size is very small, may be hard to scan');
   }
   if (config.style.size > 2000) {
    result.warnings.push('Size is very large, may cause performance issues');
   }
  }

  // Check error correction with logo
  if (config.logo && (!config.errorCorrectionLevel || config.errorCorrectionLevel === 'L')) {
   result.warnings.push('Low error correction with logo may cause scanning issues');
   result.recommendations.push('Consider using error correction level H with logo');
  }

  // Check colors
  if (config.style?.fgColor && config.style?.bgColor) {
   const contrast = this.calculateContrast(config.style.fgColor, config.style.bgColor);
   if (contrast < 3) {
    result.warnings.push('Low contrast between foreground and background');
    result.recommendations.push('Increase color contrast for better scannability');
   }
  }

  // Check gradient with logo
  if (config.style?.gradient && config.logo) {
   result.recommendations.push('Gradients with logos may affect scannability');
  }

  return result;
 }

 /**
  * Calculate color contrast ratio
  */
 private static calculateContrast(color1: string, color2: string): number {
  const rgb1 = this.hexToRgb(color1);
  const rgb2 = this.hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = this.relativeLuminance(rgb1);
  const l2 = this.relativeLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
 }

 /**
  * Convert hex color to RGB
  */
 private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
   r: parseInt(result[1], 16),
   g: parseInt(result[2], 16),
   b: parseInt(result[3], 16),
  } : null;
 }

 /**
  * Calculate relative luminance
  */
 private static relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
 }

 /**
  * Suggest optimal error correction level
  */
 static suggestErrorCorrectionLevel(
  contentLength: number,
  hasLogo: boolean
 ): ErrorCorrectionLevel {
  if (hasLogo) {
   return 'H'; // 30% recovery
  }

  if (contentLength < 50) {
   return 'Q'; // 25% recovery
  }

  if (contentLength < 200) {
   return 'M'; // 15% recovery
  }

  return 'L'; // 7% recovery
 }
}

/**
 * QR Code Optimizer
 */
export class QRCodeOptimizer {
 /**
  * Optimize content length
  */
 static compressContent(content: string): OptimizationResult {
  const originalSize = content.length;
  let optimized = content;

  // URL shortening suggestions
  if (this.isURL(content)) {
   // Remove unnecessary protocols
   optimized = optimized.replace(/^https?:\/\/(www\.)?/i, '');

   // Remove tracking parameters
   const url = new URL('http://' + optimized);
   const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid'];
   trackingParams.forEach(param => url.searchParams.delete(param));
   optimized = url.toString().replace(/^https?:\/\//, '');
  }

  // Remove extra whitespace
  optimized = optimized.trim().replace(/\s+/g, ' ');

  const optimizedSize = optimized.length;
  const compressionRatio = originalSize > 0 ? (originalSize - optimizedSize) / originalSize : 0;

  return {
   originalSize,
   optimizedSize,
   compressionRatio,
   optimizedContent: optimized,
  };
 }

 /**
  * Check if string is a URL
  */
 private static isURL(str: string): boolean {
  try {
   new URL(str);
   return true;
  } catch {
   return /^https?:\/\//i.test(str);
  }
 }

 /**
  * Calculate optimal QR code size based on content
  */
 static calculateOptimalSize(contentLength: number): number {
  if (contentLength < 50) return 200;
  if (contentLength < 100) return 250;
  if (contentLength < 200) return 300;
  if (contentLength < 400) return 400;
  return 500;
 }
}

export default { QRCodeValidator, QRCodeOptimizer };
