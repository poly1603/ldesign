# 色彩

色彩是设计系统的重要组成部分，LDesign Component 基于 TDesign 设计规范，构建了完整的色彩体系。

## 色彩原则

### 1. 有意义的色彩

每种颜色都有其特定的含义和用途，不随意使用颜色。

### 2. 一致性

在整个产品中保持色彩使用的一致性，相同的颜色表达相同的含义。

### 3. 可访问性

确保色彩对比度符合 WCAG 2.1 AA 标准，为视觉障碍用户提供良好的体验。

## 主色彩

### 品牌色

品牌色是产品的主要识别色彩，用于重要的操作按钮、链接等关键元素。

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <div style="width: 120px; height: 80px; background: #722ED1; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;">
    #722ED1
  </div>
</div>

**使用场景：**
- 主要操作按钮
- 重要链接
- 选中状态
- 进度指示

### 品牌色色阶

<div style="display: flex; gap: 8px; margin: 24px 0;">
  <div style="width: 60px; height: 60px; background: #f1ecf9; border-radius: 4px; display: flex; align-items: end; justify-content: center; padding: 4px; font-size: 12px;">1</div>
  <div style="width: 60px; height: 60px; background: #d8c8ee; border-radius: 4px; display: flex; align-items: end; justify-content: center; padding: 4px; font-size: 12px;">2</div>
  <div style="width: 60px; height: 60px; background: #bfa4e5; border-radius: 4px; display: flex; align-items: end; justify-content: center; padding: 4px; font-size: 12px;">3</div>
  <div style="width: 60px; height: 60px; background: #a67fdb; border-radius: 4px; display: flex; align-items: end; justify-content: center; padding: 4px; font-size: 12px;">4</div>
  <div style="width: 60px; height: 60px; background: #8c5ad3; border-radius: 4px; display: flex; align-items: end; justify-content: center; padding: 4px; font-size: 12px;">5</div>
  <div style="width: 60px; height: 60px; background: #7334cb; border-radius: 4px; display: flex; align-items: end; justify-content: center; padding: 4px; font-size: 12px; color: white;">6</div>
  <div style="width: 60px; height: 60px; background: #5e2aa7; border-radius: 4px; display: flex; align-items: end; justify-content: center; padding: 4px; font-size: 12px; color: white;">7</div>
  <div style="width: 60px; height: 60px; background: #491f84; border-radius: 4px; display: flex; align-items: end; justify-content: center; padding: 4px; font-size: 12px; color: white;">8</div>
  <div style="width: 60px; height: 60px; background: #35165f; border-radius: 4px; display: flex; align-items: end; justify-content: center; padding: 4px; font-size: 12px; color: white;">9</div>
  <div style="width: 60px; height: 60px; background: #200d3b; border-radius: 4px; display: flex; align-items: end; justify-content: center; padding: 4px; font-size: 12px; color: white;">10</div>
</div>

## 功能色彩

### 成功色

用于表示成功、完成、正确等积极状态。

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <div style="width: 120px; height: 80px; background: #52c41a; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;">
    #52c41a
  </div>
</div>

**使用场景：**
- 成功提示
- 完成状态
- 正确验证
- 增长数据

### 警告色

用于表示警告、注意等需要用户关注的状态。

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <div style="width: 120px; height: 80px; background: #faad14; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;">
    #faad14
  </div>
</div>

**使用场景：**
- 警告提示
- 待处理状态
- 重要信息
- 风险提醒

### 错误色

用于表示错误、失败、危险等负面状态。

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <div style="width: 120px; height: 80px; background: #ff4d4f; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500;">
    #ff4d4f
  </div>
</div>

**使用场景：**
- 错误提示
- 失败状态
- 删除操作
- 危险警告

## 中性色彩

### 文本色

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <div style="width: 120px; height: 80px; background: #262626; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; flex-direction: column;">
    <div>主要文本</div>
    <div style="font-size: 12px;">#262626</div>
  </div>
  <div style="width: 120px; height: 80px; background: #595959; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; flex-direction: column;">
    <div>次要文本</div>
    <div style="font-size: 12px;">#595959</div>
  </div>
  <div style="width: 120px; height: 80px; background: #bfbfbf; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 500; flex-direction: column;">
    <div>占位文本</div>
    <div style="font-size: 12px;">#bfbfbf</div>
  </div>
  <div style="width: 120px; height: 80px; background: #d9d9d9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #666; font-weight: 500; flex-direction: column;">
    <div>禁用文本</div>
    <div style="font-size: 12px;">#d9d9d9</div>
  </div>
