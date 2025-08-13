# @ldesign/router 示例应用

这是一个完整的示例应用，演示了 @ldesign/router 的所有核心功能和特性。

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm run dev
```

应用将在 http://localhost:3000 启动。

### 构建生产版本

```bash
pnpm run build
```

## 📋 功能演示

### 🏠 首页

- 项目介绍和特性展示
- 功能导航和统计信息
- 响应式设计演示

### 📝 基础路由

- 路由信息展示
- 编程式导航
- 路由监听和历史记录
- 组合式 API 使用演示

### 🏗️ 嵌套路由

- 多层级路由结构
- 子路由导航
- 路由深度信息
- 面包屑导航

### 🔄 动态路由

- 路径参数处理
- 查询参数管理
- 参数验证和监听
- 参数变化历史

### 🛡️ 路由守卫

- 权限验证演示
- 认证检查功能
- 标题和加载守卫
- 守卫组合使用

### ⚡ 懒加载

- 组件懒加载演示
- 加载状态管理
- 性能统计展示
- 动态组件创建

### 🔌 插件系统

- 动画插件演示
- 缓存插件功能
- 预加载插件展示
- 性能监控插件

## 🛠️ 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的构建工具
- **Less** - CSS 预处理器
- **@ldesign/router** - 现代化路由库

## 📁 项目结构

```
example/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 公共组件
│   ├── views/             # 页面组件
│   │   ├── Home.vue       # 首页
│   │   ├── BasicRouting.vue    # 基础路由演示
│   │   ├── NestedRouting.vue   # 嵌套路由演示
│   │   ├── DynamicRouting.vue  # 动态路由演示
│   │   ├── RouteGuards.vue     # 路由守卫演示
│   │   ├── LazyLoading.vue     # 懒加载演示
│   │   ├── PluginDemo.vue      # 插件演示
│   │   ├── Login.vue           # 登录页面
│   │   ├── NotFound.vue        # 404页面
│   │   └── nested/             # 嵌套路由子组件
│   ├── router/            # 路由配置
│   │   └── routes.ts      # 路由定义
│   ├── styles/            # 样式文件
│   │   ├── main.less      # 主样式
│   │   └── variables.less # 样式变量
│   ├── utils/             # 工具函数
│   ├── App.vue            # 根组件
│   └── main.ts            # 应用入口
├── tests/                 # 测试文件
│   ├── unit/              # 单元测试
│   └── e2e/               # 端到端测试
├── package.json           # 项目配置
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
└── README.md              # 项目说明
```

## 🎨 设计特色

### 响应式设计

- 移动端优先的设计理念
- 灵活的网格布局系统
- 自适应的组件尺寸

### 现代化 UI

- 渐变色彩搭配
- 流畅的动画效果
- 直观的交互反馈

### 可访问性

- 语义化的 HTML 结构
- 键盘导航支持
- 屏幕阅读器友好

## 🧪 测试

### 运行单元测试

```bash
pnpm run test
```

### 运行端到端测试

```bash
pnpm run test:e2e
```

### 查看测试覆盖率

```bash
pnpm run test:coverage
```

## 📊 性能优化

- **代码分割**: 路由级别的懒加载
- **资源优化**: 图片和字体优化
- **缓存策略**: 智能的组件缓存
- **预加载**: 鼠标悬停预加载

## 🔧 开发工具

- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 类型检查
- **Vite**: 快速热重载

## 📝 使用说明

1. **导航**: 使用顶部导航栏切换不同的演示页面
2. **交互**: 每个页面都有丰富的交互元素可以体验
3. **监控**: 点击右下角的"性能监控"按钮查看性能数据
4. **响应式**: 调整浏览器窗口大小查看响应式效果

## 🐛 已知问题

- 部分路由守卫功能需要 router 包的类型修复
- 某些插件功能为演示版本，非完整实现
- 性能监控数据为模拟数据

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个示例应用！

## 📄 许可证

MIT License
