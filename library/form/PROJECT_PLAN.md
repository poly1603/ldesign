# @ldesign/form 重构项目计划书

## 📋 项目概述

### 项目目标
重构 @ldesign/form 包，构建一个现代化、高性能、易用的表单解决方案，支持多技术栈统一API，提供智能布局和完整的开发体验。

### 核心价值
- **统一性**：一套API，多种实现，行为完全一致
- **智能化**：自适应布局，智能计算，开箱即用
- **灵活性**：高度可配置，支持复杂业务场景
- **开发友好**：完整类型，丰富文档，优秀的开发体验

## 🎯 功能需求分析

### 核心功能模块

#### 1. 智能布局系统
```typescript
interface LayoutEngine {
  // 响应式列数计算
  calculateColumns(containerWidth: number, config: LayoutConfig): number
  
  // 标题宽度自适应
  calculateLabelWidths(fields: FieldConfig[], columns: number): number[]
  
  // 间距配置系统
  applySpacing(config: SpacingConfig): CSSProperties
  
  // 最小宽度约束
  validateMinWidth(width: number, constraints: WidthConstraints): boolean
}
```

#### 2. 表单状态管理
```typescript
interface FormState {
  // 字段值管理
  values: Record<string, any>
  
  // 验证状态
  errors: Record<string, string[]>
  touched: Record<string, boolean>
  
  // UI状态
  collapsed: boolean
  loading: boolean
  submitting: boolean
}
```

#### 3. 配置系统
```typescript
interface FormConfig {
  // 布局配置
  layout: LayoutConfig
  
  // 样式配置
  theme: ThemeConfig
  
  // 行为配置
  behavior: BehaviorConfig
  
  // 字段配置
  fields: FieldConfig[]
}
```

#### 4. 事件系统
```typescript
interface FormEvents {
  onSubmit: (values: FormValues) => void | Promise<void>
  onReset: () => void
  onFieldChange: (field: string, value: any) => void
  onLayoutChange: (layout: LayoutResult) => void
  onToggle: (collapsed: boolean) => void
}
```

### 高级功能模块

#### 1. 主题系统
- LDESIGN设计系统集成
- CSS变量动态切换
- 深色/浅色模式支持
- 自定义主题扩展

#### 2. 验证系统
- 内置验证规则
- 自定义验证器
- 异步验证支持
- 实时验证反馈

#### 3. 国际化支持
- 多语言文本
- 日期格式化
- 数字格式化
- RTL布局支持

#### 4. 性能优化
- 虚拟滚动
- 懒加载
- 防抖优化
- 内存管理

## 🏗️ 技术架构设计

### 分层架构

```
┌─────────────────────────────────────────┐
│              应用层 (Apps)               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │   Vue   │ │   Lit   │ │ Vanilla │    │
│  └─────────┘ └─────────┘ └─────────┘    │
├─────────────────────────────────────────┤
│             适配层 (Adapters)            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │Vue Hook │ │Lit Mixin│ │JS Class │    │
│  └─────────┘ └─────────┘ └─────────┘    │
├─────────────────────────────────────────┤
│              核心层 (Core)               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │ Layout  │ │  State  │ │ Events  │    │
│  │ Engine  │ │Manager  │ │ System  │    │
│  └─────────┘ └─────────┘ └─────────┘    │
├─────────────────────────────────────────┤
│             工具层 (Utils)               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│  │  Types  │ │ Helpers │ │ Theme   │    │
│  └─────────┘ └─────────┘ └─────────┘    │
└─────────────────────────────────────────┘
```

### 核心设计原则

1. **单一职责**：每个模块只负责一个明确的功能
2. **依赖倒置**：高层模块不依赖低层模块，都依赖抽象
3. **开闭原则**：对扩展开放，对修改关闭
4. **接口隔离**：使用小而专的接口，避免臃肿
5. **组合优于继承**：通过组合实现功能复用

## 📁 目录结构规划

