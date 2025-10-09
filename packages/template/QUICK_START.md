# 🚀 快速开始指南

## 📦 安装

```bash
# 使用 pnpm (推荐)
pnpm add @ldesign/template

# 使用 npm
npm install @ldesign/template

# 使用 yarn
yarn add @ldesign/template
```

## 🎯 5分钟快速上手

### 1. 创建基础登录页面

```vue
<script setup lang="ts">
import TabletLoginTemplate from '@ldesign/template/templates/login/tablet/default'
import { useFormValidation, validators, useLoginState } from '@ldesign/template/composables'

// 表单验证
const { values, errors, isValid, setFieldValue, handleSubmit } = useFormValidation({
  fields: {
    username: {
      initialValue: '',
      rules: [validators.required('请输入用户名')],
    },
    password: {
      initialValue: '',
      rules: [validators.required('请输入密码')],
    },
  },
})

// 登录状态
const { login, loading, error } = useLoginState()

// 提交处理
const onSubmit = async () => {
  try {
    await login({
      username: values.username,
      password: values.password,
    })
    // 登录成功,跳转到首页
    window.location.href = '/dashboard'
  } catch (err) {
    console.error('登录失败:', err)
  }
}
</script>

<template>
  <TabletLoginTemplate
    title="欢迎登录"
    subtitle="在平板上享受更好的体验"
  >
    <template #content>
      <form @submit.prevent="handleSubmit(onSubmit)">
        <!-- 用户名 -->
        <div>
          <input
            :value="values.username"
            @input="setFieldValue('username', $event.target.value)"
            placeholder="用户名"
          />
          <span v-if="errors.username">{{ errors.username }}</span>
        </div>

        <!-- 密码 -->
        <div>
          <input
            :value="values.password"
            @input="setFieldValue('password', $event.target.value)"
            type="password"
            placeholder="密码"
          />
          <span v-if="errors.password">{{ errors.password }}</span>
        </div>

        <!-- 提交按钮 -->
        <button type="submit" :disabled="!isValid || loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <!-- 错误提示 -->
        <div v-if="error">{{ error }}</div>
      </form>
    </template>
  </TabletLoginTemplate>
</template>
```

### 2. 添加密码强度检测

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { checkPasswordStrength } from '@ldesign/template/utils'

const password = ref('')
const passwordStrength = ref(null)

watch(password, (newPassword) => {
  if (newPassword) {
    passwordStrength.value = checkPasswordStrength(newPassword)
  }
})
</script>

<template>
  <div>
    <input v-model="password" type="password" placeholder="密码" />
    
    <!-- 密码强度指示器 -->
    <div v-if="passwordStrength">
      <div
        class="strength-bar"
        :style="{
          width: `${passwordStrength.score}%`,
          backgroundColor: passwordStrength.color,
        }"
      ></div>
      <span :style="{ color: passwordStrength.color }">
        {{ passwordStrength.label }}
      </span>
    </div>
  </div>
</template>
```

### 3. 使用本地存储

```typescript
import { storage } from '@ldesign/template/utils'

// 保存用户信息
storage.set('user', {
  id: 1,
  name: 'John',
  email: 'john@example.com',
}, {
  ttl: 24 * 60 * 60 * 1000, // 24小时过期
  encrypt: true, // 加密存储
})

// 获取用户信息
const user = storage.get('user')

// 删除用户信息
storage.remove('user')

// 清理所有过期项
storage.cleanExpired()
```

## 🎨 常用场景

### 场景1: 带记住密码的登录

```vue
<script setup lang="ts">
import { useFormValidation, validators, useLoginState } from '@ldesign/template/composables'

const { values, setFieldValue, handleSubmit } = useFormValidation({
  fields: {
    username: { initialValue: '', rules: [validators.required()] },
    password: { initialValue: '', rules: [validators.required()] },
    remember: { initialValue: false, rules: [] },
  },
})

const { login, rememberedUsername } = useLoginState({
  enableRemember: true,
})

// 如果有记住的用户名,自动填充
if (rememberedUsername.value) {
  setFieldValue('username', rememberedUsername.value)
  setFieldValue('remember', true)
}

