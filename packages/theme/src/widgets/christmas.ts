/**
 * @ldesign/theme - 圣诞节装饰挂件
 *
 * 圣诞节主题的SVG装饰挂件集合
 */

import type { DecorationWidget } from '../core/types'

/**
 * 雪花挂件 - 覆盖装饰
 */
export const snowflakeWidget: DecorationWidget = {
  id: 'snowflake',
  name: '雪花',
  type: 'svg',
  category: 'overlay',
  size: 'medium',
  festival: 'christmas',
  description: '精美雪花，带有旋转飘落效果',
  content: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 雪花主轴 -->
      <g stroke="var(--color-primary-3)" stroke-width="1.5" opacity="0.9">
        <path d="M16 4 L16 28"/>
        <path d="M4 16 L28 16"/>
        <path d="M8.8 8.8 L23.2 23.2"/>
        <path d="M23.2 8.8 L8.8 23.2"/>
      </g>
      
      <!-- 雪花分支 -->
      <g stroke="var(--color-primary-4)" stroke-width="1" opacity="0.8">
        <path d="M16 6 L14 8 M16 6 L18 8"/>
        <path d="M16 26 L14 24 M16 26 L18 24"/>
        <path d="M6 16 L8 14 M6 16 L8 18"/>
        <path d="M26 16 L24 14 M26 16 L24 18"/>
        <path d="M10.8 10.8 L12.4 9.2 M10.8 10.8 L9.2 12.4"/>
        <path d="M21.2 21.2 L22.8 19.6 M21.2 21.2 L19.6 22.8"/>
        <path d="M21.2 10.8 L22.8 12.4 M21.2 10.8 L19.6 9.2"/>
        <path d="M10.8 21.2 L12.4 22.8 M10.8 21.2 L9.2 19.6"/>
      </g>
      
      <!-- 雪花中心 -->
      <circle cx="16" cy="16" r="2" fill="var(--color-primary-2)" opacity="0.7"/>
    </svg>
  `,
  animation: {
    name: 'snowflake-fall',
    duration: 3000,
    timing: 'linear',
    iteration: 'infinite',
  },
}

/**
 * 圣诞铃铛挂件 - 角落装饰
 */
export const christmasBellWidget: DecorationWidget = {
  id: 'christmas-bell',
  name: '圣诞铃铛',
  type: 'svg',
  category: 'corner',
  size: 'small',
  festival: 'christmas',
  description: '金色圣诞铃铛，带有摇摆效果',
  content: `
    <svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 铃铛绳子 -->
      <path d="M12 2 L12 8" stroke="var(--color-success-6)" stroke-width="2"/>
      
      <!-- 铃铛主体 -->
      <path d="M6 12 Q6 8 12 8 Q18 8 18 12 L18 20 Q18 24 12 24 Q6 24 6 20 Z" 
            fill="var(--color-warning-5)" stroke="var(--color-warning-6)" stroke-width="1"/>
      
      <!-- 铃铛高光 -->
      <ellipse cx="10" cy="14" rx="2" ry="3" fill="var(--color-warning-3)" opacity="0.6"/>
      
      <!-- 铃铛开口 -->
      <ellipse cx="12" cy="24" rx="6" ry="2" fill="var(--color-warning-7)"/>
      
      <!-- 铃铛内部 -->
      <circle cx="12" cy="20" r="2" fill="var(--color-warning-7)"/>
      
      <!-- 装饰蝴蝶结 -->
      <path d="M8 6 Q12 4 16 6 Q12 8 8 6" fill="var(--color-danger-5)"/>
    </svg>
  `,
  animation: {
    name: 'bell-swing',
    duration: 2000,
    timing: 'ease-in-out',
    iteration: 'infinite',
    direction: 'alternate',
  },
  interactive: true,
}

/**
 * 圣诞帽挂件 - 边缘装饰
 */
export const santaHatWidget: DecorationWidget = {
  id: 'santa-hat',
  name: '圣诞帽',
  type: 'svg',
  category: 'edge',
  size: 'medium',
  festival: 'christmas',
  description: '可爱圣诞帽，带有轻微摆动效果',
  content: `
    <svg width="36" height="28" viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 帽子主体 -->
      <path d="M4 20 Q4 12 12 8 Q20 4 28 8 Q32 12 30 16 L28 20 Q26 24 18 24 Q10 24 4 20 Z" 
            fill="var(--color-danger-5)"/>
      
      <!-- 帽子边缘 -->
      <ellipse cx="18" cy="22" rx="14" ry="3" fill="var(--color-gray-1)"/>
      
      <!-- 帽子尖端 -->
      <circle cx="28" cy="8" r="4" fill="var(--color-gray-1)"/>
      
      <!-- 帽子装饰条纹 -->
      <path d="M8 18 Q18 16 28 18" stroke="var(--color-gray-1)" stroke-width="2" opacity="0.8"/>
    </svg>
  `,
  animation: {
    name: 'hat-wobble',
    duration: 2500,
    timing: 'ease-in-out',
    iteration: 'infinite',
    direction: 'alternate',
  },
}

/**
 * 礼物盒挂件 - 角落装饰
 */
export const giftBoxWidget: DecorationWidget = {
  id: 'gift-box',
  name: '礼物盒',
  type: 'svg',
  category: 'corner',
  size: 'medium',
  festival: 'christmas',
  description: '精美礼物盒，带有闪烁效果',
  content: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 礼物盒主体 -->
      <rect x="4" y="12" width="24" height="16" rx="2" fill="var(--color-success-5)"/>
      
      <!-- 礼物盒盖子 -->
      <rect x="2" y="10" width="28" height="4" rx="2" fill="var(--color-success-6)"/>
      
      <!-- 垂直丝带 -->
      <rect x="14" y="4" width="4" height="24" fill="var(--color-danger-5)"/>
      
      <!-- 水平丝带 -->
      <rect x="2" y="14" width="28" height="4" fill="var(--color-danger-5)"/>
      
      <!-- 蝴蝶结 -->
      <path d="M12 4 Q16 2 20 4 Q16 6 12 4" fill="var(--color-danger-6)"/>
      <path d="M12 8 Q16 6 20 8 Q16 10 12 8" fill="var(--color-danger-6)"/>
      <rect x="15" y="4" width="2" height="6" fill="var(--color-danger-7)"/>
      
      <!-- 装饰点 -->
      <g fill="var(--color-warning-5)" opacity="0.8">
        <circle cx="8" cy="20" r="1"/>
        <circle cx="24" cy="20" r="1"/>
        <circle cx="16" cy="24" r="1"/>
      </g>
    </svg>
  `,
  animation: {
    name: 'gift-sparkle',
    duration: 1800,
    timing: 'ease-in-out',
    iteration: 'infinite',
  },
}

