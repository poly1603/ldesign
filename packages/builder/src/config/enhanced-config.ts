/**
 * 增强的配置定义
 * 
 * 提供更强大的配置定义和验证功能
 * 
 * @author LDesign Team
 * @version 1.0.0
 */

import type { BuilderConfig } from '../types/config'
import type { MinifyLevel } from '../types/minify'
import type { OutputFormat } from '../types/adapter'
import { ConfigValidator, type ValidationResult } from '../core/ConfigValidator'
import { Logger } from '../utils/logger'

/**
 * 增强的配置选项
 */
export interface EnhancedConfigOptions extends Partial<BuilderConfig> {
  /** 配置验证选项 */
  validation?: {
    /** 是否启用验证 */
    enabled?: boolean
    /** 是否严格模式 */
    strict?: boolean
    /** 是否检查文件存在性 */
    checkFiles?: boolean
    /** 验证失败时是否抛出错误 */
    throwOnError?: boolean
  }

  /** 构建清单选项 */
  manifest?: {
    /** 是否生成构建清单 */
    enabled?: boolean
    /** 清单格式 */
    formats?: ('json' | 'markdown' | 'html')[]
    /** 清单输出路径 */
    outputPath?: string
  }

  /** Banner 閫夐」 */
  bannerOptions?: {
    /** 鏄惁鍚敤 banner */
    enabled?: boolean
    /** Banner 鏍峰紡 */
    style?: 'default' | 'compact' | 'detailed'
    /** 鑷畾涔変俊鎭?*/
    customInfo?: Record<string, string>
  }

  /** 文件命名规则 */
  naming?: {
    /** 输出文件名模板 */
    template?: string
    /** 是否包含哈希 */
    hash?: boolean
    /** 哈希长度 */
    hashLength?: number
  }

  /** 高级输出选项 */
  advancedOutput?: {
    /** 是否分离 vendor */
    splitVendor?: boolean
    /** vendor 包含的模块 */
    vendorModules?: string[]
    /** 是否生成 polyfill */
    polyfill?: boolean
    /** 目标浏览器 */
    targets?: string | string[]
  }

  /** 开发服务器选项 */
  devServer?: {
    /** 端口号 */
    port?: number
    /** 主机名 */
    host?: string
    /** 是否自动打开浏览器 */
    open?: boolean
    /** 热重载 */
    hmr?: boolean
  }

  /** 构建钩子 */
  hooks?: {
    /** 构建前钩子 */
    beforeBuild?: (config: BuilderConfig) => void | Promise<void>
    /** 构建后钩子 */
    afterBuild?: (result: any) => void | Promise<void>
    /** 错误处理钩子 */
    onError?: (error: Error) => void | Promise<void>
  }
}

/**
 * 预设配置
 */
export const CONFIG_PRESETS = {
  /** 库开发预设 */
  library: {
    output: {
      format: ['esm', 'cjs'] as OutputFormat[],
      sourcemap: true
    },
    minify: false,
    performance: {
      treeshaking: true,
      bundleAnalyzer: false
    },
    clean: true
  },

  /** 应用开发预设 */
  application: {
    output: {
      format: 'esm' as OutputFormat,
      sourcemap: true
    },
    minify: true,
    performance: {
      treeshaking: true,
      bundleAnalyzer: true
    },
    clean: true,
    advancedOutput: {
      splitVendor: true,
      polyfill: true
    }
  },

  /** 组件库预设 */
  components: {
    output: {
      format: ['esm', 'cjs', 'umd'] as OutputFormat[],
      sourcemap: true
    },
    minify: {
      level: 'basic' as MinifyLevel,
      js: true,
      css: true
    },
    performance: {
      treeshaking: true,
      bundleAnalyzer: false
    },
    clean: true
  },

  /** 工具库预设 */
  utils: {
    output: {
      format: ['esm', 'cjs'] as OutputFormat[],
      sourcemap: true
    },
    minify: {
      level: 'advanced' as MinifyLevel
    },
    performance: {
      treeshaking: true,
      bundleAnalyzer: false
    },
    clean: true
  }
}

/**
 * 增强的配置定义函数
 */
export function defineEnhancedConfig(options: EnhancedConfigOptions): BuilderConfig {
  const logger = new Logger()

  // 应用预设配置
  let config = { ...options }
  
  // 如果指定了预设，先应用预设配置
  if ('preset' in options && typeof options.preset === 'string') {
    const preset = CONFIG_PRESETS[options.preset as keyof typeof CONFIG_PRESETS]
    if (preset) {
      config = { ...preset, ...options }
      logger.info(`应用预设配置: ${options.preset}`)
    } else {
      logger.warn(`未知的预设配置: ${options.preset}`)
    }
  }

  // 配置验证
  if (config.validation?.enabled !== false) {
    const validator = new ConfigValidator({
      strict: config.validation?.strict ?? false,
      checkFiles: config.validation?.checkFiles ?? true
    }, logger)

    const result = validator.validate(config)
    
    if (!result.valid) {
      const errorMessage = `配置验证失败:\n${result.errors.join('\n')}`
      
      if (config.validation?.throwOnError !== false) {
        throw new Error(errorMessage)
      } else {
        logger.error(errorMessage)
      }
    }

    if (result.warnings.length > 0) {
      logger.warn(`配置警告:\n${result.warnings.join('\n')}`)
    }

    // 获取配置建议
    const suggestions = validator.getSuggestions(config)
    if (suggestions.length > 0) {
      logger.info(`配置建议:\n${suggestions.join('\n')}`)
    }

    // 使用规范化后的配置
    if (result.normalizedConfig) {
      config = result.normalizedConfig
    }
  }

  // 处理高级选项
  config = processAdvancedOptions(config, logger)

  return config as BuilderConfig
}

