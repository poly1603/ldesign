/**
 * 共享常量定义
 */

import type { ToolName, ToolMetadata } from '../types'

/**
 * 应用名称
 */
export const APP_NAME = 'ldesign'

/**
 * 应用显示名称
 */
export const APP_DISPLAY_NAME = 'LDesign CLI'

/**
 * 默认端口
 */
export const DEFAULT_PORT = 3000

/**
 * 默认主机
 */
export const DEFAULT_HOST = 'localhost'

/**
 * 数据库文件名
 */
export const DB_FILE_NAME = 'ldesign-cli.db'

/**
 * 配置文件名
 */
export const CONFIG_FILE_NAME = '.ldesignrc.json'

/**
 * 工具元数据映射
 */
export const TOOL_METADATA: Record<ToolName, ToolMetadata> = {
  builder: {
    name: 'builder',
    displayName: '构建工具',
    description: '智能前端库打包工具',
    icon: '🔨',
    category: 'build',
  },
  launcher: {
    name: 'launcher',
    displayName: '项目启动',
    description: '企业级前端启动器',
    icon: '🚀',
    category: 'dev',
  },
  tester: {
    name: 'tester',
    displayName: '测试工具',
    description: '测试工具集',
    icon: '🧪',
    category: 'test',
  },
  analyzer: {
    name: 'analyzer',
    displayName: '代码分析',
    description: '代码分析工具',
    icon: '📊',
    category: 'analysis',
  },
  deployer: {
    name: 'deployer',
    displayName: '部署工具',
    description: '自动化部署工具',
    icon: '🌐',
    category: 'deploy',
  },
  'docs-generator': {
    name: 'docs-generator',
    displayName: '文档生成',
    description: '文档生成工具',
    icon: '📚',
    category: 'docs',
  },
  generator: {
    name: 'generator',
    displayName: '代码生成',
    description: '代码生成器',
    icon: '⚡',
    category: 'generation',
  },
  git: {
    name: 'git',
    displayName: 'Git管理',
    description: 'Git操作工具',
    icon: '📦',
    category: 'scm',
  },
  monitor: {
    name: 'monitor',
    displayName: '性能监控',
    description: '性能监控工具',
    icon: '📈',
    category: 'monitoring',
  },
  security: {
    name: 'security',
    displayName: '安全扫描',
    description: '安全扫描工具',
    icon: '🔒',
    category: 'security',
  },
  deps: {
    name: 'deps',
    displayName: '依赖管理',
    description: '依赖管理工具',
    icon: '📦',
    category: 'management',
  },
}

/**
 * API 基础路径
 */
export const API_BASE_PATH = '/api'

/**
 * WebSocket 路径
 */
export const WS_PATH = '/ws'

/**
 * 超时配置
 */
export const TIMEOUT = {
  DEFAULT: 30000, // 30秒
  TOOL_EXECUTION: 300000, // 5分钟
  BUILD: 600000, // 10分钟
  DEPLOY: 900000, // 15分钟
}

/**
 * 日志级别
 */
export const LOG_LEVELS = ['debug', 'info', 'warn', 'error', 'silent'] as const

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
}

/**
 * 错误代码
 */
export const ERROR_CODES = {
  // 通用错误
  UNKNOWN: 'UNKNOWN',
  INVALID_PARAMS: 'INVALID_PARAMS',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // 项目相关
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  PROJECT_ALREADY_EXISTS: 'PROJECT_ALREADY_EXISTS',
  PROJECT_INVALID_PATH: 'PROJECT_INVALID_PATH',

  // 工具相关
  TOOL_NOT_FOUND: 'TOOL_NOT_FOUND',
  TOOL_EXECUTION_FAILED: 'TOOL_EXECUTION_FAILED',
  TOOL_NOT_INITIALIZED: 'TOOL_NOT_INITIALIZED',
  TOOL_TIMEOUT: 'TOOL_TIMEOUT',

  // 工作流相关
  WORKFLOW_NOT_FOUND: 'WORKFLOW_NOT_FOUND',
  WORKFLOW_EXECUTION_FAILED: 'WORKFLOW_EXECUTION_FAILED',
  WORKFLOW_STEP_FAILED: 'WORKFLOW_STEP_FAILED',

  // 数据库相关
  DATABASE_ERROR: 'DATABASE_ERROR',

  // 网络相关
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
}


