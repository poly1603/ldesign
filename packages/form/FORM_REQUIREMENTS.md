# @ldesign/form 功能需求规格书

## 📋 项目概述

### 项目目标
构建一个现代化、高性能、多技术栈支持的表单解决方案，提供统一的API接口和智能的布局系统。

### 核心价值主张
- **统一性**: 一套API，支持Vue、Web Components、原生JavaScript
- **智能化**: 自适应布局，智能计算标题宽度和列数
- **灵活性**: 高度可配置，支持复杂业务场景
- **易用性**: 开箱即用，完整的TypeScript支持

## 🎯 核心功能需求

### 1. 智能布局系统 (基于现有实现优化)

#### 1.1 响应式列数计算 (已有基础实现)
```typescript
interface ResponsiveLayout {
  // 根据容器宽度自动计算列数 (现有: span计算)
  autoColumns: boolean

  // 列宽配置 (现有: spanWidth)
  spanWidth: number

  // 最小/最大列数限制 (现有: minSpan/maxSpan)
  minColumns: number  // 对应 minSpan
  maxColumns: number  // 对应 maxSpan

  // 固定列数模式 (现有: span)
  fixedColumns?: number

  // 自适应调整 (现有: adjustSpan)
  adjustSpan: boolean
}
```

**现有功能分析:**
- ✅ 已实现基于容器宽度的自动列数计算
- ✅ 已支持最小/最大列数限制 (minSpan/maxSpan)
- ✅ 已支持固定列数模式 (span属性)
- ✅ 已支持列宽自适应调整 (adjustSpan)

**需要优化:**
- 统一不同技术栈的列数计算逻辑
- 优化断点配置系统
- 改进响应式计算性能

#### 1.2 标题宽度自适应 (已有完整实现)
```typescript
interface LabelWidthCalculation {
  // 按列计算标题宽度 (现有: updateLabelWidths函数)
  calculateByColumn: boolean

  // 标题位置 (现有: labelAlign)
  position: 'top' | 'left' | 'right'

  // 对齐方式 (现有: labelAlign)
  align: 'left' | 'center' | 'right'

  // 宽度配置 (现有: labelWidth)
  labelWidth?: number | string

  // 动态宽度变化 (现有: labelWidthChangeOnVisible)
  changeOnVisible: boolean

  // 标题内边距 (现有: labelPadding)
  padding: number
}
```

**现有功能分析:**
- ✅ 已实现按列计算标题宽度 (updateLabelWidths函数)
- ✅ 已支持标题位置配置 (labelAlign)
- ✅ 已支持动态宽度计算 (caculateLabelWidth函数)
- ✅ 已支持可见性变化时重新计算 (labelWidthChangeOnVisible)
- ✅ 已支持多行标题检测 (isMultipleLine)

**需要优化:**
- 提取标题宽度计算为独立模块
- 优化计算性能和缓存机制
- 统一不同技术栈的实现

#### 1.3 间距配置系统 (已有基础实现)
```typescript
interface SpacingConfig {
  // 水平间距 (现有: gutter)
  horizontal: number | string  // 对应 gutter

  // 垂直间距 (现有: space)
  vertical: number | string    // 对应 space

  // 内部间距 (现有: innerSpace)
  inner: number | string       // 对应 innerSpace

  // 容器内边距 (现有: padding)
  padding: number | string

  // 标题内边距 (现有: labelPadding)
  labelPadding: number
}
```

**现有功能分析:**
- ✅ 已实现水平间距配置 (gutter)
- ✅ 已实现垂直间距配置 (space)
- ✅ 已实现内部间距配置 (innerSpace)
- ✅ 已实现容器内边距配置 (padding)
- ✅ 已实现标题内边距配置 (labelPadding)
- ✅ 支持CSS变量和数值配置

**需要优化:**
- 统一间距配置接口
- 添加预设间距方案
- 改进响应式间距调整

#### 1.4 最小宽度约束
```typescript
interface WidthConstraints {
  // 字段最小宽度
  minFieldWidth: number
  
  // 按钮组宽度
  buttonGroupWidth: number
  
  // 容器最小宽度
  minContainerWidth: number
  
  // 自动计算最小宽度
  autoCalculate: boolean
}
```

