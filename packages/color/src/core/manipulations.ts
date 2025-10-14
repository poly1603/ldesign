/**
 * @ldesign/color - Color Manipulations
 * 
 * Functions for manipulating colors including mixing and blending
 */

import type { RGB, BlendMode } from '../types';
import { clamp } from '../utils/math';

/**
 * Mix two colors by a given amount
 */
export function mix(rgb1: RGB, rgb2: RGB, amount: number): RGB {
  amount = clamp(amount, 0, 1);
  return {
    r: Math.round(rgb1.r + (rgb2.r - rgb1.r) * amount),
    g: Math.round(rgb1.g + (rgb2.g - rgb1.g) * amount),
    b: Math.round(rgb1.b + (rgb2.b - rgb1.b) * amount)
  };
}

/**
 * Blend two colors using various blend modes
 */
export function blend(base: RGB, overlay: RGB, mode: BlendMode): RGB {
  const r1 = base.r / 255;
  const g1 = base.g / 255;
  const b1 = base.b / 255;
  
  const r2 = overlay.r / 255;
  const g2 = overlay.g / 255;
  const b2 = overlay.b / 255;
  
  let r: number, g: number, b: number;
  
  switch (mode) {
    case 'normal':
      r = r2;
      g = g2;
      b = b2;
      break;
      
    case 'multiply':
      r = r1 * r2;
      g = g1 * g2;
      b = b1 * b2;
      break;
      
    case 'screen':
      r = 1 - (1 - r1) * (1 - r2);
      g = 1 - (1 - g1) * (1 - g2);
      b = 1 - (1 - b1) * (1 - b2);
      break;
      
    case 'overlay':
      r = r1 < 0.5 ? 2 * r1 * r2 : 1 - 2 * (1 - r1) * (1 - r2);
      g = g1 < 0.5 ? 2 * g1 * g2 : 1 - 2 * (1 - g1) * (1 - g2);
      b = b1 < 0.5 ? 2 * b1 * b2 : 1 - 2 * (1 - b1) * (1 - b2);
      break;
      
    case 'darken':
      r = Math.min(r1, r2);
      g = Math.min(g1, g2);
      b = Math.min(b1, b2);
      break;
      
    case 'lighten':
      r = Math.max(r1, r2);
      g = Math.max(g1, g2);
      b = Math.max(b1, b2);
      break;
      
    case 'color-dodge':
      r = r2 >= 1 ? 1 : r1 / (1 - r2);
      g = g2 >= 1 ? 1 : g1 / (1 - g2);
      b = b2 >= 1 ? 1 : b1 / (1 - b2);
      r = Math.min(1, r);
      g = Math.min(1, g);
      b = Math.min(1, b);
      break;
      
    case 'color-burn':
      r = r2 <= 0 ? 0 : 1 - (1 - r1) / r2;
      g = g2 <= 0 ? 0 : 1 - (1 - g1) / g2;
      b = b2 <= 0 ? 0 : 1 - (1 - b1) / b2;
      r = Math.max(0, r);
      g = Math.max(0, g);
      b = Math.max(0, b);
      break;
      
    case 'hard-light':
      r = r2 < 0.5 ? 2 * r1 * r2 : 1 - 2 * (1 - r1) * (1 - r2);
      g = g2 < 0.5 ? 2 * g1 * g2 : 1 - 2 * (1 - g1) * (1 - g2);
      b = b2 < 0.5 ? 2 * b1 * b2 : 1 - 2 * (1 - b1) * (1 - b2);
      break;
      
    case 'soft-light':
      r = r2 < 0.5 
        ? r1 * (1 + r2) 
        : r1 + r2 - r1 * r2;
      g = g2 < 0.5 
        ? g1 * (1 + g2) 
        : g1 + g2 - g1 * g2;
      b = b2 < 0.5 
        ? b1 * (1 + b2) 
        : b1 + b2 - b1 * b2;
      break;
      
    case 'difference':
      r = Math.abs(r1 - r2);
      g = Math.abs(g1 - g2);
      b = Math.abs(b1 - b2);
      break;
      
    case 'exclusion':
      r = r1 + r2 - 2 * r1 * r2;
      g = g1 + g2 - 2 * g1 * g2;
      b = b1 + b2 - 2 * b1 * b2;
      break;
      
    default:
      r = r2;
      g = g2;
      b = b2;
  }
  
  return {
    r: Math.round(clamp(r * 255, 0, 255)),
    g: Math.round(clamp(g * 255, 0, 255)),
    b: Math.round(clamp(b * 255, 0, 255))
  };
}