```
packages/form/
├── src/
│   ├── core/                    # 核心层
│   │   ├── layout/             # 布局引擎
│   │   │   ├── engine.ts       # 布局计算核心
│   │   │   ├── calculator.ts   # 尺寸计算器
│   │   │   ├── responsive.ts   # 响应式处理
│   │   │   └── index.ts
│   │   ├── state/              # 状态管理
│   │   │   ├── manager.ts      # 状态管理器
│   │   │   ├── validator.ts    # 验证器
│   │   │   ├── store.ts        # 状态存储
│   │   │   └── index.ts
│   │   ├── events/             # 事件系统
│   │   │   ├── emitter.ts      # 事件发射器
│   │   │   ├── types.ts        # 事件类型
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── adapters/               # 适配层
│   │   ├── vue/                # Vue适配器
│   │   │   ├── hooks/          # Vue Hooks
│   │   │   ├── components/     # Vue组件
│   │   │   ├── composables/    # 组合式函数
│   │   │   └── index.ts
│   │   ├── lit/                # Lit适配器
│   │   │   ├── mixins/         # Lit Mixins
│   │   │   ├── components/     # Lit组件
│   │   │   ├── decorators/     # 装饰器
│   │   │   └── index.ts
│   │   ├── vanilla/            # 原生JS适配器
│   │   │   ├── classes/        # JS类
│   │   │   ├── components/     # 原生组件
│   │   │   ├── dom/            # DOM操作
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── components/             # 组件层
│   │   ├── base/               # 基础组件
│   │   │   ├── input/          # 输入框
│   │   │   ├── select/         # 选择框
│   │   │   ├── button/         # 按钮
│   │   │   └── index.ts
│   │   ├── composite/          # 复合组件
│   │   │   ├── query-form/     # 查询表单
│   │   │   ├── edit-form/      # 编辑表单
│   │   │   ├── filter-form/    # 筛选表单
│   │   │   └── index.ts
│   │   ├── layout/             # 布局组件
│   │   │   ├── grid/           # 网格布局
│   │   │   ├── flex/           # 弹性布局
│   │   │   ├── button-group/   # 按钮组
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── utils/                  # 工具层
│   │   ├── types/              # 类型定义
│   │   │   ├── core.ts         # 核心类型
│   │   │   ├── config.ts       # 配置类型
│   │   │   ├── events.ts       # 事件类型
│   │   │   └── index.ts
│   │   ├── helpers/            # 辅助函数
│   │   │   ├── dom.ts          # DOM操作
│   │   │   ├── format.ts       # 格式化
│   │   │   ├── validate.ts     # 验证
│   │   │   └── index.ts
│   │   ├── constants/          # 常量配置
│   │   │   ├── defaults.ts     # 默认配置
│   │   │   ├── breakpoints.ts  # 断点配置
│   │   │   ├── themes.ts       # 主题配置
│   │   │   └── index.ts
│   │   ├── theme/              # 主题系统
│   │   │   ├── tokens.ts       # 设计令牌
│   │   │   ├── variables.ts    # CSS变量
│   │   │   ├── mixins.ts       # 样式混入
│   │   │   └── index.ts
│   │   └── index.ts
│   └── index.ts                # 主入口
├── tests/                      # 测试文件
│   ├── unit/                   # 单元测试
│   ├── integration/            # 集成测试
│   ├── e2e/                    # 端到端测试
│   └── fixtures/               # 测试数据
├── docs/                       # 文档
│   ├── api/                    # API文档
│   ├── guides/                 # 使用指南
│   ├── examples/               # 示例代码
│   └── migration/              # 迁移指南
├── examples/                   # 示例项目
│   ├── vue-demo/               # Vue示例
│   ├── lit-demo/               # Lit示例
│   ├── vanilla-demo/           # 原生JS示例
│   └── playground/             # 在线演练场
├── scripts/                    # 构建脚本
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

## 🔧 API设计

### 核心API

#### 1. 表单创建
```typescript
// Vue
import { useForm } from '@ldesign/form/vue'

const form = useForm({
  fields: [...],
  layout: {...},
  validation: {...}
})

// Lit
import { LDesignForm } from '@ldesign/form/lit'

customElements.define('my-form', LDesignForm)

// Vanilla
import { FormManager } from '@ldesign/form/vanilla'

