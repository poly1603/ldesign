<!-- 3d69fc37-be47-4229-aec0-fbad54d9b6d5 ac493d75-af4a-4ffc-af68-2f67b0328338 -->
# LDesign CLI 脚手架完整重构计划

## 一、架构设计

### 1. 整体架构

```
@ldesign/cli/
├── src/
│   ├── cli/              # CLI 命令层
│   │   ├── index.ts      # CLI 入口
│   │   ├── commands/     # 命令集合
│   │   └── utils/        # CLI 工具函数
│   ├── core/             # 核心业务层
│   │   ├── project/      # 项目管理
│   │   ├── tool-manager/ # 工具管理器(集成11个工具)
│   │   ├── workflow/     # 工作流引擎
│   │   ├── plugin/       # 插件系统
│   │   └── database/     # 数据库层
│   ├── server/           # Express 后端服务
│   │   ├── app.ts        # 服务器入口
│   │   ├── routes/       # API 路由
│   │   ├── controllers/  # 控制器层
│   │   ├── services/     # 服务层(对接11个工具包)
│   │   ├── middleware/   # 中间件
│   │   └── websocket/    # WebSocket 实时通信
│   ├── web/              # Vue3 前端项目(独立)
│   │   ├── src/
│   │   │   ├── views/    # 页面视图
│   │   │   ├── components/ # 组件
│   │   │   ├── composables/ # 组合式函数
│   │   │   ├── api/      # API 封装
│   │   │   ├── store/    # 状态管理(Pinia)
│   │   │   └── router/   # 路由配置
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── shared/           # 共享类型和工具
│       ├── types/        # TypeScript 类型定义
│       ├── constants/    # 常量定义
│       └── utils/        # 共享工具函数
├── bin/
│   └── cli.js            # CLI 可执行文件
├── dist/                 # 构建输出
│   ├── cli/              # CLI 构建产物
│   ├── core/             # 核心层构建产物
│   ├── server/           # 服务器构建产物
│   └── web/              # 前端构建产物(静态资源)
└── package.json
```

### 2. 核心设计原则

- **分层架构**: CLI层 -> 核心层 -> 服务层 -> 工具层
- **依赖注入**: 通过服务注册表管理工具包实例
- **插件化扩展**: 预留插件接口,支持动态加载新工具
- **统一配置**: 所有工具通过统一配置文件管理
- **事件驱动**: WebSocket + EventEmitter 实现实时状态更新

## 二、核心功能模块

### 1. CLI 命令系统

```typescript
// 核心命令
ldesign ui              # 启动可视化界面
ldesign init [name]     # 创建新项目
ldesign create [type]   # 从模板创建项目
ldesign build           # 构建当前项目
ldesign dev             # 开发模式启动
ldesign test            # 运行测试
ldesign analyze         # 代码分析
ldesign deploy          # 部署项目
ldesign docs            # 生成文档
ldesign security        # 安全扫描
ldesign plugin <cmd>    # 插件管理
```

### 2. 工具管理器 (ToolManager)

负责统一管理和调度11个工具包:

**核心功能**:

- 工具服务注册与加载
- 工具生命周期管理(初始化/启动/停止/重启)
- 工具配置统一管理
- 工具状态监控与健康检查
- 工具间依赖协调

**集成的工具包**:

1. **@ldesign/builder** - 项目构建
2. **@ldesign/launcher** - 项目启动
3. **@ldesign/tester** - 测试工具
4. **@ldesign/analyzer** - 代码分析
5. **@ldesign/deployer** - 部署工具
6. **@ldesign/docs-generator** - 文档生成
7. **@ldesign/generator** - 代码生成
8. **@ldesign/git** - Git 操作
9. **@ldesign/monitor** - 性能监控
10. **@ldesign/security** - 安全扫描
11. **@ldesign/deps** - 依赖管理

**实现架构**:

