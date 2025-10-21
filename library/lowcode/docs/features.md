# @ldesign/lowcode 功能特性

## 🎨 主题系统

### 主题色

支持 6 种精心设计的主题色：

| 主题色 | 颜色值 | 描述 |
|--------|--------|------|
| 拂晓蓝 (blue) | #1890ff | 默认主题色，经典蓝色 |
| 酱紫 (purple) | #722ed1 | 优雅的紫色主题 |
| 极光绿 (green) | #52c41a | 清新的绿色主题 |
| 日暮橙 (orange) | #fa8c16 | 温暖的橙色主题 |
| 薄暮红 (red) | #f5222d | 热情的红色主题 |
| 明青 (cyan) | #13c2c2 | 清爽的青色主题 |

### 暗黑模式

- 完整的暗黑模式支持
- 使用 CSS Variables 实现，性能优异
- 自动适配所有 UI 组件
- 支持亮色/暗黑模式一键切换

### 实现原理

```typescript
// 主题色通过 CSS Variables 动态设置
:root {
  --primary-color: #1890ff;
  --primary-hover: #40a9ff;
  --primary-active: #096dd9;
  // ...
}

// 暗黑模式通过添加 .dark-theme 类实现
.dark-theme {
  --text-color: #e8e8e8;
  --bg-color: #1f1f1f;
  // ...
}
```

## 🌍 国际化系统

### 支持的语言

- 🇨🇳 简体中文 (zh-CN)
- 🇺🇸 English (en-US)
- 可扩展更多语言

### 翻译覆盖

- 编辑器界面
- 工具栏按钮
- 面板标题
- 提示信息
- 组件属性

### 使用方式

```typescript
import { useI18n } from '@ldesign/lowcode';

const { t } = useI18n();

// 使用翻译
const title = t('editor.title'); // "低代码编辑器" 或 "Lowcode Editor"
```

## ⌨️ 快捷键系统

### 内置快捷键

| 快捷键 | 功能 | 描述 |
|--------|------|------|
| Ctrl+S | 保存 | 保存当前 Schema |
| Ctrl+Z | 撤销 | 撤销上一步操作 |
| Ctrl+Y | 重做 | 重做下一步操作 |
| Ctrl+Shift+Z | 重做 | 重做下一步操作（备选） |
| Delete | 删除 | 删除选中的组件 |
| Backspace | 删除 | 删除选中的组件（备选） |
| Ctrl+C | 复制 | 复制选中的组件 |
| Ctrl+V | 粘贴 | 粘贴组件 |
| Ctrl+A | 全选 | 全选所有组件 |
| Esc | 取消选择 | 取消当前选择 |

### 自定义快捷键

```typescript
import { useShortcuts } from '@ldesign/lowcode';

const shortcuts = [
  {
    name: 'export',
    keys: 'ctrl+e',
    description: '导出代码',
    handler: () => {
      // 执行导出逻辑
    }
  }
];

useShortcuts(shortcuts);
```

### 快捷键冲突检测

系统会自动检测输入框焦点，避免快捷键冲突：
- 输入框、文本框等可编辑元素中，大部分快捷键自动禁用
- Esc 键在所有情况下均可使用

## 🌳 组件树

### 功能特性

- 📁 **层级展示** - 树形结构展示组件层级关系
- 🔍 **快速定位** - 点击树节点快速选中对应组件
- ✏️ **编辑操作** - 支持删除、重命名等操作
- 🎯 **可视化** - 图标化展示不同类型的组件

### 组件识别

系统会自动识别组件类型并显示对应图标：
- 按钮组件 → 指针图标
- 输入框组件 → 文字图标
- 容器组件 → 盒子图标
- 布局组件 → 布局图标

## 📱 响应式预览

### 设备类型

- 🖥️ **桌面** (Desktop) - 100% 宽度
- 📱 **平板** (Tablet) - 768px 宽度
- 📱 **手机** (Mobile) - 375px 宽度

### 切换方式

- 工具栏设备图标按钮
- 快捷键 (即将支持)
- 实时预览不同设备下的效果

## 🗄️ 数据源管理

### 支持的数据源类型

- REST API
- GraphQL (规划中)
- WebSocket (规划中)
- Mock 数据

