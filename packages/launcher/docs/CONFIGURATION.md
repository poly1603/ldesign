# 📋 配置指南

`@ldesign/launcher` 提供了简单而强大的配置系统，支持多环境配置和丰富的开发工具。

## ⚠️ 重要更新

**已移除重复功能的工具插件：**

- ❌ **i18n 工具插件** - 请使用 `@ldesign/i18n` 包，功能更完整
- ❌ **theme 工具插件** - 请使用 `@ldesign/color` 包，功能更强大

这样避免了功能重复，保持了架构的清晰性。

## 🚀 快速开始

### 基础配置

创建 `launcher.config.ts` 文件：

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0'
  },
  
  // 🛠️ 开发工具配置 - 一键启用
  tools: {
    // 字体转换工具
    font: {
      enabled: true
    },
    
    // SVG 组件生成工具
    svg: {
      enabled: true
    },
    
    // 图片优化工具
    image: {
      enabled: true
    },
    
    // 国际化管理工具
    i18n: {
      enabled: true,
      locales: ['en', 'zh-CN']
    },
    
    // 主题管理工具
    theme: {
      enabled: true
    }
  }
})
```

### 多环境配置

#### 开发环境 (`launcher.development.config.ts`)

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3355,
    open: true,
    host: '0.0.0.0'
  },
  
  // 开发环境代理配置
  proxy: {
    api: {
      target: 'http://localhost:8080',
      pathPrefix: '/api'
    },
    
    mock: {
      target: 'http://localhost:3001',
      pathPrefix: '/mock'
    }
  }
})
```

#### 生产环境 (`launcher.production.config.ts`)

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  
  // 生产环境代理配置
  proxy: {
    api: {
      target: 'https://api.example.com',
      pathPrefix: '/api',
      timeout: 30000
    },
    
    assets: {
      target: 'https://cdn.example.com',
      pathPrefix: '/assets'
    }
  },
  
  build: {
    sourcemap: false,
    minify: true
  }
})
```

## 🛠️ 开发工具详细配置

### 字体转换工具

```typescript
tools: {
  font: {
    enabled: true,
    sourceDir: './src/assets/fonts',     // 字体源目录
    outputDir: './public/fonts',         // 输出目录
    formats: ['woff2', 'woff'],          // 输出格式
    subset: true,                        // 启用字体子集化
    generateCSS: true,                   // 生成 CSS 文件
    fontDisplay: 'swap'                  // 字体显示策略
  }
}
```

### SVG 组件生成工具

```typescript
tools: {
  svg: {
    enabled: true,
    sourceDir: './src/assets/icons',     // SVG 源目录
    outputDir: './src/components/icons', // 组件输出目录
    framework: 'vue',                    // 目标框架 (vue/react/svelte/angular)
    typescript: true,                    // 生成 TypeScript 组件
    optimize: true,                      // 优化 SVG
    generateIndex: true                  // 生成索引文件
  }
}
```

### 图片优化工具

```typescript
tools: {
  image: {
    enabled: true,
    sourceDir: './src/assets/images',    // 图片源目录
    outputDir: './public/images',        // 输出目录
    formats: ['webp', 'avif', 'jpeg'],   // 输出格式
    quality: {                           // 质量设置
      webp: 80,
      avif: 75,
      jpeg: 85
    },
    responsive: true,                    // 生成响应式图片
    responsiveSizes: [320, 640, 768, 1024, 1280, 1920],
    generateManifest: true               // 生成图片清单
  }
}
```

### 国际化管理工具

```typescript
tools: {
  i18n: {
    enabled: true,
    localesDir: './src/locales',         // 语言文件目录
    locales: ['en', 'zh-CN', 'ja'],      // 支持的语言
    defaultLocale: 'en',                 // 默认语言
    autoExtract: true,                   // 自动提取翻译键
    validateTranslations: true,          // 验证翻译完整性
    generateTypes: true,                 // 生成 TypeScript 类型
    format: 'json'                       // 文件格式 (json/js/ts)
  }
}
```

### API 文档生成工具

```typescript
tools: {
  apiDocs: {
    enabled: true,
    sourceDir: './src/api',              // API 源码目录
    outputDir: './docs/api',             // 文档输出目录
    format: 'openapi',                   // 文档格式 (markdown/html/json/openapi)
    interactive: true,                   // 生成交互式文档
    generateExamples: true,              // 生成示例代码
    includePrivate: false                // 包含私有 API
  }
}
```

### 主题管理工具

```typescript
tools: {
  theme: {
    enabled: true,
    themesDir: './src/themes',           // 主题目录
    outputDir: './public/themes',        // 输出目录
    generateSwitcher: true,              // 生成主题切换器
    supportDarkMode: true,               // 支持暗色模式
    autoDetectSystemTheme: true,         // 自动检测系统主题
    generateCSSVars: true                // 生成 CSS 变量
  }
}
```

### PWA 支持工具

```typescript
tools: {
  pwa: {
    enabled: true,
    appName: 'My App',                   // 应用名称
    shortName: 'MyApp',                  // 短名称
    description: '我的应用程序',          // 应用描述
    themeColor: '#722ED1',               // 主题色
    backgroundColor: '#ffffff',          // 背景色
    generateSW: true,                    // 生成 Service Worker
    cacheStrategy: 'staleWhileRevalidate', // 缓存策略
    offlinePage: 'offline.html'          // 离线页面
  }
}
```

## 🔧 代理配置

### 基础代理

```typescript
proxy: {
  api: {
    target: 'http://localhost:8080',
    pathPrefix: '/api',
    rewrite: true,
    headers: {
      'X-Custom-Header': 'value'
    }
  }
}
```

### 高级代理配置

```typescript
proxy: {
  // 多个服务代理
  api: {
    target: 'http://localhost:8080',
    pathPrefix: '/api'
  },
  
  upload: {
    target: 'http://localhost:9001',
    pathPrefix: '/upload',
    timeout: 30000
  },
  
  // 全局代理设置
  global: {
    timeout: 15000,
    verbose: true,
    secure: false
  }
}
```

## 📝 CLI 命令

### 基础命令

```bash
# 启动开发服务器
launcher dev

# 构建项目
launcher build

# 预览构建结果
launcher preview

# 项目健康检查
launcher doctor

# 项目优化分析
launcher optimize
```

### 工具命令

```bash
# 字体转换
launcher tools font

# SVG 组件生成
launcher tools svg

# 图片优化
launcher tools image

# 国际化管理
launcher tools i18n

# API 文档生成
launcher tools api-docs

# 主题管理
launcher tools theme

# PWA 支持
launcher tools pwa
```

## 🎯 最佳实践

### 1. 环境配置分离

- 基础配置放在 `launcher.config.ts`
- 环境特定配置放在对应的环境文件中
- 主要差异化配置代理设置

### 2. 工具按需启用

```typescript
tools: {
  // 只启用需要的工具
  font: { enabled: true },
  svg: { enabled: true },
  image: { enabled: false },  // 不需要时禁用
  i18n: { enabled: true },
  theme: { enabled: true },
  pwa: { enabled: false }     // 按需启用
}
```

### 3. 合理的默认配置

大多数工具都有合理的默认配置，只需要设置 `enabled: true` 即可开始使用。

### 4. 渐进式配置

从简单配置开始，根据需要逐步添加详细配置选项。

## 🔍 配置验证

launcher 会自动验证配置的正确性，并在启动时提供详细的错误信息和建议。

```bash
# 验证配置
launcher doctor
```

这将检查：
- 配置文件语法
- 依赖项完整性
- 工具配置有效性
- 项目结构合理性
