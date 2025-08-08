# 性能优化

@ldesign/form 在设计时就考虑了性能优化，但在处理大型表单或复杂场景时，仍需要一些优化策略来确保最佳性
能。

## 基础优化

### 懒加载组件

```javascript
// 按需导入组件
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() => import('./components/HeavyComponent.vue'))

const formOptions = {
  components: {
    HeavyComponent,
  },
  fields: [
    {
      name: 'heavy',
      label: '重型组件',
      component: 'HeavyComponent',
    },
  ],
}
```

### 虚拟滚动

对于包含大量字段的表单，使用虚拟滚动：

```vue
<template>
  <VirtualList :items="fields" :item-height="80" :container-height="400">
    <template #default="{ item }">
      <FormField :key="item.name" :config="item" v-model="formData[item.name]" />
    </template>
  </VirtualList>
</template>

<script setup>
import { VirtualList } from '@ldesign/form'

const fields = ref([
  // 大量字段配置...
])
</script>
```

## 渲染优化

### 条件渲染优化

使用 `v-show` 而不是 `v-if` 来避免频繁的 DOM 创建和销毁：

```vue
<template>
  <DynamicForm v-model="formData" :options="formOptions">
    <template #field="{ field, show }">
      <div v-show="show" class="form-field">
        <FormField :config="field" />
      </div>
    </template>
  </DynamicForm>
</template>
```

### 使用 `shallowRef`

对于大型表单数据，使用 `shallowRef` 减少响应式开销：

```vue
<script setup>
import { shallowRef, triggerRef } from 'vue'

// 使用 shallowRef 减少深度响应式
const formData = shallowRef({})

const updateField = (name, value) => {
  formData.value[name] = value
  // 手动触发更新
  triggerRef(formData)
}
</script>
```

### 字段级别的 `memo`

对复杂字段使用 `memo` 优化：

```vue
<script setup>
import { memo } from 'vue'

const OptimizedField = memo(FormField, (prevProps, nextProps) => {
  // 自定义比较逻辑
  return prevProps.config === nextProps.config && prevProps.modelValue === nextProps.modelValue
})
</script>
```

## 验证优化

### 防抖验证

对异步验证使用防抖：

```javascript
import { debounce } from 'lodash-es'

const formOptions = {
  fields: [
    {
      name: 'username',
      label: '用户名',
      component: 'FormInput',
      rules: [
        {
          validator: debounce(async value => {
            // 异步验证逻辑
            const response = await checkUsername(value)
            return response.available || '用户名已被占用'
          }, 300),
          trigger: 'change',
        },
      ],
    },
  ],
}
```

### 批量验证

避免频繁的单字段验证，使用批量验证：

```vue
<script setup>
import { ref, nextTick } from 'vue'

const pendingValidations = ref(new Set())
const validationTimer = ref(null)

const scheduleValidation = fieldName => {
  pendingValidations.value.add(fieldName)

  if (validationTimer.value) {
    clearTimeout(validationTimer.value)
  }

  validationTimer.value = setTimeout(async () => {
    const fields = Array.from(pendingValidations.value)
    pendingValidations.value.clear()

    // 批量验证
    await validateFields(fields)
  }, 100)
}
</script>
```

### 智能验证

只验证已修改的字段：

```vue
<script setup>
const dirtyFields = ref(new Set())
const originalData = ref({})

const markDirty = fieldName => {
  dirtyFields.value.add(fieldName)
}

const validateDirtyFields = async () => {
  const fieldsToValidate = Array.from(dirtyFields.value)
  return await validateFields(fieldsToValidate)
}
</script>
```

## 内存优化

### 清理事件监听器

```vue
<script setup>
import { onBeforeUnmount } from 'vue'

const cleanup = []

// 添加事件监听器
const addListener = (element, event, handler) => {
  element.addEventListener(event, handler)
  cleanup.push(() => element.removeEventListener(event, handler))
}

// 组件卸载时清理
onBeforeUnmount(() => {
  cleanup.forEach(fn => fn())
})
</script>
```

### 对象池

对于频繁创建的对象，使用对象池：

```javascript
class ValidationResultPool {
  constructor() {
    this.pool = []
  }

  get() {
    return this.pool.pop() || { valid: true, errors: {} }
  }

  release(result) {
    result.valid = true
    result.errors = {}
    this.pool.push(result)
  }
}

const resultPool = new ValidationResultPool()

const validate = () => {
  const result = resultPool.get()

  try {
    // 验证逻辑
    return result
  } finally {
    // 使用完后释放回池中
    setTimeout(() => resultPool.release(result), 0)
  }
}
```

## 网络优化

### 请求合并

合并多个验证请求：

