# 🛠️ LDesign 统一脚本管理系统

## 🎯 概述

为了简化项目管理，我们创建了一个统一的交互式脚本系统，让你通过简单的菜单选择来执行各种操作，无需记住复杂的命令。

## 🚀 快速启动

### 主要入口

```bash
# 启动交互式主菜单（推荐）
pnpm script:main

# 或者使用 PowerShell 脚本（Windows）
.\scripts\dev.ps1 -Main
```

### 直接命令（如果需要）

```bash
# Git 管理
pnpm script:commit          # 智能提交代码
pnpm script:update          # 更新项目
pnpm script:submodule list   # 管理 submodule

# 项目管理
pnpm script:init             # 初始化项目

# 开发相关
pnpm dev                     # 启动开发服务器
pnpm build                   # 构建项目
pnpm test                    # 运行测试
pnpm docs:dev                # 启动文档服务器
```

## 📋 主菜单功能

### 🚀 开发相关
- **启动开发服务器**: `pnpm dev`
- **构建项目**: `pnpm build`
- **清理项目**: 清理构建产物和依赖
- **重置项目**: 清理并重新安装依赖
- **安装依赖**: `pnpm install`
- **类型检查**: `pnpm typecheck`
- **代码格式化**: `pnpm format`
- **代码检查**: `pnpm lint`

### 📝 Git 管理
- **智能提交代码**: 自动 stash → pull → commit → push
- **更新当前项目**: 更新当前目录到最新代码
- **更新所有项目**: 更新 root + 所有 submodule
- **查看分支状态**: 查看 Git 状态和分支信息
- **查看提交历史**: 查看最近的提交记录
- **切换分支**: 切换到其他分支

### 📦 Submodule 管理
- **列出所有 Submodule**: 显示所有 submodule 状态
- **添加新 Submodule**: 添加新的 submodule
- **删除 Submodule**: 删除指定的 submodule
- **修改 Submodule**: 修改 submodule 配置
- **更新所有 Submodule**: 更新所有 submodule
- **重新初始化 Submodule**: 重新初始化所有 submodule

### 🌐 部署相关
- **部署到 GitHub Pages**: 构建并部署文档到 GitHub Pages
- **部署到 Vercel**: 部署到 Vercel
- **连接 Vercel 项目**: 连接到 Vercel 项目
- **查看 Vercel 部署状态**: 查看 Vercel 部署状态
- **预览部署**: 创建预览部署
- **生产部署**: 部署到生产环境
- **查看部署历史**: 查看部署历史记录

### 🔧 项目管理
- **初始化项目**: 完整初始化项目（适用于新克隆）
- **快速初始化**: 跳过依赖安装的快速初始化
- **项目信息**: 显示项目详细信息
- **健康检查**: 检查项目配置和依赖
- **深度清理**: 清理所有缓存和临时文件
- **更新依赖**: 更新所有依赖到最新版本

### 📚 文档相关
- **启动文档服务器**: `pnpm docs:dev`
- **构建文档**: `pnpm docs:build`
- **预览文档**: `pnpm docs:preview`
- **生成 API 文档**: 自动生成 API 文档
- **检查文档链接**: 检查文档中的链接

### 🧪 测试相关
- **运行单元测试**: `pnpm test`
- **运行 E2E 测试**: `pnpm test:e2e`
- **生成覆盖率报告**: `pnpm test:coverage`
- **测试 UI 界面**: `pnpm test:ui`
- **性能基准测试**: 运行性能测试
- **监听模式测试**: 监听文件变化运行测试

## 🖥️ Windows PowerShell 快捷方式

