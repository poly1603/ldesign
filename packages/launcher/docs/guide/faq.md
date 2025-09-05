---
title: 常见问题解答
description: 安装、配置、开发服务器、构建、环境变量、插件与迁移常见问题
---

# 常见问题解答

本文档收集了 @ldesign/launcher 用户最常遇到的问题和相应的解决方案。

## 🚀 安装和配置

### Q: 如何安装 @ldesign/launcher？

**A:** 推荐使用包管理器进行安装：

```bash
# 全局安装（推荐）
pnpm add -g @ldesign/launcher
npm install -g @ldesign/launcher
yarn global add @ldesign/launcher

# 项目内安装
pnpm add -D @ldesign/launcher
npm install --save-dev @ldesign/launcher
yarn add --dev @ldesign/launcher
```

### Q: 支持哪些 Node.js 版本？

**A:** @ldesign/launcher 需要 Node.js 16.0.0 或更高版本。推荐使用最新的 LTS 版本。

```bash
# 检查 Node.js 版本
node --version

# 如果版本过低，请升级 Node.js
```

### Q: 如何创建配置文件？

**A:** 有多种方式创建配置文件：

```bash
# 自动生成（推荐）
launcher config init

# 指定项目类型
launcher config init --preset vue3-ts

# 手动创建
touch launcher.config.ts
```

### Q: 配置文件支持哪些格式？

**A:** 支持以下格式，按优先级排序：

1. `launcher.config.ts` - TypeScript 配置（推荐）
2. `launcher.config.mjs` - ES 模块
3. `launcher.config.js` - JavaScript 模块
4. `launcher.config.cjs` - CommonJS 模块
5. `vite.config.*` - 兼容 Vite 配置

## 🔧 开发服务器

### Q: 端口被占用怎么办？

**A:** 有几种解决方案：

```bash
# 方法1: 指定其他端口
launcher dev --port 3001

# 方法2: 在配置文件中设置
export default defineConfig({
  server: {
    port: 3001
  }
})

# 方法3: 使用环境变量
PORT=3001 launcher dev
```

### Q: 如何设置代理？

