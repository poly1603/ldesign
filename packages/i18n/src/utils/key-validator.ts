/**
 * @ldesign/i18n - Key Validator & Type Generator
 * 翻译键验证和TypeScript类型生成工具
 */

import type { Messages, Locale } from '../types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 验证结果
 */
export interface ValidationResult {
  valid: boolean;
  missingKeys: string[];
  extraKeys: string[];
  suggestions: Map<string, string[]>;
  warnings: string[];
}

/**
 * 翻译键验证器
 */
export class KeyValidator {
  private referenceMessages: Messages;
  private referenceLocale: Locale;
  private strictMode: boolean;

  constructor(referenceMessages: Messages, referenceLocale: Locale = 'en', strictMode = false) {
    this.referenceMessages = referenceMessages;
    this.referenceLocale = referenceLocale;
    this.strictMode = strictMode;
  }

  /**
   * 验证翻译键
   */
  validate(messages: Messages, locale: Locale): ValidationResult {
    const result: ValidationResult = {
      valid: true,
      missingKeys: [],
      extraKeys: [],
      suggestions: new Map(),
      warnings: []
    };

    const referenceKeys = this.extractKeys(this.referenceMessages);
    const targetKeys = this.extractKeys(messages);

    // 查找缺失的键
    for (const key of referenceKeys) {
      if (!targetKeys.has(key)) {
        result.missingKeys.push(key);
        result.valid = false;

        // 生成建议
        const suggestions = this.findSimilarKeys(key, targetKeys);
        if (suggestions.length > 0) {
          result.suggestions.set(key, suggestions);
        }
      }
    }

    // 查找额外的键（可能是拼写错误）
    if (this.strictMode) {
      for (const key of targetKeys) {
        if (!referenceKeys.has(key)) {
          result.extraKeys.push(key);
          result.warnings.push(`Extra key found: "${key}" in ${locale}`);

          // 生成建议
          const suggestions = this.findSimilarKeys(key, referenceKeys);
          if (suggestions.length > 0) {
            result.suggestions.set(key, suggestions);
          }
        }
      }
    }

    // 检查插值参数
    this.validateInterpolations(messages, result);

    return result;
  }

  /**
   * 批量验证多个语言
   */
  validateAll(allMessages: Record<Locale, Messages>): Map<Locale, ValidationResult> {
    const results = new Map<Locale, ValidationResult>();

    for (const [locale, messages] of Object.entries(allMessages)) {
      if (locale !== this.referenceLocale) {
        results.set(locale, this.validate(messages, locale));
      }
    }

    return results;
  }

  /**
   * 提取所有键
   */
  private extractKeys(messages: Messages, prefix = ''): Set<string> {
    const keys = new Set<string>();

    for (const [key, value] of Object.entries(messages)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        keys.add(fullKey);
      } else if (typeof value === 'object' && value !== null) {
        const nestedKeys = this.extractKeys(value as Messages, fullKey);
        nestedKeys.forEach(k => keys.add(k));
      }
    }

    return keys;
  }

  /**
   * 查找相似的键（用于建议）
   */
  private findSimilarKeys(key: string, keys: Set<string>): string[] {
    const suggestions: Array<{ key: string; distance: number }> = [];

    for (const candidateKey of keys) {
      const distance = this.levenshteinDistance(key, candidateKey);
      if (distance <= 3) { // 允许最多3个字符的差异
        suggestions.push({ key: candidateKey, distance });
      }
    }

    // 按相似度排序
    suggestions.sort((a, b) => a.distance - b.distance);
    return suggestions.slice(0, 5).map(s => s.key);
  }

  /**
   * 计算Levenshtein距离
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // 替换
            matrix[i][j - 1] + 1,     // 插入
            matrix[i - 1][j] + 1      // 删除
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * 验证插值参数
   */
  private validateInterpolations(messages: Messages, result: ValidationResult): void {
    const checkMessage = (message: string, key: string) => {
      const params = this.extractInterpolationParams(message);
      const referenceMessage = this.getMessageByKey(this.referenceMessages, key);
      
      if (referenceMessage && typeof referenceMessage === 'string') {
        const referenceParams = this.extractInterpolationParams(referenceMessage);
        
        // 检查参数是否匹配
        for (const param of referenceParams) {
          if (!params.includes(param)) {
            result.warnings.push(`Missing interpolation parameter "${param}" in key "${key}"`);
          }
        }
        
        for (const param of params) {
          if (!referenceParams.includes(param)) {
            result.warnings.push(`Extra interpolation parameter "${param}" in key "${key}"`);
          }
        }
      }
    };

    const traverse = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string') {
          checkMessage(value, fullKey);
        } else if (typeof value === 'object' && value !== null) {
          traverse(value, fullKey);
        }
      }
    };

    traverse(messages);
  }

  /**
   * 提取插值参数
   */
  private extractInterpolationParams(message: string): string[] {
    const params: string[] = [];
    const regex = /\{([^}]+)\}/g;
    let match;
    
    while ((match = regex.exec(message)) !== null) {
      params.push(match[1]);
    }
    
    return params;
  }

  /**
   * 根据键获取消息
   */
  private getMessageByKey(messages: Messages, key: string): string | undefined {
    const keys = key.split('.');
    let current: any = messages;
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return undefined;
      }
    }
    
    return typeof current === 'string' ? current : undefined;
  }
}