const form = new FormManager(container, config)
```

#### 2. 配置系统
```typescript
const config: FormConfig = {
  layout: {
    columns: 'auto',           // 'auto' | number | ResponsiveColumns
    spacing: [16, 24],         // [horizontal, vertical]
    labelPosition: 'top',      // 'top' | 'left' | 'right'
    labelAlign: 'left',        // 'left' | 'center' | 'right'
    minFieldWidth: 200,        // number
    maxColumns: 4              // number
  },
  behavior: {
    collapsible: true,         // boolean
    defaultCollapsed: true,    // boolean
    submitOnEnter: true,       // boolean
    resetOnSubmit: false,      // boolean
    validateOnChange: true     // boolean
  },
  theme: {
    size: 'medium',            // 'small' | 'medium' | 'large'
    variant: 'outlined',       // 'filled' | 'outlined' | 'standard'
    colorScheme: 'auto'        // 'light' | 'dark' | 'auto'
  }
}
```

#### 3. 字段定义
```typescript
const fields: FieldConfig[] = [
  {
    name: 'keyword',
    label: '关键词',
    type: 'input',
    placeholder: '请输入关键词',
    rules: [
      { required: true, message: '请输入关键词' },
      { minLength: 2, message: '至少输入2个字符' }
    ],
    grid: {
      span: 1,                 // 占用列数
      offset: 0,               // 偏移列数
      order: 1                 // 排序
    }
  },
  {
    name: 'category',
    label: '分类',
    type: 'select',
    options: [
      { label: '全部', value: '' },
      { label: '技术', value: 'tech' },
      { label: '产品', value: 'product' }
    ],
    rules: [
      { required: true, message: '请选择分类' }
    ]
  }
]
```

### 事件API

```typescript
// 表单事件
form.on('submit', (values) => {
  console.log('提交数据:', values)
})

form.on('reset', () => {
  console.log('表单重置')
})

form.on('change', (field, value) => {
  console.log('字段变化:', field, value)
})

form.on('layout-change', (layout) => {
  console.log('布局变化:', layout)
})

// 生命周期事件
form.on('mounted', () => {
  console.log('表单挂载完成')
})