```javascript
class RequestBatcher {
  constructor(delay = 100) {
    this.delay = delay
    this.pending = new Map()
    this.timer = null
  }

  add(key, request) {
    this.pending.set(key, request)

    if (this.timer) {
      clearTimeout(this.timer)
    }

    this.timer = setTimeout(() => {
      this.flush()
    }, this.delay)
  }

  async flush() {
    const requests = Array.from(this.pending.values())
    this.pending.clear()

    // 批量发送请求
    const results = await Promise.all(requests)
    return results
  }
}

const batcher = new RequestBatcher()

const validateUsername = username => {
  return batcher.add('username', checkUsernameAPI(username))
}
```

### 缓存验证结果

```javascript
class ValidationCache {
  constructor(maxSize = 100, ttl = 5 * 60 * 1000) {
    this.cache = new Map()
    this.maxSize = maxSize
    this.ttl = ttl
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    })
  }
}

const validationCache = new ValidationCache()

const cachedValidator = async value => {
  const cacheKey = `validation:${value}`
  const cached = validationCache.get(cacheKey)

  if (cached !== null) {
    return cached
  }

  const result = await performValidation(value)
  validationCache.set(cacheKey, result)

  return result
}
```

## 构建优化

### Tree Shaking

确保只打包使用的组件：

```javascript
// 推荐：按需导入
import { DynamicForm, FormInput, FormSelect } from '@ldesign/form'

// 避免：全量导入
// import LDesignForm from '@ldesign/form'
```

### 代码分割

将大型表单拆分为多个块：

```javascript
// 路由级别的代码分割
const routes = [
  {
    path: '/form/basic',
    component: () => import('./views/BasicForm.vue'),
  },
  {
    path: '/form/advanced',
    component: () => import('./views/AdvancedForm.vue'),
  },
]

// 组件级别的代码分割
const formOptions = {
  fields: [
    {
      name: 'chart',
      label: '图表',
      component: () => import('./components/ChartField.vue'),
    },
  ],
}
```

## 监控和分析

### 性能监控

```vue
<script setup>
import { ref, onMounted, watch } from 'vue'

const performanceMetrics = ref({
  renderTime: 0,
  validationTime: 0,
  updateTime: 0,
})

const measureRenderTime = () => {
  const start = performance.now()

  nextTick(() => {
    const end = performance.now()
    performanceMetrics.value.renderTime = end - start
  })
}

const measureValidationTime = async validator => {
  const start = performance.now()
  await validator()
  const end = performance.now()

  performanceMetrics.value.validationTime = end - start
}

// 监控表单数据变化频率
const updateCount = ref(0)
watch(
  formData,
  () => {
    updateCount.value++
  },
  { deep: true }
)
</script>
```

### 内存使用监控

```javascript
const monitorMemoryUsage = () => {
  if (performance.memory) {
    console.log({
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
    })
  }
}

// 定期监控
setInterval(monitorMemoryUsage, 10000)
```

## 最佳实践

### 1. 合理使用响应式

```javascript
// ✅ 好的做法
const formData = ref({})
const computedField = computed(() => {
  return formData.value.field1 + formData.value.field2
})

// ❌ 避免的做法
const formData = reactive({})
const computedField = computed(() => {
  // 避免在计算属性中进行复杂计算
  return heavyComputation(formData)
})
```

### 2. 优化字段更新

```javascript
// ✅ 批量更新
const updateMultipleFields = updates => {
  Object.assign(formData.value, updates)
}

// ❌ 逐个更新
const updateFieldsOneByOne = updates => {
  Object.keys(updates).forEach(key => {
    formData.value[key] = updates[key]
  })
}
```

### 3. 合理使用 key

```vue
<template>
  <!-- ✅ 使用稳定的 key -->
  <FormField v-for="field in fields" :key="field.name" :config="field" />

  <!-- ❌ 使用不稳定的 key -->
  <FormField v-for="(field, index) in fields" :key="index" :config="field" />
</template>
```

### 4. 避免不必要的计算

```javascript
// ✅ 缓存计算结果
const expensiveComputation = useMemoize(data => {
  return heavyCalculation(data)
})

// ❌ 每次都重新计算
const result = computed(() => {
  return heavyCalculation(formData.value)
})
```

## 性能检查清单

- [ ] 使用按需导入减少包大小
- [ ] 对大型表单使用虚拟滚动
- [ ] 使用防抖优化异步验证
- [ ] 合理使用 `v-show` 和 `v-if`
- [ ] 避免深度响应式的滥用
- [ ] 清理事件监听器和定时器
- [ ] 缓存验证结果
- [ ] 监控性能指标
- [ ] 使用代码分割
- [ ] 优化网络请求

## 下一步

- [自定义组件](/guide/custom-components) - 创建高性能的自定义组件
- [国际化](/guide/i18n) - 优化国际化性能
- [API 参考](/api/components) - 了解性能相关的 API
