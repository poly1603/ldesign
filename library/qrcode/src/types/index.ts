/**
 * QR Code error correction levels
 */
export enum ErrorCorrectionLevel {
  /** Low - 7% of codewords can be restored */
  L = 'L',
  /** Medium - 15% of codewords can be restored */
  M = 'M',
  /** Quartile - 25% of codewords can be restored */
  Q = 'Q',
  /** High - 30% of codewords can be restored */
  H = 'H',
}

/**
 * Render type for QR code
 */
export enum RenderType {
  /** Canvas rendering */
  Canvas = 'canvas',
  /** SVG rendering */
  SVG = 'svg',
}

/**
 * Render layer for selective module rendering
 */
export enum RenderLayer {
  /** Render all modules (default) */
  All = 'all',
  /** Render only function modules (finder patterns, timing patterns, alignment patterns) */
  Function = 'function',
  /** Render only data modules (encoded data and error correction) */
  Data = 'data',
  /** Render only guide patterns (timing patterns) */
  Guide = 'guide',
  /** Render only marker patterns (finder patterns) */
  Marker = 'marker',
}

/**
 * Dot style for QR code modules
 */
export enum DotStyle {
  /** Square modules (default) */
  Square = 'square',
  /** Rounded square modules */
  Rounded = 'rounded',
  /** Circular dot modules */
  Dots = 'dots',
  /** Diamond shaped modules */
  Diamond = 'diamond',
  /** Star shaped modules */
  Star = 'star',
  /** Classy style with special corners */
  Classy = 'classy',
  /** Rounded classy style */
  ClassyRounded = 'classy-rounded',
  /** Extra rounded for super smooth edges */
  ExtraRounded = 'extra-rounded',
  /** Hexagon shaped modules */
  Hexagon = 'hexagon',
  /** Liquid/blob style modules - organic flowing shapes */
  Liquid = 'liquid',
  /** Smooth dots with gradient-like appearance */
  SmoothDots = 'smooth-dots',
  /** Smooth flow style - connected liquid modules */
  SmoothFlow = 'smooth-flow',
  /** Ultra smooth style - like ink flowing, uses advanced metaball algorithm */
  UltraSmooth = 'ultra-smooth',
}

/**
 * Marker (finder pattern) outer frame shape
 */
export enum MarkerShape {
  /** Square frame */
  Square = 'square',
  /** Circular frame */
  Circle = 'circle',
  /** Rounded square frame */
  RoundedSquare = 'rounded-square',
  /** Octagon frame */
  Octagon = 'octagon',
  /** Leaf shape frame */
  Leaf = 'leaf',
  /** Frame with decorative elements */
  Frame = 'frame',
  /** Extra decorative style */
  Extra = 'extra',
}

/**
 * Marker (finder pattern) inner shape
 */
export enum MarkerInner {
  /** Square inner */
  Square = 'square',
  /** Circle inner */
  Circle = 'circle',
  /** Diamond inner */
  Diamond = 'diamond',
  /** Rounded square inner */
  Rounded = 'rounded',
  /** Petal/flower inner */
  Petal = 'petal',
  /** Plus/cross inner */
  Plus = 'plus',
  /** Star inner */
  Star = 'star',
  /** Auto-match outer shape */
  Auto = 'auto',
}

/**
 * Logo shape type
 */
export enum LogoShape {
  /** Square logo */
  Square = 'square',
  /** Circular logo */
  Circle = 'circle',
  /** Rounded square logo */
  Rounded = 'rounded',
  /** Auto detect from image */
  Auto = 'auto',
}

/**
 * Logo aspect ratio handling
 */
export enum LogoAspectRatio {
  /** Keep original aspect ratio */
  Keep = 'keep',
  /** Fill the logo area (may distort) */
  Fill = 'fill',
  /** Cover the logo area (may crop) */
  Cover = 'cover',
  /** Contain within logo area */
  Contain = 'contain',
}

/**
 * Safe space level for QR code
 */
export enum SafeSpace {
  /** Full safe space around entire QR code */
  Full = 'full',
  /** Safe space around markers only */
  Marker = 'marker',
  /** Minimal safe space */
  Minimal = 'minimal',
  /** Extreme minimal safe space */
  Extreme = 'extreme',
  /** No safe space */
  None = 'none',
}

/**
 * Sub marker style
 */
export enum SubMarkerStyle {
  /** Square sub marker */
  Square = 'square',
  /** Circle sub marker */
  Circle = 'circle',
  /** Rounded square sub marker */
  Rounded = 'rounded',
  /** Diamond sub marker */
  Diamond = 'diamond',
  /** Plus/cross sub marker */
  Plus = 'plus',
}

/**
 * Gradient configuration
 */
export interface GradientConfig {
  /** Gradient type */
  type: 'linear' | 'radial';
  /** Color array */
  colors: string[];
  /** Optional color stops (0-1) */
  stops?: number[];
  /** Linear gradient direction in degrees (0-360) */
  direction?: number;
  /** Radial gradient center position (0-1) */
  position?: { x: number; y: number };
}

/**
 * Shadow effect configuration
 */
export interface ShadowConfig {
  /** Blur radius */
  blur: number;
  /** Shadow color */
  color: string;
  /** Horizontal offset */
  offsetX?: number;
  /** Vertical offset */
  offsetY?: number;
}

/**
 * Stroke effect configuration
 */
export interface StrokeConfig {
  /** Stroke width */
  width: number;
  /** Stroke color */
  color: string;
}

/**
 * Visual effect type
 */
export enum EffectType {
  /** No effect */
  None = 'none',
  /** Crystalize effect - creates crystalline pattern */
  Crystalize = 'crystalize',
}

