/**
 * @ldesign/color - Core Color Class
 * 
 * The main Color class for basic color operations
 */

import type { BlendMode, ColorFormat, ColorInput, HarmonyType, HSL, HSV, RGB, TextSize, WCAGLevel } from '../types';
import { ColorCache } from '../utils/cache';
import { clamp, round } from '../utils/math';
import { parseColorInput } from '../utils/validators';
import { getContrast, getLuminance, isWCAGCompliant } from './analysis';
import { hslToRgb, hsvToRgb, rgbToHsl, rgbToHsv } from './conversions';
import { blend } from './manipulations';

/**
 * Optimized Color class with reduced memory footprint
 * Uses 32-bit integer for RGB storage instead of object
 */
export class Color {
  // Store RGB as single 32-bit integer (0xRRGGBB)
  private _value: number;
  private _alpha: number;
  // Lazy computed values - only cache hex string to save memory
  private _hex?: string;
  // Remove HSL/HSV cache to save memory (40 bytes each)
  
  // Shared cache - reduced size
  private static cache = new ColorCache(50); // Further reduced to save memory
  // Object pool for reuse
  private static pool: Color[] = [];
  private static poolSize = 10; // Further reduced to save memory
  // RGB object pool for toRGB() reuse
  private static rgbPool: RGB[] = [];
  private static rgbPoolSize = 20;

  constructor(input: ColorInput = '#000000') {
    const parsed = parseColorInput(input);
    // Pack RGB into single integer
    this._value = (parsed.rgb.r << 16) | (parsed.rgb.g << 8) | parsed.rgb.b;
    this._alpha = parsed.alpha ?? 1;
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a Color from RGB values - Optimized with object pool
   */
  static fromRGB(r: number, g: number, b: number, a?: number): Color {
    // Clamp and pack RGB
    r = clamp(r | 0, 0, 255);
    g = clamp(g | 0, 0, 255);
    b = clamp(b | 0, 0, 255);
    
    // Try to reuse from pool
    let color = this.pool.pop();
    if (!color) {
      color = new Color();
    }
    
    color._value = (r << 16) | (g << 8) | b;
    color._alpha = a !== undefined ? clamp(a, 0, 1) : 1;
    color._hex = undefined;
    return color;
  }

  /**
   * Create a Color from HSL values
   */
  static fromHSL(h: number, s: number, l: number, a?: number): Color {
    const rgb = hslToRgb({ h, s, l });
    return Color.fromRGB(rgb.r, rgb.g, rgb.b, a);
  }

  /**
   * Create a Color from HSV values
   */
  static fromHSV(h: number, s: number, v: number, a?: number): Color {
    const rgb = hsvToRgb({ h, s, v });
    return Color.fromRGB(rgb.r, rgb.g, rgb.b, a);
  }

  /**
   * Create a random color
   */
  static random(): Color {
    return Color.fromRGB(
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256)
    );
  }

  // ============================================
  // Getters
  // ============================================

  get red(): number {
    return (this._value >> 16) & 0xFF;
  }

  get green(): number {
    return (this._value >> 8) & 0xFF;
  }

  get blue(): number {
    return this._value & 0xFF;
  }

  get alpha(): number {
    return this._alpha;
  }

  get hue(): number {
    return this.toHSL().h;
  }

  get saturation(): number {
    return this.toHSL().s;
  }

  get lightness(): number {
    return this.toHSL().l;
  }

  get brightness(): number {
    return this.toHSV().v;
  }

  // ============================================
  // Conversion Methods
  // ============================================

  /**
   * Convert to hex string - Cached and optimized
   */
  toHex(includeAlpha = false): string {
    if (!includeAlpha && this._hex) {
      return this._hex;
    }
    
    // Fast hex conversion using bit operations
    const hex = `#${  (`000000${  this._value.toString(16)}`).slice(-6).toUpperCase()}`;
    
    if (!includeAlpha) {
      this._hex = hex;
      return hex;
    }
    
    if (this._alpha < 1) {
      const alpha = (`0${  ((this._alpha * 255) | 0).toString(16)}`).slice(-2);
      return hex + alpha;
    }
    return hex;
  }

  /**
   * Convert to RGB object - Use object pool to reduce allocations
   */
  toRGB(): RGB {
    let rgb = Color.rgbPool.pop();
    if (!rgb) {
      rgb = {} as RGB;
    }
    rgb.r = (this._value >> 16) & 0xFF;
    rgb.g = (this._value >> 8) & 0xFF;
    rgb.b = this._value & 0xFF;
    if (this._alpha < 1) {
      rgb.a = this._alpha;
    } else {
      delete rgb.a;
    }
    return rgb;
  }
  
  /**
   * Return RGB object to pool
   */
  static returnRGB(rgb: RGB): void {
    if (Color.rgbPool.length < Color.rgbPoolSize) {
      Color.rgbPool.push(rgb);
    }
  }

