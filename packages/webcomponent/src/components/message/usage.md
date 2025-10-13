# Message 消息提示组件

高性能、轻量级的全局消息提示组件，用于主动操作后的反馈提示。

## 特性

- 🚀 **高性能**：GPU 加速动画、对象池化、DOM 复用
- 💾 **低内存**：智能内存管理，减少 GC 压力
- 📱 **跨平台**：支持所有现代浏览器和移动设备
- 🎨 **多样式**：5 种消息类型，7 种显示位置
- 🌙 **暗黑模式**：自动适配系统主题
- ♿ **无障碍**：完整的 ARIA 支持
- 🎯 **灵活 API**：支持命令式和声明式两种使用方式

## 安装

```bash
npm install @ldesign/webcomponent
```

## 使用方式

### 1. 命令式 API（推荐）

```javascript
import { message } from '@ldesign/webcomponent';

// 基础用法
message.success('操作成功');
message.error('操作失败');
message.warning('警告信息');
message.info('提示信息');
const loadingId = message.loading('加载中...');

// 高级用法
const msgId = message.show({
  type: 'success',
  content: '保存成功',
  title: '提示',
  duration: 5000,
  position: 'top-right',
  closable: true,
  onClick: () => console.log('clicked'),
  onClose: () => console.log('closed')
});

// 更新消息
message.update(msgId, {
  content: '保存完成',
  type: 'info'
});

// 关闭消息
message.close(msgId);
message.closeAll();
```

### 2. 组件声明式

```html
<!-- 基础用法 -->
<ldesign-message type="success" message="操作成功"></ldesign-message>

<!-- 高级用法 -->
<ldesign-message 
  type="error"
  title="错误"
  message="请检查输入"
  duration="5000"
  closable
  placement="top-right">
</ldesign-message>

<!-- 自定义内容 -->
<ldesign-message type="info">
  <div style="display: flex; align-items: center;">
    <img src="icon.png" width="20" height="20" />
    <span>自定义内容</span>
  </div>
</ldesign-message>
```

### 3. React 中使用

```jsx
import { message } from '@ldesign/webcomponent';
import { useEffect } from 'react';

function MyComponent() {
  const handleSave = async () => {
    const loadingId = message.loading('保存中...');
    try {
      await saveData();
      message.close(loadingId);
      message.success('保存成功');
    } catch (error) {
      message.close(loadingId);
      message.error('保存失败：' + error.message);
    }
  };

  return <button onClick={handleSave}>保存</button>;
}
```

### 4. Vue 中使用

```vue
<template>
  <button @click="handleSubmit">提交</button>
</template>

<script setup>
import { message } from '@ldesign/webcomponent';

const handleSubmit = async () => {
  const loading = message.loading('提交中...');
  try {
    await submitForm();
    message.success('提交成功');
  } catch (error) {
    message.error(`提交失败：${error.message}`);
  } finally {
    message.close(loading);
  }
};
</script>
```

### 5. Angular 中使用

```typescript
import { Component } from '@angular/core';
import { message } from '@ldesign/webcomponent';

@Component({
  selector: 'app-example',
  template: `<button (click)="handleClick()">点击</button>`
})
export class ExampleComponent {
  handleClick() {
    message.info('点击了按钮');
  }
}
```

## API 参考

### MessageOptions

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| type | 消息类型 | 'success' \| 'error' \| 'warning' \| 'info' \| 'loading' | 'info' |
| content | 消息内容 | string | - |
| title | 消息标题 | string | - |
| duration | 显示时长（毫秒），0 表示不自动关闭 | number | 3000 |
| position | 显示位置 | 'top' \| 'top-left' \| 'top-right' \| 'bottom' \| 'bottom-left' \| 'bottom-right' \| 'center' | 'top' |
| closable | 是否显示关闭按钮 | boolean | false |
| showIcon | 是否显示图标 | boolean | true |
| html | 内容是否为 HTML | boolean | false |
| className | 自定义类名 | string | - |
| maxWidth | 最大宽度 | string | '520px' |
| pauseOnHover | 悬停时暂停自动关闭 | boolean | true |
| onClick | 点击回调 | () => void | - |
| onClose | 关闭回调 | () => void | - |

### 方法

