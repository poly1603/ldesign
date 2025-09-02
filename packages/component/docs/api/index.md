# API 参考

LDesign 提供了丰富的 API 来满足各种使用场景。本文档详细介绍了所有可用的 API。

## 全局 API

### defineCustomElements

注册所有 LDesign 组件。

```typescript
import { defineCustomElements } from '@ldesign/components/loader';

defineCustomElements(window, {
  // 配置选项
  resourcesUrl: '/build/', // 资源路径
  syncQueue: true, // 同步队列
  raf: requestAnimationFrame, // 动画帧函数
  ael: addEventListener, // 事件监听器
  rel: removeEventListener, // 事件移除器
});
```

**参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `win` | `Window` | `window` | 窗口对象 |
| `opts` | `LoadComponentsOptions` | `{}` | 配置选项 |

**返回值**

`Promise<void>` - 组件注册完成的 Promise

### 单独组件注册

```typescript
import { defineCustomElement as defineButton } from '@ldesign/components/dist/components/ld-button';
import { defineCustomElement as defineInput } from '@ldesign/components/dist/components/ld-input';

// 注册单个组件
defineButton();
defineInput();
```

## 主题 API

### setTheme

设置全局主题。

```typescript
import { setTheme } from '@ldesign/components/dist/utils/theme';

setTheme({
  primaryColor: '#1976d2',
  successColor: '#4caf50',
  warningColor: '#ff9800',
  errorColor: '#f44336',
  fontSize: '14px',
  borderRadius: '4px',
});
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `theme` | `ThemeConfig` | 主题配置对象 |

**ThemeConfig 接口**

```typescript
interface ThemeConfig {
  primaryColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  fontSize?: string;
  fontFamily?: string;
  borderRadius?: string;
  boxShadow?: string;
  [key: string]: any;
}
```

### getTheme

获取当前主题配置。

```typescript
import { getTheme } from '@ldesign/components/dist/utils/theme';

const currentTheme = getTheme();
console.log(currentTheme.primaryColor); // '#1976d2'
```

**返回值**

`ThemeConfig` - 当前主题配置

### toggleDarkMode

切换暗色模式。

```typescript
import { toggleDarkMode, isDarkMode } from '@ldesign/components/dist/utils/theme';

// 切换暗色模式
toggleDarkMode();

// 检查是否为暗色模式
const isDark = isDarkMode(); // boolean
```

## 国际化 API

### setLocale

设置当前语言。

```typescript
import { setLocale } from '@ldesign/components/dist/utils/i18n';

setLocale('zh-CN'); // 设置为中文
setLocale('en-US'); // 设置为英文
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `locale` | `string` | 语言代码 |

### getLocale

获取当前语言。

```typescript
import { getLocale } from '@ldesign/components/dist/utils/i18n';

const currentLocale = getLocale(); // 'zh-CN'
```

**返回值**

`string` - 当前语言代码

### t

获取翻译文本。

```typescript
import { t } from '@ldesign/components/dist/utils/i18n';

// 简单翻译
const text = t('common.confirm'); // '确定'

// 带参数的翻译
const textWithParams = t('common.total', { total: 100 }); // '共 100 条'
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `key` | `string` | 翻译键 |
| `params` | `object` | 翻译参数 |

**返回值**

`string` - 翻译后的文本

### addLocale

添加新的语言包。

```typescript
import { addLocale } from '@ldesign/components/dist/utils/i18n';

addLocale('fr-FR', {
  common: {
    confirm: 'Confirmer',
    cancel: 'Annuler',
    // ...
  },
  // ...
});
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `locale` | `string` | 语言代码 |
| `messages` | `LocaleMessages` | 语言包对象 |

## 工具 API

### formatDate

格式化日期。

```typescript
import { formatDate } from '@ldesign/components/dist/utils/format';

const date = new Date();
const formatted = formatDate(date, 'YYYY-MM-DD'); // '2024-01-15'
```

**参数**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `date` | `Date` | - | 日期对象 |
| `format` | `string` | `'YYYY-MM-DD'` | 格式字符串 |

**返回值**

`string` - 格式化后的日期字符串

### debounce

防抖函数。

```typescript
import { debounce } from '@ldesign/components/dist/utils/debounce';

const debouncedFn = debounce((value: string) => {
  console.log('搜索:', value);
}, 300);

// 使用
debouncedFn('关键词');
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `fn` | `Function` | 要防抖的函数 |
| `delay` | `number` | 延迟时间（毫秒） |

**返回值**

`Function` - 防抖后的函数

### throttle

节流函数。

```typescript
import { throttle } from '@ldesign/components/dist/utils/throttle';

const throttledFn = throttle((event: Event) => {
  console.log('滚动事件');
}, 100);

// 使用
window.addEventListener('scroll', throttledFn);
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `fn` | `Function` | 要节流的函数 |
| `delay` | `number` | 间隔时间（毫秒） |

**返回值**

`Function` - 节流后的函数

## 验证 API

### createValidator

创建表单验证器。

