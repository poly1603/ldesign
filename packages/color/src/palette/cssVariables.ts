/**
 * @ldesign/color - CSS Variables Generation with Theme Support
 * 
 * Functions for generating CSS custom properties with light/dark mode support
 */

import type { ThemePalettes } from './darkMode';

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
  /* ========== Background Colors ========== */
  /* Page & Container Backgrounds */
  --color-bg-page: var(--color-gray-50);                      /* 页面背景 */
  --color-bg-container: #ffffff;                              /* 主容器背景 */
  --color-bg-container-secondary: var(--color-gray-50);       /* 次级容器背景 */
  --color-bg-container-tertiary: var(--color-gray-100);       /* 三级容器背景 */
  
  /* Component Backgrounds */
  --color-bg-component: var(--color-gray-100);                /* 组件背景 */
  --color-bg-component-hover: var(--color-gray-150);          /* 组件悬停背景 */
  --color-bg-component-active: var(--color-gray-200);         /* 组件激活背景 */
  --color-bg-component-disabled: var(--color-gray-50);        /* 组件禁用背景 */
  
  /* Special Backgrounds */
  --color-bg-overlay: rgba(0, 0, 0, 0.45);                    /* 遮罩层背景 */
  --color-bg-mask: rgba(0, 0, 0, 0.6);                        /* 模态遮罩背景 */
  --color-bg-tooltip: var(--color-gray-900);                  /* 提示框背景 */
  --color-bg-popover: #ffffff;                                /* 弹出框背景 */
  
  /* Status Backgrounds */
  --color-bg-success: var(--color-success-50);                /* 成功背景 */
  --color-bg-warning: var(--color-warning-50);                /* 警告背景 */
  --color-bg-error: var(--color-danger-50);                   /* 错误背景 */
  --color-bg-info: var(--color-info-50);                      /* 信息背景 */
  
  /* ========== Text Colors ========== */
  /* Primary Text Hierarchy */
  --color-text-primary: var(--color-gray-900);                /* 主要文字 */
  --color-text-secondary: var(--color-gray-700);              /* 次要文字 */
  --color-text-tertiary: var(--color-gray-500);               /* 辅助文字 */
  --color-text-quaternary: var(--color-gray-400);             /* 四级文字 */
  --color-text-disabled: var(--color-gray-400);               /* 禁用文字 */
  --color-text-placeholder: var(--color-gray-400);            /* 占位符文字 */
  
  /* Special Text Colors */
  --color-text-inverse: #ffffff;                              /* 反色文字 */
  --color-text-inverse-secondary: rgba(255, 255, 255, 0.85);  /* 反色次要文字 */
  --color-text-link: var(--color-primary-500);                /* 链接文字 */
  --color-text-link-hover: var(--color-primary-600);          /* 链接悬停文字 */
  --color-text-link-active: var(--color-primary-700);         /* 链接激活文字 */
  --color-text-link-visited: var(--color-primary-700);        /* 已访问链接文字 */
  
  /* Status Text Colors */
  --color-text-success: var(--color-success-600);             /* 成功文字 */
  --color-text-warning: var(--color-warning-600);             /* 警告文字 */
  --color-text-error: var(--color-danger-600);                /* 错误文字 */
  --color-text-info: var(--color-info-600);                   /* 信息文字 */
  
  /* ========== Border Colors ========== */
  /* Default Borders */
  --color-border: var(--color-gray-300);                      /* 默认边框 */
  --color-border-light: var(--color-gray-200);                /* 浅色边框 */
  --color-border-lighter: var(--color-gray-100);              /* 更浅边框 */
  --color-border-dark: var(--color-gray-400);                 /* 深色边框 */
  --color-border-darker: var(--color-gray-500);               /* 更深边框 */
  
  /* Component Borders */
  --color-border-input: var(--color-gray-300);                /* 输入框边框 */
  --color-border-input-hover: var(--color-gray-400);          /* 输入框悬停边框 */
  --color-border-input-focus: var(--color-primary-500);       /* 输入框聚焦边框 */
  --color-border-input-error: var(--color-danger-500);        /* 输入框错误边框 */
  --color-border-input-disabled: var(--color-gray-200);       /* 输入框禁用边框 */
  
  /* ========== Primary Color States ========== */
  --color-primary-lighter: var(--color-primary-100);
  --color-primary-light: var(--color-primary-200);
  --color-primary-default: var(--color-primary-500);
  --color-primary-hover: var(--color-primary-600);
  --color-primary-active: var(--color-primary-700);
  --color-primary-darker: var(--color-primary-800);
  --color-primary-disabled: var(--color-primary-300);
  
  /* ========== Success Color States ========== */
  --color-success-lighter: var(--color-success-100);
  --color-success-light: var(--color-success-200);
  --color-success-default: var(--color-success-500);
  --color-success-hover: var(--color-success-600);
  --color-success-active: var(--color-success-700);
  --color-success-darker: var(--color-success-800);
  --color-success-disabled: var(--color-success-300);
  
  /* ========== Warning Color States ========== */
  --color-warning-lighter: var(--color-warning-100);
  --color-warning-light: var(--color-warning-200);
  --color-warning-default: var(--color-warning-500);
  --color-warning-hover: var(--color-warning-600);
  --color-warning-active: var(--color-warning-700);
  --color-warning-darker: var(--color-warning-800);
  --color-warning-disabled: var(--color-warning-300);
  
  /* ========== Danger/Error Color States ========== */
  --color-danger-lighter: var(--color-danger-100);
  --color-danger-light: var(--color-danger-200);
  --color-danger-default: var(--color-danger-500);
  --color-danger-hover: var(--color-danger-600);
  --color-danger-active: var(--color-danger-700);
  --color-danger-darker: var(--color-danger-800);
  --color-danger-disabled: var(--color-danger-300);
  
  /* ========== Info Color States ========== */
  --color-info-lighter: var(--color-info-100);
  --color-info-light: var(--color-info-200);
  --color-info-default: var(--color-info-500);
  --color-info-hover: var(--color-info-600);
  --color-info-active: var(--color-info-700);
  --color-info-darker: var(--color-info-800);
  --color-info-disabled: var(--color-info-300);
  
  /* ========== Shadows ========== */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
  --shadow-outline: 0 0 0 3px rgba(66, 153, 225, 0.5);
  
  /* ========== Opacity ========== */
  --opacity-0: 0;
  --opacity-5: 0.05;
  --opacity-10: 0.1;
  --opacity-20: 0.2;
  --opacity-25: 0.25;
  --opacity-30: 0.3;
  --opacity-40: 0.4;
  --opacity-50: 0.5;
  --opacity-60: 0.6;
  --opacity-70: 0.7;
  --opacity-75: 0.75;
  --opacity-80: 0.8;
  --opacity-90: 0.9;
  --opacity-95: 0.95;
  --opacity-100: 1;
  
  /* ========== Z-Index ========== */
  --z-index-dropdown: 1000;
  --z-index-sticky: 1020;
  --z-index-fixed: 1030;
  --z-index-modal-backdrop: 1040;
  --z-index-modal: 1050;
  --z-index-popover: 1060;
  --z-index-tooltip: 1070;
  --z-index-notification: 1080;
  
  /* ========== Legacy Aliases (for backward compatibility) ========== */
  --color-background: var(--color-bg-container);
  --color-background-secondary: var(--color-bg-container-secondary);
  --color-background-tertiary: var(--color-bg-container-tertiary);`;
  
  const darkSemanticAliases = `
  /* ========== Background Colors (Dark Mode) ========== */
  /* Page & Container Backgrounds */
  --color-bg-page: var(--color-gray-1000);                    /* 页面背景 - darkest */
  --color-bg-container: var(--color-gray-900);                /* 主容器背景 - elevated from page */
  --color-bg-container-secondary: var(--color-gray-850);      /* 次级容器背景 */
  --color-bg-container-tertiary: var(--color-gray-800);       /* 三级容器背景 */
  
  /* Component Backgrounds */
  --color-bg-component: var(--color-gray-800);                /* 组件背景 */
  --color-bg-component-hover: var(--color-gray-700);          /* 组件悬停背景 */
  --color-bg-component-active: var(--color-gray-600);         /* 组件激活背景 */
  --color-bg-component-disabled: var(--color-gray-850);       /* 组件禁用背景 */
  
  /* Special Backgrounds */
  --color-bg-overlay: rgba(0, 0, 0, 0.7);                     /* 遮罩层背景 */
  --color-bg-mask: rgba(0, 0, 0, 0.8);                        /* 模态遮罩背景 */
  --color-bg-tooltip: var(--color-gray-800);                  /* 提示框背景 - dark elevated */
  --color-bg-popover: var(--color-gray-850);                  /* 弹出框背景 */
  
  /* Status Backgrounds */
  --color-bg-success: var(--color-success-900);               /* 成功背景 - very dark */
  --color-bg-warning: var(--color-warning-900);               /* 警告背景 - very dark */
  --color-bg-error: var(--color-danger-900);                  /* 错误背景 - very dark */
  --color-bg-info: var(--color-info-900);                     /* 信息背景 - very dark */
  
  /* ========== Text Colors (Dark Mode) ========== */
  /* Primary Text Hierarchy */
  --color-text-primary: var(--color-gray-50);                 /* 主要文字 */
  --color-text-secondary: var(--color-gray-200);              /* 次要文字 */
  --color-text-tertiary: var(--color-gray-400);               /* 辅助文字 */
  --color-text-quaternary: var(--color-gray-500);             /* 四级文字 */
  --color-text-disabled: var(--color-gray-600);               /* 禁用文字 */
  --color-text-placeholder: var(--color-gray-600);            /* 占位符文字 */
  
  /* Special Text Colors */
  --color-text-inverse: var(--color-gray-900);                /* 反色文字 */
  --color-text-inverse-secondary: var(--color-gray-800);      /* 反色次要文字 */
  --color-text-link: var(--color-primary-400);                /* 链接文字 */
  --color-text-link-hover: var(--color-primary-300);          /* 链接悬停文字 */
  --color-text-link-active: var(--color-primary-200);         /* 链接激活文字 */
  --color-text-link-visited: var(--color-primary-500);        /* 已访问链接文字 */
  
  /* Status Text Colors */
  --color-text-success: var(--color-success-400);             /* 成功文字 */
  --color-text-warning: var(--color-warning-400);             /* 警告文字 */
  --color-text-error: var(--color-danger-400);                /* 错误文字 */
  --color-text-info: var(--color-info-400);                   /* 信息文字 */
  
  /* ========== Border Colors (Dark Mode) ========== */
  /* Default Borders */
  --color-border: var(--color-gray-700);                      /* 默认边框 */
  --color-border-light: var(--color-gray-750);                /* 浅色边框 */
  --color-border-lighter: var(--color-gray-800);              /* 更浅边框 */
  --color-border-dark: var(--color-gray-600);                 /* 深色边框 */
  --color-border-darker: var(--color-gray-500);               /* 更深边框 */
  
  /* Component Borders */
  --color-border-input: var(--color-gray-700);                /* 输入框边框 */
  --color-border-input-hover: var(--color-gray-600);          /* 输入框悬停边框 */
  --color-border-input-focus: var(--color-primary-400);       /* 输入框聚焦边框 */
  --color-border-input-error: var(--color-danger-400);        /* 输入框错误边框 */
  --color-border-input-disabled: var(--color-gray-750);       /* 输入框禁用边框 */
  
  /* ========== Primary Color States (Dark Mode) ========== */
  --color-primary-lighter: var(--color-primary-100);          /* Light tints for dark mode */
  --color-primary-light: var(--color-primary-200);
  --color-primary-default: var(--color-primary-400);          /* Brighter for visibility */
  --color-primary-hover: var(--color-primary-300);
  --color-primary-active: var(--color-primary-500);
  --color-primary-darker: var(--color-primary-600);
  --color-primary-disabled: var(--color-primary-800);         /* Darker for disabled state */
  
  /* ========== Success Color States (Dark Mode) ========== */
  --color-success-lighter: var(--color-success-100);
  --color-success-light: var(--color-success-200);
  --color-success-default: var(--color-success-400);
  --color-success-hover: var(--color-success-300);
  --color-success-active: var(--color-success-500);
  --color-success-darker: var(--color-success-600);
  --color-success-disabled: var(--color-success-800);
  
  /* ========== Warning Color States (Dark Mode) ========== */
  --color-warning-lighter: var(--color-warning-100);
  --color-warning-light: var(--color-warning-200);
  --color-warning-default: var(--color-warning-400);
  --color-warning-hover: var(--color-warning-300);
  --color-warning-active: var(--color-warning-500);
  --color-warning-darker: var(--color-warning-600);
  --color-warning-disabled: var(--color-warning-800);
  
  /* ========== Danger/Error Color States (Dark Mode) ========== */
  --color-danger-lighter: var(--color-danger-100);
  --color-danger-light: var(--color-danger-200);
  --color-danger-default: var(--color-danger-400);
  --color-danger-hover: var(--color-danger-300);
  --color-danger-active: var(--color-danger-500);
  --color-danger-darker: var(--color-danger-600);
  --color-danger-disabled: var(--color-danger-800);
  
  /* ========== Info Color States (Dark Mode) ========== */
  --color-info-lighter: var(--color-info-100);
  --color-info-light: var(--color-info-200);
  --color-info-default: var(--color-info-400);
  --color-info-hover: var(--color-info-300);
  --color-info-active: var(--color-info-500);
  --color-info-darker: var(--color-info-600);
  --color-info-disabled: var(--color-info-800);
  
  /* ========== Shadows (Dark Mode) ========== */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.25), 0 1px 2px 0 rgba(0, 0, 0, 0.15);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.35), 0 4px 6px -2px rgba(0, 0, 0, 0.25);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.15);
  --shadow-outline: 0 0 0 3px rgba(66, 153, 225, 0.4);
  
  /* ========== Legacy Aliases (for backward compatibility) ========== */
  --color-background: var(--color-bg-container);
  --color-background-secondary: var(--color-bg-container-secondary);
  --color-background-tertiary: var(--color-bg-container-tertiary);`;
  
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