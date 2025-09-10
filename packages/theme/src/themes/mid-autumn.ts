/**
 * @file 中秋节主题配置
 * @description 中秋节主题的完整配置，包括颜色、挂件和动画
 */

import type { FestivalThemeConfig, WidgetConfig } from '../core/types'
import { FestivalType, WidgetType } from '../core/types'

/**
 * 中秋节主题颜色配置
 * 基于月色和桂花的温馨配色
 */
const midAutumnColors = {
  name: 'mid-autumn-colors',
  displayName: '中秋配色',
  light: {
    // 主色调 - 月光银
    primary: '#C0C0C0',
    secondary: '#DAA520',
    accent: '#F0E68C',
    
    // 背景色
    background: '#F5F5DC',
    surface: '#FFFFFF',
    
    // 文字色
    onPrimary: '#2F4F4F',
    onSecondary: '#000000',
    onBackground: '#2F4F4F',
    onSurface: '#2F4F4F',
    
    // 状态色
    success: '#228B22',
    warning: '#FF8C00',
    error: '#DC143C',
    info: '#4682B4',
    
    // 边框和分割线
    border: '#D3D3D3',
    divider: '#E6E6FA',
    
    // 特殊色彩
    moonSilver: '#C0C0C0',
    osmanthusGold: '#DAA520',
    starLight: '#F0E68C',
    nightBlue: '#191970'
  },
  dark: {
    // 主色调 - 深月色
    primary: '#708090',
    secondary: '#B8860B',
    accent: '#BDB76B',
    
    // 背景色
    background: '#191970',
    surface: '#2F2F4F',
    
    // 文字色
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#F5F5DC',
    onSurface: '#F5F5DC',
    
    // 状态色
    success: '#32CD32',
    warning: '#FFA500',
    error: '#FF6347',
    info: '#87CEEB',
    
    // 边框和分割线
    border: '#4682B4',
    divider: '#6495ED',
    
    // 特殊色彩
    moonSilver: '#708090',
    osmanthusGold: '#B8860B',
    starLight: '#BDB76B',
    nightBlue: '#191970'
  }
}

/**
 * 中秋节主题挂件配置
 */
