# API 参考

@ldesign/shared 提供了丰富的工具函数、Vue Hooks 和类型定义，本页面提供完整的 API 参考。

## 概览

### 工具函数 (Utils)

#### 数组操作
- [`unique`](/utils/array#unique) - 数组去重
- [`chunk`](/utils/array#chunk) - 数组分块
- [`groupBy`](/utils/array#groupby) - 数组分组
- [`flatten`](/utils/array#flatten) - 数组扁平化
- [`intersection`](/utils/array#intersection) - 数组交集
- [`union`](/utils/array#union) - 数组并集
- [`difference`](/utils/array#difference) - 数组差集

#### 字符串处理
- [`toCamelCase`](/utils/string#tocamelcase) - 转换为驼峰命名
- [`toKebabCase`](/utils/string#tokebabcase) - 转换为短横线命名
- [`toSnakeCase`](/utils/string#tosnakecase) - 转换为下划线命名
- [`capitalize`](/utils/string#capitalize) - 首字母大写
- [`truncate`](/utils/string#truncate) - 字符串截取
- [`padStart`](/utils/string#padstart) - 字符串前填充
- [`padEnd`](/utils/string#padend) - 字符串后填充

#### 验证函数
- [`isValidEmail`](/utils/validate#isvalidemail) - 邮箱格式验证
- [`isValidPhone`](/utils/validate#isvalidphone) - 手机号验证
- [`isValidIdCard`](/utils/validate#isvalididcard) - 身份证验证
- [`isValidUrl`](/utils/validate#isvalidurl) - URL 格式验证
- [`isValidIPv4`](/utils/validate#isvalidipv4) - IPv4 地址验证
- [`isValidIPv6`](/utils/validate#isvalidipv6) - IPv6 地址验证
- [`validatePassword`](/utils/validate#validatepassword) - 密码强度验证

#### 日期处理
- [`formatDate`](/utils/date#formatdate) - 日期格式化
- [`timeAgo`](/utils/date#timeago) - 相对时间
- [`addTime`](/utils/date#addtime) - 时间计算
- [`dateDiff`](/utils/date#datediff) - 时间差计算
- [`isLeapYear`](/utils/date#isleapyear) - 判断闰年
- [`getDaysInMonth`](/utils/date#getdaysinmonth) - 获取月份天数

#### 通用工具
- [`debounce`](/utils/general#debounce) - 防抖函数
- [`throttle`](/utils/general#throttle) - 节流函数
- [`deepClone`](/utils/general#deepclone) - 深度克隆
- [`deepMerge`](/utils/general#deepmerge) - 深度合并
- [`pick`](/utils/general#pick) - 对象属性选择
- [`omit`](/utils/general#omit) - 对象属性排除
- [`isEmpty`](/utils/general#isempty) - 判断空值

#### 浏览器相关
- [`getDeviceInfo`](/utils/browser#getdeviceinfo) - 获取设备信息
- [`getBrowserInfo`](/utils/browser#getbrowserinfo) - 获取浏览器信息
- [`copyToClipboard`](/utils/browser#copytoclipboard) - 复制到剪贴板
- [`downloadFile`](/utils/browser#downloadfile) - 文件下载
- [`getUrlParams`](/utils/browser#geturlparams) - 获取 URL 参数

#### 格式化
- [`formatFileSize`](/utils/format#formatfilesize) - 文件大小格式化
- [`formatNumber`](/utils/format#formatnumber) - 数字格式化
- [`formatCurrency`](/utils/format#formatcurrency) - 货币格式化
- [`formatPercent`](/utils/format#formatpercent) - 百分比格式化

#### 树结构
- [`buildTree`](/utils/tree#buildtree) - 构建树结构
- [`flattenTree`](/utils/tree#flattentree) - 树结构扁平化
- [`findTreeNode`](/utils/tree#findtreenode) - 查找树节点
- [`filterTree`](/utils/tree#filtertree) - 过滤树节点
- [`mapTree`](/utils/tree#maptree) - 映射树节点

### Vue Hooks

#### 数据管理
- [`useLocalStorage`](/hooks/use-local-storage) - 本地存储
- [`useSessionStorage`](/hooks/use-session-storage) - 会话存储
- [`useAsyncData`](/hooks/use-async-data) - 异步数据管理
- [`useFetch`](/hooks/use-fetch) - 数据获取

#### 表单处理
- [`useForm`](/hooks/use-form) - 表单管理
- [`useFormValidation`](/hooks/use-form-validation) - 表单验证
- [`useAsyncValidator`](/hooks/use-async-validator) - 异步验证器
- [`useVModel`](/hooks/use-v-model) - 双向绑定

#### 用户交互
- [`useClipboard`](/hooks/use-clipboard) - 剪贴板操作
- [`useFullscreen`](/hooks/use-fullscreen) - 全屏控制
- [`useModal`](/hooks/use-modal) - 模态框管理
- [`useToast`](/hooks/use-toast) - 消息提示

#### 性能优化
- [`useDebounce`](/hooks/use-debounce) - 防抖处理
- [`useThrottle`](/hooks/use-throttle) - 节流处理
- [`useLazyLoad`](/hooks/use-lazy-load) - 懒加载
- [`useVirtualList`](/hooks/use-virtual-list) - 虚拟列表

#### 浏览器 API
- [`useNetwork`](/hooks/use-network) - 网络状态
- [`useDarkMode`](/hooks/use-dark-mode) - 暗黑模式
- [`useIntersectionObserver`](/hooks/use-intersection-observer) - 交叉观察器
- [`useResizeObserver`](/hooks/use-resize-observer) - 尺寸观察器
- [`useMutationObserver`](/hooks/use-mutation-observer) - 变更观察器

#### 列表和分页
- [`usePagination`](/hooks/use-pagination) - 分页管理
- [`useInfiniteScroll`](/hooks/use-infinite-scroll) - 无限滚动
- [`useVirtualList`](/hooks/use-virtual-list) - 虚拟列表

#### 事件处理
- [`useListener`](/hooks/use-listener) - 事件监听
- [`useKeyboard`](/hooks/use-keyboard) - 键盘事件
- [`useMouse`](/hooks/use-mouse) - 鼠标事件

### 类型定义

#### 通用类型
```typescript
// 深度可选类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 深度必需类型
type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

// 可为空类型
type Nullable<T> = T | null

// 可选类型
type Optional<T> = T | undefined

// 值或函数类型
type ValueOrFunction<T> = T | (() => T)

// 键值对类型
type KeyValuePair<K = string, V = any> = {
  key: K
  value: V
}
```

#### 函数类型
```typescript
// 防抖函数类型
type DebouncedFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void
  cancel: () => void
  flush: () => void
}

// 节流函数类型
type ThrottledFunction<T extends (...args: any[]) => any> = {
  (...args: Parameters<T>): void
  cancel: () => void
}

// 验证函数类型
type ValidationRule<T = any> = {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: T, formValues?: any) => boolean | string
  message?: string
}
```

#### 组件类型
```typescript
// 树节点类型
interface TreeNode<T = any> {
  id: string | number
  label: string
  children?: TreeNode<T>[]
  data?: T
  [key: string]: any
}

// 分页信息类型
interface PaginationInfo {
  current: number
  pageSize: number
  total: number
  totalPages: number
}

// 网络状态类型
interface NetworkState {
  isOnline: boolean
  type?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
}
```

## 快速查找

### 按功能分类

**数据处理**
- 数组操作：`unique`, `chunk`, `groupBy`, `flatten`
- 对象操作：`deepClone`, `deepMerge`, `pick`, `omit`
- 字符串处理：`toCamelCase`, `toKebabCase`, `capitalize`

**验证和格式化**
- 数据验证：`isValidEmail`, `isValidPhone`, `validatePassword`
- 格式化：`formatDate`, `formatFileSize`, `formatNumber`

**Vue 响应式**
- 存储：`useLocalStorage`, `useSessionStorage`
- 表单：`useForm`, `useAsyncValidator`
- 性能：`useDebounce`, `useThrottle`, `useLazyLoad`

**浏览器 API**
- 设备信息：`getDeviceInfo`, `getBrowserInfo`
- 用户交互：`useClipboard`, `useFullscreen`
- 观察器：`useIntersectionObserver`, `useResizeObserver`

### 按使用场景分类

**表单开发**
- `useForm` - 表单状态管理
- `useAsyncValidator` - 异步验证
- `isValidEmail`, `isValidPhone` - 字段验证
- `useVModel` - 双向绑定

**列表和表格**
- `usePagination` - 分页功能
- `useVirtualList` - 虚拟滚动
- `useInfiniteScroll` - 无限加载
- `groupBy`, `chunk` - 数据处理

**用户体验**
- `useDebounce`, `useThrottle` - 性能优化
- `useToast` - 消息提示
- `useModal` - 弹窗管理
- `useLazyLoad` - 懒加载

**数据管理**
- `useLocalStorage` - 本地存储
- `useAsyncData` - 异步数据
- `useFetch` - 数据获取
- `deepClone`, `deepMerge` - 数据操作

## 版本兼容性

| 功能 | 版本 | 说明 |
|------|------|------|
| 基础工具函数 | 1.0.0+ | 稳定 API |
| Vue 3 Hooks | 1.0.0+ | 需要 Vue 3.0+ |
| TypeScript 支持 | 1.0.0+ | 完整类型定义 |
| SSR 支持 | 1.1.0+ | 服务端渲染兼容 |

## 浏览器支持

- **现代浏览器**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **移动浏览器**: iOS Safari 12+, Chrome Mobile 60+
- **Node.js**: 14.0+ (部分功能)

## 下一步

- 查看 [快速开始](/guide/getting-started) 了解基础用法
- 浏览具体的 [工具函数文档](/utils/array) 和 [Hooks 文档](/hooks/use-async-validator)
- 查看 [GitHub 仓库](https://github.com/ldesign/shared) 获取最新更新
