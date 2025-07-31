# LDesign Template - 示例应用

这是一个完整的 Vue 3 示例应用，展示了 LDesign Template 的各种功能和用法。

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

应用将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

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
