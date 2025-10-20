/**
 * @ldesign/i18n - Enhanced Error Handling
 * Improved error messages, debugging, and developer experience
 */

import type { Locale, MessageKey, TranslateOptions } from '../types';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * I18n error types
 */
export enum I18nErrorType {
  MISSING_KEY = 'MISSING_KEY',
  INVALID_LOCALE = 'INVALID_LOCALE',
  LOADER_ERROR = 'LOADER_ERROR',
  INTERPOLATION_ERROR = 'INTERPOLATION_ERROR',
  PLURALIZATION_ERROR = 'PLURALIZATION_ERROR',
  FORMAT_ERROR = 'FORMAT_ERROR',
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  NAMESPACE_ERROR = 'NAMESPACE_ERROR',
}

/**
 * Enhanced error class for i18n
 */
export class I18nError extends Error {
  public readonly type: I18nErrorType;
  public readonly severity: ErrorSeverity;
  public readonly context: Record<string, any>;
  public readonly timestamp: Date;
  public readonly suggestions: string[];
  public readonly documentation?: string;

  constructor(
    type: I18nErrorType,
    message: string,
    options: {
      severity?: ErrorSeverity;
      context?: Record<string, any>;
      suggestions?: string[];
      documentation?: string;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'I18nError';
    this.type = type;
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.context = options.context || {};
    this.suggestions = options.suggestions || [];
    this.documentation = options.documentation;
    this.timestamp = new Date();
    
    // Set cause if provided (ES2022)
    if (options.cause && 'cause' in Error.prototype) {
      (this as any).cause = options.cause;
    }
    
    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, I18nError);
    }
  }

  /**
   * Format error for console output
   */
  toConsoleMessage(): string {
    const lines: string[] = [
      `[I18n ${this.severity.toUpperCase()}] ${this.type}`,
      `Message: ${this.message}`,
    ];

    if (Object.keys(this.context).length > 0) {
      lines.push(`Context: ${JSON.stringify(this.context, null, 2)}`);
    }

    if (this.suggestions.length > 0) {
      lines.push('Suggestions:');
      this.suggestions.forEach(s => lines.push(`  - ${s}`));
    }

    if (this.documentation) {
      lines.push(`Documentation: ${this.documentation}`);
    }

    return lines.join('\n');
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      type: this.type,
      severity: this.severity,
      message: this.message,
      context: this.context,
      suggestions: this.suggestions,
      documentation: this.documentation,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Error handler with detailed debugging
 */
export class ErrorHandler {
  private readonly isDev: boolean;
  private readonly errorLog: I18nError[] = [];
  private readonly maxLogSize: number;
  private errorCallbacks: Map<I18nErrorType, ((error: I18nError) => void)[]> = new Map();

  constructor(options: { isDev?: boolean; maxLogSize?: number } = {}) {
    this.isDev = options.isDev ?? (typeof window !== 'undefined' && (window as any).__DEV__ === true);
    this.maxLogSize = options.maxLogSize ?? 100;
  }

  /**
   * Handle missing translation key
   */
  handleMissingKey(
    key: MessageKey,
    locale: Locale,
    namespace?: string,
    options?: TranslateOptions
  ): string {
    const similarKeys = this.findSimilarKeys(key);
    const suggestions: string[] = [];

    // Add suggestions based on the error
    if (similarKeys.length > 0) {
      suggestions.push(`Did you mean: ${similarKeys.join(', ')}?`);
    }
    suggestions.push(`Check if the key "${key}" exists in locale "${locale}"`);
    suggestions.push('Ensure the locale messages are properly loaded');
    
    if (namespace) {
      suggestions.push(`Verify namespace "${namespace}" is loaded`);
    }

    const error = new I18nError(
      I18nErrorType.MISSING_KEY,
      `Translation key "${key}" not found for locale "${locale}"`,
      {
        severity: ErrorSeverity.WARNING,
        context: { key, locale, namespace, options },
        suggestions,
        documentation: 'https://docs.ldesign.io/i18n/missing-keys',
      }
    );

    this.logError(error);

    // Return debug message in development
    if (this.isDev) {
      return this.createDebugMessage(key, locale, namespace);
    }

    // Return fallback in production
    return options?.defaultValue || key;
  }

  /**
   * Handle interpolation errors
   */
  handleInterpolationError(
    template: string,
    params: Record<string, any>,
    error: Error
  ): string {
    const missingParams = this.findMissingParams(template, params);
    const suggestions: string[] = [];

    if (missingParams.length > 0) {
      suggestions.push(`Missing parameters: ${missingParams.join(', ')}`);
    }
    suggestions.push('Check parameter names match template placeholders');
    suggestions.push('Ensure parameter values are valid');

    const i18nError = new I18nError(
      I18nErrorType.INTERPOLATION_ERROR,
      `Interpolation failed for template: ${template}`,
      {
        severity: ErrorSeverity.ERROR,
        context: { template, params },
        suggestions,
        cause: error,
        documentation: 'https://docs.ldesign.io/i18n/interpolation',
      }
    );

    this.logError(i18nError);

    // Return template with error marker in development
    if (this.isDev) {
      return `[INTERPOLATION_ERROR: ${template}]`;
    }

    // Return original template in production
    return template;
  }

  /**
   * Handle loader errors
   */
  handleLoaderError(locale: Locale, namespace?: string, error?: Error): void {
    const suggestions = [
      `Check if locale file for "${locale}" exists`,
      'Verify network connectivity',
      'Check CORS settings if loading from external source',
      'Ensure the loader is properly configured',
    ];

    const i18nError = new I18nError(
      I18nErrorType.LOADER_ERROR,
      `Failed to load messages for locale "${locale}"${namespace ? ` (namespace: ${namespace})` : ''}`,
      {
        severity: ErrorSeverity.ERROR,
        context: { locale, namespace },
        suggestions,
        cause: error,
        documentation: 'https://docs.ldesign.io/i18n/loaders',
      }
    );

    this.logError(i18nError);
    this.emitError(i18nError);
  }

  /**
   * Handle configuration errors
   */
  handleConfigError(message: string, config: any): void {
    const suggestions = [
      'Review the configuration documentation',
      'Check for typos in configuration keys',
      'Ensure required fields are provided',
      'Validate data types match expected values',
    ];

    const error = new I18nError(
      I18nErrorType.CONFIG_ERROR,
      message,
      {
        severity: ErrorSeverity.CRITICAL,
        context: { config },
        suggestions,
        documentation: 'https://docs.ldesign.io/i18n/configuration',
      }
    );

    this.logError(error);
    throw error; // Configuration errors should halt execution
  }

  /**
   * Create debug message for missing keys
   */
  private createDebugMessage(key: string, locale: string, namespace?: string): string {
    const parts = [
      `[Missing: ${key}]`,
      `[Locale: ${locale}]`,
    ];
    
    if (namespace) {
      parts.push(`[NS: ${namespace}]`);
    }
    
    return parts.join(' ');
  }

  /**
   * Find similar keys (for suggestions)
   */
  private findSimilarKeys(key: string): string[] {
    // This would need access to available keys
    // For now, return empty array
    // In real implementation, use Levenshtein distance or similar algorithm
    return [];
  }

  /**
   * Find missing interpolation parameters
   */
  private findMissingParams(template: string, params: Record<string, any>): string[] {
    const placeholders = template.match(/\{\{?\s*(\w+)\s*\}?\}/g) || [];
    const missing: string[] = [];
    
    placeholders.forEach(placeholder => {
      const paramName = placeholder.replace(/\{\{?\s*|\s*\}?\}/g, '');
      if (!(paramName in params)) {
        missing.push(paramName);
      }
    });
    
    return missing;
  }

  /**
   * Log error
   */
  private logError(error: I18nError): void {
    // Add to log
    this.errorLog.push(error);
    
    // Trim log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }
    
    // Console output in development
    if (this.isDev) {
      const consoleMethod = this.getConsoleMethod(error.severity);
      console[consoleMethod](error.toConsoleMessage());
    }
  }

  /**
   * Get appropriate console method based on severity
   */
  private getConsoleMethod(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.INFO:
        return 'log';
      case ErrorSeverity.WARNING:
        return 'warn';
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'log';
    }
  }

  /**
   * Register error callback
   */
  onError(type: I18nErrorType, callback: (error: I18nError) => void): void {
    if (!this.errorCallbacks.has(type)) {
      this.errorCallbacks.set(type, []);
    }
    this.errorCallbacks.get(type)!.push(callback);
  }

  /**
   * Emit error to registered callbacks
   */
  private emitError(error: I18nError): void {
    const callbacks = this.errorCallbacks.get(error.type) || [];
    callbacks.forEach(cb => cb(error));
  }

  /**
   * Get error log
   */
  getErrorLog(): I18nError[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog.length = 0;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): Record<I18nErrorType, number> {
    const stats: Record<string, number> = {};
    
    for (const error of this.errorLog) {
      stats[error.type] = (stats[error.type] || 0) + 1;
    }
    
    return stats as Record<I18nErrorType, number>;
  }

  /**
   * Export errors for debugging
   */
  exportErrors(): string {
    return JSON.stringify(
      this.errorLog.map(e => e.toJSON()),
      null,
      2
    );
  }
}

