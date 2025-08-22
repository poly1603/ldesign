/**
 * 模块联邦配置
 * 支持包的独立部署和运行时加载
 */

import type { ModuleFederationConfig } from '@module-federation/enhanced'

export interface MicrofrontendConfig {
  /** 应用名称 */
  name: string
  /** 暴露的模块 */
  exposes?: Record<string, string>
  /** 远程模块 */
  remotes?: Record<string, string>
  /** 共享依赖 */
  shared?: Record<string, any>
  /** 入口文件 */
  filename?: string
  /** 运行时版本 */
  runtimeVersion?: string
}

/**
 * 创建模块联邦配置
 */
export function createModuleFederationConfig(
  config: MicrofrontendConfig,
): ModuleFederationConfig {
  const {
    name,
    exposes = {},
    remotes = {},
    shared = {},
    filename = 'remoteEntry.js',
    runtimeVersion = 'auto',
  } = config

  return {
    name,
    filename,
    exposes,
    remotes,
    runtimeVersion,
    shared: {
      // Vue 共享配置
      'vue': {
        singleton: true,
        requiredVersion: '^3.3.0',
        eager: false,
      },
      // Vue Router 共享配置
      'vue-router': {
        singleton: true,
        requiredVersion: '^4.0.0',
        eager: false,
      },
      // Pinia 共享配置
      'pinia': {
        singleton: true,
        requiredVersion: '^2.0.0',
        eager: false,
      },
      // LDesign 核心包共享
      '@ldesign/engine': {
        singleton: true,
        eager: false,
      },
      '@ldesign/color': {
        singleton: true,
        eager: false,
      },
      '@ldesign/crypto': {
        singleton: true,
        eager: false,
      },
      '@ldesign/device': {
        singleton: true,
        eager: false,
      },
      '@ldesign/http': {
        singleton: true,
        eager: false,
      },
      '@ldesign/i18n': {
        singleton: true,
        eager: false,
      },
      '@ldesign/router': {
        singleton: true,
        eager: false,
      },
      '@ldesign/store': {
        singleton: true,
        eager: false,
      },
      '@ldesign/template': {
        singleton: true,
        eager: false,
      },
      // 自定义共享配置
      ...shared,
    },
  }
}

/**
 * 预定义的包配置
 */
