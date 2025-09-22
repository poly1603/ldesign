# Vue 3 基础示例

这个示例展示了如何在 Vue 3 项目中使用 @ldesign/engine 的核心功能。

## 🚀 快速开始

### 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

## 📁 项目结构

```
vue-basic/
├── src/
│   ├── components/
│   │   ├── AsyncDataDemo.vue      # 异步数据管理示例
│   │   ├── FormDemo.vue           # 表单管理示例
│   │   ├── PerformanceDemo.vue    # 性能监控示例
│   │   ├── CacheDemo.vue          # 缓存管理示例
│   │   └── StateDemo.vue          # 状态管理示例
│   ├── App.vue                    # 主应用组件
│   └── main.ts                    # 应用入口
├── package.json
└── README.md
```

## 🎯 功能演示

### 1. 异步数据管理 (AsyncDataDemo.vue)

展示如何使用 `useAsync` 组合式函数管理异步数据：

- ✅ 自动加载状态管理
- ✅ 错误处理
- ✅ 重试机制
- ✅ 手动刷新

```vue
<template>
  <div class="async-demo">
    <h2>异步数据管理</h2>
    
    <div v-if="loading" class="loading">
      加载中...
    </div>
    
    <div v-else-if="error" class="error">
      错误: {{ error.message }}
      <button @click="execute">重试</button>
    </div>
    
    <div v-else class="data">
      <h3>{{ data?.title }}</h3>
      <p>{{ data?.content }}</p>
      <button @click="execute">刷新数据</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAsync } from '@ldesign/engine'

interface ApiData {
  title: string
  content: string
  timestamp: number
}

const { data, loading, error, execute } = useAsync<ApiData>(
  async () => {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 模拟随机错误
    if (Math.random() < 0.3) {
      throw new Error('网络请求失败')
    }
    
    return {
      title: '数据标题',
      content: '这是从 API 获取的数据内容',
      timestamp: Date.now()
    }
  },
  {
    immediate: true,
    retry: 3,
    retryDelay: 1000
  }
)
</script>
```

### 2. 表单管理 (FormDemo.vue)

展示如何使用 `useForm` 进行表单验证和提交：

- ✅ 实时验证
- ✅ 自定义验证规则
- ✅ 提交状态管理
- ✅ 错误显示

```vue
<template>
  <div class="form-demo">
    <h2>表单管理</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label>用户名:</label>
        <input 
          v-model="values.username"
          :class="{ error: errors.username }"
          @blur="validateField('username')"
        />
        <span v-if="errors.username" class="error-text">
          {{ errors.username }}
        </span>
      </div>
      
      <div class="field">
        <label>邮箱:</label>
        <input 
          v-model="values.email"
          type="email"
          :class="{ error: errors.email }"
          @blur="validateField('email')"
        />
        <span v-if="errors.email" class="error-text">
          {{ errors.email }}
        </span>
      </div>
      
      <div class="actions">
        <button type="submit" :disabled="!isValid || submitting">
          {{ submitting ? '提交中...' : '提交' }}
        </button>
        <button type="button" @click="reset">重置</button>
      </div>
    </form>
    
    <div v-if="submitResult" class="result">
      提交结果: {{ submitResult }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '@ldesign/engine'

const submitResult = ref('')

const {
  values,
  errors,
  isValid,
  submitting,
  validateField,
  validate,
  reset,
  submit
} = useForm(
  {
    username: '',
    email: ''
  },
  {
    username: [
      { required: true, message: '用户名必填' },
      { minLength: 3, message: '用户名至少3个字符' }
    ],
    email: [
      { required: true, message: '邮箱必填' },
      { type: 'email', message: '邮箱格式错误' }
    ]
  }
)

const handleSubmit = async () => {
  const isValid = await validate()
  if (isValid) {
    await submit(async (data) => {
      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 1000))
      submitResult.value = `提交成功: ${JSON.stringify(data)}`
    })
  }
}
</script>
```

### 3. 性能监控 (PerformanceDemo.vue)

展示如何使用性能监控功能：

