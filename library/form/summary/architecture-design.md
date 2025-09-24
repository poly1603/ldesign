# LemonForm 架构设计

## 整体架构

LemonForm 采用分层架构设计，从底层到顶层分为四个主要层次：

```
┌─────────────────────────────────────┐
│           Vue 组件层                │  ← 用户界面层
│  DynamicForm, FormField, etc.       │
├─────────────────────────────────────┤
│           组合式函数层              │  ← 逻辑抽象层
│  useForm, useFormField, etc.        │
├─────────────────────────────────────┤
│           核心引擎层                │  ← 业务逻辑层
│  FormEngine, ValidationEngine, etc. │
├─────────────────────────────────────┤
│           工具函数层                │  ← 基础工具层
│  form-utils, validation-utils, etc. │
└─────────────────────────────────────┘
```

## 核心引擎层

### FormEngine - 表单核心引擎

FormEngine 是整个表单系统的核心协调器，负责：

- 管理表单生命周期
- 协调各个子引擎
- 处理表单级别的操作
- 提供统一的 API 接口

```typescript
class FormEngine {
  // 子引擎
  stateManager: StateManager
  validationEngine: ValidationEngine
  layoutEngine: LayoutEngine
  conditionEngine: ConditionEngine
  eventBus: EventBus
  
  // 生命周期方法
  mount(): void
  unmount(): void
  destroy(): void
  
  // 表单操作
  validate(): Promise<ValidationResult>
  reset(): void
  submit(): Promise<boolean>
}
```

### StateManager - 状态管理器

StateManager 负责管理表单的所有状态，包括：

- 表单数据状态
- 字段状态（脏数据、触摸状态、错误状态等）
- 表单元数据

```typescript
class StateManager {
  // 状态存储
  private formData: AnyObject
  private fieldStates: Map<string, FieldState>
  private fieldConfigs: Map<string, FormFieldConfig>
  
  // 数据操作
  setValue(field: string, value: any): void
  getValue(field: string): any
  setFormData(data: AnyObject): void
  getFormData(): AnyObject
  
  // 状态操作
  setFieldState(field: string, state: Partial<FieldState>): void
  getFieldState(field: string): FieldState | null
}
```

### ValidationEngine - 验证引擎

ValidationEngine 处理所有验证相关的逻辑：

- 内置验证器管理
- 自定义验证器注册
- 异步验证处理
- 验证缓存机制

```typescript
class ValidationEngine {
  // 验证器管理
  private validators: Map<string, ValidatorDefinition>
  private cache: Map<string, ValidationResult>
  
  // 验证方法
  validateField(field: string, value: any, rules: ValidationRule[]): Promise<ValidationResult>
  validateForm(data: AnyObject, fieldRules: Record<string, ValidationRule[]>): Promise<FormValidationResult>
  
  // 验证器管理
  registerValidator(validator: ValidatorDefinition): void
  unregisterValidator(name: string): void
}
```

### LayoutEngine - 布局引擎

LayoutEngine 负责处理表单的布局和响应式设计：

- 响应式断点计算
- 栅格布局计算
- 字段位置计算
- 布局优化

```typescript
class LayoutEngine {
  // 布局计算
  calculate(config: LayoutConfig, containerWidth: number): LayoutResult
  
  // 响应式处理
  updateBreakpoint(width: number): void
  
  // 字段分组
  splitFieldsToSections(fields: FormFieldItem[]): SectionResult
}
```

### ConditionEngine - 条件引擎

ConditionEngine 处理字段间的条件逻辑：

- 条件表达式解析
- 字段联动处理
- 异步条件处理
- 条件缓存

```typescript
class ConditionEngine {
  // 条件评估
  evaluateCondition(condition: ConditionExpression, formData: AnyObject): boolean
  
  // 字段更新
  updateFieldVisibility(field: string, formData: AnyObject): void
  updateFieldRequirement(field: string, formData: AnyObject): void
}
```

### EventBus - 事件总线

EventBus 提供组件间通信机制：

- 事件发布订阅
- 事件类型管理
- 异步事件处理

```typescript
class EventBus {
  // 事件管理
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
  emit(event: string, data: any): void
  
  // 异步事件
  emitAsync(event: string, data: any): Promise<any>
}
```

