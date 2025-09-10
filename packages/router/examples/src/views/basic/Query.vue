<template>
  <div class="query-demo">
    <h2 class="page-title">查询参数演示</h2>
    <p class="page-description">
      掌握查询参数的处理，实现复杂的数据传递和状态管理
    </p>

    <!-- 当前查询参数显示 -->
    <section class="demo-section">
      <h3 class="section-title">当前查询参数</h3>
      <div class="demo-content">
        <div class="query-display">
          <div class="query-item">
            <label class="query-label">完整查询字符串:</label>
            <code class="query-value">{{ route.fullPath.split('?')[1] || '无' }}</code>
          </div>
          <div class="query-item">
            <label class="query-label">解析后的查询对象:</label>
            <code class="query-value">{{ JSON.stringify(route.query, null, 2) }}</code>
          </div>
        </div>
      </div>
    </section>

    <!-- 查询参数操作 -->
    <section class="demo-section">
      <h3 class="section-title">查询参数操作</h3>
      <div class="demo-content">
        <div class="query-form">
          <div class="form-row">
            <label class="form-label">搜索关键词:</label>
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-input"
              placeholder="输入搜索关键词"
              @input="updateQuery"
            />
          </div>
          
          <div class="form-row">
            <label class="form-label">分类:</label>
            <select v-model="categoryQuery" class="form-select" @change="updateQuery">
              <option value="">全部分类</option>
              <option value="tech">技术</option>
              <option value="design">设计</option>
              <option value="business">商业</option>
            </select>
          </div>
          
          <div class="form-row">
            <label class="form-label">排序方式:</label>
            <select v-model="sortQuery" class="form-select" @change="updateQuery">
              <option value="date">按日期</option>
              <option value="name">按名称</option>
              <option value="popularity">按热度</option>
            </select>
          </div>
          
          <div class="form-row">
            <label class="form-label">每页数量:</label>
            <input 
              v-model.number="pageSizeQuery" 
              type="number" 
              class="form-input"
              min="5"
              max="50"
              @input="updateQuery"
            />
          </div>
          
          <div class="form-row">
            <label class="form-label">显示详情:</label>
            <input 
              v-model="showDetailsQuery" 
              type="checkbox" 
              class="form-checkbox"
              @change="updateQuery"
            />
          </div>
        </div>
        
        <div class="query-actions">
          <button @click="clearQuery" class="action-btn secondary">
            <span class="btn-icon">🗑️</span>
            <span class="btn-text">清空参数</span>
          </button>
          
          <button @click="setPresetQuery" class="action-btn primary">
            <span class="btn-icon">⚙️</span>
            <span class="btn-text">预设参数</span>
          </button>
          
          <button @click="copyUrl" class="action-btn info">
            <span class="btn-icon">📋</span>
            <span class="btn-text">复制链接</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 查询参数示例 -->
    <section class="demo-section">
      <h3 class="section-title">常用查询参数示例</h3>
      <div class="demo-content">
        <div class="example-grid">
          <div 
            v-for="example in queryExamples" 
            :key="example.id"
            class="example-card"
            @click="applyExample(example.query)"
          >
            <div class="card-header">
              <span class="card-icon">{{ example.icon }}</span>
              <h4 class="card-title">{{ example.title }}</h4>
            </div>
            <p class="card-description">{{ example.description }}</p>
            <code class="card-query">{{ example.queryString }}</code>
          </div>
        </div>
      </div>
    </section>

    <!-- 查询结果模拟 -->
    <section class="demo-section">
      <h3 class="section-title">基于查询参数的内容展示</h3>
      <div class="demo-content">
        <div class="result-display">
          <div class="result-header">
            <h4 class="result-title">搜索结果</h4>
            <span class="result-count">找到 {{ filteredResults.length }} 条结果</span>
          </div>
          
          <div class="result-filters">
            <span class="filter-tag" v-if="searchQuery">
              搜索: {{ searchQuery }}
            </span>
            <span class="filter-tag" v-if="categoryQuery">
              分类: {{ getCategoryName(categoryQuery) }}
            </span>
            <span class="filter-tag" v-if="sortQuery !== 'date'">
              排序: {{ getSortName(sortQuery) }}
            </span>
          </div>
          
          <div class="result-list">
            <div 
              v-for="item in paginatedResults" 
              :key="item.id"
              class="result-item"
            >
              <div class="item-header">
                <span class="item-icon">{{ item.icon }}</span>
                <h5 class="item-title">{{ item.title }}</h5>
                <span class="item-category">{{ item.category }}</span>
              </div>
              <p v-if="showDetailsQuery" class="item-description">
                {{ item.description }}
              </p>
              <div class="item-meta">
                <span class="meta-date">{{ item.date }}</span>
                <span class="meta-popularity">热度: {{ item.popularity }}</span>
              </div>
            </div>
          </div>
          
          <div class="result-pagination">
            <span class="pagination-info">
              显示 {{ Math.min(pageSizeQuery, filteredResults.length) }} / {{ filteredResults.length }} 条结果
            </span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'

