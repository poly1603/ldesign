# @ldesign/size 设计理念

## 🎨 核心设计理念

### 1. 以用户为中心 (User-Centric Design)

**理念阐述**：所有设计决策都以提升用户体验为出发点，关注用户的真实需求和使用场景。

**具体体现**：

- **个性化体验**：允许用户根据个人喜好调整界面尺寸
- **无障碍友好**：为视力障碍用户提供大字体模式
- **直观操作**：简单明了的尺寸切换交互
- **即时反馈**：尺寸变化的即时视觉反馈

**设计原则**：

```
用户需求 > 技术实现
易用性 > 功能复杂性
体验一致性 > 技术多样性
```

### 2. 渐进式增强 (Progressive Enhancement)

**理念阐述**：从基础功能开始，逐步增加高级特性，确保在任何环境下都能提供基本功能。

**层次结构**：

```
第一层：基础CSS变量生成和注入
第二层：尺寸模式管理和切换
第三层：事件系统和状态管理
第四层：框架特定集成和组件
第五层：高级定制和扩展功能
```

**实现策略**：

- **核心功能独立**：不依赖任何外部框架
- **可选增强**：框架特定功能作为可选模块
- **向后兼容**：新版本保持 API 兼容性
- **优雅降级**：在不支持的环境中提供基础功能

### 3. 约定优于配置 (Convention over Configuration)

**理念阐述**：提供合理的默认配置，减少用户的配置负担，同时保持足够的灵活性。

**默认约定**：

- **CSS 变量前缀**：`--ls-` (LDesign Size)
- **尺寸模式**：small、medium、large、extra-large
- **注入选择器**：`:root`
- **样式标签 ID**：`ldesign-size-variables`

**配置层次**：

```
零配置使用 → 简单配置 → 高级配置 → 完全自定义
```

**平衡策略**：

- **80/20 原则**：80%的用例使用默认配置即可满足
- **渐进式配置**：从简单到复杂的配置选项
- **配置验证**：自动验证配置的合理性
- **配置迁移**：版本升级时的配置自动迁移

### 4. 性能优先 (Performance First)

**理念阐述**：在功能实现的每个环节都考虑性能影响，追求最佳的运行时表现。

**性能策略**：

- **懒加载**：按需加载框架特定功能
- **缓存优化**：缓存生成的 CSS 变量和配置
- **最小化 DOM 操作**：批量更新，减少重排重绘
- **内存管理**：及时清理事件监听器和引用

**性能指标**：

```
包大小：< 50KB (gzipped)
初始化：< 10ms
切换延迟：< 5ms
内存占用：< 1MB
```

### 5. 类型安全 (Type Safety)

**理念阐述**：TypeScript 优先的设计，提供完整的类型定义，在编译时发现潜在问题。

**类型设计原则**：

- **严格类型**：所有公开 API 都有严格的类型定义
- **泛型支持**：合理使用泛型提高类型灵活性
- **类型推导**：充分利用 TypeScript 的类型推导能力
- **运行时检查**：关键参数的运行时类型验证

**类型覆盖**：

```
核心API：100%类型覆盖
Vue集成：100%类型覆盖
工具函数：100%类型覆盖
配置选项：100%类型覆盖
```

## 🏗️ 架构设计原则

### 1. 单一职责原则 (Single Responsibility Principle)

每个模块、类、函数都只负责一个明确的职责。

**模块职责划分**：

- **presets.ts**：负责预设配置的定义和管理
- **css-generator.ts**：负责 CSS 变量的生成
- **css-injector.ts**：负责 CSS 的注入和移除
- **size-manager.ts**：负责尺寸状态的管理和协调

### 2. 开放封闭原则 (Open-Closed Principle)

对扩展开放，对修改封闭。

**扩展点设计**：

- **配置系统**：支持自定义配置扩展
- **事件系统**：支持自定义事件监听
- **插件系统**：支持第三方插件扩展
- **主题系统**：支持自定义主题扩展

### 3. 依赖倒置原则 (Dependency Inversion Principle)

依赖抽象而非具体实现。

**抽象层设计**：

```typescript
// 抽象接口
interface SizeManager {
  setMode(mode: SizeMode): void
  getCurrentMode(): SizeMode
  // ...
}

// 具体实现
class SizeManagerImpl implements SizeManager {
  // 实现细节
}
```

### 4. 接口隔离原则 (Interface Segregation Principle)

