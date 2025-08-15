/**
 * @ldesign/theme - 春节主题完整配置
 *
 * 集成颜色系统和挂件系统的完整春节主题配置
 */

import type { FestivalThemeConfig } from '../../core/festival-theme-config'
import { createFestivalTheme } from '../../core/festival-theme-config'
import {
  lanternIcon,
  fuIcon,
  fireworkIcon,
  plumBlossomIcon,
  dragonIcon,
  goldCoinIcon,
} from '../../resources/icons/spring-festival'
import type { WidgetConfig } from '../../widgets/element-decorations'

/**
 * 春节主题挂件配置
 */
const springFestivalWidgets: WidgetConfig[] = [
  // 头部挂件 - 红灯笼
  {
    type: 'header',
    position: 'top-right',
    icon: lanternIcon,
    size: 'lg',
    animation: 'swing',
    opacity: 0.9,
    zIndex: 1000,
    enabled: true,
    responsive: {
      hideOnMobile: false,
      minWidth: 768,
    },
  },

  // 头部挂件 - 福字
  {
    type: 'header',
    position: 'top-left',
    icon: fuIcon,
    size: 'md',
    animation: 'glow',
    opacity: 0.95,
    zIndex: 1000,
    enabled: true,
  },

  // 按钮挂件 - 金币装饰
  {
    type: 'button',
    position: 'top-right',
    icon: goldCoinIcon,
    size: 'sm',
    animation: 'sparkle',
    opacity: 0.8,
    zIndex: 999,
    enabled: true,
  },

  // 卡片挂件 - 烟花
  {
    type: 'card',
    position: 'top-right',
    icon: fireworkIcon,
    size: 'md',
    animation: 'pulse',
    opacity: 0.85,
    zIndex: 998,
    enabled: true,
    responsive: {
      hideOnMobile: true,
      minWidth: 1024,
    },
  },

  // 背景挂件 - 梅花
  {
    type: 'background',
    position: 'center',
    icon: plumBlossomIcon,
    size: 'xl',
    animation: 'float',
    opacity: 0.1,
    zIndex: 1,
    enabled: true,
  },

  // 面板挂件 - 中国龙
  {
    type: 'panel',
    position: 'bottom-right',
    icon: dragonIcon,
    size: 'lg',
    animation: 'swing',
    opacity: 0.7,
    zIndex: 997,
    enabled: true,
    responsive: {
      hideOnMobile: true,
      minWidth: 1200,
    },
  },

  // 侧边栏挂件 - 灯笼装饰
  {
    type: 'sidebar',
    position: 'left-center',
    icon: lanternIcon,
    size: 'sm',
    animation: 'bounce',
    opacity: 0.6,
    zIndex: 996,
    enabled: true,
  },

  // 输入框挂件 - 金币点缀
  {
    type: 'input',
    position: 'right-center',
    icon: goldCoinIcon,
    size: 'xs',
    animation: 'glow',
    opacity: 0.7,
    zIndex: 995,
    enabled: true,
  },
]

/**
 * 春节主题配置
 */
export const springFestivalThemeConfig: FestivalThemeConfig =
  createFestivalTheme({
    id: 'spring-festival',
    name: '春节',
    description: '传统中国新年主题，红金配色，灯笼烟花装饰',
    primaryColor: '#DC2626', // 中国红
    secondaryColor: '#B91C1C', // 深红色
    accentColor: '#F59E0B', // 金色
    widgets: springFestivalWidgets,
    metadata: {
      tags: ['festival', 'spring-festival', 'chinese-new-year', 'red', 'gold'],
      keywords: ['春节', '新年', '灯笼', '烟花', '福字', '中国红', '金色'],
      preview: '/assets/spring-festival/preview.jpg',
      thumbnail: '/assets/spring-festival/thumbnail.jpg',
      activationPeriod: {
        start: { month: 1, day: 20 }, // 1月20日开始
        end: { month: 3, day: 5 }, // 3月5日结束
      },
    },
  })

// 添加自定义动画配置
springFestivalThemeConfig.animations = [
  {
    name: 'lantern-swing',
    duration: '3s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
    direction: 'alternate',
  },
  {
    name: 'firework-burst',
    duration: '2s',
    timingFunction: 'ease-out',
    iterationCount: 'infinite',
    delay: '0.5s',
  },
  {
    name: 'fu-glow',
    duration: '1.5s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
    direction: 'alternate',
  },
  {
    name: 'firecracker-bounce',
    duration: '1s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
  },
  {
    name: 'blossom-float',
    duration: '4s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
    direction: 'alternate',
  },
]

// 添加响应式配置
springFestivalThemeConfig.responsive = {
  mobile: {
    enabled: true,
    widgets: [
      {
        type: 'header',
        size: 'md', // 移动端使用中等尺寸
        opacity: 0.8,
      },
      {
        type: 'background',
        opacity: 0.05, // 移动端背景更淡
      },
    ],
  },
  tablet: {
    enabled: true,
    widgets: [
      {
        type: 'panel',
        size: 'md', // 平板端面板使用中等尺寸
      },
    ],
  },
}

/**
 * 导出春节主题配置
 */
export default springFestivalThemeConfig
