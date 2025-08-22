/**
 * @ldesign/theme - 默认主题 SVG 图标库
 *
 * 包含默认主题的简洁 SVG 装饰图标
 */

import type { SVGIcon } from '../../widgets/element-decorations'

/**
 * 简单光点图标
 */
export const sparkleIcon: SVGIcon = {
  content: `
    <g>
      <!-- 中心点 -->
      <circle cx="50" cy="50" r="2" fill="var(--festival-primary)"/>
      <!-- 光芒 -->
      <g stroke="var(--festival-primary)" stroke-width="1" fill="none">
        <line x1="50" y1="40" x2="50" y2="35"/>
        <line x1="50" y1="65" x2="50" y2="60"/>
        <line x1="40" y1="50" x2="35" y2="50"/>
        <line x1="65" y1="50" x2="60" y2="50"/>
        <line x1="43" y1="43" x2="40" y2="40"/>
        <line x1="57" y1="43" x2="60" y2="40"/>
        <line x1="43" y1="57" x2="40" y2="60"/>
        <line x1="57" y1="57" x2="60" y2="60"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-primary)',
  strokeWidth: 1,
}

/**
 * 装饰线图标
 */
export const decorativeLineIcon: SVGIcon = {
  content: `
    <g>
      <!-- 主线条 -->
      <line x1="20" y1="50" x2="80" y2="50" stroke="var(--festival-primary)" stroke-width="2"/>
      <!-- 装饰点 -->
      <circle cx="30" cy="50" r="1.5" fill="var(--festival-primary)"/>
      <circle cx="50" cy="50" r="2" fill="var(--festival-primary)"/>
      <circle cx="70" cy="50" r="1.5" fill="var(--festival-primary)"/>
      <!-- 端点装饰 -->
      <circle cx="20" cy="50" r="3" fill="none" stroke="var(--festival-primary)" stroke-width="1"/>
      <circle cx="80" cy="50" r="3" fill="none" stroke="var(--festival-primary)" stroke-width="1"/>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-primary)',
  strokeWidth: 2,
}

/**
 * 几何装饰图标
 */
export const geometricIcon: SVGIcon = {
  content: `
    <g>
      <!-- 外圆 -->
      <circle cx="50" cy="50" r="25" fill="none" stroke="var(--festival-primary)" stroke-width="1" opacity="0.6"/>
      <!-- 内圆 -->
      <circle cx="50" cy="50" r="15" fill="none" stroke="var(--festival-primary)" stroke-width="1" opacity="0.8"/>
      <!-- 中心点 -->
      <circle cx="50" cy="50" r="3" fill="var(--festival-primary)"/>
      <!-- 装饰点 -->
      <g fill="var(--festival-primary)" opacity="0.7">
        <circle cx="50" cy="25" r="1.5"/>
        <circle cx="75" cy="50" r="1.5"/>
        <circle cx="50" cy="75" r="1.5"/>
        <circle cx="25" cy="50" r="1.5"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-primary)',
  strokeWidth: 1,
}

/**
 * 简约星形图标
 */
export const simpleStarIcon: SVGIcon = {
  content: `
    <g>
      <!-- 星形轮廓 -->
      <polygon points="50,20 55,40 75,40 60,52 65,72 50,60 35,72 40,52 25,40 45,40" 
               fill="none" stroke="var(--festival-primary)" stroke-width="1.5" opacity="0.8"/>
      <!-- 中心点 -->
      <circle cx="50" cy="50" r="2" fill="var(--festival-primary)"/>
      <!-- 内部装饰线 -->
      <g stroke="var(--festival-primary)" stroke-width="0.5" opacity="0.6" fill="none">
        <line x1="50" y1="30" x2="50" y2="40"/>
        <line x1="60" y1="45" x2="55" y2="50"/>
        <line x1="60" y1="60" x2="55" y2="55"/>
        <line x1="50" y1="70" x2="50" y2="60"/>
        <line x1="40" y1="60" x2="45" y2="55"/>
        <line x1="40" y1="45" x2="45" y2="50"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'none',
  stroke: 'var(--festival-primary)',
  strokeWidth: 1.5,
}