export const packageConfigs: Record<string, MicrofrontendConfig> = {
  // 引擎包 - 作为主应用
  engine: {
    name: 'ldesign_engine',
    exposes: {
      './Engine': './src/index.ts',
      './PluginSystem': './src/core/plugin-system.ts',
      './EventManager': './src/core/event-manager.ts',
      './StateManager': './src/core/state-manager.ts',
    },
  },

  // 颜色包
  color: {
    name: 'ldesign_color',
    exposes: {
      './ColorUtils': './src/index.ts',
      './ColorPicker': './src/components/ColorPicker.tsx',
      './ColorPalette': './src/components/ColorPalette.tsx',
    },
    remotes: {
      engine: 'ldesign_engine@http://localhost:3000/remoteEntry.js',
    },
  },

  // 加密包
  crypto: {
    name: 'ldesign_crypto',
    exposes: {
      './CryptoUtils': './src/index.ts',
      './AESCrypto': './src/core/aes.ts',
      './RSACrypto': './src/core/rsa.ts',
      './HashUtils': './src/core/hash.ts',
    },
    remotes: {
      engine: 'ldesign_engine@http://localhost:3000/remoteEntry.js',
    },
  },

  // 设备检测包
  device: {
    name: 'ldesign_device',
    exposes: {
      './DeviceDetector': './src/index.ts',
      './BrowserDetector': './src/core/browser.ts',
      './OSDetector': './src/core/os.ts',
    },
    remotes: {
      engine: 'ldesign_engine@http://localhost:3000/remoteEntry.js',
    },
  },

  // HTTP 客户端包
  http: {
    name: 'ldesign_http',
    exposes: {
      './HttpClient': './src/index.ts',
      './RequestInterceptor': './src/core/interceptors.ts',
      './CacheManager': './src/core/cache.ts',
    },
    remotes: {
      engine: 'ldesign_engine@http://localhost:3000/remoteEntry.js',
    },
  },

  // 国际化包
  i18n: {
    name: 'ldesign_i18n',
    exposes: {
      './I18nManager': './src/index.ts',
      './LanguageLoader': './src/core/loader.ts',
      './Translator': './src/core/translator.ts',
    },
    remotes: {
      engine: 'ldesign_engine@http://localhost:3000/remoteEntry.js',
    },
  },

  // 路由包
  router: {
    name: 'ldesign_router',
    exposes: {
      './RouterManager': './src/index.ts',
      './RouteGuard': './src/core/guards.ts',
      './NavigationManager': './src/core/navigation.ts',
    },
    remotes: {
      engine: 'ldesign_engine@http://localhost:3000/remoteEntry.js',
    },
  },

  // 状态管理包
  store: {
    name: 'ldesign_store',
    exposes: {
      './StoreManager': './src/index.ts',
      './StateManager': './src/core/state.ts',
      './ActionManager': './src/core/actions.ts',
    },
    remotes: {
      engine: 'ldesign_engine@http://localhost:3000/remoteEntry.js',
    },
  },

  // 模板引擎包
  template: {
    name: 'ldesign_template',
    exposes: {
      './TemplateEngine': './src/index.ts',
      './TemplateManager': './src/core/manager.ts',
      './TemplateRenderer': './src/core/renderer.ts',
    },
    remotes: {
      engine: 'ldesign_engine@http://localhost:3000/remoteEntry.js',
    },
  },
}

/**
 * 获取包的模块联邦配置
 */
export function getPackageConfig(packageName: string): ModuleFederationConfig {
  const config = packageConfigs[packageName]
  if (!config) {
    throw new Error(`Package config not found for: ${packageName}`)
  }
  return createModuleFederationConfig(config)
}

/**
 * 创建开发环境的远程配置
 */
export function createDevRemotes(basePort = 3000): Record<string, string> {
  const packages = Object.keys(packageConfigs)
  const remotes: Record<string, string> = {}

  packages.forEach((pkg, index) => {
    const port = basePort + index
    const config = packageConfigs[pkg]
    remotes[pkg] = `${config.name}@http://localhost:${port}/remoteEntry.js`
  })

  return remotes
}

/**
 * 创建生产环境的远程配置
 */
export function createProdRemotes(
  baseUrl = 'https://cdn.ldesign.com',
): Record<string, string> {
  const packages = Object.keys(packageConfigs)
  const remotes: Record<string, string> = {}

  packages.forEach((pkg) => {
    const config = packageConfigs[pkg]
    remotes[pkg] = `${config.name}@${baseUrl}/${pkg}/remoteEntry.js`
  })

  return remotes
}

/**
 * 创建 Vite 模块联邦插件配置
 */
export function createViteFederationConfig(packageName: string, isDev = true) {
  const config = getPackageConfig(packageName)
  const remotes = isDev ? createDevRemotes() : createProdRemotes()

  return {
    ...config,
    remotes: {
      ...config.remotes,
      ...remotes,
    },
  }
}

/**
 * 微前端运行时配置
 */
export interface MicrofrontendRuntime {
  /** 包注册表 */
  registry: Map<string, any>
  /** 加载状态 */
  loadingStates: Map<string, 'loading' | 'loaded' | 'error'>
  /** 错误信息 */
  errors: Map<string, Error>
}

/**
 * 创建微前端运行时
 */
export function createMicrofrontendRuntime(): MicrofrontendRuntime {
  return {
    registry: new Map(),
    loadingStates: new Map(),
    errors: new Map(),
  }
}
