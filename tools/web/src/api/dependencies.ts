import { apiClient } from './client'

export const dependenciesApi = {
  /**
   * 获取项目依赖
   */
  getDependencies: (projectId: string): Promise<any> => {
    return apiClient.get(`/dependencies/${projectId}`)
  },

  /**
   * 检查依赖更新
   */
  checkDependencyUpdates: (projectId: string): Promise<any[]> => {
    return apiClient.get(`/dependencies/${projectId}/updates`)
  },

  /**
   * 获取依赖树
   */
  getDependencyTree: (projectId: string): Promise<any> => {
    return apiClient.get(`/dependencies/${projectId}/tree`)
  },
}
