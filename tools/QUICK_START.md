# 快速开始指南

## 🎯 已创建的 4 个工具包

| 包名 | GitHub 仓库 | 功能 |
|------|------------|------|
| @ldesign/git | [ldesign-git](https://github.com/poly1603/ldesign-git) | Git 操作、仓库管理、提交分析 |
| @ldesign/generator | [ldesign-generator](https://github.com/poly1603/ldesign-generator) | 代码生成器 |
| @ldesign/deps | [ldesign-deps](https://github.com/poly1603/ldesign-deps) | 依赖管理工具 |
| @ldesign/security | [ldesign-security](https://github.com/poly1603/ldesign-security) | 安全扫描工具 |

## 🚀 快速使用

### 1. @ldesign/git

```bash
# 安装
cd tools/git && pnpm install

# 开发
pnpm dev

# 使用
ldesign-git status
ldesign-git init
```

### 2. @ldesign/generator

```bash
# 安装
cd tools/generator && pnpm install

# 生成 Vue 组件
lgen component -t vue -n MyButton

# 生成 React 组件
lgen component -t react -n MyButton
```

### 3. @ldesign/deps

```bash
# 安装
cd tools/deps && pnpm install

# 列出依赖
ldeps list

# 检查更新
ldeps check

# 分析依赖
ldeps analyze
```

### 4. @ldesign/security

```bash
# 安装
cd tools/security && pnpm install

# 安全扫描
lsec scan

# 检查漏洞
lsec check

# 自动修复
lsec fix
```

## 📦 配置为子模块（可选）

如果希望将这些包作为 Git 子模块管理：

```bash
# 运行转换脚本（会备份原目录）
powershell -ExecutionPolicy Bypass -File scripts/convert-to-submodules.ps1

# 然后提交更改
git add .gitmodules tools/
git commit -m "feat: convert tools to submodules"
```

## 🔄 子模块管理

```bash
# 克隆包含子模块的项目
git clone --recursive https://github.com/yourusername/ldesign.git

# 初始化已存在的子模块
git submodule update --init --recursive

# 更新所有子模块
git submodule update --remote

# 更新单个子模块
cd tools/git
git pull origin main

# 提交子模块更改
git add tools/git
git commit -m "chore: update git submodule"
```

## 📝 注意事项

1. **当前状态**: 包已推送到 GitHub，但尚未配置为子模块
2. **推荐做法**: 如果需要独立维护，保持当前结构；如果需要版本隔离，运行转换脚本
3. **GitHub Token**: 已使用的 token 在脚本中，请妥善保管
4. **备份**: 转换为子模块前会自动创建备份

## ✅ 验证

访问以下链接确认仓库已创建：
- https://github.com/poly1603/ldesign-git
- https://github.com/poly1603/ldesign-generator
- https://github.com/poly1603/ldesign-deps
- https://github.com/poly1603/ldesign-security

