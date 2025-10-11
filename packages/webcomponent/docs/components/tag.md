# Tag 标签

用于标记和分类的组件，提供不同语义颜色与外观，支持可关闭、尺寸与形状自定义。

## 基础用法

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag>默认</ldesign-tag>
    <ldesign-tag color="primary">Primary</ldesign-tag>
    <ldesign-tag color="success">Success</ldesign-tag>
    <ldesign-tag color="warning">Warning</ldesign-tag>
    <ldesign-tag color="danger">Danger</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag>默认</ldesign-tag>
<ldesign-tag color="primary">Primary</ldesign-tag>
<ldesign-tag color="success">Success</ldesign-tag>
<ldesign-tag color="warning">Warning</ldesign-tag>
<ldesign-tag color="danger">Danger</ldesign-tag>
```

## 外观（variant）

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag color="primary" variant="light">Light</ldesign-tag>
    <ldesign-tag color="primary" variant="solid">Solid</ldesign-tag>
    <ldesign-tag color="primary" variant="outline">Outline</ldesign-tag>
    <ldesign-tag color="primary" variant="ghost">Ghost</ldesign-tag>
    <ldesign-tag color="primary" variant="dashed">Dashed</ldesign-tag>
    <ldesign-tag color="primary" variant="elevated">Elevated</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag color="primary" variant="light">Light</ldesign-tag>
<ldesign-tag color="primary" variant="solid">Solid</ldesign-tag>
<ldesign-tag color="primary" variant="outline">Outline</ldesign-tag>
<ldesign-tag color="primary" variant="ghost">Ghost</ldesign-tag>
<ldesign-tag color="primary" variant="dashed">Dashed</ldesign-tag>
<ldesign-tag color="primary" variant="elevated">Elevated</ldesign-tag>
```

## 可关闭

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag closable>默认</ldesign-tag>
    <ldesign-tag color="primary" closable>Primary</ldesign-tag>
    <ldesign-tag color="success" closable>Success</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag closable>默认</ldesign-tag>
<ldesign-tag color="primary" closable>Primary</ldesign-tag>
<ldesign-tag color="success" closable>Success</ldesign-tag>
```

## 尺寸与形状

<div class="demo-container">
  <div class="demo-row">
    <span class="demo-label">尺寸:</span>
    <ldesign-tag size="small">Small</ldesign-tag>
    <ldesign-tag size="middle">Middle</ldesign-tag>
    <ldesign-tag size="large">Large</ldesign-tag>
  </div>
  <div class="demo-row">
    <span class="demo-label">形状:</span>
    <ldesign-tag shape="rectangle">Rectangle</ldesign-tag>
    <ldesign-tag shape="round">Round</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag size="small">Small</ldesign-tag>
<ldesign-tag size="middle">Middle</ldesign-tag>
<ldesign-tag size="large">Large</ldesign-tag>

<ldesign-tag shape="rectangle">Rectangle</ldesign-tag>
<ldesign-tag shape="round">Round</ldesign-tag>
```

## 带图标

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag icon="tag">标签</ldesign-tag>
    <ldesign-tag icon="check" color="success">完成</ldesign-tag>
    <ldesign-tag icon="alert-triangle" color="warning">警告</ldesign-tag>
    <ldesign-tag icon="x-circle" color="danger">错误</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag icon="tag">标签</ldesign-tag>
<ldesign-tag icon="check" color="success">完成</ldesign-tag>
<ldesign-tag icon="alert-triangle" color="warning">警告</ldesign-tag>
<ldesign-tag icon="x-circle" color="danger">错误</ldesign-tag>
```

## 角标与脉动

标签支持角标显示，并可启用脉动动画效果，适合显示未读消息数量等场景。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag badge="3" color="primary">消息</ldesign-tag>
    <ldesign-tag badge="99+" color="danger">通知</ldesign-tag>
    <ldesign-tag badge="5" badge-pulse color="danger">新消息（脉动）</ldesign-tag>
    <ldesign-tag badge="New" badge-pulse color="success">最新</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag badge="3" color="primary">消息</ldesign-tag>
<ldesign-tag badge="99+" color="danger">通知</ldesign-tag>
<ldesign-tag badge="5" badge-pulse color="danger">新消息（脉动）</ldesign-tag>
<ldesign-tag badge="New" badge-pulse color="success">最新</ldesign-tag>
```

## 边框动画

启用 `border-animation` 属性后，标签在悬停时会显示动态边框效果。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag clickable border-animation color="primary">悬停查看效果</ldesign-tag>
    <ldesign-tag clickable border-animation color="success" variant="outline">边框动画</ldesign-tag>
    <ldesign-tag clickable border-animation color="danger" variant="solid">交互体验</ldesign-tag>
  </div>
</div>

```html
<ldesign-tag clickable border-animation color="primary">悬停查看效果</ldesign-tag>
<ldesign-tag clickable border-animation color="success" variant="outline">边框动画</ldesign-tag>
<ldesign-tag clickable border-animation color="danger" variant="solid">交互体验</ldesign-tag>
```

## 综合示例

