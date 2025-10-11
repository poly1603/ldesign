# Avatar 头像

头像组件，用于展示用户头像、图标或文字，支持多种展示形式和交互效果。

## 基础用法

支持三种展示形态：图片、图标、文字。

<demo>

```html
<ldesign-avatar src="https://i.pravatar.cc/100?img=1"></ldesign-avatar>
<ldesign-avatar icon="user" background="#1890ff"></ldesign-avatar>
<ldesign-avatar text="U" background="#fa8c16"></ldesign-avatar>
<ldesign-avatar text="用户" background="#722ed1"></ldesign-avatar>
```

</demo>

## 不同尺寸

提供三种预设尺寸：`small`、`medium`（默认）、`large`，也支持自定义像素值。

<demo>

```html
<ldesign-avatar src="https://i.pravatar.cc/100?img=2" size="small"></ldesign-avatar>
<ldesign-avatar src="https://i.pravatar.cc/100?img=2" size="medium"></ldesign-avatar>
<ldesign-avatar src="https://i.pravatar.cc/100?img=2" size="large"></ldesign-avatar>

<!-- 自定义尺寸 -->
<ldesign-avatar src="https://i.pravatar.cc/100?img=3" size="64"></ldesign-avatar>
<ldesign-avatar src="https://i.pravatar.cc/100?img=3" size="80"></ldesign-avatar>
```

</demo>

## 不同形状

支持两种形状：圆形（`circle`，默认）和方形（`square`）。

<demo>

```html
<ldesign-avatar src="https://i.pravatar.cc/100?img=4" shape="circle"></ldesign-avatar>
<ldesign-avatar src="https://i.pravatar.cc/100?img=4" shape="square"></ldesign-avatar>

<ldesign-avatar icon="user" shape="circle" background="#52c41a"></ldesign-avatar>
<ldesign-avatar icon="user" shape="square" background="#fa8c16"></ldesign-avatar>
```

</demo>

## 文字自动缩放

对于文字头像，当文字较长时，会根据头像宽度自动缩放。可使用 `gap` 调节左右留白。

<demo>

```html
<ldesign-avatar text="U" background="#1890ff"></ldesign-avatar>
<ldesign-avatar text="User" background="#52c41a"></ldesign-avatar>
<ldesign-avatar text="Admin" background="#fa8c16"></ldesign-avatar>
<ldesign-avatar text="张三" background="#722ed1"></ldesign-avatar>

<!-- 调整 gap -->
<ldesign-avatar text="Gap0" background="#1890ff" gap="0"></ldesign-avatar>
<ldesign-avatar text="Gap4" background="#52c41a" gap="4"></ldesign-avatar>
<ldesign-avatar text="Gap8" background="#fa8c16" gap="8"></ldesign-avatar>
```

</demo>

## 徽标

支持显示红点或数字徽标，可用于消息通知或状态提示。

### 红点徽标

<demo>

```html
<ldesign-avatar src="https://i.pravatar.cc/100?img=5" badge="true"></ldesign-avatar>
<ldesign-avatar icon="user" background="#52c41a" badge="true"></ldesign-avatar>
<ldesign-avatar text="A" background="#1890ff" badge="true"></ldesign-avatar>

<!-- 自定义徽标颜色 -->
<ldesign-avatar src="https://i.pravatar.cc/100?img=6" badge="true" badge-color="#52c41a"></ldesign-avatar>
```

</demo>

### 数字徽标

<demo>

```html
<ldesign-avatar src="https://i.pravatar.cc/100?img=7" badge-value="5"></ldesign-avatar>
<ldesign-avatar icon="user" background="#fa8c16" badge-value="99"></ldesign-avatar>
<ldesign-avatar text="B" background="#722ed1" badge-value="999"></ldesign-avatar>
```

</demo>

### 徽标位置

支持四个角落的徽标位置：`top-right`（默认）、`top-left`、`bottom-right`、`bottom-left`。

<demo>

