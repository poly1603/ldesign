/**
 * 国际化工具类
 */

import type { LocaleType } from '../types'

/**
 * 语言包接口
 */
export interface LocaleMessages {
  // 通用
  today: string
  clear: string
  confirm: string
  cancel: string
  ok: string
  
  // 视图
  view: {
    month: string
    week: string
    day: string
    year: string
  }
  
  // 导航
  navigation: {
    prev: string
    next: string
    prevMonth: string
    nextMonth: string
    prevYear: string
    nextYear: string
    goToToday: string
  }
  
  // 日期
  date: {
    year: string
    month: string
    day: string
    hour: string
    minute: string
    second: string
  }
  
  // 星期
  weekdays: {
    long: string[]
    short: string[]
    narrow: string[]
  }
  
  // 月份
  months: {
    long: string[]
    short: string[]
    narrow: string[]
  }
  
  // 事件
  event: {
    title: string
    description: string
    startTime: string
    endTime: string
    allDay: string
    repeat: string
    reminder: string
    category: string
    priority: string
    status: string
    create: string
    edit: string
    delete: string
    save: string
    details: string
  }
  
  // 重复
  repeat: {
    none: string
    daily: string
    weekly: string
    monthly: string
    yearly: string
    custom: string
    every: string
    until: string
    times: string
  }
  
  // 优先级
  priority: {
    low: string
    medium: string
    high: string
  }
  
  // 状态
  status: {
    confirmed: string
    tentative: string
    cancelled: string
  }
  
  // 提醒
  reminder: {
    popup: string
    email: string
    sms: string
    notification: string
    minutes: string
    hours: string
    days: string
    weeks: string
  }
  
  // 农历
  lunar: {
    year: string
    month: string
    day: string
    leap: string
    zodiac: string[]
    terms: string[]
    festivals: Record<string, string>
  }
  
  // 节假日
  holidays: Record<string, string>
  
  // 错误信息
  errors: {
    invalidDate: string
    invalidEvent: string
    eventNotFound: string
    dateOutOfRange: string
    conflictingEvents: string
  }
  
  // 格式化
  formats: {
    date: string
    dateShort: string
    dateTime: string
    dateTimeShort: string
    time: string
    timeShort: string
    month: string
    year: string
  }
}

/**
 * 中文语言包
 */
const zhCN: LocaleMessages = {
  today: '今天',
  clear: '清除',
  confirm: '确认',
  cancel: '取消',
  ok: '确定',
  
  view: {
    month: '月视图',
    week: '周视图',
    day: '日视图',
    year: '年视图'
  },
  
  navigation: {
    prev: '上一个',
    next: '下一个',
    prevMonth: '上个月',
    nextMonth: '下个月',
    prevYear: '上一年',
    nextYear: '下一年',
    goToToday: '回到今天'
  },
  
  date: {
    year: '年',
    month: '月',
    day: '日',
    hour: '时',
    minute: '分',
    second: '秒'
  },
  
  weekdays: {
    long: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
    short: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    narrow: ['日', '一', '二', '三', '四', '五', '六']
  },
  
  months: {
    long: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    short: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    narrow: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']
  },
  
  event: {
    title: '标题',
    description: '描述',
    startTime: '开始时间',
    endTime: '结束时间',
    allDay: '全天',
    repeat: '重复',
    reminder: '提醒',
    category: '分类',
    priority: '优先级',
    status: '状态',
    create: '创建事件',
    edit: '编辑事件',
    delete: '删除事件',
    save: '保存',
    details: '详情'
  },
  
  repeat: {
    none: '不重复',
    daily: '每天',
    weekly: '每周',
    monthly: '每月',
    yearly: '每年',
    custom: '自定义',
    every: '每',
    until: '直到',
    times: '次'
  },
  
  priority: {
    low: '低',
    medium: '中',
    high: '高'
  },
  
  status: {
    confirmed: '已确认',
    tentative: '待定',
    cancelled: '已取消'
  },
  
  reminder: {
    popup: '弹窗提醒',
    email: '邮件提醒',
    sms: '短信提醒',
    notification: '通知提醒',
    minutes: '分钟',
    hours: '小时',
    days: '天',
    weeks: '周'
  },
  
  lunar: {
    year: '农历年',
    month: '农历月',
    day: '农历日',
    leap: '闰',
    zodiac: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],
    terms: [
      '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
      '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
      '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
      '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
    ],
    festivals: {
      '0101': '春节',
      '0115': '元宵节',
      '0505': '端午节',
      '0707': '七夕节',
      '0715': '中元节',
      '0815': '中秋节',
      '0909': '重阳节',
      '1208': '腊八节',
      '1223': '小年',
      '1230': '除夕'
    }
  },
  
  holidays: {
    '0101': '元旦',
    '0214': '情人节',
    '0308': '妇女节',
    '0312': '植树节',
    '0401': '愚人节',
    '0501': '劳动节',
    '0504': '青年节',
    '0512': '护士节',
    '0601': '儿童节',
    '0701': '建党节',
    '0801': '建军节',
    '0910': '教师节',
    '1001': '国庆节',
    '1224': '平安夜',
    '1225': '圣诞节'
  },
  
  errors: {
    invalidDate: '无效的日期',
    invalidEvent: '无效的事件',
    eventNotFound: '事件未找到',
    dateOutOfRange: '日期超出范围',
    conflictingEvents: '事件时间冲突'
  },
  
  formats: {
    date: 'YYYY年MM月DD日',
    dateShort: 'YYYY-MM-DD',
    dateTime: 'YYYY年MM月DD日 HH:mm:ss',
    dateTimeShort: 'YYYY-MM-DD HH:mm',
    time: 'HH:mm:ss',
    timeShort: 'HH:mm',
    month: 'YYYY年MM月',
    year: 'YYYY年'
  }
}

