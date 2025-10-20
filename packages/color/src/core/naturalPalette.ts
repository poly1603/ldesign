/**
 * @ldesign/color - Natural Palette Generation
 * 
 * Advanced color palette generation with natural-looking scales
 * Based on algorithms from a-nice-red and tailwindcss-palette-generator
 */

import type { ColorInput, HSL } from '../types';
import { clamp } from '../utils/math';
import { Color } from './Color';

/**
 * Generate semantic colors based on primary color using a-nice-red algorithm
 * This creates more natural looking semantic colors by considering the primary color's hue range
 */
export function generateNaturalSemanticColors(primaryColor: ColorInput): {
  primary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  gray: string;
} {
  const color = new Color(primaryColor);
  const hsl = color.toHSL();
  
  return {
    primary: color.toHex(),
    success: generateSuccessColor(hsl),
    warning: generateWarningColor(hsl),
    danger: generateDangerColor(hsl),
    info: generateInfoColor(hsl),
    gray: generateNeutralColor(hsl)
  };
}

/**
 * Generate success/green color based on primary hue
 * Algorithm from a-nice-red Green.js
 */
function generateSuccessColor(primaryHSL: HSL): string {
  let h: number;
  
  // Determine green hue based on primary hue
  const primaryH = primaryHSL.h;
  if (primaryH < 25 || primaryH >= 335) {
    h = 120; // Pure green for red/magenta primaries
  } else if (primaryH >= 25 && primaryH < 75) {
    h = 80; // Yellow-green for yellow/orange primaries
  } else if (primaryH >= 75 && primaryH < 150) {
    h = primaryH; // Keep if already green
  } else if (primaryH >= 150 && primaryH < 210) {
    h = 90; // Spring green for cyan primaries
  } else if (primaryH >= 210 && primaryH < 285) {
    h = 100; // Blue-green for blue primaries
  } else {
    h = 130; // Forest green for purple primaries
  }
  
  // Adjust saturation (55-70%)
  const primaryS = primaryHSL.s;
  const s = clamp(primaryS - 5, 55, 70);
  
  // Adjust lightness (45-60%)
  const primaryL = primaryHSL.l;
  const l = clamp(primaryL + 5, 45, 60);
  
  return Color.fromHSL(h, s, l).toHex();
}

/**
 * Generate warning/amber color based on primary hue
 * Algorithm from a-nice-red Amber.js
 */
function generateWarningColor(primaryHSL: HSL): string {
  let h: number;
  
  // Determine amber hue based on primary hue
  const primaryH = primaryHSL.h;
  if (primaryH >= 240 || primaryH < 60) {
    h = 42; // Standard amber for red/yellow primaries
  } else if (primaryH >= 60 && primaryH < 140) {
    h = 40; // Slightly redder amber for green primaries
  } else if (primaryH >= 140 && primaryH < 240) {
    h = 38; // Orange-amber for blue/cyan primaries
  } else {
    h = primaryH; // Keep if already amber range
  }
  
  // Adjust saturation (80-100%)
  const primaryS = primaryHSL.s;
  const s = clamp(primaryS + 5, 80, 100);
  
  // Adjust lightness (55-65%)
  const primaryL = primaryHSL.l;
  const l = clamp(primaryL + 15, 55, 65);
  
  return Color.fromHSL(h, s, l).toHex();
}

/**
 * Generate danger/red color based on primary hue
 * Algorithm from a-nice-red Red.js
 */
