/**
 * @ldesign/color - Palette Generation
 * 
 * Functions for generating color palettes, scales, and CSS variables
 */

import type { ColorInput } from '../types';
import { clamp } from '../utils/math';
import { Color } from './Color';

/**
 * Generate a color scale with multiple shades - Optimized
 */
export function generateScale(
  baseColor: ColorInput,
  steps = 10,
  options: {
    mode?: 'lightness' | 'saturation' | 'both';
    curve?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  } = {}
): Color[] {
  const { mode = 'lightness', curve = 'linear' } = options;
  const color = new Color(baseColor);
  const hsl = color.toHSL();
  const colors = Array.from<Color, Color>({ length: steps }, () => null as any);
  const alpha = color.alpha;
  
  // Pre-calculate factors
  const invSteps = 1 / (steps - 1);
  const baseH = hsl.h;
  const baseS = hsl.s;
  const baseL = hsl.l;
  
  for (let i = 0; i < steps; i++) {
    const t = i * invSteps;
    const factor = applyCurve(t, curve);
    
    let s = baseS;
    let l = baseL;
    
    if (mode === 'lightness' || mode === 'both') {
      l = 10 + (90 * factor);
    }
    
    if (mode === 'saturation' || mode === 'both') {
      const centerDistance = Math.abs(factor - 0.5) * 2;
      s = baseS * (1 - centerDistance * 0.3);
    }
    
    colors[i] = Color.fromHSL(baseH, s, l, alpha);
  }
  
  return colors;
}

/**
 * Apply easing curve to a value
 */
function applyCurve(t: number, curve: string): number {
  switch (curve) {
    case 'easeIn':
      return t * t;
    case 'easeOut':
      return t * (2 - t);
    case 'easeInOut':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    default:
      return t;
  }
}

/**
 * Generate a numbered color palette - Optimized
 */
export function generateNumberedPalette(
  baseColor: ColorInput,
  options: {
    lightSteps?: number[];
    darkSteps?: number[];
  } = {}
): { [key: number]: string } {
  const {
    lightSteps = [95, 90, 80, 70, 60],
    darkSteps = [40, 30, 20, 10, 5]
  } = options;
  
  const color = new Color(baseColor);
  const hsl = color.toHSL(); // Compute HSL once
  const palette: { [key: number]: string } = Object.create(null);
  const baseH = hsl.h;
  const baseS = hsl.s;
  
  // Generate lighter colors
  for (let i = 0; i < lightSteps.length; i++) {
    palette[i + 1] = Color.fromHSL(
      baseH,
      Math.max(10, baseS * (1 - i * 0.1)),
      lightSteps[i]
    ).toHex();
  }
  
  // Base color
  palette[6] = color.toHex();
  
  // Generate darker colors
  for (let i = 0; i < darkSteps.length; i++) {
    palette[i + 7] = Color.fromHSL(
      baseH,
      Math.min(100, baseS * (1 + i * 0.05)),
      darkSteps[i]
    ).toHex();
  }
  
  // Dispose temporary colors
  color.dispose();
  
  return palette;
}

/**
 * Generate semantic colors (success, warning, danger)
 */
export function generateSemanticColors(primaryColor: ColorInput): {
  primary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
} {
  const primary = new Color(primaryColor);
  
  // Define semantic hues
  const semanticHues = {
    success: 120,  // Green
    warning: 45,   // Orange
    danger: 0,     // Red
    info: 200      // Blue
  };
  
  // Generate colors with similar saturation and lightness as primary
  const primaryHSL = primary.toHSL();
  const baseSaturation = primaryHSL.s;
  const baseLightness = primaryHSL.l;
  
  return {
    primary: primary.toHex(),
    success: Color.fromHSL(
      semanticHues.success,
      clamp(baseSaturation * 0.9, 40, 90),
      clamp(baseLightness, 35, 65)
    ).toHex(),
    warning: Color.fromHSL(
      semanticHues.warning,
      clamp(baseSaturation * 1.1, 50, 95),
      clamp(baseLightness * 1.1, 40, 70)
    ).toHex(),
    danger: Color.fromHSL(
      semanticHues.danger,
      clamp(baseSaturation * 0.95, 45, 90),
      clamp(baseLightness * 0.95, 35, 60)
    ).toHex(),
    info: Color.fromHSL(
      semanticHues.info,
      clamp(baseSaturation * 0.85, 35, 85),
      clamp(baseLightness, 40, 65)
    ).toHex()
  };
}

