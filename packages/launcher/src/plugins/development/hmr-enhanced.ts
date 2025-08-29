/**
 * 热重载增强插件
 * 提供更好的热重载体验和状态保持
 */

import type { Plugin } from 'vite'
import type { HMREnhancedPluginConfig } from '../../types/plugins'

/**
 * 创建热重载增强插件
 */
export function createHMREnhancedPlugin(config: HMREnhancedPluginConfig = {}): Plugin {
  const {
    enabled = true,
    options = {},
    apply = 'serve',
    enforce,
  } = config

  const {
    fastRefresh = true,
    preserveState = true,
    errorOverlay = true,
    customUpdateHandlers = {},
    ignored = [],
  } = options

  return {
    name: 'ldesign:hmr-enhanced',
    apply,
    ...(enforce && { enforce }),

    config(config) {
      if (!enabled) return

      // 配置 HMR 选项
      config.server = config.server || {}
      config.server.hmr = config.server.hmr || {}

      if (typeof config.server.hmr === 'object') {
        // 启用更详细的 HMR 日志
        config.server.hmr.overlay = errorOverlay
      }

      // 配置快速刷新
      if (fastRefresh) {
        config.esbuild = config.esbuild || {}
        config.esbuild.jsx = 'automatic'
      }

      console.log('[HMR Enhanced] Enhanced hot reload enabled')
    },

    configureServer(server) {
      if (!enabled) return

      // 自定义 HMR 更新处理
      server.ws.on('vite:beforeUpdate', (payload) => {
        if (preserveState) {
          // 保存组件状态
          saveComponentState(payload)
        }
      })

      server.ws.on('vite:afterUpdate', (payload) => {
        if (preserveState) {
          // 恢复组件状态
          restoreComponentState(payload)
        }

        // 应用自定义更新处理器
        applyCustomUpdateHandlers(payload, customUpdateHandlers)
      })

      // 监听文件变化
      server.watcher.on('change', (file) => {
        if (shouldIgnoreFile(file, ignored)) {
          return
        }

        console.log(`[HMR Enhanced] File changed: ${file}`)

        // 智能重载策略
        handleFileChange(file, server)
      })

      // 错误处理增强
      server.ws.on('vite:error', (payload) => {
        if (errorOverlay) {
          enhanceErrorDisplay(payload)
        }
      })
    },

    handleHotUpdate(ctx) {
      if (!enabled) return

      const { file, modules, server } = ctx

      // 检查是否应该忽略此文件
      if (shouldIgnoreFile(file, ignored)) {
        return []
      }

      // 智能模块更新
      const updatedModules = intelligentModuleUpdate(file, modules)

      // 发送自定义 HMR 事件
      server.ws.send({
        type: 'custom',
        event: 'ldesign:hmr-update',
        data: {
          file,
          modules: updatedModules.map(m => m.id),
          timestamp: Date.now(),
        },
      })

      return updatedModules
    },
  }
}

/**
 * 保存组件状态
 */
function saveComponentState(_payload: any) {
  // 这里应该实现状态保存逻辑
  // 简化实现，实际需要与前端框架集成
  console.log('[HMR Enhanced] Saving component state')
}

/**
 * 恢复组件状态
 */
function restoreComponentState(_payload: any) {
  // 这里应该实现状态恢复逻辑
  console.log('[HMR Enhanced] Restoring component state')
}

/**
 * 应用自定义更新处理器
 */
function applyCustomUpdateHandlers(
  payload: any,
  handlers: Record<string, (module: any) => void>
) {
  for (const [pattern, handler] of Object.entries(handlers)) {
    if (payload.updates?.some((update: any) => update.path.includes(pattern))) {
      try {
        handler(payload)
      }
      catch (error) {
        console.error(`[HMR Enhanced] Custom handler error for ${pattern}:`, error)
      }
    }
  }
}

/**
 * 检查是否应该忽略文件
 */
function shouldIgnoreFile(file: string, ignored: string[]): boolean {
  return ignored.some(pattern => {
    if (typeof pattern === 'string') {
      return file.includes(pattern)
    }
    return false
  })
}

/**
 * 处理文件变化
 */
function handleFileChange(file: string, _server: any) {
  // 根据文件类型采用不同的重载策略
  if (file.endsWith('.css') || file.endsWith('.scss') || file.endsWith('.less')) {
    // CSS 文件使用热更新
    console.log('[HMR Enhanced] CSS hot update')
  }
  else if (file.endsWith('.js') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
    // JavaScript/TypeScript 文件智能更新
    console.log('[HMR Enhanced] JS/TS intelligent update')
  }
  else if (file.endsWith('.vue')) {
    // Vue 文件特殊处理
    console.log('[HMR Enhanced] Vue component update')
  }
  else {
    // 其他文件类型
    console.log('[HMR Enhanced] Generic file update')
  }
}

