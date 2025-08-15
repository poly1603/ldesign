/**
 * @ldesign/theme - 春节主题 SVG 图标库
 *
 * 包含春节主题的所有 SVG 装饰图标
 */

import type { SVGIcon } from '../../widgets/element-decorations'

/**
 * 红灯笼图标
 */
export const lanternIcon: SVGIcon = {
  content: `
    <g>
      <!-- 灯笼主体 -->
      <ellipse cx="50" cy="40" rx="25" ry="30" fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="2"/>
      <!-- 灯笼顶部 -->
      <rect x="45" y="8" width="10" height="8" rx="2" fill="var(--festival-accent)"/>
      <!-- 灯笼底部 -->
      <rect x="45" y="72" width="10" height="8" rx="2" fill="var(--festival-accent)"/>
      <!-- 装饰线条 -->
      <line x1="30" y1="25" x2="70" y2="25" stroke="var(--festival-accent)" stroke-width="1"/>
      <line x1="30" y1="40" x2="70" y2="40" stroke="var(--festival-accent)" stroke-width="1"/>
      <line x1="30" y1="55" x2="70" y2="55" stroke="var(--festival-accent)" stroke-width="1"/>
      <!-- 悬挂绳 -->
      <line x1="50" y1="0" x2="50" y2="8" stroke="var(--festival-accent)" stroke-width="2"/>
      <!-- 流苏 -->
      <g transform="translate(50, 80)">
        <line x1="0" y1="0" x2="0" y2="12" stroke="var(--festival-accent)" stroke-width="1"/>
        <line x1="-3" y1="0" x2="-3" y2="10" stroke="var(--festival-accent)" stroke-width="1"/>
        <line x1="3" y1="0" x2="3" y2="10" stroke="var(--festival-accent)" stroke-width="1"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-accent)',
  strokeWidth: 2,
}

/**
 * 福字图标
 */
export const fuIcon: SVGIcon = {
  content: `
    <g>
      <!-- 背景圆形 -->
      <circle cx="50" cy="50" r="35" fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="3"/>
      <!-- 福字简化版 -->
      <g transform="translate(50, 50)" fill="var(--festival-accent)">
        <!-- 示字旁 -->
        <rect x="-20" y="-15" width="3" height="30" />
        <rect x="-20" y="-15" width="12" height="3" />
        <rect x="-20" y="0" width="12" height="3" />
        <rect x="-20" y="12" width="12" height="3" />
        <!-- 畐字 -->
        <rect x="-5" y="-20" width="20" height="3" />
        <rect x="-5" y="-20" width="3" height="40" />
        <rect x="12" y="-20" width="3" height="40" />
        <rect x="-5" y="-5" width="20" height="3" />
        <rect x="-5" y="10" width="20" height="3" />
        <rect x="-5" y="17" width="20" height="3" />
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-accent)',
  strokeWidth: 3,
}

/**
 * 烟花图标
 */
export const fireworkIcon: SVGIcon = {
  content: `
    <g>
      <!-- 中心爆炸点 -->
      <circle cx="50" cy="50" r="3" fill="var(--festival-accent)"/>
      <!-- 放射线 -->
      <g stroke="var(--festival-primary)" stroke-width="2" fill="none">
        <line x1="50" y1="50" x2="50" y2="20"/>
        <line x1="50" y1="50" x2="80" y2="50"/>
        <line x1="50" y1="50" x2="50" y2="80"/>
        <line x1="50" y1="50" x2="20" y2="50"/>
        <line x1="50" y1="50" x2="71" y2="29"/>
        <line x1="50" y1="50" x2="71" y2="71"/>
        <line x1="50" y1="50" x2="29" y2="71"/>
        <line x1="50" y1="50" x2="29" y2="29"/>
      </g>
      <!-- 火花点 -->
      <g fill="var(--festival-accent)">
        <circle cx="50" cy="15" r="2"/>
        <circle cx="85" cy="50" r="2"/>
        <circle cx="50" cy="85" r="2"/>
        <circle cx="15" cy="50" r="2"/>
        <circle cx="76" cy="24" r="1.5"/>
        <circle cx="76" cy="76" r="1.5"/>
        <circle cx="24" cy="76" r="1.5"/>
        <circle cx="24" cy="24" r="1.5"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-accent)',
  strokeWidth: 2,
}

/**
 * 梅花图标
 */
export const plumBlossomIcon: SVGIcon = {
  content: `
    <g>
      <!-- 花瓣 -->
      <g fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="1">
        <ellipse cx="50" cy="35" rx="8" ry="12" transform="rotate(0 50 50)"/>
        <ellipse cx="50" cy="35" rx="8" ry="12" transform="rotate(72 50 50)"/>
        <ellipse cx="50" cy="35" rx="8" ry="12" transform="rotate(144 50 50)"/>
        <ellipse cx="50" cy="35" rx="8" ry="12" transform="rotate(216 50 50)"/>
        <ellipse cx="50" cy="35" rx="8" ry="12" transform="rotate(288 50 50)"/>
      </g>
      <!-- 花心 -->
      <circle cx="50" cy="50" r="5" fill="var(--festival-accent)"/>
      <!-- 花蕊 -->
      <g fill="var(--festival-accent)">
        <circle cx="48" cy="48" r="1"/>
        <circle cx="52" cy="48" r="1"/>
        <circle cx="50" cy="52" r="1"/>
        <circle cx="47" cy="52" r="1"/>
        <circle cx="53" cy="52" r="1"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-accent)',
  strokeWidth: 1,
}