function generateDangerColor(primaryHSL: HSL): string {
  let h: number;
  
  // Determine red hue based on primary hue
  const primaryH = primaryHSL.h;
  if (primaryH >= 15 && primaryH < 60) {
    h = 5; // Orange-red for yellow primaries
  } else if (primaryH >= 60 && primaryH < 140) {
    h = 10; // True red for green primaries
  } else if (primaryH >= 140 && primaryH < 190) {
    h = 357; // Pink-red for cyan primaries
  } else if (primaryH >= 190 && primaryH < 240) {
    h = 0; // Pure red for blue primaries
  } else if (primaryH >= 240 && primaryH < 350) {
    h = 355; // Crimson for purple primaries
  } else {
    h = primaryH; // Keep if already red
  }
  
  // Adjust saturation (75-85%)
  const primaryS = primaryHSL.s;
  const s = clamp(primaryS, 75, 85);
  
  // Adjust lightness (45-55%)
  const primaryL = primaryHSL.l;
  const l = clamp(primaryL + 5, 45, 55);
  
  return Color.fromHSL(h, s, l).toHex();
}

/**
 * Generate info/blue color based on primary hue
 */
function generateInfoColor(primaryHSL: HSL): string {
  let h: number;
  
  // Determine blue hue based on primary hue
  const primaryH = primaryHSL.h;
  if (primaryH >= 180 && primaryH < 240) {
    h = primaryH; // Keep if already blue
  } else if (primaryH < 60 || primaryH >= 300) {
    h = 210; // Sky blue for warm colors
  } else if (primaryH >= 60 && primaryH < 180) {
    h = 200; // Light blue for green/yellow
  } else {
    h = 220; // Deep blue for purple range
  }
  
  // Adjust saturation (60-75%)
  const primaryS = primaryHSL.s;
  const s = clamp(primaryS - 10, 60, 75);
  
  // Adjust lightness (45-60%)
  const primaryL = primaryHSL.l;
  const l = clamp(primaryL, 45, 60);
  
  return Color.fromHSL(h, s, l).toHex();
}

/**
 * Generate neutral gray based on primary hue
 * Algorithm from a-nice-red gray generation
 */
function generateNeutralColor(primaryHSL: HSL): string {
  let h: number;
  
  // Slightly tint the gray based on primary hue
  const primaryH = primaryHSL.h;
  if (primaryH < 40 || primaryH >= 160) {
    h = 200; // Cool gray for cool colors
  } else if (primaryH >= 40 && primaryH < 100) {
    h = 220; // Blue-gray for yellows/greens
  } else {
    h = 210; // Neutral blue-gray
  }
  
  // Very low saturation for gray
  const s = 7;
  
  // Mid lightness
  const l = 50;
  
  return Color.fromHSL(h, s, l).toHex();
}

/**
 * Shade configuration for natural-looking palettes
 */
export interface ShadeConfig {
  name: string | number;
  lightness: number;
}

/**
 * Default shade configurations (12 levels)
 */
export const DEFAULT_SHADES: ShadeConfig[] = [
  { name: '50', lightness: 98 },
  { name: '100', lightness: 95 },
  { name: '200', lightness: 90 },
  { name: '300', lightness: 82 },
  { name: '400', lightness: 71 },
  { name: '500', lightness: 60 },
  { name: '600', lightness: 48 },
  { name: '700', lightness: 37 },
  { name: '800', lightness: 27 },
  { name: '900', lightness: 18 },
  { name: '950', lightness: 10 },
  { name: '1000', lightness: 4 }
];

/**
 * Gray shade configurations (14 levels)
 */
export const GRAY_SHADES: ShadeConfig[] = [
  { name: '50', lightness: 98 },
  { name: '100', lightness: 96 },
  { name: '150', lightness: 93 },
  { name: '200', lightness: 88 },
  { name: '300', lightness: 80 },
  { name: '400', lightness: 71 },
  { name: '500', lightness: 60 },
  { name: '600', lightness: 48 },
  { name: '700', lightness: 37 },
  { name: '800', lightness: 27 },
  { name: '850', lightness: 20 },
  { name: '900', lightness: 14 },
  { name: '950', lightness: 8 },
  { name: '1000', lightness: 3 }
];

/**
 * Material Design shade configuration (12 levels)
 */
