# Tag 标签

用于标记和分类的标签组件，支持丰富的样式变体和交互效果。

## 基础用法

使用 `color` 属性来定义标签的语义颜色。

<div class="demo-block">
  <ldesign-tag>默认标签</ldesign-tag>
  <ldesign-tag color="primary">主要标签</ldesign-tag>
  <ldesign-tag color="success">成功标签</ldesign-tag>
  <ldesign-tag color="warning">警告标签</ldesign-tag>
  <ldesign-tag color="danger">危险标签</ldesign-tag>
</div>

```html
<ldesign-tag>默认标签</ldesign-tag>
<ldesign-tag color="primary">主要标签</ldesign-tag>
<ldesign-tag color="success">成功标签</ldesign-tag>
<ldesign-tag color="warning">警告标签</ldesign-tag>
<ldesign-tag color="danger">危险标签</ldesign-tag>
```

## 外观风格

标签支持 6 种不同的外观风格，通过 `variant` 属性设置。

<div class="demo-block">
  <ldesign-tag color="primary" variant="light">Light</ldesign-tag>
  <ldesign-tag color="primary" variant="solid">Solid</ldesign-tag>
  <ldesign-tag color="primary" variant="outline">Outline</ldesign-tag>
  <ldesign-tag color="primary" variant="ghost">Ghost</ldesign-tag>
  <ldesign-tag color="primary" variant="dashed">Dashed</ldesign-tag>
  <ldesign-tag color="primary" variant="elevated">Elevated</ldesign-tag>
</div>

```html
<ldesign-tag color="primary" variant="light">Light</ldesign-tag>
<ldesign-tag color="primary" variant="solid">Solid</ldesign-tag>
<ldesign-tag color="primary" variant="outline">Outline</ldesign-tag>
<ldesign-tag color="primary" variant="ghost">Ghost</ldesign-tag>
<ldesign-tag color="primary" variant="dashed">Dashed</ldesign-tag>
<ldesign-tag color="primary" variant="elevated">Elevated</ldesign-tag>
```

## 尺寸

标签有三种尺寸：小、中（默认）、大。

<div class="demo-block">
  <ldesign-tag size="small" color="primary">小标签</ldesign-tag>
  <ldesign-tag size="middle" color="primary">中标签</ldesign-tag>
  <ldesign-tag size="large" color="primary">大标签</ldesign-tag>
</div>

```html
<ldesign-tag size="small" color="primary">小标签</ldesign-tag>
<ldesign-tag size="middle" color="primary">中标签</ldesign-tag>
<ldesign-tag size="large" color="primary">大标签</ldesign-tag>
```

## 形状

通过 `shape` 属性设置标签的形状。

<div class="demo-block">
  <ldesign-tag shape="rectangle" color="primary">直角</ldesign-tag>
  <ldesign-tag shape="round" color="primary">圆角</ldesign-tag>
  <ldesign-tag shape="pill" color="primary">胶囊</ldesign-tag>
</div>

```html
<ldesign-tag shape="rectangle" color="primary">直角</ldesign-tag>
<ldesign-tag shape="round" color="primary">圆角</ldesign-tag>
<ldesign-tag shape="pill" color="primary">胶囊</ldesign-tag>
```

## 可关闭

添加 `closable` 属性使标签可关闭。

<div class="demo-block">
  <ldesign-tag closable color="primary">可关闭标签</ldesign-tag>
  <ldesign-tag closable color="success" variant="solid">实底可关闭</ldesign-tag>
  <ldesign-tag closable color="warning" variant="outline">描边可关闭</ldesign-tag>
</div>

```html
<ldesign-tag closable color="primary">可关闭标签</ldesign-tag>
<ldesign-tag closable color="success" variant="solid">实底可关闭</ldesign-tag>
<ldesign-tag closable color="warning" variant="outline">描边可关闭</ldesign-tag>
```

## 可选中

使用 `checkable` 属性使标签可选中，配合 `selected` 属性设置默认选中状态。

<div class="demo-block">
  <ldesign-tag checkable color="primary">可选标签</ldesign-tag>
  <ldesign-tag checkable selected color="success">默认选中</ldesign-tag>
  <ldesign-tag checkable color="warning">可选标签</ldesign-tag>
</div>

```html
<ldesign-tag checkable color="primary">可选标签</ldesign-tag>
<ldesign-tag checkable selected color="success">默认选中</ldesign-tag>
<ldesign-tag checkable color="warning">可选标签</ldesign-tag>
```

## 可点击

使用 `clickable` 属性使标签可点击，用于作为按钮使用。

