/**
 * 主题和色彩工具
 * 提供统一的设计系统和主题管理
 */

export interface ColorPalette {
  primary: string
  primaryLight: string
  primaryDark: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
  info: string
}

export interface ThemeConfig {
  name: string
  colors: ColorPalette
  gradients: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
}

/**
 * 预定义主题
 */
export const themes: Record<string, ThemeConfig> = {
  // 默认主题 - 现代蓝紫色
  default: {
    name: 'Default',
    colors: {
      primary: '#667eea',
      primaryLight: '#818cf8',
      primaryDark: '#5a67d8',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem'
    }
  },

  // 经典主题 - 商务蓝色
  classic: {
    name: 'Classic',
    colors: {
      primary: '#2563eb',
      primaryLight: '#3b82f6',
      primaryDark: '#1d4ed8',
      secondary: '#64748b',
      accent: '#06b6d4',
      background: '#ffffff',
      surface: '#f1f5f9',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#cbd5e1',
      success: '#059669',
      warning: '#d97706',
      error: '#dc2626',
      info: '#0284c7'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      secondary: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
      accent: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    borderRadius: {
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem'
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem'
    }
  },

  // 现代主题 - 渐变色彩
  modern: {
    name: 'Modern',
    colors: {
      primary: '#8b5cf6',
      primaryLight: '#a78bfa',
      primaryDark: '#7c3aed',
      secondary: '#ec4899',
      accent: '#06d6a0',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#d1d5db',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },
    gradients: {
      primary: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      secondary: 'linear-gradient(135deg, #06d6a0 0%, #0891b2 100%)',
      accent: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    },
    borderRadius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem'
    },
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem'
    }
  }
}

/**
 * 获取主题
 */
export function getTheme(themeName: string = 'default'): ThemeConfig {
  return themes[themeName] || themes.default
}

/**
 * 生成 CSS 变量
 */
export function generateCSSVariables(theme: ThemeConfig): string {
  const { colors, gradients, shadows, borderRadius, spacing } = theme
  
  return `
    :root {
      /* Colors */
      --color-primary: ${colors.primary};
      --color-primary-light: ${colors.primaryLight};
      --color-primary-dark: ${colors.primaryDark};
      --color-secondary: ${colors.secondary};
      --color-accent: ${colors.accent};
      --color-background: ${colors.background};
      --color-surface: ${colors.surface};
      --color-text: ${colors.text};
      --color-text-secondary: ${colors.textSecondary};
      --color-border: ${colors.border};
      --color-success: ${colors.success};
      --color-warning: ${colors.warning};
      --color-error: ${colors.error};
      --color-info: ${colors.info};
      
      /* Gradients */
      --gradient-primary: ${gradients.primary};
      --gradient-secondary: ${gradients.secondary};
      --gradient-accent: ${gradients.accent};
      --gradient-background: ${gradients.background};
      
      /* Shadows */
      --shadow-sm: ${shadows.sm};
      --shadow-md: ${shadows.md};
      --shadow-lg: ${shadows.lg};
      --shadow-xl: ${shadows.xl};
      
      /* Border Radius */
      --radius-sm: ${borderRadius.sm};
      --radius-md: ${borderRadius.md};
      --radius-lg: ${borderRadius.lg};
      --radius-xl: ${borderRadius.xl};
      
      /* Spacing */
      --spacing-xs: ${spacing.xs};
      --spacing-sm: ${spacing.sm};
      --spacing-md: ${spacing.md};
      --spacing-lg: ${spacing.lg};
      --spacing-xl: ${spacing.xl};
    }
  `.trim()
}

/**
 * 应用主题到文档
 */
export function applyTheme(themeName: string = 'default'): void {
  const theme = getTheme(themeName)
  const cssVariables = generateCSSVariables(theme)
  
  // 移除现有的主题样式
  const existingStyle = document.getElementById('theme-variables')
  if (existingStyle) {
    existingStyle.remove()
  }
  
  // 添加新的主题样式
  const style = document.createElement('style')
  style.id = 'theme-variables'
  style.textContent = cssVariables
  document.head.appendChild(style)
  
  // 设置主题类名
  document.documentElement.setAttribute('data-theme', themeName)
}

/**
 * 获取响应式断点
 */
export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

/**
 * 生成响应式媒体查询
 */
export function mediaQuery(breakpoint: keyof typeof breakpoints): string {
  return `@media (min-width: ${breakpoints[breakpoint]})`
}

/**
 * 动画配置
 */
export const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
  }
}

/**
 * 生成动画 CSS
 */
export function generateAnimationCSS(): string {
  return `
    /* 通用动画类 */
    .animate-fade-in {
      animation: fadeIn ${animations.duration.normal} ${animations.easing.smooth};
    }
    
    .animate-slide-up {
      animation: slideUp ${animations.duration.normal} ${animations.easing.smooth};
    }
    
    .animate-scale-in {
      animation: scaleIn ${animations.duration.normal} ${animations.easing.bounce};
    }
    
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    
    /* 动画关键帧 */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { 
        opacity: 0; 
        transform: translateY(20px); 
      }
      to { 
        opacity: 1; 
        transform: translateY(0); 
      }
    }
    
    @keyframes scaleIn {
      from { 
        opacity: 0; 
        transform: scale(0.9); 
      }
      to { 
        opacity: 1; 
        transform: scale(1); 
      }
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `.trim()
}
