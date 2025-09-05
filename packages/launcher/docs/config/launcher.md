# Launcher 配置 (launcher)

@ldesign/launcher 特有的配置选项，用于控制启动器的行为和功能。

## 基础配置

### logLevel

- **类型**: `'silent' | 'error' | 'warn' | 'info' | 'debug'`
- **默认值**: `'info'`
- **描述**: 设置日志输出级别

```typescript
export default defineConfig({
  launcher: {
    logLevel: 'debug'  // 启用详细日志
  }
})
```

### autoRestart

- **类型**: `boolean`
- **默认值**: `true`
- **描述**: 配置文件变更时是否自动重启开发服务器

```typescript
export default defineConfig({
  launcher: {
    autoRestart: false  // 禁用自动重启
  }
})
```

### configWatchIgnore

- **类型**: `string[]`
- **默认值**: `[]`
- **描述**: 忽略配置文件监听的模式

```typescript
export default defineConfig({
  launcher: {
    configWatchIgnore: [
      'node_modules/**',
      '*.temp.js'
    ]
  }
})
```

## 生命周期钩子

### hooks

提供了完整的生命周期钩子系统：

```typescript
export default defineConfig({
  launcher: {
    hooks: {
      // 启动前钩子
      beforeStart: async (options) => {
        console.log('🚀 准备启动开发服务器...')
        // 可以在这里做一些初始化工作
        await setupDatabase()
      },
      
      // 启动后钩子
      afterStart: async (server) => {
        console.log(`✅ 开发服务器已启动: http://localhost:${server.config.server.port}`)
        // 可以在这里打开浏览器、发送通知等
        await notifySlack('Dev server started!')
      },
      
      // 构建前钩子
      beforeBuild: async (options) => {
        console.log('📦 开始构建...')
        await runTests()
      },
      
      // 构建后钩子
      afterBuild: async (result) => {
        console.log('✅ 构建完成')
        await uploadToS3(result.outDir)
      },
      
      // 预览前钩子
      beforePreview: async (options) => {
        console.log('👀 启动预览服务器...')
      },
      
      // 预览后钩子
      afterPreview: async (server) => {
        console.log('✅ 预览服务器已启动')
      },
      
      // 错误钩子
      onError: async (error, context) => {
        console.error(`❌ 错误 [${context}]:`, error)
        await reportError(error, context)
      },
      
      // 退出钩子
      onExit: async (code) => {
        console.log(`👋 进程退出，代码: ${code}`)
        await cleanup()
      }
    }
  }
})
```

### 钩子类型定义

```typescript
interface LauncherHooks {
  beforeStart?: (options: StartOptions) => Promise<void> | void
  afterStart?: (server: ViteDevServer) => Promise<void> | void
  beforeBuild?: (options: BuildOptions) => Promise<void> | void
  afterBuild?: (result: BuildResult) => Promise<void> | void
  beforePreview?: (options: PreviewOptions) => Promise<void> | void
  afterPreview?: (server: PreviewServer) => Promise<void> | void
  onError?: (error: Error, context: string) => Promise<void> | void
  onExit?: (code: number) => Promise<void> | void
}
```

## 插件管理

### pluginPaths

- **类型**: `string[]`
- **默认值**: `[]`
- **描述**: 额外的插件搜索路径

```typescript
export default defineConfig({
  launcher: {
    pluginPaths: [
      './custom-plugins',
      '../shared-plugins'
    ]
  }
})
```

### pluginConfig

- **类型**: `Record<string, any>`
- **默认值**: `{}`
- **描述**: 插件特定配置

```typescript
export default defineConfig({
  launcher: {
    pluginConfig: {
      'my-custom-plugin': {
        option1: 'value1',
        option2: true
      }
    }
  }
})
```

### disabledPlugins

- **类型**: `string[]`
- **默认值**: `[]`
- **描述**: 禁用指定插件

```typescript
export default defineConfig({
  launcher: {
    disabledPlugins: [
      '@ldesign/plugin-analytics',
      'unwanted-plugin'
    ]
  }
})
```

## 环境管理

### envPrefix

- **类型**: `string | string[]`
- **默认值**: `'VITE_'`
- **描述**: 环境变量前缀

```typescript
export default defineConfig({
  launcher: {
    envPrefix: ['VITE_', 'LAUNCHER_', 'APP_']
  }
})
```

### envFiles

- **类型**: `string[]`
- **默认值**: 自动检测 `.env` 文件
- **描述**: 指定环境变量文件

```typescript
export default defineConfig({
  launcher: {
    envFiles: [
      '.env.local',
      '.env.custom',
      `..env.${process.env.NODE_ENV}`
    ]
  }
})
```

### envValidation

- **类型**: `Record<string, EnvValidator>`
- **默认值**: `{}`
- **描述**: 环境变量验证规则

```typescript
export default defineConfig({
  launcher: {
    envValidation: {
      VITE_API_URL: {
        required: true,
        type: 'url',
        description: 'API 服务器地址'
      },
      VITE_APP_TITLE: {
        required: false,
        type: 'string',
        default: 'My App'
      }
    }
  }
})
```

## 性能优化

### cache

- **类型**: `CacheOptions`
- **描述**: 缓存配置

```typescript
export default defineConfig({
  launcher: {
    cache: {
      enabled: true,
      directory: 'node_modules/.launcher-cache',
      maxAge: 86400000, // 24小时
      compression: true
    }
  }
})
```

### preload

- **类型**: `PreloadOptions`
- **描述**: 预加载配置

```typescript
export default defineConfig({
  launcher: {
    preload: {
      dependencies: true,      // 预加载依赖
      templates: true,        // 预加载模板
      plugins: ['vue', 'router']  // 预加载指定插件
    }
  }
})
```

### optimization

- **类型**: `OptimizationOptions`
- **描述**: 优化配置

```typescript
export default defineConfig({
  launcher: {
    optimization: {
      bundleAnalyzer: false,   // 禁用打包分析
      treeshaking: true,       // 启用 tree shaking
      splitChunks: {
        vendor: ['vue', 'vue-router'],
        common: true
      }
    }
  }
})
```

## 监控与调试

### monitoring

- **类型**: `MonitoringOptions`
- **描述**: 监控配置

```typescript
export default defineConfig({
  launcher: {
    monitoring: {
      performance: true,       // 性能监控
      memory: true,           // 内存监控
      buildTime: true,        // 构建时间监控
      bundleSize: true,       // 包大小监控
      
      reporters: [
        'console',             // 控制台报告
        'file',               // 文件报告
        {
          type: 'webhook',
          url: 'https://my-webhook.com/report'
        }
      ]
    }
  }
})
```

### debug

- **类型**: `DebugOptions`
- **描述**: 调试配置

```typescript
export default defineConfig({
  launcher: {
    debug: {
      enabled: process.env.NODE_ENV === 'development',
      namespace: 'launcher:*',
      output: 'console',      // 'console' | 'file'
      level: 'verbose'        // 'basic' | 'verbose'
    }
  }
})
```

## 完整配置示例

### 基础项目配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    // 基础配置
    logLevel: 'info',
    autoRestart: true,
    
    // 生命周期钩子
    hooks: {
      beforeStart: async () => {
        console.log('🚀 Starting development server...')
      },
      
      afterStart: async (server) => {
        console.log(`✅ Server running at: http://localhost:${server.config.server.port}`)
      },
      
      onError: async (error, context) => {
        console.error(`❌ Error in ${context}:`, error.message)
      }
    },
    
    // 环境配置
    envPrefix: ['VITE_', 'APP_'],
    envValidation: {
      VITE_API_URL: {
        required: true,
        type: 'url'
      }
    },
    
    // 性能配置
    cache: {
      enabled: true
    }
  }
})
```

### 企业项目配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import { notifySlack, uploadToS3, runSecurityScan } from './utils'

export default defineConfig({
  launcher: {
    logLevel: 'debug',
    
    hooks: {
      beforeStart: async () => {
        // 启动前检查
        await runSecurityScan()
      },
      
      afterStart: async (server) => {
        // 通知团队
        await notifySlack(`🚀 Dev server started by ${process.env.USER}`)
      },
      
      beforeBuild: async () => {
        // 构建前验证
        await runTests()
        await lintCode()
      },
      
      afterBuild: async (result) => {
        // 构建后处理
        await uploadToS3(result.outDir)
        await generateSitemap()
        await notifySlack(`📦 Build completed: ${result.size}`)
      },
      
      onError: async (error, context) => {
        // 错误报告
        await reportToBugsnag(error, context)
        await notifySlack(`❌ Error: ${error.message}`)
      }
    },
    
    // 插件管理
    pluginPaths: ['./enterprise-plugins'],
    pluginConfig: {
      'security-plugin': {
        enableCSP: true,
        enableHSTS: true
      },
      'analytics-plugin': {
        trackingId: process.env.GA_TRACKING_ID
      }
    },
    
    // 环境管理
    envPrefix: ['VITE_', 'REACT_APP_', 'COMPANY_'],
    envValidation: {
      VITE_API_URL: { required: true, type: 'url' },
      VITE_APP_VERSION: { required: true, type: 'string' },
      COMPANY_SECRET_KEY: { required: true, type: 'string', secret: true }
    },
    
    // 性能优化
    cache: {
      enabled: true,
      directory: '.cache/launcher',
      maxAge: 86400000 * 7  // 7天
    },
    
    optimization: {
      bundleAnalyzer: process.env.ANALYZE === 'true',
      treeshaking: true,
      splitChunks: {
        vendor: ['vue', 'vue-router', 'pinia'],
        ui: ['element-plus', '@company/ui-lib'],
        utils: ['lodash', 'dayjs', 'axios']
      }
    },
    
    // 监控配置
    monitoring: {
      performance: true,
      memory: true,
      buildTime: true,
      bundleSize: true,
      
      reporters: [
        'console',
        {
          type: 'webhook',
          url: process.env.MONITORING_WEBHOOK_URL
        }
      ]
    }
  }
})
```