<div class="demo-block">
  <ldesign-tag clickable color="primary">点击我</ldesign-tag>
  <ldesign-tag clickable color="success" variant="solid">实底按钮</ldesign-tag>
  <ldesign-tag clickable color="danger" variant="outline">描边按钮</ldesign-tag>
</div>

```html
<ldesign-tag clickable color="primary">点击我</ldesign-tag>
<ldesign-tag clickable color="success" variant="solid">实底按钮</ldesign-tag>
<ldesign-tag clickable color="danger" variant="outline">描边按钮</ldesign-tag>
```

## 加载状态

使用 `loading` 属性显示加载状态。

<div class="demo-block">
  <ldesign-tag loading color="primary">加载中</ldesign-tag>
  <ldesign-tag loading color="success" variant="solid">处理中...</ldesign-tag>
  <ldesign-tag loading color="warning" size="large">大尺寸加载</ldesign-tag>
</div>

```html
<ldesign-tag loading color="primary">加载中</ldesign-tag>
<ldesign-tag loading color="success" variant="solid">处理中...</ldesign-tag>
<ldesign-tag loading color="warning" size="large">大尺寸加载</ldesign-tag>
```

## 图标

使用 `icon` 属性添加图标。

<div class="demo-block">
  <ldesign-tag icon="check" color="success">已完成</ldesign-tag>
  <ldesign-tag icon="alert-circle" color="warning">警告</ldesign-tag>
  <ldesign-tag icon="x-circle" color="danger" variant="solid">错误</ldesign-tag>
  <ldesign-tag icon="star" color="primary" variant="outline">收藏</ldesign-tag>
</div>

```html
<ldesign-tag icon="check" color="success">已完成</ldesign-tag>
<ldesign-tag icon="alert-circle" color="warning">警告</ldesign-tag>
<ldesign-tag icon="x-circle" color="danger" variant="solid">错误</ldesign-tag>
<ldesign-tag icon="star" color="primary" variant="outline">收藏</ldesign-tag>
```

## 角标与小圆点

使用 `badge` 属性添加角标，使用 `dot` 属性添加小圆点。

<div class="demo-block">
  <ldesign-tag badge="5" color="primary">消息</ldesign-tag>
  <ldesign-tag badge="99+" color="danger" variant="solid">热门</ldesign-tag>
  <ldesign-tag dot color="success">在线</ldesign-tag>
  <ldesign-tag dot badge-pulse color="warning">提醒</ldesign-tag>
</div>

```html
<ldesign-tag badge="5" color="primary">消息</ldesign-tag>
<ldesign-tag badge="99+" color="danger" variant="solid">热门</ldesign-tag>
<ldesign-tag dot color="success">在线</ldesign-tag>
<ldesign-tag dot badge-pulse color="warning">提醒</ldesign-tag>
```

## 视觉效果

标签支持多种视觉效果，通过 `effect` 属性设置。

<div class="demo-block">
  <ldesign-tag color="primary" effect="gradient" variant="solid">渐变效果</ldesign-tag>
  <ldesign-tag color="success" effect="neon" variant="solid">霞光效果</ldesign-tag>
  <ldesign-tag color="warning" effect="glass" variant="solid">毛玻璃</ldesign-tag>
</div>

```html
<ldesign-tag color="primary" effect="gradient" variant="solid">渐变效果</ldesign-tag>
<ldesign-tag color="success" effect="neon" variant="solid">霞光效果</ldesign-tag>
<ldesign-tag color="warning" effect="glass" variant="solid">毛玻璃</ldesign-tag>
```

## 角标脉动效果

使用 `badge-pulse` 属性为角标添加脉动动画，吸引用户注意。

<div class="demo-block">
  <ldesign-tag badge="5" badge-pulse color="danger">新消息</ldesign-tag>
  <ldesign-tag badge="99+" badge-pulse color="primary" variant="solid">热门</ldesign-tag>
  <ldesign-tag dot badge-pulse color="warning">提醒</ldesign-tag>
  <ldesign-tag badge="NEW" badge-pulse color="success" variant="outline">新功能</ldesign-tag>
</div>

```html
<ldesign-tag badge="5" badge-pulse color="danger">新消息</ldesign-tag>
<ldesign-tag badge="99+" badge-pulse color="primary" variant="solid">热门</ldesign-tag>
<ldesign-tag dot badge-pulse color="warning">提醒</ldesign-tag>
<ldesign-tag badge="NEW" badge-pulse color="success" variant="outline">新功能</ldesign-tag>
```

