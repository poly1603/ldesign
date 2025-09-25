/**
 * 模板处理工具
 */

import { resolve, dirname, basename } from 'path';
import { readFile, writeFile, copyDir, ensureDir, findFiles } from './file';
import { Template, TemplateVariable, GeneratorContext } from '../types/index';

/**
 * 模板引擎
 */
export class TemplateEngine {
  private variables: Record<string, any> = {};
  private helpers: Record<string, Function> = {};

  constructor() {
    this.registerDefaultHelpers();
  }

  /**
   * 设置变量
   */
  setVariables(variables: Record<string, any>): void {
    this.variables = { ...this.variables, ...variables };
  }

  /**
   * 注册助手函数
   */
  registerHelper(name: string, fn: Function): void {
    this.helpers[name] = fn;
  }

  /**
   * 渲染模板字符串
   */
  render(template: string, variables?: Record<string, any>): string {
    const context = { ...this.variables, ...variables };
    
    // 简单的模板替换，支持 {{variable}} 语法
    return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
      const trimmed = expression.trim();
      
      // 支持助手函数调用
      if (trimmed.includes('(')) {
        return this.evaluateHelper(trimmed, context);
      }
      
      // 支持点号访问
      return this.getValue(trimmed, context) || match;
    });
  }

  /**
   * 渲染模板文件
   */
  async renderFile(filePath: string, variables?: Record<string, any>): Promise<string> {
    const content = await readFile(filePath);
    return this.render(content, variables);
  }

  /**
   * 获取嵌套值
   */
  private getValue(path: string, context: Record<string, any>): any {
    return path.split('.').reduce((obj, key) => obj?.[key], context);
  }

  /**
   * 执行助手函数
   */
  private evaluateHelper(expression: string, context: Record<string, any>): string {
    const match = expression.match(/(\w+)\((.*)\)/);
    if (!match) return expression;
    
    const [, helperName, argsStr] = match;
    const helper = this.helpers[helperName];
    
    if (!helper) return expression;
    
    // 简单的参数解析
    const args = argsStr.split(',').map(arg => {
      const trimmed = arg.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1);
      }
      return this.getValue(trimmed, context);
    });
    
    return helper(...args);
  }

  /**
   * 注册默认助手函数
   */
  private registerDefaultHelpers(): void {
    this.registerHelper('upperCase', (str: string) => str?.toUpperCase() || '');
    this.registerHelper('lowerCase', (str: string) => str?.toLowerCase() || '');
    this.registerHelper('camelCase', (str: string) => {
      return str?.replace(/-([a-z])/g, (g) => g[1].toUpperCase()) || '';
    });
    this.registerHelper('pascalCase', (str: string) => {
      const camel = this.helpers.camelCase(str);
      return camel.charAt(0).toUpperCase() + camel.slice(1);
    });
    this.registerHelper('kebabCase', (str: string) => {
      return str?.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '') || '';
    });
    this.registerHelper('snakeCase', (str: string) => {
      return str?.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '') || '';
    });
  }
}

/**
 * 模板生成器
 */
export class TemplateGenerator {
  private engine: TemplateEngine;

  constructor() {
    this.engine = new TemplateEngine();
  }

  /**
   * 生成项目
   */
  async generate(template: Template, context: GeneratorContext): Promise<void> {
    // 设置模板变量
    this.engine.setVariables(context.variables);

    // 执行前置钩子
    if (template.hooks?.beforeGenerate) {
      await template.hooks.beforeGenerate(context);
    }

    // 复制和渲染模板文件
    await this.processTemplate(template, context);

    // 执行后置钩子
    if (template.hooks?.afterGenerate) {
      await template.hooks.afterGenerate(context);
    }
  }

  /**
   * 处理模板
   */
  private async processTemplate(template: Template, context: GeneratorContext): Promise<void> {
    const templatePath = resolve(template.path);
    const targetPath = context.targetDir;

    // 确保目标目录存在
    await ensureDir(targetPath);

    // 查找所有模板文件
    const files = await findFiles('**/*', { cwd: templatePath });

    for (const file of files) {
      const srcPath = resolve(templatePath, file);
      const destPath = resolve(targetPath, this.renderPath(file, context.variables));

      if (this.isTemplateFile(file)) {
        // 渲染模板文件
        await this.renderTemplateFile(srcPath, destPath, context.variables);
      } else {
        // 直接复制二进制文件
        await this.copyBinaryFile(srcPath, destPath);
      }
    }
  }

  /**
   * 渲染路径
   */
  private renderPath(path: string, variables: Record<string, any>): string {
    return this.engine.render(path, variables);
  }

  /**
   * 判断是否为模板文件
   */
  private isTemplateFile(filePath: string): boolean {
    const textExtensions = [
      '.js', '.ts', '.jsx', '.tsx', '.vue', '.html', '.css', '.scss', '.less',
      '.json', '.md', '.txt', '.xml', '.yaml', '.yml', '.toml', '.ini'
    ];
    
    const ext = filePath.substring(filePath.lastIndexOf('.'));
    return textExtensions.includes(ext);
  }

  /**
   * 渲染模板文件
   */
  private async renderTemplateFile(srcPath: string, destPath: string, variables: Record<string, any>): Promise<void> {
    const content = await this.engine.renderFile(srcPath, variables);
    await ensureDir(dirname(destPath));
    await writeFile(destPath, content);
  }

  /**
   * 复制二进制文件
   */
  private async copyBinaryFile(srcPath: string, destPath: string): Promise<void> {
    await ensureDir(dirname(destPath));
    // 这里应该使用 fs.copyFile 复制二进制文件
    // 暂时使用简单的实现
    const content = await readFile(srcPath, 'binary' as any);
    await writeFile(destPath, content, 'binary' as any);
  }
}

/**
 * 收集模板变量
 */
export async function collectTemplateVariables(variables: TemplateVariable[]): Promise<Record<string, any>> {
  const inquirer = await import('inquirer');
  const questions = variables.map(variable => ({
    type: getInquirerType(variable.type),
    name: variable.name,
    message: variable.description,
    default: variable.default,
    choices: variable.choices,
    validate: variable.validate
  }));

  return inquirer.default.prompt(questions);
}

/**
 * 获取 inquirer 类型
 */
function getInquirerType(type: string): string {
  switch (type) {
    case 'boolean':
      return 'confirm';
    case 'select':
      return 'list';
    case 'multiselect':
      return 'checkbox';
    default:
      return 'input';
  }
}

/**
 * 创建模板引擎实例
 */
export function createTemplateEngine(): TemplateEngine {
  return new TemplateEngine();
}

/**
 * 创建模板生成器实例
 */
export function createTemplateGenerator(): TemplateGenerator {
  return new TemplateGenerator();
}
