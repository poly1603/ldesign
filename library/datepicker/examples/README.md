# LDesign DatePicker - 示例项目

本目录包含三个独立的示例项目，展示 LDesign DatePicker 的所有功能。

## 📁 目录结构

```
examples/
├── vanilla-js/       # 原生 JavaScript / Web Components 示例
├── vue-example/      # Vue 3 示例
└── react-example/    # React 示例
```

## 🚀 快速开始

### 安装依赖

在根目录运行：

```bash
pnpm install
```

### 运行示例

#### 1. Vanilla JS 示例

```bash
cd examples/vanilla-js
pnpm dev
```

访问：http://localhost:3001

#### 2. Vue 3 示例

```bash
cd examples/vue-example
pnpm dev
```

访问：http://localhost:3002

#### 3. React 示例

```bash
cd examples/react-example
pnpm dev
```

访问：http://localhost:3003

## ✨ 功能展示

所有示例都包含以下完整功能：

### 选择模式（12+种）

- ✅ 基础日期选择
- ✅ 日期范围选择
- ✅ 月份选择
- ✅ 年份选择
- ✅ 日期时间选择
- ✅ 时间选择
- ✅ 月份范围
- ✅ 年份范围
- ✅ 多个日期
- ✅ 星期选择
- ✅ 季度选择

### 高级特性

- ✅ **禁用日期** - 自定义禁用规则
- ✅ **快捷选项** - 预设常用日期范围
- ✅ **自定义格式** - 灵活的日期格式
- ✅ **清空功能** - 快速清除选择
- ✅ **主题切换** - 亮色/暗色主题
- ✅ **国际化** - 6种语言切换

### 用户体验

- ✅ **响应式设计** - 适配各种屏幕
- ✅ **事件日志** - 实时查看事件触发
- ✅ **精美 UI** - 现代化设计
- ✅ **流畅动画** - 过渡效果

## 📖 示例说明

### Vanilla JS 示例

- 使用 Web Components (Lit)
- 原生 JavaScript 操作
- 事件监听和处理
- 适合快速集成

**特点**：

- 无框架依赖
- 直接使用 DOM API
- 适合原生项目

### Vue 3 示例

- 使用 Composition API
- v-model 双向绑定
- 响应式状态管理
- Vue 生态集成

**特点**：

- 声明式开发
- 组件化架构
- 开发体验优秀

### React 示例

- 使用 Hooks
- 受控组件模式
- 状态提升
- TypeScript 支持

**特点**：

- 函数式组件
- 单向数据流
- 类型安全

## 🎯 核心代码示例

### Vanilla JS

```javascript
import '@ldesign/datepicker-lit';

const picker = document.getElementById('date-picker');
picker.addEventListener('change', (e) => {
  console.log('选中:', e.detail);
});
```

### Vue 3

```vue
<script setup>
import { ref } from 'vue';
import { DatePicker } from '@ldesign/datepicker-vue';

const date = ref(null);
</script>

<template>
  <DatePicker v-model="date" type="date" />
</template>
```

### React

```tsx
import { useState } from 'react';
import { DatePicker } from '@ldesign/datepicker-react';

function App() {
  const [date, setDate] = useState(null);
  return <DatePicker value={date} onChange={setDate} />;
}
```

## 🔧 技术栈

- **构建工具**: Vite 5.x
- **包管理**: pnpm
- **Vue**: Vue 3.4+
- **React**: React 18.2+
- **Lit**: Lit 3.1+
- **样式**: CSS + CSS Variables

## 📚 相关文档

- [完整文档](../docs/)
- [API 参考](../docs/api/)
- [快速开始](../GETTING_STARTED.md)
- [项目总结](../PROJECT_SUMMARY.md)

## 🎨 自定义主题

所有示例都支持主题定制：

```css
:root {
  --ldate-primary-color: #f56c6c;
  --ldate-border-radius: 8px;
  --ldate-cell-size: 40px;
}
```

## 🌍 国际化

支持 6 种语言：

- 简体中文 (zh-CN)
- 英语 (en-US)
- 日语 (ja-JP)
- 西班牙语 (es-ES)
- 法语 (fr-FR)
- 德语 (de-DE)

## 💡 提示

1. **开发模式**: 所有示例都使用 Vite HMR，修改代码即时生效
2. **端口设置**: 三个示例使用不同端口，可以同时运行
3. **依赖共享**: 所有示例共享 workspace 依赖，确保版本一致

## 🐛 问题反馈

如果发现问题，请提交 Issue 或 Pull Request。

## 📄 License

MIT © LDesign Team




