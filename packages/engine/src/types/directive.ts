/**
 * 指令管理类型定义
 * 包含指令管理器、指令类型等相关类型
 */

// 引擎指令接口
export interface EngineDirective {
  name: string
  description?: string
  version: string
  author?: string
  category?: string
  tags?: string[]
  dependencies?: string[]
  config?: DirectiveConfig
  lifecycle: DirectiveLifecycle
  metadata?: Record<string, unknown>
}

// 指令配置
export interface DirectiveConfig {
  enabled: boolean
  priority: number
  scope: 'global' | 'local' | 'component'
  autoRegister: boolean
  hotReload: boolean
  validation: boolean
  logging: boolean
}

// 指令生命周期
export interface DirectiveLifecycle {
  beforeCreate?: () => void
  created?: () => void
  beforeMount?: () => void
  mounted?: () => void
  beforeUpdate?: () => void
  updated?: () => void
  beforeUnmount?: () => void
  unmounted?: () => void
  error?: (error: Error) => void
}

// 指令管理器接口
export interface DirectiveManager {
  register: (name: string, directive: EngineDirective) => void
  registerBatch: (directives: Record<string, EngineDirective>) => void
  unregister: (name: string) => void
  get: (name: string) => EngineDirective | undefined
  getAll: () => EngineDirective[]
  getByCategory: (category: string) => EngineDirective[]
  getByTag: (tag: string) => EngineDirective[]
  enable: (name: string) => void
  disable: (name: string) => void
  reload: (name: string) => void
  validate: (directive: EngineDirective) => DirectiveValidationResult
}

// 指令验证结果
export interface DirectiveValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

// 指令加载器接口
export interface DirectiveLoader {
  load: (path: string) => Promise<EngineDirective>
  loadFromUrl: (url: string) => Promise<EngineDirective>
  loadFromPackage: (packageName: string) => Promise<EngineDirective>
  validate: (directive: unknown) => DirectiveValidationResult
  getDependencies: (directive: EngineDirective) => string[]
}

// 指令热重载接口
export interface DirectiveHotReload {
  enable: (directive: EngineDirective) => void
  disable: (directive: EngineDirective) => void
  reload: (directive: EngineDirective) => void
  watch: (path: string, callback: () => void) => void
  unwatch: (path: string) => void
  isWatching: (path: string) => boolean
}

// 指令市场接口
export interface DirectiveMarketplace {
  search: (query: string) => Promise<EngineDirective[]>
  browse: (category?: string, tags?: string[]) => Promise<EngineDirective[]>
  getFeatured: () => Promise<EngineDirective[]>
  getPopular: () => Promise<EngineDirective[]>
  getRecent: () => Promise<EngineDirective[]>
  install: (directive: EngineDirective) => Promise<void>
  uninstall: (name: string) => Promise<void>
  update: (name: string) => Promise<void>
  rate: (name: string, rating: number, review?: string) => Promise<void>
}

// 指令验证器接口
export interface DirectiveValidator {
  validate: (directive: EngineDirective) => DirectiveValidationResult
  validateSchema: (schema: unknown) => DirectiveValidationResult
  validateDependencies: (directive: EngineDirective) => DirectiveValidationResult
  validateCompatibility: (directive: EngineDirective, target: string) => DirectiveValidationResult
  getSchema: () => unknown
  setSchema: (schema: unknown) => void
}

// 指令隔离器接口
export interface DirectiveIsolator {
  isolate: (directive: EngineDirective) => void
  unisolate: (name: string) => void
  isIsolated: (name: string) => boolean
  getIsolated: () => EngineDirective[]
  setSandbox: (enabled: boolean) => void
  getSandboxConfig: () => SandboxConfig
}

// 沙箱配置
export interface SandboxConfig {
  enabled: boolean
  strict: boolean
  allowedApis: string[]
  blockedApis: string[]
  memoryLimit: number
  timeout: number
  networkAccess: boolean
  fileAccess: boolean
}
