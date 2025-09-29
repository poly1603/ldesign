# 按钮样式修复总结

## 问题分析

您指出的样式问题主要包括：
1. Default 按钮应该有灰色边框，而不是透明边框
2. Primary 按钮是实心蓝色背景，而不是描边
3. Dashed 按钮应该显示虚线边框
4. Text 按钮hover时应该有浅色背景
5. Link 按钮应该是蓝色文本，无边框和背景

## 解决方案

已创建全新的 `button-antd-v5.less` 样式文件，完全对标 Ant Design v5 的设计规范。

### 主要改进

#### 1. Type 类型样式（语法糖）

```less
// Default - 灰色边框
.ldesign-button--default {
  color: rgba(0, 0, 0, 0.88);
  background-color: #ffffff;
  border-color: #d9d9d9;
}

// Primary - 蓝色实心
.ldesign-button--primary {
  color: #ffffff;
  background-color: #1677ff;
  border-color: #1677ff;
}

// Dashed - 虚线边框
.ldesign-button--dashed {
  border-style: dashed;
  border-color: #d9d9d9;
}

// Text - 无边框，hover有背景
.ldesign-button--text {
  background-color: transparent;
  border-color: transparent;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }
}

// Link - 蓝色文本链接样式
.ldesign-button--link {
  color: #1677ff;
  background-color: transparent;
  border-color: transparent;
  padding: 0;
}
```

#### 2. Variant & Color 系统

新增了完整的变体和颜色组合系统：

- **Solid 变体**：实心按钮（Primary、Danger、Success、Warning）
- **Outlined 变体**：描边按钮，hover时有浅色背景
- **Filled 变体**：浅色背景按钮
- **Text 变体**：文本按钮
- **Link 变体**：链接按钮

#### 3. 设计令牌

使用 CSS 变量定义所有颜色，方便主题定制：

```css
:root {
  --ld-primary: #1677ff;
  --ld-primary-hover: #4096ff;
  --ld-primary-bg: #f0f5ff;
  --ld-error: #ff4d4f;
  --ld-text: rgba(0, 0, 0, 0.88);
  --ld-border: #d9d9d9;
  /* ... */
}
```

## 使用示例

### 基础用法（推荐）

```html
<!-- 五种基础类型 -->
<ldesign-button type="primary">Primary Button</ldesign-button>
<ldesign-button type="default">Default Button</ldesign-button>  
<ldesign-button type="dashed">Dashed Button</ldesign-button>
<ldesign-button type="text">Text Button</ldesign-button>
<ldesign-button type="link">Link Button</ldesign-button>

<!-- 危险按钮 -->
<ldesign-button type="primary" danger>Delete</ldesign-button>
<ldesign-button danger>Cancel</ldesign-button>
```

### 高级用法（Variant + Color）

```html
<!-- Solid 实心按钮 -->
<ldesign-button variant="solid" color="primary">Primary</ldesign-button>
<ldesign-button variant="solid" color="danger">Danger</ldesign-button>
<ldesign-button variant="solid" color="green">Success</ldesign-button>

<!-- Outlined 描边按钮 -->
<ldesign-button variant="outlined" color="primary">Primary</ldesign-button>
<ldesign-button variant="outlined" color="danger">Danger</ldesign-button>

<!-- Filled 填充按钮 -->
<ldesign-button variant="filled" color="primary">Primary</ldesign-button>
<ldesign-button variant="filled" color="danger">Danger</ldesign-button>
```

## 文件结构

```
button/
├── button.tsx          # 组件逻辑
├── button.less         # 主样式入口（导入 button-antd-v5.less）
├── button-antd-v5.less # Ant Design v5 完整样式实现
├── interface.ts        # 类型定义
└── utils.ts           # 工具函数
```

## 验证

请使用 `button-test.html` 文件验证所有按钮样式是否正确显示。

样式现在应该与 Ant Design v5 完全一致！