# 增强登录模板示例

本示例展示如何使用增强的登录模板和新增的实用功能。

## 🎯 功能特性

### 1. 表单验证
- ✅ 实时验证
- ✅ 防抖优化
- ✅ 自定义验证规则
- ✅ 错误提示
- ✅ 类型安全

### 2. 登录状态管理
- ✅ 登录/登出
- ✅ 记住密码
- ✅ 失败次数限制
- ✅ 账户锁定
- ✅ 本地存储

### 3. 密码强度检测
- ✅ 实时强度评估
- ✅ 可视化指示器
- ✅ 安全建议
- ✅ 自定义规则

### 4. 平板优化
- ✅ 横屏/竖屏自适应
- ✅ 触摸设备优化
- ✅ 键盘可见性检测
- ✅ 方向变化监听

## 📦 安装

```bash
pnpm add @ldesign/template
```

## 🚀 基础使用

### 1. 导入组件和 Composables

```vue
<script setup lang="ts">
import { useFormValidation, validators, useLoginState } from '@ldesign/template/composables'
import { checkPasswordStrength } from '@ldesign/template/utils'
</script>
```

### 2. 使用表单验证

```vue
<script setup lang="ts">
const {
  values,
  errors,
  touched,
  isValid,
  validateField,
  validateForm,
  setFieldValue,
  setFieldTouched,
  handleSubmit,
} = useFormValidation({
  fields: {
    username: {
      initialValue: '',
      rules: [
        validators.required('请输入用户名'),
        validators.minLength(3, '用户名至少3个字符'),
        validators.maxLength(20, '用户名最多20个字符'),
      ],
    },
    password: {
      initialValue: '',
      rules: [
        validators.required('请输入密码'),
        validators.minLength(6, '密码至少6个字符'),
      ],
    },
  },
  validateOnChange: true,
  debounceDelay: 300,
})
</script>
```

### 3. 使用登录状态管理

```vue
<script setup lang="ts">
const {
  loading,
  error,
  isLocked,
  remainingLockTime,
  rememberedUsername,
  login,
  logout,
  clearError,
} = useLoginState({
  enableRemember: true,
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15分钟
})

// 登录
const handleLogin = async () => {
  try {
    const user = await login({
      username: values.username,
      password: values.password,
      remember: values.remember,
    })
    console.log('登录成功:', user)
  } catch (err) {
    console.error('登录失败:', err)
  }
}
</script>
```

### 4. 使用密码强度检测

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { checkPasswordStrength } from '@ldesign/template/utils'

const password = ref('')
const passwordStrength = ref(null)

watch(password, (newPassword) => {
  if (newPassword) {
    passwordStrength.value = checkPasswordStrength(newPassword, {
      minLength: 8,
      requireLowerCase: true,
      requireUpperCase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    })
  }
})
</script>

<template>
  <div v-if="passwordStrength" class="password-strength">
    <div class="strength-bar">
      <div
        class="strength-fill"
        :style="{
          width: `${passwordStrength.score}%`,
          backgroundColor: passwordStrength.color,
        }"
      ></div>
    </div>
    <div class="strength-label" :style="{ color: passwordStrength.color }">
      {{ passwordStrength.label }}
    </div>
    <ul v-if="passwordStrength.suggestions.length" class="suggestions">
      <li v-for="(suggestion, index) in passwordStrength.suggestions" :key="index">
        {{ suggestion }}
      </li>
    </ul>
  </div>
</template>
```

## 🎨 完整示例

### 平板登录页面

```vue
<script setup lang="ts">
import { ref } from 'vue'
import TabletLoginTemplate from '@ldesign/template/templates/login/tablet/default'
import EnhancedLoginForm from './components/EnhancedLoginForm.vue'

const handleLoginSuccess = (user: any) => {
  console.log('登录成功:', user)
  // 跳转到首页
  router.push('/dashboard')
}

const handleLoginError = (error: Error) => {
  console.error('登录失败:', error)
}

const handleThemeChange = (theme: string) => {
  console.log('主题切换:', theme)
  // 应用主题
}

const handleLanguageChange = (language: string) => {
  console.log('语言切换:', language)
  // 切换语言
}

const handleDarkModeChange = (isDark: boolean) => {
  console.log('暗黑模式:', isDark)
  // 切换暗黑模式
}

