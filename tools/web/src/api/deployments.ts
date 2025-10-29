import { apiClient } from './client'

export interface Deployment {
  id: string
  projectId: string
  environment: string
  status: 'pending' | 'deploying' | 'success' | 'failed' | 'rolled_back'
  version?: string
  startTime: number
  endTime?: number
  duration?: number
  logs?: string
}

export const deploymentsApi = {
  /**
   * 获取部署列表
   */
  async getAll(params?: {
    projectId?: string
    environment?: string
    limit?: number
    offset?: number
  }): Promise<Deployment[]> {
    return apiClient.get('/deployments', { params })
  },

  /**
   * 获取部署详情
   */
  async getById(id: string): Promise<Deployment> {
    return apiClient.get(`/deployments/${id}`)
  },

  /**
   * 创建部署
   */
  async create(data: { projectId: string; environment: string; version?: string }): Promise<Deployment> {
    return apiClient.post('/deployments', data)
  },

  /**
   * 回滚部署
   */
  async rollback(id: string): Promise<void> {
    return apiClient.post(`/deployments/${id}/rollback`)
  },
}
