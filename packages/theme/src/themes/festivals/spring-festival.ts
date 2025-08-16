/**
 * @ldesign/theme - 春节主题
 *
 * 春节主题配置，包含红金配色、灯笼装饰和烟花动画
 */

import type { ThemeConfig } from '../../core/types'

/**
 * 春节主题配置
 */
export const springFestivalTheme: ThemeConfig = {
  name: 'spring-festival',
  displayName: '春节',
  description: '喜庆的春节主题，带有灯笼装饰和烟花绽放效果',
  category: 'festival',
  festival: 'spring-festival',
  version: '1.0.0',
  author: 'LDesign Team',

  // 颜色配置
  colors: {
    name: 'spring-festival-colors',
    displayName: '春节配色',
    light: {
      primary: '#DC2626', // 中国红
      secondary: '#F59E0B', // 金色
      accent: '#EF4444', // 亮红色
      background: '#FFFBEB', // 暖白色
      surface: '#FEF3C7', // 淡金色
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#F59E0B',
      success: '#16A34A',
      warning: '#F59E0B',
      error: '#DC2626',
      info: '#3B82F6',
    },
    dark: {
      primary: '#EF4444', // 亮中国红
      secondary: '#FCD34D', // 亮金色
      accent: '#F87171', // 粉红色
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

  // 装饰元素配置
  decorations: [
    // 红灯笼装饰
    {
      id: 'lantern-left',
      name: '左侧灯笼',
      type: 'svg',
      src: '/assets/spring-festival/red-lantern.svg',
      position: {
        type: 'fixed',
        position: { x: '5%', y: '10%' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '60px', height: '80px' },
        opacity: 0.9,
        zIndex: 1001,
      },
      animation: 'lantern-swing',
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
      id: 'lantern-right',
      name: '右侧灯笼',
      type: 'svg',
      src: '/assets/spring-festival/red-lantern.svg',
      position: {
        type: 'fixed',
        position: { x: '95%', y: '10%' },
        anchor: 'top-right',
      },
      style: {
        size: { width: '60px', height: '80px' },
        opacity: 0.9,
        zIndex: 1001,
      },
      animation: 'lantern-swing-reverse',
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
    // 烟花装饰
    {
      id: 'firework-1',
      name: '烟花1',
      type: 'svg',
      src: '/assets/spring-festival/firework.svg',
      position: {
        type: 'fixed',
        position: { x: '20%', y: '30%' },
        anchor: 'center',
      },
      style: {
        size: { width: '40px', height: '40px' },
        opacity: 0,
        zIndex: 1000,
      },
      animation: 'firework-burst',
      interactive: false,
      responsive: true,
    },
    {
      id: 'firework-2',
      name: '烟花2',
      type: 'svg',
      src: '/assets/spring-festival/firework.svg',
      position: {
        type: 'fixed',
        position: { x: '80%', y: '40%' },
        anchor: 'center',
      },
      style: {
        size: { width: '35px', height: '35px' },
        opacity: 0,
        zIndex: 999,
      },
      animation: 'firework-burst-delayed',
      interactive: false,
      responsive: true,
    },
    // 金币装饰
    {
      id: 'gold-coin-1',
      name: '金币1',
      type: 'svg',
      src: '/assets/spring-festival/gold-coin.svg',
      position: {
        type: 'fixed',
        position: { x: '15%', y: '-10px' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '30px', height: '30px' },
        opacity: 0.8,
        zIndex: 998,
      },
      animation: 'coin-fall',
      interactive: false,
      responsive: true,
    },
    {
      id: 'gold-coin-2',
      name: '金币2',
      type: 'svg',
      src: '/assets/spring-festival/gold-coin.svg',
      position: {
        type: 'fixed',
        position: { x: '85%', y: '-10px' },
        anchor: 'top-left',
      },
      style: {
        size: { width: '25px', height: '25px' },
        opacity: 0.7,
        zIndex: 997,
      },
      animation: 'coin-fall-slow',
      interactive: false,
      responsive: true,
    },
    // 福字装饰
    {
      id: 'fu-character',
      name: '福字',
      type: 'svg',
      src: '/assets/spring-festival/fu-character.svg',
      position: {
        type: 'fixed',
        position: { x: '50%', y: '5%' },
        anchor: 'top-center',
      },
      style: {
        size: { width: '50px', height: '50px' },
        opacity: 0.9,
        zIndex: 1002,
      },
      animation: 'fu-glow',
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
  ],

  // 动画配置
  animations: [
    // 灯笼摆动动画
    {
      name: 'lantern-swing',
      type: 'css',
      duration: 4000,
      timing: 'ease-in-out',
      iterations: 'infinite',
      direction: 'alternate',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'rotate(-3deg)',
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'rotate(3deg)',
          },
        },
      ],
    },
    // 反向灯笼摆动
    {
      name: 'lantern-swing-reverse',
      type: 'css',
      duration: 4000,
      delay: 1000,
      timing: 'ease-in-out',
      iterations: 'infinite',
      direction: 'alternate',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'rotate(3deg)',
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'rotate(-3deg)',
          },
        },
      ],
    },
    // 烟花绽放动画
    {
      name: 'firework-burst',
      type: 'css',
      duration: 2000,
      delay: 0,
      timing: 'ease-out',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'scale(0) rotate(0deg)',
            opacity: 0,
          },
        },
        {
          offset: 0.1,
          properties: {
            opacity: 1,
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: 'scale(1.5) rotate(180deg)',
            opacity: 0.8,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'scale(0) rotate(360deg)',
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
    // 延迟烟花绽放
    {
      name: 'firework-burst-delayed',
      type: 'css',
      duration: 2000,
      delay: 3000,
      timing: 'ease-out',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'scale(0) rotate(0deg)',
            opacity: 0,
          },
        },
        {
          offset: 0.1,
          properties: {
            opacity: 1,
          },
        },
        {
          offset: 0.5,
          properties: {
            transform: 'scale(1.2) rotate(180deg)',
            opacity: 0.9,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'scale(0) rotate(360deg)',
            opacity: 0,
          },
        },
      ],
    },
    // 金币下落动画
    {
      name: 'coin-fall',
      type: 'css',
      duration: 6000,
      timing: 'ease-in',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(-10px) rotateY(0deg)',
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
            transform: 'translateY(100vh) rotateY(720deg)',
            opacity: 0,
          },
        },
      ],
    },
    // 慢速金币下落
    {
      name: 'coin-fall-slow',
      type: 'css',
      duration: 8000,
      delay: 2000,
      timing: 'ease-in-out',
      iterations: 'infinite',
      keyframes: [
        {
          offset: 0,
          properties: {
            transform: 'translateY(-10px) rotateY(0deg)',
            opacity: 0,
          },
        },
        {
          offset: 0.1,
          properties: {
            opacity: 0.7,
          },
        },
        {
          offset: 0.9,
          properties: {
            opacity: 0.7,
          },
        },
        {
          offset: 1,
          properties: {
            transform: 'translateY(100vh) rotateY(540deg)',
            opacity: 0,
          },
        },
      ],
    },
    // 福字发光动画
    {
      name: 'fu-glow',
      type: 'css',
      duration: 3000,
      timing: 'ease-in-out',
      iterations: 'infinite',
      direction: 'alternate',
      keyframes: [
        {
          offset: 0,
          properties: {
            filter: 'drop-shadow(0 0 5px #F59E0B)',
            transform: 'scale(1)',
          },
        },
        {
          offset: 1,
          properties: {
            filter:
              'drop-shadow(0 0 20px #F59E0B) drop-shadow(0 0 30px #DC2626)',
            transform: 'scale(1.1)',
          },
        },
      ],
    },
  ],

  // 资源配置
  resources: {
    images: {},
    icons: {
      'red-lantern': '/assets/spring-festival/red-lantern.svg',
      'firework': '/assets/spring-festival/firework.svg',
      'gold-coin': '/assets/spring-festival/gold-coin.svg',
      'fu-character': '/assets/spring-festival/fu-character.svg',
    },
    sounds: {
      firecrackers: '/assets/spring-festival/firecrackers.mp3',
      gong: '/assets/spring-festival/gong.mp3',
    },
    preload: [
      '/assets/spring-festival/red-lantern.svg',
      '/assets/spring-festival/firework.svg',
    ],
  },

  // 自动激活时间范围（农历新年前后，这里用公历近似）
  timeRange: {
    start: '01-20',
    end: '02-20',
  },

  // 主题标签
  tags: [
    'festival',
    'spring-festival',
    'chinese-new-year',
    'red',
    'gold',
    'lantern',
  ],

  // 主题预览图
  preview: '/assets/spring-festival/preview.jpg',

  // 兼容性配置
  compatibility: {
    minVersion: '0.1.0',
    browsers: ['chrome >= 60', 'firefox >= 60', 'safari >= 12'],
    features: ['css-animations', 'svg'],
  },
}
