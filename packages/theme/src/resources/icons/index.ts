/**
 * @ldesign/theme - SVG 图标库统一导出
 *
 * 统一管理所有主题的 SVG 图标资源
 */

// 导出类型定义
export type { SVGIcon } from '../../widgets/element-decorations'

// 导出默认主题图标
export {
  defaultIcons,
  getDefaultIcon,
  getDefaultIconNames,
  sparkleIcon,
  decorativeLineIcon,
  geometricIcon,
  simpleStarIcon,
  waveIcon,
  dotPatternIcon,
} from './default'

// 导出春节主题图标
export {
  springFestivalIcons,
  getSpringFestivalIcon,
  getSpringFestivalIconNames,
  lanternIcon,
  fuIcon,
  fireworkIcon,
  plumBlossomIcon,
  dragonIcon,
  goldCoinIcon,
} from './spring-festival'

// 导出圣诞主题图标
export {
  christmasIcons,
  getChristmasIcon,
  getChristmasIconNames,
  christmasTreeIcon,
  bellIcon,
  snowflakeIcon,
  giftBoxIcon,
  starIcon,
  santaIcon,
} from './christmas'

/**
 * 所有主题图标的统一映射
 */
export const allThemeIcons = {
  default: () => import('./default').then(m => m.defaultIcons),
  'spring-festival': () =>
    import('./spring-festival').then(m => m.springFestivalIcons),
  christmas: () => import('./christmas').then(m => m.christmasIcons),
} as const

/**
 * 支持的主题名称
 */
export type SupportedTheme = keyof typeof allThemeIcons

/**
 * 动态获取主题图标
 */
export async function getThemeIcons(theme: SupportedTheme) {
  const iconLoader = allThemeIcons[theme]
  if (!iconLoader) {
    throw new Error(`Unsupported theme: ${theme}`)
  }
  return await iconLoader()
}

/**
 * 获取所有支持的主题名称
 */
export function getSupportedThemes(): SupportedTheme[] {
  return Object.keys(allThemeIcons) as SupportedTheme[]
}

/**
 * 检查主题是否受支持
 */
export function isSupportedTheme(theme: string): theme is SupportedTheme {
  return theme in allThemeIcons
}

/**
 * 图标缓存
 */
const iconCache = new Map<SupportedTheme, any>()

/**
 * 获取缓存的主题图标（带缓存）
 */
export async function getCachedThemeIcons(theme: SupportedTheme) {
  if (iconCache.has(theme)) {
    return iconCache.get(theme)
  }

  const icons = await getThemeIcons(theme)
  iconCache.set(theme, icons)
  return icons
}

/**
 * 清除图标缓存
 */
export function clearIconCache(theme?: SupportedTheme) {
  if (theme) {
    iconCache.delete(theme)
  } else {
    iconCache.clear()
  }
}

/**
 * 预加载主题图标
 */
export async function preloadThemeIcons(
  themes: SupportedTheme[] = getSupportedThemes()
) {
  const promises = themes.map(theme => getCachedThemeIcons(theme))
  await Promise.all(promises)
}
