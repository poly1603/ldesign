# LoginPanel 组件

现代化的登录面板组件，支持双登录模式、主题切换和优雅的交互动画。

## 功能特性

### 🔐 双登录模式

- **用户名登录**：用户名 + 密码 + 图片验证码
- **手机号登录**：手机号 + 图片验证码 + 短信验证码

### 🎨 主题系统

- **亮色/暗色模式**：支持明暗主题切换
- **毛玻璃效果**：现代化的视觉效果
- **CSS 变量系统**：便于自定义主题

### ✨ 交互动画

- **流畅的 Tab 切换**：带指示器的平滑过渡
- **表单验证反馈**：实时错误提示
- **加载状态动画**：优雅的加载效果

### 📱 响应式设计

- **移动端适配**：完美支持各种屏幕尺寸
- **触摸友好**：优化的移动端交互体验

## 快速开始

### 基础用法

```tsx
import { LoginPanel } from '@/components/LoginPanel'

export default defineComponent({
  setup() {
    const handleLogin = event => {
      console.log('登录数据:', event)
      // 处理登录逻辑
    }

    return () => <LoginPanel title='欢迎登录' subtitle='请输入您的账号信息' onLogin={handleLogin} />
  },
})
```

### 自定义主题

```tsx
<LoginPanel
  title='登录系统'
  theme={{
    mode: 'dark',
    effect: 'glass',
    colors: {
      primary: '#6366f1',
      background: '#1f2937',
    },
  }}
  onLogin={handleLogin}
/>
```

### 配置第三方登录

```tsx
<LoginPanel
  title='登录'
  thirdPartyLogin={{
    enabled: true,
    providers: [
      { name: 'wechat', icon: '🔗', color: '#07c160' },
      { name: 'qq', icon: '🔗', color: '#12b7f5' },
    ],
  }}
  onLogin={handleLogin}
  onThirdPartyLogin={provider => {
    console.log('第三方登录:', provider)
  }}
/>
```

## API 文档

### Props

| 属性                 | 类型                    | 默认值       | 说明                   |
| -------------------- | ----------------------- | ------------ | ---------------------- |
| `title`              | `string`                | `'用户登录'` | 登录面板标题           |
| `subtitle`           | `string`                | `'欢迎回来'` | 登录面板副标题         |
| `logo`               | `string`                | -            | Logo 图片 URL          |
| `defaultMode`        | `'username' \| 'phone'` | `'username'` | 默认登录模式           |
| `showRememberMe`     | `boolean`               | `true`       | 是否显示"记住我"选项   |
| `showForgotPassword` | `boolean`               | `true`       | 是否显示"忘记密码"链接 |
| `showRegisterLink`   | `boolean`               | `true`       | 是否显示注册链接       |
| `thirdPartyLogin`    | `ThirdPartyLoginConfig` | -            | 第三方登录配置         |
| `theme`              | `Partial<ThemeConfig>`  | -            | 主题配置               |
| `loading`            | `boolean`               | `false`      | 加载状态               |
| `disabled`           | `boolean`               | `false`      | 禁用状态               |
| `className`          | `string`                | -            | 自定义样式类名         |
| `style`              | `object`                | -            | 自定义样式             |

### Events

| 事件名              | 参数               | 说明               |
| ------------------- | ------------------ | ------------------ |
| `login`             | `LoginEvent`       | 登录事件           |
| `register`          | -                  | 注册事件           |
| `forgot-password`   | -                  | 忘记密码事件       |
| `third-party-login` | `string`           | 第三方登录事件     |
| `mode-change`       | `ModeChangeEvent`  | 登录模式切换事件   |
| `theme-change`      | `ThemeChangeEvent` | 主题切换事件       |
| `captcha-refresh`   | -                  | 验证码刷新事件     |
| `sms-send`          | `string`           | 短信验证码发送事件 |

### 类型定义

