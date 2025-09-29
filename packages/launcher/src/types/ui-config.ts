/**
 * UI配置字段定义
 * 用于Web UI的配置表单生成和验证
 *
 * @author LDesign Team
 * @since 1.0.0
 */

export interface UIConfigField {
  /** 字段键名 */
  key: string
  /** 字段标签 */
  label: string
  /** 字段描述 */
  description?: string
  /** 字段类型 */
  type: 'string' | 'number' | 'boolean' | 'select' | 'array' | 'object' | 'keyValue' | 'json'
  /** 默认值 */
  defaultValue?: any
  /** 是否必填 */
  required?: boolean
  /** 选项（用于select类型） */
  options?: Array<{ label: string; value: any }>
  /** 验证规则 */
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  /** 是否为高级选项 */
  advanced?: boolean
  /** 分组 */
  group?: string
  /** 子字段（用于object类型） */
  children?: UIConfigField[]
  /** 占位符文本 */
  placeholder?: string
  /** 是否支持多行（用于string类型） */
  multiline?: boolean
}

export interface UIConfigSection {
  /** 分组ID */
  id: string
  /** 分组标题 */
  title: string
  /** 分组描述 */
  description?: string
  /** 分组图标 */
  icon?: string
  /** 字段列表 */
  fields: UIConfigField[]
}

/**
 * UI环境配置接口
 */
export interface UIEnvironmentConfig {
  /** 环境名称 */
  name: string
  /** 环境标识 */
  key: string
  /** 环境描述 */
  description?: string
  /** 是否为默认环境 */
  isDefault?: boolean
  /** 配置文件路径 */
  configPath?: string
}

/**
 * 支持的环境列表
 */
export const SUPPORTED_ENVIRONMENTS: UIEnvironmentConfig[] = [
  {
    name: '开发环境',
    key: 'development',
    description: '本地开发环境配置',
    isDefault: true,
    configPath: 'launcher.config.development.ts'
  },
  {
    name: '生产环境',
    key: 'production',
    description: '生产环境配置',
    configPath: 'launcher.config.production.ts'
  },
  {
    name: '测试环境',
    key: 'test',
    description: '测试环境配置',
    configPath: 'launcher.config.test.ts'
  },
  {
    name: '预发布环境',
    key: 'staging',
    description: '预发布环境配置',
    configPath: 'launcher.config.staging.ts'
  }
]

/**
 * Launcher配置字段定义
 */
