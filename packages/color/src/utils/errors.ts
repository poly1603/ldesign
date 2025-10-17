/**
 * @ldesign/color - Error Handling System
 * 
 * Comprehensive error handling with detailed types and recovery suggestions
 */

/**
 * 错误严重级别
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * 错误类别
 */
export enum ErrorCategory {
  INPUT_VALIDATION = 'input_validation',
  COLOR_CONVERSION = 'color_conversion',
  COLOR_MANIPULATION = 'color_manipulation',
  CACHE_OPERATION = 'cache_operation',
  THEME_OPERATION = 'theme_operation',
  PLUGIN_OPERATION = 'plugin_operation',
  SYSTEM = 'system'
}

/**
 * 错误恢复建议
 */
export interface RecoverySuggestion {
  action: string;
  description: string;
  code?: string;
}

/**
 * 基础颜色错误类
 */
export class ColorError extends Error {
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly timestamp: Date;
  public readonly context?: any;
  public readonly suggestions: RecoverySuggestion[];
  
  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    suggestions: RecoverySuggestion[] = [],
    context?: any
  ) {
    super(message);
    this.name = 'ColorError';
    this.severity = severity;
    this.category = category;
    this.timestamp = new Date();
    this.context = context;
    this.suggestions = suggestions;
    
    // 保持原型链
    Object.setPrototypeOf(this, ColorError.prototype);
  }
  
  /**
   * 获取格式化的错误信息
   */
  toDetailedString(): string {
    return `
[${this.name}] ${this.message}
Severity: ${this.severity}
Category: ${this.category}
Timestamp: ${this.timestamp.toISOString()}
${this.context ? `Context: ${JSON.stringify(this.context, null, 2)}` : ''}
${this.suggestions.length > 0 ? `
Recovery Suggestions:
${this.suggestions.map(s => `- ${s.action}: ${s.description}`).join('\n')}
` : ''}
Stack: ${this.stack}
    `.trim();
  }
}

/**
 * 输入验证错误
 */
export class InputValidationError extends ColorError {
  constructor(
    message: string,
    inputValue: any,
    expectedFormat?: string
  ) {
    const suggestions: RecoverySuggestion[] = [
      {
        action: '检查输入格式',
        description: expectedFormat || '确保输入值符合支持的颜色格式',
        code: `// 支持的格式:\n// HEX: "#RGB", "#RRGGBB", "#RRGGBBAA"\n// RGB: {r: 0-255, g: 0-255, b: 0-255}\n// HSL: {h: 0-360, s: 0-100, l: 0-100}\n// 命名颜色: "red", "blue", etc.`
      },
      {
        action: '使用默认值',
        description: '当输入无效时，使用默认颜色值',
        code: `const color = new Color(input || '#000000');`
      }
    ];
    
    super(
      message,
      ErrorCategory.INPUT_VALIDATION,
      ErrorSeverity.LOW,
      suggestions,
      { inputValue, expectedFormat }
    );
    
    this.name = 'InputValidationError';
  }
}

/**
 * 颜色转换错误
 */
export class ColorConversionError extends ColorError {
  constructor(
    message: string,
    fromFormat: string,
    toFormat: string,
    value: any
  ) {
    const suggestions: RecoverySuggestion[] = [
      {
        action: '检查值范围',
        description: `确保${fromFormat}值在有效范围内`,
        code: `// ${fromFormat}有效范围:\n${getFormatRanges(fromFormat)}`
      },
      {
        action: '使用安全转换',
        description: '使用带范围限制的转换方法',
        code: `const safeValue = clamp(value, min, max);`
      }
    ];
    
    super(
      message,
      ErrorCategory.COLOR_CONVERSION,
      ErrorSeverity.MEDIUM,
      suggestions,
      { fromFormat, toFormat, value }
    );
    
    this.name = 'ColorConversionError';
  }
}

/**
 * 颜色操作错误
 */
export class ColorManipulationError extends ColorError {
  constructor(
    message: string,
    operation: string,
    parameters: any
  ) {
    const suggestions: RecoverySuggestion[] = [
      {
        action: '检查参数范围',
        description: `确保${operation}操作的参数在有效范围内`,
        code: `// 常见操作参数范围:\n// lighten/darken: 0-100\n// saturate/desaturate: 0-100\n// rotate: -360 to 360\n// alpha: 0-1`
      },
      {
        action: '使用链式操作',
        description: '将复杂操作分解为多个简单步骤',
        code: `color.lighten(10).saturate(20).rotate(30)`
      }
    ];
    
    super(
      message,
      ErrorCategory.COLOR_MANIPULATION,
      ErrorSeverity.LOW,
      suggestions,
      { operation, parameters }
    );
    
    this.name = 'ColorManipulationError';
  }
}

