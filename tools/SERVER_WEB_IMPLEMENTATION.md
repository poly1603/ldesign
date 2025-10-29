# Server和Web完整实现指南

## 当前状态

✅ **CLI** - 已完成并测试通过  
🔧 **Server** - 框架已创建,需要完善  
🔧 **Web** - 需要创建完整Vue3应用

## 📦 Server实现方案

### 已有文件
- ✅ `src/index.ts` - 主入口
- ✅ `src/app.ts` - Express应用
- ✅ `src/routes/` - API路由
- ✅ `src/middleware/` - 中间件
- ✅ `package.json` - 依赖配置

### 需要实现的API接口

#### 1. 项目管理 `/api/projects`
```typescript
GET    /api/projects           // 获取所有项目
GET    /api/projects/:id       // 获取项目详情
POST   /api/projects           // 创建项目
PUT    /api/projects/:id       // 更新项目
DELETE /api/projects/:id       // 删除项目
POST   /api/projects/:id/open  // 打开项目
```

#### 2. 工具管理 `/api/tools`
```typescript
GET    /api/tools                    // 获取所有工具
GET    /api/tools/:id/status         // 获取工具状态
POST   /api/tools/:id/execute        // 执行工具操作
```

#### 3. Builder `/api/builder`
```typescript
POST   /api/builder/build            // 构建项目
GET    /api/builder/status/:id       // 获取构建状态
GET    /api/builder/logs/:id         // 获取构建日志
```

#### 4. Deployer `/api/deployer`
```typescript
POST   /api/deployer/deploy          // 部署项目
GET    /api/deployer/status/:id      // 获取部署状态
GET    /api/deployer/history         // 获取部署历史
```

#### 5. Generator `/api/generator`
```typescript
POST   /api/generator/generate       // 生成代码
GET    /api/generator/templates      // 获取模板列表
```

#### 6. Testing `/api/testing`
```typescript
POST   /api/testing/run              // 运行测试
GET    /api/testing/results/:id      // 获取测试结果
GET    /api/testing/coverage/:id     // 获取覆盖率报告
```

#### 7. Git `/api/git`
```typescript
GET    /api/git/status               // Git状态
POST   /api/git/commit               // 提交代码
POST   /api/git/push                 // 推送代码
GET    /api/git/branches             // 获取分支列表
POST   /api/git/checkout             // 切换分支
```

#### 8. Security `/api/security`
```typescript
POST   /api/security/scan            // 安全扫描
GET    /api/security/vulnerabilities // 获取漏洞列表
```

#### 9. Monitor `/api/monitor`
```typescript
GET    /api/monitor/metrics          // 获取性能指标
GET    /api/monitor/health           // 健康检查
```

#### 10. Dependencies `/api/deps`
```typescript
GET    /api/deps/list                // 依赖列表
POST   /api/deps/update              // 更新依赖
POST   /api/deps/check               // 检查更新
```

### WebSocket事件
```typescript
// 客户端 -> 服务器
- tool:execute     // 执行工具
- build:start      // 开始构建
- test:run         // 运行测试

// 服务器 -> 客户端
- tool:progress    // 工具进度
- tool:log         // 工具日志
- tool:complete    // 工具完成
- build:progress   // 构建进度
- test:progress    // 测试进度
```

## 🎨 Web实现方案

### 技术栈
- **框架**: Vue 3 + TypeScript
- **构建**: Vite
- **UI库**: Naive UI
- **状态**: Pinia
- **路由**: Vue Router
- **HTTP**: Axios
- **WebSocket**: native WebSocket API

### 页面结构

```
src/
├── main.ts                    // 入口文件
├── App.vue                    // 根组件
├── layouts/
│   ├── DefaultLayout.vue      // 默认布局
│   └── EmptyLayout.vue        // 空布局
├── views/
│   ├── Dashboard.vue          // 仪表板
│   ├── Projects/
│   │   ├── ProjectList.vue    // 项目列表
│   │   ├── ProjectDetail.vue  // 项目详情
│   │   └── ProjectCreate.vue  // 创建项目
│   ├── Tools/
│   │   ├── ToolList.vue       // 工具列表
│   │   ├── Builder.vue        // 构建工具
│   │   ├── Deployer.vue       // 部署工具
│   │   ├── Generator.vue      // 生成器
│   │   ├── Testing.vue        // 测试工具
│   │   └── Git.vue            // Git工具
│   ├── Monitor/
│   │   ├── Performance.vue    // 性能监控
│   │   └── Logs.vue           // 日志查看
│   └── Settings/
│       ├── General.vue        // 通用设置
│       └── Tools.vue          // 工具配置
├── components/
│   ├── common/
│   │   ├── Header.vue         // 头部组件
│   │   ├── Sidebar.vue        // 侧边栏
│   │   ├── Footer.vue         // 底部
│   │   └── Loading.vue        // 加载组件
│   ├── project/
│   │   ├── ProjectCard.vue    // 项目卡片
│   │   └── ProjectStats.vue   // 项目统计
│   └── tool/
│       ├── ToolCard.vue       // 工具卡片
│       ├── ToolStatus.vue     // 工具状态
│       └── ToolExecutor.vue   // 工具执行器
├── router/
│   └── index.ts               // 路由配置
├── stores/
│   ├── app.ts                 // 应用状态
│   ├── project.ts             // 项目状态
│   ├── tool.ts                // 工具状态
│   └── ws.ts                  // WebSocket状态
├── api/
│   ├── request.ts             // Axios配置
│   ├── project.ts             // 项目API
│   ├── tool.ts                // 工具API
│   └── ws.ts                  // WebSocket客户端
├── types/
│   ├── project.ts             // 项目类型
│   ├── tool.ts                // 工具类型
│   └── api.ts                 // API类型
└── assets/
    ├── styles/
    │   └── main.css           // 全局样式
    └── icons/                 // 图标资源
```