```typescript
// src/core/tool-manager/ToolManager.ts
class ToolManager {
  private tools: Map<ToolName, IToolAdapter>
  private registry: ServiceRegistry
  
  async registerTool(name: ToolName): Promise<void>
  async executeTool(name: ToolName, action: string, params: any): Promise<any>
  getToolStatus(name: ToolName): ToolStatus
  getToolConfig(name: ToolName): ToolConfig
}

// 工具适配器接口
interface IToolAdapter {
  name: ToolName
  initialize(): Promise<void>
  execute(action: string, params: any): Promise<any>
  getStatus(): ToolStatus
  healthCheck(): Promise<boolean>
  dispose(): Promise<void>
}
```

### 3. 项目管理系统

**功能点**:

- 项目导入(从目录导入现有项目)
- 项目创建(基于模板创建新项目)
- 项目检测(自动识别项目类型/框架/工具链)
- 项目配置管理
- 项目操作历史记录
- 项目统计分析

**数据库表结构**:

```sql
-- 项目表
projects (
  id, name, path, type, framework, 
  package_manager, node_version,
  created_at, updated_at, last_opened_at,
  metadata JSON
)

-- 项目操作历史
project_operations (
  id, project_id, operation_type, 
  tool_name, status, result, 
  created_at
)

-- 项目统计
project_stats (
  id, project_id, 
  build_count, test_count, deploy_count,
  last_build_time, last_test_time,
  updated_at
)
```

### 4. 工作流引擎

支持自定义工作流,串联多个工具操作:

**工作流模板示例**:

```yaml
# 完整CI/CD流程
name: "完整发布流程"
steps:
  - name: "代码检查"
    tool: "security"
    action: "scan"
  - name: "运行测试"
    tool: "tester"
    action: "test"
  - name: "构建项目"
    tool: "builder"
    action: "build"
  - name: "生成文档"
    tool: "docs-generator"
    action: "generate"
  - name: "部署到生产"
    tool: "deployer"
    action: "deploy"
    params:
      environment: "production"
```

### 5. 插件系统

预留扩展接口,支持第三方工具集成:

```typescript
interface IPlugin {
  id: string
  name: string
  version: string
  
  install(context: PluginContext): Promise<void>
  activate(context: PluginContext): Promise<void>
  deactivate(): Promise<void>
}

interface PluginContext {
  // 提供 API、事件系统、UI扩展点等
  api: PluginAPI
  events: EventEmitter
  ui: UIExtension
  storage: PluginStorage
}
```

## 三、后端服务架构

### 1. Express API 设计

**路由结构**:

```
/api/
├── projects/          # 项目管理API
│   ├── GET /          # 获取项目列表
│   ├── POST /import   # 导入项目
│   ├── POST /create   # 创建项目
│   ├── GET /:id       # 获取项目详情
│   ├── PUT /:id       # 更新项目
│   └── DELETE /:id    # 删除项目
├── tools/             # 工具操作API
│   ├── GET /          # 获取工具列表
│   ├── POST /:tool/execute  # 执行工具操作
│   ├── GET /:tool/status    # 获取工具状态
│   └── GET /:tool/config    # 获取工具配置
├── builder/           # 构建工具专用API
├── launcher/          # 启动工具专用API
├── tester/            # 测试工具专用API
├── analyzer/          # 分析工具专用API
├── deployer/          # 部署工具专用API
├── docs/              # 文档生成API
├── generator/         # 代码生成API
├── git/               # Git 操作API
├── monitor/           # 监控API
├── security/          # 安全扫描API
├── deps/              # 依赖管理API
├── workflows/         # 工作流API
├── templates/         # 模板管理API
└── plugins/           # 插件管理API
```

### 2. 服务层设计

每个工具包对应一个服务类:

```typescript
// src/server/services/BuilderService.ts
export class BuilderService implements IToolService {
  private builder: any // @ldesign/builder 实例
  
  async initialize(): Promise<void>
  async build(projectPath: string, options: BuildOptions): Promise<BuildResult>
  async watch(projectPath: string): Promise<void>
  async analyze(buildResult: BuildResult): Promise<AnalysisReport>
}

// 所有服务继承统一接口
interface IToolService {
  name: string
  initialize(): Promise<void>
  execute(action: string, params: any): Promise<any>
  healthCheck(): Promise<boolean>
  dispose(): Promise<void>
}
```

### 3. WebSocket 实时通信

用于推送工具执行进度、日志输出、构建状态等:

