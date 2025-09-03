/**
 * 日期时间工具函数模块
 *
 * @description
 * 提供常用的日期时间处理、格式化、计算等工具函数。
 * 这些函数具有良好的类型安全性和性能表现。
 */
/**
 * 日期格式化选项
 */
export interface DateFormatOptions {
    /** 年份格式 */
    year?: 'numeric' | '2-digit';
    /** 月份格式 */
    month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
    /** 日期格式 */
    day?: 'numeric' | '2-digit';
    /** 小时格式 */
    hour?: 'numeric' | '2-digit';
    /** 分钟格式 */
    minute?: 'numeric' | '2-digit';
    /** 秒格式 */
    second?: 'numeric' | '2-digit';
    /** 时区 */
    timeZone?: string;
    /** 12/24小时制 */
    hour12?: boolean;
}
/**
 * 格式化日期
 *
 * @param date - 要格式化的日期
 * @param format - 格式字符串或选项
 * @param locale - 语言环境（默认为 'zh-CN'）
 * @returns 格式化后的日期字符串
 *
 * @example
 * ```typescript
 * const date = new Date('2023-12-25 15:30:45')
 *
 * formatDate(date, 'YYYY-MM-DD') // '2023-12-25'
 * formatDate(date, 'YYYY-MM-DD HH:mm:ss') // '2023-12-25 15:30:45'
 * formatDate(date, 'MM/DD/YYYY') // '12/25/2023'
 *
 * // 使用选项对象
 * formatDate(date, {
 *   year: 'numeric',
 *   month: 'long',
 *   day: 'numeric'
 * }) // '2023年12月25日'
 * ```
 */
export declare function formatDate(date: Date | string | number, format: string | DateFormatOptions, locale?: string): string;
/**
 * 解析日期字符串
 *
 * @param dateString - 日期字符串
 * @param format - 格式字符串（可选）
 * @returns Date 对象
 *
 * @example
 * ```typescript
 * parseDate('2023-12-25') // Date object
 * parseDate('25/12/2023', 'DD/MM/YYYY') // Date object
 * ```
 */
export declare function parseDate(dateString: string, format?: string): Date;
/**
 * 计算两个日期之间的差值
 *
 * @param date1 - 第一个日期
 * @param date2 - 第二个日期
 * @param unit - 单位（默认为 'days'）
 * @returns 差值
 *
 * @example
 * ```typescript
 * const date1 = new Date('2023-12-25')
 * const date2 = new Date('2023-12-20')
 *
 * dateDiff(date1, date2, 'days') // 5
 * dateDiff(date1, date2, 'hours') // 120
 * ```
 */
export declare function dateDiff(date1: Date | string | number, date2: Date | string | number, unit?: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'): number;
/**
 * 添加时间到日期
 *
 * @param date - 基础日期
 * @param amount - 要添加的数量
 * @param unit - 时间单位
 * @returns 新的日期对象
 *
 * @example
 * ```typescript
 * const date = new Date('2023-12-25')
 *
 * addTime(date, 7, 'days') // 2024-01-01
 * addTime(date, 2, 'hours') // 2023-12-25 02:00:00
 * ```
 */
export declare function addTime(date: Date | string | number, amount: number, unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'): Date;
/**
 * 减去时间从日期
 *
 * @param date - 基础日期
 * @param amount - 要减去的数量
 * @param unit - 时间单位
 * @returns 新的日期对象
 *
 * @example
 * ```typescript
 * const date = new Date('2023-12-25')
 *
 * subtractTime(date, 7, 'days') // 2023-12-18
 * ```
 */
export declare function subtractTime(date: Date | string | number, amount: number, unit: 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'): Date;
/**
 * 获取日期的开始时间
 *
 * @param date - 日期
 * @param unit - 单位
 * @returns 开始时间的日期对象
 *
 * @example
 * ```typescript
 * const date = new Date('2023-12-25 15:30:45')
 *
 * startOf(date, 'day') // 2023-12-25 00:00:00
 * startOf(date, 'month') // 2023-12-01 00:00:00
 * ```
 */
export declare function startOf(date: Date | string | number, unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): Date;
/**
 * 获取日期的结束时间
 *
 * @param date - 日期
 * @param unit - 单位
 * @returns 结束时间的日期对象
 *
 * @example
 * ```typescript
 * const date = new Date('2023-12-25 15:30:45')
 *
 * endOf(date, 'day') // 2023-12-25 23:59:59.999
 * endOf(date, 'month') // 2023-12-31 23:59:59.999
 * ```
 */
export declare function endOf(date: Date | string | number, unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'): Date;
/**
 * 检查是否为闰年
 *
 * @param year - 年份
 * @returns 是否为闰年
 *
 * @example
 * ```typescript
 * isLeapYear(2024) // true
 * isLeapYear(2023) // false
 * ```
 */
export declare function isLeapYear(year: number): boolean;
/**
 * 获取月份的天数
 *
 * @param year - 年份
 * @param month - 月份（1-12）
 * @returns 天数
 *
 * @example
 * ```typescript
 * getDaysInMonth(2023, 2) // 28
 * getDaysInMonth(2024, 2) // 29
 * ```
 */
export declare function getDaysInMonth(year: number, month: number): number;
/**
 * 相对时间格式化
 *
 * @param date - 日期
 * @param baseDate - 基准日期（默认为当前时间）
 * @param locale - 语言环境（默认为 'zh-CN'）
 * @returns 相对时间字符串
 *
 * @example
 * ```typescript
 * const now = new Date()
 * const yesterday = subtractTime(now, 1, 'days')
 *
 * timeAgo(yesterday) // '1天前'
 * ```
 */
export declare function timeAgo(date: Date | string | number, baseDate?: Date, locale?: string): string;
//# sourceMappingURL=date.d.ts.map