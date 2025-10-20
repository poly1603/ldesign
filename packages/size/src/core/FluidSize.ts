/**
 * @ldesign/size - Fluid Typography & Responsive Sizing
 * 
 * Advanced fluid sizing with clamp, calc, and viewport units
 */

import type { 
  DeviceType, 
  FluidSize, 
  ResponsiveSize,
  SizeUnit,
  SizeValue,
  Viewport
} from '../types';
import { formatSize, parseSizeInput } from '../utils';
import { getDeviceDetector } from './DeviceDetector';

/**
 * Fluid size calculator
 */
export class FluidSizeCalculator {
  private viewport: Viewport;
  private unsubscribe: (() => void) | null = null;
  private calculationCache = new Map<string, string>();
  private static readonly MAX_CACHE_SIZE = 500; // 进一步增加缓存大小
  private isDestroyed = false;
  private cacheHits = 0;
  private cacheMisses = 0;
  private lastViewport: Viewport | null = null;
  // 使用 Uint32Array 存储统计数据，减少内存
  private stats = new Uint32Array(4); // [hits, misses, cacheSize, calculations]
  // 预计算常用斜率值
  private slopeCache = new Map<string, number>();

  constructor() {
    this.viewport = getDeviceDetector().getViewport();
    this.lastViewport = { ...this.viewport };
    
    // Update viewport on changes with cleanup function
    this.unsubscribe = getDeviceDetector().onChange((viewport) => {
      if (!this.isDestroyed) {
        // 只在视口实际变化时清理缓存
        if (this.hasViewportChanged(viewport)) {
          this.viewport = viewport;
          this.lastViewport = { ...viewport };
          // 部分清理缓存而不是全部清理
          this.partialCacheClear();
        }
      }
    });
  }
  
  /**
   * Check if viewport has actually changed
   */
  private hasViewportChanged(viewport: Viewport): boolean {
    if (!this.lastViewport) return true;
    return viewport.width !== this.lastViewport.width ||
           viewport.height !== this.lastViewport.height ||
           viewport.device !== this.lastViewport.device;
  }
  
  /**
   * Partial cache clear - keep frequently used items
   */
  private partialCacheClear(): void {
    if (this.calculationCache.size > 50) {
      // 保留前50个最常用的缓存项
      const entries = Array.from(this.calculationCache.entries());
      this.calculationCache.clear();
      entries.slice(0, 50).forEach(([key, value]) => {
        this.calculationCache.set(key, value);
      });
    }
  }

  /**
   * Create a fluid size using CSS clamp
   */
  createFluidSize(config: FluidSize): string {
    // 优化的缓存键生成
    const cacheKey = this.generateCacheKey(config);
    
    // Check cache
    if (this.calculationCache.has(cacheKey)) {
      this.stats[0]++; // hits
      return this.calculationCache.get(cacheKey)!;
    }
    this.stats[1]++; // misses
    this.stats[3]++; // calculations
    
    const min = this.formatSizeValue(config.min);
    const max = this.formatSizeValue(config.max);
    
    // Calculate preferred value based on viewport
    const viewportMin = config.viewportMin || 320;
    const viewportMax = config.viewportMax || 1920;
    
    // Calculate slope for linear interpolation - 使用缓存
    const minValue = config.min.value;
    const maxValue = config.max.value;
    const slopeKey = `${minValue}:${maxValue}:${viewportMin}:${viewportMax}`;
    
    let slope = this.slopeCache.get(slopeKey);
    if (slope === undefined) {
      slope = (maxValue - minValue) / (viewportMax - viewportMin);
      // LRU 缓存管理
      if (this.slopeCache.size >= 100) {
        const firstKey = this.slopeCache.keys().next().value;
        if (firstKey) this.slopeCache.delete(firstKey);
      }
      this.slopeCache.set(slopeKey, slope);
    }
    
    // Create preferred value with calc
    const preferred = this.createFluidCalc(minValue, slope, viewportMin, config.preferredUnit || 'rem');
    
    let result: string;
    if (config.clamp !== false) {
      result = `clamp(${min}, ${preferred}, ${max})`;
    } else {
      result = preferred;
    }
    
    // Store in cache with LRU strategy
    this.addToCache(cacheKey, result);
    
    return result;
  }

  /**
   * Create fluid calc expression
   */
  private createFluidCalc(
    minValue: number,
    slope: number,
    viewportMin: number,
    unit: SizeUnit
  ): string {
    // Convert to rem if needed for better scalability
    const baseValue = unit === 'rem' ? minValue : minValue / 16;
    const viewportValue = slope * 100; // Convert to vw percentage
    const offset = -slope * viewportMin / 16; // Offset in rem
    
    return `calc(${baseValue + offset}rem + ${viewportValue.toFixed(4)}vw)`;
  }

  /**
   * Format size value
   */
  private formatSizeValue(size: SizeValue): string {
    return formatSize(size);
  }