提供最小化的接口，避免接口污染。

**接口设计**：

- **核心接口**：只包含必要的方法
- **扩展接口**：可选的高级功能
- **框架接口**：框架特定的功能
- **工具接口**：独立的工具函数

### 5. 组合优于继承 (Composition over Inheritance)

通过组合实现功能扩展，而非继承。

**组合设计**：

```typescript
class SizeManagerImpl {
  private cssGenerator: CSSVariableGenerator
  private cssInjector: CSSInjector

  constructor(options: SizeManagerOptions) {
    this.cssGenerator = new CSSVariableGenerator(options.prefix)
    this.cssInjector = new CSSInjector(options)
  }
}
```

## 🎯 API 设计原则

### 1. 一致性 (Consistency)

**命名一致性**：

- 动词在前：`setMode`、`getConfig`、`generateCSS`
- 布尔值以`is`或`has`开头：`isValidMode`、`hasConfig`
- 事件以`on`开头：`onSizeChange`、`onModeSwitch`

**参数一致性**：

- 可选参数放在后面
- 配置对象使用统一的命名约定
- 回调函数使用统一的签名格式

### 2. 可预测性 (Predictability)

**行为可预测**：

- 相同的输入总是产生相同的输出
- 副作用明确且可控
- 错误处理一致且有意义

**状态可预测**：

- 状态变化有明确的触发条件
- 状态转换遵循明确的规则
- 状态查询结果稳定可靠

### 3. 容错性 (Fault Tolerance)

**输入验证**：

```typescript
function setMode(mode: SizeMode): void {
  if (!isValidSizeMode(mode)) {
    console.warn(`Invalid size mode: ${mode}`)
    return
  }
  // 执行设置逻辑
}
```

**优雅降级**：

- 在不支持的环境中提供基础功能
- 配置错误时使用默认值
- 网络错误时使用本地缓存

### 4. 可扩展性 (Extensibility)

**插件系统**：

```typescript
interface SizePlugin {
  name: string
  install(manager: SizeManager): void
  uninstall?(manager: SizeManager): void
}
```

**事件系统**：

```typescript
manager.on('beforeModeChange', event => {
  // 可以阻止模式切换
  if (shouldPreventChange) {
    event.preventDefault()
  }
})
```

## 🔄 状态管理设计

### 1. 单向数据流

```
用户操作 → Action → State → View → 用户感知
```

### 2. 状态不可变性

```typescript
// 错误：直接修改状态
this.state.currentMode = newMode

// 正确：创建新状态
this.state = {
  ...this.state,
  currentMode: newMode,
}
```

### 3. 状态同步策略

- **立即同步**：UI 状态变化立即反映
- **批量更新**：CSS 变量批量注入
- **异步通知**：事件监听器异步调用

## 🎨 用户体验设计

### 1. 交互设计原则

**即时反馈**：

- 尺寸切换立即生效
- 加载状态明确显示
- 错误信息及时提示

**操作简化**：

- 一键切换尺寸模式
- 智能默认选择
- 快捷键支持

### 2. 视觉设计原则

**一致性**：

- 统一的视觉语言
- 一致的交互模式
- 协调的色彩搭配

**层次性**：

- 清晰的信息层次
- 合理的视觉权重
- 有序的布局结构

### 3. 可访问性设计

**键盘导航**：

- 完整的键盘操作支持
- 合理的 Tab 顺序
- 明确的焦点指示

**屏幕阅读器**：

- 语义化的 HTML 结构
- 完整的 ARIA 标签
- 有意义的文本描述

## 🔮 未来演进理念

### 1. 持续改进

**用户反馈驱动**：

- 收集用户使用数据
- 分析用户行为模式
- 基于反馈优化功能

**技术演进适应**：

- 跟进 Web 标准发展
- 适配新的浏览器特性
- 整合新的开发工具

### 2. 生态建设

**社区驱动**：

- 开放的贡献机制
- 活跃的社区讨论
- 丰富的插件生态

**标准化推进**：

- 推动行业标准制定
- 参与开源社区建设
- 分享最佳实践经验

### 3. 创新探索

**技术创新**：

- 探索新的实现方案
- 研究性能优化技术
- 实验新的交互模式

**应用创新**：

- 拓展应用场景
- 探索商业模式
- 推动产业发展

---

_这些设计理念指导着@ldesign/size 的每一个技术决策，确保项目始终朝着正确的方向发展。_