## 组合式函数层

### useForm - 主表单逻辑

```typescript
function useForm(config: FormConfig, options?: UseFormOptions) {
  // 响应式状态
  const formInstance = ref<FormEngine>()
  const formData = ref<AnyObject>({})
  const formState = reactive<FormState>({})
  
  // 方法
  const validate = async () => { /* ... */ }
  const reset = () => { /* ... */ }
  const submit = async () => { /* ... */ }
  
  return {
    formInstance,
    formData,
    formState,
    validate,
    reset,
    submit
  }
}
```

### useFormField - 字段逻辑

```typescript
function useFormField(options: UseFormFieldOptions) {
  // 字段状态
  const value = ref()
  const errors = ref<string[]>([])
  const isDirty = ref(false)
  
  // 字段方法
  const setValue = (newValue: any) => { /* ... */ }
  const validate = async () => { /* ... */ }
  
  return {
    value,
    errors,
    isDirty,
    setValue,
    validate
  }
}
```

## Vue 组件层

### DynamicForm - 主表单组件

```vue
<template>
  <form class="l-dynamic-form" @submit.prevent="handleSubmit">
    <div class="l-dynamic-form__fields" :style="layoutStyles">
      <FormField
        v-for="field in visibleFields"
        :key="field.name"
        :config="field"
        :value="getFieldValue(field.name)"
        @update:value="setFieldValue(field.name, $event)"
      />
    </div>
    <FormActions v-if="actionsConfig" :config="actionsConfig" />
  </form>
</template>
```

### FormField - 字段组件

```vue
<template>
  <div class="l-form-field" :class="fieldClasses">
    <label v-if="showLabel" class="l-form-field__label">
      {{ config.label }}
      <span v-if="isRequired" class="l-form-field__required">*</span>
    </label>
    
    <div class="l-form-field__control">
      <component
        :is="fieldComponent"
        v-model="fieldValue"
        v-bind="fieldProps"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
    
    <div v-if="hasError" class="l-form-field__error">
      {{ errors[0] }}
    </div>
  </div>
</template>
```

## 数据流

### 单向数据流

```
用户输入 → FormField → useFormField → StateManager → FormEngine → DynamicForm
```

### 事件流

```
字段变化 → EventBus → 验证引擎 → 条件引擎 → 布局引擎 → UI 更新
```

## 扩展机制

### 自定义字段组件

```typescript
// 注册自定义组件
app.use(DynamicFormPlugin, {
  components: {
    'custom-field': CustomFieldComponent
  }
})

// 使用自定义组件
{
  type: 'custom-field',
  name: 'customField',
  component: 'custom-field'
}
```

### 自定义验证器

```typescript
// 注册自定义验证器
validationEngine.registerValidator({
  name: 'custom',
  validator: (value, rule, formData) => {
    // 验证逻辑
    return true // 或错误消息
  }
})
```

### 插件系统

```typescript
// 插件接口
interface FormPlugin {
  name: string
  install(formEngine: FormEngine): void
  uninstall(formEngine: FormEngine): void
}

// 使用插件
formEngine.use(myPlugin)
```

## 性能优化

### 1. 按需加载

- 字段组件懒加载
- 验证器按需注册
- 主题样式按需加载

### 2. 缓存机制

- 验证结果缓存
- 布局计算缓存
- 条件评估缓存

### 3. 虚拟化

- 大表单虚拟滚动
- 字段懒渲染
- 分页表单

### 4. 防抖优化

- 验证防抖
- 布局计算防抖
- 事件处理防抖

## 错误处理

### 1. 错误边界

- 组件级错误捕获
- 引擎级错误处理
- 全局错误处理

### 2. 错误恢复

- 自动重试机制
- 降级处理
- 用户友好提示

### 3. 调试支持

- 开发模式调试信息
- 错误堆栈追踪
- 性能监控

## 测试策略

### 1. 单元测试

- 核心引擎测试
- 工具函数测试
- 组合式函数测试

### 2. 组件测试

- Vue 组件测试
- 用户交互测试
- 快照测试

### 3. 集成测试

- 端到端测试
- 性能测试
- 兼容性测试

这种架构设计确保了 LemonForm 的可维护性、可扩展性和性能，同时提供了良好的开发体验。