**A:** 在配置文件中添加代理配置：

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
```

### Q: 开发服务器无法访问？

**A:** 检查以下几点：

1. **主机配置**：设置为 `0.0.0.0` 允许外部访问
   ```typescript
   server: {
     host: '0.0.0.0' // 允许所有主机访问
   }
   ```

2. **防火墙设置**：确保端口未被防火墙阻止

3. **网络配置**：检查网络连接和路由设置

### Q: 热更新不工作？

**A:** 尝试以下解决方案：

```typescript
export default defineConfig({
  server: {
    hmr: {
      port: 24678 // 指定 HMR 端口
    },
    watch: {
      usePolling: true, // 在某些系统上启用轮询
      interval: 100
    }
  }
})
```

## 🏗 构建问题

### Q: 构建失败怎么办？

**A:** 按以下步骤排查：

1. **检查依赖**：确保所有依赖已正确安装
   ```bash
   pnpm install
   ```

2. **清理缓存**：清除构建缓存
   ```bash
   rm -rf node_modules/.vite
   rm -rf dist
   ```

3. **调试模式**：启用详细日志
   ```bash
   launcher build --debug
   ```

### Q: 构建后文件过大？

**A:** 优化构建产物大小：

```typescript
export default defineConfig({
  launcher: {
    optimization: {
      splitChunks: {
        strategy: 'split-by-experience'
      },
      bundleAnalyzer: {
        enabled: true // 分析包大小
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['element-plus']
        }
      }
    }
  }
})
```

### Q: TypeScript 类型错误？

**A:** 确保类型定义正确：

1. **安装类型定义**
   ```bash
   pnpm add -D typescript @types/node
   ```

2. **配置 tsconfig.json**
   ```json
   {
     "compilerOptions": {
       "types": ["@ldesign/launcher/types"]
     }
   }
   ```

## 🌍 环境变量

### Q: 环境变量不生效？

**A:** 检查以下几点：

1. **前缀正确**：确保使用正确的前缀
   ```bash
   # Vite 项目使用 VITE_ 前缀
   VITE_API_URL=http://localhost:8080
   
   # React 项目可能使用 REACT_APP_ 前缀
   REACT_APP_API_URL=http://localhost:8080
   ```

2. **文件位置**：确保 .env 文件在项目根目录

3. **配置加载**：在配置文件中指定环境变量文件
   ```typescript
   export default defineConfig({
     launcher: {
       env: {
         envFile: ['.env', '.env.local', `.env.${process.env.NODE_ENV}`]
       }
     }
   })
   ```

### Q: 如何在不同环境使用不同配置？

**A:** 创建多个环境配置文件：

```
.env                # 所有环境的默认值
.env.local          # 本地环境（不提交到版本控制）
.env.development    # 开发环境
.env.production     # 生产环境
.env.staging        # 预发布环境
```

## 🎯 项目预设

### Q: 如何使用项目预设？

**A:** 在配置文件中指定预设：

```typescript
export default defineConfig({
  launcher: {
    preset: 'vue3-ts' // 可选值见下文
  }
})
```

支持的预设：
- `vue2` - Vue 2 项目
- `vue3` - Vue 3 项目
- `vue3-ts` - Vue 3 + TypeScript
- `react` - React 项目
- `react-ts` - React + TypeScript
- `svelte` - Svelte 项目
- `svelte-ts` - Svelte + TypeScript
- `vanilla` - 原生 JavaScript
- `vanilla-ts` - 原生 TypeScript

### Q: 如何自定义预设？

**A:** 继承预设并添加自定义配置：

```typescript
export default defineConfig({
  launcher: {
    extends: 'vue3-ts' // 继承预设
  },
  
  // 自定义配置
  server: {
    port: 8080
  },
  
  plugins: [
    // 添加自定义插件
  ]
})
```

## 🔌 插件问题

### Q: 插件冲突怎么解决？

**A:** 按以下步骤解决：

1. **检查插件版本**：确保插件版本兼容
2. **调整插件顺序**：某些插件对顺序敏感
3. **配置插件选项**：检查插件配置是否正确

```typescript
export default defineConfig({
  plugins: [
    vue(), // 确保 Vue 插件在前
    // 其他插件...
  ]
})
```

### Q: 如何禁用自动插件？

**A:** 使用 `custom` 预设或手动配置：

```typescript
export default defineConfig({
  launcher: {
    preset: 'custom' // 不自动加载插件
  },
  
  plugins: [
    // 手动添加所需插件
    vue({
      // 自定义配置
    })
  ]
})
```

## 💻 开发体验

### Q: 如何启用调试模式？

**A:** 使用调试参数：

```bash
# 详细日志
launcher dev --debug

# 或设置环境变量
DEBUG=launcher:* launcher dev

# 静默模式
launcher dev --silent
```

### Q: 如何提高构建速度？

**A:** 优化构建性能：

```typescript
export default defineConfig({
  launcher: {
    optimization: {
      deps: {
        include: ['vue', 'lodash'], // 预构建常用依赖
        exclude: ['@testing-library/*'] // 排除测试相关依赖
      }
    }
  },
  
  build: {
    target: 'es2015', // 降低目标版本减少转译
    minify: 'esbuild', // 使用更快的压缩工具
    reportCompressedSize: false // 禁用大小报告
  }
})
```

### Q: 如何集成代码检查工具？

**A:** 在构建流程中集成 ESLint、Prettier：

```json
// package.json
{
  "scripts": {
    "dev": "launcher dev",
    "build": "npm run lint && launcher build",
    "lint": "eslint src --ext .ts,.vue",
    "lint:fix": "eslint src --ext .ts,.vue --fix"
  }
}
```

## 🚨 错误排查

### Q: 遇到 "Cannot resolve plugin" 错误？

**A:** 安装缺失的插件：

```bash
# 常见插件
pnpm add -D @vitejs/plugin-vue      # Vue 3
pnpm add -D @vitejs/plugin-vue2     # Vue 2
pnpm add -D @vitejs/plugin-react    # React
pnpm add -D @sveltejs/vite-plugin-svelte # Svelte
```

### Q: 遇到模块解析错误？

**A:** 检查路径别名配置：

```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~/': path.resolve(__dirname, 'src/') + '/'
    }
  }
})
```

### Q: 样式文件加载失败？

**A:** 确保预处理器已安装：

```bash
# SCSS
pnpm add -D sass

