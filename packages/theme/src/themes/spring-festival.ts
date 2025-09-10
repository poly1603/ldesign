/**
 * @file 春节主题配置
 * @description 春节主题的完整配置，包括颜色、挂件和动画
 */

import type { FestivalThemeConfig, WidgetConfig } from '../core/types'
import { FestivalType, WidgetType } from '../core/types'

/**
 * 春节主题颜色配置
 * 基于传统的红金配色，营造喜庆祥和的节日氛围
 */
const springFestivalColors = {
  name: 'spring-festival-colors',
  displayName: '春节配色',
  light: {
    // 主色调 - 中国红
    primary: '#DC143C',
    secondary: '#FFD700',
    accent: '#FF6B35',
    
    // 背景色
    background: '#FFF8F0',
    surface: '#FFFFFF',
    
    // 文字色
    onPrimary: '#FFFFFF',
    onSecondary: '#8B0000',
    onBackground: '#2C1810',
    onSurface: '#2C1810',
    
    // 状态色
    success: '#228B22',
    warning: '#FF8C00',
    error: '#DC143C',
    info: '#4169E1',
    
    // 边框和分割线
    border: '#E6D7C3',
    divider: '#D4C4A8',
    
    // 特殊色彩
    gold: '#FFD700',
    red: '#DC143C',
    orange: '#FF6B35'
  },
  dark: {
    // 主色调 - 深红色
    primary: '#B22222',
    secondary: '#DAA520',
    accent: '#FF4500',
    
    // 背景色
    background: '#1A0F0A',
    surface: '#2C1810',
    
    // 文字色
    onPrimary: '#FFFFFF',
    onSecondary: '#000000',
    onBackground: '#F5E6D3',
    onSurface: '#F5E6D3',
    
    // 状态色
    success: '#32CD32',
    warning: '#FFA500',
    error: '#FF6347',
    info: '#87CEEB',
    
    // 边框和分割线
    border: '#4A3728',
    divider: '#5D4037',
    
    // 特殊色彩
    gold: '#DAA520',
    red: '#B22222',
    orange: '#FF4500'
  }
}

/**
 * 春节主题挂件配置
 */