export const MATERIAL_SHADES: ShadeConfig[] = [
  { name: '50', lightness: 97 },
  { name: '100', lightness: 93 },
  { name: '200', lightness: 85 },
  { name: '300', lightness: 74 },
  { name: '400', lightness: 63 },
  { name: '500', lightness: 52 },
  { name: '600', lightness: 42 },
  { name: '700', lightness: 33 },
  { name: '800', lightness: 25 },
  { name: '900', lightness: 17 },
  { name: 'A400', lightness: 10 },
  { name: 'A700', lightness: 5 }
];

/**
 * Ant Design shade configuration (12 levels)
 */
export const ANTD_SHADES: ShadeConfig[] = [
  { name: 1, lightness: 97 },
  { name: 2, lightness: 91 },
  { name: 3, lightness: 82 },
  { name: 4, lightness: 72 },
  { name: 5, lightness: 62 },
  { name: 6, lightness: 52 },
  { name: 7, lightness: 42 },
  { name: 8, lightness: 32 },
  { name: 9, lightness: 22 },
  { name: 10, lightness: 13 },
  { name: 11, lightness: 7 },
  { name: 12, lightness: 3 }
];

/**
 * Generate a natural-looking color scale - Optimized memory usage
 */
export function generateNaturalScale(
  baseColor: ColorInput,
  options: {
    shades?: ShadeConfig[];
    preserve?: boolean;
    adjustSaturation?: boolean;
  } = {}
): { [key: string | number]: string } {
  const {
    shades = DEFAULT_SHADES,
    preserve = true,
    adjustSaturation = true
  } = options;
  
  const color = new Color(baseColor);
  const baseHSL = color.toHSL();
  const baseHex = preserve ? color.toHex() : '';
  const baseH = baseHSL.h;
  const baseS = baseHSL.s;
  const baseL = baseHSL.l;
  
  const palette = Object.create(null);
  let closestShade = '';
  let minDelta = Infinity;
  
  // Generate shades with inline calculations
  for (let i = 0; i < shades.length; i++) {
    const { name, lightness } = shades[i];
    let h = baseH;
    let s = baseS;
    
    if (adjustSaturation) {
      // Simplified saturation adjustment
      if (lightness > 90) {
        s *= 0.3 + (100 - lightness) * 0.07;
      } else if (lightness > 70) {
        s *= 0.7 + (90 - lightness) * 0.015;
      } else if (lightness < 20) {
        s *= 0.8 + lightness * 0.01;
      } else if (lightness < 40) {
        s *= 0.9 + (lightness - 20) * 0.005;
      }
      
      // Hue shift at extremes
      if (lightness > 85) {
        h = (h + 2) % 360;
      } else if (lightness < 15) {
        h = (h + 358) % 360;
      }
    }
    
    // Create color and immediately convert to hex
    const tempColor = Color.fromHSL(h, s, lightness);
    palette[name] = tempColor.toHex();
    tempColor.dispose(); // Return to pool
    
    // Track closest shade inline
    if (preserve) {
      const delta = Math.abs(baseL - lightness);
      if (delta < minDelta) {
        minDelta = delta;
        closestShade = String(name);
      }
    }
  }
  
  // Preserve original color
  if (preserve && closestShade) {
    palette[closestShade] = baseHex;
  }
  
  color.dispose();
  return palette;
}

/**
 * Generate natural gray scale with slight tint
 */
export function generateNaturalGrayScale(
  options: {
    tintHue?: number;
    shades?: ShadeConfig[];
  } = {}
): { [key: string | number]: string } {
  const {
    tintHue = 210, // Default to blue-gray
    shades = GRAY_SHADES  // Use 14-level gray shades by default
  } = options;
  
  return shades.reduce((obj: Record<string | number, string>, shade) => {
    const { name, lightness } = shade;
    
    // Calculate saturation based on lightness
    // Less saturation at extremes, peak at mid-tones
    let saturation: number;
    if (lightness > 90 || lightness < 10) {
      saturation = 2; // Very low saturation at extremes
    } else if (lightness > 70 || lightness < 30) {
      saturation = 5; // Low saturation
    } else {
      saturation = 8; // Slightly more saturation in mid-tones
    }
    
    const hex = Color.fromHSL(tintHue, saturation, lightness).toHex();
    obj[name] = hex;
    
    return obj;
  }, {});
}

