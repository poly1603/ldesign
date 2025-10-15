/**
 * 预加载插件
 */

import type { TemplateManager } from '../runtime/manager'
import type { Plugin, PreloadPluginConfig } from '../types'
import { PLUGIN_VERSION } from '../utils/constants'

export function createPreloadPlugin(config: PreloadPluginConfig = {}): Plugin {
  const { priority = [], delay = 100, maxConcurrent = 3 } = config

  return {
    name: 'preload',
    version: PLUGIN_VERSION,

    install(manager: TemplateManager) {
      // 延迟预加载
      setTimeout(async () => {
        // 获取需要预加载的模板
        const templates = priority.map((p) => {
          const [category, device, name] = p.split(':')
          return `${category}:${device}:${name}`
        })

        // 批量预加载
        if (templates.length > 0) {
          try {
            await manager.preload(templates)
            console.log(`[PreloadPlugin] Preloaded ${templates.length} templates`)
          }
 catch (error) {
            console.error('[PreloadPlugin] Preload failed:', error)
          }
        }
      }, delay)
    },
  }
}
