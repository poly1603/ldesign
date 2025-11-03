# Web 项目重构实施方案

## 📋 概述

本文档详细说明 Web 项目的重构方案，聚焦于**项目管理**功能。

---

## 🎯 目标

1. **简化功能**: 移除示例/模拟数据，聚焦真实项目管理
2. **目录选择**: 实现系统原生目录选择器
3. **工具集成**: 将所有 tools 功能集成到项目详情页
4. **完整流程**: 导入 → 列表 → 详情 → 功能操作

---

## 🏗️ 架构设计

### 后端 API 设计

#### 1. 项目管理 API

```typescript
// 获取项目列表
GET /api/projects
Query: {
  limit?: number      // 每页数量，默认 100
  offset?: number     // 偏移量，默认 0
  keyword?: string    // 搜索关键词
}
Response: {
  success: true,
  data: Project[]
}

// 导入项目
POST /api/projects/import
Body: {
  path: string        // 项目路径
  detect?: boolean    // 是否自动检测，默认 true
}
Response: {
  success: true,
  data: Project
}

// 获取项目详情
GET /api/projects/:id
Response: {
  success: true,
  data: Project
}

// 更新项目
PUT /api/projects/:id
Body: Partial<Project>
Response: {
  success: true,
  data: Project
}

// 删除项目
DELETE /api/projects/:id
Response: {
  success: true,
  data: { id: string }
}

// 分析项目
POST /api/projects/:id/analyze
Response: {
  success: true,
  data: {
    type: string
    framework: string
    packageManager: string
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
    scripts: Record<string, string>
  }
}
```

#### 2. 目录选择器 API

```typescript
// 打开目录选择器
POST /api/files/select-directory
Body: {
  title?: string      // 对话框标题
  defaultPath?: string // 默认路径
}
Response: {
  success: true,
  data: {
    path: string      // 选择的目录路径
    canceled: boolean // 是否取消
  }
}
```

#### 3. 工具功能 API（示例：Builder）

```typescript
// 获取构建配置
GET /api/projects/:id/builder/config
Response: {
  success: true,
  data: BuilderConfig
}

// 更新构建配置
PUT /api/projects/:id/builder/config
Body: Partial<BuilderConfig>
Response: {
  success: true,
  data: BuilderConfig
}

// 执行构建
POST /api/projects/:id/builder/build
Body: {
  mode?: 'development' | 'production'
  watch?: boolean
}
Response: {
  success: true,
  data: {
    taskId: string    // 任务 ID
  }
}

// 获取构建日志
GET /api/projects/:id/builder/logs/:taskId
Response: {
  success: true,
  data: {
    logs: string[]
    status: 'pending' | 'running' | 'success' | 'failed'
  }
}
```

---

## 🎨 前端设计

### 页面结构

```
/                           # 仪表板
/projects                   # 项目列表
/projects/:id               # 项目详情（工具入口）
/projects/:id/builder       # Builder 功能页
/projects/:id/deployer      # Deployer 功能页
/projects/:id/testing       # Testing 功能页
/projects/:id/git           # Git 功能页
/projects/:id/deps          # Deps 功能页
/projects/:id/monitor       # Monitor 功能页
/projects/:id/generator     # Generator 功能页
/projects/:id/formatter     # Formatter 功能页
/projects/:id/docs          # Docs Generator 功能页
/projects/:id/changelog     # Changelog 功能页
/projects/:id/env           # Env 功能页
/projects/:id/performance   # Performance 功能页
/projects/:id/security      # Security 功能页
/projects/:id/publisher     # Publisher 功能页
/projects/:id/translator    # Translator 功能页
/projects/:id/mock          # Mock 功能页
/projects/:id/launcher      # Launcher 功能页
```

### 组件设计

```typescript
// 项目卡片
<ProjectCard
  :project="project"
  @click="goToDetail"
  @delete="deleteProject"
/>

// 工具卡片
<ToolCard
  :tool="tool"
  :project-id="projectId"
  @click="goToTool"
/>

// 目录选择器
<DirectoryPicker
  v-model="selectedPath"
  :title="选择项目目录"
  @select="handleSelect"
/>

// 项目信息面板
<ProjectInfo
  :project="project"
  @update="updateProject"
/>

// 工具功能容器
<ToolContainer
  :project-id="projectId"
  :tool-name="toolName"
>
  <slot />
</ToolContainer>
```

### API 封装

