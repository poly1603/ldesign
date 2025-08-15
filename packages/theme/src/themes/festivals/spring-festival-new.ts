/**
 * @ldesign/theme - 春节主题
 *
 * 春节主题配置，基于@ldesign/color的颜色系统，包含装饰挂件和动画
 */

import type { FestivalThemeConfig } from '../../core/types'
import { createCustomTheme } from '@ldesign/color'
import { springFestivalWidgets } from '../../widgets/spring-festival'

/**
 * 春节主题配置
 * 使用@ldesign/color生成红金配色方案
 */
export const springFestivalTheme: FestivalThemeConfig = {
  name: 'spring-festival',
  displayName: '春节',
  description: '传统中国新年主题，红金配色，灯笼烟花装饰',
  festival: 'spring-festival',
  version: '1.0.0',
  author: 'LDesign Team',

  // 使用@ldesign/color创建红色主题
  colorTheme: createCustomTheme('spring-festival', '#DC2626', {
    darkPrimaryColor: '#EF4444',
    // 自定义语义化颜色
    customColors: {
      // 金色作为次要色
      secondary: '#F59E0B',
      // 成功色保持绿色
      success: '#16A34A',
      // 警告色使用金色
      warning: '#F59E0B',
      // 危险色使用红色
      danger: '#DC2626',
    },
  }),

  // 春节装饰挂件
  widgets: springFestivalWidgets,

  // 春节动画配置
  animations: [
    {
      name: 'lantern-swing',
      type: 'css',
      keyframes: [
        { offset: 0, properties: { transform: 'rotate(-5deg)' } },
        { offset: 1, properties: { transform: 'rotate(5deg)' } },
      ],
      options: {
        duration: 3000,
        timing: 'ease-in-out',
        iteration: 'infinite',
        direction: 'alternate',
      },
    },
    {
      name: 'firework-burst',
      type: 'css',
      keyframes: [
        { offset: 0, properties: { transform: 'scale(0.5)', opacity: '0' } },
        { offset: 0.5, properties: { transform: 'scale(1.2)', opacity: '1' } },
        { offset: 1, properties: { transform: 'scale(1)', opacity: '0.8' } },
      ],
      options: {
        duration: 2000,
        timing: 'ease-out',
        iteration: 'infinite',
        delay: 500,
      },
    },
    {
      name: 'fu-glow',
      type: 'css',
      keyframes: [
        { offset: 0, properties: { opacity: '0.6', transform: 'scale(1)' } },
        { offset: 0.5, properties: { opacity: '1', transform: 'scale(1.1)' } },
        { offset: 1, properties: { opacity: '0.6', transform: 'scale(1)' } },
      ],
      options: {
        duration: 1500,
        timing: 'ease-in-out',
        iteration: 'infinite',
        direction: 'alternate',
      },
    },
    {
      name: 'firecracker-bounce',
      type: 'css',
      keyframes: [
        { offset: 0, properties: { transform: 'translateY(0px)' } },
        { offset: 0.3, properties: { transform: 'translateY(-8px)' } },
        { offset: 0.6, properties: { transform: 'translateY(0px)' } },
        { offset: 0.8, properties: { transform: 'translateY(-4px)' } },
        { offset: 1, properties: { transform: 'translateY(0px)' } },
      ],
      options: {
        duration: 1000,
        timing: 'ease-in-out',
        iteration: 'infinite',
      },
    },
    {
      name: 'blossom-float',
      type: 'css',
      keyframes: [
        {
          offset: 0,
          properties: { transform: 'translateY(0px) rotate(0deg)' },
        },
        {
          offset: 0.25,
          properties: { transform: 'translateY(-5px) rotate(90deg)' },
        },
        {
          offset: 0.5,
          properties: { transform: 'translateY(-10px) rotate(180deg)' },
        },
        {
          offset: 0.75,
          properties: { transform: 'translateY(-5px) rotate(270deg)' },
        },
        {
          offset: 1,
          properties: { transform: 'translateY(0px) rotate(360deg)' },
        },
      ],
      options: {
        duration: 4000,
        timing: 'ease-in-out',
        iteration: 'infinite',
        direction: 'alternate',
      },
    },
  ],

  // 资源配置
  resources: {
    preload: [
      '/assets/spring-festival/lantern.svg',
      '/assets/spring-festival/firework.svg',
    ],
    fonts: [
      'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap',
    ],
    images: {},
    sounds: ['/assets/spring-festival/sounds/firecracker.mp3'],
  },

  // 元数据
  metadata: {
    tags: ['festival', 'spring-festival', 'chinese-new-year', 'red', 'gold'],
    keywords: ['春节', '新年', '灯笼', '烟花', '福字'],
    preview: '/assets/spring-festival/preview.jpg',
    thumbnail: '/assets/spring-festival/thumbnail.jpg',
    activationPeriod: {
      start: { month: 1, day: 20 }, // 1月20日开始
      end: { month: 3, day: 5 }, // 3月5日结束
    },
  },
}
