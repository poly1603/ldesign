/**
 * @ldesign/theme - 圣诞主题 SVG 图标库
 *
 * 包含圣诞主题的所有 SVG 装饰图标
 */

import type { SVGIcon } from '../../widgets/element-decorations'

/**
 * 圣诞树图标
 */
export const christmasTreeIcon: SVGIcon = {
  content: `
    <g>
      <!-- 树冠第一层 -->
      <polygon points="50,15 35,35 65,35" fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="1"/>
      <!-- 树冠第二层 -->
      <polygon points="50,25 30,45 70,45" fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="1"/>
      <!-- 树冠第三层 -->
      <polygon points="50,35 25,55 75,55" fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="1"/>
      <!-- 树干 -->
      <rect x="47" y="55" width="6" height="15" fill="var(--festival-accent)"/>
      <!-- 星星装饰 -->
      <g transform="translate(50, 15)" fill="var(--festival-accent)">
        <polygon points="0,-8 2,-2 8,-2 3,1 5,7 0,4 -5,7 -3,1 -8,-2 -2,-2"/>
      </g>
      <!-- 装饰球 -->
      <g fill="var(--festival-accent)">
        <circle cx="42" cy="30" r="2"/>
        <circle cx="58" cy="30" r="2"/>
        <circle cx="38" cy="40" r="2"/>
        <circle cx="62" cy="40" r="2"/>
        <circle cx="35" cy="50" r="2"/>
        <circle cx="65" cy="50" r="2"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-accent)',
  strokeWidth: 1,
}

/**
 * 圣诞铃铛图标
 */
export const bellIcon: SVGIcon = {
  content: `
    <g>
      <!-- 铃铛主体 -->
      <path d="M50 20 Q35 25 35 45 Q35 55 50 60 Q65 55 65 45 Q65 25 50 20" 
            fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="2"/>
      <!-- 铃铛顶部 -->
      <rect x="48" y="15" width="4" height="8" rx="2" fill="var(--festival-accent)"/>
      <!-- 铃铛开口 -->
      <ellipse cx="50" cy="60" rx="15" ry="3" fill="var(--festival-accent)"/>
      <!-- 铃铛内部 -->
      <circle cx="50" cy="50" r="3" fill="var(--festival-accent)"/>
      <!-- 装饰线条 -->
      <g stroke="var(--festival-accent)" stroke-width="1" fill="none">
        <path d="M40 35 Q50 30 60 35"/>
        <path d="M38 45 Q50 40 62 45"/>
      </g>
      <!-- 悬挂环 -->
      <circle cx="50" cy="12" r="3" fill="none" stroke="var(--festival-accent)" stroke-width="2"/>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-accent)',
  strokeWidth: 2,
}

/**
 * 雪花图标
 */
export const snowflakeIcon: SVGIcon = {
  content: `
    <g stroke="var(--festival-primary)" stroke-width="2" fill="none">
      <!-- 主要轴线 -->
      <line x1="50" y1="15" x2="50" y2="85"/>
      <line x1="15" y1="50" x2="85" y2="50"/>
      <line x1="25" y1="25" x2="75" y2="75"/>
      <line x1="75" y1="25" x2="25" y2="75"/>
      <!-- 分支 -->
      <g stroke-width="1">
        <!-- 垂直分支 -->
        <line x1="45" y1="20" x2="50" y2="15"/>
        <line x1="55" y1="20" x2="50" y2="15"/>
        <line x1="45" y1="80" x2="50" y2="85"/>
        <line x1="55" y1="80" x2="50" y2="85"/>
        <!-- 水平分支 -->
        <line x1="20" y1="45" x2="15" y2="50"/>
        <line x1="20" y1="55" x2="15" y2="50"/>
        <line x1="80" y1="45" x2="85" y2="50"/>
        <line x1="80" y1="55" x2="85" y2="50"/>
        <!-- 对角分支 -->
        <line x1="30" y1="20" x2="25" y2="25"/>
        <line x1="20" y1="30" x2="25" y2="25"/>
        <line x1="70" y1="80" x2="75" y2="75"/>
        <line x1="80" y1="70" x2="75" y2="75"/>
        <line x1="70" y1="20" x2="75" y2="25"/>
        <line x1="80" y1="30" x2="75" y2="25"/>
        <line x1="30" y1="80" x2="25" y2="75"/>
        <line x1="20" y1="70" x2="25" y2="75"/>
      </g>
      <!-- 中心装饰 -->
      <circle cx="50" cy="50" r="4" fill="var(--festival-primary)"/>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'none',
  stroke: 'var(--festival-primary)',
  strokeWidth: 2,
}

/**
 * 礼物盒图标
 */
export const giftBoxIcon: SVGIcon = {
  content: `
    <g>
      <!-- 盒子主体 -->
      <rect x="25" y="40" width="50" height="40" fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="2"/>
      <!-- 盒子盖子 -->
      <rect x="20" y="35" width="60" height="10" fill="var(--festival-accent)" stroke="var(--festival-accent)" stroke-width="2"/>
      <!-- 垂直丝带 -->
      <rect x="47" y="20" width="6" height="60" fill="var(--festival-accent)"/>
      <!-- 水平丝带 -->
      <rect x="20" y="37" width="60" height="6" fill="var(--festival-accent)"/>
      <!-- 蝴蝶结 -->
      <g transform="translate(50, 25)">
        <!-- 左翼 -->
        <ellipse cx="-8" cy="0" rx="6" ry="4" fill="var(--festival-accent)"/>
        <!-- 右翼 -->
        <ellipse cx="8" cy="0" rx="6" ry="4" fill="var(--festival-accent)"/>
        <!-- 中心结 -->
        <ellipse cx="0" cy="0" rx="3" ry="5" fill="var(--festival-primary)"/>
      </g>
      <!-- 装饰点 -->
      <g fill="var(--festival-accent)">
        <circle cx="35" cy="55" r="2"/>
        <circle cx="65" cy="55" r="2"/>
        <circle cx="35" cy="70" r="2"/>
        <circle cx="65" cy="70" r="2"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-accent)',
  strokeWidth: 2,
}

