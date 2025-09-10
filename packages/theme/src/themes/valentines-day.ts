/**
 * @file 情人节主题配置
 * @description 情人节主题的完整配置，包括颜色、挂件和动画
 */

import type { FestivalThemeConfig, WidgetConfig } from '../core/types'
import { FestivalType, WidgetType } from '../core/types'

/**
 * 情人节主题颜色配置
 * 基于粉色和红色的浪漫配色
 */
const valentinesColors = {
  name: 'valentines-colors',
  displayName: '情人节配色',
  light: {
    // 主色调 - 浪漫粉
    primary: '#FF69B4',
    secondary: '#DC143C',
    accent: '#FFB6C1',
    
    // 背景色
    background: '#FFF0F5',
    surface: '#FFFFFF',
    
    // 文字色
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#8B008B',
    onSurface: '#8B008B',
    
    // 状态色
    success: '#FF69B4',
    warning: '#FF8C00',
    error: '#DC143C',
    info: '#DA70D6',
    
    // 边框和分割线
    border: '#F8BBD9',
    divider: '#F5A9BC',
    
    // 特殊色彩
    loveRed: '#DC143C',
    sweetPink: '#FF69B4',
    softPink: '#FFB6C1',
    roseGold: '#E8B4B8'
  },
  dark: {
    // 主色调 - 深粉色
    primary: '#C71585',
    secondary: '#8B0000',
    accent: '#DA70D6',
    
    // 背景色
    background: '#2F1B25',
    surface: '#3D2B31',
    
    // 文字色
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onBackground: '#FFE4E1',
    onSurface: '#FFE4E1',
    
    // 状态色
    success: '#FF69B4',
    warning: '#FFA500',
    error: '#FF6347',
    info: '#DDA0DD',
    
    // 边框和分割线
    border: '#5D4E75',
    divider: '#6B5B95',
    
    // 特殊色彩
    loveRed: '#8B0000',
    sweetPink: '#C71585',
    softPink: '#DA70D6',
    roseGold: '#BC8F8F'
  }
}

/**
 * 情人节主题挂件配置
 */
const valentinesWidgets: WidgetConfig[] = [
  // 爱心装饰1
  {
    id: 'valentines-heart-1',
    name: '爱心1',
    type: WidgetType.FLOATING,
    content: `
      <svg width="40" height="35" viewBox="0 0 40 35" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="heartGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FF69B4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#DC143C;stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M20,30 C20,30 5,20 5,12 C5,8 8,5 12,5 C16,5 20,8 20,12 C20,8 24,5 28,5 C32,5 35,8 35,12 C35,20 20,30 20,30 Z" 
              fill="url(#heartGradient1)"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '15%', y: '20%' },
      anchor: 'center'
    },
    style: {
      zIndex: 1000,
      opacity: 0.8
    },
    animation: {
      name: 'pulse',
      duration: 2000,
      iterations: 'infinite',
      autoplay: true
    },
    interactive: true,
    responsive: true,
    visible: true
  },

  // 爱心装饰2
  {
    id: 'valentines-heart-2',
    name: '爱心2',
    type: WidgetType.FLOATING,
    content: `
      <svg width="30" height="26" viewBox="0 0 30 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="heartGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFB6C1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FF69B4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <path d="M15,23 C15,23 3,15 3,9 C3,6 5,4 8,4 C11,4 15,6 15,9 C15,6 19,4 22,4 C25,4 27,6 27,9 C27,15 15,23 15,23 Z" 
              fill="url(#heartGradient2)"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '75%', y: '25%' },
      anchor: 'center'
    },
    style: {
      zIndex: 999,
      opacity: 0.7
    },
    animation: {
      name: 'float',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true,
      delay: 500
    },
    interactive: true,
    visible: true
  },

  // 玫瑰花装饰
  {
    id: 'valentines-rose',
    name: '玫瑰花',
    type: WidgetType.FLOATING,
    content: `
      <svg width="50" height="70" viewBox="0 0 50 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="roseGradient" cx="50%" cy="30%" r="70%">
            <stop offset="0%" style="stop-color:#FFB6C1;stop-opacity:1" />
            <stop offset="70%" style="stop-color:#DC143C;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8B0000;stop-opacity:1" />
          </radialGradient>
        </defs>
        <!-- 花茎 -->
        <rect x="23" y="35" width="4" height="35" fill="#228B22"/>
        <!-- 叶子 -->
        <ellipse cx="18" cy="45" rx="8" ry="4" fill="#228B22" transform="rotate(-30 18 45)"/>
        <ellipse cx="32" cy="55" rx="8" ry="4" fill="#228B22" transform="rotate(30 32 55)"/>
        <!-- 花朵外层花瓣 -->
        <ellipse cx="25" cy="20" rx="12" ry="8" fill="url(#roseGradient)" transform="rotate(0 25 20)"/>
        <ellipse cx="25" cy="20" rx="12" ry="8" fill="url(#roseGradient)" transform="rotate(45 25 20)" opacity="0.8"/>
        <ellipse cx="25" cy="20" rx="12" ry="8" fill="url(#roseGradient)" transform="rotate(90 25 20)" opacity="0.6"/>
        <ellipse cx="25" cy="20" rx="12" ry="8" fill="url(#roseGradient)" transform="rotate(135 25 20)" opacity="0.4"/>
        <!-- 花朵中心 -->
        <circle cx="25" cy="20" r="6" fill="#8B0000"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '90%', y: '40%' },
      anchor: 'center'
    },
    style: {
      zIndex: 998,
      opacity: 0.9
    },
    animation: {
      name: 'sparkle',
      duration: 4000,
      iterations: 'infinite',
      autoplay: true,
      delay: 1000
    },
    interactive: true,
    visible: true
  },

  // 丘比特箭装饰
  {
    id: 'valentines-arrow',
    name: '丘比特箭',
    type: WidgetType.ANIMATION,
    content: `
      <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- 箭杆 -->
        <rect x="15" y="9" width="30" height="2" fill="#8B4513"/>
        <!-- 箭头 -->
        <polygon points="45,10 55,5 55,15" fill="#C0C0C0"/>
        <!-- 箭尾 -->
        <polygon points="15,10 5,5 10,10 5,15" fill="#DC143C"/>
        <!-- 爱心装饰 -->
        <path d="M30,6 C30,6 27,4 25,6 C23,4 20,6 20,6 C20,8 25,12 25,12 C25,12 30,8 30,6 Z" fill="#FF69B4"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '40%', y: '15%' },
      anchor: 'center'
    },
    style: {
      zIndex: 997,
      opacity: 0.8
    },
    animation: {
      name: 'float',
      duration: 5000,
      iterations: 'infinite',
      autoplay: true,
      delay: 2000
    },
    visible: true
  },

  // 蝴蝶装饰
  {
    id: 'valentines-butterfly',
    name: '蝴蝶',
    type: WidgetType.ANIMATION,
    content: `
      <svg width="35" height="25" viewBox="0 0 35 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="butterflyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFB6C1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#FF69B4;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- 蝴蝶身体 -->
        <ellipse cx="17.5" cy="12.5" rx="1" ry="10" fill="#8B008B"/>
        <!-- 左上翅膀 -->
        <ellipse cx="10" cy="8" rx="8" ry="6" fill="url(#butterflyGradient)" transform="rotate(-20 10 8)"/>
        <!-- 右上翅膀 -->
        <ellipse cx="25" cy="8" rx="8" ry="6" fill="url(#butterflyGradient)" transform="rotate(20 25 8)"/>
        <!-- 左下翅膀 -->
        <ellipse cx="12" cy="17" rx="6" ry="4" fill="url(#butterflyGradient)" transform="rotate(-10 12 17)"/>
        <!-- 右下翅膀 -->
        <ellipse cx="23" cy="17" rx="6" ry="4" fill="url(#butterflyGradient)" transform="rotate(10 23 17)"/>
        <!-- 触角 -->
        <line x1="16" y1="3" x2="14" y2="1" stroke="#8B008B" stroke-width="1"/>
        <line x1="19" y1="3" x2="21" y2="1" stroke="#8B008B" stroke-width="1"/>
        <circle cx="14" cy="1" r="1" fill="#FF69B4"/>
        <circle cx="21" cy="1" r="1" fill="#FF69B4"/>
      </svg>
    `,
    position: {
      type: 'fixed',
      position: { x: '60%', y: '70%' },
      anchor: 'center'
    },
    style: {
      zIndex: 996,
      opacity: 0.7
    },
    animation: {
      name: 'float',
      duration: 4000,
      iterations: 'infinite',
      autoplay: true,
      delay: 1500
    },
    visible: true
  }
]

