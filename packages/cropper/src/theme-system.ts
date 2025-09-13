/**
 * Comprehensive Theme System for Image Cropper
 * Supports dark mode, custom themes, and dynamic theme switching
 */

// Theme configuration types
export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
  CUSTOM = 'custom'
}

export enum ColorScheme {
  BLUE = 'blue',
  GREEN = 'green',
  PURPLE = 'purple',
  RED = 'red',
  ORANGE = 'orange',
  TEAL = 'teal',
  PINK = 'pink',
  INDIGO = 'indigo'
}

// Color definitions
export interface ColorPalette {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  error: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export interface ThemeColors {
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
    overlay: string;
  };
  
  // Surface colors
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
  };
  
  // Border colors
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
    success: string;
    warning: string;
  };
  
  // Brand colors
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Semantic colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Interactive colors
  interactive: {
    hover: string;
    pressed: string;
    focus: string;
    disabled: string;
  };
}

export interface ThemeTypography {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  
  fontWeight: {
    thin: string;
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
  };
  
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
    loose: string;
  };
  
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
    wider: string;
  };
}

export interface ThemeSpacing {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ThemeShadows {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

// Predefined color palettes
export const ColorPalettes: Record<ColorScheme, ColorPalette> = {
  [ColorScheme.BLUE]: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    }
  },
  // Add other color schemes here...
  [ColorScheme.GREEN]: {
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    // ... (similar structure for other colors)
    secondary: {
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
      500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a'
    },
    neutral: {
      50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa',
      500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b'
    },
    success: {
      50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
      500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d'
    },
    warning: {
      50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24',
      500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f'
    },
    error: {
      50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171',
      500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d'
    }
  },
  // Simplified for brevity - in real implementation, add all color schemes
  [ColorScheme.PURPLE]: { primary: { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7c3aed', 800: '#6b21d6', 900: '#581c87' }, secondary: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }, neutral: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b' }, success: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' }, warning: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' }, error: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' } },
  [ColorScheme.RED]: { primary: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' }, secondary: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }, neutral: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b' }, success: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' }, warning: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' }, error: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' } },
  [ColorScheme.ORANGE]: { primary: { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12' }, secondary: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }, neutral: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b' }, success: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' }, warning: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' }, error: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' } },
  [ColorScheme.TEAL]: { primary: { 50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a' }, secondary: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }, neutral: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b' }, success: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' }, warning: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' }, error: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' } },
  [ColorScheme.PINK]: { primary: { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843' }, secondary: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }, neutral: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b' }, success: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' }, warning: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' }, error: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' } },
  [ColorScheme.INDIGO]: { primary: { 50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81' }, secondary: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a' }, neutral: { 50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b' }, success: { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d' }, warning: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f' }, error: { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d' } }
};

// Default theme configurations
export const DefaultThemes: Record<ThemeMode, Partial<ThemeConfig>> = {
  [ThemeMode.LIGHT]: {
    mode: ThemeMode.LIGHT,
    colors: {
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        elevated: '#ffffff',
        overlay: 'rgba(0, 0, 0, 0.5)'
      },
      surface: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        disabled: '#e2e8f0'
      },
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
        disabled: '#94a3b8',
        inverse: '#ffffff'
      },
      border: {
        primary: '#e2e8f0',
        secondary: '#cbd5e1',
        focus: '#3b82f6',
        error: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b'
      },
      brand: {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        accent: '#93c5fd'
      },
      semantic: {
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6'
      },
      interactive: {
        hover: 'rgba(59, 130, 246, 0.1)',
        pressed: 'rgba(59, 130, 246, 0.2)',
        focus: 'rgba(59, 130, 246, 0.3)',
        disabled: 'rgba(148, 163, 184, 0.5)'
      }
    }
  },
  
  [ThemeMode.DARK]: {
    mode: ThemeMode.DARK,
    colors: {
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#334155',
        elevated: '#1e293b',
        overlay: 'rgba(0, 0, 0, 0.8)'
      },
      surface: {
        primary: '#1e293b',
        secondary: '#334155',
        tertiary: '#475569',
        disabled: '#475569'
      },
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        disabled: '#64748b',
        inverse: '#0f172a'
      },
      border: {
        primary: '#334155',
        secondary: '#475569',
        focus: '#60a5fa',
        error: '#f87171',
        success: '#4ade80',
        warning: '#fbbf24'
      },
      brand: {
        primary: '#60a5fa',
        secondary: '#3b82f6',
        accent: '#93c5fd'
      },
      semantic: {
        success: '#4ade80',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#60a5fa'
      },
      interactive: {
        hover: 'rgba(96, 165, 250, 0.1)',
        pressed: 'rgba(96, 165, 250, 0.2)',
        focus: 'rgba(96, 165, 250, 0.3)',
        disabled: 'rgba(100, 116, 139, 0.5)'
      }
    }
  },
  
  [ThemeMode.SYSTEM]: {
    mode: ThemeMode.SYSTEM
  },
  
  [ThemeMode.CUSTOM]: {
    mode: ThemeMode.CUSTOM
  }
};

