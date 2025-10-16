# Vite 集成

LDesign Engine 与 Vite 深度集成，提供了优化的开发体验和构建性能。

## 基础配置

### 安装和设置

```bash
# 创建 Vite 项目（推荐使用最新版本）
pnpm create vue@latest my-app
cd my-app

# 安装 LDesign Engine
pnpm add @ldesign/engine

# 安装开发依赖（如果有专用插件）
# pnpm add -D @ldesign/vite-plugin-engine

# 确保 TypeScript 版本
pnpm add -D typescript@^5.0.0

# 确保 Vue 版本
pnpm add vue@^3.3.0
```

### Vite 配置

```typescript
// vite.config.ts
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue({
      // Vue 3.3+ 特性支持
      script: {
        defineModel: true,
        propsDestructure: true
      }
    }),
    // 如果有专用插件，可以添加
    // ldesignEngine({
    //   debug: true,
    //   hotReload: true,
    // }),
  ],

  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
    },
  },

  // TypeScript 配置
  esbuild: {
    target: 'es2020'
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,

    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },

  // 构建配置
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 LDesign Engine 分离
          'ldesign-engine': ['@ldesign/engine'],

          // 将第三方库分离
          'vendor': ['vue', 'vue-router'],

          // 将 UI 库分离
          'element-plus': ['element-plus'],
        },
      },
    },

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // 环境变量
  define: {
    __LDESIGN_DEBUG__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __LDESIGN_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
})
```

## 插件开发

### LDesign Engine Vite 插件

```typescript
// plugins/vite-plugin-ldesign.ts
import type { Plugin } from 'vite'
import { createFilter } from '@rollup/pluginutils'

interface LDesignOptions {
  debug?: boolean
  hotReload?: boolean
  autoImport?: {
    engine?: boolean
    composables?: boolean
    components?: boolean
  }
  codegen?: {
    plugins?: boolean
    middleware?: boolean
    types?: boolean
  }
}

export function ldesignEngine(options: LDesignOptions = {}): Plugin {
  const filter = createFilter(['**/*.vue', '**/*.ts', '**/*.js'])

  return {
    name: 'ldesign-engine',

    // 配置解析
    configResolved(config) {
      // 添加引擎相关的环境变量
      config.define = {
        ...config.define,
        __LDESIGN_DEBUG__: JSON.stringify(options.debug ?? config.command === 'serve'),
        __LDESIGN_HOT_RELOAD__: JSON.stringify(options.hotReload ?? true),
      }
    },

    // 构建开始
    buildStart() {
      if (options.codegen?.types) {
        // 生成类型定义文件
        this.emitFile({
          type: 'asset',
          fileName: 'ldesign-engine.d.ts',
          source: generateTypeDefinitions(),
        })
      }
    },

    // 代码转换
    transform(code, id) {
      if (!filter(id))
        return

      let transformedCode = code

      // 自动导入引擎
      if (options.autoImport?.engine) {
        transformedCode = addEngineImports(transformedCode)
      }

      // 自动导入组合式函数
      if (options.autoImport?.composables) {
        transformedCode = addComposableImports(transformedCode)
      }

      // 热重载支持
      if (options.hotReload && id.includes('.engine.')) {
        transformedCode = addHotReloadSupport(transformedCode, id)
      }

      return {
        code: transformedCode,
        map: null,
      }
    },

    // 开发服务器配置
    configureServer(server) {
      // 添加引擎相关的中间件
      server.middlewares.use('/api/engine', (req, res, next) => {
        if (req.url === '/status') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ status: 'ok', version: '1.0.0' }))
        }
        else {
          next()
        }
      })
    },

    // 热更新处理
    handleHotUpdate(ctx) {
      if (ctx.file.includes('.engine.')) {
        // 引擎文件变化时的特殊处理
        ctx.server.ws.send({
          type: 'custom',
          event: 'ldesign-engine:reload',
          data: {
            file: ctx.file,
            timestamp: Date.now(),
          },
        })
      }
    },
  }
}

// 辅助函数
function generateTypeDefinitions(): string {
  return `
declare module '@ldesign/engine' {
  export interface Engine {
    // 引擎类型定义
  }
}
`
}

function addEngineImports(code: string): string {
  if (code.includes('useEngine') && !code.includes('import') && !code.includes('useEngine')) {
    return `import { useEngine } from '@ldesign/engine/vue'\n${code}`
  }
  return code
}

function addComposableImports(code: string): string {
  // 自动导入常用的组合式函数
  const composables = ['useEngine', 'useState', 'useEvents', 'useLogger']
  const imports = composables.filter(
    name => code.includes(name) && !code.includes(`import.*${name}`)
  )

  if (imports.length > 0) {
    return `import { ${imports.join(', ')} } from '@ldesign/engine/vue'\n${code}`
  }

  return code
}

function addHotReloadSupport(code: string, id: string): string {
  return `
${code}

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // 热重载逻辑
    console.log('Engine module reloaded:', '${id}')
  })
}
`
}
```

