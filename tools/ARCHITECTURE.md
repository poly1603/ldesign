# LDesign Tools 系统架构

## 系统概览

```
┌─────────────────────────────────────────────────────────────┐
│                      LDesign Tools                          │
│                  项目管理与工具集成平台                        │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
   ┌────▼────┐                            ┌────▼────┐
   │  前端层  │                            │  后端层  │
   │ Vue 3   │◄──────── HTTP/WS ─────────►│ NestJS  │
   │  Vite   │                            │ TypeORM │
   └─────────┘                            └────┬────┘
                                               │
                                          ┌────▼────┐
                                          │  数据层  │
                                          │ SQLite  │
                                          └─────────┘
```

## 技术栈

### 前端技术栈
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: TailwindCSS + PostCSS
- **通信**: Socket.IO Client, Axios
- **语言**: TypeScript

### 后端技术栈
- **框架**: NestJS 10.x
- **ORM**: TypeORM
- **数据库**: SQLite (better-sqlite3)
- **实时通信**: Socket.IO
- **API 文档**: Swagger/OpenAPI
- **进程管理**: PM2
- **语言**: TypeScript

## 核心模块架构

### 后端模块结构

```
server/src/
├── main.ts                 # 应用入口
├── app.module.ts           # 根模块
├── common/                 # 通用模块
│   ├── filters/           # 异常过滤器
│   │   └── http-exception.filter.ts  # ✨ 增强的错误处理
│   ├── interceptors/      # 拦截器
│   │   ├── logging.interceptor.ts
│   │   ├── timeout.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── decorators/        # 装饰器
│   ├── dto/              # 通用 DTO
│   ├── cache/            # 缓存模块
│   ├── throttle/         # 限流模块
│   └── websocket/        # WebSocket 模块
├── config/               # 配置模块
├── database/             # 数据库配置
└── modules/              # 业务模块
    ├── project/          # 📦 项目管理
    │   ├── entities/
    │   │   ├── project.entity.ts      # ✨ 优化的实体（添加索引）
    │   │   └── command-execution.entity.ts
    │   ├── project.controller.ts
    │   ├── project.service.ts
    │   └── project-command.service.ts
    ├── node/             # 🔧 Node 版本管理
    │   ├── managers/     # 版本管理器实现
    │   │   ├── nvm-windows.manager.ts
    │   │   ├── nvs.manager.ts
    │   │   ├── fnm.manager.ts
    │   │   ├── volta.manager.ts
    │   │   └── mise.manager.ts
    │   ├── node.controller.ts
    │   └── node.service.ts
    ├── npm/              # 📚 NPM 仓库管理
    │   ├── npm.controller.ts
    │   └── npm.service.ts
    ├── git/              # Git 管理
    ├── system/           # 系统工具
    ├── health/           # 💻 健康检查
    └── [其他模块...]
```

### 前端模块结构

```
web/src/
├── main.ts                # 应用入口
├── App.vue               # 根组件
├── api/                  # API 层
│   ├── client.ts         # HTTP 客户端配置
│   └── services.ts       # API 服务封装
├── components/           # 组件库
│   ├── common/          # ✨ 通用组件
│   │   ├── LoadingSpinner.vue    # 加载指示器
│   │   ├── ErrorMessage.vue      # 错误提示
│   │   ├── Alert.vue
│   │   ├── Button.vue
│   │   └── [其他通用组件...]
│   ├── form/            # 表单组件
│   ├── npm/             # NPM 相关组件
│   └── project/         # 项目相关组件
├── router/              # 路由配置
│   └── index.ts
├── stores/              # ✨ 状态管理
│   ├── projects.ts      # 项目 Store（带缓存和乐观更新）
│   ├── app.ts
│   └── theme.ts
├── utils/               # 工具函数
│   ├── errorHandler.ts
│   ├── message.ts
│   └── toast.ts
├── views/               # 页面组件
│   ├── Home.vue
│   ├── Projects.vue
│   ├── ProjectDetail.vue
│   ├── NodeVersionManager.vue
│   ├── NpmRegistry.vue
│   └── [其他页面...]
└── styles/              # 样式文件
    ├── theme.css
    └── [其他样式...]
```

## 数据流架构

### 请求处理流程

