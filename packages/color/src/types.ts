/**
 * @ldesign/color - Type Definitions
 * 
 * All type definitions for the color library
 */

// ============================================
// Basic Color Types
// ============================================

/**
 * RGB color representation
 */
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
  a?: number; // 0-1
}

/**
 * HSL color representation
 */
export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  a?: number; // 0-1
}

/**
 * HSV/HSB color representation
 */
export interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
  a?: number; // 0-1
}

/**
 * HWB color representation
 */
export interface HWB {
  h: number; // 0-360
  w: number; // 0-100 (whiteness)
  b: number; // 0-100 (blackness)
  a?: number; // 0-1
}

// ============================================
// Professional Color Spaces
// ============================================

/**
 * CIE LAB color space
 */
export interface LAB {
  l: number; // 0-100 (lightness)
  a: number; // -128 to 127 (green-red)
  b: number; // -128 to 127 (blue-yellow)
  alpha?: number; // 0-1
}

/**
 * CIE LCH color space (cylindrical LAB)
 */
export interface LCH {
  l: number; // 0-100 (lightness)
  c: number; // 0-150 (chroma)
  h: number; // 0-360 (hue)
  alpha?: number; // 0-1
}

/**
 * CIE XYZ color space
 */
export interface XYZ {
  x: number; // 0-95.047
  y: number; // 0-100
  z: number; // 0-108.883
  alpha?: number; // 0-1
}

/**
 * OKLAB color space (perceptually uniform)
 */
export interface OKLAB {
  l: number; // 0-1 (lightness)
  a: number; // -0.4 to 0.4 (green-red)
  b: number; // -0.4 to 0.4 (blue-yellow)
  alpha?: number; // 0-1
}

/**
 * OKLCH color space
 */
export interface OKLCH {
  l: number; // 0-1 (lightness)
  c: number; // 0-0.4 (chroma)
  h: number; // 0-360 (hue)
  alpha?: number; // 0-1
}

/**
 * CMYK color space
 */
export interface CMYK {
  c: number; // 0-100 (cyan)
  m: number; // 0-100 (magenta)
  y: number; // 0-100 (yellow)
  k: number; // 0-100 (black)
  a?: number; // 0-1
}

// ============================================
// Color Input Types
// ============================================

/**
 * All possible color input types
 */
export type ColorInput = 
  | string 
  | RGB 
  | HSL 
  | HSV 
  | HWB
  | LAB 
  | LCH 
  | XYZ
  | OKLAB
  | OKLCH
  | CMYK
  | number[]
  | { toHex: () => string; toRGB: () => RGB };  // Support Color instances

/**
 * Color format types
 */
export type ColorFormat = 
  | 'hex'
  | 'rgb'
  | 'rgba'
  | 'hsl'
  | 'hsla'
  | 'hsv'
  | 'hwb'
  | 'lab'
  | 'lch'
  | 'xyz'
  | 'oklab'
  | 'oklch'
  | 'cmyk'
  | 'name';

// ============================================
// Color Operations
// ============================================

/**
 * Blend modes for color mixing
 */
export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'linear-burn'
  | 'linear-dodge'
  | 'vivid-light'
  | 'pin-light'
  | 'hard-mix'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

/**
 * Interpolation spaces for color mixing
 */
export type InterpolationSpace = 
  | 'rgb'
  | 'hsl'
  | 'hsv'
  | 'hwb'
  | 'lab'
  | 'lch'
  | 'oklab'
  | 'oklch';

/**
 * Color harmony types
 */
export type HarmonyType = 
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'split-complementary'
  | 'double-complementary'
  | 'square'
  | 'monochromatic';

// ============================================
// Accessibility
// ============================================

/**
 * WCAG contrast levels
 */
export type WCAGLevel = 'AA' | 'AAA';

/**
 * WCAG text sizes
 */
export type TextSize = 'normal' | 'large';

/**
 * Color blindness types
 */
export type ColorBlindnessType = 
  | 'protanopia'    // Red-blind
  | 'protanomaly'   // Red-weak
  | 'deuteranopia'  // Green-blind
  | 'deuteranomaly' // Green-weak
  | 'tritanopia'    // Blue-blind
  | 'tritanomaly'   // Blue-weak
  | 'achromatopsia' // Total color blindness
  | 'achromatomaly'; // Partial color blindness

// ============================================
// Analysis
// ============================================

/**
 * Color temperature descriptor
 */
export interface ColorTemperature {
  kelvin: number;
  name: 'cool' | 'neutral' | 'warm';
  description: string;
}

/**
 * Color psychological properties
 */
