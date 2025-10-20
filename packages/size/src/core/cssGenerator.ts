/**
 * @ldesign/size - CSS Variable Generator
 * 
 * Generates CSS custom properties from size schemes
 */

import type { CSSVariableOptions, GeneratedCSS, SizeScheme } from '../types';
import { getCSSVarName } from '../utils';

/**
 * Generate CSS variables from size scheme
 */
export function generateCSSVariables(
  scheme: SizeScheme,
  options: CSSVariableOptions = {}
): Record<string, string> {
  const { prefix = 'size' } = options;
  const vars: Record<string, string> = {};

  // Generate base size tokens (TDesign style)
  generateBaseSizeTokens(vars, prefix);

  // Font sizes
  Object.entries(scheme.fontSize).forEach(([key, value]) => {
    vars[getCSSVarName(`font-${key}`, prefix)] = String(value);
  });

  // Spacing - generate both semantic and numeric
  Object.entries(scheme.spacing).forEach(([key, value]) => {
    vars[getCSSVarName(`space-${key}`, prefix)] = String(value);
    vars[getCSSVarName(`spacing-${key}`, prefix)] = String(value);
  });

  // Border radius
  Object.entries(scheme.radius).forEach(([key, value]) => {
    vars[getCSSVarName(`radius-${key}`, prefix)] = String(value);
  });

  // Line heights
  Object.entries(scheme.lineHeight).forEach(([key, value]) => {
    vars[getCSSVarName(`line-${key}`, prefix)] = String(value);
  });

  // Letter spacing
  Object.entries(scheme.letterSpacing).forEach(([key, value]) => {
    vars[getCSSVarName(`letter-${key}`, prefix)] = String(value);
  });

  // Component sizes
  // Buttons
  Object.entries(scheme.components.button).forEach(([size, config]) => {
    vars[getCSSVarName(`btn-${size}-height`, prefix)] = String(config.height);
    vars[getCSSVarName(`btn-${size}-padding`, prefix)] = String(config.padding);
    vars[getCSSVarName(`btn-${size}-font`, prefix)] = String(config.fontSize);
  });

  // Inputs
  Object.entries(scheme.components.input).forEach(([size, config]) => {
    vars[getCSSVarName(`input-${size}-height`, prefix)] = String(config.height);
    vars[getCSSVarName(`input-${size}-padding`, prefix)] = String(config.padding);
    vars[getCSSVarName(`input-${size}-font`, prefix)] = String(config.fontSize);
  });

  // Icons
  Object.entries(scheme.components.icon).forEach(([size, value]) => {
    vars[getCSSVarName(`icon-${size}`, prefix)] = String(value);
  });

  // Avatars
  Object.entries(scheme.components.avatar).forEach(([size, value]) => {
    vars[getCSSVarName(`avatar-${size}`, prefix)] = String(value);
  });

  // Cards
  if (scheme.components.card) {
    Object.entries(scheme.components.card).forEach(([size, value]) => {
      vars[getCSSVarName(`card-${size}-padding`, prefix)] = String(value);
    });
  }

  // Grid
  if (scheme.grid) {
    vars[getCSSVarName('grid-columns', prefix)] = String(scheme.grid.columns);
    vars[getCSSVarName('grid-gutter', prefix)] = String(scheme.grid.gutter);
    vars[getCSSVarName('grid-margin', prefix)] = String(scheme.grid.margin);
  }

  // Breakpoints
  if (scheme.breakpoints) {
    Object.entries(scheme.breakpoints).forEach(([key, value]) => {
      vars[getCSSVarName(`breakpoint-${key}`, prefix)] = String(value);
    });
  }

  // Generate component size tokens
  generateComponentSizeTokens(vars, scheme, prefix);

  // Generate padding tokens
  generatePaddingTokens(vars, scheme, prefix);

  // Generate margin tokens
  generateMarginTokens(vars, scheme, prefix);

  // Generate typography tokens
  generateTypographyTokens(vars, scheme, prefix);

  // Custom properties
  if (scheme.custom) {
    Object.entries(scheme.custom).forEach(([key, value]) => {
      vars[getCSSVarName(key, prefix)] = String(value);
    });
  }

  return vars;
}