```typescript
// src/api/projects.ts
export const projectsApi = {
  // 获取项目列表
  getProjects(params?: { limit?: number; offset?: number; keyword?: string }) {
    return request.get('/api/projects', { params })
  },

  // 导入项目
  importProject(path: string, detect = true) {
    return request.post('/api/projects/import', { path, detect })
  },

  // 获取项目详情
  getProject(id: string) {
    return request.get(`/api/projects/${id}`)
  },

  // 更新项目
  updateProject(id: string, data: Partial<Project>) {
    return request.put(`/api/projects/${id}`, data)
  },

  // 删除项目
  deleteProject(id: string) {
    return request.delete(`/api/projects/${id}`)
  },

  // 分析项目
  analyzeProject(id: string) {
    return request.post(`/api/projects/${id}/analyze`)
  },
}

// src/api/files.ts
export const filesApi = {
  // 选择目录
  selectDirectory(title?: string, defaultPath?: string) {
    return request.post('/api/files/select-directory', { title, defaultPath })
  },
}

// src/api/builder.ts
export const builderApi = {
  // 获取构建配置
  getConfig(projectId: string) {
    return request.get(`/api/projects/${projectId}/builder/config`)
  },

  // 更新构建配置
  updateConfig(projectId: string, config: Partial<BuilderConfig>) {
    return request.put(`/api/projects/${projectId}/builder/config`, config)
  },

  // 执行构建
  build(projectId: string, options?: { mode?: string; watch?: boolean }) {
    return request.post(`/api/projects/${projectId}/builder/build`, options)
  },

  // 获取构建日志
  getLogs(projectId: string, taskId: string) {
    return request.get(`/api/projects/${projectId}/builder/logs/${taskId}`)
  },
}
```

---

## 🔧 实施步骤

### 阶段 1: 后端 API 实现

#### 1.1 目录选择器 API

```typescript
// tools/server/src/routes/files.ts

import { dialog } from 'electron' // 需要集成 Electron

// 选择目录
filesRouter.post('/select-directory', async (req, res) => {
  try {
    const { title = '选择项目目录', defaultPath } = req.body
    
    const result = await dialog.showOpenDialog({
      title,
      defaultPath,
      properties: ['openDirectory'],
    })
    
    return success(res, {
      path: result.filePaths[0] || '',
      canceled: result.canceled,
    })
  } catch (err: any) {
    return error(res, err.message, 'DIALOG_ERROR', 500)
  }
})
```

**注意**: 由于 Web 应用无法直接调用系统对话框，有以下几种方案：

**方案 A: Electron 集成**
- 将 Server 打包为 Electron 应用
- 使用 Electron 的 dialog API
- 优点：原生体验
- 缺点：需要 Electron 环境

**方案 B: 浏览器 File System Access API**
- 使用现代浏览器的 File System Access API
- 优点：无需 Electron
- 缺点：浏览器兼容性限制

**方案 C: 手动输入路径**
- 提供输入框让用户输入路径
- 提供路径验证
- 优点：简单可靠
- 缺点：用户体验较差

**推荐方案**: 先实现方案 C（手动输入），后续可选择性添加方案 A 或 B。

#### 1.2 项目分析 API

```typescript
// tools/server/src/routes/projects.ts

import { readFile } from 'fs/promises'
import { join } from 'path'

// 分析项目
projectsRouter.post('/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params
    const project = db.getDb().prepare('SELECT * FROM projects WHERE id = ?').get(id) as any
    
    if (!project) {
      return error(res, '项目不存在', 'NOT_FOUND', 404)
    }
    
    // 读取 package.json
    const packageJsonPath = join(project.path, 'package.json')
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'))
    
    const analysis = {
      type: detectProjectType(project.path),
      framework: detectFramework(project.path),
      packageManager: detectPackageManager(project.path),
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {},
      scripts: packageJson.scripts || {},
    }
    
    return success(res, analysis)
  } catch (err: any) {
    return error(res, err.message, 'ANALYZE_ERROR', 500)
  }
})
```

### 阶段 2: 前端页面重构

#### 2.1 项目列表页 (Projects.vue)

