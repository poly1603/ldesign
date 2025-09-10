import type {
  NotificationPosition,
  NotificationTheme,
  NotificationType,
} from '../types'

export interface ThemeColors {
  background: string
  text: string
  border: string
  shadow: string
  success: string
  error: string
  warning: string
  info: string
}

export interface NotificationStyles {
  container: Partial<CSSStyleDeclaration>
  notification: Partial<CSSStyleDeclaration>
  icon: Partial<CSSStyleDeclaration>
  content: Partial<CSSStyleDeclaration>
  title: Partial<CSSStyleDeclaration>
  message: Partial<CSSStyleDeclaration>
  closeButton: Partial<CSSStyleDeclaration>
  actions: Partial<CSSStyleDeclaration>
  progress: Partial<CSSStyleDeclaration>
}

export class NotificationStyleManager {
  private themes: Record<NotificationTheme, ThemeColors> = {
    light: {
      background: '#ffffff',
      text: '#1f2937',
      border: '#e5e7eb',
      shadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
    },
    dark: {
      background: '#1f2937',
      text: '#f9fafb',
      border: '#374151',
      shadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
      success: '#34d399',
      error: '#f87171',
      warning: '#fbbf24',
      info: '#60a5fa',
    },
    auto: {
      background: 'var(--notification-bg, #ffffff)',
      text: 'var(--notification-text, #1f2937)',
      border: 'var(--notification-border, #e5e7eb)',
      shadow: 'var(--notification-shadow, 0 10px 25px rgba(0, 0, 0, 0.1))',
      success: 'var(--notification-success, #10b981)',
      error: 'var(--notification-error, #ef4444)',
      warning: 'var(--notification-warning, #f59e0b)',
      info: 'var(--notification-info, #3b82f6)',
    },
  }

  private currentTheme: NotificationTheme = 'light'

  /**
   * 获取容器位置样式
   */
  getContainerStyles(
    position: NotificationPosition
  ): Partial<CSSStyleDeclaration> {
    const baseStyles: Partial<CSSStyleDeclaration> = {
      position: 'fixed',
      zIndex: '9999',
      pointerEvents: 'none',
      maxWidth: '400px',
      width: '100%',
    }

    switch (position) {
      case 'top-left':
        return {
          ...baseStyles,
          top: '20px',
          left: '20px',
        }
      case 'top-center':
        return {
          ...baseStyles,
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
        }
      case 'top-right':
        return {
          ...baseStyles,
          top: '20px',
          right: '20px',
        }
      case 'bottom-left':
        return {
          ...baseStyles,
          bottom: '20px',
          left: '20px',
        }
      case 'bottom-center':
        return {
          ...baseStyles,
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
        }
      case 'bottom-right':
        return {
          ...baseStyles,
          bottom: '20px',
          right: '20px',
        }
      default:
        return {
          ...baseStyles,
          top: '20px',
          right: '20px',
        }
    }
  }

  /**
   * 获取通知样式
   */
  getNotificationStyles(
    type: NotificationType = 'info',
    theme: NotificationTheme = this.currentTheme
  ): NotificationStyles {
    const colors = this.themes[theme]
    const typeColor = colors[type]

    return {
      container: this.getContainerStyles('top-right'),
      notification: {
        background: colors.background,
        color: colors.text,
        borderRadius: '12px',
        boxShadow: colors.shadow,
        marginBottom: '12px',
        padding: '16px',
        pointerEvents: 'auto',
        position: 'relative',
        borderLeft: `4px solid ${typeColor}`,
        maxWidth: '100%',
        wordWrap: 'break-word',
        fontSize: '14px',
        lineHeight: '1.5',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        border: `1px solid ${colors.border}`,
        backdropFilter: 'blur(10px)',
        transition: 'all 0.2s ease',
      },
      icon: {
        flexShrink: '0',
        width: '20px',
        height: '20px',
        color: typeColor,
        marginRight: '12px',
      },
      content: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        flex: '1',
        minWidth: '0',
      },
      title: {
        fontWeight: '600',
        fontSize: '14px',
        color: colors.text,
        marginBottom: '4px',
        lineHeight: '1.4',
      },
      message: {
        fontSize: '13px',
        color: colors.text,
        opacity: '0.8',
        lineHeight: '1.4',
        wordBreak: 'break-word',
      },
      closeButton: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: 'none',
        border: 'none',
        fontSize: '18px',
        color: colors.text,
        opacity: '0.5',
        cursor: 'pointer',
        padding: '0',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '4px',
        transition: 'opacity 0.2s ease',
      },
      actions: {
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
        flexWrap: 'wrap',
      },
      progress: {
        width: '100%',
        height: '4px',
        backgroundColor: colors.border,
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: '8px',
      },
    }
  }

  /**
   * 获取操作按钮样式
   */
  getActionButtonStyles(
    style: 'primary' | 'secondary' | 'danger' = 'primary',
    theme: NotificationTheme = this.currentTheme
  ): Partial<CSSStyleDeclaration> {
    const colors = this.themes[theme]

    const baseStyles: Partial<CSSStyleDeclaration> = {
      padding: '6px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'all 0.2s ease',
      outline: 'none',
    }

    switch (style) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: colors.info,
          color: '#ffffff',
        }
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: colors.text,
          border: `1px solid ${colors.border}`,
        }
      case 'danger':
        return {
          ...baseStyles,
          backgroundColor: colors.error,
          color: '#ffffff',
        }
      default:
        return baseStyles
    }
  }

  /**
   * 获取进度条样式
   */
  getProgressBarStyles(
    value: number,
    color?: string,
    theme: NotificationTheme = this.currentTheme
  ): Partial<CSSStyleDeclaration> {
    const colors = this.themes[theme]

    return {
      width: `${Math.max(0, Math.min(100, value))}%`,
      height: '100%',
      backgroundColor: color || colors.info,
      borderRadius: '2px',
      transition: 'width 0.3s ease',
    }
  }

  /**
   * 应用样式到元素
   */
  applyStyles(
    element: HTMLElement,
    styles: Partial<CSSStyleDeclaration>
  ): void {
    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined) {
        element.style.setProperty(property, String(value))
      }
    })
  }

  /**
   * 设置主题
   */
  setTheme(theme: NotificationTheme): void {
    this.currentTheme = theme
  }

  /**
   * 获取当前主题
   */
  getTheme(): NotificationTheme {
    return this.currentTheme
  }

  /**
   * 注册自定义主题
   */
  registerTheme(name: NotificationTheme | string, colors: ThemeColors): void {
    (this.themes as Record<string, ThemeColors>)[name] = colors
  }

  /**
   * 获取主题颜色
   */
  getThemeColors(theme: NotificationTheme = this.currentTheme): ThemeColors {
    return { ...this.themes[theme] }
  }

  /**
   * 检测系统主题偏好
   */
  detectSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') {
      return 'light'
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  /**
   * 监听系统主题变化
   */
  watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
    if (typeof window === 'undefined') {
      return () => { }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)

    return () => {
      mediaQuery.removeEventListener('change', handler)
    }
  }
}

export function createStyleManager(): NotificationStyleManager {
  return new NotificationStyleManager()
}