```html
<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=8" 
  badge-value="1" 
  badge-position="top-right">
</ldesign-avatar>

<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=8" 
  badge-value="2" 
  badge-position="top-left">
</ldesign-avatar>

<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=8" 
  badge-value="3" 
  badge-position="bottom-right">
</ldesign-avatar>

<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=8" 
  badge-value="4" 
  badge-position="bottom-left">
</ldesign-avatar>
```

</demo>

## 状态指示器

显示用户在线状态，支持四种状态：`online`（在线）、`offline`（离线）、`busy`（忙碌）、`away`（离开）。

<demo>

```html
<ldesign-avatar src="https://i.pravatar.cc/100?img=9" status="online"></ldesign-avatar>
<ldesign-avatar src="https://i.pravatar.cc/100?img=10" status="offline"></ldesign-avatar>
<ldesign-avatar src="https://i.pravatar.cc/100?img=11" status="busy"></ldesign-avatar>
<ldesign-avatar src="https://i.pravatar.cc/100?img=12" status="away"></ldesign-avatar>

<!-- 文字头像 + 状态 -->
<ldesign-avatar text="在线" background="#52c41a" status="online"></ldesign-avatar>
<ldesign-avatar text="离线" background="#8c8c8c" status="offline"></ldesign-avatar>
<ldesign-avatar text="忙碌" background="#ff4d4f" status="busy"></ldesign-avatar>
<ldesign-avatar text="离开" background="#faad14" status="away"></ldesign-avatar>

<!-- 自定义状态颜色 -->
<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=13" 
  status="online" 
  status-color="#00ff00">
</ldesign-avatar>
```

</demo>

## 边框

可添加边框装饰，自定义边框颜色和宽度。

<demo>

```html
<ldesign-avatar src="https://i.pravatar.cc/100?img=14" border="true"></ldesign-avatar>

<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=15" 
  border="true" 
  border-color="#1890ff">
</ldesign-avatar>

<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=16" 
  border="true" 
  border-color="#52c41a" 
  border-width="3">
</ldesign-avatar>

<ldesign-avatar 
  text="边框" 
  background="#722ed1" 
  border="true" 
  border-color="#eb2f96" 
  border-width="4">
</ldesign-avatar>
```

</demo>

## 可点击效果

设置 `clickable` 属性后，悬浮时会有提升和阴影效果。

<demo>

```html
<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=17" 
  clickable="true">
</ldesign-avatar>

<ldesign-avatar 
  icon="user" 
  background="#1890ff" 
  clickable="true">
</ldesign-avatar>

<ldesign-avatar 
  text="点我" 
  background="#fa8c16" 
  clickable="true">
</ldesign-avatar>

<ldesign-avatar 
  text="试试" 
  background="#52c41a" 
  clickable="true" 
  badge-value="3">
</ldesign-avatar>

<script>
document.querySelectorAll('ldesign-avatar[clickable="true"]').forEach(avatar => {
  avatar.addEventListener('ldesignClick', (e) => {
    alert('Avatar clicked!');
  });
});
</script>
```

</demo>

## 加载状态

显示加载中的状态，带旋转动画。

<demo>

```html
<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=18" 
  loading="true">
</ldesign-avatar>

<ldesign-avatar 
  icon="user" 
  background="#1890ff" 
  loading="true">
</ldesign-avatar>

<ldesign-avatar 
  text="加载" 
  background="#fa8c16" 
  loading="true">
</ldesign-avatar>

<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=19" 
  size="large" 
  loading="true">
</ldesign-avatar>
```

</demo>

## 组合使用

多种特性可以组合使用，创建丰富的展示效果。

<demo>

```html
<!-- 完整功能组合 -->
<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=20" 
  size="large"
  border="true" 
  border-color="#1890ff" 
  border-width="3"
  badge-value="99"
  status="online"
  clickable="true">
</ldesign-avatar>

<!-- VIP 用户 -->
<ldesign-avatar 
  text="VIP" 
  background="#fa8c16"
  size="large"
  shape="square"
  border="true" 
  border-color="#faad14"
  badge-value="⭐"
  clickable="true">
</ldesign-avatar>

<!-- 管理员 -->
<ldesign-avatar 
  icon="shield" 
  background="#52c41a"
  size="large"
  border="true" 
  border-color="#95de64"
  border-width="3"
  status="busy"
  clickable="true">
</ldesign-avatar>
```

