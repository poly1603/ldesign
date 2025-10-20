/**
 * Advanced Responsive System Module
 * Supports container queries, complex layouts, and adaptive sizing strategies
 */

import type { SizeUnit, SizeValue } from '../types';
import { getDeviceDetector } from '../core/DeviceDetector';

// WeakMap for storing container query cleanups to avoid memory leaks
const containerQueryCleanups = new WeakMap<Element, (() => void)[]>();

/**
 * Container query type
 */
export type ContainerQueryType = 'inline-size' | 'block-size' | 'width' | 'height' | 'aspect-ratio';

/**
 * Layout type
 */
export type LayoutType = 'grid' | 'flex' | 'columns' | 'masonry' | 'custom';

/**
 * Size calculation strategy
 */
export type SizeStrategy = 'fluid' | 'stepped' | 'adaptive' | 'elastic' | 'hybrid';

/**
 * Container query configuration
 */
export interface ContainerQuery {
  container: string;
  type: ContainerQueryType;
  breakpoints: {
    name: string;
    min?: number;
    max?: number;
    sizeConfig: Record<string, SizeValue>;
  }[];
}

/**
 * Layout configuration
 */
export interface LayoutConfig {
  type: LayoutType;
  columns?: number | 'auto';
  gap?: SizeValue;
  itemSizing?: 'equal' | 'auto' | 'masonry';
  responsive?: boolean;
  containerBased?: boolean;
}

/**
 * Advanced breakpoint configuration
 */
export interface AdvancedBreakpoint {
  name: string;
  query: string;
  priority?: number;
  sizeModifiers?: {
    scale?: number;
    minSize?: number;
    maxSize?: number;
  };
  layoutOverrides?: Partial<LayoutConfig>;
}

/**
 * Responsive size configuration
 */
export interface ResponsiveSizeConfig {
  base: SizeValue;
  breakpoints?: Record<string, SizeValue>;
  containerQueries?: ContainerQuery[];
  strategy?: SizeStrategy;
  clamp?: {
    min: SizeValue;
    max: SizeValue;
    preferred?: SizeValue;
  };
}

/**
 * Element visibility configuration
 */
export interface VisibilityConfig {
  showOn?: string[];
  hideOn?: string[];
  displayType?: string;
  transition?: {
    duration: number;
    easing: string;
  };
}

/**
 * Advanced Responsive System
 */
export class AdvancedResponsiveSystem {
  private breakpoints: Map<string, AdvancedBreakpoint>;
  private activeBreakpoints: Set<string>;
  private containerObservers: Map<string, ResizeObserver>;
  private mediaQueries: Map<string, MediaQueryList>;
  private listeners: WeakSet<(breakpoints: string[]) => void>;
  private listenerRefs: Set<{ deref: () => ((breakpoints: string[]) => void) | undefined }>;
  private detector = getDeviceDetector();
  private layoutConfigs: Map<string, LayoutConfig>;
  private visibilityRules: Map<string, VisibilityConfig>;
  private mediaQueryHandlers: Map<string, (e: MediaQueryListEvent) => void>;

  constructor() {
    this.breakpoints = new Map();
    this.activeBreakpoints = new Set();
    this.containerObservers = new Map();
    this.mediaQueries = new Map();
    this.listeners = new WeakSet();
    this.listenerRefs = new Set();
    this.layoutConfigs = new Map();
    this.visibilityRules = new Map();
    this.mediaQueryHandlers = new Map();

    this.initializeDefaultBreakpoints();
    this.setupMediaQueryListeners();
  }