## 边框动画

使用 `border-animation` 属性为可交互标签添加边框动画效果。

<div class="demo-block">
  <ldesign-tag clickable border-animation color="primary">悬停查看</ldesign-tag>
  <ldesign-tag checkable border-animation color="success">选择我</ldesign-tag>
  <ldesign-tag clickable border-animation color="danger" variant="outline">炫酷动画</ldesign-tag>
</div>

```html
<ldesign-tag clickable border-animation color="primary">悬停查看</ldesign-tag>
<ldesign-tag checkable border-animation color="success">选择我</ldesign-tag>
<ldesign-tag clickable border-animation color="danger" variant="outline">炫酷动画</ldesign-tag>
```

## 自定义颜色

使用 `custom-color` 属性设置自定义颜色。

<div class="demo-block">
  <ldesign-tag custom-color="#7C3AED" variant="solid">紫色</ldesign-tag>
  <ldesign-tag custom-color="#EC4899" variant="light">粉色</ldesign-tag>
  <ldesign-tag custom-color="#06B6D4" variant="outline">青色</ldesign-tag>
  <ldesign-tag custom-color="#F59E0B" effect="gradient" variant="solid">自定义渐变</ldesign-tag>
</div>

```html
<ldesign-tag custom-color="#7C3AED" variant="solid">紫色</ldesign-tag>
<ldesign-tag custom-color="#EC4899" variant="light">粉色</ldesign-tag>
<ldesign-tag custom-color="#06B6D4" variant="outline">青色</ldesign-tag>
<ldesign-tag custom-color="#F59E0B" effect="gradient" variant="solid">自定义渐变</ldesign-tag>
```

## 插槽

标签支持前缀和后缀插槽。

<div class="demo-block">
  <ldesign-tag color="primary">
    <span slot="prefix">🏷️</span>
    前缀插槽
  </ldesign-tag>
  <ldesign-tag color="success" variant="solid">
    后缀插槽
    <span slot="suffix">✓</span>
  </ldesign-tag>
  <ldesign-tag color="warning">
    <span slot="prefix">⚠️</span>
    完整插槽
    <span slot="suffix">→</span>
  </ldesign-tag>
</div>

```html
<ldesign-tag color="primary">
  <span slot="prefix">🏷️</span>
  前缀插槽
</ldesign-tag>
<ldesign-tag color="success" variant="solid">
  后缀插槽
  <span slot="suffix">✓</span>
</ldesign-tag>
```

## 禁用状态

使用 `disabled` 属性禁用标签。

<div class="demo-block">
  <ldesign-tag disabled>默认禁用</ldesign-tag>
  <ldesign-tag disabled color="primary" variant="solid">实底禁用</ldesign-tag>
  <ldesign-tag disabled color="success" closable>可关闭禁用</ldesign-tag>
  <ldesign-tag disabled color="warning" checkable>可选禁用</ldesign-tag>
</div>

```html
<ldesign-tag disabled>默认禁用</ldesign-tag>
<ldesign-tag disabled color="primary" variant="solid">实底禁用</ldesign-tag>
<ldesign-tag disabled color="success" closable>可关闭禁用</ldesign-tag>
<ldesign-tag disabled color="warning" checkable>可选禁用</ldesign-tag>
```

## 更多样式组合

展示不同颜色、尺寸和形状的组合。

<div class="demo-block">
  <h4 style="margin: 0 0 12px 0; font-size: 13px; color: #666;">小尺寸标签</h4>
  <ldesign-tag size="small" color="primary">小标签</ldesign-tag>
  <ldesign-tag size="small" color="success" variant="solid">完成</ldesign-tag>
  <ldesign-tag size="small" color="warning" variant="outline">待处理</ldesign-tag>
  <ldesign-tag size="small" color="danger" closable>可关闭</ldesign-tag>
  
  <h4 style="margin: 16px 0 12px 0; font-size: 13px; color: #666;">中等尺寸（默认）</h4>
  <ldesign-tag color="primary">React</ldesign-tag>
  <ldesign-tag color="success" variant="solid">Vue</ldesign-tag>
  <ldesign-tag color="warning" variant="outline">Angular</ldesign-tag>
  <ldesign-tag color="danger" variant="dashed">Svelte</ldesign-tag>
  
  <h4 style="margin: 16px 0 12px 0; font-size: 13px; color: #666;">大尺寸标签</h4>
  <ldesign-tag size="large" color="primary" shape="pill">JavaScript</ldesign-tag>
  <ldesign-tag size="large" color="success" shape="round" variant="solid">TypeScript</ldesign-tag>
  <ldesign-tag size="large" color="warning" shape="pill" variant="outline">Python</ldesign-tag>
  
  <h4 style="margin: 16px 0 12px 0; font-size: 13px; color: #666;">带图标的标签</h4>
  <ldesign-tag icon="check" color="success">已验证</ldesign-tag>
  <ldesign-tag icon="alert-circle" color="warning" variant="solid">警告</ldesign-tag>
  <ldesign-tag icon="star" color="primary" variant="outline">精选</ldesign-tag>
  <ldesign-tag icon="fire" color="danger" variant="solid">热门</ldesign-tag>
