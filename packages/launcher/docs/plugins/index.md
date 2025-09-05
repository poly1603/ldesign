# 插件系统

@ldesign/launcher 提供了强大的插件系统，允许开发者扩展和自定义构建流程。

## 📋 插件概览

插件是 @ldesign/launcher 最核心的扩展机制，通过插件可以：

- ✨ 自定义构建流程
- 🔧 添加新的功能特性
- 🎯 集成第三方工具
- 📊 收集构建统计
- 🚀 优化开发体验

## 🎯 内置插件

@ldesign/launcher 内置了多个实用插件：

| 插件名称 | 描述 | 文档链接 |
|---------|------|----------|
| `@ldesign/plugin-vue` | Vue 3 支持 | [查看详情](./builtin/vue) |
| `@ldesign/plugin-react` | React 支持 | [查看详情](./builtin/react) |
| `@ldesign/plugin-typescript` | TypeScript 支持 | [查看详情](./builtin/typescript) |
| `@ldesign/plugin-css` | CSS 处理 | [查看详情](./builtin/css) |
| `@ldesign/plugin-assets` | 静态资源处理 | [查看详情](./builtin/assets) |
| `@ldesign/plugin-analyzer` | 包大小分析 | [查看详情](./builtin/analyzer) |
| `@ldesign/plugin-mock` | API Mock | [查看详情](./builtin/mock) |
| `@ldesign/plugin-pwa` | PWA 支持 | [查看详情](./builtin/pwa) |

## 🛠️ 使用插件

### 基本用法

```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import vue from '@ldesign/plugin-vue'
import typescript from '@ldesign/plugin-typescript'

export default defineConfig({
  plugins: [
    vue(),
    typescript({
      check: true,
      include: ['src/**/*.ts', 'src/**/*.vue']
    })
  ]
})
```

### 插件配置

```typescript
export default defineConfig({
  plugins: [
    vue({
      // Vue 插件选项
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ion-')
        }
      }
    }),
    
    typescript({
      // TypeScript 插件选项
      check: process.env.NODE_ENV === 'development',
      tsconfigPath: './tsconfig.build.json'
    })
  ]
})
```

### 条件加载插件

```typescript
export default defineConfig(({ mode }) => {
  const plugins = [
    vue(),
    typescript()
  ]
  
  // 开发环境添加 Mock 插件
  if (mode === 'development') {
    plugins.push(mock({
      mockPath: './mock',
      enable: true
    }))
  }
  
  // 生产环境添加分析插件
  if (mode === 'production') {
    plugins.push(analyzer())
  }
  
  return {
    plugins
  }
})
```

## 🔧 开发插件

### 插件基本结构

```typescript
// my-plugin.ts
import type { Plugin } from '@ldesign/launcher'

export interface MyPluginOptions {
  option1?: string
  option2?: boolean
}

export default function myPlugin(options: MyPluginOptions = {}): Plugin {
  return {
    name: 'my-plugin',
    
    // 配置钩子
    config(config, { mode }) {
      // 修改配置
      if (mode === 'development') {
        config.define = config.define || {}
        config.define.__DEV__ = true
      }
    },
    
    // 构建开始钩子
    buildStart(options) {
      console.log('开始构建...')
    },
    
    // 文件解析钩子
    resolveId(id) {
      if (id === 'virtual:my-module') {
        return id
      }
    },
    
    // 文件加载钩子
    load(id) {
      if (id === 'virtual:my-module') {
        return 'export const msg = "Hello from virtual module!"'
      }
    },
    
    // 代码转换钩子
    transform(code, id) {
      if (id.endsWith('.special')) {
        return {
          code: transformSpecialFile(code),
          map: null
        }
      }
    },
    
    // 构建结束钩子
    buildEnd(error) {
      console.log('构建结束')
    }
  }
}

function transformSpecialFile(code: string): string {
  // 转换逻辑
  return code.replace(/MAGIC_KEYWORD/g, 'replaced')
}
```

### 插件钩子

#### 构建钩子

```typescript
export default function myPlugin(): Plugin {
  return {
    name: 'build-hooks-plugin',
    
    // 配置相关
    config(config, env) {
      // 修改配置
    },
    configResolved(resolvedConfig) {
      // 配置解析完成后调用
    },
    configureServer(server) {
      // 配置开发服务器
    },
    configurePreviewServer(server) {
      // 配置预览服务器
    },
    
    // 构建生命周期
    buildStart(options) {
      // 构建开始
    },
    buildEnd(error?) {
      // 构建结束
    },
    
    // 文件处理
    resolveId(id, importer) {
      // 解析模块 ID
    },
    load(id) {
      // 加载文件
    },
    transform(code, id) {
      // 转换代码
    },
    
    // 生成阶段
    generateBundle(options, bundle) {
      // 生成 bundle
    },
    writeBundle(options, bundle) {
      // 写入文件系统
    }
  }
}
```

