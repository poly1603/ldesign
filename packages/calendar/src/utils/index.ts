/**
 * 工具函数入口文件
 * 
 * 导出所有工具函数和类
 */

// 日期工具
export * from './date-utils'

// 国际化工具
export * from './i18n'

// 农历工具
export * from './lunar'

// 节假日工具
export * from './holidays'

// DOM工具
export * from './dom'

// 性能工具
export * from './performance'

// 验证工具
export * from './validation'

// 格式化工具
export * from './format'

/**
 * 工具函数集合
 */
export const Utils = {
  // 日期相关
  date: {
    format: require('./date-utils').formatDate,
    parse: require('./date-utils').parseDate,
    isValid: require('./date-utils').isValidDate,
    addDays: require('./date-utils').addDays,
    addWeeks: require('./date-utils').addWeeks,
    addMonths: require('./date-utils').addMonths,
    addYears: require('./date-utils').addYears,
    startOfDay: require('./date-utils').startOfDay,
    endOfDay: require('./date-utils').endOfDay,
    startOfWeek: require('./date-utils').startOfWeek,
    endOfWeek: require('./date-utils').endOfWeek,
    startOfMonth: require('./date-utils').startOfMonth,
    endOfMonth: require('./date-utils').endOfMonth,
    isSameDay: require('./date-utils').isSameDay,
    isSameWeek: require('./date-utils').isSameWeek,
    isSameMonth: require('./date-utils').isSameMonth,
    isToday: require('./date-utils').isToday,
    isWeekend: require('./date-utils').isWeekend,
    getDaysInMonth: require('./date-utils').getDaysInMonth,
    getWeekNumber: require('./date-utils').getWeekNumber,
  },

  // 格式化相关
  format: {
    date: require('./format').formatDate,
    time: require('./format').formatTime,
    relative: require('./format').formatRelative,
    duration: require('./format').formatDuration,
    number: require('./format').formatNumber,
    currency: require('./format').formatCurrency,
    percent: require('./format').formatPercent,
    fileSize: require('./format').formatFileSize,
    truncate: require('./format').truncate,
    capitalize: require('./format').capitalize,
    titleCase: require('./format').titleCase,
  },

  // 验证相关
  validate: {
    date: require('./validation').isValidDate,
    event: require('./validation').isValidEvent,
    conflicts: require('./validation').checkConflicts,
  },

  // DOM相关
  dom: {
    createElement: require('./dom').createElement,
    addClass: require('./dom').addClass,
    removeClass: require('./dom').removeClass,
    toggleClass: require('./dom').toggleClass,
    hasClass: require('./dom').hasClass,
    setStyles: require('./dom').setStyles,
    addEventListener: require('./dom').addEventListener,
    removeEventListener: require('./dom').removeEventListener,
    debounce: require('./dom').debounce,
    throttle: require('./dom').throttle,
  },

  // 性能相关
  performance: {
    timer: require('./performance').performanceTimer,
    cache: require('./performance').cacheManager,
    nextFrame: require('./performance').nextFrame,
    batchDOMUpdates: require('./performance').batchDOMUpdates,
    debounceEvent: require('./performance').debounceEvent,
    throttleEvent: require('./performance').throttleEvent,
  },

  // 国际化相关
  i18n: {
    t: require('./i18n').t,
    setLanguage: require('./i18n').i18n.setLanguage.bind(require('./i18n').i18n),
    getCurrentLanguage: require('./i18n').i18n.getCurrentLanguage.bind(require('./i18n').i18n),
    getAvailableLanguages: require('./i18n').i18n.getAvailableLanguages.bind(require('./i18n').i18n),
    getDateFormat: require('./i18n').i18n.getDateFormat.bind(require('./i18n').i18n),
    getTimeFormat: require('./i18n').i18n.getTimeFormat.bind(require('./i18n').i18n),
    getWeekdays: require('./i18n').i18n.getWeekdays.bind(require('./i18n').i18n),
    getMonths: require('./i18n').i18n.getMonths.bind(require('./i18n').i18n),
  },

  // 农历相关
  lunar: {
    getLunarDate: require('./lunar').getLunarDate,
    getLunarFestival: require('./lunar').getLunarFestival,
    getSolarTerm: require('./lunar').getSolarTerm,
    isLunarFestival: require('./lunar').isLunarFestival,
    formatLunarDate: require('./lunar').formatLunarDate,
  },

  // 节假日相关
  holidays: {
    isHoliday: require('./holidays').isHoliday,
    getHolidayName: require('./holidays').getHolidayName,
    getHolidays: require('./holidays').getHolidays,
    isWorkday: require('./holidays').isWorkday,
    getHolidayType: require('./holidays').getHolidayType,
  },
}

/**
 * 常用工具函数快捷方式
 */
export const {
  // 日期工具
  formatDate,
  parseDate,
  isValidDate,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isToday,
  isWeekend,
  getDaysInMonth,
  getWeekNumber,
} = require('./date-utils')

export const {
  // 格式化工具
  formatTime,
  formatRelative,
  formatDuration,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatFileSize,
  truncate,
  capitalize,
  titleCase,
} = require('./format')

export const {
  // 验证工具
  isValidEvent,
  checkConflicts,
} = require('./validation')

export const {
  // DOM工具
  createElement,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setStyles,
  addEventListener,
  removeEventListener,
  debounce,
  throttle,
} = require('./dom')

export const {
  // 性能工具
  performanceTimer,
  cacheManager,
  nextFrame,
  batchDOMUpdates,
  debounceEvent,
  throttleEvent,
} = require('./performance')

export const {
  // 国际化工具
  t,
  i18n,
} = require('./i18n')

export const {
  // 农历工具
  getLunarDate,
  getLunarFestival,
  getSolarTerm,
  isLunarFestival,
  formatLunarDate,
} = require('./lunar')

export const {
  // 节假日工具
  isHoliday,
  getHolidayName,
  getHolidays,
  isWorkday,
  getHolidayType,
} = require('./holidays')

/**
 * 工具函数版本信息
 */
export const UTILS_VERSION = '1.0.0'

/**
 * 工具函数列表
 */
export const AVAILABLE_UTILS = [
  'date-utils',
  'i18n',
  'lunar',
  'holidays',
  'dom',
  'performance',
  'validation',
  'format',
] as const

/**
 * 检查工具函数是否可用
 * @param utilName 工具函数名称
 */
export function isUtilAvailable(utilName: string): boolean {
  return AVAILABLE_UTILS.includes(utilName as any)
}

/**
 * 获取工具函数信息
 */
export function getUtilsInfo() {
  return {
    version: UTILS_VERSION,
    available: AVAILABLE_UTILS,
    count: AVAILABLE_UTILS.length,
  }
}
