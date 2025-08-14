/**
 * @ldesign/theme - 万圣节主题
 *
 * 万圣节主题配置，包含橙黑配色、南瓜装饰和幽灵动画
 */

import type { ThemeConfig } from '../../core/types'

/**
 * 万圣节主题配置
 */
export const halloweenTheme: ThemeConfig = {
  name: 'halloween',
  displayName: '万圣节',
  description: '神秘的万圣节主题，带有南瓜灯和幽灵飘浮效果',
  category: 'festival',
  festival: 'halloween',
  version: '1.0.0',
  author: 'LDesign Team',

  // 颜色配置
  colors: {
    name: 'halloween-colors',
    displayName: '万圣节配色',
    light: {
      primary: '#F97316', // 南瓜橙
      secondary: '#1F2937', // 深灰黑
      accent: '#7C2D12', // 深橙色
      background: '#FFF7ED', // 浅橙白
      surface: '#FFEDD5', // 浅橙色
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#D97706',
      success: '#16A34A',
      warning: '#F97316',
      error: '#DC2626',
      info: '#3B82F6',
    },
    dark: {
      primary: '#FB923C', // 亮橙色
      secondary: '#F3F4F6', // 浅灰色
      accent: '#FDBA74', // 浅橙色
      background: '#0C0A09', // 深黑色
      surface: '#1C1917', // 深棕黑
      text: '#F3F4F6',
      textSecondary: '#D1D5DB',
      border: '#78716C',
      success: '#22C55E',
      warning: '#FB923C',
      error: '#EF4444',
      info: '#60A5FA',
    },
  },

  // 装饰元素配置
  decorations: [
    // 南瓜灯装饰
    {
      id: 'pumpkin-1',
      name: '南瓜灯1',
      type: 'svg',
      src: '/assets/halloween/pumpkin-lantern.svg',
      position: {
        type: 'fixed',
        position: { x: '10%', y: '85%' },
        anchor: 'bottom-left',
      },
      style: {
        size: { width: '70px', height: '70px' },
        opacity: 0.9,
        zIndex: 1001,
      },
      animation: 'pumpkin-glow',
      interactive: true,
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
      id: 'pumpkin-2',
      name: '南瓜灯2',
      type: 'svg',
      src: '/assets/halloween/pumpkin-lantern.svg',
      position: {
        type: 'fixed',
        position: { x: '90%', y: '85%' },
        anchor: 'bottom-right',
      },
      style: {
        size: { width: '60px', height: '60px' },
        opacity: 0.8,
        zIndex: 1000,
      },
      animation: 'pumpkin-glow-delayed',
      interactive: true,
      responsive: true,
      conditions: [
        {
          type: 'screen-size',
          value: 768,
          operator: 'gte',
        },
      ],
    },
    // 幽灵装饰
    {
      id: 'ghost-1',
      name: '幽灵1',
      type: 'svg',
      src: '/assets/halloween/ghost.svg',
      position: {
        type: 'fixed',
        position: { x: '20%', y: '30%' },
        anchor: 'center',
      },
      style: {
        size: { width: '50px', height: '60px' },
        opacity: 0.7,
        zIndex: 999,
      },
      animation: 'ghost-float',
      interactive: false,
      responsive: true,
    },
    {
      id: 'ghost-2',
      name: '幽灵2',
      type: 'svg',
      src: '/assets/halloween/ghost.svg',
      position: {
        type: 'fixed',
        position: { x: '80%', y: '50%' },
        anchor: 'center',
      },
      style: {
        size: { width: '45px', height: '55px' },
        opacity: 0.6,
        zIndex: 998,
      },
      animation: 'ghost-float-reverse',
      interactive: false,
      responsive: true,
    },
    // 蝙蝠装饰
    {
      id: 'bat-1',
      name: '蝙蝠1',
      type: 'svg',
      src: '/assets/halloween/bat.svg',
      position: {
        type: 'fixed',
        position: { x: '5%', y: '20%' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '40px', height: '25px' },
        opacity: 0.8,
        zIndex: 1002,
      },
      animation: 'bat-fly',
      interactive: false,
      responsive: true,
    },
    {
      id: 'bat-2',
      name: '蝙蝠2',
      type: 'svg',
      src: '/assets/halloween/bat.svg',
      position: {
        type: 'fixed',
        position: { x: '95%', y: '15%' },
        anchor: 'top-right',
      },
      style: {
        size: { width: '35px', height: '22px' },
        opacity: 0.7,
        zIndex: 1001,
      },
      animation: 'bat-fly-reverse',
      interactive: false,
      responsive: true,
    },
    // 蜘蛛网装饰
    {
      id: 'spider-web',
      name: '蜘蛛网',
      type: 'svg',
      src: '/assets/halloween/spider-web.svg',
      position: {
        type: 'fixed',
        position: { x: '95%', y: '5%' },
        anchor: 'top-right',
      },
      style: {
        size: { width: '80px', height: '80px' },
        opacity: 0.6,
        zIndex: 997,
      },
      animation: 'web-shimmer',
      interactive: false,
      responsive: true,
      conditions: [
        {
          type: 'screen-size',
          value: 1024,
          operator: 'gte',
        },
      ],
    },
  ],

  // 动画配置
  animations: [
    // 南瓜灯发光动画
    {
      name: 'pumpkin-glow',
      type: 'css',
      duration: 2500,
      timing: 'ease-in-out',
      iterations: 'infinite',
      direction: 'alternate',
      keyframes: [
        {
          offset: 0,
          properties: {
            filter: 'drop-shadow(0 0 5px #F97316)',
          },
        },
        {
          offset: 1,
          properties: {
            filter:
              'drop-shadow(0 0 20px #F97316) drop-shadow(0 0 30px #FDBA74)',
          },
        },
      ],
    },
    // 延迟南瓜灯发光
    {
      name: 'pumpkin-glow-delayed',
      type: 'css',
      duration: 2500,
      delay: 1250,
      timing: 'ease-in-out',
      iterations: 'infinite',
      direction: 'alternate',
      keyframes: [
        {
          offset: 0,
          properties: {
            filter: 'drop-shadow(0 0 5px #F97316)',
          },
        },
        {
          offset: 1,
          properties: {
            filter:
              'drop-shadow(0 0 18px #F97316) drop-shadow(0 0 25px #FDBA74)',
          },
        },
      ],
    },
    // 幽灵飘浮动画
    {
      name: 'ghost-float',
      type: 'css',
      duration: 4000,
      timing: 'ease-in-out',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(0px) translateX(0px)',
            opacity: 0.7,
          },
        },
        {
          offset: 0.25,
          properties: {
            transform: 'translateY(-10px) translateX(5px)',
            opacity: 0.8,
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: 'translateY(-5px) translateX(10px)',
            opacity: 0.6,
          },
        },
        {
          offset: 0.75,
          properties: {
            transform: 'translateY(-15px) translateX(5px)',
            opacity: 0.9,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(0px) translateX(0px)',
            opacity: 0.7,
          },
        },
      ],
      performance: {
        useGPU: true,
        willChange: ['transform', 'opacity'],
        transform3d: true,
      },
    },
    // 反向幽灵飘浮
    {
      name: 'ghost-float-reverse',
      type: 'css',
      duration: 4000,
      delay: 2000,
      timing: 'ease-in-out',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(0px) translateX(0px)',
            opacity: 0.6,
          },
        },
        {
          offset: 0.25,
          properties: {
            transform: 'translateY(-8px) translateX(-5px)',
            opacity: 0.7,
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: 'translateY(-12px) translateX(-10px)',
            opacity: 0.5,
          },
        },
        {
          offset: 0.75,
          properties: {
            transform: 'translateY(-5px) translateX(-5px)',
            opacity: 0.8,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(0px) translateX(0px)',
            opacity: 0.6,
          },
        },
      ],
    },
    // 蝙蝠飞行动画
    {
      name: 'bat-fly',
      type: 'css',
      duration: 8000,
      timing: 'linear',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateX(-50px) translateY(0px) scaleX(1)',
          },
        },
        {
          offset: 0.25,
          properties: {
            transform: 'translateX(25vw) translateY(-20px) scaleX(1)',
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: 'translateX(50vw) translateY(10px) scaleX(-1)',
          },
        },
        {
          offset: 0.75,
          properties: {
            transform: 'translateX(75vw) translateY(-15px) scaleX(-1)',
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateX(100vw) translateY(5px) scaleX(-1)',
          },
        },
      ],
    },
    // 反向蝙蝠飞行
    {
      name: 'bat-fly-reverse',
      type: 'css',
      duration: 10000,
      delay: 3000,
      timing: 'linear',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateX(50px) translateY(0px) scaleX(-1)',
          },
        },
        {
          offset: 0.25,
          properties: {
            transform: 'translateX(-25vw) translateY(15px) scaleX(-1)',
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: 'translateX(-50vw) translateY(-10px) scaleX(1)',
          },
        },
        {
          offset: 0.75,
          properties: {
            transform: 'translateX(-75vw) translateY(20px) scaleX(1)',
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateX(-100vw) translateY(-5px) scaleX(1)',
          },
        },
      ],
    },
    // 蜘蛛网闪烁动画
    {
      name: 'web-shimmer',
      type: 'css',
      duration: 5000,
      timing: 'ease-in-out',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            opacity: 0.6,
            filter: 'brightness(1)',
          },
        },
        {
          offset: 0.5,
          properties: {
            opacity: 0.8,
            filter: 'brightness(1.2)',
          },
        },
        {
          offset: 1,
          properties: {
            opacity: 0.6,
            filter: 'brightness(1)',
          },
        },
      ],
    },
  ],

  // 资源配置
  resources: {
    images: {},
    icons: {
      'pumpkin-lantern': '/assets/halloween/pumpkin-lantern.svg',
      ghost: '/assets/halloween/ghost.svg',
      bat: '/assets/halloween/bat.svg',
      'spider-web': '/assets/halloween/spider-web.svg',
    },
    sounds: {
      'spooky-laugh': '/assets/halloween/spooky-laugh.mp3',
      'wolf-howl': '/assets/halloween/wolf-howl.mp3',
    },
    preload: [
      '/assets/halloween/pumpkin-lantern.svg',
      '/assets/halloween/ghost.svg',
    ],
  },

  // 自动激活时间范围（10月15日到11月5日）
  timeRange: {
    start: '10-15',
    end: '11-05',
  },

  // 主题标签
  tags: ['festival', 'halloween', 'spooky', 'orange', 'black', 'pumpkin'],

  // 主题预览图
  preview: '/assets/halloween/preview.jpg',

  // 兼容性配置
  compatibility: {
    minVersion: '0.1.0',
    browsers: ['chrome >= 60', 'firefox >= 60', 'safari >= 12'],
    features: ['css-animations', 'svg'],
  },
}
