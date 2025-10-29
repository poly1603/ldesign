# LDesign 工具集功能特性

> 最后更新: 2025-10-28

## 🎯 系统架构

### 前端 (Web)
- **框架**: Vue 3.5+ (Composition API + TypeScript)
- **UI库**: Naive UI 2.43+
- **构建**: Vite 5.4+
- **状态管理**: Pinia 2.1+
- **路由**: Vue Router 4.2+
- **图标**: Lucide Vue Next
- **HTTP**: Axios

### 后端 (Server)
- **框架**: Express 4.21+
- **数据库**: Better-SQLite3 11.10+
- **WebSocket**: WS 8.18+
- **语言**: TypeScript 5.7+
- **构建**: tsup 8.0+

## 📦 核心功能模块

### 1. Dashboard 仪表板 ✅

**路径**: `/`

**功能**:
- 系统统计概览（项目数、构建次数、部署次数、活跃工具）
- 快速操作卡片
  - 导入项目
  - 创建项目
  - 工具管理
  - 任务中心
  - 性能监控
  - 系统设置
- 响应式布局
- 卡片悬浮效果

### 2. 项目管理 ✅

**路径**: `/projects`

**前端功能**:
- 项目列表展示（卡片/列表视图）
- 项目搜索和筛选
- 项目创建/导入
- 项目详情查看
- 项目编辑/删除
- 项目统计信息

**后端API**:
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/:id` - 获取项目详情
- `POST /api/projects/import` - 导入项目
- `POST /api/projects/create` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目
- `POST /api/projects/:id/open` - 打开项目
- `GET /api/projects/:id/stats` - 项目统计

**数据结构**:
```typescript
interface Project {
  id: string
  name: string
  path: string
  type: 'web' | 'api' | 'library'
  framework?: string
  packageManager?: string
  description?: string
  config?: any
  createdAt: number
  updatedAt: number
  lastOpenedAt?: number
}
```

### 3. 任务中心 ✅

**路径**: `/tasks`

**前端功能**:
- 任务列表实时展示
- 任务状态筛选（全部/等待/运行/完成/失败/取消）
- 任务进度实时更新
- 创建新任务
- 取消任务
- 删除任务
- 任务详情查看（包含日志）
- 自动刷新（每5秒）
- 统计信息（总任务/运行中/已完成/失败）

**后端功能**:
- 任务队列管理系统
- 最大并发控制（默认3个）
- 任务状态跟踪
- 任务日志记录
- 内置任务执行器
  - build: 构建任务
  - test: 测试任务
  - deploy: 部署任务

**后端API**:
- `GET /api/tasks` - 获取任务列表
- `GET /api/tasks/:id` - 获取任务详情
- `POST /api/tasks` - 创建任务
- `POST /api/tasks/:id/cancel` - 取消任务
- `DELETE /api/tasks/:id` - 删除任务
- `POST /api/tasks/cleanup` - 清理过期任务

**数据结构**:
```typescript
interface Task {
  id: string
  type: string
  projectId?: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress: number
  message: string
  error?: string
  result?: any
  createdAt: number
  startedAt?: number
  completedAt?: number
  logs: TaskLog[]
}