#### 开发服务器钩子

```typescript
export default function devServerPlugin(): Plugin {
  return {
    name: 'dev-server-plugin',
    
    configureServer(server) {
      // 添加中间件
      server.middlewares.use('/api', (req, res, next) => {
        if (req.url === '/api/health') {
          res.statusCode = 200
          res.end('OK')
          return
        }
        next()
      })
      
      // 监听文件变化
      server.ws.on('my-event', (data, client) => {
        console.log('收到自定义事件:', data)
      })
    },
    
    handleHotUpdate({ file, modules, server }) {
      // 自定义热更新逻辑
      if (file.endsWith('.special')) {
        server.ws.send({
          type: 'full-reload'
        })
        return []
      }
    }
  }
}
```

### 插件工具函数

```typescript
import type { Plugin } from '@ldesign/launcher'

// 创建虚拟模块插件
export function createVirtualPlugin(modules: Record<string, string>): Plugin {
  const prefix = 'virtual:'
  
  return {
    name: 'virtual-modules',
    
    resolveId(id) {
      if (id.startsWith(prefix)) {
        return id
      }
    },
    
    load(id) {
      if (id.startsWith(prefix)) {
        const realId = id.slice(prefix.length)
        return modules[realId]
      }
    }
  }
}

// 使用虚拟模块插件
export default defineConfig({
  plugins: [
    createVirtualPlugin({
      'config': 'export default { apiUrl: "/api" }',
      'utils': 'export const isDebug = true'
    })
  ]
})
```

### 异步插件

异步初始化与异步 Hook 都是被支持的：

```ts
import type { Plugin } from '@ldesign/launcher'
import { readFile } from 'node:fs/promises'

export default function remoteVars(): Plugin {
  return {
    name: 'remote-vars',
    async config() {
      const txt = await readFile('./.env.shared', 'utf-8')
      return { define: { __SHARED__: JSON.stringify(txt.trim()) } }
    }
  }
}
```

### 执行顺序与条件启用

- 使用 `enforce: 'pre' | 'post'` 调整执行先后
- 使用 `apply: 'serve' | 'build' | (config, env) => boolean` 控制生效范围

```ts
export default function onlyBuild(): Plugin {
  return { name: 'only-build', apply: 'build', enforce: 'post' }
}
```

### 调试与诊断

- 打点：`console.time/console.timeEnd` 标记关键流程
- 定位：在 `transform` 中打印 `id` 与 `code.length`，判定是否对大量文件做了不必要工作
- 回退：遇到复杂依赖导致 HMR 抖动时，可在 `handleHotUpdate` 中返回 `[]` 触发全量刷新
export default function asyncPlugin(): Plugin {
  return {
    name: 'async-plugin',
    
    async buildStart() {
      // 异步初始化
      await setupDatabase()
    },
    
    async load(id) {
      if (id.endsWith('.remote')) {
        // 异步加载远程内容
        const content = await fetchRemoteContent(id)
        return content
      }
    },
    
    async transform(code, id) {
      if (shouldTransformAsync(id)) {
        const transformed = await asyncTransform(code)
        return transformed
      }
    }
  }
}
```

## 📦 发布插件

### 插件包结构

```
my-launcher-plugin/
├── src/
│   ├── index.ts          # 插件入口
│   ├── types.ts          # 类型定义
│   └── utils.ts          # 工具函数
├── dist/                 # 构建输出
├── package.json
├── README.md
└── tsconfig.json
```

### package.json 配置

```json
{
  "name": "@company/launcher-plugin-xxx",
  "version": "1.0.0",
  "description": "A plugin for @ldesign/launcher",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "keywords": ["launcher", "plugin", "vite"],
  "peerDependencies": {
    "@ldesign/launcher": "^1.0.0"
  },
  "devDependencies": {
    "@ldesign/launcher": "^1.0.0",
    "typescript": "^4.9.0"
  }
}
```

### 插件模板

```typescript
// src/index.ts
import type { Plugin } from '@ldesign/launcher'

export interface MyPluginOptions {
  /**
   * 选项1描述
   */
  option1?: string
  
  /**
   * 选项2描述
   * @default true
   */
  option2?: boolean
}

/**
 * 我的自定义插件
 * @param options 插件选项
 */
export default function myPlugin(options: MyPluginOptions = {}): Plugin {
  const {
    option1 = 'default',
    option2 = true
  } = options
  
  return {
    name: 'my-plugin',
    
    config(config) {
      // 实现插件逻辑
    }
  }
}

// 兼容默认导出和命名导出
export { myPlugin }
```

## 🌟 插件示例

### 1. 环境变量插件

```typescript
// plugins/env-plugin.ts
import type { Plugin } from '@ldesign/launcher'

export interface EnvPluginOptions {
  prefix?: string
  files?: string[]
}

