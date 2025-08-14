# Template 包重构总结

## 重构背景

原有的 template 包存在以下问题：

1. **组件重复和未使用**：`src/components/TemplateSelector.tsx` 组件存在但未被使用，`src/vue/components/TemplateRenderer.tsx` 中重新实现了一套模板选择器功能
2. **目录结构混乱**：`src/components/` 和 `src/vue/components/` 目录中都有组件，结构不统一
3. **职责不清**：TemplateRenderer 既负责渲染又负责选择器，违反单一职责原则

## 重构目标

1. **统一目录结构**：将所有 Vue 组件统一放在 `src/vue/components/` 目录下
2. **组件职责分离**：TemplateRenderer 专注于模板渲染，TemplateSelector 作为独立组件
3. **插槽化设计**：模板选择器通过插槽方式传递给模板组件，提高灵活性

## 重构内容

### 1. 目录结构优化

**删除重复组件：**

- 删除 `src/components/TemplateSelector.tsx`
- 删除 `src/components/TemplateSelector.less`

**统一组件位置：**

- 所有 Vue 组件统一在 `src/vue/components/` 目录下
- 保持清晰的组件层次关系

### 2. TemplateRenderer 重构

**移除的功能：**

- 移除内置的模板选择器渲染逻辑
- 移除 `showSelector` 和 `selectorPosition` props
- 简化渲染逻辑，专注于模板渲染

**保留的功能：**

- 模板加载和渲染
- 设备类型检测
- 性能优化功能
- 事件传递

**新增功能：**

- 暴露模板切换方法给外部使用
- 提供 `templateSelectorProps` 计算属性

### 3. TemplateSelector 优化

**新增 Props：**

- `deviceType`: 当前设备类型
- `availableTemplates`: 外部传入的模板列表
- `mode`: 显示模式（dropdown/grid/buttons）
- `size`: 组件大小（small/medium/large）
- `onTemplateChange`: 模板切换回调
- `onDeviceChange`: 设备切换回调

**优化功能：**

- 支持外部传入模板列表，提高灵活性
- 支持多种显示模式
- 完善的事件回调机制

### 4. 模板组件更新

**新增 Props：**

- `templateSelector`: 接收模板选择器组件实例

**移除功能：**

- 移除内置的模板选择器代码
- 清理不再需要的状态管理

**优化渲染：**

- 通过条件渲染显示传入的模板选择器
- 保持原有的布局结构

### 5. Login.tsx 集成

**更新导入：**

```tsx
import { TemplateRenderer, TemplateSelector } from '@ldesign/template'
```

**组件传递：**

```tsx
config={{
  loginPanel: createLoginPanel(),
  templateSelector: h(TemplateSelector, {
    category: 'login',
    mode: 'buttons',
    size: 'medium',
    showDeviceInfo: true,
  }),
  // 其他配置...
}}
```

## 重构优势

### 1. 职责分离

- **TemplateRenderer**：专注于模板渲染逻辑
- **TemplateSelector**：专注于模板选择功能
- **模板组件**：专注于布局和样式

### 2. 灵活性提升

- 模板选择器可以自由放置在任意位置
- 支持多种显示模式和样式定制
- 外部可以完全控制选择器的行为

### 3. 可维护性改善

- 清晰的目录结构
- 单一职责的组件设计
- 减少代码重复

### 4. 扩展性增强

- 插槽化设计便于功能扩展
- 组件间松耦合，易于独立开发
- 支持自定义模板选择器

## 使用示例

### 基础使用

```tsx
<TemplateRenderer
  category="login"
  config={{
    loginPanel: createLoginPanel(),
    templateSelector: h(TemplateSelector, {
      category: 'login',
      mode: 'dropdown',
    }),
  }}
/>
```

### 自定义选择器

```tsx
const customSelector = h(TemplateSelector, {
  category: 'login',
  mode: 'grid',
  size: 'large',
  showDeviceInfo: true,
  onTemplateChange: (templateId) => {
    console.log('切换到模板:', templateId)
  }
})

<TemplateRenderer
  category="login"
  config={{
    loginPanel: createLoginPanel(),
    templateSelector: customSelector
  }}
/>
```

### 模板内自定义位置

```tsx
// 在模板组件中
return () => (
  <div class="my-template">
    <header>
      {/* 选择器放在头部 */}
      {props.templateSelector}
    </header>

    <main>
      {/* 主要内容 */}
      {props.loginPanel}
    </main>
  </div>
)
```

## 后续优化建议

1. **类型安全**：完善 TypeScript 类型定义
2. **文档完善**：编写详细的组件使用文档
3. **测试覆盖**：为重构后的组件添加测试用例
4. **性能优化**：考虑组件的懒加载和缓存策略

## 总结

本次重构成功解决了原有的组件重复、目录混乱和职责不清等问题，建立了清晰的组件架构和灵活的插槽化设计。新的架构更加符合单一职责原则，提高了代码的可维护性和扩展性。