/**
 * Generate gray scale
 */
export function generateGrayScale(steps = 10): Color[] {
  const colors: Color[] = [];
  
  for (let i = 0; i < steps; i++) {
    const lightness = (i / (steps - 1)) * 100;
    colors.push(Color.fromHSL(0, 0, lightness));
  }
  
  return colors;
}

/**
 * Generate a complete theme palette
 */
export function generateThemePalette(
  primaryColor: ColorInput,
  options: {
    generateScales?: boolean;
    scaleSteps?: number;
    includeGrays?: boolean;
    graySteps?: number;
  } = {}
): {
  primary: string | { [key: number]: string };
  success: string | { [key: number]: string };
  warning: string | { [key: number]: string };
  danger: string | { [key: number]: string };
  info: string | { [key: number]: string };
  gray?: { [key: number]: string };
} {
  const {
    generateScales = true,
    includeGrays = true,
    graySteps = 10
  } = options;
  
  const semanticColors = generateSemanticColors(primaryColor);
  const theme: any = {};
  
  if (generateScales) {
    // Generate numbered palettes for each semantic color
    theme.primary = generateNumberedPalette(semanticColors.primary);
    theme.success = generateNumberedPalette(semanticColors.success);
    theme.warning = generateNumberedPalette(semanticColors.warning);
    theme.danger = generateNumberedPalette(semanticColors.danger);
    theme.info = generateNumberedPalette(semanticColors.info);
    
    if (includeGrays) {
      const grays = generateGrayScale(graySteps);
      theme.gray = {};
      grays.forEach((gray, index) => {
        theme.gray[index + 1] = gray.toHex();
      });
    }
  } else {
    // Just return base colors
    theme.primary = semanticColors.primary;
    theme.success = semanticColors.success;
    theme.warning = semanticColors.warning;
    theme.danger = semanticColors.danger;
    theme.info = semanticColors.info;
  }
  
  return theme;
}

/**
 * Generate CSS variables from theme palette
 */
export function generateCSSVariables(
  theme: any,
  options: {
    prefix?: string;
    selector?: string;
    format?: 'hex' | 'rgb' | 'hsl';
  } = {}
): string {
  const { 
    prefix = '--color', 
    selector = ':root',
    format = 'hex'
  } = options;
  
  const variables: string[] = [];
  
  function processValue(value: any, path: string[] = []): void {
    if (typeof value === 'string') {
      // It's a color value
      let colorValue = value;
      if (format !== 'hex') {
        const color = new Color(value);
        if (format === 'rgb') {
          const rgb = color.toRGB();
          colorValue = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
        } else if (format === 'hsl') {
          const hsl = color.toHSL();
          colorValue = `${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%`;
        }
      }
      const varName = `${prefix}-${path.join('-')}`;
      variables.push(`  ${varName}: ${colorValue};`);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively process nested objects
      Object.entries(value).forEach(([key, val]) => {
        processValue(val, [...path, key]);
      });
    }
  }
  
  processValue(theme);
  
  return `${selector} {\n${variables.join('\n')}\n}`;
}

/**
 * Insert CSS variables into document head
 */
