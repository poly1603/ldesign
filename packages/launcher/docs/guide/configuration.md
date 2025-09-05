---
title: 配置选项
description: 配置概览与示例，完整可用字段以“配置文件参考”为准
---

# 配置选项

> 提示：本章为配置概览与示例，完整可用字段和类型以「配置文件参考」为准；请参见 [配置文件参考](./config-reference.md)。

本章详细介绍 LDesign Launcher 的所有配置选项，包括最新的 TypeScript 配置文件支持和全面的功能配置。

## 配置文件格式

LDesign Launcher 支持多种配置文件格式：

- `launcher.config.ts` (推荐) - TypeScript 配置文件，提供完整的类型支持
- `launcher.config.mjs` - ES 模块配置文件
- `launcher.config.js` - CommonJS 配置文件

### TypeScript 配置文件示例

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  projectName: 'My App',
  framework: 'vue', // 'vue' | 'react' | 'lit' | 'vanilla'

  server: {
    port: 3000,
    host: '127.0.0.1',
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  // 更多配置选项...
})
```

## 基础配置

### 项目配置

```typescript
interface ProjectConfig {
  /** 项目名称 */
  projectName?: string
  /** 框架类型 */
  framework?: 'vue' | 'react' | 'lit' | 'vanilla'
  /** 项目根目录 */
  root?: string
}
```

### 服务器配置

```typescript
interface ServerConfig {
  /** 端口号，默认 3000 */
  port?: number
/** 主机地址，默认 '127.0.0.1'（若需对外访问使用 '0.0.0.0'） */
  host?: string
  /** 是否自动打开浏览器 */
  open?: boolean | string
  /** 是否启用 HTTPS */
  https?: boolean
  /** 是否启用 CORS */
  cors?: boolean
}
```

### 构建配置

```typescript
interface BuildConfig {
  /** 输出目录，默认 'dist' */
  outDir?: string
  /** 是否生成 sourcemap */
  sourcemap?: boolean
  /** 是否清空输出目录 */
  emptyOutDir?: boolean
  /** 压缩选项 */
  minify?: boolean | 'terser' | 'esbuild'
  /** 目标环境 */
  target?: string
}
```

## 网络配置

网络配置提供了代理、路径别名和 CORS 等功能。

```typescript
interface NetworkConfig {
  /** 代理配置 */
  proxy?: Record<string, ProxyOptions>
  /** 路径别名配置 */
  alias?: Record<string, string>
  /** CORS 配置 */
  cors?: CORSConfig
  /** 网络超时配置 */
  timeout?: {
    connect?: number
    read?: number
    write?: number
  }
}
```

### 代理配置示例

```typescript
export default defineConfig({
  network: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/upload': {
        target: 'http://localhost:9000',
        changeOrigin: true,
      },
    },
  },
})
```

### 路径别名配置示例

```typescript
export default defineConfig({
  network: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@views': './src/views',
      '@utils': './src/utils',
      '@assets': './src/assets',
    },
  },
})
```

### CORS 配置示例

```typescript
export default defineConfig({
  network: {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  },
})
```

## 安全配置

安全配置提供了 HTTPS、SSL 证书、安全头和 CSP 策略等功能。

```typescript
interface SecurityConfig {
  /** HTTPS 配置 */
  https?: {
    enabled?: boolean
    ssl?: {
      autoGenerate?: boolean
      cert?: string
      key?: string
      ca?: string
    }
  }
  /** 安全头配置 */
  headers?: {
    frameOptions?: string
    contentTypeOptions?: boolean
    xssProtection?: boolean
  }
  /** CSP 配置 */
  csp?: {
    enabled?: boolean
    directives?: Record<string, string[]>
  }
}
```

### HTTPS 配置示例

```typescript
export default defineConfig({
  security: {
    https: {
      enabled: true,
      ssl: {
        autoGenerate: true, // 自动生成开发证书
      },
    },
    headers: {
      frameOptions: 'SAMEORIGIN',
      contentTypeOptions: true,
      xssProtection: true,
    },
  },
})
```

## 资源处理配置

资源处理配置提供了字体优化、SVG 处理和图片优化等功能。

```typescript
interface AssetsConfig {
  /** 字体优化配置 */
  fonts?: {
    subset?: boolean
    preload?: boolean
    formats?: string[]
    includeChinese?: boolean
    chineseCharset?: 'simplified' | 'traditional'
  }
  /** SVG 处理配置 */
  svg?: {
    componentGeneration?: boolean
    optimization?: boolean
    sprite?: boolean
    componentOptions?: {
      framework?: 'vue' | 'react' | 'lit'
      typescript?: boolean
    }
  }
  /** 图片优化配置 */
  images?: {
    enabled?: boolean
    formats?: string[]
    quality?: Record<string, number>
    responsive?: boolean
    lazyLoading?: boolean
  }
}
```

### 字体优化示例

```typescript
export default defineConfig({
  assets: {
    fonts: {
      subset: true,
      preload: true,
      formats: ['woff2', 'woff'],
      includeChinese: true,
      chineseCharset: 'simplified',
    },
  },
})
```

### SVG 处理示例

```typescript
export default defineConfig({
  assets: {
    svg: {
      componentGeneration: true,
      optimization: true,
      componentOptions: {
        framework: 'vue',
        typescript: true,
      },
    },
  },
})
```

### 图片优化示例

```typescript
export default defineConfig({
  assets: {
    images: {
      enabled: true,
      formats: ['webp', 'avif', 'jpeg', 'png'],
      quality: {
        webp: 80,
        avif: 70,
        jpeg: 85,
      },
      responsive: true,
      lazyLoading: true,
    },
  },
})
```

## 插件生态配置

插件生态配置提供了内置插件的配置选项，包括压缩、代码分割、热重载增强和构建分析等功能。

```typescript
interface PluginsConfig {
  /** 内置插件配置 */
  builtin?: {
    /** 压缩插件 */
    compression?: {
      enabled?: boolean
      apply?: 'serve' | 'build'
      options?: {
        algorithm?: 'gzip' | 'brotli'
        level?: number
        threshold?: number
      }
    }
    /** 代码分割插件 */
    codeSplitting?: {
      enabled?: boolean
      apply?: 'serve' | 'build'
      options?: {
        strategy?: 'vendor' | 'async' | 'manual'
        chunks?: Record<string, string[]>
      }
    }
    /** 热重载增强插件 */
    hmrEnhanced?: {
      enabled?: boolean
      apply?: 'serve' | 'build'
      options?: {
        fastRefresh?: boolean
        preserveState?: boolean
        errorOverlay?: boolean
      }
    }
    /** 构建分析插件 */
    bundleAnalyzer?: {
      enabled?: boolean
      apply?: 'serve' | 'build'
      options?: {
        mode?: 'static' | 'server'
        openAnalyzer?: boolean
      }
    }
  }
  /** 外部插件 */
  external?: string[]
  /** 禁用的插件 */
  disabled?: string[]
}
```

### 压缩插件示例

```typescript
export default defineConfig({
  plugins: {
    builtin: {
      compression: {
        enabled: true,
        apply: 'build',
        options: {
          algorithm: 'gzip',
          level: 6,
          threshold: 1024,
        },
      },
    },
  },
})
```

### 代码分割示例

```typescript
export default defineConfig({
  plugins: {
    builtin: {
      codeSplitting: {
        enabled: true,
        apply: 'build',
        options: {
          strategy: 'vendor',
          chunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'ui-vendor': ['element-plus', '@element-plus/icons-vue'],
          },
        },
      },
    },
  },
})
```

### 热重载增强示例

```typescript
export default defineConfig({
  plugins: {
    builtin: {
      hmrEnhanced: {
        enabled: true,
        apply: 'serve',
        options: {
          fastRefresh: true,
          preserveState: true,
          errorOverlay: true,
        },
      },
    },
  },
})
```

## 环境优化配置

环境优化配置提供了热重载、错误提示、性能监控和缓存优化等功能。

```typescript
interface OptimizationConfig {
  /** 热重载优化 */
  hotReload?: {
    fastRefresh?: boolean
    preserveState?: boolean
    smartReload?: boolean
    updateDelay?: number
  }
  /** 错误提示优化 */
  errorDisplay?: {
    overlay?: boolean
    showSourceLocation?: boolean
    showStackTrace?: boolean
    suggestions?: boolean
  }
  /** 性能监控 */
  performance?: {
    enabled?: boolean
    metrics?: {
      buildTime?: boolean
      memoryUsage?: boolean
      fileSystemOps?: boolean
    }
    budget?: {
      maxBuildTime?: number
      maxMemoryUsage?: number
      maxBundleSize?: number
    }
  }
  /** 缓存优化 */
  cache?: {
    filesystem?: boolean
    memory?: boolean
    strategy?: 'conservative' | 'aggressive'
    maxSize?: number
  }
  /** 开发服务器优化 */
  devServer?: {
    prebuild?: {
      enabled?: boolean
      include?: string[]
      exclude?: string[]
    }
    middleware?: {
      compression?: boolean
      cache?: boolean
    }
  }
  /** 构建优化 */
  build?: {
    codeSplitting?: {
      strategy?: 'vendor' | 'async'
      minChunkSize?: number
      maxChunkSize?: number
    }
    minification?: {
      js?: 'terser' | 'esbuild'
      css?: 'cssnano'
      html?: boolean
    }
    treeShaking?: {
      enabled?: boolean
      sideEffects?: boolean
    }
  }
}
```

### 性能监控示例

```typescript
export default defineConfig({
  optimization: {
    performance: {
      enabled: true,
      metrics: {
        buildTime: true,
        memoryUsage: true,
        fileSystemOps: true,
      },
      budget: {
        maxBuildTime: 30,
        maxMemoryUsage: 512,
        maxBundleSize: 1024,
      },
    },
  },
})
```

### 缓存优化示例

```typescript
export default defineConfig({
  optimization: {
    cache: {
      filesystem: true,
      memory: true,
      strategy: 'aggressive',
      maxSize: 100,
    },
  },
})
```

### 构建优化示例

```typescript
export default defineConfig({
  optimization: {
    build: {
      codeSplitting: {
        strategy: 'vendor',
        minChunkSize: 20000,
        maxChunkSize: 244000,
      },
      minification: {
        js: 'esbuild',
        css: 'cssnano',
        html: true,
      },
      treeShaking: {
        enabled: true,
        sideEffects: false,
      },
    },
  },
})
```

## 框架特定配置示例

### Vue3 项目配置

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  projectName: 'Vue3 Example',
  framework: 'vue',

  server: {
    port: 3000,
host: '127.0.0.1'
    open: true,
  },

  network: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@views': './src/views',
      '@utils': './src/utils',
    },
  },

  assets: {
    svg: {
      componentGeneration: true,
      optimization: true,
      componentOptions: {
        framework: 'vue',
        typescript: true,
      },
    },
  },

  plugins: {
    builtin: {
      codeSplitting: {
        enabled: true,
        apply: 'build',
        options: {
          strategy: 'vendor',
          chunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'ui-vendor': ['element-plus', '@element-plus/icons-vue'],
          },
        },
      },
      hmrEnhanced: {
        enabled: true,
        apply: 'serve',
        options: {
          fastRefresh: true,
          preserveState: true,
          errorOverlay: true,
        },
      },
    },
  },

  vite: {
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    },
  },
})
```

