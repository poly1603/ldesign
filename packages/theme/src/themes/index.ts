/**
 * @file 节日主题配置
 * @description 导出所有预定义的节日主题配置
 */

// 导入所有主题
import { springFestivalTheme } from './spring-festival'
import { christmasTheme } from './christmas'
import { halloweenTheme } from './halloween'
import { valentinesDayTheme } from './valentines-day'
import { midAutumnTheme } from './mid-autumn'
import { defaultTheme } from './default'

// 重新导出主题
export { springFestivalTheme, christmasTheme, halloweenTheme, valentinesDayTheme, midAutumnTheme, defaultTheme }

// 导出主题创建工具
export { createFestivalTheme } from './base/theme-factory'

// 导出所有主题的数组
export const allThemes = [
  defaultTheme,
  springFestivalTheme,
  christmasTheme,
  halloweenTheme,
  valentinesDayTheme,
  midAutumnTheme
]

// 按节日类型分组的主题
export const themesByFestival = {
  'spring-festival': springFestivalTheme,
  'christmas': christmasTheme,
  'halloween': halloweenTheme,
  'valentines-day': valentinesDayTheme,
  'mid-autumn': midAutumnTheme,
  'default': defaultTheme
} as const
