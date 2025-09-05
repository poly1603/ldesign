# Validation 数据验证

Validation 模块提供了灵活的验证规则引擎，支持同步和异步验证，帮助确保数据的完整性和正确性。

## 导入方式

```typescript
// 完整导入
import { Validator, ValidationRules, FormValidator } from '@ldesign/kit'

// 按需导入
import { Validator } from '@ldesign/kit/validation'

// 单独导入
import { Validator, ValidationRules } from '@ldesign/kit'
```

## Validator

验证器类，提供灵活的数据验证功能。

### 创建验证器

#### `create(options?: ValidatorOptions): Validator`

创建验证器实例。

```typescript
// 默认配置
const validator = Validator.create()

// 自定义配置
const validator = Validator.create({
  stopOnFirstError: false, // 不在第一个错误时停止
  locale: 'zh-CN', // 错误消息语言
  customMessages: {
    // 自定义错误消息
    required: '{{field}} 是必填项',
    email: '{{field}} 格式不正确',
    minLength: '{{field}} 至少需要 {{min}} 个字符',
  },
  fieldNameMap: {
    // 字段名映射
    email: '邮箱地址',
    password: '密码',
    confirmPassword: '确认密码',
  },
})
```

### 添加验证规则

#### `addRule(field: string, rule: ValidationRule): void`

为字段添加验证规则。

```typescript
// 基本规则
validator.addRule('email', ValidationRules.required())
validator.addRule('email', ValidationRules.email())

// 密码规则
validator.addRule('password', ValidationRules.required())
validator.addRule('password', ValidationRules.minLength(8))
validator.addRule(
  'password',
  ValidationRules.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字')
)

// 自定义规则
validator.addRule('confirmPassword', (value, data) => {
  return value === data.password ? true : '两次密码输入不一致'
})
```

### 执行验证

#### `validate(data: any): Promise<ValidationResult>`

验证数据。

```typescript
const userData = {
  email: 'user@example.com',
  password: 'SecurePass123',
  confirmPassword: 'SecurePass123',
  age: 25,
}

const result = await validator.validate(userData)

if (result.valid) {
  console.log('验证通过')
} else {
  console.log('验证失败:')
  result.errors.forEach(error => {
    console.log(`- ${error.field}: ${error.message}`)
  })
}
```

#### `validateField(field: string, value: any, data?: any): Promise<FieldValidationResult>`

验证单个字段。

```typescript
const emailResult = await validator.validateField('email', 'user@example.com')
if (!emailResult.valid) {
  console.log('邮箱验证失败:', emailResult.message)
}

// 带上下文验证
const passwordResult = await validator.validateField('confirmPassword', 'password123', {
  password: 'password123',
})
```

## ValidationRules

内置验证规则类，提供常用的验证规则。

### 基础规则

#### `required(message?: string): ValidationRule`

必填验证。

```typescript
validator.addRule('name', ValidationRules.required())
validator.addRule('email', ValidationRules.required('邮箱不能为空'))
```

#### `optional(): ValidationRule`

可选字段标记。

```typescript
validator.addRule('nickname', ValidationRules.optional())
```

### 字符串规则

#### `minLength(length: number, message?: string): ValidationRule`

最小长度验证。

```typescript
validator.addRule('password', ValidationRules.minLength(8))
validator.addRule('username', ValidationRules.minLength(3, '用户名至少3个字符'))
```

#### `maxLength(length: number, message?: string): ValidationRule`

最大长度验证。

```typescript
validator.addRule('bio', ValidationRules.maxLength(500))
validator.addRule('title', ValidationRules.maxLength(100, '标题不能超过100个字符'))
```

#### `length(length: number, message?: string): ValidationRule`

精确长度验证。

```typescript
validator.addRule('code', ValidationRules.length(6))
validator.addRule('zipCode', ValidationRules.length(6, '邮政编码必须是6位'))
```

#### `pattern(regex: RegExp, message?: string): ValidationRule`

正则表达式验证。

