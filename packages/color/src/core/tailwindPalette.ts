/**
 * @ldesign/color - Tailwind-style Palette Generation
 * 
 * Generates color palettes using the exact algorithm from tailwindcss-palette-generator
 * This creates 12-level color scales by adjusting only lightness while preserving hue and saturation
 */

import type { ColorInput } from '../types';
import { Color } from './Color';

/**
 * Default Tailwind shade configuration with optimized lightness values
 * These values are specifically chosen for optimal visual balance
 * Adjusted to prevent overly dark shades at the end
 */
export const TAILWIND_SHADES = [
  { name: '50', lightness: 98 },
  { name: '100', lightness: 95 },
  { name: '200', lightness: 90 },
  { name: '300', lightness: 82 },
  { name: '400', lightness: 64 },
  { name: '500', lightness: 46 },
  { name: '600', lightness: 35 },
  { name: '700', lightness: 27 },
  { name: '800', lightness: 20 },
  { name: '900', lightness: 15 },
  { name: '950', lightness: 10 },
  { name: '1000', lightness: 7 }  // Adjusted to be less extreme while still providing depth
];

/**
 * Generate a Tailwind-style color scale from a base color
 * Uses the exact algorithm from tailwindcss-palette-generator
 * 
 * @param baseColor - The base color to generate shades from
 * @param preserve - Whether to preserve the original color at its closest shade
 * @returns Object with shade names as keys and hex colors as values
 */
export function generateTailwindScale(
  baseColor: ColorInput,
  preserve: boolean = true
): { [key: string]: string } {
  const color = new Color(baseColor);
  const hsl = color.toHSL();
  const palette: { [key: string]: string } = {};
  
  // Track lightness deltas if preserving the original color
  const lightnessDelta: { [key: string]: number } = {};
  const inputLightness = hsl.l;
  
  // Generate each shade by keeping hue and saturation constant, only changing lightness
  TAILWIND_SHADES.forEach(({ name, lightness }) => {
    // Create new color with same hue and saturation, but different lightness (converted to 0-100 scale)
    const shadeColor = Color.fromHSL(
      hsl.h,  // Keep original hue
      hsl.s,  // Keep original saturation  
      lightness // Use the Tailwind lightness value
    );
    
    palette[name] = shadeColor.toHex();
    
    // Calculate how far this shade is from the original color's lightness
    if (preserve) {
      lightnessDelta[name] = Math.abs(inputLightness - lightness);
    }
  });
  
  // If preserving, replace the closest shade with the original color
  if (preserve) {
    const closestShade = Object.keys(lightnessDelta).sort(
      (a, b) => lightnessDelta[a] - lightnessDelta[b]
    )[0];
    palette[closestShade] = color.toHex();
  }
  
  return palette;
}

/**
 * Generate semantic colors (primary, success, warning, danger, info) with Tailwind scales
 * Colors are generated based on the primary color for better harmony
 */
export function generateTailwindSemanticColors(primaryColor: ColorInput): {
  primary: { [key: string]: string };
  success: { [key: string]: string };
  warning: { [key: string]: string };
  danger: { [key: string]: string };
  info: { [key: string]: string };
} {
  const primary = new Color(primaryColor);
  const primaryHsl = primary.toHSL();
  
  // Define semantic color bases based on primary color characteristics
  // These create harmonious relationships while maintaining semantic meaning
  const semanticBases = {
    primary,
    
    // Success: green hue with saturation based on primary
    success: Color.fromHSL(
      142,  // Green hue (slightly blue-shifted for modern look)
      Math.min(Math.max(primaryHsl.s * 0.9, 45), 70),  // Controlled saturation
      45  // Balanced lightness
    ),
    
    // Warning: warm orange/amber with boosted saturation
    warning: Color.fromHSL(
      38,  // Orange hue
      Math.min(Math.max(primaryHsl.s * 1.1, 60), 85),  // Higher saturation for visibility
      50  // Balanced lightness
    ),
    
    // Danger: red with saturation based on primary
    danger: Color.fromHSL(
      4,  // Red hue (slightly orange-shifted for warmth)
      Math.min(Math.max(primaryHsl.s, 50), 75),  // Maintain good saturation
      50  // Balanced lightness
    ),
    
    // Info: blue with slightly reduced saturation
    info: Color.fromHSL(
      210,  // Blue hue
      Math.min(Math.max(primaryHsl.s * 0.85, 40), 70),  // Controlled saturation
      50  // Balanced lightness
    )
  };
  
  const result: any = {};
  
  Object.entries(semanticBases).forEach(([name, baseColor]) => {
    // Convert Color to hex string for generateTailwindScale
    result[name] = generateTailwindScale(baseColor.toHex(), true);
  });
  
  return result;
}

