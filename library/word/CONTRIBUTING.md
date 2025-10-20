# 贡献指南

感谢你考虑为 Word Viewer 项目做出贡献！

## 开发设置

### 前置要求

- Node.js >= 16
- npm >= 8 或 yarn >= 1.22

### 克隆仓库

```bash
git clone https://github.com/your-username/word-viewer.git
cd word-viewer
```

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

这将启动 Rollup 的监听模式，文件更改时自动重新构建。

### 构建

```bash
npm run build
```

构建输出将在 `dist/` 目录中。

## 项目结构

```
word/
├── src/                      # 源代码
│   ├── core/                 # 核心功能
│   │   ├── WordViewer.ts     # 主类
│   │   ├── types.ts          # 类型定义
│   │   └── constants.ts      # 常量
│   ├── modules/              # 功能模块
│   │   ├── viewer.ts         # 查看器模块
│   │   ├── editor.ts         # 编辑器模块
│   │   ├── parser.ts         # 解析器模块
│   │   └── exporter.ts       # 导出模块
│   ├── components/           # 框架组件
│   │   ├── vue/              # Vue 组件
│   │   ├── react/            # React 组件
│   │   └── lit/              # Lit 组件
│   ├── utils/                # 工具函数
│   └── styles/               # 样式文件
├── examples/                 # 示例项目
├── dist/                     # 构建输出
└── rollup.config.js          # 打包配置
```

## 代码规范

### TypeScript

- 使用 TypeScript 编写所有代码
- 为所有公共 API 提供类型定义
- 避免使用 `any` 类型
- 使用接口而不是类型别名（除非必要）

### 命名约定

- 文件名：`camelCase.ts` 或 `PascalCase.tsx`
- 类名：`PascalCase`
- 函数/变量：`camelCase`
- 常量：`UPPER_SNAKE_CASE`
- 私有成员：以下划线开头或使用 `private` 关键字

### 注释

- 为所有公共 API 添加 JSDoc 注释
- 复杂逻辑添加行内注释说明
- 中文注释

示例：
```typescript
/**
 * 加载 Word 文档
 * @param file - 要加载的文件对象
 * @returns Promise，加载完成后 resolve
 * @throws 如果文件格式不支持则抛出错误
 */
async loadFile(file: File): Promise<void> {
  // 实现...
}
```

## 提交规范

使用语义化的提交信息：

```
<类型>: <描述>

[可选的正文]

[可选的脚注]
```

类型：
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```
feat: 添加 PDF 导出功能

实现了将 Word 文档导出为 PDF 的功能，支持自定义页面大小和边距。

Closes #123
```

## 拉取请求流程

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'feat: 添加某个功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### PR 检查清单

提交 PR 前，请确保：

- [ ] 代码遵循项目的编码规范
- [ ] 添加了必要的注释和文档
- [ ] 所有测试通过
- [ ] 没有引入新的 linting 错误
- [ ] 更新了相关文档（如果需要）
- [ ] 添加了测试用例（如果是新功能）

## 报告 Bug

通过 GitHub Issues 报告 bug 时，请包含：

- 问题的简要描述
- 重现步骤
- 期望的行为
- 实际发生的情况
- 环境信息（浏览器、Node 版本等）
- 截图（如果适用）
- 错误堆栈（如果有）

模板：
```markdown
**描述**
简要描述问题...

**重现步骤**
1. 执行 '...'
2. 点击 '...'
3. 看到错误

**期望行为**
应该显示...

**实际行为**
实际显示...

**环境**
- OS: Windows 10
- Browser: Chrome 120
- Node: 18.17.0
- 版本: 1.0.0

**截图**
（如果适用）

**其他信息**
...
```

## 功能请求

我们欢迎功能建议！请通过 Issues 提交，包含：

- 功能的详细描述
- 使用场景
- 可能的实现方式
- 是否愿意自己实现

## 开发提示

### 测试你的更改

在提交前，请在多个浏览器中测试：
- Chrome
- Firefox
- Safari
- Edge

### 框架组件测试

如果修改了框架组件，请测试：
- Vue 3 组件
- React 组件
- Lit Web Component

### 性能考虑

- 大文件处理优化
- 避免不必要的 DOM 操作
- 使用 debounce/throttle 处理频繁事件
- 注意内存泄漏

### 兼容性

- 支持现代浏览器（ES2020+）
- 考虑移动端体验
- 确保 TypeScript 类型完整

## 文档

### 更新文档

修改 API 时，请同步更新：
- README.md
- TypeScript 类型定义
- JSDoc 注释
- 示例代码

### 文档风格

- 使用清晰、简洁的语言
- 提供代码示例
- 中文文档
- 保持格式一致

## 版本发布

维护者将处理版本发布。版本号遵循语义化版本规范：

- MAJOR: 不兼容的 API 更改
- MINOR: 向后兼容的功能新增
- PATCH: 向后兼容的问题修正

## 行为准则

### 我们的承诺

为了营造一个开放和友好的环境，我们承诺：

- 使用友好和包容的语言
- 尊重不同的观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

### 不可接受的行为

- 使用性暗示的语言或图像
- 人身攻击或侮辱性评论
- 公开或私下的骚扰
- 未经许可发布他人的私人信息
- 其他在专业环境中不适当的行为

## 获得帮助

如果你需要帮助：

1. 查看 [README](./README.md) 和 [快速开始](./QUICKSTART.md)
2. 搜索现有的 Issues
3. 在 Discord/Slack 提问（如果有）
4. 创建新的 Issue

## 感谢

感谢所有贡献者！你的努力让这个项目变得更好。

---

再次感谢你的贡献！🎉