  /**
   * Initialize default breakpoints
   */
  private initializeDefaultBreakpoints(): void {
    const defaults: AdvancedBreakpoint[] = [
      {
        name: 'xs',
        query: '(max-width: 575px)',
        priority: 1,
        sizeModifiers: { scale: 0.875 }
      },
      {
        name: 'sm',
        query: '(min-width: 576px) and (max-width: 767px)',
        priority: 2,
        sizeModifiers: { scale: 0.9 }
      },
      {
        name: 'md',
        query: '(min-width: 768px) and (max-width: 991px)',
        priority: 3,
        sizeModifiers: { scale: 1 }
      },
      {
        name: 'lg',
        query: '(min-width: 992px) and (max-width: 1199px)',
        priority: 4,
        sizeModifiers: { scale: 1 }
      },
      {
        name: 'xl',
        query: '(min-width: 1200px) and (max-width: 1399px)',
        priority: 5,
        sizeModifiers: { scale: 1.1 }
      },
      {
        name: 'xxl',
        query: '(min-width: 1400px)',
        priority: 6,
        sizeModifiers: { scale: 1.2 }
      }
    ];

    defaults.forEach(bp => this.addBreakpoint(bp));
  }

  /**
   * Add custom breakpoint
   */
  addBreakpoint(breakpoint: AdvancedBreakpoint): void {
    this.breakpoints.set(breakpoint.name, breakpoint);
    
    // Remove existing handler if present
    this.cleanupBreakpointHandler(breakpoint.name);
    
    // Create media query listener
    if (typeof window !== 'undefined') {
      const mql = window.matchMedia(breakpoint.query);
      this.mediaQueries.set(breakpoint.name, mql);
      
      const handler = (e: MediaQueryListEvent) => {
        this.handleBreakpointChange(breakpoint.name, e.matches);
      };
      
      this.mediaQueryHandlers.set(breakpoint.name, handler);
      mql.addEventListener('change', handler);

      // Check initial state
      if (mql.matches) {
        this.activeBreakpoints.add(breakpoint.name);
      }
    }
  }

  /**
   * Remove breakpoint
   */
  removeBreakpoint(name: string): void {
    this.breakpoints.delete(name);
    this.activeBreakpoints.delete(name);
    this.cleanupBreakpointHandler(name);
  }
  
  /**
   * Cleanup breakpoint handler
   */
  private cleanupBreakpointHandler(name: string): void {
    const mql = this.mediaQueries.get(name);
    const handler = this.mediaQueryHandlers.get(name);
    
    if (mql && handler) {
      mql.removeEventListener('change', handler);
    }
    
    this.mediaQueries.delete(name);
    this.mediaQueryHandlers.delete(name);
  }

  /**
   * Setup media query listeners
   */
  private setupMediaQueryListeners(): void {
    this.breakpoints.forEach((breakpoint, name) => {
      const existing = this.mediaQueries.get(name);
      if (!existing && typeof window !== 'undefined') {
        const mql = window.matchMedia(breakpoint.query);
        this.mediaQueries.set(name, mql);
        
        const handler = (e: MediaQueryListEvent) => {
          this.handleBreakpointChange(name, e.matches);
        };
        
        this.mediaQueryHandlers.set(name, handler);
        mql.addEventListener('change', handler);

        if (mql.matches) {
          this.activeBreakpoints.add(name);
        }
      }
    });
  }

  /**
   * Handle breakpoint change
   */
  private handleBreakpointChange(name: string, matches: boolean): void {
    const wasActive = this.activeBreakpoints.has(name);
    
    if (matches && !wasActive) {
      this.activeBreakpoints.add(name);
      this.notifyListeners();
    } else if (!matches && wasActive) {
      this.activeBreakpoints.delete(name);
      this.notifyListeners();
    }
  }

  /**
   * Notify listeners of breakpoint changes
   */
  private notifyListeners(): void {
    const active = this.getActiveBreakpoints();
    
    // Clean up dead references
    const deadRefs: { deref: () => ((breakpoints: string[]) => void) | undefined }[] = [];
    
    this.listenerRefs.forEach(ref => {
      const listener = ref.deref();
      if (listener && this.listeners.has(listener)) {
        listener(active);
      } else {
        deadRefs.push(ref);
      }
    });
    
    // Remove dead references
    deadRefs.forEach(ref => this.listenerRefs.delete(ref));
  }

