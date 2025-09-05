# 配置参考

@ldesign/launcher 提供了灵活且强大的配置系统，支持多种配置格式和丰富的配置选项。

## 📋 配置概览

@ldesign/launcher 的配置分为以下几个主要部分：

| 配置节 | 描述 | 文档链接 |
|--------|------|----------|
| `server` | 开发服务器配置 | [查看详情](./server) |
| `build` | 构建配置 | [查看详情](./build) |
| `preview` | 预览服务器配置 | [查看详情](./preview) |
| `launcher` | Launcher 特有配置 | [查看详情](./launcher) |
| `plugins` | 插件配置 | [查看详情](./plugins) |
| `optimizeDeps` | 依赖优化配置 | [查看详情](./optimize-deps) |

## 🔧 配置文件格式

@ldesign/launcher 支持多种配置文件格式：

### TypeScript 配置 (推荐)

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  server: {
    port: 3000,
    host: 'localhost',
    open: true
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true
  },
  
  launcher: {
    autoRestart: true,
    logLevel: 'info',
    hooks: {
      beforeStart: async () => {
        console.log('🚀 Starting development server...')
      }
    }
  }
})
```

### JavaScript 配置

```javascript
// launcher.config.js
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true
  }
})
```

### ES 模块配置

```javascript
// launcher.config.mjs
export default {
  server: {
    port: 3000,
    host: 'localhost'
  },
  build: {
    outDir: 'dist'
  }
}
```

### CommonJS 配置

```javascript
// launcher.config.cjs
module.exports = {
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
}
```

### JSON 配置

```json
// launcher.config.json
{
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "build": {
    "outDir": "dist"
  }
}
```

## 📂 配置文件查找

@ldesign/launcher 按以下优先级查找配置文件（高 → 低）：

1. 命令行指定 (--config)
2. 项目根目录配置文件：
   - vite.config.ts
   - vite.config.mjs
   - vite.config.js
   - vite.config.cjs
   - launcher.config.mjs
   - launcher.config.ts
   - launcher.config.js
   - launcher.config.cjs

提示：如同时存在 .mjs 与 .ts/.js，将优先使用 .mjs（优先 ESM 格式）。

### 自定义配置文件路径

```bash
# 命令行指定
launcher dev --config ./configs/development.config.ts

# 环境变量
LAUNCHER_CONFIG=./configs/production.config.js launcher build
```

## 🔄 配置合并

@ldesign/launcher 使用智能配置合并，优先级从高到低：

1. **命令行参数** (最高)
2. **环境变量**
3. **项目配置文件**
4. **默认配置** (最低)

### 配置合并示例

```typescript
// 基础配置
const baseConfig = {
  server: { port: 3000, host: 'localhost' },
  build: { outDir: 'dist' }
}

// 环境配置
const devConfig = {
  server: { open: true, cors: true }
}

// 命令行配置
const cliConfig = {
  server: { port: 8080 }
}

// 最终合并结果
const finalConfig = {
  server: { 
    port: 8080,      // 来自命令行 (最高优先级)
    host: 'localhost', // 来自基础配置
    open: true,      // 来自环境配置
    cors: true       // 来自环境配置
  },
  build: { outDir: 'dist' }  // 来自基础配置
}
```

## 🌍 环境特定配置

### 条件配置

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'
  
  return {
    server: {
      port: isProduction ? 80 : 3000
    },
    build: {
      sourcemap: !isProduction,
      minify: isProduction
    }
  }
})
```

### 多文件配置

```typescript
// configs/base.config.ts
export default {
  build: {
    outDir: 'dist'
  }
}

// configs/development.config.ts
import baseConfig from './base.config'

export default {
  ...baseConfig,
  server: {
    port: 3000,
    open: true
  }
}

// configs/production.config.ts
import baseConfig from './base.config'

export default {
  ...baseConfig,
  build: {
    ...baseConfig.build,
    minify: true,
    sourcemap: false
  }
}
```

## 🔧 配置验证

@ldesign/launcher 内置配置验证功能：

### 自动验证

```typescript
// launcher.config.ts
export default defineConfig({
  server: {
    port: 70000  // ❌ 端口号超出范围，会自动报错
  }
})
```

### 手动验证