interface TaskLog {
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
  timestamp: number
}
```

### 4. 性能监控 ✅

**路径**: `/performance`

**前端功能**:
- 实时系统性能展示
  - CPU使用率
  - 内存使用率
  - 磁盘使用率
  - 系统运行时间
- 历史数据图表（SVG绘制）
  - CPU使用率历史
  - 内存使用历史
- 进程信息表格
- 网络统计
  - 上传/下载速度
  - 总上传/下载量
- 请求统计
  - 总请求数
  - 成功/失败请求
  - 平均响应时间
- 自动刷新（每3秒）
- 颜色编码（低/中/高使用率）

**后端API**:
- `GET /api/monitor/system` - 系统信息
- `GET /api/monitor/cpu` - CPU使用率
- `GET /api/monitor/memory` - 内存使用

### 5. 文件管理 ✅

**后端API**:
- `GET /api/files/tree?path=&depth=` - 获取文件树
- `GET /api/files/read?path=` - 读取文件内容
- `POST /api/files/write` - 写入文件
- `POST /api/files/create` - 创建文件/目录
- `DELETE /api/files/delete?path=` - 删除文件/目录

**功能特性**:
- 递归文件树构建
- 自动忽略常见目录（node_modules, .git等）
- 文件大小限制（5MB）
- 支持目录和文件操作
- 安全路径检查

### 6. 依赖分析 ✅

**后端API**:
- `GET /api/dependencies/:projectId` - 获取项目依赖
- `GET /api/dependencies/:projectId/updates` - 检查依赖更新
- `GET /api/dependencies/:projectId/tree` - 依赖树分析

**功能特性**:
- 读取package.json
- 依赖分类（dependencies, devDependencies, peerDependencies）
- 版本对比（当前/期望/最新）
- 依赖树可视化

### 7. 构建管理 ✅

**后端API**:
- `GET /api/builds` - 获取构建记录
- `POST /api/builds/:projectId/start` - 开始构建
- `DELETE /api/builds/:id` - 删除构建记录

### 8. 部署管理 ✅

**后端API**:
- `GET /api/deployments` - 获取部署记录
- `POST /api/deployments/:projectId/deploy` - 执行部署

### 9. 测试管理 ✅

**后端API**:
- `GET /api/tests` - 获取测试记录
- `POST /api/tests/:projectId/run` - 运行测试

### 10. 系统设置 ✅

**路径**: `/settings`

**功能**:
- 外观设置
  - 主题模式（浅色/深色/跟随系统）
  - 语言选择
  - 侧边栏展开
- 通知设置
  - 桌面通知
  - 声音提示
  - 任务完成通知
- 服务器设置
  - API地址配置
  - 请求超时
  - WebSocket配置
  - 连接测试
- 任务设置
  - 最大并发数
  - 自动清理
  - 失败重试
- 系统信息
  - 版本信息
  - 技术栈
  - 连接状态
- 快捷操作
  - 导出/导入设置
  - 重置设置
  - 清除缓存

## 🎨 UI/UX 特性

### 主题系统
- **深色/浅色模式切换**
- **主题持久化**（localStorage）
- **系统主题检测**
- **平滑过渡动画**

### 布局特性
- **固定侧边栏**：可折叠，图标切换
- **固定顶部栏**：页面标题，主题切换，通知
- **响应式设计**：自适应不同屏幕尺寸
- **卡片式布局**：统一的卡片风格

### 交互特性
- **悬浮效果**：卡片悬浮提升
- **加载状态**：骨架屏/加载指示器
- **消息提示**：成功/错误/警告提示
- **确认对话框**：危险操作二次确认
- **实时更新**：WebSocket支持

## 🔧 技术特性

### 前端
- **TypeScript**：完整类型支持
- **Composition API**：Vue 3最佳实践
- **Pinia Store**：状态管理
- **API封装**：统一的API调用接口
- **路由守卫**：权限和导航控制
- **代码分割**：按需加载
- **Tree Shaking**：优化打包体积

### 后端
- **RESTful API**：标准化API设计
- **统一响应格式**：success/error包装
- **错误处理中间件**：全局错误捕获
- **请求日志**：详细的请求日志
- **CORS支持**：跨域资源共享
- **WebSocket**：实时双向通信
- **SQLite数据库**：轻量级持久化
- **任务队列**：EventEmitter实现
- **并发控制**：限制并发任务数

## 📊 数据库设计

### 表结构

**projects** - 项目表
```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  framework TEXT,
  packageManager TEXT,
  description TEXT,
  config TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  lastOpenedAt INTEGER
)
```

**builds** - 构建记录表
```sql
CREATE TABLE builds (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  status TEXT NOT NULL,
  startTime INTEGER NOT NULL,
  endTime INTEGER,
  duration INTEGER,
  output TEXT,
  errors TEXT,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
)
```

**deployments** - 部署记录表
```sql
CREATE TABLE deployments (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  environment TEXT NOT NULL,
  status TEXT NOT NULL,
  version TEXT,
  startTime INTEGER NOT NULL,
  endTime INTEGER,
  duration INTEGER,
  logs TEXT,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
)
```

**test_runs** - 测试运行表
```sql
CREATE TABLE test_runs (
  id TEXT PRIMARY KEY,
  projectId TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  startTime INTEGER NOT NULL,
  endTime INTEGER,
  duration INTEGER,
  total INTEGER,
  passed INTEGER,
  failed INTEGER,
  skipped INTEGER,
  coverage REAL,
  results TEXT,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
)
```

**tool_configs** - 工具配置表
```sql
CREATE TABLE tool_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  toolName TEXT NOT NULL UNIQUE,
  config TEXT NOT NULL,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
)
```

**logs** - 日志表
```sql
CREATE TABLE logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  meta TEXT,
  timestamp INTEGER NOT NULL
)
```

## 🚀 部署说明

### 后端部署

1. **构建**:
```bash
cd server
pnpm build
```

2. **启动**:
```bash
pnpm start
# 或
node dist/index.js
```

3. **环境变量**:
```bash
PORT=3000
HOST=127.0.0.1
CORS_ORIGINS=http://localhost:5173
ENABLE_WS=true
```

### 前端部署

1. **开发模式**:
```bash
cd web
pnpm dev
```

2. **生产构建**:
```bash
pnpm build
```

3. **预览**:
```bash
pnpm preview
```

## 📈 性能优化

- **代码分割**: 路由级别懒加载
- **Tree Shaking**: 移除未使用代码
- **资源压缩**: Vite自动压缩
- **缓存策略**: localStorage缓存
- **数据库索引**: SQLite索引优化
- **并发控制**: 任务队列限流

## 🔐 安全特性

- **路径安全检查**: 防止目录遍历
- **文件大小限制**: 防止大文件读取
- **CORS配置**: 限制跨域访问
- **输入验证**: 参数验证
- **错误隐藏**: 不暴露内部错误

## 📝 开发建议

### 添加新页面
1. 在 `web/src/views/` 创建 Vue 组件
2. 在 `web/src/router/index.ts` 添加路由
3. 在 `web/src/components/Layout.vue` 添加菜单项

### 添加新API
1. 在 `server/src/routes/` 创建路由文件
2. 在 `server/src/routes/index.ts` 注册路由
3. 在 `web/src/api/` 创建对应API封装
4. 重新构建后端: `pnpm build`

### 添加新任务类型
1. 在任务路由中注册执行器:
```typescript
taskManager.registerExecutor('my-task', async (task, updateProgress) => {
  updateProgress(50, '处理中')
  // 执行任务逻辑
  return result
})
```

## 🎓 未来计划

- [ ] 工具包市场页面
- [ ] 文件管理器（带代码编辑器）
- [ ] Git管理页面
- [ ] 依赖可视化页面
- [ ] 代码质量分析
- [ ] 性能分析报告
- [ ] 用户认证系统
- [ ] WebSocket实时推送优化
- [ ] Docker部署支持
- [ ] CI/CD集成

---

**Happy Coding! 🚀**
