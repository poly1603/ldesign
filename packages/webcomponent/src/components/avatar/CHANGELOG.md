# Avatar 组件优化日志

## 🎉 版本优化 - 2025-10-11

### ✨ 新增功能

#### 1. 状态指示器 (Status Indicator)
- 新增 `status` 属性，支持四种状态：
  - `online` - 在线（绿色）
  - `offline` - 离线（灰色）
  - `busy` - 忙碌（红色）
  - `away` - 离开（黄色）
- 新增 `statusColor` 属性，可自定义状态指示器颜色
- 状态点会根据头像尺寸自动调整大小
- 支持悬浮缩放交互效果

**使用示例：**
```html
<ldesign-avatar src="avatar.jpg" status="online"></ldesign-avatar>
<ldesign-avatar text="忙碌" status="busy" status-color="#ff0000"></ldesign-avatar>
```

#### 2. 边框装饰
- 新增 `border` 属性，启用边框
- 新增 `borderColor` 属性，自定义边框颜色（默认 #e8e8e8）
- 新增 `borderWidth` 属性，自定义边框宽度（默认 2px）
- 边框使用 box-shadow 实现，不影响布局

**使用示例：**
```html
<ldesign-avatar src="avatar.jpg" border="true"></ldesign-avatar>
<ldesign-avatar src="avatar.jpg" border="true" border-color="#1890ff" border-width="3"></ldesign-avatar>
```

#### 3. 可点击效果
- 新增 `clickable` 属性，启用点击交互效果
- 悬浮时头像会上移并显示阴影
- 点击时有按压反馈效果
- 图标和文字在悬浮时会有轻微缩放动画

**使用示例：**
```html
<ldesign-avatar src="avatar.jpg" clickable="true"></ldesign-avatar>
```

#### 4. 加载状态
- 新增 `loading` 属性，显示加载中状态
- 加载时显示旋转的 spinner 动画
- spinner 尺寸会根据头像大小自适应
- 加载时头像内容会被半透明遮罩覆盖

**使用示例：**
```html
<ldesign-avatar src="avatar.jpg" loading="true"></ldesign-avatar>
```

#### 5. 徽标位置控制
- 新增 `badgePosition` 属性，支持四个位置：
  - `top-right` - 右上角（默认）
  - `top-left` - 左上角
  - `bottom-right` - 右下角
  - `bottom-left` - 左下角
- 新增 `badgeOffset` 属性，支持自定义偏移量 `[x, y]`
- 徽标支持悬浮缩放效果

**使用示例：**
```html
<ldesign-avatar src="avatar.jpg" badge-value="5" badge-position="bottom-right"></ldesign-avatar>
<ldesign-avatar src="avatar.jpg" badge-value="99" badge-offset="[2, 2]"></ldesign-avatar>
```

### 🔧 样式优化

#### 1. 修复徽标被裁剪问题
- **问题**：之前徽标使用负定位值（right: -2px, top: -2px），在某些情况下会被父容器裁剪
- **解决**：改为使用 `right: 0, top: 0`，确保徽标完全显示在头像范围内
- **改进**：徽标现在有更好的 z-index 层级管理

#### 2. 精细化视觉效果
- 添加平滑的过渡动画（使用 cubic-bezier 缓动函数）
- 图标尺寸从 60% 调整为 55%，视觉更协调
- 文字头像增加字体粗细（font-weight: 500）和字间距
- 改进预设尺寸：
  - small: 36px → 32px
  - medium: 40px（不变）
  - large: 44px → 48px
- 字体大小不再使用百分比计算，改为固定值：
  - small: 14px
  - medium: 16px
  - large: 20px

#### 3. 交互动画增强
- 所有过渡使用统一的 0.3s cubic-bezier(0.4, 0, 0.2, 1) 缓动
- 图片、图标、文字都支持悬浮缩放效果（需要 clickable）
- 徽标和状态点支持悬浮放大效果
- 头像组（avatar-group）中的头像悬浮时会提升并放大

