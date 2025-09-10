/**
 * @file 万圣节主题配置
 * @description 万圣节主题的完整配置，包括颜色、挂件和动画
 */

import type { FestivalThemeConfig, WidgetConfig } from '../core/types'
import { FestivalType, WidgetType } from '../core/types'

/**
 * 万圣节主题颜色配置
 * 基于橙黑配色，营造神秘恐怖的万圣节氛围
 */
const halloweenColors = {
  name: 'halloween-colors',
  displayName: '万圣节配色',
  light: {
    // 主色调 - 万圣节橙
    primary: '#FF6B35',
    secondary: '#2C2C2C',
    accent: '#8B008B',
    
    // 背景色
    background: '#FFF8DC',
    surface: '#FFFFFF',
    
    // 文字色
    onPrimary: '#000000',
    onSecondary: '#FFFFFF',
    onBackground: '#2C2C2C',
    onSurface: '#2C2C2C',
    
    // 状态色
    success: '#228B22',
    warning: '#FF8C00',
    error: '#DC143C',
    info: '#4B0082',
    
    // 边框和分割线
    border: '#D2B48C',
    divider: '#BC9A6A',
    
    // 特殊色彩
    pumpkinOrange: '#FF6B35',
    spookyBlack: '#2C2C2C',
    witchPurple: '#8B008B',
    ghostWhite: '#F8F8FF'
  },
  dark: {
    // 主色调 - 深橙色
    primary: '#FF4500',
    secondary: '#000000',
    accent: '#9932CC',
    
    // 背景色
    background: '#0D0D0D',
    surface: '#1A1A1A',
    
    // 文字色
    onPrimary: '#000000',
    onSecondary: '#FFFFFF',
    onBackground: '#F5DEB3',
    onSurface: '#F5DEB3',
    
    // 状态色
    success: '#32CD32',
    warning: '#FFA500',
    error: '#FF6347',
    info: '#9370DB',
    
    // 边框和分割线
    border: '#333333',
    divider: '#4A4A4A',
    
    // 特殊色彩
    pumpkinOrange: '#FF4500',
    spookyBlack: '#000000',
    witchPurple: '#9932CC',
    ghostWhite: '#F0F0F0'
  }
}

/**
 * 万圣节主题挂件配置
 */