### React 项目配置

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  projectName: 'React Example',
framework: 'react',

  server: {
    port: 3000,
    host: '127.0.0.1',
    open: true,
  },

  network: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@utils': './src/utils',
      '@hooks': './src/hooks',
      '@types': './src/types',
    },
  },

  assets: {
    svg: {
      componentGeneration: true,
      optimization: true,
      componentOptions: {
        framework: 'react',
        typescript: true,
      },
    },
  },

  plugins: {
    builtin: {
      codeSplitting: {
        enabled: true,
        apply: 'build',
        options: {
          strategy: 'vendor',
          chunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['antd', '@ant-design/icons'],
          },
        },
      },
      hmrEnhanced: {
        enabled: true,
        apply: 'serve',
        options: {
          fastRefresh: true,
          preserveState: true,
          errorOverlay: true,
        },
      },
    },
  },

  optimization: {
    hotReload: {
      fastRefresh: true,
      preserveState: true,
      smartReload: true,
    },
  },
})
```

### Lit 项目配置

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  projectName: 'Lit Example',
framework: 'lit',

  server: {
    port: 3000,
    host: '127.0.0.1',
    open: true,
  },

  network: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@utils': './src/utils',
      '@styles': './src/styles',
    },
  },

  assets: {
    svg: {
      componentGeneration: true,
      optimization: true,
      componentOptions: {
        framework: 'lit',
        typescript: true,
      },
    },
  },

  plugins: {
    builtin: {
      codeSplitting: {
        enabled: true,
        apply: 'build',
        options: {
          strategy: 'vendor',
          chunks: {
            'lit-vendor': ['lit', '@lit/reactive-element'],
            'utils-vendor': ['lodash-es'],
          },
        },
      },
    },
  },

  vite: {
    esbuild: {
      target: 'es2020',
    },
  },
})
```

