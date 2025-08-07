/**
 * LDesign App - 统一应用启动器
 * 
 * 提供简单易用的 API 来创建和启动 LDesign 应用
 */

// 导出核心创建函数
export {
  createLDesignApp,
  quickCreateLDesignApp,
  type LDesignApp,
  type LDesignAppOptions
} from './core/createLDesignApp'

// 导出主要组件
export { default as App } from './App.vue'

/**
 * 快速启动函数 - 最简单的使用方式
 * 
 * @example
 * ```typescript
 * import { quickStart } from '@ldesign/app'
 * 
 * quickStart('#app')
 * ```
 */
export function quickStart(selector: string = '#app') {
  const { quickCreateLDesignApp } = require('./core/createLDesignApp')
  const App = require('./App.vue').default

  const app = quickCreateLDesignApp(App)
  app.mount(selector)

  return app
}

/**
 * 自定义启动函数 - 支持完整配置
 * 
 * @example
 * ```typescript
 * import { createApp } from '@ldesign/app'
 * import MyApp from './MyApp.vue'
 * 
 * const app = createApp(MyApp, {
 *   appName: 'My Application',
 *   modules: {
 *     color: true,
 *     crypto: true,
 *     device: false
 *   }
 * })
 * 
 * app.mount('#app')
 * ```
 */
export function createApp(rootComponent: any, options?: any) {
  const { createLDesignApp } = require('./core/createLDesignApp')
  return createLDesignApp(rootComponent, options)
}

// 默认导出快速启动函数
export default quickStart
