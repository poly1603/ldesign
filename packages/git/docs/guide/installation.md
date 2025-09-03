# 安装配置

本页面将指导您如何安装和配置 @ldesign/git。

## 系统要求

- **Node.js**: >= 18.0.0
- **Git**: >= 2.0.0（系统需要安装 Git）
- **操作系统**: Windows, macOS, Linux

## 安装

### 使用包管理器安装

::: code-group

```bash [pnpm]
pnpm add @ldesign/git
```

```bash [npm]
npm install @ldesign/git
```

```bash [yarn]
yarn add @ldesign/git
```

:::

### 全局安装 CLI 工具

如果您想在全局使用 CLI 工具：

::: code-group

```bash [pnpm]
pnpm add -g @ldesign/git
```

```bash [npm]
npm install -g @ldesign/git
```

```bash [yarn]
yarn global add @ldesign/git
```

:::

安装后，您可以在任何地方使用 `ldesign-git` 命令。

## 验证安装

### 验证库安装

创建一个测试文件来验证库是否正确安装：

```typescript
// test.js
import { Git } from '@ldesign/git'

const git = Git.create('.')
console.log('Git 库安装成功！')
console.log('基础目录:', git.getBaseDir())
```

运行测试：

```bash
node test.js
```

### 验证 CLI 安装

检查 CLI 工具是否正确安装：

```bash
# 查看版本
ldesign-git --version

# 查看帮助
ldesign-git --help
```

## TypeScript 配置

如果您使用 TypeScript，确保您的 `tsconfig.json` 配置正确：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

## ESM 配置

@ldesign/git 是一个纯 ESM 包，确保您的项目配置支持 ESM：

### package.json 配置

在您的 `package.json` 中添加：

```json
{
  "type": "module"
}
```

### 或者使用 .mjs 扩展名

如果不想修改 `package.json`，可以将文件保存为 `.mjs` 扩展名：

```javascript
// app.mjs
import { Git } from '@ldesign/git'

const git = Git.create('.')
// ...
```

## Git 配置

确保系统已安装 Git 并进行了基本配置：

```bash
# 检查 Git 版本
git --version

# 配置用户信息（如果尚未配置）
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 环境变量

您可以通过环境变量配置一些默认行为：

```bash
# 设置默认的 Git 可执行文件路径
export LDESIGN_GIT_BINARY="/usr/local/bin/git"

# 设置默认超时时间（毫秒）
export LDESIGN_GIT_TIMEOUT="60000"

# 启用调试模式
export LDESIGN_GIT_DEBUG="true"
```

在代码中使用环境变量：

```typescript
import { Git } from '@ldesign/git'

const git = new Git('.', {
  binary: process.env.LDESIGN_GIT_BINARY,
  timeout: parseInt(process.env.LDESIGN_GIT_TIMEOUT || '30000'),
  debug: process.env.LDESIGN_GIT_DEBUG === 'true'
})
```

## 常见问题

### 1. 模块解析错误

如果遇到模块解析错误，请检查：

- 确保使用 Node.js 18+
- 确保项目配置为 ESM 模式
- 检查 import 语句是否正确

### 2. Git 命令不存在

如果提示 Git 命令不存在：

```bash
# 安装 Git（Ubuntu/Debian）
sudo apt-get install git

# 安装 Git（CentOS/RHEL）
sudo yum install git

# 安装 Git（macOS）
brew install git

# Windows 用户请从官网下载安装
# https://git-scm.com/download/win
```

### 3. 权限问题

如果遇到权限问题：

```bash
# 检查目录权限
ls -la

# 修改目录权限（如果需要）
chmod 755 /path/to/repository
```

### 4. 网络问题

如果在企业网络环境中遇到问题：

```bash
# 配置代理（如果需要）
git config --global http.proxy http://proxy.company.com:8080
git config --global https.proxy https://proxy.company.com:8080

# 或者在代码中配置
const git = new Git('.', {
  // 自定义配置
})
```

## 开发环境配置

### VS Code 配置

如果您使用 VS Code，推荐安装以下扩展：

- **TypeScript Importer** - 自动导入类型
- **GitLens** - Git 增强功能
- **ESLint** - 代码检查

### 调试配置

在开发时启用调试模式：

```typescript
import { Git } from '@ldesign/git'

const git = new Git('.', {
  debug: true  // 启用调试输出
})

// 监听所有事件
git.repository.on('*', (event, data) => {
  console.log(`事件: ${event}`, data)
})
```

## 性能优化

### 配置选项优化

```typescript
const git = new Git('.', {
  maxConcurrentProcesses: 10,  // 增加并发数
  timeout: 60000,              // 增加超时时间
  binary: '/usr/bin/git'       // 指定 Git 路径
})
```

### 缓存配置

对于频繁操作，考虑实现缓存：

```typescript
class GitCache {
  private cache = new Map()
  
  async getStatus(git: Git) {
    const key = 'status'
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }
    
    const result = await git.getStatus()
    this.cache.set(key, result)
    
    // 5 秒后清除缓存
    setTimeout(() => this.cache.delete(key), 5000)
    
    return result
  }
}
```

## 下一步

- 阅读 [基础概念](/guide/concepts) 了解核心概念
- 查看 [快速开始](/guide/getting-started) 开始使用
- 浏览 [API 参考](/api/git) 了解详细接口