```typescript
// 手机号验证
validator.addRule('phone', ValidationRules.pattern(/^1[3-9]\d{9}$/, '请输入有效的手机号'))

// 身份证号验证
validator.addRule(
  'idCard',
  ValidationRules.pattern(
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    '请输入有效的身份证号'
  )
)
```

### 格式验证

#### `email(message?: string): ValidationRule`

邮箱格式验证。

```typescript
validator.addRule('email', ValidationRules.email())
validator.addRule('contactEmail', ValidationRules.email('请输入有效的邮箱地址'))
```

#### `url(message?: string): ValidationRule`

URL 格式验证。

```typescript
validator.addRule('website', ValidationRules.url())
validator.addRule('homepage', ValidationRules.url('请输入有效的网址'))
```

#### `ip(version?: 'v4' | 'v6', message?: string): ValidationRule`

IP 地址验证。

```typescript
validator.addRule('serverIp', ValidationRules.ip())
validator.addRule('ipv4', ValidationRules.ip('v4'))
validator.addRule('ipv6', ValidationRules.ip('v6'))
```

#### `mac(message?: string): ValidationRule`

MAC 地址验证。

```typescript
validator.addRule('macAddress', ValidationRules.mac())
```

### 数值规则

#### `min(value: number, message?: string): ValidationRule`

最小值验证。

```typescript
validator.addRule('age', ValidationRules.min(18))
validator.addRule('price', ValidationRules.min(0, '价格不能为负数'))
```

#### `max(value: number, message?: string): ValidationRule`

最大值验证。

```typescript
validator.addRule('age', ValidationRules.max(120))
validator.addRule('discount', ValidationRules.max(100, '折扣不能超过100%'))
```

#### `range(min: number, max: number, message?: string): ValidationRule`

数值范围验证。

```typescript
validator.addRule('age', ValidationRules.range(18, 120))
validator.addRule('score', ValidationRules.range(0, 100, '分数必须在0-100之间'))
```

#### `integer(message?: string): ValidationRule`

整数验证。

```typescript
validator.addRule('count', ValidationRules.integer())
validator.addRule('quantity', ValidationRules.integer('数量必须是整数'))
```

#### `decimal(precision?: number, message?: string): ValidationRule`

小数验证。

```typescript
validator.addRule('price', ValidationRules.decimal(2))
validator.addRule('rate', ValidationRules.decimal(4, '利率最多4位小数'))
```

### 日期规则

#### `date(format?: string, message?: string): ValidationRule`

日期格式验证。

```typescript
validator.addRule('birthday', ValidationRules.date())
validator.addRule('startDate', ValidationRules.date('YYYY-MM-DD'))
```

#### `dateAfter(date: Date | string, message?: string): ValidationRule`

日期晚于指定日期。

```typescript
validator.addRule('endDate', ValidationRules.dateAfter(new Date()))
validator.addRule('expireDate', ValidationRules.dateAfter('2024-01-01'))
```

#### `dateBefore(date: Date | string, message?: string): ValidationRule`

日期早于指定日期。

```typescript
validator.addRule('birthday', ValidationRules.dateBefore(new Date()))
```

### 数组规则

#### `arrayMinLength(length: number, message?: string): ValidationRule`

数组最小长度。

```typescript
validator.addRule('tags', ValidationRules.arrayMinLength(1))
validator.addRule('skills', ValidationRules.arrayMinLength(3, '至少选择3项技能'))
```

#### `arrayMaxLength(length: number, message?: string): ValidationRule`

数组最大长度。

```typescript
validator.addRule('tags', ValidationRules.arrayMaxLength(10))
```

#### `arrayUnique(message?: string): ValidationRule`

数组元素唯一性。

```typescript
validator.addRule('tags', ValidationRules.arrayUnique())
```

### 文件规则

#### `fileSize(maxSize: number, message?: string): ValidationRule`

文件大小验证。

```typescript
validator.addRule('avatar', ValidationRules.fileSize(2 * 1024 * 1024)) // 2MB
```

#### `fileType(types: string[], message?: string): ValidationRule`

文件类型验证。

