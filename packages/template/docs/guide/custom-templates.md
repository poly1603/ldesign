# 自定义模板指南

本指南将教你如何创建和管理自定义模板，充分发挥 `@ldesign/template` 的强大功能。

## 🎨 模板创建基础

### 目录结构规范

创建模板时，请遵循以下目录结构：

```
src/templates/
├── [模板分类]/
│   ├── desktop/
│   │   └── [组件名].vue
│   ├── tablet/
│   │   └── [组件名].vue
│   ├── mobile/
│   │   └── [组件名].vue
│   └── meta.json          # 可选的元数据文件
```

### 基础模板示例

让我们创建一个用户资料模板：

#### 1. 桌面端版本

```vue
<!-- src/templates/user-profile/desktop/UserProfile.vue -->
<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Props {
  user?: {
    id: string
    name: string
    email: string
    phone: string
    avatar: string
    title: string
    department: string
  }
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  user: () => ({
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    avatar: '/default-avatar.png',
    title: '高级前端工程师',
    department: 'tech'
  })
})

const emit = defineEmits<{
  save: [data: any]
  reset: []
}>()

const saving = ref(false)
const form = reactive({ ...props.user })

async function handleSave() {
  saving.value = true
  try {
    // 模拟保存操作
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('save', { ...form })
  }
  finally {
    saving.value = false
  }
}

function handleReset() {
  Object.assign(form, props.user)
  emit('reset')
}
</script>

<template>
  <div class="user-profile-desktop">
    <div class="profile-container">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <img :src="user.avatar" :alt="user.name" class="avatar">
        <button class="change-avatar-btn">
          更换头像
        </button>
      </div>

      <!-- 信息区域 -->
      <div class="info-section">
        <h2>{{ user.name }}</h2>
        <p class="title">
          {{ user.title }}
        </p>

        <!-- 详细信息表单 -->
        <form class="profile-form" @submit.prevent="handleSave">
          <div class="form-row">
            <div class="form-group">
              <label>姓名</label>
              <input v-model="form.name" type="text">
            </div>
            <div class="form-group">
              <label>邮箱</label>
              <input v-model="form.email" type="email">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>电话</label>
              <input v-model="form.phone" type="tel">
            </div>
            <div class="form-group">
              <label>部门</label>
              <select v-model="form.department">
                <option value="tech">
                  技术部
                </option>
                <option value="design">
                  设计部
                </option>
                <option value="product">
                  产品部
                </option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="handleReset">
              重置
            </button>
            <button type="submit" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile-desktop {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-container {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 2rem;
}

.avatar-section {
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
}

.change-avatar-btn {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.info-section h2 {
  margin: 0 0 0.5rem;
  color: #333;
}

.title {
  color: #666;
  margin-bottom: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.form-actions button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-actions button[type="button"] {
  background: #f0f0f0;
  color: #333;
}

.form-actions button[type="submit"] {
  background: #007bff;
  color: white;
}

.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
```

#### 2. 移动端版本