const onSubmit = async () => {
  await login({
    username: values.username,
    password: values.password,
    remember: values.remember,
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit(onSubmit)">
    <input v-model="values.username" placeholder="用户名" />
    <input v-model="values.password" type="password" placeholder="密码" />
    <label>
      <input v-model="values.remember" type="checkbox" />
      记住我
    </label>
    <button type="submit">登录</button>
  </form>
</template>
```

### 场景2: 带账户锁定的登录

```vue
<script setup lang="ts">
import { useLoginState } from '@ldesign/template/composables'

const {
  login,
  isLocked,
  remainingLockTime,
  error,
} = useLoginState({
  maxAttempts: 5, // 最多尝试5次
  lockoutDuration: 15 * 60 * 1000, // 锁定15分钟
})

const lockoutMessage = computed(() => {
  if (!isLocked.value) return ''
  const minutes = Math.ceil(remainingLockTime.value / 60)
  return `账户已被锁定,请在 ${minutes} 分钟后重试`
})
</script>

<template>
  <div>
    <!-- 锁定提示 -->
    <div v-if="isLocked" class="lock-message">
      {{ lockoutMessage }}
    </div>

    <!-- 错误提示 -->
    <div v-if="error && !isLocked" class="error-message">
      {{ error }}
    </div>

    <!-- 登录表单 -->
    <form @submit.prevent="handleLogin" :disabled="isLocked">
      <!-- ... -->
    </form>
  </div>
</template>
```

### 场景3: 自定义验证规则

```typescript
import { useFormValidation, validators } from '@ldesign/template/composables'

const { values, errors } = useFormValidation({
  fields: {
    email: {
      initialValue: '',
      rules: [
        validators.required('请输入邮箱'),
        validators.email('邮箱格式不正确'),
        // 自定义验证:必须是公司邮箱
        validators.custom(
          (value: string) => value.endsWith('@company.com'),
          '必须使用公司邮箱'
        ),
      ],
    },
    password: {
      initialValue: '',
      rules: [
        validators.required('请输入密码'),
        validators.minLength(8, '密码至少8个字符'),
        validators.password('密码必须包含大小写字母、数字和特殊字符'),
      ],
    },
    confirmPassword: {
      initialValue: '',
      rules: [
        validators.required('请确认密码'),
        // 自定义验证:密码必须匹配
        validators.custom(
          (value: string) => value === values.password,
          '两次密码输入不一致'
        ),
      ],
    },
  },
})
```

### 场景4: 异步验证

```typescript
import { useFormValidation, validators } from '@ldesign/template/composables'

const { values, errors } = useFormValidation({
  fields: {
    username: {
      initialValue: '',
      rules: [
        validators.required('请输入用户名'),
        // 异步验证:检查用户名是否已存在
        validators.custom(
          async (value: string) => {
            const response = await fetch(`/api/check-username?username=${value}`)
            const data = await response.json()
            return !data.exists
          },
          '用户名已存在'
        ),
      ],
    },
  },
  validateOnChange: true,
  debounceDelay: 500, // 防抖500ms
})
```

## 🎯 内置验证器

```typescript
import { validators } from '@ldesign/template/composables'

// 必填
validators.required('此字段为必填项')

// 邮箱
validators.email('请输入有效的邮箱地址')

// 最小长度
validators.minLength(6, '最少需要6个字符')

// 最大长度
validators.maxLength(20, '最多允许20个字符')

// 密码强度
validators.password('密码必须包含大小写字母、数字和特殊字符')

// 手机号
validators.phone('请输入有效的手机号码')

// 数字
validators.number('请输入有效的数字')

// 范围
validators.range(1, 100, '值必须在1到100之间')

// 正则
validators.pattern(/^[a-zA-Z0-9]+$/, '只能包含字母和数字')

// 自定义
validators.custom(
  (value) => value.length > 0,
  '自定义验证失败'
)
```

## 🔧 配置选项

### 表单验证配置

```typescript
useFormValidation({
  fields: {
    // 字段配置
  },
  validateOnChange: true, // 值改变时验证
  debounceDelay: 300, // 防抖延迟(ms)
})
```

### 登录状态配置

```typescript
useLoginState({
  enableRemember: true, // 启用记住密码
  enableCaptcha: false, // 启用验证码
  enableBiometric: false, // 启用生物识别
  maxAttempts: 5, // 最大尝试次数
  lockoutDuration: 15 * 60 * 1000, // 锁定时间(ms)
  autoLogin: false, // 自动登录
  storageKey: 'ldesign_login_state', // 存储键名
})
```

### 密码强度配置

```typescript
checkPasswordStrength(password, {
  minLength: 8, // 最小长度
  maxLength: 128, // 最大长度
  requireLowerCase: true, // 需要小写字母
  requireUpperCase: true, // 需要大写字母
  requireNumbers: true, // 需要数字
  requireSpecialChars: true, // 需要特殊字符
  forbidSequential: false, // 禁止连续字符
  forbidRepeated: false, // 禁止重复字符
})
```

### 存储配置

```typescript
import { createStorage } from '@ldesign/template/utils'

const storage = createStorage({
  prefix: 'myapp_', // 键名前缀
  defaultTTL: 24 * 60 * 60 * 1000, // 默认过期时间
  defaultEncrypt: false, // 默认是否加密
  encryptionKey: 'my-secret-key', // 加密密钥
  storageType: 'localStorage', // 存储类型
})
```

## 📚 更多资源

- [完整文档](/docs/README.md)
- [API 参考](/docs/api/README.md)
- [示例代码](/docs/examples/README.md)
- [最佳实践](/docs/guide/best-practices.md)

## 🤝 获取帮助

- [GitHub Issues](https://github.com/ldesign-org/template/issues)
- [讨论区](https://github.com/ldesign-org/template/discussions)
- [更新日志](/CHANGELOG.md)

## 📄 许可证

MIT License

