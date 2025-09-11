/**
 * Vue 支持的独立入口文件
 * 
 * 这个文件提供了 Vue 支持的独立入口，避免在主包中引入 Vue 依赖
 * 
 * 使用方式：
 * import { LChart, useChart } from '@ldesign/chart/vue'
 */

// 重新导出所有 Vue 相关的内容
export * from './src/vue/index'

// 默认导出 Vue 插件
export { default } from './src/vue/index'
