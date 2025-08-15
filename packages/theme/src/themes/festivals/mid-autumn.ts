/**
 * @ldesign/theme - 中秋节主题
 *
 * 中秋节主题配置，包含月亮、桂花装饰和温馨的金黄色调
 */

import type { ThemeConfig } from '../../core/types'

/**
 * 中秋节主题配置
 */
export const midAutumnTheme: ThemeConfig = {
  name: 'mid-autumn',
  displayName: '中秋节',
  description: '温馨的中秋节主题，带有月亮装饰和金桂飘香的意境',
  category: 'festival',
  festival: 'mid-autumn',
  version: '1.0.0',
  author: 'LDesign Team',

  // 颜色配置
  colors: {
    name: 'mid-autumn-colors',
    displayName: '中秋节配色',
    light: {
      primary: '#F59E0B', // 金黄色
      secondary: '#DC2626', // 红色
      accent: '#92400E', // 深金色
      background: '#FFFBEB', // 暖白色
      surface: '#FEF3C7', // 淡金色
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#D97706',
      success: '#16A34A',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#3B82F6',
    },
    dark: {
      primary: '#FCD34D', // 亮金色
      secondary: '#EF4444', // 亮红色
      accent: '#FBBF24', // 明亮金色
      background: '#1F1611', // 深棕色
      surface: '#2D1B0E', // 深金棕色
      text: '#FEF3C7',
      textSecondary: '#FDE68A',
      border: '#92400E',
      success: '#22C55E',
      warning: '#FCD34D',
      error: '#EF4444',
      info: '#60A5FA',
    },
  },

  // 装饰元素
  decorations: [
    {
      id: 'mid-autumn-moon',
      name: '圆月',
      type: 'svg',
      content: `
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="45" fill="#FCD34D" stroke="#F59E0B" stroke-width="2"/>
          <circle cx="35" cy="35" r="3" fill="#F59E0B" opacity="0.6"/>
          <circle cx="60" cy="40" r="2" fill="#F59E0B" opacity="0.4"/>
          <circle cx="45" cy="60" r="2.5" fill="#F59E0B" opacity="0.5"/>
          <circle cx="65" cy="65" r="1.5" fill="#F59E0B" opacity="0.3"/>
        </svg>
      `,
      position: {
        type: 'fixed',
        position: { x: '85%', y: '15%' },
        anchor: 'top-right',
      },
      style: {
        size: { width: '80px', height: '80px' },
        opacity: 0.9,
        zIndex: 100,
      },
      animation: {
        name: 'moon-glow',
        duration: 4000,
        timing: 'ease-in-out',
        iteration: 'infinite',
        direction: 'alternate',
      },
      conditions: {
        viewport: { minWidth: 768 },
        theme: ['mid-autumn'],
        time: {
          start: new Date('2024-09-01'),
          end: new Date('2024-09-30'),
        },
      },
    },
    {
      id: 'mid-autumn-osmanthus-1',
      name: '桂花装饰1',
      type: 'pattern',
      content: '🌸',
      position: {
        type: 'absolute',
        position: { x: '20%', y: '25%' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '24px', height: '24px' },
        opacity: 0.7,
        zIndex: 99,
      },
      animation: {
        name: 'float-flower',
        duration: 5000,
        timing: 'ease-in-out',
        iteration: 'infinite',
      },
      conditions: {
        theme: ['mid-autumn'],
      },
    },
    {
      id: 'mid-autumn-osmanthus-2',
      name: '桂花装饰2',
      type: 'pattern',
      content: '🌸',
      position: {
        type: 'absolute',
        position: { x: '75%', y: '45%' },
        anchor: 'center',
      },
      style: {
        size: { width: '20px', height: '20px' },
        opacity: 0.6,
        zIndex: 98,
      },
      animation: {
        name: 'float-flower',
        duration: 6000,
        timing: 'ease-in-out',
        iteration: 'infinite',
        delay: 1000,
      },
      conditions: {
        theme: ['mid-autumn'],
      },
    },
    {
      id: 'mid-autumn-rabbit',
      name: '玉兔',
      type: 'pattern',
      content: '🐰',
      position: {
        type: 'absolute',
        position: { x: '10%', y: '70%' },
        anchor: 'bottom-left',
      },
      style: {
        size: { width: '32px', height: '32px' },
        opacity: 0.8,
        zIndex: 101,
      },
      animation: {
        name: 'rabbit-hop',
        duration: 3000,
        timing: 'ease-in-out',
        iteration: 'infinite',
      },
      conditions: {
        theme: ['mid-autumn'],
        viewport: { minWidth: 1024 },
      },
    },
  ],

  // 动画配置
  animations: [
    {
      name: 'moon-glow',
      type: 'css',
      keyframes: {
        '0%': {
          filter: 'drop-shadow(0 0 10px #FCD34D)',
          transform: 'scale(1)',
        },
        '50%': {
          filter: 'drop-shadow(0 0 20px #F59E0B)',
          transform: 'scale(1.05)',
        },
        '100%': {
          filter: 'drop-shadow(0 0 10px #FCD34D)',
          transform: 'scale(1)',
        },
      },
      options: {
        duration: 4000,
        timing: 'ease-in-out',
        iteration: 'infinite',
        direction: 'alternate',
      },
    },
    {
      name: 'float-flower',
      type: 'css',
      keyframes: {
        '0%': { transform: 'translateY(0px) rotate(0deg)' },
        '25%': { transform: 'translateY(-5px) rotate(90deg)' },
        '50%': { transform: 'translateY(-10px) rotate(180deg)' },
        '75%': { transform: 'translateY(-5px) rotate(270deg)' },
        '100%': { transform: 'translateY(0px) rotate(360deg)' },
      },
      options: {
        duration: 5000,
        timing: 'ease-in-out',
        iteration: 'infinite',
      },
    },
    {
      name: 'rabbit-hop',
      type: 'css',
      keyframes: {
        '0%': { transform: 'translateY(0px)' },
        '20%': { transform: 'translateY(-8px)' },
        '40%': { transform: 'translateY(0px)' },
        '60%': { transform: 'translateY(-5px)' },
        '80%': { transform: 'translateY(0px)' },
        '100%': { transform: 'translateY(0px)' },
      },
      options: {
        duration: 3000,
        timing: 'ease-in-out',
        iteration: 'infinite',
      },
    },
  ],

  // 资源配置
  resources: {
    preload: [
      '/assets/mid-autumn/moon-pattern.svg',
      '/assets/mid-autumn/osmanthus-bg.jpg',
    ],
    fonts: [
      {
        family: 'Ma Shan Zheng',
        url: 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap',
      },
    ],
    images: [],
    sounds: [
      {
        name: 'night-breeze',
        url: '/assets/mid-autumn/sounds/night-breeze.mp3',
        volume: 0.2,
      },
    ],
  },

  // 配置选项
  options: {
    autoActivate: true,
    activationDate: {
      start: new Date('2024-09-01'),
      end: new Date('2024-09-30'),
    },
    performance: {
      enableGPU: true,
      maxDecorations: 12,
      animationQuality: 'medium',
    },
    accessibility: {
      reduceMotion: true,
      highContrast: false,
    },
  },

  // 元数据
  metadata: {
    tags: ['festival', 'mid-autumn', 'moon', 'golden', 'traditional'],
    keywords: ['中秋节', '月亮', '桂花', '玉兔', '团圆'],
    preview: '/assets/mid-autumn/preview.jpg',
    thumbnail: '/assets/mid-autumn/thumbnail.jpg',
  },
}
