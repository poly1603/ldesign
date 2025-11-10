# LDesign Tools 快速开始指南

## 📋 目录

- [安装和启动](#安装和启动)
- [使用新增组件](#使用新增组件)
- [API 使用示例](#api-使用示例)
- [常见问题](#常见问题)

## 🚀 安装和启动

### 后端启动

```bash
cd server

# 安装依赖
pnpm install

# 开发模式（支持热重载）
pnpm dev

# 生产模式
pnpm build
pnpm start:prod

# 使用 PM2 管理
pnpm start:pm2:prod
```

服务将运行在 `http://localhost:3000`

API 文档：`http://localhost:3000/api-docs`

### 前端启动

```bash
cd web

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 生产构建
pnpm build
```

前端将运行在 `http://localhost:8888`

## 🎨 使用新增组件

### 1. LoadingSpinner 组件

通用加载指示器，支持多种尺寸和模式。

```vue
<template>
  <div>
    <!-- 基础用法 -->
    <LoadingSpinner text="加载中..." />

    <!-- 小尺寸 -->
    <LoadingSpinner size="small" />

    <!-- 全屏加载 -->
    <LoadingSpinner 
      v-if="loading" 
      text="正在加载数据..." 
      fullscreen 
      overlay 
    />
  </div>
</template>

<script setup lang="ts">
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { ref } from 'vue'

const loading = ref(false)

async function loadData() {
  loading.value = true
  try {
    // 加载数据...
    await fetchData()
  } finally {
    loading.value = false
  }
}
</script>
```

**Props:**
- `text?: string` - 加载文本
- `size?: 'small' | 'medium' | 'large'` - 大小
- `fullscreen?: boolean` - 全屏模式
- `overlay?: boolean` - 显示遮罩层

### 2. ErrorMessage 组件

通用错误提示组件，支持多种错误类型。

```vue
<template>
  <div>
    <!-- 基础错误提示 -->
    <ErrorMessage
      v-model="showError"
      type="error"
      message="操作失败，请重试"
      dismissible
    />

    <!-- 带详细信息的警告 -->
    <ErrorMessage
      v-model="showWarning"
      type="warning"
      title="警告"
      message="某些配置可能不正确"
      :details="warningDetails"
      dismissible
    />

    <!-- 带重试功能的错误 -->
    <ErrorMessage
      v-model="showRetryError"
      type="error"
      title="加载失败"
      message="无法连接到服务器"
      retry
      @retry="handleRetry"
    />
  </div>
</template>

<script setup lang="ts">
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import { ref } from 'vue'

const showError = ref(true)
const showWarning = ref(false)
const showRetryError = ref(false)
const warningDetails = ref('配置文件中的某些字段缺失')

function handleRetry() {
  console.log('重试中...')
  // 执行重试逻辑
}
</script>
```

**Props:**
- `modelValue: boolean` - 是否显示（支持 v-model）
- `type?: 'error' | 'warning' | 'info'` - 错误类型
- `title?: string` - 标题
- `message: string` - 错误消息
- `details?: string` - 详细信息
- `dismissible?: boolean` - 是否可关闭
- `retry?: boolean` - 是否显示重试按钮

**Events:**
- `update:modelValue` - 更新显示状态
- `retry` - 点击重试按钮

### 3. ProjectsStore 使用

状态管理 Store，提供项目数据管理和缓存。

```vue
<template>
  <div>
    <!-- 显示项目列表 -->
    <div v-if="projectsStore.loading">
      <LoadingSpinner text="加载项目..." />
    </div>

    <ErrorMessage
      v-model="showError"
      v-if="projectsStore.error"
      type="error"
      :message="projectsStore.error"
      retry
      @retry="loadProjects"
    />

    <div v-else>
      <h2>项目总数: {{ projectsStore.projectCount }}</h2>
      
      <h3>最近打开的项目</h3>
      <ul>
        <li v-for="project in projectsStore.recentProjects" :key="project.id">
          {{ project.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useProjectsStore } from '@/stores/projects'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const projectsStore = useProjectsStore()
const showError = ref(false)

async function loadProjects() {
  try {
    await projectsStore.fetchProjects()
    showError.value = false
  } catch (error) {
    showError.value = true
  }
}

onMounted(() => {
  loadProjects()
})
</script>
```

**Store API:**

```typescript
// 获取项目列表（带缓存）
await projectsStore.fetchProjects({
  search: '关键词',
  category: 'project',
  sortBy: 'lastOpenedAt',
  sortOrder: 'DESC'
})

// 强制刷新（忽略缓存）
await projectsStore.fetchProjects({}, true)

// 获取单个项目
const project = await projectsStore.getProject('project-id')

// 创建项目
const newProject = await projectsStore.createProject({
  name: 'My Project',
  path: 'C:\\Projects\\my-project',
  type: 'web',
  framework: 'vue3'
})

// 更新项目（乐观更新）
await projectsStore.updateProject('project-id', {
  name: 'New Name',
  description: 'Updated description'
})

// 删除项目（乐观更新）
await projectsStore.deleteProject('project-id')

// 导入项目
await projectsStore.importProject({
  path: 'C:\\Projects\\existing-project'
})

// 打开项目（更新最后打开时间）
await projectsStore.openProject('project-id')

// 清除错误
projectsStore.clearError()

// 清除缓存
projectsStore.clearCache()
```

**Getters:**
- `projectCount` - 项目总数
- `recentProjects` - 最近打开的项目（最多10个）
- `projectsByCategory` - 按类别分组的项目

## 📡 API 使用示例

### 1. 后端 API 错误追踪

所有 API 响应现在都包含请求追踪信息：

```json
{
  "success": false,
  "message": "项目不存在",
  "timestamp": "2025-11-10T02:45:37.123Z",
  "requestId": "req-1731209137123-abc123",
  "path": "/api/projects/invalid-id"
}
```

在前端可以使用 `requestId` 进行问题追踪：

```typescript
try {
  await projectApi.getOne('invalid-id')
} catch (error: any) {
  // 获取请求 ID 用于日志记录
  const requestId = error.response?.headers['x-request-id']
  console.error(`请求失败 [${requestId}]:`, error.message)
  
  // 报告给后端或分析系统
  reportError({
    requestId,
    error: error.message,
    timestamp: Date.now()
  })
}
```

### 2. 使用改进的项目查询

利用数据库索引优化，查询速度显著提升：

```typescript
// 按名称搜索（使用 idx_project_name 索引）
const projects = await projectApi.getAll({
  search: 'vue',
  sortBy: 'name',
  sortOrder: 'ASC'
})

// 按类型和类别筛选（使用 idx_project_type_category 复合索引）
const webProjects = await projectApi.getAll({
  type: 'web',
  category: 'project',
  sortBy: 'updatedAt',
  sortOrder: 'DESC'
})

// 按框架筛选（使用 idx_project_framework 索引）
const vueProjects = await projectApi.getAll({
  framework: 'vue3',
  sortBy: 'lastOpenedAt',
  sortOrder: 'DESC'
})
```

### 3. 完整的错误处理示例

```vue
<template>
  <div>
    <LoadingSpinner v-if="loading" fullscreen overlay text="正在处理..." />
    
    <ErrorMessage
      v-model="showError"
      :type="errorType"
      :title="errorTitle"
      :message="errorMessage"
      :details="errorDetails"
      :retry="canRetry"
      dismissible
      @retry="handleRetry"
    />

    <!-- 你的内容 -->
    <div v-if="!loading && !showError">
      <!-- ... -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { projectApi } from '@/api/services'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const loading = ref(false)
const showError = ref(false)
const errorType = ref<'error' | 'warning' | 'info'>('error')
const errorTitle = ref('')
const errorMessage = ref('')
const errorDetails = ref('')
const canRetry = ref(false)

async function executeAction() {
  loading.value = true
  showError.value = false

  try {
    await projectApi.create({
      name: 'Test Project',
      path: 'C:\\Projects\\test'
    })
    
    // 成功处理
    console.log('项目创建成功')
  } catch (error: any) {
    // 错误处理
    showError.value = true
    errorType.value = 'error'
    errorTitle.value = '创建失败'
    errorMessage.value = error.message || '未知错误'
    
    // 如果有详细信息
    if (error.response?.data?.details) {
      errorDetails.value = JSON.stringify(error.response.data.details, null, 2)
    }
    
    // 网络错误可以重试
    canRetry.value = error.code === 'NETWORK_ERROR'
    
    console.error('操作失败:', error)
  } finally {
    loading.value = false
  }
}

function handleRetry() {
  executeAction()
}
</script>
```

## ❓ 常见问题

### Q1: 如何清除项目缓存？

```typescript
import { useProjectsStore } from '@/stores/projects'

const projectsStore = useProjectsStore()

// 清除缓存并重新加载
projectsStore.clearCache()
await projectsStore.fetchProjects()
```

### Q2: 如何追踪 API 错误？

所有 API 响应都包含 `X-Request-ID` 头，可以在开发者工具的 Network 标签中查看。

```typescript
// 在拦截器中自动记录
axios.interceptors.response.use(
  response => response,
  error => {
    const requestId = error.response?.headers['x-request-id']
    console.error(`API Error [${requestId}]:`, error.message)
    return Promise.reject(error)
  }
)
```

### Q3: 如何优化大列表性能？

使用虚拟滚动（待实现）或分页加载：

```typescript
// 当前使用缓存策略
const projectsStore = useProjectsStore()

// 首次加载（使用缓存）
await projectsStore.fetchProjects()

// 5分钟后自动失效，下次请求会重新获取
```

### Q4: 如何处理并发请求？

使用 Store 可以避免重复请求：

```typescript
const projectsStore = useProjectsStore()

// 多个组件同时调用，只会发起一次请求
Promise.all([
  projectsStore.fetchProjects(),
  projectsStore.fetchProjects(),
  projectsStore.fetchProjects()
])
// 实际只执行一次 API 请求（缓存生效）
```

### Q5: 数据库性能优化后如何验证？

查看服务器日志中的查询时间：

```
[LoggingInterceptor] GET /api/projects 200 - 15ms
```

优化后的查询时间应该明显减少（从 80ms 降至 30ms 左右）。

## 🔗 相关链接

- [完整优化总结](./OPTIMIZATION_SUMMARY.md)
- [API 文档](http://localhost:3000/api-docs)
- [NestJS 官方文档](https://docs.nestjs.com/)
- [Vue 3 官方文档](https://vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/)

## 📝 更新日志

### 2025-11-10
- ✅ 添加数据库索引优化
- ✅ 实现请求追踪（Request ID）
- ✅ 创建通用 UI 组件
- ✅ 实现项目状态管理 Store
- ✅ 添加乐观更新和错误回滚

---

**需要帮助？** 请查看 [OPTIMIZATION_SUMMARY.md](./OPTIMIZATION_SUMMARY.md) 获取更多信息。
