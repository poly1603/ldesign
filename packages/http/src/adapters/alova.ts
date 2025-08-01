import type { RequestConfig, ResponseData } from '@/types'
import { BaseAdapter } from './base'

/**
 * Alova 适配器
 */
export class AlovaAdapter extends BaseAdapter {
  name = 'alova'
  private alova: any
  private alovaInstance: any

  constructor(alovaInstance?: any) {
    super()
    this.alovaInstance = alovaInstance

    if (!alovaInstance) {
      try {
        // 动态导入 alova
        this.alova = require('alova')
      }
      catch {
        // alova 未安装
        this.alova = null
      }
    }
  }

  /**
   * 检查是否支持 alova
   */
  isSupported(): boolean {
    return this.alovaInstance !== null || this.alova !== null
  }

  /**
   * 发送请求
   */
  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    if (!this.isSupported()) {
      throw new Error('Alova is not available. Please install alova: npm install alova')
    }

    const processedConfig = this.processConfig(config)

    try {
      // 如果没有 alova 实例，创建一个默认的
      const alovaInstance = this.alovaInstance || this.createDefaultAlovaInstance()

      // 创建 alova 方法
      const method = this.createAlovaMethod(alovaInstance, processedConfig)

      // 发送请求
      const response = await method.send()

      // 转换响应为标准格式
      return this.convertFromAlovaResponse<T>(response, processedConfig)
    }
    catch (error) {
      throw this.handleAlovaError(error, processedConfig)
    }
  }

  /**
   * 创建默认的 alova 实例
   */
  private createDefaultAlovaInstance(): any {
    if (!this.alova) {
      throw new Error('Alova is not available')
    }

    // 使用 fetch 作为默认请求适配器
    const { createAlova } = this.alova
    const GlobalFetch = require('alova/GlobalFetch')

    return createAlova({
      baseURL: '',
      requestAdapter: GlobalFetch(),
      responded: (response: any) => response.json(),
    })
  }

  /**
   * 创建 alova 方法
   */
  private createAlovaMethod(alovaInstance: any, config: RequestConfig): any {
    const { url, method = 'GET', data, headers, timeout } = config

    // 根据方法类型创建对应的 alova 方法
    let alovaMethod: any

    switch (method.toUpperCase()) {
      case 'GET':
        alovaMethod = alovaInstance.Get(url, {
          headers,
          timeout,
        })
        break
      case 'POST':
        alovaMethod = alovaInstance.Post(url, data, {
          headers,
          timeout,
        })
        break
      case 'PUT':
        alovaMethod = alovaInstance.Put(url, data, {
          headers,
          timeout,
        })
        break
      case 'DELETE':
        alovaMethod = alovaInstance.Delete(url, {
          headers,
          timeout,
        })
        break
      case 'PATCH':
        alovaMethod = alovaInstance.Patch(url, data, {
          headers,
          timeout,
        })
        break
      case 'HEAD':
        alovaMethod = alovaInstance.Head(url, {
          headers,
          timeout,
        })
        break
      case 'OPTIONS':
        alovaMethod = alovaInstance.Options(url, {
          headers,
          timeout,
        })
        break
      default:
        throw new Error(`Unsupported HTTP method: ${method}`)
    }

    // 设置取消信号
    if (config.signal) {
      alovaMethod.abort = () => {
        if (config.signal && !config.signal.aborted) {
          ;(config.signal as any).abort()
        }
      }
    }

    return alovaMethod
  }

  /**
   * 转换 alova 响应为标准格式
   */
  private convertFromAlovaResponse<T>(
    alovaResponse: any,
    config: RequestConfig,
  ): ResponseData<T> {
    // alova 的响应格式可能因配置而异
    // 这里假设响应已经被 responded 函数处理过

    return this.processResponse<T>(
      alovaResponse,
      200, // alova 通常只在成功时返回数据
      'OK',
      {}, // alova 可能不直接暴露响应头
      config,
      alovaResponse,
    )
  }

  /**
   * 处理 alova 错误
   */
  private handleAlovaError(error: any, config: RequestConfig): Error {
    // alova 的错误处理
    if (error.name === 'AlovaError') {
      return this.processError(error, config)
    }

    // 网络错误或其他错误
    const httpError = this.processError(error, config)

    if (error.message && error.message.includes('fetch')) {
      httpError.isNetworkError = true
    }

    return httpError
  }
}
