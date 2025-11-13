# 项目操作功能

## 功能概述

项目操作功能允许你在 Web 界面上启动、构建和预览项目，并实时查看日志输出。

## 功能特性

- **启动开发服务器 (Dev)**: 启动项目的开发环境
- **构建项目 (Build)**: 构建项目生成生产环境文件
- **预览构建结果 (Preview)**: 预览已构建的项目

## 技术架构

### 后端

1. **LauncherService** (`src/service/launcher.service.ts`)
   - 封装 `@ldesign/launcher` 包
   - 管理项目的启动、构建、预览进程
   - 通过 `EventEmitter` 实时收集日志

2. **LauncherGateway** (`src/projects/launcher.gateway.ts`)
   - WebSocket 网关
   - 实时推送日志到前端
   - 支持多客户端订阅同一项目日志

3. **API 接口** (`src/projects/projects.controller.ts`)
   - `POST /api/v1/projects/:id/dev` - 启动开发服务器
   - `POST /api/v1/projects/:id/build` - 构建项目
   - `POST /api/v1/projects/:id/preview` - 预览构建结果
   - `POST /api/v1/projects/:id/stop/:command` - 停止进程

### 前端

1. **WebSocket 客户端** (`src/services/websocket.ts`)
   - 封装 Socket.IO 客户端
   - 管理 WebSocket 连接
   - 提供日志订阅接口

2. **操作执行组件** (`src/views/project-detail/OperationRunner.vue`)
   - 通用的操作执行页面
   - 环境配置表单
   - 实时日志显示
   - 进程控制（启动/停止）

3. **具体操作页面**
   - `DevRunner.vue` - 启动开发服务器
   - `BuildRunner.vue` - 构建项目
   - `PreviewRunner.vue` - 预览构建结果

## 使用方法

### 1. 启动服务

**后端**:
```bash
cd tools/server
npm run start:dev
```

**前端**:
```bash
cd tools/web
npm run dev
```

### 2. 访问项目详情页

1. 访问 http://localhost:8888/project
2. 点击任意项目进入详情页
3. 在页面顶部可以看到三个操作按钮：
   - **启动** - 启动开发服务器
   - **打包** - 构建项目
   - **预览** - 预览构建结果

### 3. 执行操作

1. 点击操作按钮进入对应的操作页面
2. 配置运行参数：
   - **环境模式**: development / production / test（dev 和 build 支持）
   - **端口**: 自定义端口号（dev 和 preview 支持）
   - **主机**: 自定义主机地址（dev 和 preview 支持）
3. 点击"启动"按钮开始执行
4. 实时查看日志输出
5. 如需停止，点击"停止"按钮

## API 参数说明

### 启动开发服务器 (Dev)

```typescript
POST /api/v1/projects/:id/dev
Content-Type: application/json

{
  "mode": "development",  // 可选: development | production | test
  "port": 3000,          // 可选: 端口号
  "host": "localhost"    // 可选: 主机地址
}
```

### 构建项目 (Build)

```typescript
POST /api/v1/projects/:id/build
Content-Type: application/json

{
  "mode": "production"   // 可选: development | production | test
}
```

### 预览构建结果 (Preview)

```typescript
POST /api/v1/projects/:id/preview
Content-Type: application/json

{
  "port": 4173,         // 可选: 端口号
  "host": "localhost"   // 可选: 主机地址
}
```

### 停止进程

```typescript
POST /api/v1/projects/:id/stop/:command
// command: dev | build | preview
```

## WebSocket 事件

### 客户端发送

- `subscribe:logs` - 订阅日志
  ```typescript
  { projectId: number, command: string }
  ```

- `unsubscribe:logs` - 取消订阅
  ```typescript
  { projectId: number, command: string }
  ```

### 服务端推送

- `log` - 日志消息
  ```typescript
  {
    type: 'stdout' | 'stderr' | 'error',
    message: string,
    timestamp: Date
  }
  ```

- `status` - 进程状态
  ```typescript
  {
    status: string,
    pid: number,
    startTime: Date
  }
  ```

- `exit` - 进程退出
  ```typescript
  {
    code: number | null,
    signal: string | null
  }
  ```

- `error` - 错误信息
  ```typescript
  {
    message: string
  }
  ```

## 注意事项

1. **进程管理**: 每个项目的每种操作同时只能有一个运行中的进程
2. **日志缓存**: 日志仅在进程运行期间保留，停止后不会持久化
3. **WebSocket 连接**: 客户端断开连接后，进程不会自动停止
4. **路径配置**: 确保 launcher 已构建并位于 `tools/launcher/dist/index.cjs`

## 故障排除

### WebSocket 连接失败

- 检查后端服务是否启动
- 确认 WebSocket 端口未被占用
- 查看浏览器控制台错误信息

### 进程启动失败

- 检查项目路径是否正确
- 确认 launcher 是否已构建
- 查看后端日志获取详细错误信息

### 日志不显示

- 确认 WebSocket 已连接
- 检查是否正确订阅了日志
- 查看浏览器控制台是否有错误

## 后续优化

- [ ] 日志持久化存储
- [ ] 多进程同时运行支持
- [ ] 日志搜索和过滤
- [ ] 进程资源监控（CPU、内存）
- [ ] 日志导出功能
- [ ] 操作历史记录
