# ⚡ Submodule 转换快速指南

> 3 步完成 25 个新包的 Submodule 转换

## 🚀 快速开始（3 步）

### Step 1: 设置 GitHub Token

```powershell
# Windows PowerShell
$env:GITHUB_TOKEN="ghp_your_token_here"
$env:GITHUB_OWNER="your_github_username"
```

**获取 Token**: https://github.com/settings/tokens  
**权限**: 勾选 `repo`

---

### Step 2: 运行批量转换

```bash
pnpm convert-to-submodules
```

脚本会自动：
1. 为 25 个包创建 GitHub 仓库
2. 推送内容到 GitHub
3. 转换为 submodule

**预计时间**: 10-20 分钟

---

### Step 3: 提交变更

```bash
git add .gitmodules
git commit -m "chore: convert 25 packages to submodules"
git push
```

完成！🎉

---

## 🔧 如果自动转换失败

### 单个包手动转换

```bash
# 示例：转换 icons 包
pnpm convert-single
# 按提示输入: packages/icons
```

---

## 📦 转换包清单

### packages/ (10个)
✅ icons, logger, validator, auth, notification  
✅ websocket, permission, animation, file, storage

### libraries/ (10个)
✅ gantt, mindmap, signature, barcode, calendar  
✅ timeline, tree, upload, player, markdown

### tools/ (5个)
✅ tester, deployer, docs-generator, monitor, analyzer

---

## ⚠️ 注意事项

1. **先备份**（可选但推荐）
```bash
xcopy /E /I packages\icons .backup\packages\icons
```

2. **确保 git clean**
```bash
git status
# 应该显示: working tree clean
```

3. **网络稳定**
   - 需要访问 GitHub API
   - 需要推送代码到 GitHub

---

## 🆘 常见问题

**Q: Token 权限不足？**  
A: 重新生成 token，确保勾选 `repo` 权限

**Q: 仓库已存在？**  
A: 脚本会自动使用现有仓库

**Q: 推送失败？**  
A: 检查网络连接和 token 是否过期

**Q: 想测试一个包？**  
A: 使用 `pnpm convert-single` 单独转换

---

## 📖 详细指南

查看完整文档: [CONVERT_TO_SUBMODULES_GUIDE.md](./CONVERT_TO_SUBMODULES_GUIDE.md)

---

**当前状态**: 25 个包已创建，等待转换为 submodule  
**脚本**: `scripts/batch-convert-submodules.ts`  
**命令**: `pnpm convert-to-submodules`






