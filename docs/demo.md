# 演示应用

体验 LDesign 的完整功能，查看实际运行效果。

## 🚀 在线演示

<div class="demo-links">
  <a href="/app" target="_blank" class="demo-link primary">
    <div class="demo-icon">🌐</div>
    <div class="demo-content">
      <h3>完整演示</h3>
      <p>体验所有功能的完整应用</p>
    </div>
  </a>

  <a href="/app/login" target="_blank" class="demo-link">
    <div class="demo-icon">🔐</div>
    <div class="demo-content">
      <h3>登录页面</h3>
      <p>查看登录界面设计</p>
    </div>
  </a>

  <a href="/app/dashboard" target="_blank" class="demo-link">
    <div class="demo-icon">📊</div>
    <div class="demo-content">
      <h3>仪表板</h3>
      <p>数据可视化界面</p>
    </div>
  </a>
</div>

## 📱 功能展示

### 主题切换

演示应用支持亮色和暗色主题的无缝切换：

- **亮色主题** - 清新简洁的白色主题
- **暗色主题** - 护眼的深色主题
- **自动切换** - 跟随系统主题设置

### 多语言支持

支持中文和英文界面：

- **中文** - 简体中文界面
- **English** - 英文界面
- **自动检测** - 根据浏览器语言自动选择

### 响应式设计

完美适配各种设备：

- **桌面端** - 完整的桌面体验
- **平板端** - 优化的平板界面
- **移动端** - 触屏友好的移动界面

### 路由功能

展示企业级路由管理：

- **权限控制** - 基于角色的访问控制
- **面包屑导航** - 自动生成导航路径
- **页面缓存** - 智能的页面缓存策略
- **路由动画** - 流畅的页面切换动画

## 🛠️ 技术栈

演示应用使用的技术栈：

- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全的 JavaScript
- **LDesign Router** - 企业级路由管理
- **LDesign Engine** - 核心引擎系统
- **Vite** - 快速的构建工具
- **Less** - CSS 预处理器

## 📦 项目结构

```
app/
├── src/
│   ├── components/          # 组件
│   │   ├── common/         # 通用组件
│   │   ├── layout/         # 布局组件
│   │   └── business/       # 业务组件
│   ├── views/              # 页面视图
│   │   ├── home/           # 首页
│   │   ├── login/          # 登录页
│   │   ├── dashboard/      # 仪表板
│   │   └── settings/       # 设置页
│   ├── router/             # 路由配置
│   ├── composables/        # 组合式函数
│   │   ├── useTheme.ts     # 主题管理
│   │   └── useI18n.ts      # 国际化
│   ├── utils/              # 工具函数
│   │   ├── format.ts       # 格式化工具
│   │   ├── validation.ts   # 验证工具
│   │   └── storage.ts      # 存储工具
│   ├── types/              # 类型定义
│   └── main.ts             # 入口文件
├── package.json
└── vite.config.ts
```

## 🎯 核心特性演示

### 1. 智能主题系统

```typescript
// 主题管理示例
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme, setTheme } = useTheme()

// 切换主题
toggleTheme()

// 设置特定主题
setTheme('dark')
```

### 2. 国际化支持

```typescript
// 多语言示例
import { useI18n } from '@/composables/useI18n'

const { locale, t, toggleLocale } = useI18n()

// 翻译文本
const title = t('home.title', 'LDesign Engine 演示')

// 切换语言
toggleLocale()
```

### 3. 响应式布局

```vue
<template>
  <div class="app-layout" :class="{ 'dark-theme': isDark }">
    <Header @toggle-theme="toggleTheme" />
    <div class="layout-content">
      <Sidebar v-if="showSidebar" />
      <main class="main-content">
        <slot />
      </main>
    </div>
  </div>
</template>
```

### 4. 路由配置

```typescript
// 路由配置示例
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/index.vue'),
    meta: {
      title: '首页',
      layout: 'default',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      layout: 'simple',
    },
  },
]
```

## 🔧 本地运行

如果您想在本地运行演示应用：

```bash
# 克隆项目
git clone https://github.com/poly1603/ldesign.git

# 进入项目目录
cd ldesign

# 安装依赖
pnpm install

# 启动演示应用
pnpm --filter @ldesign/app dev
```

演示应用将在 `http://localhost:3000` 启动。

## 📝 源码查看

演示应用的完整源码可以在 GitHub 上查看：

- [演示应用源码](https://github.com/poly1603/ldesign/tree/main/app)
- [组件源码](https://github.com/poly1603/ldesign/tree/main/app/src/components)
- [路由配置](https://github.com/poly1603/ldesign/tree/main/app/src/router)

## 💡 学习建议

1. **从简单开始** - 先查看基础的主题切换和多语言功能
2. **理解结构** - 观察项目的目录组织和文件结构
3. **查看源码** - 深入了解具体的实现细节
4. **动手实践** - 基于演示应用创建自己的项目

## 🤝 反馈建议

如果您在使用演示应用时遇到问题或有改进建议，欢迎：

- [提交 Issue](https://github.com/poly1603/ldesign/issues)
- [发起 Discussion](https://github.com/poly1603/ldesign/discussions)
- [贡献代码](https://github.com/poly1603/ldesign/pulls)

<style scoped>
.demo-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.demo-link {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  text-decoration: none;
  color: var(--vp-c-text-1);
  transition: all 0.2s;
}

.demo-link:hover {
  border-color: var(--vp-c-brand);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.demo-link.primary {
  background: linear-gradient(135deg, var(--vp-c-brand), var(--vp-c-brand-dark));
  color: white;
  border-color: var(--vp-c-brand);
}

.demo-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.demo-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.demo-content p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}
</style>
