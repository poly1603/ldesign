# 贡献指南

感谢您对 Excel Viewer 项目的关注！我们欢迎各种形式的贡献。

## 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议：

1. 查看 [Issues](https://github.com/ldesign/excel-viewer/issues) 确认问题是否已经被报告
2. 如果没有，创建一个新的 Issue
3. 提供详细的问题描述、复现步骤和环境信息

### 提交代码

1. **Fork 项目**
   ```bash
   # 在 GitHub 上 Fork 项目
   git clone https://github.com/your-username/excel-viewer.git
   cd excel-viewer
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **开发和测试**
   ```bash
   # 开发模式
   npm run dev
   
   # 构建
   npm run build
   
   # 代码检查
   npm run lint
   
   # 类型检查
   npm run type-check
   ```

5. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add some feature"
   ```

   提交信息格式：
   - `feat:` 新功能
   - `fix:` 修复 bug
   - `docs:` 文档更新
   - `style:` 代码格式（不影响代码运行的变动）
   - `refactor:` 重构
   - `perf:` 性能优化
   - `test:` 测试相关
   - `chore:` 构建过程或辅助工具的变动

6. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **创建 Pull Request**
   - 在 GitHub 上创建 Pull Request
   - 填写 PR 模板，说明更改内容
   - 等待代码审查

## 开发规范

### 代码风格

- 使用 TypeScript 编写代码
- 遵循 ESLint 规则
- 使用有意义的变量和函数名
- 添加必要的注释和类型定义

### 提交规范

- 每次提交应该是一个独立的功能或修复
- 提交信息要清晰明了
- 包含相关的测试用例（如适用）

### 文档

- 新功能需要更新 README 和 API 文档
- 复杂功能需要添加使用示例
- 更新 CHANGELOG.md

## 项目结构

```
excel/
├── packages/           # 各个包的源代码
│   ├── core/          # 核心功能包
│   ├── vue/           # Vue 组件
│   ├── react/         # React 组件
│   └── lit/           # Lit 组件
├── examples/          # 示例项目
├── docs/              # 文档
├── rollup.config.js   # 构建配置
└── package.json       # 项目配置
```

## 开发流程

1. **选择任务**
   - 查看 Issues 中标记为 `good first issue` 的任务
   - 或者提出自己的想法

2. **讨论方案**
   - 对于较大的功能，先在 Issue 中讨论实现方案
   - 确保方案与项目目标一致

3. **编写代码**
   - 遵循代码规范
   - 编写清晰的注释
   - 确保代码质量

4. **测试**
   - 编写单元测试
   - 手动测试功能
   - 确保没有破坏现有功能

5. **提交 PR**
   - 清晰描述更改内容
   - 关联相关 Issue
   - 等待 Review

## 行为准则

- 尊重所有贡献者
- 提供建设性的反馈
- 保持友好和专业
- 遵循开源社区规范

## 获得帮助

- 查看 [文档](docs/)
- 在 Issue 中提问
- 加入讨论组（如有）

## 许可证

本项目采用 MIT 许可证。提交代码即表示您同意将代码以相同许可证开源。

---

再次感谢您的贡献！🎉