const midAutumnWidgets: WidgetConfig[] = [
  // 月亮装饰
  {
    id: 'mid-autumn-moon',
    name: '月亮',
    type: WidgetType.FLOATING,
    content: `
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="moonGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" style="stop-color:#FFFACD;stop-opacity:1" />
            <stop offset="70%" style="stop-color:#F0E68C;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
          </radialGradient>
          <filter id="moonGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <!-- 月亮主体 -->
        <circle cx="40" cy="40" r="35" fill="url(#moonGradient)" filter="url(#moonGlow)"/>
        <!-- 月亮表面纹理 -->
        <ellipse cx="30" cy="25" rx="4" ry="3" fill="#DAA520" opacity="0.3"/>
        <ellipse cx="50" cy="35" rx="6" ry="4" fill="#DAA520" opacity="0.2"/>
        <ellipse cx="35" cy="50" rx="5" ry="3" fill="#DAA520" opacity="0.25"/>
        <ellipse cx="55" cy="55" rx="3" ry="2" fill="#DAA520" opacity="0.3"/>
        <!-- 月亮光晕 -->
        <circle cx="40" cy="40" r="38" fill="none" stroke="#F0E68C" stroke-width="1" opacity="0.5"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '85%', y: '10%' },
      anchor: 'top-right'
    },
    style: {
      zIndex: 1000,
      opacity: 0.9
    },
    animation: {
      name: 'glow',
      duration: 4000,
      iterations: 'infinite',
      autoplay: true
    },
    interactive: true,
    responsive: true,
    visible: true
  },

  // 玉兔装饰
  {
    id: 'mid-autumn-rabbit',
    name: '玉兔',
    type: WidgetType.FLOATING,
    content: `
      <svg width="50" height="60" viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rabbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#F5F5DC;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- 兔子身体 -->
        <ellipse cx="25" cy="45" rx="15" ry="12" fill="url(#rabbitGradient)"/>
        <!-- 兔子头部 -->
        <ellipse cx="25" cy="25" rx="12" ry="10" fill="url(#rabbitGradient)"/>
        <!-- 兔子耳朵 -->
        <ellipse cx="20" cy="12" rx="4" ry="12" fill="url(#rabbitGradient)" transform="rotate(-15 20 12)"/>
        <ellipse cx="30" cy="12" rx="4" ry="12" fill="url(#rabbitGradient)" transform="rotate(15 30 12)"/>
        <!-- 耳朵内侧 -->
        <ellipse cx="20" cy="12" rx="2" ry="8" fill="#FFB6C1" transform="rotate(-15 20 12)"/>
        <ellipse cx="30" cy="12" rx="2" ry="8" fill="#FFB6C1" transform="rotate(15 30 12)"/>
        <!-- 眼睛 -->
        <circle cx="22" cy="22" r="2" fill="#000000"/>
        <circle cx="28" cy="22" r="2" fill="#000000"/>
        <!-- 鼻子 -->
        <ellipse cx="25" cy="27" rx="1" ry="2" fill="#FFB6C1"/>
        <!-- 嘴巴 -->
        <path d="M25 29 Q23 31 21 29" stroke="#000000" stroke-width="1" fill="none"/>
        <path d="M25 29 Q27 31 29 29" stroke="#000000" stroke-width="1" fill="none"/>
        <!-- 尾巴 -->
        <circle cx="35" cy="50" r="4" fill="url(#rabbitGradient)"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '15%', y: '30%' },
      anchor: 'center'
    },
    style: {
      zIndex: 999,
      opacity: 0.8
    },
    animation: {
      name: 'bounce',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true
    },
    interactive: true,
    visible: true
  },

  // 桂花装饰
  {
    id: 'mid-autumn-osmanthus',
    name: '桂花',
    type: WidgetType.BACKGROUND,
    content: `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(20,20)">
          <!-- 花瓣 -->
          <ellipse cx="0" cy="-8" rx="2" ry="4" fill="#DAA520" transform="rotate(0)"/>
          <ellipse cx="0" cy="-8" rx="2" ry="4" fill="#DAA520" transform="rotate(90)"/>
          <ellipse cx="0" cy="-8" rx="2" ry="4" fill="#DAA520" transform="rotate(180)"/>
          <ellipse cx="0" cy="-8" rx="2" ry="4" fill="#DAA520" transform="rotate(270)"/>
          <!-- 花心 -->
          <circle cx="0" cy="0" r="2" fill="#F0E68C"/>
          <!-- 花蕊 -->
          <circle cx="0" cy="0" r="1" fill="#B8860B"/>
        </g>
        <!-- 叶子 -->
        <ellipse cx="10" cy="30" rx="8" ry="3" fill="#228B22" transform="rotate(-30 10 30)"/>
        <ellipse cx="30" cy="30" rx="8" ry="3" fill="#228B22" transform="rotate(30 30 30)"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '70%', y: '60%' },
      anchor: 'center'
    },
    style: {
      zIndex: 998,
      opacity: 0.7
    },
    animation: {
      name: 'sparkle',
      duration: 5000,
      iterations: 'infinite',
      autoplay: true,
      delay: 1000
    },
    visible: true
  },

  // 月饼装饰
  {
    id: 'mid-autumn-mooncake',
    name: '月饼',
    type: WidgetType.FLOATING,
    content: `
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="mooncakeGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" style="stop-color:#F4A460;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#D2691E;stop-opacity:1" />
          </radialGradient>
        </defs>
        <!-- 月饼主体 -->
        <circle cx="25" cy="25" r="20" fill="url(#mooncakeGradient)"/>
        <!-- 月饼边缘装饰 -->
        <circle cx="25" cy="25" r="18" fill="none" stroke="#8B4513" stroke-width="1"/>
        <!-- 月饼表面花纹 -->
        <circle cx="25" cy="25" r="12" fill="none" stroke="#8B4513" stroke-width="1"/>
        <line x1="25" y1="13" x2="25" y2="37" stroke="#8B4513" stroke-width="1"/>
        <line x1="13" y1="25" x2="37" y2="25" stroke="#8B4513" stroke-width="1"/>
        <!-- 中心装饰 -->
        <circle cx="25" cy="25" r="4" fill="#8B4513"/>
        <text x="25" y="29" text-anchor="middle" fill="#F4A460" font-size="6" font-weight="bold">月</text>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '40%', y: '75%' },
      anchor: 'center'
    },
    style: {
      zIndex: 997,
      opacity: 0.8
    },
    animation: {
      name: 'rotate',
      duration: 8000,
      iterations: 'infinite',
      autoplay: true,
      delay: 2000
    },
    interactive: true,
    visible: true
  },

  // 星星装饰
  {
    id: 'mid-autumn-stars',
    name: '星星',
    type: WidgetType.ANIMATION,
    content: `
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(15,15)">
          <!-- 大星星 -->
          <polygon points="0,-8 2,-2 8,-2 3,2 5,8 0,4 -5,8 -3,2 -8,-2 -2,-2" fill="#F0E68C"/>
          <!-- 小星星 -->
          <polygon points="8,-6 9,-4 11,-4 9,-2 10,0 8,-1 6,0 7,-2 5,-4 7,-4" fill="#FFFACD"/>
          <polygon points="-8,6 -7,8 -5,8 -7,10 -6,12 -8,11 -10,12 -9,10 -11,8 -9,8" fill="#FFFACD"/>
        </g>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '60%', y: '20%' },
      anchor: 'center'
    },
    style: {
      zIndex: 996,
      opacity: 0.6
    },
    animation: {
      name: 'sparkle',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true,
      delay: 500
    },
    visible: true
  }
]

/**
 * 中秋节主题配置
 */
export const midAutumnTheme: FestivalThemeConfig = {
  id: 'mid-autumn',
  name: '中秋节主题',
  festival: FestivalType.MID_AUTUMN,
  description: '温馨的中秋节主题，月色配色，月亮、玉兔、桂花、月饼等装饰元素，营造团圆和谐的节日氛围',
  colors: midAutumnColors,
  widgets: midAutumnWidgets,
  globalAnimations: [
    {
      name: 'moonlightGlow',
      duration: 5000,
      iterations: 'infinite',
      autoplay: true
    }
  ],
  onActivate: async () => {
    console.log('🌕 中秋节主题已激活！中秋快乐，团团圆圆！')
    
    // 添加全局样式
    const style = document.createElement('style')
    style.id = 'mid-autumn-global-styles'
    style.textContent = `
      .ldesign-widget-mid-autumn {
        filter: drop-shadow(0 0 8px rgba(240, 230, 140, 0.4));
      }
      
      .ldesign-mid-autumn-moonlight {
        animation: moonlightGlow 5s ease-in-out infinite alternate;
      }
      
      @keyframes moonlightGlow {
        from { filter: drop-shadow(0 0 5px #F0E68C); }
        to { filter: drop-shadow(0 0 20px #DAA520); }
      }
      
      /* 月亮发光效果 */
      .ldesign-widget-floating[data-widget-id*="moon"] {
        animation-timing-function: ease-in-out;
      }
      
      /* 星星闪烁效果 */
      .ldesign-widget-animation[data-widget-id*="stars"] {
        animation-direction: alternate;
      }
    `
    document.head.appendChild(style)
  },
  
  onDeactivate: async () => {
    console.log('中秋节主题已停用')
    
    // 移除全局样式
    const style = document.getElementById('mid-autumn-global-styles')
    if (style) {
      style.remove()
    }
  },
  
  customConfig: {
    // 中秋节特有配置
    enableMoonGlow: true,
    rabbitAnimation: true,
    osmanthusFragrance: true,
    starTwinkle: true,
    playTraditionalMusic: false
  }
}
