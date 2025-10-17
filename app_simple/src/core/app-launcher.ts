/**
 * 应用启动器
 * 简化启动流程，提供清晰的生命周期
 */

import { createApp, type App } from 'vue'
import { createEngineApp } from '@ldesign/engine'
import { pluginManager } from './plugin-manager'
import { createUnifiedConfig } from '@/config'
import type { UnifiedConfig } from '@/config/types'

/**
 * 启动器配置
 */
export interface LauncherOptions {
  rootComponent: any
  mountElement: string | HTMLElement
  config?: Partial<UnifiedConfig>
  plugins?: any[]
  beforeCreate?: () => void | Promise<void>
  afterCreate?: (app: App) => void | Promise<void>
  beforeMount?: () => void | Promise<void>
  afterMount?: () => void | Promise<void>
  onError?: (error: Error) => void
}

/**
 * 启动阶段
 */
export enum LaunchPhase {
  INIT = 'init',
  CONFIG = 'config',
  PLUGINS = 'plugins',
  CREATE = 'create',
  SETUP = 'setup',
  MOUNT = 'mount',
  READY = 'ready',
  ERROR = 'error'
}

/**
 * 启动状态
 */
interface LaunchState {
  phase: LaunchPhase
  startTime: number
  phaseTimings: Map<LaunchPhase, number>
  errors: Error[]
}

/**
 * 应用启动器类
 */
export class AppLauncher {
  private state: LaunchState = {
    phase: LaunchPhase.INIT,
    startTime: 0,
    phaseTimings: new Map(),
    errors: []
  }
  
  private app: App | null = null
  private engine: any = null
  
  /**
   * 启动应用
   */
  async launch(options: LauncherOptions): Promise<{ app: App; engine: any }> {
    this.state.startTime = performance.now()
    
    try {
      // 1. 初始化阶段
      await this.runPhase(LaunchPhase.INIT, async () => {
        console.log('🚀 Starting application...')
        if (options.beforeCreate) {
          await options.beforeCreate()
        }
      })
      
      // 2. 配置阶段
      const config = await this.runPhase(LaunchPhase.CONFIG, async () => {
        console.log('⚙️ Loading configuration...')
        return createUnifiedConfig()
      })
      
      // 3. 插件阶段
      await this.runPhase(LaunchPhase.PLUGINS, async () => {
        console.log('🔌 Preparing plugins...')
        if (options.plugins) {
          options.plugins.forEach(plugin => {
            pluginManager.register(plugin.plugin, plugin.options)
          })
        }
      })
      
      // 4. 创建应用阶段
      const result = await this.runPhase(LaunchPhase.CREATE, async () => {
        console.log('🏗️ Creating application...')
        
        // 使用 Engine 创建应用
        const engine = await createEngineApp({
          rootComponent: options.rootComponent,
          mountElement: options.mountElement,
          config: config.engine,
          
          setupApp: async (app: App) => {
            this.app = app
            
            // 初始化插件管理器
            await pluginManager.initialize(app)
            
            // 执行用户的 afterCreate 钩子
            if (options.afterCreate) {
              await options.afterCreate(app)
            }
          },
          
          onError: (error: Error) => {
            this.handleError(error, options.onError)
          },
          
          onMounted: () => {
            this.runPhase(LaunchPhase.READY, async () => {
              console.log('✅ Application ready!')
              if (options.afterMount) {
                await options.afterMount()
              }
              this.printPerformanceReport()
            })
          }
        })
        
        this.engine = engine
        return { app: this.app!, engine }
      })
      
      return result
      
    } catch (error) {
      this.handleError(error as Error, options.onError)
      throw error
    }
  }
  
  /**
   * 运行启动阶段
   */
  private async runPhase<T>(phase: LaunchPhase, fn: () => T | Promise<T>): Promise<T> {
    this.state.phase = phase
    const startTime = performance.now()
    
    try {
      const result = await fn()
      const duration = performance.now() - startTime
      this.state.phaseTimings.set(phase, duration)
      return result
    } catch (error) {
      this.state.phase = LaunchPhase.ERROR
      throw error
    }
  }
  
  /**
   * 处理错误
   */
  private handleError(error: Error, customHandler?: (error: Error) => void): void {
    this.state.errors.push(error)
    console.error('❌ Launch error:', error)
    
    if (customHandler) {
      customHandler(error)
    } else {
      // 默认错误处理
      this.showErrorUI(error)
    }
  }
  
  /**
   * 显示错误界面
   */
  private showErrorUI(error: Error): void {
    const container = typeof this.app === 'string' 
      ? document.querySelector(this.app) 
      : document.body
      
    if (container) {
      container.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #f5f5f5;
          font-family: system-ui;
        ">
          <div style="
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 600px;
          ">
            <h1 style="color: #ef4444; margin: 0 0 1rem 0;">
              Application Launch Failed
            </h1>
            <p style="color: #666; margin: 0 0 1rem 0;">
              ${error.message}
            </p>
            <details style="margin-top: 1rem;">
              <summary style="cursor: pointer; color: #3b82f6;">
                Technical Details
              </summary>
              <pre style="
                background: #f5f5f5;
                padding: 1rem;
                border-radius: 4px;
                overflow-x: auto;
                margin-top: 0.5rem;
              ">${error.stack}</pre>
            </details>
          </div>
        </div>
      `
    }
  }
  
  /**
   * 打印性能报告
   */
  private printPerformanceReport(): void {
    const totalTime = performance.now() - this.state.startTime
    
    console.group('⚡ Performance Report')
    console.log(`Total launch time: ${totalTime.toFixed(2)}ms`)
    
    this.state.phaseTimings.forEach((time, phase) => {
      const percentage = (time / totalTime * 100).toFixed(1)
      console.log(`  ${phase}: ${time.toFixed(2)}ms (${percentage}%)`)
    })
    
    // 插件性能报告
    const pluginReport = pluginManager.getPerformanceReport()
    if (pluginReport.totalPlugins > 0) {
      console.log('\n📦 Plugin Performance:')
      Object.entries(pluginReport.plugins).forEach(([name, data]: [string, any]) => {
        console.log(`  ${name}:`, {
          loadTime: `${data.loadTime?.toFixed(2)}ms`,
          installTime: `${data.installTime?.toFixed(2)}ms`,
          state: data.state
        })
      })
    }
    
    console.groupEnd()
  }
  
  /**
   * 获取启动状态
   */
  getState(): LaunchState {
    return { ...this.state }
  }
  
  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    await pluginManager.cleanup()
    this.app = null
    this.engine = null
  }
}

/**
 * 创建并启动应用（便捷方法）
 */
export async function launchApp(options: LauncherOptions) {
  const launcher = new AppLauncher()
  return launcher.launch(options)
}

// 导出启动器实例（单例）
export const appLauncher = new AppLauncher()