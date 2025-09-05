# 贡献指南

感谢你对 @ldesign/launcher 项目的关注！我们欢迎任何形式的贡献，包括但不限于：

- 🐛 报告和修复 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码改进
- 🧪 编写测试用例
- 🎨 UI/UX 改进

## 📋 贡献流程

### 1. 准备工作

#### 环境要求
- Node.js >= 16.0.0
- pnpm >= 7.0.0 (推荐)
- Git >= 2.0.0

#### 开发工具推荐
- VS Code + Volar/TypeScript 扩展
- 或其他支持 TypeScript 的 IDE

### 2. 项目设置

```bash
# 1. Fork 项目到你的 GitHub 账户

# 2. 克隆你的 fork
git clone https://github.com/YOUR_USERNAME/launcher.git
cd launcher

# 3. 添加上游仓库
git remote add upstream https://github.com/ldesign/launcher.git

# 4. 安装依赖
pnpm install

# 5. 创建开发分支
git checkout -b feature/your-feature-name
```

### 3. 开发流程

#### 开发环境启动

```bash
# 启动开发模式
pnpm dev

# 运行测试
pnpm test

# 代码格式化
pnpm format

# 代码检查
pnpm lint
```

#### 目录结构

```
packages/launcher/
├── src/                 # 源代码
│   ├── core/           # 核心功能
│   ├── plugins/        # 内置插件
│   ├── utils/          # 工具函数
│   ├── types/          # 类型定义
│   └── cli/            # CLI 相关
├── docs/               # 文档
├── tests/              # 测试文件
├── examples/           # 示例项目
└── scripts/            # 构建脚本
```

### 4. 代码规范

#### TypeScript 规范

```typescript
// ✅ 推荐
interface ConfigOptions {
  port?: number
  host?: string
}

export function createServer(options: ConfigOptions): Server {
  const { port = 3000, host = 'localhost' } = options
  // 实现...
}

// ❌ 不推荐
export function createServer(options: any) {
  // 缺少类型定义
}
```

#### 命名规范

- **文件名**: kebab-case (`config-manager.ts`)
- **类名**: PascalCase (`ConfigManager`)
- **函数名**: camelCase (`createServer`)
- **常量**: SCREAMING_SNAKE_CASE (`DEFAULT_PORT`)

#### 代码风格

```typescript
// ✅ 推荐的函数结构
/**
 * 创建开发服务器
 * @param options 配置选项
 * @returns 服务器实例
 */
export async function createDevServer(options: DevServerOptions): Promise<ViteDevServer> {
  // 参数验证
  validateOptions(options)
  
  // 主要逻辑
  const config = await resolveConfig(options)
  const server = await createViteServer(config)
  
  // 错误处理
  server.on('error', handleServerError)
  
  return server
}
```

### 5. 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

#### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能的变更）
- `refactor`: 代码重构（既不是新增功能，也不是修复 bug）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

#### 提交格式

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

#### 示例

```bash
feat(config): 添加自动配置检测功能

- 支持自动检测 Vue/React 项目类型
- 根据项目类型自动加载对应插件
- 提供配置覆盖选项

Closes #123
```

### 6. Pull Request 规范

#### PR 标题格式

```
<type>: <description>
```

例如：
- `feat: 添加 TypeScript 配置支持`
- `fix: 修复开发服务器热重载问题`
- `docs: 更新插件开发指南`

#### PR 描述模板

```markdown
## 📋 变更说明

简要描述此 PR 的变更内容

## 🔗 相关 Issue

- Closes #123
- Fixes #456

## 📝 变更详情

### 新增
- [ ] 新功能 1
- [ ] 新功能 2

### 修复
- [ ] Bug 1
- [ ] Bug 2

### 变更
- [ ] 重构部分
- [ ] 优化部分

## 🧪 测试

- [ ] 单元测试
- [ ] 集成测试
- [ ] 手动测试

## 📚 文档

- [ ] 更新了相关文档
- [ ] 添加了代码注释
- [ ] 更新了 CHANGELOG

## ⚠️ 破坏性变更

如果有破坏性变更，请详细说明：

- 变更内容
- 迁移指南
- 影响范围

## 📸 截图/演示

如果有 UI 变更或新功能演示，请提供截图或 GIF

## ✅ 检查清单

- [ ] 代码通过了所有测试
- [ ] 代码符合项目规范
- [ ] 已添加必要的测试用例
- [ ] 已更新相关文档
- [ ] PR 标题和描述清晰明了
```

## 🧪 测试指南

### 测试类型

#### 单元测试
```bash
# 运行所有单元测试
pnpm test:unit

# 运行特定文件测试
pnpm test:unit config-manager.test.ts

# 监听模式
pnpm test:unit --watch
```

#### 集成测试
```bash
# 运行集成测试
pnpm test:integration

# 端到端测试
pnpm test:e2e
```

### 编写测试

