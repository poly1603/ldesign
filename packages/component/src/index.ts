/**
 * @ldesign/component - 基于 Stencil 的现代化 Web Components 组件库
 * 
 * 这是组件库的主入口文件，导出所有可用的组件和工具函数
 * 支持 Vue 3 无缝集成，提供完整的 TypeScript 类型支持
 */

// 导出所有组件
export { Button, Input, Card } from './components';

// 导出工具函数和类型
export * from './utils';
export * from './types';

// 导出主题相关
export * from './theme';

// 定义自定义元素（用于直接在 HTML 中使用）
export const defineCustomElements = () => {
  if (typeof window !== 'undefined') {
    // 这个函数会在构建后由 Stencil 自动生成
    console.log('defineCustomElements will be available after build');
  }
};

// 版本信息
export const version = '0.1.0';
