import type { RequestConfig, ResponseData } from '@/types'
import { BaseAdapter } from './base'

/**
 * Axios 适配器
 */
export class AxiosAdapter extends BaseAdapter {
  name = 'axios'
  private axios: any

  constructor() {
    super()
    try {
      // 动态导入 axios
      this.axios = require('axios')
    } catch {
      // axios 未安装
      this.axios = null
    }
  }

  /**
   * 检查是否支持 axios
   */
  isSupported(): boolean {
    return this.axios !== null
  }

  /**
   * 发送请求
   */
  async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    if (!this.isSupported()) {
      throw new Error('Axios is not available. Please install axios: npm install axios')
    }

    const processedConfig = this.processConfig(config)

    try {
      // 转换配置为 axios 格式
      const axiosConfig = this.convertToAxiosConfig(processedConfig)

      // 发送请求
      const response = await this.axios(axiosConfig)

      // 转换响应为标准格式
      return this.convertFromAxiosResponse<T>(response, processedConfig)
    } catch (error) {
      throw this.handleAxiosError(error, processedConfig)
    }
  }

  /**
   * 转换配置为 axios 格式
   */
  private convertToAxiosConfig(config: RequestConfig): any {
    const axiosConfig: any = {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
      timeout: config.timeout,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      signal: config.signal,
    }

    // 处理查询参数
    if (config.params) {
      axiosConfig.params = config.params
    }

    // 处理响应类型
    if (config.responseType) {
      switch (config.responseType) {
        case 'json':
          axiosConfig.responseType = 'json'
          break
        case 'text':
          axiosConfig.responseType = 'text'
          break
        case 'blob':
          axiosConfig.responseType = 'blob'
          break
        case 'arrayBuffer':
          axiosConfig.responseType = 'arraybuffer'
          break
        case 'stream':
          axiosConfig.responseType = 'stream'
          break
        default:
          axiosConfig.responseType = 'json'
      }
    }

    // 移除 undefined 值
    Object.keys(axiosConfig).forEach((key) => {
      if (axiosConfig[key] === undefined) {
        delete axiosConfig[key]
      }
    })

    return axiosConfig
  }

  /**
   * 转换 axios 响应为标准格式
   */
  private convertFromAxiosResponse<T>(
    axiosResponse: any,
    config: RequestConfig
  ): ResponseData<T> {
    return this.processResponse<T>(
      axiosResponse.data,
      axiosResponse.status,
      axiosResponse.statusText,
      axiosResponse.headers || {},
      config,
      axiosResponse
    )
  }

  /**
   * 处理 axios 错误
   */
  private handleAxiosError(error: any, config: RequestConfig): Error {
    if (error.response) {
      // 服务器响应了错误状态码
      const response = this.convertFromAxiosResponse(error.response, config)
      return this.processError(error, config, response)
    } else if (error.request) {
      // 请求已发送但没有收到响应
      const httpError = this.processError(error, config)
      httpError.isNetworkError = true
      return httpError
    } else {
      // 其他错误
      return this.processError(error, config)
    }
  }
}