```vue
<!-- src/templates/user-profile/mobile/UserProfile.vue -->
<script setup lang="ts">
import { reactive, ref } from 'vue'

// 复用相同的 Props 和 Emits 定义
interface Props {
  user?: {
    id: string
    name: string
    email: string
    phone: string
    avatar: string
    title: string
    department: string
  }
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: true,
  user: () => ({
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    avatar: '/default-avatar.png',
    title: '高级前端工程师',
    department: 'tech'
  })
})

const emit = defineEmits<{
  save: [data: any]
  reset: []
}>()

const isEditing = ref(false)
const saving = ref(false)
const form = reactive({ ...props.user })

function toggleEdit() {
  isEditing.value = !isEditing.value
  if (!isEditing.value) {
    // 取消编辑时重置表单
    Object.assign(form, props.user)
  }
}

async function handleSave() {
  saving.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('save', { ...form })
    isEditing.value = false
  }
  finally {
    saving.value = false
  }
}

function getDepartmentName(dept: string) {
  const names = {
    tech: '技术部',
    design: '设计部',
    product: '产品部'
  }
  return names[dept] || dept
}
</script>

<template>
  <div class="user-profile-mobile">
    <!-- 头部信息 -->
    <div class="profile-header">
      <img :src="user.avatar" :alt="user.name" class="avatar">
      <div class="user-info">
        <h2>{{ user.name }}</h2>
        <p class="title">
          {{ user.title }}
        </p>
      </div>
      <button class="edit-btn" @click="toggleEdit">
        {{ isEditing ? '取消' : '编辑' }}
      </button>
    </div>

    <!-- 表单区域 -->
    <div class="profile-content">
      <form v-if="isEditing" class="profile-form" @submit.prevent="handleSave">
        <div class="form-group">
          <label>姓名</label>
          <input v-model="form.name" type="text">
        </div>

        <div class="form-group">
          <label>邮箱</label>
          <input v-model="form.email" type="email">
        </div>

        <div class="form-group">
          <label>电话</label>
          <input v-model="form.phone" type="tel">
        </div>

        <div class="form-group">
          <label>部门</label>
          <select v-model="form.department">
            <option value="tech">
              技术部
            </option>
            <option value="design">
              设计部
            </option>
            <option value="product">
              产品部
            </option>
          </select>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="saving" class="save-btn">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </form>

      <!-- 只读模式 -->
      <div v-else class="profile-view">
        <div class="info-item">
          <label>姓名</label>
          <span>{{ user.name }}</span>
        </div>
        <div class="info-item">
          <label>邮箱</label>
          <span>{{ user.email }}</span>
        </div>
        <div class="info-item">
          <label>电话</label>
          <span>{{ user.phone }}</span>
        </div>
        <div class="info-item">
          <label>部门</label>
          <span>{{ getDepartmentName(user.department) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-profile-mobile {
  padding: 1rem;
  background: #f5f5f5;
  min-height: 100vh;
}

.profile-header {
  display: flex;
  align-items: center;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
}

.title {
  margin: 0.25rem 0 0;
  color: #666;
  font-size: 0.9rem;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
}

.profile-content {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-actions {
  margin-top: 1.5rem;
}

.save-btn {
  width: 100%;
  padding: 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
}

.save-btn:disabled {
  opacity: 0.6;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 600;
  color: #555;
}

.info-item span {
  color: #333;
}
</style>
```

#### 3. 元数据配置

```json
// src/templates/user-profile/meta.json
{
  "name": "用户资料",
  "description": "用户个人信息管理模板",
  "category": "user",
  "tags": ["profile", "form", "user-management"],
  "version": "1.0.0",
  "author": "Your Name",
  "priority": "medium",
  "preload": false,
  "fallback": {
    "mobile": "tablet",
    "tablet": "desktop"
  },
  "props": {
    "user": {
      "type": "object",
      "required": false,
      "description": "用户信息对象"
    },
    "editable": {
      "type": "boolean",
      "required": false,
      "default": true,
      "description": "是否允许编辑"
    }
  },
  "events": {
    "save": "保存用户信息时触发",
    "reset": "重置表单时触发"
  }
}
```

## 🔧 高级特性

### 1. 条件渲染

```vue
<script setup lang="ts">
interface Props {
  userRole?: 'admin' | 'editor' | 'user'
  permissions?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  userRole: 'user',
  permissions: () => []
})

function hasPermission(permission: string) {
  return props.permissions.includes(permission)
    || props.userRole === 'admin'
}
</script>

<template>
  <div class="conditional-template">
    <!-- 根据用户权限显示不同内容 -->
    <div v-if="hasPermission('admin')" class="admin-panel">
      <h3>管理员面板</h3>
      <!-- 管理员专用功能 -->
    </div>

    <div v-else-if="hasPermission('editor')" class="editor-panel">
      <h3>编辑器面板</h3>
      <!-- 编辑器功能 -->
    </div>

    <div v-else class="user-panel">
      <h3>用户面板</h3>
      <!-- 普通用户功能 -->
    </div>
  </div>
</template>
```

### 2. 动态组件

