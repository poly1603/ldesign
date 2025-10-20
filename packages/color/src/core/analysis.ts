/**
 * @ldesign/color - Color Analysis
 * 
 * Functions for analyzing color properties like luminance and contrast
 * 
 * @module core/analysis
 * @see https://www.w3.org/TR/WCAG21/
 */

import type { RGB, TextSize, WCAGLevel } from '../types';

/**
 * Calculate relative luminance of a color using WCAG 2.1 formula
 * 
 * Luminance measures brightness on a scale of 0 (black) to 1 (white).
 * 
 * @param rgb - RGB color object with r, g, b values (0-255)
 * @returns Relative luminance value between 0 and 1
 * 
 * @example
 * ```ts
 * const luminance = getLuminance({ r: 255, g: 0, b: 0 })
 * console.log(luminance) // 0.2126
 * ```
 * 
 * @performance O(1) - Constant time with optimized calculations
 * @see https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
export function getLuminance(rgb: RGB): number {
  const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  
  const linearRGB = sRGB.map(channel => {
    if (channel <= 0.03928) {
      return channel / 12.92;
    }
    return ((channel + 0.055) / 1.055)**2.4;
  });
  
  // Relative luminance formula
  return 0.2126 * linearRGB[0] + 0.7152 * linearRGB[1] + 0.0722 * linearRGB[2];
}

/**
 * Calculate contrast ratio between two colors using WCAG 2.1 formula
 * 
 * Contrast ratio ranges from 1:1 (no contrast) to 21:1 (maximum contrast).
 * 
 * @param rgb1 - First RGB color object
 * @param rgb2 - Second RGB color object
 * @returns Contrast ratio between 1 and 21
 * 
 * @example
 * ```ts
 * const contrast = getContrast(
 *   { r: 255, g: 255, b: 255 }, // White
 *   { r: 0, g: 0, b: 0 }         // Black
 * )
 * console.log(contrast) // 21 (maximum contrast)
 * ```
 * 
 * @performance O(1) - Optimized luminance calculation
 * @see https://www.w3.org/TR/WCAG20-TECHS/G18.html
 */
export function getContrast(rgb1: RGB, rgb2: RGB): number {
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if two colors meet WCAG contrast requirements
 * 
 * WCAG Contrast Requirements:
 * - AA Normal text: 4.5:1
 * - AA Large text: 3:1
 * - AAA Normal text: 7:1
 * - AAA Large text: 4.5:1
 * 
 * @param foreground - Text color (RGB)
 * @param background - Background color (RGB)
 * @param level - WCAG level ('AA' or 'AAA'), defaults to 'AA'
 * @param size - Text size ('normal' or 'large'), defaults to 'normal'
 * @returns True if colors meet WCAG requirements
 * 
 * @example
 * ```ts
 * const isCompliant = isWCAGCompliant(
 *   { r: 0, g: 0, b: 0 },
 *   { r: 255, g: 255, b: 255 },
 *   'AA',
 *   'normal'
 * )
 * console.log(isCompliant) // true
 * ```
 * 
 * @performance O(1) - Fast contrast calculation
 * @see https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
export function isWCAGCompliant(
  foreground: RGB,
  background: RGB,
  level: WCAGLevel = 'AA',
  size: TextSize = 'normal'
): boolean {
  const contrast = getContrast(foreground, background);
  
  // Lookup table for performance
  const requirements: Record<WCAGLevel, Record<TextSize, number>> = {
    'AA': { 'normal': 4.5, 'large': 3 },
    'AAA': { 'normal': 7, 'large': 4.5 }
  };
  
  const required = requirements[level]?.[size] ?? 4.5;
  return contrast >= required;
}

/**
 * Get the required contrast ratio for WCAG compliance
 */
export function getRequiredContrast(level: WCAGLevel, size: TextSize): number {
  if (level === 'AA') {
    return size === 'large' ? 3 : 4.5;
  } else if (level === 'AAA') {
    return size === 'large' ? 4.5 : 7;
  }
  return 4.5;
}

/**
 * Calculate perceived brightness using weighted formula
 * 
 * Uses perceptual brightness formula that accounts for human vision
 * sensitivity to different colors (more sensitive to green than red/blue).
 * 
 * @param rgb - RGB color object
 * @returns Perceived brightness value between 0 and 255
 * 
 * @example
 * ```ts
 * const brightness = getPerceivedBrightness({ r: 255, g: 0, b: 0 })
 * console.log(brightness) // ~76 (red appears darker than its RGB value suggests)
 * ```
 * 
 * @performance O(1) - Optimized with pre-computed coefficients
 * @see http://alienryderflex.com/hsp.html
 */
export function getPerceivedBrightness(rgb: RGB): number {
  // Pre-squared coefficients for performance
  // 0.299² = 0.089401, 0.587² = 0.344569, 0.114² = 0.012996
  return Math.sqrt(
    0.299 * rgb.r * rgb.r +
    0.587 * rgb.g * rgb.g +
    0.114 * rgb.b * rgb.b
  );
}

/**
 * Check if a color is perceived as light
 */
export function isLight(rgb: RGB): boolean {
  return getPerceivedBrightness(rgb) > 127.5;
}

/**
 * Check if a color is perceived as dark
 */
export function isDark(rgb: RGB): boolean {
  return !isLight(rgb);
}

/**
 * Get the best text color (black or white) for a background
 */
export function getBestTextColor(background: RGB): RGB {
  return isLight(background) 
    ? { r: 0, g: 0, b: 0 } // Black text on light background
    : { r: 255, g: 255, b: 255 }; // White text on dark background
}

/**
 * Calculate color difference using Euclidean distance
 */
export function getColorDifference(rgb1: RGB, rgb2: RGB): number {
  const dr = rgb1.r - rgb2.r;
  const dg = rgb1.g - rgb2.g;
  const db = rgb1.b - rgb2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Check if two colors are visually similar
 */
export function areColorsSimilar(rgb1: RGB, rgb2: RGB, threshold = 30): boolean {
  return getColorDifference(rgb1, rgb2) < threshold;
}

/**
 * Get dominant color channel
 */
export function getDominantChannel(rgb: RGB): 'red' | 'green' | 'blue' | 'neutral' {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  
  // If all channels are close, it's neutral (gray)
  if (max - min < 30) {
    return 'neutral';
  }
  
  if (rgb.r === max) return 'red';
  if (rgb.g === max) return 'green';
  return 'blue';
}

/**
 * Calculate color intensity (0-1)
 */
export function getColorIntensity(rgb: RGB): number {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  return (max - min) / 255;
}

/**
 * Get color temperature classification
 */
export function getColorTemperature(rgb: RGB): 'cool' | 'warm' | 'neutral' {
  // Simple temperature classification based on red/blue balance
  const redBlueRatio = (rgb.r - rgb.b) / 255;
  
  if (redBlueRatio > 0.2) return 'warm';
  if (redBlueRatio < -0.2) return 'cool';
  return 'neutral';
}

/**
 * Calculate the purity/saturation of a color (0-1)
 */
export function getColorPurity(rgb: RGB): number {
  const max = Math.max(rgb.r, rgb.g, rgb.b) / 255;
  const min = Math.min(rgb.r, rgb.g, rgb.b) / 255;
  
  if (max === 0) return 0;
  return (max - min) / max;
}