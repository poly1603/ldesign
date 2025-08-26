/**
 * 图标工具函数
 * 提供图标相关的工具函数
 */

/**
 * 图标名称类型
 */
export type IconName = string

/**
 * 图标选项接口
 */
export interface IconOptions {
  size?: string | number
  color?: string
  className?: string
}

/**
 * 图标配置接口
 */
export interface IconConfig {
  name: string
  size?: string | number
  color?: string
  className?: string
}

/**
 * 获取图标
 */
export function getIcon(name: string, config?: Partial<IconConfig>): string {
  const iconConfig: IconConfig = {
    name,
    size: config?.size || 'md',
    color: 'currentColor',
    className: '',
    ...config,
  }

  // 处理尺寸
  let sizeValue = 24
  let sizeClass = 'icon-md'

  if (typeof iconConfig.size === 'string') {
    const sizeMap: Record<string, number> = {
      xs: 16,
      sm: 20,
      md: 24,
      lg: 32,
      xl: 40,
    }
    sizeValue = sizeMap[iconConfig.size] || 24
    sizeClass = `icon-${iconConfig.size}`
  }
  else if (typeof iconConfig.size === 'number') {
    sizeValue = iconConfig.size
  }

  // 构建类名
  const classes = ['icon', sizeClass, iconConfig.className].filter(Boolean).join(' ')

  // 生成SVG内容
  const svgContent = generateSVGContent(name)

  return `<svg width="${sizeValue}" height="${sizeValue}" viewBox="0 0 24 24" fill="${iconConfig.color}" stroke="${iconConfig.color}" class="${classes}">
    ${svgContent}
  </svg>`
}

/**
 * 生成SVG内容
 */
function generateSVGContent(name: string): string {
  const iconPaths: Record<string, string> = {
    'home': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9,22 9,12 15,12 15,22"></polyline>',
    'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>',
    'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><circle cx="12" cy="16" r="1"></circle><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    'eye': '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>',
    'eye-off': '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>',
    'mail': '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline>',
    'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>',
    'settings': '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>',
    'logout': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16,17 21,12 16,7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>',
    'login': '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10,17 15,12 10,7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line>',
  }

  return iconPaths[name] || `<circle cx="12" cy="12" r="10"></circle><text x="12" y="16" text-anchor="middle" font-size="12" fill="currentColor">?</text>`
}

/**
 * 预加载图标
 */
export async function preloadIcon(name: string): Promise<void> {
  // 预加载图标的实现
  console.log(`Preloading icon: ${name}`)
}

/**
 * 获取图标列表
 */
export function getIconList(): string[] {
  return [
    'user',
    'lock',
    'eye',
    'eye-off',
    'mail',
    'phone',
    'home',
    'settings',
    'logout',
    'login',
  ]
}

/**
 * 检查图标是否存在
 */
export function hasIcon(name: string): boolean {
  return getIconList().includes(name)
}

/**
 * 创建图标组件
 */
export function createIconComponent(name: string, defaultConfig?: Partial<IconConfig>) {
  const componentName = `Icon${name.charAt(0).toUpperCase() + name.slice(1)}`

  return {
    name: componentName,
    props: {
      size: {
        type: [String, Number],
        default: defaultConfig?.size || 'md',
      },
      color: {
        type: String,
        default: defaultConfig?.color || 'currentColor',
      },
      className: {
        type: String,
        default: defaultConfig?.className || '',
      },
    },
    template: `<span v-html="iconHtml"></span>`,
    computed: {
      iconHtml() {
        const config = {
          size: (this as any).size,
          color: (this as any).color,
          className: (this as any).className,
        }
        return getIcon(name, config)
      },
    },
  }
}