/**
 * Generate base size tokens (TDesign style)
 */
function generateBaseSizeTokens(
  vars: Record<string, string>,
  prefix: string
): void {
  // Base sizes in pixels (2px increment)
  const baseSizes: Record<string, string> = {
    '0': '0px',
    '1': '2px',
    '2': '4px',
    '3': '6px',
    '4': '8px',
    '5': '12px',
    '6': '16px',
    '7': '20px',
    '8': '24px',
    '9': '28px',
    '10': '32px',
    '11': '36px',
    '12': '40px',
    '13': '48px',
    '14': '56px',
    '15': '64px',
    '16': '72px',
    '17': '80px',
    '18': '96px',
    '19': '112px',
    '20': '128px',
    '24': '192px',
    '32': '256px',
    '40': '320px',
    '48': '384px',
    '56': '448px',
    '64': '512px'
  };

  Object.entries(baseSizes).forEach(([key, value]) => {
    vars[getCSSVarName(`size-${key}`, prefix)] = value;
  });
}

/**
 * Generate component size tokens
 */
function generateComponentSizeTokens(
  vars: Record<string, string>,
  scheme: SizeScheme,
  prefix: string
): void {
  // Component height tokens
  const compSizes = {
    'xxxs': `var(${getCSSVarName('size-6', prefix)})`,  // 16px
    'xxs': `var(${getCSSVarName('size-7', prefix)})`,   // 20px
    'xs': `var(${getCSSVarName('size-8', prefix)})`,    // 24px
    's': `var(${getCSSVarName('size-9', prefix)})`,     // 28px
    'm': `var(${getCSSVarName('size-10', prefix)})`,    // 32px
    'l': `var(${getCSSVarName('size-11', prefix)})`,    // 36px
    'xl': `var(${getCSSVarName('size-12', prefix)})`,   // 40px
    'xxl': `var(${getCSSVarName('size-13', prefix)})`,  // 48px
    'xxxl': `var(${getCSSVarName('size-14', prefix)})`, // 56px
    'xxxxl': `var(${getCSSVarName('size-15', prefix)})`, // 64px
    'xxxxxl': `var(${getCSSVarName('size-16', prefix)})` // 72px
  };

  Object.entries(compSizes).forEach(([key, value]) => {
    vars[getCSSVarName(`comp-size-${key}`, prefix)] = value;
  });
}

/**
 * Generate padding tokens
 */
function generatePaddingTokens(
  vars: Record<string, string>,
  scheme: SizeScheme,
  prefix: string
): void {
  // Popup padding
  const popPadding = {
    's': `var(${getCSSVarName('size-2', prefix)})`,
    'm': `var(${getCSSVarName('size-3', prefix)})`,
    'l': `var(${getCSSVarName('size-4', prefix)})`,
    'xl': `var(${getCSSVarName('size-5', prefix)})`,
    'xxl': `var(${getCSSVarName('size-6', prefix)})`
  };

  Object.entries(popPadding).forEach(([key, value]) => {
    vars[getCSSVarName(`pop-padding-${key}`, prefix)] = value;
  });

  // Component padding LR (left-right)
  const paddingLR = {
    'xxs': `var(${getCSSVarName('size-1', prefix)})`,
    'xs': `var(${getCSSVarName('size-2', prefix)})`,
    's': `var(${getCSSVarName('size-4', prefix)})`,
    'm': `var(${getCSSVarName('size-5', prefix)})`,
    'l': `var(${getCSSVarName('size-6', prefix)})`,
    'xl': `var(${getCSSVarName('size-8', prefix)})`,
    'xxl': `var(${getCSSVarName('size-10', prefix)})`
  };

  Object.entries(paddingLR).forEach(([key, value]) => {
    vars[getCSSVarName(`comp-paddingLR-${key}`, prefix)] = value;
  });

  // Component padding TB (top-bottom)
  const paddingTB = {
    'xxs': `var(${getCSSVarName('size-1', prefix)})`,
    'xs': `var(${getCSSVarName('size-2', prefix)})`,
    's': `var(${getCSSVarName('size-3', prefix)})`,
    'm': `var(${getCSSVarName('size-4', prefix)})`,
    'l': `var(${getCSSVarName('size-5', prefix)})`,
    'xl': `var(${getCSSVarName('size-6', prefix)})`,
    'xxl': `var(${getCSSVarName('size-8', prefix)})`
  };

  Object.entries(paddingTB).forEach(([key, value]) => {
    vars[getCSSVarName(`comp-paddingTB-${key}`, prefix)] = value;
  });
}

