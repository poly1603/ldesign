# 多环境配置系统

@ldesign/launcher 支持强大的多环境配置系统，允许您为不同的环境（开发、生产、测试等）定义特定的配置。

## 概述

多环境配置系统允许您：

- 为不同环境创建专门的配置文件
- 自动加载和合并环境特定配置
- 通过命令行参数指定环境
- 深度合并配置，确保环境配置优先级高于基础配置

## 支持的环境

系统预定义了以下环境：

- `development` - 开发环境
- `production` - 生产环境  
- `test` - 测试环境
- `staging` - 预发布环境
- `preview` - 预览环境

## 配置文件命名规则

### 基础配置文件

```
.ldesign/launcher.config.ts     # 优先级最高
launcher.config.ts              # 项目根目录
vite.config.ts                  # 兼容 Vite 配置
```

### 环境特定配置文件

```
.ldesign/launcher.[environment].config.ts
launcher.[environment].config.ts
```

例如：
- `.ldesign/launcher.development.config.ts`
- `.ldesign/launcher.production.config.ts`
- `launcher.test.config.ts`

## 配置文件查找顺序

当指定环境时，系统按以下顺序查找配置文件：

1. 环境特定配置文件（优先级最高）
2. 基础配置文件（作为回退）

## 使用方法

### 1. 命令行指定环境

```bash
# 使用开发环境配置
launcher dev --environment development

# 使用生产环境配置
launcher build --environment production

# 使用测试环境配置
launcher preview --environment test
```

### 2. 创建环境配置文件

**基础配置文件** (`.ldesign/launcher.config.ts`):

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3000,
    host: 'localhost'
  },
  build: {
    outDir: 'dist'
  }
})
```

**开发环境配置** (`.ldesign/launcher.development.config.ts`):

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3011,        // 覆盖基础配置
    open: true,        // 新增配置
    host: '0.0.0.0'    // 覆盖基础配置
  },
  build: {
    sourcemap: true    // 新增配置
  },
  launcher: {
    logLevel: 'debug'  // 开发环境详细日志
  }
})
```

**生产环境配置** (`.ldesign/launcher.production.config.ts`):

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  build: {
    minify: true,      // 生产环境压缩
    sourcemap: false   // 生产环境不生成 sourcemap
  },
  launcher: {
    logLevel: 'warn'   // 生产环境只显示警告
  }
})
```

### 3. 配置合并规则

环境配置会与基础配置进行**深度合并**：

- 环境配置的属性会覆盖基础配置的同名属性
- 嵌套对象会递归合并
- 数组会被完全替换（不合并）

**示例：**

基础配置：
```typescript
{
  server: {
    port: 3000,
    host: 'localhost',
    proxy: {
      '/api': { target: 'http://localhost:8080' }
    }
  }
}
```

环境配置：
```typescript
{
  server: {
    port: 8080,  // 覆盖
    proxy: {
      '/api': { target: 'http://localhost:9000' },  // 覆盖
      '/assets': { target: 'http://localhost:9001' } // 新增
    }
  }
}
```

合并结果：
```typescript
{
  server: {
    port: 8080,           // 来自环境配置
    host: 'localhost',    // 来自基础配置
    proxy: {
      '/api': { target: 'http://localhost:9000' },    // 来自环境配置
      '/assets': { target: 'http://localhost:9001' }  // 来自环境配置
    }
  }
}
```

## 最佳实践

### 1. 配置文件组织

```
project/
├── .ldesign/
│   ├── launcher.config.ts              # 基础配置
│   ├── launcher.development.config.ts  # 开发环境
│   ├── launcher.production.config.ts   # 生产环境
│   └── launcher.test.config.ts         # 测试环境
└── package.json
```

### 2. 环境特定配置建议

**开发环境 (development):**
- 启用详细日志 (`logLevel: 'debug'`)
- 生成 sourcemap (`sourcemap: true`)
- 自动打开浏览器 (`open: true`)
- 允许外部访问 (`host: '0.0.0.0'`)
- 不压缩代码 (`minify: false`)

**生产环境 (production):**
- 最小日志级别 (`logLevel: 'warn'`)
- 启用代码压缩 (`minify: true`)
- 不生成 sourcemap (`sourcemap: false`)
- 清空输出目录 (`emptyOutDir: true`)

**测试环境 (test):**
- 静默模式 (`logLevel: 'silent'`)
- 快速构建配置
- 测试专用代理配置

### 3. 脚本配置

在 `package.json` 中配置环境特定的脚本：

```json
{
  "scripts": {
    "dev": "launcher dev --environment development",
    "dev:prod": "launcher dev --environment production",
    "build": "launcher build --environment production",
    "build:dev": "launcher build --environment development",
    "preview": "launcher preview --environment production",
    "test": "launcher dev --environment test"
  }
}
```

## 高级用法

### 1. 条件配置

```typescript
import { defineConfig } from '@ldesign/launcher'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  server: {
    port: isDev ? 3011 : 3000,
    open: isDev
  },
  build: {
    sourcemap: isDev,
    minify: !isDev
  }
})
```

### 2. 环境变量集成

```typescript
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: Number(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost'
  },
  define: {
    __API_URL__: JSON.stringify(process.env.API_URL || 'http://localhost:8080')
  }
})
```

### 3. 配置继承

```typescript
import baseConfig from './launcher.config'
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  ...baseConfig,
  server: {
    ...baseConfig.server,
    port: 8080  // 只覆盖端口
  }
})
```

## 故障排除

### 1. 配置文件未加载

检查文件命名是否正确：
- 确保环境名称拼写正确
- 确保文件扩展名正确 (`.ts`, `.js`, `.mjs`, `.cjs`)
- 确保文件位置正确 (`.ldesign/` 目录或项目根目录)

### 2. 配置合并异常

- 检查配置文件语法是否正确
- 确保导出的是有效的配置对象
- 使用 `--debug` 参数查看详细日志

### 3. 环境参数无效

确保使用的环境名称在支持列表中：
`development`, `production`, `test`, `staging`, `preview`

## 相关文档

- [代理配置指南](./proxy-config.md)
- [配置文件参考](../config/README.md)
- [CLI 命令参考](../cli/README.md)
