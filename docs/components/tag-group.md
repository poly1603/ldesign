# Tag Group 标签组

一个功能强大的标签组管理组件，支持拖拽排序、动态添加、溢出处理等高级特性。

## 基础用法

使用 tags 属性传入标签数据数组。

<div class="demo-block">
  <ldesign-tag-group id="basic-demo"></ldesign-tag-group>
</div>

```html
<ldesign-tag-group id="tag-group"></ldesign-tag-group>

<script>
const tagGroup = document.querySelector('#tag-group');
tagGroup.tags = [
  { id: '1', label: 'Tag 1', color: 'primary' },
  { id: '2', label: 'Tag 2', color: 'success' },
  { id: '3', label: 'Tag 3', color: 'warning' }
];
</script>
```

## 拖拽排序

设置 `draggable` 属性启用拖拽排序功能。

<div class="demo-block">
  <ldesign-tag-group id="draggable-demo" draggable></ldesign-tag-group>
</div>

```html
<ldesign-tag-group draggable></ldesign-tag-group>

<script>
const tagGroup = document.querySelector('ldesign-tag-group');
tagGroup.tags = [
  { id: '1', label: '可拖拽标签 1', color: 'primary', closable: true },
  { id: '2', label: '可拖拽标签 2', color: 'success', closable: true },
  { id: '3', label: '可拖拽标签 3', color: 'warning', closable: true },
  { id: '4', label: '可拖拽标签 4', color: 'danger', closable: true }
];

// 监听顺序变化
tagGroup.addEventListener('ldesignChange', (e) => {
  console.log('新顺序:', e.detail);
});
</script>
```

## 动态添加标签

设置 `addable` 属性显示添加按钮，点击后变成输入框。

<div class="demo-block">
  <ldesign-tag-group 
    id="addable-demo" 
    addable 
    add-text="+ 新增"
    input-placeholder="输入标签名，回车确认">
  </ldesign-tag-group>
</div>

```html
<ldesign-tag-group 
  addable 
  add-text="+ 新增"
  input-placeholder="输入标签名，回车确认"
  default-color="primary"
  default-variant="light">
</ldesign-tag-group>

<script>
const tagGroup = document.querySelector('ldesign-tag-group');
tagGroup.tags = [
  { id: '1', label: '已有标签', color: 'default', closable: true }
];

// 监听添加事件
tagGroup.addEventListener('ldesignAdd', (e) => {
  console.log('新增标签:', e.detail);
});

// 监听删除事件
tagGroup.addEventListener('ldesignRemove', (e) => {
  console.log('删除标签:', e.detail);
});
</script>
```

## 拖拽 + 添加

结合拖拽排序和动态添加功能。

<div class="demo-block">
  <ldesign-tag-group 
    id="full-demo" 
    draggable 
    addable
    default-color="primary"
    default-variant="light">
  </ldesign-tag-group>
</div>

```html
<ldesign-tag-group 
  draggable 
  addable
  default-color="primary"
  default-variant="light">
</ldesign-tag-group>

<script>
const tagGroup = document.querySelector('ldesign-tag-group');
tagGroup.tags = [
  { id: '1', label: 'React', color: 'primary', variant: 'solid', closable: true },
  { id: '2', label: 'Vue', color: 'success', variant: 'solid', closable: true },
  { id: '3', label: 'Angular', color: 'danger', variant: 'solid', closable: true }
];
</script>
```

## 横向滚动模式

设置 `overflow="scroll"` 启用横向滚动，配合 `show-arrows` 显示滚动箭头。

<div class="demo-block">
  <ldesign-tag-group id="scroll-demo" overflow="scroll" show-arrows></ldesign-tag-group>
</div>

```html
<ldesign-tag-group overflow="scroll" show-arrows scroll-step="150"></ldesign-tag-group>

<script>
const tagGroup = document.querySelector('ldesign-tag-group');
tagGroup.tags = [
  { id: '1', label: '标签 1', color: 'primary' },
  { id: '2', label: '标签 2', color: 'success' },
  { id: '3', label: '标签 3', color: 'warning' },
  { id: '4', label: '标签 4', color: 'danger' },
  { id: '5', label: '标签 5', color: 'default' },
  { id: '6', label: '标签 6', color: 'primary' },
  { id: '7', label: '标签 7', color: 'success' },
  { id: '8', label: '标签 8', color: 'warning' }
];
</script>
```

## 更多模式

设置 `overflow="more"` 显示部分标签，超出部分折叠为"+N"。

<div class="demo-block">
  <ldesign-tag-group id="more-demo" overflow="more" max-visible="3"></ldesign-tag-group>
</div>

```html
<ldesign-tag-group overflow="more" max-visible="3" more-prefix="+"></ldesign-tag-group>

<script>
const tagGroup = document.querySelector('ldesign-tag-group');
tagGroup.tags = [
  { id: '1', label: '标签 1', color: 'primary' },
  { id: '2', label: '标签 2', color: 'success' },
  { id: '3', label: '标签 3', color: 'warning' },
  { id: '4', label: '标签 4', color: 'danger' },
  { id: '5', label: '标签 5', color: 'default' },
  { id: '6', label: '标签 6', color: 'primary' }
];
</script>
```

