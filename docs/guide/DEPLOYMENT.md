# 🚀 LDesign 部署指南

本文档详细介绍了 LDesign 项目的部署流程和工具使用方法。

## 📋 目录

- [快速开始](#快速开始)
- [部署目标](#部署目标)
- [部署工具](#部署工具)
- [配置文件](#配置文件)
- [CI/CD 集成](#cicd-集成)
- [验证和回滚](#验证和回滚)
- [故障排除](#故障排除)

## 🚀 快速开始

### 1. 准备工作

确保你已经完成以下准备工作：

```bash
# 安装依赖
pnpm install

# 构建所有包
pnpm build

# 运行测试
pnpm test:run

# 添加变更集
pnpm changeset
```

### 2. 一键部署

```bash
# 部署到所有目标（npm + CDN + 文档）
pnpm deploy

# 仅部署到 npm
pnpm deploy:npm

# 仅部署文档
pnpm deploy:docs

# 干运行模式（不实际部署）
pnpm deploy --dry-run
```

### 3. 部署单个包

```bash
# 部署特定包
pnpm deploy:package engine

# 部署 beta 版本
pnpm deploy:package engine --tag beta

# 干运行模式
pnpm deploy:package engine --dry-run
```

## 🎯 部署目标

### npm 包管理器

**目标**: 发布包到 npm registry **命令**: `pnpm deploy:npm` **配置**: `deploy.config.json` 中的
`npm` 部分

**特性**:

- 🏷️ 支持多标签发布（latest、beta、alpha）
- 🔒 自动访问控制设置
- 📦 批量发布所有包
- 🔍 发布前验证

### CDN 分发网络

**目标**: 通过 CDN 提供包文件 **命令**: `pnpm deploy:cdn` **支持的 CDN**: jsDelivr、unpkg、自定义
CDN

**特性**:

- 🌐 自动同步到多个 CDN
- 🔗 自动生成 CDN 链接
- 📝 生成使用示例
- ⚡ 支持压缩版本

### 文档站点

**目标**: 部署文档到 GitHub Pages **命令**: `pnpm deploy:docs` **支持平台**: GitHub
Pages、Vercel、Netlify

**特性**:

- 📚 自动构建 VitePress 文档
- 🌐 多平台部署支持
- 🔄 自动更新
- 📱 响应式设计

## 🛠️ 部署工具

### 主部署管理器

**文件**: `tools/deploy/deploy-manager.ts` **功能**: 统一管理所有部署目标

```bash
# 基本用法
tsx tools/deploy/deploy-manager.ts [target] [environment] [options]

# 示例
tsx tools/deploy/deploy-manager.ts all production
tsx tools/deploy/deploy-manager.ts npm staging --dry-run
tsx tools/deploy/deploy-manager.ts docs development --skip-validation
```

**参数说明**:

- `target`: 部署目标（all、npm、cdn、docs）
- `environment`: 环境（production、staging、development）
- `--dry-run`: 干运行模式
- `--skip-validation`: 跳过验证
- `--force`: 强制部署

### 包部署器

**文件**: `tools/deploy/package-deployer.ts` **功能**: 部署单个或所有包

```bash
# 部署单个包
tsx tools/deploy/package-deployer.ts <package-name> [options]

# 部署所有包
tsx tools/deploy/package-deployer.ts all [options]

# 示例
tsx tools/deploy/package-deployer.ts engine --tag latest
tsx tools/deploy/package-deployer.ts color --tag beta --dry-run
```

**参数说明**:

- `package-name`: 包名或 'all'
- `--tag`: 发布标签（latest、beta、alpha）
- `--version`: 指定版本
- `--dry-run`: 干运行模式
- `--skip-validation`: 跳过验证

### 部署验证器

**文件**: `tools/deploy/verify-deployment.ts` **功能**: 验证部署状态

```bash
# 验证所有包
tsx tools/deploy/verify-deployment.ts

# 验证单个包
tsx tools/deploy/verify-deployment.ts <package-name>

# 示例
tsx tools/deploy/verify-deployment.ts engine --version 1.0.0
tsx tools/deploy/verify-deployment.ts all --timeout 60000
```

## ⚙️ 配置文件

### 主配置文件

**文件**: `deploy.config.json`

```json
{
  "npm": {
    "registry": "https://registry.npmjs.org/",
    "tag": "latest",
    "access": "public"
  },
  "cdn": {
    "provider": "jsdelivr",
    "fallback": "unpkg"
  },
  "docs": {
    "provider": "github-pages",
    "domain": "ldesign.github.io",
    "buildDir": "docs/.vitepress/dist"
  },
  "environments": {
    "production": {
      "npm": { "tag": "latest" },
      "docs": { "domain": "ldesign.github.io" }
    },
    "staging": {
      "npm": { "tag": "beta" },
      "docs": { "domain": "staging.ldesign.github.io" }
    }
  }
}
```

### 环境变量

在 `.env` 文件或 CI/CD 环境中设置：

```bash
# npm 发布令牌
NPM_TOKEN=your_npm_token

# GitHub 令牌
GITHUB_TOKEN=your_github_token

# Codecov 令牌（可选）
CODECOV_TOKEN=your_codecov_token
```

## 🔄 CI/CD 集成

### GitHub Actions

**文件**: `.github/workflows/deploy.yml`

**触发条件**:

- 推送到 `main` 分支
- 创建版本标签
- 手动触发

**功能特性**:

- 🔍 自动验证（构建、测试、类型检查）
- 📦 多目标部署
- 🌍 多环境支持
- 📊 部署报告
- 🔔 状态通知

**手动触发**:

1. 访问 GitHub Actions 页面
2. 选择 "Deploy" 工作流
3. 点击 "Run workflow"
4. 选择部署目标和环境
5. 点击 "Run workflow"

### 自动发布

当推送到 `main` 分支时，如果存在变更集，将自动：

1. 更新版本号
2. 生成 changelog
3. 发布到 npm
4. 部署文档
5. 创建 GitHub Release

## ✅ 验证和回滚

### 部署验证

```bash
# 验证所有部署
pnpm run verify-deployment

# 验证特定包
tsx tools/deploy/verify-deployment.ts engine

# 生成部署报告
tsx tools/deploy/verify-deployment.ts all --report
```

**验证内容**:

- ✅ npm 包可用性
- ✅ CDN 链接可访问性
- ✅ 包内容完整性
- ✅ 文档站点可访问性

### 回滚部署

```bash
# 回滚 npm 包
tsx tools/deploy/deploy-manager.ts rollback npm [version]

# 回滚文档
tsx tools/deploy/deploy-manager.ts rollback docs

# 示例
tsx tools/deploy/deploy-manager.ts rollback npm 1.0.0
```

## 🔧 故障排除

### 常见问题

#### 1. npm 发布失败

**错误**: `403 Forbidden` **解决**: 检查 NPM_TOKEN 是否正确设置

```bash
# 检查 npm 登录状态
npm whoami

# 重新登录
npm login
```

#### 2. CDN 链接不可用

**错误**: CDN 返回 404 **解决**: CDN 同步需要时间，等待 5-10 分钟后重试

#### 3. 文档部署失败

**错误**: GitHub Pages 部署失败 **解决**: 检查 GitHub Pages 设置和权限

```bash
# 手动构建文档
pnpm docs:build

# 检查构建产物
ls -la docs/.vitepress/dist
```

#### 4. 包大小超限

**警告**: 包体积超出限制 **解决**: 优化代码或调整 size-limit 配置

```bash
# 分析包大小
pnpm size-check

# 查看详细信息
npx size-limit --why
```

### 调试模式

```bash
# 启用详细日志
DEBUG=deploy:* tsx tools/deploy/deploy-manager.ts

# 干运行模式查看执行计划
tsx tools/deploy/deploy-manager.ts --dry-run

# 跳过验证快速部署
tsx tools/deploy/deploy-manager.ts --skip-validation
```

### 获取帮助

如果遇到问题，可以：

1. 查看 [GitHub Issues](https://github.com/ldesign/ldesign/issues)
2. 查看 [部署日志](https://github.com/ldesign/ldesign/actions)
3. 联系维护团队

## 📚 相关文档

- [开发指南](./CONTRIBUTING.md)
- [版本管理](./CHANGELOG.md)
- [API 文档](https://ldesign.github.io/api/)
- [使用指南](https://ldesign.github.io/guide/)

---

**注意**: 部署前请确保所有测试通过，并且已经添加了适当的变更集。