```typescript
// WebSocket 消息类型
type WSMessage = 
  | { type: 'tool-progress', tool: string, progress: number }
  | { type: 'tool-log', tool: string, log: string }
  | { type: 'tool-status', tool: string, status: ToolStatus }
  | { type: 'build-start', projectId: string }
  | { type: 'build-complete', projectId: string, result: any }
  | { type: 'workflow-step', workflowId: string, step: number }
```

### 4. 数据库设计

使用 better-sqlite3 本地数据库:

**核心表结构**:

```sql
-- 项目表
CREATE TABLE projects (...)

-- 工具配置表
CREATE TABLE tool_configs (
  id TEXT PRIMARY KEY,
  tool_name TEXT NOT NULL,
  config JSON,
  updated_at INTEGER
)

-- 构建记录表
CREATE TABLE build_records (
  id, project_id, tool, status,
  config, result, logs,
  started_at, completed_at
)

-- 测试记录表
CREATE TABLE test_records (...)

-- 部署记录表
CREATE TABLE deployment_records (...)

-- 文档记录表
CREATE TABLE documentation_records (...)

-- 安全扫描记录表
CREATE TABLE security_scans (...)

-- 监控数据表
CREATE TABLE monitor_data (...)

-- 工作流记录表
CREATE TABLE workflow_records (...)

-- 模板表
CREATE TABLE project_templates (...)

-- 插件表
CREATE TABLE plugins (...)
```

## 四、前端 UI 设计

### 1. 技术栈

- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Naive UI (轻量、美观、TypeScript友好)
- **状态管理**: Pinia
- **路由**: Vue Router
- **图表**: ECharts
- **代码编辑器**: Monaco Editor
- **实时通信**: WebSocket

### 2. 页面结构

```
/                        # 首页/仪表板
/projects                # 项目管理
/projects/import         # 导入项目
/projects/create         # 创建项目
/projects/:id            # 项目详情
  ├── /overview          # 项目概览
  ├── /build             # 构建管理
  ├── /test              # 测试管理
  ├── /deploy            # 部署管理
  ├── /analyze           # 代码分析
  ├── /docs              # 文档管理
  ├── /security          # 安全扫描
  ├── /monitor           # 性能监控
  ├── /deps              # 依赖管理
  ├── /git               # Git 操作
  └── /settings          # 项目设置
/tools                   # 工具总览
/workflows               # 工作流管理
/templates               # 模板市场
/plugins                 # 插件管理
/settings                # 全局设置
```

### 3. 核心功能页面

#### (1) 项目管理页面

- **项目列表**: 卡片式展示,支持搜索/筛选/排序
- **导入项目**: 目录选择器,自动检测项目类型
- **创建项目**: 模板选择,交互式配置向导

#### (2) 项目详情页面

左侧工具导航,右侧内容区:

**工具标签页**:

- **Builder构建**: 配置构建选项,查看构建历史,实时构建日志
- **Launcher启动**: 启动开发服务器,配置启动参数
- **Tester测试**: 运行测试,查看覆盖率报告
- **Analyzer分析**: 代码复杂度,依赖关系图,体积分析
- **Deployer部署**: 选择环境,配置部署参数,查看部署历史
- **Docs文档**: 生成API文档,预览文档
- **Generator生成**: 代码模板生成,文件生成
- **Git管理**: 分支管理,提交历史,差异对比
- **Monitor监控**: 性能指标,错误追踪
- **Security安全**: 漏洞扫描,依赖审计
- **Deps依赖**: 依赖树,更新检查,依赖分析

#### (3) 工作流页面

- **可视化编辑器**: 拖拽式流程设计
- **执行历史**: 查看历史记录,日志回放
- **模板库**: 预置常用工作流

### 4. UI组件设计

**核心组件**:

```typescript
// 项目卡片
<ProjectCard :project="project" />

// 工具执行面板
<ToolExecutor :tool="builder" :project="currentProject" />

// 实时日志查看器
<LogViewer :logs="logs" :follow="true" />

// 配置表单生成器
<ConfigForm :schema="toolSchema" v-model="config" />

// 工作流编辑器
<WorkflowEditor v-model="workflow" />

// 代码差异查看器
<DiffViewer :oldCode="old" :newCode="new" />
```