### Vanilla 项目配置

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  projectName: 'Vanilla Example',
framework: 'vanilla',

  server: {
    port: 3000,
    host: '127.0.0.1',
    open: true,
  },

  network: {
    alias: {
      '@': './src',
      '@utils': './src/utils',
      '@styles': './src/styles',
      '@assets': './src/assets',
    },
  },

  assets: {
    svg: {
      componentGeneration: false, // Vanilla 项目通常不需要组件生成
      optimization: true,
      sprite: true, // 使用精灵图更适合 Vanilla 项目
    },
    images: {
      enabled: true,
      formats: ['webp', 'jpeg', 'png'],
      responsive: true,
      lazyLoading: true,
    },
  },

  plugins: {
    builtin: {
      codeSplitting: {
        enabled: true,
        apply: 'build',
        options: {
          strategy: 'async',
          minChunkSize: 10000,
        },
      },
      hmrEnhanced: {
        enabled: true,
        apply: 'serve',
        options: {
          fastRefresh: false, // Vanilla 项目不需要 React Fast Refresh
          preserveState: false,
          errorOverlay: true,
        },
      },
    },
  },

  optimization: {
    cache: {
      filesystem: true,
      strategy: 'conservative', // Vanilla 项目使用保守的缓存策略
    },
    build: {
      minification: {
        js: 'esbuild',
        css: 'cssnano',
        html: true,
      },
      treeShaking: {
        enabled: true,
        sideEffects: false,
      },
    },
  },

  vite: {
    build: {
      rollupOptions: {
        input: {
          main: './index.html',
        },
      },
    },
  },
})
```

## 环境变量配置

LDesign Launcher 支持通过环境变量进行配置，这对于 CI/CD 和不同环境部署非常有用。

### 开发环境

```bash
# .env.development
LDESIGN_LOG_LEVEL=info
LDESIGN_MODE=development
LDESIGN_PORT=3000
LDESIGN_HOST=127.0.0.1
LDESIGN_OPEN=true
LDESIGN_HTTPS=false
```

### 生产环境

```bash
# .env.production
LDESIGN_LOG_LEVEL=silent
LDESIGN_MODE=production
LDESIGN_OUT_DIR=dist
LDESIGN_MINIFY=true
LDESIGN_SOURCEMAP=false
```

### 测试环境

```bash
# .env.test
LDESIGN_LOG_LEVEL=warn
LDESIGN_MODE=test
LDESIGN_PORT=3001
LDESIGN_COVERAGE=true
```

## 配置优先级

LDesign Launcher 按以下优先级加载配置：

1. **命令行参数** - 最高优先级
2. **环境变量** - 覆盖配置文件
3. **配置文件** - `launcher.config.ts/js/mjs`
4. **默认值** - 最低优先级

### 示例

```bash
# 命令行参数会覆盖配置文件中的设置
launcher dev --port 4000 --host 0.0.0.0

