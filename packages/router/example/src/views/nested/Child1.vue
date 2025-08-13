<template>
  <div class="nested-child1">
    <div class="header-section">
      <h3>🎯 子路由 1</h3>
      <p>这是第一个子路由组件，演示嵌套路由的基本功能。</p>
    </div>

    <div class="content-grid">
      <div class="content-card">
        <h4>组件状态</h4>
        <div class="state-info">
          <div class="state-item">
            <strong>组件挂载时间:</strong> {{ mountTime }}
          </div>
          <div class="state-item">
            <strong>访问次数:</strong> {{ visitCount }}
          </div>
          <div class="state-item">
            <strong>组件 ID:</strong> {{ componentId }}
          </div>
        </div>
      </div>

      <div class="content-card">
        <h4>路由参数</h4>
        <div class="params-info">
          <div class="param-item">
            <strong>路径参数:</strong>
            {{ JSON.stringify(routeInfo?.params || {}) }}
          </div>
          <div class="param-item">
            <strong>查询参数:</strong>
            {{ JSON.stringify(routeInfo?.query || {}) }}
          </div>
          <div class="param-item">
            <strong>Hash:</strong> {{ routeInfo?.hash || '无' }}
          </div>
        </div>
      </div>
    </div>

    <div class="interactive-section">
      <h4>交互演示</h4>
      <div class="demo-controls">
        <div class="control-group">
          <label>计数器:</label>
          <div class="counter">
            <button @click="decrementCounter" class="btn btn-sm btn-secondary">
              -
            </button>
            <span class="counter-value">{{ counter }}</span>
            <button @click="incrementCounter" class="btn btn-sm btn-secondary">
              +
            </button>
          </div>
        </div>

        <div class="control-group">
          <label>输入框:</label>
          <input
            v-model="inputValue"
            class="input"
            placeholder="输入一些内容..."
          />
        </div>

        <div class="control-group">
          <label>选择器:</label>
          <select v-model="selectedOption" class="input">
            <option value="">请选择...</option>
            <option value="option1">选项 1</option>
            <option value="option2">选项 2</option>
            <option value="option3">选项 3</option>
          </select>
        </div>
      </div>
    </div>

    <div class="data-section">
      <h4>组件数据</h4>
      <pre class="data-display">{{ componentData }}</pre>
    </div>

    <div class="navigation-section">
      <h4>导航操作</h4>
      <div class="nav-actions">
        <RouterLink to="/nested" class="btn btn-primary">
          返回默认页面
        </RouterLink>
        <RouterLink to="/nested/child2" class="btn btn-secondary">
          前往子路由 2
        </RouterLink>
        <button @click="navigateWithState" class="btn btn-info">
          带状态导航
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from '@ldesign/router'

interface Props {
  routeInfo?: {
    path: string
    name?: string
    params: Record<string, any>
    query: Record<string, any>
    hash: string
  }
}

defineProps<Props>()

const router = useRouter()

// 组件状态
const mountTime = ref('')
const visitCount = ref(0)
const componentId = ref('')
const counter = ref(0)
const inputValue = ref('')
const selectedOption = ref('')

// 计算属性
const componentData = computed(() => ({
  counter: counter.value,
  inputValue: inputValue.value,
  selectedOption: selectedOption.value,
  mountTime: mountTime.value,
  visitCount: visitCount.value,
  componentId: componentId.value,
}))

// 方法
const incrementCounter = () => {
  counter.value++
}

const decrementCounter = () => {
  counter.value--
}

const navigateWithState = () => {
  router.push({
    path: '/nested/child2',
    query: {
      fromChild1: 'true',
      counter: counter.value.toString(),
      input: inputValue.value,
      timestamp: Date.now().toString(),
    },
  })
}

// 生命周期
onMounted(() => {
  mountTime.value = new Date().toLocaleString()
  componentId.value = Math.random().toString(36).substr(2, 9)

  // 从 sessionStorage 获取访问次数
  const stored = sessionStorage.getItem('child1-visit-count')
  visitCount.value = stored ? parseInt(stored) + 1 : 1
  sessionStorage.setItem('child1-visit-count', visitCount.value.toString())

  console.log('Child1 组件已挂载')
})

onUnmounted(() => {
  console.log('Child1 组件已卸载')
})
</script>

<style lang="less" scoped>
.nested-child1 {
  padding: @spacing-lg;
}

.header-section {
  text-align: center;
  margin-bottom: @spacing-xl;

  h3 {
    color: @success-color;
    margin-bottom: @spacing-md;
    font-size: @font-size-xl;
  }

  p {
    color: @gray-600;
    line-height: 1.6;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: @spacing-lg;
  margin-bottom: @spacing-xl;
}

.content-card {
  background: @gray-50;
  padding: @spacing-md;
  border-radius: @border-radius-md;
  border-left: 4px solid @success-color;

  h4 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.state-info,
.params-info {
  font-size: @font-size-sm;
}

.state-item,
.param-item {
  margin-bottom: @spacing-sm;

  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: @gray-700;
    margin-right: @spacing-sm;
  }
}

.interactive-section {
  margin-bottom: @spacing-xl;

  h4 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.demo-controls {
  display: grid;
  gap: @spacing-md;
}

.control-group {
  display: flex;
  align-items: center;
  gap: @spacing-md;

  label {
    min-width: 80px;
    font-weight: 500;
    color: @gray-700;
  }
}

.counter {
  display: flex;
  align-items: center;
  gap: @spacing-sm;

  &-value {
    min-width: 40px;
    text-align: center;
    font-weight: 600;
    color: @success-color;
    font-size: @font-size-lg;
  }
}

.data-section {
  margin-bottom: @spacing-xl;

  h4 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.data-display {
  background: @gray-900;
  color: @gray-100;
  padding: @spacing-md;
  border-radius: @border-radius-md;
  overflow-x: auto;
  font-size: @font-size-sm;
  line-height: 1.5;
}

.navigation-section {
  h4 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-lg;
  }
}

.nav-actions {
  display: flex;
  gap: @spacing-md;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: @spacing-sm;

    label {
      min-width: auto;
    }
  }

  .nav-actions {
    flex-direction: column;
  }

  .nav-actions .btn {
    width: 100%;
  }
}
</style>
