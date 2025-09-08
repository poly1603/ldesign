# 表单组件项目结构

## 目录结构

```
packages/form/
├── src/                          # 源代码目录
│   ├── core/                     # 核心模块
│   │   ├── form/                 # 表单核心
│   │   │   ├── index.ts          # 导出文件
│   │   │   ├── store.ts          # 表单状态管理
│   │   │   └── manager.ts        # 表单管理器
│   │   ├── field/                # 字段管理
│   │   │   ├── index.ts          # 导出文件
│   │   │   ├── store.ts          # 字段状态管理
│   │   │   └── manager.ts        # 字段管理器
│   │   ├── validation/           # 验证系统
│   │   │   ├── index.ts          # 导出文件
│   │   │   ├── engine.ts         # 验证引擎
│   │   │   └── registry.ts       # 验证器注册表
│   │   ├── layout/               # 布局系统
│   │   │   ├── index.ts          # 导出文件
│   │   │   ├── engine.ts         # 布局引擎
│   │   │   └── grid.ts           # 栅格系统
│   │   └── index.ts              # 核心模块导出
│   ├── components/               # 组件模块
│   │   ├── form/                 # Form组件
│   │   │   ├── index.ts          # 导出文件
│   │   │   └── Form.vue          # Form组件实现
│   │   ├── form-item/            # FormItem组件
│   │   │   ├── index.ts          # 导出文件
│   │   │   └── FormItem.vue      # FormItem组件实现
│   │   ├── inputs/               # 输入组件
│   │   │   ├── index.ts          # 导出文件
│   │   │   ├── Input.vue         # 输入框组件
│   │   │   ├── Textarea.vue      # 文本域组件
│   │   │   ├── Select.vue        # 选择器组件
│   │   │   ├── Checkbox.vue      # 复选框组件
│   │   │   ├── CheckboxGroup.vue # 复选框组组件
│   │   │   ├── Radio.vue         # 单选框组件
│   │   │   ├── RadioGroup.vue    # 单选框组组件
│   │   │   └── Switch.vue        # 开关组件
│   │   ├── advanced/             # 高级组件
│   │   │   ├── index.ts          # 导出文件
│   │   │   ├── DatePicker.vue    # 日期选择器
│   │   │   └── Upload.vue        # 文件上传组件
│   │   └── index.ts              # 组件模块导出
│   ├── hooks/                    # 自定义Hooks
│   │   ├── index.ts              # 导出文件
│   │   ├── types.ts              # Hook类型定义
│   │   ├── useForm.ts            # 表单Hook
│   │   ├── useFormContext.ts     # 表单上下文Hook
│   │   ├── useField.ts           # 字段Hook
│   │   ├── useFieldArray.ts      # 字段数组Hook
│   │   ├── useValidation.ts      # 验证Hook
│   │   ├── useValidator.ts       # 验证器Hook
│   │   ├── useLayout.ts          # 布局Hook
│   │   ├── useResponsive.ts      # 响应式Hook
│   │   ├── useFormStorage.ts     # 表单存储Hook
│   │   └── useFormHistory.ts     # 表单历史Hook
│   ├── types/                    # 类型定义
│   │   ├── index.ts              # 类型导出
│   │   ├── core.ts               # 核心类型
│   │   ├── components.ts         # 组件类型
│   │   └── validation.ts         # 验证类型
│   ├── utils/                    # 工具函数
│   │   ├── index.ts              # 工具导出
│   │   ├── helpers.ts            # 辅助函数
│   │   ├── validation.ts         # 验证工具
│   │   └── layout.ts             # 布局工具
│   ├── styles/                   # 样式文件
│   │   ├── index.less            # 样式入口
│   │   ├── variables.less        # CSS变量
│   │   ├── components/           # 组件样式
│   │   │   ├── form.less         # Form组件样式
│   │   │   ├── form-item.less    # FormItem组件样式
│   │   │   ├── input.less        # 输入框样式
│   │   │   ├── textarea.less     # 文本域样式
│   │   │   ├── select.less       # 选择器样式
│   │   │   ├── checkbox.less     # 复选框样式
│   │   │   ├── radio.less        # 单选框样式
│   │   │   ├── switch.less       # 开关样式
│   │   │   ├── date-picker.less  # 日期选择器样式
│   │   │   └── upload.less       # 上传组件样式
│   │   ├── utils/                # 工具样式
│   │   │   ├── grid.less         # 栅格系统
│   │   │   ├── responsive.less   # 响应式工具
│   │   │   └── animations.less   # 动画工具
│   │   └── themes/               # 主题样式
│   │       ├── default.less      # 默认主题
│   │       └── dark.less         # 暗色主题
│   └── index.ts                  # 主入口文件
├── tests/                        # 测试文件
│   ├── unit/                     # 单元测试
│   ├── integration/              # 集成测试
│   ├── e2e/                      # 端到端测试
│   └── performance/              # 性能测试
├── docs/                         # 文档
│   ├── api/                      # API文档
│   ├── guide/                    # 使用指南
│   ├── examples/                 # 示例代码
│   └── README.md                 # 文档首页
├── examples/                     # 示例应用
│   ├── basic/                    # 基础示例
│   ├── advanced/                 # 高级示例
│   └── playground/               # 在线演示
├── dev/                          # 开发环境
│   ├── App.vue                   # 开发应用
│   ├── main.ts                   # 开发入口
│   └── examples/                 # 开发示例
├── package.json                  # 包配置
├── vite.config.ts                # Vite配置
├── vitest.config.ts              # Vitest配置
├── tsconfig.json                 # TypeScript配置
├── eslint.config.js              # ESLint配置
├── playwright.config.ts          # Playwright配置
├── README.md                     # 项目说明
├── CHANGELOG.md                  # 更新日志
├── ANALYSIS_REPORT.md            # 分析报告
├── ARCHITECTURE_DESIGN.md       # 架构设计
└── PROJECT_STRUCTURE.md         # 项目结构说明
```

## 模块说明

### 核心模块 (core/)
- **form/**: 表单状态管理和核心逻辑
- **field/**: 字段管理和状态控制
- **validation/**: 验证引擎和验证器管理
- **layout/**: 布局计算和响应式处理

### 组件模块 (components/)
- **form/**: 表单容器组件
- **form-item/**: 表单项组件
- **inputs/**: 基础输入组件集合
- **advanced/**: 高级输入组件集合

### Hooks模块 (hooks/)
- 提供各种自定义Hook，简化组件开发
- 支持表单状态管理、验证、布局等功能

### 类型定义 (types/)
- 完整的TypeScript类型定义
- 确保类型安全和开发体验

### 工具函数 (utils/)
- 通用工具函数
- 验证工具
- 布局计算工具

### 样式系统 (styles/)
- 基于CSS变量的样式系统
- 组件样式模块化
- 响应式和主题支持

## 设计特点

1. **模块化架构**: 清晰的模块划分，便于维护和扩展
2. **类型安全**: 完整的TypeScript类型定义
3. **组件化**: 每个组件职责单一，可独立使用
4. **可扩展**: 支持自定义组件、验证器、主题等
5. **响应式**: 完整的响应式布局支持
6. **测试友好**: 完整的测试覆盖和测试工具

## 开发规范

1. 所有文件使用TypeScript编写
2. 组件使用Vue 3 Composition API
3. 样式使用Less编写，基于CSS变量
4. 遵循ESM模块规范
5. 完整的代码注释和文档
6. 100%测试覆盖率
