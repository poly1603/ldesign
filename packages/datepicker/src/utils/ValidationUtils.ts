/**
 * ValidationUtils 验证工具类
 * 提供各种验证功能
 */

import type { DateValue, ValidationResult } from '../types';
import { DateUtils } from './DateUtils';

/**
 * 验证规则接口
 */
export interface ValidationRule {
  /** 规则名称 */
  name: string;
  /** 验证函数 */
  validator: (value: DateValue) => boolean;
  /** 错误消息 */
  message: string;
  /** 错误代码 */
  code?: string;
}

/**
 * 验证配置
 */
export interface ValidationConfig {
  /** 是否必填 */
  required?: boolean;
  /** 最小日期 */
  minDate?: DateValue;
  /** 最大日期 */
  maxDate?: DateValue;
  /** 禁用的日期 */
  disabledDates?: DateValue[];
  /** 禁用的星期 */
  disabledWeekdays?: number[];
  /** 自定义验证规则 */
  customRules?: ValidationRule[];
  /** 日期格式 */
  format?: string;
}

/**
 * 验证工具类
 */
export class ValidationUtils {
  /**
   * 验证日期值
   * @param value 要验证的值
   * @param config 验证配置
   * @returns 验证结果
   */
  static validate(value: DateValue, config: ValidationConfig = {}): ValidationResult {
    // 必填验证
    if (config.required && this.isEmpty(value)) {
      return {
        valid: false,
        message: '日期不能为空',
        code: 'REQUIRED'
      };
    }

    // 如果值为空且不是必填，则验证通过
    if (this.isEmpty(value)) {
      return { valid: true };
    }

    // 日期格式验证
    if (!DateUtils.isValid(value)) {
      return {
        valid: false,
        message: '日期格式不正确',
        code: 'INVALID_FORMAT'
      };
    }

    const date = DateUtils.toDate(value)!;

    // 最小日期验证
    if (config.minDate) {
      const minDate = DateUtils.toDate(config.minDate);
      if (minDate && DateUtils.compare(date, minDate) < 0) {
        return {
          valid: false,
          message: `日期不能早于 ${DateUtils.format(minDate, config.format || 'YYYY-MM-DD')}`,
          code: 'MIN_DATE'
        };
      }
    }

    // 最大日期验证
    if (config.maxDate) {
      const maxDate = DateUtils.toDate(config.maxDate);
      if (maxDate && DateUtils.compare(date, maxDate) > 0) {
        return {
          valid: false,
          message: `日期不能晚于 ${DateUtils.format(maxDate, config.format || 'YYYY-MM-DD')}`,
          code: 'MAX_DATE'
        };
      }
    }

    // 禁用日期验证
    if (config.disabledDates && config.disabledDates.length > 0) {
      const dateStr = DateUtils.format(date, 'YYYY-MM-DD');
      const isDisabled = config.disabledDates.some(disabledDate => {
        const disabled = DateUtils.toDate(disabledDate);
        return disabled && DateUtils.format(disabled, 'YYYY-MM-DD') === dateStr;
      });

      if (isDisabled) {
        return {
          valid: false,
          message: '该日期不可选择',
          code: 'DISABLED_DATE'
        };
      }
    }

    // 禁用星期验证
    if (config.disabledWeekdays && config.disabledWeekdays.length > 0) {
      const weekday = date.getDay();
      if (config.disabledWeekdays.includes(weekday)) {
        const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return {
          valid: false,
          message: `${weekdayNames[weekday]}不可选择`,
          code: 'DISABLED_WEEKDAY'
        };
      }
    }

    // 自定义规则验证
    if (config.customRules && config.customRules.length > 0) {
      for (const rule of config.customRules) {
        if (!rule.validator(value)) {
          return {
            valid: false,
            message: rule.message,
            code: rule.code ?? 'CUSTOM_RULE'
          };
        }
      }
    }

    return { valid: true };
  }

  /**
   * 验证日期数组
   * @param values 日期数组
   * @param config 验证配置
   * @returns 验证结果
   */
  static validateArray(values: DateValue[], config: ValidationConfig = {}): ValidationResult {
    if (!Array.isArray(values)) {
      return {
        valid: false,
        message: '值必须是数组',
        code: 'INVALID_TYPE'
      };
    }

    // 必填验证
    if (config.required && values.length === 0) {
      return {
        valid: false,
        message: '至少选择一个日期',
        code: 'REQUIRED'
      };
    }

    // 验证每个日期
    for (let i = 0; i < values.length; i++) {
      const result = this.validate(values[i], config);
      if (!result.valid) {
        return {
          valid: false,
          message: `第 ${i + 1} 个日期${result.message}`,
          code: result.code ?? 'VALIDATION_ERROR'
        };
      }
    }

    return { valid: true };
  }

