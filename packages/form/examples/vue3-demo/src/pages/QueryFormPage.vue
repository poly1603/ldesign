<template>
  <div class="page-container">
    <header class="page-header">
      <h1 class="page-title">查询表单示例</h1>
      <p class="page-description">展示查询表单的展开/收起功能、智能按钮布局和响应式设计</p>
    </header>

    <div class="content-layout">
      <!-- 功能介绍 -->
      <section class="feature-intro">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">查询表单特性</h2>
            <p class="card-description">专为查询场景设计的高效表单组件</p>
          </div>
          <div class="card-body">
            <div class="feature-grid">
              <div class="feature-item">
                <div class="feature-icon">📋</div>
                <h3>智能布局</h3>
                <p>自动计算按钮组位置，支持行内和独占行两种模式</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">🔄</div>
                <h3>展开收起</h3>
                <p>默认显示指定行数，支持展开显示全部字段</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">📱</div>
                <h3>响应式设计</h3>
                <p>自动适配不同屏幕尺寸，移动端友好</p>
              </div>
              <div class="feature-item">
                <div class="feature-icon">⚡</div>
                <h3>高性能</h3>
                <p>优化的渲染逻辑，流畅的动画效果</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 查询表单演示 -->
      <section class="demo-section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">用户查询表单</h2>
            <p class="card-description">演示查询表单的基本用法和功能</p>
          </div>
          <div class="card-body">
            <!-- 模拟查询表单组件 -->
            <div class="query-form-demo">
              <div class="form-note">
                <p><strong>注意：</strong>这是一个演示页面，展示了 LDesignQueryForm 组件的预期用法。</p>
                <p>在实际项目中，您需要先构建 @ldesign/form 包才能使用真实的组件。</p>
              </div>

              <form @submit.prevent="handleSubmit" class="demo-query-form">
                <div 
                  class="query-form-grid" 
                  :style="{ 
                    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
                    gap: `${gutter}px`
                  }"
                >
                  <!-- 用户名 -->
                  <div class="form-field">
                    <label class="form-label">用户名</label>
                    <input 
                      type="text" 
                      class="form-input" 
                      v-model="queryData.username" 
                      placeholder="请输入用户名"
                    />
                  </div>

                  <!-- 邮箱 -->
                  <div class="form-field">
                    <label class="form-label">邮箱</label>
                    <input 
                      type="email" 
                      class="form-input" 
                      v-model="queryData.email" 
                      placeholder="请输入邮箱"
                    />
                  </div>

                  <!-- 状态 -->
                  <div class="form-field">
                    <label class="form-label">状态</label>
                    <select class="form-select" v-model="queryData.status">
                      <option value="">请选择状态</option>
                      <option value="active">活跃</option>
                      <option value="inactive">非活跃</option>
                      <option value="pending">待审核</option>
                    </select>
                  </div>

                  <!-- 创建时间 -->
                  <div class="form-field">
                    <label class="form-label">创建时间</label>
                    <input 
                      type="date" 
                      class="form-input" 
                      v-model="queryData.createDate"
                    />
                  </div>

                  <!-- 隐藏字段 -->
                  <template v-if="!collapsed">
                    <!-- 部门 -->
                    <div class="form-field">
                      <label class="form-label">部门</label>
                      <select class="form-select" v-model="queryData.department">
                        <option value="">请选择部门</option>
                        <option value="tech">技术部</option>
                        <option value="sales">销售部</option>
                        <option value="hr">人事部</option>
                        <option value="finance">财务部</option>
                      </select>
                    </div>

                    <!-- 职位 -->
                    <div class="form-field">
                      <label class="form-label">职位</label>
                      <input 
                        type="text" 
                        class="form-input" 
                        v-model="queryData.position" 
                        placeholder="请输入职位"
                      />
                    </div>

                    <!-- 年龄范围 -->
                    <div class="form-field">
                      <label class="form-label">年龄范围</label>
                      <div class="form-input-group">
                        <input 
                          type="number" 
                          class="form-input" 
                          v-model.number="queryData.minAge" 
                          placeholder="最小年龄" 
                          min="0" 
                          max="120"
                        />
                        <span class="form-input-separator">-</span>
                        <input 
                          type="number" 
                          class="form-input" 
                          v-model.number="queryData.maxAge" 
                          placeholder="最大年龄" 
                          min="0" 
                          max="120"
                        />
                      </div>
                    </div>

                    <!-- 备注 -->
                    <div class="form-field" style="grid-column: span 2;">
                      <label class="form-label">备注</label>
                      <input 
                        type="text" 
                        class="form-input" 
                        v-model="queryData.remark" 
                        placeholder="请输入备注信息"
                      />
                    </div>
                  </template>

                  <!-- 按钮组 -->
                  <div 
                    class="query-form-actions"
                    :class="{ 'full-row': shouldActionFullRow }"
                    :style="actionStyles"
                  >
                    <div class="query-form-actions-content">
                      <div class="primary-actions">
                        <button 
                          type="submit" 
                          class="btn btn-primary"
                          :disabled="isSubmitting"
                        >
                          {{ isSubmitting ? '查询中...' : '查询' }}
                        </button>
                        <button 
                          type="button" 
                          class="btn btn-secondary"
                          @click="handleReset"
                        >
                          重置
                        </button>
                      </div>
                      <div class="collapse-actions">
                        <button 
                          type="button" 
                          class="btn btn-text"
                          @click="toggleCollapse"
                        >
                          <span>{{ collapsed ? '展开' : '收起' }}</span>
                          <svg 
                            class="collapse-icon"
                            :class="{ 'is-expanded': !collapsed }"
                            viewBox="0 0 16 16" 
                            width="16" 
                            height="16"
                          >
                            <path d="M8 10.5L4 6.5h8L8 10.5z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <!-- 状态显示 -->
      <section class="status-section">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">表单状态</h3>
            <p class="card-description">实时显示表单的各种状态</p>
          </div>
          <div class="card-body">
            <div class="status-grid">
              <div class="status-item">
                <span class="status-label">展开状态:</span>
                <span 
                  class="status-value"
                  :class="{ collapsed: collapsed, expanded: !collapsed }"
                >
                  {{ collapsed ? '收起' : '展开' }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">字段数量:</span>
                <span class="status-value">
                  {{ visibleFieldCount }} / {{ totalFieldCount }}
                </span>
              </div>
              <div class="status-item">
                <span class="status-label">表单状态:</span>
                <span 
                  class="status-value"
                  :class="{ dirty: isDirty, pristine: !isDirty }"
                >
                  {{ isDirty ? '已修改' : '未修改' }}
                </span>
              </div>
            </div>

            <div class="data-preview">
              <h4>查询数据</h4>
              <pre>{{ JSON.stringify(queryData, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </section>

      <!-- 代码示例 -->
      <section class="code-section">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">代码示例</h3>
            <p class="card-description">查看如何使用查询表单组件</p>
          </div>
          <div class="card-body">
            <div class="code-tabs">
              <button 
                class="code-tab"
                :class="{ active: activeTab === 'template' }"
                @click="activeTab = 'template'"
              >
                Template
              </button>
              <button 
                class="code-tab"
                :class="{ active: activeTab === 'script' }"
                @click="activeTab = 'script'"
              >
                Script
              </button>
              <button 
                class="code-tab"
                :class="{ active: activeTab === 'usage' }"
                @click="activeTab = 'usage'"
              >
                Usage
              </button>
            </div>
            <div class="code-content">
              <div v-show="activeTab === 'template'" class="code-panel">
                <pre><code>&lt;template&gt;
  &lt;LDesignQueryForm
    :fields="queryFields"
    v-model="queryData"
    :default-row-count="2"
    :col-count="4"
    :collapsed="true"
    @submit="handleSubmit"
    @reset="handleReset"
    @collapse="handleCollapse"
  /&gt;
&lt;/template&gt;</code></pre>
              </div>
              <div v-show="activeTab === 'script'" class="code-panel">
                <pre><code>&lt;script setup&gt;
import { ref, reactive } from 'vue'
import { LDesignQueryForm } from '@ldesign/form'

const queryData = reactive({
  username: '',
  email: '',
  status: '',
  createDate: ''
})

const queryFields = [
  { name: 'username', label: '用户名', component: 'input' },
  { name: 'email', label: '邮箱', component: 'input' },
  { name: 'status', label: '状态', component: 'select' },
  { name: 'createDate', label: '创建时间', component: 'date' }
]

const handleSubmit = (data, valid) => {
  console.log('查询:', data, valid)
}
&lt;/script&gt;</code></pre>
              </div>
              <div v-show="activeTab === 'usage'" class="code-panel">
                <pre><code>// 基本用法
import { LDesignQueryForm } from '@ldesign/form'

// 字段配置
const fields = [
  {
    name: 'username',
    label: '用户名',
    component: 'input',
    props: { placeholder: '请输入用户名' }
  },
  {
    name: 'status',
    label: '状态',
    component: 'select',
    props: {
      options: [
        { label: '活跃', value: 'active' },
        { label: '非活跃', value: 'inactive' }
      ]
    }
  }
]

// 事件处理
const handleSubmit = (data, valid) => {
  if (valid) {
    // 执行查询逻辑
    console.log('查询数据:', data)
  }
}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// 表单配置
const colCount = ref(4)
const gutter = ref(16)
const collapsed = ref(true)
const isSubmitting = ref(false)
const activeTab = ref('template')

// 查询数据
const queryData = reactive({
  username: '',
  email: '',
  status: '',
  createDate: '',
  department: '',
  position: '',
  minAge: null as number | null,
  maxAge: null as number | null,
  remark: ''
})

// 初始数据
const initialData = {
  username: '',
  email: '',
  status: '',
  createDate: '',
  department: '',
  position: '',
  minAge: null,
  maxAge: null,
  remark: ''
}

// 计算属性
const totalFieldCount = 8
const visibleFieldCount = computed(() => {
  return collapsed.value ? 4 : totalFieldCount
})

const isDirty = computed(() => {
  return JSON.stringify(queryData) !== JSON.stringify(initialData)
})

const shouldActionFullRow = computed(() => {
  const visibleFields = collapsed.value ? 4 : totalFieldCount
  const remainingCols = colCount.value - (visibleFields % colCount.value)
  return remainingCols < 2
})

const actionStyles = computed(() => {
  if (shouldActionFullRow.value) {
    return { gridColumn: '1 / -1' }
  }
  
  const visibleFields = collapsed.value ? 4 : totalFieldCount
  const currentCol = (visibleFields % colCount.value) + 1
  return { gridColumn: `${currentCol} / -1` }
})

// 方法
const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const handleSubmit = async () => {
  isSubmitting.value = true
  
  // 模拟查询
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  isSubmitting.value = false
  
  const hasData = Object.values(queryData).some(value => 
    value !== '' && value !== null && value !== undefined
  )
  
  if (hasData) {
    alert(`查询成功！找到 ${Math.floor(Math.random() * 50) + 1} 条记录\n\n` + 
          JSON.stringify(queryData, null, 2))
  } else {
    alert('请至少填写一个查询条件')
  }
}

const handleReset = () => {
  Object.assign(queryData, initialData)
  alert('表单已重置')
}
</script>

<style scoped>
.content-layout {
  max-width: 1200px;
  margin: 0 auto;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--ls-spacing-lg);
}

.feature-item {
  text-align: center;
  padding: var(--ls-spacing-lg);
  background: var(--ldesign-bg-color-page);
  border-radius: var(--ls-border-radius-base);
  border: 1px solid var(--ldesign-border-color);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: var(--ls-spacing-base);
}

.feature-item h3 {
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-sm);
}

.feature-item p {
  color: var(--ldesign-text-color-secondary);
  line-height: 1.5;
}

.form-note {
  background: var(--ldesign-brand-color-1);
  border: 1px solid var(--ldesign-brand-color-3);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-base);
  margin-bottom: var(--ls-spacing-lg);
}

.form-note p {
  margin-bottom: var(--ls-spacing-xs);
  color: var(--ldesign-brand-color-8);
  font-size: var(--ls-font-size-sm);
}

.form-note p:last-child {
  margin-bottom: 0;
}

.query-form-grid {
  display: grid;
  align-items: end;
}

.query-form-actions {
  display: flex;
  align-items: center;
  min-height: var(--ls-input-height-medium);
}

.query-form-actions-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: var(--ls-spacing-sm);
}

