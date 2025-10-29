# @ldesign/server

LDesign 后端 API 服务 - 提供完整的项目管理、构建、部署、测试和监控接口。

## 功能特性

### 🎯 核心功能
- **项目管理** - 导入、创建、更新、删除项目
- **工具集成** - 集成所有 LDesign 工具包
- **构建管理** - 构建任务的创建、监控和取消
- **部署管理** - 多环境部署和回滚
- **测试管理** - 单元测试、集成测试、E2E 测试
- **系统监控** - CPU、内存、磁盘、网络监控
- **日志管理** - 日志查询和管理

### 🔧 技术栈
- **Express** - Web 框架
- **WebSocket** - 实时通信
- **SQLite (better-sqlite3)** - 数据持久化
- **TypeScript** - 类型安全

## 安装

```bash
pnpm install
```

## 开发

```bash
# 开发模式（带热重载）
pnpm dev

# 生产构建
pnpm build

# 运行测试
pnpm test
```

## 使用

### 启动服务器

```typescript
import { App } from '@ldesign/server'

const app = new App({
  port: 3000,
  host: '127.0.0.1',
  enableWebSocket: true,
})

await app.start()
```

### 环境变量

```bash
PORT=3000                # 服务器端口
HOST=127.0.0.1          # 服务器地址
LOG_LEVEL=info          # 日志级别：debug, info, warn, error
ENABLE_WS=true          # 启用 WebSocket
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173  # CORS 来源
```

## API 接口

### 健康检查

```
GET /api/health
```

### 项目管理

```
GET    /api/projects              # 获取所有项目
GET    /api/projects/:id          # 获取项目详情
POST   /api/projects/import       # 导入项目
POST   /api/projects/create       # 创建项目
PUT    /api/projects/:id          # 更新项目
DELETE /api/projects/:id          # 删除项目
POST   /api/projects/:id/open     # 打开项目
GET    /api/projects/:id/stats    # 获取项目统计
```

### 工具管理

```
GET  /api/tools                   # 获取所有工具
GET  /api/tools/:name/status      # 获取工具状态
GET  /api/tools/:name/config      # 获取工具配置
PUT  /api/tools/:name/config      # 更新工具配置
POST /api/tools/:name/execute     # 执行工具操作
POST /api/tools/:name/load        # 加载工具
```

### 构建管理

```
GET  /api/builds                  # 获取构建列表
GET  /api/builds/:id              # 获取构建详情
POST /api/builds                  # 创建构建
POST /api/builds/:id/cancel       # 取消构建
```

### 部署管理

```
GET  /api/deployments             # 获取部署列表
GET  /api/deployments/:id         # 获取部署详情
POST /api/deployments             # 创建部署
POST /api/deployments/:id/rollback # 回滚部署
```

### 测试管理

```
GET  /api/tests                   # 获取测试列表
GET  /api/tests/:id               # 获取测试详情
POST /api/tests                   # 创建测试
```

### 监控

```
GET /api/monitor/system           # 获取系统监控数据
GET /api/monitor/project/:id      # 获取项目监控数据
```

### 日志

```
GET    /api/logs                  # 获取日志列表
DELETE /api/logs                  # 清空日志
```

## WebSocket

连接到 `ws://localhost:3000/ws` 可以接收实时事件：

```javascript
const ws = new WebSocket('ws://localhost:3000/ws')

ws.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log('收到消息:', data)
}

// 发送心跳
ws.send(JSON.stringify({ type: 'ping' }))

// 订阅事件
ws.send(JSON.stringify({ 
  type: 'subscribe', 
  data: { events: ['build', 'deploy'] } 
}))
```

## 数据库

数据存储在 `.ldesign/server.db` SQLite 数据库中。

### 表结构

- **projects** - 项目信息
- **tool_configs** - 工具配置
- **builds** - 构建记录
- **deployments** - 部署记录
- **test_runs** - 测试记录
- **logs** - 日志记录

## 示例

### 导入项目

```bash
curl -X POST http://localhost:3000/api/projects/import \
  -H "Content-Type: application/json" \
  -d '{"path": "/path/to/project", "detect": true}'
```

### 创建构建

```bash
curl -X POST http://localhost:3000/api/builds \
  -H "Content-Type: application/json" \
  -d '{"projectId": "project-id"}'
```

### 部署项目

```bash
curl -X POST http://localhost:3000/api/deployments \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-id",
    "environment": "production",
    "version": "v1.0.0"
  }'
```

## License

MIT
