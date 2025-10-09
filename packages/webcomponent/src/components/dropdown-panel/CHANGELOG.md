# Dropdown Panel 组件更新日志

## [修复] 2025-10-09 - 动画方向修复

### 🐛 修复的问题

修复了当 `placement` 从 `bottom` 切换到 `top` 时，面板动画方向错误的严重 bug。

**问题表现：**
- 第一次点击：面板从按钮下方正常向下滑出 ✓
- 滚动页面后，组件自动切换到 `placement="top"`
- 第二次点击：面板从**屏幕顶部**向下滑入（错误 ❌）
- **期望：** 面板应该从触发按钮**上方**向上滑出

### 🔧 技术细节

#### 修改文件
- `dropdown-panel.less` - 第 73-86 行

#### 修改内容

**修改前：**
```less
&--top {
  bottom: 0;
  transform: translateY(100%);  // ❌ 错误：向下移动
  transform-origin: bottom;
  
  &.l-dropdown-panel__panel--visible {
    transform: translateY(0);
  }
}
```

**修改后：**
```less
&--top {
  bottom: 0;
  transform: translateY(-100%);  // ✅ 正确：向上移动
  transform-origin: bottom;
  
  &.l-dropdown-panel__panel--visible {
    transform: translateY(0);
  }
}
```

#### 原理说明

1. **面板定位：** `bottom: 0` 让面板底边贴近遮罩底边（触发器位置）
2. **初始状态：** `translateY(-100%)` 让面板向上移动自身高度，完全隐藏在遮罩上方
3. **展开状态：** `translateY(0)` 让面板回到原位，从触发器位置向上展开
4. **遮罩隐藏：** 遮罩的 `overflow: hidden` 确保超出部分不可见

#### 动画对比

| Placement | 面板定位 | 初始 Transform | 展开 Transform | 动画效果 |
|-----------|---------|---------------|---------------|---------|
| bottom    | top: 0  | translateY(-100%) | translateY(0) | 从上向下滑出 |
| top       | bottom: 0 | translateY(-100%) | translateY(0) | 从下向上滑出 |

### ✅ 测试验证

测试场景：
- [x] 从下方打开：动画正确
- [x] 从上方打开：动画从触发器位置开始（已修复）
- [x] 连续切换方向：每次都正确
- [x] 滚动后自动切换：动画正确
- [x] 移动端表现：正常

### 📝 相关文档

- `ANIMATION_FIX.md` - 详细技术说明和原理图解
- `TEST_GUIDE.md` - 完整测试指南

---

## [功能] 2025-10-08 - 智能布局和自动切换

### ✨ 新增功能

1. **智能 Placement 计算**
   - 新增 `placement="auto"` 模式
   - 自动根据可用空间选择最佳弹出方向
   - 即使手动指定方向，空间不足时也会智能切换

2. **面板高度自适应**
   - 面板高度自动适配屏幕可用空间
   - 避免面板超出视窗边界
   - 大内容自动启用滚动

3. **安全距离控制**
   - 新增 `safeDistance` prop（默认 16px）
   - 面板与遮罩边缘保持安全距离
   - 避免面板贴边显示

### 🔧 技术实现

- 实时计算触发器位置和可用空间
- 监听滚动和窗口大小变化
- 动态调整面板 `maxHeight`
- 双 RAF 确保动画流畅

### 📊 API 更新

新增 Props:
- `placement: 'top' | 'bottom' | 'auto'` - 支持自动模式
- `safeDistance: number` - 安全距离配置

---

## [初始] 2025-10-07 - 组件创建

### ✨ 首次发布

创建移动优先的下拉面板组件，支持：
- 从触发器上方/下方弹出
- 部分遮罩层效果
- 平滑滑动动画
- 点击遮罩关闭
- 自定义样式和内容

### 📊 初始 API

Props:
- `visible: boolean` - 控制显示隐藏
- `placement: 'top' | 'bottom'` - 弹出位置
- `maskBackground: string` - 遮罩背景色
- `maxHeight: string` - 最大高度
- `duration: number` - 动画时长
- `maskClosable: boolean` - 遮罩可关闭

Methods:
- `show()` - 显示面板
- `hide()` - 隐藏面板
- `toggle()` - 切换状态

Events:
- `visibleChange` - 显示状态变化

Slots:
- `trigger` - 触发器内容
- `default` - 面板内容

---

## 版本规划

### 未来计划

- [ ] 添加更多动画效果（淡入、缩放等）
- [ ] 支持自定义动画时长曲线
- [ ] 添加键盘导航支持（ESC 关闭）
- [ ] 支持嵌套面板
- [ ] 添加主题定制能力
- [ ] 性能优化（虚拟滚动）

### 已知限制

- 当前仅支持移动端优化布局
- 动画在低性能设备上可能不够流畅
- 嵌套滚动容器可能影响位置计算

---

**维护者：** LDesign Team  
**最后更新：** 2025-10-09
