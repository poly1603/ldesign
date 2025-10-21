/**
 * App Config Plugin
 * 
 * 注入 import.meta.env.appConfig 并支持热更新
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import type { Plugin, ResolvedConfig, ViteDevServer } from 'vite'
import { resolve, join } from 'path'
import { watch as chokidar, FSWatcher } from 'chokidar'
import { existsSync, readFile } from 'fs'
import { promisify } from 'util'
import { Logger } from '../utils/logger'
import { DEFAULT_APP_CONFIG_FILES, getEnvironmentAppConfigFiles } from '../constants'

const readFileAsync = promisify(readFile)

/**
 * 虚拟模块 ID
 */
const VIRTUAL_MODULE_ID = 'virtual:app-config'
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID

interface AppConfigPluginOptions {
  cwd?: string
  configFile?: string
  environment?: string
  logger?: Logger
}

/**
 * 查找应用配置文件
 */
async function findAppConfigFile(cwd: string, customFile?: string, environment?: string): Promise<string | null> {
  if (customFile) {
    const fullPath = resolve(cwd, customFile)
    if (existsSync(fullPath)) return fullPath
    return null
  }

  // 使用环境特定的配置文件列表
  const configFiles = getEnvironmentAppConfigFiles(environment)

  for (const fileName of configFiles) {
    const fullPath = resolve(cwd, fileName)
    if (existsSync(fullPath)) return fullPath
  }

  return null
}

/**
 * 加载应用配置
 */
async function loadAppConfig(filePath: string, logger: Logger): Promise<any> {
  try {
    const ext = filePath.split('.').pop()

    if (ext === 'json') {
      const content = await readFileAsync(filePath, 'utf-8')
      return JSON.parse(content)
    }

    // 支持 TS/JS/MJS/CJS
    if (['ts', 'js', 'mjs', 'cjs'].includes(ext || '')) {
      // 使用 jiti 动态加载（兼容 ESM/CJS）
      let jitiLoader: any
      try {
        const jitiMod: any = await import('jiti')
        const jiti = (jitiMod && jitiMod.default) ? jitiMod.default : jitiMod
        jitiLoader = jiti(process.cwd(), {
          cache: false,
          requireCache: false,
          interopDefault: true,
          esmResolve: true,
          // 添加模块解析支持
          moduleCache: false,
          // 支持 workspace 依赖解析
          alias: {
            '@ldesign/app': resolve(process.cwd(), 'src/index.ts')
          }
        })
      } catch (e) {
        logger.warn('缺少依赖: jiti，返回空配置', { error: (e as Error).message })
        return {}
      }

      try {
        logger.debug('尝试使用 jiti 加载配置')

        // 临时抑制 CJS API deprecated 警告
        const originalEmitWarning = process.emitWarning
        process.emitWarning = (warning: any, ...args: any[]) => {
          if (typeof warning === 'string' && (warning.includes('deprecated') || warning.includes('vite-cjs-node-api-deprecated'))) {
            return
          }
          if (typeof warning === 'object' && warning.message && (warning.message.includes('deprecated') || warning.message.includes('vite-cjs-node-api-deprecated'))) {
            return
          }
          return originalEmitWarning.call(process, warning, ...args)
        }

        let module
        try {
          module = jitiLoader(filePath)
        } finally {
          // 恢复原始的 emitWarning
          process.emitWarning = originalEmitWarning
        }

        // 处理不同的导出格式
        if (typeof module === 'function') {
          return await module()
        }

        logger.debug('jiti 加载配置成功')
        return module?.default || module || {}
      } catch (error) {
        logger.warn('jiti 加载配置文件失败，尝试其他方法: ' + (error as Error).message)

        // 如果 jiti 失败，尝试简单的动态导入（仅适用于 ESM）
        try {
          const module = await import(filePath + '?t=' + Date.now())
          return module?.default || module || {}
        } catch (importError) {
          logger.warn('动态导入也失败', {
            error: (importError as Error).message
          })
          return {}
        }
      }
    }

    return {}
  } catch (error) {
    logger.warn('加载应用配置失败', {
      file: filePath,
      error: (error as Error).message
    })
    return {}
  }
}

/**
 * 创建应用配置插件
 */
