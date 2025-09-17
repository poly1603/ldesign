# 新增图标示例

本文档演示如何向 LDesign Icons 系统添加新图标。

## 📝 步骤演示

### 1. 准备 SVG 文件

创建一个新的 SVG 图标文件 `my-custom-icon.svg`：

```svg
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <g id="my-custom-icon">
    <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" fill="none"/>
  </g>
</svg>
```

### 2. 添加到源目录

```bash
# 将 SVG 文件复制到源目录
cp my-custom-icon.svg tdesign-icons-develop/svg/
```

### 3. 运行构建

```bash
# 构建所有框架的组件
npm run build:all
```

### 4. 验证结果

```bash
# 验证构建是否成功
npm run verify
```

## 🎯 生成的组件

构建完成后，会自动生成以下组件：

### React 组件
```tsx
// src/packages/react/src/components/my-custom-icon.tsx
import React from 'react';

interface IconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

const MyCustomIconIcon: React.FC<IconProps> = ({
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className,
  style,
  ...props
}) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={style}>
      <g id="my-custom-icon">
        <path d="M12 2L22 12L12 22L2 12L12 2Z" stroke={color} strokeWidth={strokeWidth} fill="none"/>
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} fill="none"/>
      </g>
    </svg>
  );
};

export default MyCustomIconIcon;
```

### Vue 组件
```vue
<!-- src/packages/vue-next/src/components/my-custom-icon.vue -->
<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" :class="className" :style="style">
    <g id="my-custom-icon">
      <path d="M12 2L22 12L12 22L2 12L12 2Z" :stroke="color" :stroke-width="strokeWidth" fill="none"/>
      <circle cx="12" cy="12" r="3" :stroke="color" :stroke-width="strokeWidth" fill="none"/>
    </g>
  </svg>
</template>

<script setup lang="ts">
interface IconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
  style?: Record<string, any>;
}

withDefaults(defineProps<IconProps>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
});
</script>
```

### Angular 组件
```typescript
// src/packages/angular/src/components/my-custom-icon.component.ts
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tdesign-my-custom-icon',
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24">
      <g id="my-custom-icon">
        <path d="M12 2L22 12L12 22L2 12L12 2Z" [attr.stroke]="color" [attr.stroke-width]="strokeWidth" fill="none"/>
        <circle cx="12" cy="12" r="3" [attr.stroke]="color" [attr.stroke-width]="strokeWidth" fill="none"/>
      </g>
    </svg>
  `,
  standalone: true
})
export class MyCustomIconComponent {
  @Input() size: number | string = 24;
  @Input() color: string = 'currentColor';
  @Input() strokeWidth: number = 2;
}
```

## 📋 自动更新的文件

新图标会自动更新以下文件：

### 1. index.ts 导出文件
```typescript
// 自动添加到各框架的 index.ts
export { default as MyCustomIconIcon } from './components/my-custom-icon';
```

### 2. manifest.json 元数据
```json
{
  "icons": [
    {
      "name": "my-custom-icon",
      "componentName": "MyCustomIconIcon",
      "category": "outlined",
      "keywords": ["my", "custom", "icon"],
      "size": "24x24"
    }
  ]
}
```

### 3. types.ts 类型定义
```typescript
// 自动添加类型定义
export declare const MyCustomIconIcon: React.ComponentType<IconProps>;
```

## ✅ 使用新图标

构建完成后，就可以在项目中使用新图标了：

```tsx
// React
import { MyCustomIconIcon } from './src/packages/react/src';
<MyCustomIconIcon size={32} color="blue" />

// Vue
import { MyCustomIconIcon } from './src/packages/vue-next/src';
<MyCustomIconIcon :size="32" color="blue" />
```

## 🔍 验证清单

- [ ] SVG 文件包含正确的 viewBox
- [ ] 文件名使用 kebab-case 格式
- [ ] 构建成功无错误
- [ ] 生成的组件语法正确
- [ ] 组件在 index.ts 中正确导出
- [ ] manifest.json 包含新图标信息

## 💡 最佳实践

1. **命名规范**: 使用描述性的 kebab-case 名称
2. **SVG 优化**: 使用 SVGO 预先优化 SVG
3. **viewBox**: 确保使用标准的 24x24 viewBox
4. **颜色**: 使用 `currentColor` 或 `stroke/fill` 属性
5. **测试**: 构建后验证组件是否正常工作
