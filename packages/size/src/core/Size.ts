/**
 * @ldesign/size - Core Size Class
 * 
 * The main Size class for size operations
 */

import type { 
  SizeInput, 
  SizeValue, 
  SizeUnit, 
  ScaleFactor,
  SizeCalculationOptions 
} from '../types';
import {
  parseSizeInput,
  formatSize,
  convertSize,
  scaleSize,
  addSizes,
  subtractSizes,
  clampSize,
  roundSize
} from '../utils';

/**
 * Core Size class for size manipulation and conversion
 */
export class Size {
  private _value: SizeValue;
  private _rootFontSize: number;

  constructor(input: SizeInput = 0, rootFontSize = 16) {
    this._value = parseSizeInput(input);
    this._rootFontSize = rootFontSize;
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a Size from pixels
   */
  static fromPixels(value: number): Size {
    return new Size({ value, unit: 'px' });
  }

  /**
   * Create a Size from rem
   */
  static fromRem(value: number, rootFontSize = 16): Size {
    return new Size({ value, unit: 'rem' }, rootFontSize);
  }

  /**
   * Create a Size from em
   */
  static fromEm(value: number, rootFontSize = 16): Size {
    return new Size({ value, unit: 'em' }, rootFontSize);
  }

  /**
   * Create a Size from viewport width percentage
   */
  static fromViewportWidth(value: number): Size {
    return new Size({ value, unit: 'vw' });
  }

  /**
   * Create a Size from viewport height percentage
   */
  static fromViewportHeight(value: number): Size {
    return new Size({ value, unit: 'vh' });
  }

  /**
   * Create a Size from percentage
   */
  static fromPercentage(value: number): Size {
    return new Size({ value, unit: '%' });
  }

  /**
   * Parse a string to Size
   */
  static parse(input: string, rootFontSize = 16): Size {
    return new Size(input, rootFontSize);
  }

  // ============================================
  // Getters
  // ============================================

  get value(): number {
    return this._value.value;
  }

  get unit(): SizeUnit {
    return this._value.unit;
  }

  get pixels(): number {
    return this.toPixels().value;
  }

  get rem(): number {
    return this.toRem().value;
  }

  get em(): number {
    return this.toEm().value;
  }

  // ============================================
  // Conversion Methods
  // ============================================

  /**
   * Convert to pixels
   */
  toPixels(): SizeValue {
    return convertSize(this._value, 'px', this._rootFontSize);
  }

  /**
   * Convert to rem
   */
  toRem(): SizeValue {
    return convertSize(this._value, 'rem', this._rootFontSize);
  }

  /**
   * Convert to em
   */
  toEm(): SizeValue {
    return convertSize(this._value, 'em', this._rootFontSize);
  }

  /**
   * Convert to viewport width
   */
  toViewportWidth(): SizeValue {
    return convertSize(this._value, 'vw', this._rootFontSize);
  }

  /**
   * Convert to viewport height
   */
  toViewportHeight(): SizeValue {
    return convertSize(this._value, 'vh', this._rootFontSize);
  }

  /**
   * Convert to percentage
   */
  toPercentage(): SizeValue {
    return convertSize(this._value, '%', this._rootFontSize);
  }

  /**
   * Convert to specific unit
   */
  to(unit: SizeUnit): SizeValue {
    return convertSize(this._value, unit, this._rootFontSize);
  }

  /**
   * Convert to string
   */
  toString(): string {
    return formatSize(this._value);
  }

  /**
   * Convert to CSS value string
   */
  toCss(): string {
    return formatSize(this._value);
  }

  /**
   * Get numeric value in specific unit
   */
  valueOf(unit?: SizeUnit): number {
    if (!unit || unit === this._value.unit) {
      return this._value.value;
    }
    return this.to(unit).value;
  }

  // ============================================
  // Manipulation Methods
  // ============================================

  /**
   * Scale the size by a factor
   */
  scale(factor: ScaleFactor): Size {
    const scaled = scaleSize(this._value, factor);
    return new Size(scaled, this._rootFontSize);
  }

  /**
   * Increase size by a percentage
   */
  increase(percentage: number): Size {
    return this.scale(1 + percentage / 100);
  }

  /**
   * Decrease size by a percentage
   */
  decrease(percentage: number): Size {
    return this.scale(1 - percentage / 100);
  }

  /**
   * Add another size
   */
  add(other: SizeInput): Size {
    const otherSize = new Size(other, this._rootFontSize);
    const result = addSizes(this._value, otherSize._value, this._rootFontSize);
    return new Size(result, this._rootFontSize);
  }

  /**
   * Subtract another size
   */
  subtract(other: SizeInput): Size {
    const otherSize = new Size(other, this._rootFontSize);
    const result = subtractSizes(this._value, otherSize._value, this._rootFontSize);
    return new Size(result, this._rootFontSize);
  }

  /**
   * Multiply by a number
   */
  multiply(factor: number): Size {
    return this.scale(factor);
  }

  /**
   * Divide by a number
   */
  divide(divisor: number): Size {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero');
    }
    return this.scale(1 / divisor);
  }

  /**
   * Get the negative of the size
   */
  negate(): Size {
    return this.scale(-1);
  }

  /**
   * Get the absolute value
   */
  abs(): Size {
    if (this._value.value < 0) {
      return this.negate();
    }
    return this.clone();
  }

