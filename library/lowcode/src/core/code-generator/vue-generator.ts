/**
 * Vue 代码生成器
 * 支持 Composition API 和 Options API 两种风格
 */

import type { LowcodeSchema, ComponentNode, CodeGeneratorOptions, GeneratedCode, CodeGenContext } from '../../types';
import { CompositionAPIGenerator } from './composition-api-generator';
import { OptionsAPIGenerator } from './options-api-generator';
import { TemplateGenerator } from './template-generator';
import { StyleGenerator } from './style-generator';
import { ImportGenerator } from './import-generator';

/**
 * Vue 代码生成器类
 */
export class VueCodeGenerator {
  private templateGenerator: TemplateGenerator;
  private importGenerator: ImportGenerator;
  private styleGenerator: StyleGenerator;
  private compositionGenerator: CompositionAPIGenerator;
  private optionsGenerator: OptionsAPIGenerator;

  constructor() {
    this.templateGenerator = new TemplateGenerator();
    this.importGenerator = new ImportGenerator();
    this.styleGenerator = new StyleGenerator();
    this.compositionGenerator = new CompositionAPIGenerator();
    this.optionsGenerator = new OptionsAPIGenerator();
  }

  /**
   * 生成完整的 Vue 代码
   */
  generate(schema: LowcodeSchema, options?: Partial<CodeGeneratorOptions>): GeneratedCode {
    const opts = this.normalizeOptions(options);
    const context = this.createContext(schema, opts);

    // 生成各部分代码
    const template = this.generateTemplate(schema, context);
    const script = this.generateScript(schema, context);
    const style = this.generateStyle(schema, context);

    // 组合完整代码
    const full = this.combineCode(template, script, style);

    // 收集依赖和导入
    const dependencies = Array.from(context.importedComponents);
    const imports = this.importGenerator.generate(context);

    return {
      template,
      script,
      style,
      full,
      dependencies,
      imports
    };
  }

  /**
   * 生成模板代码
   */
  generateTemplate(schema: LowcodeSchema, context: CodeGenContext): string {
    return this.templateGenerator.generate(schema, context);
  }

  /**
   * 生成脚本代码
   */
  generateScript(schema: LowcodeSchema, context: CodeGenContext): string {
    if (context.options.apiStyle === 'composition') {
      return this.compositionGenerator.generate(schema, context);
    } else {
      return this.optionsGenerator.generate(schema, context);
    }
  }

  /**
   * 生成样式代码
   */
  generateStyle(schema: LowcodeSchema, context: CodeGenContext): string {
    return this.styleGenerator.generate(schema, context);
  }

  /**
   * 标准化选项
   */
  private normalizeOptions(options?: Partial<CodeGeneratorOptions>): CodeGeneratorOptions {
    return {
      apiStyle: options?.apiStyle || 'composition',
      typescript: options?.typescript ?? true,
      format: options?.format ?? true,
      indentSize: options?.indentSize || 2,
      useSemicolon: options?.useSemicolon ?? false,
      quoteStyle: options?.quoteStyle || 'single',
      comments: options?.comments ?? true,
      importStyle: options?.importStyle || 'alias'
    };
  }

  /**
   * 创建生成上下文
   */
  private createContext(schema: LowcodeSchema, options: CodeGeneratorOptions): CodeGenContext {
    return {
      schema,
      options,
      importedComponents: new Set<string>(),
      usedVariables: new Set<string>(),
      indentLevel: 0
    };
  }

  /**
   * 组合代码
   */
  private combineCode(template: string, script: string, style: string): string {
    let code = template;

    if (script) {
      code += '\n\n' + script;
    }

    if (style) {
      code += '\n\n' + style;
    }

    return code;
  }

  /**
   * 格式化代码
   */
  formatCode(code: string, options: CodeGeneratorOptions): string {
    if (!options.format) return code;

    // 简单的格式化逻辑
    // 实际项目中可以使用 prettier 等工具
    let formatted = code;

    // 处理缩进
    const indent = ' '.repeat(options.indentSize);
    formatted = formatted.replace(/\t/g, indent);

    // 处理分号
    if (!options.useSemicolon) {
      formatted = formatted.replace(/;$/gm, '');
    }

    // 处理引号
    if (options.quoteStyle === 'single') {
      formatted = formatted.replace(/"/g, "'");
    }

    return formatted;
  }
}

/**
 * 创建代码生成器实例
 */
export function createVueGenerator(): VueCodeGenerator {
  return new VueCodeGenerator();
}



