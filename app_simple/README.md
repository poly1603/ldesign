# LDesign Router 示例应用

这是一个使用 `@ldesign/engine` 和 `@ldesign/router` 构建的规范化 Vue 3 应用示例。

## 📁 项目结构

```
src/
├── api/                    # API 接口层
│   └── (API 相关文件)
├── assets/                 # 静态资源
│   └── styles/            # 样式文件
├── components/            # 通用组件
│   └── layout/           # 布局组件
├── composables/           # 组合式函数
│   └── useAuth.ts        # 认证相关逻辑
├── config/               # 配置文件
│   ├── app.config.ts    # 应用配置
│   └── router.config.ts # 路由配置
├── router/              # 路由
│   ├── index.ts        # 路由器创建
│   ├── routes.ts       # 路由定义
│   └── guards/         # 路由守卫
│       ├── auth.guard.ts       # 认证守卫
│       ├── permission.guard.ts # 权限守卫
│       ├── progress.guard.ts   # 进度条守卫
│       └── title.guard.ts      # 标题守卫
├── store/              # 状态管理
│   └── modules/        # 状态模块
├── types/              # TypeScript 类型定义
│   └── user.ts        # 用户相关类型
├── utils/             # 工具函数
│   └── storage.ts     # 存储工具
├── views/             # 页面组件
│   ├── Home.vue       # 首页
│   ├── Login.vue      # 登录页
│   ├── Dashboard.vue  # 仪表盘
│   ├── About.vue      # 关于页
│   └── errors/        # 错误页面
│       └── NotFound.vue # 404页面
├── App.vue            # 根组件
├── main.ts           # 应用入口
└── env.d.ts          # 环境类型声明
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## ✨ 功能特性

### 1. 模块化架构
- **路由模块**: 独立的路由配置和守卫管理
- **认证模块**: 基于 Composable API 的认证系统
- **配置管理**: 集中化的配置文件
- **工具函数**: 可复用的工具类

### 2. 路由系统
- **路由分组**: 公开路由、认证路由、错误路由
- **路由守卫**: 
  - 认证守卫 - 检查用户登录状态
  - 权限守卫 - 验证用户角色权限
  - 进度条守卫 - 显示页面加载进度
  - 标题守卫 - 动态设置页面标题
- **懒加载**: 所有页面组件支持懒加载

### 3. 认证系统
- **用户登录/登出**
- **角色权限管理**
- **本地存储持久化**
- **登录状态保持**

### 4. 存储管理
- **本地存储封装**: 支持过期时间和前缀
- **会话存储**: SessionStorage 支持
- **统一的存储接口**

## 🔐 登录说明

系统内置两个测试用户：

1. **管理员账号**
   - 用户名: `admin`
   - 密码: `admin`
   - 权限: admin, user

2. **普通用户**
   - 用户名: `user`  
   - 密码: `user`
   - 权限: user

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - JavaScript 的超集
- **@ldesign/engine** - 应用引擎
- **@ldesign/router** - 路由系统
- **Vite** - 下一代前端构建工具

## 📝 开发规范

### 代码组织
- 使用 TypeScript 进行类型安全开发
- 采用 Composition API 编写组件
- 遵循单一职责原则，保持模块独立

### 命名规范
- 组件使用 PascalCase
- 文件名使用 camelCase
- 常量使用 UPPER_SNAKE_CASE

### 目录规范
- 相关功能放在同一目录下
- 公共模块放在对应的功能目录
- 保持目录结构扁平化

## 🔧 配置说明

### 应用配置 (app.config.ts)
- 应用基础信息
- API 配置
- 存储配置
- 主题配置
- 引擎配置

### 路由配置 (router.config.ts)
- 路由模式 (hash/history)
- 预加载策略
- 缓存配置
- 动画效果
- 错误处理

## 📦 构建部署

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 预览构建结果
```bash
npm run preview
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License