/**
 * 英文语言包
 */
const enUS: LocaleMessages = {
  today: 'Today',
  clear: 'Clear',
  confirm: 'Confirm',
  cancel: 'Cancel',
  ok: 'OK',
  
  view: {
    month: 'Month',
    week: 'Week',
    day: 'Day',
    year: 'Year'
  },
  
  navigation: {
    prev: 'Previous',
    next: 'Next',
    prevMonth: 'Previous Month',
    nextMonth: 'Next Month',
    prevYear: 'Previous Year',
    nextYear: 'Next Year',
    goToToday: 'Go to Today'
  },
  
  date: {
    year: 'Year',
    month: 'Month',
    day: 'Day',
    hour: 'Hour',
    minute: 'Minute',
    second: 'Second'
  },
  
  weekdays: {
    long: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  },
  
  months: {
    long: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
  },
  
  event: {
    title: 'Title',
    description: 'Description',
    startTime: 'Start Time',
    endTime: 'End Time',
    allDay: 'All Day',
    repeat: 'Repeat',
    reminder: 'Reminder',
    category: 'Category',
    priority: 'Priority',
    status: 'Status',
    create: 'Create Event',
    edit: 'Edit Event',
    delete: 'Delete Event',
    save: 'Save',
    details: 'Details'
  },
  
  repeat: {
    none: 'None',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
    custom: 'Custom',
    every: 'Every',
    until: 'Until',
    times: 'Times'
  },
  
  priority: {
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  },
  
  status: {
    confirmed: 'Confirmed',
    tentative: 'Tentative',
    cancelled: 'Cancelled'
  },
  
  reminder: {
    popup: 'Popup',
    email: 'Email',
    sms: 'SMS',
    notification: 'Notification',
    minutes: 'Minutes',
    hours: 'Hours',
    days: 'Days',
    weeks: 'Weeks'
  },
  
  lunar: {
    year: 'Lunar Year',
    month: 'Lunar Month',
    day: 'Lunar Day',
    leap: 'Leap',
    zodiac: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'],
    terms: [
      'Spring Begins', 'Rain Water', 'Insects Awaken', 'Vernal Equinox', 'Clear and Bright', 'Grain Rain',
      'Summer Begins', 'Grain Buds', 'Grain in Ear', 'Summer Solstice', 'Slight Heat', 'Great Heat',
      'Autumn Begins', 'Stopping the Heat', 'White Dews', 'Autumnal Equinox', 'Cold Dews', 'Frost\'s Descent',
      'Winter Begins', 'Slight Snow', 'Great Snow', 'Winter Solstice', 'Slight Cold', 'Great Cold'
    ],
    festivals: {
      '0101': 'Spring Festival',
      '0115': 'Lantern Festival',
      '0505': 'Dragon Boat Festival',
      '0707': 'Qixi Festival',
      '0715': 'Ghost Festival',
      '0815': 'Mid-Autumn Festival',
      '0909': 'Double Ninth Festival',
      '1208': 'Laba Festival',
      '1223': 'Little New Year',
      '1230': 'New Year\'s Eve'
    }
  },
  
  holidays: {
    '0101': 'New Year\'s Day',
    '0214': 'Valentine\'s Day',
    '0308': 'Women\'s Day',
    '0312': 'Arbor Day',
    '0401': 'April Fool\'s Day',
    '0501': 'Labor Day',
    '0504': 'Youth Day',
    '0512': 'Nurses Day',
    '0601': 'Children\'s Day',
    '0701': 'Party Founding Day',
    '0801': 'Army Day',
    '0910': 'Teachers\' Day',
    '1001': 'National Day',
    '1224': 'Christmas Eve',
    '1225': 'Christmas Day'
  },
  
  errors: {
    invalidDate: 'Invalid date',
    invalidEvent: 'Invalid event',
    eventNotFound: 'Event not found',
    dateOutOfRange: 'Date out of range',
    conflictingEvents: 'Conflicting events'
  },
  
  formats: {
    date: 'MMMM DD, YYYY',
    dateShort: 'MM/DD/YYYY',
    dateTime: 'MMMM DD, YYYY HH:mm:ss',
    dateTimeShort: 'MM/DD/YYYY HH:mm',
    time: 'HH:mm:ss',
    timeShort: 'HH:mm',
    month: 'MMMM YYYY',
    year: 'YYYY'
  }
}