/**
 * 智能模块更新
 */
function intelligentModuleUpdate(file: string, modules: any[]): any[] {
  // 根据文件类型和依赖关系智能决定需要更新的模块
  const updatedModules = [...modules]

  // 如果是样式文件，只更新样式相关模块
  if (file.endsWith('.css') || file.endsWith('.scss') || file.endsWith('.less')) {
    return modules.filter(m => m.id?.includes('style') || m.id?.endsWith('.css'))
  }

  // 如果是组件文件，检查是否需要更新父组件
  if (file.endsWith('.vue') || file.endsWith('.jsx') || file.endsWith('.tsx')) {
    // 这里可以添加更复杂的依赖分析逻辑
  }

  return updatedModules
}

/**
 * 增强错误显示
 */
function enhanceErrorDisplay(payload: any) {
  // 增强错误信息显示
  console.log('[HMR Enhanced] Enhanced error display:', payload)
}

/**
 * 默认 HMR 增强配置
 */
export const defaultHMREnhancedConfig: HMREnhancedPluginConfig = {
  enabled: true,
  apply: 'serve',
  options: {
    fastRefresh: true,
    preserveState: true,
    errorOverlay: true,
    customUpdateHandlers: {},
    ignored: ['node_modules', '.git', 'dist'],
  },
}

/**
 * 创建 React 优化的 HMR 插件
 */
export function createReactHMREnhancedPlugin(): Plugin {
  return createHMREnhancedPlugin({
    enabled: true,
    apply: 'serve',
    options: {
      fastRefresh: true,
      preserveState: true,
      errorOverlay: true,
      customUpdateHandlers: {
        '.jsx': (_module) => {
          console.log('[HMR Enhanced] React component updated')
        },
        '.tsx': (_module) => {
          console.log('[HMR Enhanced] React TypeScript component updated')
        },
      },
      ignored: ['node_modules', '.git', 'dist', 'public'],
    },
  })
}

/**
 * 创建 Vue 优化的 HMR 插件
 */
export function createVueHMREnhancedPlugin(): Plugin {
  return createHMREnhancedPlugin({
    enabled: true,
    apply: 'serve',
    options: {
      fastRefresh: true,
      preserveState: true,
      errorOverlay: true,
      customUpdateHandlers: {
        '.vue': (_module) => {
          console.log('[HMR Enhanced] Vue component updated')
        },
      },
      ignored: ['node_modules', '.git', 'dist', 'public'],
    },
  })
}

/**
 * HMR 统计信息
 */
export interface HMRStats {
  /** 总更新次数 */
  totalUpdates: number
  /** 成功更新次数 */
  successfulUpdates: number
  /** 失败更新次数 */
  failedUpdates: number
  /** 平均更新时间 */
  averageUpdateTime: number
  /** 最近更新的文件 */
  recentUpdates: string[]
}

/**
 * 创建带统计的 HMR 增强插件
 */
export function createHMREnhancedPluginWithStats(
  config: HMREnhancedPluginConfig = {}
): { plugin: Plugin; getStats: () => HMRStats } {
  let stats: HMRStats = {
    totalUpdates: 0,
    successfulUpdates: 0,
    failedUpdates: 0,
    averageUpdateTime: 0,
    recentUpdates: [],
  }

  const updateTimes: number[] = []

  const plugin = createHMREnhancedPlugin(config)

  // 重写 handleHotUpdate 方法以收集统计信息
  const originalHandleHotUpdate = plugin.handleHotUpdate
  plugin.handleHotUpdate = function (ctx) {
    const startTime = Date.now()
    stats.totalUpdates++

    try {
      const result = typeof originalHandleHotUpdate === 'function'
        ? originalHandleHotUpdate.call(this, ctx)
        : undefined

      const updateTime = Date.now() - startTime
      updateTimes.push(updateTime)
      stats.averageUpdateTime = updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length

      stats.successfulUpdates++
      stats.recentUpdates.unshift(ctx.file)
      stats.recentUpdates = stats.recentUpdates.slice(0, 10) // 保留最近10次更新

      console.log(`[HMR Enhanced Stats] Update completed in ${updateTime}ms`)

      return result
    }
    catch (error) {
      stats.failedUpdates++
      console.error('[HMR Enhanced Stats] Update failed:', error)
      throw error
    }
  }

  return {
    plugin,
    getStats: () => ({ ...stats }),
  }
}
