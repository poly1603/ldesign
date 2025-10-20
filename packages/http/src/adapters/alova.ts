import type { RequestConfig, ResponseData } from '../types'
import { BaseAdapter } from './base'

/**
 * Alova 适配器
 */
export class AlovaAdapter extends BaseAdapter {
  name = 'alova'
  private alova: any // alova库，保持any避免依赖alova类型
  private alovaInstance: any // alova实例，保持any避免依赖alova类型

  constructor(alovaInstance?: any) {
    super()
    this.alovaInstance = alovaInstance

    if (!alovaInstance) {
      try {
        // 动态导入 alova
        // eslint-disable-next-line ts/no-require-imports
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
  async request<T = unknown>(config: RequestConfig): Promise<ResponseData<T>> {
    if (!this.isSupported()) {
      throw new Error(
        'Alova is not available. Please install alova: npm install alova',
      )
    }

    const processedConfig = this.processConfig(config)

    try {
      // 如果没有 alova 实例，创建一个默认的
      const alovaInstance
        = this.alovaInstance || this.createDefaultAlovaInstance()

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

    try {
      // 使用 fetch 作为默认请求适配器
      const { createAlova } = this.alova
      let adapterFetch: any

      try {
        // 尝试导入 alova/fetch 适配器（alova 3.x 版本）
        // eslint-disable-next-line ts/no-require-imports
        adapterFetch = require('alova/fetch')
        if (typeof adapterFetch === 'object' && adapterFetch.default) {
          adapterFetch = adapterFetch.default
        }
      }
      catch {
        // 如果不可用，创建一个简单的 fetch 适配器
        adapterFetch = () => (url: string, config: any) => fetch(url, config)
      }

      return createAlova({
        baseURL: '',
        requestAdapter: adapterFetch(),
        responded: (response: any) => response.json(),
      })
    }
    catch (error) {
      throw new Error(`Failed to create Alova instance: ${error}`)
    }
  }

  /**
   * 创建 alova 方法
   */
  private createAlovaMethod(alovaInstance: any, config: RequestConfig): any {
    const { url, method = 'GET', data, headers, timeout, params } = config

    // 确保URL是有效的
    if (!url) {
      throw new Error('URL is required')
    }

    // 分离URL和查询参数（因为BaseAdapter已经将params合并到URL中）
    let cleanUrl = url
    const extractedParams = params || {}

    // 如果URL包含查询参数，提取它们
    const urlParts = url.split('?')
    if (urlParts.length > 1) {
      cleanUrl = urlParts[0]
      const queryString = urlParts[1]
      const urlParams = new URLSearchParams(queryString)

      // 将URL中的参数合并到extractedParams中
      urlParams.forEach((value, key) => {
        // 尝试转换数字字符串回数字
        const numValue = Number(value)
        extractedParams[key] = !Number.isNaN(numValue) && value !== '' ? numValue : value
      })
    }

    // 构建URL（在测试环境中保持原始URL）
    let fullUrl = cleanUrl
    if (!cleanUrl.startsWith('http') && !cleanUrl.startsWith('//') && config.baseURL) {
      // 只有在明确提供baseURL时才构建完整URL
      fullUrl = `${config.baseURL.replace(/\/$/, '')}/${cleanUrl.replace(/^\//, '')}`
    }

    // 构建选项对象
    const options: any = {
      headers,
      timeout,
    }

    // 添加查询参数
    if (extractedParams && Object.keys(extractedParams).length > 0) {
      options.params = extractedParams
    }

    // 添加信号
    if (config.signal) {
      options.signal = config.signal
    }

    // 根据方法类型创建对应的 alova 方法
    let alovaMethod: any

    try {
      switch (method.toUpperCase()) {
        case 'GET':
          alovaMethod = alovaInstance.Get(fullUrl, options)
          break
        case 'POST':
          alovaMethod = alovaInstance.Post(fullUrl, data, options)
          break
        case 'PUT':
          alovaMethod = alovaInstance.Put(fullUrl, data, options)
          break
        case 'DELETE':
          alovaMethod = alovaInstance.Delete(fullUrl, options)
          break
        case 'PATCH':
          alovaMethod = alovaInstance.Patch(fullUrl, data, options)
          break
        case 'HEAD':
          alovaMethod = alovaInstance.Head(fullUrl, options)
          break
        case 'OPTIONS':
          alovaMethod = alovaInstance.Options(fullUrl, options)
          break
        default:
          throw new Error(`Unsupported HTTP method: ${method}`)
      }
    }
    catch (error: any) {
      throw new Error(`Failed to parse URL from ${url}: ${error.message}`)
    }

    // 设置取消信号
    if (config.signal) {
      alovaMethod.abort = () => {
        if (config.signal && !config.signal.aborted) {
          ; (config.signal as any).abort()
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
    // 如果错误包含状态码信息，创建带状态码的错误
    if (error.status || error.response?.status) {
      const status = error.status || error.response.status
      const message = `Request failed with status code ${status}`
      const httpError = this.processError(new Error(message), config, error.response)
      httpError.status = status
      return httpError
    }

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
