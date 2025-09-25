import axios from 'axios'

const API_BASE = '/api'

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.error || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export const api = {
  // 项目相关
  getProject: () => apiClient.get('/project').then(res => res.data),
  getConfig: () => apiClient.get('/config').then(res => res.data),
  updateConfig: (config: any) => apiClient.post('/config', config).then(res => res.data),

  // 任务相关
  runTask: (taskName: string, options: any = {}) =>
    apiClient.post(`/tasks/${taskName}`, options).then(res => res.data),
  getTaskStatus: (taskId: string) => apiClient.get(`/tasks/${taskId}`).then(res => res.data),
  stopTask: (taskName: string, options: any = {}) =>
    apiClient.post(`/tasks/${taskName}/stop`, options).then(res => res.data),

  // 文件系统
  listFiles: (path: string = '.') =>
    apiClient.get('/files', { params: { path } }).then(res => res.data),
  readFile: (path: string) =>
    apiClient.get('/files/content', { params: { path } }).then(res => res.data),
  writeFile: (path: string, content: string) =>
    apiClient.post('/files/content', { path, content }).then(res => res.data),

  // 模板相关
  getTemplates: () => apiClient.get('/templates').then(res => res.data),

  // 项目初始化
  initProject: (options: any) => apiClient.post('/init', options).then(res => res.data),

  // 依赖管理
  getDependencies: () => apiClient.get('/dependencies').then(res => res.data),
  addDependency: (name: string, version: string, type: string) =>
    apiClient.post('/dependencies', { name, version, type }).then(res => res.data),
  removeDependency: (name: string, type: string) =>
    apiClient.delete(`/dependencies/${name}`, { params: { type } }).then(res => res.data),
  updateDependency: (name: string, version: string, type: string) =>
    apiClient.put(`/dependencies/${name}`, { version, type }).then(res => res.data),
  upgradeAllDependencies: () => apiClient.post('/dependencies/upgrade-all').then(res => res.data),
  searchPackages: (query: string, limit?: number) =>
    apiClient.get('/dependencies/search', { params: { q: query, limit } }).then(res => res.data),

  // 插件管理
  getPlugins: () => apiClient.get('/plugins').then(res => res.data),
  getAvailablePlugins: () => apiClient.get('/plugins/available').then(res => res.data),
  installPlugin: (name: string) => apiClient.post(`/plugins/${name}/install`).then(res => res.data),
  uninstallPlugin: (name: string) => apiClient.delete(`/plugins/${name}`).then(res => res.data),
  togglePlugin: (name: string, enabled: boolean) =>
    apiClient.put(`/plugins/${name}/toggle`, { enabled }).then(res => res.data),
  updatePluginConfig: (name: string, config: any) =>
    apiClient.put(`/plugins/${name}/config`, config).then(res => res.data),

  // 项目统计
  getProjectStats: () => apiClient.get('/stats').then(res => res.data),
}

export default api