const route = useRoute()
const router = useRouter()

// 查询参数状态
const searchQuery = ref(route.query.search as string || '')
const categoryQuery = ref(route.query.category as string || '')
const sortQuery = ref(route.query.sort as string || 'date')
const pageSizeQuery = ref(Number(route.query.pageSize) || 10)
const showDetailsQuery = ref(route.query.details === 'true')

// 模拟数据
const mockData = ref([
  { id: 1, title: 'Vue 3 路由指南', category: 'tech', icon: '📚', description: '详细介绍 Vue 3 路由的使用方法', date: '2024-01-15', popularity: 95 },
  { id: 2, title: 'UI 设计原则', category: 'design', icon: '🎨', description: '现代 UI 设计的基本原则和最佳实践', date: '2024-01-10', popularity: 88 },
  { id: 3, title: '商业模式创新', category: 'business', icon: '💼', description: '探讨现代商业模式的创新思路', date: '2024-01-08', popularity: 76 },
  { id: 4, title: 'TypeScript 进阶', category: 'tech', icon: '⚡', description: 'TypeScript 高级特性和实践技巧', date: '2024-01-12', popularity: 92 },
  { id: 5, title: '用户体验设计', category: 'design', icon: '👥', description: '以用户为中心的设计方法论', date: '2024-01-05', popularity: 85 }
])

// 查询示例
const queryExamples = ref([
  {
    id: 'search',
    title: '搜索查询',
    description: '基本的搜索功能',
    icon: '🔍',
    query: { search: 'Vue', sort: 'popularity' },
    queryString: '?search=Vue&sort=popularity'
  },
  {
    id: 'filter',
    title: '分类筛选',
    description: '按分类筛选内容',
    icon: '📂',
    query: { category: 'tech', pageSize: '5' },
    queryString: '?category=tech&pageSize=5'
  },
  {
    id: 'detailed',
    title: '详细视图',
    description: '显示详细信息',
    icon: '📋',
    query: { details: 'true', sort: 'name' },
    queryString: '?details=true&sort=name'
  },
  {
    id: 'complex',
    title: '复合查询',
    description: '多个参数组合',
    icon: '⚙️',
    query: { search: 'design', category: 'design', sort: 'date', pageSize: '3', details: 'true' },
    queryString: '?search=design&category=design&sort=date&pageSize=3&details=true'
  }
])

// 计算属性
const filteredResults = computed(() => {
  let results = [...mockData.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const search = searchQuery.value.toLowerCase()
    results = results.filter(item => 
      item.title.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search)
    )
  }
  
  // 分类过滤
  if (categoryQuery.value) {
    results = results.filter(item => item.category === categoryQuery.value)
  }
  
  // 排序
  results.sort((a, b) => {
    switch (sortQuery.value) {
      case 'name':
        return a.title.localeCompare(b.title)
      case 'popularity':
        return b.popularity - a.popularity
      case 'date':
      default:
        return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
  })
  
  return results
})

const paginatedResults = computed(() => {
  return filteredResults.value.slice(0, pageSizeQuery.value)
})

// 方法
const updateQuery = () => {
  const query: Record<string, any> = {}
  
  if (searchQuery.value) query.search = searchQuery.value
  if (categoryQuery.value) query.category = categoryQuery.value
  if (sortQuery.value !== 'date') query.sort = sortQuery.value
  if (pageSizeQuery.value !== 10) query.pageSize = String(pageSizeQuery.value)
  if (showDetailsQuery.value) query.details = 'true'
  
  router.replace({ query })
}

