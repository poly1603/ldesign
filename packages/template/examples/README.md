# 🎨 LDesign 模板系统演示

欢迎来到 LDesign 模板系统的演示项目！这是一个全新的、功能丰富的演示应用，展示了模板系统的强大功能和易用性。

## ✨ 新功能亮点

### 🔧 完整的响应式支持

- ✅ **桌面端模板** - 经典、现代、默认三种风格
- ✅ **平板端模板** - 自适应、分屏两种布局
- ✅ **移动端模板** - 简洁、卡片两种设计
- ✅ **智能fallback机制** - 当目标设备没有模板时自动使用桌面版本

### 🎯 全新的演示结构

- 🏠 **首页** - 精美的介绍页面和功能导航
- 🪝 **Hook演示** - useTemplate Hook 的详细用法
- 🧩 **组件演示** - TemplateRenderer 组件的各种配置
- 📱 **设备演示** - 响应式设备切换的实时体验
- 🎨 **模板画廊** - 浏览所有可用模板的展示厅

## 🚀 快速开始

### 安装依赖

```bash
# 在项目根目录安装依赖
pnpm install

# 进入示例目录
cd examples

# 安装示例应用依赖
pnpm install
```

### 运行开发服务器

```bash
pnpm dev
```

应用将在显示的地址启动（通常是 `http://localhost:3005`）。

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 🎪 功能演示

### 1. 🪝 useTemplate Hook 演示

- 手动控制模板和设备切换
- 实时查看模板信息和配置
- 完整的代码示例展示

### 2. 🧩 TemplateRenderer 组件演示

- 基础用法演示
- 带选择器的高级用法
- 自动设备检测功能
- 自定义配置示例
- 实时事件日志

### 3. 📱 响应式设备切换演示

- 设备模拟器体验
- 实时窗口尺寸监控
- 自动/手动设备切换
- 模板适配效果预览

### 4. 🎨 模板画廊

- 按设备类型筛选模板
- 实时模板预览
- 详细的模板信息展示
- 交互式模板体验

## 📁 项目结构

```
src/
├── App.vue                 # 应用根组件
├── main.ts                 # 应用入口文件
├── router/
│   └── index.ts           # 路由配置
└── views/
    ├── Home.vue           # 首页 - 功能介绍和导航
    ├── HookDemo.vue       # Hook演示页面
    ├── ComponentDemo.vue  # 组件演示页面
    ├── DeviceDemo.vue     # 设备切换演示页面
    └── TemplateGallery.vue # 模板画廊页面
```

## 🛠️ 开发命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm preview` - 预览构建结果
- `pnpm type-check` - TypeScript 类型检查

## 📚 功能展示

### 🔐 用户认证系统

- **演示账号**：
  - 管理员：`admin@example.com` / `admin123`
  - 普通用户：`user@example.com` / `user123`

### 🎨 模板系统

- **布局模板**：
  - 公共布局（未登录用户）
  - 用户布局（已登录用户）
  - 管理员布局（管理员用户）

- **响应式设计**：
  - 自动检测设备类型
  - 桌面端、平板端、移动端适配
  - 手动设备切换功能

### ⚡ 性能优化

- **缓存机制**：
  - LRU 缓存算法
  - TTL 过期机制
  - 缓存统计和监控

- **预加载**：
  - 常用模板预加载
  - 主题切换预加载
  - 智能预测加载

### 🎯 示例页面

1. **基础示例** (`/examples/basic`)
   - 模板的基本使用方法
   - 组件、Composable、指令用法

2. **响应式示例** (`/examples/responsive`)
   - 多设备自动适配
   - 断点配置和自定义

3. **动态切换示例** (`/examples/dynamic`)
   - 运行时模板切换
   - 条件渲染和状态管理

4. **性能示例** (`/examples/performance`)
   - 缓存效果演示
   - 加载时间统计
   - 性能监控面板

## 🏗️ 项目结构

```
examples/
├── src/
│   ├── components/          # 通用组件
│   ├── views/              # 页面组件
│   │   ├── examples/       # 示例页面
│   │   └── admin/          # 管理员页面
│   ├── stores/             # Pinia 状态管理
│   │   ├── user.ts         # 用户状态
│   │   └── template.ts     # 模板状态
│   ├── router/             # Vue Router 配置
│   ├── templates/          # 模板文件
│   │   ├── layout/         # 布局模板
│   │   ├── auth/           # 认证模板
│   │   ├── dashboard/      # 仪表板模板
│   │   └── examples/       # 示例模板
│   ├── styles/             # 样式文件
│   │   ├── main.less       # 主样式
│   │   ├── variables.less  # 变量定义
│   │   ├── themes.less     # 主题样式
│   │   └── components.less # 组件样式
│   └── assets/             # 静态资源
├── public/                 # 公共文件
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 主题系统

应用支持三种主题模式：

- **浅色主题**：默认的浅色界面
- **深色主题**：深色界面，护眼模式
- **自动主题**：跟随系统设置自动切换

可以通过右上角的主题切换器进行切换。

## 📱 响应式设计

应用采用移动优先的响应式设计：

- **移动端** (< 768px)：单列布局，侧边栏折叠
- **平板端** (768px - 1024px)：双列布局，紧凑模式
- **桌面端** (> 1024px)：多列布局，完整功能

## 🔧 开发指南

### 添加新模板

1. 在 `src/templates/` 对应分类下创建模板文件
2. 创建 `index.vue` 模板组件
3. 创建 `config.ts` 配置文件
4. 模板会被自动扫描和注册

### 自定义样式

- 修改 `src/styles/variables.less` 调整设计变量
- 修改 `src/styles/themes.less` 自定义主题
- 在 `src/styles/components.less` 添加组件样式

### 状态管理

使用 Pinia 进行状态管理：

- `useUserStore`：用户认证和信息管理
- `useTemplateStore`：模板系统状态和性能监控

## 📖 API 使用示例

### 使用组件

```vue
<template>
  <LTemplateRenderer
    category="dashboard"
    template="user"
    :template-props="{ user: currentUser }"
  />
</template>
```

### 使用 Composable

```vue
<script setup>
import { useTemplate } from '@ldesign/template/vue'

const { render, loading, error } = useTemplate()

await render({
  category: 'auth',
  template: 'login'
})
</script>
```

### 使用指令

```vue
<template>
  <div v-template="{ category: 'greeting', template: 'welcome' }" />
</template>
```

## 🐛 问题反馈

如果在使用过程中遇到问题，请：

1. 查看浏览器控制台错误信息
2. 检查网络请求状态
3. 确认模板文件路径和配置
4. 提交 Issue 到 GitHub 仓库

## 📄 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件。
