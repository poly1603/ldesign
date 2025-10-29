// 响应格式
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: number
}

// 项目类型
export interface Project {
  id: string
  name: string
  path: string
  type: string
  framework?: string
  packageManager?: string
  description?: string
  config?: Record<string, any>
  createdAt: number
  updatedAt: number
  lastOpenedAt?: number
}

// 工具类型
export interface Tool {
  name: string
  status: 'inactive' | 'initializing' | 'active' | 'error' | 'busy'
  metadata: {
    name: string
    displayName: string
    description?: string
    icon?: string
    version?: string
  }
}

// 构建记录
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

// 部署记录
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

// 测试运行
export interface TestRun {
  id: string
  projectId: string
  type: 'unit' | 'integration' | 'e2e' | 'all'
  status: 'pending' | 'running' | 'passed' | 'failed' | 'cancelled'
  startTime: number
  endTime?: number
  duration?: number
  total?: number
  passed?: number
  failed?: number
  skipped?: number
  coverage?: number
  results?: any
}

// 日志
export interface Log {
  id?: number
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  meta?: any
  timestamp: number
}

// 监控数据
export interface MonitorMetrics {
  cpu: number
  memory: number
  disk: number
  network: {
    rx: number
    tx: number
  }
  timestamp: number
}

// 统计数据
export interface ProjectStats {
  files: number
  lines: number
  size: number
  dependencies: number
  commits?: number
  lastCommit?: string
}
