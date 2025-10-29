import { apiClient } from './client'

export interface Tool {
  name: string
  status: 'inactive' | 'initializing' | 'active' | 'error' | 'busy'
  metadata: {
    name: string
    displayName: string
    description?: string
    icon?: string
  }
}

export const toolsApi = {
  /**
   * 获取所有工具
   */
  async getAll(): Promise<Tool[]> {
    return apiClient.get('/tools')
  },

  /**
   * 获取工具状态
   */
  async getStatus(name: string): Promise<{ name: string; status: string }> {
    return apiClient.get(`/tools/${name}/status`)
  },

  /**
   * 获取工具配置
   */
  async getConfig(name: string): Promise<any> {
    return apiClient.get(`/tools/${name}/config`)
  },

  /**
   * 更新工具配置
   */
  async updateConfig(name: string, config: any): Promise<void> {
    return apiClient.put(`/tools/${name}/config`, config)
  },

  /**
   * 执行工具操作
   */
  async execute(name: string, action: string, params?: any): Promise<any> {
    return apiClient.post(`/tools/${name}/execute`, { action, params })
  },

  /**
   * 加载工具
   */
  async load(name: string): Promise<void> {
    return apiClient.post(`/tools/${name}/load`)
  },
}


