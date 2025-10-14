/**
 * @ldesign/color - CSS Variables Generation with Theme Support
 * 
 * Functions for generating CSS custom properties with light/dark mode support
 */

import { ThemePalettes } from './darkMode';

// Re-export ThemePalettes type
export type { ThemePalettes } from './darkMode';

/**
 * Generate CSS variable name from color name and shade
 */
function generateCssVarName(colorName: string, shade: string): string {
  return `--color-${colorName}-${shade}`;
}

/**
 * Generate CSS variables for a single color palette
 */
function generatePaletteVars(colorName: string, palette: Record<string, string>): string {
  return Object.entries(palette)
    .map(([shade, hex]) => `  ${generateCssVarName(colorName, shade)}: ${hex};`)
    .join('\n');
}

/**
 * Generate CSS variables for all palettes in a theme
 */
function generateThemeVars(theme: ThemePalettes['light'] | ThemePalettes['dark']): string {
  const vars: string[] = [];
  
  Object.entries(theme).forEach(([colorName, palette]) => {
    vars.push(`  /* ${colorName.charAt(0).toUpperCase() + colorName.slice(1)} */`);
    vars.push(generatePaletteVars(colorName, palette));
  });
  
  return vars.join('\n');
}

/**
 * Generate complete CSS with both light and dark mode variables
 */
export function generateThemedCssVariables(palettes: ThemePalettes): string {
  const lightVars = generateThemeVars(palettes.light);
  const darkVars = generateThemeVars(palettes.dark);
  
  return `/* Light Mode (Default) */
:root {
${lightVars}
}

/* Dark Mode */
:root[data-theme-mode='dark'] {
${darkVars}
}`;
}

/**
 * Generate CSS variables with semantic color aliases
 */
export function generateSemanticCssVariables(palettes: ThemePalettes): string {
  const semanticAliases = `
  /* Semantic Aliases */
  --color-background: var(--color-gray-50);
  --color-background-secondary: var(--color-gray-100);
  --color-background-tertiary: var(--color-gray-200);
  
  --color-text-primary: var(--color-gray-900);
  --color-text-secondary: var(--color-gray-700);
  --color-text-tertiary: var(--color-gray-500);
  --color-text-disabled: var(--color-gray-400);
  
  --color-border: var(--color-gray-300);
  --color-border-light: var(--color-gray-200);
  --color-border-dark: var(--color-gray-400);
  
  --color-primary-default: var(--color-primary-500);
  --color-primary-hover: var(--color-primary-600);
  --color-primary-active: var(--color-primary-700);
  
  --color-success-default: var(--color-success-500);
  --color-success-hover: var(--color-success-600);
  --color-success-active: var(--color-success-700);
  
  --color-warning-default: var(--color-warning-500);
  --color-warning-hover: var(--color-warning-600);
  --color-warning-active: var(--color-warning-700);
  
  --color-danger-default: var(--color-danger-500);
  --color-danger-hover: var(--color-danger-600);
  --color-danger-active: var(--color-danger-700);
  
  --color-info-default: var(--color-info-500);
  --color-info-hover: var(--color-info-600);
  --color-info-active: var(--color-info-700);`;
  
  const darkSemanticAliases = `
  /* Semantic Aliases for Dark Mode */
  --color-background: var(--color-gray-950);
  --color-background-secondary: var(--color-gray-900);
  --color-background-tertiary: var(--color-gray-850);
  
  --color-text-primary: var(--color-gray-50);
  --color-text-secondary: var(--color-gray-200);
  --color-text-tertiary: var(--color-gray-400);
  --color-text-disabled: var(--color-gray-600);
  
  --color-border: var(--color-gray-700);
  --color-border-light: var(--color-gray-800);
  --color-border-dark: var(--color-gray-600);
  
  --color-primary-default: var(--color-primary-500);
  --color-primary-hover: var(--color-primary-400);
  --color-primary-active: var(--color-primary-300);
  
  --color-success-default: var(--color-success-500);
  --color-success-hover: var(--color-success-400);
  --color-success-active: var(--color-success-300);
  
  --color-warning-default: var(--color-warning-500);
  --color-warning-hover: var(--color-warning-400);
  --color-warning-active: var(--color-warning-300);
  
  --color-danger-default: var(--color-danger-500);
  --color-danger-hover: var(--color-danger-400);
  --color-danger-active: var(--color-danger-300);
  
  --color-info-default: var(--color-info-500);
  --color-info-hover: var(--color-info-400);
  --color-info-active: var(--color-info-300);`;
  
  return `/* Light Mode (Default) */
:root {
${generateThemeVars(palettes.light)}
${semanticAliases}
}

/* Dark Mode */
:root[data-theme-mode='dark'] {
${generateThemeVars(palettes.dark)}
${darkSemanticAliases}
}`;
}

/**
 * Inject CSS variables into the document head
 */
export function injectThemedCssVariables(palettes: ThemePalettes, includeSemantics: boolean = true): void {
  const css = includeSemantics 
    ? generateSemanticCssVariables(palettes)
    : generateThemedCssVariables(palettes);
  
  // Check if style element already exists
  let styleElement = document.getElementById('ldesign-color-theme');
  
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'ldesign-color-theme';
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = css;
}

/**
 * Toggle theme mode on the root element
 */
export function setThemeMode(mode: 'light' | 'dark'): void {
  const root = document.documentElement;
  root.setAttribute('data-theme-mode', mode);
}

/**
 * Get current theme mode
 */
export function getThemeMode(): 'light' | 'dark' {
  const root = document.documentElement;
  return root.getAttribute('data-theme-mode') === 'dark' ? 'dark' : 'light';
}

/**
 * Toggle between light and dark mode
 */
export function toggleThemeMode(): 'light' | 'dark' {
  const currentMode = getThemeMode();
  const newMode = currentMode === 'light' ? 'dark' : 'light';
  setThemeMode(newMode);
  return newMode;
}

/**
 * Initialize theme mode based on system preference
 */
export function initThemeMode(): void {
  // Check for saved preference
  const savedMode = localStorage.getItem('theme-mode');
  
  if (savedMode === 'dark' || savedMode === 'light') {
    setThemeMode(savedMode);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setThemeMode(prefersDark ? 'dark' : 'light');
  }
  
  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme-mode')) {
      setThemeMode(e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Save theme mode preference
 */
export function saveThemeMode(mode: 'light' | 'dark'): void {
  localStorage.setItem('theme-mode', mode);
  setThemeMode(mode);
}