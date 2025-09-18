---
title: 配置文件参考
description: @ldesign/launcher 的配置项详解、示例与速查表（与 Vite 兼容）
---

# 配置文件参考

@ldesign/launcher 提供了灵活而强大的配置系统，支持 TypeScript/JavaScript 配置文件、预设继承、环境变量等高级特性。

## 📋 配置文件概述

### 配置文件类型

Launcher 支持多种配置文件格式：

- `launcher.config.ts` - TypeScript 配置文件（推荐）
- `launcher.config.js` - JavaScript ES 模块
- `launcher.config.mjs` - JavaScript ES 模块（显式）
- `launcher.config.cjs` - JavaScript CommonJS 模块
- `vite.config.*` - 兼容 Vite 原生配置

### 配置文件查找顺序

```
launcher.config.ts
launcher.config.mjs
launcher.config.js
launcher.config.cjs
vite.config.ts
vite.config.mjs
vite.config.js
vite.config.cjs
```

## 🚀 基本配置

### 最简配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 最简配置，自动检测项目类型
})
```

### 使用预设

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    preset: 'vue3-ts' // 使用 Vue 3 + TypeScript 预设
  }
})
```

### 标准配置结构

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // Launcher 特有配置
  launcher: {
    preset: 'vue3-ts',
    env: { /* 环境变量配置 */ },
    // ... 其他 launcher 特有选项
  },
  
  // Vite 原生配置
  root: './src',
  server: { /* 开发服务器配置 */ },
  build: { /* 构建配置 */ },
  preview: { /* 预览配置 */ },
  // ... 其他 Vite 选项
})
```

## ⚙️ Launcher 配置项

### `launcher.preset` - 项目预设

选择项目类型预设，自动配置插件和优化选项。

```typescript
interface LauncherConfigOptions {
  preset?: ProjectPreset
}

type ProjectPreset = 
  | 'vue2'          // Vue 2 项目
  | 'vue3'          // Vue 3 项目  
  | 'vue3-ts'       // Vue 3 + TypeScript
  | 'react'         // React 项目
  | 'react-ts'      // React + TypeScript
  | 'svelte'        // Svelte 项目
  | 'svelte-ts'     // Svelte + TypeScript
  | 'vanilla'       // 原生 JavaScript
  | 'vanilla-ts'    // 原生 TypeScript
  | 'custom'        // 自定义预设
```

**示例：**

```typescript
export default defineConfig({
  launcher: {
    preset: 'vue3-ts'
  }
})
```

### `launcher.extends` - 配置继承

继承其他配置文件或预设，支持多重继承。

```typescript
interface LauncherConfigOptions {
  extends?: string | string[]
}
```

**示例：**

```typescript
// 继承单个配置
export default defineConfig({
  launcher: {
    extends: './base.config.ts'
  }
})

// 多重继承
export default defineConfig({
  launcher: {
    extends: ['vue3-ts', './base.config.ts', './dev.config.ts']
  }
})

// 继承预设和文件
export default defineConfig({
  launcher: {
    extends: ['react-ts', '../shared/common.config.ts']
  }
})
```

### `launcher.env` - 环境变量配置

强大的环境变量管理系统。

```typescript
interface EnvironmentConfig {
  // 环境变量文件路径
  envFile?: string | string[]
  
  // 环境变量前缀
  prefix?: string
  
  // 自定义环境变量
  variables?: Record<string, string>
  
  // 默认环境变量
  defaults?: Record<string, string>
  
  // 必需的环境变量
  required?: string[]
  
  // 是否展开环境变量
  expand?: boolean
}
```

**示例：**

```typescript
export default defineConfig({
  launcher: {
    env: {
      // 环境变量文件
      envFile: ['.env', '.env.local', `.env.${process.env.NODE_ENV}`],
      
      // 环境变量前缀
      prefix: 'VITE_',
      
      // 自定义环境变量
      variables: {
        BUILD_TIME: new Date().toISOString(),
        VERSION: require('./package.json').version
      },
      
      // 默认值
      defaults: {
        API_BASE_URL: 'http://localhost:3000',
        LOG_LEVEL: 'info'
      },
      
      // 必需的环境变量
      required: ['API_BASE_URL', 'API_KEY'],
      
      // 启用变量展开
      expand: true
    }
  }
})
```

### `launcher.ssr` - 服务端渲染

配置 SSR (Server-Side Rendering) 相关选项。

```typescript
interface SSROptions {
  // 是否启用 SSR
  enabled?: boolean
  
  // SSR 入口文件
  entry?: string
  
  // SSR 输出目录
  outDir?: string
  
  // 生成客户端 manifest
  manifest?: boolean
  
  // 预渲染路径
  prerender?: string[]
  
  // SSR 外部依赖
  external?: string[]
  
