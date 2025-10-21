# 基础使用示例

## 快速开始

### 1. 安装

```bash
npm install @ldesign/lowcode
# 或
pnpm add @ldesign/lowcode
```

### 2. 基础使用

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useLowcodeEditor } from '@ldesign/lowcode';
import '@ldesign/lowcode/dist/index.css';

// 创建编辑器实例
const {
  schema,
  selectedComponent,
  addComponent,
  updateComponent,
  deleteComponent,
  selectComponent,
  undo,
  redo,
  exportCode
} = useLowcodeEditor();

// 添加组件示例
function handleAddButton() {
  addComponent({
    id: '',
    type: 'LButton',
    props: {
      text: '按钮'
    },
    events: {},
    children: [],
    layout: {
      type: 'grid',
      gridColumn: 'span 6'
    }
  });
}

// 导出代码
function handleExport() {
  const code = exportCode({ apiStyle: 'composition' });
  console.log(code.full);
}
</script>

<template>
  <div class="editor-container">
    <div class="toolbar">
      <button @click="handleAddButton">添加按钮</button>
      <button @click="undo">撤销</button>
      <button @click="redo">重做</button>
      <button @click="handleExport">导出代码</button>
    </div>
    
    <div class="editor-content">
      <!-- 这里可以放置你的编辑器UI -->
      <pre>{{ JSON.stringify(schema, null, 2) }}</pre>
    </div>
  </div>
</template>
```

### 3. 使用 Schema 管理器

```typescript
import { SchemaManager } from '@ldesign/lowcode';

// 创建 Schema 管理器
const schemaManager = new SchemaManager();

// 添加组件
schemaManager.addComponent({
  id: 'comp_001',
  type: 'LButton',
  props: { text: '按钮' },
  events: {},
  children: [],
  layout: { type: 'grid', gridColumn: 'span 6' }
});

// 更新组件
schemaManager.updateComponent('comp_001', {
  props: { text: '更新后的按钮' }
});

// 删除组件
schemaManager.deleteComponent('comp_001');

// 获取 Schema
const schema = schemaManager.getSchema();

// 导出 Schema (JSON)
const jsonString = schemaManager.exportSchema();

// 导入 Schema
schemaManager.importSchema(JSON.parse(jsonString));
```

### 4. 使用布局引擎

```typescript
import { GridLayoutEngine } from '@ldesign/lowcode';

// 创建 Grid 布局引擎
const gridLayout = new GridLayoutEngine({
  columns: 12,  // 12列网格
  gap: 16       // 16px 间距
});

// 生成容器样式
const containerStyle = gridLayout.generateContainerStyle({
  gridTemplateColumns: 'repeat(12, 1fr)',
  gap: 16
});

// 生成组件样式
const componentStyle = gridLayout.generateComponentStyle({
  type: 'grid',
  gridColumn: 'span 6'  // 占6列
});
```

### 5. 使用代码生成器

```typescript
import { VueCodeGenerator } from '@ldesign/lowcode';

const generator = new VueCodeGenerator();

// 生成代码
const result = generator.generate(schema, {
  apiStyle: 'composition',  // 或 'options'
  typescript: true,
  format: true
});

console.log('完整代码:', result.full);
console.log('模板:', result.template);
console.log('脚本:', result.script);
console.log('样式:', result.style);
console.log('依赖:', result.dependencies);
```

### 6. 使用物料注册表

```typescript
import { MaterialRegistry } from '@ldesign/lowcode';

const registry = new MaterialRegistry();

// 注册物料
registry.register({
  name: 'LButton',
  title: '按钮',
  category: '基础组件',
  icon: 'icon-button',
  component: LButton,
  props: [
    {
      name: 'text',
      label: '按钮文字',
      type: 'string',
      default: '按钮'
    },
    {
      name: 'type',
      label: '类型',
      type: 'select',
      options: [
        { label: '主要', value: 'primary' },
        { label: '默认', value: 'default' }
      ]
    }
  ],
  events: [
    { name: 'click', label: '点击事件' }
  ]
});

// 获取物料
const material = registry.get('LButton');

// 获取所有物料
const allMaterials = registry.getAll();

// 按分类获取
const basicComponents = registry.getByCategory('基础组件');

// 搜索物料
const searchResults = registry.search('按钮');
```

### 7. 使用数据源管理器

```typescript
import { DataSourceManager } from '@ldesign/lowcode';

const dsManager = new DataSourceManager();

// 注册数据源
dsManager.register({
  id: 'userApi',
  name: '用户API',
  type: 'rest',
  config: {
    url: '/api/users',
    method: 'GET'
  },
  autoLoad: true
});

// 执行请求
const response = await dsManager.fetch('userApi');
if (response.success) {
  console.log('数据:', response.data);
}

// 获取缓存的数据
const cachedData = dsManager.getData('userApi');

// 获取状态
const state = dsManager.getState('userApi'); // 'idle' | 'loading' | 'success' | 'error'
```

## 完整示例

```vue
<script setup lang="ts">
import { useLowcodeEditor } from '@ldesign/lowcode';
import '@ldesign/lowcode/dist/index.css';

const editor = useLowcodeEditor({
  version: '1.0.0',
  components: [
    {
      id: 'root',
      type: 'div',
      props: { className: 'container' },
      events: {},
      children: [
        {
          id: 'btn_001',
          type: 'LButton',
          props: { text: '提交' },
          events: { click: { type: 'method', value: 'handleSubmit' } },
          children: [],
          layout: { type: 'grid', gridColumn: 'span 6' }
        }
      ],
      layout: { type: 'grid', gridColumn: 'span 12' }
    }
  ],
  datasources: [],
  variables: {},
  methods: [
    {
      name: 'handleSubmit',
      body: '{ console.log("提交") }',
      async: false
    }
  ]
});

function exportToFile() {
  const code = editor.exportCode({ apiStyle: 'composition', typescript: true });
  
  // 创建并下载文件
  const blob = new Blob([code.full], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'generated-page.vue';
  a.click();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <div class="lowcode-app">
    <h1>低代码平台</h1>
    <button @click="exportToFile">导出为文件</button>
    <pre>{{ JSON.stringify(editor.schema, null, 2) }}</pre>
  </div>
</template>
```

## 下一步

- 查看 [API 文档](../docs/api-reference.md)
- 查看 [自定义物料](./custom-materials.md)
- 查看 [数据绑定](./data-binding.md)



