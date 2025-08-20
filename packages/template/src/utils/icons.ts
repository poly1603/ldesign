/**
 * 图标工具函数
 * 提供统一的图标管理和使用方式
 */

export type IconLibrary = 'lucide' | 'heroicons' | 'feather' | 'tabler'
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface IconProps {
  name: string
  size?: IconSize
  color?: string
  className?: string
  library?: IconLibrary
}

/**
 * 图标尺寸映射
 */
const sizeMap: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40
}

/**
 * Lucide 图标组件 (推荐使用)
 */
export const LucideIcons = {
  // 认证相关
  user: (props: Partial<IconProps> = {}) => createSVGIcon('user', props, `
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  `),

  lock: (props: Partial<IconProps> = {}) => createSVGIcon('lock', props, `
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="m7 11V7a5 5 0 0 1 10 0v4"/>
  `),

  mail: (props: Partial<IconProps> = {}) => createSVGIcon('mail', props, `
    <path d="m4 4 16 0 0 16-16 0z"/>
    <path d="m22 6-10 7L2 6"/>
  `),

  eye: (props: Partial<IconProps> = {}) => createSVGIcon('eye', props, `
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  `),

  eyeOff: (props: Partial<IconProps> = {}) => createSVGIcon('eye-off', props, `
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  `),

  // 社交登录
  github: (props: Partial<IconProps> = {}) => createSVGIcon('github', props, `
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  `),

  google: (props: Partial<IconProps> = {}) => createSVGIcon('google', props, `
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  `),

  // 功能图标
  check: (props: Partial<IconProps> = {}) => createSVGIcon('check', props, `
    <polyline points="20,6 9,17 4,12"/>
  `),

  x: (props: Partial<IconProps> = {}) => createSVGIcon('x', props, `
    <path d="m18 6-12 12"/>
    <path d="m6 6 12 12"/>
  `),

  loader: (props: Partial<IconProps> = {}) => createSVGIcon('loader', props, `
    <line x1="12" x2="12" y1="2" y2="6"/>
    <line x1="12" x2="12" y1="18" y2="22"/>
    <line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/>
    <line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/>
    <line x1="2" x2="6" y1="12" y2="12"/>
    <line x1="18" x2="22" y1="12" y2="12"/>
    <line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/>
    <line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/>
  `),

  // 装饰性图标
  shield: (props: Partial<IconProps> = {}) => createSVGIcon('shield', props, `
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  `),

  zap: (props: Partial<IconProps> = {}) => createSVGIcon('zap', props, `
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
  `),

  star: (props: Partial<IconProps> = {}) => createSVGIcon('star', props, `
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  `),

  heart: (props: Partial<IconProps> = {}) => createSVGIcon('heart', props, `
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7z"/>
  `),

  // 设备相关图标
  smartphone: (props: Partial<IconProps> = {}) => createSVGIcon('smartphone', props, `
    <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
    <path d="M12 18h.01"/>
  `),

  monitor: (props: Partial<IconProps> = {}) => createSVGIcon('monitor', props, `
    <rect width="20" height="14" x="2" y="3" rx="2" ry="2"/>
    <line x1="8" x2="16" y1="21" y2="21"/>
    <line x1="12" x2="12" y1="17" y2="21"/>
  `),

  tablet: (props: Partial<IconProps> = {}) => createSVGIcon('tablet', props, `
    <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
    <line x1="12" x2="12.01" y1="18" y2="18"/>
  `),

  laptop: (props: Partial<IconProps> = {}) => createSVGIcon('laptop', props, `
    <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>
  `)
}

/**
 * 创建 SVG 图标组件
 */
function createSVGIcon(name: string, props: Partial<IconProps>, pathContent: string) {
  const {
    size = 'md',
    color = 'currentColor',
    className = '',
    library = 'lucide'
  } = props

  const iconSize = sizeMap[size]

  return `
    <svg 
      width="${iconSize}" 
      height="${iconSize}" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="${color}" 
      stroke-width="2" 
      stroke-linecap="round" 
      stroke-linejoin="round" 
      class="icon icon-${name} ${className}"
      data-library="${library}"
    >
      ${pathContent}
    </svg>
  `.trim()
}

/**
 * 获取图标 HTML
 */
export function getIcon(name: keyof typeof LucideIcons, props: Partial<IconProps> = {}): string {
  const iconFunction = LucideIcons[name]
  if (!iconFunction) {
    console.warn(`Icon "${name}" not found`)
    return LucideIcons.x(props) // 返回 X 图标作为备用
  }
  return iconFunction(props)
}

/**
 * 图标 CSS 样式
 */
export const iconStyles = `
  .icon {
    display: inline-block;
    vertical-align: middle;
    transition: all 0.2s ease;
  }
  
  .icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border: none;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .icon-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  .icon-button:active {
    transform: scale(0.95);
  }
  
  .icon-spin {
    animation: icon-spin 1s linear infinite;
  }
  
  @keyframes icon-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

/**
 * 社交登录图标映射
 */
export const socialIcons = {
  github: LucideIcons.github,
  google: LucideIcons.google,
  wechat: (props: Partial<IconProps> = {}) => createSVGIcon('wechat', props, `
    <path d="M8.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM12 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zM8 14.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm8 0c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5z"/>
  `),
  qq: (props: Partial<IconProps> = {}) => createSVGIcon('qq', props, `
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm4 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
  `),
  weibo: (props: Partial<IconProps> = {}) => createSVGIcon('weibo', props, `
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
  `),
  alipay: (props: Partial<IconProps> = {}) => createSVGIcon('alipay', props, `
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
  `)
}
