# Dialog弹窗系统

LDesign Engine 提供了功能强大的弹窗系统，支持多种弹窗类型和丰富的交互功能。

## 快速开始

```typescript
import { dialog } from '@ldesign/engine'

// 显示不同类型的弹窗
await dialog.alert('操作成功！')
const confirmed = await dialog.confirm('确定要删除吗？')
const userInput = await dialog.prompt('请输入您的姓名：', '默认值')
```

## 弹窗类型

### Alert 提示弹窗

```typescript
// 基础用法
await dialog.alert('操作成功！')

// 带配置的提示弹窗
await dialog.alert('重要提示', {
  title: '系统通知',
  width: 400,
  customClass: 'important-alert'
})
```

### Confirm 确认弹窗

```typescript
// 基础用法
const result = await dialog.confirm('确定要删除这条记录吗？')
if (result) {
  console.log('用户确认删除')
} else {
  console.log('用户取消删除')
}

// 自定义按钮文本
const confirmed = await dialog.confirm('确定要继续吗？', {
  title: '确认操作',
  buttons: [
    { text: '取消', onClick: (dialog) => dialog.close(false) },
    { text: '继续', type: 'primary', onClick: (dialog) => dialog.close(true) }
  ]
})
```

### Prompt 输入弹窗

```typescript
// 基础用法
const name = await dialog.prompt('请输入您的姓名：')
console.log('用户输入:', name)

// 带默认值
const email = await dialog.prompt('请输入邮箱：', 'user@example.com')

// 自定义验证
const age = await dialog.prompt('请输入年龄：', '', {
  title: '用户信息',
  beforeClose: async (result) => {
    if (result && isNaN(Number(result))) {
      dialog.alert('请输入有效的数字')
      return false
    }
    return true
  }
})
```

### Custom 自定义弹窗

```typescript
const instance = await dialog.open({
  title: '自定义弹窗',
  content: '这是自定义内容',
  width: 500,
  height: 300,
  draggable: true,
  resizable: true,
  buttons: [
    {
      text: '取消',
      onClick: (dialog) => dialog.close(false)
    },
    {
      text: '确定',
      type: 'primary',
      onClick: (dialog) => dialog.close(true)
    }
  ]
})
```

## 配置选项

### 基础配置

```typescript
dialog.open({
  type: 'custom',
  title: '弹窗标题',
  content: '弹窗内容',
  width: 600,
  height: 400,
  modal: true,
  closable: true,
  maskClosable: true,
  escClosable: true,
  centered: true,
  zIndex: 2000,
  customClass: 'my-dialog'
})
```

### 交互功能

```typescript
dialog.open({
  title: '交互弹窗',
  content: '支持拖拽和调整大小',
  draggable: true,
  resizable: true,
  animation: 'zoom',
  animationDuration: 500
})
```

### 样式定制

```typescript
dialog.open({
  title: '自定义样式',
  content: '自定义样式的弹窗',
  bodyStyle: {
    padding: '30px',
    backgroundColor: '#f5f5f5'
  },
  headerStyle: {
    backgroundColor: '#409eff',
    color: 'white'
  },
  footerStyle: {
    textAlign: 'center'
  },
  maskStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  }
})
```

## 生命周期钩子

```typescript
dialog.open({
  title: '生命周期示例',
  content: '演示生命周期钩子',
  onOpen: () => {
    console.log('弹窗已打开')
  },
  onClose: (result) => {
    console.log('弹窗已关闭，结果：', result)
  },
  beforeClose: async (result) => {
    // 可以在这里进行异步验证
    const confirmed = await dialog.confirm('确定要关闭吗？')
    return confirmed
  }
})
```

## 高级用法

### 自定义弹窗管理器

```typescript
import { createDialogManager } from '@ldesign/engine'

const customDialogManager = createDialogManager({
  zIndexBase: 3000,
  maxDialogs: 5,
  defaultAnimation: 'zoom',
  escapeKeyClose: true,
  clickMaskClose: false
})

await customDialogManager.initialize()

const customDialog = await customDialogManager.open({
  title: '自定义管理器弹窗',
  content: '使用自定义管理器创建的弹窗'
})
```

### HTML内容

```typescript
dialog.open({
  title: 'HTML内容',
  content: `
    <div style="text-align: center;">
      <h3>欢迎使用</h3>
      <p>这是一个包含<strong>HTML</strong>内容的弹窗</p>
      <img src="/logo.png" alt="Logo" style="width: 100px;">
    </div>
  `,
  html: true,
  width: 400
})
```

### 动态更新

```typescript
const instance = await dialog.open({
  title: '动态更新',
  content: '初始内容',
  buttons: [
    {
      text: '更新内容',
      onClick: (dialog) => {
        dialog.update({
          title: '更新后的标题',
          content: '更新后的内容'
        })
      }
    },
    {
      text: '关闭',
      type: 'primary',
      onClick: (dialog) => dialog.close()
    }
  ]
})
```

### 嵌套弹窗

```typescript
const parentDialog = await dialog.open({
  title: '父弹窗',
  content: '这是父弹窗',
  buttons: [
    {
      text: '打开子弹窗',
      onClick: async () => {
        const childResult = await dialog.open({
          title: '子弹窗',
          content: '这是子弹窗',
          buttons: [
            { text: '关闭', onClick: (dialog) => dialog.close('child-result') }
          ]
        })
        console.log('子弹窗结果:', childResult)
      }
    }
  ]
})
```