  /**
   * Create responsive size with breakpoints
   */
  createResponsiveSize(config: ResponsiveSize): string {
    const device = getDeviceDetector().getDevice();
    
    // Select appropriate size based on device
    let selectedSize = config.base;
    
    switch (device) {
      case 'mobile':
        selectedSize = config.xs || config.sm || config.base;
        break;
      case 'tablet':
        selectedSize = config.md || config.base;
        break;
      case 'laptop':
        selectedSize = config.lg || config.base;
        break;
      case 'desktop':
        selectedSize = config.xl || config.base;
        break;
      case 'widescreen':
      case 'tv':
        selectedSize = config.xxl || config.xl || config.base;
        break;
    }
    
    // If fluid size is defined, use it
    if (config.fluid) {
      return this.createFluidSize(config.fluid);
    }
    
    const parsed = parseSizeInput(selectedSize);
    return formatSize(parsed);
  }

  /**
   * Generate modular scale
   */
  generateModularScale(
    base: number,
    ratio: number,
    steps: number,
    unit: SizeUnit = 'rem'
  ): string[] {
    const cacheKey = `scale-${base}-${ratio}-${steps}-${unit}`;
    
    // Check cache
    const cached = this.calculationCache.get(cacheKey);
    if (cached) {
      this.cacheHits++;
      return JSON.parse(cached);
    }
    this.cacheMisses++;
    
    const sizes: string[] = [];
    const powers = new Map<number, number>(); // 缓存幂运算结果
    
    for (let i = -steps; i <= steps; i++) {
      let value: number;
      if (powers.has(i)) {
        value = base * powers.get(i)!;
      } else {
        const power = ratio ** i;
        powers.set(i, power);
        value = base * power;
      }
      sizes.push(`${value.toFixed(3)}${unit}`);
    }
    
    // Cache result
    this.addToCache(cacheKey, JSON.stringify(sizes));
    
    return sizes;
  }

  /**
   * Create fluid modular scale
   */
  createFluidModularScale(
    baseMin: number,
    baseMax: number,
    ratio: number,
    steps: number
  ): string[] {
    const scales: string[] = [];
    
    for (let i = -steps; i <= steps; i++) {
      const minValue = baseMin * (ratio ** i);
      const maxValue = baseMax * (ratio ** i);
      
      const fluid = this.createFluidSize({
        min: { value: minValue, unit: 'rem' },
        max: { value: maxValue, unit: 'rem' },
        viewportMin: 320,
        viewportMax: 1920,
        clamp: true
      });
      
      scales.push(fluid);
    }
    
    return scales;
  }

  /**
   * Get optimal line height for font size
   */
  getOptimalLineHeight(fontSize: number, unit: SizeUnit = 'px'): number {
    // Based on typography best practices
    let lineHeight: number;
    
    if (unit === 'px') {
      if (fontSize < 12) lineHeight = 1.8;
      else if (fontSize < 16) lineHeight = 1.6;
      else if (fontSize < 20) lineHeight = 1.5;
      else if (fontSize < 32) lineHeight = 1.4;
      else if (fontSize < 48) lineHeight = 1.3;
      else lineHeight = 1.2;
    } else {
      // For relative units, use similar ratios
      if (fontSize < 0.75) lineHeight = 1.8;
      else if (fontSize < 1) lineHeight = 1.6;
      else if (fontSize < 1.25) lineHeight = 1.5;
      else if (fontSize < 2) lineHeight = 1.4;
      else if (fontSize < 3) lineHeight = 1.3;
      else lineHeight = 1.2;
    }
    
    return lineHeight;
  }

  /**
   * Calculate responsive spacing
   */
  calculateResponsiveSpacing(
    base: number,
    device: DeviceType,
    context: 'padding' | 'margin' | 'gap'
  ): string {
    let multiplier = 1;
    
    // Adjust based on device
    switch (device) {
      case 'mobile':
        multiplier = context === 'padding' ? 0.75 : 0.5;
        break;
      case 'tablet':
        multiplier = context === 'padding' ? 0.875 : 0.75;
        break;
      case 'laptop':
      case 'desktop':
        multiplier = 1;
        break;
      case 'widescreen':
      case 'tv':
        multiplier = context === 'padding' ? 1.25 : 1.5;
        break;
    }
    
    const value = base * multiplier;
    
    // Use rem for better scalability
    return `${(value / 16).toFixed(3)}rem`;
  }
  
  /**
   * Generate optimized cache key
   */
  private generateCacheKey(config: FluidSize): string {
    // 使用更高效的字符串拼接
    return [
      config.min.value,
      config.min.unit,
      config.max.value,
      config.max.unit,
      config.viewportMin || 320,
      config.viewportMax || 1920,
      config.clamp !== false ? 1 : 0
    ].join('|');
  }
  
  /**
   * Add to cache with LRU management
   */
  private addToCache(key: string, value: string): void {
    // 删除旧值（如果存在）以便移到末尾
    this.calculationCache.delete(key);
    
    // 检查缓存大小限制
    if (this.calculationCache.size >= FluidSizeCalculator.MAX_CACHE_SIZE) {
      const firstKey = this.calculationCache.keys().next().value;
      if (firstKey) {
        this.calculationCache.delete(firstKey);
      }
    }
    
    this.calculationCache.set(key, value);
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.calculationCache.size,
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    };
  }
  
  /**
   * Destroy and clean up resources
   */
  destroy(): void {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // Unsubscribe from viewport changes
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    
    // Clear cache
    this.calculationCache.clear();
    this.lastViewport = null;
  }
}

