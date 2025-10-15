# 升级指南

## 版本 2.0.0 - 渲染引擎升级

此版本对 Word、Excel 和 PowerPoint 的渲染引擎进行了重大升级，提供更好的样式和布局渲染质量。

### 升级内容

#### 1. Word 渲染器升级
- **旧版本**: mammoth.js
- **新版本**: docx-preview
- **改进**:
  - 更完整的样式支持（字体、颜色、背景等）
  - 更准确的布局渲染
  - 更好的表格和图片支持

#### 2. Excel 渲染器升级
- **旧版本**: 基础 xlsx 库
- **新版本**: x-data-spreadsheet
- **改进**:
  - 完整的样式支持（单元格格式、边框、背景色等）
  - 交互式表格编辑（可选）
  - 更好的公式显示
  - 更接近原生 Excel 体验

#### 3. PowerPoint 渲染器升级
- **旧版本**: 简化的自定义实现
- **新版本**: pptxjs
- **改进**:
  - 高保真幻灯片渲染
  - 完整的样式和布局支持
  - 更好的文本和图片渲染
  - 更准确的幻灯片还原

### 如何升级

#### 1. 更新主库

如果你是使用者，只需更新包版本：

```bash
npm install @ldesign/office-viewer@latest
```

或使用 yarn：

```bash
yarn add @ldesign/office-viewer@latest
```

#### 2. 更新示例项目

如果你在使用示例项目，需要更新依赖：

```bash
cd example
npm install
```

#### 3. 重新安装依赖

如果你在开发或修改库，需要重新安装所有依赖：

```bash
# 在项目根目录
pnpm install

# 重新构建
npm run build
```

### 重大变更

#### API 兼容性
✅ **完全向后兼容** - 所有现有的 API 和配置选项保持不变，无需修改代码。

#### 依赖变更
以下依赖已被替换：

**已移除**:
- mammoth@^1.6.0
- pptxgenjs@^3.12.0

**已添加**:
- docx-preview@^0.3.7
- x-data-spreadsheet@^1.1.9
- pptxjs@^1.9.0

#### 样式变更
渲染结果可能会有视觉上的差异，因为新的渲染引擎提供了更准确的样式还原：

1. **Word 文档**: 字体、颜色、段落样式会更接近原始文档
2. **Excel 表格**: 单元格格式、边框、背景色会完整显示
3. **PowerPoint 幻灯片**: 布局和样式会更准确

### 已知问题

#### Excel 编辑功能
虽然 x-data-spreadsheet 支持编辑功能，但当前版本默认禁用了编辑（`enableEditing: false`）。如需启用，可以在配置中设置：

```typescript
const viewer = new OfficeViewer({
  container: '#viewer',
  source: 'spreadsheet.xlsx',
  excel: {
    enableEditing: true
  }
});
```

#### PowerPoint 动画
pptxjs 当前不支持动画和转场效果，这些功能将在未来版本中添加。

#### 大文件性能
新的渲染引擎在处理大型文件时可能需要更多的内存和处理时间。建议对大文件进行测试。

### 测试建议

升级后，建议进行以下测试：

1. **基础功能测试**
   - 测试 Word、Excel、PowerPoint 文档的基本加载和显示
   - 验证工具栏功能（缩放、下载、打印、全屏）
   - 测试主题切换

2. **样式渲染测试**
   - 比较新旧版本的渲染效果
   - 验证复杂样式的文档是否正确显示
   - 测试包含图片和表格的文档

3. **性能测试**
   - 测试大文件的加载时间
   - 验证内存使用情况
   - 测试在不同浏览器中的表现

### 回退到旧版本

如果遇到问题需要回退，可以安装之前的版本：

```bash
npm install @ldesign/office-viewer@1.0.0
```

### 获取帮助

如果在升级过程中遇到问题：

1. 查看 [README.md](./README.md) 中的故障排除部分
2. 在 GitHub 上提交 Issue
3. 联系维护者

### 贡献

欢迎报告 bug 和提交改进建议！

---

**升级愉快！** 🚀