</div>

```html
<!-- 小尺寸 -->
<ldesign-tag size="small" color="primary">小标签</ldesign-tag>
<ldesign-tag size="small" color="success" variant="solid">完成</ldesign-tag>

<!-- 中等尺寸（默认） -->
<ldesign-tag color="primary">React</ldesign-tag>
<ldesign-tag color="success" variant="solid">Vue</ldesign-tag>

<!-- 大尺寸 -->
<ldesign-tag size="large" color="primary" shape="pill">JavaScript</ldesign-tag>

<!-- 带图标 -->
<ldesign-tag icon="check" color="success">已验证</ldesign-tag>
<ldesign-tag icon="star" color="primary" variant="outline">精选</ldesign-tag>
```

## 综合示例

展示标签的各种组合效果。

<div class="demo-block">
  <ldesign-tag 
    color="primary" 
    variant="solid" 
    size="large" 
    shape="pill" 
    icon="star" 
    badge="NEW"
    clickable
    border-animation>
    精致标签
  </ldesign-tag>
  
  <ldesign-tag 
    color="success" 
    variant="elevated" 
    icon="check" 
    checkable
    effect="gradient">
    可选择
  </ldesign-tag>
  
  <ldesign-tag 
    color="warning" 
    variant="outline" 
    dot
    badge-pulse
    closable>
    带提醒
  </ldesign-tag>
  
  <ldesign-tag 
    custom-color="#EC4899" 
    variant="solid" 
    effect="neon"
    size="large"
    shape="round">
    霓虹自定义
  </ldesign-tag>
</div>

```html
<ldesign-tag 
  color="primary" 
  variant="solid" 
  size="large" 
  shape="pill" 
  icon="star" 
  badge="NEW"
  clickable
  border-animation>
  精致标签
</ldesign-tag>

<ldesign-tag 
  color="success" 
  variant="elevated" 
  icon="check" 
  checkable
  effect="gradient">
  可选择
</ldesign-tag>

<ldesign-tag 
  color="warning" 
  variant="outline" 
  dot
  badge-pulse
  closable>
  带提醒
</ldesign-tag>

<ldesign-tag 
  custom-color="#EC4899" 
  variant="solid" 
  effect="neon"
  size="large"
  shape="round">
  霓虹自定义
</ldesign-tag>
```

## API

### Tag Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| color | 语义颜色 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` |
| variant | 外观风格 | `'light' \| 'solid' \| 'outline' \| 'ghost' \| 'dashed' \| 'elevated'` | `'light'` |
| size | 尺寸 | `'small' \| 'middle' \| 'large'` | `'middle'` |
| shape | 形状 | `'rectangle' \| 'round' \| 'pill'` | `'rectangle'` |
| custom-color | 自定义颜色（hex/rgb/hsl） | `string` | - |
| effect | 视觉效果 | `'none' \| 'gradient' \| 'glass' \| 'neon'` | `'none'` |
| closable | 是否可关闭 | `boolean` | `false` |
| clickable | 是否可点击 | `boolean` | `false` |
| checkable | 是否可选中 | `boolean` | `false` |
| selected | 选中状态（配合 checkable 使用） | `boolean` | `false` |
| loading | 加载状态 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |
| icon | 左侧图标名称 | `string` | - |
| badge | 右上角角标内容 | `string \| number` | - |
| dot | 右上角小圆点 | `boolean` | `false` |
| badge-pulse | 角标脉动效果 | `boolean` | `false` |
| border-animation | 边框动画效果（仅交互态） | `boolean` | `false` |
| close-aria-label | 关闭按钮无障碍文案 | `string` | `'关闭标签'` |

### Tag Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| ldesignClose | 点击关闭按钮时触发 | `(event: MouseEvent) => void` |
| ldesignChange | 选中状态变化时触发（仅 checkable 时） | `(selected: boolean) => void` |

### Tag Slots