/**
 * Fluid typography presets
 */
export const fluidTypographyPresets = {
  // Heading scales
  h1: {
    min: { value: 2, unit: 'rem' as SizeUnit },
    max: { value: 4, unit: 'rem' as SizeUnit },
    viewportMin: 320,
    viewportMax: 1920
  },
  h2: {
    min: { value: 1.75, unit: 'rem' as SizeUnit },
    max: { value: 3, unit: 'rem' as SizeUnit },
    viewportMin: 320,
    viewportMax: 1920
  },
  h3: {
    min: { value: 1.5, unit: 'rem' as SizeUnit },
    max: { value: 2.25, unit: 'rem' as SizeUnit },
    viewportMin: 320,
    viewportMax: 1920
  },
  h4: {
    min: { value: 1.25, unit: 'rem' as SizeUnit },
    max: { value: 1.75, unit: 'rem' as SizeUnit },
    viewportMin: 320,
    viewportMax: 1920
  },
  h5: {
    min: { value: 1.125, unit: 'rem' as SizeUnit },
    max: { value: 1.5, unit: 'rem' as SizeUnit },
    viewportMin: 320,
    viewportMax: 1920
  },
  h6: {
    min: { value: 1, unit: 'rem' as SizeUnit },
    max: { value: 1.25, unit: 'rem' as SizeUnit },
    viewportMin: 320,
    viewportMax: 1920
  },
  
  // Body text scales
  body: {
    min: { value: 1, unit: 'rem' as SizeUnit },
    max: { value: 1.125, unit: 'rem' as SizeUnit },
    viewportMin: 320,
    viewportMax: 1920
  },
  small: {
    min: { value: 0.875, unit: 'rem' as SizeUnit },
    max: { value: 1, unit: 'rem' as SizeUnit },
    viewportMin: 320,
    viewportMax: 1920
  },
  tiny: {
    min: { value: 0.75, unit: 'rem' as SizeUnit },
    max: { value: 0.875, unit: 'rem' as SizeUnit },
    viewportMin: 320,
    viewportMax: 1920
  }
};

/**
 * Modular scale ratios
 */
export const modularScaleRatios = {
  minorSecond: 1.067,    // 15:16
  majorSecond: 1.125,    // 8:9
  minorThird: 1.2,       // 5:6
  majorThird: 1.25,      // 4:5
  perfectFourth: 1.333,  // 3:4
  augmentedFourth: 1.414, // √2
  perfectFifth: 1.5,     // 2:3
  goldenRatio: 1.618,    // φ
  majorSixth: 1.667,     // 3:5
  minorSeventh: 1.778,   // 9:16
  majorSeventh: 1.875,   // 8:15
  octave: 2,             // 1:2
  majorTenth: 2.5,       // 2:5
  majorEleventh: 2.667,  // 3:8
  majorTwelfth: 3,       // 1:3
  doubleOctave: 4        // 1:4
};

// Singleton instance
let calculator: FluidSizeCalculator | null = null;

/**
 * Get fluid size calculator instance
 */
export function getFluidSizeCalculator(): FluidSizeCalculator {
  if (!calculator) {
    calculator = new FluidSizeCalculator();
  }
  return calculator;
}

/**
 * Quick access helpers
 */
export const fluid = {
  /**
   * Create fluid size
   */
  size: (min: number, max: number, unit: SizeUnit = 'rem') => {
    return getFluidSizeCalculator().createFluidSize({
      min: { value: min, unit },
      max: { value: max, unit },
      clamp: true
    });
  },
  
  /**
   * Create fluid typography
   */
  text: (preset: keyof typeof fluidTypographyPresets) => {
    const config = fluidTypographyPresets[preset];
    return getFluidSizeCalculator().createFluidSize(config);
  },
  
  /**
   * Create modular scale
   */
  scale: (base: number, ratio: keyof typeof modularScaleRatios | number, steps = 5) => {
    const r = typeof ratio === 'number' ? ratio : modularScaleRatios[ratio];
    return getFluidSizeCalculator().generateModularScale(base, r, steps);
  },
  
  /**
   * Create fluid modular scale
   */
  fluidScale: (baseMin: number, baseMax: number, ratio: keyof typeof modularScaleRatios | number, steps = 5) => {
    const r = typeof ratio === 'number' ? ratio : modularScaleRatios[ratio];
    return getFluidSizeCalculator().createFluidModularScale(baseMin, baseMax, r, steps);
  },
  
  /**
   * Get optimal line height
   */
  lineHeight: (fontSize: number, unit: SizeUnit = 'px') => {
    return getFluidSizeCalculator().getOptimalLineHeight(fontSize, unit);
  }
};