### 功能特性

- ✨ 添加/编辑/删除数据源
- 🔍 数据源列表查看
- 🧪 数据源测试
- 🔗 数据绑定

## 🎨 图标系统

### Lucide Icons

使用 [lucide-vue-next](https://lucide.dev/) 图标库：
- 🎯 1000+ 精美图标
- ⚡ 轻量级，性能优异
- 🎨 完美适配主题色
- 📦 Tree-shaking 支持

### 图标使用

```vue
<template>
  <Icon name="Save" :size="16" />
  <Icon name="Settings" :size="20" color="#1890ff" />
</template>

<script setup>
import { Icon } from '@ldesign/lowcode';
</script>
```

## ⚙️ 设置面板

集中管理编辑器配置：

- 🎨 主题模式切换 (亮色/暗黑)
- 🌈 主题色选择 (6 种颜色)
- 🌍 语言切换 (中文/英文)
- ⚙️ 编辑器选项 (网格显示等)

## 🎯 UI/UX 优化

### 视觉设计

- 🎨 现代化的设计语言
- 💫 流畅的过渡动画
- 🎯 统一的视觉风格
- ✨ 精致的细节处理

### 交互优化

- 🖱️ 改进的拖拽体验
- 👆 直观的点击反馈
- 🎯 清晰的选中状态
- 💡 友好的空状态提示

### 布局优化

- 📐 左右侧边栏面板切换
- 🎯 更合理的空间利用
- 📱 响应式布局
- 🎨 可折叠的面板

## 🚀 性能优化

### CSS Variables

- ✨ 主题切换无需重新渲染
- ⚡ 即时生效，无闪烁
- 🎯 更小的运行时开销

### Tree-shaking

- 📦 按需导入图标
- 🎯 减少打包体积
- ⚡ 更快的加载速度

### 代码分割

- 📦 组件按需加载
- 🎯 优化首屏加载
- ⚡ 提升整体性能

## 📦 TypeScript 支持

### 完整的类型定义

- ✅ 所有 API 都有类型定义
- ✅ 完善的类型提示
- ✅ 更好的开发体验
- ✅ 减少运行时错误

### 类型导出

```typescript
import type {
  ThemeConfig,
  ThemeColor,
  ThemeMode,
  Locale,
  Shortcut,
  Material,
  ComponentNode
} from '@ldesign/lowcode';
```

## 🔧 可扩展性

### 自定义主题

```typescript
// 自定义主题色
import { applyThemeColor } from '@ldesign/lowcode';

applyThemeColor('purple');
```

### 自定义语言包

```typescript
// 添加新语言
import { messages } from '@ldesign/lowcode';

messages['ja-JP'] = {
  editor: {
    title: 'ローコードエディター'
  }
};
```

### 自定义快捷键

```typescript
// 添加自定义快捷键
import { useShortcuts } from '@ldesign/lowcode';

const customShortcuts = [
  // 自定义快捷键配置
];

useShortcuts(customShortcuts);
```

## 📚 最佳实践

### 主题初始化

```typescript
import { onMounted } from 'vue';
import { useTheme } from '@ldesign/lowcode';

const { initTheme } = useTheme();

onMounted(() => {
  // 在应用挂载后初始化主题
  initTheme();
});
```

### 国际化配置

```typescript
import { useI18n } from '@ldesign/lowcode';

const { setLocale } = useI18n();

// 根据用户偏好设置语言
const userLang = localStorage.getItem('user-lang') || 'zh-CN';
setLocale(userLang);
```

### 快捷键管理

```typescript
import { useShortcuts, createEditorShortcuts } from '@ldesign/lowcode';

// 使用预设的编辑器快捷键
const shortcuts = createEditorShortcuts({
  onSave: () => console.log('Save'),
  onUndo: () => console.log('Undo'),
  onRedo: () => console.log('Redo')
});

useShortcuts(shortcuts);
```

## 🎉 总结

@ldesign/lowcode 2.0 是一次重大升级，带来了：

- ✅ 更美观的界面
- ✅ 更强大的功能
- ✅ 更好的用户体验
- ✅ 更完善的类型定义
- ✅ 更灵活的扩展性

立即升级，体验全新的低代码开发体验！