export interface ColorPsychology {
  emotion: string[];
  energy: 'low' | 'medium' | 'high';
  weight: 'light' | 'medium' | 'heavy';
  temperature: 'cool' | 'neutral' | 'warm';
  associations: string[];
}

/**
 * Color statistics
 */
export interface ColorStatistics {
  dominantChannel: 'red' | 'green' | 'blue';
  brightness: number;
  saturation: number;
  luminance: number;
  contrast: number;
}

// ============================================
// Palettes & Themes
// ============================================

/**
 * Color palette configuration
 */
export interface PaletteConfig {
  baseColor?: ColorInput;
  count?: number;
  type?: 'monochromatic' | 'analogous' | 'complementary' | 'triadic' | 'custom';
  variations?: 'lightness' | 'saturation' | 'both';
}

/**
 * Theme colors
 */
export interface ThemeColors {
  primary: string;
  secondary?: string;
  success?: string;
  warning?: string;
  error?: string;
  info?: string;
  light?: string;
  dark?: string;
  [key: string]: string | undefined;
}

/**
 * Color scheme
 */
export interface ColorScheme {
  name: string;
  colors: string[];
  description?: string;
  tags?: string[];
}

// ============================================
// Animation
// ============================================

/**
 * Easing function type
 */
export type EasingFunction = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'ease-in-quad'
  | 'ease-out-quad'
  | 'ease-in-out-quad'
  | 'ease-in-cubic'
  | 'ease-out-cubic'
  | 'ease-in-out-cubic'
  | 'ease-in-quart'
  | 'ease-out-quart'
  | 'ease-in-out-quart'
  | 'ease-in-quint'
  | 'ease-out-quint'
  | 'ease-in-out-quint'
  | 'ease-in-sine'
  | 'ease-out-sine'
  | 'ease-in-out-sine'
  | 'ease-in-expo'
  | 'ease-out-expo'
  | 'ease-in-out-expo'
  | 'ease-in-circ'
  | 'ease-out-circ'
  | 'ease-in-out-circ'
  | 'ease-in-back'
  | 'ease-out-back'
  | 'ease-in-out-back'
  | 'ease-in-elastic'
  | 'ease-out-elastic'
  | 'ease-in-out-elastic'
  | 'ease-in-bounce'
  | 'ease-out-bounce'
  | 'ease-in-out-bounce';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  duration: number;
  delay?: number;
  easing?: EasingFunction | ((t: number) => number);
  iterations?: number;
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
  onUpdate?: (color: any) => void;
  onComplete?: () => void;
}

/**
 * Keyframe definition
 */
export interface Keyframe {
  color: ColorInput;
  offset: number; // 0-1
  easing?: EasingFunction;
}

// ============================================
// Visualization
// ============================================

/**
 * Visualization types
 */
export type VisualizationType = 
  | 'wheel'
  | 'spectrum'
  | 'gradient'
  | 'cube'
  | 'cylinder'
  | 'cone'
  | 'sphere';

/**
 * Color wheel configuration
 */
export interface ColorWheelConfig {
  size?: number;
  segments?: number;
  rings?: number;
  innerRadius?: number;
  showLabels?: boolean;
}

/**
 * Gradient configuration
 */
export interface GradientConfig {
  type?: 'linear' | 'radial' | 'conic';
  angle?: number;
  stops?: Array<{ color: ColorInput; offset: number }>;
  smoothness?: number;
}

/**
 * 3D point representation
 */
export interface Point3D {
  x: number;
  y: number;
  z: number;
  color?: string;
}

/**
 * SVG path data
 */
export interface SVGPath {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

// ============================================
// Plugin System
// ============================================

/**
 * Plugin types
 */
export type PluginType = 
  | 'colorSpace'
  | 'blendMode'
  | 'analyzer'
  | 'generator'
  | 'validator'
  | 'transformer';

/**
 * Plugin configuration
 */
export interface PluginConfig {
  name: string;
  type: PluginType;
  version: string;
  description?: string;
  author?: string;
  dependencies?: string[];
}

/**
 * Plugin interface
 */
export interface Plugin {
  config: PluginConfig;
  install: (target: any) => void;
  uninstall?: () => void;
}

// ============================================
// Options & Configuration
// ============================================

/**
 * Color options
 */
export interface ColorOptions {
  format?: ColorFormat;
  alpha?: boolean;
  cache?: boolean;
  round?: boolean;
}

/**
 * CSS variables options
 */
export interface CSSVariablesOptions {
  prefix?: string;
  selector?: string;
  colors: ThemeColors;
}

/**
 * Export format options
 */
export interface ExportOptions {
  format: 'css' | 'scss' | 'less' | 'json' | 'js';
  includeAlpha?: boolean;
  includeNames?: boolean;
  wrapper?: string;
}