/**
 * @ldesign/size - Core Size Class
 * 
 * The main Size class for size operations
 */

import type { 
  ScaleFactor, 
  SizeCalculationOptions, 
  SizeInput, 
  SizeUnit,
  SizeValue 
} from '../types';
import {
  addSizes,
  clampSize,
  convertSize,
  formatSize,
  parseSizeInput,
  roundSize,
  scaleSize,
  subtractSizes
} from '../utils';

/**
 * Size对象池，减少频繁创建对象的开销
 */
// 使用全局常量减少重复字符串分配
const UNIT_PX = 'px' as const;
const UNIT_REM = 'rem' as const;
const UNIT_EM = 'em' as const;
const UNIT_VW = 'vw' as const;
const UNIT_VH = 'vh' as const;
const UNIT_PERCENT = '%' as const;

// 预定义常用值，避免重复创建
const ZERO_PX: SizeValue = Object.freeze({ value: 0, unit: UNIT_PX });
const ONE_PX: SizeValue = Object.freeze({ value: 1, unit: UNIT_PX });
const DEFAULT_FONT_SIZE = 16;

// 使用位标记减少布尔值内存占用
const FLAG_POOLED = 1 << 0;
const FLAG_PIXELS_CACHED = 1 << 1;
const FLAG_REM_CACHED = 1 << 2;

// 常用值缓存（避免频繁创建相同值的对象）
const COMMON_VALUES_CACHE = new Map<string, any>();

class SizePool {
  private static instance: SizePool;
  private pool: Size[] = [];
  private maxSize = 200; // 增加池大小以减少创建开销
  private hits = 0;
  private misses = 0;
  private created = 0;
  // 使用Uint8Array存储统计数据，更省内存
  private stats: Uint32Array = new Uint32Array(5); // [hits, misses, created, poolSize, hitRate*1000]
  private lastCleanup = Date.now();
  private readonly CLEANUP_INTERVAL = 60000; // 每分钟清理一次

  static getInstance(): SizePool {
    if (!SizePool.instance) {
      SizePool.instance = new SizePool();
    }
    return SizePool.instance;
  }

  private cleanup(): void {
    const now = Date.now();
    if (now - this.lastCleanup > this.CLEANUP_INTERVAL) {
      // 只保留一半的对象
      const keepSize = Math.floor(this.maxSize / 2);
      if (this.pool.length > keepSize) {
        this.pool.length = keepSize;
      }
      this.lastCleanup = now;
    }
  }

  acquire(input: SizeInput, rootFontSize = 16): Size {
    // 定期清理池
    this.cleanup();
    
    // 优先从池中获取
    if (this.pool.length > 0) {
      this.hits++;
      const size = this.pool.pop()!;
      size.reset(input, rootFontSize);
      return size;
    }
    // 池为空时创建新对象
    this.misses++;
    this.created++;
    const size = new Size(input, rootFontSize);
    size._isPooled = true;
    return size;
  }

  release(size: Size): void {
    // 清理对象状态
    if ((size as any)._isPooled && this.pool.length < this.maxSize) {
      // 使用预定义的零值对象，避免创建新对象
      (size as any)._value = ZERO_PX;
      (size as any)._rootFontSize = DEFAULT_FONT_SIZE;
      (size as any)._flags = FLAG_POOLED; // 重置标记
      (size as any)._cachedPixels = undefined;
      (size as any)._cachedRem = undefined;
      this.pool.push(size);
    }
  }

  clear(): void {
    this.pool.length = 0; // 更快的清空方式
  }

  getStats() {
    // 直接返回计算值，避免创建新对象
    const total = this.hits + this.misses;
    return {
      poolSize: this.pool.length,
      hits: this.hits,
      misses: this.misses,
      created: this.created,
      hitRate: total ? this.hits / total : 0
    };
  }
}

/**
 * Core Size class for size manipulation and conversion
 */
export class Size {
  private _value: SizeValue;
  private _rootFontSize: number;
  private _flags: number = 0; // 使用位标记替代多个布尔值
  private _cachedPixels?: number; // 缓存像素值
  private _cachedRem?: number; // 缓存rem值
  
  // 使用getter/setter访问标记
  get _isPooled(): boolean {
    return (this._flags & FLAG_POOLED) !== 0;
  }
  
  set _isPooled(value: boolean) {
    if (value) {
      this._flags |= FLAG_POOLED;
    } else {
      this._flags &= ~FLAG_POOLED;
    }
  }

  constructor(input: SizeInput = 0, rootFontSize = DEFAULT_FONT_SIZE) {
    this._value = parseSizeInput(input);
    this._rootFontSize = rootFontSize;
  }

