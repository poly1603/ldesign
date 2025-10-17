/**
 * @ldesign/size - Advanced Type Definitions
 * 
 * Complete type system for responsive size management
 */

// ============================================
// Device & Viewport Types
// ============================================

/**
 * Device categories
 */
export type DeviceType = 
  | 'mobile'       // < 768px
  | 'tablet'       // 768px - 1024px
  | 'laptop'       // 1024px - 1440px
  | 'desktop'      // 1440px - 1920px
  | 'widescreen'   // > 1920px
  | 'tv';          // > 2560px

/**
 * Device orientation
 */
export type DeviceOrientation = 'portrait' | 'landscape';

/**
 * Viewport information
 */
export interface Viewport {
  width: number;
  height: number;
  device: DeviceType;
  orientation: DeviceOrientation;
  pixelRatio: number;
  touch: boolean;
}

/**
 * Breakpoint definition
 */
export interface Breakpoint {
  name: string;
  min?: number;
  max?: number;
  unit?: 'px' | 'em' | 'rem';
  device?: DeviceType;
}

/**
 * Responsive breakpoints
 */
export interface ResponsiveBreakpoints {
  xs: Breakpoint;   // Extra small (mobile)
  sm: Breakpoint;   // Small (mobile landscape)
  md: Breakpoint;   // Medium (tablet)
  lg: Breakpoint;   // Large (laptop)
  xl: Breakpoint;   // Extra large (desktop)
  xxl: Breakpoint;  // Extra extra large (widescreen)
  xxxl?: Breakpoint; // Ultra wide
}

// ============================================
// Advanced Size Types
// ============================================

/**
 * Size unit representation
 */
export interface SizeValue {
  value: number;
  unit: SizeUnit;
  context?: SizeContext;
}

/**
 * Size units with modern additions
 */
export type SizeUnit = 
  | 'px'     // Pixels (absolute)
  | 'rem'    // Root em (relative to root)
  | 'em'     // Relative em (relative to parent)
  | 'vw'     // Viewport width
  | 'vh'     // Viewport height
  | 'vmin'   // Viewport minimum
  | 'vmax'   // Viewport maximum
  | 'vi'     // Viewport inline (logical)
  | 'vb'     // Viewport block (logical)
  | 'svw'    // Small viewport width
  | 'svh'    // Small viewport height
  | 'lvw'    // Large viewport width
  | 'lvh'    // Large viewport height
  | 'dvw'    // Dynamic viewport width
  | 'dvh'    // Dynamic viewport height
  | '%'      // Percentage
  | 'ch'     // Character width
  | 'ex'     // x-height
  | 'cap'    // Cap height
  | 'lh'     // Line height
  | 'rlh'    // Root line height
  | 'cqw'    // Container query width
  | 'cqh'    // Container query height
  | 'cqi'    // Container query inline
  | 'cqb'    // Container query block
  | 'cqmin'  // Container query minimum
  | 'cqmax'  // Container query maximum
  | 'pt'     // Points (print)
  | 'pc'     // Picas (print)
  | 'in'     // Inches (print)
  | 'cm'     // Centimeters (print)
  | 'mm';    // Millimeters (print)

/**
 * Size context for intelligent unit selection
 */
export interface SizeContext {
  type: 'font' | 'spacing' | 'layout' | 'component' | 'border' | 'icon';
  responsive?: boolean;
  scalable?: boolean;
  device?: DeviceType;
  container?: string;
}

/**
 * Unit strategy for different contexts
 */
export interface UnitStrategy {
  default: SizeUnit;
  mobile?: SizeUnit;
  tablet?: SizeUnit;
  desktop?: SizeUnit;
  print?: SizeUnit;
  fallback?: SizeUnit;
}

/**
 * Fluid size configuration
 */
export interface FluidSize {
  min: SizeValue;
  max: SizeValue;
  preferredUnit?: SizeUnit;
  viewportMin?: number;
  viewportMax?: number;
  clamp?: boolean;
}

/**
 * Responsive size value
 */
export interface ResponsiveSize {
  base: SizeInput;
  xs?: SizeInput;
  sm?: SizeInput;
  md?: SizeInput;
  lg?: SizeInput;
  xl?: SizeInput;
  xxl?: SizeInput;
  fluid?: FluidSize;
}

/**
 * Size scale factor
 */
export type ScaleFactor = number; // e.g., 1.25 = 125%

/**
 * Size input types
 */
export type SizeInput = string | number | SizeValue;

// ============================================
// Size Presets & Schemes
// ============================================

/**
 * Advanced preset scheme types
 */
