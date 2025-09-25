/**
 * 核心类型定义
 */

export interface CLIContext {
  /** 当前工作目录 */
  cwd: string;
  /** 配置对象 */
  config: CLIConfig;
  /** 命令行参数 */
  args: string[];
  /** 环境变量 */
  env: Record<string, string>;
  /** 插件实例 */
  plugins: Map<string, Plugin>;
  /** 中间件实例 */
  middleware: Middleware[];
  /** 日志器 */
  logger: Logger;
}

export interface CLIConfig {
  /** 环境名称 */
  environment: string;
  /** 插件配置 */
  plugins: PluginConfig[];
  /** 中间件配置 */
  middleware: MiddlewareConfig[];
  /** 自定义配置 */
  [key: string]: any;
}

export interface Command {
  /** 命令名称 */
  name: string;
  /** 命令描述 */
  description: string;
  /** 命令别名 */
  aliases?: string[];
  /** 命令选项 */
  options?: CommandOption[];
  /** 子命令 */
  subcommands?: Command[];
  /** 命令执行函数 */
  action: CommandAction;
  /** 命令示例 */
  examples?: string[];
}

export interface CommandOption {
  /** 选项名称 */
  name: string;
  /** 选项描述 */
  description: string;
  /** 选项类型 */
  type: 'string' | 'number' | 'boolean' | 'array';
  /** 是否必需 */
  required?: boolean;
  /** 默认值 */
  default?: any;
  /** 选项别名 */
  alias?: string;
}

export type CommandAction = (args: any, context: CLIContext) => Promise<void> | void;

export interface Plugin {
  /** 插件名称 */
  name: string;
  /** 插件版本 */
  version: string;
  /** 插件描述 */
  description?: string;
  /** 插件初始化 */
  init?: (context: CLIContext) => Promise<void> | void;
  /** 插件销毁 */
  destroy?: (context: CLIContext) => Promise<void> | void;
  /** 注册命令 */
  commands?: Command[];
  /** 注册中间件 */
  middleware?: Middleware[];
}

export interface PluginConfig {
  /** 插件名称或路径 */
  name: string;
  /** 插件配置 */
  options?: Record<string, any>;
  /** 是否启用 */
  enabled?: boolean;
}

export interface Middleware {
  /** 中间件名称 */
  name: string;
  /** 执行优先级 */
  priority?: number;
  /** 中间件执行函数 */
  execute: MiddlewareFunction;
}

export interface MiddlewareConfig {
  /** 中间件名称 */
  name: string;
  /** 中间件配置 */
  options?: Record<string, any>;
  /** 执行优先级 */
  priority?: number;
  /** 是否启用 */
  enabled?: boolean;
}

export type MiddlewareFunction = (
  context: CLIContext,
  next: () => Promise<void>
) => Promise<void>;

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  success(message: string, ...args: any[]): void;
}

export interface Template {
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板路径 */
  path: string;
  /** 模板变量 */
  variables?: TemplateVariable[];
  /** 模板钩子 */
  hooks?: TemplateHooks;
}

export interface TemplateVariable {
  /** 变量名称 */
  name: string;
  /** 变量描述 */
  description: string;
  /** 变量类型 */
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  /** 是否必需 */
  required?: boolean;
  /** 默认值 */
  default?: any;
  /** 选项（用于 select 和 multiselect） */
  choices?: string[];
  /** 验证函数 */
  validate?: (value: any) => boolean | string;
}

export interface TemplateHooks {
  /** 模板生成前 */
  beforeGenerate?: (context: any) => Promise<void> | void;
  /** 模板生成后 */
  afterGenerate?: (context: any) => Promise<void> | void;
}

export interface GeneratorContext {
  /** 目标目录 */
  targetDir: string;
  /** 模板变量值 */
  variables: Record<string, any>;
  /** CLI 上下文 */
  cliContext: CLIContext;
}
