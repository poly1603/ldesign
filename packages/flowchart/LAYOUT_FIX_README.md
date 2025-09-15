# 节点布局修复说明

## 问题描述

用户反馈：左边所有的物料拖动到画布中生成节点，图标和文本都有重叠或者靠上，需要它们排列整齐，水平、垂直居中。

## 修复方案

### 1. 创建统一的布局管理系统

#### NodeLayoutHelper 工具类
- **位置**: `src/utils/NodeLayoutHelper.ts`
- **功能**: 统一管理节点内图标和文本的布局计算
- **特性**:
  - 支持4种布局模式：垂直、水平、仅图标、仅文本
  - 自动计算最佳位置，避免重叠
  - 支持不同节点形状：圆形、矩形、菱形
  - 智能调整节点大小建议

#### 核心方法
```typescript
// 计算节点内元素的最佳布局
NodeLayoutHelper.calculateLayout(nodeX, nodeY, config)

// 应用布局到LogicFlow文本对象
NodeLayoutHelper.applyLayoutToText(textObj, layout, nodeX, nodeY)

// 获取默认配置
NodeLayoutHelper.getDefaultConfig(nodeType)
```

### 2. 统一的CSS样式系统

#### node-layout.css 样式文件
- **位置**: `src/styles/node-layout.css`
- **功能**: 提供统一的节点布局样式
- **特性**:
  - 基础节点样式（圆形、矩形、菱形）
  - 节点类型特定样式（开始、结束、审批、条件等）
  - 响应式设计支持
  - 无障碍和高对比度支持
  - 悬停和选中状态效果

#### 样式入口文件
- **位置**: `src/styles/index.ts`
- **功能**: 自动加载样式文件，提供备用样式
- **特性**:
  - 自动初始化样式
  - 备用样式支持
  - 样式清理功能

### 3. 节点实现更新

#### 已更新的节点类型

1. **StartNode (开始节点)**
   - 圆形节点，图标在上，文本在下
   - 使用绿色主题，图标和文本垂直居中对齐

2. **EndNode (结束节点)**
   - 圆形节点，图标在上，文本在下
   - 使用红色主题，图标和文本垂直居中对齐

3. **ProcessNode (处理节点)**
   - 矩形节点，图标在上，文本在下
   - 使用灰色主题，图标和文本垂直居中对齐

4. **UserTaskNode (用户任务节点)**
   - 矩形节点，图标在上，文本在下
   - 使用蓝色主题，图标和文本垂直居中对齐

5. **ServiceTaskNode (服务任务节点)**
   - 矩形节点，图标在上，文本在下
   - 使用青色主题，图标和文本垂直居中对齐

6. **ConditionNode (条件节点)**
   - 菱形节点，图标在上，文本在下
   - 使用橙色主题，图标和文本垂直居中对齐

7. **CustomMaterialNode (自定义物料节点)**
   - 支持多种形状，图标在上，文本在下
   - 动态主题，图标和文本垂直居中对齐

#### 更新内容

每个节点都进行了以下更新：

1. **导入 NodeLayoutHelper**
   ```typescript
   import { NodeLayoutHelper } from '../utils/NodeLayoutHelper'
   ```

2. **更新文本位置设置**
   ```typescript
   const layoutConfig = NodeLayoutHelper.getDefaultConfig('rect')
   const layout = NodeLayoutHelper.calculateLayout(this.x, this.y, config)
   
   this.text = {
     value: '节点名称',
     x: layout.textPosition.x,
     y: layout.textPosition.y,
     draggable: false,
     editable: true
   }
   ```

3. **更新图标位置计算**
   ```typescript
   const iconX = layout.iconPosition.x
   const iconY = layout.iconPosition.y
   
   return h('g', {
     transform: `translate(${iconX}, ${iconY})`,
     className: 'lf-node-icon lf-node-type'
   }, [...])
   ```

### 4. 样式集成

#### 主入口文件更新
- **位置**: `src/index.ts`
- **更新**: 添加样式导入 `import './styles'`
- **效果**: 确保样式文件被自动加载

## 修复效果

### 修复前的问题
- 图标和文本重叠
- 文本位置偏上
- 不同节点类型布局不一致
- 缺乏响应式支持

### 修复后的改进
- ✅ 图标和文本完全分离，无重叠
- ✅ 图标在上方，文本在下方，垂直居中对齐
- ✅ 所有节点类型布局统一
- ✅ 支持响应式设计和移动端
- ✅ 支持无障碍和高对比度模式
- ✅ 添加悬停和选中状态效果

## 技术特性

### 布局计算
- 智能间距计算，避免重叠
- 支持不同节点尺寸的自适应
- 文本宽度估算和换行支持
- 节点大小调整建议

### 样式系统
- CSS变量支持主题切换
- 响应式断点设计
- 无障碍标准兼容
- 性能优化的CSS选择器

### 兼容性
- 完全兼容现有LogicFlow API
- 向后兼容旧版本节点
- 支持自定义节点扩展
- 跨浏览器兼容性

## 使用方法

### 基本使用
```typescript
import { FlowchartEditor } from '@ldesign/flowchart'

// 样式会自动加载，无需额外配置
const editor = new FlowchartEditor(container)
```

### 自定义布局
```typescript
import { NodeLayoutHelper } from '@ldesign/flowchart'

// 计算自定义布局
const layout = NodeLayoutHelper.calculateLayout(x, y, {
  nodeType: 'rect',
  size: { width: 120, height: 60 },
  icon: { size: 16, enabled: true },
  text: { fontSize: 12, maxWidth: 100 },
  layout: 'vertical',
  spacing: { iconText: 8, padding: 12 }
})
```

### 样式自定义
```css
/* 自定义节点样式 */
.lf-node-custom .lf-node-icon {
  color: #your-color;
  transform: translateY(-8px);
}

.lf-node-custom .lf-node-text {
  fill: #your-text-color;
  transform: translateY(12px);
}
```

## 测试验证

### 测试文件
- **位置**: `src/test/node-layout-test.html`
- **内容**: 可视化对比修复前后的效果
- **使用**: 在浏览器中打开查看修复效果

### 验证要点
1. 拖拽物料到画布，检查节点布局
2. 验证图标和文本是否分离
3. 检查不同节点类型的一致性
4. 测试响应式效果
5. 验证主题切换效果

## 总结

通过创建统一的 `NodeLayoutHelper` 工具类和 `node-layout.css` 样式系统，完全解决了节点中图标和文本重叠的问题。所有节点现在都使用一致的布局算法，确保图标在上方，文本在下方，并且水平、垂直完美居中对齐。

这个修复不仅解决了当前的布局问题，还为未来的节点扩展提供了标准化的布局基础，提升了整体的用户体验和代码维护性。