</div>

### 背景色

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <div style="width: 120px; height: 80px; background: #ffffff; border: 1px solid #e5e5e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #262626; font-weight: 500; flex-direction: column;">
    <div>页面背景</div>
    <div style="font-size: 12px;">#ffffff</div>
  </div>
  <div style="width: 120px; height: 80px; background: #fafafa; border: 1px solid #e5e5e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #262626; font-weight: 500; flex-direction: column;">
    <div>容器背景</div>
    <div style="font-size: 12px;">#fafafa</div>
  </div>
  <div style="width: 120px; height: 80px; background: #f5f5f5; border: 1px solid #e5e5e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #262626; font-weight: 500; flex-direction: column;">
    <div>禁用背景</div>
    <div style="font-size: 12px;">#f5f5f5</div>
  </div>
</div>

### 边框色

<div style="display: flex; gap: 16px; margin: 24px 0;">
  <div style="width: 120px; height: 80px; background: #ffffff; border: 2px solid #e5e5e5; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #262626; font-weight: 500; flex-direction: column;">
    <div>一级边框</div>
    <div style="font-size: 12px;">#e5e5e5</div>
  </div>
  <div style="width: 120px; height: 80px; background: #ffffff; border: 2px solid #d9d9d9; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #262626; font-weight: 500; flex-direction: column;">
    <div>二级边框</div>
    <div style="font-size: 12px;">#d9d9d9</div>
  </div>
  <div style="width: 120px; height: 80px; background: #ffffff; border: 2px solid #cccccc; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #262626; font-weight: 500; flex-direction: column;">
    <div>三级边框</div>
    <div style="font-size: 12px;">#cccccc</div>
  </div>
</div>

## 暗色主题

在暗色主题下，色彩会相应调整以保持良好的对比度和可读性。

### 主要调整

- 背景色变为深色
- 文本色变为浅色
- 品牌色适当调亮
- 边框色调整为适合暗色背景的颜色

## 使用指南

### 1. 色彩层次

通过不同的色彩层次来建立信息的重要性等级：

- **主要信息**：使用品牌色或高对比度的中性色
- **次要信息**：使用中等对比度的中性色
- **辅助信息**：使用低对比度的中性色

### 2. 状态表达

使用功能色来表达不同的状态：

- **成功**：绿色系
- **警告**：橙色系
- **错误**：红色系
- **信息**：蓝色系

### 3. 交互反馈

通过色彩变化提供交互反馈：

- **悬停**：颜色变浅或变深
- **激活**：颜色进一步变化
- **禁用**：降低饱和度和对比度

## CSS 变量

所有颜色都通过 CSS 变量定义，便于主题切换和自定义：

```css
:root {
  /* 品牌色 */
  --ldesign-brand-color: #722ed1;
  --ldesign-brand-color-hover: #8c5ad3;
  --ldesign-brand-color-active: #5e2aa7;
  
  /* 功能色 */
  --ldesign-success-color: #52c41a;
  --ldesign-warning-color: #faad14;
  --ldesign-error-color: #ff4d4f;
  
  /* 文本色 */
  --ldesign-text-color-primary: #262626;
  --ldesign-text-color-secondary: #595959;
  --ldesign-text-color-placeholder: #bfbfbf;
  --ldesign-text-color-disabled: #d9d9d9;
  
  /* 背景色 */
  --ldesign-bg-color-page: #ffffff;
  --ldesign-bg-color-container: #fafafa;
  --ldesign-bg-color-component: #ffffff;
  
  /* 边框色 */
  --ldesign-border-level-1-color: #e5e5e5;
  --ldesign-border-level-2-color: #d9d9d9;
  --ldesign-border-level-3-color: #cccccc;
}
```

## 无障碍访问

### 对比度要求

- **正常文本**：对比度至少 4.5:1
- **大文本**：对比度至少 3:1
- **图形和界面组件**：对比度至少 3:1

### 色彩独立性

不要仅依赖颜色来传达信息，应该结合其他视觉元素（如图标、文字）来确保信息的可访问性。
