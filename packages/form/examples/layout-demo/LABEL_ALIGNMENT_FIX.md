# 标签对齐和手动宽度设置修复

## 🎯 修复的问题

### 1. 标签对齐方式不生效

**问题**：当标签位置为左侧或右侧时，标签对齐方式（左对齐、居中、右对齐）设置无效果

**原因**：左侧和右侧标签使用了 `display: flex` 布局，`text-align` 属性对 flex 容器无效

### 2. 手动设置标签宽度被覆盖

**问题**：在手动设置模式下，用户修改第 1 列、第 2 列标签宽度后，值会被重新计算覆盖

**原因**：`calculateLabelWidths` 函数在手动模式下仍然会覆盖用户设置的宽度值

## ✅ 修复方案

### 1. 标签对齐修复

#### 修改前

```typescript
// 标签对齐
if (props.labelAlign) {
  styles.textAlign = props.labelAlign
}
```

#### 修改后

```typescript
// 标签对齐 - 对于左侧和右侧标签使用 justify-content，对于顶部标签使用 text-align
if (props.labelAlign) {
  if (props.labelPosition === 'left' || props.labelPosition === 'right') {
    // 对于flex布局的标签，使用justify-content
    switch (props.labelAlign) {
      case 'left':
        styles.justifyContent = 'flex-start'
        break
      case 'center':
        styles.justifyContent = 'center'
        break
      case 'right':
        styles.justifyContent = 'flex-end'
        break
    }
  } else {
    // 对于顶部标签，使用text-align
    styles.textAlign = props.labelAlign
  }
}
```

### 2. 手动宽度设置修复

#### 修改前

```typescript
formState.calculatedLabelWidths = labelWidths
// 同时更新到布局配置中
currentLayout.labelWidthByColumn = labelWidths
```

#### 修改后

```typescript
// 更新计算结果到状态中
formState.calculatedLabelWidths = labelWidths

// 只在自动计算模式下更新到布局配置中，手动模式下保持用户设置不变
if (currentLayout.labelWidthMode === 'auto') {
  currentLayout.labelWidthByColumn = { ...labelWidths }
}
```

## 🔧 技术细节

### 标签对齐实现原理

1. **顶部标签**：使用 `text-align` 属性，因为是块级元素
2. **左侧/右侧标签**：使用 `justify-content` 属性，因为是 flex 容器
   - `left` → `justify-content: flex-start`
   - `center` → `justify-content: center`
   - `right` → `justify-content: flex-end`

### 手动宽度设置保护机制

1. **自动计算模式**：`calculateLabelWidths` 会重新计算并更新配置
2. **手动设置模式**：`calculateLabelWidths` 只更新显示状态，不覆盖用户配置
3. **用户输入保护**：`setManualLabelWidth` 直接更新配置，不会被覆盖

## 🚀 测试步骤

### 测试标签对齐

1. 访问 http://localhost:3000
2. 设置标签位置为"左侧"
3. 切换标签对齐方式：左对齐、居中、右对齐
4. 观察标签在其宽度范围内的对齐效果

### 测试手动宽度设置

1. 设置标签位置为"左侧"
2. 切换标签宽度模式为"手动设置"
3. 修改"第 1 列标签宽度"和"第 2 列标签宽度"
4. 观察设置值保持不变，不被重新计算覆盖
5. 观察表单中标签宽度立即应用新设置

## 📊 预期效果

### 标签对齐

- ✅ **左对齐**：标签文字在宽度范围内靠左显示
- ✅ **居中对齐**：标签文字在宽度范围内居中显示
- ✅ **右对齐**：标签文字在宽度范围内靠右显示

### 手动宽度设置

- ✅ **设置保持**：用户输入的宽度值不会被自动计算覆盖
- ✅ **立即生效**：修改宽度后立即在表单中看到效果
- ✅ **独立控制**：每列可以设置不同的宽度值

这些修复确保了标签对齐功能在所有标签位置下都能正常工作，同时保护了用户的手动宽度设置不被意外覆盖。
