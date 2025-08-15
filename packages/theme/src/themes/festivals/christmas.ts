/**
 * @ldesign/theme - 圣诞节主题
 *
 * 圣诞节主题配置，包含红绿配色、雪花装饰和节日动画
 */

import type { ThemeConfig } from '../../core/types'

/**
 * 圣诞节主题配置
 */
export const christmasTheme: ThemeConfig = {
  name: 'christmas',
  displayName: '圣诞节',
  description: '温馨的圣诞节主题，带有雪花飘落效果和节日装饰',
  category: 'festival',
  festival: 'christmas',
  version: '1.0.0',
  author: 'LDesign Team',

  // 颜色配置
  colors: {
    name: 'christmas-colors',
    displayName: '圣诞节配色',
    light: {
      primary: '#DC2626', // 圣诞红
      secondary: '#16A34A', // 圣诞绿
      accent: '#F59E0B', // 金色
      background: '#FEFEFE',
      surface: '#F8FAFC',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      success: '#16A34A',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#3B82F6',
    },
    dark: {
      primary: '#EF4444', // 亮圣诞红
      secondary: '#22C55E', // 亮圣诞绿
      accent: '#FCD34D', // 亮金色
      background: '#0F172A',
      surface: '#1E293B',
      text: '#F8FAFC',
      textSecondary: '#CBD5E1',
      border: '#334155',
      success: '#22C55E',
      warning: '#FCD34D',
      error: '#EF4444',
      info: '#60A5FA',
    },
  },

  // 装饰元素配置
  decorations: [
    // 雪花装饰
    {
      id: 'snowflake-1',
      name: '雪花1',
      type: 'svg',
      src: '/assets/christmas/snowflake-1.svg',
      position: {
        type: 'fixed',
        position: { x: '10%', y: '-10px' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '20px', height: '20px' },
        opacity: 0.8,
        zIndex: 1000,
      },
      animation: 'snowfall',
      interactive: false,
      responsive: true,
      conditions: [
        {
          type: 'screen-size',
          value: 768,
          operator: 'gte',
        },
        {
          type: 'user-preference',
          value: 'reduced-motion',
          operator: 'not-in',
        },
      ],
    },
    {
      id: 'snowflake-2',
      name: '雪花2',
      type: 'svg',
      src: '/assets/christmas/snowflake-2.svg',
      position: {
        type: 'fixed',
        position: { x: '30%', y: '-10px' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '15px', height: '15px' },
        opacity: 0.6,
        zIndex: 999,
      },
      animation: 'snowfall-slow',
      interactive: false,
      responsive: true,
      conditions: [
        {
          type: 'screen-size',
          value: 768,
          operator: 'gte',
        },
      ],
    },
    {
      id: 'snowflake-3',
      name: '雪花3',
      type: 'svg',
      src: '/assets/christmas/snowflake-3.svg',
      position: {
        type: 'fixed',
        position: { x: '70%', y: '-10px' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '25px', height: '25px' },
        opacity: 0.7,
        zIndex: 998,
      },
      animation: 'snowfall-fast',
      interactive: false,
      responsive: true,
    },
    // 圣诞树装饰
    {
      id: 'christmas-tree',
      name: '圣诞树',
      type: 'svg',
      src: '/assets/christmas/christmas-tree.svg',
      position: {
        type: 'fixed',
        position: { x: '95%', y: '90%' },
        anchor: 'bottom-right',
      },
      style: {
        size: { width: '80px', height: '100px' },
        opacity: 0.9,
        zIndex: 1001,
      },
      animation: 'tree-glow',
      interactive: true,
      responsive: true,
      conditions: [
        {
          type: 'screen-size',
          value: 1024,
          operator: 'gte',
        },
      ],
    },
    // 圣诞帽装饰
    {
      id: 'santa-hat',
      name: '圣诞帽',
      type: 'svg',
      src: '/assets/christmas/santa-hat.svg',
      position: {
        type: 'fixed',
        position: { x: '5%', y: '5%' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '60px', height: '60px' },
        opacity: 0.8,
        zIndex: 1002,
      },
      animation: 'hat-swing',
      interactive: true,
      responsive: true,
    },
  ],

  // 动画配置
  animations: [
    // 雪花飘落动画
    {
      name: 'snowfall',
      type: 'css',
      duration: 8000,
      timing: 'linear',
      iterations: 'infinite',
      direction: 'normal',
      fillMode: 'none',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(-10px) rotate(0deg)',
            opacity: 0,
          },
        },
        {
          offset: 0.1,
          properties: {
            opacity: 0.8,
          },
        },
        {
          offset: 0.9,
          properties: {
            opacity: 0.8,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(100vh) rotate(360deg)',
            opacity: 0,
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['transform', 'opacity'],
        transform3d: true,
      },
    },
    // 慢速雪花飘落
    {
      name: 'snowfall-slow',
      type: 'css',
      duration: 12000,
      timing: 'ease-in-out',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(-10px) translateX(0px) rotate(0deg)',
            opacity: 0,
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: 'translateY(50vh) translateX(20px) rotate(180deg)',
            opacity: 0.6,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(100vh) translateX(0px) rotate(360deg)',
            opacity: 0,
          },
        },
      ],
    },
    // 快速雪花飘落
    {
      name: 'snowfall-fast',
      type: 'css',
      duration: 5000,
      timing: 'ease-in',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(-10px) rotate(0deg)',
            opacity: 0,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(100vh) rotate(720deg)',
            opacity: 0,
          },
        },
      ],
    },
    // 圣诞树发光动画
    {
      name: 'tree-glow',
      type: 'css',
      duration: 2000,
      timing: 'ease-in-out',
      iterations: 'infinite',
      direction: 'alternate',
      keyframes: [
        {
          offset: 0,
          properties: {
            filter: 'drop-shadow(0 0 5px #16A34A)',
          },
        },
        {
          offset: 1,
          properties: {
            filter:
              'drop-shadow(0 0 15px #16A34A) drop-shadow(0 0 25px #F59E0B)',
          },
        },
      ],
    },
    // 圣诞帽摆动动画
    {
      name: 'hat-swing',
      type: 'css',
      duration: 3000,
      timing: 'ease-in-out',
      iterations: 'infinite',
      direction: 'alternate',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'rotate(-5deg)',
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'rotate(5deg)',
          },
        },
      ],
    },
  ],

  // 资源配置
  resources: {
    images: {},
    icons: {
      'snowflake-1': '/assets/christmas/snowflake-1.svg',
      'snowflake-2': '/assets/christmas/snowflake-2.svg',
      'snowflake-3': '/assets/christmas/snowflake-3.svg',
      'christmas-tree': '/assets/christmas/christmas-tree.svg',
      'santa-hat': '/assets/christmas/santa-hat.svg',
    },
    sounds: {
      'jingle-bells': '/assets/christmas/jingle-bells.mp3',
    },
    preload: [
      '/assets/christmas/snowflake-1.svg',
      '/assets/christmas/snowflake-2.svg',
      '/assets/christmas/snowflake-3.svg',
    ],
  },

  // 自动激活时间范围（12月1日到1月7日）
  timeRange: {
    start: '12-01',
    end: '01-07',
  },

  // 主题标签
  tags: ['festival', 'christmas', 'winter', 'snow', 'red', 'green'],

  // 主题预览图
  preview: '/assets/christmas/preview.jpg',

  // 兼容性配置
  compatibility: {
    minVersion: '0.1.0',
    browsers: ['chrome >= 60', 'firefox >= 60', 'safari >= 12'],
    features: ['css-animations', 'svg'],
  },
}
