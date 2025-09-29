# TypeScript 工具库示例

这是一个使用 `@ldesign/builder` 构建的 TypeScript 工具库示例，展示了如何创建、配置和打包一个完整的 TypeScript 工具库。

## 📦 功能特性

- 🧮 **数学工具** - 基础数学运算、统计计算、数学常量
- 🔤 **字符串工具** - 格式化、验证、转换等字符串处理功能
- 📅 **日期工具** - 日期格式化、相对时间、日期计算等功能
- 📝 **完整类型定义** - 提供完整的 TypeScript 类型支持
- 📦 **多格式输出** - 支持 ESM、CJS、UMD 三种格式
- 🌳 **按需引入** - 支持模块级别的按需引入

## 🚀 安装

```bash
# 使用 npm
npm install @ldesign/typescript-utils-example

# 使用 pnpm
pnpm add @ldesign/typescript-utils-example

# 使用 yarn
yarn add @ldesign/typescript-utils-example
```

## 📖 使用方法

### 完整引入

```typescript
import * as utils from '@ldesign/typescript-utils-example'

// 使用数学工具
const sum = utils.math.add(1, 2) // 3
const avg = utils.math.average([1, 2, 3, 4, 5]) // 3

// 使用字符串工具
const camelCase = utils.string.toCamelCase('hello-world') // 'helloWorld'
const isEmail = utils.string.isValidEmail('test@example.com') // true

// 使用日期工具
const formatted = utils.date.formatDate(new Date(), 'YYYY-MM-DD') // '2023-12-25'
const relative = utils.date.getRelativeTime(new Date(Date.now() - 60000)) // '1分钟前'
```

### 按模块引入

```typescript
// 只引入数学工具
import * as math from '@ldesign/typescript-utils-example/math'
const result = math.add(1, 2)

// 只引入字符串工具
import * as string from '@ldesign/typescript-utils-example/string'
const formatted = string.toCamelCase('hello-world')

// 只引入日期工具
import * as date from '@ldesign/typescript-utils-example/date'
const formatted = date.formatDate(new Date(), 'YYYY-MM-DD')
```

### 按需引入

```typescript
// 只引入需要的函数
import { add, multiply } from '@ldesign/typescript-utils-example/math'
import { toCamelCase, isValidEmail } from '@ldesign/typescript-utils-example/string'
import { formatDate, getRelativeTime } from '@ldesign/typescript-utils-example/date'

const sum = add(1, 2)
const camelCase = toCamelCase('hello-world')
const formatted = formatDate(new Date(), 'YYYY-MM-DD')
```

## 📚 API 文档

### 数学工具 (math)

#### 基础运算
- `add(a, b)` - 加法运算
- `subtract(a, b)` - 减法运算
- `multiply(a, b)` - 乘法运算
- `divide(a, b)` - 除法运算
- `modulo(a, b)` - 求余运算
- `power(base, exponent)` - 幂运算
- `sqrt(value)` - 平方根

#### 高级运算
- `average(numbers)` - 计算平均值
- `median(numbers)` - 计算中位数
- `max(numbers)` - 获取最大值
- `min(numbers)` - 获取最小值
- `standardDeviation(numbers)` - 计算标准差
- `factorial(n)` - 计算阶乘
- `fibonacci(n)` - 计算斐波那契数

#### 数学常量
- `MATH_CONSTANTS` - 包含 PI、E 等数学常量

### 字符串工具 (string)

#### 格式化
- `toCamelCase(str)` - 转换为驼峰命名
- `toPascalCase(str)` - 转换为帕斯卡命名
- `toKebabCase(str)` - 转换为短横线命名
- `toSnakeCase(str)` - 转换为下划线命名
- `capitalize(str)` - 首字母大写
- `capitalizeWords(str)` - 每个单词首字母大写
- `truncate(str, maxLength, suffix)` - 截断字符串
- `trim(str)` - 去除空白字符
- `pad(str, targetLength, padString, padStart)` - 填充字符串

#### 验证
- `isValidEmail(email)` - 验证邮箱地址
- `isValidUrl(url)` - 验证URL
- `isValidPhone(phone)` - 验证手机号码
- `isValidIdCard(idCard)` - 验证身份证号码
- `validatePassword(password, options)` - 验证密码强度
- `isNumeric(str)` - 检查是否为数字
- `isAlpha(str)` - 检查是否为字母
- `isAlphanumeric(str)` - 检查是否为字母数字

### 日期工具 (date)

#### 格式化
- `formatDate(date, format)` - 格式化日期
- `getRelativeTime(date, baseDate)` - 获取相对时间

#### 判断
- `isToday(date)` - 是否为今天
- `isYesterday(date)` - 是否为昨天
- `isThisWeek(date)` - 是否为本周
- `isLeapYear(year)` - 是否为闰年

#### 计算
- `getDaysInMonth(year, month)` - 获取月份天数
- `getDateRange(startDate, endDate)` - 获取日期范围
- `addDays(date, days)` - 添加天数
- `addMonths(date, months)` - 添加月数

#### 常量
- `DATE_FORMATS` - 常用日期格式
- `WEEKDAYS` - 星期常量
- `MONTHS` - 月份常量

## 🔧 开发

### 构建

```bash
# 构建所有格式
npm run build

# 监听模式构建
npm run dev

# 清理构建产物
npm run clean
```

### 测试

```bash
# 运行测试
npm test

# 运行测试（单次）
npm run test:run
```

## 📁 项目结构

```
typescript-utils/
├── src/                    # 源代码目录
│   ├── math/              # 数学工具模块
│   │   ├── basic.ts       # 基础数学运算
│   │   ├── advanced.ts    # 高级数学运算
│   │   └── index.ts       # 模块导出
│   ├── string/            # 字符串工具模块
│   │   ├── format.ts      # 格式化工具
│   │   ├── validate.ts    # 验证工具
│   │   └── index.ts       # 模块导出
│   ├── date/              # 日期工具模块
│   │   ├── format.ts      # 日期格式化
│   │   └── index.ts       # 模块导出
│   └── index.ts           # 主入口文件
├── .ldesign/              # 构建配置
│   └── builder.config.ts  # @ldesign/builder 配置
├── dist/                  # 构建输出目录
│   ├── esm/              # ES 模块格式
│   ├── cjs/              # CommonJS 格式
│   ├── umd/              # UMD 格式
│   └── types/            # TypeScript 类型声明
├── package.json           # 项目配置
└── README.md             # 项目文档
```

## 🛠️ 构建配置

本项目使用 `@ldesign/builder` 进行构建，配置文件位于 `.ldesign/builder.config.ts`：

```typescript
import { defineConfig } from '@ldesign/builder'

export default defineConfig({
  output: {
    format: ['esm', 'cjs', 'umd'],
    sourcemap: true,
    name: 'TypeScriptUtils'
  },
  libraryType: 'typescript',
  bundler: 'rollup',
  dts: true,
  clean: true
})
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系我们

- 官网：https://ldesign.dev
- GitHub：https://github.com/ldesign/ldesign
