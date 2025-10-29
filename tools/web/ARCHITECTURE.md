# LDesign Web UI 架构说明

## 架构设计

### 全局布局
所有页面统一使用 `Layout` 组件，包含：
- **侧边栏**: 可折叠导航菜单
- **顶部栏**: 页面标题、主题切换、通知
- **内容区**: 路由页面内容

### 路由结构

```
/                           - 仪表板
/projects                   - 项目列表
/projects/:id               - 项目详情 (父路由)
  ├── /                     - 概览
  ├── /builder              - 构建管理
  ├── /deployer             - 部署管理
  ├── /testing              - 测试管理
  ├── /git                  - Git 管理
  ├── /deps                 - 依赖管理
  ├── /formatter            - 代码格式化
  ├── /security             - 安全检查
  ├── /performance          - 性能分析
  ├── /monitor              - 项目监控
  ├── /changelog            - 变更日志
  ├── /docs                 - 文档生成
  ├── /publisher            - 发布管理
  └── /translator           - 国际化
/settings                   - 系统设置
```

## 功能模块

### 1. 项目管理 (`/projects`)
- 项目列表展示
- 导入项目
- 创建项目

### 2. 项目详情 (`/projects/:id`)
项目详情页包含顶部项目信息卡和水平导航菜单，所有功能作为子路由：

#### 2.1 概览 (`Overview.vue`)
- 项目基本信息
- 统计数据 (文件数、代码行数、依赖数量)

#### 2.2 构建 (`Builder.vue`)
- 查看构建历史
- 创建新构建
- 构建状态监控

#### 2.3 部署 (`Deployer.vue`)
- 多环境部署配置
- 部署历史记录
- 回滚操作

#### 2.4 测试 (`Testing.vue`)
- 运行单元测试
- 运行集成测试
- 运行 E2E 测试
- 查看测试覆盖率

#### 2.5 Git (`Git.vue`)
- 查看 Git 状态
- 提交变更
- 分支管理
- 推送/拉取

#### 2.6 依赖管理 (`Deps.vue`)
- 查看依赖列表
- 检查更新
- 安装/卸载依赖
- 依赖分析

#### 2.7 代码格式化 (`Formatter.vue`)
- 代码格式化
- 格式化配置
- 批量格式化

#### 2.8 安全检查 (`Security.vue`)
- 依赖漏洞扫描
- 代码安全检查
- 安全报告

#### 2.9 性能分析 (`Performance.vue`)
- 构建性能分析
- 运行时性能分析
- 性能报告

#### 2.10 监控 (`Monitor.vue`)
- 实时监控数据
- 性能指标
- 错误追踪

#### 2.11 变更日志 (`Changelog.vue`)
- 自动生成变更日志
- 版本管理
- 发布记录

#### 2.12 文档生成 (`Docs.vue`)
- API 文档生成
- 文档配置
- 文档预览

#### 2.13 发布管理 (`Publisher.vue`)
- npm 发布
- 版本管理
- 发布历史

#### 2.14 国际化 (`Translator.vue`)
- 语言管理
- 翻译管理
- 翻译导出/导入

## 图标系统

使用 `lucide-vue-next` 图标库，主要图标：

- `Home` - 仪表板
- `FolderOpen` - 项目管理
- `Settings` - 设置
- `Palette` - Logo
- `Sun/Moon` - 主题切换
- `Bell` - 通知
- `FileText` - 概览
- `Hammer` - 构建
- `Rocket` - 部署
- `TestTube` - 测试
- `GitBranch` - Git
- `Package` - 依赖
- `Sparkles` - 格式化
- `Shield` - 安全
- `Zap` - 性能
- `Activity` - 监控
- `BookOpen` - 文档/日志
- `Upload` - 发布
- `Languages` - 国际化

## 状态管理

### Theme Store
- 主题切换 (明/暗)

### Projects Store
- 项目列表
- 当前项目
- 项目操作

### Tools Store
- 工具列表
- 工具状态

## API 集成

### 项目 API
- `projectsApi.getAll()` - 获取所有项目
- `projectsApi.getById(id)` - 获取项目详情
- `projectsApi.import(path)` - 导入项目
- `projectsApi.create(options)` - 创建项目
- `projectsApi.getStats(id)` - 获取项目统计

### 构建 API
- `buildsApi.getAll({projectId})` - 获取构建列表
- `buildsApi.create(projectId)` - 创建构建
- `buildsApi.cancel(id)` - 取消构建

### 部署 API
- `deploymentsApi.getAll({projectId})` - 获取部署列表
- `deploymentsApi.create(data)` - 创建部署
- `deploymentsApi.rollback(id)` - 回滚部署

### 监控 API
- `monitorApi.getSystemMetrics()` - 获取系统指标
- `monitorApi.getProjectMetrics(id)` - 获取项目指标

## 样式设计

### 布局特点
- **响应式**: 适配不同屏幕尺寸
- **可折叠侧边栏**: 节省屏幕空间
- **水平导航**: 项目功能使用水平菜单导航
- **渐变效果**: 使用渐变色突出重要元素

### 颜色主题
- 主色调: `#667eea` (紫蓝色)
- 渐变: `135deg, #667eea 0%, #764ba2 100%`
- 明暗主题切换

### 动画效果
- 悬停抬起效果
- 淡入淡出过渡
- 平滑的主题切换

## 开发指南

### 添加新的项目功能页面

1. 在 `/src/views/project/` 创建新组件
2. 在路由配置中添加子路由
3. 在 `ProjectDetail.vue` 的 `menuOptions` 中添加菜单项
4. 选择合适的 Lucide 图标

### 页面组件模板

```vue
<template>
  <n-card title="功能名称">
    <n-space vertical size="large">
      <n-alert type="info">
        功能描述
      </n-alert>
      <n-space>
        <n-button type="primary">主要操作</n-button>
        <n-button>次要操作</n-button>
      </n-space>
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NSpace, NAlert, NButton } from 'naive-ui'
// 添加必要的 imports
</script>
```

## 最佳实践

1. **统一使用 Layout**: 所有页面都通过 App.vue 的 Layout 渲染
2. **Lucide 图标**: 统一使用 lucide-vue-next 图标库
3. **API 封装**: 所有 API 调用都通过 `/src/api/` 模块
4. **错误处理**: 使用 useMessage 显示错误信息
5. **加载状态**: 使用 loading 状态显示加载中
6. **类型安全**: 使用 TypeScript 确保类型安全

## 后续优化

1. 完善各个功能页面的具体实现
2. 添加实时 WebSocket 更新
3. 添加更多数据可视化
4. 优化移动端适配
5. 添加键盘快捷键
6. 添加搜索功能
7. 添加用户偏好设置