/**
 * Transform configuration for QR code
 */
export interface TransformConfig {
  /** Perspective transformation on X axis (-1 to 1) */
  perspectiveX?: number;
  /** Perspective transformation on Y axis (-1 to 1) */
  perspectiveY?: number;
  /** Scale factor (0.1 to 2) */
  scale?: number;
}


/**
 * Sub marker configuration
 */
export interface SubMarkerConfig {
  /** Sub marker style */
  style?: SubMarkerStyle;
  /** Sub marker color */
  color?: string;
  /** Enable sub markers */
  enabled?: boolean;
}

/**
 * Eye (finder pattern) style configuration
 */
export interface EyeStyleConfig {
  /** Marker outer frame shape (new enhanced API) */
  markerShape?: MarkerShape;
  /** Marker inner shape (new enhanced API) */
  markerInner?: MarkerInner;
  /** Pixel style for the outer frame modules (new enhanced API) */
  pixelStyle?: DotStyle;

  /** Outer frame style (legacy, for backward compatibility) */
  outer?: {
    style?: DotStyle;
    color?: string;
    gradient?: GradientConfig;
  };
  /** Inner square style (legacy, for backward compatibility) */
  inner?: {
    style?: DotStyle;
    color?: string;
    gradient?: GradientConfig;
  };
}

/**
 * Style configuration for QR code
 */
export interface QRCodeStyle {
  /** Foreground color (module color) */
  fgColor?: string;
  /** Background color */
  bgColor?: string;
  /** Module size in pixels */
  size?: number;
  /** Margin around QR code in modules */
  margin?: number;
  /** Corner radius for modules (0-0.5, where 0.5 is circular) */
  cornerRadius?: number;

  /** Module dot style */
  dotStyle?: DotStyle;
  /** Foreground gradient (overrides fgColor) */
  gradient?: GradientConfig;
  /** Background gradient (overrides bgColor) */
  backgroundGradient?: GradientConfig;
  /** Background image URL */
  backgroundImage?: string;
  /** Eye style configuration (can be array for different styles per eye) */
  eyeStyle?: EyeStyleConfig | [EyeStyleConfig, EyeStyleConfig, EyeStyleConfig];

  /** Shadow effect */
  shadow?: ShadowConfig;
  /** Stroke effect */
  stroke?: StrokeConfig;

  /** Rotation angle in degrees (0, 90, 180, 270) */
  rotate?: 0 | 90 | 180 | 270;
  /** Invert colors (swap foreground and background) */
  invert?: boolean;
  /** Render layer for selective module rendering */
  renderLayer?: RenderLayer;

  /** Transform configuration */
  transform?: TransformConfig;
  /** Enable margin noise */
  marginNoise?: boolean;
  /** Random seed for noise generation */
  seed?: number;
  /** Safe space configuration */
  safeSpace?: SafeSpace;
  /** Sub marker configuration */
  subMarker?: SubMarkerConfig;

  /** Visual effect type */
  effect?: EffectType;
  /** Pixel size for each module (overrides default calculation) */
  pixelSize?: number;
}

/**
 * Logo configuration
 */
export interface LogoConfig {
  /** Logo image source (URL or base64) */
  src: string;
  /** Logo width (pixels or percentage of QR code size) */
  width?: number | string;
  /** Logo height (pixels or percentage of QR code size) */
  height?: number | string;
  /** Whether to add a border around the logo */
  border?: boolean;
  /** Border color */
  borderColor?: string;
  /** Border width in pixels */
  borderWidth?: number;
  /** Corner radius for logo */
  borderRadius?: number;
  /** Cross-origin setting for loading images */
  crossOrigin?: 'anonymous' | 'use-credentials';

  /** Logo shape */
  logoShape?: LogoShape;
  /** How to handle logo aspect ratio */
  aspectRatio?: LogoAspectRatio;
  /** Add white background behind logo */
  logoBackground?: boolean;
  /** Background padding around logo */
  logoBackgroundPadding?: number;
  /** Background color (default: white) */
  logoBackgroundColor?: string;
}

/**
 * Main QR code configuration
 */
export interface QRCodeConfig {
  /** Content to encode in the QR code */
  content: string;
  /** Error correction level */
  errorCorrectionLevel?: ErrorCorrectionLevel;
  /** Render type */
  renderType?: RenderType;
  /** Style configuration */
  style?: QRCodeStyle;
  /** Logo configuration */
  logo?: LogoConfig;
  /** Type number (version) of QR code (1-40, auto if not specified) */
  typeNumber?: number;
  /** Maximum type number (version) allowed (1-40) */
  maxTypeNumber?: number;
  /** Mask pattern (0-7, or -1 for auto selection) */
  maskPattern?: -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

/**
 * QR code generator options
 */
export interface GenerateOptions extends QRCodeConfig {
  /** Target container element */
  container?: HTMLElement;
}

/**
 * Download options
 */
export interface DownloadOptions {
  /** File name for download */
  fileName?: string;
  /** File format */
  format?: 'png' | 'jpeg' | 'svg';
  /** Quality for JPEG format (0-1) */
  quality?: number;
}

/**
 * QR code instance interface
 */
export interface QRCodeInstance {
  /** Update QR code content */
  update(config: Partial<QRCodeConfig>): void;
  /** Get data URL of QR code */
  toDataURL(format?: 'png' | 'jpeg', quality?: number): string;
  /** Download QR code as image */
  download(options?: DownloadOptions): void;
  /** Get SVG string (only for SVG render type) */
  toSVGString(): string;
  /** Destroy QR code instance */
  destroy(): void;
  /** Get the rendered element */
  getElement(): HTMLCanvasElement | SVGSVGElement | null;
}
