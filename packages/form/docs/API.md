# API 文档

## 框架无关的核心 API（v2.0 新特性）

### createForm

创建框架无关的表单实例。

```typescript
function createForm<T = Record<string, any>>(
  config: FormConfig<T>,
  callbacks?: FormEventCallbacks<T>
): FormInstance<T>
```

**参数：**
- `config`: 表单配置对象
- `callbacks`: 事件回调函数（可选）

**示例：**
```typescript
import { createForm } from '@ldesign/form'

const form = createForm({
  initialValues: { name: '', email: '' },
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'input',
      rules: [{ type: 'required', message: '请输入姓名' }]
    }
  ]
}, {
  onSubmit: async (values) => {
    console.log('提交数据:', values)
  }
})
```

### 适配器 API

#### createVanillaAdapter

创建原生JavaScript适配器。

```typescript
function createVanillaAdapter(config?: Partial<AdapterConfig>): VanillaAdapter
```

**示例：**
```typescript
import { createVanillaAdapter } from '@ldesign/form'

const adapter = createVanillaAdapter({ debug: true })
adapter.mount(form, '#form-container')
```

## Vue 3 组件 API

### createForm(options)

创建表单实例。

**参数:**
- `options.initialValues` (Object): 表单初始值
- `options.onSubmit` (Function, 可选): 提交处理函数
- `options.validateOnChange` (Boolean, 可选): 值变化时是否验证，默认 `true`
- `options.validateOnBlur` (Boolean, 可选): 失焦时是否验证，默认 `true`

**返回:** Form 实例

**示例:**
```javascript
import { createForm } from '@ldesign/form';

const form = createForm({
  initialValues: {
    username: '',
    email: ''
  },
  onSubmit: (data) => {
    console.log('提交数据:', data);
  }
});
```

### Form 实例方法

#### getField(name)
获取字段实例。

**参数:**
- `name` (String): 字段名称

**返回:** Field 实例

#### setFieldValue(name, value)
设置字段值。

**参数:**
- `name` (String): 字段名称
- `value` (Any): 字段值

#### getFieldValue(name)
获取字段值。

**参数:**
- `name` (String): 字段名称

**返回:** 字段值

#### setValues(values)
批量设置字段值。

**参数:**
- `values` (Object): 字段值对象

#### getValues()
获取所有字段值。

**返回:** 字段值对象

#### validate()
验证整个表单。

**返回:** Promise&lt;ValidationResult&gt;

#### submit(options?)
提交表单。

**参数:**
- `options.processor` (Object, 可选): 数据处理器

**返回:** Promise&lt;SubmitResult&gt;

#### reset()
重置表单到初始状态。

#### destroy()
销毁表单实例，清理资源。

### Field 实例方法

#### setValue(value)
设置字段值。

**参数:**
- `value` (Any): 字段值

#### getValue()
获取字段值。

**返回:** 字段值

#### addRule(rule)
添加验证规则。

**参数:**
- `rule.validator` (Function): 验证器函数

#### validate()
验证字段。

**返回:** Promise&lt;ValidationResult&gt;

#### reset()
重置字段到初始状态。

#### onChange(listener)
监听字段值变化。

**参数:**
- `listener` (Function): 监听器函数

#### onValidationChange(listener)
监听验证状态变化。

**参数:**
- `listener` (Function): 监听器函数

## Vue 3 API

### useForm(options)

Vue 3 Composition API Hook，创建响应式表单实例。

**参数:** 同 `createForm`

**返回:** 响应式 Form 实例

**示例:**
```vue
<script setup>
import { useForm } from '@ldesign/form';

const form = useForm({
  initialValues: {
    username: '',
    email: ''
  }
});
</script>
```

### useField(options)

创建字段实例的 Hook。

**参数:**
- `options.name` (String): 字段名称
- `options.form` (Form): 表单实例
- `options.rules` (Array, 可选): 验证规则
- `options.initialValue` (Any, 可选): 初始值

**返回:** 响应式 Field 实例

### useFieldArray(options)

创建字段数组实例的 Hook。

**参数:**
- `options.name` (String): 字段名称
- `options.form` (Form): 表单实例
- `options.initialValue` (Array, 可选): 初始值

**返回:** FieldArray 实例

### useFormContext()

获取表单上下文。

**返回:** FormContext 或 null

## 组件 API

### LDesignForm

表单容器组件。

**Props:**
- `form` (Form): 表单实例
- `layout` (String, 可选): 布局模式，`'vertical' | 'horizontal' | 'inline'`

**Events:**
- `submit`: 表单提交事件
- `reset`: 表单重置事件

**示例:**
```vue
<LDesignForm :form="form" @submit="handleSubmit">
  <!-- 表单内容 -->
</LDesignForm>
```

