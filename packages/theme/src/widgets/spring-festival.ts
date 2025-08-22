/**
 * @ldesign/theme - 春节装饰挂件
 *
 * 春节主题的SVG装饰挂件集合
 */

import type { DecorationWidget } from '../core/types'

/**
 * 红灯笼挂件 - 角落装饰
 */
export const redLanternWidget: DecorationWidget = {
  id: 'red-lantern',
  name: '红灯笼',
  type: 'svg',
  category: 'corner',
  size: 'medium',
  festival: 'spring-festival',
  description: '传统红灯笼，带有摆动动画效果',
  content: `
    <svg width="32" height="48" viewBox="0 0 32 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 灯笼顶部 -->
      <rect x="11" y="2" width="10" height="4" rx="2" fill="var(--color-warning-6)" />
      
      <!-- 灯笼主体 -->
      <ellipse cx="16" cy="20" rx="12" ry="16" fill="var(--color-danger-5)" />
      <ellipse cx="16" cy="20" rx="10" ry="14" fill="var(--color-danger-6)" />
      
      <!-- 灯笼纹理 -->
      <path d="M6 12 L26 12" stroke="var(--color-warning-6)" stroke-width="1" opacity="0.8"/>
      <path d="M6 20 L26 20" stroke="var(--color-warning-6)" stroke-width="1" opacity="0.8"/>
      <path d="M6 28 L26 28" stroke="var(--color-warning-6)" stroke-width="1" opacity="0.8"/>
      
      <!-- 福字 -->
      <text x="16" y="24" text-anchor="middle" fill="var(--color-warning-6)" font-size="8" font-weight="bold">福</text>
      
      <!-- 灯笼底部流苏 -->
      <path d="M16 36 L16 44" stroke="var(--color-warning-6)" stroke-width="2"/>
      <circle cx="16" cy="44" r="2" fill="var(--color-warning-6)"/>
    </svg>
  `,
  animation: {
    name: 'lantern-swing',
    duration: 3000,
    timing: 'ease-in-out',
    iteration: 'infinite',
    direction: 'alternate',
  },
  interactive: true,
}

/**
 * 烟花挂件 - 覆盖装饰
 */
export const fireworkWidget: DecorationWidget = {
  id: 'firework',
  name: '烟花',
  type: 'svg',
  category: 'overlay',
  size: 'large',
  festival: 'spring-festival',
  description: '绚烂烟花，带有闪烁绽放效果',
  content: `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 烟花中心 -->
      <circle cx="24" cy="24" r="3" fill="var(--color-warning-5)"/>
      
      <!-- 烟花射线 -->
      <g stroke="var(--color-danger-5)" stroke-width="2" opacity="0.8">
        <path d="M24 8 L24 16"/>
        <path d="M24 32 L24 40"/>
        <path d="M8 24 L16 24"/>
        <path d="M32 24 L40 24"/>
        <path d="M14.1 14.1 L19.8 19.8"/>
        <path d="M28.2 28.2 L33.9 33.9"/>
        <path d="M33.9 14.1 L28.2 19.8"/>
        <path d="M19.8 28.2 L14.1 33.9"/>
      </g>
      
      <!-- 烟花粒子 -->
      <g fill="var(--color-warning-6)">
        <circle cx="24" cy="6" r="1.5"/>
        <circle cx="24" cy="42" r="1.5"/>
        <circle cx="6" cy="24" r="1.5"/>
        <circle cx="42" cy="24" r="1.5"/>
        <circle cx="12.7" cy="12.7" r="1"/>
        <circle cx="35.3" cy="35.3" r="1"/>
        <circle cx="35.3" cy="12.7" r="1"/>
        <circle cx="12.7" cy="35.3" r="1"/>
      </g>
    </svg>
  `,
  animation: {
    name: 'firework-burst',
    duration: 2000,
    timing: 'ease-out',
    iteration: 'infinite',
    delay: 500,
  },
}

/**
 * 福字挂件 - 边缘装饰
 */
