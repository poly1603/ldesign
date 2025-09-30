# Drawer 组件使用指南

## 🚨 重要：布尔属性的正确使用方式

### ❌ 错误写法

```html
<!-- 错误！"false" 是字符串，会被当作 true -->
<ldesign-drawer visible="false">
  ...
</ldesign-drawer>

<!-- 错误！"true" 字符串虽然结果正确，但不规范 -->
<ldesign-drawer visible="true">
  ...
</ldesign-drawer>
```

### ✅ 正确写法

```html
<!-- 正确！不设置属性 = false（默认值） -->
<ldesign-drawer id="my-drawer">
  ...
</ldesign-drawer>

<!-- 正确！只要出现属性名，不需要值 = true -->
<ldesign-drawer id="my-drawer" visible>
  ...
</ldesign-drawer>

<!-- 使用 JavaScript 动态控制 -->
<script>
  const drawer = document.getElementById('my-drawer');
  drawer.visible = true;  // 打开
  drawer.visible = false; // 关闭
</script>
```

## 📝 为什么会这样？

在 HTML 中，**所有属性值都是字符串**：

| HTML 写法 | JavaScript 值 | 布尔转换结果 |
|-----------|--------------|-------------|
| 不设置属性 | `undefined` 或默认值 | `false` |
| `visible` | `true` (属性存在) | `true` |
| `visible=""` | `""` (空字符串) | `false` |
| `visible="false"` | `"false"` (非空字符串) | **`true`** ⚠️ |
| `visible="true"` | `"true"` (非空字符串) | `true` |

**关键点**：字符串 `"false"` 是一个**非空字符串**，在 JavaScript 中会被转换为布尔值 `true`！

## 🎯 最佳实践

### 1. HTML 中使用

```html
<!-- ✅ 默认关闭：不设置属性 -->
<ldesign-drawer id="drawer1" drawer-title="我的抽屉">
  <p>内容</p>
</ldesign-drawer>

<!-- ✅ 初始打开：只写属性名 -->
<ldesign-drawer id="drawer2" drawer-title="自动打开" visible>
  <p>内容</p>
</ldesign-drawer>
```

### 2. JavaScript 中控制

```javascript
// 获取 drawer 元素
const drawer = document.getElementById('drawer1');

// 打开 drawer
drawer.visible = true;
// 或
drawer.open();

// 关闭 drawer
drawer.visible = false;
// 或
drawer.close();

// 切换状态
drawer.toggle();
```

### 3. 框架中使用

#### React / Preact
```tsx
import { LdesignDrawer } from '@ldesign/webcomponent/react';

function MyComponent() {
  const [open, setOpen] = useState(false);
  
  return (
    <LdesignDrawer 
      visible={open}  // 使用布尔变量
      drawerTitle="我的抽屉"
      onDrawerClose={() => setOpen(false)}
    >
      <p>内容</p>
    </LdesignDrawer>
  );
}
```

#### Vue 3
```vue
<template>
  <ldesign-drawer 
    :visible="isOpen"  <!-- 使用 v-bind -->
    drawer-title="我的抽屉"
    @drawerClose="isOpen = false"
  >
    <p>内容</p>
  </ldesign-drawer>
</template>

<script setup>
import { ref } from 'vue';
const isOpen = ref(false);
</script>
```

#### Angular
```typescript
@Component({
  template: `
    <ldesign-drawer 
      [visible]="isOpen"
      drawer-title="我的抽屉"
      (drawerClose)="isOpen = false"
    >
      <p>内容</p>
    </ldesign-drawer>
  `
})
export class MyComponent {
  isOpen = false;
}
```

## 🔧 所有布尔属性列表

以下属性都应该遵循相同的规则（不要用 `="false"` 或 `="true"`）：

- `visible` - 是否显示
- `mask` - 是否显示遮罩
- `maskClosable` - 点击遮罩是否关闭
- `closable` - 是否显示关闭按钮
- `animation` - 是否启用动画
- `resizable` - 是否可调整大小
- `swipeToClose` - 是否启用滑动关闭
- `closeOnEsc` - 按 ESC 关闭
- `autoFocus` - 自动聚焦
- `focusTrap` - 焦点捕获
- `restoreFocus` - 恢复焦点
- `rounded` - 是否启用圆角
- `fullscreen` - 是否全屏
- `fullscreenable` - 是否可全屏切换
- `minimizable` - 是否可最小化
- `maximizable` - 是否可最大化
- `showBack` - 是否显示返回按钮
- `headerBorder` - 是否显示头部边框
- `headerSticky` - 头部是否吸顶
- `footerBorder` - 是否显示底部边框
- `destroyOnClose` - 关闭时销毁
- `lockScroll` - 是否锁定页面滚动
- `useTransform` - 使用 transform
- `gpuAcceleration` - GPU 加速
- `showSizeHint` - 是否显示尺寸提示

## 📚 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="path/to/ldesign-webcomponent.js"></script>
</head>
<body>
  <!-- 按钮 -->
  <button id="openBtn">打开抽屉</button>

  <!-- Drawer 组件 -->
  <ldesign-drawer 
    id="myDrawer"
    drawer-title="用户信息"
    placement="right"
    size="md"
    mask
    maskClosable
    closable
  >
    <div style="padding: 20px;">
      <h4>张三</h4>
      <p>邮箱：zhangsan@example.com</p>
      <button id="closeBtn">关闭</button>
    </div>
  </ldesign-drawer>

  <script>
    const drawer = document.getElementById('myDrawer');
    const openBtn = document.getElementById('openBtn');
    const closeBtn = document.getElementById('closeBtn');

    openBtn.addEventListener('click', () => {
      drawer.visible = true;
    });

    closeBtn.addEventListener('click', () => {
      drawer.visible = false;
    });

    // 监听事件
    drawer.addEventListener('drawerOpen', () => {
      console.log('抽屉已打开');
    });

    drawer.addEventListener('drawerClose', (e) => {
      console.log('抽屉已关闭，原因：', e.detail.reason);
    });
  </script>
</body>
</html>
```

## 🐛 故障排查

### 问题：Drawer 初始化时就显示了

**原因**：可能使用了 `visible="false"`

**解决方案**：
```html
<!-- ❌ 错误 -->
<ldesign-drawer visible="false">...</ldesign-drawer>

<!-- ✅ 正确 -->
<ldesign-drawer>...</ldesign-drawer>
```

### 问题：无法关闭 Drawer

**可能原因**：
1. 设置了 `maskClosable="false"` 但又用了字符串
2. 没有 `closable` 属性且没有提供其他关闭方式

**解决方案**：
```html
<!-- 确保有关闭方式 -->
<ldesign-drawer 
  id="drawer" 
  closable  <!-- 显示关闭按钮 -->
  maskClosable  <!-- 或允许点击遮罩关闭 -->
>
  ...
</ldesign-drawer>
```

## 📖 更多信息

- [完整 API 文档](./drawer.md)
- [类型定义](./drawer.types.ts)
- [工具函数](./drawer.utils.ts)