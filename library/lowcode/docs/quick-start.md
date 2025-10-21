# 快速开始

## 简介

@ldesign/lowcode 是一个基于 Vue 3 的低代码平台核心库，支持拖拽式页面构建、Grid/Flex 布局、代码导出等功能。

## 安装

```bash
# npm
npm install @ldesign/lowcode

# pnpm  
pnpm add @ldesign/lowcode

# yarn
yarn add @ldesign/lowcode
```

## 核心概念

### Schema

Schema 是页面的 JSON 描述，包含组件树、数据源、变量、方法等：

```typescript
{
  version: '1.0.0',
  components: [...],      // 组件树
  datasources: [...],     // 数据源
  variables: {...},       // 全局变量
  methods: [...]          // 方法定义
}
```

### 组件节点

每个组件节点包含：

```typescript
{
  id: 'comp_001',         // 唯一标识
  type: 'LButton',        // 组件类型
  props: { text: '按钮' }, // 属性
  events: {},             // 事件
  children: [],           // 子组件
  layout: {               // 布局配置
    type: 'grid',
    gridColumn: 'span 6'  // 占6列
  }
}
```

### Grid 布局

默认使用 12 列网格系统：

```css
.container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}

.component {
  grid-column: span 6;  /* 占 6 列 */
}
```

## 基础使用

### 1. 创建编辑器实例

```vue
<script setup lang="ts">
import { useLowcodeEditor } from '@ldesign/lowcode';
import '@ldesign/lowcode/dist/index.css';

const editor = useLowcodeEditor();
</script>
```

### 2. 添加组件

```typescript
editor.addComponent({
  id: '',  // 会自动生成
  type: 'LButton',
  props: { text: '按钮' },
  events: {},
  children: [],
  layout: {
    type: 'grid',
    gridColumn: 'span 6'
  }
});
```

### 3. 导出代码

```typescript
// Composition API 风格
const code = editor.exportCode({
  apiStyle: 'composition',
  typescript: true
});

// Options API 风格
const code = editor.exportCode({
  apiStyle: 'options',
  typescript: true
});

console.log(code.full);  // 完整的 Vue SFC 代码
```

## 生成的代码示例

### Composition API

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LButton } from '@ldesign/form'

const formData = ref({
  username: '',
  password: ''
})

const handleSubmit = () => {
  console.log('提交表单', formData.value)
}
</script>

<template>
  <div class="page-container" :style="containerStyle">
    <div :style="{ gridColumn: 'span 6' }">
      <LButton text="提交" @click="handleSubmit" />
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
  padding: 20px;
  min-height: 100vh;
}
</style>
```

### Options API

```vue
<script lang="ts">
import { LButton } from '@ldesign/form'

export default {
  components: {
    LButton,
  },
  
  data() {
    return {
      formData: {
        username: '',
        password: ''
      }
    }
  },
  
  methods: {
    handleSubmit() {
      console.log('提交表单', this.formData)
    }
  }
}
</script>
```

## 核心 API

### useLowcodeEditor

主要的 Composable 函数：

```typescript
const {
  // 状态
  schema,              // Schema 对象
  selectedComponent,   // 当前选中的组件
  canUndo,            // 是否可撤销
  canRedo,            // 是否可重做
  
  // 方法
  addComponent,       // 添加组件
  updateComponent,    // 更新组件
  deleteComponent,    // 删除组件
  selectComponent,    // 选择组件
  undo,               // 撤销
  redo,               // 重做
  exportCode,         // 导出代码
  importSchema,       // 导入 Schema
  saveSchema          // 保存 Schema
} = useLowcodeEditor();
```

### SchemaManager

Schema 管理：

```typescript
import { SchemaManager } from '@ldesign/lowcode';

const schemaManager = new SchemaManager();

// CRUD 操作
schemaManager.addComponent(component);
schemaManager.updateComponent(id, updates);
schemaManager.deleteComponent(id);
schemaManager.findComponent(id);

// 导入/导出
const jsonString = schemaManager.exportSchema();
schemaManager.importSchema(schema);
```

### GridLayoutEngine

Grid 布局引擎：

```typescript
import { GridLayoutEngine } from '@ldesign/lowcode';

const gridLayout = new GridLayoutEngine({
  columns: 12,
  gap: 16
});

// 生成样式
const containerStyle = gridLayout.generateContainerStyle();
const componentStyle = gridLayout.generateComponentStyle(layout);
```

### MaterialRegistry

物料注册表：

```typescript
import { MaterialRegistry } from '@ldesign/lowcode';

const registry = new MaterialRegistry();

// 注册物料
registry.register(material);

// 查询
registry.get('LButton');
registry.getByCategory('基础组件');
registry.search('按钮');
```

## 下一步

- [核心概念](./concepts.md)
- [物料系统](./materials.md)
- [数据绑定](./data-binding.md)
- [代码生成](./code-generation.md)
- [API 参考](./api-reference.md)



