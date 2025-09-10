/**
 * @file 圣诞节主题配置
 * @description 圣诞节主题的完整配置，包括颜色、挂件和动画
 */

import type { FestivalThemeConfig, WidgetConfig } from '../core/types'
import { FestivalType, WidgetType } from '../core/types'

/**
 * 圣诞节主题颜色配置
 * 基于传统的红绿配色，营造温馨的圣诞氛围
 */
const christmasColors = {
  name: 'christmas-colors',
  displayName: '圣诞配色',
  light: {
    // 主色调 - 圣诞红
    primary: '#C41E3A',
    secondary: '#228B22',
    accent: '#FFD700',
    
    // 背景色
    background: '#F8F8FF',
    surface: '#FFFFFF',
    
    // 文字色
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#2F4F2F',
    onSurface: '#2F4F2F',
    
    // 状态色
    success: '#228B22',
    warning: '#FF8C00',
    error: '#C41E3A',
    info: '#4169E1',
    
    // 边框和分割线
    border: '#E0E0E0',
    divider: '#D3D3D3',
    
    // 特殊色彩
    christmasRed: '#C41E3A',
    christmasGreen: '#228B22',
    snow: '#FFFAFA',
    gold: '#FFD700'
  },
  dark: {
    // 主色调 - 深圣诞红
    primary: '#8B0000',
    secondary: '#006400',
    accent: '#DAA520',
    
    // 背景色
    background: '#0F1419',
    surface: '#1E2328',
    
    // 文字色
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#F0F8FF',
    onSurface: '#F0F8FF',
    
    // 状态色
    success: '#32CD32',
    warning: '#FFA500',
    error: '#FF6347',
    info: '#87CEEB',
    
    // 边框和分割线
    border: '#3C4043',
    divider: '#5F6368',
    
    // 特殊色彩
    christmasRed: '#8B0000',
    christmasGreen: '#006400',
    snow: '#F0F8FF',
    gold: '#DAA520'
  }
}

/**
 * 圣诞节主题挂件配置
 */
