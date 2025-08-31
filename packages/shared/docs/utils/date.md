# 日期处理

日期处理工具函数提供了丰富的日期操作功能，包括格式化、计算、比较等常用操作。

## 概述

日期处理模块包含以下功能：
- **日期格式化**：将日期转换为指定格式的字符串
- **相对时间**：显示相对于当前时间的描述
- **日期计算**：日期的加减运算和差值计算
- **日期验证**：判断日期的有效性和特殊属性
- **时区处理**：时区转换和本地化

## 安装和导入

```typescript
// 按需导入
import { 
  formatDate, 
  timeAgo, 
  addTime, 
  dateDiff,
  isLeapYear 
} from '@ldesign/shared'

// 或者导入整个日期模块
import { date } from '@ldesign/shared'
```

## API 参考

### formatDate

将日期格式化为指定格式的字符串。

**函数签名**
```typescript
function formatDate(
  date: Date | string | number, 
  format: string, 
  options?: {
    locale?: string
    timezone?: string
  }
): string
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| date | Date \| string \| number | ✓ | - | 要格式化的日期 |
| format | string | ✓ | - | 格式化模板 |
| options | object | ✗ | {} | 格式化选项 |

**格式化模板**

| 标记 | 描述 | 示例 |
|------|------|------|
| YYYY | 四位年份 | 2024 |
| YY | 两位年份 | 24 |
| MM | 两位月份 | 01-12 |
| M | 月份 | 1-12 |
| DD | 两位日期 | 01-31 |
| D | 日期 | 1-31 |
| HH | 24小时制小时 | 00-23 |
| H | 24小时制小时 | 0-23 |
| hh | 12小时制小时 | 01-12 |
| h | 12小时制小时 | 1-12 |
| mm | 分钟 | 00-59 |
| m | 分钟 | 0-59 |
| ss | 秒 | 00-59 |
| s | 秒 | 0-59 |
| A | 上午/下午 | AM/PM |
| a | 上午/下午 | am/pm |

**返回值**
- `string` - 格式化后的日期字符串

**使用示例**

```typescript
const now = new Date('2024-03-15 14:30:45')

// 基础格式化
console.log(formatDate(now, 'YYYY-MM-DD')) // '2024-03-15'
console.log(formatDate(now, 'YYYY年MM月DD日')) // '2024年03月15日'
console.log(formatDate(now, 'MM/DD/YYYY')) // '03/15/2024'

// 时间格式化
console.log(formatDate(now, 'HH:mm:ss')) // '14:30:45'
console.log(formatDate(now, 'hh:mm:ss A')) // '02:30:45 PM'
console.log(formatDate(now, 'H:m:s')) // '14:30:45'

// 完整格式
console.log(formatDate(now, 'YYYY-MM-DD HH:mm:ss')) // '2024-03-15 14:30:45'
console.log(formatDate(now, 'YYYY年MM月DD日 HH:mm')) // '2024年03月15日 14:30'

// 使用字符串和时间戳
console.log(formatDate('2024-03-15', 'YYYY年MM月DD日')) // '2024年03月15日'
console.log(formatDate(1710489045000, 'YYYY-MM-DD')) // '2024-03-15'

// 实际应用：文章发布时间
const articles = [
  { title: '文章1', publishTime: new Date('2024-03-15 10:30:00') },
  { title: '文章2', publishTime: new Date('2024-03-14 16:45:00') }
]

articles.forEach(article => {
  const formattedTime = formatDate(article.publishTime, 'YYYY-MM-DD HH:mm')
  console.log(`${article.title} - 发布于 ${formattedTime}`)
})
```

### timeAgo

显示相对于当前时间的描述。

**函数签名**
```typescript
function timeAgo(
  date: Date | string | number,
  options?: {
    locale?: string
    suffix?: boolean
    threshold?: number
  }
): string
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| date | Date \| string \| number | ✓ | - | 目标日期 |
| options | object | ✗ | {} | 选项配置 |

**选项说明**

| 选项 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| locale | string | ✗ | 'zh-CN' | 语言环境 |
| suffix | boolean | ✗ | true | 是否显示后缀 |
| threshold | number | ✗ | 7 | 超过天数显示具体日期 |

**返回值**
- `string` - 相对时间描述

**使用示例**

```typescript
const now = new Date()

// 基础用法
const oneMinuteAgo = new Date(now.getTime() - 60 * 1000)
console.log(timeAgo(oneMinuteAgo)) // '1分钟前'

const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
console.log(timeAgo(oneHourAgo)) // '1小时前'

const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
console.log(timeAgo(oneDayAgo)) // '1天前'

// 未来时间
const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
console.log(timeAgo(oneHourLater)) // '1小时后'

// 自定义选项
console.log(timeAgo(oneMinuteAgo, { suffix: false })) // '1分钟'
console.log(timeAgo(oneDayAgo, { threshold: 3 })) // 超过3天显示具体日期

// 实际应用：评论时间显示
const comments = [
  { content: '很好的文章', createTime: new Date(now.getTime() - 5 * 60 * 1000) },
  { content: '学到了很多', createTime: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
  { content: '感谢分享', createTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) }
]

comments.forEach(comment => {
  console.log(`${comment.content} - ${timeAgo(comment.createTime)}`)
})
// 很好的文章 - 5分钟前
// 学到了很多 - 2小时前
// 感谢分享 - 1天前
```

### addTime

对日期进行加减运算。

**函数签名**
```typescript
type TimeUnit = 'years' | 'months' | 'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds'

function addTime(
  date: Date | string | number,
  amount: number,
  unit: TimeUnit
): Date
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| date | Date \| string \| number | ✓ | - | 基础日期 |
| amount | number | ✓ | - | 增加的数量（负数为减少） |
| unit | TimeUnit | ✓ | - | 时间单位 |

**返回值**
- `Date` - 计算后的新日期对象

**使用示例**

```typescript
const baseDate = new Date('2024-03-15 10:30:00')

