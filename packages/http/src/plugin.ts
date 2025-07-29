// HTTP插件
import type { IPlugin } from '@ldesign/engine'
import { Http, createHttp } from './core/http'
import type { HttpPluginConfig } from './types'
import * as utils from './utils'

/**
 * HTTP插件类
 */
export class HttpPlugin implements IPlugin {
  name = 'http'
  version = '1.0.0'
  
  private http: Http
  private config: HttpPluginConfig

  constructor(config: HttpPluginConfig = {}) {
    this.config = {
      timeout: 10000,
      enableInterceptors: true,
      enableRetry: false,
      retryCount: 3,
      retryDelay: 1000,
      ...config
    }
    
    this.http = createHttp(this.config)
    this.setupRetryInterceptor()
  }

  /**
   * 设置重试拦截器
   */
  private setupRetryInterceptor(): void {
    if (!this.config.enableRetry) return

    this.http.addResponseInterceptor({
      onRejected: async (error) => {
        const { retryCount = 3, retryDelay = 1000 } = this.config
        const config = error.config
        
        if (!config || config.__retryCount >= retryCount) {
          return Promise.reject(error)
        }
        
        config.__retryCount = config.__retryCount || 0
        config.__retryCount += 1
        
        await utils.delay(retryDelay * config.__retryCount)
        
        return this.http.getInstance().request(config)
      }
    })
  }

  /**
   * 安装插件
   */
  install(engine: any): void {
    // 注册HTTP服务到引擎
    engine.provide('$http', this.http)
    engine.provide('$httpUtils', utils)
    
    // 添加全局属性
    if (engine.config && engine.config.globalProperties) {
      engine.config.globalProperties.$http = this.http
      engine.config.globalProperties.$httpUtils = utils
    }
    
    // 注册到引擎上下文
    if (engine.context) {
      engine.context.http = this.http
      engine.context.httpUtils = utils
    }
  }

  /**
   * 卸载插件
   */
  uninstall(engine: any): void {
    // 清理全局属性
    if (engine.config && engine.config.globalProperties) {
      delete engine.config.globalProperties.$http
      delete engine.config.globalProperties.$httpUtils
    }
    
    // 清理引擎上下文
    if (engine.context) {
      delete engine.context.http
      delete engine.context.httpUtils
    }
  }

  /**
   * 获取HTTP实例
   */
  getHttp(): Http {
    return this.http
  }

  /**
   * 获取配置
   */
  getConfig(): HttpPluginConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<HttpPluginConfig>): void {
    this.config = { ...this.config, ...config }
    this.http.updateDefaultConfig(config)
  }
}

/**
 * 创建HTTP插件实例
 */
export function createHttpPlugin(config?: HttpPluginConfig): HttpPlugin {
  return new HttpPlugin(config)
}