export const fuCharacterWidget: DecorationWidget = {
  id: 'fu-character',
  name: '福字',
  type: 'svg',
  category: 'edge',
  size: 'small',
  festival: 'spring-festival',
  description: '传统福字，带有旋转闪烁效果',
  content: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 福字背景 -->
      <circle cx="12" cy="12" r="11" fill="var(--color-danger-5)" stroke="var(--color-warning-6)" stroke-width="1"/>
      
      <!-- 福字 -->
      <text x="12" y="16" text-anchor="middle" fill="var(--color-warning-6)" font-size="12" font-weight="bold">福</text>
    </svg>
  `,
  animation: {
    name: 'fu-glow',
    duration: 1500,
    timing: 'ease-in-out',
    iteration: 'infinite',
    direction: 'alternate',
  },
}

/**
 * 鞭炮挂件 - 角落装饰
 */
export const firecrackerWidget: DecorationWidget = {
  id: 'firecracker',
  name: '鞭炮',
  type: 'svg',
  category: 'corner',
  size: 'small',
  festival: 'spring-festival',
  description: '传统鞭炮串，带有跳动效果',
  content: `
    <svg width="20" height="40" viewBox="0 0 20 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 鞭炮串 -->
      <g fill="var(--color-danger-5)">
        <rect x="6" y="4" width="8" height="6" rx="1"/>
        <rect x="8" y="12" width="8" height="6" rx="1"/>
        <rect x="4" y="20" width="8" height="6" rx="1"/>
        <rect x="8" y="28" width="8" height="6" rx="1"/>
      </g>
      
      <!-- 引线 -->
      <path d="M10 2 Q12 0 14 2" stroke="var(--color-warning-6)" stroke-width="1" fill="none"/>
      
      <!-- 装饰线条 -->
      <g stroke="var(--color-warning-6)" stroke-width="0.5">
        <path d="M7 7 L13 7"/>
        <path d="M9 15 L15 15"/>
        <path d="M5 23 L11 23"/>
        <path d="M9 31 L15 31"/>
      </g>
    </svg>
  `,
  animation: {
    name: 'firecracker-bounce',
    duration: 1000,
    timing: 'ease-in-out',
    iteration: 'infinite',
  },
}

/**
 * 梅花挂件 - 背景装饰
 */
export const plumBlossomWidget: DecorationWidget = {
  id: 'plum-blossom',
  name: '梅花',
  type: 'svg',
  category: 'background',
  size: 'medium',
  festival: 'spring-festival',
  description: '梅花装饰，带有飘落效果',
  content: `
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 梅花花瓣 -->
      <g fill="var(--color-danger-3)" opacity="0.8">
        <ellipse cx="14" cy="8" rx="3" ry="6" transform="rotate(0 14 14)"/>
        <ellipse cx="14" cy="8" rx="3" ry="6" transform="rotate(72 14 14)"/>
        <ellipse cx="14" cy="8" rx="3" ry="6" transform="rotate(144 14 14)"/>
        <ellipse cx="14" cy="8" rx="3" ry="6" transform="rotate(216 14 14)"/>
        <ellipse cx="14" cy="8" rx="3" ry="6" transform="rotate(288 14 14)"/>
      </g>
      
      <!-- 花心 -->
      <circle cx="14" cy="14" r="2" fill="var(--color-warning-5)"/>
      
      <!-- 花蕊 -->
      <g fill="var(--color-warning-6)">
        <circle cx="14" cy="12" r="0.5"/>
        <circle cx="16" cy="14" r="0.5"/>
        <circle cx="14" cy="16" r="0.5"/>
        <circle cx="12" cy="14" r="0.5"/>
      </g>
    </svg>
  `,
  animation: {
    name: 'blossom-float',
    duration: 4000,
    timing: 'ease-in-out',
    iteration: 'infinite',
    direction: 'alternate',
  },
}

/**
 * 春节装饰挂件集合
 */
export const springFestivalWidgets: DecorationWidget[] = [
  redLanternWidget,
  fireworkWidget,
  fuCharacterWidget,
  firecrackerWidget,
  plumBlossomWidget,
]
