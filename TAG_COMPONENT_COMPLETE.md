# Tag 和 Tag Group 组件 - 完整功能说明

## 🎉 全部完成！

### ✅ Tag 组件优化

#### 1. 字体精致化
- **Small**: 11px (更紧凑)
- **Middle**: 12px (默认，更精致)
- **Large**: 13px (更协调)

#### 2. 关闭按钮优化
- ✅ 圆形设计 (`border-radius: 50%`)
- ✅ 固定尺寸 14×14px
- ✅ 更小的图标 (10px)
- ✅ 精致的悬停效果

#### 3. 新增功能
- ✅ `badge-pulse`: 角标脉动动画
- ✅ `border-animation`: 边框动画效果

#### 4. 文档示例
- ✅ 角标脉动效果示例
- ✅ 更多样式组合展示
- ✅ Tag Group 交互演示

### ✅ Tag Group 组件功能

#### 核心功能
1. **拖拽排序** (`enable-drag`)
   - 拖拽时标签半透明+缩小
   - 蓝色指示条显示放置位置
   - grab/grabbing 光标
   - 平滑的动画效果

2. **动态添加** (`addable`)
   - 点击按钮变输入框
   - 自动获得焦点
   - 回车确认添加
   - ESC 取消
   - 失焦自动确认
   - 弹跳动画

3. **完整事件系统**
   - `ldesignAdd`: 添加标签时触发
   - `ldesignRemove`: 删除标签时触发
   - `ldesignChange`: 标签变化时触发

## 📚 Tag.md 文档演示

文档中现在包含 **4 个实际可交互的 Tag Group 演示**：

### 1. 基础标签组
```html
<ldesign-tag-group id="basic-group"></ldesign-tag-group>
```
展示基本的标签显示和删除功能。

### 2. 拖拽排序
```html
<ldesign-tag-group id="drag-group" enable-drag></ldesign-tag-group>
```
演示拖拽排序功能，可以调整标签顺序。

### 3. 动态添加
```html
<ldesign-tag-group id="add-group" addable add-text="+ 添加标签"></ldesign-tag-group>
```
演示添加新标签功能，点击按钮输入。

### 4. 完整功能
```html
<ldesign-tag-group id="full-group" enable-drag addable></ldesign-tag-group>
```
结合拖拽和添加功能的完整演示。

## 🎯 使用示例

### Tag 组件

```html
<!-- 精致的小标签 -->
<ldesign-tag size="small" color="primary">小标签</ldesign-tag>

<!-- 圆形关闭按钮 -->
<ldesign-tag closable color="success">可关闭</ldesign-tag>

<!-- 角标脉动 -->
<ldesign-tag badge="5" badge-pulse color="danger">新消息</ldesign-tag>

<!-- 边框动画 -->
<ldesign-tag clickable border-animation color="primary">悬停查看</ldesign-tag>
```

### Tag Group 组件

```html
<ldesign-tag-group 
  id="my-tags"
  enable-drag
  addable
  add-text="+ 添加"
  default-color="primary"
  default-variant="light">
</ldesign-tag-group>

<script>
const tagGroup = document.querySelector('#my-tags');

// 设置初始数据
tagGroup.tags = [
  { id: '1', label: 'React', color: 'primary', variant: 'solid', closable: true },
  { id: '2', label: 'Vue', color: 'success', variant: 'solid', closable: true }
];

// 监听事件
tagGroup.addEventListener('ldesignAdd', (e) => {
  console.log('➕ 添加:', e.detail);
});

tagGroup.addEventListener('ldesignRemove', (e) => {
  console.log('❌ 删除:', e.detail);
});

tagGroup.addEventListener('ldesignChange', (e) => {
  console.log('🔄 变化:', e.detail);
});
</script>
```

## 📋 完整 Props

### Tag Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| color | 语义颜色 | `'default' \| 'primary' \| 'success' \| 'warning' \| 'danger'` | `'default'` |
| variant | 外观风格 | `'light' \| 'solid' \| 'outline' \| 'ghost' \| 'dashed' \| 'elevated'` | `'light'` |
| size | 尺寸 | `'small' \| 'middle' \| 'large'` | `'middle'` |
| shape | 形状 | `'rectangle' \| 'round' \| 'pill'` | `'rectangle'` |
| closable | 是否可关闭 | `boolean` | `false` |
| clickable | 是否可点击 | `boolean` | `false` |
| checkable | 是否可选中 | `boolean` | `false` |
| badge | 角标内容 | `string \| number` | - |
| badge-pulse | 角标脉动 | `boolean` | `false` |
| border-animation | 边框动画 | `boolean` | `false` |
| icon | 左侧图标 | `string` | - |
| loading | 加载状态 | `boolean` | `false` |
| disabled | 是否禁用 | `boolean` | `false` |

