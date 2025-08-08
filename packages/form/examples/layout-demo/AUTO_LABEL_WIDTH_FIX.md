# 自动标签宽度计算修复

## 🎯 修复内容

修复了标签位置切换时的自动计算逻辑，确保当标签位置切换到左侧或右侧时，自动启用"自动计算宽度"功能并立
即进行计算。

## ✅ 修复效果

### 行为变化

- **切换到左侧标签**：自动启用"自动计算宽度" + 设置为"自动计算模式" + 立即计算宽度
- **切换到右侧标签**：自动启用"自动计算宽度" + 设置为"自动计算模式" + 立即计算宽度
- **切换到顶部标签**：保持当前设置，用户可手动调整
- **初始化时**：如果标签位置已经是左侧/右侧，自动启用相关功能

### 用户体验

- ✅ 无需手动开启自动计算宽度
- ✅ 切换到左侧/右侧标签时立即看到对齐效果
- ✅ 智能化的默认行为，减少用户操作步骤

## 🔧 技术实现

### 1. updateLayout 函数增强

```typescript
// 当标签位置变化时的特殊处理
if (key === 'labelPosition') {
  // 如果切换到左侧或右侧，自动启用自动计算宽度
  if (value === 'left' || value === 'right') {
    currentLayout.autoLabelWidth = true
    currentLayout.labelWidthMode = 'auto'
    // 立即计算标签宽度
    calculateLabelWidths()
  }
  // 无论如何都重新计算一次
  calculateLabelWidths()
}
```

### 2. 初始化逻辑优化

```typescript
const initialize = () => {
  // 如果标签位置是左侧或右侧，自动启用自动计算宽度
  if (currentLayout.labelPosition === 'left' || currentLayout.labelPosition === 'right') {
    currentLayout.autoLabelWidth = true
    currentLayout.labelWidthMode = 'auto'
  }

  calculateVisibleFields()
  calculateLabelWidths()
  if (currentLayout.autoColumns) {
    calculateOptimalColumns()
  }
}
```

### 3. 默认配置调整

```typescript
// 顶部标签时默认不启用自动计算，避免不必要的计算
autoLabelWidth: false, // 顶部标签时默认不启用自动计算
```

## 🚀 测试步骤

1. **访问演示页面**：http://localhost:3000
2. **初始状态**：标签位置为"顶部"，自动计算宽度为关闭状态
3. **切换到左侧**：
   - 点击标签位置下拉框，选择"左侧"
   - 观察"自动计算宽度"按钮自动变为激活状态
   - 观察标签宽度模式自动设置为"自动计算（按列对齐）"
   - 观察标签立即按列对齐显示
4. **切换到右侧**：同样的自动行为
5. **切换回顶部**：保持当前设置，不会自动关闭

## 📊 预期结果

- **顶部标签**：不需要宽度对齐，默认关闭自动计算
- **左侧标签**：需要宽度对齐，自动启用并立即计算
- **右侧标签**：需要宽度对齐，自动启用并立即计算

这样的设计让用户在切换标签位置时获得最佳的默认体验，无需额外的手动配置步骤。