| 插槽名 | 说明 |
|--------|------|
| default | 标签内容 |
| prefix | 前缀内容 |
| suffix | 后缀内容 |

## 无障碍

- 当 `checkable` 为 `true` 时，标签会被渲染为 `role="checkbox"`，支持键盘操作（Enter/Space 切换选中）
- 当 `clickable` 为 `true` 时，标签会被渲染为 `role="button"`，支持键盘操作（Enter/Space 触发点击）
- 关闭按钮拥有清晰的 `aria-label`，可通过 `close-aria-label` 属性自定义
- 所有交互态标签都支持键盘焦点，并有清晰的焦点指示器

## 设计指南

### 颜色使用

- **default**: 用于一般信息或中性标签
- **primary**: 用于强调重要信息或主要操作
- **success**: 用于表示成功、完成或正面信息
- **warning**: 用于警告或需要注意的信息
- **danger**: 用于错误、危险或负面信息

### 外观选择

- **light**: 最常用，适合大多数场景，视觉柔和
- **solid**: 强调度最高，适合需要突出的场景
- **outline**: 轻量化，适合次要信息
- **ghost**: 极简风格，适合辅助信息
- **dashed**: 用于表示草稿、临时或未确定状态
- **elevated**: 需要立体感和层次感的场景

### 尺寸建议

- **small**: 紧凑型布局，如表格单元格、紧密排列的标签组
- **middle**: 默认尺寸，适合大多数场景
- **large**: 需要强调的场景，如页面标题标签、重要标识

## Tag Group 标签组

### 基础标签组

<div class="demo-block">
  <ldesign-tag-group id="basic-group"></ldesign-tag-group>
</div>

### 拖拽排序

拖动标签可以调整顺序。

<div class="demo-block">
  <ldesign-tag-group id="drag-group" enable-drag></ldesign-tag-group>
</div>

### 动态添加标签

点击添加按钮，输入标签名，回车确认。

<div class="demo-block">
  <ldesign-tag-group id="add-group" addable add-text="+ 添加标签"></ldesign-tag-group>
</div>

### 拖拽 + 添加

结合拖拽和添加功能。

<div class="demo-block">
  <ldesign-tag-group id="full-group" enable-drag addable></ldesign-tag-group>
</div>

<style scoped>
.demo-block {
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  margin: 16px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.demo-block ldesign-tag {
  margin: 0;
}

.demo-block ldesign-tag-group {
  width: 100%;
}
</style>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // 基础标签组
  const basicGroup = document.querySelector('#basic-group');
  if (basicGroup) {
    basicGroup.tags = [
      { id: '1', label: 'JavaScript', color: 'primary', closable: true },
      { id: '2', label: 'TypeScript', color: 'primary', variant: 'solid', closable: true },
      { id: '3', label: 'React', color: 'success', closable: true },
      { id: '4', label: 'Vue', color: 'success', variant: 'solid', closable: true }
    ];
  }
  
  // 拖拽排序组
  const dragGroup = document.querySelector('#drag-group');
  if (dragGroup) {
    dragGroup.tags = [
      { id: '1', label: '拖动我 1', color: 'primary', closable: true },
      { id: '2', label: '拖动我 2', color: 'success', closable: true },
      { id: '3', label: '拖动我 3', color: 'warning', closable: true },
      { id: '4', label: '拖动我 4', color: 'danger', closable: true }
    ];
    
    // 监听顺序变化
    dragGroup.addEventListener('ldesignChange', (e) => {
      console.log('标签顺序变化:', e.detail);
    });
  }
  
  // 动态添加组
  const addGroup = document.querySelector('#add-group');
  if (addGroup) {
    addGroup.tags = [
      { id: '1', label: '已有标签', color: 'default', closable: true }
    ];
    
    // 监听添加事件
    addGroup.addEventListener('ldesignAdd', (e) => {
      console.log('添加标签:', e.detail);
    });
    
    // 监听删除事件
    addGroup.addEventListener('ldesignRemove', (e) => {
      console.log('删除标签:', e.detail);
    });
  }
  
  // 完整功能组
  const fullGroup = document.querySelector('#full-group');
  if (fullGroup) {
    fullGroup.tags = [
      { id: '1', label: 'React', color: 'primary', variant: 'solid', closable: true },
      { id: '2', label: 'Vue', color: 'success', variant: 'solid', closable: true },
      { id: '3', label: 'Angular', color: 'danger', variant: 'solid', closable: true }
    ];
    fullGroup.defaultColor = 'primary';
    fullGroup.defaultVariant = 'light';
    
    // 监听所有事件
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
