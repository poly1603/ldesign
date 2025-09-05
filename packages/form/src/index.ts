/**
 * LDesign Form 表单插件系统主入口
 * 
 * @description
 * 统一导出所有功能模块，提供完整的表单解决方案
 */

// === 类型定义 ===
export * from './types';

// === 核心库 ===
export * from './core';

// === Vue 3 适配器 ===
export * from './vue';

// === 工具函数 ===
export * from './utils';

// === 验证器 ===
export * from './validators';

// === 兼容层（确保现有代码正常工作） ===
export * from './legacy';

// === 版本信息 ===
export const version = '1.0.0';

// === 默认导出（Vue 插件） ===
import { App } from 'vue';
import { install } from './vue';

export default {
  install,
  version
};

// === 安装函数（支持全局安装） ===
export { install };

// === 类型声明增强 ===
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $form: any; // 将在实现时提供具体类型
  }
}

declare module 'vue' {
  interface GlobalComponents {
    LDesignForm: any; // 将在实现时提供具体类型
    LDesignFormItem: any; // 将在实现时提供具体类型
    FieldArray: any; // 将在实现时提供具体类型
    FormProvider: any; // 将在实现时提供具体类型
  }
}