const christmasWidgets: WidgetConfig[] = [
  // 圣诞树装饰
  {
    id: 'christmas-tree',
    name: '圣诞树',
    type: WidgetType.FLOATING,
    content: `
      <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="treeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#32CD32;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#228B22;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- 树干 -->
        <rect x="35" y="80" width="10" height="20" fill="#8B4513"/>
        <!-- 树叶层1 -->
        <polygon points="40,70 20,50 60,50" fill="url(#treeGradient)"/>
        <!-- 树叶层2 -->
        <polygon points="40,55 15,35 65,35" fill="url(#treeGradient)"/>
        <!-- 树叶层3 -->
        <polygon points="40,40 10,20 70,20" fill="url(#treeGradient)"/>
        <!-- 星星 -->
        <polygon points="40,15 42,21 48,21 43,25 45,31 40,27 35,31 37,25 32,21 38,21" fill="#FFD700"/>
        <!-- 装饰球 -->
        <circle cx="30" cy="45" r="3" fill="#C41E3A"/>
        <circle cx="50" cy="40" r="3" fill="#FFD700"/>
        <circle cx="35" cy="60" r="3" fill="#C41E3A"/>
        <circle cx="45" cy="55" r="3" fill="#FFD700"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '10%', y: '20%' },
      anchor: 'top-left'
    },
    style: {
      zIndex: 1000,
      opacity: 0.9
    },
    animation: {
      name: 'glow',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true
    },
    interactive: true,
    responsive: true,
    visible: true
  },

  // 雪花装饰1
  {
    id: 'christmas-snowflake-1',
    name: '雪花1',
    type: WidgetType.ANIMATION,
    content: `
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(15,15)" stroke="#87CEEB" stroke-width="2" fill="none">
          <line x1="0" y1="-12" x2="0" y2="12"/>
          <line x1="-12" y1="0" x2="12" y2="0"/>
          <line x1="-8" y1="-8" x2="8" y2="8"/>
          <line x1="-8" y1="8" x2="8" y2="-8"/>
          <!-- 装饰分支 -->
          <line x1="-3" y1="-9" x2="0" y2="-12"/>
          <line x1="3" y1="-9" x2="0" y2="-12"/>
          <line x1="-3" y1="9" x2="0" y2="12"/>
          <line x1="3" y1="9" x2="0" y2="12"/>
        </g>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '20%', y: '5%' },
      anchor: 'top-center'
    },
    style: {
      zIndex: 999,
      opacity: 0.8
    },
    animation: {
      name: 'snowfall',
      duration: 5000,
      iterations: 'infinite',
      autoplay: true
    },
    visible: true
  },

  // 雪花装饰2
  {
    id: 'christmas-snowflake-2',
    name: '雪花2',
    type: WidgetType.ANIMATION,
    content: `
      <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(12.5,12.5)" stroke="#B0E0E6" stroke-width="1.5" fill="none">
          <line x1="0" y1="-10" x2="0" y2="10"/>
          <line x1="-10" y1="0" x2="10" y2="0"/>
          <line x1="-7" y1="-7" x2="7" y2="7"/>
          <line x1="-7" y1="7" x2="7" y2="-7"/>
          <circle cx="0" cy="0" r="2" fill="#FFFFFF"/>
        </g>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '70%', y: '8%' },
      anchor: 'top-center'
    },
    style: {
      zIndex: 999,
      opacity: 0.7
    },
    animation: {
      name: 'snowfall',
      duration: 6000,
      iterations: 'infinite',
      autoplay: true,
      delay: 1000
    },
    visible: true
  },

  // 圣诞帽装饰
  {
    id: 'christmas-hat',
    name: '圣诞帽',
    type: WidgetType.FLOATING,
    content: `
      <svg width="50" height="60" viewBox="0 0 50 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="hatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#C41E3A;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- 帽子主体 -->
        <path d="M10 45 Q25 10 40 45 L35 50 L15 50 Z" fill="url(#hatGradient)"/>
        <!-- 帽子边缘 -->
        <ellipse cx="25" cy="50" rx="20" ry="5" fill="#FFFFFF"/>
        <!-- 帽子顶部球 -->
        <circle cx="40" cy="20" r="6" fill="#FFFFFF"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '85%', y: '15%' },
      anchor: 'top-right'
    },
    style: {
      zIndex: 998,
      opacity: 0.9
    },
    animation: {
      name: 'bounce',
      duration: 2000,
      iterations: 'infinite',
      autoplay: true,
      delay: 500
    },
    interactive: true,
    visible: true
  },

  // 铃铛装饰
  {
    id: 'christmas-bell',
    name: '圣诞铃铛',
    type: WidgetType.FLOATING,
    content: `
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bellGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" style="stop-color:#FFFF99;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#DAA520;stop-opacity:1" />
          </radialGradient>
        </defs>
        <!-- 铃铛主体 -->
        <path d="M20 10 Q10 15 10 25 Q10 30 15 32 L25 32 Q30 30 30 25 Q30 15 20 10 Z" fill="url(#bellGradient)"/>
        <!-- 铃铛顶部 -->
        <rect x="18" y="8" width="4" height="6" rx="2" fill="#B8860B"/>
        <!-- 铃铛底部开口 -->
        <ellipse cx="20" cy="32" rx="10" ry="2" fill="none" stroke="#B8860B" stroke-width="1"/>
        <!-- 铃铛内部小球 -->
        <circle cx="20" cy="28" r="2" fill="#8B4513"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '60%', y: '30%' },
      anchor: 'center'
    },
    style: {
      zIndex: 997,
      opacity: 0.8
    },
    animation: {
      name: 'shake',
      duration: 1000,
      iterations: 'infinite',
      autoplay: true,
      delay: 2000
    },
    interactive: true,
    visible: true
  },

  // 礼物盒装饰
  {
    id: 'christmas-gift',
    name: '礼物盒',
    type: WidgetType.FLOATING,
    content: `
      <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="giftGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF69B4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#C41E3A;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- 礼物盒主体 -->
        <rect x="8" y="15" width="30" height="25" rx="2" fill="url(#giftGradient)"/>
        <!-- 礼物盒盖子 -->
        <rect x="6" y="12" width="34" height="8" rx="2" fill="#8B0000"/>
        <!-- 丝带 - 垂直 -->
        <rect x="20" y="5" width="6" height="35" fill="#FFD700"/>
        <!-- 丝带 - 水平 -->
        <rect x="5" y="20" width="36" height="6" fill="#FFD700"/>
        <!-- 蝴蝶结 -->
        <ellipse cx="18" cy="8" rx="4" ry="3" fill="#FFD700"/>
        <ellipse cx="28" cy="8" rx="4" ry="3" fill="#FFD700"/>
        <rect x="21" y="6" width="4" height="4" fill="#DAA520"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '25%', y: '70%' },
      anchor: 'center'
    },
    style: {
      zIndex: 996,
      opacity: 0.9
    },
    animation: {
      name: 'pulse',
      duration: 2500,
      iterations: 'infinite',
      autoplay: true,
      delay: 1500
    },
    interactive: true,
    visible: true
  }
]

/**
 * 圣诞节主题配置
 */
export const christmasTheme: FestivalThemeConfig = {
  id: 'christmas',
  name: '圣诞节主题',
  festival: FestivalType.CHRISTMAS,
  description: '温馨的圣诞节主题，红绿配色，圣诞树、雪花、圣诞帽等装饰元素，营造浓厚的节日氛围',
  colors: christmasColors,
  widgets: christmasWidgets,
  globalAnimations: [
    {
      name: 'christmasSparkle',
      duration: 2500,
      iterations: 'infinite',
      autoplay: true
    }
  ],
  onActivate: async () => {
    console.log('🎄 圣诞节主题已激活！Merry Christmas!')
    
    // 添加全局样式
    const style = document.createElement('style')
    style.id = 'christmas-global-styles'
    style.textContent = `
      .ldesign-widget-christmas {
        filter: drop-shadow(0 0 8px rgba(196, 30, 58, 0.3));
      }
      
      .ldesign-christmas-sparkle {
        animation: christmasSparkle 2.5s ease-in-out infinite alternate;
      }
      
      @keyframes christmasSparkle {
        from { filter: drop-shadow(0 0 5px #FFD700); }
        to { filter: drop-shadow(0 0 15px #228B22); }
      }
      
      /* 雪花飘落效果 */
      .ldesign-widget-animation[data-widget-id*="snowflake"] {
        animation-timing-function: linear;
      }
    `
    document.head.appendChild(style)
  },
  
  onDeactivate: async () => {
    console.log('圣诞节主题已停用')
    
    // 移除全局样式
    const style = document.getElementById('christmas-global-styles')
    if (style) {
      style.remove()
    }
  },
  
  customConfig: {
    // 圣诞节特有配置
    enableSnowfall: true,
    snowflakeCount: 10,
    showChristmasTree: true,
    playChristmasMusic: false,
    enableTwinkleEffect: true
  }
}