/**
 * 处理高级选项
 */
function processAdvancedOptions(config: EnhancedConfigOptions, logger: Logger): EnhancedConfigOptions {
  // 处理文件命名规则
  if (config.naming) {
    if (config.naming.template) {
      logger.info(`使用自定义文件命名模板: ${config.naming.template}`)
    }
    if (config.naming.hash) {
      logger.info(`启用文件哈希，长度: ${config.naming.hashLength || 8}`)
    }
  }

  // 处理高级输出选项
  if (config.advancedOutput) {
    if (config.advancedOutput.splitVendor) {
      logger.info('启用 vendor 分离')
    }
    if (config.advancedOutput.polyfill) {
      logger.info('启用 polyfill 生成')
    }
    if (config.advancedOutput.targets) {
      logger.info(`目标浏览器: ${JSON.stringify(config.advancedOutput.targets)}`)
    }
  }

  // 处理构建清单
  if (config.manifest?.enabled) {
    logger.info(`启用构建清单，格式: ${config.manifest.formats?.join(', ') || 'json'}`)
  }

  // 澶勭悊 Banner
  if (config.bannerOptions?.enabled) {
    logger.info(`鍚敤 Banner锛屾牱寮? ${config.bannerOptions.style || 'default'}`)
  }

  return config
}

/**
 * 创建配置模板
 */
export function createConfigTemplate(type: keyof typeof CONFIG_PRESETS): string {
  const preset = CONFIG_PRESETS[type]
  
  return `import { defineEnhancedConfig } from '@ldesign/builder'

export default defineEnhancedConfig({
  // 基础配置
  input: 'src/index.ts',
  
  // 输出配置
  output: ${JSON.stringify(preset.output, null, 4)},
  
  // 压缩配置
  minify: ${JSON.stringify(preset.minify, null, 4)},
  
  // 性能配置
  performance: ${JSON.stringify(preset.performance, null, 4)},
  
  // 清理输出目录
  clean: ${preset.clean},
  
  // 验证配置
  validation: {
    enabled: true,
    strict: false,
    checkFiles: true,
    throwOnError: true
  },
  
  // 构建清单
  manifest: {
    enabled: true,
    formats: ['json', 'markdown'],
    outputPath: 'dist'
  },
  
  // Banner 配置
  banner: {
    enabled: true,
    style: 'default'
  },
  
  // 构建钩子
  hooks: {
    beforeBuild: async (config) => {
      
    },
    afterBuild: async (result) => {
      
    },
    onError: async (error) => {
      console.error('构建失败:', error.message)
    }
  }
})
`
}

/**
 * 验证配置文件
 */
export function validateConfigFile(configPath: string): ValidationResult {
  try {
    const config = require(configPath)
    const validator = new ConfigValidator()
    return validator.validate(config.default || config)
  } catch (error) {
    return {
      valid: false,
      errors: [`配置文件加载失败: ${(error as Error).message}`],
      warnings: []
    }
  }
}

/**
 * 生成配置文档
 */
export function generateConfigDocs(): string {
  return `# LDesign Builder 配置文档

## 基础配置

\`\`\`typescript
import { defineEnhancedConfig } from '@ldesign/builder'

export default defineEnhancedConfig({
  // 入口文件
  input: 'src/index.ts',
  
  // 输出配置
  output: {
    dir: 'dist',
    format: ['esm', 'cjs'],
    sourcemap: true,
    name: 'MyLibrary' // UMD 格式需要
  },
  
  // 打包器选择
  bundler: 'rollup', // 'rollup' | 'rolldown' | 'auto'
  
  // 压缩配置
  minify: {
    level: 'basic', // 'none' | 'whitespace' | 'basic' | 'advanced'
    js: true,
    css: true
  },
  
  // 外部依赖
  external: ['react', 'vue'],
  
  // 性能配置
  performance: {
    treeshaking: true,
    bundleAnalyzer: false
  }
})
\`\`\`

## 预设配置

可以使用预设配置快速开始：

- \`library\`: 库开发
- \`application\`: 应用开发
- \`components\`: 组件库
- \`utils\`: 工具库

## 高级功能

### 构建清单
自动生成详细的构建产物清单。

### Banner 标识
在产物顶部添加构建信息。

### 配置验证
自动验证配置的正确性。

### 构建钩子
在构建过程中执行自定义逻辑。
`
}
