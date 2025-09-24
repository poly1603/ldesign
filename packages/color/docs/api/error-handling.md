# 错误处理 API

@ldesign/color 提供了完善的错误处理机制，包括自定义错误类型、验证函数和安全操作包装器。

## 错误类型

### ColorError

基础颜色错误类，所有颜色相关错误的基类。

```typescript
class ColorError extends Error {
  constructor(message: string, public code?: string)
}
```

**示例：**

```typescript
import { ColorError } from '@ldesign/color'

try {
  // 某些颜色操作
} catch (error) {
  if (error instanceof ColorError) {
    console.log('颜色错误:', error.message)
    console.log('错误代码:', error.code)
  }
}
```

### ValidationError

颜色验证错误，用于颜色格式验证失败的情况。

```typescript
class ValidationError extends ColorError {
  constructor(message: string, public value: string, public expectedFormat: string)
}
```

**示例：**

```typescript
import { ValidationError } from '@ldesign/color'

try {
  validateHexColor('invalid-color')
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('验证失败:', error.message)
    console.log('输入值:', error.value)
    console.log('期望格式:', error.expectedFormat)
  }
}
```

### ConversionError

颜色转换错误，用于颜色格式转换失败的情况。

```typescript
class ConversionError extends ColorError {
  constructor(message: string, public fromFormat: string, public toFormat: string)
}
```

**示例：**

```typescript
import { ConversionError } from '@ldesign/color'

try {
  convertColor('invalid', 'hex', 'rgb')
} catch (error) {
  if (error instanceof ConversionError) {
    console.log('转换失败:', error.message)
    console.log('源格式:', error.fromFormat)
    console.log('目标格式:', error.toFormat)
  }
}
```

## 验证函数

### validateHexColor

验证 HEX 颜色格式。

```typescript
function validateHexColor(color: string): void
```

**参数：**
- `color` - 要验证的颜色字符串

**抛出：**
- `ValidationError` - 当颜色格式无效时

**示例：**

```typescript
import { validateHexColor } from '@ldesign/color'

try {
  validateHexColor('#ff0000') // 通过
  validateHexColor('#invalid') // 抛出 ValidationError
} catch (error) {
  console.error('验证失败:', error.message)
}
```

### validateRgbColor

验证 RGB 颜色格式。

```typescript
function validateRgbColor(color: string): void
```

**参数：**
- `color` - 要验证的颜色字符串

**抛出：**
- `ValidationError` - 当颜色格式无效时

**示例：**

```typescript
import { validateRgbColor } from '@ldesign/color'

try {
  validateRgbColor('rgb(255, 0, 0)') // 通过
  validateRgbColor('rgb(300, 0, 0)') // 抛出 ValidationError
} catch (error) {
  console.error('验证失败:', error.message)
}
```

### validateHslColor

验证 HSL 颜色格式。

```typescript
function validateHslColor(color: string): void
```

**参数：**
- `color` - 要验证的颜色字符串

**抛出：**
- `ValidationError` - 当颜色格式无效时

**示例：**

```typescript
import { validateHslColor } from '@ldesign/color'

try {
  validateHslColor('hsl(0, 100%, 50%)') // 通过
  validateHslColor('hsl(400, 100%, 50%)') // 抛出 ValidationError
} catch (error) {
  console.error('验证失败:', error.message)
}
```

## 安全操作

### safeConvertColor

安全的颜色转换函数，不会抛出异常。

```typescript
function safeConvertColor(
  color: string, 
  fromFormat: string, 
  toFormat: string
): string | null
```

**参数：**
- `color` - 要转换的颜色
- `fromFormat` - 源格式
- `toFormat` - 目标格式

**返回：**
- 转换成功时返回转换后的颜色字符串
- 转换失败时返回 `null`

**示例：**

```typescript
import { safeConvertColor } from '@ldesign/color'

const result = safeConvertColor('#ff0000', 'hex', 'rgb')
if (result) {
  console.log('转换成功:', result) // rgb(255, 0, 0)
} else {
  console.log('转换失败')
}
```

### safeValidateColor

安全的颜色验证函数，返回布尔值而不是抛出异常。

```typescript
function safeValidateColor(color: string, format: string): boolean
```

**参数：**
- `color` - 要验证的颜色
- `format` - 颜色格式

**返回：**
- 验证通过时返回 `true`
- 验证失败时返回 `false`

**示例：**

```typescript
import { safeValidateColor } from '@ldesign/color'

if (safeValidateColor('#ff0000', 'hex')) {
  console.log('有效的 HEX 颜色')
} else {
  console.log('无效的 HEX 颜色')
}
```

## 最佳实践

### 1. 使用类型检查

```typescript
import { ColorError, ValidationError, ConversionError } from '@ldesign/color'

try {
  // 颜色操作
} catch (error) {
  if (error instanceof ValidationError) {
    // 处理验证错误
  } else if (error instanceof ConversionError) {
    // 处理转换错误
  } else if (error instanceof ColorError) {
    // 处理其他颜色错误
  } else {
    // 处理其他错误
  }
}
```

### 2. 优先使用安全函数

```typescript
// 推荐：使用安全函数
const result = safeConvertColor(userInput, 'hex', 'rgb')
if (result) {
  // 使用转换结果
}

// 不推荐：直接使用可能抛出异常的函数
try {
  const result = convertColor(userInput, 'hex', 'rgb')
  // 使用转换结果
} catch (error) {
  // 错误处理
}
```

### 3. 提供用户友好的错误信息

```typescript
import { ValidationError } from '@ldesign/color'

function handleColorInput(color: string) {
  try {
    validateHexColor(color)
    return true
  } catch (error) {
    if (error instanceof ValidationError) {
      showUserError(`请输入有效的颜色格式，例如：#ff0000`)
    }
    return false
  }
}
```
