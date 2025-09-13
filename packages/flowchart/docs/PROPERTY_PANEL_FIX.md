# 属性面板画布刷新问题修复说明

## 问题描述

在使用属性面板（PropertyPanel 或 EnhancedPropertyPanel）修改节点或连线属性后，画布不会立即刷新显示最新的更改。用户需要手动触发其他操作（如点击画布）才能看到属性变更的效果。

## 问题根因分析

1. **回调连接缺失**：属性面板的更新回调（`onUpdateNode`、`onUpdateEdge`）只有在启用 UIManager 时才会正确连接到 FlowchartEditor 的更新方法。

2. **画布刷新缺失**：FlowchartEditor 的 `updateNode` 和 `updateEdge` 方法只调用了 LogicFlow 的数据更新 API，但没有显式触发画布重新渲染。

## 修复方案

### 1. 添加手动连接属性面板的方法

在 `FlowchartEditor.ts` 中新增了以下方法：

#### `connectPropertyPanel(propertyPanel)`
允许手动连接属性面板到编辑器，建立事件监听：
- 监听节点选择事件，同步选中状态到属性面板
- 监听连线选择事件，同步选中状态到属性面板  
- 监听画布点击事件，清除属性面板选择状态

#### `createPropertyPanelCallbacks()`
返回可直接用于属性面板配置的回调函数对象：
```javascript
{
  onUpdateNode: (nodeId, updates) => this.updateNode(nodeId, updates),
  onUpdateEdge: (edgeId, updates) => this.updateEdge(edgeId, updates)
}
```

### 2. 添加显式画布刷新调用

在 `updateNode` 和 `updateEdge` 方法中，在调用 LogicFlow 的数据更新 API 后，显式调用 `this.lf.render()` 确保视觉更新立即生效。

## 使用方式

### 方式一：使用新的连接方法

```javascript
// 1. 创建编辑器（禁用 UIManager）
const editor = new FlowchartEditor({
  container: document.getElementById('editor'),
  ui: { enabled: false }
})

// 2. 创建属性面板
const propertyPanel = new PropertyPanel(container)

// 3. 获取回调函数
const callbacks = editor.createPropertyPanelCallbacks()
propertyPanel.onUpdateNode = callbacks.onUpdateNode
propertyPanel.onUpdateEdge = callbacks.onUpdateEdge

// 4. 连接属性面板到编辑器
editor.connectPropertyPanel(propertyPanel)
```

### 方式二：直接设置回调函数

```javascript
const editor = new FlowchartEditor({...})
const propertyPanel = new PropertyPanel(container)

// 直接设置回调函数
propertyPanel.onUpdateNode = (nodeId, updates) => {
  editor.updateNode(nodeId, updates)
}
propertyPanel.onUpdateEdge = (edgeId, updates) => {
  editor.updateEdge(edgeId, updates)
}

// 手动处理选择事件
editor.on('node:click', ({ node }) => {
  propertyPanel.setSelectedNode(node)
})
editor.on('edge:click', ({ edge }) => {
  propertyPanel.setSelectedEdge(edge)
})
editor.on('canvas:click', () => {
  propertyPanel.setSelectedNode(null)
  propertyPanel.setSelectedEdge?.(null)
})
```

## 示例代码

完整的使用示例请参考：`examples/property-panel-standalone.html`

该示例演示了：
- 如何创建自定义属性面板
- 如何连接属性面板到编辑器
- 如何实现属性更改的实时画布刷新
- 工具栏操作和属性编辑的交互

## 兼容性说明

- ✅ 向后兼容：现有使用 UIManager 的代码无需修改
- ✅ 性能优化：显式刷新调用不会影响其他操作的性能
- ✅ 类型安全：新增方法提供完整的 TypeScript 类型支持

## 测试验证

修复后的功能可以通过以下步骤验证：

1. 打开示例页面 `property-panel-standalone.html`
2. 点击工具栏添加节点
3. 点击节点选中，观察属性面板显示
4. 修改节点文本或坐标，点击"应用更改"
5. 验证画布立即显示更新后的内容（无需额外操作）

## 后续优化建议

1. 考虑添加防抖机制，避免频繁属性更改导致的过多渲染
2. 提供批量更新 API，支持同时更新多个节点/连线
3. 增加更新事务支持，允许回滚属性更改
4. 添加属性验证机制，确保更新数据的有效性