```typescript
validator.addRule('avatar', ValidationRules.fileType(['jpg', 'png', 'gif']))
validator.addRule('document', ValidationRules.fileType(['pdf', 'doc', 'docx']))
```

### 自定义规则

#### `custom(validator: (value: any, data?: any) => boolean | string | Promise<boolean | string>): ValidationRule`

自定义验证规则。

```typescript
// 同步自定义规则
validator.addRule(
  'username',
  ValidationRules.custom(value => {
    if (reservedUsernames.includes(value)) {
      return '用户名已被保留'
    }
    return true
  })
)

// 异步自定义规则
validator.addRule(
  'email',
  ValidationRules.custom(async value => {
    const exists = await checkEmailExists(value)
    return exists ? '邮箱已被注册' : true
  })
)
```

## FormValidator

表单验证器类，专门用于表单验证。

### 创建表单验证器

```typescript
const formValidator = FormValidator.create({
  validateOnChange: true, // 字段变化时验证
  validateOnBlur: true, // 失去焦点时验证
  showFirstErrorOnly: false, // 显示所有错误
})
```

### 字段级验证

#### `addFieldRule(field: string, rule: ValidationRule): void`

为字段添加验证规则。

```typescript
formValidator.addFieldRule('email', ValidationRules.required())
formValidator.addFieldRule('email', ValidationRules.email())
formValidator.addFieldRule('password', ValidationRules.minLength(8))
formValidator.addFieldRule(
  'confirmPassword',
  ValidationRules.custom((value, data) => {
    return value === data.password ? true : '两次密码输入不一致'
  })
)
```

#### `validateForm(data: any): Promise<FormValidationResult>`

验证整个表单。

```typescript
const formData = {
  email: 'user@example.com',
  password: 'password123',
  confirmPassword: 'password123',
}

const result = await formValidator.validateForm(formData)

if (result.valid) {
  console.log('表单验证通过')
} else {
  // 显示字段错误
  Object.entries(result.fieldErrors).forEach(([field, errors]) => {
    console.log(`${field}: ${errors.join(', ')}`)
  })
}
```

## 实际应用示例

### 用户注册验证

```typescript
class UserRegistrationValidator {
  private validator = Validator.create({
    locale: 'zh-CN',
    fieldNameMap: {
      username: '用户名',
      email: '邮箱',
      password: '密码',
      confirmPassword: '确认密码',
      age: '年龄',
      phone: '手机号',
    },
  })

  constructor() {
    this.setupRules()
  }

  private setupRules() {
    // 用户名验证
    this.validator.addRule('username', ValidationRules.required())
    this.validator.addRule('username', ValidationRules.minLength(3))
    this.validator.addRule('username', ValidationRules.maxLength(20))
    this.validator.addRule(
      'username',
      ValidationRules.pattern(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线')
    )

    // 邮箱验证
    this.validator.addRule('email', ValidationRules.required())
    this.validator.addRule('email', ValidationRules.email())
    this.validator.addRule(
      'email',
      ValidationRules.custom(async email => {
        const exists = await this.checkEmailExists(email)
        return exists ? '邮箱已被注册' : true
      })
    )

    // 密码验证
    this.validator.addRule('password', ValidationRules.required())
    this.validator.addRule('password', ValidationRules.minLength(8))
    this.validator.addRule(
      'password',
      ValidationRules.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字')
    )

    // 确认密码
    this.validator.addRule('confirmPassword', ValidationRules.required())
    this.validator.addRule('confirmPassword', (value, data) => {
      return value === data.password ? true : '两次密码输入不一致'
    })

    // 年龄验证
    this.validator.addRule('age', ValidationRules.required())
    this.validator.addRule('age', ValidationRules.integer())
    this.validator.addRule('age', ValidationRules.range(18, 120))

    // 手机号验证
    this.validator.addRule('phone', ValidationRules.required())
    this.validator.addRule('phone', ValidationRules.pattern(/^1[3-9]\d{9}$/, '请输入有效的手机号'))
  }

  async validate(userData: any) {
    return await this.validator.validate(userData)
  }

  private async checkEmailExists(email: string): Promise<boolean> {
    // 模拟检查邮箱是否已存在
    const response = await fetch(`/api/check-email?email=${email}`)
    const result = await response.json()
    return result.exists
  }
}
```