  /**
   * Round to specified precision
   */
  round(precision = 2): Size {
    const rounded = roundSize(this._value, precision);
    return new Size(rounded, this._rootFontSize);
  }

  /**
   * Clamp between min and max
   */
  clamp(min?: SizeInput, max?: SizeInput): Size {
    const clamped = clampSize(this._value, min, max, this._rootFontSize);
    return new Size(clamped, this._rootFontSize);
  }

  // ============================================
  // Comparison Methods
  // ============================================

  /**
   * Check if equal to another size
   */
  equals(other: SizeInput): boolean {
    const otherSize = new Size(other, this._rootFontSize);
    const thisPx = this.toPixels();
    const otherPx = otherSize.toPixels();
    return Math.abs(thisPx.value - otherPx.value) < 0.001;
  }

  /**
   * Check if greater than another size
   */
  greaterThan(other: SizeInput): boolean {
    const otherSize = new Size(other, this._rootFontSize);
    return this.pixels > otherSize.pixels;
  }

  /**
   * Check if greater than or equal to another size
   */
  greaterThanOrEqual(other: SizeInput): boolean {
    return this.greaterThan(other) || this.equals(other);
  }

  /**
   * Check if less than another size
   */
  lessThan(other: SizeInput): boolean {
    const otherSize = new Size(other, this._rootFontSize);
    return this.pixels < otherSize.pixels;
  }

  /**
   * Check if less than or equal to another size
   */
  lessThanOrEqual(other: SizeInput): boolean {
    return this.lessThan(other) || this.equals(other);
  }

  /**
   * Get the minimum of this and another size
   */
  min(other: SizeInput): Size {
    const otherSize = new Size(other, this._rootFontSize);
    return this.lessThan(otherSize) ? this.clone() : otherSize.clone();
  }

  /**
   * Get the maximum of this and another size
   */
  max(other: SizeInput): Size {
    const otherSize = new Size(other, this._rootFontSize);
    return this.greaterThan(otherSize) ? this.clone() : otherSize.clone();
  }

  // ============================================
  // Calculation Methods
  // ============================================

  /**
   * Calculate with options
   */
  calculate(options: SizeCalculationOptions): Size {
    let result = this.clone();

    // Apply precision
    if (options.precision !== undefined) {
      result = result.round(options.precision);
    }

    // Apply unit conversion
    if (options.unit) {
      const converted = result.to(options.unit);
      result = new Size(converted, this._rootFontSize);
    }

    // Apply clamping
    if (options.clamp) {
      result = result.clamp(options.clamp.min, options.clamp.max);
    }

    return result;
  }

  /**
   * Interpolate between this and another size
   */
  interpolate(to: SizeInput, factor: number): Size {
    const toSize = new Size(to, this._rootFontSize);
    const fromPx = this.toPixels().value;
    const toPx = toSize.toPixels().value;
    const interpolated = fromPx + (toPx - fromPx) * factor;
    
    return new Size({ value: interpolated, unit: 'px' }, this._rootFontSize)
      .calculate({ unit: this._value.unit });
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Clone the size
   */
  clone(): Size {
    return new Size(this._value, this._rootFontSize);
  }

  /**
   * Check if size is zero
   */
  isZero(): boolean {
    return Math.abs(this._value.value) < 0.001;
  }

  /**
   * Check if size is positive
   */
  isPositive(): boolean {
    return this._value.value > 0;
  }

  /**
   * Check if size is negative
   */
  isNegative(): boolean {
    return this._value.value < 0;
  }

  /**
   * Check if size is valid
   */
  isValid(): boolean {
    return (
      !isNaN(this._value.value) &&
      isFinite(this._value.value)
    );
  }

  /**
   * Export as JSON
   */
  toJSON(): object {
    return {
      value: this._value.value,
      unit: this._value.unit,
      pixels: this.pixels,
      rem: this.rem,
      string: this.toString()
    };
  }

  /**
   * Create CSS calc expression
   */
  static calc(expression: string): string {
    return `calc(${expression})`;
  }

  /**
   * Create CSS min expression
   */
  static cssMin(...sizes: SizeInput[]): string {
    const values = sizes.map(s => new Size(s).toString());
    return `min(${values.join(', ')})`;
  }

  /**
   * Create CSS max expression
   */
  static cssMax(...sizes: SizeInput[]): string {
    const values = sizes.map(s => new Size(s).toString());
    return `max(${values.join(', ')})`;
  }

  /**
   * Create CSS clamp expression
   */
  static cssClamp(min: SizeInput, preferred: SizeInput, max: SizeInput): string {
    const minStr = new Size(min).toString();
    const prefStr = new Size(preferred).toString();
    const maxStr = new Size(max).toString();
    return `clamp(${minStr}, ${prefStr}, ${maxStr})`;
  }
}

// Export convenience functions
export const size = (input: SizeInput, rootFontSize = 16) => new Size(input, rootFontSize);
export const px = (value: number) => Size.fromPixels(value);
export const rem = (value: number, rootFontSize = 16) => Size.fromRem(value, rootFontSize);
export const em = (value: number, rootFontSize = 16) => Size.fromEm(value, rootFontSize);
export const vw = (value: number) => Size.fromViewportWidth(value);
export const vh = (value: number) => Size.fromViewportHeight(value);
export const percent = (value: number) => Size.fromPercentage(value);