结合多种属性创建丰富多样的标签样式。

<div class="demo-container">
  <div class="demo-row">
    <ldesign-tag 
      icon="star" 
      badge="热" 
      badge-pulse 
      color="danger" 
      variant="solid" 
      shape="round">
      热门推荐
    </ldesign-tag>
    <ldesign-tag 
      icon="zap" 
      badge="NEW" 
      badge-pulse 
      color="primary" 
      variant="elevated">
      新功能
    </ldesign-tag>
    <ldesign-tag 
      icon="award" 
      closable 
      color="success" 
      variant="outline" 
      border-animation 
      clickable>
      精选内容
    </ldesign-tag>
  </div>
</div>

```html
<ldesign-tag 
  icon="star" 
  badge="热" 
  badge-pulse 
  color="danger" 
  variant="solid" 
  shape="round">
  热门推荐
</ldesign-tag>

<ldesign-tag 
  icon="zap" 
  badge="NEW" 
  badge-pulse 
  color="primary" 
  variant="elevated">
  新功能
</ldesign-tag>

<ldesign-tag 
  icon="award" 
  closable 
  color="success" 
  variant="outline" 
  border-animation 
  clickable>
  精选内容
</ldesign-tag>
```

## 事件

可关闭标签会触发 `ldesignClose` 事件：

```html
<ldesign-tag id="closable" color="primary" closable>可关闭</ldesign-tag>
<script>
  const el = document.getElementById('closable')
  el.addEventListener('ldesignClose', () => {
    console.log('Tag closed')
  })
</script>
```

## API

### 属性（Props）

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `variant` | `'light' \| 'solid' \| 'outline' \| 'ghost' \| 'dashed' \| 'elevated'` | `'light'` | 外观风格 |
| `color` | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` | 语义颜色 |
| `size` | `'small' \| 'middle' \| 'large'` | `'middle'` | 尺寸 |
| `shape` | `'rectangle' \| 'round' \| 'pill'` | `'rectangle'` | 形状 |
| `closable` | `boolean` | `false` | 是否可关闭 |
| `clickable` | `boolean` | `false` | 是否可点击 |
| `checkable` | `boolean` | `false` | 是否可选中 |
| `icon` | `string` | - | 左侧图标名称 |
| `badge` | `string \| number` | - | 角标内容 |
| `badge-pulse` | `boolean` | `false` | 角标脉动动画 |
| `border-animation` | `boolean` | `false` | 边框动画效果 |
| `loading` | `boolean` | `false` | 加载状态 |
| `disabled` | `boolean` | `false` | 是否禁用 |

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignClose` | 点击关闭时触发 | `(event: MouseEvent)` |
| `ldesignClick` | 点击标签时触发（clickable为true时） | `(event: MouseEvent)` |
| `ldesignChange` | 选中状态变化时触发（checkable为true时） | `(event: CustomEvent)` |

---

# Tag Group 标签组

用于管理多个标签，支持拖拽排序和动态添加。

## 基础用法

<div class="demo-container">
  <ldesign-tag-group id="basic-group"></ldesign-tag-group>
</div>

```html
<ldesign-tag-group id="basic-group"></ldesign-tag-group>

<script>
const basicGroup = document.querySelector('#basic-group');
basicGroup.tags = [
  { id: '1', label: 'React', color: 'primary', variant: 'solid', closable: true },
  { id: '2', label: 'Vue', color: 'success', variant: 'solid', closable: true },
  { id: '3', label: 'Angular', color: 'danger', variant: 'solid', closable: true }
];

basicGroup.addEventListener('ldesignRemove', (e) => {
  console.log('删除标签:', e.detail);
});
</script>
```

## 拖拽排序

启用 `enable-drag` 属性后，可以通过拖拽调整标签顺序。

<div class="demo-container">
  <ldesign-tag-group id="drag-group" enable-drag></ldesign-tag-group>
</div>

```html
<ldesign-tag-group id="drag-group" enable-drag></ldesign-tag-group>

<script>
const dragGroup = document.querySelector('#drag-group');
dragGroup.tags = [
  { id: '1', label: 'JavaScript', color: 'warning', variant: 'light', closable: true },
  { id: '2', label: 'TypeScript', color: 'primary', variant: 'light', closable: true },
  { id: '3', label: 'Python', color: 'success', variant: 'light', closable: true },
  { id: '4', label: 'Go', color: 'primary', variant: 'light', closable: true }
];

dragGroup.addEventListener('ldesignChange', (e) => {
  console.log('标签顺序变化:', e.detail);
});
</script>
```

## 动态添加

启用 `addable` 属性后，可以动态添加新标签。

<div class="demo-container">
  <ldesign-tag-group id="add-group" addable add-text="+ 添加标签"></ldesign-tag-group>
</div>

```html
<ldesign-tag-group id="add-group" addable add-text="+ 添加标签"></ldesign-tag-group>

<script>
const addGroup = document.querySelector('#add-group');
addGroup.tags = [
  { id: '1', label: 'HTML', color: 'danger', variant: 'outline', closable: true },
  { id: '2', label: 'CSS', color: 'primary', variant: 'outline', closable: true }
];

addGroup.addEventListener('ldesignAdd', (e) => {
  console.log('添加标签:', e.detail);
});
</script>
```

