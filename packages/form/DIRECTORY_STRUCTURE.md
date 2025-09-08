# @ldesign/form 目录结构规划

## 📁 整体目录结构

```
packages/form/
├── src/                           # 源代码目录
│   ├── core/                      # 核心层 - 基于现有实现提取的核心逻辑
│   │   ├── layout/                # 布局引擎 (基于现有utils.ts)
│   │   │   ├── calculator.ts      # 布局计算器 (groupBySpanLimitAndRowsWithReservedSpan)
│   │   │   ├── labelWidth.ts      # 标题宽度计算 (updateLabelWidths, caculateLabelWidth)
│   │   │   ├── responsive.ts      # 响应式处理 (span计算逻辑)
│   │   │   ├── spacing.ts         # 间距计算 (gutter, space, innerSpace)
│   │   │   └── index.ts
│   │   ├── state/                 # 状态管理 (基于现有hooks.tsx)
│   │   │   ├── manager.ts         # 状态管理器 (useForm核心逻辑)
│   │   │   ├── values.ts          # 值管理 (value/modelValue处理)
│   │   │   ├── visibility.ts      # 可见性管理 (visible状态处理)
│   │   │   ├── validation.ts      # 验证状态 (rules处理)
│   │   │   └── index.ts
│   │   ├── events/                # 事件系统 (基于现有事件处理)
│   │   │   ├── emitter.ts         # 事件发射器
│   │   │   ├── handlers.ts        # 事件处理器 (onSubmit, onReset, onChange等)
│   │   │   ├── types.ts          # 事件类型定义
│   │   │   └── index.ts
│   │   ├── utils/                 # 核心工具函数 (基于现有utils.ts)
│   │   │   ├── dom.ts            # DOM操作 (caculateLabelWidth等)
│   │   │   ├── array.ts          # 数组处理 (combileSpan, sumArray等)
│   │   │   ├── object.ts         # 对象处理 (mergeObjects, removeObjectKeys等)
│   │   │   ├── validation.ts     # 验证工具 (getFirstError等)
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── adapters/                  # 适配层 - 技术栈特定实现
│   │   ├── vue/                   # Vue 适配器 (基于现有实现重构)
│   │   │   ├── hooks/             # Vue Hooks (基于现有hooks.tsx)
│   │   │   │   ├── useForm.ts     # 表单Hook (重构现有useForm)
│   │   │   │   ├── useLayout.ts   # 布局Hook (提取布局相关逻辑)
│   │   │   │   ├── useState.ts    # 状态Hook (提取状态相关逻辑)
│   │   │   │   ├── useEvents.ts   # 事件Hook (提取事件相关逻辑)
│   │   │   │   └── index.ts
│   │   │   ├── components/        # Vue 组件 (基于现有form.tsx)
│   │   │   │   ├── LDesignForm.vue      # 主表单组件 (重构现有form.tsx)
│   │   │   │   ├── LDesignFormItem.vue  # 表单项组件
│   │   │   │   ├── LDesignButtons.vue   # 按钮组组件 (基于现有buttons)
│   │   │   │   └── index.ts
│   │   │   ├── composables/       # 组合式函数
│   │   │   │   ├── useFormConfig.ts # 表单配置 (基于现有props.ts)
│   │   │   │   ├── useFormLayout.ts # 表单布局
│   │   │   │   ├── useFormState.ts  # 表单状态
│   │   │   │   └── index.ts
│   │   │   ├── types/             # Vue特定类型 (基于现有type.ts)
│   │   │   │   ├── props.ts       # 属性类型 (基于现有props.ts)
│   │   │   │   ├── events.ts      # 事件类型
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── lit/                   # Lit Web Components 适配器
│   │   │   ├── mixins/            # Lit Mixins
│   │   │   │   ├── FormMixin.ts   # 表单混入
│   │   │   │   ├── FieldMixin.ts  # 字段混入
│   │   │   │   ├── LayoutMixin.ts # 布局混入
│   │   │   │   └── index.ts
│   │   │   ├── components/        # Lit 组件
│   │   │   │   ├── ldesign-form.ts       # 主表单组件
│   │   │   │   ├── ldesign-query-form.ts # 查询表单组件
│   │   │   │   ├── ldesign-form-item.ts  # 表单项组件
│   │   │   │   ├── ldesign-button-group.ts # 按钮组组件
│   │   │   │   └── index.ts
│   │   │   ├── decorators/        # 装饰器
│   │   │   │   ├── formProperty.ts # 表单属性装饰器
│   │   │   │   ├── fieldProperty.ts # 字段属性装饰器
│   │   │   │   └── index.ts
│   │   │   ├── controllers/       # 控制器
│   │   │   │   ├── FormController.ts # 表单控制器
│   │   │   │   ├── FieldController.ts # 字段控制器
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── vanilla/               # 原生 JavaScript 适配器
│   │   │   ├── classes/           # JavaScript 类
│   │   │   │   ├── FormManager.ts # 表单管理器
│   │   │   │   ├── FieldManager.ts # 字段管理器
│   │   │   │   ├── LayoutManager.ts # 布局管理器
│   │   │   │   ├── EventManager.ts # 事件管理器
│   │   │   │   └── index.ts
│   │   │   ├── components/        # 原生组件
│   │   │   │   ├── Form.ts        # 表单组件
│   │   │   │   ├── QueryForm.ts   # 查询表单组件
│   │   │   │   ├── FormItem.ts    # 表单项组件
│   │   │   │   ├── ButtonGroup.ts # 按钮组组件
│   │   │   │   └── index.ts
│   │   │   ├── dom/               # DOM 操作
│   │   │   │   ├── manipulator.ts # DOM 操作器
│   │   │   │   ├── observer.ts    # DOM 观察器
│   │   │   │   ├── renderer.ts    # DOM 渲染器
│   │   │   │   └── index.ts
│   │   │   ├── utils/             # 工具函数
│   │   │   │   ├── element.ts     # 元素工具
│   │   │   │   ├── style.ts       # 样式工具
│   │   │   │   ├── event.ts       # 事件工具
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── components/                # 组件层 - 可复用的UI组件
│   │   ├── base/                  # 基础组件
│   │   │   ├── input/             # 输入框组件
│   │   │   │   ├── Input.vue      # Vue 输入框
│   │   │   │   ├── Input.ts       # Lit 输入框
│   │   │   │   ├── InputVanilla.ts # 原生输入框
│   │   │   │   ├── types.ts       # 类型定义
│   │   │   │   └── index.ts
│   │   │   ├── select/            # 选择框组件
│   │   │   │   ├── Select.vue
│   │   │   │   ├── Select.ts
│   │   │   │   ├── SelectVanilla.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   ├── button/            # 按钮组件
│   │   │   │   ├── Button.vue
│   │   │   │   ├── Button.ts
│   │   │   │   ├── ButtonVanilla.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── index.ts
│   │   │   ├── date-picker/       # 日期选择器
│   │   │   ├── cascader/          # 级联选择器
│   │   │   ├── tree-select/       # 树形选择器
│   │   │   ├── upload/            # 文件上传
│   │   │   └── index.ts
│   │   ├── composite/             # 复合组件
│   │   │   ├── query-form/        # 查询表单
│   │   │   │   ├── QueryForm.vue
│   │   │   │   ├── QueryForm.ts
│   │   │   │   ├── QueryFormVanilla.ts
│   │   │   │   ├── config.ts      # 配置定义
│   │   │   │   ├── types.ts       # 类型定义
│   │   │   │   └── index.ts
│   │   │   ├── edit-form/         # 编辑表单
│   │   │   ├── filter-form/       # 筛选表单
│   │   │   ├── search-form/       # 搜索表单
│   │   │   └── index.ts
│   │   ├── layout/                # 布局组件
│   │   │   ├── grid/              # 网格布局
│   │   │   │   ├── Grid.vue
│   │   │   │   ├── Grid.ts
│   │   │   │   ├── GridVanilla.ts
│   │   │   │   └── index.ts
│   │   │   ├── flex/              # 弹性布局
│   │   │   ├── button-group/      # 按钮组布局
│   │   │   ├── form-item/         # 表单项布局
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── utils/                     # 工具层 - 通用工具和配置
│   │   ├── types/                 # 类型定义
│   │   │   ├── core.ts            # 核心类型
│   │   │   ├── config.ts          # 配置类型
│   │   │   ├── events.ts          # 事件类型
│   │   │   ├── layout.ts          # 布局类型
│   │   │   ├── validation.ts      # 验证类型
│   │   │   ├── components.ts      # 组件类型
│   │   │   └── index.ts
│   │   ├── helpers/               # 辅助函数
│   │   │   ├── dom.ts             # DOM 操作辅助
│   │   │   ├── format.ts          # 格式化辅助
│   │   │   ├── validate.ts        # 验证辅助
│   │   │   ├── calculate.ts       # 计算辅助
│   │   │   ├── debounce.ts        # 防抖辅助
│   │   │   ├── throttle.ts        # 节流辅助
│   │   │   └── index.ts
│   │   ├── constants/             # 常量配置
│   │   │   ├── defaults.ts        # 默认配置
│   │   │   ├── breakpoints.ts     # 断点配置
│   │   │   ├── themes.ts          # 主题配置
│   │   │   ├── validation.ts      # 验证常量
│   │   │   ├── events.ts          # 事件常量
│   │   │   └── index.ts
│   │   ├── theme/                 # 主题系统
│   │   │   ├── tokens.ts          # 设计令牌
│   │   │   ├── variables.ts       # CSS 变量
│   │   │   ├── mixins.ts          # 样式混入
│   │   │   ├── themes/            # 主题定义
│   │   │   │   ├── light.ts       # 浅色主题
│   │   │   │   ├── dark.ts        # 深色主题
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── i18n/                  # 国际化
│   │   │   ├── locales/           # 语言包
│   │   │   │   ├── zh-CN.ts       # 中文
│   │   │   │   ├── en-US.ts       # 英文
│   │   │   │   └── index.ts
│   │   │   ├── formatter.ts       # 格式化器
│   │   │   ├── detector.ts        # 语言检测
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts                   # 主入口文件
├── styles/                        # 样式文件
│   ├── base/                      # 基础样式
│   │   ├── reset.less             # 样式重置
│   │   ├── variables.less         # 变量定义
│   │   ├── mixins.less            # 混入定义
│   │   └── index.less
│   ├── components/                # 组件样式
│   │   ├── form.less              # 表单样式
│   │   ├── form-item.less         # 表单项样式
│   │   ├── button-group.less      # 按钮组样式
│   │   ├── input.less             # 输入框样式
│   │   ├── select.less            # 选择框样式
│   │   └── index.less
│   ├── themes/                    # 主题样式
│   │   ├── light.less             # 浅色主题
│   │   ├── dark.less              # 深色主题
│   │   └── index.less
│   └── index.less                 # 样式主入口
├── tests/                         # 测试文件
│   ├── unit/                      # 单元测试
│   │   ├── core/                  # 核心层测试
│   │   ├── adapters/              # 适配层测试
│   │   ├── components/            # 组件层测试
│   │   └── utils/                 # 工具层测试
│   ├── integration/               # 集成测试
│   │   ├── vue.test.ts            # Vue 集成测试
│   │   ├── lit.test.ts            # Lit 集成测试
│   │   └── vanilla.test.ts        # 原生 JS 集成测试
│   ├── e2e/                       # 端到端测试
│   │   ├── query-form.spec.ts     # 查询表单 E2E
│   │   ├── edit-form.spec.ts      # 编辑表单 E2E
│   │   └── responsive.spec.ts     # 响应式 E2E
│   ├── performance/               # 性能测试
│   │   ├── layout.perf.ts         # 布局性能测试
│   │   ├── rendering.perf.ts      # 渲染性能测试
│   │   └── memory.perf.ts         # 内存性能测试
│   ├── fixtures/                  # 测试数据
│   │   ├── forms.ts               # 表单测试数据
│   │   ├── fields.ts              # 字段测试数据
│   │   └── configs.ts             # 配置测试数据
│   └── helpers/                   # 测试辅助
│       ├── setup.ts               # 测试设置
│       ├── mocks.ts               # 模拟数据
│       └── utils.ts               # 测试工具
├── docs/                          # 文档
│   ├── api/                       # API 文档
│   │   ├── core.md                # 核心 API
│   │   ├── vue.md                 # Vue API
│   │   ├── lit.md                 # Lit API
│   │   └── vanilla.md             # 原生 JS API
│   ├── guides/                    # 使用指南
│   │   ├── getting-started.md     # 快速开始
│   │   ├── configuration.md       # 配置指南
│   │   ├── theming.md             # 主题指南
│   │   ├── validation.md          # 验证指南
│   │   └── performance.md         # 性能指南
│   ├── examples/                  # 示例文档
│   │   ├── basic-usage.md         # 基础用法
│   │   ├── advanced-usage.md      # 高级用法
│   │   ├── custom-fields.md       # 自定义字段
│   │   └── integration.md         # 集成示例
│   ├── migration/                 # 迁移指南
│   │   ├── from-v1.md             # 从 v1 迁移
│   │   ├── breaking-changes.md    # 破坏性变更
│   │   └── upgrade-guide.md       # 升级指南
│   └── README.md                  # 文档首页
├── examples/                      # 示例项目
│   ├── vue-demo/                  # Vue 示例
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   ├── lit-demo/                  # Lit 示例
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   ├── vanilla-demo/              # 原生 JS 示例
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   ├── playground/                # 在线演练场
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   └── README.md                  # 示例说明
├── scripts/                       # 构建脚本
│   ├── build.js                   # 构建脚本
│   ├── dev.js                     # 开发脚本
│   ├── test.js                    # 测试脚本
│   ├── lint.js                    # 代码检查脚本
│   └── release.js                 # 发布脚本
├── .augment_cache/                # Augment 缓存
├── package.json                   # 包配置
├── tsconfig.json                  # TypeScript 配置
├── vite.config.ts                 # Vite 配置
├── vitest.config.ts               # Vitest 配置
├── eslint.config.js               # ESLint 配置
├── prettier.config.js             # Prettier 配置
├── FORM_REQUIREMENTS.md           # 功能需求规格书
├── DIRECTORY_STRUCTURE.md         # 目录结构规划 (本文件)
├── TASK_PLAN.md                   # 任务计划书
├── PROJECT_PLAN.md                # 项目计划书
└── README.md                      # 项目说明
```

