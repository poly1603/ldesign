/**
 * 国际化工具函数
 * 
 * 提供多语言支持：
 * - 语言包管理
 * - 文本翻译
 * - 日期本地化
 * - 数字格式化
 * - 复数处理
 */

/**
 * 语言包接口
 */
export interface LanguagePack {
  /** 语言代码 */
  code: string
  /** 语言名称 */
  name: string
  /** 翻译文本 */
  translations: Record<string, string | Record<string, string>>
  /** 日期格式 */
  dateFormats: {
    short: string
    medium: string
    long: string
    full: string
  }
  /** 时间格式 */
  timeFormats: {
    short: string
    medium: string
    long: string
  }
  /** 星期名称 */
  weekdays: {
    long: string[]
    short: string[]
    min: string[]
  }
  /** 月份名称 */
  months: {
    long: string[]
    short: string[]
  }
  /** 相对时间 */
  relativeTime: {
    future: string
    past: string
    s: string
    m: string
    mm: string
    h: string
    hh: string
    d: string
    dd: string
    M: string
    MM: string
    y: string
    yy: string
  }
}

/**
 * 中文语言包
 */
export const zhCN: LanguagePack = {
  code: 'zh-CN',
  name: '简体中文',
  translations: {
    // 通用
    ok: '确定',
    cancel: '取消',
    confirm: '确认',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    close: '关闭',
    loading: '加载中...',
    
    // 日历相关
    calendar: '日历',
    today: '今天',
    yesterday: '昨天',
    tomorrow: '明天',
    thisWeek: '本周',
    thisMonth: '本月',
    thisYear: '今年',
    
    // 视图
    monthView: '月视图',
    weekView: '周视图',
    dayView: '日视图',
    agendaView: '议程视图',
    
    // 事件
    event: '事件',
    events: '事件',
    newEvent: '新建事件',
    editEvent: '编辑事件',
    deleteEvent: '删除事件',
    eventTitle: '事件标题',
    eventDescription: '事件描述',
    eventLocation: '事件地点',
    startTime: '开始时间',
    endTime: '结束时间',
    allDay: '全天',
    repeat: '重复',
    reminder: '提醒',
    
    // 重复选项
    repeatOptions: {
      none: '不重复',
      daily: '每天',
      weekly: '每周',
      monthly: '每月',
      yearly: '每年',
      custom: '自定义',
    },
    
    // 提醒选项
    reminderOptions: {
      none: '无提醒',
      atTime: '准时',
      before5min: '5分钟前',
      before15min: '15分钟前',
      before30min: '30分钟前',
      before1hour: '1小时前',
      before1day: '1天前',
    },
    
    // 错误信息
    errors: {
      required: '此字段为必填项',
      invalidDate: '无效的日期',
      invalidTime: '无效的时间',
      startAfterEnd: '开始时间不能晚于结束时间',
      eventConflict: '事件时间冲突',
      loadFailed: '加载失败',
      saveFailed: '保存失败',
      deleteFailed: '删除失败',
    },
  },
  
  dateFormats: {
    short: 'YYYY/M/D',
    medium: 'YYYY年M月D日',
    long: 'YYYY年M月D日 dddd',
    full: 'YYYY年M月D日 dddd HH:mm',
  },
  
  timeFormats: {
    short: 'HH:mm',
    medium: 'HH:mm:ss',
    long: 'HH:mm:ss',
  },
  
  weekdays: {
    long: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    short: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    min: ['日', '一', '二', '三', '四', '五', '六'],
  },
  
  months: {
    long: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    short: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  },
  
  relativeTime: {
    future: '%s后',
    past: '%s前',
    s: '几秒',
    m: '1分钟',
    mm: '%d分钟',
    h: '1小时',
    hh: '%d小时',
    d: '1天',
    dd: '%d天',
    M: '1个月',
    MM: '%d个月',
    y: '1年',
    yy: '%d年',
  },
}

/**
 * 英文语言包
 */
