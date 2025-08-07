# 🚀 CI/CD 工作流文档

这个目录包含了 LDesign 项目的所有 GitHub Actions 工作流配置，确保代码质量、构建产物校验和自动化部署
。

## 📋 工作流概览

| 工作流                       | 触发条件     | 主要功能                         | 状态    |
| ---------------------------- | ------------ | -------------------------------- | ------- |
| `ci.yml`                     | Push/PR      | 基础 CI 检查、测试、构建         | ✅ 活跃 |
| `quality.yml`                | Push/PR/定时 | 代码质量、安全审计、依赖检查     | ✅ 活跃 |
| `build-validation.yml`       | Push/PR/手动 | 构建产物校验、包分析、浏览器测试 | 🆕 新增 |
| `bundle-size-monitoring.yml` | Push/PR/定时 | 包大小监控、趋势分析             | 🆕 新增 |
| `performance.yml`            | Push/PR/定时 | 性能基准测试                     | ✅ 活跃 |
| `performance-monitoring.yml` | 定时         | 性能监控和报告                   | ✅ 活跃 |
| `release.yml`                | Tag 推送     | 自动发布和部署                   | ✅ 活跃 |
| `deploy.yml`                 | 发布后       | 部署到各环境                     | ✅ 活跃 |

## 🔍 构建产物校验工作流

### `build-validation.yml`

**功能**: 全面的构建产物质量检查

**触发条件**:

- Push 到主分支（main/develop/master）
- Pull Request
- 手动触发（支持参数）

**主要步骤**:

1. **包检测**: 自动检测有构建产物的包
2. **基础校验**: 运行 `build:check` 检查测试文件、导入、包大小等
3. **详细分析**: 运行 `build:analyze` 进行深度包分析
4. **浏览器测试**: 可选的浏览器兼容性测试
5. **报告生成**: 生成综合校验报告

**手动触发参数**:

```yaml
# 校验特定包
package: 'color'

# 包含浏览器测试
include_browser_tests: true
```

**使用示例**:

```bash
# 在GitHub界面手动触发
Actions -> Build Validation -> Run workflow
- package: color (可选)
- include_browser_tests: true (可选)
```

### 校验结果

工作流会生成以下构件：

- `validation-results-{package}`: 基础校验结果
- `analysis-results-{package}`: 详细分析结果
- `browser-test-results-{package}`: 浏览器测试结果
- `validation-report`: 综合报告

## 📊 包大小监控工作流

### `bundle-size-monitoring.yml`

**功能**: 监控和分析包大小变化

**触发条件**:

- Push 到主分支
- Pull Request
- 每天凌晨 2 点定时运行

**主要功能**:

1. **大小分析**: 分析所有包的 UMD、ES、CJS 格式大小
2. **回归检测**: PR 中检测包大小变化
3. **趋势分析**: 定时分析包大小历史趋势
4. **自动警告**: 大小显著增长时自动失败

**大小阈值**:

- ✅ 正常: < 1MB
- ⚠️ 警告: 1MB - 2MB
- ❌ 超限: > 2MB

**变化阈值**:

- ✅ 正常: < 50KB 增长
- ⚠️ 注意: 50KB - 100KB 增长
- ❌ 显著: > 100KB 增长

## 🔧 集成到现有工作流

### CI 工作流更新

`ci.yml` 已更新，在构建后自动运行基础校验：

```yaml
- name: Build validation
  run: |
    for package_dir in packages/*; do
      if [ -d "$package_dir" ]; then
        package_name=$(basename "$package_dir")
        if grep -q "build:check" "$package_dir/package.json"; then
          cd "$package_dir"
          pnpm run build:check
          cd ../..
        fi
      fi
    done
```

## 📈 监控和报告

### 自动报告

1. **PR 评论**: 校验结果和包大小变化会自动评论到 PR
2. **构件上传**: 详细报告上传为 GitHub 构件
3. **失败通知**: 校验失败时工作流会失败
4. **定时报告**: 定期生成趋势分析报告

### 报告内容

**校验报告包含**:

- 各包的校验状态
- 详细的错误和警告信息
- 性能优化建议
- 包大小分析

**大小监控报告包含**:

- 各格式文件大小
- 与基础分支的对比
- 历史趋势分析
- 优化建议

## 🎯 最佳实践

### 开发者指南

1. **提交前检查**:

   ```bash
   # 本地运行校验
   cd packages/your-package
   pnpm run build:validate
   ```

2. **PR 准备**:

   - 确保所有校验通过
   - 检查包大小变化
   - 查看自动生成的报告

3. **包大小优化**:
   - 使用 Tree Shaking
   - 避免不必要的依赖
   - 优化代码分割

### 维护指南

1. **阈值调整**:

   - 根据项目需求调整大小阈值
   - 更新配置文件中的限制

2. **工作流优化**:

   - 根据团队反馈调整触发条件
   - 优化缓存策略提高速度

3. **报告改进**:
   - 添加更多分析维度
   - 改进报告格式和内容

## 🔧 故障排除

### 常见问题

1. **校验失败**:

   ```bash
   # 检查具体错误
   cd packages/failing-package
   pnpm run build:check --verbose
   ```

2. **包大小超限**:

   ```bash
   # 分析包内容
   cd packages/large-package
   pnpm run build:analyze
   ```

3. **浏览器测试失败**:
   ```bash
   # 安装playwright
   pnpm exec playwright install chromium
   pnpm run build:browser-test
   ```

### 调试技巧

1. **本地复现**:

   - 使用相同的 Node.js 版本
   - 清理缓存后重新安装依赖
   - 检查环境变量

2. **日志分析**:
   - 查看 GitHub Actions 日志
   - 下载构件查看详细报告
   - 检查特定步骤的输出

## 📞 获取帮助

1. **文档**: 查看 `tools/scripts/build/README.md`
2. **示例**: 参考现有包的配置
3. **问题**: 在 GitHub Issues 中报告问题
4. **讨论**: 在团队会议中讨论改进建议

---

🎯 **目标**: 通过自动化的构建产物校验和包大小监控，确保 LDesign 项目的高质量和性能标准！
