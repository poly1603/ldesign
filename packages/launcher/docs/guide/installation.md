---
title: 安装指南
description: 在不同操作系统和环境下安装与验证 @ldesign/launcher 的完整步骤
---

# 安装指南

本指南详细介绍如何在不同环境中安装和配置 @ldesign/launcher。

## 📋 系统要求

### 必须条件

- **Node.js**: >= 16.0.0 (推荐使用 LTS 版本)
- **包管理器**: pnpm (推荐) / npm / yarn
- **操作系统**: Windows, macOS, Linux

### 推荐配置

- **Node.js**: >= 18.0.0 (获得最佳性能)
- **包管理器**: pnpm >= 8.0.0
- **编辑器**: VS Code + Volar 扩展 (用于 Vue 开发)

### 版本兼容性

| @ldesign/launcher | Node.js | Vite | TypeScript |
|-------------------|---------|------|------------|
| 1.x               | >= 16   | >= 5 | >= 4.6     |

## 📦 安装方式

### 全局安装 (推荐)

全局安装允许您在任何地方使用 `launcher` 命令：

::: code-group

```bash [pnpm]
pnpm add -g @ldesign/launcher
```

```bash [npm]
npm install -g @ldesign/launcher
```

```bash [yarn]
yarn global add @ldesign/launcher
```

:::

验证安装：

```bash
launcher --version
```

### 项目本地安装

如果您更喜欢在项目中本地安装：

::: code-group

```bash [pnpm]
pnpm add @ldesign/launcher
```

```bash [npm]
npm install @ldesign/launcher
```

```bash [yarn]
yarn add @ldesign/launcher
```

:::

然后通过 npx 或 package.json scripts 使用：

```bash
# 通过 npx
npx launcher dev

# 通过 pnpm
pnpm launcher dev

# 通过 npm scripts
npm run dev  # 需要在 package.json 中配置
```

### 使用 npx (无需安装)

如果您只是想快速尝试，可以直接使用 npx：

```bash
npx @ldesign/launcher dev
```

## 🔧 不同环境安装

### Windows

#### 使用 PowerShell

```powershell
# 安装 Node.js (如果尚未安装)
# 从 https://nodejs.org 下载并安装

# 安装 pnpm
iwr https://get.pnpm.io/install.ps1 -useb | iex

# 安装 @ldesign/launcher
pnpm add -g @ldesign/launcher
```

#### 使用 Chocolatey

```powershell
# 安装 Node.js
choco install nodejs

# 安装 pnpm
choco install pnpm

# 安装 @ldesign/launcher
pnpm add -g @ldesign/launcher
```

### macOS

#### 使用 Homebrew

```bash
# 安装 Node.js
brew install node

# 安装 pnpm
brew install pnpm

# 安装 @ldesign/launcher
pnpm add -g @ldesign/launcher
```

#### 使用 MacPorts

```bash
# 安装 Node.js
sudo port install nodejs18

# 安装 @ldesign/launcher
npm install -g @ldesign/launcher
```

### Linux

#### Ubuntu/Debian

```bash
# 更新包索引
sudo apt update

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 重新加载 shell 配置
source ~/.bashrc

# 安装 @ldesign/launcher
pnpm add -g @ldesign/launcher
```

#### CentOS/RHEL/Fedora

```bash
# 安装 Node.js (CentOS/RHEL)
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs

# 安装 Node.js (Fedora)
sudo dnf install nodejs npm

# 安装 pnpm
curl -fsSL https://get.pnpm.io/install.sh | sh -

# 安装 @ldesign/launcher
pnpm add -g @ldesign/launcher
```

#### Arch Linux

```bash
# 安装 Node.js 和 npm
sudo pacman -S nodejs npm

# 安装 pnpm
npm install -g pnpm

# 安装 @ldesign/launcher
pnpm add -g @ldesign/launcher
```

## 🐳 容器化安装

### Docker

创建 `Dockerfile`：