## 开发环境优化

### 开发服务器配置

```typescript
// vite.config.ts - 开发环境优化
export default defineConfig({
  server: {
    // 启用 HTTPS（可选）
    https: false,

    // 主机配置
    host: '0.0.0.0', // 允许外部访问
    port: 3000,

    // 自动打开浏览器
    open: true,

    // 热重载配置
    hmr: {
      overlay: true, // 显示错误覆盖层
      clientPort: 3000,
    },

    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },

  // 优化依赖预构建
  optimizeDeps: {
    include: ['@ldesign/engine', 'vue', 'vue-router', 'element-plus'],
    exclude: [
      '@ldesign/engine/dev', // 排除开发工具
    ],
  },
})
```

### 环境变量配置

```bash
# .env.development
VITE_APP_TITLE=LDesign Engine App
VITE_API_BASE_URL=http://localhost:8080/api
VITE_ENABLE_MOCK=true
VITE_LOG_LEVEL=debug

# .env.production
VITE_APP_TITLE=LDesign Engine App
VITE_API_BASE_URL=https://api.example.com
VITE_ENABLE_MOCK=false
VITE_LOG_LEVEL=error

# .env.local (本地开发，不提交到版本控制)
VITE_DEV_TOKEN=your-dev-token
```

```typescript
// src/config/env.ts
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_ENABLE_MOCK: string
  readonly VITE_LOG_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export const env = {
  appTitle: import.meta.env.VITE_APP_TITLE,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
```

## 构建优化

### 生产构建配置

```typescript
// vite.config.ts - 生产构建优化
export default defineConfig({
  build: {
    // 输出目录
    outDir: 'dist',

    // 静态资源目录
    assetsDir: 'assets',

    // 生成 sourcemap
    sourcemap: false,

    // 代码分割
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: (id) => {
          // 第三方库
          if (id.includes('node_modules')) {
            if (id.includes('vue')) {
              return 'vue'
            }
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            if (id.includes('@ldesign/engine')) {
              return 'ldesign-engine'
            }
            return 'vendor'
          }

          // 业务代码分包
          if (id.includes('/src/views/')) {
            return 'views'
          }
          if (id.includes('/src/components/')) {
            return 'components'
          }
        },

        // 文件命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]

          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `media/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            return `fonts/[name]-[hash].${ext}`
          }

          return `assets/[name]-[hash].${ext}`
        },
      },
    },

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log'],
      },
      mangle: {
        safari10: true,
      },
    },

    // 资源内联阈值
    assetsInlineLimit: 4096,

    // CSS 代码分割
    cssCodeSplit: true,

    // 构建目标
    target: 'es2015',

    // 警告阈值
    chunkSizeWarningLimit: 1000,
  },
})
```

### 性能分析

```typescript
import { visualizer } from 'rollup-plugin-visualizer'
// vite.config.ts - 性能分析
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // ... 其他插件

    // 包大小分析
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

## 测试集成

### Vitest 配置

```typescript
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],

  test: {
    // 测试环境
    environment: 'jsdom',

    // 全局变量
    globals: true,

    // 设置文件
    setupFiles: ['./tests/setup.ts'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '**/*.d.ts'],
    },

    // 测试文件匹配
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})
```

### 测试设置

```typescript
import { createTestEngine } from '@ldesign/engine/testing'
import { config } from '@vue/test-utils'
// tests/setup.ts
import { vi } from 'vitest'

// 全局测试引擎
const testEngine = createTestEngine({
  config: {
    debug: false,
    logLevel: 'error',
  },
})

// 配置 Vue Test Utils
config.global.plugins = [testEngine]

// 模拟浏览器 API
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// 模拟 localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)
```

## 部署配置

### Docker 配置

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装 pnpm
RUN npm install -g pnpm

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产镜像
FROM nginx:alpine

# 复制构建结果
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx 配置

```nginx
# nginx.conf
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # 启用 gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 最佳实践

### 1. 开发环境配置

```typescript
// 开发环境专用配置
if (import.meta.env.DEV) {
  // 启用 Vue DevTools
  app.config.performance = true

  // 全局错误处理
  app.config.errorHandler = (err, vm, info) => {
    console.error('Vue Error:', err, info)
  }

  // 全局警告处理
  app.config.warnHandler = (msg, vm, trace) => {
    console.warn('Vue Warning:', msg, trace)
  }
}
```

### 2. 代码分割策略

```typescript
// 路由级别的代码分割
const routes = [
  {
    path: '/',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/about',
    component: () => import('../views/About.vue'),
  },
]

// 组件级别的代码分割
const HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))
```

### 3. 环境变量管理

```typescript
// 类型安全的环境变量
export const config = {
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'LDesign Engine App',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },
  features: {
    enableMock: import.meta.env.VITE_ENABLE_MOCK === 'true',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  },
} as const
```

通过这些配置和优化，你可以获得最佳的 Vite + LDesign Engine 开发体验。
