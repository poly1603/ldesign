# 从初始化到首个发布（端到端）

本示例展示从“新建仓库”到“首个发布”的完整流程，分别给出增强模式与经典模式的命令对照。

## 前置条件

- Node.js 18+，已安装 Git
- 已创建一个空目录作为项目根目录

## 1. 初始化仓库

增强：
```bash
ldesign-git init
```

经典：
```bash
ldesign-git --classic init
```

## 2. 添加远程仓库

增强/经典（相同）：
```bash
ldesign-git remote add origin https://github.com/user/your-repo.git
```

## 3. 创建初始提交

增强：
```bash
# 添加所有文件并提交
ldesign-git add .
ldesign-git smart-commit "chore: initial commit" --all --push
```

经典：
```bash
ldesign-git --classic add .
ldesign-git --classic commit "chore: initial commit"
ldesign-git --classic push origin main
```

## 4. 开发功能分支

增强：
```bash
ldesign-git branch create feature/hello
ldesign-git branch checkout feature/hello
# 编辑代码...
ldesign-git smart-commit "feat: add hello module" --all
ldesign-git push origin feature/hello
```

经典：
```bash
ldesign-git --classic branch create feature/hello
ldesign-git --classic branch checkout feature/hello
# 编辑代码...
ldesign-git --classic add .
ldesign-git --classic commit "feat: add hello module"
ldesign-git --classic push origin feature/hello
```

## 5. 合并回主分支

增强：
```bash
ldesign-git branch checkout main
ldesign-git pull origin main
ldesign-git workflow finish --name feature/hello
# 或手动：
# ldesign-git branch merge feature/hello
# ldesign-git push origin main
```

经典：
```bash
ldesign-git --classic branch checkout main
ldesign-git --classic pull origin main
ldesign-git --classic merge feature/hello   # 若提供 merge 子命令
ldesign-git --classic push origin main
```

## 6. 准备发布

增强（示例采用 GitFlow 思路）：
```bash
ldesign-git workflow start --name 1.0.0 --type gitflow   # 创建 release/1.0.0
# 验证与打磨...
ldesign-git workflow finish --name 1.0.0                 # 合并到 main 并回合到 develop，打 tag（如配置）
```

经典：
```bash
# 手动创建发布分支
ldesign-git --classic branch create release/1.0.0 develop
ldesign-git --classic branch checkout release/1.0.0
# 验证与打磨...
# 合并到 main 并打标签（如支持标签命令）
ldesign-git --classic branch checkout main
ldesign-git --classic merge release/1.0.0
# ldesign-git --classic tag create v1.0.0 -m "release: 1.0.0"
ldesign-git --classic push origin main
# 合并回 develop
ldesign-git --classic branch checkout develop
ldesign-git --classic merge release/1.0.0
ldesign-git --classic push origin develop
```

## 7. 首次发布完成

增强：
```bash
ldesign-git analyze contributors --since 2024-01-01 --format table
```

经典：
```bash
ldesign-git --classic log --max-count=10
```

> 如遇冲突或复杂同步，建议使用增强模式的智能同步：
> ```bash
> ldesign-git sync-commit "feat: finalize release" --auto-resolve --theirs
> ```

