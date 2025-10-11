# LDesign Scripts

项目级构建和工具脚本集合。

## 📜 脚本列表

### build-all.ts

一键打包所有 packages 和 library 项目的脚本。

#### 功能特性

- ✅ **智能构建顺序**：优先构建依赖包（kit → builder → launcher）
- ✅ **自动分类**：区分优先级包、特殊包、标准包和 library 项目
- ✅ **产物验证**：自动验证所有输出目录是否生成
- ✅ **详细报告**：生成构建结果汇总和统计信息
- ✅ **错误处理**：优先级包失败时终止构建
- ✅ **彩色输出**：清晰的终端输出，易于阅读

#### 使用方法

```bash
# 基本用法
tsx scripts/build-all.ts

# 清理后构建
tsx scripts/build-all.ts --clean

# 详细输出
tsx scripts/build-all.ts --verbose

# 干运行（不实际构建）
tsx scripts/build-all.ts --dry-run

# 组合选项
tsx scripts/build-all.ts --clean --verbose
```

#### 命令行选项

| 选项 | 说明 |
|------|------|
| `--clean` | 构建前清理旧产物 |
| `--verbose` | 输出详细信息，包括每个产物的验证结果 |
| `--dry-run` | 模拟运行，不执行实际构建 |
| `--skip-tests` | 跳过测试步骤（预留选项） |

#### 构建分类

##### 1. 优先级包（Priority Packages）

必须最先构建，其他包依赖这些包：

- **@ldesign/kit**：Node.js 工具库（使用 tsup）
  - 产物：`dist/`

- **@ldesign/builder**：构建工具（使用 tsup）
  - 产物：`dist/`

- **@ldesign/launcher**：启动器（使用 tsup）
  - 产物：`dist/`

##### 2. 特殊包（Special Packages）

使用特殊构建工具的包：

- **@ldesign/webcomponent**：Web Components（使用 Stencil）
  - 产物：`dist/`, `loader/`

##### 3. 标准包（Standard Packages）

使用 @ldesign/builder 构建的标准包：

- api, cache, color, crypto, device, engine, http, i18n, router, shared, size, store, template
- 产物：`es/`, `lib/`, `dist/`

##### 4. Library 项目（Library Projects）

library 目录下的项目，同样使用 @ldesign/builder：

- cropper, editor, flowchart, form, pdf, qrcode
- 产物：`es/`, `lib/`, `dist/`

#### 产物验证

脚本会自动验证以下产物目录：

| 包类型 | 期望产物 | 说明 |
|--------|---------|------|
| 优先级包 | `dist/` | tsup 打包产物 |
| 特殊包 (webcomponent) | `dist/`, `loader/` | Stencil 打包产物 |
| 标准包 | `es/`, `lib/`, `dist/` | builder 打包产物 |
| Library 项目 | `es/`, `lib/`, `dist/` | builder 打包产物 |

#### 输出示例

```
================================================================================
LDesign 一键打包脚本
================================================================================

配置:
  根目录: D:\WorkBench\ldesign
  清理模式: ✅
  详细输出: ✅
  跳过测试: ❌
  Dry Run: ❌

▶ 生成构建配置...

发现 24 个项目:
  优先级包: 3
  特殊包: 1
  标准包: 14
  Library 项目: 6

================================================================================
开始构建
================================================================================

▶ 构建 @ldesign/kit
✅ @ldesign/kit 构建成功 (12.35s)

▶ 构建 @ldesign/builder
✅ @ldesign/builder 构建成功 (18.72s)

...

================================================================================
构建结果汇总
================================================================================

优先级包:
────────────────────────────────────────────────────────────────────────────────
✅ @ldesign/kit
   状态: SUCCESS
   耗时: 12.35s
   产物: 1/1

✅ @ldesign/builder
   状态: SUCCESS
   耗时: 18.72s
   产物: 1/1

...

================================================================================
统计信息
================================================================================
总计包数: 24
✅ 成功: 24
❌ 失败: 0

总耗时: 5m 32s

🎉 所有项目构建成功！
```

## 💡 使用建议

### 日常开发

```bash
# 快速构建所有包
tsx scripts/build-all.ts

# 完全清理后构建
tsx scripts/build-all.ts --clean
```

### CI/CD

```bash
# CI 环境中使用
tsx scripts/build-all.ts --clean --verbose

# 如果构建失败，脚本会以非零状态码退出
```

### 调试

```bash
# 查看详细构建过程
tsx scripts/build-all.ts --verbose

# 仅查看构建计划
tsx scripts/build-all.ts --dry-run
```

## 🔧 依赖要求

- **Node.js**: >= 16.0.0
- **tsx**: 用于运行 TypeScript 脚本
- **pnpm**: 包管理器

## 📝 添加新包

当添加新包时，脚本会自动检测并添加到构建列表：

1. 在 `packages/` 或 `library/` 目录下创建新包
2. 确保包含 `package.json` 文件
3. 在 `package.json` 中定义 `build` 脚本
4. 运行 `tsx scripts/build-all.ts` 即可

如果新包使用特殊构建工具或有特殊产物，需要修改 `build-all.ts` 中的配置。

## 🐛 故障排查

### 问题：优先级包构建失败

**解决方案**：
1. 检查 kit、builder、launcher 包的依赖是否安装
2. 运行 `pnpm install` 重新安装依赖
3. 单独进入包目录执行 `pnpm build` 查看详细错误

### 问题：产物验证失败

**解决方案**：
1. 使用 `--verbose` 选项查看详细产物信息
2. 检查 `.ldesign/builder.config.ts` 配置是否正确
3. 确认 `package.json` 中的 `build` 脚本是否正确

### 问题：构建速度慢

**解决方案**：
1. 使用 `--skip-tests` 跳过测试（如果适用）
2. 仅构建修改的包，而不是全部构建
3. 考虑增加系统资源分配

## 📚 相关文档

- [Builder 配置模板](../packages/.ldesign-builder-config-template.md)
- [Builder 规范化报告](../packages/BUILDER_STANDARDIZATION_REPORT.md)
- [Builder 文档](../packages/builder/README.md)

## 🤝 贡献

如需改进此脚本：

1. 修改 `build-all.ts`
2. 更新此 README
3. 测试所有构建场景
4. 提交 PR

---

**维护者**: LDesign Team  
**最后更新**: 2025-10-11
