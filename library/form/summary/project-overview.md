# LemonForm 项目总览

## 项目简介

LemonForm 是一个专为 Vue 3 设计的动态表单库，提供强大、灵活、易用的表单解决方案。项目采用 TypeScript 开发，具有完整的类型定义和现代化的开发体验。

## 主要功能

### 核心特性

1. **配置驱动** - 通过简单的配置对象创建复杂表单
2. **组件化架构** - 模块化设计，支持按需使用和扩展
3. **响应式布局** - 自动适配不同屏幕尺寸，支持栅格布局
4. **强大验证** - 内置丰富验证规则，支持异步验证
5. **条件渲染** - 支持字段间联动，动态显示/隐藏字段
6. **TypeScript 支持** - 完整的类型定义
7. **调试友好** - 内置调试面板
8. **轻量级** - 核心包体积小，支持按需加载

### 字段类型

- **input** - 文本输入框
- **textarea** - 多行文本
- **select** - 下拉选择
- **radio** - 单选框
- **checkbox** - 复选框
- **switch** - 开关
- **date-picker** - 日期选择器
- **time-picker** - 时间选择器
- **upload** - 文件上传

### 验证规则

- **required** - 必填验证
- **minLength/maxLength** - 长度验证
- **min/max** - 数值范围验证
- **pattern** - 正则表达式验证
- **email** - 邮箱格式验证
- **phone** - 手机号验证
- **url** - URL 格式验证
- **custom** - 自定义验证器

## 技术架构

### 分层架构

```
Vue 组件层 (DynamicForm, FormField, etc.)
    ↓
组合式函数层 (useForm, useFormField, etc.)
    ↓
核心引擎层 (FormEngine, ValidationEngine, etc.)
    ↓
工具函数层 (form-utils, validation-utils, etc.)
```

### 核心模块

1. **FormEngine** - 表单核心引擎，负责整体协调
2. **StateManager** - 状态管理，处理表单数据和字段状态
3. **ValidationEngine** - 验证引擎，处理表单验证逻辑
4. **LayoutEngine** - 布局引擎，处理响应式布局
5. **ConditionEngine** - 条件引擎，处理字段联动逻辑
6. **EventBus** - 事件总线，处理组件间通信

### 技术栈

- **Vue 3** - 前端框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Vitest** - 单元测试
- **Playwright** - 端到端测试
- **VitePress** - 文档生成
- **Less** - CSS 预处理器

## 项目结构

```
packages/form/
├── src/                    # 源代码
│   ├── core/              # 核心引擎
│   ├── vue/               # Vue 组件
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   └── index.ts           # 主入口
├── docs/                  # 文档
├── tests/                 # 测试
├── summary/               # 项目总结
├── package.json           # 包配置
├── vite.config.ts         # 构建配置
├── tsconfig.json          # TypeScript 配置
└── README.md              # 项目说明
```

## 设计理念

### 1. 配置驱动

采用配置驱动的设计理念，通过简单的配置对象就能创建复杂的表单，减少模板代码，提高开发效率。

### 2. 组件化

每个功能都是独立的模块，可以按需使用，也可以轻松扩展。支持自定义组件、验证器、主题等。

### 3. 类型安全

完整的 TypeScript 支持，提供优秀的开发体验和类型安全保障。

### 4. 性能优化

- 按需加载
- 虚拟滚动（大表单）
- 防抖验证
- 缓存机制

### 5. 用户体验

- 响应式设计
- 无障碍支持
- 国际化
- 主题定制

## 开发规范

### 代码规范

- 使用 ESLint + Prettier 进行代码格式化
- 遵循 Vue 3 最佳实践
- 使用 TypeScript 严格模式
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### 提交规范

- 使用 Conventional Commits 规范
- 每个提交都要有清晰的描述
- 重大变更需要在 BREAKING CHANGE 中说明

### 测试规范

- 单元测试覆盖率 > 80%
- 端到端测试覆盖主要功能
- 每个 PR 都要通过所有测试

## 发布策略

### 版本管理

- 使用语义化版本控制 (SemVer)
- 主版本号：不兼容的 API 修改
- 次版本号：向下兼容的功能性新增
- 修订号：向下兼容的问题修正

### 发布流程

1. 开发完成后创建 PR
2. 代码审查通过
3. 合并到 main 分支
4. 自动运行测试和构建
5. 发布到 NPM

## 未来规划

### 短期目标 (1-3 个月)

- [ ] 完善文档和示例
- [ ] 添加更多字段类型
- [ ] 优化性能
- [ ] 增加测试覆盖率

### 中期目标 (3-6 个月)

- [ ] 支持表单设计器
- [ ] 添加更多主题
- [ ] 支持国际化
- [ ] 移动端优化

### 长期目标 (6-12 个月)

- [ ] 支持微前端
- [ ] 云端表单服务
- [ ] AI 辅助表单生成
- [ ] 可视化表单编辑器

## 贡献指南

### 如何贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 创建 Pull Request

### 贡献类型

- 🐛 Bug 修复
- ✨ 新功能
- 📝 文档改进
- 🎨 代码优化
- ✅ 测试增加

## 社区支持

- **GitHub**: https://github.com/lemonform/form
- **NPM**: https://www.npmjs.com/package/@lemonform/form
- **文档**: https://lemonform.github.io/form/
- **讨论**: GitHub Discussions

## 许可证

MIT License - 详见 [LICENSE](../LICENSE) 文件
