/**
 * @ldesign/color - Color Conversions
 * 
 * Functions for converting between different color formats
 */

import type { HSL, HSV, HWB, RGB } from '../types';
import { clamp, round } from '../utils/math';

/**
 * Convert RGB to Hex string - Optimized with lookup table
 */
const HEX_CHARS = '0123456789ABCDEF';
const HEX_LOOKUP = Array.from({length: 256});
// Pre-compute hex values
for (let i = 0; i < 256; i++) {
  HEX_LOOKUP[i] = HEX_CHARS[i >> 4] + HEX_CHARS[i & 0x0F];
}

export function rgbToHex(rgb: RGB): string {
  const r = clamp(rgb.r | 0, 0, 255);
  const g = clamp(rgb.g | 0, 0, 255);
  const b = clamp(rgb.b | 0, 0, 255);
  return `#${  HEX_LOOKUP[r]  }${HEX_LOOKUP[g]  }${HEX_LOOKUP[b]}`;
}

/**
 * Convert Hex string to RGB - Optimized
 */
export function hexToRgb(hex: string): RGB {
  // Fast path for common formats
  if (hex[0] === '#') hex = hex.slice(1);
  
  let r: number, g: number, b: number, a: number | undefined;
  
  if (hex.length === 3) {
    // 3-char hex
    r = Number.parseInt(hex[0] + hex[0], 16);
    g = Number.parseInt(hex[1] + hex[1], 16);
    b = Number.parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 4) {
    // 4-char hex with alpha
    r = Number.parseInt(hex[0] + hex[0], 16);
    g = Number.parseInt(hex[1] + hex[1], 16);
    b = Number.parseInt(hex[2] + hex[2], 16);
    a = Number.parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 6) {
    // 6-char hex - most common
    const value = Number.parseInt(hex, 16);
    r = (value >> 16) & 0xFF;
    g = (value >> 8) & 0xFF;
    b = value & 0xFF;
  } else if (hex.length === 8) {
    // 8-char hex with alpha
    const value = Number.parseInt(hex.slice(0, 6), 16);
    r = (value >> 16) & 0xFF;
    g = (value >> 8) & 0xFF;
    b = value & 0xFF;
    a = Number.parseInt(hex.slice(6), 16) / 255;
  } else {
    return { r: 0, g: 0, b: 0 };
  }
  
  const rgb: RGB = { r, g, b };
  if (a !== undefined) rgb.a = a;
  return rgb;
}

// Reusable HSL object pool
const hslPool: HSL[] = [];

function getHSLFromPool(): HSL {
  return hslPool.pop() || { h: 0, s: 0, l: 0 };
}

// Function removed - not used currently
// Can be added back if needed for optimization

/**
 * Convert RGB to HSL - Optimized with object pooling
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r * 0.00392156862745098; // /255
  const g = rgb.g * 0.00392156862745098;
  const b = rgb.b * 0.00392156862745098;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) * 0.5;
  
  const hsl = getHSLFromPool();
  
  if (delta === 0) {
    hsl.h = 0;
    hsl.s = 0;
  } else {
    const s = delta / (l > 0.5 ? 2 - max - min : max + min);
    
    let h: number;
    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / delta + 2) * 60;
    } else {
      h = ((r - g) / delta + 4) * 60;
    }
    
    hsl.h = Math.round(h);
    hsl.s = Math.round(s * 100);
  }
  
  hsl.l = Math.round(l * 100);
  
  if (rgb.a !== undefined) hsl.a = rgb.a;
  return hsl;
}

// Reusable RGB object pool to reduce allocations
const rgbPool: RGB[] = [];

function getRGBFromPool(): RGB {
  return rgbPool.pop() || { r: 0, g: 0, b: 0 };
}

// Function removed - not used currently
// Can be added back if needed for optimization

/**
 * Convert HSL to RGB - Optimized inline calculations with object pooling
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h * 0.002777777777777778; // /360
  const s = hsl.s * 0.01;
  const l = hsl.l * 0.01;
  
  const rgb = getRGBFromPool();
  
  if (s === 0) {
    rgb.r = rgb.g = rgb.b = Math.round(l * 255);
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hk = h;
    
    // Inline hue2rgb calculations for performance
    let t = hk + 0.3333333333333333;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    rgb.r = Math.round((t < 0.16666666666666666 ? p + (q - p) * 6 * t :
         t < 0.5 ? q :
         t < 0.6666666666666666 ? p + (q - p) * (0.6666666666666666 - t) * 6 : p) * 255);
    
    t = hk;
    rgb.g = Math.round((t < 0.16666666666666666 ? p + (q - p) * 6 * t :
         t < 0.5 ? q :
         t < 0.6666666666666666 ? p + (q - p) * (0.6666666666666666 - t) * 6 : p) * 255);
    
    t = hk - 0.3333333333333333;
    if (t < 0) t += 1;
    rgb.b = Math.round((t < 0.16666666666666666 ? p + (q - p) * 6 * t :
         t < 0.5 ? q :
         t < 0.6666666666666666 ? p + (q - p) * (0.6666666666666666 - t) * 6 : p) * 255);
  }
  
  if (hsl.a !== undefined) rgb.a = hsl.a;
  return rgb;
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  const s = max === 0 ? 0 : delta / max;
  const v = max;
  
  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }
  
  return {
    h: round(h * 360),
    s: round(s * 100),
    v: round(v * 100),
    ...(rgb.a !== undefined && { a: rgb.a })
  };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;
  
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  let r: number, g: number, b: number;
  
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
    default: r = 0; g = 0; b = 0;
  }
  
  return {
    r: round(r * 255),
    g: round(g * 255),
    b: round(b * 255),
    ...(hsv.a !== undefined && { a: hsv.a })
  };
}

/**
 * Convert RGB to HWB
 */