```bash
# CLI 验证
launcher config validate

# 验证特定配置文件
launcher config validate --config ./my-config.ts

# API 验证
import { validateConfig } from '@ldesign/launcher'

const config = { /* ... */ }
const result = validateConfig(config)

if (!result.valid) {
  console.error('配置错误:', result.errors)
}
```

## 📊 配置调试

### 查看当前配置

```bash
# 显示完整配置
launcher config list

# JSON 格式输出
launcher config list --json

# 显示特定配置节
launcher config get server.port
```

### 调试模式

```typescript
export default defineConfig({
  launcher: {
    logLevel: 'debug'  // 启用详细日志
  }
})
```

```bash
# 命令行启用调试
launcher dev --debug
```

## 🎯 配置模板

### 基础项目配置

```typescript
// 适合简单项目的基础配置
export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### Vue 项目配置

```typescript
// Vue 3 项目配置
import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  
  server: {
    port: 3000,
    open: true
  },
  
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
        }
      }
    }
  }
})
```

### React 项目配置

```typescript
// React 项目配置
import { defineConfig } from '@ldesign/launcher'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 3000,
    open: true
  },
  
  build: {
    outDir: 'build',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        }
      }
    }
  }
})
```

### 多环境配置

```typescript
// 完整的多环境配置示例
import { defineConfig, loadEnv } from '@ldesign/launcher'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const isDevelopment = mode === 'development'
  
  return {
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
      host: env.VITE_HOST || 'localhost',
      open: isDevelopment
    },
    
    build: {
      outDir: env.VITE_OUT_DIR || 'dist',
      sourcemap: !isProduction,
      minify: isProduction,
      reportCompressedSize: isProduction
    },
    
    launcher: {
      logLevel: isDevelopment ? 'debug' : 'info',
      autoRestart: isDevelopment,
      
      hooks: {
        beforeStart: async () => {
          console.log(`🚀 Starting ${mode} server...`)
        },
        afterBuild: async () => {
          console.log(`📦 ${mode} build completed!`)
        }
      }
    },
    
    optimizeDeps: {
      include: ['vue', 'vue-router'],
      exclude: ['@vueuse/core']
    }
  }
})
```

## 🔗 配置选项详细文档

点击以下链接查看各配置节的详细文档：

### 核心配置

- [服务器配置 (server)](./server) - 开发服务器相关配置
- [构建配置 (build)](./build) - 生产构建相关配置
- [预览配置 (preview)](./preview) - 预览服务器相关配置

### Launcher 特有配置

- [Launcher 配置 (launcher)](./launcher) - 启动器特有功能配置
- [插件配置 (plugins)](./plugins) - 插件系统配置
- [依赖优化 (optimizeDeps)](./optimize-deps) - 依赖预构建配置

### 高级配置

- [环境变量 (env)](./env) - 环境变量处理
- [路径解析 (resolve)](./resolve) - 模块路径解析
- [CSS 配置 (css)](./css) - CSS 处理配置
- [JSON 配置 (json)](./json) - JSON 导入配置

## 💡 配置技巧

### 1. 使用 defineConfig 函数

```typescript
// ✅ 推荐：使用 defineConfig 获得类型提示
export default defineConfig({
  server: { port: 3000 }
})

// ❌ 不推荐：直接导出对象，缺少类型检查
export default {
  server: { port: 3000 }
}
```

### 2. 配置拆分

```typescript
// configs/server.config.ts
export const serverConfig = {
  port: 3000,
  host: 'localhost',
  open: true
}

// configs/build.config.ts
export const buildConfig = {
  outDir: 'dist',
  sourcemap: true,
  minify: true
}

// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import { serverConfig } from './configs/server.config'
import { buildConfig } from './configs/build.config'

export default defineConfig({
  server: serverConfig,
  build: buildConfig
})
```

### 3. 动态配置

```typescript
export default defineConfig(async ({ mode }) => {
  // 可以使用异步操作
  const pkg = await import('./package.json')
  const isProduction = mode === 'production'
  
  return {
    define: {
      __VERSION__: JSON.stringify(pkg.version)
    },
    build: {
      minify: isProduction
    }
  }
})
```

---

**快速导航**:
- [服务器配置](./server) - 开发服务器设置
- [构建配置](./build) - 生产构建选项
- [Launcher 配置](./launcher) - 特有功能配置
