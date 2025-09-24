# 代码规范指南

## 📝 注释规范

### JSDoc 注释标准

所有公开的函数、类、接口都必须包含完整的 JSDoc 注释。

#### 函数注释模板

````typescript
/**
 * 函数的简短描述（一句话概括功能）
 *
 * 详细描述函数的功能、算法、注意事项等。
 * 可以包含多个段落，解释复杂的逻辑。
 *
 * @param paramName 参数描述，包含类型和约束
 * @param optionalParam 可选参数描述（可选）
 * @returns 返回值描述，说明返回的内容和格式
 * @throws {ErrorType} 可能抛出的错误类型和条件
 *
 * @example
 * ```typescript
 * // 基础用法
 * const result = functionName('input')
 *
 * // 高级用法
 * const advanced = functionName('input', { option: true })
 * ```
 *
 * @see {@link RelatedFunction} 相关函数链接
 * @since 1.0.0
 * @deprecated 如果函数已废弃，说明替代方案
 */
````

#### 类注释模板

````typescript
/**
 * 类的简短描述
 *
 * 详细描述类的职责、使用场景、设计模式等。
 *
 * @example
 * ```typescript
 * const instance = new ClassName(options)
 * instance.method()
 * ```
 *
 * @since 1.0.0
 */
class ClassName {
  /**
   * 构造函数描述
   * @param options 配置选项
   */
  constructor(options: Options) {}

  /**
   * 方法描述
   * @param input 输入参数
   * @returns 返回值
   */
  method(input: string): string {}
}
````

#### 接口注释模板

```typescript
/**
 * 接口描述
 *
 * 详细说明接口的用途和约束。
 *
 * @since 1.0.0
 */
interface InterfaceName {
  /** 属性描述 */
  property: string

  /** 可选属性描述 */
  optional?: number

  /**
   * 方法描述
   * @param param 参数描述
   * @returns 返回值描述
   */
  method(param: string): boolean
}
```

### 注释最佳实践

#### 1. 注释内容要求

- **简洁明了**：避免冗余，直接说明要点
- **准确性**：确保注释与代码同步更新
- **完整性**：包含所有必要的参数、返回值、异常信息
- **示例代码**：复杂函数必须提供使用示例

#### 2. 参数描述规范

```typescript
/**
 * @param color 颜色值 (hex 格式，如 '#ff0000')
 * @param opacity 透明度 (0-1 之间的数值，0 为完全透明，1 为完全不透明)
 * @param options 配置选项（可选）
 * @param options.format 输出格式，支持 'hex' | 'rgb' | 'hsl'
 * @param options.precision 精度，小数点后保留位数（默认 2）
 */
```

#### 3. 返回值描述规范

```typescript
/**
 * @returns 转换后的颜色对象
 * @returns {Object} result 结果对象
 * @returns {string} result.color 转换后的颜色值
 * @returns {number} result.opacity 透明度值
 * @returns {boolean} result.isValid 是否为有效颜色
 */
```

#### 4. 异常描述规范

```typescript
/**
 * @throws {ValidationError} 当输入颜色格式无效时
 * @throws {ConversionError} 当颜色转换失败时
 * @throws {RangeError} 当参数超出有效范围时
 */
```

## 🎨 代码格式规范

### 1. 命名规范

#### 变量和函数

- 使用 camelCase
- 名称要有意义，避免缩写
- 布尔值以 `is`、`has`、`can` 等开头

```typescript
// ✅ 好的命名
const primaryColor = '#1890ff'
const isValidColor = true
const hasAlphaChannel = false

// ❌ 避免的命名
const pc = '#1890ff'
const valid = true
const alpha = false
```

#### 常量

- 使用 SCREAMING_SNAKE_CASE
- 在文件顶部定义

```typescript
const DEFAULT_OPACITY = 1
const MAX_RGB_VALUE = 255
const COLOR_FORMATS = ['hex', 'rgb', 'hsl'] as const
```

#### 类和接口

- 使用 PascalCase
- 接口以 `I` 开头（可选）

```typescript
class ColorConverter {}
interface ColorConfig {}
interface IColorProcessor {} // 可选的 I 前缀
```

#### 类型

- 使用 PascalCase
- 联合类型使用描述性名称

```typescript
type ColorFormat = 'hex' | 'rgb' | 'hsl'
type BlendMode = 'normal' | 'multiply' | 'screen'
```

### 2. 文件组织

#### 导入顺序

1. Node.js 内置模块
2. 第三方库
3. 项目内部模块（按路径深度排序）
4. 类型导入（使用 `type` 关键字）

```typescript
import fs from 'node:fs'
import path from 'node:path'

import chroma from 'chroma-js'
import { generate } from '@arco-design/color'

import { ColorConverter } from '../core/color-converter'
import { validateColor } from './validation'

import type { ColorConfig } from '../types'
import type { RGB, HSL } from './types'
```

#### 导出顺序

1. 类型导出
2. 常量导出
3. 函数导出
4. 类导出
5. 默认导出

```typescript
// 类型导出
export type { ColorConfig, RGB, HSL }

// 常量导出
export { DEFAULT_COLORS, COLOR_FORMATS }

// 函数导出
export { hexToRgb, rgbToHex, validateColor }

// 类导出
export { ColorConverter, ThemeManager }

// 默认导出
export default ColorConverter
```

### 3. 代码结构

#### 函数结构

```typescript
export function processColor(input: string, options: Options = {}): Result {
  // 1. 参数验证
  validateInput(input)

  // 2. 参数处理
  const normalizedInput = normalizeInput(input)
  const config = { ...DEFAULT_OPTIONS, ...options }

  // 3. 主要逻辑
  const processed = performProcessing(normalizedInput, config)

  // 4. 结果处理
  return formatResult(processed)
}
```

#### 类结构

```typescript
export class ColorProcessor {
  // 1. 静态属性
  static readonly DEFAULT_CONFIG = {}

  // 2. 私有属性
  private readonly config: Config
  private cache = new Map()

  // 3. 构造函数
  constructor(config: Config) {
    this.config = config
  }

  // 4. 公共方法
  public process(input: string): Result {}

  // 5. 私有方法
  private validate(input: string): boolean {}
}
```

## 🔍 代码质量检查

### ESLint 规则

项目使用严格的 ESLint 配置，包括：

- TypeScript 严格模式
- 未使用变量检查
- 代码复杂度限制
- 一致的代码风格

### 提交前检查

每次提交前自动运行：

1. ESLint 检查
2. TypeScript 类型检查
3. Prettier 格式化
4. 单元测试

### 代码审查要点

1. **功能正确性**：代码是否实现了预期功能
2. **性能考虑**：是否有性能瓶颈或优化空间
3. **错误处理**：是否有完善的错误处理机制
4. **测试覆盖**：是否有对应的单元测试
5. **文档完整**：是否有完整的注释和文档
6. **向后兼容**：是否破坏了现有 API
