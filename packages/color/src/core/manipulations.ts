/**
 * @ldesign/color - Color Manipulations
 * 
 * Functions for manipulating colors including mixing and blending
 */

import type { BlendMode, RGB } from '../types';
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
      
    case 'linear-burn':
      r = Math.max(0, r1 + r2 - 1);
      g = Math.max(0, g1 + g2 - 1);
      b = Math.max(0, b1 + b2 - 1);
      break;
      
    case 'linear-dodge':
      r = Math.min(1, r1 + r2);
      g = Math.min(1, g1 + g2);
      b = Math.min(1, b1 + b2);
      break;
      
    case 'vivid-light':
      r = r2 < 0.5 ? (r2 === 0 ? 0 : Math.max(0, 1 - (1 - r1) / (2 * r2))) : (r2 === 1 ? 1 : Math.min(1, r1 / (2 * (1 - r2))));
      g = g2 < 0.5 ? (g2 === 0 ? 0 : Math.max(0, 1 - (1 - g1) / (2 * g2))) : (g2 === 1 ? 1 : Math.min(1, g1 / (2 * (1 - g2))));
      b = b2 < 0.5 ? (b2 === 0 ? 0 : Math.max(0, 1 - (1 - b1) / (2 * b2))) : (b2 === 1 ? 1 : Math.min(1, b1 / (2 * (1 - b2))));
      break;
      
    case 'pin-light':
      r = r2 < 0.5 ? Math.min(r1, 2 * r2) : Math.max(r1, 2 * (r2 - 0.5));
      g = g2 < 0.5 ? Math.min(g1, 2 * g2) : Math.max(g1, 2 * (g2 - 0.5));
      b = b2 < 0.5 ? Math.min(b1, 2 * b2) : Math.max(b1, 2 * (b2 - 0.5));
      break;
      
    case 'hard-mix':
      r = r1 + r2 < 1 ? 0 : 1;
      g = g1 + g2 < 1 ? 0 : 1;
      b = b1 + b2 < 1 ? 0 : 1;
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

// 预定义常量颜色，避免每次调用创建新对象
const WHITE_RGB: RGB = Object.freeze({ r: 255, g: 255, b: 255 });
const BLACK_RGB: RGB = Object.freeze({ r: 0, g: 0, b: 0 });
const GRAY_RGB: RGB = Object.freeze({ r: 128, g: 128, b: 128 });

/**
 * Apply tint to a color (mix with white)
 */
export function tint(rgb: RGB, amount: number): RGB {
  return mix(rgb, WHITE_RGB, amount);
}

/**
 * Apply shade to a color (mix with black)
 */
export function shade(rgb: RGB, amount: number): RGB {
  return mix(rgb, BLACK_RGB, amount);
}

/**
 * Apply tone to a color (mix with gray)
 */
export function tone(rgb: RGB, amount: number): RGB {
  return mix(rgb, GRAY_RGB, amount);
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
    r: Math.round(255 * (rgb.r / 255)**invGamma),
    g: Math.round(255 * (rgb.g / 255)**invGamma),
    b: Math.round(255 * (rgb.b / 255)**invGamma)
  };
}

/**
 * Apply sepia tone to a color - Optimized with precomputed constants
 */
const SEPIA_R = [0.393, 0.769, 0.189];
const SEPIA_G = [0.349, 0.686, 0.168];
const SEPIA_B = [0.272, 0.534, 0.131];
const INV_255 = 1 / 255;

export function sepia(rgb: RGB, amount = 1): RGB {
  amount = clamp(amount, 0, 1);
  
  const r = rgb.r * INV_255;
  const g = rgb.g * INV_255;
  const b = rgb.b * INV_255;
  
  const sr = SEPIA_R[0] * r + SEPIA_R[1] * g + SEPIA_R[2] * b;
  const sg = SEPIA_G[0] * r + SEPIA_G[1] * g + SEPIA_G[2] * b;
  const sb = SEPIA_B[0] * r + SEPIA_B[1] * g + SEPIA_B[2] * b;
  
  const inv_amount = 1 - amount;
  
  return {
    r: Math.round(clamp((r * inv_amount + sr * amount) * 255, 0, 255)),
    g: Math.round(clamp((g * inv_amount + sg * amount) * 255, 0, 255)),
    b: Math.round(clamp((b * inv_amount + sb * amount) * 255, 0, 255))
  };
}

/**
 * Apply grayscale to a color - Optimized with constants
 */
const GRAY_R = 0.299;
const GRAY_G = 0.587;
const GRAY_B = 0.114;

export function grayscale(rgb: RGB): RGB {
  const gray = Math.round(GRAY_R * rgb.r + GRAY_G * rgb.g + GRAY_B * rgb.b);
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