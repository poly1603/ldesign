# 🚀 LDesign CLI 快速启动指南

## ✅ 测试验证

所有功能已测试通过！测试通过率: **100% (6/6)** ✨

---

## 📦 安装依赖

```bash
# 确保在 packages/cli 目录下
cd packages/cli

# 安装 Web 依赖
pnpm install:web

# 安装主依赖
pnpm install
```

---

## 🔨 开发模式

### 方式一：使用 dev 命令 (推荐)
```bash
pnpm dev
```

这会同时启动：
- **前端** (Vite): `http://localhost:3001`
- **后端** (Express): `http://localhost:3000`

✅ **WebSocket 已配置**: 前端通过 Vite 代理连接后端 WebSocket

### 方式二：分别启动
```bash
# 终端 1 - 启动后端
pnpm dev:server

# 终端 2 - 启动前端
pnpm dev:web
```

---

## 📦 生产构建

```bash
# 完整构建
pnpm build

# 这会执行以下步骤:
# 1. 清理旧文件
# 2. 构建前端 (Vite)
# 3. 构建 CLI (tsup)
# 4. 复制前端资源到 dist
```

---

## 🎯 使用 CLI

### 查看帮助
```bash
node ./bin/cli.js --help
```

输出:
```
ldesign/1.0.0

Commands:
  ui  打开 LDesign UI 管理界面

Options:
  -v, --version  Display version number
  --debug        启用调试模式
  --silent       静默模式
  --verbose      详细输出
  -h, --help     Display this message
```

### 启动 UI 界面
```bash
# 默认配置 (端口 3000)
node ./bin/cli.js ui

# 自定义端口
node ./bin/cli.js ui --port 8080

# 自定义主机 (注意: 使用 -H 而不是 -h)
node ./bin/cli.js ui --host 0.0.0.0

# 不自动打开浏览器
node ./bin/cli.js ui --no-open

# 开启调试模式
node ./bin/cli.js ui --debug

# 组合使用
node ./bin/cli.js ui --port 8080 --host 0.0.0.0 --no-open --debug
```

---

## 🧪 运行测试

### 自动化测试
```bash
# 运行完整测试套件
node test-cli.js
```

测试内容:
- ✅ CLI 启动
- ✅ HTTP 服务器
- ✅ API 健康检查
- ✅ FNM API
- ✅ Volta API
- ✅ WebSocket 连接

### 手动测试
```bash
# 1. 构建项目
pnpm build:cli

# 2. 启动 UI (测试端口 3100)
node ./bin/cli.js ui --port 3100 --no-open --debug

# 3. 在另一个终端测试 API
curl http://localhost:3100/api/health
curl http://localhost:3100/api/fnm/status
curl http://localhost:3100/api/volta/status
```

---

## 🌐 访问界面

### 开发模式
- **前端开发服务器**: `http://localhost:3001`
- **后端 API 服务器**: `http://localhost:3000`
- **WebSocket**: 通过 Vite 代理 `/ws`

### 生产模式
- **UI 界面**: `http://localhost:3000` (或自定义端口)
- **API**: `http://localhost:3000/api/*`
- **WebSocket**: `ws://localhost:3000`

---

## 📚 功能说明

### Node 版本管理

#### FNM (Fast Node Manager)
- ✅ 检测 FNM 状态
- ✅ 一键安装 FNM
- ✅ 验证安装结果
- ✅ 管理 Node 版本
- ✅ 推荐版本列表

#### Volta
- ✅ 检测 Volta 状态
- ✅ 一键安装 Volta
- ✅ 验证安装结果
- ✅ 管理 Node 版本
- ✅ 推荐版本列表
- ✅ 卸载 Volta

### 实时功能
- ✅ WebSocket 实时通信
- ✅ 安装进度实时显示
- ✅ 彩色日志输出
- ✅ 自动刷新状态

---

## 🔍 故障排查

### 问题 1: 端口被占用
```bash
# 错误信息: EADDRINUSE
# 解决方案: 使用其他端口
node ./bin/cli.js ui --port 3100
```

### 问题 2: WebSocket 无法连接
```bash
# 确保 Vite 配置了代理
# 文件: src/web/vite.config.ts

proxy: {
  '/ws': {
    target: 'ws://localhost:3000',
    ws: true,
    changeOrigin: true
  }
}
```

### 问题 3: FNM 安装失败
```bash
# 可能原因:
# 1. winget 不可用
# 2. 缺少管理员权限
# 3. 网络问题

# 解决方案:
# 1. 以管理员身份运行终端
# 2. 手动安装 FNM: https://github.com/Schniz/fnm
# 3. 或使用 Volta 代替
```

### 问题 4: 构建失败
```bash
# 清理并重新构建
pnpm clean
pnpm install
pnpm build
```

---

## 📖 API 端点

### 健康检查
```bash
GET /api/health
```

### FNM
```bash
GET  /api/fnm/status              # 检测状态
POST /api/fnm/install             # 安装 FNM
POST /api/fnm/verify              # 验证安装
GET  /api/fnm/versions            # 版本列表
POST /api/fnm/install-node        # 安装 Node
GET  /api/fnm/recommended-versions # 推荐版本
```

### Volta
```bash
GET  /api/volta/status              # 检测状态
POST /api/volta/install             # 安装 Volta
POST /api/volta/verify              # 验证安装
GET  /api/volta/versions            # 版本列表
POST /api/volta/install-node        # 安装 Node
GET  /api/volta/recommended-versions # 推荐版本
POST /api/volta/uninstall           # 卸载 Volta
```

---

## 🎯 下一步

1. **启动开发环境**
   ```bash
   pnpm dev
   ```

2. **访问界面**
   - 打开浏览器访问 `http://localhost:3001`

3. **测试功能**
   - 进入 "Node 管理" 页面
   - 尝试安装 FNM 或 Volta
   - 管理 Node 版本

4. **查看文档**
   - `TEST_REPORT.md` - 测试报告
   - `IMPLEMENTATION_SUMMARY.md` - 功能总结
   - `NODE_MANAGER_OPTIMIZATION.md` - 优化说明

---

## 💡 提示

- ✅ 所有测试已通过，可以放心使用
- ✅ WebSocket 连接已配置并测试
- ✅ FNM 和 Volta 同时支持
- ✅ 完整的错误处理和日志
- ✅ 响应式界面设计

---

**需要帮助？** 查看详细文档或提交 Issue

**版本**: 1.0.0  
**状态**: ✅ 已测试  
**更新**: 2025-09-30