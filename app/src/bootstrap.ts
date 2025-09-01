import { createEngine } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router'
import { enginePluginConfig } from './router'

/**
 * 应用启动配置
 * 初始化 LDesign Engine 和相关插件
 */
export async function bootstrap() {
  // 创建 Engine 实例
  const engine = createEngine({
  })

  // 集成路由器插件
  const routerPlugin = createRouterEnginePlugin(enginePluginConfig)
  await engine.use(routerPlugin)

  console.log('🚀 LDesign App 启动完成')
  console.log('📍 路由器已集成到 Engine')
  console.log('🔗 模板系统已启用')

  // 挂载应用
  engine.mount('#app')



  return engine
}