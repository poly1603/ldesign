# @ldesign/cli

LDesign CLI 是一个强大的脚手架工具，支持插件系统、中间件和多环境配置。

## 特性

- 🚀 **现代化架构** - 基于 TypeScript 和 ESM 模块
- 🔌 **插件系统** - 支持动态加载和管理插件
- 🔄 **中间件系统** - 支持命令执行前后的处理
- 🌍 **多环境配置** - 支持不同环境的配置管理
- ⚡ **jiti 支持** - 支持 TypeScript 和 ESM 的动态加载
- 📦 **模板系统** - 内置项目模板生成器
- 🎨 **丰富的 CLI 体验** - 支持交互式命令、进度条、彩色输出

## 安装

```bash
# 全局安装
npm install -g @ldesign/cli

# 或使用 pnpm
pnpm add -g @ldesign/cli
```

## 使用

```bash
# 查看帮助
ldesign --help

# 或使用短命令
ld --help

# 初始化新项目
ldesign init my-project

# 构建项目
ldesign build

# 开发模式
ldesign dev

# 运行测试
ldesign test
```

## 核心架构

### 目录结构

```
src/
├── core/           # 核心功能
│   ├── cli.ts      # CLI 主类
│   ├── command.ts  # 命令管理器
│   ├── plugin.ts   # 插件管理器
│   └── middleware.ts # 中间件管理器
├── commands/       # 内置命令
│   ├── init.ts     # 初始化命令
│   ├── build.ts    # 构建命令
│   ├── dev.ts      # 开发命令
│   └── test.ts     # 测试命令
├── config/         # 配置系统
│   ├── loader.ts   # 配置加载器
│   └── schema.ts   # 配置模式
├── plugins/        # 插件系统
│   └── manager.ts  # 插件管理器
├── middleware/     # 中间件系统
│   └── manager.ts  # 中间件管理器
├── utils/          # 工具函数
│   ├── logger.ts   # 日志工具
│   ├── file.ts     # 文件工具
│   └── template.ts # 模板工具
└── types/          # 类型定义
    └── index.ts    # 核心类型
```

### 配置文件

CLI 支持多种配置文件格式：

- `ldesign.config.js`
- `ldesign.config.ts`
- `ldesign.config.json`
- `.ldesignrc`
- `package.json` 中的 `ldesign` 字段

### 环境配置

支持多环境配置：

```javascript
// ldesign.config.js
export default {
  // 基础配置
  plugins: ['@ldesign/plugin-vue'],
  
  // 环境特定配置
  environments: {
    development: {
      // 开发环境配置
    },
    production: {
      // 生产环境配置
    }
  }
}
```

## 插件开发

### 创建插件

```typescript
import { Plugin } from '@ldesign/cli';

export const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.0',
  description: '我的自定义插件',
  
  async init(context) {
    // 插件初始化逻辑
  },
  
  commands: [
    {
      name: 'my-command',
      description: '我的自定义命令',
      action: async (args, context) => {
        // 命令执行逻辑
      }
    }
  ],
  
  middleware: [
    {
      name: 'my-middleware',
      execute: async (context, next) => {
        // 中间件逻辑
        await next();
      }
    }
  ]
};
```

### 注册插件

```javascript
// ldesign.config.js
export default {
  plugins: [
    '@ldesign/plugin-vue',
    './plugins/my-plugin.js',
    {
      name: '@ldesign/plugin-react',
      options: {
        typescript: true
      }
    }
  ]
}
```

## 中间件系统

中间件可以在命令执行前后进行处理：

```typescript
import { Middleware } from '@ldesign/cli';

export const authMiddleware: Middleware = {
  name: 'auth',
  priority: 100, // 优先级越高越先执行
  
  async execute(context, next) {
    // 执行前处理
    console.log('检查用户权限...');
    
    // 调用下一个中间件或命令
    await next();
    
    // 执行后处理
    console.log('清理资源...');
  }
};
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# 代码检查
pnpm lint
```

## 许可证

MIT
