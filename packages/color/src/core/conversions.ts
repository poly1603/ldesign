/**
 * @ldesign/color - Color Conversions
 * 
 * Functions for converting between different color formats
 */

import type { RGB, HSL, HSV, HWB } from '../types';
import { clamp, round } from '../utils/math';

/**
 * Convert RGB to Hex string
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(clamp(n, 0, 255)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Convert Hex string to RGB
 */
export function hexToRgb(hex: string): RGB {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Handle 3-char hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  // Handle 4-char hex (with alpha)
  if (hex.length === 4) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const a = hex.length === 8 ? parseInt(hex.substr(6, 2), 16) / 255 : undefined;
  
  return { r, g, b, ...(a !== undefined && { a }) };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    
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
    l: round(l * 100),
    ...(rgb.a !== undefined && { a: rgb.a })
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  
  let r: number, g: number, b: number;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
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
  
  return {
    r: round(r * 255),
    g: round(g * 255),
    b: round(b * 255),
    ...(hsl.a !== undefined && { a: hsl.a })
  };
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
    const values = rgbMatch[1].split(/,\s*/).map(v => parseFloat(v));
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
    const values = hslMatch[1].split(/,\s*/).map(v => parseFloat(v));
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