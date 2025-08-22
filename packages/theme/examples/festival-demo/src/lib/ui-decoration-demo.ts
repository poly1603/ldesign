/**
 * UI装饰系统演示版本
 * 这是一个简化的演示版本，实际功能应该在核心包中实现
 */

// 简化的装饰配置
export const festivalDecorations = {
  default: {
    avatar: { emoji: '✨', color: '#1890ff' },
    button: { emoji: '💫', color: '#722ed1' },
    card: { emoji: '⭐', color: '#52c41a' },
    nav: { emoji: '🌟', color: '#1890ff' },
    input: { emoji: '💎', color: '#722ed1' },
    badge: { emoji: '🔮', color: '#52c41a' },
  },
  'spring-festival': {
    avatar: { emoji: '🧧', color: '#dc2626' },
    button: { emoji: '🏮', color: '#f59e0b' },
    card: { emoji: '🎆', color: '#dc2626' },
    nav: { emoji: '🌸', color: '#f59e0b' },
    input: { emoji: '💰', color: '#fbbf24' },
    badge: { emoji: '🐉', color: '#dc2626' },
  },
  christmas: {
    avatar: { emoji: '🎄', color: '#16a34a' },
    button: { emoji: '🔔', color: '#dc2626' },
    card: { emoji: '❄️', color: '#16a34a' },
    nav: { emoji: '🎁', color: '#dc2626' },
    input: { emoji: '⭐', color: '#fbbf24' },
    badge: { emoji: '🎅', color: '#dc2626' },
  },
}

// 装饰管理器 - 真实的UI装饰效果
export class UIDecorationManager {
  private currentTheme: string = 'default'
  private styleElement: HTMLStyleElement | null = null

  constructor() {
    this.injectDecorationStyles()
  }

  applyThemeDecorations(themeId: string) {
    this.currentTheme = themeId
    console.log(`🎨 应用主题装饰: ${themeId}`)

    // 清除旧装饰
    this.clearAllDecorations()

    // 实际应用主题样式到页面
    this.updateThemeStyles(themeId)

    // 应用UI装饰到页面元素
    setTimeout(() => {
      this.decoratePageElements(themeId)
    }, 100)
  }

  private updateThemeStyles(themeId: string) {
    const root = document.documentElement

    // 根据主题设置CSS变量
    switch (themeId) {
      case 'spring-festival':
        root.style.setProperty('--festival-primary', '#dc2626')
        root.style.setProperty('--festival-secondary', '#f59e0b')
        root.style.setProperty('--festival-accent', '#fbbf24')
        root.style.setProperty(
          '--festival-background',
          'linear-gradient(135deg, #fef2f2 0%, #fff7ed 30%, #fef3c7 70%, #fecaca 100%)'
        )
        root.style.setProperty('--festival-text', '#7f1d1d')
        break

      case 'christmas':
        root.style.setProperty('--festival-primary', '#16a34a')
        root.style.setProperty('--festival-secondary', '#dc2626')
        root.style.setProperty('--festival-accent', '#fbbf24')
        root.style.setProperty(
          '--festival-background',
          'linear-gradient(135deg, #f0fdf4 0%, #fef2f2 30%, #f0fdf4 70%, #dcfce7 100%)'
        )
        root.style.setProperty('--festival-text', '#14532d')
        break

      default:
        root.style.setProperty('--festival-primary', '#1890ff')
        root.style.setProperty('--festival-secondary', '#722ed1')
        root.style.setProperty('--festival-accent', '#52c41a')
        root.style.setProperty(
          '--festival-background',
          'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
        )
        root.style.setProperty('--festival-text', '#1e293b')
        break
    }
  }

  private injectDecorationStyles() {
    if (this.styleElement) return

    this.styleElement = document.createElement('style')
    this.styleElement.id = 'ui-decoration-styles'
    this.styleElement.textContent = `
      /* 装饰基础样式 */
      .ui-decorated {
        position: relative;
        overflow: visible;
      }

      .ui-decorated::before {
        content: attr(data-decoration-emoji);
        position: absolute;
        top: -8px;
        right: -8px;
        z-index: 10;
        pointer-events: none;
        font-size: 16px;
        line-height: 1;
        animation: decorationFloat 3s ease-in-out infinite;
      }

      @keyframes decorationFloat {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-3px) scale(1.1); }
      }

      @keyframes decorationGlow {
        0%, 100% { filter: drop-shadow(0 0 4px currentColor); }
        50% { filter: drop-shadow(0 0 8px currentColor) brightness(1.2); }
      }

      .decoration-glow::before {
        animation: decorationGlow 2s ease-in-out infinite;
      }

      .decoration-bounce::before {
        animation: decorationBounce 1.5s ease-in-out infinite;
      }

      @keyframes decorationBounce {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
    `
    document.head.appendChild(this.styleElement)
  }

  private decoratePageElements(themeId: string) {
    const decorations =
      festivalDecorations[themeId] || festivalDecorations['default']

    console.log(`🎨 装饰配置:`, decorations)

    // 装饰主题选择器 (使用button装饰)
    this.decorateElements('.theme-selector', decorations.button)

    // 装饰推荐按钮 (使用button装饰)
    this.decorateElements('.recommend-btn', decorations.button)

    // 装饰功能卡片 (使用card装饰)
    this.decorateElements('.feature-card', decorations.card)

    // 装饰统计数字 (使用badge装饰)
    this.decorateElements('.stat-number', decorations.badge)

    // 装饰导航区域 (使用nav装饰)
    this.decorateElements('.theme-controls', decorations.nav)

    console.log(`✨ 已装饰页面元素，主题: ${themeId}`)
    console.log(
      `🧧 春节装饰 - 按钮: ${decorations.button?.emoji}, 卡片: ${decorations.card?.emoji}, 徽章: ${decorations.badge?.emoji}`
    )
  }

  private decorateElements(selector: string, decoration: any) {
    const elements = document.querySelectorAll(selector)
    elements.forEach(element => {
      const el = element as HTMLElement
      el.classList.add('ui-decorated')
      el.setAttribute('data-decoration-emoji', decoration.emoji)
      el.style.setProperty('color', decoration.color)
    })
  }

  clearAllDecorations() {
    console.log('🧹 清除所有装饰')

    // 移除所有装饰
    const decoratedElements = document.querySelectorAll('.ui-decorated')
    decoratedElements.forEach(element => {
      element.classList.remove(
        'ui-decorated',
        'decoration-glow',
        'decoration-bounce'
      )
      element.removeAttribute('data-decoration-emoji')
    })

    // 重置为默认主题
    this.updateThemeStyles('default')
  }

  getCurrentThemeDecorations() {
    return (
      festivalDecorations[this.currentTheme] || festivalDecorations['default']
    )
  }

  destroy() {
    this.clearAllDecorations()
    if (this.styleElement) {
      this.styleElement.remove()
      this.styleElement = null
    }
  }
}

// 创建演示实例
export const uiDecorationManager = new UIDecorationManager()

// 在开发环境下暴露到全局
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).uiDecorationManager = uiDecorationManager
}