```typescript
import { createValidator } from '@ldesign/components/dist/utils/validator';

const validator = createValidator({
  username: [
    { required: true, message: '用户名不能为空' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符' },
  ],
  email: [
    { required: true, message: '邮箱不能为空' },
    { type: 'email', message: '邮箱格式不正确' },
  ],
});

// 验证
const result = await validator.validate({
  username: 'test',
  email: 'test@example.com',
});

console.log(result.valid); // true
console.log(result.errors); // {}
```

**参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `rules` | `ValidationRules` | 验证规则对象 |

**返回值**

`Validator` - 验证器实例

### 内置验证规则

```typescript
import { 
  required, 
  email, 
  url, 
  number, 
  integer,
  min,
  max,
  pattern 
} from '@ldesign/components/dist/utils/validators';

// 使用内置验证器
const rules = {
  email: [required(), email()],
  age: [required(), number(), min(18), max(100)],
  website: [url()],
  phone: [pattern(/^1[3-9]\d{9}$/, '手机号格式不正确')],
};
```

## 事件 API

### EventBus

全局事件总线。

```typescript
import { EventBus } from '@ldesign/components/dist/utils/event-bus';

// 监听事件
EventBus.on('user-login', (user) => {
  console.log('用户登录:', user);
});

// 触发事件
EventBus.emit('user-login', { id: 1, name: 'John' });

// 移除监听
EventBus.off('user-login');

// 一次性监听
EventBus.once('app-ready', () => {
  console.log('应用就绪');
});
```

**方法**

| 方法 | 参数 | 说明 |
|------|------|------|
| `on(event, handler)` | `string, Function` | 监听事件 |
| `off(event, handler?)` | `string, Function?` | 移除监听 |
| `emit(event, ...args)` | `string, ...any` | 触发事件 |
| `once(event, handler)` | `string, Function` | 一次性监听 |

## 性能 API

### PerformanceMonitor

性能监控工具。

```typescript
import { PerformanceMonitor } from '@ldesign/components/dist/utils/performance';

const monitor = PerformanceMonitor.getInstance();

// 开始计时
monitor.startTiming('component-render');

// 结束计时
monitor.endTiming('component-render');

// 测量函数执行时间
const measureFn = monitor.measureFunction('api-call', async () => {
  const response = await fetch('/api/data');
  return response.json();
});

// 获取性能报告
const report = monitor.getPerformanceReport();
console.log(report);
```

## 类型定义

### 组件属性类型

```typescript
// 按钮类型
type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link';
type ButtonSize = 'small' | 'medium' | 'large';

// 输入框类型
type InputType = 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search';
type InputSize = 'small' | 'medium' | 'large';

// 表单布局
type FormLayout = 'horizontal' | 'vertical' | 'inline';
type LabelAlign = 'left' | 'right' | 'top';

// 验证状态
type ValidateStatus = 'validating' | 'success' | 'error';

// 模态框动画
type ModalAnimation = 'zoom' | 'slide-up' | 'slide-down' | 'fade';

// 提示框位置
type TooltipPlacement = 
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end';
```

### 事件类型

```typescript
// 自定义事件接口
interface LDesignCustomEvent<T = any> extends CustomEvent<T> {
  detail: T;
}

// 按钮事件
interface ButtonClickEvent extends LDesignCustomEvent<MouseEvent> {}

// 输入框事件
interface InputChangeEvent extends LDesignCustomEvent<string> {}
interface InputFocusEvent extends LDesignCustomEvent<FocusEvent> {}
interface InputBlurEvent extends LDesignCustomEvent<FocusEvent> {}

// 表单事件
interface FormSubmitEvent extends LDesignCustomEvent<FormData> {}
interface FormResetEvent extends LDesignCustomEvent<void> {}
interface FormValidateEvent extends LDesignCustomEvent<{
  prop: string;
  valid: boolean;
  message: string;
}> {}
```

## 错误处理

### 错误类型

```typescript
// LDesign 错误基类
class LDesignError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'LDesignError';
  }
}

// 组件错误
class ComponentError extends LDesignError {
  constructor(componentName: string, message: string) {
    super(`[${componentName}] ${message}`, 'COMPONENT_ERROR');
    this.name = 'ComponentError';
  }
}

// 验证错误
class ValidationError extends LDesignError {
  constructor(field: string, message: string) {
    super(`Validation failed for field "${field}": ${message}`, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
```

### 错误处理器

```typescript
import { setErrorHandler } from '@ldesign/components/dist/utils/error-handler';

// 设置全局错误处理器
setErrorHandler((error: Error, componentName?: string) => {
  console.error('LDesign Error:', error);
  
  // 上报错误到监控系统
  // analytics.reportError(error, { component: componentName });
});
```

## 版本信息

### 获取版本

```typescript
import { version } from '@ldesign/components';

console.log('LDesign version:', version); // '1.0.0'
```

### 兼容性检查

```typescript
import { checkCompatibility } from '@ldesign/components/dist/utils/compatibility';

const isCompatible = checkCompatibility();
if (!isCompatible) {
  console.warn('当前浏览器可能不完全支持 LDesign 组件库');
}
```

这些 API 为 LDesign 组件库提供了完整的功能支持，涵盖了组件注册、主题定制、国际化、工具函数、验证、事件处理、性能监控等各个方面。通过合理使用这些 API，你可以构建出功能强大、用户体验优秀的应用程序。
