# 可访问性

LDesign DatePicker 致力于提供优秀的可访问性支持，确保所有用户都能使用。

## ARIA 支持

### 角色和属性

DatePicker 使用了完整的 ARIA 标签：

```html
<!-- 输入框 -->
<input
  role="combobox"
  aria-haspopup="dialog"
  aria-expanded="false"
  aria-label="选择日期"
/>

<!-- 弹出面板 -->
<div
  role="dialog"
  aria-modal="true"
  aria-label="日期选择器"
>
  <!-- 日期网格 -->
  <div role="grid" aria-label="2024年1月">
    <div role="row">
      <button
        role="gridcell"
        aria-label="2024年1月1日"
        aria-selected="false"
        aria-disabled="false"
      >
        1
      </button>
    </div>
  </div>
</div>
```

### 状态提示

使用 `aria-live` 区域宣布重要变化：

```html
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="sr-only"
>
  已选择 2024年1月15日
</div>
```

## 键盘导航

### 基础导航

| 按键 | 功能 |
|------|------|
| `Tab` | 在可聚焦元素间切换 |
| `Shift + Tab` | 反向切换 |
| `Enter` / `Space` | 选择当前日期 |
| `Escape` | 关闭面板 |

### 日期网格导航

| 按键 | 功能 |
|------|------|
| `←` | 前一天 |
| `→` | 后一天 |
| `↑` | 上一周 |
| `↓` | 下一周 |
| `Home` | 月初 |
| `End` | 月末 |
| `Page Up` | 上一月 |
| `Page Down` | 下一月 |

### 示例

```vue
<template>
  <DatePicker
    v-model="date"
    @keydown="handleKeyDown"
  />
</template>

<script setup>
const handleKeyDown = (event) => {
  // 自定义键盘处理
  if (event.key === 'Escape') {
    console.log('取消选择');
  }
};
</script>
```

## 焦点管理

### 焦点陷阱

面板打开时，焦点会被限制在面板内：

```ts
import { trapFocus } from '@ldesign/datepicker-shared';

const panel = document.querySelector('.ldate-panel');
const cleanup = trapFocus(panel);

// 清理
cleanup();
```

### 焦点恢复

关闭面板后，焦点会返回到触发元素：

```ts
// 保存触发元素
const trigger = document.activeElement;

// 打开面板
openPanel();

// 关闭面板
closePanel();

// 恢复焦点
trigger?.focus();
```

## 屏幕阅读器支持

### 语义化 HTML

使用语义化 HTML 标签：

```html
<button type="button">选择日期</button>
<nav aria-label="日期导航">...</nav>
<main role="main">...</main>
```

### 隐藏的辅助文本

为屏幕阅读器用户提供额外的上下文：

```html
<button>
  <span aria-hidden="true">‹</span>
  <span class="sr-only">上一月</span>
</button>
```

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### 宣布变化

使用 `announce` 函数通知屏幕阅读器：

```ts
import { announce } from '@ldesign/datepicker-shared';

// 选择日期后
announce('已选择 2024年1月15日');

// 切换月份后
announce('当前显示 2024年2月');
```

## 颜色对比度

确保足够的颜色对比度（WCAG AA 标准）：

- **正常文本**：至少 4.5:1
- **大文本**：至少 3:1
- **UI 组件**：至少 3:1

```css
/* 确保对比度 */
.ldate-cell {
  color: #333; /* 对比度 > 12:1 */
  background: #fff;
}

.ldate-cell--selected {
  color: #fff; /* 对比度 > 4.5:1 */
  background: #409eff;
}
```

## 禁用状态

清晰地表示禁用状态：

```html
<button
  disabled
  aria-disabled="true"
  class="ldate-cell--disabled"
>
  15
</button>
```

```css
.ldate-cell--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  text-decoration: line-through;
}
```

## 触摸目标大小

确保足够的触摸目标大小（至少 44x44 像素）：

```css
.ldate-cell {
  min-width: 44px;
  min-height: 44px;
}

/* 移动端 */
@media (hover: none) {
  .ldate-cell {
    min-width: 48px;
    min-height: 48px;
  }
}
```

## 测试

### 自动化测试

使用 axe-core 进行可访问性测试：

```bash
pnpm add -D @axe-core/playwright
```

```ts
import { test } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('应该没有可访问性问题', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await injectAxe(page);
  await checkA11y(page);
});
```

### 手动测试

1. **键盘测试**：仅使用键盘操作
2. **屏幕阅读器测试**：使用 NVDA、JAWS 或 VoiceOver
3. **缩放测试**：放大到 200%
4. **高对比度模式**：检查 Windows 高对比度模式

## 最佳实践

### 1. 提供标签

始终为输入框提供标签：

```vue
<template>
  <label for="birth-date">出生日期</label>
  <DatePicker id="birth-date" />
</template>
```

### 2. 错误提示

提供清晰的错误信息：

```vue
<template>
  <DatePicker
    v-model="date"
    :class="{ 'is-error': hasError }"
    aria-invalid="true"
    aria-describedby="error-message"
  />
  <span id="error-message" role="alert">
    请选择有效的日期
  </span>
</template>
```

### 3. 帮助文本

提供帮助文本：

```vue
<template>
  <DatePicker aria-describedby="help-text" />
  <span id="help-text">
    请选择您的出生日期，格式为 YYYY-MM-DD
  </span>
</template>
```

### 4. 必填字段

标记必填字段：

```vue
<template>
  <label>
    日期 <span aria-label="必填">*</span>
  </label>
  <DatePicker required aria-required="true" />
</template>
```

## 参考资源

- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)

## 报告问题

如果发现可访问性问题，请提交 Issue 或 Pull Request。我们致力于让组件对所有用户可用。




