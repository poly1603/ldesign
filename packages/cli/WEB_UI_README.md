# LDesign CLI Web UI

LDesign CLI 的可视化界面，提供直观的项目管理和任务执行体验。

## 🌟 功能特性

### 📊 项目概览
- 项目基本信息展示
- 快速操作面板
- 最近活动记录
- 项目状态监控

### 🚀 任务管理
- 可视化任务执行
- 实时日志输出
- 任务状态监控
- 任务控制（启动/停止）

### 📁 文件管理
- 文件浏览器
- 在线代码编辑器
- 文件内容预览
- 文件保存功能

### ⚙️ 配置管理
- 可视化配置编辑
- JSON 格式验证
- 配置分类展示
- 实时配置更新

### 📋 模板管理
- 项目模板浏览
- 模板详情预览
- 一键项目初始化
- 自定义模板支持

## 🛠️ 技术架构

### 后端服务
- **Express.js** - Web 服务器
- **Socket.IO** - 实时通信
- **Node.js** - 运行环境

### 前端界面
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Vite** - 构建工具

### 通信方式
- **REST API** - 数据操作
- **WebSocket** - 实时更新
- **HTTP** - 静态资源

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装 CLI 依赖
pnpm install

# 安装 Web UI 依赖
pnpm run install:ui
```

### 2. 构建项目

```bash
# 构建 CLI
pnpm build

# 构建 Web UI
pnpm run build:ui
```

### 3. 启动 Web UI

```bash
# 启动可视化界面
node ./bin/ldesign.js ui

# 或者指定端口
node ./bin/ldesign.js ui --port 8080

# 开发模式（启用热重载）
node ./bin/ldesign.js ui --dev
```

### 4. 访问界面

浏览器会自动打开 `http://localhost:3000`，如果没有自动打开，请手动访问该地址。

## 📖 使用指南

### 启动命令选项

```bash
ldesign ui [options]

选项:
  -p, --port <number>     服务器端口 (默认: 3000)
  -h, --host <string>     服务器主机 (默认: localhost)
  --no-open              不自动打开浏览器
  --dev                  开发模式（启用热重载）

示例:
  ldesign ui                           # 默认设置启动
  ldesign ui --port 8080               # 指定端口
  ldesign ui --host 0.0.0.0 --no-open # 绑定所有接口，不打开浏览器
  ldesign ui --dev                     # 开发模式
```

### 页面功能

#### 概览页面 (/)
- 查看项目基本信息
- 执行快速操作（init, build, dev, test）
- 查看最近活动

#### 任务页面 (/tasks)
- 创建和管理任务
- 实时查看任务输出
- 控制任务执行状态

#### 文件页面 (/files)
- 浏览项目文件
- 编辑文件内容
- 保存文件更改

#### 配置页面 (/config)
- 编辑项目配置
- 查看配置分类
- 验证配置格式

#### 模板页面 (/templates)
- 浏览可用模板
- 预览模板内容
- 初始化新项目

## 🔧 开发指南

### 开发环境设置

```bash
# 启动后端开发服务器
pnpm dev

# 启动前端开发服务器
pnpm run dev:ui

# 启动 Web UI（开发模式）
node ./bin/ldesign.js ui --dev
```

### 项目结构

```
packages/cli/
├── src/
│   ├── web/                 # Web 服务器模块
│   │   ├── server.ts        # Express 服务器
│   │   ├── project-manager.ts # 项目管理
│   │   └── task-runner.ts   # 任务运行器
│   └── commands/
│       └── ui.ts           # UI 命令
├── web-ui/                 # 前端界面
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── contexts/       # React 上下文
│   │   └── services/       # API 服务
│   ├── package.json
│   └── vite.config.ts
└── package.json
```

### API 接口

#### 项目相关
- `GET /api/project` - 获取项目信息
- `GET /api/config` - 获取配置
- `POST /api/config` - 更新配置

#### 任务相关
- `POST /api/tasks/:taskName` - 运行任务
- `GET /api/tasks/:taskId` - 获取任务状态
- `DELETE /api/tasks/:taskId` - 停止任务

#### 文件系统
- `GET /api/files` - 列出文件
- `GET /api/files/content` - 读取文件
- `POST /api/files/content` - 写入文件

#### 模板相关
- `GET /api/templates` - 获取模板列表
- `POST /api/init` - 初始化项目

### WebSocket 事件

#### 客户端监听
- `tasks:list` - 任务列表更新
- `task:update` - 任务状态更新
- `task:output` - 任务输出
- `config:changed` - 配置文件变化
- `file:changed` - 文件变化

#### 客户端发送
- `subscribe:task` - 订阅任务输出
- `unsubscribe:task` - 取消订阅

## 🐛 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 使用其他端口
   ldesign ui --port 8080
   ```

2. **Web UI 未构建**
   ```bash
   # 构建前端界面
   pnpm run build:ui
   ```

3. **依赖未安装**
   ```bash
   # 安装所有依赖
   pnpm install
   pnpm run install:ui
   ```

4. **连接失败**
   - 检查后端服务是否正常运行
   - 确认防火墙设置
   - 检查网络连接

### 日志调试

```bash
# 启用调试模式
ldesign ui --dev --debug

# 查看详细日志
ldesign ui --verbose
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。
