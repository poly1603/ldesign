# 验证函数

验证函数模块提供了丰富的数据验证功能，包括常见格式验证、身份信息验证、密码强度检测等。

## 概述

验证函数模块包含以下功能：
- **格式验证**：邮箱、手机号、URL、IP 地址等格式验证
- **身份验证**：身份证号、统一社会信用代码等验证
- **密码验证**：密码强度检测和安全性评估
- **数据类型验证**：数字、日期、文件类型等验证
- **自定义验证**：支持自定义验证规则和错误消息

## 安装和导入

```typescript
// 按需导入
import { 
  isValidEmail, 
  isValidPhone, 
  isValidIdCard, 
  validatePassword 
} from '@ldesign/shared'

// 或者导入整个验证模块
import { validate } from '@ldesign/shared'
```

## API 参考

### isValidEmail

验证邮箱地址格式是否正确。

**函数签名**
```typescript
function isValidEmail(email: string): boolean
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| email | string | ✓ | - | 要验证的邮箱地址 |

**返回值**
- `boolean` - 是否为有效的邮箱格式

**使用示例**

```typescript
// 有效邮箱
console.log(isValidEmail('user@example.com')) // true
console.log(isValidEmail('test.email+tag@domain.co.uk')) // true
console.log(isValidEmail('user123@sub.domain.org')) // true

// 无效邮箱
console.log(isValidEmail('invalid-email')) // false
console.log(isValidEmail('user@')) // false
console.log(isValidEmail('@domain.com')) // false

// 实际应用：表单验证
function validateEmailField(email: string): { valid: boolean; message?: string } {
  if (!email.trim()) {
    return { valid: false, message: '邮箱地址不能为空' }
  }
  
  if (!isValidEmail(email)) {
    return { valid: false, message: '请输入有效的邮箱地址' }
  }
  
  return { valid: true }
}
```

### isValidPhone

验证手机号码格式是否正确。

**函数签名**
```typescript
function isValidPhone(phone: string, region?: 'CN' | 'US' | 'INTL'): boolean
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| phone | string | ✓ | - | 要验证的手机号码 |
| region | 'CN' \| 'US' \| 'INTL' | ✗ | 'CN' | 地区代码 |

**返回值**
- `boolean` - 是否为有效的手机号格式

**使用示例**

```typescript
// 中国大陆手机号
console.log(isValidPhone('13812345678')) // true
console.log(isValidPhone('15987654321')) // true
console.log(isValidPhone('18600000000')) // true

// 无效手机号
console.log(isValidPhone('12345678901')) // false
console.log(isValidPhone('1381234567')) // false

// 美国手机号
console.log(isValidPhone('+1-555-123-4567', 'US')) // true
console.log(isValidPhone('(555) 123-4567', 'US')) // true

// 国际格式
console.log(isValidPhone('+86-138-1234-5678', 'INTL')) // true
console.log(isValidPhone('+1-555-123-4567', 'INTL')) // true
```

### isValidIdCard

验证中国大陆身份证号码是否正确。

**函数签名**
```typescript
function isValidIdCard(idCard: string): boolean
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| idCard | string | ✓ | - | 要验证的身份证号码 |

**返回值**
- `boolean` - 是否为有效的身份证号码

**使用示例**

```typescript
// 有效身份证号（18位）
console.log(isValidIdCard('110101199003077774')) // true
console.log(isValidIdCard('31010519491231002X')) // true

// 无效身份证号
console.log(isValidIdCard('123456789012345678')) // false
console.log(isValidIdCard('11010119900307777')) // false（长度不对）

// 实际应用：用户注册验证
function validateIdCard(idCard: string): { 
  valid: boolean; 
  message?: string; 
  info?: { 
    region: string; 
    birthDate: string; 
    gender: 'male' | 'female' 
  } 
} {
  if (!idCard.trim()) {
    return { valid: false, message: '身份证号不能为空' }
  }
  
  if (!isValidIdCard(idCard)) {
    return { valid: false, message: '请输入有效的身份证号码' }
  }
  
  // 解析身份证信息
  const region = idCard.substring(0, 6)
  const birthDate = `${idCard.substring(6, 10)}-${idCard.substring(10, 12)}-${idCard.substring(12, 14)}`
  const gender = parseInt(idCard.substring(16, 17)) % 2 === 0 ? 'female' : 'male'
  
  return {
    valid: true,
    info: { region, birthDate, gender }
  }
}
```

### validatePassword

验证密码强度并提供详细的安全性评估。

**函数签名**
```typescript
interface PasswordValidationOptions {
  minLength?: number
  maxLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSymbols?: boolean
  forbiddenPatterns?: string[]
}