// Common theme properties
const CommonThemeProperties = {
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      mono: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem'
    },
    fontWeight: {
      thin: '100',
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2'
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.1em'
    }
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem'
  },
  
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: '0 0 #0000'
  },
  
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  }
};

// Theme Manager
export class ThemeManager {
  private currentTheme: ThemeConfig;
  private rootElement: HTMLElement;
  private mediaQuery: MediaQueryList;
  private observers: ((theme: ThemeConfig) => void)[] = [];
  private storageKey = 'image-cropper-theme';
  
  constructor(rootElement: HTMLElement = document.documentElement) {
    this.rootElement = rootElement;
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Initialize with default theme
    this.currentTheme = this.createTheme(ThemeMode.LIGHT, ColorScheme.BLUE);
    
    // Load saved theme
    this.loadTheme();
    
    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));
  }
  
  /**
   * 创建主题配置
   */
  createTheme(mode: ThemeMode, colorScheme: ColorScheme = ColorScheme.BLUE): ThemeConfig {
    const baseTheme = { ...DefaultThemes[mode] };
    const palette = ColorPalettes[colorScheme];
    
    // Apply color scheme if specified
    if (mode !== ThemeMode.SYSTEM && palette) {
      baseTheme.colors = {
        ...baseTheme.colors!,
        brand: {
          primary: palette.primary[500],
          secondary: palette.primary[400],
          accent: palette.primary[300]
        }
      };
    }
    
    return {
      ...baseTheme,
      colorScheme,
      ...CommonThemeProperties
    } as ThemeConfig;
  }
  
  /**
   * 设置主题
   */
  setTheme(mode: ThemeMode, colorScheme: ColorScheme = ColorScheme.BLUE): void {
    const newTheme = this.createTheme(mode, colorScheme);
    this.applyTheme(newTheme);
    this.saveTheme();
  }
  
  /**
   * 应用自定义主题
   */
  setCustomTheme(themeConfig: Partial<ThemeConfig>): void {
    const customTheme = {
      ...this.currentTheme,
      ...themeConfig,
      mode: ThemeMode.CUSTOM
    };
    
    this.applyTheme(customTheme);
    this.saveTheme();
  }
  
  /**
   * 切换深色/浅色模式
   */
  toggleTheme(): void {
    const newMode = this.currentTheme.mode === ThemeMode.LIGHT 
      ? ThemeMode.DARK 
      : ThemeMode.LIGHT;
    
    this.setTheme(newMode, this.currentTheme.colorScheme);
  }
  
  /**
   * 应用主题到 DOM
   */
  private applyTheme(theme: ThemeConfig): void {
    this.currentTheme = theme;
    
    // Determine effective mode for system theme
    let effectiveMode = theme.mode;
    if (theme.mode === ThemeMode.SYSTEM) {
      effectiveMode = this.mediaQuery.matches ? ThemeMode.DARK : ThemeMode.LIGHT;
    }
    
    // Apply theme mode class
    this.rootElement.classList.remove('light', 'dark', 'system', 'custom');
    this.rootElement.classList.add(effectiveMode);
    
    // Apply CSS custom properties
    this.applyCSSVariables(theme);
    
    // Notify observers
    this.notifyObservers(theme);
  }
  
  /**
   * 应用 CSS 自定义属性
   */
  private applyCSSVariables(theme: ThemeConfig): void {
    const root = this.rootElement;
    
    // Apply color variables
    if (theme.colors) {
      Object.entries(theme.colors.background).forEach(([key, value]) => {
        root.style.setProperty(`--color-background-${key}`, value);
      });
      
      Object.entries(theme.colors.surface).forEach(([key, value]) => {
        root.style.setProperty(`--color-surface-${key}`, value);
      });
      
      Object.entries(theme.colors.text).forEach(([key, value]) => {
        root.style.setProperty(`--color-text-${key}`, value);
      });
      
      Object.entries(theme.colors.border).forEach(([key, value]) => {
        root.style.setProperty(`--color-border-${key}`, value);
      });
      
      Object.entries(theme.colors.brand).forEach(([key, value]) => {
        root.style.setProperty(`--color-brand-${key}`, value);
      });
      
      Object.entries(theme.colors.semantic).forEach(([key, value]) => {
        root.style.setProperty(`--color-semantic-${key}`, value);
      });
      
      Object.entries(theme.colors.interactive).forEach(([key, value]) => {
        root.style.setProperty(`--color-interactive-${key}`, value);
      });
    }
    
    // Apply typography variables
    if (theme.typography) {
      Object.entries(theme.typography.fontFamily).forEach(([key, value]) => {
        root.style.setProperty(`--font-family-${key}`, value);
      });
      
      Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
        root.style.setProperty(`--font-size-${key}`, value);
      });
      
      Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
        root.style.setProperty(`--font-weight-${key}`, value);
      });
      
      Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
        root.style.setProperty(`--line-height-${key}`, value);
      });
      
      Object.entries(theme.typography.letterSpacing).forEach(([key, value]) => {
        root.style.setProperty(`--letter-spacing-${key}`, value);
      });
    }
    
    // Apply spacing variables
    if (theme.spacing) {
      Object.entries(theme.spacing).forEach(([key, value]) => {
        root.style.setProperty(`--spacing-${key}`, value);
      });
    }
    
    // Apply border radius variables
    if (theme.borderRadius) {
      Object.entries(theme.borderRadius).forEach(([key, value]) => {
        root.style.setProperty(`--border-radius-${key}`, value);
      });
    }
    
    // Apply shadow variables
    if (theme.shadows) {
      Object.entries(theme.shadows).forEach(([key, value]) => {
        root.style.setProperty(`--shadow-${key}`, value);
      });
    }
    
    // Apply animation variables
    if (theme.animations) {
      Object.entries(theme.animations.duration).forEach(([key, value]) => {
        root.style.setProperty(`--duration-${key}`, value);
      });
      
      Object.entries(theme.animations.easing).forEach(([key, value]) => {
        root.style.setProperty(`--easing-${key}`, value);
      });
    }
  }
  
  /**
   * 处理系统主题变化
   */
  private handleSystemThemeChange(): void {
    if (this.currentTheme.mode === ThemeMode.SYSTEM) {
      this.applyTheme(this.currentTheme);
    }
  }
  
  /**
   * 保存主题设置
   */
  private saveTheme(): void {
    try {
      const themeData = {
        mode: this.currentTheme.mode,
        colorScheme: this.currentTheme.colorScheme
      };
      localStorage.setItem(this.storageKey, JSON.stringify(themeData));
    } catch (error) {
      console.warn('Failed to save theme settings:', error);
    }
  }
  
  /**
   * 加载主题设置
   */
  private loadTheme(): void {
    try {
      const savedTheme = localStorage.getItem(this.storageKey);
      if (savedTheme) {
        const themeData = JSON.parse(savedTheme);
        const theme = this.createTheme(themeData.mode, themeData.colorScheme);
        this.applyTheme(theme);
      } else {
        // Use system preference if no saved theme
        const prefersDark = this.mediaQuery.matches;
        const defaultMode = prefersDark ? ThemeMode.DARK : ThemeMode.LIGHT;
        const theme = this.createTheme(defaultMode);
        this.applyTheme(theme);
      }
    } catch (error) {
      console.warn('Failed to load theme settings:', error);
      // Fallback to light theme
      const theme = this.createTheme(ThemeMode.LIGHT);
      this.applyTheme(theme);
    }
  }
  
  /**
   * 订阅主题变化
   */
  subscribe(observer: (theme: ThemeConfig) => void): () => void {
    this.observers.push(observer);
    
    // Return unsubscribe function
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }
  
  /**
   * 通知观察者
   */
  private notifyObservers(theme: ThemeConfig): void {
    this.observers.forEach(observer => observer(theme));
  }
  
  /**
   * 获取当前主题
   */
  getCurrentTheme(): ThemeConfig {
    return { ...this.currentTheme };
  }
  
  /**
   * 获取CSS变量值
   */
  getCSSVariable(name: string): string {
    return getComputedStyle(this.rootElement).getPropertyValue(`--${name}`).trim();
  }
  
  /**
   * 设置CSS变量值
   */
  setCSSVariable(name: string, value: string): void {
    this.rootElement.style.setProperty(`--${name}`, value);
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    this.mediaQuery.removeEventListener('change', this.handleSystemThemeChange);
    this.observers.length = 0;
  }
}

