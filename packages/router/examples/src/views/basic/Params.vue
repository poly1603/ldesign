<template>
  <div class="params-demo">
    <h2 class="page-title">路由参数演示</h2>
    <p class="page-description">
      了解如何定义和使用动态路由参数，实现灵活的页面路由
    </p>

    <!-- 当前参数显示 -->
    <section class="demo-section">
      <h3 class="section-title">当前路由参数</h3>
      <div class="demo-content">
        <div class="param-display">
          <div class="param-item">
            <label class="param-label">ID 参数:</label>
            <code class="param-value">{{ route.params.id || '未设置' }}</code>
          </div>
          <div class="param-item">
            <label class="param-label">所有参数:</label>
            <code class="param-value">{{ JSON.stringify(route.params) }}</code>
          </div>
        </div>
      </div>
    </section>

    <!-- 参数导航演示 -->
    <section class="demo-section">
      <h3 class="section-title">参数导航</h3>
      <div class="demo-content">
        <div class="nav-grid">
          <RouterLink 
            v-for="example in paramExamples" 
            :key="example.id"
            :to="example.path"
            class="param-link"
            :class="{ active: route.params.id === example.id }"
          >
            <div class="link-header">
              <span class="link-icon">{{ example.icon }}</span>
              <span class="link-title">{{ example.title }}</span>
            </div>
            <div class="link-description">{{ example.description }}</div>
            <code class="link-path">{{ example.path }}</code>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 编程式参数导航 -->
    <section class="demo-section">
      <h3 class="section-title">编程式参数导航</h3>
      <div class="demo-content">
        <div class="input-group">
          <label for="paramInput" class="input-label">输入参数值:</label>
          <input 
            id="paramInput"
            v-model="customParam" 
            type="text" 
            class="param-input"
            placeholder="输入任意参数值"
          />
          <button @click="navigateWithCustomParam" class="nav-btn">
            <span class="btn-icon">🚀</span>
            <span class="btn-text">导航</span>
          </button>
        </div>
        
        <div class="quick-actions">
          <button 
            v-for="action in quickActions" 
            :key="action.param"
            @click="navigateToParam(action.param)"
            class="quick-btn"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- 参数使用示例 -->
    <section class="demo-section">
      <h3 class="section-title">参数使用示例</h3>
      <div class="demo-content">
        <div class="example-content">
          <h4 class="content-title">根据参数显示不同内容</h4>
          <div class="dynamic-content">
            <div v-if="!route.params.id" class="placeholder">
              <span class="placeholder-icon">📝</span>
              <p class="placeholder-text">请选择一个参数来查看动态内容</p>
            </div>
            
            <div v-else class="content-display">
              <div class="content-header">
                <span class="content-icon">{{ getContentIcon(route.params.id) }}</span>
                <h5 class="content-title">{{ getContentTitle(route.params.id) }}</h5>
              </div>
              <p class="content-description">
                {{ getContentDescription(route.params.id) }}
              </p>
              <div class="content-meta">
                <span class="meta-item">参数: {{ route.params.id }}</span>
                <span class="meta-item">类型: {{ getContentType(route.params.id) }}</span>
                <span class="meta-item">时间: {{ new Date().toLocaleTimeString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'

const route = useRoute()
const router = useRouter()

// 自定义参数输入
const customParam = ref('')

// 参数示例
const paramExamples = ref([
  {
    id: 'user',
    title: '用户信息',
    description: '显示用户相关信息',
    icon: '👤',
    path: '/basic/params/user'
  },
  {
    id: 'product',
    title: '产品详情',
    description: '显示产品详细信息',
    icon: '📦',
    path: '/basic/params/product'
  },
  {
    id: 'article',
    title: '文章内容',
    description: '显示文章详细内容',
    icon: '📄',
    path: '/basic/params/article'
  },
  {
    id: 'category',
    title: '分类页面',
    description: '显示分类相关信息',
    icon: '📂',
    path: '/basic/params/category'
  }
])

// 快速操作
const quickActions = ref([
  { param: 'demo', label: '演示' },
  { param: 'test', label: '测试' },
  { param: '123', label: '数字' },
  { param: 'special-chars', label: '特殊字符' }
])

// 方法
const navigateWithCustomParam = () => {
  if (customParam.value.trim()) {
    router.push(`/basic/params/${encodeURIComponent(customParam.value.trim())}`)
  }
}

const navigateToParam = (param: string) => {
  router.push(`/basic/params/${param}`)
}

const getContentIcon = (param: string) => {
  const iconMap: Record<string, string> = {
    user: '👤',
    product: '📦',
    article: '📄',
    category: '📂',
    demo: '🎮',
    test: '🧪',
    '123': '🔢'
  }
  return iconMap[param] || '📋'
}

const getContentTitle = (param: string) => {
  const titleMap: Record<string, string> = {
    user: '用户信息页面',
    product: '产品详情页面',
    article: '文章详情页面',
    category: '分类列表页面',
    demo: '演示页面',
    test: '测试页面',
    '123': '数字参数页面'
  }
  return titleMap[param] || `参数页面: ${param}`
}

const getContentDescription = (param: string) => {
  const descMap: Record<string, string> = {
    user: '这里显示用户的详细信息，包括个人资料、设置等内容。',
    product: '这里显示产品的详细信息，包括价格、规格、评价等内容。',
    article: '这里显示文章的完整内容，包括标题、正文、评论等。',
    category: '这里显示分类下的所有项目，支持筛选和排序功能。',
    demo: '这是一个演示页面，用于展示路由参数的基本用法。',
    test: '这是一个测试页面，用于验证路由参数的各种功能。',
    '123': '这是一个数字参数页面，展示如何处理数字类型的参数。'
  }
  return descMap[param] || `这是一个动态生成的页面，当前参数值为: ${param}`
}

const getContentType = (param: string) => {
  if (/^\d+$/.test(param)) return '数字'
  if (param.includes('-')) return '连字符'
  if (param.length > 10) return '长文本'
  return '普通文本'
}
</script>

<style lang="less" scoped>
.params-demo {
  max-width: 900px;
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

.param-display {
  .param-item {
    .flex-between();
    padding: var(--ls-padding-sm) 0;
    border-bottom: 1px solid var(--ldesign-border-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    .param-label {
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }
    
    .param-value {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      background-color: var(--ldesign-gray-color-1);
      padding: 4px 8px;
      .border-radius(3px);
      color: var(--ldesign-brand-color);
    }
  }
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--ls-spacing-base);
  
  .param-link {
    .card();
    .transition();
    border: 2px solid var(--ldesign-border-color);
    
    &:hover {
      border-color: var(--ldesign-brand-color);
      transform: translateY(-2px);
    }
    
    &.active,
    &.router-link-active {
      border-color: var(--ldesign-brand-color);
      background-color: var(--ldesign-brand-color-focus);
    }
    
    .link-header {
      .flex-center();
      gap: var(--ls-spacing-sm);
      margin-bottom: var(--ls-margin-sm);
      
      .link-icon {
        font-size: var(--ls-font-size-lg);
      }
      
      .link-title {
        font-weight: 600;
        color: var(--ldesign-text-color-primary);
      }
    }
    
    .link-description {
      color: var(--ldesign-text-color-secondary);
      font-size: var(--ls-font-size-sm);
      margin-bottom: var(--ls-margin-sm);
      line-height: 1.5;
    }
    
    .link-path {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: var(--ls-font-size-xs);
      background-color: var(--ldesign-gray-color-1);
      padding: 2px 6px;
      .border-radius(3px);
      color: var(--ldesign-brand-color);
    }
  }
}

.input-group {
  .flex-center();
  gap: var(--ls-spacing-base);
  margin-bottom: var(--ls-margin-base);
  
  .input-label {
    font-weight: 600;
    color: var(--ldesign-text-color-primary);
    white-space: nowrap;
  }
  
  .param-input {
    .input-base();
    flex: 1;
    min-width: 200px;
  }
  
  .nav-btn {
    .button-primary();
    .flex-center();
    gap: var(--ls-spacing-xs);
    white-space: nowrap;
  }
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: var(--ls-spacing-sm);
  
  .quick-btn {
    .button-secondary();
    padding: var(--ls-padding-sm) var(--ls-padding-base);
    font-size: var(--ls-font-size-sm);
  }
}

.example-content {
  .content-title {
    font-size: var(--ls-font-size-base);
    font-weight: 600;
    margin-bottom: var(--ls-margin-base);
    color: var(--ldesign-text-color-primary);
  }
  
  .dynamic-content {
    min-height: 200px;
    
    .placeholder {
      .flex-center();
      .flex-column();
      gap: var(--ls-spacing-base);
      padding: var(--ls-padding-xl);
      text-align: center;
      
      .placeholder-icon {
        font-size: var(--ls-font-size-h1);
        opacity: 0.5;
      }
      
      .placeholder-text {
        color: var(--ldesign-text-color-secondary);
        font-size: var(--ls-font-size-base);
      }
    }
    
    .content-display {
      .content-header {
        .flex-center();
        gap: var(--ls-spacing-base);
        margin-bottom: var(--ls-margin-base);
        
        .content-icon {
          font-size: var(--ls-font-size-xl);
        }
        
        .content-title {
          font-size: var(--ls-font-size-lg);
          font-weight: 600;
          margin: 0;
          color: var(--ldesign-text-color-primary);
        }
      }
      
      .content-description {
        color: var(--ldesign-text-color-secondary);
        line-height: 1.6;
        margin-bottom: var(--ls-margin-base);
      }
      
      .content-meta {
        .flex-center();
        gap: var(--ls-spacing-base);
        flex-wrap: wrap;
        
        .meta-item {
          font-size: var(--ls-font-size-xs);
          padding: 4px 8px;
          background-color: var(--ldesign-gray-color-1);
          .border-radius(12px);
          color: var(--ldesign-text-color-secondary);
        }
      }
    }
  }
}

.mobile({
  .nav-grid {
    grid-template-columns: 1fr;
  }
  
  .input-group {
    .flex-column();
    align-items: stretch;
    
    .param-input {
      min-width: auto;
    }
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .param-display {
    .param-item {
      .flex-column();
      gap: var(--ls-spacing-xs);
      align-items: flex-start;
    }
  }
  
  .content-meta {
    .flex-column();
    align-items: flex-start;
  }
});
</style>
