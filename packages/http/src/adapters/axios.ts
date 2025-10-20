import type { RequestConfig, ResponseData } from '../types'
import { BaseAdapter } from './base'

/**
 * Axios 适配器
 */
export class AxiosAdapter extends BaseAdapter {
  name = 'axios'
  private axios: any // axios实例，保持any避免依赖axios类型

  constructor(axiosInstance?: any) {
    super()

    if (axiosInstance) {
      this.axios = axiosInstance
    }
    else {
      try {
        // 动态导入 axios
        // eslint-disable-next-line ts/no-require-imports
        this.axios = require('axios')
      }
      catch {
        // axios 未安装
        this.axios = null
      }
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
  async request<T = unknown>(config: RequestConfig): Promise<ResponseData<T>> {
    if (!this.isSupported()) {
      throw new Error(
        'Axios is not available. Please install axios: npm install axios',
      )
    }

    const processedConfig = this.processConfig(config)

    try {
      // 转换配置为 axios 格式
      const axiosConfig = this.convertToAxiosConfig(processedConfig)

      // 发送请求
      const response = await this.axios.request(axiosConfig)

      // 转换响应为标准格式
      return this.convertFromAxiosResponse<T>(response, processedConfig)
    }
    catch (error) {
      throw this.handleAxiosError(error, processedConfig)
    }
  }

  /**
   * 转换配置为 axios 格式
   */
  private convertToAxiosConfig(config: RequestConfig): any {
    // 分离URL和查询参数（因为BaseAdapter已经将params合并到URL中）
    let cleanUrl = config.url || ''
    const extractedParams = config.params || {}
    const baseURL = config.baseURL

    // 如果URL包含查询参数，提取它们
    const urlParts = cleanUrl.split('?')
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

    // 如果URL已经包含了baseURL，需要分离它们
    if (baseURL && cleanUrl.startsWith(baseURL)) {
      cleanUrl = cleanUrl.substring(baseURL.length)
      // 确保URL以/开头
      if (!cleanUrl.startsWith('/')) {
        cleanUrl = `/${cleanUrl}`
      }
    }

    const axiosConfig: any = {
      url: cleanUrl,
      method: config.method,
    }

    // 只在有值时添加字段
    if (config.headers && Object.keys(config.headers).length > 0) {
      axiosConfig.headers = config.headers
    }
    if (config.data !== undefined) {
      axiosConfig.data = config.data
    }
    if (config.timeout !== undefined) {
      axiosConfig.timeout = config.timeout
    }
    if (baseURL) {
      axiosConfig.baseURL = baseURL
    }
    if (config.withCredentials !== undefined) {
      axiosConfig.withCredentials = config.withCredentials
    }
    if (config.signal) {
      axiosConfig.signal = config.signal
    }

    // 处理查询参数
    if (extractedParams && Object.keys(extractedParams).length > 0) {
      axiosConfig.params = extractedParams
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
    config: RequestConfig,
  ): ResponseData<T> {
    // 创建简化的config对象，只包含必要的字段
    const simplifiedConfig = {
      url: config.url,
    }

    return this.processResponse<T>(
      axiosResponse.data,
      axiosResponse.status,
      axiosResponse.statusText,
      axiosResponse.headers || {},
      simplifiedConfig,
    )
  }

  /**
   * 处理 axios 错误
   */
  private handleAxiosError(error: any, config: RequestConfig): Error {
    if (error.response) {
      // 服务器响应了错误状态码
      const response = this.convertFromAxiosResponse(error.response, config)
      const status = error.response.status
      const message = `Request failed with status code ${status}`
      const httpError = this.processError(new Error(message), config, response)
      httpError.status = status
      httpError.response = response
      return httpError
    }
    else if (error.request) {
      // 请求已发送但没有收到响应
      const httpError = this.processError(error, config)
      httpError.isNetworkError = true
      return httpError
    }
    else {
      // 其他错误
      return this.processError(error, config)
    }
  }
}
