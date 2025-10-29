# @ldesign/web

LDesign Web 管理界面 - 现代化的项目管理系统，基于 Vue 3 + Vite + Naive UI。

## 功能特性

### 🎨 界面功能
- **仪表板** - 项目统计、快速操作
- **项目管理** - 导入、创建、查看、编辑项目
- **工具总览** - 查看所有工具状态
- **构建管理** - 构建任务列表和详情
- **部署管理** - 部署记录和回滚操作
- **系统监控** - 实时系统资源监控
- **主题切换** - 明暗主题切换
- **WebSocket** - 实时数据更新

### 🔧 技术栈
- **Vue 3** - 渐进式框架
- **Vite** - 快速构建工具
- **Naive UI** - 现代化 UI 组件库
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Axios** - HTTP 客户端
- **TypeScript** - 类型安全

## 安装

```bash
pnpm install
```

## 开发

```bash
# 启动开发服务器
pnpm dev

# 类型检查 + 构建
pnpm build:check

# 仅构建
pnpm build

# 预览构建结果
pnpm preview
```

## 项目结构

```
src/
├── api/                    # API 客户端
│   ├── client.ts          # Axios 实例
│   ├── projects.ts        # 项目 API
│   ├── tools.ts           # 工具 API
│   ├── builds.ts          # 构建 API
│   ├── deployments.ts     # 部署 API
│   └── monitor.ts         # 监控 API
├── components/            # 组件
│   └── Layout.vue         # 全局布局
├── views/                 # 页面
│   ├── Dashboard.vue      # 仪表板
│   ├── Projects.vue       # 项目列表
│   ├── ProjectDetail.vue  # 项目详情
│   ├── Tools.vue          # 工具总览
│   ├── Builds.vue         # 构建管理
│   ├── Deployments.vue    # 部署管理
│   ├── Monitor.vue        # 系统监控
│   └── Settings.vue       # 设置
├── store/                 # 状态管理
│   ├── theme.ts          # 主题状态
│   ├── projects.ts       # 项目状态
│   └── tools.ts          # 工具状态
├── router/               # 路由配置
│   └── index.ts
├── config/               # 配置
│   └── env.ts           # 环境变量
├── composables/          # 组合式函数
│   └── useWebSocket.ts  # WebSocket 封装
├── App.vue              # 根组件
└── main.ts              # 入口文件
```

## 配置

### API 地址

默认通过 Vite 代理连接后端：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      }
    }
  }
})
```

### 环境变量

```typescript
// src/config/env.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
export const API_TIMEOUT = 10000
export const DEBUG = import.meta.env.DEV
```

## 页面功能

### 仪表板

- 项目统计（项目数量、构建次数、部署次数、活跃工具）
- 快速操作卡片（导入项目、创建项目、工具管理）
- 动画效果和现代化设计

### 项目管理

- 项目列表展示
- 导入现有项目（自动检测框架和包管理器）
- 创建新项目
- 项目详情查看
- 项目统计信息

### 构建管理

- 构建任务列表
- 构建状态实时更新
- 取消正在运行的构建
- 查看构建详情和日志

### 部署管理

- 部署记录列表
- 支持多环境部署（开发、测试、生产）
- 部署回滚功能
- 部署状态追踪

### 系统监控

- CPU 使用率实时监控
- 内存使用率实时监控
- 磁盘使用率监控
- 网络流量监控
- 自动刷新开关

## UI 设计

### 主题

- **明亮主题** - 适合白天使用
- **暗黑主题** - 适合夜间使用
- 一键切换

### 布局

- **侧边栏** - 可折叠导航菜单
- **顶部栏** - 页面标题、主题切换、通知
- **内容区** - 页面主体内容

### 交互

- **悬停效果** - 卡片悬停时抬起和阴影
- **渐变色** - Logo 和选中菜单项的渐变效果
- **动画** - 页面淡入动画
- **响应式** - 适配不同屏幕尺寸

## API 使用

### 项目 API

```typescript
import { projectsApi } from '@/api/projects'

// 获取所有项目
const projects = await projectsApi.getAll()

// 导入项目
const project = await projectsApi.import('/path/to/project', true)

// 创建项目
const newProject = await projectsApi.create({
  name: 'my-app',
  path: '/workspace',
  framework: 'vue'
})
```

### 构建 API

```typescript
import { buildsApi } from '@/api/builds'

// 获取构建列表
const builds = await buildsApi.getAll({ projectId: 'xxx' })

// 创建构建
const build = await buildsApi.create('project-id')

// 取消构建
await buildsApi.cancel('build-id')
```

### 监控 API

```typescript
import { monitorApi } from '@/api/monitor'

// 获取系统指标
const metrics = await monitorApi.getSystemMetrics()

// 获取项目指标
const projectMetrics = await monitorApi.getProjectMetrics('project-id')
```

## 状态管理

### 主题状态

```typescript
import { useThemeStore } from '@/store/theme'

const themeStore = useThemeStore()

// 切换主题
themeStore.toggle()

// 设置暗黑主题
themeStore.setDark(true)
```

### 项目状态

```typescript
import { useProjectsStore } from '@/store/projects'

const projectsStore = useProjectsStore()

// 加载项目
await projectsStore.fetchProjects()

// 导入项目
await projectsStore.importProject('/path')
```

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## License

MIT
