# 🚀 LDesign 包部署工具

一个强大的自动化工具，用于安全、可靠地部署 LDesign 包到 npm 注册表。

## 🎯 功能特性

- ✅ **全面验证** - 构建产物、测试覆盖率、包大小检查
- ✅ **安全部署** - 干运行模式、版本冲突检测
- ✅ **批量操作** - 支持单包和全量部署
- ✅ **多环境支持** - latest、beta、alpha 标签
- ✅ **CDN 链接生成** - 自动生成 jsdelivr 和 unpkg 链接
- ✅ **Git 集成** - 自动创建版本标签

## 🚀 快速开始

### 基本用法

```bash
# 部署单个包
npx tsx tools/deploy/package-deployer.ts color

# 干运行模式（推荐先测试）
npx tsx tools/deploy/package-deployer.ts color --dry-run

# 部署到beta环境
npx tsx tools/deploy/package-deployer.ts color --tag beta

# 部署所有包
npx tsx tools/deploy/package-deployer.ts all
```

### 命令行选项

| 选项                  | 描述                         | 默认值               |
| --------------------- | ---------------------------- | -------------------- |
| `--tag <tag>`         | 发布标签 (latest/beta/alpha) | `latest`             |
| `--version <version>` | 指定版本号                   | 从 package.json 读取 |
| `--dry-run`           | 干运行模式，不实际发布       | `false`              |
| `--skip-validation`   | 跳过验证步骤                 | `false`              |

## 📋 部署流程

### 1. 预检查阶段

```bash
🔍 验证构建产物...
  ✅ 检查dist/、es/、lib/、types/目录
  ✅ 验证package.json配置
  ✅ 确认导出字段完整性
```

### 2. 质量验证

```bash
🧪 验证测试覆盖率...
  ✅ 运行测试套件
  ✅ 检查覆盖率达标

📏 验证包大小...
  ✅ 检查bundle大小限制
  ⚠️  超出限制时给出警告
```

### 3. 发布准备

```bash
🔐 检查npm登录状态...
  ✅ 验证用户权限
  ✅ 检查版本冲突

📦 准备发布...
  ✅ 生成发布包
  ✅ 验证包内容
```

### 4. 发布执行

```bash
🚀 发布到npm...
  ✅ 上传包文件
  ✅ 设置发布标签
  ✅ 生成CDN链接

🏷️  创建Git标签...
  ✅ 创建版本标签
  ✅ 推送到远程仓库
```

## 🎯 使用场景

### 开发环境部署

```bash
# 开发版本部署到alpha
npx tsx tools/deploy/package-deployer.ts my-package --tag alpha --dry-run
npx tsx tools/deploy/package-deployer.ts my-package --tag alpha
```

### 测试环境部署

```bash
# 测试版本部署到beta
npx tsx tools/deploy/package-deployer.ts my-package --tag beta --dry-run
npx tsx tools/deploy/package-deployer.ts my-package --tag beta
```

### 生产环境部署

```bash
# 生产版本部署到latest
npx tsx tools/deploy/package-deployer.ts my-package --dry-run
npx tsx tools/deploy/package-deployer.ts my-package
```

### 批量部署

```bash
# 部署所有包到beta环境
npx tsx tools/deploy/package-deployer.ts all --tag beta --dry-run
npx tsx tools/deploy/package-deployer.ts all --tag beta
```

## 🔍 验证检查项

### 构建产物验证

- **目录结构** - dist/, es/, lib/, types/
- **入口文件** - index.js, index.d.ts
- **配置文件** - package.json, README.md
- **导出配置** - main, module, types, exports 字段

### 质量验证

- **测试覆盖率** - 运行完整测试套件
- **包大小限制** - 检查 bundle 大小
- **代码质量** - ESLint 检查通过
- **类型检查** - TypeScript 编译无错误

### 发布验证