/**
 * 圣诞星星挂件 - 背景装饰
 */
export const christmasStarWidget: DecorationWidget = {
  id: 'christmas-star',
  name: '圣诞星',
  type: 'svg',
  category: 'background',
  size: 'small',
  festival: 'christmas',
  description: '闪亮星星，带有闪烁效果',
  content: `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 星星主体 -->
      <path d="M10 2 L12.4 7.6 L18 8 L14 12.4 L15.2 18 L10 15.2 L4.8 18 L6 12.4 L2 8 L7.6 7.6 Z" 
            fill="var(--color-warning-5)" stroke="var(--color-warning-6)" stroke-width="0.5"/>
      
      <!-- 星星高光 -->
      <path d="M10 4 L11.2 8.8 L15 9 L12 11.2 L12.8 15 L10 13.2 L7.2 15 L8 11.2 L5 9 L8.8 8.8 Z" 
            fill="var(--color-warning-3)" opacity="0.7"/>
    </svg>
  `,
  animation: {
    name: 'star-twinkle',
    duration: 1200,
    timing: 'ease-in-out',
    iteration: 'infinite',
    direction: 'alternate',
  },
}

/**
 * 圣诞节装饰挂件集合
 */
export const christmasWidgets: DecorationWidget[] = [
  snowflakeWidget,
  christmasBellWidget,
  santaHatWidget,
  giftBoxWidget,
  christmasStarWidget,
]
