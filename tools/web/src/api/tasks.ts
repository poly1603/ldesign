import { apiClient } from './client'

export interface Task {
  id: string
  type: string
  projectId?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  message: string
  error?: string
  result?: any
  createdAt: number
  startedAt?: number
  completedAt?: number
  logs: TaskLog[]
}

export interface TaskLog {
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
  timestamp: number
}

export const tasksApi = {
  /**
   * 获取任务列表
   */
  getTasks: (status?: string): Promise<Task[]> => {
    const params = status ? { status } : {}
    return apiClient.get('/tasks', { params })
  },

  /**
   * 获取单个任务
   */
  getTask: (id: string): Promise<Task> => {
    return apiClient.get(`/tasks/${id}`)
  },

  /**
   * 创建任务
   */
  createTask: (data: { type: string; projectId?: string }): Promise<Task> => {
    return apiClient.post('/tasks', data)
  },

  /**
   * 取消任务
   */
  cancelTask: (id: string): Promise<void> => {
    return apiClient.post(`/tasks/${id}/cancel`)
  },

  /**
   * 删除任务
   */
  deleteTask: (id: string): Promise<void> => {
    return apiClient.delete(`/tasks/${id}`)
  },

  /**
   * 清理已完成的任务
   */
  cleanupTasks: (olderThan?: number): Promise<{ count: number }> => {
    return apiClient.post('/tasks/cleanup', { olderThan })
  },
}
