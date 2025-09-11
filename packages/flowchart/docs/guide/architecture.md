# 架构设计

@ldesign/flowchart 采用了统一的架构设计，确保在不同环境中都能提供一致的功能体验。

## 核心架构

### 1. 核心层 (Core Layer)

**FlowchartEditor 类**是整个架构的核心，内置了所有功能：

```typescript
import { FlowchartEditor } from '@ldesign/flowchart'

const editor = new FlowchartEditor({
  container: '#flowchart',
  // 完整的UI配置
  toolbar: { visible: true },
  nodePanel: { visible: true },
  propertyPanel: { visible: true }
})

editor.render()
```

**核心特性：**
- 🎯 **统一功能**：原生JS和Vue用户获得完全相同的功能
- 🔧 **内置UI**：使用原生DOM API实现完整的UI组件
- 🎨 **主题系统**：支持多种主题，动态切换
- 📱 **响应式布局**：自适应不同屏幕尺寸
- ⚙️ **配置驱动**：通过配置控制UI组件的显示/隐藏

### 2. UI层 (UI Layer)

**原生DOM实现**，不依赖任何框架：

```
src/ui/native/
├── MaterialPanel.ts    # 物料面板
├── PropertyPanel.ts    # 属性面板
└── Toolbar.ts         # 工具栏
```

**特点：**
- 🚀 **框架无关**：纯原生DOM API实现
- 🎨 **主题支持**：CSS变量系统，支持动态主题切换
- 📱 **响应式设计**：适配不同屏幕尺寸
- ♿ **无障碍支持**：符合Web无障碍标准

### 3. Vue集成层 (Vue Integration Layer)

为Vue用户提供便捷的组件和Hook：

#### Vue组件
```vue
<template>
  <FlowchartEditorVue
    :width="800"
    :height="600"
    :readonly="false"
    :theme="'default'"
    @node:click="onNodeClick"
    @data:change="onDataChange"
  />
</template>
```

#### Vue Hook
```typescript
import { useFlowchart } from '@ldesign/flowchart'

const {
  editor,
  isReady,
  selectedNode,
  init,
  getData,
  setData
} = useFlowchart({
  width: 800,
  height: 600
})
```

## 使用场景

### 1. 原生JavaScript项目

**完整UI版本：**
```javascript
const editor = new FlowchartEditor({
  container: '#flowchart',
  // 启用完整UI
  toolbar: { visible: true },
  nodePanel: { visible: true },
  propertyPanel: { visible: true }
})
```

**纯API版本：**
```javascript
const editor = new FlowchartEditor({
  container: '#flowchart',
  // 禁用UI，使用纯API
  toolbar: { visible: false },
  nodePanel: { visible: false },
  propertyPanel: { visible: false }
})

// 通过API操作
editor.addNode({ type: 'start', x: 100, y: 100 })
```

### 2. Vue 3项目

**组件方式：**
```vue
<FlowchartEditorVue
  :readonly="isReadonly"
  :theme="currentTheme"
  @ready="onEditorReady"
/>
```

**Hook方式：**
```typescript
const { editor, init, getData } = useFlowchart()

onMounted(() => {
  init('#flowchart')
})
```

### 3. 其他框架

由于核心是原生实现，可以轻松集成到任何框架：

**React示例：**
```jsx
useEffect(() => {
  const editor = new FlowchartEditor({
    container: containerRef.current
  })
  editor.render()
  
  return () => editor.destroy()
}, [])
```

## 技术实现

### 1. 原生DOM UI组件

```typescript
export class MaterialPanel {
  private container: HTMLElement
  private panelElement: HTMLElement | null = null

  constructor(container: HTMLElement, config: MaterialPanelConfig) {
    this.container = container
    this.init()
  }

  private createPanel(): void {
    this.panelElement = document.createElement('div')
    this.panelElement.className = 'ldesign-material-panel'
    // 创建完整的DOM结构
  }

  public setTheme(theme: FlowchartTheme): void {
    // 主题切换逻辑
  }
}
```

### 2. Vue组件封装

```vue
<script setup lang="ts">
import { FlowchartEditor } from '../core/FlowchartEditor'

const containerRef = ref<HTMLElement>()
let editor: FlowchartEditor | null = null

onMounted(() => {
  editor = new FlowchartEditor({
    container: containerRef.value,
    ...props
  })
  editor.render()
})
</script>
```

### 3. 事件系统

```typescript
// 核心编辑器事件
editor.on('node:click', (node) => {
  console.log('节点被点击:', node)
})

editor.on('data:change', (data) => {
  console.log('数据已更新:', data)
})

// Vue组件事件传递
emit('node:click', node)
emit('data:change', data)
```

## 优势

### 1. 功能一致性
- ✅ 原生JS和Vue用户获得完全相同的功能
- ✅ 不会出现功能差异或兼容性问题
- ✅ 统一的API设计和使用方式

### 2. 维护简单
- ✅ 只需要维护一套核心逻辑
- ✅ Vue组件只是薄薄的封装层
- ✅ 新功能自动在所有环境中可用

### 3. 性能优异
- ✅ 原生DOM操作，性能最优
- ✅ 无框架依赖，包体积小
- ✅ 按需加载，支持Tree Shaking

### 4. 扩展性强
- ✅ 可以轻松集成到任何框架
- ✅ 支持自定义主题和样式
- ✅ 插件系统支持功能扩展

## 最佳实践

### 1. 选择合适的使用方式

**Vue项目推荐：**
- 简单场景：使用Vue组件
- 复杂场景：使用useFlowchart Hook
- 需要完全控制：直接使用FlowchartEditor类

**原生JS项目推荐：**
- 完整功能：启用所有UI组件
- 自定义UI：禁用UI组件，使用API
- 嵌入现有系统：根据需求选择性启用UI

### 2. 主题定制

```typescript
// 使用内置主题
editor.setTheme('dark')

// 自定义主题（通过CSS变量）
document.documentElement.style.setProperty('--ldesign-brand-color', '#1890ff')
```

### 3. 事件处理

```typescript
// 监听关键事件
editor.on('node:select', (node) => {
  // 更新外部状态
  updateSelectedNode(node)
})

editor.on('data:change', (data) => {
  // 自动保存
  saveToServer(data)
})
```

### 4. 错误处理

```typescript
try {
  const editor = new FlowchartEditor(config)
  editor.render()
} catch (error) {
  console.error('编辑器初始化失败:', error)
  // 显示错误信息给用户
}
```

## 总结

@ldesign/flowchart 的架构设计确保了：

1. **统一体验**：所有环境下功能完全一致
2. **简单易用**：提供多种使用方式，满足不同需求
3. **高性能**：原生实现，性能优异
4. **易维护**：单一核心，多层封装
5. **可扩展**：支持主题定制和插件扩展

这种设计让开发者可以根据项目需求选择最合适的使用方式，同时保证了功能的完整性和一致性。