export type PresetScheme = 
  // Device-specific presets
  | 'mobile-compact'      // Mobile with minimal spacing
  | 'mobile-comfortable'  // Mobile with balanced spacing
  | 'mobile-touch'        // Mobile optimized for touch (44px min)
  | 'tablet-portrait'     // Tablet portrait mode
  | 'tablet-landscape'    // Tablet landscape mode  
  | 'desktop-compact'     // Desktop dense UI
  | 'desktop-normal'      // Desktop default
  | 'desktop-spacious'    // Desktop with generous spacing
  | 'tv-interface'        // TV/large screen interface
  
  // Use-case presets
  | 'dashboard'           // Data-dense dashboards
  | 'article'             // Reading-optimized
  | 'app-ios'             // iOS app style
  | 'app-android'         // Material Design style
  | 'website'             // General website
  | 'admin'               // Admin panels
  | 'ecommerce'           // E-commerce sites
  
  // Accessibility presets
  | 'a11y-normal'         // WCAG AA compliant
  | 'a11y-large'          // WCAG AAA large text
  | 'elderly'             // Elderly-friendly sizes
  
  // System presets
  | 'auto'                // Auto-detect based on device
  | 'custom';             // User-defined

/**
 * Size category for semantic sizing
 */
export type SizeCategory = 
  | 'tiny'    // xs
  | 'small'   // sm
  | 'medium'  // base/default
  | 'large'   // lg
  | 'huge'    // xl
  | 'giant';  // xxl

/**
 * Size scale configuration
 */
export interface SizeScale {
  base: number;           // Base size in pixels
  ratio: number;          // Scale ratio (e.g., 1.25 for major third)
  steps: number;          // Number of steps up and down
  unit?: SizeUnit;        // Output unit
}

// ============================================
// Size System Configuration
// ============================================

/**
 * Font size configuration
 */
export interface FontSizeConfig {
  tiny: SizeInput;       // 10px
  small: SizeInput;      // 12px
  medium: SizeInput;     // 14px
  large: SizeInput;      // 16px
  huge: SizeInput;       // 18px
  giant: SizeInput;      // 20px
  
  // Heading sizes
  h1: SizeInput;         // 32px
  h2: SizeInput;         // 28px
  h3: SizeInput;         // 24px
  h4: SizeInput;         // 20px
  h5: SizeInput;         // 18px
  h6: SizeInput;         // 16px
  
  // Display sizes
  display1?: SizeInput;  // 48px
  display2?: SizeInput;  // 40px
  display3?: SizeInput;  // 36px
  
  // Special sizes
  caption?: SizeInput;   // 11px
  overline?: SizeInput;  // 10px
  code?: SizeInput;      // 13px
}

/**
 * Spacing configuration (padding, margin)
 */
export interface SpacingConfig {
  none: SizeInput;       // 0
  tiny: SizeInput;       // 2px
  small: SizeInput;      // 4px
  medium: SizeInput;     // 8px
  large: SizeInput;      // 16px
  huge: SizeInput;       // 24px
  giant: SizeInput;      // 32px
  
  // Extended spacing
  massive?: SizeInput;   // 48px
  colossal?: SizeInput;  // 64px
  
  // Fractional spacing
  half?: SizeInput;      // 50% of medium
  quarter?: SizeInput;   // 25% of medium
  double?: SizeInput;    // 200% of medium
}

/**
 * Border radius configuration
 */
export interface RadiusConfig {
  none: SizeInput;       // 0
  small: SizeInput;      // 2px
  medium: SizeInput;     // 4px
  large: SizeInput;      // 8px
  huge: SizeInput;       // 12px
  full: SizeInput;       // 9999px (pill shape)
  
  // Special radii
  circle?: SizeInput;    // 50%
  square?: SizeInput;    // 0
}

/**
 * Line height configuration
 */
export interface LineHeightConfig {
  none: number;          // 1.0
  tight: number;         // 1.25
  snug: number;          // 1.375
  normal: number;        // 1.5
  relaxed: number;       // 1.625
  loose: number;         // 2.0
}

/**
 * Letter spacing configuration
 */
export interface LetterSpacingConfig {
  tighter: SizeInput;    // -0.05em
  tight: SizeInput;      // -0.025em
  normal: SizeInput;     // 0
  wide: SizeInput;       // 0.025em
  wider: SizeInput;      // 0.05em
  widest: SizeInput;     // 0.1em
}

/**
 * Component size configuration
 */
export interface ComponentSizeConfig {
  // Button sizes
  button: {
    tiny: { height: SizeInput; padding: SizeInput; fontSize: SizeInput };
    small: { height: SizeInput; padding: SizeInput; fontSize: SizeInput };
    medium: { height: SizeInput; padding: SizeInput; fontSize: SizeInput };
    large: { height: SizeInput; padding: SizeInput; fontSize: SizeInput };
    huge: { height: SizeInput; padding: SizeInput; fontSize: SizeInput };
  };
  