</demo>

## 头像组

使用 `ldesign-avatar-group` 可以将多个头像组合展示，支持重叠效果。

### 基础用法

<demo>

```html
<ldesign-avatar-group>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=21"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=22"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=23"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=24"></ldesign-avatar>
</ldesign-avatar-group>
```

</demo>

### 最大显示数

通过 `max` 属性限制显示的头像数量，超出部分会显示为 `+N`。

<demo>

```html
<ldesign-avatar-group max="3">
  <ldesign-avatar src="https://i.pravatar.cc/100?img=25"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=26"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=27"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=28"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=29"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=30"></ldesign-avatar>
</ldesign-avatar-group>
```

</demo>

### 统一尺寸和形状

可以统一设置所有头像的尺寸和形状。

<demo>

```html
<ldesign-avatar-group size="large" shape="square">
  <ldesign-avatar src="https://i.pravatar.cc/100?img=31"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=32"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=33"></ldesign-avatar>
</ldesign-avatar-group>
```

</demo>

### 调整间距

通过 `gap` 属性调整头像之间的重叠间距。

<demo>

```html
<ldesign-avatar-group gap="12">
  <ldesign-avatar src="https://i.pravatar.cc/100?img=34"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=35"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=36"></ldesign-avatar>
</ldesign-avatar-group>

<ldesign-avatar-group gap="4">
  <ldesign-avatar src="https://i.pravatar.cc/100?img=37"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=38"></ldesign-avatar>
  <ldesign-avatar src="https://i.pravatar.cc/100?img=39"></ldesign-avatar>
</ldesign-avatar-group>
```

</demo>

### 带状态的头像组

<demo>

```html
<ldesign-avatar-group size="large" gap="12">
  <ldesign-avatar 
    src="https://i.pravatar.cc/100?img=40" 
    status="online">
  </ldesign-avatar>
  <ldesign-avatar 
    src="https://i.pravatar.cc/100?img=41" 
    status="busy">
  </ldesign-avatar>
  <ldesign-avatar 
    src="https://i.pravatar.cc/100?img=42" 
    status="away">
  </ldesign-avatar>
  <ldesign-avatar 
    src="https://i.pravatar.cc/100?img=43" 
    status="offline">
  </ldesign-avatar>
</ldesign-avatar-group>
```

</demo>

## 响应式尺寸

支持使用 CSS clamp 实现响应式尺寸。

<demo>

```html
<ldesign-avatar 
  src="https://i.pravatar.cc/100?img=44"
  responsive="true"
  responsive-min="32"
  responsive-max="64"
  responsive-mid="8vw">
</ldesign-avatar>

<ldesign-avatar 
  text="响应"
  background="#1890ff"
  responsive="true"
  responsive-min="28"
  responsive-max="56"
  responsive-mid="6vw">
</ldesign-avatar>
```

</demo>

## API