/**
 * Generate margin tokens
 */
function generateMarginTokens(
  vars: Record<string, string>,
  scheme: SizeScheme,
  prefix: string
): void {
  const margins = {
    'xxs': `var(${getCSSVarName('size-1', prefix)})`,
    'xs': `var(${getCSSVarName('size-2', prefix)})`,
    's': `var(${getCSSVarName('size-4', prefix)})`,
    'm': `var(${getCSSVarName('size-5', prefix)})`,
    'l': `var(${getCSSVarName('size-6', prefix)})`,
    'xl': `var(${getCSSVarName('size-7', prefix)})`,
    'xxl': `var(${getCSSVarName('size-8', prefix)})`,
    'xxxl': `var(${getCSSVarName('size-10', prefix)})`,
    'xxxxl': `var(${getCSSVarName('size-12', prefix)})`
  };

  Object.entries(margins).forEach(([key, value]) => {
    vars[getCSSVarName(`comp-margin-${key}`, prefix)] = value;
  });
}

/**
 * Generate typography tokens
 */
function generateTypographyTokens(
  vars: Record<string, string>,
  scheme: SizeScheme,
  prefix: string
): void {
  // Font families
  vars[getCSSVarName('font-family', prefix)] = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  vars[getCSSVarName('font-family-mono', prefix)] = '"SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

  // Font weights
  const weights = {
    'thin': '100',
    'extralight': '200',
    'light': '300',
    'regular': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
    'extrabold': '800',
    'black': '900'
  };

  Object.entries(weights).forEach(([key, value]) => {
    vars[getCSSVarName(`font-weight-${key}`, prefix)] = value;
  });

  // Border widths
  vars[getCSSVarName('border-width-thin', prefix)] = '1px';
  vars[getCSSVarName('border-width-medium', prefix)] = '2px';
  vars[getCSSVarName('border-width-thick', prefix)] = '3px';

  // Shadows
  vars[getCSSVarName('shadow-1', prefix)] = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
  vars[getCSSVarName('shadow-2', prefix)] = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
  vars[getCSSVarName('shadow-3', prefix)] = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
  vars[getCSSVarName('shadow-4', prefix)] = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  vars[getCSSVarName('shadow-5', prefix)] = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  vars[getCSSVarName('shadow-6', prefix)] = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';

  // Z-index
  vars[getCSSVarName('z-dropdown', prefix)] = '1000';
  vars[getCSSVarName('z-sticky', prefix)] = '1020';
  vars[getCSSVarName('z-fixed', prefix)] = '1030';
  vars[getCSSVarName('z-modal-backdrop', prefix)] = '1040';
  vars[getCSSVarName('z-modal', prefix)] = '1050';
  vars[getCSSVarName('z-popover', prefix)] = '1060';
  vars[getCSSVarName('z-tooltip', prefix)] = '1070';
  vars[getCSSVarName('z-notification', prefix)] = '1080';

  // Animation durations
  vars[getCSSVarName('duration-instant', prefix)] = '0ms';
  vars[getCSSVarName('duration-fast', prefix)] = '150ms';
  vars[getCSSVarName('duration-normal', prefix)] = '300ms';
  vars[getCSSVarName('duration-slow', prefix)] = '450ms';
  vars[getCSSVarName('duration-slower', prefix)] = '600ms';

  // Easing functions
  vars[getCSSVarName('ease-linear', prefix)] = 'linear';
  vars[getCSSVarName('ease-in', prefix)] = 'cubic-bezier(0.4, 0, 1, 1)';
  vars[getCSSVarName('ease-out', prefix)] = 'cubic-bezier(0, 0, 0.2, 1)';
  vars[getCSSVarName('ease-in-out', prefix)] = 'cubic-bezier(0.4, 0, 0.2, 1)';
}

