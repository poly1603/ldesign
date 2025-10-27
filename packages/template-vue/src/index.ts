/**
 * @ldesign/template-vue
 * Vue 3 模板管理系统
 */

// 导出管理器
export { VueTemplateManager, getVueTemplateManager, createVueTemplateManager } from './managers/VueTemplateManager'

// 导出组合式函数
export {
  useTemplate,
  useDefaultTemplate,
  useTemplateList,
  useTemplateManager,
} from './composables/useTemplate'

// 导出组合式函数目录
export * from './composables'

// 导出Vue插件
export { TemplatePlugin, createTemplatePlugin } from './plugin'

// 版本号
export const VERSION = '1.0.0'

// 默认导出
export default {
  VERSION,
  install(app: any) {
    // Vue 插件安装逻辑
    console.log('[template-vue] 插件已安装')
  },
}
