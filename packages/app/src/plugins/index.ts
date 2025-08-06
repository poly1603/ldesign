import type { Engine } from '@ldesign/engine'
import { colorPlugin } from './color'
import { cryptoPlugin } from './crypto'
import { devicePlugin } from './device'
import { httpPlugin } from './http'
import { watermarkPlugin } from './watermark'

/**
 * 设置所有插件
 */
export async function setupPlugins(engine: Engine) {
  try {
    // 注册颜色插件
    await engine.use(colorPlugin)
    
    // 注册加密插件
    await engine.use(cryptoPlugin)
    
    // 注册设备检测插件
    await engine.use(devicePlugin)
    
    // 注册HTTP客户端插件
    await engine.use(httpPlugin)
    
    // 注册水印插件
    await engine.use(watermarkPlugin)
    
    engine.logger.info('All plugins registered successfully')
  } catch (error) {
    engine.logger.error('Failed to register plugins:', error)
    throw error
  }
}

// 导出所有插件
export {
  colorPlugin,
  cryptoPlugin,
  devicePlugin,
  httpPlugin,
  watermarkPlugin
}