  // Node.js 适配器
  adapter?: {
    name: string
    options?: Record<string, any>
  }
}
```

**示例：**

```typescript
export default defineConfig({
  launcher: {
    ssr: {
      enabled: true,
      entry: './src/entry-server.ts',
      outDir: 'dist-ssr',
      manifest: true,
      prerender: ['/', '/about', '/contact'],
      external: ['express'],
      adapter: {
        name: 'node',
        options: {
          port: 3000
        }
      }
    }
  }
})
```

### `launcher.lib` - 库模式

配置库模式构建选项。

```typescript
interface LibraryOptions {
  // 入口文件
  entry: string | Record<string, string>
  
  // 库名称
  name?: string
  
  // 输出格式
  formats?: ('es' | 'cjs' | 'umd' | 'iife')[]
  
  // 文件名模板
  fileName?: string | ((format: string, entryName: string) => string)
  
  // 外部依赖
  external?: (string | RegExp)[] | RegExp | string
  
  // 全局变量映射
  globals?: Record<string, string>
  
  // TypeScript 声明文件
  dts?: boolean | {
    outDir?: string
    include?: string[]
    exclude?: string[]
  }
}
```

**示例：**

```typescript
export default defineConfig({
  launcher: {
    lib: {
      entry: './src/index.ts',
      name: 'MyLibrary',
      formats: ['es', 'cjs', 'umd'],
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      external: ['vue', 'react'],
      globals: {
        vue: 'Vue',
        react: 'React'
      },
      dts: {
        outDir: 'dist/types',
        include: ['src/**/*'],
        exclude: ['src/**/*.test.ts']
      }
    }
  }
})
```

### `launcher.entry` - 多入口配置

配置多入口应用构建。

```typescript
interface MultiEntryOptions {
  // 入口配置
  entries: Record<string, string | {
    entry: string
    template?: string
    filename?: string
    title?: string
    chunks?: string[]
  }>
  
  // 代码分割
  codeSplit?: boolean
  
  // 公共块配置
  commonChunks?: {
    vendor?: boolean
    runtime?: boolean
    manifest?: boolean
  }
  
  // HTML 模板配置
  htmlTemplate?: {
    template: string
    inject?: boolean | 'head' | 'body'
    minify?: boolean
  }
}
```

**示例：**

```typescript
export default defineConfig({
  launcher: {
    entry: {
      entries: {
        // 简单入口
        main: './src/main.ts',
        
        // 详细配置入口
        admin: {
          entry: './src/admin/main.ts',
          template: './src/admin/index.html',
          title: 'Admin Panel',
          chunks: ['vendor', 'admin']
        }
      },
      
      codeSplit: true,
      
      commonChunks: {
        vendor: true,
        runtime: true,
        manifest: true
      },
      
      htmlTemplate: {
        template: './src/template.html',
        inject: 'body',
        minify: true
      }
    }
  }
})
```

### `launcher.optimization` - 构建优化

配置构建优化选项。

```typescript
interface OptimizationOptions {
  // 代码压缩
  minify?: boolean | 'terser' | 'esbuild' | 'swc'
  
  // 代码分割
  splitChunks?: {
    strategy?: 'split-by-experience' | 'unbundle' | 'experimental-split-by-experience'
    granularChunks?: boolean
    maxSize?: number
    minSize?: number
  }
  
  // Tree Shaking
  treeShaking?: {
    enabled?: boolean
    sideEffects?: boolean | string[]
    preset?: 'safest' | 'smallest'
  }
  
  // 包分析
  bundleAnalyzer?: {
    enabled?: boolean
    openAnalyzer?: boolean
    filename?: string
    reportFilename?: string
  }
  
  // 依赖优化
  deps?: {
    include?: string[]
    exclude?: string[]
    entries?: string[]
    force?: boolean
  }
}
```

**示例：**

```typescript
export default defineConfig({
  launcher: {
    optimization: {
      minify: 'esbuild',
      
      splitChunks: {
        strategy: 'split-by-experience',
        granularChunks: true,
        maxSize: 500000,
        minSize: 20000
      },
      
      treeShaking: {
        enabled: true,
        sideEffects: false,
        preset: 'smallest'
      },
      
      bundleAnalyzer: {
        enabled: true,
        openAnalyzer: false,
        filename: 'bundle-report.html'
      },
      
      deps: {
        include: ['lodash', 'axios'],
        exclude: ['@testing-library/*'],
        force: false
      }
    }
  }
})
```

## 🌐 Vite 原生配置

Launcher 完全兼容 Vite 的所有原生配置选项。

### `server` - 开发服务器

```typescript
interface ServerOptions {
  host?: string | boolean
  port?: number
  https?: boolean | {
    key: string
    cert: string
  }
  open?: boolean | string
  proxy?: Record<string, string | ProxyOptions>
  cors?: boolean | CorsOptions
  headers?: OutgoingHttpHeaders
  hmr?: boolean | { port?: number }
  watch?: {
    ignored?: string[]
  }
}
```

**示例：**

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    https: false,
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      },
      '/upload': 'http://localhost:8081'
    },
    
    // CORS 配置
    cors: {
      origin: ['http://localhost:3000', 'https://example.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    
    // 自定义请求头
    headers: {
      'X-Powered-By': '@ldesign/launcher'
    },
    
    // 热更新配置
    hmr: {
      port: 24678
    }
  }
})
```