### 核心页面设计

#### 1. Dashboard (仪表板)
- 项目概览卡片
- 最近使用的工具
- 实时统计数据
- 快速操作按钮

#### 2. Projects (项目管理)
- 项目列表(网格/列表视图)
- 项目搜索和过滤
- 项目创建向导
- 项目详情页(信息、统计、操作历史)

#### 3. Tools (工具页面)

**Builder工具**
- 构建配置表单
- 构建模式选择
- 实时构建日志
- 构建结果展示

**Deployer工具**
- 部署环境选择
- 部署配置
- 部署历史记录
- 回滚功能

**Generator工具**
- 模板选择
- 代码生成表单
- 预览生成结果
- 批量生成

**Testing工具**
- 测试用例列表
- 测试执行器
- 覆盖率报告
- 测试历史

**Git工具**
- 分支管理
- 提交历史
- 差异对比
- 操作按钮

#### 4. Monitor (监控)
- 性能图表
- 实时日志流
- 资源使用情况
- 告警信息

#### 5. Settings (设置)
- 通用配置
- 工具配置
- 主题设置
- 快捷键设置

### UI设计风格

#### 配色方案
```css
/* 主色调 */
--primary: #18a058;      /* Naive UI绿色 */
--info: #2080f0;
--success: #18a058;
--warning: #f0a020;
--error: #d03050;

/* 背景色 */
--bg-primary: #ffffff;
--bg-secondary: #f7f9fc;
--bg-tertiary: #eef2f6;

/* 文字色 */
--text-primary: #333333;
--text-secondary: #666666;
--text-tertiary: #999999;

/* 边框色 */
--border-color: #e0e0e6;
```

#### 组件风格
- 圆角: 6px
- 阴影: 0 2px 8px rgba(0, 0, 0, 0.1)
- 间距: 16px基准
- 响应式: 移动端友好

### 关键功能实现

#### 1. 实时通信 (WebSocket)
```typescript
// stores/ws.ts
export const useWebSocketStore = defineStore('websocket', () => {
  const ws = ref<WebSocket | null>(null)
  const connected = ref(false)
  
  function connect() {
    ws.value = new WebSocket('ws://localhost:3000')
    
    ws.value.onopen = () => {
      connected.value = true
    }
    
    ws.value.onmessage = (event) => {
      const data = JSON.parse(event.data)
      handleMessage(data)
    }
  }
  
  function send(message: any) {
    ws.value?.send(JSON.stringify(message))
  }
  
  return { connected, connect, send }
})
```

#### 2. API请求封装
```typescript
// api/request.ts
import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000
})

request.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

export default request
```

#### 3. 状态管理
```typescript
// stores/project.ts
export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  
  async function fetchProjects() {
    const data = await projectApi.getProjects()
    projects.value = data
  }
  
  return { projects, currentProject, fetchProjects }
})
```

## 🚀 实施步骤

### Phase 1: Server基础 (1-2天)
1. ✅ 创建Express应用
2. ✅ 实现基础路由
3. ⏳ 添加数据库支持(SQLite)
4. ⏳ 完善所有API接口
5. ⏳ 添加WebSocket支持
6. ⏳ 错误处理和日志

### Phase 2: Web基础 (2-3天)
1. ⏳ 创建Vite + Vue3项目
2. ⏳ 配置路由和状态管理
3. ⏳ 实现布局组件
4. ⏳ 创建Dashboard页面
5. ⏳ 实现API封装

### Phase 3: 核心功能 (3-4天)
1. ⏳ 项目管理功能
2. ⏳ 工具集成(Builder, Deployer等)
3. ⏳ 实时通信
4. ⏳ 监控和日志

### Phase 4: 优化和完善 (1-2天)
1. ⏳ UI优化和响应式
2. ⏳ 性能优化
3. ⏳ 错误处理
4. ⏳ 文档完善

## 📝 快速启动模板

### Server最小示例
```typescript
// server/src/app.ts
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})
```

### Web最小示例
```typescript
// web/src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(naive)
app.mount('#app')
```

## 🎯 下一步

1. 完善Server所有API接口
2. 创建Web完整应用
3. 集成到CLI的ui命令
4. 完整测试

---

**创建时间**: 2025-10-28  
**状态**: 规划完成,待实施  
**预计工时**: 7-11天