export default function envPlugin(options: EnvPluginOptions = {}): Plugin {
  const { prefix = 'VITE_', files = ['.env'] } = options
  
  return {
    name: 'env-plugin',
    
    config(config, { mode }) {
      // 加载环境变量
      const envVars = loadEnvFiles(files, mode)
      
      // 设置 define
      config.define = config.define || {}
      Object.keys(envVars).forEach(key => {
        if (key.startsWith(prefix)) {
          config.define[`import.meta.env.${key}`] = JSON.stringify(envVars[key])
        }
      })
    }
  }
}
```

### 2. 自动导入插件

```typescript
// plugins/auto-import-plugin.ts
import type { Plugin } from '@ldesign/launcher'

export interface AutoImportOptions {
  imports?: Record<string, string[]>
  dts?: boolean
}

export default function autoImportPlugin(options: AutoImportOptions = {}): Plugin {
  const { imports = {}, dts = true } = options
  
  return {
    name: 'auto-import-plugin',
    
    transform(code, id) {
      if (!/\.(vue|js|ts|jsx|tsx)$/.test(id)) return
      
      let transformed = code
      
      // 自动添加导入语句
      Object.entries(imports).forEach(([pkg, exports]) => {
        exports.forEach(exp => {
          const regex = new RegExp(`\\b${exp}\\b`, 'g')
          if (regex.test(code) && !code.includes(`import`)) {
            transformed = `import { ${exp} } from '${pkg}'\n${transformed}`
          }
        })
      })
      
      return transformed !== code ? { code: transformed } : null
    },
    
    buildEnd() {
      if (dts) {
        // 生成类型声明文件
        generateDtsFile(imports)
      }
    }
  }
}
```

### 3. 代码生成插件

```typescript
// plugins/codegen-plugin.ts
import type { Plugin } from '@ldesign/launcher'
import { watch } from 'fs'

export interface CodegenOptions {
  schema: string
  output: string
  watch?: boolean
}

export default function codegenPlugin(options: CodegenOptions): Plugin {
  return {
    name: 'codegen-plugin',
    
    buildStart() {
      // 初始生成
      generateCode(options.schema, options.output)
      
      // 监听模式
      if (options.watch) {
        watch(options.schema, () => {
          generateCode(options.schema, options.output)
        })
      }
    },
    
    load(id) {
      // 拦截生成的文件
      if (id === options.output) {
        return fs.readFileSync(options.output, 'utf-8')
      }
    }
  }
}

function generateCode(schema: string, output: string) {
  // 代码生成逻辑
  const schemaContent = fs.readFileSync(schema, 'utf-8')
  const generatedCode = transform(schemaContent)
  fs.writeFileSync(output, generatedCode)
}
```

## 🔗 插件生态

### 官方插件

- [@ldesign/plugin-vue](./builtin/vue) - Vue 3 支持
- [@ldesign/plugin-react](./builtin/react) - React 支持
- [@ldesign/plugin-typescript](./builtin/typescript) - TypeScript 支持
- [@ldesign/plugin-css](./builtin/css) - CSS 处理增强
- [@ldesign/plugin-mock](./builtin/mock) - API Mock 功能

### 社区插件

探索更多社区插件：

```bash
# 搜索插件
npm search launcher-plugin

# 安装社区插件
npm install @community/launcher-plugin-xxx
```

### 插件开发工具

```bash
# 创建插件模板
npx create-launcher-plugin my-plugin

# 插件开发工具
npm install @ldesign/plugin-dev-kit
```

## 📚 最佳实践

### 1. 插件命名规范

```typescript
// ✅ 推荐命名
export default function myFrameworkPlugin() { ... }

// 插件包名
@company/launcher-plugin-framework
launcher-plugin-framework
```

### 2. 插件配置验证

```typescript
import { z } from 'zod'

const optionsSchema = z.object({
  option1: z.string().optional(),
  option2: z.boolean().default(true)
})

export default function myPlugin(options: unknown): Plugin {
  const validOptions = optionsSchema.parse(options)
  
  return {
    name: 'my-plugin',
    // ...
  }
}
```

### 3. 错误处理

```typescript
export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    
    async transform(code, id) {
      try {
        return await transformCode(code)
      } catch (error) {
        this.error(`转换失败 ${id}: ${error.message}`, {
          id,
          loc: getErrorLocation(error)
        })
      }
    }
  }
}
```

### 4. 性能优化

```typescript
export default function myPlugin(): Plugin {
  const cache = new Map()
  
  return {
    name: 'my-plugin',
    
    transform(code, id) {
      // 使用缓存
      if (cache.has(id)) {
        return cache.get(id)
      }
      
      const result = expensiveTransform(code)
      cache.set(id, result)
      return result
    }
  }
}
```

---

**相关链接**:
- [插件开发指南](./development) - 深入学习插件开发
- [插件 API 参考](./api) - 完整的插件 API 文档
- [内置插件](./builtin/) - 了解内置插件
- [示例插件](../examples/plugins.md) - 插件开发示例
