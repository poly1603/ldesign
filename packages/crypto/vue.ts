/**
 * Vue 3 适配器入口文件
 *
 * 这个文件提供了专门为 Vue 3 优化的加解密功能
 * 包括 Composition API hooks 和 Vue 插件
 */

// 重新导出 Vue 适配器的所有功能
export * from './src/adapt/vue'

// 默认导出 Vue 插件
export { default } from './src/adapt/vue/plugin'
