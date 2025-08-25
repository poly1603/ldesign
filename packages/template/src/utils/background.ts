/**
 * 背景工具函数
 * 提供背景图片相关的工具函数
 */

/**
 * 背景图片接口
 */
export interface BackgroundImage {
  url: string
  alt?: string
  position?: string
  size?: string
  repeat?: string
  attachment?: string
}

/**
 * 背景配置接口
 */
export interface BackgroundConfig {
  type: 'image' | 'gradient' | 'color'
  value: string | BackgroundImage
  fallback?: string
}

/**
 * 获取智能背景
 */
export function getSmartBackground(deviceType: 'desktop' | 'mobile' | 'tablet'): BackgroundConfig {
  const backgrounds = {
    desktop: {
      type: 'image' as const,
      value: {
        url: '/images/backgrounds/desktop-login.jpg',
        position: 'center center',
        size: 'cover',
        repeat: 'no-repeat',
      },
      fallback: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    mobile: {
      type: 'gradient' as const,
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fallback: '#667eea',
    },
    tablet: {
      type: 'image' as const,
      value: {
        url: '/images/backgrounds/tablet-login.jpg',
        position: 'center center',
        size: 'cover',
        repeat: 'no-repeat',
      },
      fallback: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  }

  return backgrounds[deviceType] || backgrounds.desktop
}

/**
 * 预加载背景图片
 */
export async function preloadBackground(background: BackgroundImage): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = background.url
  })
}

/**
 * 生成CSS背景样式
 */
export function generateBackgroundCSS(config: BackgroundConfig): string {
  switch (config.type) {
    case 'image':
      if (typeof config.value === 'object') {
        const bg = config.value as BackgroundImage
        return `
          background-image: url('${bg.url}');
          background-position: ${bg.position || 'center center'};
          background-size: ${bg.size || 'cover'};
          background-repeat: ${bg.repeat || 'no-repeat'};
          background-attachment: ${bg.attachment || 'fixed'};
        `.trim()
      }
      return `background-image: url('${config.value}');`

    case 'gradient':
      return `background: ${config.value};`

    case 'color':
      return `background-color: ${config.value};`

    default:
      return config.fallback ? `background: ${config.fallback};` : ''
  }
}

/**
 * 获取背景颜色主题
 */
export function getBackgroundTheme(background: BackgroundConfig): 'light' | 'dark' {
  // 简单的主题检测逻辑
  if (typeof background.value === 'string') {
    const value = background.value.toLowerCase()
    if (value.includes('dark') || value.includes('#000') || value.includes('rgb(0')) {
      return 'dark'
    }
  }
  return 'light'
}

/**
 * 创建响应式背景
 */
export function createResponsiveBackground(): Record<string, BackgroundConfig> {
  return {
    desktop: getSmartBackground('desktop'),
    tablet: getSmartBackground('tablet'),
    mobile: getSmartBackground('mobile'),
  }
}
