/**
 * @ldesign/size - Unit Strategy System
 * 
 * Intelligent unit selection based on context and device
 */

import type {
  DeviceType,
  SizeContext,
  SizeUnit,
  SizeValue,
  UnitStrategy
} from '../types';
import { getDeviceDetector } from './DeviceDetector';

/**
 * Unit strategy manager
 */
export class UnitStrategyManager {
  private strategies: Map<string, UnitStrategy> = new Map();
  
  constructor() {
    this.initializeDefaultStrategies();
  }

  /**
   * Initialize default strategies for different contexts
   */
  private initializeDefaultStrategies(): void {
    // Font size strategy - rem for scalability
    this.strategies.set('font', {
      default: 'rem',
      mobile: 'rem',
      tablet: 'rem',
      desktop: 'rem',
      print: 'pt',
      fallback: 'px'
    });

    // Spacing strategy - rem for consistency
    this.strategies.set('spacing', {
      default: 'rem',
      mobile: 'rem',
      tablet: 'rem',
      desktop: 'rem',
      print: 'mm',
      fallback: 'px'
    });

    // Layout strategy - flexible units
    this.strategies.set('layout', {
      default: '%',
      mobile: 'vw',
      tablet: '%',
      desktop: 'px',
      print: 'cm',
      fallback: 'px'
    });

    // Component strategy - px for precision
    this.strategies.set('component', {
      default: 'px',
      mobile: 'px',
      tablet: 'px',
      desktop: 'px',
      print: 'mm',
      fallback: 'px'
    });

    // Border strategy - px for sharpness
    this.strategies.set('border', {
      default: 'px',
      mobile: 'px',
      tablet: 'px',
      desktop: 'px',
      print: 'pt',
      fallback: 'px'
    });

    // Icon strategy - em for relative sizing
    this.strategies.set('icon', {
      default: 'em',
      mobile: 'em',
      tablet: 'em',
      desktop: 'em',
      print: 'pt',
      fallback: 'px'
    });
  }

  /**
   * Get recommended unit for context
   */
  getRecommendedUnit(context: SizeContext): SizeUnit {
    const strategy = this.strategies.get(context.type) || this.getDefaultStrategy();
    const device = context.device || getDeviceDetector().getDevice();
    
    // If responsive is enabled, prefer viewport units
    if (context.responsive) {
      return this.getResponsiveUnit(context.type, device);
    }
    
    // Get unit based on device
    let unit: SizeUnit | undefined;
    switch (device) {
      case 'mobile':
        unit = strategy.mobile;
        break;
      case 'tablet':
        unit = strategy.tablet;
        break;
      case 'laptop':
      case 'desktop':
      case 'widescreen':
      case 'tv':
        unit = strategy.desktop;
        break;
    }
    
    return unit || strategy.default || strategy.fallback || 'px';
  }

  /**
   * Get responsive unit for context
   */
  private getResponsiveUnit(type: string, device: DeviceType): SizeUnit {
    // For responsive contexts, prefer fluid units
    switch (type) {
      case 'font':
        // Use clamp with rem for fonts
        return 'rem';
      case 'spacing':
        // Use viewport units for responsive spacing
        return device === 'mobile' ? 'vw' : 'rem';
      case 'layout':
        // Use percentage or viewport units for layout
        return device === 'mobile' ? 'vw' : '%';
      case 'component':
        // Components should scale with viewport
        return device === 'mobile' ? 'vw' : 'rem';
      default:
        return 'rem';
    }
  }

  /**
   * Get default strategy
   */
  private getDefaultStrategy(): UnitStrategy {
    return {
      default: 'px',
      mobile: 'px',
      tablet: 'px',
      desktop: 'px',
      print: 'pt',
      fallback: 'px'
    };
  }

  /**
   * Register custom strategy
   */
  registerStrategy(contextType: string, strategy: UnitStrategy): void {
    this.strategies.set(contextType, strategy);
  }

  /**
   * Convert value between units with context awareness
   */
  convertWithContext(
    value: number,
    fromUnit: SizeUnit,
    toContext: SizeContext,
    rootFontSize = 16
  ): SizeValue {
    const targetUnit = this.getRecommendedUnit(toContext);
    
    // If units are the same, no conversion needed
    if (fromUnit === targetUnit) {
      return { value, unit: fromUnit };
    }
    
    // Convert based on context
    let convertedValue = value;
    
    // Handle conversions (simplified for common cases)
    if (fromUnit === 'px') {
      const viewport = getDeviceDetector().getViewport();
      switch (targetUnit) {
        case 'rem':
          convertedValue = value / rootFontSize;
          break;
        case 'em':
          convertedValue = value / rootFontSize; // Approximate
          break;
        case 'vw':
          convertedValue = (value / viewport.width) * 100;
          break;
        case 'vh':
          convertedValue = (value / viewport.height) * 100;
          break;
        case '%':
          // Context-dependent, default to 100% = viewport width
          convertedValue = (value / viewport.width) * 100;
          break;
        case 'pt':
          convertedValue = value * 0.75; // 1px ≈ 0.75pt
          break;
      }
    } else if (fromUnit === 'rem') {
      const pxValue = value * rootFontSize;
      // Recursive conversion through px
      return this.convertWithContext(pxValue, 'px', toContext, rootFontSize);
    }
    
    return {
      value: convertedValue,
      unit: targetUnit,
      context: toContext
    };
  }