const halloweenWidgets: WidgetConfig[] = [
  // 南瓜灯装饰
  {
    id: 'halloween-pumpkin',
    name: '南瓜灯',
    type: WidgetType.FLOATING,
    content: `
      <svg width="70" height="70" viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="pumpkinGradient" cx="50%" cy="40%" r="60%">
            <stop offset="0%" style="stop-color:#FFA500;stop-opacity:1" />
            <stop offset="70%" style="stop-color:#FF6B35;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FF4500;stop-opacity:1" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- 南瓜主体 -->
        <ellipse cx="35" cy="40" rx="30" ry="25" fill="url(#pumpkinGradient)"/>
        <!-- 南瓜纹理线 -->
        <path d="M15 25 Q35 15 35 50 Q35 65 15 55" stroke="#E6550D" stroke-width="2" fill="none"/>
        <path d="M25 20 Q35 18 35 50 Q35 68 25 60" stroke="#E6550D" stroke-width="2" fill="none"/>
        <path d="M45 20 Q35 18 35 50 Q35 68 45 60" stroke="#E6550D" stroke-width="2" fill="none"/>
        <path d="M55 25 Q35 15 35 50 Q35 65 55 55" stroke="#E6550D" stroke-width="2" fill="none"/>
        <!-- 南瓜茎 -->
        <rect x="32" y="10" width="6" height="12" rx="3" fill="#228B22"/>
        <!-- 眼睛 -->
        <polygon points="25,30 30,35 25,40 20,35" fill="#000000" filter="url(#glow)"/>
        <polygon points="45,30 50,35 45,40 40,35" fill="#000000" filter="url(#glow)"/>
        <!-- 嘴巴 -->
        <path d="M20 50 Q35 55 50 50 Q35 60 20 50" fill="#000000" filter="url(#glow)"/>
        <!-- 牙齿 -->
        <polygon points="28,50 30,55 32,50" fill="#FFA500"/>
        <polygon points="38,50 40,55 42,50" fill="#FFA500"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '15%', y: '25%' },
      anchor: 'center'
    },
    style: {
      zIndex: 1000,
      opacity: 0.9
    },
    animation: {
      name: 'glow',
      duration: 2000,
      iterations: 'infinite',
      autoplay: true
    },
    interactive: true,
    responsive: true,
    visible: true
  },

  // 幽灵装饰
  {
    id: 'halloween-ghost',
    name: '幽灵',
    type: WidgetType.FLOATING,
    content: `
      <svg width="50" height="60" viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="ghostGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- 幽灵主体 -->
        <path d="M25 10 Q10 10 10 30 L10 50 Q15 55 20 50 Q25 45 30 50 Q35 55 40 50 L40 30 Q40 10 25 10 Z" 
              fill="#F8F8FF" opacity="0.9" filter="url(#ghostGlow)"/>
        <!-- 眼睛 -->
        <circle cx="20" cy="25" r="3" fill="#000000"/>
        <circle cx="30" cy="25" r="3" fill="#000000"/>
        <!-- 嘴巴 -->
        <ellipse cx="25" cy="35" rx="4" ry="6" fill="#000000"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '75%', y: '20%' },
      anchor: 'center'
    },
    style: {
      zIndex: 999,
      opacity: 0.8
    },
    animation: {
      name: 'float',
      duration: 4000,
      iterations: 'infinite',
      autoplay: true
    },
    interactive: true,
    visible: true
  },

  // 蝙蝠装饰
  {
    id: 'halloween-bat-1',
    name: '蝙蝠1',
    type: WidgetType.ANIMATION,
    content: `
      <svg width="40" height="25" viewBox="0 0 40 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 蝙蝠身体 -->
        <ellipse cx="20" cy="15" rx="3" ry="8" fill="#2C2C2C"/>
        <!-- 左翅膀 -->
        <path d="M17 12 Q5 8 8 18 Q12 15 17 15 Z" fill="#2C2C2C"/>
        <!-- 右翅膀 -->
        <path d="M23 12 Q35 8 32 18 Q28 15 23 15 Z" fill="#2C2C2C"/>
        <!-- 耳朵 -->
        <polygon points="18,8 19,5 20,8" fill="#2C2C2C"/>
        <polygon points="20,8 21,5 22,8" fill="#2C2C2C"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '30%', y: '10%' },
      anchor: 'center'
    },
    style: {
      zIndex: 998,
      opacity: 0.7
    },
    animation: {
      name: 'float',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true,
      delay: 500
    },
    visible: true
  },

  // 蜘蛛网装饰
  {
    id: 'halloween-spider-web',
    name: '蜘蛛网',
    type: WidgetType.BACKGROUND,
    content: `
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="#696969" stroke-width="1" opacity="0.6">
          <!-- 放射线 -->
          <line x1="5" y1="5" x2="75" y2="75"/>
          <line x1="40" y1="5" x2="40" y2="75"/>
          <line x1="75" y1="5" x2="5" y2="75"/>
          <line x1="5" y1="40" x2="75" y2="40"/>
          <!-- 同心圆弧 -->
          <path d="M15 15 Q40 10 65 15" fill="none"/>
          <path d="M20 20 Q40 15 60 20" fill="none"/>
          <path d="M25 25 Q40 20 55 25" fill="none"/>
          <path d="M30 30 Q40 25 50 30" fill="none"/>
          <path d="M15 25 Q20 40 25 55" fill="none"/>
          <path d="M25 15 Q40 20 55 25" fill="none"/>
          <path d="M55 15 Q60 40 55 65" fill="none"/>
          <path d="M65 25 Q40 30 15 35" fill="none"/>
        </g>
        <!-- 蜘蛛 -->
        <g transform="translate(60,20)">
          <ellipse cx="0" cy="0" rx="3" ry="2" fill="#2C2C2C"/>
          <line x1="-5" y1="-2" x2="-8" y2="-4" stroke="#2C2C2C" stroke-width="1"/>
          <line x1="-5" y1="2" x2="-8" y2="4" stroke="#2C2C2C" stroke-width="1"/>
          <line x1="5" y1="-2" x2="8" y2="-4" stroke="#2C2C2C" stroke-width="1"/>
          <line x1="5" y1="2" x2="8" y2="4" stroke="#2C2C2C" stroke-width="1"/>
        </g>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '85%', y: '5%' },
      anchor: 'top-right'
    },
    style: {
      zIndex: 997,
      opacity: 0.6
    },
    animation: {
      name: 'sparkle',
      duration: 5000,
      iterations: 'infinite',
      autoplay: true,
      delay: 2000
    },
    visible: true
  },

  // 女巫帽装饰
  {
    id: 'halloween-witch-hat',
    name: '女巫帽',
    type: WidgetType.FLOATING,
    content: `
      <svg width="50" height="70" viewBox="0 0 50 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4B0082;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2C2C2C;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- 帽子主体 -->
        <path d="M25 5 Q20 10 15 30 Q20 50 30 55 L35 55 Q45 50 35 30 Q30 10 25 5 Z" fill="url(#hatGradient)"/>
        <!-- 帽檐 -->
        <ellipse cx="32" cy="55" rx="18" ry="4" fill="#2C2C2C"/>
        <!-- 帽子装饰带 -->
        <rect x="20" y="45" width="20" height="4" fill="#FFD700"/>
        <!-- 星星装饰 -->
        <polygon points="25,35 26,38 29,38 27,40 28,43 25,41 22,43 23,40 21,38 24,38" fill="#FFD700"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '50%', y: '60%' },
      anchor: 'center'
    },
    style: {
      zIndex: 996,
      opacity: 0.8
    },
    animation: {
      name: 'shake',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true,
      delay: 1000
    },
    interactive: true,
    visible: true
  }
]

/**
 * 万圣节主题配置
 */
export const halloweenTheme: FestivalThemeConfig = {
  id: 'halloween',
  name: '万圣节主题',
  festival: FestivalType.HALLOWEEN,
  description: '神秘恐怖的万圣节主题，橙黑配色，南瓜灯、幽灵、蝙蝠等装饰元素，营造浓厚的万圣节氛围',
  colors: halloweenColors,
  widgets: halloweenWidgets,
  globalAnimations: [
    {
      name: 'spookyGlow',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true
    }
  ],
  onActivate: async () => {
    console.log('🎃 万圣节主题已激活！Happy Halloween!')
    
    // 添加全局样式
    const style = document.createElement('style')
    style.id = 'halloween-global-styles'
    style.textContent = `
      .ldesign-widget-halloween {
        filter: drop-shadow(0 0 8px rgba(255, 107, 53, 0.4));
      }
      
      .ldesign-halloween-spooky {
        animation: spookyGlow 3s ease-in-out infinite alternate;
      }
      
      @keyframes spookyGlow {
        from { filter: drop-shadow(0 0 5px #FF6B35); }
        to { filter: drop-shadow(0 0 20px #8B008B); }
      }
      
      /* 幽灵浮动效果 */
      .ldesign-widget-floating[data-widget-id*="ghost"] {
        animation-timing-function: ease-in-out;
      }
      
      /* 蝙蝠飞行效果 */
      .ldesign-widget-animation[data-widget-id*="bat"] {
        animation-direction: alternate;
      }
    `
    document.head.appendChild(style)
  },
  
  onDeactivate: async () => {
    console.log('万圣节主题已停用')
    
    // 移除全局样式
    const style = document.getElementById('halloween-global-styles')
    if (style) {
      style.remove()
    }
  },
  
  customConfig: {
    // 万圣节特有配置
    enableSpookyEffects: true,
    pumpkinGlowIntensity: 0.8,
    ghostTransparency: 0.7,
    playSpookySounds: false,
    enableBatAnimation: true
  }
}
