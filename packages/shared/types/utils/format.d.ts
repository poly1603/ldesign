/**
 * 数据格式化工具
 *
 * @description
 * 提供货币、百分比、数字、日期等数据的格式化功能。
 * 支持国际化、自定义格式、精度控制等。
 */
/**
 * 货币格式化选项
 */
export interface CurrencyFormatOptions {
    /** 货币代码 */
    currency?: string;
    /** 语言环境 */
    locale?: string;
    /** 小数位数 */
    minimumFractionDigits?: number;
    /** 最大小数位数 */
    maximumFractionDigits?: number;
    /** 是否显示货币符号 */
    showSymbol?: boolean;
}
/**
 * 数字格式化选项
 */
export interface NumberFormatOptions {
    /** 语言环境 */
    locale?: string;
    /** 小数位数 */
    minimumFractionDigits?: number;
    /** 最大小数位数 */
    maximumFractionDigits?: number;
    /** 是否使用千分位分隔符 */
    useGrouping?: boolean;
    /** 自定义千分位分隔符 */
    groupingSeparator?: string;
    /** 自定义小数点分隔符 */
    decimalSeparator?: string;
}
/**
 * 格式化货币
 *
 * @param amount - 金额
 * @param options - 格式化选项
 * @returns 格式化后的货币字符串
 *
 * @example
 * ```typescript
 * formatCurrency(1234.56) // '¥1,234.56'
 * formatCurrency(1234.56, { currency: 'USD', locale: 'en-US' }) // '$1,234.56'
 * formatCurrency(1234.56, { currency: 'EUR', locale: 'de-DE' }) // '1.234,56 €'
 * formatCurrency(1234, { minimumFractionDigits: 2 }) // '¥1,234.00'
 * ```
 */
export declare function formatCurrency(amount: number, options?: CurrencyFormatOptions): string;
/**
 * 格式化数字
 *
 * @param value - 数值
 * @param options - 格式化选项
 * @returns 格式化后的数字字符串
 *
 * @example
 * ```typescript
 * formatNumber(1234.567) // '1,234.567'
 * formatNumber(1234.567, { maximumFractionDigits: 2 }) // '1,234.57'
 * formatNumber(1234, { minimumFractionDigits: 2 }) // '1,234.00'
 * formatNumber(1234567, { locale: 'de-DE' }) // '1.234.567'
 * ```
 */
export declare function formatNumber(value: number, options?: NumberFormatOptions): string;
/**
 * 格式化百分比
 *
 * @param value - 数值（0-1 之间）
 * @param options - 格式化选项
 * @returns 格式化后的百分比字符串
 *
 * @example
 * ```typescript
 * formatPercentage(0.1234) // '12.34%'
 * formatPercentage(0.1234, { maximumFractionDigits: 1 }) // '12.3%'
 * formatPercentage(0.1234, { minimumFractionDigits: 3 }) // '12.340%'
 * ```
 */
export declare function formatPercentage(value: number, options?: Omit<NumberFormatOptions, 'useGrouping'>): string;
/**
 * 格式化文件大小
 *
 * @param bytes - 字节数
 * @param options - 格式化选项
 * @returns 格式化后的文件大小字符串
 *
 * @example
 * ```typescript
 * formatFileSize(1024) // '1.00 KB'
 * formatFileSize(1048576) // '1.00 MB'
 * formatFileSize(1073741824) // '1.00 GB'
 * formatFileSize(1024, { decimals: 0 }) // '1 KB'
 * formatFileSize(1024, { binary: false }) // '1.02 KB' (使用 1000 进制)
 * ```
 */
export declare function formatFileSize(bytes: number, options?: {
    decimals?: number;
    binary?: boolean;
    locale?: string;
}): string;
/**
 * 格式化数字为紧凑形式
 *
 * @param value - 数值
 * @param options - 格式化选项
 * @returns 格式化后的紧凑数字字符串
 *
 * @example
 * ```typescript
 * formatCompactNumber(1234) // '1.2K'
 * formatCompactNumber(1234567) // '1.2M'
 * formatCompactNumber(1234567890) // '1.2B'
 * formatCompactNumber(1234, { notation: 'long' }) // '1.2 thousand'
 * ```
 */
export declare function formatCompactNumber(value: number, options?: {
    locale?: string;
    notation?: 'short' | 'long';
    maximumFractionDigits?: number;
}): string;
/**
 * 格式化时间间隔
 *
 * @param seconds - 秒数
 * @param options - 格式化选项
 * @returns 格式化后的时间间隔字符串
 *
 * @example
 * ```typescript
 * formatDuration(3661) // '1:01:01'
 * formatDuration(3661, { format: 'long' }) // '1小时1分钟1秒'
 * formatDuration(61, { format: 'short' }) // '1m 1s'
 * formatDuration(3661, { showHours: false }) // '61:01'
 * ```
 */
export declare function formatDuration(seconds: number, options?: {
    format?: 'hms' | 'long' | 'short';
    showHours?: boolean;
    showMinutes?: boolean;
    showSeconds?: boolean;
    locale?: string;
}): string;
/**
 * 格式化相对时间
 *
 * @param date - 日期
 * @param options - 格式化选项
 * @returns 格式化后的相对时间字符串
 *
 * @example
 * ```typescript
 * const now = new Date()
 * const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
 *
 * formatRelativeTime(oneHourAgo) // '1小时前'
 * formatRelativeTime(oneHourAgo, { locale: 'en-US' }) // '1 hour ago'
 * ```
 */
export declare function formatRelativeTime(date: Date, options?: {
    locale?: string;
    baseDate?: Date;
}): string;
//# sourceMappingURL=format.d.ts.map