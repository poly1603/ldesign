/**
 * @ldesign/theme - 圣诞节主题
 *
 * 圣诞节主题配置，基于@ldesign/color的颜色系统，包含装饰挂件和动画
 */

import type { FestivalThemeConfig } from '../../core/types'
import { createCustomTheme } from '@ldesign/color'
import { christmasWidgets } from '../../widgets/christmas'

/**
 * 圣诞节主题配置
 * 使用@ldesign/color生成红绿配色方案
 */
export const christmasTheme: FestivalThemeConfig = {
  name: 'christmas',
  displayName: '圣诞节',
  description: '温馨的圣诞节主题，红绿配色，雪花铃铛装饰',
  festival: 'christmas',
  version: '1.0.0',
  author: 'LDesign Team',

  // 使用@ldesign/color创建绿色主题
  colorTheme: createCustomTheme('christmas', '#16A34A', {
    darkPrimaryColor: '#22C55E',
    // 自定义语义化颜色
    customColors: {
      // 红色作为次要色
      secondary: '#DC2626',
      // 成功色保持绿色
      success: '#16A34A',
      // 警告色使用金色
      warning: '#F59E0B',
      // 危险色使用红色
      danger: '#DC2626',
    },
  }),

  // 圣诞节装饰挂件
  widgets: christmasWidgets,

  // 圣诞节动画配置
  animations: [
    {
      name: 'snowflake-fall',
      type: 'css',
      keyframes: [
        {
          offset: 0,
          properties: { transform: 'translateY(-10px) rotate(0deg)' },
        },
        {
          offset: 1,
          properties: { transform: 'translateY(10px) rotate(360deg)' },
        },
      ],
      options: {
        duration: 3000,
        timing: 'linear',
        iteration: 'infinite',
      },
    },
    {
      name: 'bell-swing',
      type: 'css',
      keyframes: [
        { offset: 0, properties: { transform: 'rotate(-10deg)' } },
        { offset: 1, properties: { transform: 'rotate(10deg)' } },
      ],
      options: {
        duration: 2000,
        timing: 'ease-in-out',
        iteration: 'infinite',
        direction: 'alternate',
      },
    },
    {
      name: 'hat-wobble',
      type: 'css',
      keyframes: [
        { offset: 0, properties: { transform: 'rotate(-2deg)' } },
        { offset: 0.5, properties: { transform: 'rotate(2deg)' } },
        { offset: 1, properties: { transform: 'rotate(-2deg)' } },
      ],
      options: {
        duration: 2500,
        timing: 'ease-in-out',
        iteration: 'infinite',
        direction: 'alternate',
      },
    },
    {
      name: 'gift-sparkle',
      type: 'css',
      keyframes: [
        { offset: 0, properties: { opacity: '0.8', transform: 'scale(1)' } },
        { offset: 0.5, properties: { opacity: '1', transform: 'scale(1.05)' } },
        { offset: 1, properties: { opacity: '0.8', transform: 'scale(1)' } },
      ],
      options: {
        duration: 1800,
        timing: 'ease-in-out',
        iteration: 'infinite',
      },
    },
    {
      name: 'star-twinkle',
      type: 'css',
      keyframes: [
        { offset: 0, properties: { opacity: '0.6', transform: 'scale(0.9)' } },
        { offset: 0.5, properties: { opacity: '1', transform: 'scale(1.1)' } },
        { offset: 1, properties: { opacity: '0.6', transform: 'scale(0.9)' } },
      ],
      options: {
        duration: 1200,
        timing: 'ease-in-out',
        iteration: 'infinite',
        direction: 'alternate',
      },
    },
  ],

  // 资源配置
  resources: {
    preload: ['/assets/christmas/snowflake.svg', '/assets/christmas/bell.svg'],
    fonts: [
      'https://fonts.googleapis.com/css2?family=Mountains+of+Christmas&display=swap',
    ],
    images: {},
    sounds: ['/assets/christmas/sounds/jingle-bells.mp3'],
  },

  // 元数据
  metadata: {
    tags: ['festival', 'christmas', 'winter', 'red', 'green'],
    keywords: ['圣诞节', '雪花', '铃铛', '圣诞帽', '礼物'],
    preview: '/assets/christmas/preview.jpg',
    thumbnail: '/assets/christmas/thumbnail.jpg',
    activationPeriod: {
      start: { month: 12, day: 1 }, // 12月1日开始
      end: { month: 1, day: 7 }, // 1月7日结束
    },
  },
}