```typescript
// tests/unit/config-manager.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { ConfigManager } from '../../src/core/config-manager'

describe('ConfigManager', () => {
  let configManager: ConfigManager

  beforeEach(() => {
    configManager = new ConfigManager()
  })

  describe('loadConfig', () => {
    it('should load default config when no config file exists', async () => {
      const config = await configManager.loadConfig()
      
      expect(config).toBeDefined()
      expect(config.server.port).toBe(3000)
    })

    it('should merge user config with defaults', async () => {
      const userConfig = { server: { port: 8080 } }
      const config = await configManager.loadConfig(userConfig)
      
      expect(config.server.port).toBe(8080)
      expect(config.server.host).toBe('localhost') // 默认值
    })

    it('should throw error for invalid config', async () => {
      const invalidConfig = { server: { port: 'invalid' } }
      
      await expect(configManager.loadConfig(invalidConfig))
        .rejects
        .toThrow('Invalid config')
    })
  })
})
```

## 📝 文档贡献

### 文档结构

```
docs/
├── guide/              # 指南文档
│   ├── installation.md
│   ├── getting-started.md
│   └── concepts.md
├── config/             # 配置文档
├── api/                # API 文档
├── plugins/            # 插件文档
└── examples/           # 示例文档
```

### 文档规范

#### Markdown 格式

```markdown
# 标题

## 主要章节

### 子章节

#### 详细说明

- 使用清晰的标题层级
- 提供代码示例
- 包含实用的提示和警告
```

#### 代码示例格式

````markdown
```typescript
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3000
  }
})
```
````

#### 提示框格式

```markdown
::: tip 提示
这是一个有用的提示
:::

::: warning 注意
这是一个需要注意的地方
:::

::: danger 警告
这是一个重要的警告
:::
```

## 🐛 Bug 报告

### 报告模板

```markdown
## 🐛 Bug 描述

简要描述遇到的问题

## 📋 复现步骤

1. 执行命令 `launcher dev`
2. 访问 `http://localhost:3000`
3. 点击某个按钮
4. 出现错误

## 📱 预期行为

描述你期望的正确行为

## 📸 实际行为

描述实际发生的情况（可以包含截图）

## 🖥️ 环境信息

- OS: [e.g. macOS 12.0]
- Node.js: [e.g. 16.14.0]
- @ldesign/launcher: [e.g. 1.0.0]
- Browser: [e.g. Chrome 98]

## 📁 相关配置

```javascript
// launcher.config.js
export default {
  // 你的配置
}
```

## 📝 附加信息

其他可能有助于解决问题的信息
```

## 💡 功能建议

### 建议模板

```markdown
## 🚀 功能描述

简要描述你希望添加的功能

## 🤔 使用场景

描述在什么情况下需要这个功能

## 💭 解决方案

描述你认为如何实现这个功能

## 🔄 替代方案

描述你考虑过的其他解决方案

## 📋 附加说明

其他相关信息
```

## 🏆 认可贡献者

### 贡献者等级

- 🥇 **核心维护者** - 项目的主要开发和维护者
- 🥈 **活跃贡献者** - 经常性贡献代码和参与讨论
- 🥉 **贡献者** - 提交过有价值的 PR 或 Issue

### 成为维护者

如果你有兴趣成为项目维护者，请满足以下条件：

1. 至少 10 个有效的 PR 被合并
2. 积极参与社区讨论和代码审查
3. 遵循项目的代码规范和理念
4. 能够持续投入时间维护项目

联系现有维护者讨论加入事宜。

## ❓ 常见问题

### 开发相关

**Q: 如何调试 CLI 命令？**

```bash
# 使用 Node.js 调试器
node --inspect-brk ./bin/launcher.js dev

# 或使用 VS Code 调试配置
```

**Q: 如何测试插件功能？**

```bash
# 在示例项目中测试
cd examples/vue-project
pnpm launcher dev
```

**Q: 如何添加新的内置插件？**

1. 在 `src/plugins/` 目录创建插件文件
2. 实现插件逻辑
3. 添加到插件注册表
4. 编写测试和文档

### 提交相关

**Q: PR 被拒绝了怎么办？**

1. 仔细阅读审查意见
2. 根据反馈修改代码
3. 更新 PR 并请求再次审查

**Q: 如何保持 fork 与上游同步？**

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## 📞 联系我们

如果你有任何问题，可以通过以下方式联系我们：

- 💬 [GitHub Discussions](https://github.com/ldesign/launcher/discussions)
- 🐛 [GitHub Issues](https://github.com/ldesign/launcher/issues)
- 📧 Email: maintainers@ldesign.dev

## 🙏 致谢

感谢每一位为 @ldesign/launcher 做出贡献的开发者！

你的贡献让这个项目变得更好。无论是代码、文档、测试还是反馈，都是宝贵的财富。

---

**再次感谢你的贡献！让我们一起构建更好的前端开发工具！** 🚀