```vue
<template>
  <div class="projects-page">
    <div class="header">
      <h1>项目管理</h1>
      <n-button type="primary" @click="showImportDialog = true">
        <template #icon>
          <n-icon><AddIcon /></n-icon>
        </template>
        导入项目
      </n-button>
    </div>

    <div class="search-bar">
      <n-input
        v-model:value="keyword"
        placeholder="搜索项目..."
        @input="handleSearch"
      >
        <template #prefix>
          <n-icon><SearchIcon /></n-icon>
        </template>
      </n-input>
    </div>

    <div class="projects-grid">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
        @click="goToDetail(project.id)"
        @delete="handleDelete(project.id)"
      />
    </div>

    <!-- 导入项目对话框 -->
    <n-modal v-model:show="showImportDialog">
      <n-card title="导入项目" style="width: 600px">
        <n-form>
          <n-form-item label="项目路径">
            <n-input
              v-model:value="importPath"
              placeholder="请输入项目路径"
            />
          </n-form-item>
          <n-form-item label="自动检测">
            <n-switch v-model:value="autoDetect" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-space justify="end">
            <n-button @click="showImportDialog = false">取消</n-button>
            <n-button type="primary" @click="handleImport">导入</n-button>
          </n-space>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { projectsApi } from '@/api/projects'
import ProjectCard from '@/components/ProjectCard.vue'

const router = useRouter()
const projects = ref([])
const keyword = ref('')
const showImportDialog = ref(false)
const importPath = ref('')
const autoDetect = ref(true)

const loadProjects = async () => {
  const res = await projectsApi.getProjects({ keyword: keyword.value })
  projects.value = res.data
}

const handleImport = async () => {
  await projectsApi.importProject(importPath.value, autoDetect.value)
  showImportDialog.value = false
  importPath.value = ''
  await loadProjects()
}

const handleDelete = async (id: string) => {
  await projectsApi.deleteProject(id)
  await loadProjects()
}

const goToDetail = (id: string) => {
  router.push(`/projects/${id}`)
}

onMounted(loadProjects)
</script>
```

#### 2.2 项目详情页 (ProjectDetail.vue)

```vue
<template>
  <div class="project-detail-page">
    <div class="header">
      <n-button text @click="$router.back()">
        <template #icon>
          <n-icon><BackIcon /></n-icon>
        </template>
        返回
      </n-button>
      <h1>{{ project?.name }}</h1>
    </div>

    <ProjectInfo :project="project" @update="loadProject" />

    <div class="tools-section">
      <h2>工具功能</h2>
      <div class="tools-grid">
        <ToolCard
          v-for="tool in tools"
          :key="tool.name"
          :tool="tool"
          :project-id="projectId"
          @click="goToTool(tool.name)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { projectsApi } from '@/api/projects'
import ProjectInfo from '@/components/ProjectInfo.vue'
import ToolCard from '@/components/ToolCard.vue'

const route = useRoute()
const router = useRouter()
const projectId = route.params.id as string
const project = ref(null)

const tools = [
  { name: 'builder', label: '构建', icon: 'BuildIcon', description: '项目构建工具' },
  { name: 'deployer', label: '部署', icon: 'DeployIcon', description: '部署工具' },
  { name: 'testing', label: '测试', icon: 'TestIcon', description: '测试工具' },
  { name: 'git', label: 'Git', icon: 'GitIcon', description: 'Git 操作' },
  { name: 'deps', label: '依赖', icon: 'DepsIcon', description: '依赖分析' },
  { name: 'monitor', label: '监控', icon: 'MonitorIcon', description: '监控工具' },
  // ... 更多工具
]

const loadProject = async () => {
  const res = await projectsApi.getProject(projectId)
  project.value = res.data
}

const goToTool = (toolName: string) => {
  router.push(`/projects/${projectId}/${toolName}`)
}

onMounted(loadProject)
</script>
```

---

## 📝 总结

### 已完成
- ✅ 问题 1: 添加 API 文档功能（Swagger）
- ✅ 分析 tools 目录功能
- ✅ 设计项目管理 API
- ✅ 设计前端页面结构

### 待实施
- ⏳ 实现目录选择器 API
- ⏳ 实现项目分析 API
- ⏳ 重构前端项目列表页
- ⏳ 重构前端项目详情页
- ⏳ 集成各个工具功能页面

### 建议
1. **目录选择器**: 先实现手动输入方案，后续可选择性添加 Electron 或 File System Access API
2. **分阶段实施**: 先实现核心功能（P0），再逐步添加其他工具集成
3. **API 优先**: 先完成后端 API，再实现前端页面
4. **测试驱动**: 每个功能完成后进行测试验证

---

## 🎯 下一步

1. 实现目录选择器 API（手动输入方案）
2. 实现项目分析 API
3. 重构前端项目列表页
4. 重构前端项目详情页
5. 集成 Builder 功能页（作为示例）
6. 逐步集成其他工具功能页

