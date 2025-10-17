/**
 * @ldesign/color - Engine Plugin Integration
 * 
 * 注意：此文件用于兼容旧的 Engine 插件系统
 * 新项目建议直接使用 index.ts 中的 createColorPlugin
 */

import { createLocaleAwarePlugin, type Plugin } from '@ldesign/engine'
import type { Engine } from '@ldesign/engine'
import { createColorPlugin, type ColorPluginOptions, type ColorPlugin } from './index'

export interface ColorEnginePluginOptions extends ColorPluginOptions {
  /**
   * Whether to sync with engine's locale state
   * @default true
   */
  syncLocale?: boolean
}

/**
 * Create color engine plugin
 * 
 * 使用 createLocaleAwarePlugin 包装，自动处理语言同步
 */
export function createColorEnginePlugin(options: ColorEnginePluginOptions = {}): Plugin {
  const colorPlugin = createColorPlugin(options)
  
  return createLocaleAwarePlugin(colorPlugin, {
    name: 'color',
    syncLocale: options.syncLocale,
    version: '1.0.0'
  })
}

/**
 * Get color plugin from engine
 */
export function useColorFromEngine(engine: Engine): ColorPlugin | undefined {
  return engine.state.get<ColorPlugin>('plugins.color')
}