  // ============================================
  // Container Queries
  // ============================================

  /**
   * Setup container query observer
   */
  setupContainerQuery(
    containerSelector: string,
    queries: ContainerQuery['breakpoints'],
    callback: (matchedQuery: string | null) => void
  ): () => void {
    if (typeof window === 'undefined' || !('ResizeObserver' in window)) {
      return () => {};
    }

    const container = document.querySelector(containerSelector);
    if (!container) {
      console.warn(`Container ${containerSelector} not found`);
      return () => {};
    }

    let currentMatch: string | null = null;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        // const _height = entry.contentRect.height;

        // Find matching query
        const match = queries.find(q => {
          if (q.min !== undefined && q.max !== undefined) {
            return width >= q.min && width <= q.max;
          }
          if (q.min !== undefined) {
            return width >= q.min;
          }
          if (q.max !== undefined) {
            return width <= q.max;
          }
          return false;
        });

        const newMatch = match?.name || null;
        if (newMatch !== currentMatch) {
          currentMatch = newMatch;
          callback(currentMatch);
        }
      }
    });

    observer.observe(container as Element);
    this.containerObservers.set(containerSelector, observer);

    // Cleanup function
    return () => {
      observer.disconnect();
      this.containerObservers.delete(containerSelector);
    };
  }

  /**
   * Apply container-based sizing
   */
  applyContainerSizing(
    element: HTMLElement,
    containerQuery: ContainerQuery
  ): void {
    const cleanup = this.setupContainerQuery(
      containerQuery.container,
      containerQuery.breakpoints,
      (matchedQuery) => {
        if (matchedQuery) {
          const breakpoint = containerQuery.breakpoints.find(
            bp => bp.name === matchedQuery
          );
          
          if (breakpoint?.sizeConfig) {
            Object.entries(breakpoint.sizeConfig).forEach(([prop, value]) => {
              if (typeof value === 'number') {
                element.style.setProperty(prop, `${value}px`);
              } else {
                element.style.setProperty(prop, String(value));
              }
            });
          }
        }
      }
    );

    // Store cleanup function using WeakMap instead of property
    if (!containerQueryCleanups.has(element)) {
      containerQueryCleanups.set(element, []);
    }
    containerQueryCleanups.get(element)!.push(cleanup);
  }

  // ============================================
  // Size Calculation
  // ============================================

  /**
   * Calculate responsive size
   */
  calculateResponsiveSize(config: ResponsiveSizeConfig): SizeValue {
    // Get current breakpoint
    const activeBreakpoint = this.getActiveBreakpoint();
    
    if (!activeBreakpoint) {
      return config.base;
    }

    // Check for breakpoint-specific size
    if (config.breakpoints && config.breakpoints[activeBreakpoint]) {
      return config.breakpoints[activeBreakpoint];
    }

    // Apply strategy
    return this.applySizeStrategy(config, activeBreakpoint);
  }

  /**
   * Apply size strategy
   */
  private applySizeStrategy(
    config: ResponsiveSizeConfig,
    breakpoint: string
  ): SizeValue {
    const strategy = config.strategy || 'fluid';
    const bp = this.breakpoints.get(breakpoint);
    const baseValue = typeof config.base === 'number' ? config.base : 16;

    switch (strategy) {
      case 'fluid':
        return { value: baseValue, unit: 'px' as SizeUnit };
      
      case 'stepped':
        return { value: this.calculateSteppedSize(baseValue, bp), unit: 'px' as SizeUnit };
      
      case 'adaptive':
        return { value: this.calculateAdaptiveSize(baseValue, bp), unit: 'px' as SizeUnit };
      
      case 'elastic':
        return { value: baseValue, unit: 'em' as SizeUnit };
      
      case 'hybrid':
        return { value: baseValue, unit: 'px' as SizeUnit };
      
      default:
        return config.base;
    }
  }

  /**
   * Calculate fluid size
   */
  private calculateFluidSize(
    base: number,
    breakpoint?: AdvancedBreakpoint
  ): string {
    const vw = this.detector.getViewport().width;
    const scale = breakpoint?.sizeModifiers?.scale || 1;
    
    // Fluid calculation: base + viewport-based adjustment
    const fluidValue = base * scale * (vw / 1200);
    
    return `clamp(${base * 0.75}px, ${fluidValue}px, ${base * 1.5}px)`;
  }

  /**
   * Calculate stepped size
   */
  private calculateSteppedSize(
    base: number,
    breakpoint?: AdvancedBreakpoint
  ): number {
    const scale = breakpoint?.sizeModifiers?.scale || 1;
    const stepped = Math.round(base * scale / 4) * 4; // Round to nearest 4px
    
    return stepped;
  }

  /**
   * Calculate adaptive size
   */
  private calculateAdaptiveSize(
    base: number,
    breakpoint?: AdvancedBreakpoint
  ): number {
    const viewport = this.detector.getViewport();
    const scale = breakpoint?.sizeModifiers?.scale || 1;
    
    // Adapt based on device characteristics
    let adaptive = base * scale;
    
    if (viewport.pixelRatio > 2) {
      adaptive *= 1.1; // Increase for high DPI
    }
    
    if (viewport.touch) {
      adaptive *= 1.15; // Increase for touch devices
    }
    
    return Math.round(adaptive);
  }

  /**
   * Calculate elastic size
   */
  private calculateElasticSize(
    base: number,
    breakpoint?: AdvancedBreakpoint
  ): string {
    const scale = breakpoint?.sizeModifiers?.scale || 1;
    const em = base / 16; // Convert to em
    
    return `${em * scale}em`;
  }

  /**
   * Calculate hybrid size
   */
  private calculateHybridSize(
    config: ResponsiveSizeConfig,
    breakpoint?: AdvancedBreakpoint
  ): string {
    const base = typeof config.base === 'number' ? config.base : 16;
    const scale = breakpoint?.sizeModifiers?.scale || 1;
    
    // Combine fluid and stepped approaches
    const vw = this.detector.getViewport().width;
    const stepped = Math.round(base * scale / 4) * 4;
    const fluid = base * scale * (vw / 1200);
    
    if (config.clamp) {
      const min = typeof config.clamp.min === 'number' 
        ? config.clamp.min 
        : stepped * 0.75;
      const max = typeof config.clamp.max === 'number'
        ? config.clamp.max
        : stepped * 1.5;
      const preferred = config.clamp.preferred || `${fluid}px`;
      
      return `clamp(${min}px, ${preferred}, ${max}px)`;
    }
    
    return `${fluid}px`;
  }

  // ============================================
  // Layout Management
  // ============================================

  /**
   * Create responsive layout
   */
  createResponsiveLayout(
    container: HTMLElement,
    config: LayoutConfig
  ): void {
    this.layoutConfigs.set(container.id || 'default', config);
    
    switch (config.type) {
      case 'grid':
        this.applyGridLayout(container, config);
        break;
      
      case 'flex':
        this.applyFlexLayout(container, config);
        break;
      
      case 'columns':
        this.applyColumnsLayout(container, config);
        break;
      
      case 'masonry':
        this.applyMasonryLayout(container, config);
        break;
      
      case 'custom':
        // Allow custom layout implementation
        break;
    }

    if (config.responsive) {
      this.makeLayoutResponsive(container, config);
    }
  }

  /**
   * Apply grid layout
   */
  private applyGridLayout(
    container: HTMLElement,
    config: LayoutConfig
  ): void {
    container.style.display = 'grid';
    
    if (config.columns === 'auto') {
      container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
    } else if (typeof config.columns === 'number') {
      container.style.gridTemplateColumns = `repeat(${config.columns}, 1fr)`;
    }
    
    if (config.gap) {
      const gapValue = typeof config.gap === 'number' ? `${config.gap}px` : String(config.gap);
      container.style.gap = gapValue;
    }
  }

  /**
   * Apply flex layout
   */
  private applyFlexLayout(
    container: HTMLElement,
    config: LayoutConfig
  ): void {
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    
    if (config.gap) {
      const gapValue = typeof config.gap === 'number' ? `${config.gap}px` : String(config.gap);
      container.style.gap = gapValue;
    }
    
    if (config.itemSizing === 'equal') {
      const children = container.children;
      Array.from(children).forEach((child: Element) => {
        (child as HTMLElement).style.flex = '1 1 0';
      });
    }
  }

  /**
   * Apply columns layout
   */
  private applyColumnsLayout(
    container: HTMLElement,
    config: LayoutConfig
  ): void {
    if (typeof config.columns === 'number') {
      container.style.columnCount = config.columns.toString();
    } else {
      container.style.columnWidth = '250px';
    }
    
    if (config.gap) {
      const gapValue = typeof config.gap === 'number' ? `${config.gap}px` : String(config.gap);
      container.style.columnGap = gapValue;
    }
  }

  /**
   * Apply masonry layout
   */
  private applyMasonryLayout(
    container: HTMLElement,
    config: LayoutConfig
  ): void {
    // Basic masonry with CSS Grid
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${config.columns || 'auto-fill'}, minmax(250px, 1fr))`;
    container.style.gridAutoRows = '10px';
    
    // Apply to children
    const children = container.children;
    Array.from(children).forEach((child: Element) => {
      const element = child as HTMLElement;
      const height = element.offsetHeight;
      const rowSpan = Math.ceil(height / 10);
      element.style.gridRowEnd = `span ${rowSpan}`;
    });
  }

  /**
   * Make layout responsive
   */
  private makeLayoutResponsive(
    container: HTMLElement,
    config: LayoutConfig
  ): void {
    const updateLayout = () => {
      const breakpoint = this.getActiveBreakpoint();
      const bp = breakpoint ? this.breakpoints.get(breakpoint) : undefined;
      
      if (bp?.layoutOverrides) {
        const merged = { ...config, ...bp.layoutOverrides };
        this.createResponsiveLayout(container, merged);
      }
    };

    // Initial update
    updateLayout();

    // Listen for breakpoint changes
    this.onChange(() => {
      updateLayout();
    });
  }

  // ============================================
  // Visibility Management
  // ============================================

  /**
   * Set element visibility rules
   */
  setVisibilityRules(
    element: HTMLElement,
    config: VisibilityConfig
  ): void {
    const id = element.id || `element-${Date.now()}`;
    element.id = id;
    this.visibilityRules.set(id, config);
    
    this.updateElementVisibility(element, config);
    
    // Listen for breakpoint changes
    this.onChange(() => {
      this.updateElementVisibility(element, config);
    });
  }

  /**
   * Update element visibility
   */
  private updateElementVisibility(
    element: HTMLElement,
    config: VisibilityConfig
  ): void {
    const activeBreakpoints = this.getActiveBreakpoints();
    const shouldShow = this.shouldShowElement(activeBreakpoints, config);
    
    if (config.transition) {
      element.style.transition = `opacity ${config.transition.duration}ms ${config.transition.easing}`;
    }
    
    if (shouldShow) {
      element.style.display = config.displayType || 'block';
      setTimeout(() => {
        element.style.opacity = '1';
      }, 10);
    } else {
      element.style.opacity = '0';
      setTimeout(() => {
        element.style.display = 'none';
      }, config.transition?.duration || 0);
    }
  }

  /**
   * Check if element should be shown
   */
  private shouldShowElement(
    activeBreakpoints: string[],
    config: VisibilityConfig
  ): boolean {
    // Check hideOn rules first
    if (config.hideOn) {
      const shouldHide = config.hideOn.some(bp => activeBreakpoints.includes(bp));
      if (shouldHide) return false;
    }
    
    // Check showOn rules
    if (config.showOn) {
      return config.showOn.some(bp => activeBreakpoints.includes(bp));
    }
    
    // Default to showing
    return true;
  }

  // ============================================
  // Public API
  // ============================================

  /**
   * Get active breakpoints
   */
  getActiveBreakpoints(): string[] {
    return Array.from(this.activeBreakpoints).sort((a, b) => {
      const priorityA = this.breakpoints.get(a)?.priority || 0;
      const priorityB = this.breakpoints.get(b)?.priority || 0;
      return priorityA - priorityB;
    });
  }

  /**
   * Get active breakpoint (highest priority)
   */
  getActiveBreakpoint(): string | null {
    const active = this.getActiveBreakpoints();
    return active[active.length - 1] || null;
  }

  /**
   * Check if breakpoint is active
   */
  isBreakpointActive(name: string): boolean {
    return this.activeBreakpoints.has(name);
  }

  /**
   * Subscribe to breakpoint changes
   */
  onChange(listener: (breakpoints: string[]) => void): () => void {
    this.listeners.add(listener);
    const ref = typeof globalThis !== 'undefined' && typeof (globalThis as any).WeakRef !== 'undefined'
      ? new ((globalThis as any).WeakRef)(listener)
      : { deref: () => listener };
    this.listenerRefs.add(ref);
    
    return () => {
      this.listeners.delete(listener);
      // Find and remove the corresponding WeakRef
      this.listenerRefs.forEach(r => {
        if (r.deref() === listener) {
          this.listenerRefs.delete(r);
        }
      });
    };
  }

  /**
   * Get CSS custom properties for current state
   */
  getCSSVariables(): Record<string, string> {
    const variables: Record<string, string> = {};
    const activeBreakpoint = this.getActiveBreakpoint();
    
    if (activeBreakpoint) {
      const bp = this.breakpoints.get(activeBreakpoint);
      if (bp?.sizeModifiers) {
        variables['--responsive-scale'] = bp.sizeModifiers.scale?.toString() || '1';
        if (bp.sizeModifiers.minSize) {
          variables['--responsive-min-size'] = `${bp.sizeModifiers.minSize}px`;
        }
        if (bp.sizeModifiers.maxSize) {
          variables['--responsive-max-size'] = `${bp.sizeModifiers.maxSize}px`;
        }
      }
    }
    
    variables['--active-breakpoint'] = activeBreakpoint || 'none';
    variables['--viewport-width'] = `${this.detector.getViewport().width}px`;
    variables['--viewport-height'] = `${this.detector.getViewport().height}px`;
    
    return variables;
  }

  /**
   * Apply CSS variables to element
   */
  applyCSSVariables(element: HTMLElement = document.documentElement): void {
    const variables = this.getCSSVariables();
    Object.entries(variables).forEach(([key, value]) => {
      element.style.setProperty(key, value);
    });
  }

  /**
   * Destroy the system
   */
  destroy(): void {
    // Disconnect container observers
    this.containerObservers.forEach(observer => observer.disconnect());
    this.containerObservers.clear();
    
    // Remove all media query listeners
    this.mediaQueryHandlers.forEach((handler, name) => {
      const mql = this.mediaQueries.get(name);
      if (mql) {
        mql.removeEventListener('change', handler);
      }
    });
    
    // Clear media queries
    this.mediaQueries.clear();
    this.mediaQueryHandlers.clear();
    
    // Clear other maps
    this.breakpoints.clear();
    this.activeBreakpoints.clear();
    this.listenerRefs.clear();
    this.layoutConfigs.clear();
    this.visibilityRules.clear();
    
    // Clear global cleanup map
    if (typeof (containerQueryCleanups as any).clear === 'function') {
      (containerQueryCleanups as any).clear();
    }
  }
}

/**
 * Create responsive system instance
 */
export function createResponsiveSystem(): AdvancedResponsiveSystem {
  return new AdvancedResponsiveSystem();
}

/**
 * Default responsive system instance
 */
export const responsive = createResponsiveSystem();