  /**
   * 重置对象状态（供对象池使用）
   */
  reset(input: SizeInput = 0, rootFontSize = DEFAULT_FONT_SIZE): void {
    this._value = parseSizeInput(input);
    this._rootFontSize = rootFontSize;
    // 使用位操作设置标记
    this._flags = FLAG_POOLED; // 重置所有标记，只设置POOLED
    // 清除缓存
    this._cachedPixels = undefined;
    this._cachedRem = undefined;
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a Size from pixels
   */
  static fromPixels(value: number): Size {
    // 对常用值使用缓存
    if (value === 0) return new Size(ZERO_PX);
    if (value === 1) return new Size(ONE_PX);
    
    // 检查常用值缓存
    const cacheKey = `${value}:px:${DEFAULT_FONT_SIZE}`;
    const cached = COMMON_VALUES_CACHE.get(cacheKey);
    if (cached) return cached.clone();
    
    return new Size({ value, unit: UNIT_PX });
  }

  /**
   * Create a Size from rem
   */
  static fromRem(value: number, rootFontSize = DEFAULT_FONT_SIZE): Size {
    return new Size({ value, unit: UNIT_REM }, rootFontSize);
  }

  /**
   * Create a Size from em
   */
  static fromEm(value: number, rootFontSize = DEFAULT_FONT_SIZE): Size {
    return new Size({ value, unit: UNIT_EM }, rootFontSize);
  }

  /**
   * Create a Size from viewport width percentage
   */
  static fromViewportWidth(value: number): Size {
    return new Size({ value, unit: UNIT_VW });
  }

  /**
   * Create a Size from viewport height percentage
   */
  static fromViewportHeight(value: number): Size {
    return new Size({ value, unit: UNIT_VH });
  }

  /**
   * Create a Size from percentage
   */
  static fromPercentage(value: number): Size {
    return new Size({ value, unit: UNIT_PERCENT });
  }

  /**
   * Parse a string to Size
   */
  static parse(input: string, rootFontSize = DEFAULT_FONT_SIZE): Size {
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
    // 使用位标记检查缓存
    if (!(this._flags & FLAG_PIXELS_CACHED)) {
      this._cachedPixels = this.toPixels().value;
      this._flags |= FLAG_PIXELS_CACHED;
    }
    return this._cachedPixels!;
  }

  get rem(): number {
    // 使用位标记检查缓存
    if (!(this._flags & FLAG_REM_CACHED)) {
      this._cachedRem = this.toRem().value;
      this._flags |= FLAG_REM_CACHED;
    }
    return this._cachedRem!;
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
    // 使用池化对象减少内存分配
    const otherSize = this._isPooled 
      ? SizePool.getInstance().acquire(other, this._rootFontSize)
      : new Size(other, this._rootFontSize);
    const result = addSizes(this._value, otherSize._value, this._rootFontSize);
    if (this._isPooled) {
      otherSize.dispose();
    }
    return this._isPooled
      ? SizePool.getInstance().acquire(result, this._rootFontSize)
      : new Size(result, this._rootFontSize);
  }

  /**
   * Subtract another size
   */
  subtract(other: SizeInput): Size {
    // 使用池化对象减少内存分配
    const otherSize = this._isPooled
      ? SizePool.getInstance().acquire(other, this._rootFontSize)
      : new Size(other, this._rootFontSize);
    const result = subtractSizes(this._value, otherSize._value, this._rootFontSize);
    if (this._isPooled) {
      otherSize.dispose();
    }
    return this._isPooled
      ? SizePool.getInstance().acquire(result, this._rootFontSize)
      : new Size(result, this._rootFontSize);
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
    // 快速路径：如果是相同的对象类型且值相等
    if (typeof other === 'object' && 'value' in other && 'unit' in other) {
      if (other.unit === this._value.unit && Math.abs(other.value - this._value.value) < 0.001) {
        return true;
      }
    }
    
    // 使用池化对象减少内存分配
    const otherSize = SizePool.getInstance().acquire(other, this._rootFontSize);
    const result = Math.abs(this.pixels - otherSize.pixels) < 0.001;
    otherSize.dispose();
    return result;
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
    // 如果来自对象池，使用池创建克隆
    if (this._isPooled) {
      return SizePool.getInstance().acquire(this._value, this._rootFontSize);
    }
    return new Size(this._value, this._rootFontSize);
  }

  /**
   * 释放对象回池（手动管理）
   */
  dispose(): void {
    if (this._isPooled) {
      SizePool.getInstance().release(this);
    }
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
      !Number.isNaN(this._value.value) &&
      Number.isFinite(this._value.value)
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

// 初始化常用值缓存
if (COMMON_VALUES_CACHE.size === 0) {
  for (let i = 0; i <= 100; i += 4) {
    const key = `${i}:px:${DEFAULT_FONT_SIZE}`;
    const size = new Size(i, DEFAULT_FONT_SIZE);
    COMMON_VALUES_CACHE.set(key, size);
  }
}

// Export convenience functions - 使用对象池优化
const sizeCache = new Map<string, Size>();
const MAX_CACHE_SIZE = 50;

export const size = (input: SizeInput, rootFontSize = 16) => {
  // 对于常用值使用缓存
  if (typeof input === 'number') {
    const cacheKey = `${input}:${rootFontSize}`;
    if (sizeCache.has(cacheKey)) {
      return sizeCache.get(cacheKey)!.clone();
    }
    
    // 对于小数值使用对象池
    if (input >= 0 && input <= 100) {
      const newSize = SizePool.getInstance().acquire(input, rootFontSize);
      
      // LRU缓存管理
      if (sizeCache.size >= MAX_CACHE_SIZE) {
        const firstKey = sizeCache.keys().next().value;
        if (firstKey) sizeCache.delete(firstKey);
      }
      sizeCache.set(cacheKey, newSize);
      return newSize;
    }
  }
  return new Size(input, rootFontSize);
};
export const px = (value: number) => Size.fromPixels(value);
export const rem = (value: number, rootFontSize = 16) => Size.fromRem(value, rootFontSize);
export const em = (value: number, rootFontSize = 16) => Size.fromEm(value, rootFontSize);
export const vw = (value: number) => Size.fromViewportWidth(value);
export const vh = (value: number) => Size.fromViewportHeight(value);
export const percent = (value: number) => Size.fromPercentage(value);