  /**
   * 验证日期范围
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param config 验证配置
   * @returns 验证结果
   */
  static validateRange(
    startDate: DateValue,
    endDate: DateValue,
    config: ValidationConfig = {}
  ): ValidationResult {
    // 必填验证
    if (config.required && (this.isEmpty(startDate) || this.isEmpty(endDate))) {
      return {
        valid: false,
        message: '开始日期和结束日期都不能为空',
        code: 'REQUIRED'
      };
    }

    // 如果都为空且不是必填，则验证通过
    if (this.isEmpty(startDate) && this.isEmpty(endDate)) {
      return { valid: true };
    }

    // 验证开始日期
    const startResult = this.validate(startDate, config);
    if (!startResult.valid) {
      return {
        valid: false,
        message: `开始日期${startResult.message}`,
        code: startResult.code ?? 'VALIDATION_ERROR'
      };
    }

    // 验证结束日期
    const endResult = this.validate(endDate, config);
    if (!endResult.valid) {
      return {
        valid: false,
        message: `结束日期${endResult.message}`,
        code: endResult.code ?? 'VALIDATION_ERROR'
      };
    }

    // 验证日期范围
    if (startDate && endDate) {
      if (DateUtils.compare(startDate, endDate) > 0) {
        return {
          valid: false,
          message: '开始日期不能晚于结束日期',
          code: 'INVALID_RANGE'
        };
      }
    }

    return { valid: true };
  }

  /**
   * 检查值是否为空
   * @param value 值
   * @returns 是否为空
   */
  static isEmpty(value: DateValue): boolean {
    return value === null || value === undefined || value === '';
  }

  /**
   * 检查是否为有效的日期字符串
   * @param dateString 日期字符串
   * @returns 是否有效
   */
  static isValidDateString(dateString: string): boolean {
    if (!dateString || typeof dateString !== 'string') return false;

    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * 检查是否为有效的时间戳
   * @param timestamp 时间戳
   * @returns 是否有效
   */
  static isValidTimestamp(timestamp: number): boolean {
    if (typeof timestamp !== 'number') return false;

    const date = new Date(timestamp);
    return !isNaN(date.getTime());
  }

  /**
   * 创建自定义验证规则
   * @param name 规则名称
   * @param validator 验证函数
   * @param message 错误消息
   * @param code 错误代码
   * @returns 验证规则
   */
  static createRule(
    name: string,
    validator: (value: DateValue) => boolean,
    message: string,
    code?: string
  ): ValidationRule {
    return {
      name,
      validator,
      message,
      code: code ?? name.toUpperCase()
    };
  }

  /**
   * 常用验证规则
   */
  static readonly COMMON_RULES = {
    /**
     * 工作日验证规则
     */
    WEEKDAY: this.createRule(
      'weekday',
      (value: DateValue) => {
        const date = DateUtils.toDate(value);
        if (!date) return false;
        const day = date.getDay();
        return day >= 1 && day <= 5; // 周一到周五
      },
      '只能选择工作日',
      'WEEKDAY_ONLY'
    ),

    /**
     * 周末验证规则
     */
    WEEKEND: this.createRule(
      'weekend',
      (value: DateValue) => {
        const date = DateUtils.toDate(value);
        if (!date) return false;
        const day = date.getDay();
        return day === 0 || day === 6; // 周日或周六
      },
      '只能选择周末',
      'WEEKEND_ONLY'
    ),

    /**
     * 未来日期验证规则
     */
    FUTURE: this.createRule(
      'future',
      (value: DateValue) => {
        const date = DateUtils.toDate(value);
        if (!date) return false;
        return DateUtils.compare(date, new Date()) > 0;
      },
      '只能选择未来日期',
      'FUTURE_ONLY'
    ),

    /**
     * 过去日期验证规则
     */
    PAST: this.createRule(
      'past',
      (value: DateValue) => {
        const date = DateUtils.toDate(value);
        if (!date) return false;
        return DateUtils.compare(date, new Date()) < 0;
      },
      '只能选择过去日期',
      'PAST_ONLY'
    ),

    /**
     * 今天或未来日期验证规则
     */
    TODAY_OR_FUTURE: this.createRule(
      'todayOrFuture',
      (value: DateValue) => {
        const date = DateUtils.toDate(value);
        if (!date) return false;
        return DateUtils.compare(date, DateUtils.startOf(new Date(), 'day')!) >= 0;
      },
      '不能选择过去日期',
      'NO_PAST_DATE'
    )
  };
}