## 🏗️ 架构设计原则

### 1. 分层架构
- **核心层 (Core)**: 业务逻辑无关的基础功能
- **适配层 (Adapters)**: 技术栈特定的实现
- **组件层 (Components)**: 可复用的UI组件
- **工具层 (Utils)**: 通用工具和配置

### 2. 依赖关系
```
工具层 (Utils) ← 核心层 (Core) ← 适配层 (Adapters) ← 组件层 (Components)
```

### 3. 模块化设计
- 每个模块都有明确的职责
- 模块间通过接口通信
- 支持按需导入
- 便于单独测试

### 4. 技术栈隔离
- Vue、Lit、Vanilla JS 实现完全隔离
- 共享核心逻辑和工具函数
- 统一的API接口
- 一致的行为表现

## 📦 包导出结构

### 主包导出
```typescript
// @ldesign/form
export * from './src/core'
export * from './src/utils'
export { FormConfig, FieldConfig } from './src/utils/types'
```

### Vue 子包导出
```typescript
// @ldesign/form/vue
export * from './src/adapters/vue'
export { useForm, useField, useLayout } from './src/adapters/vue/hooks'
export { LDesignForm, LDesignQueryForm } from './src/adapters/vue/components'
```

### Lit 子包导出
```typescript
// @ldesign/form/lit
export * from './src/adapters/lit'
export { LDesignForm, LDesignQueryForm } from './src/adapters/lit/components'
```

