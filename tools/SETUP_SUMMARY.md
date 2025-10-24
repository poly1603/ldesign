# LDesign Tools - GitHub 子模块设置完成

## 📦 已创建的包

已成功创建并推送到 GitHub 的 4 个工具包：

### 1. @ldesign/git
- **仓库地址**: https://github.com/poly1603/ldesign-git
- **本地路径**: `tools/git`
- **功能**: Git 操作、仓库管理、提交分析
- **主要特性**:
  - Git 基础操作封装
  - 仓库信息管理
  - 提交历史分析
  - 分支管理
  - CLI 工具支持

### 2. @ldesign/generator
- **仓库地址**: https://github.com/poly1603/ldesign-generator
- **本地路径**: `tools/generator`
- **功能**: 代码生成器 - 快速生成组件、页面、配置文件等
- **主要特性**:
  - Vue/React 组件生成
  - 支持 EJS 和 Handlebars 模板引擎
  - 自动代码格式化
  - 可编程 API
  - 交互式 CLI

### 3. @ldesign/deps
- **仓库地址**: https://github.com/poly1603/ldesign-deps
- **本地路径**: `tools/deps`
- **功能**: 依赖管理工具 - 依赖分析、更新检查、版本管理
- **主要特性**:
  - 依赖列表查看
  - 版本更新检查
  - 依赖使用分析
  - 智能更新管理
  - 支持 npm/pnpm/yarn

### 4. @ldesign/security
- **仓库地址**: https://github.com/poly1603/ldesign-security
- **本地路径**: `tools/security`
- **功能**: 安全工具 - 依赖安全扫描、漏洞检测、代码审计
- **主要特性**:
  - 依赖漏洞扫描
  - 代码安全审计
  - 安全风险评估
  - 自动修复建议
  - 详细报告生成

## 🚀 配置为子模块（可选）

如果你希望将这些包配置为 Git 子模块，可以执行：

```powershell
# 运行转换脚本
powershell -ExecutionPolicy Bypass -File scripts/convert-to-submodules.ps1

# 或者手动添加
git submodule add https://github.com/poly1603/ldesign-git.git tools/git
git submodule add https://github.com/poly1603/ldesign-generator.git tools/generator
git submodule add https://github.com/poly1603/ldesign-deps.git tools/deps
git submodule add https://github.com/poly1603/ldesign-security.git tools/security

# 初始化子模块
git submodule update --init --recursive
```

## 📝 使用方法

### 安装依赖
```bash
cd tools/git && pnpm install && cd ../..
cd tools/generator && pnpm install && cd ../..
cd tools/deps && pnpm install && cd ../..
cd tools/security && pnpm install && cd ../..
```

### 构建包
```bash
cd tools/git && pnpm build && cd ../..
cd tools/generator && pnpm build && cd ../..
cd tools/deps && pnpm build && cd ../..
cd tools/security && pnpm build && cd ../..
```

### 使用 CLI
```bash
# Git 工具
ldesign-git status

# 代码生成器
ldesign-generate component --type vue --name MyComponent
lgen component  # 简写命令

# 依赖管理
ldesign-deps list
ldesign-deps check
ldeps analyze  # 简写命令

# 安全扫描
ldesign-security scan
lsec check  # 简写命令
```

## 🔧 开发指南

### 本地开发
```bash
# 进入包目录
cd tools/[package-name]

# 安装依赖
pnpm install

# 开发模式（监听文件变化）
pnpm dev

# 构建
pnpm build

# 测试
pnpm test
```

### 推送更新
```bash
cd tools/[package-name]
git add .
git commit -m "feat: your changes"
git push origin main
```

## 📚 相关脚本

- `scripts/setup-remaining-repos.ps1` - 创建 GitHub 仓库并推送代码
- `scripts/convert-to-submodules.ps1` - 将包转换为 Git 子模块
- `scripts/setup-github-submodules.ts` - TypeScript 版本的设置脚本（备用）

## ✅ 完成状态

- [x] 创建 @ldesign/git 包的基础结构和配置文件
- [x] 创建 @ldesign/generator 包的基础结构和配置文件
- [x] 创建 @ldesign/deps 包的基础结构和配置文件
- [x] 创建 @ldesign/security 包的基础结构和配置文件
- [x] 在 GitHub 上创建远程仓库
- [x] 将新建的包推送到 GitHub

## 🎉 总结

所有 4 个工具包已成功：
1. ✅ 创建完整的包结构（源代码、配置、文档）
2. ✅ 初始化 Git 仓库
3. ✅ 推送到 GitHub
4. ✅ 可独立开发和维护

每个包都具有：
- 完整的 TypeScript 源代码
- package.json 配置
- tsconfig.json 和 tsup.config.ts 构建配置
- README.md 文档
- LICENSE 文件
- CLI 工具支持
- 导出类型定义

你现在可以：
- 独立开发和维护每个工具包
- 发布到 npm
- 在其他项目中使用
- 持续改进和优化

## 🔗 相关链接

- GitHub 组织: https://github.com/poly1603
- 仓库列表:
  - https://github.com/poly1603/ldesign-git
  - https://github.com/poly1603/ldesign-generator
  - https://github.com/poly1603/ldesign-deps
  - https://github.com/poly1603/ldesign-security

