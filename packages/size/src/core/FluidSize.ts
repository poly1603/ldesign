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

  constructor() {
    this.viewport = getDeviceDetector().getViewport();
    
    // Update viewport on changes
    getDeviceDetector().onChange((viewport) => {
      this.viewport = viewport;
    });
  }

  /**
   * Create a fluid size using CSS clamp
   */
  createFluidSize(config: FluidSize): string {
    const min = this.formatSizeValue(config.min);
    const max = this.formatSizeValue(config.max);
    
    // Calculate preferred value based on viewport
    const viewportMin = config.viewportMin || 320;
    const viewportMax = config.viewportMax || 1920;
    
    // Calculate slope for linear interpolation
    const minValue = config.min.value;
    const maxValue = config.max.value;
    const slope = (maxValue - minValue) / (viewportMax - viewportMin);
    
    // Create preferred value with calc
    const preferred = this.createFluidCalc(minValue, slope, viewportMin, config.preferredUnit || 'rem');
    
    if (config.clamp !== false) {
      return `clamp(${min}, ${preferred}, ${max})`;
    }
    
    return preferred;
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
    const sizes: string[] = [];
    
    for (let i = -steps; i <= steps; i++) {
      const value = base * ratio**i;
      sizes.push(`${value.toFixed(3)}${unit}`);
    }
    
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
      const minValue = baseMin * ratio**i;
      const maxValue = baseMax * ratio**i;
      
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