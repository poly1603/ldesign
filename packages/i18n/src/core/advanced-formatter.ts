/**
 * @ldesign/i18n - Advanced Formatter
 * 高级格式化功能，提供丰富的数据格式化选项
 */

import type { Formatter, Locale } from '../types';

export interface FormatOptions {
  locale?: Locale;
  [key: string]: any;
}

/**
 * 高级格式化器类
 */
// 缓存 Intl 格式化器，避免重复创建
const intlFormatterCache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat | Intl.RelativeTimeFormat>();
const FORMATTER_CACHE_MAX = 100;

export class AdvancedFormatter {
  private locale: Locale;
  private readonly customFormatters = new Map<string, Formatter>();
  private readonly formatterCache = intlFormatterCache; // 共享缓存

  constructor(locale: Locale = 'en') {
    this.locale = locale;
    this.registerDefaultFormatters();
  }

  /**
   * 设置当前语言
   */
  setLocale(locale: Locale): void {
    this.locale = locale;
  }

  /**
   * 注册自定义格式化器
   */
  registerFormatter(name: string, formatter: Formatter): void {
    this.customFormatters.set(name, formatter);
  }

  /**
   * 格式化值
   */
  format(value: any, format: string, options: FormatOptions = {}): string {
    const locale = options.locale || this.locale;
    
    // 检查自定义格式化器
    if (this.customFormatters.has(format)) {
      return this.customFormatters.get(format)!.format(value, format, locale, options);
    }

    // 解析格式字符串
    const [type, ...params] = format.split(':');
    const formatOptions = this.parseFormatOptions(params.join(':'));

    switch (type.toLowerCase()) {
      case 'number':
        return this.formatNumber(value, { ...formatOptions, ...options }, locale);
      case 'currency':
        return this.formatCurrency(value, { ...formatOptions, ...options }, locale);
      case 'percent':
        return this.formatPercent(value, { ...formatOptions, ...options }, locale);
      case 'date':
        return this.formatDate(value, { ...formatOptions, ...options }, locale);
      case 'time':
        return this.formatTime(value, { ...formatOptions, ...options }, locale);
      case 'datetime':
        return this.formatDateTime(value, { ...formatOptions, ...options }, locale);
      case 'relative':
        return this.formatRelativeTime(value, { ...formatOptions, ...options }, locale);
      case 'duration':
        return this.formatDuration(value, { ...formatOptions, ...options }, locale);
      case 'filesize':
        return this.formatFileSize(value, { ...formatOptions, ...options }, locale);
      case 'ordinal':
        return this.formatOrdinal(value, locale);
      case 'list':
        return this.formatList(value, { ...formatOptions, ...options }, locale);
      case 'phone':
        return this.formatPhoneNumber(value, { ...formatOptions, ...options }, locale);
      case 'abbreviate':
        return this.abbreviateNumber(value, { ...formatOptions, ...options }, locale);
      default:
        return String(value);
    }
  }

  /**
   * 格式化数字
   */
  formatNumber(value: number, options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    const cacheKey = `number:${loc}:${JSON.stringify(options)}`;
    
    let formatter = this.formatterCache.get(cacheKey) as Intl.NumberFormat;
    if (!formatter) {
      formatter = new Intl.NumberFormat(loc, {
        minimumFractionDigits: options.minimumFractionDigits,
        maximumFractionDigits: options.maximumFractionDigits,
        minimumIntegerDigits: options.minimumIntegerDigits,
        useGrouping: options.useGrouping !== false,
        ...options
      });
      
      // 限制缓存大小
      if (this.formatterCache.size >= FORMATTER_CACHE_MAX) {
        const firstKey = this.formatterCache.keys().next().value;
        if (firstKey !== undefined) {
          this.formatterCache.delete(firstKey);
        }
      }
      this.formatterCache.set(cacheKey, formatter);
    }
    
    return formatter.format(value);
  }

  /**
   * 格式化货币
   */
  formatCurrency(value: number, options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    const currency = options.currency || 'USD';
    const cacheKey = `currency:${loc}:${currency}:${JSON.stringify(options)}`;
    
    let formatter = this.formatterCache.get(cacheKey) as Intl.NumberFormat;
    if (!formatter) {
      formatter = new Intl.NumberFormat(loc, {
        style: 'currency',
        currency,
        currencyDisplay: options.currencyDisplay || 'symbol',
        minimumFractionDigits: options.minimumFractionDigits,
        maximumFractionDigits: options.maximumFractionDigits,
        ...options
      });
      
      if (this.formatterCache.size >= FORMATTER_CACHE_MAX) {
        const firstKey = this.formatterCache.keys().next().value;
        if (firstKey !== undefined) {
          this.formatterCache.delete(firstKey);
        }
      }
      this.formatterCache.set(cacheKey, formatter);
    }
    
    return formatter.format(value);
  }

  /**
   * 格式化百分比
   */
  formatPercent(value: number, options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    const formatter = new Intl.NumberFormat(loc, {
      style: 'percent',
      minimumFractionDigits: options.minimumFractionDigits || 0,
      maximumFractionDigits: options.maximumFractionDigits || 2,
      ...options
    });
    return formatter.format(value);
  }

