# Slide 动画方向切换修复说明

## 问题描述

当 `dropdown-panel` 组件使用 `animationMode="slide"` 时，如果同一个组件实例改变弹出方向（从 bottom 切换到 top，或从 top 切换到 bottom），会出现动画错误：

**问题场景：**
1. 第一次点击：从下方弹出（bottom placement）- 动画正确 ✅
2. 第二次点击：从上方弹出（top placement）- 动画错误 ❌
   - 面板从错误的位置滑出，不是从触发器位置开始

## 根本原因

### Scale 动画为什么没问题

Scale 动画使用 `transform-origin` 配合 `scaleY` 实现：

```css
/* Bottom placement - 从顶部（触发器位置）向下展开 */
.l-dropdown-panel__panel--animation-scale.l-dropdown-panel__panel--bottom {
  top: 0;
  transform: scaleY(0);
  transform-origin: top; /* 关键：从顶部开始变换 */
}

/* Top placement - 从底部（触发器位置）向上展开 */
.l-dropdown-panel__panel--animation-scale.l-dropdown-panel__panel--top {
  bottom: 0;
  transform: scaleY(0);
  transform-origin: bottom; /* 关键：从底部开始变换 */
}
```

当从 bottom 切换到 top 时：
- `scaleY(0)` 始终表示高度为 0
- 只是 `transform-origin` 从 `top` 变为 `bottom`
- 不会产生位置移动的过渡动画

### Slide 动画的问题

Slide 动画使用 `translateY` 配合位置属性实现：

```css
/* Bottom placement - 初始状态在触发器上方，向下滑入 */
.l-dropdown-panel__panel--animation-slide.l-dropdown-panel__panel--bottom {
  top: 0;
  transform: translateY(-100%); /* 向上隐藏 */
}

/* Top placement - 初始状态在触发器下方，向上滑入 */
.l-dropdown-panel__panel--animation-slide.l-dropdown-panel__panel--top {
  bottom: 0;
  transform: translateY(100%); /* 向下隐藏 */
}
```

**问题发生过程：**

假设第一次是 bottom placement，第二次切换到 top placement：

1. **第一次打开（bottom）：**
   - 初始状态：`top: 0; translateY(-100%)` （面板在遮罩顶部之外）
   - 展开状态：`top: 0; translateY(0)` （面板滑入到遮罩顶部）
   - 关闭状态：`top: 0; translateY(-100%)` （面板滑回遮罩顶部之外）

2. **第二次打开（top）：**
   - 关闭时面板状态：`top: 0; translateY(-100%)` (bottom placement 的关闭状态)
   - **切换 placement 到 top：**`bottom: 0; translateY(100%)` (top placement 的初始状态)
   - ⚠️ **CSS transition 会对这个状态变化产生动画！**
   - 面板从 `top: 0; translateY(-100%)` 过渡到 `bottom: 0; translateY(100%)`
   - 这会导致面板从错误的位置滑动！

## 解决方案

### 核心思路

在改变 placement 时，**临时禁用 CSS transition**，让状态切换瞬间完成，然后再启用 transition 进行正常的展开/收起动画。

### 实现步骤

1. **添加状态标志：**
```typescript
@State() disableTransition: boolean = false; // 禁用过渡效果的标志
```

2. **在打开面板时检测 placement 是否改变：**
```typescript
@Watch('visible')
onVisibleChange(newValue: boolean) {
  if (newValue) {
    const newPlacement = this.getNewPlacement();
    const placementChanged = this.actualPlacement !== newPlacement;
    
    // 如果 placement 改变了，需要先禁用 transition
    if (placementChanged) {
      this.disableTransition = true;
    }
    
    this.actualPlacement = newPlacement;
    // ...
    
    requestAnimationFrame(() => {
      // 第一帧：DOM 已更新，重新启用 transition
      if (this.disableTransition) {
        this.disableTransition = false;
      }
      
      requestAnimationFrame(() => {
        // 第二帧：transition 已启用，开始展开动画
        this.isReady = true;
      });
    });
  }
}
```

