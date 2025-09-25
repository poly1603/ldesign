/**
 * 配置验证器
 */

import { CLIConfig, PluginConfig, MiddlewareConfig } from '../types/index';

export class ConfigValidationError extends Error {
  constructor(message: string, public path?: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}

/**
 * 验证配置
 */
export function validateConfig(config: CLIConfig): void {
  if (!config || typeof config !== 'object') {
    throw new ConfigValidationError('配置必须是一个对象');
  }

  // 验证环境
  if (config.environment && typeof config.environment !== 'string') {
    throw new ConfigValidationError('environment 必须是字符串', 'environment');
  }

  // 验证插件配置
  if (config.plugins) {
    validatePluginsConfig(config.plugins);
  }

  // 验证中间件配置
  if (config.middleware) {
    validateMiddlewareConfig(config.middleware);
  }
}

/**
 * 验证插件配置
 */
function validatePluginsConfig(plugins: PluginConfig[]): void {
  if (!Array.isArray(plugins)) {
    throw new ConfigValidationError('plugins 必须是数组', 'plugins');
  }

  plugins.forEach((plugin, index) => {
    const path = `plugins[${index}]`;
    
    if (typeof plugin === 'string') {
      // 字符串形式的插件名称是有效的
      return;
    }

    if (!plugin || typeof plugin !== 'object') {
      throw new ConfigValidationError('插件配置必须是字符串或对象', path);
    }

    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new ConfigValidationError('插件必须有有效的名称', `${path}.name`);
    }

    if (plugin.enabled !== undefined && typeof plugin.enabled !== 'boolean') {
      throw new ConfigValidationError('插件的 enabled 属性必须是布尔值', `${path}.enabled`);
    }

    if (plugin.options !== undefined && typeof plugin.options !== 'object') {
      throw new ConfigValidationError('插件的 options 属性必须是对象', `${path}.options`);
    }
  });
}

/**
 * 验证中间件配置
 */
function validateMiddlewareConfig(middleware: MiddlewareConfig[]): void {
  if (!Array.isArray(middleware)) {
    throw new ConfigValidationError('middleware 必须是数组', 'middleware');
  }

  middleware.forEach((mw, index) => {
    const path = `middleware[${index}]`;
    
    if (!mw || typeof mw !== 'object') {
      throw new ConfigValidationError('中间件配置必须是对象', path);
    }

    if (!mw.name || typeof mw.name !== 'string') {
      throw new ConfigValidationError('中间件必须有有效的名称', `${path}.name`);
    }

    if (mw.enabled !== undefined && typeof mw.enabled !== 'boolean') {
      throw new ConfigValidationError('中间件的 enabled 属性必须是布尔值', `${path}.enabled`);
    }

    if (mw.priority !== undefined && typeof mw.priority !== 'number') {
      throw new ConfigValidationError('中间件的 priority 属性必须是数字', `${path}.priority`);
    }

    if (mw.options !== undefined && typeof mw.options !== 'object') {
      throw new ConfigValidationError('中间件的 options 属性必须是对象', `${path}.options`);
    }
  });
}

/**
 * 验证配置模式
 */
export function validateConfigSchema(config: any, schema: any): void {
  // 这里可以实现更复杂的模式验证
  // 例如使用 joi、yup 或其他验证库
  // 暂时使用简单的验证逻辑
  
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in config)) {
        throw new ConfigValidationError(`缺少必需字段: ${field}`, field);
      }
    }
  }

  if (schema.properties) {
    for (const [key, value] of Object.entries(config)) {
      if (schema.properties[key]) {
        validateFieldType(value, schema.properties[key], key);
      }
    }
  }
}

/**
 * 验证字段类型
 */
function validateFieldType(value: any, fieldSchema: any, path: string): void {
  if (fieldSchema.type) {
    const expectedType = fieldSchema.type;
    const actualType = Array.isArray(value) ? 'array' : typeof value;
    
    if (actualType !== expectedType) {
      throw new ConfigValidationError(
        `字段 ${path} 期望类型 ${expectedType}，实际类型 ${actualType}`,
        path
      );
    }
  }

  if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
    throw new ConfigValidationError(
      `字段 ${path} 的值必须是 ${fieldSchema.enum.join(', ')} 中的一个`,
      path
    );
  }

  if (fieldSchema.minimum !== undefined && typeof value === 'number' && value < fieldSchema.minimum) {
    throw new ConfigValidationError(
      `字段 ${path} 的值不能小于 ${fieldSchema.minimum}`,
      path
    );
  }

  if (fieldSchema.maximum !== undefined && typeof value === 'number' && value > fieldSchema.maximum) {
    throw new ConfigValidationError(
      `字段 ${path} 的值不能大于 ${fieldSchema.maximum}`,
      path
    );
  }
}
