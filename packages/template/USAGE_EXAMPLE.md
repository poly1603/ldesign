# @ldesign/template 使用示例

## 🎯 快速开始

### 1. 初始化模板系统

```typescript
import { getManager } from '@ldesign/template'

// 获取全局管理器实例
const manager = getManager()

// 初始化（扫描所有模板）
const scanResult = await manager.initialize()

console.log(`扫描到 ${scanResult.total} 个模板`)
console.log('按分类统计:', scanResult.byCategory)
console.log('按设备统计:', scanResult.byDevice)
```

### 2. 加载单个模板

```typescript
// 方法1：使用管理器
const component = await manager.loadTemplate('login', 'desktop', 'default')

// 方法2：使用便捷函数
import { loadTemplate } from '@ldesign/template'
const component = await loadTemplate('login', 'desktop', 'default')
```

### 3. 查询模板

```typescript
// 获取所有模板
const allTemplates = await manager.getAllTemplates()

// 按分类查询
const loginTemplates = await manager.getTemplatesByCategory('login')

// 按设备查询
const mobileTemplates = await manager.getTemplatesByDevice('mobile')

// 获取默认模板
const defaultLogin = await manager.getDefaultTemplate('login', 'desktop')

// 高级查询
const templates = await manager.queryTemplates({
  category: 'login',
  device: 'desktop',
  tags: 'simple',
})
```

## 📱 在 Vue 组件中使用

### 方法1：使用 useTemplate 组合式函数

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTemplate } from '@ldesign/template'

// 响应式参数
const category = ref('login')
const device = ref('desktop')
const name = ref('default')

// 使用模板
const { component, loading, error, metadata, reload } = useTemplate(
  category,
  device,
  name
)

// 处理加载完成
watch(component, (comp) => {
  if (comp) {
    console.log('模板加载完成:', metadata.value)
  }
})
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error" class="error">
      {{ error.message }}
      <button @click="reload">重试</button>
    </div>
    <component
      v-else-if="component"
      :is="component"
      title="欢迎登录"
      @submit="handleSubmit"
    />
  </div>
</template>
```

### 方法2：使用 TemplateRenderer 组件

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TemplateRenderer } from '@ldesign/template'

const category = ref('login')
const device = ref('desktop')
const name = ref('default')

const handleSubmit = (data) => {
  console.log('登录数据:', data)
}
</script>

<template>
  <TemplateRenderer
    :category="category"
    :device="device"
    :name="name"
    :component-props="{
      title: '欢迎登录',
      subtitle: 'LDesign 模板系统'
    }"
    @submit="handleSubmit"
  >
    <!-- 自定义加载状态 -->
    <template #loading>
      <div class="my-loading">正在加载模板...</div>
    </template>

    <!-- 自定义错误显示 -->
    <template #error="{ error }">
      <div class="my-error">
        <p>加载失败: {{ error.message }}</p>
      </div>
    </template>
  </TemplateRenderer>
</template>
```

### 方法3：使用 useTemplateList 管理模板列表

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTemplateList } from '@ldesign/template'

const filter = ref({
  category: 'login',
  device: 'desktop',
})

const { templates, loading, error, query, refresh } = useTemplateList(filter)

const selectTemplate = async (template) => {
  console.log('选择模板:', template)
}
</script>

<template>
  <div>
    <h2>可用模板</h2>
    
    <div v-if="loading">加载中...</div>
    
    <div v-else-if="error">{{ error.message }}</div>
    
    <div v-else class="template-list">
      <div
        v-for="template in templates"
        :key="`${template.category}/${template.device}/${template.name}`"
        class="template-item"
        @click="selectTemplate(template)"
      >
        <h3>{{ template.displayName }}</h3>
        <p>{{ template.description }}</p>
        <span v-if="template.isDefault" class="badge">默认</span>
      </div>
    </div>

    <button @click="refresh">刷新列表</button>
  </div>
</template>
```

## 🎨 创建自定义模板

### 步骤1：创建目录结构

```
src/templates/
└── login/                    # 分类
    └── desktop/              # 设备
        └── custom/           # 模板名称
            ├── config.ts     # 配置文件
            └── index.vue     # 组件文件
```

### 步骤2：创建配置文件

`src/templates/login/desktop/custom/config.ts`

```typescript
import type { TemplateConfig } from '@ldesign/template'

export default {
  name: 'custom',
  displayName: '自定义登录',
  description: '带图片背景的登录页面',
  version: '1.0.0',
  author: 'Your Name',
  tags: ['login', 'custom', 'image-bg'],
  isDefault: false,
  preview: '/previews/login-custom.png',
} as TemplateConfig
```

### 步骤3：创建组件文件

`src/templates/login/desktop/custom/index.vue`

```vue
<template>
  <div class="custom-login">
    <div class="background-image" :style="{ backgroundImage: `url(${bgImage})` }">
      <div class="login-box">
        <h1>{{ title }}</h1>
        
        <form @submit.prevent="handleLogin">
          <input
            v-model="username"
            type="text"
            placeholder="用户名"
            required
          />
          <input
            v-model="password"
            type="password"
            placeholder="密码"
            required
          />
          <button type="submit">登录</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  title?: string
  bgImage?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '欢迎回来',
  bgImage: '/images/login-bg.jpg',
})

const emit = defineEmits<{
  submit: [data: { username: string; password: string }]
}>()

const username = ref('')
const password = ref('')

const handleLogin = () => {
  emit('submit', {
    username: username.value,
    password: password.value,
  })
}
</script>

<style scoped>
.custom-login {
  height: 100vh;
}

.background-image {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-box {
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* 其他样式... */
</style>
```

### 步骤4：使用新模板

```vue
<template>
  <TemplateRenderer
    category="login"
    device="desktop"
    name="custom"
    :component-props="{
      title: '欢迎回来',
      bgImage: '/images/my-background.jpg'
    }"
    @submit="handleSubmit"
  />
</template>
```

## 🚀 高级功能

### 预加载模板

```typescript
// 预加载单个模板
await manager.preloadTemplate('dashboard', 'desktop', 'default')

// 批量预加载
await manager.preloadByFilter({
  category: 'login',
  device: ['desktop', 'mobile'],
})
```

### 清除缓存

```typescript
// 清除特定模板缓存
manager.clearCache('login', 'desktop', 'default')

// 清除所有缓存
manager.clearCache()
```

### 重新扫描

```typescript
// 重新扫描模板（热重载场景）
const result = await manager.rescan()
console.log('重新扫描完成，共', result.total, '个模板')
```

## 💡 最佳实践

### 1. 初始化时机

```typescript
// App.vue
import { onMounted } from 'vue'
import { getManager } from '@ldesign/template'

onMounted(async () => {
  const manager = getManager()
  await manager.initialize()
  console.log('模板系统初始化完成')
})
```

### 2. 错误处理

```typescript
const loadOptions = {
  timeout: 5000,
  onError: (error) => {
    console.error('模板加载失败:', error)
    // 显示友好的错误提示
    showNotification('模板加载失败，请重试')
  },
  onLoad: (component) => {
    console.log('模板加载成功')
  },
}

await manager.loadTemplate('login', 'desktop', 'default', loadOptions)
```

### 3. 响应式设备切换

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTemplate } from '@ldesign/template'

// 根据屏幕宽度自动选择设备类型
const device = computed(() => {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
})

const { component, loading } = useTemplate('login', device, 'default')
</script>
```

## 🎓 完整示例

查看 `demo/` 目录获取完整的可运行示例。