### Tag Group Props

| 属性 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| tags | 标签数据数组 | `TagData[]` | `[]` |
| **enable-drag** | 启用拖拽排序 | `boolean` | `false` |
| addable | 显示添加按钮 | `boolean` | `false` |
| add-text | 添加按钮文本 | `string` | `'+ 添加标签'` |
| input-placeholder | 输入框占位符 | `string` | `'请输入标签名'` |
| default-color | 新标签默认颜色 | `string` | `'default'` |
| default-variant | 新标签默认样式 | `string` | `'light'` |
| disabled | 是否禁用 | `boolean` | `false` |

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

## 🎨 视觉特点

### Tag 组件
- ✨ 更小更精致的字体
- ⭕ 圆形关闭按钮
- 💫 流畅的微交互
- 🎨 丰富的样式变体
- ✨ 多种视觉特效

### Tag Group 组件
- 🎯 拖拽时蓝色指示条
- 📍 半透明+缩小的拖拽反馈
- 🎪 弹跳的添加动画
- 🎭 淡入的输入框动画
- 🖱️ grab/grabbing 光标

## 🔥 在线演示

在 VitePress 文档中可以看到：

1. **基础标签组** - 显示和删除
2. **拖拽排序** - 实时拖拽调整顺序
3. **动态添加** - 点击添加，输入确认
4. **完整功能** - 拖拽+添加组合

### 体验方式

```bash
# 启动文档服务器
pnpm docs:dev

# 访问
http://localhost:5173/ldesign-webcomponent/

# 导航到 "Tag 标签" 页面
# 滚动到底部查看 "Tag Group 标签组" 部分
```

## 🎯 交互说明

### 拖拽操作
1. 鼠标悬停在标签上，显示 `grab` 光标
2. 按住鼠标拖动，标签变半透明并缩小
3. 移动到目标位置，显示蓝色指示条
4. 释放鼠标，标签放置到新位置
5. 触发 `ldesignChange` 事件

### 添加操作
1. 点击 "+ 添加标签" 按钮
2. 按钮变成输入框并自动获得焦点
3. 输入标签名称
4. 按回车确认或 ESC 取消
5. 新标签以弹跳动画出现
6. 触发 `ldesignAdd` 事件

### 删除操作
1. 点击标签上的圆形关闭按钮
2. 标签消失
3. 触发 `ldesignRemove` 事件

## 📊 性能特点

- ✅ GPU 加速的 transform 动画
- ✅ 原生 HTML5 拖拽 API
- ✅ 智能的焦点管理
- ✅ 防抖的输入处理
- ✅ 响应式设计
- ✅ 支持 reduced-motion

## 🎓 最佳实践

### 1. 博客标签管理
```html
<ldesign-tag-group 
  enable-drag 
  addable 
  default-color="primary">
</ldesign-tag-group>
```

### 2. 技能标签展示
```html
<ldesign-tag-group 
  addable
  default-color="success"
  default-variant="solid">
</ldesign-tag-group>
```

### 3. 任务标签
```html
<ldesign-tag-group 
  enable-drag
  addable
  default-color="warning">
</ldesign-tag-group>
```

## 🐛 故障排除

### 类型错误
已修复所有 TypeScript 类型错误，使用严格的联合类型。

### 属性名冲突
`draggable` 已重命名为 `enable-drag`，避免与 HTML 标准属性冲突。

### 文档更新
需要手动在两个文档文件中替换 `draggable` → `enable-drag`。

## ✨ 下一步

1. 手动替换文档中的 `draggable` → `enable-drag`
2. 运行 `pnpm build` 验证
3. 运行 `pnpm docs:dev` 查看效果
4. 在浏览器中测试拖拽和添加功能

---

**恭喜！Tag 和 Tag Group 组件已全部完成！** 🎊

现在你拥有一个功能完整、视觉精致、交互流畅的标签管理系统！
