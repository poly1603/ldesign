import { apiClient } from './client'

export interface SystemMetrics {
  cpu: number
  memory: number
  disk: number
  network: {
    rx: number
    tx: number
  }
  timestamp: number
}

export interface ProjectMetrics {
  projectId: string
  uptime: number
  requests: number
  errors: number
  responseTime: number
  timestamp: number
}

export const monitorApi = {
  /**
   * 获取系统监控数据
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    return apiClient.get('/monitor/system')
  },

  /**
   * 获取项目监控数据
   */
  async getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
    return apiClient.get(`/monitor/project/${projectId}`)
  },
}