# 环境变量会覆盖配置文件，但被命令行参数覆盖
LDESIGN_PORT=3000 launcher dev --host 0.0.0.0
```

## 配置验证

LDesign Launcher 提供了配置验证功能，确保配置的正确性：

```typescript
import { defineConfig, validateConfig } from '@ldesign/launcher'

const config = defineConfig({
  // 你的配置
})

// 验证配置
const validation = validateConfig(config)
if (!validation.valid) {
  console.error('配置验证失败:', validation.errors)
}

export default config
```

## 最佳实践

### 1. 环境分离

为不同环境创建不同的配置文件：

```
├── launcher.config.ts          # 基础配置
├── launcher.config.dev.ts      # 开发环境配置
├── launcher.config.prod.ts     # 生产环境配置
└── launcher.config.test.ts     # 测试环境配置
```

### 2. 配置组合

使用配置组合来避免重复：

```typescript
import { defineConfig } from '@ldesign/launcher'
import { baseConfig } from './launcher.config.base'

export default defineConfig({
  ...baseConfig,
  mode: 'production',
  build: {
    ...baseConfig.build,
    minify: true,
    sourcemap: false,
  },
})
```

### 3. 类型安全

充分利用 TypeScript 的类型检查：

```typescript
import { defineConfig, type LauncherConfig } from '@ldesign/launcher'