**功能要求:**
- 确保字段宽度不小于按钮组宽度
- 支持自动计算最小宽度
- 防止布局破坏和内容溢出
- 响应式宽度调整

### 2. 表单状态管理 (已有完整实现)

#### 2.1 字段值管理 (已有完整实现)
```typescript
interface FieldValueManager {
  // 字段值 (现有: value/modelValue)
  values: Record<string, any>

  // 初始值 (现有: defaultValue)
  initialValues: Record<string, any>

  // 默认值 (现有: defaultValue)
  defaultValues: Record<string, any>

  // 值变化监听 (现有: onChange)
  onChange: (field: string, value: any, allValues: Record<string, any>) => void

  // 表单就绪回调 (现有: onReady)
  onReady: (values: any) => void
}
```

**现有功能分析:**
- ✅ 已实现完整的字段值管理 (value/modelValue/defaultValue)
- ✅ 已支持值变化监听 (onChange事件)
- ✅ 已支持表单就绪回调 (onReady事件)
- ✅ 已支持v-model双向绑定
- ✅ 已支持字段级别的默认值设置

**需要优化:**
- 提取状态管理为独立模块
- 改进嵌套字段和数组字段支持
- 优化值变化的性能

#### 2.2 验证系统
```typescript
interface ValidationSystem {
  // 验证规则
  rules: Record<string, ValidationRule[]>
  
  // 验证状态
  errors: Record<string, string[]>
  touched: Record<string, boolean>
  
  // 验证时机
  validateOn: 'change' | 'blur' | 'submit'
  
  // 异步验证
  asyncValidators: Record<string, AsyncValidator>
}
```

**功能要求:**
- 内置常用验证规则（必填、长度、格式等）
- 支持自定义验证规则
- 异步验证支持（如远程校验）
- 实时验证反馈和错误显示

#### 2.3 UI状态管理
```typescript
interface UIState {
  // 展开收起状态
  collapsed: boolean
  
  // 加载状态
  loading: boolean
  submitting: boolean
  
  // 禁用状态
  disabled: boolean
  readonly: boolean
  
  // 焦点状态
  focused: string | null
}
```

**功能要求:**
- 表单展开收起功能
- 加载和提交状态管理
- 字段禁用和只读状态
- 焦点状态跟踪

### 3. 按钮组系统 (已有完整实现)

#### 3.1 按钮位置和对齐 (已有完整实现)
```typescript
interface ButtonGroupConfig {
  // 按钮位置 (现有: buttonPosition)
  position: 'inline' | 'block'  // 对应 buttonPosition

  // 对齐方式 (现有: buttonAlign)
  align: 'left' | 'center' | 'right' | 'justify'

  // 按钮占用列数 (现有: buttonSpan)
  span: number

  // 隐藏按钮标签 (现有: hiddenButtonLabel)
  hiddenLabel: boolean

  // 按钮内容 (现有: button)
  content: string | TNode
}
```

**现有功能分析:**
- ✅ 已实现按钮位置配置 (buttonPosition: 'inline' | 'block')
- ✅ 已实现按钮对齐配置 (buttonAlign)
- ✅ 已实现按钮占用列数配置 (buttonSpan)
- ✅ 已实现按钮标签隐藏 (hiddenButtonLabel)
- ✅ 已实现自定义按钮内容 (button属性)
- ✅ 已实现按钮插入逻辑 (insertButton函数)

**需要优化:**
- 统一按钮组件的实现
- 改进响应式按钮布局
- 优化按钮位置计算逻辑

#### 3.2 按钮配置 (已有完整实现)
```typescript
interface ButtonConfig {
  // 提交按钮 (现有: submit)
  submit: string | boolean | TNode | TdButtonProps

  // 重置按钮 (现有: reset)
  reset: string | boolean | TNode | TdButtonProps

  // 展开收起按钮 (现有: expand)
  expand: string | boolean | TNode | TdButtonProps

  // 重置类型 (现有: resetType)
  resetType: 'initial' | 'empty'

  // 自定义按钮 (现有: button)
  custom: string | TNode

  // 额外内容 (现有: extraContent)
  extraContent: string | TNode
}
```

**现有功能分析:**
- ✅ 已实现提交按钮配置 (submit属性和onSubmit事件)
- ✅ 已实现重置按钮配置 (reset属性和onReset事件)
- ✅ 已实现展开收起按钮 (expand属性和onExpand事件)
- ✅ 已实现重置类型配置 (resetType)
- ✅ 已实现自定义按钮内容 (button属性)
- ✅ 已实现额外内容配置 (extraContent)
- ✅ 已支持按钮插槽自定义

