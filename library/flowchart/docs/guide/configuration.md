# 配置选项

ApprovalFlow 提供了丰富的配置选项，让你可以根据需求定制编辑器。

## 基础配置

### container

- **类型**: `HTMLElement | string`
- **必填**: 是
- **说明**: 编辑器容器元素或选择器

```js
// 使用元素
const editor = new ApprovalFlowEditor({
  container: document.getElementById('editor'),
});

// 使用选择器
const editor = new ApprovalFlowEditor({
  container: '#editor',
});
```

### width

- **类型**: `number | string`
- **默认值**: `'100%'`
- **说明**: 编辑器宽度

```js
const editor = new ApprovalFlowEditor({
  container: '#editor',
  width: 800,        // 数字表示像素
  // width: '100%',  // 字符串支持百分比
});
```

### height

- **类型**: `number | string`
- **默认值**: `'100%'`
- **说明**: 编辑器高度

```js
const editor = new ApprovalFlowEditor({
  container: '#editor',
  height: 600,       // 数字表示像素
  // height: '100vh', // 字符串支持视口单位
});
```

### readonly

- **类型**: `boolean`
- **默认值**: `false`
- **说明**: 是否为只读模式

```js
const editor = new ApprovalFlowEditor({
  container: '#editor',
  readonly: true, // 只读模式，用户只能查看不能编辑
});
```

## 网格配置

### grid

配置编辑器的网格显示。

```typescript
interface GridConfig {
  visible?: boolean;      // 是否显示网格
  size?: number;         // 网格大小
  type?: 'dot' | 'mesh'; // 网格类型
}
```

**示例**：

```js
const editor = new ApprovalFlowEditor({
  container: '#editor',
  grid: {
    visible: true,    // 显示网格
    size: 20,         // 网格大小 20px
    type: 'dot',      // 点状网格
  },
});
```

## 缩放配置

### zoom

配置画布的缩放行为。

```typescript
interface ZoomConfig {
  minZoom?: number;     // 最小缩放比例
  maxZoom?: number;     // 最大缩放比例
  defaultZoom?: number; // 默认缩放比例
}
```

**示例**：

```js
const editor = new ApprovalFlowEditor({
  container: '#editor',
  zoom: {
    minZoom: 0.2,      // 最小缩放至 20%
    maxZoom: 4,        // 最大缩放至 400%
    defaultZoom: 1,    // 默认 100%
  },
});
```

## 工具栏配置

### toolbar

配置编辑器工具栏。

```typescript
interface ToolbarConfig {
  visible?: boolean;                                    // 是否显示工具栏
  position?: 'top' | 'left' | 'right' | 'bottom';     // 工具栏位置
  tools?: string[];                                     // 工具列表
}
```

**示例**：

```js
const editor = new ApprovalFlowEditor({
  container: '#editor',
  toolbar: {
    visible: true,
    position: 'top',
    tools: [
      'undo',      // 撤销
      'redo',      // 重做
      'zoom-in',   // 放大
      'zoom-out',  // 缩小
      'fit',       // 适应画布
      'download',  // 下载
    ],
  },
});
```

## 小地图配置

### miniMap

配置小地图导航。

```typescript
interface MiniMapConfig {
  visible?: boolean;  // 是否显示小地图
  position?: 'left-top' | 'right-top' | 'left-bottom' | 'right-bottom'; // 位置
}
```

**示例**：

```js
const editor = new ApprovalFlowEditor({
  container: '#editor',
  miniMap: {
    visible: true,
    position: 'right-bottom',
  },
});
```

## 主题配置

### theme

配置编辑器主题。

```typescript
interface ThemeConfig {
  name?: string;                  // 主题名称
  colors?: Record<string, string>; // 自定义颜色
}
```

**示例**：

```js
const editor = new ApprovalFlowEditor({
  container: '#editor',
  theme: {
    name: 'custom',
    colors: {
      primary: '#1890ff',
      success: '#52c41a',
      warning: '#faad14',
      error: '#ff4d4f',
    },
  },
});
```

## 键盘快捷键配置

### keyboard

配置键盘快捷键。

```typescript
interface KeyboardConfig {
  enabled?: boolean; // 是否启用键盘快捷键
}
```

**默认快捷键**：

- `Ctrl/Cmd + Z`: 撤销
- `Ctrl/Cmd + Shift + Z`: 重做
- `Delete`: 删除选中元素
- `Ctrl/Cmd + C`: 复制
- `Ctrl/Cmd + V`: 粘贴
- `Ctrl/Cmd + A`: 全选

**示例**：

```js
const editor = new ApprovalFlowEditor({
  container: '#editor',
  keyboard: {
    enabled: true, // 启用键盘快捷键
  },
});
```

## 对齐线配置

### snapline

配置对齐线。

```typescript
interface SnaplineConfig {
  enabled?: boolean; // 是否启用对齐线
}
```

**示例**：

```js
const editor = new ApprovalFlowEditor({
  container: '#editor',
  snapline: {
    enabled: true, // 启用对齐线
  },
});
```

## 完整配置示例

```js
const editor = new ApprovalFlowEditor({
  // 基础配置
  container: '#editor',
  width: '100%',
  height: '600px',
  readonly: false,

  // 网格配置
  grid: {
    visible: true,
    size: 20,
    type: 'dot',
  },

  // 缩放配置
  zoom: {
    minZoom: 0.2,
    maxZoom: 4,
    defaultZoom: 1,
  },

  // 工具栏配置
  toolbar: {
    visible: true,
    position: 'top',
    tools: ['undo', 'redo', 'zoom-in', 'zoom-out', 'fit', 'download'],
  },

  // 小地图配置
  miniMap: {
    visible: true,
    position: 'right-bottom',
  },

  // 主题配置
  theme: {
    name: 'default',
    colors: {},
  },

  // 键盘快捷键配置
  keyboard: {
    enabled: true,
  },

  // 对齐线配置
  snapline: {
    enabled: true,
  },
});
```

## 运行时修改配置

某些配置可以在运行时修改：

```js
// 切换只读模式
editor.setReadonly(true);

// 修改缩放
editor.zoom(1.5);
```

## 下一步

- [事件系统](/guide/events) - 了解事件系统
- [API 参考](/api/editor) - 查看完整的 API 文档
