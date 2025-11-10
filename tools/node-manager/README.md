# @ldesign/node-manager

功能强大的 Node.js 版本管理工具 - 封装 nvm/fnm/volta + 自研版本管理器

## ✨ 特性

### 多管理器支持
- 🔧 **NVM** - Node Version Manager (Unix/Linux/macOS)
- 🪟 **NVM-Windows** - Windows 版本的 NVM
- ⚡ **fnm** - Fast Node Manager (跨平台)
- ⚙️ **Volta** - JavaScript 工具管理器
- 🚀 **LDesign Manager** - 自研轻量级版本管理器

### 核心功能
- 📦 自动检测已安装的版本管理工具
- 🔄 统一的 API 接口
- 📥 Node.js 版本下载和安装
- 🔀 版本切换
- 🗑️ 版本删除
- 📋 本地和远程版本列表
- 🌐 多镜像源支持（官方、淘宝、腾讯云）
- 🔐 环境变量自动配置
- 💾 版本缓存管理

## 📦 安装

```bash
pnpm add @ldesign/node-manager
```

## 🚀 快速开始

### 基础使用

```typescript
import { NodeManagerFactory } from '@ldesign/node-manager'

// 创建管理器实例（自动检测已安装的工具）
const manager = await NodeManagerFactory.create()

// 获取当前版本
const current = await manager.getCurrentVersion()
console.log('当前版本:', current)

// 列出已安装的版本
const versions = await manager.listVersions()
console.log('已安装版本:', versions)

// 安装新版本
await manager.installVersion('20.10.0')

// 切换版本
await manager.switchVersion('20.10.0')

// 删除版本
await manager.removeVersion('18.17.0')
```

### 指定管理器类型

```typescript
import { NodeManagerFactory, ManagerType } from '@ldesign/node-manager'

// 使用 fnm
const fnmManager = await NodeManagerFactory.create(ManagerType.FNM)

// 使用自研管理器
const ldesignManager = await NodeManagerFactory.create(ManagerType.LDESIGN)
```

### 获取可用版本

```typescript
// 获取所有可用版本
const available = await manager.listAvailableVersions()

// 获取 LTS 版本
const ltsVersions = await manager.listLTSVersions()

// 获取最新版本
const latest = await manager.getLatestVersion()
```

### 配置镜像源

```typescript
import { MirrorConfig } from '@ldesign/node-manager'

// 使用淘宝镜像
const manager = await NodeManagerFactory.create({
  mirror: MirrorConfig.TAOBAO,
})

// 自定义镜像
const manager = await NodeManagerFactory.create({
  mirror: 'https://custom-mirror.com/node/',
})
```

## 📖 API 文档

### NodeManagerFactory

工厂类，用于创建管理器实例。

#### `create(type?: ManagerType | Options): Promise<INodeManager>`

创建管理器实例。

- `type`: 管理器类型或配置选项
- 返回: 管理器实例

### INodeManager

管理器接口，所有管理器都实现此接口。

#### `getCurrentVersion(): Promise<string | null>`

获取当前激活的 Node.js 版本。

#### `listVersions(): Promise<NodeVersion[]>`

列出本地已安装的版本。

#### `installVersion(version: string): Promise<InstallResult>`

安装指定版本。

#### `switchVersion(version: string): Promise<SwitchResult>`

切换到指定版本。

#### `removeVersion(version: string): Promise<RemoveResult>`

删除指定版本。

#### `listAvailableVersions(): Promise<string[]>`

获取远程可用的所有版本。

#### `listLTSVersions(): Promise<string[]>`

获取 LTS（长期支持）版本列表。

#### `getLatestVersion(): Promise<string>`

获取最新版本。

#### `isInstalled(): Promise<boolean>`

检查管理器是否已安装。

### 类型定义

```typescript
// 管理器类型
enum ManagerType {
  NVM = 'nvm',
  NVM_WINDOWS = 'nvm-windows',
  FNM = 'fnm',
  VOLTA = 'volta',
  LDESIGN = 'ldesign',
}

// 版本信息
interface NodeVersion {
  version: string
  installed: boolean
  active: boolean
  lts?: string
}

// 安装结果
interface InstallResult {
  success: boolean
  message: string
  version?: string
}

// 切换结果
interface SwitchResult {
  success: boolean
  message: string
  from?: string
  to?: string
}

// 删除结果
interface RemoveResult {
  success: boolean
  message: string
  version?: string
}
```

## 🔧 高级用法

### 自研管理器

自研管理器直接下载 Node.js 二进制文件，无需额外安装工具。

```typescript
import { LDesignManager } from '@ldesign/node-manager'

const manager = new LDesignManager({
  installDir: '/custom/path/to/nodejs',
  mirror: 'https://npmmirror.com/mirrors/node/',
})

// 下载并安装版本
await manager.installVersion('20.10.0')

// 切换版本（通过环境变量）
await manager.switchVersion('20.10.0')
```

### 版本检测器

```typescript
import { VersionDetector } from '@ldesign/node-manager'

// 检测所有已安装的管理器
const installedManagers = await VersionDetector.detectAll()

// 检测特定管理器
const hasFnm = await VersionDetector.detect(ManagerType.FNM)
```

### 环境变量管理

```typescript
import { EnvManager } from '@ldesign/node-manager'

// 设置 Node.js 路径到环境变量
await EnvManager.setNodePath('/path/to/node')

// 获取当前 Node.js 路径
const nodePath = await EnvManager.getNodePath()

// 移除 Node.js 路径
await EnvManager.removeNodePath('/path/to/node')
```

## 🌐 镜像源配置

内置镜像源：

- **官方**: `https://nodejs.org/dist/`
- **淘宝**: `https://npmmirror.com/mirrors/node/`
- **腾讯云**: `https://mirrors.cloud.tencent.com/nodejs-release/`

```typescript
import { MirrorConfig } from '@ldesign/node-manager'

// 使用预定义镜像
const manager = await NodeManagerFactory.create({
  mirror: MirrorConfig.TAOBAO,
})

// 自定义镜像
const manager = await NodeManagerFactory.create({
  mirror: 'https://your-mirror.com/node/',
})
```

## 📝 注意事项

1. **权限**: 某些操作可能需要管理员权限
2. **路径**: 自研管理器默认安装到 `~/.ldesign/nodejs`
3. **环境变量**: 切换版本后需要重启终端或重新加载环境变量
4. **并发**: 同时安装多个版本可能导致冲突，建议顺序安装

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License


