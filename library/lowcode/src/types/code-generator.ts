/**
 * 代码生成器类型定义
 */

import type { LowcodeSchema } from './schema';

/**
 * 代码生成选项
 */
export interface CodeGeneratorOptions {
  /** API 风格 */
  apiStyle: 'composition' | 'options';
  /** 是否使用 TypeScript */
  typescript: boolean;
  /** 是否格式化代码 */
  format: boolean;
  /** 缩进大小 */
  indentSize: number;
  /** 是否使用分号 */
  useSemicolon: boolean;
  /** 引号类型 */
  quoteStyle: 'single' | 'double';
  /** 是否生成注释 */
  comments: boolean;
  /** 导入路径风格 */
  importStyle: 'relative' | 'absolute' | 'alias';
}

/**
 * 生成的代码
 */
export interface GeneratedCode {
  /** 模板代码 */
  template: string;
  /** 脚本代码 */
  script: string;
  /** 样式代码 */
  style: string;
  /** 完整代码 */
  full: string;
  /** 依赖列表 */
  dependencies: string[];
  /** 导入语句 */
  imports: string[];
}

/**
 * 代码生成上下文
 */
export interface CodeGenContext {
  /** Schema */
  schema: LowcodeSchema;
  /** 选项 */
  options: CodeGeneratorOptions;
  /** 已导入的组件 */
  importedComponents: Set<string>;
  /** 已使用的变量名 */
  usedVariables: Set<string>;
  /** 缩进级别 */
  indentLevel: number;
}

/**
 * 代码片段
 */
export interface CodeSnippet {
  /** 代码类型 */
  type: 'template' | 'script' | 'style' | 'import';
  /** 代码内容 */
  content: string;
  /** 优先级（用于排序） */
  priority?: number;
}

/**
 * 代码生成器接口
 */
export interface CodeGenerator {
  /** 生成代码 */
  generate(schema: LowcodeSchema, options?: Partial<CodeGeneratorOptions>): GeneratedCode;
  /** 生成模板 */
  generateTemplate(schema: LowcodeSchema, context: CodeGenContext): string;
  /** 生成脚本 */
  generateScript(schema: LowcodeSchema, context: CodeGenContext): string;
  /** 生成样式 */
  generateStyle(schema: LowcodeSchema, context: CodeGenContext): string;
}



