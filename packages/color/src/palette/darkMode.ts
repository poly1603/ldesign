/**
 * @ldesign/color - Dark Mode Palette Generation
 * 
 * Functions for generating dark mode color palettes with proper contrast
 */

import { Color } from '../core/Color';
import { HSL } from '../types';
import { clamp } from '../utils/math';
import { generateTailwindScale, generateTailwindGrayScale } from '../core/tailwindPalette';

/**
 * Generate a dark mode version of a color scale
 * Dark mode inverts the lightness progression while maintaining hue and adjusting saturation
 */
export function generateDarkModeScale(lightScale: Record<string, string>): Record<string, string> {
  const darkScale: Record<string, string> = {};
  const shades = Object.keys(lightScale).sort((a, b) => parseInt(a) - parseInt(b));
  
  shades.forEach((shade, index) => {
    const lightColor = new Color(lightScale[shade]);
    const hsl = lightColor.toHSL();
    
    // Invert the shade mapping: light shades become dark and vice versa
    // const invertedIndex = shades.length - 1 - index; // Not used in current implementation
    
    // Adjust lightness for dark mode
    // We want to maintain readability while inverting the scale
    let darkLightness: number;
    
    if (parseInt(shade) <= 100) {
      // Very light shades become very dark
      darkLightness = clamp(5 + (index * 2), 2, 15);
    } else if (parseInt(shade) <= 300) {
      // Light shades become dark
      darkLightness = clamp(15 + (index * 3), 15, 30);
    } else if (parseInt(shade) <= 500) {
      // Mid shades stay relatively centered but darker
      darkLightness = clamp(35 + (index * 2), 30, 50);
    } else if (parseInt(shade) <= 700) {
      // Dark shades become light
      darkLightness = clamp(55 + (index * 3), 50, 75);
    } else {
      // Very dark shades become light
      darkLightness = clamp(75 + (index * 2.5), 70, 95);
    }
    
    // Adjust saturation for better appearance in dark mode
    // Slightly increase saturation for lighter colors in dark mode
    let darkSaturation = hsl.s;
    if (darkLightness > 50) {
      darkSaturation = Math.min(100, hsl.s * 1.1);
    } else if (darkLightness < 20) {
      darkSaturation = Math.max(0, hsl.s * 0.9);
    }
    
    const darkHsl: HSL = {
      h: hsl.h,
      s: darkSaturation,
      l: darkLightness
    };
    
    darkScale[shade] = new Color(darkHsl).toHex();
  });
  
  return darkScale;
}

/**
 * Generate a Tailwind-style dark mode palette
 * Uses specific mappings optimized for dark backgrounds
 */
export function generateTailwindDarkScale(baseColor: string): Record<string, string> {
  const color = new Color(baseColor);
  const hsl = color.toHSL();
  
  // Dark mode lightness values (inverted and adjusted from light mode)
  const darkLightness: Record<string, number> = {
    '50': 8,    // Very dark (was very light in light mode)
    '100': 12,
    '200': 18,
    '300': 25,
    '400': 35,
    '500': 45,  // Mid-tone, slightly darker than light mode's 50%
    '600': 55,
    '700': 65,
    '800': 75,
    '900': 85,
    '950': 90,
    '1000': 94  // Very light (was very dark in light mode)
  };
  
  const palette: Record<string, string> = {};
  
  Object.entries(darkLightness).forEach(([shade, lightness]) => {
    // Calculate saturation adjustment based on lightness
    let saturation = hsl.s;
    
    if (lightness < 20) {
      // Very dark colors: reduce saturation to avoid muddiness
      saturation = Math.max(20, hsl.s * 0.7);
    } else if (lightness > 70) {
      // Light colors in dark mode: slightly boost saturation for vibrancy
      saturation = Math.min(100, hsl.s * 1.15);
    } else if (lightness >= 40 && lightness <= 60) {
      // Mid-tones: maintain original saturation
      saturation = hsl.s;
    } else {
      // Slight adjustment for other ranges
      saturation = hsl.s * 0.95;
    }
    
    const shadeHsl: HSL = {
      h: hsl.h,
      s: saturation,
      l: lightness
    };
    
    palette[shade] = new Color(shadeHsl).toHex();
  });
  
  return palette;
}

/**
 * Generate dark mode gray scale
 * Pure grayscale optimized for dark backgrounds
 */
export function generateTailwindDarkGrayScale(): Record<string, string> {
  const darkGrays: Record<string, number> = {
    '50': 7,     // Near black
    '100': 10,
    '150': 12,
    '200': 16,
    '300': 22,
    '400': 32,
    '500': 45,
    '600': 58,
    '700': 70,
    '800': 80,
    '850': 85,
    '900': 90,
    '950': 94,
    '1000': 97   // Near white
  };
  
  const palette: Record<string, string> = {};
  
  Object.entries(darkGrays).forEach(([shade, lightness]) => {
    const hsl: HSL = { h: 0, s: 0, l: lightness };
    palette[shade] = new Color(hsl).toHex();
  });
  
  return palette;
}

/**
 * Generate semantic colors for dark mode
 */
export function generateDarkSemanticColors(primaryHex: string) {
  const primary = new Color(primaryHex);
  const primaryHsl = primary.toHSL();
  
  return {
    primary: generateTailwindDarkScale(primaryHex),
    secondary: generateTailwindDarkScale(
      new Color({ h: (primaryHsl.h + 180) % 360, s: primaryHsl.s * 0.7, l: 50 }).toHex()
    ),
    success: generateTailwindDarkScale('#10b981'),
    warning: generateTailwindDarkScale('#f59e0b'),
    danger: generateTailwindDarkScale('#ef4444'),
    info: generateTailwindDarkScale('#3b82f6'),
    gray: generateTailwindDarkGrayScale()
  };
}

/**
 * Generate a complete theme with both light and dark mode palettes
 */
export interface ThemePalettes {
  light: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    success: Record<string, string>;
    warning: Record<string, string>;
    danger: Record<string, string>;
    info: Record<string, string>;
    gray: Record<string, string>;
  };
  dark: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    success: Record<string, string>;
    warning: Record<string, string>;
    danger: Record<string, string>;
    info: Record<string, string>;
    gray: Record<string, string>;
  };
}

export function generateThemePalettes(primaryHex: string): ThemePalettes {
  const primary = new Color(primaryHex);
  const primaryHsl = primary.toHSL();
  
  // Generate light mode palettes
  const light = {
    primary: generateTailwindScale(primaryHex),
    secondary: generateTailwindScale(
      new Color({ h: (primaryHsl.h + 180) % 360, s: primaryHsl.s * 0.7, l: 50 }).toHex()
    ),
    success: generateTailwindScale('#10b981'),
    warning: generateTailwindScale('#f59e0b'),
    danger: generateTailwindScale('#ef4444'),
    info: generateTailwindScale('#3b82f6'),
    gray: generateTailwindGrayScale()
  };
  
  // Generate dark mode palettes
  const dark = generateDarkSemanticColors(primaryHex);
  
  return { light, dark };
}