### 多环境配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'
  const isProduction = mode === 'production'
  const isCI = process.env.CI === 'true'
  
  return {
    launcher: {
      logLevel: isDevelopment ? 'debug' : 'info',
      autoRestart: isDevelopment,
      
      hooks: {
        beforeStart: async () => {
          if (isDevelopment) {
            console.log('🔧 Development mode')
          }
        },
        
        beforeBuild: async () => {
          if (isCI) {
            console.log('🏗️  CI build started')
            await runFullTestSuite()
          }
        },
        
        afterBuild: async (result) => {
          if (isProduction) {
            await generateBuildReport(result)
            await optimizeAssets(result.outDir)
          }
        }
      },
      
      cache: {
        enabled: !isCI,  // CI 环境下禁用缓存
        directory: isDevelopment ? '.dev-cache' : '.build-cache'
      },
      
      monitoring: {
        performance: isProduction,
        reporters: isCI ? ['file'] : ['console']
      }
    }
  }
})
```

## CLI 集成

可以通过 CLI 参数覆盖 launcher 配置：

```bash
# 设置日志级别
launcher dev --log-level debug

# 禁用自动重启
launcher dev --no-auto-restart

# 启用缓存
launcher build --cache

# 启用监控
launcher dev --monitoring
```

## 环境变量支持

```bash
# .env.local
LAUNCHER_LOG_LEVEL=debug
LAUNCHER_AUTO_RESTART=false
LAUNCHER_CACHE_ENABLED=true
```

```typescript
// launcher.config.ts
export default defineConfig({
  launcher: {
    logLevel: process.env.LAUNCHER_LOG_LEVEL || 'info',
    autoRestart: process.env.LAUNCHER_AUTO_RESTART !== 'false',
    cache: {
      enabled: process.env.LAUNCHER_CACHE_ENABLED === 'true'
    }
  }
})
```

## 调试配置

### 查看当前配置

```bash
# 查看完整 launcher 配置
launcher config get launcher

# 查看特定配置项
launcher config get launcher.logLevel
launcher config get launcher.hooks

# 验证配置
launcher config validate
```

### 配置调试技巧

```typescript
export default defineConfig({
  launcher: {
    debug: {
      enabled: true,
      namespace: 'launcher:config',
      output: 'console'
    },
    
    hooks: {
      beforeStart: async (options) => {
        console.log('Start options:', JSON.stringify(options, null, 2))
      }
    }
  }
})
```

---

**相关文档**:
- [服务器配置](./server) - 开发服务器设置
- [构建配置](./build) - 生产构建配置
- [插件配置](./plugins) - 插件系统配置