## 五、打包与部署

### 1. 构建流程

```json
{
  "scripts": {
    "build": "npm run build:web && npm run build:server && npm run build:cli && npm run copy:web",
    "build:web": "cd src/web && vite build",
    "build:server": "tsup --config tsup.server.config.ts",
    "build:cli": "tsup --config tsup.cli.config.ts",
    "copy:web": "node scripts/copy-web-dist.js"
  }
}
```

### 2. 打包策略

- **前端**: Vite打包为静态资源 -> 复制到 `dist/web/`
- **后端**: tsup打包为ESM -> 输出到 `dist/server/`
- **CLI**: tsup打包为ESM -> 输出到 `dist/cli/`
- **服务器启动**: Express serve `dist/web/` 静态文件

### 3. 打包后目录结构

```
dist/
├── cli/
│   ├── index.js         # CLI入口
│   └── commands/
├── server/
│   ├── app.js           # Express服务器
│   ├── routes/
│   ├── services/
│   └── controllers/
├── core/
│   ├── tool-manager/
│   ├── project/
│   └── workflow/
├── web/                 # 前端静态资源
│   ├── index.html
│   ├── assets/
│   └── ...
└── shared/
```

### 4. 打包后路径处理

```typescript
// src/server/app.ts
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 正确定位静态资源目录
const webDir = resolve(__dirname, '../web')
app.use(express.static(webDir))
```

## 六、开发流程

### 1. 开发模式

```bash
# 并行启动前后端开发服务器
npm run dev

# 等同于:
# - cd src/web && vite (前端热更新)
# - tsx watch src/server/app.ts (后端热重载)
```

### 2. 调试模式

```bash
# 启动UI但不打开浏览器
ldesign ui --no-open

# 指定端口和调试模式
ldesign ui --port 8080 --debug
```

### 3. 本地测试打包后的CLI

```bash
# 构建
npm run build

# 本地链接
npm link

# 测试UI命令
ldesign ui
```

## 七、实施步骤

### 阶段一: 基础架构搭建 (优先级P0)

1. 删除现有src代码
2. 创建新的目录结构
3. 实现核心类型定义 (`src/shared/types/`)
4. 实现数据库层 (`src/core/database/`)
5. 实现ToolManager骨架 (`src/core/tool-manager/`)

### 阶段二: 后端服务开发 (优先级P0)

1. 实现Express服务器基础 (`src/server/app.ts`)
2. 实现项目管理API (`src/server/routes/projects.ts`)
3. 实现工具服务适配器(先实现builder/launcher/tester三个)
4. 实现WebSocket通信
5. 完善API路由和控制器

### 阶段三: 前端开发 (优先级P0)

1. 创建Vue3项目结构 (`src/web/`)
2. 实现布局组件和路由
3. 实现项目管理页面
4. 实现项目详情页面(先实现3个核心工具页)
5. 实现API封装和状态管理
6. 实现WebSocket集成

### 阶段四: CLI命令开发 (优先级P1)

1. 实现CLI入口 (`src/cli/index.ts`)
2. 实现ui命令
3. 实现其他常用命令(init/create/build等)

### 阶段五: 工具集成完善 (优先级P1)

1. 集成剩余8个工具包的服务适配器
2. 为每个工具创建对应的前端页面
3. 实现工具间的协调和依赖管理

### 阶段六: 高级功能 (优先级P2)

1. 实现工作流引擎
2. 实现工作流可视化编辑器
3. 实现插件系统基础
4. 实现模板市场

### 阶段七: 打包优化与测试 (优先级P0)

1. 配置构建脚本
2. 测试打包后的CLI
3. 优化打包体积
4. 编写使用文档

## 八、关键技术点

### 1. 工具包动态加载

```typescript
// 延迟加载,减少启动时间
async function loadTool(name: ToolName) {
  switch (name) {
    case 'builder':
      return await import('@ldesign/builder')
    case 'launcher':
      return await import('@ldesign/launcher')
    // ...
  }
}
```

### 2. 进度实时反馈