/**
 * Generate CSS string from variables
 */
export function generateCSSString(
  variables: Record<string, string>,
  options: CSSVariableOptions = {}
): string {
  const { selector = ':root', important = false } = options;
  const importantFlag = important ? ' !important' : '';
  
  // 使用数组 push 和 join 替代字符串拼接，效率更高
  const lines: string[] = [`${selector} {`];
  
  for (const [key, value] of Object.entries(variables)) {
    lines.push(`  ${key}: ${value}${importantFlag};`);
  }
  
  lines.push('}');
  return lines.join('\n');
}

/**
 * Generate complete CSS with utilities
 */
export function generateCSS(
  scheme: SizeScheme,
  options: CSSVariableOptions = {}
): GeneratedCSS {
  const variables = generateCSSVariables(scheme, options);
  const variablesCSS = generateCSSString(variables, options);
  
  // Generate utility classes
  const utilities = generateUtilityClasses(scheme, options);
  
  // Generate component classes
  const components = generateComponentClasses(scheme, options);
  
  // Generate responsive utilities
  const responsive = generateResponsiveUtilities(scheme, options);

  return {
    variables: variablesCSS,
    utilities,
    components,
    responsive,
    full: [variablesCSS, utilities, components, responsive]
      .filter(Boolean)
      .join('\n\n')
  };
}

/**
 * Generate utility classes
 */
// 使用缓存的 CSS 生成器
const utilityClassesCache = new WeakMap<SizeScheme, string>();

function generateUtilityClasses(
  scheme: SizeScheme,
  options: CSSVariableOptions = {}
): string {
  // 检查缓存
  if (utilityClassesCache.has(scheme)) {
    return utilityClassesCache.get(scheme)!;
  }
  
  const { prefix = 'size' } = options;
  const classes: string[] = [];
  const spaceVar = (key: string) => `var(${getCSSVarName(`space-${key}`, prefix)})`;

  // Spacing utilities - 减少重复计算
  for (const key of Object.keys(scheme.spacing)) {
    const sv = spaceVar(key);
    // Padding
    classes.push(
      `.p-${key} { padding: ${sv}; }`,
      `.px-${key} { padding-left: ${sv}; padding-right: ${sv}; }`,
      `.py-${key} { padding-top: ${sv}; padding-bottom: ${sv}; }`,
      `.pt-${key} { padding-top: ${sv}; }`,
      `.pr-${key} { padding-right: ${sv}; }`,
      `.pb-${key} { padding-bottom: ${sv}; }`,
      `.pl-${key} { padding-left: ${sv}; }`
    );
    
    // Margin
    classes.push(
      `.m-${key} { margin: ${sv}; }`,
      `.mx-${key} { margin-left: ${sv}; margin-right: ${sv}; }`,
      `.my-${key} { margin-top: ${sv}; margin-bottom: ${sv}; }`,
      `.mt-${key} { margin-top: ${sv}; }`,
      `.mr-${key} { margin-right: ${sv}; }`,
      `.mb-${key} { margin-bottom: ${sv}; }`,
      `.ml-${key} { margin-left: ${sv}; }`,
      `.gap-${key} { gap: ${sv}; }`
    );
  }

  // 使用 for...of 减少函数调用开销
  // Font size utilities
  for (const key of Object.keys(scheme.fontSize)) {
    classes.push(`.text-${key} { font-size: var(${getCSSVarName(`font-${key}`, prefix)}); }`);
  }

  // Border radius utilities
  for (const key of Object.keys(scheme.radius)) {
    classes.push(`.rounded-${key} { border-radius: var(${getCSSVarName(`radius-${key}`, prefix)}); }`);
  }

  // Line height utilities
  for (const key of Object.keys(scheme.lineHeight)) {
    classes.push(`.leading-${key} { line-height: var(${getCSSVarName(`line-${key}`, prefix)}); }`);
  }

  // Letter spacing utilities
  for (const key of Object.keys(scheme.letterSpacing)) {
    classes.push(`.tracking-${key} { letter-spacing: var(${getCSSVarName(`letter-${key}`, prefix)}); }`);
  }

  const result = classes.join('\n');
  
  // 缓存结果
  utilityClassesCache.set(scheme, result);
  
  return result;
}