interface PasswordValidationResult {
  valid: boolean
  score: number
  level: 'weak' | 'medium' | 'strong'
  feedback: string[]
}

function validatePassword(
  password: string, 
  options?: PasswordValidationOptions
): PasswordValidationResult
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| password | string | ✓ | - | 要验证的密码 |
| options | PasswordValidationOptions | ✗ | 默认配置 | 验证选项 |

**返回值**
- `PasswordValidationResult` - 密码验证结果

**使用示例**

```typescript
// 基础密码验证
const result1 = validatePassword('123456')
console.log(result1)
// {
//   valid: false,
//   score: 1,
//   level: 'weak',
//   feedback: ['密码长度至少需要8位', '需要包含大写字母', '需要包含特殊字符']
// }

// 强密码验证
const result2 = validatePassword('MySecure@Password123')
console.log(result2)
// {
//   valid: true,
//   score: 5,
//   level: 'strong',
//   feedback: []
// }

// 自定义验证规则
const customOptions: PasswordValidationOptions = {
  minLength: 12,
  maxLength: 50,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
  forbiddenPatterns: ['password', '123456', 'qwerty']
}

const result3 = validatePassword('MyPassword123!', customOptions)
console.log(result3)

// 实际应用：注册表单密码验证
function createPasswordValidator(options?: PasswordValidationOptions) {
  return (password: string) => {
    const result = validatePassword(password, options)
    
    return {
      ...result,
      suggestions: result.feedback.length > 0 ? [
        '使用大小写字母、数字和特殊字符的组合',
        '避免使用常见的密码模式',
        '密码长度建议在12位以上'
      ] : []
    }
  }
}

const validator = createPasswordValidator()
console.log(validator('weakpass'))
```

### isValidUrl

验证 URL 地址格式是否正确。

**函数签名**
```typescript
function isValidUrl(url: string, options?: { 
  protocols?: string[]; 
  requireProtocol?: boolean 
}): boolean
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| url | string | ✓ | - | 要验证的 URL |
| options | object | ✗ | - | 验证选项 |

**返回值**
- `boolean` - 是否为有效的 URL 格式

**使用示例**

```typescript
// 基础 URL 验证
console.log(isValidUrl('https://www.example.com')) // true
console.log(isValidUrl('http://localhost:3000')) // true
console.log(isValidUrl('ftp://files.example.com')) // true

// 无效 URL
console.log(isValidUrl('not-a-url')) // false
console.log(isValidUrl('www.example.com')) // false（缺少协议）

// 自定义验证选项
console.log(isValidUrl('www.example.com', { requireProtocol: false })) // true
console.log(isValidUrl('ftp://example.com', { protocols: ['http', 'https'] })) // false
```

### isValidIPv4 / isValidIPv6

验证 IP 地址格式是否正确。

**函数签名**
```typescript
function isValidIPv4(ip: string): boolean
function isValidIPv6(ip: string): boolean
```

**使用示例**

```typescript
// IPv4 验证
console.log(isValidIPv4('192.168.1.1')) // true
console.log(isValidIPv4('255.255.255.255')) // true
console.log(isValidIPv4('256.1.1.1')) // false

// IPv6 验证
console.log(isValidIPv6('2001:0db8:85a3:0000:0000:8a2e:0370:7334')) // true
console.log(isValidIPv6('2001:db8:85a3::8a2e:370:7334')) // true
console.log(isValidIPv6('::1')) // true
```

## 注意事项

### 性能考虑
- 复杂的正则表达式验证可能影响性能
- 对于大量数据验证，考虑使用批量验证
- 密码强度检测包含多项检查，适合实时验证

### 安全性
- 验证函数只检查格式，不保证数据的真实性
- 敏感信息验证应结合服务端验证
- 密码强度评估基于常见安全标准

### 国际化
- 手机号验证支持多个地区
- 身份证验证目前仅支持中国大陆
- URL 验证支持国际化域名

## 相关功能

- [字符串处理](/utils/string) - 字符串格式化和转换
- [useAsyncValidator](/hooks/use-async-validator) - 异步验证 Hook
- [useFormValidation](/hooks/use-form-validation) - 表单验证 Hook
