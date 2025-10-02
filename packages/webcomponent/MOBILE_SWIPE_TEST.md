# 移动端滑动关闭测试指南

## 🔧 修复内容

### 1. 移除冲突的触摸监听器
**问题**: 两套触摸事件监听器互相冲突
- `setupMobileTouchListeners()` 添加的监听器只记录触摸位置,不处理滑动关闭
- `render()` 中的 `onTouchStart/Move/End` 才是真正的滑动关闭处理器

**解决**: 移除 `setupMobileTouchListeners()` 中的冗余监听器,统一使用 `handleSwipeStart/Move/End`

### 2. 添加调试日志
为了帮助诊断问题,添加了详细的调试日志:
- `swipeToClose` 属性值
- 触发区域检测结果
- 滑动进度
- 关闭判断逻辑

---

## 🧪 测试步骤

### 步骤 1: 打开浏览器控制台
打开 Chrome DevTools(F12),切换到 Console 标签页

### 步骤 2: 在移动端模式下测试
1. 打开文档页面
2. 切换到移动设备模拟器(Ctrl+Shift+M)
3. 选择设备(如 iPhone 12 Pro)

### 步骤 3: 打开抽屉并观察日志
点击打开抽屉的按钮,查看控制台输出:

#### 期望的日志输出:
```
[Drawer Swipe] swipeToClose: true
[Drawer Swipe] Start { 
  swipeTriggerArea: "anywhere",
  isTriggerArea: true,
  targetClass: "...",
  placement: "bottom"
}
[Drawer Swipe] Moving... { isSwiping: true }
[Drawer Swipe] End { isSwiping: true, swipeProgress: 0.45 }
[Drawer Swipe] Check close { 
  progress: 0.45, 
  velocity: 1200, 
  threshold: 0.24,
  shouldClose: true 
}
[Drawer Swipe] Closing drawer...
```

### 步骤 4: 测试不同的滑动区域

#### 测试 `swipe-trigger-area="anywhere"`
```html
<ldesign-drawer 
  id="swipeDrawer"
  swipe-to-close="true"
  swipe-trigger-area="anywhere">
```

**预期**: 在抽屉任何位置滑动都应该显示日志 `isTriggerArea: true`

#### 测试 `swipe-trigger-area="header"`
```html
<ldesign-drawer 
  id="swipeDrawer"
  swipe-to-close="true"
  swipe-trigger-area="header">
```

**预期**: 
- 在头部滑动: `isTriggerArea: true` ✅
- 在内容区滑动: `isTriggerArea: false` ❌(不触发)

#### 测试 `swipe-trigger-area="edge"`
```html
<ldesign-drawer 
  id="swipeDrawer"
  swipe-to-close="true"
  swipe-trigger-area="edge">
```

**预期**:
- 在边缘 20px 内滑动: `isTriggerArea: true` ✅
- 在中间区域滑动: `isTriggerArea: false` ❌(不触发)

---

## 🐛 可能的问题诊断

### 问题 1: 没有任何日志输出

**可能原因**:
1. `swipe-to-close` 属性未设置或设置为 `false`
2. 触摸事件未正确绑定

**检查**:
```javascript
// 在控制台运行
const drawer = document.getElementById('swipeDrawer');
console.log('swipeToClose:', drawer.swipeToClose);
console.log('swipeTriggerArea:', drawer.swipeTriggerArea);
```

### 问题 2: 显示 `isTriggerArea: false`

**可能原因**:
1. `swipeTriggerArea` 设置不匹配实际操作
2. 目标元素的类名不匹配

**解决**:
- 如果想随处滑动关闭,使用 `swipe-trigger-area="anywhere"`
- 如果只想在头部滑动,确保从头部区域开始滑动

### 问题 3: `isSwiping` 始终为 `false`

**可能原因**:
1. `isSwipeTriggerArea()` 返回 false
2. 触摸事件被其他元素捕获

**检查**:
```javascript
// 检查抽屉元素的事件监听器
const drawer = document.querySelector('ldesign-drawer');
const wrapper = drawer.shadowRoot.querySelector('.drawer-wrapper');
console.log('Touch listeners:', getEventListeners(wrapper));
```

### 问题 4: 滑动有反应但不关闭

**可能原因**:
1. `swipeProgress` 没有达到阈值
2. `swipeThreshold` 设置过高

**解决**:
降低阈值:
```html
<ldesign-drawer 
  swipe-to-close="true"
  swipe-threshold="0.2">
```

---

## 📱 移动端全屏测试

### 问题: "移动端全屏不对"

移动端全屏由 CSS 自动控制,无需手动设置。

#### 自动行为:
- **宽度**: 水平抽屉(左/右) 自动限制为 `min(85vw, calc(100vw - 48px))`
- **高度**: 垂直抽屉(上/下) 自动限制为 `min(80vh, calc(100vh - 60px))`
- **超出**: 所有抽屉绝不超过 `100vw × 100vh`

#### 如果需要真正的全屏:
```html
<ldesign-drawer 
  id="myDrawer"
  size="100%"
  fullscreen="true">
```

#### 验证尺寸:
```javascript
const drawer = document.getElementById('myDrawer');
drawer.addEventListener('drawerOpen', () => {
  const wrapper = drawer.shadowRoot.querySelector('.drawer-wrapper');
  const rect = wrapper.getBoundingClientRect();
  
  console.log('Drawer size:', {
    width: rect.width,
    height: rect.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    exceedsViewport: rect.width > window.innerWidth || rect.height > window.innerHeight
  });
});
```

---

## ✅ 测试检查清单

### 基本滑动关闭
- [ ] 在移动端模拟器中打开抽屉
- [ ] 查看控制台有 `[Drawer Swipe]` 日志
- [ ] `swipeToClose: true` 显示正确
- [ ] 滑动时 `isSwiping: true`
- [ ] 滑动足够距离后抽屉关闭

### 不同触发区域
- [ ] `anywhere`: 在任意位置滑动都能关闭
- [ ] `header`: 只有头部滑动能关闭,内容区可滚动
- [ ] `edge`: 只有边缘 20px 内滑动能关闭
- [ ] `handle`: 只有滑动手柄处滑动能关闭

### 尺寸限制
- [ ] 抽屉不超出屏幕宽度
- [ ] 抽屉不超出屏幕高度
- [ ] 刘海屏设备有正确的安全区域
- [ ] 横屏竖屏切换正常

### 性能
- [ ] 滑动过程流畅,无卡顿
- [ ] 动画帧率稳定在 60fps
- [ ] 无内存泄漏

---

## 🚀 下一步

1. **构建已完成** ✅
2. **启动文档服务器**:
   ```bash
   npm run docs:dev
   ```
3. **打开浏览器**:
   - 访问 `http://localhost:8080`
   - 切换到移动设备模拟器
   - 打开控制台查看日志
4. **测试各个示例**,重点测试:
   - 移动端支持 → 滑动关闭
   - 移动端支持 → 指定滑动区域

---

## 📝 反馈

测试后请反馈:
1. 控制台显示的日志内容
2. 哪个触发区域工作/不工作
3. 是否有报错信息
4. 抽屉尺寸是否正确

这样我可以进一步诊断和修复问题!
