/**
 * @ldesign/theme - 默认主题完整配置
 *
 * 简洁的默认主题配置，适用于日常使用
 */

import type { FestivalThemeConfig } from '../../core/festival-theme-config'
import { createFestivalTheme } from '../../core/festival-theme-config'
import {
  sparkleIcon,
  decorativeLineIcon,
  geometricIcon,
  simpleStarIcon,
  waveIcon,
  dotPatternIcon,
} from '../../resources/icons/default'
import type { WidgetConfig } from '../../widgets/element-decorations'

/**
 * 默认主题挂件配置（简洁风格）
 */
const defaultWidgets: WidgetConfig[] = [
  // 按钮挂件 - 简单光点
  {
    type: 'button',
    position: 'top-right',
    icon: sparkleIcon,
    size: 'sm',
    animation: 'glow',
    opacity: 0.6,
    zIndex: 999,
    enabled: true,
  },

  // 卡片挂件 - 装饰线
  {
    type: 'card',
    position: 'top-center',
    icon: decorativeLineIcon,
    size: 'sm',
    animation: 'none',
    opacity: 0.4,
    zIndex: 998,
    enabled: true,
  },

  // 头部挂件 - 几何装饰
  {
    type: 'header',
    position: 'top-right',
    icon: geometricIcon,
    size: 'md',
    animation: 'pulse',
    opacity: 0.5,
    zIndex: 997,
    enabled: true,
    responsive: {
      hideOnMobile: true,
      minWidth: 1024,
    },
  },

  // 面板挂件 - 简约星形
  {
    type: 'panel',
    position: 'bottom-right',
    icon: simpleStarIcon,
    size: 'md',
    animation: 'sparkle',
    opacity: 0.4,
    zIndex: 996,
    enabled: true,
    responsive: {
      hideOnMobile: true,
      minWidth: 768,
    },
  },

  // 背景挂件 - 点阵装饰
  {
    type: 'background',
    position: 'center',
    icon: dotPatternIcon,
    size: 'xl',
    animation: 'none',
    opacity: 0.05,
    zIndex: 1,
    enabled: true,
  },

  // 侧边栏挂件 - 波浪装饰
  {
    type: 'sidebar',
    position: 'left-center',
    icon: waveIcon,
    size: 'sm',
    animation: 'float',
    opacity: 0.3,
    zIndex: 995,
    enabled: true,
    responsive: {
      hideOnMobile: true,
      minWidth: 1200,
    },
  },

  // 输入框挂件 - 光点装饰
  {
    type: 'input',
    position: 'right-center',
    icon: sparkleIcon,
    size: 'xs',
    animation: 'glow',
    opacity: 0.5,
    zIndex: 994,
    enabled: true,
  },
]

/**
 * 默认主题配置
 */
export const defaultThemeConfig: FestivalThemeConfig = createFestivalTheme({
  id: 'default',
  name: '默认',
  description: '简洁优雅的默认主题，适合日常使用',
  primaryColor: '#1890FF', // 经典蓝色
  secondaryColor: '#722ED1', // 紫色
  accentColor: '#52C41A', // 绿色
  widgets: defaultWidgets,
  metadata: {
    tags: ['default', 'minimal', 'clean', 'elegant'],
    keywords: ['默认', '简洁', '优雅', '日常', '通用'],
    preview: '/assets/default/preview.jpg',
    thumbnail: '/assets/default/thumbnail.jpg',
    // 默认主题没有激活时间段限制
  },
})

// 添加默认主题动画配置（更加微妙）
defaultThemeConfig.animations = [
  {
    name: 'subtle-glow',
    duration: '2s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
    direction: 'alternate',
  },
  {
    name: 'gentle-pulse',
    duration: '3s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
  },
  {
    name: 'soft-sparkle',
    duration: '2.5s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
    direction: 'alternate',
  },
  {
    name: 'calm-float',
    duration: '4s',
    timingFunction: 'ease-in-out',
    iterationCount: 'infinite',
    direction: 'alternate',
  },
]

// 添加响应式配置
defaultThemeConfig.responsive = {
  mobile: {
    enabled: true,
    widgets: [
      {
        type: 'button',
        size: 'xs', // 移动端使用更小尺寸
        opacity: 0.4,
      },
      {
        type: 'background',
        opacity: 0.02, // 移动端背景几乎不可见
      },
      {
        type: 'input',
        opacity: 0.3, // 移动端输入框装饰更淡
      },
    ],
  },
  tablet: {
    enabled: true,
    widgets: [
      {
        type: 'panel',
        size: 'sm', // 平板端面板使用小尺寸
      },
      {
        type: 'header',
        opacity: 0.4, // 平板端头部装饰更淡
      },
    ],
  },
}

// 默认主题使用更加中性的 CSS 变量
defaultThemeConfig.cssVariables = {
  ...defaultThemeConfig.cssVariables,
  '--default-subtle': 'rgba(24, 144, 255, 0.1)',
  '--default-muted': 'rgba(24, 144, 255, 0.05)',
  '--default-highlight': 'rgba(24, 144, 255, 0.15)',
}

/**
 * 导出默认主题配置
 */
export default defaultThemeConfig