  /**
   * Get best unit for accessibility
   */
  getAccessibleUnit(context: SizeContext): SizeUnit {
    // For accessibility, prefer relative units
    switch (context.type) {
      case 'font':
        return 'rem'; // Respects user font size preferences
      case 'spacing':
        return 'rem'; // Scales with font size
      case 'layout':
        return '%'; // Flexible layout
      case 'component':
        return 'rem'; // Scales with user preferences
      case 'border':
        return 'px'; // Borders should be precise
      case 'icon':
        return 'em'; // Scales with parent font size
      default:
        return 'rem';
    }
  }

  /**
   * Check if unit is appropriate for context
   */
  isAppropriateUnit(unit: SizeUnit, context: SizeContext): boolean {
    const recommended = this.getRecommendedUnit(context);
    const accessible = this.getAccessibleUnit(context);
    
    // Check if unit matches recommendations
    if (unit === recommended || unit === accessible) {
      return true;
    }
    
    // Check specific rules
    switch (context.type) {
      case 'font':
        // Avoid absolute units for fonts except pt for print
        return !['px', 'cm', 'mm', 'in'].includes(unit);
      case 'border':
        // Borders should use precise units
        return ['px', 'pt'].includes(unit);
      case 'layout':
        // Layout should use flexible units
        return !['px', 'pt', 'cm', 'mm', 'in'].includes(unit);
      default:
        return true;
    }
  }

  /**
   * Get unit recommendations for context
   */
  getRecommendations(context: SizeContext): {
    recommended: SizeUnit;
    accessible: SizeUnit;
    alternatives: SizeUnit[];
    avoid: SizeUnit[];
  } {
    const recommended = this.getRecommendedUnit(context);
    const accessible = this.getAccessibleUnit(context);
    
    let alternatives: SizeUnit[] = [];
    let avoid: SizeUnit[] = [];
    
    switch (context.type) {
      case 'font':
        alternatives = ['rem', 'em', '%'];
        avoid = ['px', 'cm', 'mm', 'in'];
        break;
      case 'spacing':
        alternatives = ['rem', 'em', 'vw', 'vh'];
        avoid = ['cm', 'mm', 'in', 'pt'];
        break;
      case 'layout':
        alternatives = ['%', 'vw', 'vh', 'ch'];
        avoid = ['px', 'pt', 'cm', 'mm', 'in'];
        break;
      case 'component':
        alternatives = ['rem', 'em', 'px'];
        avoid = ['cm', 'mm', 'in'];
        break;
      case 'border':
        alternatives = ['px', 'rem'];
        avoid = ['%', 'vw', 'vh'];
        break;
      case 'icon':
        alternatives = ['em', 'rem'];
        avoid = ['%', 'vw', 'vh'];
        break;
    }
    
    return {
      recommended,
      accessible,
      alternatives: alternatives.filter(u => u !== recommended && u !== accessible),
      avoid
    };
  }
}

// Singleton instance
let manager: UnitStrategyManager | null = null;

/**
 * Get unit strategy manager instance
 */
export function getUnitStrategyManager(): UnitStrategyManager {
  if (!manager) {
    manager = new UnitStrategyManager();
  }
  return manager;
}

/**
 * Quick access helpers
 */
export const units = {
  /**
   * Get recommended unit for context
   */
  recommend: (context: SizeContext) => {
    return getUnitStrategyManager().getRecommendedUnit(context);
  },
  
  /**
   * Get accessible unit
   */
  accessible: (context: SizeContext) => {
    return getUnitStrategyManager().getAccessibleUnit(context);
  },
  
  /**
   * Check if unit is appropriate
   */
  isAppropriate: (unit: SizeUnit, context: SizeContext) => {
    return getUnitStrategyManager().isAppropriateUnit(unit, context);
  },
  
  /**
   * Get all recommendations
   */
  getRecommendations: (context: SizeContext) => {
    return getUnitStrategyManager().getRecommendations(context);
  },
  
  /**
   * Convert with context
   */
  convert: (value: number, fromUnit: SizeUnit, toContext: SizeContext) => {
    return getUnitStrategyManager().convertWithContext(value, fromUnit, toContext);
  }
};