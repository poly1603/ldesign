/**
 * @ldesign/color - Color Analysis
 * 
 * Functions for analyzing color properties like luminance and contrast
 */

import type { RGB, WCAGLevel, TextSize } from '../types';

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
export function getLuminance(rgb: RGB): number {
  const sRGB = [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  
  const linearRGB = sRGB.map(channel => {
    if (channel <= 0.03928) {
      return channel / 12.92;
    }
    return Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  
  // Relative luminance formula
  return 0.2126 * linearRGB[0] + 0.7152 * linearRGB[1] + 0.0722 * linearRGB[2];
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 formula
 */
export function getContrast(rgb1: RGB, rgb2: RGB): number {
  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG requirements
 */
export function isWCAGCompliant(
  foreground: RGB,
  background: RGB,
  level: WCAGLevel = 'AA',
  size: TextSize = 'normal'
): boolean {
  const contrast = getContrast(foreground, background);
  
  if (level === 'AA') {
    return size === 'large' ? contrast >= 3 : contrast >= 4.5;
  } else if (level === 'AAA') {
    return size === 'large' ? contrast >= 4.5 : contrast >= 7;
  }
  
  return false;
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
 * Calculate perceived brightness (0-255)
 */
export function getPerceivedBrightness(rgb: RGB): number {
  // Using the formula from http://alienryderflex.com/hsp.html
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