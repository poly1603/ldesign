/**
 * @ldesign/color - Dark Mode Palette Generation
 * 
 * Functions for generating dark mode color palettes with proper contrast
 */

import type { HSL } from '../types';
import { Color } from '../core/Color';
import { generateTailwindGrayScale, generateTailwindScale } from '../core/tailwindPalette';
import { clamp } from '../utils/math';

/**
 * Generate a dark mode version of a color scale
 * Dark mode inverts the lightness progression while maintaining hue and adjusting saturation
 */
export function generateDarkModeScale(lightScale: Record<string, string>): Record<string, string> {
  const darkScale: Record<string, string> = {};
  const shades = Object.keys(lightScale).sort((a, b) => Number.parseInt(a) - Number.parseInt(b));
  
  shades.forEach((shade, index) => {
    const lightColor = new Color(lightScale[shade]);
    const hsl = lightColor.toHSL();
    
    // Invert the shade mapping: light shades become dark and vice versa
    // const invertedIndex = shades.length - 1 - index; // Not used in current implementation
    
    // Adjust lightness for dark mode
    // We want to maintain readability while inverting the scale
    let darkLightness: number;
    
    if (Number.parseInt(shade) <= 100) {
      // Very light shades become very dark
      darkLightness = clamp(5 + (index * 2), 2, 15);
    } else if (Number.parseInt(shade) <= 300) {
      // Light shades become dark
      darkLightness = clamp(15 + (index * 3), 15, 30);
    } else if (Number.parseInt(shade) <= 500) {
      // Mid shades stay relatively centered but darker
      darkLightness = clamp(35 + (index * 2), 30, 50);
    } else if (Number.parseInt(shade) <= 700) {
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
  
  // Dark mode lightness values (properly inverted from light mode)
  // In dark mode: lower shades should be darker, higher shades should be lighter
  const darkLightness: Record<string, number> = {
    '50': 90,   // Very light (was very light 98% in light mode, now used for highlights)
    '100': 85,  // Light
    '200': 75,  // 
    '300': 65,  // 
    '400': 55,  // 
    '500': 45,  // Mid-tone, suitable for primary actions
    '600': 35,  // 
    '700': 25,  // 
    '800': 18,  // 
    '900': 12,  // Dark
    '950': 8,   // Very dark
    '1000': 4   // Near black (was very dark in light mode)
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
  // In dark mode, grays should be inverted:
  // - Lower numbers (50-200) should be light for text/highlights
  // - Higher numbers (800-1000) should be dark for backgrounds
  const darkGrays: Record<string, number> = {
    '50': 97,    // Near white (for primary text)
    '100': 94,   // Very light gray
    '150': 90,   // 
    '200': 85,   // Light gray (for secondary text)
    '300': 70,   // 
    '400': 58,   // Medium gray (for tertiary text)
    '500': 45,   // Mid gray
    '600': 32,   // 
    '700': 22,   // Dark gray (for borders)
    '800': 16,   // Very dark gray (for elevated surfaces)
    '850': 12,   // 
    '900': 10,   // Near black (for containers)
    '950': 7,    // 
    '1000': 4    // Pure black (for page background)
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
  
  // Generate semantic colors based on primary color for consistency
  const semanticColors = {
    // Secondary: complementary color
    secondary: new Color({ 
      h: (primaryHsl.h + 180) % 360, 
      s: primaryHsl.s * 0.7, 
      l: 50 
    }).toHex(),
    
    // Success: shift towards green while keeping some primary characteristics
    success: new Color({ 
      h: (primaryHsl.h * 0.3 + 142 * 0.7) % 360,  // Blend primary hue with green
      s: Math.min(primaryHsl.s * 0.9, 70), 
      l: 45 
    }).toHex(),
    
    // Warning: shift towards orange/amber
    warning: new Color({ 
      h: (primaryHsl.h * 0.2 + 38 * 0.8) % 360,  // Blend primary hue with orange
      s: Math.min(primaryHsl.s * 1.1, 85), 
      l: 50 
    }).toHex(),
    
    // Danger: shift towards red
    danger: new Color({ 
      h: (primaryHsl.h * 0.2 + 4 * 0.8) % 360,  // Blend primary hue with red
      s: Math.min(primaryHsl.s, 75), 
      l: 50 
    }).toHex(),
    
    // Info: shift towards blue
    info: new Color({ 
      h: (primaryHsl.h * 0.3 + 210 * 0.7) % 360,  // Blend primary hue with blue
      s: Math.min(primaryHsl.s * 0.85, 70), 
      l: 50 
    }).toHex()
  };
  
  return {
    primary: generateTailwindDarkScale(primaryHex),
    secondary: generateTailwindDarkScale(semanticColors.secondary),
    success: generateTailwindDarkScale(semanticColors.success),
    warning: generateTailwindDarkScale(semanticColors.warning),
    danger: generateTailwindDarkScale(semanticColors.danger),
    info: generateTailwindDarkScale(semanticColors.info),
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

export function generateThemePalettes(primaryHex: string, options: {
  preserveInput?: boolean;
} = {}): ThemePalettes {
  const {
    preserveInput = true
  } = options;
  
  const primary = new Color(primaryHex);
  const primaryHsl = primary.toHSL();
  
  // Generate semantic colors based on primary color
  // Using color theory to create harmonious relationships
  const semanticColors = {
    // Secondary: complementary color (180° opposite)
    secondary: new Color({ 
      h: (primaryHsl.h + 180) % 360, 
      s: primaryHsl.s * 0.7, 
      l: 50 
    }).toHex(),
    
    // Success: shift towards green while keeping some primary characteristics
    success: new Color({ 
      h: (primaryHsl.h * 0.3 + 142 * 0.7) % 360,  // Blend primary hue with green
      s: Math.min(primaryHsl.s * 0.9, 70),  // Slightly less saturated
      l: 45 
    }).toHex(),
    
    // Warning: shift towards orange/amber
    warning: new Color({ 
      h: (primaryHsl.h * 0.2 + 38 * 0.8) % 360,  // Blend primary hue with orange
      s: Math.min(primaryHsl.s * 1.1, 85),  // Slightly more saturated
      l: 50 
    }).toHex(),
    
    // Danger: shift towards red
    danger: new Color({ 
      h: (primaryHsl.h * 0.2 + 4 * 0.8) % 360,  // Blend primary hue with red
      s: Math.min(primaryHsl.s, 75),  // Similar saturation to primary
      l: 50 
    }).toHex(),
    
    // Info: shift towards blue
    info: new Color({ 
      h: (primaryHsl.h * 0.3 + 210 * 0.7) % 360,  // Blend primary hue with blue
      s: Math.min(primaryHsl.s * 0.85, 70),  // Slightly less saturated
      l: 50 
    }).toHex()
  };
  
  // Generate light mode palettes
  const light = {
    primary: generateTailwindScale(primaryHex, preserveInput),
    secondary: generateTailwindScale(semanticColors.secondary, preserveInput),
    success: generateTailwindScale(semanticColors.success, preserveInput),
    warning: generateTailwindScale(semanticColors.warning, preserveInput),
    danger: generateTailwindScale(semanticColors.danger, preserveInput),
    info: generateTailwindScale(semanticColors.info, preserveInput),
    gray: generateTailwindGrayScale()
  };
  
  // Generate dark mode palettes
  const dark = {
    primary: generateTailwindDarkScale(primaryHex),
    secondary: generateTailwindDarkScale(semanticColors.secondary),
    success: generateTailwindDarkScale(semanticColors.success),
    warning: generateTailwindDarkScale(semanticColors.warning),
    danger: generateTailwindDarkScale(semanticColors.danger),
    info: generateTailwindDarkScale(semanticColors.info),
    gray: generateTailwindDarkGrayScale()
  };
  
  return { light, dark };
}