## API 参考

### DialogManager

| 方法 | 说明 | 参数 | 返回值 |
|------|------|------|--------|
| `open(options)` | 打开弹窗 | `DialogOptions` | `Promise<DialogInstance>` |
| `alert(content, options?)` | 显示提示弹窗 | `string, Partial<DialogOptions>` | `Promise<void>` |
| `confirm(content, options?)` | 显示确认弹窗 | `string, Partial<DialogOptions>` | `Promise<boolean>` |
| `prompt(content, defaultValue?, options?)` | 显示输入弹窗 | `string, string, Partial<DialogOptions>` | `Promise<string \| null>` |
| `close(id, result?)` | 关闭指定弹窗 | `string, any` | `Promise<boolean>` |
| `closeAll()` | 关闭所有弹窗 | - | `Promise<void>` |

### DialogOptions

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | 自动生成 | 弹窗唯一标识 |
| `type` | `'alert' \| 'confirm' \| 'prompt' \| 'custom'` | `'custom'` | 弹窗类型 |
| `title` | `string` | - | 弹窗标题 |
| `content` | `string` | - | 弹窗内容 |
| `html` | `boolean` | `false` | 是否支持HTML内容 |
| `width` | `string \| number` | `'auto'` | 弹窗宽度 |
| `height` | `string \| number` | `'auto'` | 弹窗高度 |
| `modal` | `boolean` | `true` | 是否模态显示 |
| `closable` | `boolean` | `true` | 是否显示关闭按钮 |
| `maskClosable` | `boolean` | `true` | 是否点击遮罩关闭 |
| `escClosable` | `boolean` | `true` | 是否ESC键关闭 |
| `draggable` | `boolean` | `false` | 是否可拖拽 |
| `resizable` | `boolean` | `false` | 是否可调整大小 |
| `centered` | `boolean` | `true` | 是否居中显示 |
| `animation` | `'fade' \| 'zoom' \| 'slide' \| 'none'` | `'fade'` | 动画效果 |
| `animationDuration` | `number` | `300` | 动画持续时间 |
| `buttons` | `DialogButton[]` | - | 自定义按钮 |
| `onOpen` | `() => void` | - | 打开回调 |
| `onClose` | `(result?) => void` | - | 关闭回调 |
| `beforeClose` | `(result?) => boolean \| Promise<boolean>` | - | 关闭前钩子 |

### DialogButton

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | - | 按钮文本 |
| `type` | `'primary' \| 'secondary' \| 'success' \| 'warning' \| 'danger'` | `'secondary'` | 按钮类型 |
| `disabled` | `boolean` | `false` | 是否禁用 |
| `loading` | `boolean` | `false` | 是否加载中 |
| `onClick` | `(dialog: DialogInstance) => void \| Promise<void>` | - | 点击回调 |

### DialogInstance

| 属性/方法 | 类型 | 说明 |
|-----------|------|------|
| `id` | `string` | 弹窗唯一标识 |
| `options` | `DialogOptions` | 弹窗配置 |
| `element` | `HTMLElement` | 弹窗DOM元素 |
| `visible` | `boolean` | 是否可见 |
| `zIndex` | `number` | 层级 |
| `open()` | `() => Promise<void>` | 打开弹窗 |
| `close(result?)` | `(result?) => Promise<void>` | 关闭弹窗 |
| `update(options)` | `(options: Partial<DialogOptions>) => void` | 更新配置 |
| `destroy()` | `() => void` | 销毁弹窗 |

## 样式定制

### CSS变量

```css
:root {
  --dialog-background: #fff;
  --dialog-border-radius: 8px;
  --dialog-box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  --dialog-mask-background: rgba(0, 0, 0, 0.5);
  
  --dialog-header-padding: 16px 20px;
  --dialog-header-border-bottom: 1px solid #e8e8e8;
  --dialog-body-padding: 20px;
  --dialog-footer-padding: 16px 20px;
  --dialog-footer-border-top: 1px solid #e8e8e8;
  
  --dialog-title-font-size: 16px;
  --dialog-title-font-weight: 600;
  --dialog-title-color: #333;
  
  --dialog-button-padding: 8px 16px;
  --dialog-button-border-radius: 4px;
  --dialog-button-font-size: 14px;
}
```

### 自定义样式

```css
.my-custom-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.my-custom-dialog .engine-dialog-header {
  background: linear-gradient(45deg, #409eff, #36cfc9);
  color: white;
  border-bottom: none;
}

.my-custom-dialog .engine-dialog-body {
  background: #f8f9fa;
}
```

## 最佳实践

1. **合理使用弹窗类型**：根据交互需求选择合适的弹窗类型
2. **控制弹窗数量**：避免同时显示过多弹窗，影响用户体验
3. **提供明确的操作**：按钮文本要清晰明确，避免歧义
4. **处理异步操作**：在beforeClose中进行必要的验证
5. **响应式设计**：考虑移动端的显示效果
6. **键盘导航**：确保弹窗支持键盘操作

## 无障碍支持

弹窗系统内置了完整的无障碍支持：

- 自动设置ARIA属性
- 焦点管理和焦点陷阱
- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度模式支持