  /**
   * Convert to RGB string - Direct from packed value
   */
  toRGBString(): string {
    const r = (this._value >> 16) & 0xFF;
    const g = (this._value >> 8) & 0xFF;
    const b = this._value & 0xFF;
    
    return this._alpha < 1 
      ? `rgba(${r}, ${g}, ${b}, ${this._alpha})`
      : `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Convert to HSL object - No caching to save memory
   */
  toHSL(): HSL {
    const rgb = this.toRGB();
    const hsl = rgbToHsl(rgb);
    Color.returnRGB(rgb); // Return RGB to pool
    if (this._alpha < 1) hsl.a = this._alpha;
    return hsl;
  }

  /**
   * Convert to HSL string
   */
  toHSLString(): string {
    const { h, s, l } = this.toHSL();
    if (this._alpha < 1) {
      return `hsla(${round(h)}, ${round(s)}%, ${round(l)}%, ${this._alpha})`;
    }
    return `hsl(${round(h)}, ${round(s)}%, ${round(l)}%)`;
  }

  /**
   * Convert to HSV object - No caching to save memory
   */
  toHSV(): HSV {
    const rgb = this.toRGB();
    const hsv = rgbToHsv(rgb);
    Color.returnRGB(rgb); // Return RGB to pool
    if (this._alpha < 1) hsv.a = this._alpha;
    return hsv;
  }

  /**
   * Convert to string based on format
   */
  toString(format: ColorFormat = 'hex'): string {
    switch (format) {
      case 'hex':
        return this.toHex();
      case 'rgb':
      case 'rgba':
        return this.toRGBString();
      case 'hsl':
      case 'hsla':
        return this.toHSLString();
      default:
        return this.toHex();
    }
  }

  // ============================================
  // Manipulation Methods
  // ============================================

  /**
   * Lighten the color
   */
  lighten(amount: number): Color {
    const hsl = this.toHSL();
    hsl.l = clamp(hsl.l + amount, 0, 100);
    return Color.fromHSL(hsl.h, hsl.s, hsl.l, this._alpha);
  }

  /**
   * Darken the color
   */
  darken(amount: number): Color {
    return this.lighten(-amount);
  }

  /**
   * Saturate the color
   */
  saturate(amount: number): Color {
    const hsl = this.toHSL();
    hsl.s = clamp(hsl.s + amount, 0, 100);
    return Color.fromHSL(hsl.h, hsl.s, hsl.l, this._alpha);
  }

  /**
   * Desaturate the color
   */
  desaturate(amount: number): Color {
    return this.saturate(-amount);
  }

  /**
   * Rotate the hue
   */
  rotate(degrees: number): Color {
    const hsl = this.toHSL();
    hsl.h = (hsl.h + degrees) % 360;
    if (hsl.h < 0) hsl.h += 360;
    return Color.fromHSL(hsl.h, hsl.s, hsl.l, this._alpha);
  }

  /**
   * Convert to grayscale
   */
  grayscale(): Color {
    return this.desaturate(100);
  }

  /**
   * Invert the color
   */
  invert(): Color {
    const r = 255 - ((this._value >> 16) & 0xFF);
    const g = 255 - ((this._value >> 8) & 0xFF);
    const b = 255 - (this._value & 0xFF);
    return Color.fromRGB(r, g, b, this._alpha);
  }

  /**
   * Return object to pool for reuse
   */
  release(): void {
    if (Color.pool.length < Color.poolSize) {
      // Clear cached values
      this._hex = undefined;
      Color.pool.push(this);
    }
  }


  /**
   * Cleanup static resources
   */
  static cleanup(): void {
    this.cache.clear();
    this.pool.length = 0;
    this.rgbPool.length = 0;
  }

  /**
   * Set alpha value
   */
  setAlpha(value: number): Color {
    const color = this.clone();
    color._alpha = clamp(value, 0, 1);
    return color;
  }

  /**
   * Fade the color (reduce alpha)
   */
  fade(amount: number): Color {
    return this.setAlpha(clamp(this._alpha - amount / 100, 0, 1));
  }

  // ============================================
  // Mixing & Blending
  // ============================================

  /**
   * Mix with another color - Optimized
   */
  mix(color: ColorInput, amount = 50): Color {
    const other = color instanceof Color ? color : new Color(color);
    const ratio = amount / 100;
    const invRatio = 1 - ratio;
    
    // Direct bit manipulation
    const r1 = (this._value >> 16) & 0xFF;
    const g1 = (this._value >> 8) & 0xFF;
    const b1 = this._value & 0xFF;
    
    const r2 = (other._value >> 16) & 0xFF;
    const g2 = (other._value >> 8) & 0xFF;
    const b2 = other._value & 0xFF;
    
    const r = (r1 * invRatio + r2 * ratio) | 0;
    const g = (g1 * invRatio + g2 * ratio) | 0;
    const b = (b1 * invRatio + b2 * ratio) | 0;
    const alpha = this._alpha * invRatio + other._alpha * ratio;
    
    return Color.fromRGB(r, g, b, alpha);
  }

  /**
   * Blend with another color using a blend mode
   */
  blend(color: ColorInput, mode: BlendMode = 'normal'): Color {
    const other = color instanceof Color ? color : new Color(color);
    const rgb = blend(this.toRGB(), other.toRGB(), mode);
    return Color.fromRGB(rgb.r, rgb.g, rgb.b, this._alpha);
  }

  // ============================================
  // Analysis Methods
  // ============================================

  /**
   * Get the luminance of the color
   */
  getLuminance(): number {
    return getLuminance(this.toRGB());
  }

  /**
   * Get contrast ratio with another color
   */
  contrast(color: ColorInput): number {
    const other = color instanceof Color ? color : new Color(color);
    return getContrast(this.toRGB(), other.toRGB());
  }

  /**
   * Check if the color is light
   */
  isLight(): boolean {
    return this.getLuminance() > 0.5;
  }

  /**
   * Check if the color is dark
   */
  isDark(): boolean {
    return !this.isLight();
  }

  /**
   * Check WCAG compliance with another color
   */
  isWCAGCompliant(
    background: ColorInput,
    level: WCAGLevel = 'AA',
    size: TextSize = 'normal'
  ): boolean {
    const bg = background instanceof Color ? background : new Color(background);
    return isWCAGCompliant(this.toRGB(), bg.toRGB(), level, size);
  }

  // ============================================
  // Harmony Methods
  // ============================================

  /**
   * Get complementary color
   */
  complementary(): Color {
    return this.rotate(180);
  }

  /**
   * Get analogous colors
   */
  analogous(angle = 30): [Color, Color] {
    return [this.rotate(-angle), this.rotate(angle)];
  }

  /**
   * Get triadic colors
   */
  triadic(): [Color, Color] {
    return [this.rotate(120), this.rotate(240)];
  }

  /**
   * Get tetradic colors
   */
  tetradic(): [Color, Color, Color] {
    return [this.rotate(90), this.rotate(180), this.rotate(270)];
  }

  /**
   * Get split complementary colors
   */
  splitComplementary(angle = 30): [Color, Color] {
    const complement = this.rotate(180);
    return [complement.rotate(-angle), complement.rotate(angle)];
  }

  /**
   * Generate a harmony based on type
   */
  harmony(type: HarmonyType): Color[] {
    switch (type) {
      case 'complementary':
        return [this, this.complementary()];
      case 'analogous':
        return [this, ...this.analogous()];
      case 'triadic':
        return [this, ...this.triadic()];
      case 'tetradic':
        return [this, ...this.tetradic()];
      case 'split-complementary':
        return [this, ...this.splitComplementary()];
      case 'monochromatic':
        return [
          this,
          this.lighten(15),
          this.lighten(30),
          this.darken(15),
          this.darken(30)
        ];
      default:
        return [this];
    }
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Clone the color - Optimized
   */
  clone(): Color {
    const color = Color.pool.pop() || new Color();
    color._value = this._value;
    color._alpha = this._alpha;
    // Don't copy cached values to save memory
    color._hex = undefined;
    return color;
  }
  
  /**
   * Return color to pool for reuse
   */
  dispose(): void {
    if (Color.pool.length < Color.poolSize) {
      this._hex = undefined;
      Color.pool.push(this);
    }
  }

  /**
   * Check equality with another color - Fast comparison
   */
  equals(color: ColorInput): boolean {
    const other = color instanceof Color ? color : new Color(color);
    return this._value === other._value && this._alpha === other._alpha;
  }

  /**
   * Get distance to another color - Optimized
   */
  distance(color: ColorInput): number {
    const other = color instanceof Color ? color : new Color(color);
    const dr = ((this._value >> 16) & 0xFF) - ((other._value >> 16) & 0xFF);
    const dg = ((this._value >> 8) & 0xFF) - ((other._value >> 8) & 0xFF);
    const db = (this._value & 0xFF) - (other._value & 0xFF);
    // Avoid sqrt for performance when possible
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  /**
   * Check if color is valid - Simple check
   */
  isValid(): boolean {
    return this._value >= 0 && this._value <= 0xFFFFFF &&
           this._alpha >= 0 && this._alpha <= 1;
  }

  /**
   * Export as JSON
   */
  toJSON(): object {
    return {
      rgb: this.toRGB(),
      hsl: this.toHSL(),
      hsv: this.toHSV(),
      hex: this.toHex(true),
      alpha: this._alpha,
      luminance: this.getLuminance()
    };
  }
}

// Export singleton instance for common colors - cached for reuse
const BLACK = new Color('#000000');
const WHITE = new Color('#FFFFFF');
const RED = new Color('#FF0000');
const GREEN = new Color('#00FF00');
const BLUE = new Color('#0000FF');
const YELLOW = new Color('#FFFF00');
const CYAN = new Color('#00FFFF');
const MAGENTA = new Color('#FF00FF');
const TRANSPARENT = new Color('rgba(0,0,0,0)');

export const Colors = {
  black: () => BLACK.clone(),
  white: () => WHITE.clone(),
  red: () => RED.clone(),
  green: () => GREEN.clone(),
  blue: () => BLUE.clone(),
  yellow: () => YELLOW.clone(),
  cyan: () => CYAN.clone(),
  magenta: () => MAGENTA.clone(),
  transparent: () => TRANSPARENT.clone()
};