/**
 * Generate a complete natural theme palette
 */
export function generateNaturalTheme(
  primaryColor: ColorInput,
  options: {
    shades?: ShadeConfig[];
    generateSemantics?: boolean;
    includeGrays?: boolean;
    preserve?: boolean;
  } = {}
): {
  primary: { [key: string | number]: string };
  success?: { [key: string | number]: string };
  warning?: { [key: string | number]: string };
  danger?: { [key: string | number]: string };
  info?: { [key: string | number]: string };
  gray?: { [key: string | number]: string };
} {
  const {
    shades = DEFAULT_SHADES,
    generateSemantics = true,
    includeGrays = true,
    preserve = true
  } = options;
  
  const theme: any = {};
  
  // Generate primary palette
  theme.primary = generateNaturalScale(primaryColor, { shades, preserve });
  
  if (generateSemantics) {
    // Generate semantic colors using natural algorithm
    const semanticColors = generateNaturalSemanticColors(primaryColor);
    
    // Generate scales for each semantic color
    theme.success = generateNaturalScale(semanticColors.success, { shades, preserve });
    theme.warning = generateNaturalScale(semanticColors.warning, { shades, preserve });
    theme.danger = generateNaturalScale(semanticColors.danger, { shades, preserve });
    theme.info = generateNaturalScale(semanticColors.info, { shades, preserve });
  }
  
  if (includeGrays) {
    // Get tint hue from primary color for grays
    const primaryHSL = new Color(primaryColor).toHSL();
    let tintHue: number;
    
    // Determine gray tint based on primary hue
    if (primaryHSL.h < 40 || primaryHSL.h >= 160) {
      tintHue = 200; // Cool gray
    } else if (primaryHSL.h >= 40 && primaryHSL.h < 100) {
      tintHue = 220; // Blue-gray
    } else {
      tintHue = 210; // Neutral blue-gray
    }
    
    theme.gray = generateNaturalGrayScale({ tintHue, shades });
  }
  
  return theme;
}

/**
 * Smart color generation based on relationships
 */
export function generateSmartPalette(
  colors: ColorInput[],
  options: {
    names?: string[];
    shades?: ShadeConfig[];
    preserve?: boolean;
  } = {}
): { [key: string]: { [key: string | number]: string } } {
  const {
    names = ['primary', 'secondary', 'tertiary', 'quaternary', 'quinary'],
    shades = DEFAULT_SHADES,
    preserve = true
  } = options;
  
  const palette: Record<string, Record<string | number, string>> = {};
  
  colors.forEach((color, index) => {
    const name = names[index] || `color${index + 1}`;
    palette[name] = generateNaturalScale(color, { shades, preserve });
  });
  
  return palette;
}

/**
 * Generate accessible color pairs
 */
export function generateAccessiblePairs(
  baseColor: ColorInput,
  targetContrast = 4.5
): {
  foreground: string;
  background: string;
  contrast: number;
} {
  const color = new Color(baseColor);
  const baseLuminance = color.getLuminance();
  
  // Determine if we need a lighter or darker pair
  let targetColor: Color;
  if (baseLuminance > 0.5) {
    // Base is light, find dark foreground
    let darkness = 20;
    do {
      targetColor = color.darken(darkness);
      darkness += 5;
    } while (color.contrast(targetColor.toHex()) < targetContrast && darkness < 100);
  } else {
    // Base is dark, find light foreground
    let lightness = 20;
    do {
      targetColor = color.lighten(lightness);
      lightness += 5;
    } while (color.contrast(targetColor.toHex()) < targetContrast && lightness < 100);
  }
  
  const actualContrast = color.contrast(targetColor.toHex());
  
  return {
    background: color.toHex(),
    foreground: targetColor.toHex(),
    contrast: actualContrast
  };
}