/**
 * Generate pure gray scale (no tinting)
 * Provides 14 shades for more granular options
 */
export function generateTailwindGrayScale(): { [key: string]: string } {
  const grays: { [key: string]: string } = {};
  
  // Extended gray scale with 14 shades for more options
  // Pure grayscale with saturation = 0
  const grayShades = [
    { name: '50', lightness: 98 },
    { name: '100', lightness: 95 },
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
    { name: '950', lightness: 9 },
    { name: '1000', lightness: 5 }
  ];
  
  grayShades.forEach(({ name, lightness }) => {
    // Pure gray with hue=0, saturation=0
    const grayColor = Color.fromHSL(0, 0, lightness);
    grays[name] = grayColor.toHex();
  });
  
  return grays;
}

/**
 * Generate a complete Tailwind-style theme
 */
export function generateTailwindTheme(
  primaryColor: ColorInput,
  options: {
    includeSemantics?: boolean;
    includeGrays?: boolean;
    preserveInput?: boolean;
  } = {}
): {
  colors: {
    primary: { [key: string]: string };
    success?: { [key: string]: string };
    warning?: { [key: string]: string };
    danger?: { [key: string]: string };
    info?: { [key: string]: string };
  };
  grays?: { [key: string]: string };
} {
  const {
    includeSemantics = true,
    includeGrays = true,
    preserveInput = true
  } = options;
  
  const theme: any = {
    colors: {}
  };
  
  if (includeSemantics) {
    const semanticColors = generateTailwindSemanticColors(primaryColor);
    theme.colors = semanticColors;
  } else {
    theme.colors.primary = generateTailwindScale(primaryColor, preserveInput);
  }
  
  if (includeGrays) {
    theme.grays = generateTailwindGrayScale();
  }
  
  return theme;
}

/**
 * CSS Variable suffix format options
 */
export type CssVarSuffixFormat = 'tailwind' | 'numeric';

/**
 * Options for CSS variable generation
 */
export interface CssVarOptions {
  /** Prefix for CSS variable names (e.g., 'tw', 'app'). A dash will be automatically added after the prefix. Default is empty */
  prefix?: string;
  /** Suffix format: 'tailwind' for (50, 100, 200...), 'numeric' for (1, 2, 3...) */
  suffixFormat?: CssVarSuffixFormat;
  /** Custom name mappings for colors (e.g., { primary: 'brand', success: 'good' }) */
  nameMap?: { [key: string]: string };
}

/**
 * Generate CSS variables from a Tailwind palette
 * 
 * @param palette - Tailwind palette object
 * @param name - Color name (e.g., 'primary', 'success')
 * @param options - CSS variable generation options
 * @returns CSS variables as string
 */