/**
 * Generate component classes
 */
function generateComponentClasses(
  scheme: SizeScheme,
  options: CSSVariableOptions = {}
): string {
  const { prefix = 'size' } = options;
  const classes: string[] = [];

  // Button components
  Object.keys(scheme.components.button).forEach(size => {
    classes.push(`
.btn-${size} {
  height: var(${getCSSVarName(`btn-${size}-height`, prefix)});
  padding: var(${getCSSVarName(`btn-${size}-padding`, prefix)});
  font-size: var(${getCSSVarName(`btn-${size}-font`, prefix)});
}`);
  });

  // Input components
  Object.keys(scheme.components.input).forEach(size => {
    classes.push(`
.input-${size} {
  height: var(${getCSSVarName(`input-${size}-height`, prefix)});
  padding: var(${getCSSVarName(`input-${size}-padding`, prefix)});
  font-size: var(${getCSSVarName(`input-${size}-font`, prefix)});
}`);
  });

  // Icon components
  Object.keys(scheme.components.icon).forEach(size => {
    classes.push(`
.icon-${size} {
  width: var(${getCSSVarName(`icon-${size}`, prefix)});
  height: var(${getCSSVarName(`icon-${size}`, prefix)});
}`);
  });

  // Avatar components
  Object.keys(scheme.components.avatar).forEach(size => {
    classes.push(`
.avatar-${size} {
  width: var(${getCSSVarName(`avatar-${size}`, prefix)});
  height: var(${getCSSVarName(`avatar-${size}`, prefix)});
}`);
  });

  return classes.join('\n');
}

/**
 * Generate responsive utilities
 */
function generateResponsiveUtilities(
  scheme: SizeScheme,
  _options: Record<string, any> = {}
): string {
  if (!scheme.breakpoints) return '';
  
  // const { prefix = 'size' } = options; // prefix unused in this function
  const breakpoints = scheme.breakpoints;
  const media: string[] = [];

  // Generate media queries for each breakpoint
  Object.entries(breakpoints).forEach(([key, value]) => {
    media.push(`
@media (min-width: ${value}) {
  .${key}\\:p-0 { padding: 0; }
  .${key}\\:m-0 { margin: 0; }
  /* Add more responsive utilities as needed */
}`);
  });

  return media.join('\n');
}

/**
 * Inject CSS into document
 */
export function injectCSS(
  css: string,
  id = 'ldesign-size-styles'
): void {
  if (typeof window === 'undefined' || !document) return;

  // Remove existing style element if present
  const existing = document.getElementById(id);
  if (existing) {
    existing.remove();
  }

  // Create and inject new style element
  const style = document.createElement('style');
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

/**
 * Remove injected CSS
 */
export function removeCSS(id = 'ldesign-size-styles'): void {
  if (typeof window === 'undefined' || !document) return;

  const element = document.getElementById(id);
  if (element) {
    element.remove();
  }
}