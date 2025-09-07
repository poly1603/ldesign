# 交互式示例

本页面包含可以直接运行的代码示例，展示 basic-typescript 库的各种功能。

<script setup>
import { ref, onMounted } from 'vue'

// 动态导入构建产物
let lib = null
const output = ref('')
const isLoaded = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    // 使用构建后的产物
    lib = await import('../es/index.js')
    isLoaded.value = true
  } catch (err) {
    error.value = `加载库失败: ${err.message}`
    console.error('Failed to load library:', err)
  }
})

// 示例函数
const runExample1 = () => {
  if (!lib) return
  
  try {
    const user = lib.createUser('张三', 'zhangsan@example.com', 25)
    output.value = `创建用户成功:\n${JSON.stringify(user, null, 2)}`
  } catch (err) {
    output.value = `错误: ${err.message}`
  }
}

const runExample2 = () => {
  if (!lib) return
  
  try {
    const emails = [
      'valid@example.com',
      'invalid-email',
      'user@domain.co.uk',
      '@invalid.com'
    ]
    
    const results = emails.map(email => ({
      email,
      isValid: lib.validateEmail(email)
    }))
    
    output.value = `邮箱验证结果:\n${JSON.stringify(results, null, 2)}`
  } catch (err) {
    output.value = `错误: ${err.message}`
  }
}

const runExample3 = () => {
  if (!lib) return
  
  try {
    const user1 = lib.createUser('李四', 'lisi@example.com', 30)
    const user2 = lib.createUser('王五', 'wangwu@example.com')
    
    const formatted1 = lib.formatUser(user1)
    const formatted2 = lib.formatUser(user2)
    
    output.value = `格式化用户信息:\n用户1: ${formatted1}\n用户2: ${formatted2}`
  } catch (err) {
    output.value = `错误: ${err.message}`
  }
}

const runExample4 = () => {
  if (!lib) return
  
  try {
    const info = {
      version: lib.VERSION,
      libraryName: lib.LIBRARY_NAME,
      defaultOptions: lib.DEFAULT_OPTIONS
    }
    
    output.value = `库信息:\n${JSON.stringify(info, null, 2)}`
  } catch (err) {
    output.value = `错误: ${err.message}`
  }
}

const runIntegrationExample = () => {
  if (!lib) return
  
  try {
    // 集成示例：完整的用户管理流程
    const email = 'integration@test.com'
    
    if (!lib.validateEmail(email)) {
      output.value = '错误: 邮箱格式无效'
      return
    }
    
    const user = lib.createUser('集成测试用户', email, 28)
    const formatted = lib.formatUser(user)
    
    const result = {
      step1: '邮箱验证通过',
      step2: '用户创建成功',
      step3: '用户信息格式化完成',
      user,
      formatted
    }
    
    output.value = `集成测试结果:\n${JSON.stringify(result, null, 2)}`
  } catch (err) {
    output.value = `错误: ${err.message}`
  }
}
</script>

<div v-if="error" class="error-message">
  {{ error }}
</div>

<div v-else-if="!isLoaded" class="loading-message">
  正在加载库...
</div>

<div v-else>

## 示例 1: 创建用户

点击按钮创建一个用户对象：

<button @click="runExample1" class="demo-button">运行示例</button>

```typescript
import { createUser } from '@example/basic-typescript'

const user = createUser('张三', 'zhangsan@example.com', 25)
console.log(user)
```

## 示例 2: 邮箱验证

测试不同邮箱地址的验证结果：

<button @click="runExample2" class="demo-button">运行示例</button>

```typescript
import { validateEmail } from '@example/basic-typescript'

const emails = [
  'valid@example.com',
  'invalid-email',
  'user@domain.co.uk',
  '@invalid.com'
]

emails.forEach(email => {
  console.log(`${email}: ${validateEmail(email)}`)
})
```

## 示例 3: 格式化用户信息

格式化用户信息为可读字符串：

<button @click="runExample3" class="demo-button">运行示例</button>

```typescript
import { createUser, formatUser } from '@example/basic-typescript'

const user1 = createUser('李四', 'lisi@example.com', 30)
const user2 = createUser('王五', 'wangwu@example.com') // 不提供年龄

console.log(formatUser(user1)) // "李四 (30岁) - lisi@example.com"
console.log(formatUser(user2)) // "王五 - wangwu@example.com"
```

## 示例 4: 库信息

查看库的版本和配置信息：

<button @click="runExample4" class="demo-button">运行示例</button>

```typescript
import { VERSION, LIBRARY_NAME, DEFAULT_OPTIONS } from '@example/basic-typescript'

console.log('版本:', VERSION)
console.log('库名:', LIBRARY_NAME)
console.log('默认配置:', DEFAULT_OPTIONS)
```

## 示例 5: 集成使用

完整的用户管理流程示例：

<button @click="runIntegrationExample" class="demo-button">运行示例</button>

```typescript
import { validateEmail, createUser, formatUser } from '@example/basic-typescript'

function createUserSafely(name: string, email: string, age?: number) {
  // 1. 验证邮箱
  if (!validateEmail(email)) {
    throw new Error('邮箱格式无效')
  }
  
  // 2. 创建用户
  const user = createUser(name, email, age)
  
  // 3. 格式化显示
  const formatted = formatUser(user)
  
  return { user, formatted }
}

const result = createUserSafely('集成测试用户', 'integration@test.com', 28)
console.log(result)
```

## 输出结果

<pre class="output-display">{{ output || '点击上面的按钮运行示例' }}</pre>

</div>

<style scoped>
.demo-button {
  background: #007acc;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 8px 0;
  font-size: 14px;
}

.demo-button:hover {
  background: #005a9e;
}

.output-display {
  background: #f6f8fa;
  border: 1px solid #d1d9e0;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  line-height: 1.45;
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.loading-message {
  color: #666;
  font-style: italic;
  padding: 16px;
  text-align: center;
}

.error-message {
  color: #d73a49;
  background: #ffeef0;
  border: 1px solid #fdb8c0;
  border-radius: 6px;
  padding: 16px;
  margin: 16px 0;
}
</style>