  // Input sizes
  input: {
    small: { height: SizeInput; padding: SizeInput; fontSize: SizeInput };
    medium: { height: SizeInput; padding: SizeInput; fontSize: SizeInput };
    large: { height: SizeInput; padding: SizeInput; fontSize: SizeInput };
  };
  
  // Icon sizes
  icon: {
    tiny: SizeInput;    // 12px
    small: SizeInput;   // 16px
    medium: SizeInput;  // 20px
    large: SizeInput;   // 24px
    huge: SizeInput;    // 32px
    giant: SizeInput;   // 48px
  };
  
  // Avatar sizes
  avatar: {
    tiny: SizeInput;    // 24px
    small: SizeInput;   // 32px
    medium: SizeInput;  // 40px
    large: SizeInput;   // 48px
    huge: SizeInput;    // 64px
    giant: SizeInput;   // 96px
  };
  
  // Card padding
  card?: {
    small: SizeInput;
    medium: SizeInput;
    large: SizeInput;
  };
}

/**
 * Complete size scheme configuration
 */
export interface SizeScheme {
  name: string;
  description?: string;
  fontSize: FontSizeConfig;
  spacing: SpacingConfig;
  radius: RadiusConfig;
  lineHeight: LineHeightConfig;
  letterSpacing: LetterSpacingConfig;
  components: ComponentSizeConfig;
  
  // Grid system
  grid?: {
    columns: number;
    gutter: SizeInput;
    margin: SizeInput;
  };
  
  // Breakpoints
  breakpoints?: {
    xs?: SizeInput;
    sm?: SizeInput;
    md?: SizeInput;
    lg?: SizeInput;
    xl?: SizeInput;
    xxl?: SizeInput;
  };
  
  // Custom properties
  custom?: Record<string, SizeInput>;
}

// ============================================
// Size Manager Configuration
// ============================================

/**
 * Size manager options
 */
export interface SizeManagerOptions {
  /** Current scheme */
  scheme?: PresetScheme | SizeScheme;
  /** CSS variable prefix */
  prefix?: string;
  /** Root font size for rem calculations */
  rootFontSize?: number;
  /** Auto-inject CSS variables */
  autoInject?: boolean;
  /** Storage key for persistence */
  storageKey?: string;
  /** Enable responsive adjustments */
  responsive?: boolean;
  /** Custom schemes */
  customSchemes?: Record<string, SizeScheme>;
}

/**
 * Size manager state
 */
export interface SizeManagerState {
  currentScheme: string;
  scheme: SizeScheme;
  cssVariables: Record<string, string>;
  isDirty: boolean;
}

// ============================================
// Size Operations
// ============================================

/**
 * Size calculation options
 */
export interface SizeCalculationOptions {
  precision?: number;
  unit?: SizeUnit;
  clamp?: { min?: SizeInput; max?: SizeInput };
}

/**
 * Size animation configuration
 */
export interface SizeAnimationConfig {
  from: SizeInput;
  to: SizeInput;
  duration: number;
  easing?: EasingFunction;
  onUpdate?: (value: string) => void;
  onComplete?: () => void;
}

/**
 * Easing function type
 */
export type EasingFunction = 
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | ((t: number) => number);

// ============================================
// CSS Variables Generation
// ============================================

/**
 * CSS variable options
 */
export interface CSSVariableOptions {
  prefix?: string;
  selector?: string;
  important?: boolean;
  scheme?: SizeScheme;
}

/**
 * Generated CSS content
 */
export interface GeneratedCSS {
  variables: string;
  utilities?: string;
  components?: string;
  responsive?: string;
  full: string;
}

// ============================================
// Utility Types
// ============================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Size modifier function
 */
export type SizeModifier = (value: SizeValue) => SizeValue;

/**
 * Size validator function
 */
export type SizeValidator = (value: SizeInput) => boolean;

// ============================================
// Event Types
// ============================================

/**
 * Size change event
 */
export interface SizeChangeEvent {
  previousScheme: string;
  currentScheme: string;
  timestamp: number;
  source: 'user' | 'system' | 'api';
}

/**
 * Size error event
 */
export interface SizeErrorEvent {
  error: Error;
  context: string;
  timestamp: number;
}

// ============================================
// Plugin System
// ============================================

/**
 * Size plugin interface
 */
export interface SizePlugin {
  name: string;
  version: string;
  install: (manager: any) => void;
  uninstall?: () => void;
}

/**
 * Plugin options
 */
export interface PluginOptions {
  [key: string]: any;
}