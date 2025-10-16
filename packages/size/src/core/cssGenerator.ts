/**
 * @ldesign/size - CSS Variable Generator
 * 
 * Generates CSS custom properties from size schemes
 */

import type { SizeScheme, CSSVariableOptions, GeneratedCSS } from '../types';
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

  // Font sizes
  Object.entries(scheme.fontSize).forEach(([key, value]) => {
    vars[getCSSVarName(`font-${key}`, prefix)] = String(value);
  });

  // Spacing
  Object.entries(scheme.spacing).forEach(([key, value]) => {
    vars[getCSSVarName(`space-${key}`, prefix)] = String(value);
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

  // Custom properties
  if (scheme.custom) {
    Object.entries(scheme.custom).forEach(([key, value]) => {
      vars[getCSSVarName(key, prefix)] = String(value);
    });
  }

  return vars;
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
  
  const cssVars = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value}${importantFlag};`)
    .join('\n');

  return `${selector} {\n${cssVars}\n}`;
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
function generateUtilityClasses(
  scheme: SizeScheme,
  options: CSSVariableOptions = {}
): string {
  const { prefix = 'size' } = options;
  const classes: string[] = [];

  // Spacing utilities
  Object.keys(scheme.spacing).forEach(key => {
    // Padding
    classes.push(`.p-${key} { padding: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.px-${key} { padding-left: var(${getCSSVarName(`space-${key}`, prefix)}); padding-right: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.py-${key} { padding-top: var(${getCSSVarName(`space-${key}`, prefix)}); padding-bottom: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.pt-${key} { padding-top: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.pr-${key} { padding-right: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.pb-${key} { padding-bottom: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.pl-${key} { padding-left: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    
    // Margin
    classes.push(`.m-${key} { margin: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.mx-${key} { margin-left: var(${getCSSVarName(`space-${key}`, prefix)}); margin-right: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.my-${key} { margin-top: var(${getCSSVarName(`space-${key}`, prefix)}); margin-bottom: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.mt-${key} { margin-top: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.mr-${key} { margin-right: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.mb-${key} { margin-bottom: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    classes.push(`.ml-${key} { margin-left: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
    
    // Gap
    classes.push(`.gap-${key} { gap: var(${getCSSVarName(`space-${key}`, prefix)}); }`);
  });

  // Font size utilities
  Object.keys(scheme.fontSize).forEach(key => {
    classes.push(`.text-${key} { font-size: var(${getCSSVarName(`font-${key}`, prefix)}); }`);
  });

  // Border radius utilities
  Object.keys(scheme.radius).forEach(key => {
    classes.push(`.rounded-${key} { border-radius: var(${getCSSVarName(`radius-${key}`, prefix)}); }`);
  });

  // Line height utilities
  Object.keys(scheme.lineHeight).forEach(key => {
    classes.push(`.leading-${key} { line-height: var(${getCSSVarName(`line-${key}`, prefix)}); }`);
  });

  // Letter spacing utilities
  Object.keys(scheme.letterSpacing).forEach(key => {
    classes.push(`.tracking-${key} { letter-spacing: var(${getCSSVarName(`letter-${key}`, prefix)}); }`);
  });

  return classes.join('\n');
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
  options: CSSVariableOptions = {}
): string {
  if (!scheme.breakpoints) return '';
  
  const { prefix = 'size' } = options;
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