const handleOrientationChange = (orientation: 'portrait' | 'landscape') => {
  console.log('屏幕方向:', orientation)
  // 处理方向变化
}
</script>

<template>
  <TabletLoginTemplate
    title="欢迎登录"
    subtitle="在平板上享受更好的体验"
    :primary-color="'#667eea'"
    :secondary-color="'#764ba2'"
    :show-remember="true"
    :show-register="true"
    :show-forgot="true"
    :enable-animations="true"
    @theme-change="handleThemeChange"
    @language-change="handleLanguageChange"
    @dark-mode-change="handleDarkModeChange"
    @orientation-change="handleOrientationChange"
  >
    <!-- 头部插槽 -->
    <template #header>
      <div class="custom-header">
        <img src="/logo.png" alt="Logo" class="logo">
        <h1>我的应用</h1>
      </div>
    </template>

    <!-- 内容插槽 -->
    <template #content>
      <EnhancedLoginForm
        :show-remember="true"
        :show-password-strength="true"
        :auto-focus="true"
        @success="handleLoginSuccess"
        @error="handleLoginError"
      />
    </template>

    <!-- 底部插槽 -->
    <template #footer>
      <div class="custom-footer">
        <a href="/register">立即注册</a>
        <span>|</span>
        <a href="/forgot-password">忘记密码</a>
      </div>
    </template>

    <!-- 语言选择器插槽 -->
    <template #language-selector="{ onLanguageChange }">
      <select @change="onLanguageChange($event.target.value)">
        <option value="zh-CN">中文</option>
        <option value="en-US">English</option>
      </select>
    </template>

    <!-- 主题选择器插槽 -->
    <template #color-selector="{ onThemeChange }">
      <button @click="onThemeChange('light')">浅色</button>
      <button @click="onThemeChange('dark')">深色</button>
    </template>
  </TabletLoginTemplate>
</template>

<style scoped>
.custom-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.custom-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
}

.custom-footer a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.3s ease;
}

.custom-footer a:hover {
  color: #764ba2;
}
</style>
```

## 🔧 高级配置

### 自定义验证规则

```typescript
import { validators } from '@ldesign/template/composables'

// 自定义验证器
const customValidator = validators.custom(
  (value: string) => {
    // 自定义验证逻辑
    return value.includes('@company.com')
  },
  '必须使用公司邮箱'
)

// 异步验证器
const asyncValidator = validators.custom(
  async (value: string) => {
    // 调用API检查用户名是否存在
    const response = await fetch(`/api/check-username?username=${value}`)
    const data = await response.json()
    return !data.exists
  },
  '用户名已存在'
)
```

### 自定义存储

```typescript
import { createStorage } from '@ldesign/template/utils'

// 创建自定义存储实例
const storage = createStorage({
  prefix: 'myapp_',
  defaultTTL: 24 * 60 * 60 * 1000, // 24小时
  defaultEncrypt: true,
  encryptionKey: 'my-secret-key',
  storageType: 'localStorage',
})

// 使用存储
storage.set('user', { id: 1, name: 'John' }, { ttl: 3600000 })
const user = storage.get('user')
```

### 密码生成

```typescript
import { generateStrongPassword } from '@ldesign/template/utils'

// 生成强密码
const password = generateStrongPassword(16)
console.log(password) // 例如: "aB3$xY9@mN2#pQ5!"
```

## 📱 响应式适配

模板会自动检测设备类型和屏幕方向:

- **竖屏模式**: 垂直布局,头部在上,表单在下
- **横屏模式**: 水平布局,头部在左,表单在右
- **触摸设备**: 增大触摸目标,优化触摸反馈
- **键盘可见**: 自动调整布局,隐藏不必要的元素

## 🎯 性能优化

### 1. 防抖验证
表单验证自动防抖,减少不必要的验证调用

### 2. 计算属性合并
合并多个计算属性,减少响应式开销

### 3. GPU 加速
所有动画使用 `transform3d` 启用 GPU 加速

### 4. CSS Containment
使用 `contain` 属性优化渲染性能

### 5. 懒加载
按需加载组件和资源

## 🔗 相关链接

- [表单验证 API](/api/use-form-validation)
- [登录状态管理 API](/api/use-login-state)
- [密码强度检测 API](/api/password-strength)
- [存储工具 API](/api/storage)
- [平板登录模板](/templates/login-tablet)