const config: LauncherConfig = {
  projectName: 'My App',
  framework: 'vue', // 类型安全，只能是 'vue' | 'react' | 'lit' | 'vanilla'
  // ...
}

export default defineConfig(config)
```

### 4. 配置文档化

为复杂配置添加注释：

```typescript
export default defineConfig({
  // 项目基本信息
  projectName: 'My Complex App',
  framework: 'vue',

  // 网络配置 - 用于开发环境的 API 代理
  network: {
    proxy: {
      // 将 /api 请求代理到后端服务
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },

  // 性能优化 - 针对大型项目的优化配置
  optimization: {
    performance: {
      enabled: true,
      budget: {
        maxBuildTime: 60, // 最大构建时间 60 秒
        maxBundleSize: 2048, // 最大包大小 2MB
      },
    },
  },
})
```

### 5. 安全配置

在生产环境中启用安全功能：

```typescript
export default defineConfig({
  security: {
    https: {
      enabled: process.env.NODE_ENV === 'production',
    },
    headers: {
      frameOptions: 'SAMEORIGIN',
      contentTypeOptions: true,
      xssProtection: true,
    },
    csp: {
      enabled: process.env.NODE_ENV === 'production',
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
      },
    },
  },
})
```

### 6. 性能监控

启用性能监控来优化构建：

```typescript
export default defineConfig({
  optimization: {
    performance: {
      enabled: true,
      metrics: {
        buildTime: true,
        memoryUsage: true,
        fileSystemOps: true,
      },
      budget: {
        maxBuildTime: 30,
        maxMemoryUsage: 512,
        maxBundleSize: 1024,
      },
    },
  },
})
```

## 故障排除

### 配置加载失败

如果配置文件加载失败，检查以下几点：

1. **文件路径**: 确保配置文件在正确的位置
2. **语法错误**: 检查 TypeScript/JavaScript 语法
3. **依赖问题**: 确保所有依赖都已安装
4. **权限问题**: 确保文件有读取权限

### 类型错误

如果遇到类型错误：

1. **更新类型定义**: `npm update @ldesign/launcher`
2. **检查配置**: 确保配置符合接口定义
3. **重启 TypeScript 服务**: 在 IDE 中重启 TS 服务

### 性能问题

如果构建性能不佳：

1. **启用缓存**: 配置文件系统缓存
2. **优化代码分割**: 合理配置代码分割策略
3. **检查插件**: 禁用不必要的插件
4. **监控指标**: 启用性能监控找出瓶颈

通过遵循这些最佳实践，你可以充分利用 LDesign Launcher 的强大功能，构建高效、安全、可维护的前端项目。