```
┌─────────┐
│ 用户操作 │
└────┬────┘
     │
     ▼
┌─────────────┐     HTTP/WS      ┌─────────────┐
│   Vue 组件   │ ─────────────► │ NestJS 控制器│
│ (View Layer) │                 │ (Controller) │
└─────┬───────┘                 └──────┬──────┘
      │                                │
      │ Pinia Store                    │
      │ (缓存/乐观更新)                 │
      ▼                                ▼
┌─────────────┐                 ┌─────────────┐
│  Store/State│                 │   Service   │
│   Management│                 │(业务逻辑层)  │
└─────────────┘                 └──────┬──────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │   TypeORM   │
                                │ (Repository)│
                                └──────┬──────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │   SQLite    │
                                │  (Database) │
                                └─────────────┘
```

### WebSocket 实时通信

```
前端组件
   │
   ├─ Socket.IO Client ───────┐
   │                          │
   └─ Event Listeners         │
                              │
                         WebSocket
                              │
                              ▼
                    Socket.IO Server
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌─────▼─────┐      ┌─────▼─────┐
              │ 命令执行   │      │ 日志推送   │
              │ 进度通知   │      │ 状态更新   │
              └───────────┘      └───────────┘
```

## 核心功能模块

### 1. 项目管理模块

**功能**：
- 项目 CRUD 操作
- 项目导入和分析
- 命令执行和状态追踪
- 打包状态监控

**优化点**：
- ✅ 数据库索引优化（5个索引）
- ✅ 智能缓存策略（5分钟缓存）
- ✅ 乐观更新机制
- ✅ 自动错误回滚

**实体设计**：
```typescript
@Entity('projects')
@Index('idx_project_name', ['name'])
@Index('idx_project_type_category', ['type', 'category'])
@Index('idx_project_framework', ['framework'])
@Index('idx_project_last_opened', ['lastOpenedAt'])
@Index('idx_project_created_at', ['createdAt'])
export class Project {
  @PrimaryColumn('text')
  id: string
  
  @Column('text')
  name: string
  
  @Column('text', { unique: true })
  path: string
  
  // ... 其他字段
}
```

### 2. Node 版本管理模块

**功能**：
- 支持多种版本管理器（nvm-windows, nvs, fnm, volta, mise）
- 版本安装/切换/删除
- 管理器安装和状态检测
- 实时安装进度通知

**架构模式**：策略模式
```typescript
interface INodeManager {
  name: string
  isInstalled(): Promise<boolean>
  listVersions(): Promise<NodeVersion[]>
  getCurrentVersion(): Promise<string | null>
  installVersion(version: string): Promise<Result>
  switchVersion(version: string): Promise<Result>
  removeVersion(version: string): Promise<Result>
}

// 具体实现
class NvmWindowsManager implements INodeManager { }
class NvsManager implements INodeManager { }
class FnmManager implements INodeManager { }
// ...
```

### 3. NPM 仓库管理模块

**功能**：
- NPM 仓库配置管理
- Verdaccio 集成（启动/停止/重启）
- 用户登录/登出
- 包列表和详情查询
- 配置文件管理

**特性**：
- 支持本地 Verdaccio 服务管理
- 自动检测登录状态
- 包列表分页查询

### 4. 系统监控模块

**功能**：
- 健康检查
- 系统信息查询
- 内存/CPU 使用率监控
- 日志管理

## 性能优化策略

### 数据库层优化

1. **索引策略**
   ```sql
   -- 项目查询优化
   CREATE INDEX idx_project_name ON projects(name)
   CREATE INDEX idx_project_type_category ON projects(type, category)
   CREATE INDEX idx_project_framework ON projects(framework)
   CREATE INDEX idx_project_last_opened ON projects(lastOpenedAt)
   CREATE INDEX idx_project_created_at ON projects(createdAt)
   ```

2. **SQLite 配置优化**
   ```typescript
   extra: {
     journal_mode: 'WAL',      // 写前日志模式
     cache_size: 10000,        // 缓存大小
     mmap_size: 268435456,     // 内存映射 256MB
     synchronous: 'NORMAL',    // 同步模式
     temp_store: 'MEMORY',     // 临时存储
   }
   ```

### 应用层优化

1. **请求缓存**（使用 cache-manager）
   ```typescript
   @Injectable()
   export class SystemService {
     constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}
     
     async getSystemInfo() {
       const cached = await this.cache.get('system:info')
       if (cached) return cached
       
       const data = await this.fetchSystemInfo()
       await this.cache.set('system:info', data, 60000)
       return data
     }
   }
   ```

