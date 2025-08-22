/**
 * 指令管理类型定义
 * 包含指令管理器、指令类型等相关类型
 */

// 指令接口
export interface Directive {
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
  register: (directive: Directive) => void
  unregister: (name: string) => void
  get: (name: string) => Directive | undefined
  getAll: () => Directive[]
  getByCategory: (category: string) => Directive[]
  getByTag: (tag: string) => Directive[]
  enable: (name: string) => void
  disable: (name: string) => void
  reload: (name: string) => void
  validate: (directive: Directive) => DirectiveValidationResult
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
  load: (path: string) => Promise<Directive>
  loadFromUrl: (url: string) => Promise<Directive>
  loadFromPackage: (packageName: string) => Promise<Directive>
  validate: (directive: unknown) => DirectiveValidationResult
  getDependencies: (directive: Directive) => string[]
}

// 指令热重载接口
export interface DirectiveHotReload {
  enable: (directive: Directive) => void
  disable: (directive: Directive) => void
  reload: (directive: Directive) => void
  watch: (path: string, callback: () => void) => void
  unwatch: (path: string) => void
  isWatching: (path: string) => boolean
}

// 指令市场接口
export interface DirectiveMarketplace {
  search: (query: string) => Promise<Directive[]>
  browse: (category?: string, tags?: string[]) => Promise<Directive[]>
  getFeatured: () => Promise<Directive[]>
  getPopular: () => Promise<Directive[]>
  getRecent: () => Promise<Directive[]>
  install: (directive: Directive) => Promise<void>
  uninstall: (name: string) => Promise<void>
  update: (name: string) => Promise<void>
  rate: (name: string, rating: number, review?: string) => Promise<void>
}

// 指令验证器接口
export interface DirectiveValidator {
  validate: (directive: Directive) => DirectiveValidationResult
  validateSchema: (schema: unknown) => DirectiveValidationResult
  validateDependencies: (directive: Directive) => DirectiveValidationResult
  validateCompatibility: (directive: Directive, target: string) => DirectiveValidationResult
  getSchema: () => unknown
  setSchema: (schema: unknown) => void
}

// 指令隔离器接口
export interface DirectiveIsolator {
  isolate: (directive: Directive) => void
  unisolate: (name: string) => void
  isIsolated: (name: string) => boolean
  getIsolated: () => Directive[]
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
