/**
 * 国际化工具函数测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  I18nManager,
  zhCN,
  enUS,
  i18n,
  t,
} from '../i18n'
import type { LanguagePack } from '../i18n'

describe('I18nManager', () => {
  let manager: I18nManager

  beforeEach(() => {
    manager = new I18nManager()
  })

  it('should register language packs correctly', () => {
    const testPack: LanguagePack = {
      code: 'test',
      name: 'Test Language',
      translations: {
        hello: 'Hello Test',
      },
      dateFormats: {
        short: 'MM/DD/YYYY',
        medium: 'MMM DD, YYYY',
        long: 'MMMM DD, YYYY',
        full: 'MMMM DD, YYYY dddd',
      },
      timeFormats: {
        short: 'HH:mm',
        medium: 'HH:mm:ss',
        long: 'HH:mm:ss',
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

    manager.register(testPack)
    expect(manager.getAvailableLanguages()).toContainEqual(testPack)
  })

  it('should set and get current language', () => {
    expect(manager.getCurrentLanguage()).toBe('zh-CN')

    manager.setLanguage('en-US')
    expect(manager.getCurrentLanguage()).toBe('en-US')
  })

  it('should handle non-existent language', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { })

    const originalLanguage = manager.getCurrentLanguage()
    manager.setLanguage('non-existent')
    expect(manager.getCurrentLanguage()).toBe(originalLanguage) // 应该保持原来的语言
    expect(consoleSpy).toHaveBeenCalledWith('Language pack for non-existent not found')

    consoleSpy.mockRestore()
  })

  it('should translate text correctly', () => {
    expect(manager.t('ok')).toBe('确定')
    expect(manager.t('cancel')).toBe('取消')

    manager.setLanguage('en-US')
    expect(manager.t('ok')).toBe('OK')
    expect(manager.t('cancel')).toBe('Cancel')
  })

  it('should handle nested translation keys', () => {
    expect(manager.t('errors.required')).toBe('此字段为必填项')
    expect(manager.t('repeatOptions.daily')).toBe('每天')

    manager.setLanguage('en-US')
    expect(manager.t('errors.required')).toBe('This field is required')
    expect(manager.t('repeatOptions.daily')).toBe('Daily')
  })

  it('should handle non-existent translation keys', () => {
    expect(manager.t('non.existent.key')).toBe('non.existent.key')
  })

  it('should handle parameter replacement', () => {
    // 这里需要一个支持参数的翻译键，我们可以模拟一个
    const testPack: LanguagePack = {
      ...zhCN,
      code: 'test-params',
      translations: {
        ...zhCN.translations,
        greeting: '你好，{name}！',
        message: '你有 {count} 条新消息',
      },
    }

    manager.register(testPack)
    manager.setLanguage('test-params')

    expect(manager.t('greeting', { name: '张三' })).toBe('你好，张三！')
    expect(manager.t('message', { count: 5 })).toBe('你有 5 条新消息')
  })

  it('should get date formats correctly', () => {
    expect(manager.getDateFormat('short')).toBe('YYYY/M/D')
    expect(manager.getDateFormat('medium')).toBe('YYYY年M月D日')

    manager.setLanguage('en-US')
    expect(manager.getDateFormat('short')).toBe('M/D/YYYY')
    expect(manager.getDateFormat('medium')).toBe('MMM D, YYYY')
  })

  it('should get time formats correctly', () => {
    expect(manager.getTimeFormat('short')).toBe('HH:mm')
    expect(manager.getTimeFormat('medium')).toBe('HH:mm:ss')

    manager.setLanguage('en-US')
    expect(manager.getTimeFormat('short')).toBe('h:mm A')
    expect(manager.getTimeFormat('medium')).toBe('h:mm:ss A')
  })

  it('should get weekdays correctly', () => {
    const weekdays = manager.getWeekdays('long')
    expect(weekdays).toEqual(['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'])

    const shortWeekdays = manager.getWeekdays('short')
    expect(shortWeekdays).toEqual(['周日', '周一', '周二', '周三', '周四', '周五', '周六'])

    manager.setLanguage('en-US')
    const englishWeekdays = manager.getWeekdays('long')
    expect(englishWeekdays).toEqual(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
  })

  it('should get months correctly', () => {
    const months = manager.getMonths('long')
    expect(months).toEqual(['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'])

    const shortMonths = manager.getMonths('short')
    expect(shortMonths).toEqual(['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'])

    manager.setLanguage('en-US')
    const englishMonths = manager.getMonths('long')
    expect(englishMonths).toEqual(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'])
  })

  it('should format relative time correctly', () => {
    expect(manager.formatRelativeTime('m')).toBe('1分钟')
    expect(manager.formatRelativeTime('mm', 5)).toBe('5分钟')
    expect(manager.formatRelativeTime('h')).toBe('1小时')
    expect(manager.formatRelativeTime('hh', 3)).toBe('3小时')

    manager.setLanguage('en-US')
    expect(manager.formatRelativeTime('m')).toBe('a minute')
    expect(manager.formatRelativeTime('mm', 5)).toBe('5 minutes')
    expect(manager.formatRelativeTime('h')).toBe('an hour')
    expect(manager.formatRelativeTime('hh', 3)).toBe('3 hours')
  })

  it('should handle fallback language', () => {
    // 创建一个不完整的语言包
    const incompletePack: LanguagePack = {
      code: 'incomplete',
      name: 'Incomplete Language',
      translations: {
        hello: 'Hello Incomplete',
      },
      dateFormats: {
        short: 'MM/DD/YYYY',
        medium: 'MMM DD, YYYY',
        long: 'MMMM DD, YYYY',
        full: 'MMMM DD, YYYY dddd',
      },
      timeFormats: {
        short: 'HH:mm',
        medium: 'HH:mm:ss',
        long: 'HH:mm:ss',
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

    manager.register(incompletePack)
    manager.setLanguage('incomplete')

    expect(manager.t('hello')).toBe('Hello Incomplete')
    // 对于不存在的键，应该返回键本身
    expect(manager.t('ok')).toBe('ok')
  })
})

describe('Language Packs', () => {
  it('should have valid Chinese language pack', () => {
    expect(zhCN.code).toBe('zh-CN')
    expect(zhCN.name).toBe('简体中文')
    expect(zhCN.translations.ok).toBe('确定')
    expect(zhCN.translations.cancel).toBe('取消')
    expect(zhCN.weekdays.long).toHaveLength(7)
    expect(zhCN.months.long).toHaveLength(12)
  })

  it('should have valid English language pack', () => {
    expect(enUS.code).toBe('en-US')
    expect(enUS.name).toBe('English')
    expect(enUS.translations.ok).toBe('OK')
    expect(enUS.translations.cancel).toBe('Cancel')
    expect(enUS.weekdays.long).toHaveLength(7)
    expect(enUS.months.long).toHaveLength(12)
  })
})

describe('Global instances and functions', () => {
  it('should export global i18n instance', () => {
    expect(i18n).toBeInstanceOf(I18nManager)
  })

  it('should export convenience function', () => {
    expect(typeof t).toBe('function')
    expect(t('ok')).toBe(i18n.t('ok'))
  })

  it('should work with global instance', () => {
    expect(i18n.getCurrentLanguage()).toBe('zh-CN')
    expect(t('ok')).toBe('确定')

    i18n.setLanguage('en-US')
    expect(t('ok')).toBe('OK')

    // 恢复默认语言
    i18n.setLanguage('zh-CN')
  })
})