export function insertCSSVariables(
  theme: any,
  options: {
    prefix?: string;
    selector?: string;
    format?: 'hex' | 'rgb' | 'hsl';
    id?: string;
  } = {}
): void {
  // Check if we're in a browser environment
  if (typeof document === 'undefined') {
    console.warn('insertCSSVariables: Not in a browser environment');
    return;
  }
  
  const { id = 'ldesign-color-theme' } = options;
  
  // Remove existing style element if present
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
  
  // Generate CSS
  const css = generateCSSVariables(theme, options);
  
  // Create and insert style element
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Generate and insert a complete theme
 */
export function applyTheme(
  primaryColor: ColorInput,
  options: {
    prefix?: string;
    selector?: string;
    format?: 'hex' | 'rgb' | 'hsl';
    generateScales?: boolean;
    includeGrays?: boolean;
    autoInsert?: boolean;
  } = {}
): {
  theme: any;
  css: string;
  apply: () => void;
} {
  const { autoInsert = false, ...rest } = options;
  
  // Generate theme
  const theme = generateThemePalette(primaryColor, {
    generateScales: options.generateScales,
    includeGrays: options.includeGrays
  });
  
  // Generate CSS
  const css = generateCSSVariables(theme, {
    prefix: options.prefix,
    selector: options.selector,
    format: options.format
  });
  
  // Auto-insert if requested
  if (autoInsert && typeof document !== 'undefined') {
    insertCSSVariables(theme, rest);
  }
  
  return {
    theme,
    css,
    apply: () => insertCSSVariables(theme, rest)
  };
}

/**
 * Generate Material Design palette
 */
export function generateMaterialPalette(baseColor: ColorInput): {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  A100?: string;
  A200?: string;
  A400?: string;
  A700?: string;
} {
  const color = new Color(baseColor);
  const hsl = color.toHSL();
  
  // Material Design lightness values
  const palette: any = {
    50: Color.fromHSL(hsl.h, hsl.s * 0.12, 97).toHex(),
    100: Color.fromHSL(hsl.h, hsl.s * 0.30, 93).toHex(),
    200: Color.fromHSL(hsl.h, hsl.s * 0.50, 82).toHex(),
    300: Color.fromHSL(hsl.h, hsl.s * 0.70, 68).toHex(),
    400: Color.fromHSL(hsl.h, hsl.s * 0.85, 58).toHex(),
    500: color.toHex(), // Base color
    600: Color.fromHSL(hsl.h, hsl.s * 1.05, 45).toHex(),
    700: Color.fromHSL(hsl.h, hsl.s * 1.10, 36).toHex(),
    800: Color.fromHSL(hsl.h, hsl.s * 1.15, 28).toHex(),
    900: Color.fromHSL(hsl.h, hsl.s * 1.20, 18).toHex()
  };
  
  // Add accent colors if saturation is high enough
  if (hsl.s > 50) {
    palette.A100 = Color.fromHSL(hsl.h, Math.min(100, hsl.s * 1.2), 80).toHex();
    palette.A200 = Color.fromHSL(hsl.h, Math.min(100, hsl.s * 1.3), 65).toHex();
    palette.A400 = Color.fromHSL(hsl.h, Math.min(100, hsl.s * 1.4), 55).toHex();
    palette.A700 = Color.fromHSL(hsl.h, Math.min(100, hsl.s * 1.5), 45).toHex();
  }
  
  return palette;
}

/**
 * Generate Tailwind CSS palette
 */
export function generateTailwindPalette(baseColor: ColorInput): {
  [key: string]: string;
} {
  const color = new Color(baseColor);
  const hsl = color.toHSL();
  
  return {
    '50': Color.fromHSL(hsl.h, clamp(hsl.s * 0.33, 10, 100), 97).toHex(),
    '100': Color.fromHSL(hsl.h, clamp(hsl.s * 0.44, 10, 100), 94).toHex(),
    '200': Color.fromHSL(hsl.h, clamp(hsl.s * 0.60, 10, 100), 86).toHex(),
    '300': Color.fromHSL(hsl.h, clamp(hsl.s * 0.77, 10, 100), 77).toHex(),
    '400': Color.fromHSL(hsl.h, clamp(hsl.s * 0.92, 10, 100), 63).toHex(),
    '500': color.toHex(), // Base color
    '600': Color.fromHSL(hsl.h, clamp(hsl.s * 1.08, 10, 100), 42).toHex(),
    '700': Color.fromHSL(hsl.h, clamp(hsl.s * 1.15, 10, 100), 33).toHex(),
    '800': Color.fromHSL(hsl.h, clamp(hsl.s * 1.23, 10, 100), 27).toHex(),
    '900': Color.fromHSL(hsl.h, clamp(hsl.s * 1.30, 10, 100), 22).toHex(),
    '950': Color.fromHSL(hsl.h, clamp(hsl.s * 1.38, 10, 100), 13).toHex()
  };
}