3. **在滚动时 placement 改变也需要处理：**
```typescript
private handleScroll = () => {
  if (this.visible) {
    const newPlacement = this.getNewPlacement();
    
    if (oldPlacement !== newPlacement) {
      // 先隐藏面板
      this.isReady = false;
      
      requestAnimationFrame(() => {
        // 禁用 transition
        this.disableTransition = true;
        
        // 更新方向
        this.actualPlacement = newPlacement;
        
        requestAnimationFrame(() => {
          // 重新启用 transition
          this.disableTransition = false;
          
          requestAnimationFrame(() => {
            // 显示面板
            this.isReady = true;
          });
        });
      });
    }
  }
};
```

4. **在样式计算中应用标志：**
```typescript
private getPanelStyle() {
  // ...
  const style: any = {
    maxHeight: calculatedMaxHeight,
    // 根据标志决定是否禁用 transition
    transition: this.disableTransition 
      ? 'none' 
      : `transform ${this.duration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
  };
  
  return style;
}
```

### 时序图

```
用户点击（第二次，placement 从 bottom 变为 top）
    ↓
检测到 placement 改变
    ↓
设置 disableTransition = true
更新 actualPlacement = 'top'
    ↓
[RAF 1] Stencil 完成 DOM 更新和 CSS 类应用
  面板 CSS 从 .panel--bottom 变为 .panel--top
  但因为 transition: none，不会产生过渡动画
    ↓
设置 disableTransition = false
    ↓
[RAF 2] 浏览器重绘，transition 重新启用
  面板仍处于初始隐藏状态（translateY(100%)）
    ↓
设置 isReady = true
    ↓
[RAF 3] 浏览器绘制展开动画
  面板从 translateY(100%) 过渡到 translateY(0)
  从触发器位置向上滑出 ✅
```

## 效果对比

### 修复前

- ❌ Bottom → Top：面板从屏幕中间错误位置滑出
- ❌ Top → Bottom：面板从屏幕中间错误位置滑出
- 动画不连贯，体验差

### 修复后

- ✅ Bottom → Top：面板正确地从触发器位置向上滑出
- ✅ Top → Bottom：面板正确地从触发器位置向下滑出
- 动画流畅，与 Scale 动画行为一致

## 测试场景

1. **基本切换测试：**
   - 页面中部放置触发器
   - 第一次点击：从下方弹出
   - 关闭
   - 第二次点击：从上方弹出
   - **验证：** 面板应从触发器位置向上滑出

2. **连续切换测试：**
   - 多次打开/关闭，每次方向不同
   - **验证：** 每次动画都应该正确

3. **滚动触发切换测试：**
   - 打开面板后滚动页面，触发 placement 自动切换
   - **验证：** 面板应平滑关闭-切换方向-重新打开

4. **Scale 动画对比测试：**
   - 使用相同场景，分别测试 `animationMode="scale"` 和 `animationMode="slide"`
   - **验证：** 两种动画行为应该一致（都从触发器位置开始）

## 技术要点

1. **双 RAF（RequestAnimationFrame）的作用：**
   - 第一个 RAF：确保 Stencil 完成 DOM 和 CSS 更新
   - 第二个 RAF：确保浏览器完成重绘，transition 重新生效

2. **为什么不能只用 setTimeout：**
   - setTimeout 不能保证与浏览器渲染帧同步
   - RAF 可以确保在下一帧开始前执行，时机更精确

3. **为什么 Scale 动画不需要这个修复：**
   - Scale 使用 `transform-origin` 控制变换起点
   - `scaleY(0)` 在任何方向都表示高度为 0
   - 不涉及位置属性（top/bottom）的变化，不会产生位置移动的过渡

4. **transition: none 的时机：**
   - 必须在更新 placement 类名之前设置
   - 必须在浏览器绘制之前恢复，否则正常动画也会被禁用

## 相关文件

- `dropdown-panel.tsx` - 组件逻辑
- `dropdown-panel.less` - 组件样式
- `demo.html` - 测试页面

## 总结

通过添加 `disableTransition` 状态标志，并在 placement 改变时临时禁用 CSS transition，成功解决了 Slide 动画方向切换时的动画错误问题。修复后，Slide 动画在各种场景下都能正确地从触发器位置开始滑出/滑入，与 Scale 动画保持一致的行为逻辑。