#### 4. 头像组优化
- 头像组中的每个头像悬浮时会：
  - z-index 提升到 10
  - 向上移动 4px 并缩放 1.05 倍
  - 显示更明显的阴影效果
- +N 标签也支持相同的悬浮效果
- 改进字体粗细和光标样式

#### 5. 边框圆角优化
- 方形头像的圆角从默认值改为 8px
- 使用 CSS 变量 `--ls-border-radius-base` 支持主题定制

### 📚 新增演示文件
- 创建了完整的 `demo.html` 演示页面
- 包含所有新功能的使用示例
- 提供视觉精美的展示界面
- 包含代码示例和说明

### 🎨 设计理念

本次优化遵循以下设计原则：

1. **视觉精细度**：更细致的尺寸、间距和字体设置
2. **交互反馈**：所有可交互元素都有明确的视觉反馈
3. **动画流畅性**：使用标准的缓动函数，确保动画自然
4. **层级清晰**：徽标、状态点、加载层都有明确的 z-index 管理
5. **响应式设计**：所有新增元素都支持不同尺寸的自适应

### 🔄 向后兼容

所有新增功能都是可选的，不影响现有代码：
- 现有的 avatar 组件无需修改即可正常工作
- 新增属性都有合理的默认值
- 没有移除或修改现有的 API

### 📝 API 新增属性总览

| 属性 | 类型 | 默认值 | 说明 |
|-----|------|--------|------|
| `status` | `'online' \| 'offline' \| 'busy' \| 'away'` | - | 状态指示器 |
| `statusColor` | `string` | - | 自定义状态颜色 |
| `clickable` | `boolean` | `false` | 启用点击效果 |
| `border` | `boolean` | `false` | 显示边框 |
| `borderColor` | `string` | `'#e8e8e8'` | 边框颜色 |
| `borderWidth` | `number` | `2` | 边框宽度 |
| `loading` | `boolean` | `false` | 显示加载状态 |
| `badgePosition` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `'top-right'` | 徽标位置 |
| `badgeOffset` | `[number, number]` | `[0, 0]` | 徽标偏移量 |

### 🎯 典型使用场景

#### 用户在线状态
```html
<ldesign-avatar 
  src="user.jpg" 
  status="online"
  clickable="true">
</ldesign-avatar>
```

#### VIP 用户标识
```html
<ldesign-avatar 
  text="VIP"
  background="#fa8c16"
  border="true"
  border-color="#faad14"
  border-width="3"
  badge-value="👑"
  clickable="true">
</ldesign-avatar>
```

#### 消息通知
```html
<ldesign-avatar 
  src="user.jpg"
  badge-value="99"
  badge-position="top-right"
  clickable="true">
</ldesign-avatar>
```

#### 加载中的头像
```html
<ldesign-avatar 
  src="user.jpg"
  loading="true">
</ldesign-avatar>
```

#### 团队成员展示
```html
<ldesign-avatar-group size="large" gap="12">
  <ldesign-avatar src="user1.jpg" status="online" clickable="true"></ldesign-avatar>
  <ldesign-avatar src="user2.jpg" status="busy" clickable="true"></ldesign-avatar>
  <ldesign-avatar src="user3.jpg" status="away" clickable="true"></ldesign-avatar>
</ldesign-avatar-group>
```

### 🚀 后续计划

可以考虑的未来增强：
- [ ] 支持头像编辑功能（上传、裁剪）
- [ ] 支持视频头像
- [ ] 支持动画 GIF 头像
- [ ] 支持头像框（装饰性边框）
- [ ] 支持渐变色背景
- [ ] 支持更多徽标样式（波纹、闪烁等）
- [ ] 支持拖拽排序（头像组）
- [ ] 支持键盘导航
- [ ] 支持暗黑模式
- [ ] 支持骨架屏加载

---

**优化完成日期**：2025-10-11  
**影响范围**：avatar.tsx, avatar.less, avatar-group.less  
**测试状态**：✅ 已创建演示页面