- ✅ 组件渲染性能监控
- ✅ 自定义性能测量
- ✅ 性能报告生成
- ✅ 实时性能指标

```vue
<template>
  <div class="performance-demo">
    <h2>性能监控</h2>
    
    <div class="metrics">
      <div class="metric">
        <label>FPS:</label>
        <span>{{ fps }}</span>
      </div>
      <div class="metric">
        <label>内存使用:</label>
        <span>{{ memoryUsage.usedJSHeapSize }} MB</span>
      </div>
    </div>
    
    <div class="actions">
      <button @click="performHeavyTask">执行重任务</button>
      <button @click="generateReport">生成性能报告</button>
    </div>
    
    <div v-if="report" class="report">
      <h3>性能报告</h3>
      <pre>{{ JSON.stringify(report, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePerformance } from '@ldesign/engine'

const report = ref(null)

const {
  fps,
  memoryUsage,
  startMeasure,
  endMeasure,
  getReport
} = usePerformance()

const performHeavyTask = async () => {
  startMeasure('heavy-task')
  
  // 模拟重任务
  const start = Date.now()
  while (Date.now() - start < 100) {
    // 消耗 CPU
  }
  
  endMeasure('heavy-task')
}

const generateReport = () => {
  report.value = getReport()
}
</script>
```

### 4. 状态管理 (StateDemo.vue)

展示全局状态管理功能：

- ✅ 全局状态共享
- ✅ 状态持久化
- ✅ 状态变化监听
- ✅ 批量状态更新

```vue
<template>
  <div class="state-demo">
    <h2>状态管理</h2>
    
    <div class="user-info">
      <h3>用户信息</h3>
      <p>姓名: {{ userState?.name || '未设置' }}</p>
      <p>年龄: {{ userState?.age || '未设置' }}</p>
      
      <div class="actions">
        <button @click="updateUser">更新用户信息</button>
        <button @click="clearUser">清除用户信息</button>
      </div>
    </div>
    
    <div class="settings">
      <h3>应用设置</h3>
      <label>
        <input 
          type="checkbox" 
          :checked="settings.darkMode"
          @change="toggleDarkMode"
        />
        深色模式
      </label>
      
      <label>
        语言:
        <select :value="settings.language" @change="changeLanguage">
          <option value="zh-CN">中文</option>
          <option value="en-US">English</option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEngineState, usePersistentState } from '@ldesign/engine'

// 全局状态
const { getState, setState } = useEngineState()

const userState = computed(() => getState('user'))

// 持久化设置
const { value: settings, setValue: setSettings } = usePersistentState(
  'app-settings',
  {
    darkMode: false,
    language: 'zh-CN'
  }
)

const updateUser = () => {
  setState('user', {
    name: '张三',
    age: Math.floor(Math.random() * 50) + 20
  })
}

const clearUser = () => {
  setState('user', null)
}

const toggleDarkMode = (event: Event) => {
  const target = event.target as HTMLInputElement
  setSettings({
    ...settings.value,
    darkMode: target.checked
  })
}

const changeLanguage = (event: Event) => {
  const target = event.target as HTMLSelectElement
  setSettings({
    ...settings.value,
    language: target.value
  })
}
</script>
```

## 🎨 样式

项目包含基础的 CSS 样式，展示了各个组件的视觉效果：

```css
/* 基础样式 */
.loading {
  color: #666;
  font-style: italic;
}

.error {
  color: #e74c3c;
  padding: 10px;
  border: 1px solid #e74c3c;
  border-radius: 4px;
  background: #fdf2f2;
}

.field {
  margin-bottom: 15px;
}

.field label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.field input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.field input.error {
  border-color: #e74c3c;
}

.error-text {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
}

.actions {
  margin-top: 15px;
}

.actions button {
  margin-right: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #3498db;
  color: white;
  cursor: pointer;
}

.actions button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.metrics {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
}

.metric {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.report {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.report pre {
  margin: 0;
  font-size: 12px;
}
```

## 🔗 相关链接

- [Vue 3 集成指南](../../docs/guide/vue-integration.md)
- [API 参考文档](../../docs/api/README.md)
- [更多示例](../README.md)
