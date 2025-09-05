/**
 * 多模块 TypeScript 库主入口
 * 
 * 这个示例用于验证：
 * 1. 多入口构建（src/ 下所有文件作为入口）
 * 2. 模块结构保留
 * 3. 嵌套目录处理
 */

// 导出所有子模块
export * from './utils'
export * from './components'
export * from './types'

// 导出版本信息
export const VERSION = '1.0.0'
export const LIBRARY_NAME = 'multi-module-typescript-example'

// 导出默认配置
export { default as defaultConfig } from './config'