## 不同样式标签

标签支持各种样式组合。

<div class="demo-block">
  <ldesign-tag-group id="variant-demo" draggable addable></ldesign-tag-group>
</div>

```html
<ldesign-tag-group draggable addable></ldesign-tag-group>

<script>
const tagGroup = document.querySelector('ldesign-tag-group');
tagGroup.tags = [
  { id: '1', label: 'Light', color: 'primary', variant: 'light', closable: true },
  { id: '2', label: 'Solid', color: 'success', variant: 'solid', closable: true },
  { id: '3', label: 'Outline', color: 'warning', variant: 'outline', closable: true },
  { id: '4', label: 'Dashed', color: 'danger', variant: 'dashed', closable: true }
];
</script>
```

## 禁用状态

设置 `disabled` 属性禁用整个标签组。

<div class="demo-block">
  <ldesign-tag-group id="disabled-demo" disabled draggable addable></ldesign-tag-group>
</div>

```html
<ldesign-tag-group disabled draggable addable></ldesign-tag-group>

<script>
const tagGroup = document.querySelector('ldesign-tag-group');
tagGroup.tags = [
  { id: '1', label: '禁用标签 1', color: 'primary', closable: true },
  { id: '2', label: '禁用标签 2', color: 'success', closable: true }
];
</script>
```

## API

### TagGroup Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| tags | 标签数据数组（受控模式） | `TagData[]` | `[]` |
| draggable | 是否启用拖拽排序 | `boolean` | `false` |
| addable | 是否显示添加按钮 | `boolean` | `false` |
| add-text | 添加按钮文本 | `string` | `'+ 添加标签'` |
| input-placeholder | 输入框占位符 | `string` | `'请输入标签名'` |
| default-color | 新标签默认颜色 | `string` | `'default'` |
| default-variant | 新标签默认样式 | `string` | `'light'` |
| overflow | 溢出策略 | `'scroll' \| 'more'` | `'scroll'` |
| max-visible | more模式下最多显示的标签数 | `number` | `5` |
| more-prefix | more模式下的前缀文本 | `string` | `'+'` |
| show-arrows | 是否显示滚动箭头（scroll模式） | `boolean` | `true` |
| scroll-step | 滚动步长（像素） | `number` | `120` |
| disabled | 是否禁用 | `boolean` | `false` |

### TagData 接口

```typescript
interface TagData {
  id: string;           // 唯一标识
  label: string;        // 显示文本
  color?: string;       // 颜色 ('default' | 'primary' | 'success' | 'warning' | 'danger')
  variant?: string;     // 样式 ('light' | 'solid' | 'outline' | 'ghost' | 'dashed' | 'elevated')
  closable?: boolean;   // 是否可关闭
}
```

### TagGroup Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| ldesignAdd | 添加标签时触发 | `{ label: string, id: string }` |
| ldesignRemove | 删除标签时触发 | `{ tag: TagData, index: number }` |
| ldesignChange | 标签顺序或内容变化时触发 | `TagData[]` |

## 特性说明

### 拖拽排序

- 拖拽时标签会变半透明并缩小
- 放置目标位置会显示蓝色指示条
- 拖拽过程中显示 `grabbing` 光标
- 支持键盘辅助（未来版本）

### 动态添加

- 点击添加按钮切换到输入框模式
- 输入框自动获得焦点
- 按回车键确认添加
- 按ESC键取消添加
- 失焦时自动确认（如果有内容）
- 新增标签有弹跳动画效果

### 溢出处理

**Scroll 模式**:
- 横向滚动查看所有标签
- 可选的左右箭头按钮
- 平滑滚动动画

**More 模式**:
- 只显示指定数量的标签
- 超出部分折叠为 "+N" 标签
- 点击展开查看全部

## 使用示例

### 完整功能示例

```html
<!DOCTYPE html>
<html>
<head>
  <script type="module" src="your-webcomponent-bundle.js"></script>
</head>
<body>
  <ldesign-tag-group 
    id="my-tags"
    draggable
    addable
    add-text="+ Add Tag"
    default-color="primary"
    default-variant="light">
  </ldesign-tag-group>

  <script>
    const tagGroup = document.querySelector('#my-tags');
    
    // 初始化数据
    tagGroup.tags = [
      { id: '1', label: 'JavaScript', color: 'primary', variant: 'solid', closable: true },
      { id: '2', label: 'TypeScript', color: 'primary', variant: 'light', closable: true },
      { id: '3', label: 'React', color: 'success', variant: 'solid', closable: true },
      { id: '4', label: 'Vue', color: 'success', variant: 'light', closable: true }
    ];
    
    // 监听事件
    tagGroup.addEventListener('ldesignAdd', (e) => {
      console.log('Added:', e.detail);
      // 可以在这里做服务器同步等操作
    });
    
    tagGroup.addEventListener('ldesignRemove', (e) => {
      console.log('Removed:', e.detail);
    });
    
    tagGroup.addEventListener('ldesignChange', (e) => {
      console.log('Tags changed:', e.detail);
    });
  </script>
</body>
</html>
```