export function generatePaletteCssVars(
  palette: { [key: string]: string },
  name: string,
  options: CssVarOptions = {}
): string {
  const { prefix = '', suffixFormat = 'tailwind' } = options;
  const cssVars: string[] = [];
  
  Object.entries(palette).forEach(([shade, color], index) => {
    let suffix: string;
    
    if (suffixFormat === 'numeric') {
      // Use 1-based numeric index
      suffix = String(index + 1);
    } else {
      // Use Tailwind shade names (50, 100, 200, etc.)
      suffix = shade;
    }
    
    // Auto-add dash after prefix if prefix is provided and doesn't already end with a dash
    const prefixWithDash = prefix ? (prefix.endsWith('-') ? prefix : `${prefix  }-`) : '';
    const varName = `--${prefixWithDash}${name}-color-${suffix}`;
    cssVars.push(`  ${varName}: ${color};`);
  });
  
  return cssVars.join('\n');
}

/**
 * Generate CSS variables for a complete theme
 * 
 * @param theme - Complete theme object with colors and grays
 * @param options - CSS variable generation options  
 * @returns CSS variables as string
 */
export function generateThemeCssVars(
  theme: {
    colors: { [colorName: string]: { [shade: string]: string } };
    grays?: { [shade: string]: string };
  },
  options: CssVarOptions = {}
): string {
  const { nameMap = {} } = options;
  const cssVars: string[] = [];
  
  // Generate variables for each color
  Object.entries(theme.colors).forEach(([colorName, palette]) => {
    // Use custom name from nameMap if provided, otherwise use original name
    const varName = nameMap[colorName] || colorName;
    cssVars.push(generatePaletteCssVars(palette, varName, options));
  });
  
  // Generate variables for grays if present
  if (theme.grays) {
    // Also check if gray has a custom name mapping
    const grayName = nameMap.gray || nameMap.grays || 'gray';
    cssVars.push(generatePaletteCssVars(theme.grays, grayName, options));
  }
  
  return cssVars.join('\n');
}

/**
 * Insert CSS variables into document head
 * 
 * @param cssVars - CSS variables string
 * @param id - Style element ID for updating existing styles
 */
export function insertCssVars(cssVars: string, id: string = 'tailwind-palette-vars'): void {
  if (typeof document === 'undefined') return;
  
  // Remove existing style element if present
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }
  
  // Create new style element
  const style = document.createElement('style');
  style.id = id;
  style.textContent = `:root {\n${cssVars}\n}`;
  
  document.head.appendChild(style);
}

/**
 * Generate and insert theme CSS variables in one step
 * 
 * @param theme - Complete theme object
 * @param options - CSS variable generation options
 */
export function applyThemeCssVars(
  theme: {
    colors: { [colorName: string]: { [shade: string]: string } };
    grays?: { [shade: string]: string };
  },
  options: CssVarOptions & { styleId?: string } = {}
): void {
  const { styleId = 'tailwind-palette-vars', ...cssVarOptions } = options;
  const cssVars = generateThemeCssVars(theme, cssVarOptions);
  insertCssVars(cssVars, styleId);
}

/**
 * Generate multiple color palettes like tailwindcss-palette-generator
 */
export function generateTailwindPalettes(
  colors: ColorInput | ColorInput[],
  options: {
    names?: string[];
    preserve?: boolean;
  } = {}
): { [key: string]: { [key: string]: string } } {
  const {
    names = [
      'primary',
      'secondary', 
      'tertiary',
      'quaternary',
      'quinary',
      'senary',
      'septenary',
      'octonary',
      'nonary',
      'denary'
    ],
    preserve = true
  } = options;
  
  // Normalize input to array of ColorInput
  let colorArray: ColorInput[];
  if (Array.isArray(colors)) {
    // If colors is already an array and it's a number array (RGB), wrap it
    if (colors.length > 0 && typeof colors[0] === 'number') {
      // It's an RGB array, use it as a single color
      colorArray = [colors as ColorInput];
    } else {
      // It's an array of color inputs
      colorArray = colors as ColorInput[];
    }
  } else {
    // Single color input
    colorArray = [colors];
  }
  
  const palette: { [key: string]: { [key: string]: string } } = {};
  
  colorArray.forEach((color, index) => {
    const name = names[index] || `color${index + 1}`;
    palette[name] = generateTailwindScale(color, preserve);
  });
  
  return palette;
}