export function createAppConfigPlugin(options: AppConfigPluginOptions = {}): Plugin {
  const {
    cwd = process.cwd(),
    configFile,
    environment,
    logger = new Logger('AppConfigPlugin', { compact: true })
  } = options

  let config: ResolvedConfig
  let appConfig: any = {}
  let configFilePath: string | null = null
  let watcher: FSWatcher | null = null
  let server: ViteDevServer | null = null

  return {
    name: 'vite-plugin-app-config',

    async config(config, { command }) {
      // 查找配置文件（支持环境特定配置）
      configFilePath = await findAppConfigFile(cwd, configFile, environment)

      if (configFilePath) {
        const fileName = configFilePath.split(/[/\\]/).pop() || ''
        const relativePath = configFilePath.replace(cwd, '').replace(/^[/\\]/, '')
        logger.info(`📄 找到应用配置文件: ${fileName} (${relativePath})`)
        appConfig = await loadAppConfig(configFilePath, logger)
      } else {
        logger.debug('未找到应用配置文件', { environment })
      }

      // 定义环境变量，避免重复定义
      config.define = config.define || {}

      // 检查是否已经定义了 appConfig，避免重复定义
      const appConfigKey = 'import.meta.env.appConfig'
      if (!config.define[appConfigKey]) {
        config.define[appConfigKey] = JSON.stringify(appConfig)
      }
    },

    async configResolved(resolvedConfig) {
      config = resolvedConfig
    },

    configureServer(devServer) {
      server = devServer

      if (!configFilePath) return

      // 监听配置文件变化
      watcher = chokidar(configFilePath, {
        persistent: true,
        ignoreInitial: true
      })

      watcher.on('change', async () => {
        logger.info('应用配置文件已更改，重新加载...')

        const newConfig = await loadAppConfig(configFilePath!, logger)

        // 检查配置是否真的改变
        if (JSON.stringify(newConfig) !== JSON.stringify(appConfig)) {
          appConfig = newConfig

          // 更新环境变量定义
          if (config.command === 'serve') {
            // 注意：config.define 是只读的，我们不能直接修改它
            // 这里只是记录新的配置，实际的环境变量更新通过 HMR 实现
            logger.debug('配置已更新，将通过 HMR 传递给客户端')
          }

          // 发送自定义 HMR 事件通知客户端配置已更新
          server!.ws.send({
            type: 'custom',
            event: 'app-config-updated',
            data: appConfig
          })

          // 配置已更新，通过 HMR 热更新（无需重启服务器）
          console.log('ℹ️  配置已更新，通过 HMR 热更新...')

          // 触发虚拟模块热更新
          const module = server!.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID)
          if (module) {
            server!.moduleGraph.invalidateModule(module)
            server!.ws.send({
              type: 'update',
              updates: [{
                type: 'js-update',
                path: RESOLVED_VIRTUAL_MODULE_ID,
                acceptedPath: RESOLVED_VIRTUAL_MODULE_ID,
                timestamp: Date.now()
              }]
            })
          }
        }
      })

      watcher.on('add', async () => {
        logger.info('检测到新的应用配置文件')
        configFilePath = await findAppConfigFile(cwd, configFile, environment)
        if (configFilePath) {
          appConfig = await loadAppConfig(configFilePath, logger)
          server!.ws.send({
            type: 'full-reload',
            path: '*'
          })
        }
      })

      watcher.on('unlink', () => {
        logger.info('应用配置文件已删除')
        appConfig = {}
        configFilePath = null
        server!.ws.send({
          type: 'full-reload',
          path: '*'
        })
      })
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        // 返回虚拟模块内容
        return `
          const appConfig = ${JSON.stringify(appConfig, null, 2)}
          
          export default appConfig
          export { appConfig }
          
          // HMR 支持
          if (import.meta.hot) {
            import.meta.hot.accept()
          }
        `
      }
    },

    // 移除 transform 方法，避免与 define 冲突
    // 现在通过 define 配置直接注入 import.meta.env.appConfig

    buildEnd() {
      // 清理监听器
      if (watcher) {
        watcher.close()
        watcher = null
      }
    }
  }
}

/**
 * 导出便捷函数
 */
export function appConfigPlugin(options?: AppConfigPluginOptions): Plugin {
  return createAppConfigPlugin(options)
}

export default createAppConfigPlugin