```dockerfile
FROM node:18-alpine

# 安装 pnpm
RUN npm install -g pnpm

# 安装 @ldesign/launcher
RUN pnpm add -g @ldesign/launcher

WORKDIR /app

# 复制项目文件
COPY package*.json ./
RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["launcher", "dev", "--host", "0.0.0.0"]
```

构建和运行：

```bash
# 构建镜像
docker build -t my-launcher-app .

# 运行容器
docker run -p 3000:3000 my-launcher-app
```

### Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

## ⚙️ 配置和初始化

### 全局配置

安装完成后，您可能需要配置一些全局设置：

```bash
# 设置默认包管理器
launcher config set packageManager pnpm

# 设置默认端口
launcher config set defaultPort 3000

# 查看所有配置
launcher config list
```

### 项目初始化

在新项目中初始化配置：

```bash
# 创建默认配置文件
launcher config init

# 创建 TypeScript 配置
launcher config init --typescript

# 创建带示例的配置
launcher config init --with-examples
```

## 🔍 验证安装

### 基本验证

```bash
# 检查版本
launcher --version

# 检查帮助
launcher --help

# 检查配置
launcher config validate
```

### 完整测试

创建一个测试项目来验证安装：

```bash
# 创建测试目录
mkdir launcher-test && cd launcher-test

# 创建简单的 HTML 文件
echo '<!DOCTYPE html>
<html>
<head><title>Test</title></head>
<body><h1>Hello Launcher!</h1></body>
</html>' > index.html

# 启动开发服务器
launcher dev --port 3001

# 在另一个终端检查服务器是否正常
curl http://127.0.0.1:3001
```

## 🚨 故障排除

### 常见问题

#### 1. `command not found: launcher`

**原因**: 全局安装路径不在 PATH 中

**解决方案**:
```bash
# 查找全局包路径
npm list -g --depth=0

# 添加到 PATH (添加到 ~/.bashrc 或 ~/.zshrc)
export PATH="$PATH:$(npm config get prefix)/bin"
```

#### 2. 权限错误 (EACCES)

**原因**: npm 全局安装权限问题

**解决方案**:
```bash
# 方法 1: 使用 npx
npx @ldesign/launcher --version

# 方法 2: 配置 npm 前缀
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

#### 3. Node.js 版本不兼容

**原因**: Node.js 版本低于 16.0.0

**解决方案**:
```bash
# 使用 n (macOS/Linux)
npm install -g n
n lts

# 使用 nvm
nvm install --lts
nvm use --lts
```

#### 4. 网络连接问题

**解决方案**:
```bash
# 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或者使用 pnpm
pnpm config set registry https://registry.npmmirror.com
```

### 调试模式

如果遇到问题，可以启用调试模式：

```bash
# 启用详细输出
launcher dev --debug

# 查看完整错误堆栈
DEBUG=launcher:* launcher dev
```

## 📈 性能优化

### Node.js 性能调优

```bash
# 增加内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 启用实验性功能
export NODE_OPTIONS="--experimental-loader"
```

### 包管理器优化

```bash
# pnpm 配置
pnpm config set store-dir ~/.pnpm-store
pnpm config set cache-dir ~/.pnpm-cache

# npm 配置
npm config set cache ~/.npm-cache --global
```

## 🔄 更新

### 检查更新

```bash
# 检查是否有新版本
npm outdated -g @ldesign/launcher

# 或使用 pnpm
pnpm outdated -g @ldesign/launcher
```

### 更新到最新版本

```bash
# 使用 npm
npm update -g @ldesign/launcher

# 使用 pnpm
pnpm add -g @ldesign/launcher@latest

# 使用 yarn
yarn global upgrade @ldesign/launcher
```

## 🗑️ 卸载

如果需要卸载 @ldesign/launcher：

```bash
# 全局卸载
npm uninstall -g @ldesign/launcher

# 或使用 pnpm
pnpm remove -g @ldesign/launcher

# 清理配置文件 (可选)
rm -rf ~/.launcher
```

---

**下一步**: [快速开始](./getting-started) 或 [了解基本概念](./concepts)