```vue
<script setup lang="ts">
import { computed } from 'vue'
import ChartView from './components/ChartView.vue'
import FormView from './components/FormView.vue'
import ListView from './components/ListView.vue'

interface Props {
  viewType?: 'form' | 'list' | 'chart'
  data?: any
}

const props = withDefaults(defineProps<Props>(), {
  viewType: 'form'
})

const componentMap = {
  form: FormView,
  list: ListView,
  chart: ChartView
}

const currentComponent = computed(() => {
  return componentMap[props.viewType] || FormView
})

const componentProps = computed(() => {
  return {
    data: props.data,
    viewType: props.viewType
  }
})

function handleComponentChange(newType: string) {
  // 处理组件切换
  console.log('切换到组件:', newType)
}
</script>

<template>
  <div class="dynamic-template">
    <component
      :is="currentComponent"
      v-bind="componentProps"
      @component-change="handleComponentChange"
    />
  </div>
</template>
```

### 3. 插槽支持

```vue
<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title?: string
  showSidebar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showSidebar: true
})

const footerData = computed(() => ({
  timestamp: new Date().toISOString(),
  version: '1.0.0'
}))
</script>

<template>
  <div class="template-with-slots">
    <header class="template-header">
      <slot name="header">
        <h2>默认标题</h2>
      </slot>
    </header>

    <main class="template-content">
      <slot>
        <p>默认内容</p>
      </slot>
    </main>

    <aside class="template-sidebar">
      <slot name="sidebar">
        <div>默认侧边栏</div>
      </slot>
    </aside>

    <footer class="template-footer">
      <slot name="footer" :data="footerData">
        <p>默认页脚</p>
      </slot>
    </footer>
  </div>
</template>
```

## 📱 响应式设计最佳实践

### 1. 断点管理

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
}

const currentBreakpoint = ref('desktop')

function updateBreakpoint() {
  const width = window.innerWidth

  if (width <= breakpoints.mobile) {
    currentBreakpoint.value = 'mobile'
  }
  else if (width <= breakpoints.tablet) {
    currentBreakpoint.value = 'tablet'
  }
  else {
    currentBreakpoint.value = 'desktop'
  }
}

onMounted(() => {
  updateBreakpoint()
  window.addEventListener('resize', updateBreakpoint)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateBreakpoint)
})
</script>

<template>
  <div :class="`template-${currentBreakpoint}`">
    <!-- 根据断点应用不同样式 -->
  </div>
</template>

<style scoped>
.template-mobile {
  /* 移动端样式 */
}

.template-tablet {
  /* 平板端样式 */
}

.template-desktop {
  /* 桌面端样式 */
}
</style>
```

### 2. 灵活的网格系统

```vue
<script setup lang="ts">
interface GridItem {
  id: string
  content: string
  span?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

interface Props {
  items: GridItem[]
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  columns: () => ({
    mobile: 1,
    tablet: 2,
    desktop: 3
  })
})

function getItemClass(item: GridItem) {
  const classes = []

  if (item.span?.mobile)
    classes.push(`span-mobile-${item.span.mobile}`)
  if (item.span?.tablet)
    classes.push(`span-tablet-${item.span.tablet}`)
  if (item.span?.desktop)
    classes.push(`span-desktop-${item.span.desktop}`)

  return classes
}
</script>

<template>
  <div class="responsive-grid">
    <div
      v-for="item in items"
      :key="item.id"
      class="grid-item"
      :class="getItemClass(item)"
    >
      {{ item.content }}
    </div>
  </div>
</template>

<style scoped>
.responsive-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(var(--columns), 1fr);
}

/* 移动端 */
@media (max-width: 768px) {
  .responsive-grid {
    --columns: 1;
  }

  .span-mobile-2 { grid-column: span 2; }
  .span-mobile-3 { grid-column: span 3; }
}

/* 平板端 */
@media (min-width: 769px) and (max-width: 1024px) {
  .responsive-grid {
    --columns: 2;
  }

  .span-tablet-2 { grid-column: span 2; }
  .span-tablet-3 { grid-column: span 3; }
}