  /**
   * 格式化日期
   */
  formatDate(value: Date | string | number, options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    const date = this.toDate(value);
    
    // 预设格式
    const presets: Record<string, Intl.DateTimeFormatOptions> = {
      short: { year: '2-digit', month: '2-digit', day: '2-digit' },
      medium: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    };

    const formatOptions = options.preset 
      ? presets[options.preset] || options
      : options;

    const formatter = new Intl.DateTimeFormat(loc, formatOptions);
    return formatter.format(date);
  }

  /**
   * 格式化时间
   */
  formatTime(value: Date | string | number, options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    const date = this.toDate(value);
    
    // 预设格式
    const presets: Record<string, Intl.DateTimeFormatOptions> = {
      short: { hour: '2-digit', minute: '2-digit' },
      medium: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
      long: { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' }
    };

    const formatOptions = options.preset 
      ? presets[options.preset] || options
      : options;

    const formatter = new Intl.DateTimeFormat(loc, formatOptions);
    return formatter.format(date);
  }

  /**
   * 格式化日期时间
   */
  formatDateTime(value: Date | string | number, options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    const date = this.toDate(value);
    
    const dateOptions = options.date || { year: 'numeric', month: '2-digit', day: '2-digit' };
    const timeOptions = options.time || { hour: '2-digit', minute: '2-digit' };
    
    const formatter = new Intl.DateTimeFormat(loc, {
      ...dateOptions,
      ...timeOptions,
      ...options
    });
    
    return formatter.format(date);
  }

  /**
   * 格式化相对时间
   */
  formatRelativeTime(value: Date | string | number, options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    const date = this.toDate(value);
    const now = new Date();
    
    const rtf = new Intl.RelativeTimeFormat(loc, {
      numeric: options.numeric || 'auto',
      style: options.style || 'long'
    });

    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    const absDiff = Math.abs(diffInSeconds);

    // 自动选择合适的单位
    const units: [number, Intl.RelativeTimeFormatUnit][] = [
      [60, 'second'],
      [60, 'minute'],
      [24, 'hour'],
      [7, 'day'],
      [4, 'week'],
      [12, 'month'],
      [Number.MAX_VALUE, 'year']
    ];

    let value2 = absDiff;
    let unit: Intl.RelativeTimeFormatUnit = 'second';

    for (const [threshold, u] of units) {
      if (value2 < threshold) {
        unit = u;
        break;
      }
      value2 = Math.floor(value2 / threshold);
    }

    const finalValue = diffInSeconds < 0 ? -value2 : value2;
    return rtf.format(finalValue, unit);
  }

  /**
   * 格式化持续时间
   */
  formatDuration(value: number, _options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    const seconds = Math.floor(value / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const parts = [];
    
    if (days > 0) {
      parts.push(this.pluralize(days, 'day', 'days', loc));
    }
    if (hours % 24 > 0) {
      parts.push(this.pluralize(hours % 24, 'hour', 'hours', loc));
    }
    if (minutes % 60 > 0 && !days) {
      parts.push(this.pluralize(minutes % 60, 'minute', 'minutes', loc));
    }
    if (seconds % 60 > 0 && !hours && !days) {
      parts.push(this.pluralize(seconds % 60, 'second', 'seconds', loc));
    }

    if (parts.length === 0) {
      return this.pluralize(0, 'second', 'seconds', loc);
    }

    return parts.join(', ');
  }

  /**
   * 格式化文件大小
   */
  formatFileSize(value: number, options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    const units = options.binary ? 
      ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'] : 
      ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const threshold = options.binary ? 1024 : 1000;
    let size = Math.abs(value);
    let unitIndex = 0;

    while (size >= threshold && unitIndex < units.length - 1) {
      size /= threshold;
      unitIndex++;
    }

    const formatter = new Intl.NumberFormat(loc, {
      minimumFractionDigits: unitIndex === 0 ? 0 : 1,
      maximumFractionDigits: unitIndex === 0 ? 0 : 2
    });

    return `${formatter.format(size)} ${units[unitIndex]}`;
  }

  /**
   * 格式化序数词
   */
  formatOrdinal(value: number, locale?: Locale): string {
    const loc = locale || this.locale;
    
    if (loc.startsWith('en')) {
      const j = value % 10;
      const k = value % 100;
      
      if (j === 1 && k !== 11) {
        return `${value}st`;
      }
      if (j === 2 && k !== 12) {
        return `${value}nd`;
      }
      if (j === 3 && k !== 13) {
        return `${value}rd`;
      }
      return `${value}th`;
    }
    
    // 中文等其他语言
    if (loc.startsWith('zh')) {
      return `第${value}`;
    }
    
    // 默认返回数字
    return String(value);
  }

  /**
   * 格式化列表
   */
  formatList(value: any[], options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    
    if (!Array.isArray(value)) {
      return String(value);
    }

    const type = options.type || 'conjunction'; // conjunction | disjunction | unit
    const style = options.style || 'long'; // long | short | narrow

    try {
      const formatter = new (Intl as any).ListFormat(loc, { type, style });
      return formatter.format(value);
    } catch {
      // Fallback for browsers that don't support ListFormat
      if (type === 'disjunction') {
        return value.join(' or ');
      }
      return value.join(', ');
    }
  }

  /**
   * 格式化电话号码
   */
  formatPhoneNumber(value: string, _options: any = {}, locale?: Locale): string {
    const cleaned = value.replace(/\D/g, '');
    
    // 简单的格式化逻辑，可以根据需要扩展
    if (cleaned.length === 10) {
      // US format
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '1') {
      // US format with country code
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 11 && (locale || this.locale).startsWith('zh')) {
      // Chinese mobile format
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    
    return value;
  }

  /**
   * 缩写大数字
   */
  abbreviateNumber(value: number, options: any = {}, locale?: Locale): string {
    const loc = locale || this.locale;
    const abs = Math.abs(value);
    
    const abbreviations = [
      { threshold: 1e9, suffix: 'B' },
      { threshold: 1e6, suffix: 'M' },
      { threshold: 1e3, suffix: 'K' }
    ];

    for (const { threshold, suffix } of abbreviations) {
      if (abs >= threshold) {
        const abbreviated = value / threshold;
        const formatter = new Intl.NumberFormat(loc, {
          minimumFractionDigits: 0,
          maximumFractionDigits: options.decimals || 1
        });
        return formatter.format(abbreviated) + suffix;
      }
    }

    return this.formatNumber(value, options, loc);
  }

  /**
   * 注册默认格式化器
   */
  private registerDefaultFormatters(): void {
    // 注册一些常用的自定义格式化器
    
    // 布尔值格式化
    this.registerFormatter('boolean', {
      format: (value: any, format: string, locale: Locale) => {
        const isTrue = Boolean(value);
        if (locale.startsWith('zh')) {
          return isTrue ? '是' : '否';
        }
        return isTrue ? 'Yes' : 'No';
      }
    });

    // 状态格式化
    this.registerFormatter('status', {
      format: (value: any, format: string, locale: Locale) => {
        const statusMap: Record<string, Record<string, string>> = {
          en: {
            pending: 'Pending',
            processing: 'Processing',
            completed: 'Completed',
            failed: 'Failed',
            cancelled: 'Cancelled'
          },
          zh: {
            pending: '待处理',
            processing: '处理中',
            completed: '已完成',
            failed: '失败',
            cancelled: '已取消'
          }
        };
        
        const lang = locale.startsWith('zh') ? 'zh' : 'en';
        return statusMap[lang][value] || value;
      }
    });

    // 性别格式化
    this.registerFormatter('gender', {
      format: (value: any, format: string, locale: Locale) => {
        const genderMap: Record<string, Record<string, string>> = {
          en: {
            male: 'Male',
            female: 'Female',
            other: 'Other',
            unknown: 'Unknown'
          },
          zh: {
            male: '男',
            female: '女',
            other: '其他',
            unknown: '未知'
          }
        };
        
        const lang = locale.startsWith('zh') ? 'zh' : 'en';
        return genderMap[lang][value] || value;
      }
    });
  }

  /**
   * 解析格式选项
   */
  private parseFormatOptions(optionsString: string): any {
    if (!optionsString) return {};
    
    const options: any = {};
    const pairs = optionsString.split(',');
    
    for (const pair of pairs) {
      const [key, value] = pair.split('=').map(s => s.trim());
      if (key && value) {
        // 尝试解析数字和布尔值
        if (value === 'true') {
          options[key] = true;
        } else if (value === 'false') {
          options[key] = false;
        } else if (!Number.isNaN(Number(value))) {
          options[key] = Number(value);
        } else {
          options[key] = value;
        }
      }
    }
    
    return options;
  }

  /**
   * 转换为日期对象
   */
  private toDate(value: Date | string | number): Date {
    if (value instanceof Date) {
      return value;
    }
    return new Date(value);
  }

  /**
   * 简单的复数化
   */
  private pluralize(count: number, singular: string, plural: string, locale: Locale): string {
    if (locale.startsWith('zh')) {
      // 中文不需要复数
      const units: Record<string, string> = {
        day: '天',
        hour: '小时',
        minute: '分钟',
        second: '秒'
      };
      return `${count} ${units[singular] || singular}`;
    }
    
    return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
  }
}

// 单例模式，避免重复创建实例
let formatterInstance: AdvancedFormatter | null = null;

/**
 * 创建格式化器实例 - 使用单例模式
 */
export function createAdvancedFormatter(locale?: Locale): AdvancedFormatter {
  if (!formatterInstance) {
    formatterInstance = new AdvancedFormatter(locale);
  } else if (locale) {
    formatterInstance.setLocale(locale);
  }
  return formatterInstance;
}

/**
 * 清理格式化器缓存
 */
export function clearFormatterCache(): void {
  intlFormatterCache.clear();
}