### LDesignFormItem

表单项组件。

**Props:**
- `name` (String): 字段名称
- `label` (String, 可选): 标签文本
- `rules` (Array, 可选): 验证规则
- `required` (Boolean, 可选): 是否必填
- `help` (String, 可选): 帮助文本
- `layout` (String, 可选): 布局模式
- `labelWidth` (String, 可选): 标签宽度

**Slots:**
- `default`: 默认插槽，放置表单控件
- `label`: 标签插槽
- `error`: 错误信息插槽

**示例:**
```vue
<LDesignFormItem
  name="username"
  label="用户名"
  :rules="[{ validator: required() }]"
  help="请输入用户名"
>
  <LDesignInput v-model="form.data.username" />
</LDesignFormItem>
```

### LDesignInput

输入框组件。

**Props:**
- `modelValue` (String): 输入值
- `type` (String, 可选): 输入类型，默认 `'text'`
- `placeholder` (String, 可选): 占位符
- `disabled` (Boolean, 可选): 是否禁用
- `readonly` (Boolean, 可选): 是否只读

**Events:**
- `update:modelValue`: 值更新事件
- `input`: 输入事件
- `change`: 变化事件
- `focus`: 获焦事件
- `blur`: 失焦事件

### LDesignButton

按钮组件。

**Props:**
- `type` (String, 可选): 按钮类型，`'primary' | 'secondary' | 'danger'`
- `size` (String, 可选): 按钮大小，`'small' | 'medium' | 'large'`
- `loading` (Boolean, 可选): 加载状态
- `disabled` (Boolean, 可选): 是否禁用
- `htmlType` (String, 可选): HTML 类型，`'button' | 'submit' | 'reset'`

**Events:**
- `click`: 点击事件

## 验证器 API

### required(message?)

必填验证器。

**参数:**
- `message` (String, 可选): 自定义错误消息

**示例:**
```javascript
import { required } from '@ldesign/form/validators';

const rules = [
  { validator: required() },
  { validator: required('用户名不能为空') }
];
```

### email(message?)

邮箱格式验证器。

**参数:**
- `message` (String, 可选): 自定义错误消息

### length(options)

长度验证器。

**参数:**
- `options.min` (Number, 可选): 最小长度
- `options.max` (Number, 可选): 最大长度
- `options.exact` (Number, 可选): 精确长度
- `options.message` (String, 可选): 自定义错误消息

**示例:**
```javascript
import { length } from '@ldesign/form/validators';

const rules = [
  { validator: length({ min: 3, max: 20 }) },
  { validator: length({ exact: 6, message: '验证码必须是6位' }) }
];
```

### pattern(regex, message?)

正则表达式验证器。

**参数:**
- `regex` (RegExp): 正则表达式
- `message` (String, 可选): 自定义错误消息

### 自定义验证器

验证器是一个函数，接收值和上下文，返回验证结果。

**签名:**
```typescript
type Validator = (value: any, context?: ValidationContext) => ValidationResult | Promise&lt;ValidationResult&gt;;

interface ValidationResult {
  valid: boolean;
  message: string;
}

interface ValidationContext {
  fieldName: string;
  fieldConfig?: FieldConfig;
  form?: Form;
}
```

**示例:**
```javascript
const customValidator = (value, context) => {
  if (value.includes('admin')) {
    return { valid: false, message: '用户名不能包含admin' };
  }
  return { valid: true, message: '' };
};

field.addRule({ validator: customValidator });
```

## 类型定义

### FormConfig
```typescript
interface FormConfig {
  initialValues: Record&lt;string, any&gt;;
  onSubmit?: (data: any) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}
```

### ValidationResult
```typescript
interface ValidationResult {
  valid: boolean;
  message: string;
}
```

### SubmitResult
```typescript
interface SubmitResult {
  data: Record&lt;string, any&gt;;
  valid: boolean;
  validation: Record&lt;string, ValidationResult&gt;;
}
```

## 最佳实践

### 1. 表单结构设计
- 使用语义化的字段名称
- 合理组织表单层级结构
- 避免过深的嵌套

### 2. 验证规则设计
- 优先使用内置验证器
- 自定义验证器保持纯函数特性
- 提供清晰的错误提示信息

### 3. 性能优化
- 合理使用 `validateOnChange` 和 `validateOnBlur`
- 避免在验证器中执行重计算
- 及时销毁不需要的表单实例

### 4. 错误处理
- 统一处理验证错误
- 提供用户友好的错误提示
- 记录和监控表单错误

### 5. 可访问性
- 为表单控件提供适当的标签
- 使用 ARIA 属性增强可访问性
- 确保键盘导航的可用性