# Less
pnpm add -D less

# Stylus
pnpm add -D stylus
```

## 🔄 迁移指南

### Q: 从 Vite 迁移到 Launcher？

**A:** 迁移步骤：

1. **安装 Launcher**
   ```bash
   pnpm add -D @ldesign/launcher
   ```

2. **重命名配置文件**
   ```bash
   mv vite.config.js launcher.config.js
   ```

3. **更新导入**
   ```typescript
   // 原来
   import { defineConfig } from 'vite'
   
   // 现在
   import { defineConfig } from '@ldesign/launcher'
   ```

4. **添加预设**（可选）
   ```typescript
   export default defineConfig({
     launcher: {
       preset: 'vue3-ts'
     },
     // 原有配置保持不变
   })
   ```

### Q: 从 webpack 迁移？

**A:** 主要差异对照：

| webpack | @ldesign/launcher |
|---------|-------------------|
| `webpack.config.js` | `launcher.config.ts` |
| `entry` | `build.rollupOptions.input` |
| `output` | `build.outDir` |
| `resolve.alias` | `resolve.alias` |
| `devServer` | `server` |

## 📚 最佳实践

### Q: 推荐的项目结构？

**A:** 标准项目结构：

```
my-project/
├── src/
│   ├── components/
│   ├── views/
│   ├── utils/
│   ├── assets/
│   └── main.ts
├── public/
├── tests/
├── launcher.config.ts
├── package.json
└── README.md
```

### Q: 如何管理多环境配置？

**A:** 使用配置继承：

```typescript
// base.config.ts - 基础配置
export default {
  launcher: {
    preset: 'vue3-ts'
  }
}

// dev.config.ts - 开发配置
export default defineConfig({
  launcher: {
    extends: './base.config.ts'
  },
  server: {
    port: 3000
  }
})

// prod.config.ts - 生产配置
export default defineConfig({
  launcher: {
    extends: './base.config.ts'
  },
  build: {
    minify: true
  }
})
```

## 🆘 获取帮助

### Q: 还有其他问题怎么办？

**A:** 通过以下渠道获取帮助：

1. **查看文档**
   - [快速开始](./quick-start.md)
   - [配置参考](./config-reference.md)
   - [命令行参考](./cli-reference.md)

2. **社区支持**
   - [GitHub Issues](https://github.com/ldesign/launcher/issues)
   - [GitHub Discussions](https://github.com/ldesign/launcher/discussions)
   - [Discord 群组](https://discord.gg/ldesign-launcher)

3. **调试信息**
   ```bash
   # 收集调试信息
   launcher --version
   launcher config validate --debug
   DEBUG=launcher:* launcher dev --debug > debug.log 2>&1
   ```

4. **问题报告模板**
   ```markdown
   ## 问题描述
   简短描述遇到的问题
   
   ## 重现步骤
   1. 第一步
   2. 第二步
   3. ...
   
   ## 期望行为
   描述期望的正确行为
   
   ## 环境信息
   - Node.js 版本: 
   - @ldesign/launcher 版本: 
   - 操作系统: 
   
   ## 配置文件
   ```typescript
   // 贴出 launcher.config.ts 内容
   ```
   
   ## 错误日志
   ```
   // 贴出完整错误日志
   ```
   ```

---

## 📈 问题统计

根据用户反馈，以下是最常见的问题类型：

1. **配置问题** (35%) - 配置文件语法、路径等
2. **环境变量** (20%) - 环境变量加载和使用
3. **构建错误** (18%) - 构建失败、文件过大等
4. **开发服务器** (15%) - 端口冲突、代理设置等
5. **插件问题** (8%) - 插件冲突、配置错误
6. **其他** (4%) - 迁移、性能等

希望这份 FAQ 能帮助您快速解决问题。如果您的问题未在此列出，请通过上述渠道联系我们！