```typescript
// 工具执行时推送进度
builder.on('progress', (progress) => {
  wsManager.broadcast({
    type: 'tool-progress',
    tool: 'builder',
    progress
  })
})
```

### 3. 错误处理与重试

```typescript
class ToolExecutor {
  async execute(tool, action, params, options = {}) {
    const { retry = 3, timeout = 30000 } = options
    
    for (let i = 0; i < retry; i++) {
      try {
        return await Promise.race([
          tool.execute(action, params),
          this.timeout(timeout)
        ])
      } catch (error) {
        if (i === retry - 1) throw error
        await this.delay(1000 * (i + 1))
      }
    }
  }
}
```

### 4. 配置持久化

```typescript
// 项目配置自动保存到 .ldesignrc.json
interface ProjectConfig {
  tools: {
    builder: BuilderConfig
    launcher: LauncherConfig
    // ...
  }
  workflows: WorkflowConfig[]
}
```

## 九、注意事项

1. **模块化**: 每个工具适配器独立,互不干扰
2. **类型安全**: 全程TypeScript,严格类型检查
3. **错误处理**: 统一错误处理机制,友好的错误提示
4. **性能优化**: 工具按需加载,避免启动卡顿
5. **日志系统**: 分级日志,支持调试模式
6. **测试覆盖**: 核心模块编写单元测试
7. **文档完善**: API文档、使用文档、开发文档

## 十、预期成果

完成后将实现:

- ✅ 功能强大的CLI脚手架工具
- ✅ 美观易用的可视化管理界面
- ✅ 11个工具包的完整集成
- ✅ 灵活的工作流自动化
- ✅ 可扩展的插件系统
- ✅ 完善的项目管理功能
- ✅ 实时的状态反馈和日志输出
- ✅ 打包后可正常使用的npm包

### To-dos

- [ ] 删除现有src代码,保留必要的配置文件
- [ ] 创建新的目录结构(cli/core/server/web/shared)
- [ ] 实现共享类型定义(工具类型、项目类型、API类型等)
- [ ] 实现数据库层(DatabaseManager、Repository模式、表结构)
- [ ] 实现ToolManager核心(工具注册、加载、执行、状态管理)
- [ ] 实现Express服务器基础(app.ts、中间件、错误处理)
- [ ] 实现项目管理API(CRUD、导入、创建、检测)
- [ ] 实现前3个工具适配器(builder、launcher、tester)
- [ ] 实现WebSocket服务器(连接管理、消息分发、实时推送)
- [ ] 实现前3个工具的API路由和控制器
- [ ] 创建Vue3前端项目(Vite配置、依赖安装、基础结构)
- [ ] 实现前端布局组件(Header、Sidebar、MainContent)和路由
- [ ] 实现API客户端封装(axios、错误处理、类型定义)
- [ ] 实现项目管理页面(列表、导入、创建)
- [ ] 实现项目详情页基础架构(标签页切换、工具导航)
- [ ] 实现前3个工具的前端页面(Builder/Launcher/Tester)
- [ ] 实现WebSocket客户端(连接管理、消息处理、重连机制)
- [ ] 实现Pinia状态管理(项目store、工具store、全局store)
- [ ] 实现CLI入口和命令解析(cac配置、全局选项)
- [ ] 实现ui命令(启动服务器、打开浏览器、端口处理)
- [ ] 实现其他CLI命令(init、create、build、test等)
- [ ] 实现剩余8个工具适配器(analyzer/deployer/docs-generator/deps/generator/git/monitor/security)
- [ ] 实现剩余8个工具的API路由
- [ ] 实现剩余8个工具的前端页面
- [ ] 实现工作流引擎(步骤执行、依赖处理、错误恢复)
- [ ] 实现工作流可视化编辑器和执行页面
- [ ] 实现插件系统基础(加载、激活、生命周期管理)
- [ ] 实现模板管理系统和模板市场页面
- [ ] 配置构建脚本(tsup配置、Vite配置、复制脚本)
- [ ] 测试打包流程(构建、本地链接、功能测试)
- [ ] 打包优化(代码分割、Tree shaking、资源压缩)
- [ ] 编写使用文档(README、API文档、开发指南)