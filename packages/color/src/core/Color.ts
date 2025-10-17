/**
 * @ldesign/color - Core Color Class
 * 
 * The main Color class for basic color operations
 */

import type { RGB, HSL, HSV, ColorInput, ColorFormat, BlendMode, HarmonyType, WCAGLevel, TextSize } from '../types';
import { rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb, rgbToHex } from './conversions';
import { getLuminance, getContrast, isWCAGCompliant } from './analysis';
import { mix, blend } from './manipulations';
import { parseColorInput, validateRGB } from '../utils/validators';
import { clamp, round } from '../utils/math';
import { ColorCache } from '../utils/cache';

/**
 * Core Color class for color manipulation and conversion
 */
export class Color {
  private _rgb: RGB;
  private _alpha: number;
  private static cache = new ColorCache(1000);

  constructor(input: ColorInput = '#000000') {
    try {
      const parsed = parseColorInput(input);
      this._rgb = parsed.rgb;
      this._alpha = parsed.alpha ?? 1;
    } catch (error) {
      // 错误处理：使用默认黑色
      console.warn(`Invalid color input: ${input}. Defaulting to black.`, error);
      this._rgb = { r: 0, g: 0, b: 0 };
      this._alpha = 1;
    }
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a Color from RGB values
   */
  static fromRGB(r: number, g: number, b: number, a?: number): Color {
    // 输入验证和范围修正
    if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
      throw new TypeError('RGB values must be finite numbers');
    }
    
    const color = new Color();
    color._rgb = { 
      r: clamp(Math.round(r), 0, 255), 
      g: clamp(Math.round(g), 0, 255), 
      b: clamp(Math.round(b), 0, 255) 
    };
    color._alpha = a !== undefined ? clamp(a, 0, 1) : 1;
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
    return this._rgb.r;
  }

  get green(): number {
    return this._rgb.g;
  }

  get blue(): number {
    return this._rgb.b;
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
   * Convert to hex string
   */
  toHex(includeAlpha = false): string {
    const hex = rgbToHex(this._rgb);
    if (includeAlpha && this._alpha < 1) {
      const alpha = Math.round(this._alpha * 255).toString(16).padStart(2, '0');
      return hex + alpha;
    }
    return hex;
  }

  /**
   * Convert to RGB object
   */
  toRGB(): RGB {
    return { ...this._rgb, a: this._alpha < 1 ? this._alpha : undefined };
  }

  /**
   * Convert to RGB string
   */
  toRGBString(): string {
    const { r, g, b } = this._rgb;
    if (this._alpha < 1) {
      return `rgba(${r}, ${g}, ${b}, ${this._alpha})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Convert to HSL object
   */
  toHSL(): HSL {
    const cacheKey = `hsl-${this.toHex()}`;
    const cached = Color.cache.get(cacheKey);
    if (cached) return cached as HSL;

    const hsl = rgbToHsl(this._rgb);
    if (this._alpha < 1) hsl.a = this._alpha;
    
    Color.cache.set(cacheKey, hsl);
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
   * Convert to HSV object
   */
  toHSV(): HSV {
    const cacheKey = `hsv-${this.toHex()}`;
    const cached = Color.cache.get(cacheKey);
    if (cached) return cached as HSV;

    const hsv = rgbToHsv(this._rgb);
    if (this._alpha < 1) hsv.a = this._alpha;
    
    Color.cache.set(cacheKey, hsv);
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
    return Color.fromRGB(
      255 - this._rgb.r,
      255 - this._rgb.g,
      255 - this._rgb.b,
      this._alpha
    );
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
   * Mix with another color
   */
  mix(color: ColorInput, amount = 50): Color {
    const other = new Color(color);
    const rgb = mix(this._rgb, other._rgb, amount / 100);
    const alpha = this._alpha + (other._alpha - this._alpha) * (amount / 100);
    return Color.fromRGB(rgb.r, rgb.g, rgb.b, alpha);
  }

  /**
   * Blend with another color using a blend mode
   */
  blend(color: ColorInput, mode: BlendMode = 'normal'): Color {
    const other = new Color(color);
    const rgb = blend(this._rgb, other._rgb, mode);
    return Color.fromRGB(rgb.r, rgb.g, rgb.b, this._alpha);
  }

  // ============================================
  // Analysis Methods
  // ============================================

  /**
   * Get the luminance of the color
   */
  getLuminance(): number {
    return getLuminance(this._rgb);
  }

  /**
   * Get contrast ratio with another color
   */
  contrast(color: ColorInput): number {
    const other = new Color(color);
    return getContrast(this._rgb, other._rgb);
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
    const bg = new Color(background);
    return isWCAGCompliant(this._rgb, bg._rgb, level, size);
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
   * Clone the color
   */
  clone(): Color {
    return Color.fromRGB(this._rgb.r, this._rgb.g, this._rgb.b, this._alpha);
  }

  /**
   * Check equality with another color
   */
  equals(color: ColorInput): boolean {
    const other = new Color(color);
    return (
      this._rgb.r === other._rgb.r &&
      this._rgb.g === other._rgb.g &&
      this._rgb.b === other._rgb.b &&
      this._alpha === other._alpha
    );
  }

  /**
   * Get distance to another color in RGB space
   */
  distance(color: ColorInput): number {
    const other = new Color(color);
    const dr = this._rgb.r - other._rgb.r;
    const dg = this._rgb.g - other._rgb.g;
    const db = this._rgb.b - other._rgb.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  /**
   * Check if color is valid
   */
  isValid(): boolean {
    return (
      validateRGB(this._rgb) &&
      this._alpha >= 0 &&
      this._alpha <= 1
    );
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

// Export singleton instance for common colors
export const Colors = {
  black: () => new Color('#000000'),
  white: () => new Color('#FFFFFF'),
  red: () => new Color('#FF0000'),
  green: () => new Color('#00FF00'),
  blue: () => new Color('#0000FF'),
  yellow: () => new Color('#FFFF00'),
  cyan: () => new Color('#00FFFF'),
  magenta: () => new Color('#FF00FF'),
  transparent: () => new Color('rgba(0,0,0,0)')
};