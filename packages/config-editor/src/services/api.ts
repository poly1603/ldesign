/**
 * API 服务模块
 * 
 * 提供与后端 API 通信的服务函数
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { ConfigFileType } from '../types/common'
import type { LauncherConfig, AppConfig, PackageJsonConfig } from '../types/config'

/**
 * API 响应接口
 */
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

/**
 * 配置 API 类
 */
class ConfigApi {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: 'http://localhost:3002/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API 请求: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('API 请求错误:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.client.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`API 响应: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('API 响应错误:', error)
        return Promise.reject(error)
      }
    )
  }

  /**
   * 获取所有配置
   */
  async getAllConfigs(): Promise<ApiResponse<{
    launcher: LauncherConfig | null
    app: AppConfig | null
    package: PackageJsonConfig | null
  }>> {
    try {
      const response = await this.client.get<ApiResponse>('/configs')
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取配置失败'
      }
    }
  }

  /**
   * 获取特定类型的配置
   */
  async getConfig<T>(type: ConfigFileType): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(`/configs/${type}`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取配置失败'
      }
    }
  }

  /**
   * 更新配置
   */
  async updateConfig<T>(type: ConfigFileType, updates: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(`/configs/${type}`, updates)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '更新配置失败'
      }
    }
  }

  /**
   * 保存配置
   */
  async saveConfig(type: ConfigFileType): Promise<ApiResponse> {
    try {
      const response = await this.client.post<ApiResponse>(`/configs/${type}/save`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '保存配置失败'
      }
    }
  }

  /**
   * 验证配置
   */
  async validateConfig<T>(type: ConfigFileType, config: T): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(`/configs/${type}/validate`, config)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '验证配置失败'
      }
    }
  }

  /**
   * 重置配置
   */
  async resetConfig<T>(type: ConfigFileType): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(`/configs/${type}/reset`)
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '重置配置失败'
      }
    }
  }

  /**
   * 获取工作目录信息
   */
  async getWorkspace(): Promise<ApiResponse<{
    cwd: string
    files: Record<string, string>
  }>> {
    try {
      const response = await this.client.get<ApiResponse>('/workspace')
      return response.data
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取工作目录失败'
      }
    }
  }

  /**
   * 检查服务器健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get('http://localhost:3002/health', { timeout: 3000 })
      return response.status === 200
    } catch {
      return false
    }
  }
}

// 导出单例实例
export const configApi = new ConfigApi()

// 导出类型
export type { ApiResponse }