### `build` - 构建配置

```typescript
interface BuildOptions {
  target?: string | string[]
  outDir?: string
  assetsDir?: string
  assetsInlineLimit?: number
  cssCodeSplit?: boolean
  cssTarget?: string | string[]
  sourcemap?: boolean | 'inline' | 'hidden'
  rollupOptions?: RollupOptions
  lib?: LibraryOptions
  manifest?: boolean | string
  ssrManifest?: boolean | string
  ssr?: boolean | string
  minify?: boolean | 'terser' | 'esbuild'
  terserOptions?: TerserOptions
  write?: boolean
  emptyOutDir?: boolean | null
  reportCompressedSize?: boolean
  chunkSizeWarningLimit?: number
  watch?: RollupWatchOptions | null
}
```

**示例：**

```typescript
export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    sourcemap: true,
    minify: 'terser',
    
    rollupOptions: {
      input: {
        main: './index.html',
        admin: './admin.html'
      },
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['element-plus', 'ant-design-vue']
        }
      }
    },
    
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000
  }
})
```

### `preview` - 预览服务器

```typescript
interface PreviewOptions {
  host?: string | boolean
  port?: number
  https?: boolean
  open?: boolean | string
  proxy?: Record<string, string | ProxyOptions>
  cors?: boolean | CorsOptions
}
```

**示例：**

```typescript
export default defineConfig({
  preview: {
    host: '127.0.0.1',
    port: 4173,
    open: true,
    https: false,
    
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
```

## 🔌 插件配置

### 自动插件

当使用预设时，相关插件会自动配置：

```typescript
// Vue 3 预设自动配置
{
  plugins: [
    vue(),
    // 其他自动配置的插件...
  ]
}
```

### 自定义插件

```typescript
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      // Vue 插件选项
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ],
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src/components')
    }
  }
})
```

## 📁 路径和别名

### 基本别名配置

```typescript
import { defineConfig, createBasicAliases } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    // 控制内置别名的启用/禁用
    alias: {
      enabled: true // 启用内置的 @ -> src 别名
    }
  },

  resolve: {
    alias: [
      // 使用工具函数创建基本别名
      ...createBasicAliases('./src'),

      // 添加自定义别名
      { find: '@components', replacement: './src/components' },
      { find: '@utils', replacement: './src/utils' },
      { find: '@assets', replacement: './src/assets' },
    ]
  }
})
```

### 手动别名配置

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  resolve: {
    alias: [
      // 基本别名
      { find: '@', replacement: './src' },

      // 正则表达式别名
      { find: /^@\//, replacement: './src/' },
      { find: /^~\//, replacement: './src/components/' },

      // 具体目录别名
      { find: '@components', replacement: './src/components' },
      { find: '@utils', replacement: './src/utils' },
      { find: '@assets', replacement: './src/assets' },
    ],

    // 文件扩展名
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  }
})
```

### Node.js Polyfills

```typescript
import { defineConfig, createNodePolyfillAliases } from '@ldesign/launcher'