export function rgbToHwb(rgb: RGB): HWB {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  
  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }
  
  return {
    h: round(h * 360),
    w: round(min * 100),
    b: round((1 - max) * 100),
    ...(rgb.a !== undefined && { a: rgb.a })
  };
}

/**
 * Convert HWB to RGB
 */
export function hwbToRgb(hwb: HWB): RGB {
  const h = hwb.h / 360;
  const w = hwb.w / 100;
  const b = hwb.b / 100;
  
  const ratio = w + b;
  let f: number;
  
  // If w + b >= 1, it's a shade of gray
  if (ratio >= 1) {
    f = w / ratio;
    return {
      r: round(f * 255),
      g: round(f * 255),
      b: round(f * 255),
      ...(hwb.a !== undefined && { a: hwb.a })
    };
  }
  
  const v = 1 - b;
  const s = 1 - w / v;
  
  // Convert to HSV and then to RGB
  const hsv: HSV = { h: h * 360, s: s * 100, v: v * 100 };
  return hsvToRgb(hsv);
}

/**
 * Convert HSL to HSV
 */
export function hslToHsv(hsl: HSL): HSV {
  const h = hsl.h;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  
  const v = l + s * Math.min(l, 1 - l);
  const sNew = v === 0 ? 0 : 2 * (1 - l / v);
  
  return {
    h,
    s: round(sNew * 100),
    v: round(v * 100),
    ...(hsl.a !== undefined && { a: hsl.a })
  };
}

/**
 * Convert HSV to HSL
 */
export function hsvToHsl(hsv: HSV): HSL {
  const h = hsv.h;
  const s = hsv.s / 100;
  const v = hsv.v / 100;
  
  const l = v * (1 - s / 2);
  const sNew = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);
  
  return {
    h,
    s: round(sNew * 100),
    l: round(l * 100),
    ...(hsv.a !== undefined && { a: hsv.a })
  };
}

/**
 * Parse CSS color string
 */
export function parseColorString(input: string): RGB | null {
  // Remove spaces
  input = input.trim().toLowerCase();
  
  // Hex color
  if (input.startsWith('#')) {
    return hexToRgb(input);
  }
  
  // RGB/RGBA
  const rgbMatch = input.match(/^rgba?\(([^)]+)\)/);
  if (rgbMatch) {
    const values = rgbMatch[1].split(/,\s*/).map(v => Number.parseFloat(v));
    if (values.length >= 3) {
      return {
        r: clamp(values[0], 0, 255),
        g: clamp(values[1], 0, 255),
        b: clamp(values[2], 0, 255),
        ...(values[3] !== undefined && { a: clamp(values[3], 0, 1) })
      };
    }
  }
  
  // HSL/HSLA
  const hslMatch = input.match(/^hsla?\(([^)]+)\)/);
  if (hslMatch) {
    const values = hslMatch[1].split(/,\s*/).map(v => Number.parseFloat(v));
    if (values.length >= 3) {
      return hslToRgb({
        h: values[0],
        s: values[1],
        l: values[2],
        ...(values[3] !== undefined && { a: clamp(values[3], 0, 1) })
      });
    }
  }
  
  return null;
}