**需要优化:**
- 统一按钮配置接口
- 改进按钮状态管理
- 优化按钮事件处理

### 4. 字段类型系统 (已有灵活实现)

#### 4.1 字段配置系统 (已有完整实现)
```typescript
interface FieldConfig {
  // 字段名称 (现有: name)
  name: string

  // 字段标签 (现有: label)
  label: string | TNode

  // 字段组件 (现有: component)
  component: any

  // 组件属性 (现有: props)
  props: any

  // 字段占用列数 (现有: span)
  span: number | string

  // 字段可见性 (现有: visible)
  visible?: boolean

  // 验证规则 (现有: rules)
  rules?: TdFormItemProps['rules']

  // 字段关联 (现有: relation)
  relation?: string | { name: string, type: number | 'empty' }

  // 异步加载 (现有: load)
  load?: () => Promise<Array<{ label: string, value: any }>>

  // 前后缀组件 (现有: prefix/suffix)
  prefix?: any | { component: any, props: any }
  suffix?: any | { component: any, props: any }
}
```

#### 4.2 高级字段类型
```typescript
interface AdvancedFieldTypes {
  // 级联选择
  cascader: {
    options: CascaderOption[]
    separator: string
    changeOnSelect: boolean
  }
  
  // 树形选择
  treeSelect: {
    treeData: TreeNode[]
    multiple: boolean
    checkable: boolean
  }
  
  // 文件上传
  upload: {
    accept: string
    multiple: boolean
    maxSize: number
    maxCount: number
  }
  
  // 富文本编辑
  richText: {
    toolbar: string[]
    height: number
    plugins: string[]
  }
}
```

**现有功能分析:**
- ✅ 已实现灵活的字段配置系统 (通过component和props)
- ✅ 已支持任意组件作为字段类型
- ✅ 已支持字段关联和条件渲染 (relation)
- ✅ 已支持异步数据加载 (load函数)
- ✅ 已支持前后缀组件 (prefix/suffix)
- ✅ 已支持字段验证规则 (rules)
- ✅ 已支持字段可见性控制 (visible)
- ✅ 已支持字段占用列数配置 (span)

**需要优化:**
- 提供常用字段类型的预设配置
- 改进字段类型的TypeScript支持
- 优化字段组件的性能

### 5. 主题和样式系统

#### 5.1 主题配置
```typescript
interface ThemeConfig {
  // 尺寸规格
  size: 'small' | 'medium' | 'large'
  
  // 样式变体
  variant: 'filled' | 'outlined' | 'standard'
  
  // 颜色方案
  colorScheme: 'light' | 'dark' | 'auto'
  
  // 圆角设置
  borderRadius: 'none' | 'small' | 'medium' | 'large'
}
```

#### 5.2 LDESIGN集成
```typescript
interface LDesignIntegration {
  // 设计令牌
  tokens: {
    colors: LDesignColors
    spacing: LDesignSpacing
    typography: LDesignTypography
  }
  
  // CSS变量
  cssVariables: Record<string, string>
  
  // 组件样式
  componentStyles: Record<string, CSSProperties>
}
```

**功能要求:**
- 完整集成LDESIGN设计系统
- 支持浅色/深色主题切换
- 响应式尺寸和间距
- 可自定义主题扩展

### 6. 事件系统

#### 6.1 表单事件
```typescript
interface FormEvents {
  // 提交事件
  onSubmit: (values: FormValues, form: FormInstance) => void | Promise<void>
  
  // 重置事件
  onReset: (form: FormInstance) => void
  
  // 值变化事件
  onValuesChange: (changedValues: Partial<FormValues>, allValues: FormValues) => void
  
  // 字段变化事件
  onFieldChange: (field: string, value: any, allValues: FormValues) => void
}
```

#### 6.2 布局事件
```typescript
interface LayoutEvents {
  // 布局变化事件
  onLayoutChange: (layout: LayoutResult) => void
  
  // 展开收起事件
  onToggle: (collapsed: boolean) => void
  
  // 容器尺寸变化事件
  onResize: (width: number, height: number) => void
}
```