/**
 * TypeScript类型生成器
 */
export class TypeGenerator {
  /**
   * 生成TypeScript类型定义
   */
  static generateTypes(messages: Messages, typeName = 'TranslationKeys'): string {
    const lines: string[] = [];
    lines.push(`// Auto-generated translation keys`);
    lines.push(`// Do not edit this file manually\n`);
    lines.push(`export type ${typeName} =`);
    
    const keys = this.extractAllKeys(messages);
    keys.forEach((key, index) => {
      const prefix = index === 0 ? '  ' : '  | ';
      lines.push(`${prefix}'${key}'`);
    });
    
    lines.push(';\n');
    
    // 生成嵌套类型
    lines.push(`export interface ${typeName}Tree {`);
    this.generateNestedTypes(messages, lines, 2);
    lines.push('}\n');
    
    // 生成参数类型
    lines.push('export interface TranslationParams {');
    this.generateParamTypes(messages, lines);
    lines.push('}\n');
    
    return lines.join('\n');
  }

  /**
   * 生成并保存类型文件
   */
  static async generateTypeFile(
    messages: Messages,
    outputPath: string,
    typeName = 'TranslationKeys'
  ): Promise<void> {
    const types = this.generateTypes(messages, typeName);
    const dir = path.dirname(outputPath);
    
    // 确保目录存在
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(outputPath, types, 'utf-8');
  }

  /**
   * 提取所有键
   */
  private static extractAllKeys(messages: Messages, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const [key, value] of Object.entries(messages)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        keys.push(fullKey);
      } else if (typeof value === 'object' && value !== null) {
        keys.push(...this.extractAllKeys(value as Messages, fullKey));
      }
    }
    
    return keys;
  }

  /**
   * 生成嵌套类型
   */
  private static generateNestedTypes(
    messages: Messages,
    lines: string[],
    indent: number
  ): void {
    const spaces = ' '.repeat(indent);
    
    for (const [key, value] of Object.entries(messages)) {
      if (typeof value === 'string') {
        lines.push(`${spaces}${key}: string;`);
      } else if (typeof value === 'object' && value !== null) {
        lines.push(`${spaces}${key}: {`);
        this.generateNestedTypes(value as Messages, lines, indent + 2);
        lines.push(`${spaces}};`);
      }
    }
  }

  /**
   * 生成参数类型
   */
  private static generateParamTypes(messages: Messages, lines: string[]): void {
    const paramMap = new Map<string, Set<string>>();
    
    const extractParams = (obj: any, prefix = '') => {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'string') {
          const params = this.extractInterpolationParams(value);
          if (params.length > 0) {
            paramMap.set(fullKey, new Set(params));
          }
        } else if (typeof value === 'object' && value !== null) {
          extractParams(value, fullKey);
        }
      }
    };
    
    extractParams(messages);
    
    for (const [key, params] of paramMap) {
      lines.push(`  '${key}': {`);
      for (const param of params) {
        lines.push(`    ${param}: string | number;`);
      }
      lines.push('  };');
    }
  }

  /**
   * 提取插值参数
   */
  private static extractInterpolationParams(message: string): string[] {
    const params: string[] = [];
    const regex = /\{([^}]+)\}/g;
    let match;
    
    while ((match = regex.exec(message)) !== null) {
      const param = match[1].split(':')[0].trim(); // 移除格式化选项
      if (!params.includes(param)) {
        params.push(param);
      }
    }
    
    return params;
  }
}

/**
 * 开发时验证助手
 */
export class DevelopmentValidator {
  private validator: KeyValidator;
  private enabled: boolean;

  constructor(referenceMessages: Messages, enabled = true) {
    this.validator = new KeyValidator(referenceMessages);
    this.enabled = enabled;
  }

  /**
   * 验证翻译键是否存在
   */
  checkKey(key: string): boolean {
    if (!this.enabled) return true;
    
    const keys = this.extractKeys(this.validator['referenceMessages']);
    if (!keys.has(key)) {
      console.warn(`[i18n] Translation key "${key}" not found`);
      
      // 提供建议
      const suggestions = this.validator['findSimilarKeys'](key, keys);
      if (suggestions.length > 0) {
        console.warn(`[i18n] Did you mean: ${suggestions.join(', ')}?`);
      }
      
      return false;
    }
    
    return true;
  }

  /**
   * 提取键集合
   */
  private extractKeys(messages: Messages): Set<string> {
    return this.validator['extractKeys'](messages);
  }
}

/**
 * 创建验证器实例
 */
export function createKeyValidator(
  referenceMessages: Messages,
  referenceLocale?: Locale,
  strictMode?: boolean
): KeyValidator {
  return new KeyValidator(referenceMessages, referenceLocale, strictMode);
}

/**
 * 创建开发验证器
 */
export function createDevelopmentValidator(
  referenceMessages: Messages,
  enabled?: boolean
): DevelopmentValidator {
  return new DevelopmentValidator(referenceMessages, enabled);
}