| 方法名 | 说明 | 参数 | 返回值 |
|--------|------|------|--------|
| message.show | 显示消息 | options: MessageOptions \| string | string (消息ID) |
| message.success | 显示成功消息 | content: string, options?: Partial\<MessageOptions\> | string |
| message.error | 显示错误消息 | content: string, options?: Partial\<MessageOptions\> | string |
| message.warning | 显示警告消息 | content: string, options?: Partial\<MessageOptions\> | string |
| message.info | 显示信息消息 | content: string, options?: Partial\<MessageOptions\> | string |
| message.loading | 显示加载消息 | content: string, options?: Partial\<MessageOptions\> | string |
| message.update | 更新消息 | id: string, options: Partial\<MessageOptions\> | void |
| message.close | 关闭指定消息 | id: string | void |
| message.closeAll | 关闭所有消息 | - | void |
| message.configure | 全局配置 | config: MessageConfig | void |

### 全局配置

```javascript
message.configure({
  maxMessages: 10,        // 最大消息数量
  defaultDuration: 3000,  // 默认显示时长
  gap: 12,               // 消息间距
  animationDuration: 200, // 动画时长
  useGPU: true,          // 启用 GPU 加速
  enablePool: true       // 启用对象池
});
```

## 高级用法

### 1. 批量操作反馈

```javascript
async function batchDelete(items) {
  const loading = message.loading(`正在删除 ${items.length} 个项目...`);
  let successCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      await deleteItem(item);
      successCount++;
      message.update(loading, {
        content: `已删除 ${successCount}/${items.length} 个项目...`
      });
    } catch (error) {
      errorCount++;
    }
  }

  message.close(loading);
  
  if (errorCount === 0) {
    message.success(`成功删除 ${successCount} 个项目`);
  } else {
    message.warning(`删除完成：成功 ${successCount} 个，失败 ${errorCount} 个`);
  }
}
```

### 2. 异步验证反馈

```javascript
async function validateForm(formData) {
  const validating = message.loading('正在验证...');
  
  try {
    const errors = await validateAsync(formData);
    message.close(validating);
    
    if (errors.length > 0) {
      errors.forEach(error => {
        message.error(error, { 
          duration: 5000,
          position: 'top-right' 
        });
      });
      return false;
    }
    
    message.success('验证通过');
    return true;
  } catch (error) {
    message.close(validating);
    message.error('验证失败：' + error.message);
    return false;
  }
}
```

### 3. 复杂交互提示

```javascript
function showInteractiveMessage() {
  const id = message.show({
    type: 'info',
    content: '点击查看详情',
    duration: 0,
    closable: true,
    onClick: () => {
      message.update(id, {
        content: '详细信息：这是一条可交互的消息',
        type: 'success'
      });
      
      setTimeout(() => {
        message.close(id);
      }, 3000);
    }
  });
}
```

### 4. 自定义样式

```css
/* 自定义主题颜色 */
.my-custom-message {
  --message-success-bg: #e8f5e9;
  --message-success-border: #4caf50;
  --message-success-color: #2e7d32;
}

/* 自定义动画 */
@keyframes slide-in-top {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.ldesign-message.custom-animation {
  animation: slide-in-top 0.3s ease-out;
}
```

```javascript
message.show({
  content: '自定义样式消息',
  className: 'my-custom-message custom-animation'
});
```

## 性能优化建议

1. **合理设置消息数量**：避免同时显示过多消息
   ```javascript
   message.configure({ maxMessages: 5 });
   ```

2. **及时关闭不需要的消息**：特别是 loading 类型
   ```javascript
   const loading = message.loading('处理中...');
   try {
     await process();
   } finally {
     message.close(loading); // 确保关闭
   }
   ```

3. **复用消息实例**：更新而不是创建新消息
   ```javascript
   const msgId = message.info('步骤 1/3');
   message.update(msgId, { content: '步骤 2/3' });
   message.update(msgId, { content: '步骤 3/3' });
   ```

4. **批量操作时使用单个消息**：避免消息轰炸
   ```javascript
   // 不好的做法
   items.forEach(item => message.success(`${item} 完成`));
   
   // 好的做法
   message.success(`${items.length} 个项目处理完成`);
   ```

## 浏览器兼容性

- Chrome >= 51
- Firefox >= 54
- Safari >= 10
- Edge >= 79
- iOS Safari >= 10
- Android Chrome >= 51

## 注意事项

1. 消息组件会自动创建容器并添加到 `document.body`
2. 消息的 z-index 默认为 5000，可通过配置调整
3. 在 SPA 应用中切换路由时，建议调用 `message.closeAll()`
4. 在组件卸载时记得清理未关闭的消息

## 常见问题

**Q: 消息不显示？**
A: 检查是否有 CSS 冲突或 z-index 问题。

**Q: 如何在 TypeScript 中使用？**
A: 包含完整的类型定义，直接导入即可获得类型提示。

**Q: 如何自定义图标？**
A: 设置 `showIcon: false` 并在内容中自定义图标。

**Q: 支持 SSR 吗？**
A: 支持，但需要在客户端环境才能调用 API。