/**
 * 主题操作错误
 */
export class ThemeOperationError extends ColorError {
  constructor(
    message: string,
    operation: string,
    themeData?: any
  ) {
    const suggestions: RecoverySuggestion[] = [
      {
        action: '验证主题数据',
        description: '确保主题数据结构正确',
        code: `// 主题结构示例:\n{\n  primaryColor: '#3498db',\n  themeName: 'ocean',\n  customColors: {...}\n}`
      },
      {
        action: '使用默认主题',
        description: '回退到默认主题配置',
        code: `themeManager.applyTheme('blue')`
      }
    ];
    
    super(
      message,
      ErrorCategory.THEME_OPERATION,
      ErrorSeverity.MEDIUM,
      suggestions,
      { operation, themeData }
    );
    
    this.name = 'ThemeOperationError';
  }
}

/**
 * 错误日志管理器
 */
export class ErrorLogger {
  private static errors: ColorError[] = [];
  private static maxErrors = 100;
  private static errorHandlers: ((error: ColorError) => void)[] = [];
  
  /**
   * 记录错误
   */
  static log(error: ColorError): void {
    this.errors.push(error);
    
    // 限制错误日志大小
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }
    
    // 触发错误处理器
    this.errorHandlers.forEach(handler => handler(error));
    
    // 开发环境下输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.error(error.toDetailedString());
    }
  }
  
  /**
   * 获取错误日志
   */
  static getErrors(
    filter?: {
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      since?: Date;
    }
  ): ColorError[] {
    let filtered = [...this.errors];
    
    if (filter) {
      if (filter?.category) {
        filtered = filtered.filter(e => e.category === filter.category);
      }
      if (filter?.severity) {
        filtered = filtered.filter(e => e.severity === filter.severity);
      }
      if (filter.since) {
        filtered = filtered.filter(e => e.timestamp >= filter.since!);
      }
    }
    
    return filtered;
  }
  
  /**
   * 清除错误日志
   */
  static clear(): void {
    this.errors = [];
  }
  
  /**
   * 添加错误处理器
   */
  static addHandler(handler: (error: ColorError) => void): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }
  
  /**
   * 生成错误报告
   */
  static generateReport(): string {
    const errorsByCategory = new Map<ErrorCategory, number>();
    const errorsBySeverity = new Map<ErrorSeverity, number>();
    
    this.errors.forEach(error => {
      errorsByCategory.set(
        error.category,
        (errorsByCategory.get(error.category) || 0) + 1
      );
      errorsBySeverity.set(
        error.severity,
        (errorsBySeverity.get(error.severity) || 0) + 1
      );
    });
    
    return `
Error Report
============
Total Errors: ${this.errors.length}

By Category:
${Array.from(errorsByCategory.entries())
  .map(([cat, count]) => `  ${cat}: ${count}`)
  .join('\n')}

By Severity:
${Array.from(errorsBySeverity.entries())
  .map(([sev, count]) => `  ${sev}: ${count}`)
  .join('\n')}

Recent Errors:
${this.errors.slice(-5).map(e => `  - ${e.message}`).join('\n')}
    `.trim();
  }
}

/**
 * 错误恢复辅助函数
 */
export class ErrorRecovery {
  /**
   * 安全执行函数
   */
  static safeExecute<T>(
    fn: () => T,
    fallback: T,
    errorHandler?: (error: Error) => void
  ): T {
    try {
      return fn();
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error);
      }
      return fallback;
    }
  }
  
  /**
   * 带重试的执行
   */
  static async retryExecute<T>(
    fn: () => T | Promise<T>,
    maxRetries = 3,
    delay = 100
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }
    
    throw lastError;
  }
}

// 辅助函数
function getFormatRanges(format: string): string {
  const ranges: Record<string, string> = {
    RGB: 'r: 0-255, g: 0-255, b: 0-255',
    HSL: 'h: 0-360, s: 0-100, l: 0-100',
    HSV: 'h: 0-360, s: 0-100, v: 0-100',
    HEX: '#000000 - #FFFFFF',
    LAB: 'l: 0-100, a: -128-127, b: -128-127'
  };
  
  return ranges[format.toUpperCase()] || 'Unknown format';
}

// 导出便捷函数
export const logError = ErrorLogger.log.bind(ErrorLogger);
export const safeExecute = ErrorRecovery.safeExecute;
export const retryExecute = ErrorRecovery.retryExecute;