// Global theme manager instance
export const globalThemeManager = new ThemeManager();

// Utility functions
export const ThemeUtils = {
  /**
   * 获取对比色
   */
  getContrastColor(color: string): string {
    // Simple implementation - in production, use a proper color contrast library
    const brightness = this.getBrightness(color);
    return brightness > 128 ? '#000000' : '#ffffff';
  },
  
  /**
   * 获取颜色亮度
   */
  getBrightness(color: string): number {
    // Convert hex to RGB and calculate brightness
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    return (r * 299 + g * 587 + b * 114) / 1000;
  },
  
  /**
   * 混合颜色
   */
  blendColors(color1: string, color2: string, ratio: number = 0.5): string {
    // Simple color blending - in production, use a proper color manipulation library
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
    const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
    const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  },
  
  /**
   * 生成色彩变体
   */
  generateColorVariants(baseColor: string): { [key: string]: string } {
    // Simple variant generation - in production, use a proper color palette generator
    return {
      50: this.blendColors(baseColor, '#ffffff', 0.95),
      100: this.blendColors(baseColor, '#ffffff', 0.85),
      200: this.blendColors(baseColor, '#ffffff', 0.7),
      300: this.blendColors(baseColor, '#ffffff', 0.5),
      400: this.blendColors(baseColor, '#ffffff', 0.25),
      500: baseColor,
      600: this.blendColors(baseColor, '#000000', 0.1),
      700: this.blendColors(baseColor, '#000000', 0.25),
      800: this.blendColors(baseColor, '#000000', 0.4),
      900: this.blendColors(baseColor, '#000000', 0.6)
    };
  }
};