### React 集成示例

```jsx
import { useRef, useEffect, useState } from 'react';

function TagGroupExample() {
  const tagGroupRef = useRef(null);
  const [tags, setTags] = useState([
    { id: '1', label: 'Tag 1', color: 'primary', closable: true },
    { id: '2', label: 'Tag 2', color: 'success', closable: true }
  ]);
  
  useEffect(() => {
    const tagGroup = tagGroupRef.current;
    if (!tagGroup) return;
    
    tagGroup.tags = tags;
    
    const handleAdd = (e) => {
      const newTag = { ...e.detail, closable: true };
      setTags(prev => [...prev, newTag]);
    };
    
    const handleRemove = (e) => {
      setTags(prev => prev.filter((_, i) => i !== e.detail.index));
    };
    
    const handleChange = (e) => {
      setTags(e.detail);
    };
    
    tagGroup.addEventListener('ldesignAdd', handleAdd);
    tagGroup.addEventListener('ldesignRemove', handleRemove);
    tagGroup.addEventListener('ldesignChange', handleChange);
    
    return () => {
      tagGroup.removeEventListener('ldesignAdd', handleAdd);
      tagGroup.removeEventListener('ldesignRemove', handleRemove);
      tagGroup.removeEventListener('ldesignChange', handleChange);
    };
  }, [tags]);
  
  return (
    <ldesign-tag-group
      ref={tagGroupRef}
      draggable
      addable
      default-color="primary"
    />
  );
}
```

<style scoped>
.demo-block {
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin: 16px 0;
}

.demo-block ldesign-tag-group {
  width: 100%;
}
</style>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // 基础示例
  const basicDemo = document.querySelector('#basic-demo');
  if (basicDemo) {
    basicDemo.tags = [
      { id: '1', label: 'Tag 1', color: 'primary' },
      { id: '2', label: 'Tag 2', color: 'success' },
      { id: '3', label: 'Tag 3', color: 'warning' }
    ];
  }
  
  // 拖拽示例
  const draggableDemo = document.querySelector('#draggable-demo');
  if (draggableDemo) {
    draggableDemo.tags = [
      { id: '1', label: '可拖拽标签 1', color: 'primary', closable: true },
      { id: '2', label: '可拖拽标签 2', color: 'success', closable: true },
      { id: '3', label: '可拖拽标签 3', color: 'warning', closable: true },
      { id: '4', label: '可拖拽标签 4', color: 'danger', closable: true }
    ];
  }
  
  // 添加示例
  const addableDemo = document.querySelector('#addable-demo');
  if (addableDemo) {
    addableDemo.tags = [
      { id: '1', label: '已有标签', color: 'default', closable: true }
    ];
  }
  
  // 完整示例
  const fullDemo = document.querySelector('#full-demo');
  if (fullDemo) {
    fullDemo.tags = [
      { id: '1', label: 'React', color: 'primary', variant: 'solid', closable: true },
      { id: '2', label: 'Vue', color: 'success', variant: 'solid', closable: true },
      { id: '3', label: 'Angular', color: 'danger', variant: 'solid', closable: true }
    ];
  }
  
  // 滚动示例
  const scrollDemo = document.querySelector('#scroll-demo');
  if (scrollDemo) {
    scrollDemo.tags = [
      { id: '1', label: '标签 1', color: 'primary' },
      { id: '2', label: '标签 2', color: 'success' },
      { id: '3', label: '标签 3', color: 'warning' },
      { id: '4', label: '标签 4', color: 'danger' },
      { id: '5', label: '标签 5', color: 'default' },
      { id: '6', label: '标签 6', color: 'primary' },
      { id: '7', label: '标签 7', color: 'success' },
      { id: '8', label: '标签 8', color: 'warning' }
    ];
  }
  
  // 更多模式示例
  const moreDemo = document.querySelector('#more-demo');
  if (moreDemo) {
    moreDemo.tags = [
      { id: '1', label: '标签 1', color: 'primary' },
      { id: '2', label: '标签 2', color: 'success' },
      { id: '3', label: '标签 3', color: 'warning' },
      { id: '4', label: '标签 4', color: 'danger' },
      { id: '5', label: '标签 5', color: 'default' },
      { id: '6', label: '标签 6', color: 'primary' }
    ];
  }
  
  // 样式示例
  const variantDemo = document.querySelector('#variant-demo');
  if (variantDemo) {
    variantDemo.tags = [
      { id: '1', label: 'Light', color: 'primary', variant: 'light', closable: true },
      { id: '2', label: 'Solid', color: 'success', variant: 'solid', closable: true },
      { id: '3', label: 'Outline', color: 'warning', variant: 'outline', closable: true },
      { id: '4', label: 'Dashed', color: 'danger', variant: 'dashed', closable: true }
    ];
  }
  
  // 禁用示例
  const disabledDemo = document.querySelector('#disabled-demo');
  if (disabledDemo) {
    disabledDemo.tags = [
      { id: '1', label: '禁用标签 1', color: 'primary', closable: true },
      { id: '2', label: '禁用标签 2', color: 'success', closable: true }
    ];
  }
});
</script>
