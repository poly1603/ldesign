import { apiClient } from './client'

export interface Build {
  id: string
  projectId: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled'
  startTime: number
  endTime?: number
  duration?: number
  output?: string
  errors?: string
}

export const buildsApi = {
  /**
   * 获取构建列表
   */
  async getAll(params?: { projectId?: string; limit?: number; offset?: number }): Promise<Build[]> {
    return apiClient.get('/builds', { params })
  },

  /**
   * 获取构建详情
   */
  async getById(id: string): Promise<Build> {
    return apiClient.get(`/builds/${id}`)
  },

  /**
   * 创建构建
   */
  async create(projectId: string): Promise<Build> {
    return apiClient.post('/builds', { projectId })
  },

  /**
   * 取消构建
   */
  async cancel(id: string): Promise<void> {
    return apiClient.post(`/builds/${id}/cancel`)
  },
}