.primary-actions {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-sm);
}

.collapse-actions {
  display: flex;
  align-items: center;
}

.query-form-actions.full-row .collapse-actions {
  margin-left: auto;
}

.collapse-icon {
  margin-left: var(--ls-spacing-xs);
  transition: transform 0.3s ease-in-out;
}

.collapse-icon.is-expanded {
  transform: rotate(180deg);
}

.form-input-group {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
}

.form-input-separator {
  color: var(--ldesign-text-color-secondary);
  font-weight: 500;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--ls-spacing-base);
  margin-bottom: var(--ls-spacing-lg);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-spacing-sm);
  background: var(--ldesign-bg-color-page);
  border-radius: var(--ls-border-radius-sm);
  border: 1px solid var(--ldesign-border-color);
}

.status-label {
  font-weight: 500;
  color: var(--ldesign-text-color-secondary);
}

.status-value {
  font-weight: 600;
  padding: 2px var(--ls-spacing-xs);
  border-radius: var(--ls-border-radius-sm);
}

.status-value.collapsed {
  background: var(--ldesign-warning-color);
  color: white;
}

.status-value.expanded {
  background: var(--ldesign-success-color);
  color: white;
}

.status-value.dirty {
  background: var(--ldesign-brand-color-6);
  color: white;
}

