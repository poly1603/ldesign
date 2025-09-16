/**
 * 验证工具类
 * 提供日期验证、范围验证、格式验证等功能
 */

import type {
  DateValue,
  DateRange,
  MultipleDates,
  ValidationRule,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationInfo,
  ValidationContext,
  RequiredRule,
  MinDateRule,
  MaxDateRule,
  DateRangeRule,
  FormatRule,
  CustomRule,
  WeekdayRule,
  HolidayRule,
  BusinessDayRule
} from '../types';

import { DateUtils } from './DateUtils';

/**
 * 验证工具类
 */
export class ValidationUtils {
  // ==================== 基础验证方法 ====================
  
  /**
   * 验证单个日期值
   * @param value 日期值
   * @param rules 验证规则
   * @param context 验证上下文
   * @returns 验证结果
   */
  static validate(
    value: DateValue,
    rules: ValidationRule[],
    context?: ValidationContext
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const infos: ValidationInfo[] = [];
    
    for (const rule of rules) {
      if (!rule.enabled && rule.enabled !== undefined) {
        continue;
      }
      
      try {
        const result = this.validateRule(value, rule, context);
        
        if (result.error) {
          errors.push(result.error);
        }
        
        if (result.warning) {
          warnings.push(result.warning);
        }
        
        if (result.info) {
          infos.push(result.info);
        }
        
        // 如果配置了在第一个错误时停止，则立即返回
        if (result.error && context?.config.stopOnFirstError) {
          break;
        }
      } catch (error) {
        errors.push({
          type: rule.type,
          message: `验证规则执行失败: ${error instanceof Error ? error.message : String(error)}`,
          code: 'VALIDATION_ERROR',
          value
        });
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos
    };
  }
  
  /**
   * 验证日期范围
   * @param range 日期范围
   * @param rules 验证规则
   * @param context 验证上下文
   * @returns 验证结果
   */
  static validateRange(
    range: DateRange,
    rules: ValidationRule[],
    context?: ValidationContext
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const infos: ValidationInfo[] = [];
    
    // 验证开始日期
    const startResult = this.validate(range.start, rules, context);
    errors.push(...startResult.errors);
    warnings.push(...startResult.warnings);
    infos.push(...startResult.infos);
    
    // 验证结束日期
    const endResult = this.validate(range.end, rules, context);
    errors.push(...endResult.errors);
    warnings.push(...endResult.warnings);
    infos.push(...endResult.infos);
    
    // 验证范围逻辑
    const startDate = DateUtils.toDate(range.start);
    const endDate = DateUtils.toDate(range.end);
    
    if (startDate && endDate && DateUtils.isAfter(startDate, endDate)) {
      errors.push({
        type: 'dateRange',
        message: '开始日期不能晚于结束日期',
        code: 'INVALID_RANGE',
        value: range,
        field: 'range'
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos
    };
  }
  
  /**
   * 验证多个日期
   * @param values 多个日期
   * @param rules 验证规则
   * @param context 验证上下文
   * @returns 验证结果
   */
  static validateMultiple(
    values: MultipleDates,
    rules: ValidationRule[],
    context?: ValidationContext
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const infos: ValidationInfo[] = [];
    
    for (let i = 0; i < values.length; i++) {
      const result = this.validate(values[i], rules, context);
      
      // 为错误添加索引信息
      result.errors.forEach(error => {
        errors.push({
          ...error,
          field: `${error.field || 'date'}[${i}]`
        });
      });
      
      result.warnings.forEach(warning => {
        warnings.push({
          ...warning,
          field: `${warning.field || 'date'}[${i}]`
        });
      });
      
      result.infos.forEach(info => {
        infos.push({
          ...info,
          field: `${info.field || 'date'}[${i}]`
        });
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos
    };
  }
  
  // ==================== 规则验证方法 ====================
  
  /**
   * 验证单个规则
   * @param value 日期值
   * @param rule 验证规则
   * @param context 验证上下文
   * @returns 验证结果
   */
  private static validateRule(
    value: DateValue,
    rule: ValidationRule,
    context?: ValidationContext
  ): {
    error?: ValidationError;
    warning?: ValidationWarning;
    info?: ValidationInfo;
  } {
    switch (rule.type) {
      case 'required':
        return this.validateRequired(value, rule as RequiredRule);
      
      case 'minDate':
        return this.validateMinDate(value, rule as MinDateRule);
      
      case 'maxDate':
        return this.validateMaxDate(value, rule as MaxDateRule);
      
      case 'dateRange':
        return this.validateDateRange(value, rule as DateRangeRule);
      
      case 'format':
        return this.validateFormat(value, rule as FormatRule);
      
      case 'custom':
        return this.validateCustom(value, rule as CustomRule, context);
      
      case 'weekday':
        return this.validateWeekday(value, rule as WeekdayRule);
      
      case 'holiday':
        return this.validateHoliday(value, rule as HolidayRule);
      
      case 'businessDay':
        return this.validateBusinessDay(value, rule as BusinessDayRule);
      
      default:
        return {};
    }
  }
  
  /**
   * 验证必填规则
   * @param value 日期值
   * @param rule 必填规则
   * @returns 验证结果
   */
  private static validateRequired(
    value: DateValue,
    rule: RequiredRule
  ): { error?: ValidationError } {
    if (!rule.required) {
      return {};
    }
    
    const date = DateUtils.toDate(value);
    if (!date) {
      return {
        error: {
          type: 'required',
          message: rule.message || '此字段为必填项',
          code: 'REQUIRED',
          value
        }
      };
    }
    
    return {};
  }
  
  /**
   * 验证最小日期规则
   * @param value 日期值
   * @param rule 最小日期规则
   * @returns 验证结果
   */
  private static validateMinDate(
    value: DateValue,
    rule: MinDateRule
  ): { error?: ValidationError } {
    const date = DateUtils.toDate(value);
    const minDate = DateUtils.toDate(rule.minDate);
    
    if (!date || !minDate) {
      return {};
    }
    
    const isValid = rule.inclusive !== false
      ? !DateUtils.isBefore(date, minDate)
      : DateUtils.isAfter(date, minDate);
    
    if (!isValid) {
      const operator = rule.inclusive !== false ? '不能早于' : '必须晚于';
      return {
        error: {
          type: 'minDate',
          message: rule.message || `日期${operator}${DateUtils.format(minDate)}`,
          code: 'MIN_DATE',
          value,
          expected: rule.minDate
        }
      };
    }
    
    return {};
  }
  
  /**
   * 验证最大日期规则
   * @param value 日期值
   * @param rule 最大日期规则
   * @returns 验证结果
   */
  private static validateMaxDate(
    value: DateValue,
    rule: MaxDateRule
  ): { error?: ValidationError } {
    const date = DateUtils.toDate(value);
    const maxDate = DateUtils.toDate(rule.maxDate);
    
    if (!date || !maxDate) {
      return {};
    }
    
    const isValid = rule.inclusive !== false
      ? !DateUtils.isAfter(date, maxDate)
      : DateUtils.isBefore(date, maxDate);
    
    if (!isValid) {
      const operator = rule.inclusive !== false ? '不能晚于' : '必须早于';
      return {
        error: {
          type: 'maxDate',
          message: rule.message || `日期${operator}${DateUtils.format(maxDate)}`,
          code: 'MAX_DATE',
          value,
          expected: rule.maxDate
        }
      };
    }
    
    return {};
  }
  
  /**
   * 验证日期范围规则
   * @param value 日期值
   * @param rule 日期范围规则
   * @returns 验证结果
   */
  private static validateDateRange(
    value: DateValue,
    rule: DateRangeRule
  ): { error?: ValidationError } {
    const date = DateUtils.toDate(value);
    
    if (!date) {
      return {};
    }
    
    const isInRange = DateUtils.isInRange(date, rule.range, rule.inclusive);
    
    if (!isInRange) {
      const start = DateUtils.format(rule.range.start);
      const end = DateUtils.format(rule.range.end);
      return {
        error: {
          type: 'dateRange',
          message: rule.message || `日期必须在${start}到${end}之间`,
          code: 'DATE_RANGE',
          value,
          expected: rule.range
        }
      };
    }
    
    return {};
  }
  
  /**
   * 验证格式规则
   * @param value 日期值
   * @param rule 格式规则
   * @returns 验证结果
   */
  private static validateFormat(
    value: DateValue,
    rule: FormatRule
  ): { error?: ValidationError } {
    if (typeof value !== 'string') {
      return {};
    }

    let isValid = false;

    if (typeof rule.format === 'string') {
      // 简单格式验证
      const parsed = DateUtils.parse(value, rule.format);
      isValid = parsed !== null;
    } else if (rule.format instanceof RegExp) {
      // 正则表达式验证
      isValid = rule.format.test(value);
    }

    if (!isValid) {
      return {
        error: {
          type: 'format',
          message: rule.message || '日期格式不正确',
          code: 'INVALID_FORMAT',
          value,
          expected: rule.format
        }
      };
    }

    return {};
  }

  /**
   * 验证自定义规则
   * @param value 日期值
   * @param rule 自定义规则
   * @param context 验证上下文
   * @returns 验证结果
   */
  private static validateCustom(
    value: DateValue,
    rule: CustomRule,
    context?: ValidationContext
  ): { error?: ValidationError } {
    try {
      const isValid = rule.validator(value, context);

      if (rule.async && isValid instanceof Promise) {
        // 异步验证需要特殊处理，这里先返回空结果
        // 实际项目中可能需要返回Promise或使用回调
        return {};
      }

      if (!isValid) {
        return {
          error: {
            type: 'custom',
            message: rule.message || '自定义验证失败',
            code: 'CUSTOM_VALIDATION',
            value
          }
        };
      }
    } catch (error) {
      return {
        error: {
          type: 'custom',
          message: rule.message || `自定义验证错误: ${error instanceof Error ? error.message : String(error)}`,
          code: 'CUSTOM_ERROR',
          value
        }
      };
    }

    return {};
  }

  /**
   * 验证星期规则
   * @param value 日期值
   * @param rule 星期规则
   * @returns 验证结果
   */
  private static validateWeekday(
    value: DateValue,
    rule: WeekdayRule
  ): { error?: ValidationError } {
    const date = DateUtils.toDate(value);

    if (!date) {
      return {};
    }

    const weekday = date.getDay();

    // 检查禁用的星期
    if (rule.disabledWeekdays && rule.disabledWeekdays.includes(weekday)) {
      return {
        error: {
          type: 'weekday',
          message: rule.message || `不允许选择${DateUtils.getWeekdayName(date)}`,
          code: 'DISABLED_WEEKDAY',
          value,
          expected: rule.allowedWeekdays
        }
      };
    }

    // 检查允许的星期
    if (rule.allowedWeekdays && !rule.allowedWeekdays.includes(weekday)) {
      const allowedNames = rule.allowedWeekdays
        .map(day => {
          const tempDate = new Date();
          tempDate.setDate(tempDate.getDate() - tempDate.getDay() + day);
          return DateUtils.getWeekdayName(tempDate);
        })
        .join('、');

      return {
        error: {
          type: 'weekday',
          message: rule.message || `只允许选择${allowedNames}`,
          code: 'INVALID_WEEKDAY',
          value,
          expected: rule.allowedWeekdays
        }
      };
    }

    return {};
  }

  /**
   * 验证节假日规则
   * @param value 日期值
   * @param rule 节假日规则
   * @returns 验证结果
   */
  private static validateHoliday(
    value: DateValue,
    rule: HolidayRule
  ): { error?: ValidationError } {
    const date = DateUtils.toDate(value);

    if (!date) {
      return {};
    }

    const isHoliday = rule.holidays.some(holiday => {
      const holidayDate = DateUtils.toDate(holiday);
      return holidayDate && DateUtils.isSameDay(date, holidayDate);
    });

    if (isHoliday && !rule.allowHolidays) {
      return {
        error: {
          type: 'holiday',
          message: rule.message || '不允许选择节假日',
          code: 'HOLIDAY_NOT_ALLOWED',
          value
        }
      };
    }

    if (!isHoliday && rule.allowHolidays === false) {
      return {
        error: {
          type: 'holiday',
          message: rule.message || '只允许选择节假日',
          code: 'ONLY_HOLIDAYS_ALLOWED',
          value
        }
      };
    }

    return {};
  }

  /**
   * 验证工作日规则
   * @param value 日期值
   * @param rule 工作日规则
   * @returns 验证结果
   */
  private static validateBusinessDay(
    value: DateValue,
    rule: BusinessDayRule
  ): { error?: ValidationError } {
    const date = DateUtils.toDate(value);

    if (!date) {
      return {};
    }

    const weekday = date.getDay();
    let isBusinessDay = false;

    if (rule.customBusinessDays) {
      isBusinessDay = rule.customBusinessDays.includes(weekday);
    } else {
      // 默认工作日为周一到周五 (1-5)
      isBusinessDay = weekday >= 1 && weekday <= 5;
    }

    if (rule.businessDaysOnly && !isBusinessDay) {
      return {
        error: {
          type: 'businessDay',
          message: rule.message || '只允许选择工作日',
          code: 'BUSINESS_DAY_ONLY',
          value
        }
      };
    }

    return {};
  }

  // ==================== 工具方法 ====================

  /**
   * 创建验证错误
   * @param type 错误类型
   * @param message 错误消息
   * @param code 错误代码
   * @param value 错误值
   * @param expected 期望值
   * @param field 字段名
   * @returns 验证错误
   */
  static createError(
    type: string,
    message: string,
    code: string,
    value?: any,
    expected?: any,
    field?: string
  ): ValidationError {
    return {
      type: type as any,
      message,
      code,
      value,
      expected,
      field
    };
  }

  /**
   * 创建验证警告
   * @param type 警告类型
   * @param message 警告消息
   * @param code 警告代码
   * @param value 警告值
   * @param field 字段名
   * @returns 验证警告
   */
  static createWarning(
    type: string,
    message: string,
    code: string,
    value?: any,
    field?: string
  ): ValidationWarning {
    return {
      type: type as any,
      message,
      code,
      value,
      field
    };
  }

  /**
   * 创建验证提示
   * @param type 提示类型
   * @param message 提示消息
   * @param code 提示代码
   * @param value 提示值
   * @param field 字段名
   * @returns 验证提示
   */
  static createInfo(
    type: string,
    message: string,
    code: string,
    value?: any,
    field?: string
  ): ValidationInfo {
    return {
      type: type as any,
      message,
      code,
      value,
      field
    };
  }

  /**
   * 合并验证结果
   * @param results 验证结果数组
   * @returns 合并后的验证结果
   */
  static mergeResults(results: ValidationResult[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const infos: ValidationInfo[] = [];

    results.forEach(result => {
      errors.push(...result.errors);
      warnings.push(...result.warnings);
      infos.push(...result.infos);
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos
    };
  }
}