const clearQuery = () => {
  searchQuery.value = ''
  categoryQuery.value = ''
  sortQuery.value = 'date'
  pageSizeQuery.value = 10
  showDetailsQuery.value = false
  router.replace({ query: {} })
}

const setPresetQuery = () => {
  const preset = {
    search: 'Vue',
    category: 'tech',
    sort: 'popularity',
    pageSize: '5',
    details: 'true'
  }
  
  searchQuery.value = preset.search
  categoryQuery.value = preset.category
  sortQuery.value = preset.sort
  pageSizeQuery.value = Number(preset.pageSize)
  showDetailsQuery.value = preset.details === 'true'
  
  router.replace({ query: preset })
}

const applyExample = (query: Record<string, any>) => {
  searchQuery.value = query.search || ''
  categoryQuery.value = query.category || ''
  sortQuery.value = query.sort || 'date'
  pageSizeQuery.value = Number(query.pageSize) || 10
  showDetailsQuery.value = query.details === 'true'
  
  router.replace({ query })
}

const copyUrl = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    // 显示成功提示
    const event = new CustomEvent('notification:show', {
      detail: {
        type: 'success',
        message: '链接已复制到剪贴板'
      }
    })
    window.dispatchEvent(event)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

const getCategoryName = (category: string) => {
  const names: Record<string, string> = {
    tech: '技术',
    design: '设计',
    business: '商业'
  }
  return names[category] || category
}

const getSortName = (sort: string) => {
  const names: Record<string, string> = {
    date: '按日期',
    name: '按名称',
    popularity: '按热度'
  }
  return names[sort] || sort
}

// 监听路由变化，同步状态
watch(() => route.query, (newQuery) => {
  searchQuery.value = newQuery.search as string || ''
  categoryQuery.value = newQuery.category as string || ''
  sortQuery.value = newQuery.sort as string || 'date'
  pageSizeQuery.value = Number(newQuery.pageSize) || 10
  showDetailsQuery.value = newQuery.details === 'true'
}, { immediate: true })
</script>

<style lang="less" scoped>
.query-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: var(--ls-font-size-h2);
  margin-bottom: var(--ls-margin-base);
  color: var(--ldesign-text-color-primary);
}

.page-description {
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-secondary);
  margin-bottom: var(--ls-margin-xl);
  line-height: 1.6;
}

.demo-section {
  margin-bottom: var(--ls-margin-xxl);
  
  .section-title {
    font-size: var(--ls-font-size-lg);
    font-weight: 600;
    margin-bottom: var(--ls-margin-base);
    color: var(--ldesign-text-color-primary);
  }
  
  .demo-content {
    .card();
  }
}

.query-display {
  .query-item {
    margin-bottom: var(--ls-margin-base);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .query-label {
      display: block;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-margin-xs);
    }
    
    .query-value {
      display: block;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      background-color: var(--ldesign-gray-color-1);
      padding: var(--ls-padding-sm);
      .border-radius();
      color: var(--ldesign-brand-color);
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

.query-form {
  margin-bottom: var(--ls-margin-lg);
  
  .form-row {
    .flex-center();
    gap: var(--ls-spacing-base);
    margin-bottom: var(--ls-margin-base);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .form-label {
      min-width: 100px;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }
    
    .form-input,
    .form-select {
      .input-base();
      flex: 1;
      max-width: 300px;
    }
    
    .form-checkbox {
      width: 20px;
      height: 20px;
      accent-color: var(--ldesign-brand-color);
    }
  }
}

.query-actions {
  .flex-center();
  gap: var(--ls-spacing-base);
  flex-wrap: wrap;
  
  .action-btn {
    .flex-center();
    gap: var(--ls-spacing-xs);
    padding: var(--ls-padding-sm) var(--ls-padding-base);
    .border-radius();
    .transition();
    border: none;
    cursor: pointer;
    font-weight: 500;
    
    &.primary {
      .button-primary();
    }
    
    &.secondary {
      .button-secondary();
    }
    
    &.info {
      background-color: var(--ldesign-brand-color);
      color: white;
      
      &:hover {
        background-color: var(--ldesign-brand-color-hover);
      }
    }
  }
}

.example-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--ls-spacing-base);
  
  .example-card {
    .card();
    cursor: pointer;
    .transition();
    border: 2px solid var(--ldesign-border-color);
    
    &:hover {
      border-color: var(--ldesign-brand-color);
      transform: translateY(-2px);
    }
    
    .card-header {
      .flex-center();
      gap: var(--ls-spacing-sm);
      margin-bottom: var(--ls-margin-sm);
      
      .card-icon {
        font-size: var(--ls-font-size-lg);
      }
      
      .card-title {
        font-size: var(--ls-font-size-base);
        font-weight: 600;
        margin: 0;
        color: var(--ldesign-text-color-primary);
      }
    }
    
    .card-description {
      color: var(--ldesign-text-color-secondary);
      font-size: var(--ls-font-size-sm);
      margin-bottom: var(--ls-margin-sm);
      line-height: 1.5;
    }
    
    .card-query {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: var(--ls-font-size-xs);
      background-color: var(--ldesign-gray-color-1);
      padding: 4px 8px;
      .border-radius(3px);
      color: var(--ldesign-brand-color);
      word-break: break-all;
    }
  }
}