### 动态表单验证

```typescript
class DynamicFormValidator {
  private formValidator = FormValidator.create()
  private schema: any

  setSchema(schema: any) {
    this.schema = schema
    this.buildValidationRules()
  }

  private buildValidationRules() {
    Object.entries(this.schema.fields).forEach(([fieldName, fieldConfig]: [string, any]) => {
      // 必填验证
      if (fieldConfig.required) {
        this.formValidator.addFieldRule(fieldName, ValidationRules.required())
      }

      // 根据字段类型添加验证
      switch (fieldConfig.type) {
        case 'email':
          this.formValidator.addFieldRule(fieldName, ValidationRules.email())
          break
        case 'url':
          this.formValidator.addFieldRule(fieldName, ValidationRules.url())
          break
        case 'number':
          this.formValidator.addFieldRule(fieldName, ValidationRules.integer())
          if (fieldConfig.min !== undefined) {
            this.formValidator.addFieldRule(fieldName, ValidationRules.min(fieldConfig.min))
          }
          if (fieldConfig.max !== undefined) {
            this.formValidator.addFieldRule(fieldName, ValidationRules.max(fieldConfig.max))
          }
          break
        case 'string':
          if (fieldConfig.minLength) {
            this.formValidator.addFieldRule(
              fieldName,
              ValidationRules.minLength(fieldConfig.minLength)
            )
          }
          if (fieldConfig.maxLength) {
            this.formValidator.addFieldRule(
              fieldName,
              ValidationRules.maxLength(fieldConfig.maxLength)
            )
          }
          if (fieldConfig.pattern) {
            this.formValidator.addFieldRule(
              fieldName,
              ValidationRules.pattern(new RegExp(fieldConfig.pattern), fieldConfig.patternMessage)
            )
          }
          break
      }

      // 自定义验证规则
      if (fieldConfig.customValidator) {
        this.formValidator.addFieldRule(
          fieldName,
          ValidationRules.custom(fieldConfig.customValidator)
        )
      }
    })
  }

  async validate(formData: any) {
    return await this.formValidator.validateForm(formData)
  }
}

// 使用示例
const dynamicValidator = new DynamicFormValidator()
dynamicValidator.setSchema({
  fields: {
    name: {
      type: 'string',
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: 'email',
      required: true,
    },
    age: {
      type: 'number',
      required: true,
      min: 18,
      max: 120,
    },
    website: {
      type: 'url',
      required: false,
    },
  },
})
```

## 类型定义

```typescript
interface ValidatorOptions {
  stopOnFirstError?: boolean
  locale?: string
  customMessages?: Record<string, string>
  fieldNameMap?: Record<string, string>
}

interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

interface ValidationError {
  field: string
  message: string
  value: any
}

interface FieldValidationResult {
  valid: boolean
  message?: string
}

interface FormValidationResult {
  valid: boolean
  fieldErrors: Record<string, string[]>
}

type ValidationRule = (value: any, data?: any) => boolean | string | Promise<boolean | string>
```

## 错误处理

```typescript
try {
  const result = await validator.validate(userData)
  if (!result.valid) {
    // 处理验证错误
    result.errors.forEach(error => {
      console.log(`字段 ${error.field} 验证失败: ${error.message}`)
    })
  }
} catch (error) {
  console.error('验证过程中发生错误:', error.message)
}
```

## 最佳实践

1. **规则组合**: 合理组合多个验证规则
2. **错误消息**: 提供清晰、友好的错误消息
3. **异步验证**: 谨慎使用异步验证，避免性能问题
4. **字段映射**: 使用字段名映射提供本地化支持
5. **自定义规则**: 为特殊业务逻辑编写自定义验证规则

## 示例应用

查看 [使用示例](/examples/validation) 了解更多数据验证的实际应用场景。
