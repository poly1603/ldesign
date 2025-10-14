/**
 * @ldesign/color - Validators
 * 
 * Validation and parsing functions for color inputs
 */

import type { RGB, HSL, HSV, HWB, ColorInput } from '../types';
import { parseColorString, hexToRgb, hslToRgb, hsvToRgb, hwbToRgb } from '../core/conversions';
import { namedColors } from '../constants/namedColors';
import { clamp } from './math';

/**
 * Validate RGB color values
 */
export function validateRGB(rgb: RGB): boolean {
  return (
    typeof rgb.r === 'number' &&
    typeof rgb.g === 'number' &&
    typeof rgb.b === 'number' &&
    rgb.r >= 0 && rgb.r <= 255 &&
    rgb.g >= 0 && rgb.g <= 255 &&
    rgb.b >= 0 && rgb.b <= 255 &&
    (rgb.a === undefined || (typeof rgb.a === 'number' && rgb.a >= 0 && rgb.a <= 1))
  );
}

/**
 * Validate HSL color values
 */
export function validateHSL(hsl: HSL): boolean {
  return (
    typeof hsl.h === 'number' &&
    typeof hsl.s === 'number' &&
    typeof hsl.l === 'number' &&
    hsl.h >= 0 && hsl.h <= 360 &&
    hsl.s >= 0 && hsl.s <= 100 &&
    hsl.l >= 0 && hsl.l <= 100 &&
    (hsl.a === undefined || (typeof hsl.a === 'number' && hsl.a >= 0 && hsl.a <= 1))
  );
}

/**
 * Validate HSV color values
 */
export function validateHSV(hsv: HSV): boolean {
  return (
    typeof hsv.h === 'number' &&
    typeof hsv.s === 'number' &&
    typeof hsv.v === 'number' &&
    hsv.h >= 0 && hsv.h <= 360 &&
    hsv.s >= 0 && hsv.s <= 100 &&
    hsv.v >= 0 && hsv.v <= 100 &&
    (hsv.a === undefined || (typeof hsv.a === 'number' && hsv.a >= 0 && hsv.a <= 1))
  );
}

/**
 * Validate HWB color values
 */
export function validateHWB(hwb: HWB): boolean {
  return (
    typeof hwb.h === 'number' &&
    typeof hwb.w === 'number' &&
    typeof hwb.b === 'number' &&
    hwb.h >= 0 && hwb.h <= 360 &&
    hwb.w >= 0 && hwb.w <= 100 &&
    hwb.b >= 0 && hwb.b <= 100 &&
    (hwb.a === undefined || (typeof hwb.a === 'number' && hwb.a >= 0 && hwb.a <= 1))
  );
}

/**
 * Validate hex color string
 */
export function validateHex(hex: string): boolean {
  const hexPattern = /^#?([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
  return hexPattern.test(hex);
}

/**
 * Check if a value is a valid color input
 */
export function isColorInput(value: any): value is ColorInput {
  if (typeof value === 'string') {
    return validateHex(value) || 
           value.toLowerCase() in namedColors ||
           /^(rgb|rgba|hsl|hsla|hsv|hwb)\(/.test(value);
  }
  
  if (typeof value === 'object' && value !== null) {
    if ('r' in value && 'g' in value && 'b' in value) {
      return validateRGB(value as RGB);
    }
    if ('h' in value && 's' in value && 'l' in value) {
      return validateHSL(value as HSL);
    }
    if ('h' in value && 's' in value && 'v' in value) {
      return validateHSV(value as HSV);
    }
    if ('h' in value && 'w' in value && 'b' in value) {
      return validateHWB(value as HWB);
    }
  }
  
  if (Array.isArray(value) && (value.length === 3 || value.length === 4)) {
    return value.every(v => typeof v === 'number');
  }
  
  return false;
}

/**
 * Parse any color input into RGB
 */
export function parseColorInput(input: ColorInput): { rgb: RGB; alpha: number } {
  let rgb: RGB;
  let alpha = 1;
  
  if (typeof input === 'string') {
    // Handle named colors
    if (input.toLowerCase() in namedColors) {
      input = namedColors[input.toLowerCase() as keyof typeof namedColors];
    }
    
    // Handle hex colors
    if (validateHex(input)) {
      rgb = hexToRgb(input);
      if (rgb.a !== undefined) {
        alpha = rgb.a;
        delete rgb.a;
      }
    } else {
      // Try to parse as CSS color string
      const parsed = parseColorString(input);
      if (parsed) {
        rgb = parsed;
        if (rgb.a !== undefined) {
          alpha = rgb.a;
          delete rgb.a;
        }
      } else {
        throw new Error(`Invalid color string: ${input}`);
      }
    }
  } else if (Array.isArray(input)) {
    // Handle array input [r, g, b] or [r, g, b, a]
    if (input.length < 3 || input.length > 4) {
      throw new Error('Array input must have 3 or 4 elements');
    }
    rgb = {
      r: clamp(input[0], 0, 255),
      g: clamp(input[1], 0, 255),
      b: clamp(input[2], 0, 255)
    };
    if (input.length === 4) {
      alpha = clamp(input[3], 0, 1);
    }
  } else if (typeof input === 'object' && input !== null) {
    // Handle object input
    if ('r' in input && 'g' in input && 'b' in input) {
      // RGB input
      const rgbInput = input as RGB;
      rgb = {
        r: clamp(rgbInput.r, 0, 255),
        g: clamp(rgbInput.g, 0, 255),
        b: clamp(rgbInput.b, 0, 255)
      };
      if (rgbInput.a !== undefined) {
        alpha = clamp(rgbInput.a, 0, 1);
      }
    } else if ('h' in input && 's' in input && 'l' in input) {
      // HSL input
      const hslInput = input as HSL;
      rgb = hslToRgb(hslInput);
      if (hslInput.a !== undefined) {
        alpha = clamp(hslInput.a, 0, 1);
      }
    } else if ('h' in input && 's' in input && 'v' in input) {
      // HSV input
      const hsvInput = input as HSV;
      rgb = hsvToRgb(hsvInput);
      if (hsvInput.a !== undefined) {
        alpha = clamp(hsvInput.a, 0, 1);
      }
    } else if ('h' in input && 'w' in input && 'b' in input) {
      // HWB input
      const hwbInput = input as HWB;
      rgb = hwbToRgb(hwbInput);
      if (hwbInput.a !== undefined) {
        alpha = clamp(hwbInput.a, 0, 1);
      }
    } else {
      throw new Error('Invalid color object format');
    }
  } else {
    throw new Error('Invalid color input type');
  }
  
  return { rgb, alpha };
}

/**
 * Sanitize color channel value
 */
export function sanitizeChannel(value: number, max = 255): number {
  if (isNaN(value)) return 0;
  return clamp(value, 0, max);
}

/**
 * Sanitize alpha value
 */
export function sanitizeAlpha(value: number | undefined): number {
  if (value === undefined) return 1;
  if (isNaN(value)) return 1;
  return clamp(value, 0, 1);
}

/**
 * Validate color format string
 */
export function isValidColorFormat(format: string): boolean {
  const validFormats = [
    'hex', 'rgb', 'rgba', 'hsl', 'hsla', 'hsv', 'hsva',
    'hwb', 'lab', 'lch', 'xyz', 'oklab', 'oklch', 'cmyk'
  ];
  return validFormats.includes(format.toLowerCase());
}