export const LAUNCHER_CONFIG_FIELDS: UIConfigSection[] = [
  {
    id: 'launcher',
    title: 'Launcher配置',
    description: 'Launcher特有的配置选项',
    icon: 'Settings',
    fields: [
      {
        key: 'launcher.logLevel',
        label: '日志级别',
        description: '设置日志输出级别',
        type: 'select',
        defaultValue: 'info',
        options: [
          { label: '静默 (silent)', value: 'silent' },
          { label: '错误 (error)', value: 'error' },
          { label: '警告 (warn)', value: 'warn' },
          { label: '信息 (info)', value: 'info' },
          { label: '调试 (debug)', value: 'debug' }
        ]
      },
      {
        key: 'launcher.autoRestart',
        label: '自动重启',
        description: '配置文件变更时是否自动重启开发服务器',
        type: 'boolean',
        defaultValue: true
      },
      {
        key: 'launcher.debug',
        label: '调试模式',
        description: '是否启用调试模式',
        type: 'boolean',
        defaultValue: false,
        advanced: true
      },
      {
        key: 'launcher.mode',
        label: '运行模式',
        description: '设置运行模式',
        type: 'select',
        defaultValue: 'development',
        options: [
          { label: '开发模式', value: 'development' },
          { label: '生产模式', value: 'production' },
          { label: '测试模式', value: 'test' },
          { label: '预发布模式', value: 'staging' }
        ]
      },
      {
        key: 'launcher.configFile',
        label: '配置文件路径',
        description: '指定配置文件路径',
        type: 'string',
        placeholder: 'launcher.config.ts',
        advanced: true
      },
      {
        key: 'launcher.cwd',
        label: '工作目录',
        description: '设置工作目录',
        type: 'string',
        placeholder: process.cwd(),
        advanced: true
      },
      {
        key: 'launcher.aliasStages',
        label: '别名启用阶段',
        description: '控制在哪些阶段启用开发时别名',
        type: 'array',
        defaultValue: ['dev'],
        advanced: true
      }
    ]
  },
  {
    id: 'server',
    title: '开发服务器',
    description: '开发服务器配置选项',
    icon: 'Server',
    fields: [
      {
        key: 'server.host',
        label: '主机地址',
        description: '开发服务器监听的主机地址',
        type: 'string',
        defaultValue: 'localhost',
        placeholder: 'localhost 或 0.0.0.0'
      },
      {
        key: 'server.port',
        label: '端口号',
        description: '开发服务器监听的端口号',
        type: 'number',
        defaultValue: 3000,
        validation: {
          min: 1000,
          max: 65535,
          message: '端口号必须在1000-65535之间'
        }
      },
      {
        key: 'server.open',
        label: '自动打开浏览器',
        description: '启动时是否自动打开浏览器',
        type: 'boolean',
        defaultValue: true
      },
      {
        key: 'server.cors',
        label: '启用CORS',
        description: '是否启用跨域资源共享',
        type: 'boolean',
        defaultValue: true,
        advanced: true
      },
      {
        key: 'server.https',
        label: '启用HTTPS',
        description: '是否启用HTTPS协议',
        type: 'boolean',
        defaultValue: false,
        advanced: true
      },
      {
        key: 'server.strictPort',
        label: '严格端口模式',
        description: '端口被占用时是否退出而不是尝试下一个可用端口',
        type: 'boolean',
        defaultValue: false,
        advanced: true
      },
      {
        key: 'server.hmr',
        label: '热模块替换',
        description: '是否启用热模块替换',
        type: 'boolean',
        defaultValue: true,
        advanced: true
      },
      {
        key: 'server.proxy',
        label: '代理配置',
        description: '配置开发服务器代理',
        type: 'keyValue',
        defaultValue: {},
        placeholder: '例如: /api -> http://localhost:8080',
        advanced: true
      }
    ]
  },
  {
    id: 'build',
    title: '构建配置',
    description: '构建相关配置选项',
    icon: 'Package',
    fields: [
      {
        key: 'build.outDir',
        label: '输出目录',
        description: '构建输出目录',
        type: 'string',
        defaultValue: 'dist'
      },
      {
        key: 'build.sourcemap',
        label: '生成源码映射',
        description: '是否生成源码映射文件',
        type: 'boolean',
        defaultValue: false
      },
      {
        key: 'build.minify',
        label: '代码压缩',
        description: '是否压缩代码',
        type: 'select',
        defaultValue: 'esbuild',
        options: [
          { label: '不压缩', value: false },
          { label: 'ESBuild', value: 'esbuild' },
          { label: 'Terser', value: 'terser' }
        ]
      },
      {
        key: 'build.target',
        label: '构建目标',
        description: '构建目标环境',
        type: 'string',
        defaultValue: 'es2015',
        advanced: true
      },
      {
        key: 'build.emptyOutDir',
        label: '清空输出目录',
        description: '构建前是否清空输出目录',
        type: 'boolean',
        defaultValue: true,
        advanced: true
      }
    ]
  },
  {
    id: 'preview',
    title: '预览配置',
    description: '预览服务器配置选项',
    icon: 'Monitor',
    fields: [
      {
        key: 'preview.host',
        label: '预览主机',
        description: '预览服务器监听的主机地址',
        type: 'string',
        defaultValue: 'localhost'
      },
      {
        key: 'preview.port',
        label: '预览端口',
        description: '预览服务器监听的端口号',
        type: 'number',
        defaultValue: 4173,
        validation: {
          min: 1000,
          max: 65535,
          message: '端口号必须在1000-65535之间'
        }
      },
      {
        key: 'preview.open',
        label: '自动打开浏览器',
        description: '启动预览时是否自动打开浏览器',
        type: 'boolean',
        defaultValue: true
      },
      {
        key: 'preview.https',
        label: '启用HTTPS',
        description: '预览服务器是否启用HTTPS',
        type: 'boolean',
        defaultValue: false,
        advanced: true
      }
    ]
  },
  {
    id: 'resolve',
    title: '路径解析',
    description: '模块路径解析配置',
    icon: 'FolderTree',
    fields: [
      {
        key: 'resolve.alias',
        label: '路径别名',
        description: '配置路径别名映射',
        type: 'keyValue',
        defaultValue: {},
        placeholder: '例如: @ -> ./src'
      },
      {
        key: 'resolve.extensions',
        label: '文件扩展名',
        description: '自动解析的文件扩展名',
        type: 'array',
        defaultValue: ['.ts', '.js', '.vue', '.json'],
        advanced: true
      },
      {
        key: 'resolve.mainFields',
        label: '主字段',
        description: 'package.json中的主字段',
        type: 'array',
        defaultValue: ['module', 'jsnext:main', 'jsnext'],
        advanced: true
      }
    ]
  },
  {
    id: 'css',
    title: 'CSS配置',
    description: 'CSS和预处理器配置',
    icon: 'Palette',
    fields: [
      {
        key: 'css.modules',
        label: 'CSS模块',
        description: '是否启用CSS模块',
        type: 'boolean',
        defaultValue: false,
        advanced: true
      },
      {
        key: 'css.preprocessorOptions.scss.additionalData',
        label: 'SCSS全局变量',
        description: 'SCSS全局导入的变量或混入',
        type: 'string',
        placeholder: '@import "@/styles/variables.scss";',
        multiline: true,
        advanced: true
      },
      {
        key: 'css.preprocessorOptions.less.javascriptEnabled',
        label: 'Less JavaScript支持',
        description: '是否启用Less中的JavaScript',
        type: 'boolean',
        defaultValue: true,
        advanced: true
      },
      {
        key: 'css.postcss',
        label: 'PostCSS配置',
        description: 'PostCSS插件配置',
        type: 'json',
        defaultValue: {},
        advanced: true
      }
    ]
  },
  {
    id: 'optimizeDeps',
    title: '依赖优化',
    description: '依赖预构建优化配置',
    icon: 'Zap',
    fields: [
      {
        key: 'optimizeDeps.include',
        label: '包含的依赖',
        description: '强制预构建的依赖',
        type: 'array',
        defaultValue: [],
        placeholder: '例如: vue, vue-router',
        advanced: true
      },
      {
        key: 'optimizeDeps.exclude',
        label: '排除的依赖',
        description: '排除预构建的依赖',
        type: 'array',
        defaultValue: [],
        placeholder: '例如: @vueuse/core',
        advanced: true
      },
      {
        key: 'optimizeDeps.force',
        label: '强制重新构建',
        description: '是否强制重新构建依赖',
        type: 'boolean',
        defaultValue: false,
        advanced: true
      }
    ]
  },
  {
    id: 'define',
    title: '全局常量',
    description: '定义全局常量替换',
    icon: 'Code',
    fields: [
      {
        key: 'define',
        label: '常量定义',
        description: '定义全局常量，在构建时会被替换',
        type: 'keyValue',
        defaultValue: {},
        placeholder: '例如: __VERSION__ -> "1.0.0"',
        advanced: true
      }
    ]
  },
  {
    id: 'env',
    title: '环境变量',
    description: '环境变量配置',
    icon: 'Settings2',
    fields: [
      {
        key: 'envPrefix',
        label: '环境变量前缀',
        description: '客户端可访问的环境变量前缀',
        type: 'array',
        defaultValue: ['VITE_'],
        placeholder: '例如: VITE_, APP_'
      },
      {
        key: 'envDir',
        label: '环境变量目录',
        description: '环境变量文件所在目录',
        type: 'string',
        defaultValue: '.',
        placeholder: '.env文件所在目录',
        advanced: true
      }
    ]
  }
]

