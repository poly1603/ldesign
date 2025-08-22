/**
 * @ldesign/theme - 圣诞主题完整配置
 *
 * 集成颜色系统和挂件系统的完整圣诞主题配置
 */

import type { FestivalThemeConfig } from '../../core/festival-theme-config'
import { createFestivalTheme } from '../../core/festival-theme-config'
import {
  christmasTreeIcon,
  bellIcon,
  snowflakeIcon,
  giftBoxIcon,
  starIcon,
  santaIcon,
} from '../../resources/icons/christmas'
import type { WidgetConfig } from '../../widgets/element-decorations'

/**
 * 圣诞主题挂件配置
 */
const christmasWidgets: WidgetConfig[] = [
  // 头部挂件 - 圣诞树
  {
    type: 'header',
    position: 'top-right',
    icon: christmasTreeIcon,
    size: 'lg',
    animation: 'glow',
    opacity: 0.9,
    zIndex: 1000,
    enabled: true,
    responsive: {
      hideOnMobile: false,
      minWidth: 768,
    },
  },

  // 头部挂件 - 圣诞铃铛
  {
    type: 'header',
    position: 'top-left',
    icon: bellIcon,
    size: 'md',
    animation: 'swing',
    opacity: 0.95,
    zIndex: 1000,
    enabled: true,
  },

  // 按钮挂件 - 雪花装饰
  {
    type: 'button',
    position: 'top-right',
    icon: snowflakeIcon,
    size: 'sm',
    animation: 'rotate',
    opacity: 0.8,
    zIndex: 999,
    enabled: true,
  },

  // 卡片挂件 - 礼物盒
  {
    type: 'card',
    position: 'top-right',
    icon: giftBoxIcon,
    size: 'md',
    animation: 'bounce',
    opacity: 0.85,
    zIndex: 998,
    enabled: true,
    responsive: {
      hideOnMobile: true,
      minWidth: 1024,
    },
  },

  // 背景挂件 - 星星
  {
    type: 'background',
    position: 'center',
    icon: starIcon,
    size: 'xl',
    animation: 'sparkle',
    opacity: 0.15,
    zIndex: 1,
    enabled: true,
  },

  // 面板挂件 - 圣诞老人
  {
    type: 'panel',
    position: 'bottom-right',
    icon: santaIcon,
    size: 'lg',
    animation: 'bounce',
    opacity: 0.7,
    zIndex: 997,
    enabled: true,
    responsive: {
      hideOnMobile: true,
      minWidth: 1200,
    },
  },

  // 侧边栏挂件 - 雪花飘落
  {
    type: 'sidebar',
    position: 'left-center',
    icon: snowflakeIcon,
    size: 'sm',
    animation: 'float',
    opacity: 0.6,
    zIndex: 996,
    enabled: true,
  },

  // 输入框挂件 - 星星点缀
  {
    type: 'input',
    position: 'right-center',
    icon: starIcon,
    size: 'xs',
    animation: 'glow',
    opacity: 0.7,
    zIndex: 995,
    enabled: true,
  },

  // 导航挂件 - 圣诞树装饰
  {
    type: 'navigation',
    position: 'top-center',
    icon: christmasTreeIcon,
    size: 'sm',
    animation: 'pulse',
    opacity: 0.8,
    zIndex: 994,
    enabled: true,
  },

  // 模态框挂件 - 礼物盒
  {
    type: 'modal',
    position: 'corner-all',
    icon: giftBoxIcon,
    size: 'xs',
    animation: 'sparkle',
    opacity: 0.6,
    zIndex: 993,
    enabled: true,
  },
]

/**
 * 圣诞主题配置
 */
export const christmasThemeConfig: FestivalThemeConfig = createFestivalTheme({
  id: 'christmas',
  name: '圣诞节',
  description: '温馨圣诞主题，绿红配色，圣诞树雪花装饰',
  primaryColor: '#16A34A', // 圣诞绿
  secondaryColor: '#DC2626', // 圣诞红
  accentColor: '#FFD700', // 金色
  widgets: christmasWidgets,
  metadata: {
    tags: ['festival', 'christmas', 'winter', 'green', 'red', 'gold'],
    keywords: ['圣诞节', '圣诞树', '雪花', '礼物', '圣诞老人', '铃铛'],
    preview: '/assets/christmas/preview.jpg',
    thumbnail: '/assets/christmas/thumbnail.jpg',
    activationPeriod: {
      start: { month: 12, day: 1 }, // 12月1日开始
      end: { month: 1, day: 6 }, // 1月6日结束（三王节）
    },
  },
})

// 添加自定义动画配置
christmasThemeConfig.animations = [
  {
    name: 'christmas-twinkle',
    duration: '2s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
    direction: 'alternate',
  },
  {
    name: 'bell-ring',
    duration: '1.5s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
  },
  {
    name: 'snowfall',
    duration: '3s',
    timingFunction: 'linear',
    iterationCount: 'infinite',
  },
  {
    name: 'gift-bounce',
    duration: '2s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
  },
  {
    name: 'star-sparkle',
    duration: '1.8s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
    direction: 'alternate',
  },
  {
    name: 'santa-wave',
    duration: '2.5s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
  },
]

// 添加响应式配置
christmasThemeConfig.responsive = {
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
        opacity: 0.08, // 移动端背景更淡
      },
      {
        type: 'button',
        size: 'xs', // 移动端按钮挂件更小
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
      {
        type: 'sidebar',
        opacity: 0.7, // 平板端侧边栏稍微透明
      },
    ],
  },
}

// 添加圣诞主题特有的 CSS 变量
christmasThemeConfig.cssVariables = {
  ...christmasThemeConfig.cssVariables,
  '--christmas-snow': '#FFFFFF',
  '--christmas-holly': '#228B22',
  '--christmas-berry': '#DC143C',
  '--christmas-gold': '#FFD700',
  '--christmas-silver': '#C0C0C0',
}

/**
 * 导出圣诞主题配置
 */
export default christmasThemeConfig
