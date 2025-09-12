# 贡献指南

感谢您对 LDESIGN Cropper 的关注！我们欢迎所有形式的贡献。

## 开发环境设置

### 前置要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- Git

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/ldesign/cropper.git
cd cropper

# 安装依赖
pnpm install

# 运行测试
pnpm test

# 启动开发服务器
pnpm dev
```

## 开发流程

### 1. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 2. 开发和测试

- 编写代码时请遵循项目的代码规范
- 为新功能编写相应的测试用例
- 确保所有测试通过：`pnpm test`
- 运行类型检查：`pnpm type-check`

### 3. 提交代码

```bash
# 添加文件
git add .

# 提交（请使用有意义的提交信息）
git commit -m "feat: add new cropping feature"

# 推送到远程分支
git push origin feature/your-feature-name
```

### 4. 创建 Pull Request

- 在 GitHub 上创建 Pull Request
- 填写详细的描述信息
- 等待代码审查

## 代码规范

### TypeScript

- 使用严格的 TypeScript 配置
- 避免使用 `any` 类型
- 为所有公共 API 提供完整的类型定义
- 使用有意义的变量和函数名

### 测试

- 为所有新功能编写单元测试
- 测试覆盖率应保持在 90% 以上
- 使用 Vitest 作为测试框架
- 测试文件应放在 `__tests__` 目录下

### 文档

- 为新功能更新相应的文档
- 使用 JSDoc 注释描述函数和类
- 更新 README.md 和 API 文档

## 提交信息规范

我们使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 问题报告

如果您发现了 bug 或有功能建议，请：

1. 检查是否已有相关的 issue
2. 如果没有，请创建新的 issue
3. 提供详细的描述和复现步骤
4. 如果可能，提供最小化的复现示例

## 许可证

通过贡献代码，您同意您的贡献将在 MIT 许可证下发布。

## 联系我们

- GitHub Issues: [项目 Issues 页面]
- 邮箱: support@ldesign.com

感谢您的贡献！