// 加法运算
console.log(addTime(baseDate, 1, 'years')) // 2025-03-15 10:30:00
console.log(addTime(baseDate, 3, 'months')) // 2024-06-15 10:30:00
console.log(addTime(baseDate, 7, 'days')) // 2024-03-22 10:30:00
console.log(addTime(baseDate, 2, 'hours')) // 2024-03-15 12:30:00

// 减法运算
console.log(addTime(baseDate, -1, 'years')) // 2023-03-15 10:30:00
console.log(addTime(baseDate, -30, 'minutes')) // 2024-03-15 10:00:00

// 实际应用：计算截止日期
const startDate = new Date()
const deadline = addTime(startDate, 30, 'days')
console.log(`项目截止日期: ${formatDate(deadline, 'YYYY-MM-DD')}`)

// 计算会议提醒时间
const meetingTime = new Date('2024-03-20 14:00:00')
const reminderTime = addTime(meetingTime, -15, 'minutes')
console.log(`会议提醒时间: ${formatDate(reminderTime, 'HH:mm')}`)

// 批量计算工作日
const workDays = []
let currentDate = new Date('2024-03-01')
for (let i = 0; i < 5; i++) {
  workDays.push(new Date(currentDate))
  currentDate = addTime(currentDate, 1, 'days')
}
console.log('工作日列表:', workDays.map(d => formatDate(d, 'MM-DD')))
```

### dateDiff

计算两个日期之间的差值。

**函数签名**
```typescript
function dateDiff(
  date1: Date | string | number,
  date2: Date | string | number,
  unit: TimeUnit
): number
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| date1 | Date \| string \| number | ✓ | - | 第一个日期 |
| date2 | Date \| string \| number | ✓ | - | 第二个日期 |
| unit | TimeUnit | ✓ | - | 计算单位 |

**返回值**
- `number` - 时间差（date1 - date2）

**使用示例**

```typescript
const date1 = new Date('2024-03-20')
const date2 = new Date('2024-03-15')

// 基础计算
console.log(dateDiff(date1, date2, 'days')) // 5
console.log(dateDiff(date1, date2, 'hours')) // 120
console.log(dateDiff(date2, date1, 'days')) // -5

// 实际应用：计算年龄
const birthDate = new Date('1990-05-15')
const today = new Date()
const age = dateDiff(today, birthDate, 'years')
console.log(`年龄: ${age}岁`)

// 计算项目进度
const projectStart = new Date('2024-01-01')
const projectEnd = new Date('2024-06-30')
const currentDate = new Date()

const totalDays = dateDiff(projectEnd, projectStart, 'days')
const passedDays = dateDiff(currentDate, projectStart, 'days')
const progress = (passedDays / totalDays * 100).toFixed(1)

console.log(`项目进度: ${progress}%`)

// 计算工作时长
const workStart = new Date('2024-03-15 09:00:00')
const workEnd = new Date('2024-03-15 18:00:00')
const workHours = dateDiff(workEnd, workStart, 'hours')
console.log(`工作时长: ${workHours}小时`)
```

### isLeapYear

判断是否为闰年。

**函数签名**
```typescript
function isLeapYear(year: number | Date): boolean
```

**参数说明**

| 参数 | 类型 | 必需 | 默认值 | 描述 |
|------|------|------|--------|------|
| year | number \| Date | ✓ | - | 年份或日期对象 |

**返回值**
- `boolean` - 是否为闰年

**使用示例**

```typescript
// 基础用法
console.log(isLeapYear(2024)) // true
console.log(isLeapYear(2023)) // false
console.log(isLeapYear(2000)) // true
console.log(isLeapYear(1900)) // false

// 使用日期对象
console.log(isLeapYear(new Date('2024-03-15'))) // true

// 实际应用：计算二月天数
function getFebruaryDays(year: number): number {
  return isLeapYear(year) ? 29 : 28
}

console.log(`2024年2月有 ${getFebruaryDays(2024)} 天`) // 29天
console.log(`2023年2月有 ${getFebruaryDays(2023)} 天`) // 28天
```

### getDaysInMonth

获取指定月份的天数。

**函数签名**
```typescript
function getDaysInMonth(year: number, month: number): number
function getDaysInMonth(date: Date): number
```

**使用示例**

```typescript
// 基础用法
console.log(getDaysInMonth(2024, 2)) // 29 (闰年2月)
console.log(getDaysInMonth(2023, 2)) // 28 (平年2月)
console.log(getDaysInMonth(2024, 4)) // 30 (4月)

// 使用日期对象
console.log(getDaysInMonth(new Date('2024-02-15'))) // 29

// 实际应用：生成日历
function generateCalendar(year: number, month: number) {
  const daysInMonth = getDaysInMonth(year, month)
  const calendar = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendar.push(new Date(year, month - 1, day))
  }
  
  return calendar
}

const march2024 = generateCalendar(2024, 3)
console.log(`2024年3月有 ${march2024.length} 天`)
```

## 注意事项

### 时区处理
- 默认使用本地时区
- 跨时区应用需要特别注意
- 建议使用 UTC 时间进行计算

### 性能考虑
- 频繁的日期计算可能影响性能
- 考虑缓存计算结果
- 大量日期处理时使用批量操作

### 浏览器兼容性
- 现代浏览器都支持 Date 对象
- 某些格式化功能可能需要 polyfill
- 建议测试目标浏览器的兼容性

## 相关功能

- [格式化](/utils/format) - 数字、货币等格式化工具
- [通用工具](/utils/general) - 其他通用工具函数
- [字符串处理](/utils/string) - 字符串相关工具