form.on('destroyed', () => {
  console.log('表单销毁')
})
```

## 📅 开发计划

### 第一阶段：核心架构重构 (3周)

#### Week 1: 基础架构
- [ ] 设计新的目录结构
- [ ] 建立类型系统
- [ ] 实现核心布局引擎
- [ ] 创建状态管理器

#### Week 2: 工具层建设
- [ ] 实现辅助函数库
- [ ] 建立主题系统
- [ ] 创建常量配置
- [ ] 设计事件系统

#### Week 3: 适配层框架
- [ ] Vue适配器基础
- [ ] Lit适配器基础
- [ ] 原生JS适配器基础
- [ ] 统一API设计

### 第二阶段：组件实现 (4周)

#### Week 4-5: 基础组件
- [ ] 输入框组件
- [ ] 选择框组件
- [ ] 按钮组件
- [ ] 布局组件

#### Week 6-7: 复合组件
- [ ] 查询表单组件
- [ ] 编辑表单组件
- [ ] 表单项组件
- [ ] 按钮组组件

### 第三阶段：高级功能 (3周)

#### Week 8: 验证系统
- [ ] 验证规则引擎
- [ ] 异步验证支持
- [ ] 错误信息显示
- [ ] 验证状态管理

#### Week 9: 主题系统
- [ ] 设计令牌系统
- [ ] CSS变量管理
- [ ] 主题切换功能
- [ ] 自定义主题支持

#### Week 10: 性能优化
- [ ] 虚拟滚动实现
- [ ] 懒加载优化
- [ ] 内存泄漏检查
- [ ] 性能监控

### 第四阶段：文档和测试 (2周)

#### Week 11: 测试覆盖
- [ ] 单元测试编写
- [ ] 集成测试编写
- [ ] E2E测试编写
- [ ] 性能测试

#### Week 12: 文档完善
- [ ] API文档编写
- [ ] 使用指南编写
- [ ] 示例项目完善
- [ ] 迁移指南编写

## 🎯 里程碑和交付物

### Milestone 1: 核心架构完成 (Week 3)
**交付物:**
- 完整的类型定义系统
- 核心布局引擎
- 基础状态管理
- 适配器框架

**验收标准:**
- 所有核心API设计完成
- 布局计算功能正常
- 类型检查无错误
- 基础测试通过

### Milestone 2: 组件实现完成 (Week 7)
**交付物:**
- 完整的组件库
- Vue/Lit/Vanilla三种实现
- 统一的API接口
- 基础示例项目

**验收标准:**
- 所有组件功能正常
- 三种实现行为一致
- API使用简单直观
- 示例项目可运行

### Milestone 3: 高级功能完成 (Week 10)
**交付物:**
- 完整的验证系统
- 主题系统
- 性能优化
- 高级示例

**验收标准:**
- 验证功能完整可用
- 主题切换正常
- 性能指标达标
- 复杂场景支持

### Milestone 4: 项目发布就绪 (Week 12)
**交付物:**
- 完整的测试覆盖
- 详细的文档
- 示例和演练场
- 发布包

**验收标准:**
- 测试覆盖率 > 90%
- 文档完整准确
- 示例丰富实用
- 可以正式发布

## 🛡️ 质量保证策略

### 代码质量
- **TypeScript严格模式**：确保类型安全
- **ESLint + Prettier**：代码风格统一
- **Husky + lint-staged**：提交前检查
- **代码审查**：所有代码必须经过审查

### 测试策略
- **单元测试**：覆盖率 > 90%
- **集成测试**：关键流程测试
- **E2E测试**：用户场景测试
- **性能测试**：性能回归检测

### 文档质量
- **API文档**：自动生成，实时更新
- **示例代码**：可运行，有注释
- **使用指南**：详细，易懂
- **变更日志**：记录所有变更

### 发布流程
- **语义化版本**：遵循SemVer规范
- **自动化发布**：CI/CD流程
- **变更通知**：及时通知用户
- **向后兼容**：保证API稳定性

## ⚠️ 风险评估和应对

### 技术风险

#### 风险1: 多技术栈兼容性
**描述**: Vue、Lit、Vanilla JS三种实现可能存在行为差异
**影响**: 高
**应对策略**:
- 建立统一的测试套件
- 使用共同的核心逻辑
- 定期进行兼容性测试

#### 风险2: 性能问题
**描述**: 复杂布局计算可能影响性能
**影响**: 中
**应对策略**:
- 实现布局计算缓存
- 使用防抖优化
- 建立性能监控

### 进度风险

#### 风险3: 开发进度延期
**描述**: 功能复杂度可能导致开发延期
**影响**: 中
**应对策略**:
- 分阶段交付，降低风险
- 预留缓冲时间
- 及时调整优先级

#### 风险4: 人力资源不足
**描述**: 开发人员不足可能影响进度
**影响**: 高
**应对策略**:
- 合理分配任务
- 提前识别瓶颈
- 寻求外部支持

### 业务风险

#### 风险5: 需求变更
**描述**: 业务需求可能发生变化
**影响**: 中
**应对策略**:
- 设计灵活的架构
- 预留扩展接口
- 及时沟通需求

## 📈 成功指标

### 技术指标
- **代码质量**: TypeScript覆盖率 100%，ESLint零警告
- **测试覆盖**: 单元测试覆盖率 > 90%，E2E测试覆盖核心场景
- **性能指标**: 首次渲染 < 100ms，布局计算 < 10ms
- **包大小**: 核心包 < 50KB，完整包 < 200KB

### 用户体验指标
- **API易用性**: 新手5分钟内完成基础使用
- **文档完整性**: 所有API都有文档和示例
- **错误处理**: 友好的错误提示和恢复机制
- **兼容性**: 支持主流浏览器和框架版本

### 业务指标
- **采用率**: 内部项目采用率 > 80%
- **满意度**: 开发者满意度 > 4.5/5
- **维护成本**: Bug修复时间 < 1天
- **扩展性**: 新功能开发周期 < 1周

---

## 🚀 总结

这个重构计划将彻底解决当前代码结构混乱的问题，建立一个现代化、高质量的表单解决方案。通过分层架构、统一API、完整测试，我们将提供一个真正易用、高性能、可维护的表单库。

**关键成功因素:**
1. **清晰的架构设计** - 分层明确，职责单一
2. **统一的API接口** - 一套API，多种实现
3. **完整的质量保证** - 测试、文档、代码审查
4. **渐进式交付** - 分阶段实施，风险可控

这个计划将为 @ldesign/form 奠定坚实的基础，支撑未来的长期发展。
