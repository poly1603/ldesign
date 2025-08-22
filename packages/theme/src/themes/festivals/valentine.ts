/**
 * @ldesign/theme - 情人节主题
 *
 * 情人节主题配置，包含粉红色系、爱心装饰和浪漫动画
 */

import type { ThemeConfig } from '../../core/types'

/**
 * 情人节主题配置
 */
export const valentineTheme: ThemeConfig = {
  name: 'valentine',
  displayName: '情人节',
  description: '浪漫的情人节主题，带有爱心装饰和温馨的粉红色调',
  category: 'festival',
  festival: 'valentine',
  version: '1.0.0',
  author: 'LDesign Team',

  // 颜色配置
  colors: {
    name: 'valentine-colors',
    displayName: '情人节配色',
    light: {
      primary: '#EC4899', // 粉红色
      secondary: '#F97316', // 橙色
      accent: '#8B5CF6', // 紫色
      background: '#FDF2F8', // 淡粉色背景
      surface: '#FCE7F3', // 粉色表面
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#EC4899',
      success: '#16A34A',
      warning: '#F97316',
      error: '#DC2626',
      info: '#3B82F6',
    },
    dark: {
      primary: '#F472B6', // 亮粉红色
      secondary: '#FB923C', // 亮橙色
      accent: '#A78BFA', // 亮紫色
      background: '#1F1B1F', // 深紫色背景
      surface: '#2D1B2D', // 深粉色表面
      text: '#FCE7F3',
      textSecondary: '#F3E8FF',
      border: '#BE185D',
      success: '#22C55E',
      warning: '#FB923C',
      error: '#F87171',
      info: '#60A5FA',
    },
  },

  // 装饰元素
  decorations: [
    {
      id: 'valentine-hearts-1',
      name: '飘浮爱心',
      type: 'svg',
      content: `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `,
      position: {
        type: 'absolute',
        position: { x: '10%', y: '20%' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '32px', height: '32px' },
        opacity: 0.8,
        zIndex: 100,
      },
      animation: {
        name: 'float-heart',
        duration: 3000,
        timing: 'ease-in-out',
        iteration: 'infinite',
        direction: 'alternate',
      },
      conditions: {
        viewport: { minWidth: 768 },
        theme: ['valentine'],
        time: {
          start: new Date('2024-02-01'),
          end: new Date('2024-02-28'),
        },
      },
    },
    {
      id: 'valentine-hearts-2',
      name: '爱心装饰2',
      type: 'svg',
      content: `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `,
      position: {
        type: 'absolute',
        position: { x: '80%', y: '30%' },
        anchor: 'top-right',
      },
      style: {
        size: { width: '28px', height: '28px' },
        opacity: 0.6,
        zIndex: 99,
      },
      animation: {
        name: 'pulse-heart',
        duration: 2000,
        timing: 'ease-in-out',
        iteration: 'infinite',
      },
      conditions: {
        viewport: { minWidth: 768 },
        theme: ['valentine'],
      },
    },
    {
      id: 'valentine-sparkles',
      name: '爱心闪烁',
      type: 'pattern',
      content: '✨💕✨',
      position: {
        type: 'absolute',
        position: { x: '50%', y: '10%' },
        anchor: 'top-center',
      },
      style: {
        size: { width: 'auto', height: 'auto' },
        opacity: 0.7,
        zIndex: 101,
      },
      animation: {
        name: 'sparkle',
        duration: 1500,
        timing: 'ease-in-out',
        iteration: 'infinite',
      },
      conditions: {
        theme: ['valentine'],
      },
    },
  ],

  // 动画配置
  animations: [
    {
      name: 'float-heart',
      type: 'css',
      keyframes: {
        '0%': { transform: 'translateY(0px) rotate(0deg)' },
        '50%': { transform: 'translateY(-10px) rotate(5deg)' },
        '100%': { transform: 'translateY(0px) rotate(0deg)' },
      },
      options: {
        duration: 3000,
        timing: 'ease-in-out',
        iteration: 'infinite',
        direction: 'alternate',
      },
    },
    {
      name: 'pulse-heart',
      type: 'css',
      keyframes: {
        '0%': { transform: 'scale(1)', opacity: '0.6' },
        '50%': { transform: 'scale(1.2)', opacity: '1' },
        '100%': { transform: 'scale(1)', opacity: '0.6' },
      },
      options: {
        duration: 2000,
        timing: 'ease-in-out',
        iteration: 'infinite',
      },
    },
    {
      name: 'sparkle',
      type: 'css',
      keyframes: {
        '0%': { opacity: '0.3', transform: 'scale(0.8)' },
        '50%': { opacity: '1', transform: 'scale(1.2)' },
        '100%': { opacity: '0.3', transform: 'scale(0.8)' },
      },
      options: {
        duration: 1500,
        timing: 'ease-in-out',
        iteration: 'infinite',
      },
    },
  ],

  // 资源配置
  resources: {
    preload: [
      '/assets/valentine/heart-pattern.svg',
      '/assets/valentine/love-bg.jpg',
    ],
    fonts: [
      {
        family: 'Dancing Script',
        url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap',
      },
    ],
    images: [],
    sounds: [
      {
        name: 'heart-beat',
        url: '/assets/valentine/sounds/heartbeat.mp3',
        volume: 0.3,
      },
    ],
  },

  // 配置选项
  options: {
    autoActivate: true,
    activationDate: {
      start: new Date('2024-02-01'),
      end: new Date('2024-02-28'),
    },
    performance: {
      enableGPU: true,
      maxDecorations: 15,
      animationQuality: 'high',
    },
    accessibility: {
      reduceMotion: true,
      highContrast: false,
    },
  },

  // 元数据
  metadata: {
    tags: ['festival', 'valentine', 'romantic', 'pink', 'love'],
    keywords: ['情人节', '爱心', '浪漫', '粉红色'],
    preview: '/assets/valentine/preview.jpg',
    thumbnail: '/assets/valentine/thumbnail.jpg',
  },
}