export default defineConfig({
  resolve: {
    alias: [
      { find: '@', replacement: './src' },

      // 添加 Node.js polyfills
      ...createNodePolyfillAliases(),
    ]
  }
})
```

## 🎨 CSS 配置

### CSS 预处理器

```typescript
export default defineConfig({
  css: {
    // CSS 模块
    modules: {
      scopeBehaviour: 'local',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    
    // 预处理器选项
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@/styles/variables.scss";
          @import "@/styles/mixins.scss";
        `
      },
      less: {
        additionalData: `@import "@/styles/variables.less";`
      },
      stylus: {
        additionalData: `@import "@/styles/variables.styl"`
      }
    },
    
    // PostCSS 配置
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('tailwindcss')
      ]
    }
  }
})
```

### CSS 框架集成

```typescript
// Tailwind CSS 配置
export default defineConfig({
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer')
      ]
    }
  }
})

// UnoCSS 配置
import UnoCSS from 'unocss/vite'

export default defineConfig({
  plugins: [
    UnoCSS({
      // UnoCSS 选项
    })
  ]
})
```

## 🔗 依赖优化

### 依赖预构建

```typescript
export default defineConfig({
  optimizeDeps: {
    // 强制预构建
    include: [
      'vue',
      'vue-router',
      'lodash-es',
      'axios'
    ],
    
    // 排除预构建
    exclude: [
      'your-local-package',
      '@your-org/internal-package'
    ],
    
    // 自定义入口
    entries: [
      './src/**/*.vue',
      './src/**/*.ts'
    ],
    
    // 强制优化
    force: false,
    
    // esbuild 选项
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  }
})
```

## 🧪 测试集成

### Vitest 配置

```typescript
/// <reference types="vitest" />
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts'
      ]
    }
  }
})
```

## 📝 TypeScript 配置

### 基本 TypeScript 设置

```typescript
export default defineConfig({
  // esbuild 选项
  esbuild: {
    target: 'es2020',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h } from 'vue'`
  },
  
  // 定义全局变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})
```

## 🌍 环境变量示例

### .env 文件结构

```bash
# .env - 所有环境的默认值
VITE_APP_TITLE=My App
VITE_API_TIMEOUT=5000

# .env.local - 本地环境（不提交到版本控制）
VITE_API_KEY=your-secret-key
VITE_DEBUG_MODE=true

# .env.development - 开发环境
VITE_API_BASE_URL=http://localhost:8080
VITE_LOG_LEVEL=debug

# .env.production - 生产环境
VITE_API_BASE_URL=https://api.production.com
VITE_LOG_LEVEL=error

# .env.staging - 预发布环境
VITE_API_BASE_URL=https://api.staging.com
VITE_LOG_LEVEL=warn
```

### 在配置中使用环境变量

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    env: {
      envFile: [
        '.env',
        '.env.local',
        `.env.${process.env.NODE_ENV}`,
        `.env.${process.env.NODE_ENV}.local`
      ],
      variables: {
        BUILD_TIME: new Date().toISOString(),
        GIT_COMMIT: process.env.CI_COMMIT_SHA || 'unknown'
      }
    }
  },
  
  server: {
    port: Number(process.env.PORT) || 3000
  },
  
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
})
```

## 🏆 完整配置示例

### 企业级 Vue 3 项目配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'
import { loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    launcher: {
      preset: 'vue3-ts',
      
      env: {
        envFile: ['.env', `.env.${mode}`, '.env.local'],
        required: ['VITE_API_BASE_URL'],
        variables: {
          BUILD_TIME: new Date().toISOString(),
          VERSION: require('./package.json').version
        }
      },
      
      optimization: {
        minify: mode === 'production' ? 'terser' : false,
        splitChunks: {
          strategy: 'split-by-experience'
        },
        bundleAnalyzer: {
          enabled: mode === 'analyze'
        }
      }
    },
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@/components': resolve(__dirname, 'src/components'),
        '@/utils': resolve(__dirname, 'src/utils'),
        '@/stores': resolve(__dirname, 'src/stores'),
        '@/assets': resolve(__dirname, 'src/assets')
      }
    },
    
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
      
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, '')
        }
      }
    },
    
    build: {
      target: 'es2015',
      sourcemap: mode === 'development',
      
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            ui: ['element-plus'],
            utils: ['lodash-es', 'dayjs', 'axios']
          }
        }
      }
    },
    
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      }
    },
    
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts']
    }
  }
})
```

## 📚 配置文件模式

### 条件配置

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig(({ command, mode }) => {
  const isDev = mode === 'development'
  const isBuild = command === 'build'
  
  return {
    launcher: {
      preset: 'vue3-ts'
    },
    
    // 开发环境配置
    ...(isDev && {
      server: {
        open: true
      }
    }),
    
    // 构建环境配置
    ...(isBuild && {
      build: {
        sourcemap: false,
        minify: 'terser'
      }
    })
  }
})
```

### 异步配置

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig(async ({ mode }) => {
  // 异步加载配置
  const config = await import(`./config/${mode}.config.js`)
  
  return {
    launcher: {
      preset: 'vue3-ts'
    },
    ...config.default
  }
})
```

---

## 📋 配置速查表

| 配置项 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| `launcher.preset` | `string` | `undefined` | 项目预设类型 |
| `launcher.extends` | `string \| string[]` | `undefined` | 配置继承 |
| `launcher.env` | `EnvironmentConfig` | `{}` | 环境变量配置 |
| `server.port` | `number` | `3000` | 开发服务器端口 |
| `server.host` | `string` | `127.0.0.1` | 开发服务器主机 |
| `build.outDir` | `string` | `dist` | 构建输出目录 |
| `build.sourcemap` | `boolean` | `false` | 生成源码映射 |

## 🔗 相关文档

- [快速开始](./quick-start.md)
- [命令行参考](./cli-reference.md)
- [最佳实践](./best-practices.md)
- [常见问题](./faq.md)