/**
 * 国际化管理器
 */
export class I18nManager {
  /** 当前语言 */
  private currentLocale: LocaleType = 'zh-CN'
  /** 语言包映射 */
  private locales: Map<LocaleType, LocaleMessages> = new Map()
  /** 回退语言 */
  private fallbackLocale: LocaleType = 'zh-CN'

  constructor() {
    this.init()
  }

  /**
   * 初始化
   */
  private init(): void {
    // 注册内置语言包
    this.locales.set('zh-CN', zhCN)
    this.locales.set('en-US', enUS)
  }

  /**
   * 设置当前语言
   */
  public setLocale(locale: LocaleType): void {
    if (this.locales.has(locale)) {
      this.currentLocale = locale
    } else {
      console.warn(`Locale "${locale}" not found, using fallback locale "${this.fallbackLocale}"`)
      this.currentLocale = this.fallbackLocale
    }
  }

  /**
   * 获取当前语言
   */
  public getLocale(): LocaleType {
    return this.currentLocale
  }

  /**
   * 注册语言包
   */
  public registerLocale(locale: LocaleType, messages: LocaleMessages): void {
    this.locales.set(locale, messages)
  }

  /**
   * 获取翻译文本
   */
  public t(key: string, params?: Record<string, any>): string {
    const messages = this.locales.get(this.currentLocale) || this.locales.get(this.fallbackLocale)!
    const value = this.getNestedValue(messages, key)
    
    if (typeof value === 'string') {
      return this.interpolate(value, params)
    }
    
    console.warn(`Translation key "${key}" not found for locale "${this.currentLocale}"`)
    return key
  }

  /**
   * 获取嵌套对象的值
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined
    }, obj)
  }

  /**
   * 插值替换
   */
  private interpolate(template: string, params?: Record<string, any>): string {
    if (!params) return template

    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match
    })
  }

  /**
   * 获取月份名称数组
   */
  public getMonthNames(type: 'long' | 'short' | 'narrow' = 'long'): string[] {
    const messages = this.locales.get(this.currentLocale) || this.locales.get(this.fallbackLocale)!
    return messages.months[type] || messages.months.long
  }

  /**
   * 获取星期名称
   */
  public getWeekdayNames(format: 'long' | 'short' | 'narrow' = 'short'): string[] {
    const messages = this.locales.get(this.currentLocale) || this.locales.get(this.fallbackLocale)!
    return messages.weekdays[format]
  }



  /**
   * 获取日期格式
   */
  public getDateFormat(type: keyof LocaleMessages['formats']): string {
    const messages = this.locales.get(this.currentLocale) || this.locales.get(this.fallbackLocale)!
    return messages.formats[type]
  }

  /**
   * 获取农历生肖
   */
  public getZodiacName(index: number): string {
    const messages = this.locales.get(this.currentLocale) || this.locales.get(this.fallbackLocale)!
    return messages.lunar.zodiac[index] || ''
  }

  /**
   * 获取节气名称
   */
  public getTermName(index: number): string {
    const messages = this.locales.get(this.currentLocale) || this.locales.get(this.fallbackLocale)!
    return messages.lunar.terms[index] || ''
  }

  /**
   * 获取农历节日
   */
  public getLunarFestival(monthDay: string): string | undefined {
    const messages = this.locales.get(this.currentLocale) || this.locales.get(this.fallbackLocale)!
    return messages.lunar.festivals[monthDay]
  }

  /**
   * 获取节假日
   */
  public getHoliday(monthDay: string): string | undefined {
    const messages = this.locales.get(this.currentLocale) || this.locales.get(this.fallbackLocale)!
    return messages.holidays[monthDay]
  }

  /**
   * 检查是否支持指定语言
   */
  public hasLocale(locale: LocaleType): boolean {
    return this.locales.has(locale)
  }

  /**
   * 获取所有支持的语言
   */
  public getSupportedLocales(): LocaleType[] {
    return Array.from(this.locales.keys())
  }

  /**
   * 设置回退语言
   */
  public setFallbackLocale(locale: LocaleType): void {
    if (this.locales.has(locale)) {
      this.fallbackLocale = locale
    }
  }

  /**
   * 获取回退语言
   */
  public getFallbackLocale(): LocaleType {
    return this.fallbackLocale
  }

  /**
   * 销毁国际化管理器
   */
  public destroy(): void {
    this.locales.clear()
  }
}