## 完整功能

结合拖拽排序和动态添加功能。

<div class="demo-container">
  <ldesign-tag-group id="full-group" enable-drag addable></ldesign-tag-group>
</div>

```html
<ldesign-tag-group id="full-group" enable-drag addable></ldesign-tag-group>

<script>
const fullGroup = document.querySelector('#full-group');
fullGroup.tags = [
  { id: '1', label: 'Frontend', color: 'primary', variant: 'solid', closable: true },
  { id: '2', label: 'Backend', color: 'success', variant: 'solid', closable: true },
  { id: '3', label: 'DevOps', color: 'warning', variant: 'solid', closable: true }
];

fullGroup.addEventListener('ldesignAdd', (e) => {
  console.log('➕ 添加:', e.detail);
});

fullGroup.addEventListener('ldesignRemove', (e) => {
  console.log('❌ 删除:', e.detail);
});

fullGroup.addEventListener('ldesignChange', (e) => {
  console.log('🔄 变化:', e.detail);
});
</script>
```

## Tag Group API

### 属性（Props）

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `tags` | `TagData[]` | `[]` | 标签数据数组 |
| `enable-drag` | `boolean` | `false` | 启用拖拽排序 |
| `addable` | `boolean` | `false` | 显示添加按钮 |
| `add-text` | `string` | `'+ 添加标签'` | 添加按钮文本 |
| `input-placeholder` | `string` | `'请输入标签名'` | 输入框占位符 |
| `default-color` | `string` | `'default'` | 新标签默认颜色 |
| `default-variant` | `string` | `'light'` | 新标签默认样式 |
| `disabled` | `boolean` | `false` | 是否禁用 |

### TagData 接口

```typescript
interface TagData {
  id: string;                    // 唯一标识
  label: string;                 // 显示文本
  color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  variant?: 'light' | 'solid' | 'outline' | 'ghost' | 'dashed' | 'elevated';
  closable?: boolean;            // 是否可关闭
}
```

### 事件（Events）

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| `ldesignAdd` | 添加标签时触发 | `{ tag: TagData }` |
| `ldesignRemove` | 删除标签时触发 | `{ id: string, index: number }` |
| `ldesignChange` | 标签变化时触发 | `{ tags: TagData[] }` |

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // 基础标签组
  const basicGroup = document.querySelector('#basic-group');
  if (basicGroup) {
    basicGroup.tags = [
      { id: '1', label: 'React', color: 'primary', variant: 'solid', closable: true },
      { id: '2', label: 'Vue', color: 'success', variant: 'solid', closable: true },
      { id: '3', label: 'Angular', color: 'danger', variant: 'solid', closable: true }
    ];
    basicGroup.addEventListener('ldesignRemove', (e) => {
      console.log('删除标签:', e.detail);
    });
  }

  // 拖拽排序组
  const dragGroup = document.querySelector('#drag-group');
  if (dragGroup) {
    dragGroup.tags = [
      { id: '1', label: 'JavaScript', color: 'warning', variant: 'light', closable: true },
      { id: '2', label: 'TypeScript', color: 'primary', variant: 'light', closable: true },
      { id: '3', label: 'Python', color: 'success', variant: 'light', closable: true },
      { id: '4', label: 'Go', color: 'primary', variant: 'light', closable: true }
    ];
    dragGroup.addEventListener('ldesignChange', (e) => {
      console.log('标签顺序变化:', e.detail);
    });
  }

  // 动态添加组
  const addGroup = document.querySelector('#add-group');
  if (addGroup) {
    addGroup.tags = [
      { id: '1', label: 'HTML', color: 'danger', variant: 'outline', closable: true },
      { id: '2', label: 'CSS', color: 'primary', variant: 'outline', closable: true }
    ];
    addGroup.addEventListener('ldesignAdd', (e) => {
      console.log('添加标签:', e.detail);
    });
  }

  // 完整功能组
  const fullGroup = document.querySelector('#full-group');
  if (fullGroup) {
    fullGroup.tags = [
      { id: '1', label: 'Frontend', color: 'primary', variant: 'solid', closable: true },
      { id: '2', label: 'Backend', color: 'success', variant: 'solid', closable: true },
      { id: '3', label: 'DevOps', color: 'warning', variant: 'solid', closable: true }
    ];
    fullGroup.addEventListener('ldesignAdd', (e) => {
      console.log('➕ 添加:', e.detail);
    });
    fullGroup.addEventListener('ldesignRemove', (e) => {
      console.log('❌ 删除:', e.detail);
    });
    fullGroup.addEventListener('ldesignChange', (e) => {
      console.log('🔄 变化:', e.detail);
    });
  }
});
</script>

<style scoped>
.demo-container {
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  margin: 16px 0;
}

.demo-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.demo-row:last-child {
  margin-bottom: 0;
}

.demo-label {
  font-weight: 600;
  color: #666;
  min-width: 60px;
}
</style>