/**
 * 星星图标
 */
export const starIcon: SVGIcon = {
  content: `
    <g>
      <!-- 主星星 -->
      <polygon points="50,15 55,35 75,35 60,48 65,68 50,55 35,68 40,48 25,35 45,35" 
               fill="var(--festival-primary)" stroke="var(--festival-accent)" stroke-width="1"/>
      <!-- 内部装饰 -->
      <polygon points="50,25 52,35 58,35 54,40 56,48 50,44 44,48 46,40 42,35 48,35" 
               fill="var(--festival-accent)"/>
      <!-- 光芒 -->
      <g stroke="var(--festival-accent)" stroke-width="1" fill="none">
        <line x1="50" y1="10" x2="50" y2="5"/>
        <line x1="50" y1="75" x2="50" y2="80"/>
        <line x1="20" y1="35" x2="15" y2="35"/>
        <line x1="80" y1="35" x2="85" y2="35"/>
        <line x1="30" y1="20" x2="27" y2="17"/>
        <line x1="70" y1="20" x2="73" y2="17"/>
        <line x1="30" y1="65" x2="27" y2="68"/>
        <line x1="70" y1="65" x2="73" y2="68"/>
      </g>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-accent)',
  strokeWidth: 1,
}

/**
 * 圣诞老人图标（简化版）
 */
export const santaIcon: SVGIcon = {
  content: `
    <g>
      <!-- 脸部 -->
      <circle cx="50" cy="45" r="18" fill="var(--festival-accent)"/>
      <!-- 帽子 -->
      <path d="M32 35 Q50 15 68 35 Q70 25 65 20 Q50 10 35 20 Q30 25 32 35" 
            fill="var(--festival-primary)"/>
      <!-- 帽子边缘 -->
      <ellipse cx="50" cy="35" rx="18" ry="3" fill="white"/>
      <!-- 帽子球 -->
      <circle cx="65" cy="20" r="4" fill="white"/>
      <!-- 眼睛 -->
      <circle cx="45" cy="42" r="2" fill="black"/>
      <circle cx="55" cy="42" r="2" fill="black"/>
      <!-- 鼻子 -->
      <circle cx="50" cy="47" r="1.5" fill="var(--festival-primary)"/>
      <!-- 胡子 -->
      <ellipse cx="50" cy="55" rx="12" ry="8" fill="white"/>
      <!-- 嘴巴 -->
      <path d="M47 50 Q50 53 53 50" stroke="black" stroke-width="1" fill="none"/>
      <!-- 身体 -->
      <rect x="40" y="63" width="20" height="25" fill="var(--festival-primary)"/>
      <!-- 腰带 -->
      <rect x="38" y="70" width="24" height="4" fill="black"/>
      <rect x="48" y="68" width="4" height="8" fill="var(--festival-accent)"/>
    </g>
  `,
  viewBox: '0 0 100 100',
  fill: 'var(--festival-primary)',
  stroke: 'var(--festival-accent)',
  strokeWidth: 1,
}

/**
 * 圣诞主题图标集合
 */
export const christmasIcons = {
  christmasTree: christmasTreeIcon,
  bell: bellIcon,
  snowflake: snowflakeIcon,
  giftBox: giftBoxIcon,
  star: starIcon,
  santa: santaIcon,
} as const

/**
 * 获取圣诞主题图标
 */
export function getChristmasIcon(name: keyof typeof christmasIcons): SVGIcon {
  return christmasIcons[name]
}

/**
 * 获取所有圣诞主题图标名称
 */
export function getChristmasIconNames(): (keyof typeof christmasIcons)[] {
  return Object.keys(christmasIcons) as (keyof typeof christmasIcons)[]
}