const springFestivalWidgets: WidgetConfig[] = [
  // 红灯笼挂件
  {
    id: 'spring-lantern-left',
    name: '左侧红灯笼',
    type: WidgetType.FLOATING,
    content: `
      <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lanternGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF4444;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#DC143C;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8B0000;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- 灯笼顶部 -->
        <rect x="20" y="5" width="20" height="8" rx="4" fill="#DAA520"/>
        <!-- 灯笼主体 -->
        <ellipse cx="30" cy="35" rx="25" ry="20" fill="url(#lanternGradient)"/>
        <!-- 灯笼装饰线 -->
        <ellipse cx="30" cy="25" rx="20" ry="2" fill="#FFD700"/>
        <ellipse cx="30" cy="35" rx="20" ry="2" fill="#FFD700"/>
        <ellipse cx="30" cy="45" rx="20" ry="2" fill="#FFD700"/>
        <!-- 灯笼底部 -->
        <rect x="25" y="55" width="10" height="15" fill="#DAA520"/>
        <!-- 福字 -->
        <text x="30" y="40" text-anchor="middle" fill="#FFD700" font-size="16" font-weight="bold">福</text>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '5%', y: '10%' },
      anchor: 'top-left'
    },
    style: {
      zIndex: 1000,
      opacity: 0.9
    },
    animation: {
      name: 'lanternSwing',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true
    },
    interactive: true,
    responsive: true,
    visible: true
  },

  // 右侧红灯笼
  {
    id: 'spring-lantern-right',
    name: '右侧红灯笼',
    type: WidgetType.FLOATING,
    content: `
      <svg width="60" height="80" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lanternGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF4444;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#DC143C;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8B0000;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- 灯笼顶部 -->
        <rect x="20" y="5" width="20" height="8" rx="4" fill="#DAA520"/>
        <!-- 灯笼主体 -->
        <ellipse cx="30" cy="35" rx="25" ry="20" fill="url(#lanternGradient2)"/>
        <!-- 灯笼装饰线 -->
        <ellipse cx="30" cy="25" rx="20" ry="2" fill="#FFD700"/>
        <ellipse cx="30" cy="35" rx="20" ry="2" fill="#FFD700"/>
        <ellipse cx="30" cy="45" rx="20" ry="2" fill="#FFD700"/>
        <!-- 灯笼底部 -->
        <rect x="25" y="55" width="10" height="15" fill="#DAA520"/>
        <!-- 寿字 -->
        <text x="30" y="40" text-anchor="middle" fill="#FFD700" font-size="16" font-weight="bold">寿</text>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '95%', y: '10%' },
      anchor: 'top-right'
    },
    style: {
      zIndex: 1000,
      opacity: 0.9
    },
    animation: {
      name: 'lanternSwing',
      duration: 3200,
      iterations: 'infinite',
      autoplay: true,
      delay: 500
    },
    interactive: true,
    responsive: true,
    visible: true
  },

  // 烟花装饰
  {
    id: 'spring-firework-1',
    name: '烟花装饰1',
    type: WidgetType.ANIMATION,
    content: `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(20,20)">
          <circle cx="0" cy="0" r="2" fill="#FFD700"/>
          <line x1="0" y1="0" x2="0" y2="-15" stroke="#FF6B35" stroke-width="2"/>
          <line x1="0" y1="0" x2="10" y2="-10" stroke="#DC143C" stroke-width="2"/>
          <line x1="0" y1="0" x2="15" y2="0" stroke="#FFD700" stroke-width="2"/>
          <line x1="0" y1="0" x2="10" y2="10" stroke="#FF6B35" stroke-width="2"/>
          <line x1="0" y1="0" x2="0" y2="15" stroke="#DC143C" stroke-width="2"/>
          <line x1="0" y1="0" x2="-10" y2="10" stroke="#FFD700" stroke-width="2"/>
          <line x1="0" y1="0" x2="-15" y2="0" stroke="#FF6B35" stroke-width="2"/>
          <line x1="0" y1="0" x2="-10" y2="-10" stroke="#DC143C" stroke-width="2"/>
        </g>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '20%', y: '15%' },
      anchor: 'center'
    },
    style: {
      zIndex: 999,
      opacity: 0.8
    },
    animation: {
      name: 'firework',
      duration: 2000,
      iterations: 'infinite',
      autoplay: true,
      delay: 1000
    },
    visible: true
  },

  // 金币装饰
  {
    id: 'spring-coin-1',
    name: '金币装饰',
    type: WidgetType.FLOATING,
    content: `
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="coinGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" style="stop-color:#FFFF99;stop-opacity:1" />
            <stop offset="70%" style="stop-color:#FFD700;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
          </radialGradient>
        </defs>
        <circle cx="15" cy="15" r="14" fill="url(#coinGradient)" stroke="#B8860B" stroke-width="1"/>
        <rect x="10" y="8" width="10" height="14" fill="none" stroke="#B8860B" stroke-width="1"/>
        <text x="15" y="18" text-anchor="middle" fill="#8B4513" font-size="8" font-weight="bold">财</text>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '80%', y: '25%' },
      anchor: 'center'
    },
    style: {
      zIndex: 998,
      opacity: 0.9
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

  // 梅花装饰
  {
    id: 'spring-plum-blossom',
    name: '梅花装饰',
    type: WidgetType.BACKGROUND,
    content: `
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(25,25)">
          <!-- 花瓣 -->
          <ellipse cx="0" cy="-12" rx="4" ry="8" fill="#FFB6C1" transform="rotate(0)"/>
          <ellipse cx="0" cy="-12" rx="4" ry="8" fill="#FFB6C1" transform="rotate(72)"/>
          <ellipse cx="0" cy="-12" rx="4" ry="8" fill="#FFB6C1" transform="rotate(144)"/>
          <ellipse cx="0" cy="-12" rx="4" ry="8" fill="#FFB6C1" transform="rotate(216)"/>
          <ellipse cx="0" cy="-12" rx="4" ry="8" fill="#FFB6C1" transform="rotate(288)"/>
          <!-- 花心 -->
          <circle cx="0" cy="0" r="3" fill="#FFD700"/>
        </g>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '15%', y: '60%' },
      anchor: 'center'
    },
    style: {
      zIndex: 997,
      opacity: 0.7
    },
    animation: {
      name: 'sparkle',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true,
      delay: 2000
    },
    visible: true
  }
]

/**
 * 春节主题配置
 */
export const springFestivalTheme: FestivalThemeConfig = {
  id: 'spring-festival',
  name: '春节主题',
  festival: FestivalType.SPRING_FESTIVAL,
  description: '传统春节主题，红金配色，灯笼、烟花、金币等装饰元素，营造喜庆祥和的节日氛围',
  colors: springFestivalColors,
  widgets: springFestivalWidgets,
  globalAnimations: [
    {
      name: 'festivalGlow',
      duration: 2000,
      iterations: 'infinite',
      autoplay: true
    }
  ],
  onActivate: async () => {
    console.log('🧧 春节主题已激活！恭喜发财，新年快乐！')
    
    // 添加全局样式
    const style = document.createElement('style')
    style.id = 'spring-festival-global-styles'
    style.textContent = `
      .ldesign-widget-spring-festival {
        filter: drop-shadow(0 0 8px rgba(220, 20, 60, 0.3));
      }
      
      .ldesign-spring-festival-glow {
        animation: springFestivalGlow 2s ease-in-out infinite alternate;
      }
      
      @keyframes springFestivalGlow {
        from { filter: drop-shadow(0 0 5px #FFD700); }
        to { filter: drop-shadow(0 0 15px #DC143C); }
      }
    `
    document.head.appendChild(style)
  },
  
  onDeactivate: async () => {
    console.log('春节主题已停用')
    
    // 移除全局样式
    const style = document.getElementById('spring-festival-global-styles')
    if (style) {
      style.remove()
    }
  },
  
  customConfig: {
    // 春节特有配置
    enableFireworks: true,
    lanternCount: 2,
    showTraditionalElements: true,
    playFestivalMusic: false
  }
}