.status-value.pristine {
  background: var(--ldesign-gray-color-3);
  color: var(--ldesign-text-color-primary);
}

.data-preview h4 {
  margin-bottom: var(--ls-spacing-sm);
  color: var(--ldesign-text-color-primary);
}

.data-preview pre {
  background: var(--ldesign-bg-color-page);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-base);
  font-size: var(--ls-font-size-sm);
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

.code-tabs {
  display: flex;
  border-bottom: 1px solid var(--ldesign-border-color);
  margin-bottom: var(--ls-spacing-base);
}

.code-tab {
  padding: var(--ls-spacing-sm) var(--ls-spacing-base);
  border: none;
  background: none;
  color: var(--ldesign-text-color-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.code-tab:hover {
  color: var(--ldesign-text-color-primary);
}

.code-tab.active {
  color: var(--ldesign-brand-color-6);
  border-bottom-color: var(--ldesign-brand-color-6);
}

.code-panel pre {
  background: var(--ldesign-bg-color-page);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-base);
  overflow-x: auto;
  font-size: var(--ls-font-size-sm);
  line-height: 1.5;
}

.code-panel code {
  color: var(--ldesign-text-color-primary);
}

@media (max-width: 992px) {
  .status-grid {
    grid-template-columns: 1fr;
  }
  
  .query-form-actions.full-row .query-form-actions-content {
    flex-direction: column;
    align-items: stretch;
    gap: var(--ls-spacing-sm);
  }
  
  .query-form-actions.full-row .primary-actions {
    justify-content: center;
  }
  
  .query-form-actions.full-row .collapse-actions {
    margin-left: 0;
    justify-content: center;
  }
}
</style>