### Vanilla 子包导出
```typescript
// @ldesign/form/vanilla
export * from './src/adapters/vanilla'
export { FormManager, FieldManager } from './src/adapters/vanilla/classes'
```

## 🔧 构建配置

### 多入口构建
```javascript
// vite.config.ts
export default {
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        vue: 'src/adapters/vue/index.ts',
        lit: 'src/adapters/lit/index.ts',
        vanilla: 'src/adapters/vanilla/index.ts'
      }
    }
  }
}
```

### 样式构建
```javascript
// 样式独立构建
{
  'styles/index.css': 'styles/index.less',
  'styles/themes/light.css': 'styles/themes/light.less',
  'styles/themes/dark.css': 'styles/themes/dark.less'
}
```

## 📋 文件命名规范

### 组件文件
- Vue 组件: `ComponentName.vue`
- Lit 组件: `component-name.ts`
- 原生组件: `ComponentNameVanilla.ts`

### 类型文件
- 接口定义: `types.ts`
- 配置类型: `config.ts`
- 事件类型: `events.ts`

### 工具文件
- 辅助函数: `helpers.ts`
- 常量定义: `constants.ts`
- 工具类: `utils.ts`

### 测试文件
- 单元测试: `*.test.ts`
- 集成测试: `*.integration.ts`
- E2E测试: `*.spec.ts`
- 性能测试: `*.perf.ts`

## 🎯 目录结构优势

### 1. 清晰的职责分离
- 核心逻辑与UI实现分离
- 业务逻辑与技术栈解耦
- 工具函数与组件逻辑分离

### 2. 高度的可维护性
- 模块化设计，便于定位问题
- 统一的文件命名规范
- 完整的测试覆盖

### 3. 良好的可扩展性
- 新增技术栈适配器容易
- 新增组件类型简单
- 新增功能模块清晰

### 4. 优秀的开发体验
- TypeScript 完整支持
- 热重载和快速构建
- 丰富的开发工具

---

这个目录结构设计遵循了现代前端项目的最佳实践，确保了代码的可维护性、可扩展性和可测试性。通过清晰的分层和模块化设计，不同技术栈的实现可以共享核心逻辑，同时保持各自的独立性。