/**
 * 获取配置字段定义
 */
export function getConfigFields(): UIConfigSection[] {
  return LAUNCHER_CONFIG_FIELDS
}

/**
 * 根据路径获取字段定义
 */
export function getFieldByPath(path: string): UIConfigField | undefined {
  for (const section of LAUNCHER_CONFIG_FIELDS) {
    for (const field of section.fields) {
      if (field.key === path) {
        return field
      }
    }
  }
  return undefined
}

/**
 * 获取默认配置值
 */
export function getDefaultConfig(): Record<string, any> {
  const config: Record<string, any> = {}

  for (const section of LAUNCHER_CONFIG_FIELDS) {
    for (const field of section.fields) {
      if (field.defaultValue !== undefined) {
        const keys = field.key.split('.')
        let current = config

        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i]
          if (!current[key]) {
            current[key] = {}
          }
          current = current[key]
        }

        current[keys[keys.length - 1]] = field.defaultValue
      }
    }
  }

  return config
}

/**
 * 验证配置值
 */
export function validateConfigValue(path: string, value: any): string | null {
  const field = getFieldByPath(path)
  if (!field) return null

  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label}是必填项`
  }

  if (field.validation) {
    const { min, max, pattern, message } = field.validation

    if (typeof value === 'number') {
      if (min !== undefined && value < min) {
        return message || `${field.label}不能小于${min}`
      }
      if (max !== undefined && value > max) {
        return message || `${field.label}不能大于${max}`
      }
    }

    if (typeof value === 'string' && pattern) {
      const regex = new RegExp(pattern)
      if (!regex.test(value)) {
        return message || `${field.label}格式不正确`
      }
    }
  }

  return null
}

/**
 * 获取环境配置
 */
export function getEnvironmentConfig(key: string): UIEnvironmentConfig | undefined {
  return SUPPORTED_ENVIRONMENTS.find(env => env.key === key)
}

/**
 * 获取默认环境
 */
export function getDefaultEnvironment(): UIEnvironmentConfig {
  return SUPPORTED_ENVIRONMENTS.find(env => env.isDefault) || SUPPORTED_ENVIRONMENTS[0]
}

/**
 * 生成环境配置文件路径
 */
export function getEnvironmentConfigPath(environment: string, baseDir: string = '.ldesign'): string {
  if (environment === 'development' || !environment) {
    return `${baseDir}/launcher.config.ts`
  }
  return `${baseDir}/launcher.config.${environment}.ts`
}

/**
 * 获取配置字段的嵌套值
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

/**
 * 设置配置字段的嵌套值
 */
export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.')
  const lastKey = keys.pop()!
  const target = keys.reduce((current, key) => {
    if (!current[key]) {
      current[key] = {}
    }
    return current[key]
  }, obj)
  target[lastKey] = value
}