```powershell
# 启动主菜单
.\scripts\dev.ps1 -Main

# 其他快捷命令
.\scripts\dev.ps1                    # 启动开发服务器
.\scripts\dev.ps1 -Mode build        # 构建项目
.\scripts\dev.ps1 -Clean             # 清理项目
.\scripts\dev.ps1 -Docs              # 启动文档服务器
.\scripts\dev.ps1 -Commit            # 提交代码
.\scripts\dev.ps1 -Update            # 更新代码
.\scripts\dev.ps1 -Init              # 初始化项目
.\scripts\dev.ps1 -Submodule list    # 列出 submodule
```

## 🌐 Vercel 部署配置

项目已配置 Vercel 部署支持：

### 配置文件
- `vercel.json`: Vercel 部署配置
- 自动构建命令: `pnpm docs:build`
- 输出目录: `docs/.vitepress/dist`

### 部署命令
```bash
# 通过主菜单选择 "部署相关" → "部署到 Vercel"
# 或直接使用命令
npx vercel --prod
```

### 首次设置
1. 安装 Vercel CLI: `npm i -g vercel`
2. 登录 Vercel: `vercel login`
3. 连接项目: `vercel link`
4. 部署: `vercel --prod`

## 🔧 技术特性

### 交互式界面
- 清晰的菜单导航
- 彩色输出和状态提示
- 用户友好的错误信息
- 操作确认和输入验证

### 安全特性
- 自动备份本地更改
- 操作前确认提示
- 错误回滚机制
- 预览模式支持

### 智能功能
- 自动检测项目状态
- 智能分支管理
- 依赖冲突处理
- 批量操作支持

## 📁 脚本文件结构

```
scripts/
├── main.ts                 # 主交互式脚本
├── git-commit.ts           # Git 提交管理
├── git-update.ts           # 项目更新
├── submodule-manager.ts    # Submodule 管理
├── init-project.ts         # 项目初始化
├── utils/
│   └── common.ts           # 通用工具函数
├── config.json             # 配置文件
├── dev.ps1                 # PowerShell 脚本
└── README.md               # 详细文档
```

## 🎯 使用建议

### 日常开发流程
1. **开始工作**: `pnpm script:main` → 选择 "Git 管理" → "更新所有项目"
2. **开发过程**: `pnpm script:main` → 选择 "开发相关" → "启动开发服务器"
3. **提交代码**: `pnpm script:main` → 选择 "Git 管理" → "智能提交代码"
4. **部署项目**: `pnpm script:main` → 选择 "部署相关" → 选择部署方式

### 新项目设置
1. 克隆项目: `git clone <repository>`
2. 初始化: `pnpm script:main` → 选择 "项目管理" → "初始化项目"
3. 开始开发: `pnpm script:main` → 选择 "开发相关" → "启动开发服务器"

### 团队协作
1. 更新项目: `pnpm script:main` → 选择 "Git 管理" → "更新所有项目"
2. 管理 Submodule: `pnpm script:main` → 选择 "Submodule 管理"
3. 部署文档: `pnpm script:main` → 选择 "部署相关" → "部署到 GitHub Pages"

## 🚨 故障排除

### 常见问题
1. **脚本无法启动**: 确保已安装 `tsx` 和相关依赖
2. **Git 操作失败**: 检查 Git 配置和网络连接
3. **Submodule 问题**: 使用重新初始化功能
4. **部署失败**: 检查 Vercel 配置和权限

### 获取帮助
- 主菜单中选择 "帮助信息"
- 查看详细文档: `scripts/README.md`
- 提交 Issue: [GitHub Issues](https://github.com/poly1603/ldesign/issues)

## 🎉 总结

现在你只需要记住一个命令：`pnpm script:main`

这个统一的脚本系统将为你提供：
- 🎯 **简单易用**: 通过菜单选择，无需记住复杂命令
- 🛡️ **安全可靠**: 完善的错误处理和回滚机制
- 🚀 **高效便捷**: 自动化常见操作，提高开发效率
- 🌐 **部署集成**: 支持 GitHub Pages 和 Vercel 部署
- 📦 **完整功能**: 涵盖开发、测试、部署的全流程

开始使用吧！🚀