.result-display {
  .result-header {
    .flex-between();
    margin-bottom: var(--ls-margin-base);
    
    .result-title {
      font-size: var(--ls-font-size-lg);
      font-weight: 600;
      margin: 0;
      color: var(--ldesign-text-color-primary);
    }
    
    .result-count {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
    }
  }
  
  .result-filters {
    .flex-center();
    gap: var(--ls-spacing-sm);
    margin-bottom: var(--ls-margin-base);
    flex-wrap: wrap;
    
    .filter-tag {
      font-size: var(--ls-font-size-xs);
      padding: 4px 8px;
      background-color: var(--ldesign-brand-color-focus);
      color: var(--ldesign-brand-color);
      .border-radius(12px);
      font-weight: 500;
    }
  }
  
  .result-list {
    .result-item {
      padding: var(--ls-padding-base);
      border: 1px solid var(--ldesign-border-color);
      .border-radius();
      margin-bottom: var(--ls-margin-sm);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .item-header {
        .flex-between();
        margin-bottom: var(--ls-margin-sm);
        
        .item-icon {
          font-size: var(--ls-font-size-base);
          margin-right: var(--ls-margin-sm);
        }
        
        .item-title {
          flex: 1;
          font-size: var(--ls-font-size-base);
          font-weight: 600;
          margin: 0;
          color: var(--ldesign-text-color-primary);
        }
        
        .item-category {
          font-size: var(--ls-font-size-xs);
          padding: 2px 8px;
          background-color: var(--ldesign-gray-color-2);
          .border-radius(10px);
          color: var(--ldesign-text-color-secondary);
        }
      }
      
      .item-description {
        color: var(--ldesign-text-color-secondary);
        font-size: var(--ls-font-size-sm);
        line-height: 1.5;
        margin-bottom: var(--ls-margin-sm);
      }
      
      .item-meta {
        .flex-between();
        font-size: var(--ls-font-size-xs);
        color: var(--ldesign-text-color-placeholder);
      }
    }
  }
  
  .result-pagination {
    text-align: center;
    margin-top: var(--ls-margin-base);
    
    .pagination-info {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-secondary);
    }
  }
}

.mobile({
  .query-form {
    .form-row {
      .flex-column();
      align-items: stretch;
      gap: var(--ls-spacing-sm);
      
      .form-label {
        min-width: auto;
      }
      
      .form-input,
      .form-select {
        max-width: none;
      }
    }
  }
  
  .query-actions {
    .flex-column();
    
    .action-btn {
      width: 100%;
    }
  }
  
  .example-grid {
    grid-template-columns: 1fr;
  }
  
  .result-header {
    .flex-column();
    gap: var(--ls-spacing-sm);
    align-items: flex-start;
  }
  
  .result-item {
    .item-header {
      .flex-column();
      align-items: flex-start;
      gap: var(--ls-spacing-sm);
    }
    
    .item-meta {
      .flex-column();
      gap: var(--ls-spacing-xs);
      align-items: flex-start;
    }
  }
});
</style>