/**
 * Global error handler instance
 */
export const globalErrorHandler = new ErrorHandler();

/**
 * Utility function for safe translation with error boundary
 */
export function safeTranslate(
  translateFn: () => string,
  fallback: string
): string {
  try {
    return translateFn();
  } catch (error) {
    if (typeof window !== 'undefined' && (window as any).__DEV__ === true) {
      console.error('[I18n] Translation failed:', error);
    }
    return fallback;
  }
}

/**
 * Assertion utilities for development
 */
export const assert = {
  /**
   * Assert locale is valid
   */
  locale(locale: string): void {
    if (!locale || typeof locale !== 'string') {
      throw new I18nError(
        I18nErrorType.INVALID_LOCALE,
        `Invalid locale: ${locale}`,
        {
          severity: ErrorSeverity.ERROR,
          suggestions: [
            'Locale must be a non-empty string',
            'Use format like "en", "en-US", "zh-CN"',
          ],
        }
      );
    }
  },

  /**
   * Assert key is valid
   */
  key(key: string): void {
    if (!key || typeof key !== 'string') {
      throw new I18nError(
        I18nErrorType.MISSING_KEY,
        `Invalid translation key: ${key}`,
        {
          severity: ErrorSeverity.ERROR,
          suggestions: [
            'Key must be a non-empty string',
            'Use dot notation for nested keys: "page.title"',
          ],
        }
      );
    }
  },

  /**
   * Assert configuration is valid
   */
  config(config: any, requiredFields: string[] = []): void {
    if (!config || typeof config !== 'object') {
      throw new I18nError(
        I18nErrorType.CONFIG_ERROR,
        'Invalid configuration object',
        {
          severity: ErrorSeverity.CRITICAL,
          suggestions: ['Configuration must be an object'],
        }
      );
    }

    for (const field of requiredFields) {
      if (!(field in config)) {
        throw new I18nError(
          I18nErrorType.CONFIG_ERROR,
          `Missing required configuration field: ${field}`,
          {
            severity: ErrorSeverity.CRITICAL,
            context: { config, requiredFields },
          }
        );
      }
    }
  },
};

/**
 * Development-only warning utility
 */
export function warn(message: string, details?: any): void {
  if (typeof window !== 'undefined' && (window as any).__DEV__ === true) {
    console.warn(`[I18n Warning] ${message}`, details || '');
  }
}

/**
 * Development-only info utility
 */
export function info(message: string, details?: any): void {
  if (typeof window !== 'undefined' && (window as any).__DEV__ === true) {
    console.info(`[I18n Info] ${message}`, details || '');
  }
}

/**
 * Create error boundary for components
 */
export function createErrorBoundary(
  componentName: string,
  fallback: any
): (error: Error) => any {
  return (error: Error) => {
    const i18nError = new I18nError(
      I18nErrorType.PLUGIN_ERROR,
      `Component "${componentName}" encountered an error`,
      {
        severity: ErrorSeverity.ERROR,
        context: { componentName },
        cause: error,
        suggestions: [
          'Check component props are valid',
          'Ensure i18n instance is properly initialized',
          'Review component implementation',
        ],
      }
    );

    (globalErrorHandler as any).logError(i18nError);
    
    return fallback;
  };
}