**功能要求:**
- 完整的事件系统支持
- 支持异步事件处理
- 事件参数类型安全
- 事件冒泡和阻止机制

### 7. 国际化支持

#### 7.1 多语言文本
```typescript
interface I18nConfig {
  // 当前语言
  locale: string
  
  // 文本资源
  messages: Record<string, Record<string, string>>
  
  // 日期格式化
  dateFormat: Record<string, string>
  
  // 数字格式化
  numberFormat: Record<string, Intl.NumberFormatOptions>
}
```

**功能要求:**
- 支持多语言切换
- 内置中英文资源
- 日期和数字本地化
- 支持自定义语言包

### 8. 性能优化

#### 8.1 渲染优化
```typescript
interface PerformanceConfig {
  // 虚拟滚动
  virtualScroll: {
    enabled: boolean
    itemHeight: number
    bufferSize: number
  }
  
  // 懒加载
  lazyLoad: {
    enabled: boolean
    threshold: number
  }
  
  // 防抖配置
  debounce: {
    validation: number
    layout: number
    search: number
  }
}
```

**功能要求:**
- 大量字段时的虚拟滚动
- 组件懒加载机制
- 防抖优化用户输入
- 内存泄漏防护

## 🔧 技术栈支持

### Vue 3 支持
- Composition API
- TypeScript 完整支持
- Vue 3.3+ 新特性
- Pinia 状态管理集成

### Web Components 支持
- Lit 3.x 框架
- Shadow DOM 封装
- 自定义元素注册
- 跨框架使用

### 原生 JavaScript 支持
- ES2020+ 语法
- 模块化设计
- TypeScript 类型定义
- 无框架依赖

## 📱 兼容性要求

### 浏览器支持
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 框架版本支持
- Vue 3.2+
- React 18+ (适配器)
- Angular 15+ (适配器)

## 🎨 设计要求

### 视觉设计
- 遵循 LDESIGN 设计规范
- 支持浅色/深色主题
- 响应式设计
- 无障碍访问支持

### 交互设计
- 直观的用户界面
- 流畅的动画效果
- 友好的错误提示
- 键盘导航支持

## 📊 现有功能评估总结

### ✅ 已有完整实现的功能
1. **智能布局系统** - 响应式列数计算、标题宽度自适应、间距配置
2. **表单状态管理** - 字段值管理、双向绑定、变化监听
3. **按钮组系统** - 位置配置、对齐方式、自定义按钮
4. **字段类型系统** - 灵活的组件配置、验证规则、关联逻辑
5. **展开收起功能** - 预览行数、展开按钮、可见性控制
6. **表单分组** - 分组配置、分组标题、分组按钮
7. **验证系统** - 验证规则、错误显示、验证时机
8. **样式系统** - 主题配置、变体支持、响应式设计

### 🔧 需要重构优化的部分
1. **代码架构** - 提取核心逻辑，分层设计
2. **多技术栈支持** - 统一API，一致行为
3. **性能优化** - 计算缓存，渲染优化
4. **类型系统** - 完善TypeScript定义
5. **测试覆盖** - 单元测试，集成测试
6. **文档完善** - API文档，使用指南

## 📊 质量要求

### 代码质量
- TypeScript 严格模式 (基于现有Vue实现)
- 100% 类型覆盖
- ESLint + Prettier
- 代码审查机制

### 测试要求
- 单元测试覆盖率 > 90%
- 集成测试覆盖核心流程
- E2E 测试覆盖用户场景
- 性能测试和监控

### 文档要求
- 完整的 API 文档 (基于现有文档扩展)
- 详细的使用指南
- 丰富的示例代码 (基于现有_example)
- 迁移指南

## 🚀 交付标准

### 功能完整性
- 所有需求功能实现
- 三种技术栈行为一致
- 完整的配置选项
- 扩展接口预留

### 性能指标
- 首次渲染 < 100ms
- 布局计算 < 10ms
- 包体积 < 200KB
- 内存使用稳定

### 用户体验
- API 简单易用
- 错误提示友好
- 文档清晰完整
- 示例丰富实用

---

这份需求规格书定义了 @ldesign/form 的完整功能要求，为后续的设计和开发提供了明确的指导。所有功能都将在统一的架构下实现，确保不同技术栈的一致性和高质量的用户体验。
