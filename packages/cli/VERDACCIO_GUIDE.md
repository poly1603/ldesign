# Verdaccio 本地 NPM 服务器使用指南

## 🎉 功能简介

LDesign CLI 现已集成 Verdaccio 本地 NPM 服务器管理功能，让你可以轻松搭建私有 NPM 注册表。

## 📋 功能列表

### 1. **可视化服务管理**
- ✅ 一键启动/停止/重启 Verdaccio 服务
- ✅ 实时状态监控（运行状态、PID、端口、运行时间）
- ✅ 动画状态指示器
- ✅ 服务访问地址直达链接

### 2. **配置管理**
- ✅ 基本配置编辑（端口、主机地址）
- ✅ 高级配置信息查看
- ✅ 配置文件直接编辑（YAML 格式）
- ✅ 配置修改后提示重启

### 3. **快速操作**
- ✅ 发布包到本地源的命令
- ✅ 设置默认源的命令
- ✅ 创建用户的命令
- ✅ 一键复制命令

### 4. **NPM 源管理**
- ✅ 多源管理和切换
- ✅ 源登录状态检测
- ✅ 私有源认证

## 🚀 快速开始

### 1. 启动 CLI 服务器

```bash
cd D:\WorkBench\ldesign\packages\cli
ld ui
```

或者使用开发模式：

```bash
pnpm run dev
```

### 2. 访问 NPM 源管理页面

打开浏览器，访问 CLI Web UI（通常是 `http://localhost:3000`），然后：

1. 点击侧边栏 "NPM 源管理" 菜单
2. 在页面顶部看到 "📦 本地 NPM 服务器 (Verdaccio)" 区域

### 3. 启动 Verdaccio 服务

1. 点击 "启动服务" 按钮
2. 等待 2-3 秒，服务会自动启动
3. 看到绿色的 "运行中" 状态指示器
4. 服务默认运行在 `http://127.0.0.1:4873`

### 4. 访问 Verdaccio Web UI

点击显示的访问地址链接，在新窗口打开 Verdaccio 管理界面。

## 📝 使用示例

### 发布包到本地源

```bash
# 方式1：临时指定源
npm publish --registry http://127.0.0.1:4873

# 方式2：设置为默认源后直接发布
npm config set registry http://127.0.0.1:4873
npm publish
```

### 安装包（从本地源或代理）

```bash
# 从本地源安装
npm install <package-name> --registry http://127.0.0.1:4873

# 或设置为默认源后安装
npm config set registry http://127.0.0.1:4873
npm install <package-name>
```

### 创建用户

```bash
npm adduser --registry http://127.0.0.1:4873
```

按提示输入用户名、密码和邮箱。

### 登录已有用户

```bash
npm login --registry http://127.0.0.1:4873
```

## ⚙️ 配置说明

### 基本配置

在 "配置" 对话框的 "基本配置" 选项卡中可以修改：

- **监听端口**：默认 4873，范围 1-65535
- **监听地址**：
  - `127.0.0.1`：仅本地访问（推荐）
  - `0.0.0.0`：允许外部网络访问

### 高级配置

默认配置包括：

- **存储路径**：`~/.ldesign/verdaccio/storage`
- **配置文件**：`~/.ldesign/verdaccio/config.yaml`
- **上游源**：
  - npm 官方源：`https://registry.npmjs.org/`
  - 淘宝镜像：`https://registry.npmmirror.com/`
- **包权限**：
  - 私有包（`@ldesign/*`）：需要认证才能发布
  - 其他私有包（`@*/*`）：需要认证才能发布
  - 公共包：代理到淘宝镜像

### 配置文件编辑

在 "配置文件" 选项卡中可以直接编辑 YAML 配置文件，支持：

- 修改包权限
- 添加/删除上游源
- 配置认证方式
- 自定义存储路径
- 配置日志级别

**注意**：修改配置后需要重启服务才能生效。

## 🔧 常见问题

### Q1: 服务启动失败怎么办？

1. 检查端口是否被占用（默认 4873）
2. 尝试修改端口号
3. 查看浏览器控制台的错误信息

### Q2: 如何恢复默认 npm 源？

```bash
npm config set registry https://registry.npmjs.org/
```

### Q3: 本地包如何在其他项目中使用？

```bash
# 在其他项目中设置源
npm config set registry http://127.0.0.1:4873

# 或临时使用
npm install <package-name> --registry http://127.0.0.1:4873
```

### Q4: 如何查看已发布的包？

访问 Verdaccio Web UI：`http://127.0.0.1:4873`

### Q5: 密码忘记了怎么办？

删除 `~/.ldesign/verdaccio/htpasswd` 文件，重启服务后重新创建用户。

## 🎨 界面特性

### 状态指示器

- **绿色脉冲**：服务正在运行
- **灰色静态**：服务已停止

### 实时信息

- **访问地址**：点击直接打开 Web UI
- **PID**：进程 ID
- **运行时间**：自动格式化（秒/分钟/小时/天）

### 快速操作卡片

三个常用命令卡片，鼠标悬停可以选择复制：

1. 📤 发布包到本地源
2. 🔗 设置为默认源
3. 👥 创建用户

## 📚 更多资源

- [Verdaccio 官方文档](https://verdaccio.org/docs/)
- [NPM CLI 文档](https://docs.npmjs.com/cli/)

## 🐛 问题反馈

如果遇到任何问题，请检查：

1. 浏览器控制台日志
2. Verdaccio 服务日志（在配置信息中可以看到日志路径）
3. NPM 命令输出

---

**提示**：首次启动 Verdaccio 会自动生成配置文件和存储目录，后续启动会更快。
