import * as _ldesign_engine from '@ldesign/engine'
import { AppConfig } from './types/index.js'

/**
 * 创建 LDesign 应用
 * @param config 应用配置
 * @returns 应用实例
 */
declare function createLDesignApp(config?: Partial<AppConfig>): Promise<{
  engine: _ldesign_engine.Engine
  router: _ldesign_engine.RouterAdapter | undefined
  config: AppConfig
}>

export { createLDesignApp as default }
