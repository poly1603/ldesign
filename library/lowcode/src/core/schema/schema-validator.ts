/**
 * Schema 验证器
 */

import type { LowcodeSchema, SchemaValidationResult, SchemaValidationError } from '../../types';

/**
 * Schema 验证器类
 */
export class SchemaValidator {
  private errors: SchemaValidationError[] = [];

  /**
   * 验证 Schema
   */
  validate(schema: LowcodeSchema): SchemaValidationResult {
    this.errors = [];

    // 验证版本
    this.validateVersion(schema);

    // 验证组件
    this.validateComponents(schema);

    // 验证数据源
    this.validateDataSources(schema);

    // 验证变量
    this.validateVariables(schema);

    // 验证方法
    this.validateMethods(schema);

    return {
      valid: this.errors.length === 0,
      errors: this.errors.length > 0 ? this.errors : undefined
    };
  }

  /**
   * 验证版本
   */
  private validateVersion(schema: LowcodeSchema): void {
    if (!schema.version) {
      this.addError('version', '缺少版本号', 'required');
    }
  }

  /**
   * 验证组件
   */
  private validateComponents(schema: LowcodeSchema): void {
    if (!Array.isArray(schema.components)) {
      this.addError('components', '组件必须是数组', 'type');
      return;
    }

    schema.components.forEach((component, index) => {
      const path = `components[${index}]`;

      if (!component.id) {
        this.addError(`${path}.id`, '组件缺少ID', 'required');
      }
      if (!component.type) {
        this.addError(`${path}.type`, '组件缺少类型', 'required');
      }
      if (!component.layout) {
        this.addError(`${path}.layout`, '组件缺少布局配置', 'required');
      }
    });
  }

  /**
   * 验证数据源
   */
  private validateDataSources(schema: LowcodeSchema): void {
    if (!Array.isArray(schema.datasources)) {
      this.addError('datasources', '数据源必须是数组', 'type');
      return;
    }

    schema.datasources.forEach((ds, index) => {
      const path = `datasources[${index}]`;

      if (!ds.id) {
        this.addError(`${path}.id`, '数据源缺少ID', 'required');
      }
      if (!ds.type) {
        this.addError(`${path}.type`, '数据源缺少类型', 'required');
      }
      if (!ds.config) {
        this.addError(`${path}.config`, '数据源缺少配置', 'required');
      }
    });
  }

  /**
   * 验证变量
   */
  private validateVariables(schema: LowcodeSchema): void {
    if (typeof schema.variables !== 'object' || schema.variables === null) {
      this.addError('variables', '变量必须是对象', 'type');
    }
  }

  /**
   * 验证方法
   */
  private validateMethods(schema: LowcodeSchema): void {
    if (!Array.isArray(schema.methods)) {
      this.addError('methods', '方法必须是数组', 'type');
      return;
    }

    schema.methods.forEach((method, index) => {
      const path = `methods[${index}]`;

      if (!method.name) {
        this.addError(`${path}.name`, '方法缺少名称', 'required');
      }
      if (!method.body) {
        this.addError(`${path}.body`, '方法缺少函数体', 'required');
      }
    });
  }

  /**
   * 添加错误
   */
  private addError(path: string, message: string, type: string): void {
    this.errors.push({ path, message, type });
  }
}

/**
 * 验证 Schema
 */
export function validateSchema(schema: LowcodeSchema): SchemaValidationResult {
  const validator = new SchemaValidator();
  return validator.validate(schema);
}