/**
 * Apply tint to a color (mix with white)
 */
export function tint(rgb: RGB, amount: number): RGB {
  return mix(rgb, { r: 255, g: 255, b: 255 }, amount);
}

/**
 * Apply shade to a color (mix with black)
 */
export function shade(rgb: RGB, amount: number): RGB {
  return mix(rgb, { r: 0, g: 0, b: 0 }, amount);
}

/**
 * Apply tone to a color (mix with gray)
 */
export function tone(rgb: RGB, amount: number): RGB {
  return mix(rgb, { r: 128, g: 128, b: 128 }, amount);
}

/**
 * Adjust brightness of a color
 */
export function adjustBrightness(rgb: RGB, amount: number): RGB {
  amount = clamp(amount, -100, 100);
  const factor = 1 + (amount / 100);
  
  return {
    r: Math.round(clamp(rgb.r * factor, 0, 255)),
    g: Math.round(clamp(rgb.g * factor, 0, 255)),
    b: Math.round(clamp(rgb.b * factor, 0, 255))
  };
}

/**
 * Adjust contrast of a color
 */
export function adjustContrast(rgb: RGB, amount: number): RGB {
  amount = clamp(amount, -100, 100);
  const factor = (100 + amount) / 100;
  
  return {
    r: Math.round(clamp(((rgb.r - 128) * factor) + 128, 0, 255)),
    g: Math.round(clamp(((rgb.g - 128) * factor) + 128, 0, 255)),
    b: Math.round(clamp(((rgb.b - 128) * factor) + 128, 0, 255))
  };
}

/**
 * Apply gamma correction to a color
 */
export function gammaCorrection(rgb: RGB, gamma: number): RGB {
  const invGamma = 1 / gamma;
  
  return {
    r: Math.round(255 * Math.pow(rgb.r / 255, invGamma)),
    g: Math.round(255 * Math.pow(rgb.g / 255, invGamma)),
    b: Math.round(255 * Math.pow(rgb.b / 255, invGamma))
  };
}

/**
 * Apply sepia tone to a color
 */
export function sepia(rgb: RGB, amount = 1): RGB {
  amount = clamp(amount, 0, 1);
  
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const sr = (0.393 * r + 0.769 * g + 0.189 * b);
  const sg = (0.349 * r + 0.686 * g + 0.168 * b);
  const sb = (0.272 * r + 0.534 * g + 0.131 * b);
  
  return {
    r: Math.round(clamp((r + (sr - r) * amount) * 255, 0, 255)),
    g: Math.round(clamp((g + (sg - g) * amount) * 255, 0, 255)),
    b: Math.round(clamp((b + (sb - b) * amount) * 255, 0, 255))
  };
}

/**
 * Apply grayscale to a color
 */
export function grayscale(rgb: RGB): RGB {
  const gray = Math.round(0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  return { r: gray, g: gray, b: gray };
}

/**
 * Apply negative/invert to a color
 */
export function negative(rgb: RGB): RGB {
  return {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b
  };
}

/**
 * Apply posterize effect to a color
 */
export function posterize(rgb: RGB, levels: number): RGB {
  levels = Math.max(2, levels);
  const step = 255 / (levels - 1);
  
  return {
    r: Math.round(Math.round(rgb.r / step) * step),
    g: Math.round(Math.round(rgb.g / step) * step),
    b: Math.round(Math.round(rgb.b / step) * step)
  };
}