/**
 * 波浪装饰图标
 */
export const waveIcon: SVGIcon = {
  content: `
    <g>
      <!-- 波浪线 -->
      <path d="M20 50 Q30 35 40 50 Q50 65 60 50 Q70 35 80 50" 
            stroke="var(--festival-primary)" stroke-width="2" fill="none" opacity="0.8"/>
      <!-- 装饰点 -->
      <g fill="var(--festival-primary)" opacity="0.6">
        <circle cx="25" cy="45" r="1"/>
        <circle cx="35" cy="55" r="1"/>
        <circle cx="45" cy="45" r="1"/>
        <circle cx="55" cy="55" r="1"/>
        <circle cx="65" cy="45" r="1"/>
        <circle cx="75" cy="55" r="1"/>
      </g>
      <!-- 端点 -->
      <circle cx="20" cy="50" r="2" fill="var(--festival-primary)" opacity="0.7"/>
      <circle cx="80" cy="50" r="2" fill="var(--festival-primary)" opacity="0.7"/>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'none',
  stroke: 'var(--festival-primary)',
  strokeWidth: 2,
}

/**
 * 点阵装饰图标
 */
export const dotPatternIcon: SVGIcon = {
  content: `
    <g fill="var(--festival-primary)">
      <!-- 中心大点 -->
      <circle cx="50" cy="50" r="3" opacity="1"/>
      <!-- 内圈点 -->
      <circle cx="50" cy="35" r="2" opacity="0.8"/>
      <circle cx="65" cy="50" r="2" opacity="0.8"/>
      <circle cx="50" cy="65" r="2" opacity="0.8"/>
      <circle cx="35" cy="50" r="2" opacity="0.8"/>
      <!-- 外圈点 -->
      <circle cx="50" cy="25" r="1.5" opacity="0.6"/>
      <circle cx="61" cy="32" r="1.5" opacity="0.6"/>
      <circle cx="75" cy="50" r="1.5" opacity="0.6"/>
      <circle cx="61" cy="68" r="1.5" opacity="0.6"/>
      <circle cx="50" cy="75" r="1.5" opacity="0.6"/>
      <circle cx="39" cy="68" r="1.5" opacity="0.6"/>
      <circle cx="25" cy="50" r="1.5" opacity="0.6"/>
      <circle cx="39" cy="32" r="1.5" opacity="0.6"/>
      <!-- 最外圈小点 -->
      <circle cx="50" cy="15" r="1" opacity="0.4"/>
      <circle cx="71" cy="29" r="1" opacity="0.4"/>
      <circle cx="85" cy="50" r="1" opacity="0.4"/>
      <circle cx="71" cy="71" r="1" opacity="0.4"/>
      <circle cx="50" cy="85" r="1" opacity="0.4"/>
      <circle cx="29" cy="71" r="1" opacity="0.4"/>
      <circle cx="15" cy="50" r="1" opacity="0.4"/>
      <circle cx="29" cy="29" r="1" opacity="0.4"/>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'none',
  strokeWidth: 0,
}

/**
 * 默认主题图标集合
 */
export const defaultIcons = {
  sparkle: sparkleIcon,
  decorativeLine: decorativeLineIcon,
  geometric: geometricIcon,
  simpleStar: simpleStarIcon,
  wave: waveIcon,
  dotPattern: dotPatternIcon,
} as const

/**
 * 获取默认主题图标
 */
export function getDefaultIcon(name: keyof typeof defaultIcons): SVGIcon {
  return defaultIcons[name]
}

/**
 * 获取所有默认主题图标名称
 */
export function getDefaultIconNames(): (keyof typeof defaultIcons)[] {
  return Object.keys(defaultIcons) as (keyof typeof defaultIcons)[]
}
