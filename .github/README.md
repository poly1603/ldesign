# GitHub 配置说明

本目录包含 LDesign 项目的 GitHub 配置文件,包括 Actions workflows 和 Dependabot 配置。

---

## 📁 目录结构

```
.github/
├── workflows/              # GitHub Actions workflows
│   ├── security-scan.yml   # 依赖安全扫描 (每周自动运行)
│   └── dependency-review.yml  # PR 依赖审查
├── dependabot.yml          # Dependabot 自动更新配置
├── SECURITY_SCANNING.md    # 安全扫描使用指南
└── README.md               # 本文件
```

---

## 🤖 GitHub Actions Workflows

### 1. Security Scan (security-scan.yml)

**用途**: 定期扫描项目依赖的安全漏洞、许可证合规性和过时依赖

**触发条件**:
- ⏰ 每周一早上 8:00 (北京时间) 自动运行
- 🔘 手动触发 (workflow_dispatch)
- 📝 修改 package.json 或 pnpm-lock.yaml 时

**包含的检查**:
1. **依赖安全审计** (dependency-audit)
   - 运行 `pnpm audit` 检查已知漏洞
   - 生成 JSON 格式的审计报告
   - 上传报告到 Artifacts (保留 30 天)

2. **许可证合规性检查** (license-check)
   - 使用 `license-checker` 检查所有依赖的许可证
   - 生成许可证摘要和详细报告
   - 上传报告到 Artifacts

3. **过时依赖检查** (outdated-check)
   - 运行 `pnpm outdated` 检查可更新的依赖
   - 生成过时依赖列表
   - 上传报告到 Artifacts

**查看结果**:
- Actions 页面 → Security Scan → 最新运行 → Summary
- 下载详细报告: Artifacts 部分

---

### 2. Dependency Review (dependency-review.yml)

**用途**: 在 PR 中审查依赖变更,防止引入安全漏洞或不兼容许可证

**触发条件**:
- 📝 PR 修改了 package.json 或 pnpm-lock.yaml

**包含的检查**:
1. **依赖审查** (dependency-review)
   - 使用 GitHub 官方 dependency-review-action
   - 检查新增依赖的安全漏洞
   - 验证许可证兼容性
   - 在 PR 中自动添加审查评论

2. **依赖变更分析** (analyze-dependency-changes)
   - 显示新增和删除的依赖
   - 运行安全审计
   - 生成变更摘要

3. **打包体积影响** (check-bundle-size-impact)
   - 显示依赖树大小
   - 提醒关注打包体积

**许可证策略**:
- ❌ **拒绝**: GPL-2.0, GPL-3.0, AGPL-3.0
- ✅ **允许**: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC

**安全策略**:
- ⚠️ **失败条件**: 发现高危 (high) 或严重 (critical) 漏洞

---

## 🤖 Dependabot 配置

### 自动更新策略

**更新频率**: 每周一早上 8:00 (北京时间)

**监控范围**:
1. **npm 依赖** (/)
   - 所有 package.json 中的依赖
   - 自动创建更新 PR

2. **GitHub Actions** (/)
   - workflows 中使用的 Actions
   - 保持 Actions 版本最新

### 更新规则

**版本更新策略**:
- ✅ **补丁版本** (x.x.X): 自动创建 PR
- ✅ **次要版本** (x.X.x): 分组创建 PR
- ❌ **主要版本** (X.x.x): 忽略,需手动审查

**分组更新**:
- `dev-dependencies`: 开发依赖 (@types/*, eslint*, vitest, typescript)
- `production-dependencies`: 生产依赖 (vue, react, @vue/*)

**PR 限制**:
- 最多同时打开 10 个 PR
- 自动添加标签: `dependencies`, `automated`
- 提交信息前缀: `chore(deps)`

---

## 📖 使用指南

### 查看安全扫描结果

1. 访问 [Actions 页面](../../actions)
2. 选择 "Security Scan" workflow
3. 查看最新运行的 Summary
4. 下载 Artifacts 获取详细报告

### 手动触发安全扫描

1. 访问 [Actions 页面](../../actions)
2. 选择 "Security Scan" workflow
3. 点击 "Run workflow" 按钮
4. 选择分支并运行

### 审查 Dependabot PR

1. 查看 PR 中的变更日志
2. 检查 CI 测试结果
3. 审查依赖审查报告
4. 确认无破坏性变更后合并

### 处理安全漏洞

详见 [SECURITY_SCANNING.md](SECURITY_SCANNING.md)

---

## 🔧 本地开发

### 运行安全审计

```bash
# 检查安全漏洞
pnpm audit

# 仅显示高危及以上
pnpm audit --audit-level=high

# 自动修复
pnpm audit --fix
```

### 检查过时依赖

```bash
# 检查所有过时依赖
pnpm outdated

# 更新依赖
pnpm update
```

### 检查许可证

```bash
# 安装 license-checker
pnpm add -g license-checker

# 检查许可证
license-checker --summary
```

---

## 📚 相关文档

- [安全扫描详细指南](SECURITY_SCANNING.md)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Dependabot 文档](https://docs.github.com/en/code-security/dependabot)
- [pnpm audit 文档](https://pnpm.io/cli/audit)

---

**创建时间**: 2025-11-24  
**维护者**: LDesign Team