2. **HTTP 压缩**
   ```typescript
   app.use(compression({
     threshold: 1024,
     level: 6,
   }))
   ```

3. **请求超时保护**
   ```typescript
   new TimeoutInterceptor(30000) // 30秒超时
   ```

### 前端优化

1. **状态管理缓存**
   ```typescript
   // 5分钟缓存策略
   if (!force && now - lastFetch.value < 5 * 60 * 1000) {
     return projects.value
   }
   ```

2. **乐观更新**
   ```typescript
   // 先更新 UI，再发送请求
   projects.value[index] = { ...projects.value[index], ...data }
   
   try {
     const response = await projectApi.update(id, data)
     projects.value[index] = response.data
   } catch {
     projects.value[index] = oldProject // 失败回滚
   }
   ```

3. **路由懒加载**
   ```typescript
   {
     path: '/projects',
     component: () => import('../views/Projects.vue')
   }
   ```

## 错误处理机制

### 统一错误响应格式

```typescript
{
  success: false,
  message: "错误消息",
  timestamp: "2025-11-10T02:45:37.123Z",
  requestId: "req-1731209137123-abc123",
  path: "/api/projects/invalid-id",
  code?: "ERROR_CODE",
  details?: { /* 详细信息 */ }
}
```

### 错误追踪流程

```
┌─────────┐
│ 前端请求 │
└────┬────┘
     │ X-Request-ID: req-xxx
     ▼
┌─────────────┐
│ 后端接收请求 │
│ (生成或使用ID)│
└────┬────────┘
     │
     ▼
┌─────────────┐
│   处理请求   │
│ (记录日志)   │
└────┬────────┘
     │ 如果出错
     ▼
┌─────────────────┐
│ HttpExceptionFilter │
│ [requestId] Error   │
└────┬────────────────┘
     │
     ▼
┌─────────────┐
│ 返回错误响应 │
│ + Request-ID │
└────┬────────┘
     │
     ▼
┌─────────────┐
│  前端处理   │
│ (日志/上报) │
└─────────────┘
```

## 安全考虑

1. **输入验证**
   - 使用 `class-validator` 进行 DTO 验证
   - 路径验证防止目录遍历攻击

2. **限流保护**
   - 使用 `@nestjs/throttler` 限制请求频率

3. **CORS 配置**
   - 开发环境允许所有源
   - 生产环境配置白名单

4. **错误信息脱敏**
   - 生产环境不暴露内部错误堆栈
   - 敏感信息加密存储

## 部署架构

### 开发环境

```
┌─────────────┐     ┌─────────────┐
│   前端开发   │     │   后端开发   │
│ localhost:  │     │ localhost:  │
│   8888      │────►│    3000     │
│  Vite HMR   │     │  Nest Watch │
└─────────────┘     └─────────────┘
```

### 生产环境

```
┌──────────┐
│  Nginx   │ HTTPS/SSL
│  反向代理 │
└────┬─────┘
     │
     ├────► /            ──► 静态文件 (前端)
     │
     └────► /api/api     ──► NestJS (PM2)
            /socket.io      └─ SQLite
```

## 监控和日志

### 日志级别

- `error` - 错误日志（生产环境）
- `warn` - 警告日志（生产环境）
- `log` - 一般日志（生产环境）
- `debug` - 调试日志（开发环境）
- `verbose` - 详细日志（开发环境）

### 监控指标

- API 响应时间
- 错误率和错误类型
- 数据库查询性能
- 内存和 CPU 使用率
- WebSocket 连接数

## 扩展性设计

### 模块化设计

- 每个功能模块独立封装
- 通过依赖注入实现松耦合
- 支持动态加载和卸载

### 插件化架构（规划中）

```typescript
interface IToolPlugin {
  name: string
  version: string
  initialize(): Promise<void>
  execute(context: ExecutionContext): Promise<Result>
}
```

## 总结

LDesign Tools 采用现代化的技术栈和架构设计，注重：

1. **性能**：数据库索引、缓存策略、乐观更新
2. **可靠性**：完整的错误处理、请求追踪、自动回滚
3. **可维护性**：模块化设计、类型安全、清晰的代码结构
4. **用户体验**：实时通信、友好的错误提示、流畅的交互

---

**维护者**：LDesign Team  
**最后更新**：2025-11-10