```typescript
// 登录模式
type LoginMode = 'username' | 'phone'

// 主题模式
type ThemeMode = 'light' | 'dark'

// 主题效果
type ThemeEffect = 'normal' | 'glass'

// 用户名登录数据
interface UsernameLoginData {
  username: string
  password: string
  captcha: string
  rememberMe: boolean
}

// 手机号登录数据
interface PhoneLoginData {
  phone: string
  captcha: string
  smsCode: string
}

// 登录事件
interface LoginEvent {
  mode: LoginMode
  data: UsernameLoginData | PhoneLoginData
}

// 第三方登录配置
interface ThirdPartyLoginConfig {
  enabled: boolean
  providers: Array<{
    name: string
    icon: string
    color: string
  }>
}

// 主题配置
interface ThemeConfig {
  mode: ThemeMode
  effect: ThemeEffect
  colors: ThemeColors
  borderRadius: string
  boxShadow: string
  glassEffect?: {
    backdrop: string
    opacity: number
  }
}
```

## 样式自定义

### CSS 变量

组件使用 CSS 变量系统，可以通过覆盖变量来自定义样式：

```css
.login-panel {
  /* 颜色变量 */
  --lp-primary: #6366f1;
  --lp-secondary: #8b5cf6;
  --lp-success: #10b981;
  --lp-warning: #f59e0b;
  --lp-error: #ef4444;
  --lp-background: #ffffff;
  --lp-surface: #f8fafc;
  --lp-text: #1f2937;
  --lp-text-secondary: #6b7280;
  --lp-border: #e5e7eb;

  /* 尺寸变量 */
  --lp-border-radius: 12px;
  --lp-border-radius-sm: 8px;
  --lp-border-radius-lg: 16px;

  /* 间距变量 */
  --lp-spacing-xs: 4px;
  --lp-spacing-sm: 8px;
  --lp-spacing-md: 16px;
  --lp-spacing-lg: 24px;
  --lp-spacing-xl: 32px;

  /* 阴影变量 */
  --lp-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --lp-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --lp-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --lp-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

  /* 过渡变量 */
  --lp-transition-fast: 150ms ease-in-out;
  --lp-transition-normal: 250ms ease-in-out;
  --lp-transition-slow: 350ms ease-in-out;
}
```

### 主题切换

```typescript
// 切换到暗色模式
const switchToDark = () => {
  const panel = document.querySelector('.login-panel')
  panel?.setAttribute('data-theme', 'dark')
}

// 启用毛玻璃效果
const enableGlassEffect = () => {
  const panel = document.querySelector('.login-panel')
  panel?.setAttribute('data-effect', 'glass')
}
```

## 最佳实践

### 1. 表单验证

组件内置了基础的表单验证，但建议在业务层面添加更严格的验证：

```typescript
const handleLogin = (event: LoginEvent) => {
  const { mode, data } = event

  if (mode === 'username') {
    const { username, password } = data as UsernameLoginData

    // 自定义验证逻辑
    if (username.length < 3) {
      message.error('用户名长度不能少于3个字符')
      return
    }

    if (password.length < 8) {
      message.error('密码长度不能少于8个字符')
      return
    }
  }

  // 执行登录逻辑
  login(data)
}
```

### 2. 错误处理

```typescript
const handleLogin = async (event: LoginEvent) => {
  try {
    setLoading(true)
    await login(event.data)
    message.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    message.error(error.message || '登录失败')
  } finally {
    setLoading(false)
  }
}
```

### 3. 主题持久化

```typescript
import { ref, watch } from 'vue'

const theme = ref({
  mode: localStorage.getItem('theme-mode') || 'light',
  effect: localStorage.getItem('theme-effect') || 'normal',
})

watch(
  theme,
  newTheme => {
    localStorage.setItem('theme-mode', newTheme.mode)
    localStorage.setItem('theme-effect', newTheme.effect)
  },
  { deep: true }
)
```

## 注意事项

1. **验证码功能**：当前使用模拟实现，生产环境需要接入真实的验证码服务
2. **短信验证码**：需要配置短信服务提供商的 API
3. **第三方登录**：需要配置对应平台的 OAuth 应用
4. **安全性**：密码等敏感信息应该在传输前进行加密
5. **无障碍访问**：组件已包含基础的无障碍支持，但可能需要根据具体需求进行调整

## 更新日志

### v1.0.0

- 初始版本发布
- 支持双登录模式
- 支持主题切换
- 支持响应式设计
- 包含完整的 TypeScript 类型定义