export const enUS: LanguagePack = {
  code: 'en-US',
  name: 'English',
  translations: {
    // Common
    ok: 'OK',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    save: 'Save',
    close: 'Close',
    loading: 'Loading...',
    
    // Calendar
    calendar: 'Calendar',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    thisYear: 'This Year',
    
    // Views
    monthView: 'Month View',
    weekView: 'Week View',
    dayView: 'Day View',
    agendaView: 'Agenda View',
    
    // Events
    event: 'Event',
    events: 'Events',
    newEvent: 'New Event',
    editEvent: 'Edit Event',
    deleteEvent: 'Delete Event',
    eventTitle: 'Event Title',
    eventDescription: 'Event Description',
    eventLocation: 'Event Location',
    startTime: 'Start Time',
    endTime: 'End Time',
    allDay: 'All Day',
    repeat: 'Repeat',
    reminder: 'Reminder',
    
    // Repeat options
    repeatOptions: {
      none: 'No Repeat',
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
      custom: 'Custom',
    },
    
    // Reminder options
    reminderOptions: {
      none: 'No Reminder',
      atTime: 'At Time',
      before5min: '5 minutes before',
      before15min: '15 minutes before',
      before30min: '30 minutes before',
      before1hour: '1 hour before',
      before1day: '1 day before',
    },
    
    // Error messages
    errors: {
      required: 'This field is required',
      invalidDate: 'Invalid date',
      invalidTime: 'Invalid time',
      startAfterEnd: 'Start time cannot be after end time',
      eventConflict: 'Event time conflict',
      loadFailed: 'Load failed',
      saveFailed: 'Save failed',
      deleteFailed: 'Delete failed',
    },
  },
  
  dateFormats: {
    short: 'M/D/YYYY',
    medium: 'MMM D, YYYY',
    long: 'MMMM D, YYYY dddd',
    full: 'MMMM D, YYYY dddd HH:mm',
  },
  
  timeFormats: {
    short: 'h:mm A',
    medium: 'h:mm:ss A',
    long: 'h:mm:ss A',
  },
  
  weekdays: {
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    min: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  },
  
  months: {
    long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: 'a minute',
    mm: '%d minutes',
    h: 'an hour',
    hh: '%d hours',
    d: 'a day',
    dd: '%d days',
    M: 'a month',
    MM: '%d months',
    y: 'a year',
    yy: '%d years',
  },
}

/**
 * 国际化管理器
 */
export class I18nManager {
  /** 当前语言 */
  private currentLanguage: string = 'zh-CN'
  
  /** 语言包存储 */
  private languagePacks: Map<string, LanguagePack> = new Map()
  
  /** 回退语言 */
  private fallbackLanguage: string = 'en-US'

  constructor() {
    // 注册默认语言包
    this.register(zhCN)
    this.register(enUS)
  }

  /**
   * 注册语言包
   * @param languagePack 语言包
   */
  register(languagePack: LanguagePack): void {
    this.languagePacks.set(languagePack.code, languagePack)
  }

  /**
   * 设置当前语言
   * @param language 语言代码
   */
  setLanguage(language: string): void {
    if (this.languagePacks.has(language)) {
      this.currentLanguage = language
    } else {
      console.warn(`Language pack for ${language} not found`)
    }
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): string {
    return this.currentLanguage
  }

  /**
   * 获取可用语言列表
   */
  getAvailableLanguages(): LanguagePack[] {
    return Array.from(this.languagePacks.values())
  }

  /**
   * 翻译文本
   * @param key 翻译键
   * @param params 参数
   */
  t(key: string, params?: Record<string, any>): string {
    const languagePack = this.languagePacks.get(this.currentLanguage) || 
                        this.languagePacks.get(this.fallbackLanguage)
    
    if (!languagePack) {
      return key
    }

    // 支持嵌套键，如 'errors.required'
    const keys = key.split('.')
    let value: any = languagePack.translations
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // 如果找不到翻译，返回原键
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // 参数替换
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? String(params[paramKey]) : match
      })
    }

    return value
  }

  /**
   * 获取日期格式
   * @param type 格式类型
   */
  getDateFormat(type: keyof LanguagePack['dateFormats'] = 'medium'): string {
    const languagePack = this.languagePacks.get(this.currentLanguage) || 
                        this.languagePacks.get(this.fallbackLanguage)
    
    return languagePack?.dateFormats[type] || 'YYYY-MM-DD'
  }

  /**
   * 获取时间格式
   * @param type 格式类型
   */
  getTimeFormat(type: keyof LanguagePack['timeFormats'] = 'short'): string {
    const languagePack = this.languagePacks.get(this.currentLanguage) || 
                        this.languagePacks.get(this.fallbackLanguage)
    
    return languagePack?.timeFormats[type] || 'HH:mm'
  }

  /**
   * 获取星期名称
   * @param type 名称类型
   */
  getWeekdays(type: keyof LanguagePack['weekdays'] = 'long'): string[] {
    const languagePack = this.languagePacks.get(this.currentLanguage) || 
                        this.languagePacks.get(this.fallbackLanguage)
    
    return languagePack?.weekdays[type] || enUS.weekdays[type]
  }

  /**
   * 获取月份名称
   * @param type 名称类型
   */
  getMonths(type: keyof LanguagePack['months'] = 'long'): string[] {
    const languagePack = this.languagePacks.get(this.currentLanguage) || 
                        this.languagePacks.get(this.fallbackLanguage)
    
    return languagePack?.months[type] || enUS.months[type]
  }

  /**
   * 格式化相对时间
   * @param key 时间键
   * @param value 数值
   */
  formatRelativeTime(key: keyof LanguagePack['relativeTime'], value?: number): string {
    const languagePack = this.languagePacks.get(this.currentLanguage) || 
                        this.languagePacks.get(this.fallbackLanguage)
    
    if (!languagePack) {
      return key
    }

    const template = languagePack.relativeTime[key]
    
    if (value !== undefined && template.includes('%d')) {
      return template.replace('%d', String(value))
    }
    
    return template.replace('%s', String(value || ''))
  }
}

// 创建全局实例
export const i18n = new I18nManager()

// 导出便捷函数
export const t = (key: string, params?: Record<string, any>) => i18n.t(key, params)