- **npm 登录状态** - 确保有发布权限
- **版本冲突检测** - 避免重复发布
- **标签管理** - 正确设置发布标签
- **Git 状态** - 确保代码已提交

## 📊 部署报告

部署完成后会生成详细报告：

```bash
✅ 包发布成功: @ldesign/color@1.2.3

📦 发布信息:
  - 包名: @ldesign/color
  - 版本: 1.2.3
  - 标签: latest
  - 大小: 45.2 KB (gzipped: 12.1 KB)

🔗 安装命令:
  npm install @ldesign/color
  yarn add @ldesign/color
  pnpm add @ldesign/color

🌐 CDN链接:
  - jsDelivr: https://cdn.jsdelivr.net/npm/@ldesign/color@1.2.3/dist/index.js
  - unpkg: https://unpkg.com/@ldesign/color@1.2.3/dist/index.js

🏷️  Git标签: color-v1.2.3
```

## ⚡ 高级功能

### 自定义验证

可以在包的 package.json 中配置自定义验证：

```json
{
  "scripts": {
    "pre-deploy": "npm run lint && npm run type-check",
    "size-check": "size-limit",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 环境变量配置

```bash
# 自定义npm注册表
NPM_REGISTRY=https://registry.npmjs.org/

# 跳过某些验证
SKIP_TESTS=true
SKIP_SIZE_CHECK=true
```

### 钩子脚本

支持在部署过程中执行自定义脚本：

- `pre-deploy` - 部署前执行
- `post-deploy` - 部署后执行
- `deploy-failed` - 部署失败时执行

## 🛡️ 安全特性

### 权限检查

- **npm 登录验证** - 确保有发布权限
- **包所有权验证** - 检查是否有权限发布到@ldesign scope
- **版本权限检查** - 防止覆盖已发布版本

### 安全发布

- **干运行模式** - 先测试再实际发布
- **版本冲突检测** - 避免意外覆盖
- **回滚机制** - 发布失败时自动清理

### 审计日志

- **发布记录** - 记录每次发布的详细信息
- **操作日志** - 跟踪所有部署操作
- **错误日志** - 详细的错误信息和堆栈

## 🔧 故障排除

### 常见问题

**Q: 发布失败，提示权限不足？**

```bash
# 检查npm登录状态
npm whoami

# 重新登录
npm login

# 检查包权限
npm access list packages @ldesign
```

**Q: 构建产物验证失败？**

```bash
# 重新构建包
cd packages/your-package
pnpm build

# 检查构建产物
ls -la dist/ es/ lib/ types/
```

**Q: 测试覆盖率不达标？**

```bash
# 运行测试并查看覆盖率
pnpm test:coverage

# 跳过测试验证（不推荐）
npx tsx tools/deploy/package-deployer.ts your-package --skip-validation
```

**Q: 包大小超出限制？**

```bash
# 检查包大小
pnpm size-check

# 分析包内容
npx webpack-bundle-analyzer dist/index.js
```

### 调试模式

```bash
# 启用详细日志
DEBUG=deploy:* npx tsx tools/deploy/package-deployer.ts your-package

# 干运行模式查看详细信息
npx tsx tools/deploy/package-deployer.ts your-package --dry-run
```

## 📈 最佳实践

### 发布流程

1. **开发完成** - 确保功能完整，测试通过
2. **版本更新** - 使用语义化版本号
3. **干运行测试** - 先用--dry-run 测试
4. **beta 发布** - 先发布到 beta 环境测试
5. **正式发布** - 发布到 latest 环境

### 版本管理

- **主版本** - 破坏性变更
- **次版本** - 新功能，向后兼容
- **修订版本** - Bug 修复

### 质量保证

- **100%测试覆盖率** - 确保代码质量
- **包大小控制** - 保持合理的包大小
- **文档完善** - 更新 README 和 API 文档

---

🎯 **目标**: 让包发布变得安全、可靠、自动化！