/**
 * 中国龙图标（简化版）
 */
export const dragonIcon: SVGIcon = {
  content: `
    <g>
      <!-- 龙头 -->
      <ellipse cx="25" cy="50" rx="15" ry="12" fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="2"/>
      <!-- 龙眼 -->
      <circle cx="20" cy="47" r="3" fill="var(--festival-accent)"/>
      <circle cx="20" cy="47" r="1" fill="white"/>
      <!-- 龙须 -->
      <path d="M10 45 Q5 40 8 35" stroke="var(--festival-accent)" stroke-width="1" fill="none"/>
      <path d="M10 55 Q5 60 8 65" stroke="var(--festival-accent)" stroke-width="1" fill="none"/>
      <!-- 龙身 -->
      <path d="M40 50 Q60 40 80 50 Q90 55 85 60 Q70 65 50 55 Q45 52 40 50" 
            fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="2"/>
      <!-- 龙鳞 -->
      <g stroke="var(--festival-accent)" stroke-width="1" fill="none">
        <path d="M45 48 Q50 45 55 48"/>
        <path d="M55 52 Q60 49 65 52"/>
        <path d="M65 48 Q70 45 75 48"/>
      </g>
      <!-- 龙爪 -->
      <g stroke="var(--festival-accent)" stroke-width="1" fill="none">
        <path d="M35 60 L32 65 M35 60 L38 65 M35 60 L35 66"/>
        <path d="M75 60 L72 65 M75 60 L78 65 M75 60 L75 66"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-accent)',
  strokeWidth: 2,
}

/**
 * 金币图标
 */
export const goldCoinIcon: SVGIcon = {
  content: `
    <g>
      <!-- 外圆 -->
      <circle cx="50" cy="50" r="30" fill="var(--festival-accent)" stroke="var(--festival-primary)" stroke-width="3"/>
      <!-- 内圆 -->
      <circle cx="50" cy="50" r="20" fill="none" stroke="var(--festival-primary)" stroke-width="2"/>
      <!-- 方孔 -->
      <rect x="45" y="45" width="10" height="10" fill="var(--festival-primary)"/>
      <!-- 装饰纹路 -->
      <g stroke="var(--festival-primary)" stroke-width="1" fill="none">
        <circle cx="50" cy="50" r="25"/>
        <circle cx="50" cy="50" r="15"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-accent)',
  stroke: 'var(--festival-primary)',
  strokeWidth: 3,
}

/**
 * 春节主题图标集合
 */
export const springFestivalIcons = {
  lantern: lanternIcon,
  fu: fuIcon,
  firework: fireworkIcon,
  plumBlossom: plumBlossomIcon,
  dragon: dragonIcon,
  goldCoin: goldCoinIcon,
} as const

/**
 * 获取春节主题图标
 */
export function getSpringFestivalIcon(
  name: keyof typeof springFestivalIcons
): SVGIcon {
  return springFestivalIcons[name]
}

/**
 * 获取所有春节主题图标名称
 */
export function getSpringFestivalIconNames(): (keyof typeof springFestivalIcons)[] {
  return Object.keys(
    springFestivalIcons
  ) as (keyof typeof springFestivalIcons)[]
}
