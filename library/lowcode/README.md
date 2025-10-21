# @ldesign/lowcode

> LDesign 低代码平台 - 基于 Vue3 的拖拽式可视化页面构建工具

## ✨ 特性

- 🎨 **拖拽式页面构建** - 从物料面板拖拽组件到画布，快速搭建页面
- 📐 **Grid/Flex 布局** - 支持 Grid（主要）和 Flex 布局，非绝对定位
- 🧩 **丰富的物料系统** - 内置 ldesign 组件库，支持第三方组件库扩展
- ⚙️ **可视化配置** - 属性、样式、事件、数据绑定全可视化配置
- 🔌 **多数据源支持** - REST API、GraphQL、WebSocket
- 💻 **代码导出** - 支持导出 Composition API 或 Options API 风格的 Vue3 代码
- 🔄 **实时预览** - 编辑时即时预览，所见即所得
- ↩️ **撤销/重做** - 完整的历史记录管理
- 🌍 **国际化** - 内置中英文支持，可扩展
- 🎨 **主题系统** - 支持 6+ 种主题色，亮色/暗黑模式切换
- ⌨️ **快捷键** - 完整的快捷键支持（保存、撤销、重做等）
- 🌳 **组件树** - 可视化组件层级关系，支持拖拽排序
- 📱 **响应式预览** - 桌面/平板/手机多设备预览
- 🎯 **现代化 UI** - 美观的界面设计，使用 Lucide 图标
- 📦 **TypeScript** - 完整的类型定义

## 📦 安装

```bash
# npm
npm install @ldesign/lowcode

# pnpm
pnpm add @ldesign/lowcode

# yarn
yarn add @ldesign/lowcode
```

## 🚀 快速开始

### 基础使用

```vue
<template>
  <LowcodeEditor
    v-model:schema="schema"
    :materials="materials"
    @save="handleSave"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LowcodeEditor } from '@ldesign/lowcode';
import '@ldesign/lowcode/dist/index.css';

const schema = ref({
  version: '1.0.0',
  components: [],
  datasources: [],
  variables: {}
});

const materials = ref([
  // 物料配置
]);

function handleSave(newSchema) {
  console.log('保存 Schema:', newSchema);
}
</script>
```

### 核心概念

#### Schema

Schema 是页面的 JSON 描述，包含组件、数据源、变量等信息：

```typescript
interface LowcodeSchema {
  version: string;
  components: ComponentNode[];
  datasources: DataSource[];
  variables: Record<string, any>;
  methods: Method[];
}
```

#### 物料系统

物料是可拖拽到画布的组件，每个物料包含元数据：

```typescript
interface Material {
  name: string;              // 组件名称
  title: string;             // 显示标题
  category: string;          // 分类
  icon: string;              // 图标
  props: PropMeta[];         // 属性定义
  events: EventMeta[];       // 事件定义
  component: Component;      // Vue 组件
}
```

#### Grid 布局

默认使用 12 列网格系统：

```typescript
{
  layout: {
    type: 'grid',
    gridColumn: 'span 6',  // 占 6 列
    gridRow: 'auto'
  }
}
```

#### 数据绑定

支持三种数据绑定方式：

```typescript
// 1. 变量绑定
{
  type: 'variable',
  path: 'formData.username'
}

// 2. 表达式绑定
{
  type: 'expression',
  expression: '{{ userList.length }}'
}

// 3. 数据源绑定
{
  type: 'datasource',
  source: 'userApi',
  path: 'data.items'
}
```

## 📖 核心模块

### 核心引擎 (core)

- **Schema 管理器** - 创建、更新、验证 Schema
- **渲染引擎** - 将 Schema 渲染为真实组件
- **布局引擎** - Grid/Flex 布局计算
- **代码生成器** - 导出 Vue3 代码

### 物料系统 (materials)

- **物料加载器** - 动态加载物料
- **物料注册表** - 管理所有物料
- **内置物料** - 基础组件、表单组件、布局组件

### 编辑器核心 (editor)

- **画布系统** - 可视化编辑区域
- **拖放处理** - HTML5 拖放 API
- **选择管理** - 组件选择、多选
- **历史记录** - 撤销/重做

### 数据源系统 (datasource)

- **REST 连接器** - REST API 集成
- **GraphQL 连接器** - GraphQL 查询
- **WebSocket 连接器** - 实时数据推送

## 🎯 代码导出

### Composition API 风格

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LButton, LInput } from '@ldesign/form'

const formData = ref({
  username: '',
  password: ''
})

const handleSubmit = () => {
  console.log('提交表单', formData.value)
}
</script>

<template>
  <div class="page-container" style="display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px;">
    <div style="grid-column: span 6;">
      <LInput v-model="formData.username" placeholder="用户名" />
    </div>
    <div style="grid-column: span 6;">
      <LButton text="提交" @click="handleSubmit" />
    </div>
  </div>
</template>
```

### Options API 风格

```vue
<script lang="ts">
export default {
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

## 🎨 主题系统

### 主题色切换

```typescript
import { useTheme } from '@ldesign/lowcode';

const { setThemeColor, themeColorPresets } = useTheme();

// 切换主题色
setThemeColor('purple'); // blue, purple, green, orange, red, cyan

// 获取所有主题色预设
console.log(themeColorPresets);
```

### 暗黑模式

```typescript
import { useTheme } from '@ldesign/lowcode';

const { setThemeMode, toggleThemeMode, themeConfig } = useTheme();

// 设置暗黑模式
setThemeMode('dark'); // 'light' | 'dark'

// 切换模式
toggleThemeMode();

// 获取当前主题配置
console.log(themeConfig.value);
```

## 🌍 国际化

### 使用翻译

```typescript
import { useI18n } from '@ldesign/lowcode';

const { t, locale, setLocale } = useI18n();

// 使用翻译
const text = t('editor.toolbar.save'); // 根据当前语言返回 "保存" 或 "Save"

// 切换语言
setLocale('en-US'); // 'zh-CN' | 'en-US'

// 获取当前语言
console.log(locale.value);
```

### 扩展语言包

```typescript
// 在 src/i18n/ 目录下添加新的语言文件
// 例如: ja-JP.ts

export default {
  editor: {
    title: 'ローコードエディター',
    // ...
  }
};

// 然后在 src/i18n/index.ts 中导入
import jaJP from './ja-JP';

export const messages = {
  'zh-CN': zhCN,
  'en-US': enUS,
  'ja-JP': jaJP
};
```

## ⌨️ 快捷键

内置快捷键支持：

- `Ctrl+S` - 保存
- `Ctrl+Z` - 撤销
- `Ctrl+Y` / `Ctrl+Shift+Z` - 重做
- `Delete` / `Backspace` - 删除选中组件
- `Ctrl+C` - 复制
- `Ctrl+V` - 粘贴
- `Esc` - 取消选择

### 自定义快捷键

```typescript
import { useShortcuts, type Shortcut } from '@ldesign/lowcode';

const shortcuts: Shortcut[] = [
  {
    name: 'custom-save',
    keys: 'ctrl+shift+s',
    description: '另存为',
    handler: () => {
      console.log('Save as...');
    }
  }
];

useShortcuts(shortcuts);
```

## 🔧 API 文档

详细的 API 文档请查看 [API Reference](./docs/api-reference.md)

## 📚 示例

- [基础使用](./examples/basic-usage)
- [自定义物料](./examples/custom-materials)
- [数据绑定](./examples/data-binding)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License © 2024 LDesign Team


