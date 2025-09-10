# 贡献指南

感谢你对 LDesign Editor 项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 开发新功能
- 🧪 编写测试用例

## 🚀 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 7
- Git

### 本地开发

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 Fork 项目到你的账户
   ```

2. **克隆项目**
   ```bash
   git clone https://github.com/your-username/ldesign.git
   cd ldesign
   ```

3. **安装依赖**
   ```bash
   pnpm install
   ```

4. **启动开发服务器**
   ```bash
   cd packages/editor
   pnpm dev
   ```

5. **运行测试**
   ```bash
   pnpm test
   ```

## 📋 开发规范

### 代码规范

1. **TypeScript**
   - 使用 TypeScript 最新版本
   - 严格模式，禁止使用 `any` 类型
   - 完整的类型定义和注释

2. **ESM 语法**
   - 使用 ES6+ 模块语法
   - 避免使用 CommonJS

3. **代码风格**
   - 使用 ESLint 和 Prettier
   - 遵循项目的 `.eslintrc.js` 配置
   - 提交前运行 `pnpm lint`

4. **命名规范**
   - 类名使用 PascalCase
   - 方法和变量使用 camelCase
   - 常量使用 UPPER_SNAKE_CASE
   - 文件名使用 kebab-case

### 目录结构

```
packages/editor/
├── src/
│   ├── core/           # 核心模块
│   ├── plugins/        # 插件系统
│   ├── renderers/      # 渲染系统
│   ├── themes/         # 主题系统
│   ├── utils/          # 工具函数
│   └── types/          # 类型定义
├── tests/              # 测试文件
├── docs/               # 文档
└── examples/           # 示例代码
```

### 提交规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型说明：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例：**
```
feat(plugins): add image upload plugin

Add support for image upload with drag and drop functionality.
Includes validation for file types and size limits.

Closes #123
```

## 🐛 报告 Bug

在报告 Bug 之前，请先检查是否已有相关的 Issue。

### Bug 报告模板

```markdown
## Bug 描述
简要描述遇到的问题

## 复现步骤
1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## 期望行为
描述你期望发生的行为

## 实际行为
描述实际发生的行为

## 环境信息
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Editor Version: [e.g. 1.0.0]

## 附加信息
添加任何其他有助于解决问题的信息
```

## 💡 功能建议

### 功能建议模板

```markdown
## 功能描述
简要描述建议的功能

## 问题背景
描述这个功能要解决的问题

## 解决方案
描述你建议的解决方案

## 替代方案
描述你考虑过的其他解决方案

## 附加信息
添加任何其他相关信息
```

## 🔧 代码贡献

### Pull Request 流程

1. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **开发功能**
   - 编写代码
   - 添加测试
   - 更新文档

3. **测试验证**
   ```bash
   pnpm test
   pnpm lint
   pnpm type-check
   ```

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

5. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待代码审查

### Pull Request 模板

```markdown
## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 重构
- [ ] 文档更新
- [ ] 测试改进

## 变更描述
简要描述这个 PR 的变更内容

## 相关 Issue
Closes #(issue number)

## 测试
- [ ] 单元测试通过
- [ ] 集成测试通过
- [ ] 手动测试通过

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 添加了必要的测试
- [ ] 更新了相关文档
- [ ] 通过了所有检查
```

## 🧪 测试指南

### 测试类型

1. **单元测试**
   - 测试单个函数或类
   - 使用 Vitest 框架
   - 覆盖率要求 > 80%

2. **集成测试**
   - 测试模块间的交互
   - 测试插件系统
   - 测试主题切换

3. **端到端测试**
   - 测试完整的用户流程
   - 使用真实的浏览器环境

### 编写测试

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { LDesignEditor } from '@/core/editor'

describe('LDesignEditor', () => {
  let editor: LDesignEditor

  beforeEach(() => {
    const container = document.createElement('div')
    editor = new LDesignEditor({ container })
  })

  it('should initialize correctly', () => {
    editor.init()
    expect(editor.initialized).toBe(true)
  })
})
```

## 📚 文档贡献

### 文档类型

1. **API 文档** - 详细的 API 使用说明
2. **教程文档** - 使用教程和最佳实践
3. **示例代码** - 实际的使用示例
4. **更新日志** - 版本变更记录

### 文档规范

- 使用 Markdown 格式
- 提供代码示例
- 包含截图或动图（如适用）
- 保持简洁明了

## 🎯 开发最佳实践

### 性能优化

1. **避免不必要的 DOM 操作**
2. **使用事件委托**
3. **实现防抖和节流**
4. **优化内存使用**

### 可访问性

1. **支持键盘导航**
2. **提供 ARIA 标签**
3. **确保颜色对比度**
4. **支持屏幕阅读器**

### 兼容性

1. **测试主流浏览器**
2. **处理边界情况**
3. **提供降级方案**

## 🤝 社区

- **GitHub Discussions** - 讨论功能和想法
- **Issues** - 报告 Bug 和功能请求
- **Pull Requests** - 代码贡献

## 📄 许可证

通过贡献代码，你同意你的贡献将在 MIT 许可证下发布。

---

再次感谢你的贡献！如果有任何问题，请随时在 Issues 中提出。