### Avatar Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| src | 图片地址 | `string` | - |
| srcset | 响应式图片 srcset | `string` | - |
| sizes | 响应式图片 sizes | `string` | - |
| alt | 替代文本 | `string` | - |
| fit | 图片填充模式 | `'fill' \| 'contain' \| 'cover' \| 'none' \| 'scale-down'` | `'cover'` |
| icon | 图标名称（Lucide） | `string` | - |
| text | 文字内容 | `string` | - |
| gap | 文字与容器左右间距（px） | `number` | `4` |
| autosize | 是否根据宽度自动缩放文字 | `boolean` | `true` |
| size | 尺寸 | `'small' \| 'middle' \| 'medium' \| 'large' \| number` | `'medium'` |
| shape | 形状 | `'circle' \| 'square'` | `'circle'` |
| color | 文本/图标颜色 | `string` | - |
| background | 背景色 | `string` | - |
| responsive | 响应式尺寸 | `boolean` | `false` |
| responsive-min | clamp 最小像素 | `number` | `28` |
| responsive-max | clamp 最大像素 | `number` | `64` |
| responsive-mid | clamp 中间项 | `string` | `'10vw'` |
| badge | 是否显示徽标红点 | `boolean` | `false` |
| badge-value | 徽标数字 | `number \| string` | - |
| badge-color | 徽标颜色 | `string` | `'#ff4d4f'` |
| badge-position | 徽标位置 | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` |
| badge-offset | 徽标偏移量 [x, y] | `[number, number]` | `[0, 0]` |
| status | 在线状态指示器 | `'online' \| 'offline' \| 'busy' \| 'away'` | - |
| status-color | 状态指示器颜色 | `string` | - |
| clickable | 是否可点击 | `boolean` | `false` |
| border | 是否显示边框 | `boolean` | `false` |
| border-color | 边框颜色 | `string` | `'#e8e8e8'` |
| border-width | 边框宽度 | `number` | `2` |
| loading | 是否显示加载态 | `boolean` | `false` |

### Avatar Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| ldesignLoad | 图片加载成功 | `{ width: number; height: number; src: string }` |
| ldesignError | 图片加载失败 | `{ src?: string; error: string }` |
| ldesignClick | 点击事件 | `MouseEvent` |

### Avatar-Group Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| max | 展示的最大头像数 | `number` | - |
| size | 统一尺寸 | `'small' \| 'middle' \| 'medium' \| 'large' \| number` | - |
| shape | 统一形状 | `'circle' \| 'square'` | - |
| gap | 重叠间距（px） | `number` | `8` |
| border-color | 边框颜色 | `string` | `'#fff'` |

## 样式变量

可以通过 CSS 变量自定义样式：

```css
:root {
  /* 预设尺寸 */
  --ls-avatar-size-small: 32px;
  --ls-avatar-size-medium: 40px;
  --ls-avatar-size-large: 48px;
  
  /* 颜色 */
  --ld-avatar-color: #fff;
  --ld-avatar-bg: #bfbfbf;
  
  /* 圆角 */
  --ls-border-radius-base: 8px;
}
```

## 使用场景

### 1. 用户列表

```html
<ldesign-avatar-group>
  <ldesign-avatar src="user1.jpg" status="online"></ldesign-avatar>
  <ldesign-avatar src="user2.jpg" status="busy"></ldesign-avatar>
  <ldesign-avatar src="user3.jpg" status="away"></ldesign-avatar>
</ldesign-avatar-group>
```

### 2. 消息通知

```html
<ldesign-avatar 
  src="user.jpg" 
  badge-value="99" 
  clickable="true">
</ldesign-avatar>
```

### 3. VIP 标识

```html
<ldesign-avatar 
  text="VIP"
  background="#fa8c16"
  border="true"
  border-color="#faad14"
  badge-value="👑">
</ldesign-avatar>
```

### 4. 团队成员

```html
<ldesign-avatar-group max="5" size="large">
  <ldesign-avatar src="member1.jpg"></ldesign-avatar>
  <ldesign-avatar src="member2.jpg"></ldesign-avatar>
  <ldesign-avatar src="member3.jpg"></ldesign-avatar>
  <ldesign-avatar src="member4.jpg"></ldesign-avatar>
  <ldesign-avatar src="member5.jpg"></ldesign-avatar>
  <ldesign-avatar src="member6.jpg"></ldesign-avatar>
</ldesign-avatar-group>
```

## 注意事项

1. **图片加载**：建议使用合适大小的图片，避免使用过大的图片影响性能
2. **文字长度**：虽然支持自动缩放，但建议文字不要太长，保持在 2-4 个字符最佳
3. **徽标位置**：徽标会显示在头像外部，确保有足够的空间
4. **状态指示器**：状态点固定在右下角，与徽标位置互不冲突
5. **点击事件**：记得监听 `ldesignClick` 事件处理点击操作
6. **头像组间距**：头像组的 `gap` 值会影响重叠程度，建议在 4-12px 之间
