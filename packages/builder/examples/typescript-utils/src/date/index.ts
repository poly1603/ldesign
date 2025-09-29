/**
 * 日期工具模块
 * 导出所有日期相关的工具函数
 */

// 导入所有函数
import {
  formatDate,
  getRelativeTime,
  isToday,
  isYesterday,
  isThisWeek,
  getDaysInMonth,
  isLeapYear,
  getDateRange,
  addDays,
  addMonths
} from './format'

// 重新导出所有函数
export {
  formatDate,
  getRelativeTime,
  isToday,
  isYesterday,
  isThisWeek,
  getDaysInMonth,
  isLeapYear,
  getDateRange,
  addDays,
  addMonths
}

/**
 * 日期工具类型定义
 */
export interface DateUtils {
  /** 格式化工具 */
  format: {
    formatDate: typeof formatDate
    getRelativeTime: typeof getRelativeTime
  }
  /** 判断工具 */
  check: {
    isToday: typeof isToday
    isYesterday: typeof isYesterday
    isThisWeek: typeof isThisWeek
    isLeapYear: typeof isLeapYear
  }
  /** 计算工具 */
  calculate: {
    getDaysInMonth: typeof getDaysInMonth
    getDateRange: typeof getDateRange
    addDays: typeof addDays
    addMonths: typeof addMonths
  }
}

/**
 * 常用日期格式常量
 */
export const DATE_FORMATS = {
  /** 标准日期格式 YYYY-MM-DD */
  DATE: 'YYYY-MM-DD',
  /** 标准时间格式 HH:mm:ss */
  TIME: 'HH:mm:ss',
  /** 标准日期时间格式 YYYY-MM-DD HH:mm:ss */
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  /** 中文日期格式 YYYY年MM月DD日 */
  DATE_CN: 'YYYY年MM月DD日',
  /** 中文日期时间格式 YYYY年MM月DD日 HH:mm:ss */
  DATETIME_CN: 'YYYY年MM月DD日 HH:mm:ss',
  /** 短日期格式 MM/DD */
  SHORT_DATE: 'MM/DD',
  /** 月份格式 YYYY-MM */
  MONTH: 'YYYY-MM',
  /** 年份格式 YYYY */
  YEAR: 'YYYY'
} as const

/**
 * 星期常量
 */
export const WEEKDAYS = {
  /** 中文星期 */
  CN: ['日', '一', '二', '三', '四', '五', '六'],
  /** 英文星期缩写 */
  EN_SHORT: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  /** 英文星期全称 */
  EN_FULL: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
} as const

/**
 * 月份常量
 */
export const MONTHS = {
  /** 中文月份 */
  CN: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
  /** 英文月份缩写 */
  EN_SHORT: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  /** 英文月份全称 */
  EN_FULL: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
} as const