/**
 * 情人节主题配置
 */
export const valentinesDayTheme: FestivalThemeConfig = {
  id: 'valentines-day',
  name: '情人节主题',
  festival: FestivalType.VALENTINES_DAY,
  description: '浪漫的情人节主题，粉红配色，爱心、玫瑰、蝴蝶等装饰元素，营造甜蜜浪漫的节日氛围',
  colors: valentinesColors,
  widgets: valentinesWidgets,
  globalAnimations: [
    {
      name: 'romanticGlow',
      duration: 3000,
      iterations: 'infinite',
      autoplay: true
    }
  ],
  onActivate: async () => {
    console.log('💕 情人节主题已激活！Happy Valentine\'s Day!')
    
    // 添加全局样式
    const style = document.createElement('style')
    style.id = 'valentines-global-styles'
    style.textContent = `
      .ldesign-widget-valentines {
        filter: drop-shadow(0 0 8px rgba(255, 105, 180, 0.4));
      }
      
      .ldesign-valentines-romantic {
        animation: romanticGlow 3s ease-in-out infinite alternate;
      }
      
      @keyframes romanticGlow {
        from { filter: drop-shadow(0 0 5px #FF69B4); }
        to { filter: drop-shadow(0 0 15px #DC143C); }
      }
      
      /* 爱心跳动效果 */
      .ldesign-widget-floating[data-widget-id*="heart"] {
        animation-timing-function: ease-in-out;
      }
      
      /* 蝴蝶飞舞效果 */
      .ldesign-widget-animation[data-widget-id*="butterfly"] {
        animation-direction: alternate;
      }
    `
    document.head.appendChild(style)
  },
  
  onDeactivate: async () => {
    console.log('情人节主题已停用')
    
    // 移除全局样式
    const style = document.getElementById('valentines-global-styles')
    if (style) {
      style.remove()
    }
  },
  
  customConfig: {
    // 情人节特有配置
    enableHeartAnimation: true,
    roseBloomEffect: true,
    butterflyCount: 3,
    playRomanticMusic: false,
    heartPulseIntensity: 0.8
  }
}
