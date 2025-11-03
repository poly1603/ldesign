# 🚀 快速开始指南

## 📦 安装依赖

```bash
# 在项目根目录执行
pnpm install
```

---

## 🎯 快速测试

### 方式 1: 使用测试脚本（推荐）

```bash
# 测试开发模式
pnpm tsx tools/test-programmatic-api.ts dev

# 测试生产模式（需要先构建）
pnpm tsx tools/test-programmatic-api.ts prod
```

### 方式 2: 使用 CLI 命令

```bash
# 开发模式（支持热重载）
cd tools/cli
pnpm ldesign ui --dev

# 生产模式（需要先构建）
pnpm ldesign ui
```

---

## 🔨 开发模式

### 启动开发环境

```bash
# 在 tools/cli 目录下
cd tools/cli

# 启动开发模式（Server + Web 都支持热重载）
pnpm ldesign ui --dev
```

**特性:**
- ✅ Server 热重载（tsx watch）
- ✅ Web 热重载（Vite HMR）
- ✅ 自动打开浏览器
- ✅ 详细的日志输出
- ✅ 开发友好的错误提示

**访问地址:**
- 前端: http://localhost:5173
- 后端: http://localhost:3000
- API: http://localhost:3000/api

---

## 🏭 生产模式

### 1. 构建项目

```bash
# 构建 Server
cd tools/server
pnpm build

# 构建 Web
cd tools/web
pnpm build

# 构建 CLI（可选）
cd tools/cli
pnpm build
```

### 2. 启动生产服务

```bash
# 在 tools/cli 目录下
cd tools/cli

# 启动生产模式
pnpm ldesign ui
```

**特性:**
- ✅ 使用构建后的代码
- ✅ 优化的性能
- ✅ 简洁的日志
- ✅ 生产环境配置

---

## 🎨 自定义配置

### 自定义端口

```bash
# 开发模式 - 自定义端口
pnpm ldesign ui --dev --server-port 4000 --web-port 8080

# 生产模式 - 自定义端口
pnpm ldesign ui --server-port 4000 --web-port 8080
```

### 仅启动服务器

```bash
# 只启动后端服务
pnpm ldesign ui --dev --server-only
```

### 仅启动前端

```bash
# 只启动前端（需要后端已经在运行）
pnpm ldesign ui --dev --web-only
```

### 不自动打开浏览器

```bash
pnpm ldesign ui --dev --no-open
```

### 跳过构建步骤

```bash
# 生产模式跳过构建（假设已经构建过）
pnpm ldesign ui --no-build
```

---

## 📝 常用命令速查

### 开发阶段

```bash
# 1. 安装依赖
pnpm install

# 2. 启动开发环境
cd tools/cli
pnpm ldesign ui --dev

# 3. 访问
# 前端: http://localhost:5173
# 后端: http://localhost:3000/api
```

### 生产部署

```bash
# 1. 构建所有项目
cd tools/server && pnpm build
cd tools/web && pnpm build

# 2. 启动生产服务
cd tools/cli
pnpm ldesign ui

# 3. 访问
# 前端: http://localhost:5173
# 后端: http://localhost:3000/api
```

### 单独运行

#### Server 单独运行

```bash
cd tools/server

# 开发模式
pnpm dev

# 生产模式
pnpm build
pnpm start
```

#### Web 单独运行

```bash
cd tools/web

# 开发模式
pnpm dev

# 生产模式
pnpm build
pnpm preview
```

---

## 🔍 验证安装

### 1. 检查依赖

```bash
# 检查 Server 依赖
cd tools/server
pnpm list

# 检查 Web 依赖
cd tools/web
pnpm list

# 检查 CLI 依赖
cd tools/cli
pnpm list
```

### 2. 检查构建

```bash
# 构建 Server
cd tools/server
pnpm build
# 应该生成 dist/ 目录

# 构建 Web
cd tools/web
pnpm build
# 应该生成 dist/ 目录

# 构建 CLI
cd tools/cli
pnpm build
# 应该生成 dist/ 目录
```

### 3. 测试 API

```bash
# 启动服务后，在新终端测试
curl http://localhost:3000/api/health

# 应该返回健康检查信息
```

---

## ⚠️ 常见问题

### 问题 1: 端口被占用

**错误信息:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000
kill -9 <PID>

# 或使用自定义端口
pnpm ldesign ui --dev --server-port 4000
```

### 问题 2: 模块未找到

**错误信息:**
```
Cannot find module '@ldesign/server'
```

**解决方案:**
```bash
# 重新安装依赖
pnpm install

# 构建 Server
cd tools/server
pnpm build

# 构建 Web
cd tools/web
pnpm build:lib
```

### 问题 3: 类型错误

**错误信息:**
```
Cannot find name 'ServerInstance'
```

**解决方案:**
```bash
# 重新构建生成类型定义
cd tools/server
pnpm build

cd tools/web
pnpm build:lib
```

### 问题 4: 前端无法连接后端

**症状:**
- 前端页面加载正常
- API 请求失败

**解决方案:**
1. 确保后端已启动: `curl http://localhost:3000/api/health`
2. 检查 CORS 配置
3. 检查代理配置（开发模式）

---

## 🎓 下一步

1. **阅读完整文档**: [可编程 API 使用指南](./README_PROGRAMMATIC_API.md)
2. **查看实施总结**: [实施总结](./IMPLEMENTATION_SUMMARY.md)
3. **探索示例代码**: 查看 `tools/test-programmatic-api.ts`
4. **自定义配置**: 根据需求修改配置文件

---

## 📞 获取帮助

如果遇到问题:

1. 查看 [故障排查文档](./README_PROGRAMMATIC_API.md#-故障排查)
2. 检查日志输出
3. 确认所有依赖已正确安装
4. 确认构建步骤已完成

---

## 🎉 开始使用

现在你已经准备好了！选择一个方式开始：

```bash
# 最简单的方式 - 开发模式
cd tools/cli
pnpm ldesign ui --dev
```

享受开发吧！🚀