/* 桌面端 */
@media (min-width: 1025px) {
  .responsive-grid {
    --columns: 3;
  }

  .span-desktop-2 { grid-column: span 2; }
  .span-desktop-3 { grid-column: span 3; }
}
</style>
```

## 🎯 性能优化技巧

### 1. 懒加载组件

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// 懒加载重型组件
const HeavyChart = defineAsyncComponent(() =>
  import('./components/HeavyChart.vue')
)

const DataTable = defineAsyncComponent({
  loader: () => import('./components/DataTable.vue'),
  loadingComponent: () => h('div', '加载中...'),
  errorComponent: () => h('div', '加载失败'),
  delay: 200,
  timeout: 3000
})
</script>

<template>
  <div>
    <Suspense>
      <template #default>
        <HeavyChart v-if="showChart" />
        <DataTable v-if="showTable" />
      </template>
      <template #fallback>
        <div class="loading">
          组件加载中...
        </div>
      </template>
    </Suspense>
  </div>
</template>
```

### 2. 虚拟滚动

```vue
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface Props {
  items: any[]
  itemHeight?: number
  containerHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  itemHeight: 50,
  containerHeight: 300
})

const containerRef = ref<HTMLElement>()
const scrollTop = ref(0)

const totalHeight = computed(() =>
  props.items.length * props.itemHeight
)

const visibleCount = computed(() =>
  Math.ceil(props.containerHeight / props.itemHeight) + 2
)

const startIndex = computed(() =>
  Math.floor(scrollTop.value / props.itemHeight)
)

const visibleItems = computed(() => {
  const start = Math.max(0, startIndex.value - 1)
  const end = Math.min(props.items.length, start + visibleCount.value)

  return props.items.slice(start, end).map((item, index) => ({
    id: start + index,
    index: start + index,
    data: item,
    top: (start + index) * props.itemHeight
  }))
})

onMounted(() => {
  const container = containerRef.value
  if (container) {
    container.addEventListener('scroll', () => {
      scrollTop.value = container.scrollTop
    })
  }
})
</script>

<template>
  <div ref="containerRef" class="virtual-list">
    <div
      class="virtual-list-content"
      :style="{ height: `${totalHeight}px` }"
    >
      <div
        v-for="item in visibleItems"
        :key="item.id"
        class="virtual-list-item"
        :style="{
          transform: `translateY(${item.top}px)`,
          height: `${itemHeight}px`,
        }"
      >
        <slot :item="item.data" :index="item.index">
          {{ item.data }}
        </slot>
      </div>
    </div>
  </div>
</template>
```

## 🧪 测试模板

### 单元测试示例

```typescript
// tests/templates/UserProfile.test.ts
import { mount } from '@vue/test-utils'
import UserProfile from '@/templates/user-profile/desktop/UserProfile.vue'

describe('UserProfile Template', () => {
  const mockUser = {
    id: '1',
    name: '测试用户',
    email: 'test@example.com',
    phone: '13800138000',
    avatar: '/test-avatar.png',
    title: '测试工程师',
    department: 'tech'
  }

  it('renders user information correctly', () => {
    const wrapper = mount(UserProfile, {
      props: { user: mockUser }
    })

    expect(wrapper.find('h2').text()).toBe(mockUser.name)
    expect(wrapper.find('.title').text()).toBe(mockUser.title)
    expect(wrapper.find('img').attributes('src')).toBe(mockUser.avatar)
  })

  it('emits save event when form is submitted', async () => {
    const wrapper = mount(UserProfile, {
      props: { user: mockUser }
    })

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('save')).toBeTruthy()
    expect(wrapper.emitted('save')[0][0]).toEqual(mockUser)
  })

  it('resets form when reset button is clicked', async () => {
    const wrapper = mount(UserProfile, {
      props: { user: mockUser }
    })

    // 修改表单数据
    await wrapper.find('input[type="text"]').setValue('新名称')

    // 点击重置按钮
    await wrapper.find('button[type="button"]').trigger('click')

    expect(wrapper.emitted('reset')).toBeTruthy()
  })
})
```

## 📚 下一步

- 了解 [模板部署](./deployment.md)
- 查看 [性能优化指南](./performance.md)
- 参考 [完整示例](/examples/full-app.md)
- 阅读 [常见问题](./faq.md)
