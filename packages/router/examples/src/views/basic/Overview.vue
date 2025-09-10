<template>
  <div class="basic-overview">
    <!-- 概览介绍 -->
    <section class="overview-intro">
      <h2 class="section-title">基础功能概览</h2>
      <p class="section-description">
        @ldesign/router 提供了完整的路由功能，包括路由配置、导航、参数传递等核心特性。
        本节将通过实际示例展示这些基础功能的使用方法。
      </p>
    </section>

    <!-- 功能卡片 -->
    <section class="features-grid">
      <div 
        v-for="feature in features" 
        :key="feature.id"
        class="feature-card"
        @click="navigateToFeature(feature.path)"
      >
        <div class="card-header">
          <div class="card-icon">{{ feature.icon }}</div>
          <h3 class="card-title">{{ feature.title }}</h3>
          <span v-if="feature.status" class="card-status" :class="feature.status">
            {{ getStatusText(feature.status) }}
          </span>
        </div>
        
        <p class="card-description">{{ feature.description }}</p>
        
        <div class="card-examples">
          <h4 class="examples-title">示例内容:</h4>
          <ul class="examples-list">
            <li v-for="example in feature.examples" :key="example">
              {{ example }}
            </li>
          </ul>
        </div>
        
        <div class="card-footer">
          <button class="demo-btn" @click.stop="openDemo(feature.demo)">
            <span class="btn-icon">🎮</span>
            <span class="btn-text">在线演示</span>
          </button>
          <RouterLink :to="feature.path" class="learn-btn">
            <span class="btn-text">了解更多</span>
            <span class="btn-icon">→</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-start">
      <h2 class="section-title">快速开始</h2>
      <div class="start-steps">
        <div 
          v-for="(step, index) in quickStartSteps" 
          :key="step.id"
          class="step-item"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <h3 class="step-title">{{ step.title }}</h3>
            <p class="step-description">{{ step.description }}</p>
            <div v-if="step.code" class="step-code">
              <pre><code>{{ step.code }}</code></pre>
            </div>
            <RouterLink 
              v-if="step.link" 
              :to="step.link.path" 
              class="step-link"
            >
              {{ step.link.text }}
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 路由信息展示 -->
    <section class="route-info">
      <h2 class="section-title">当前路由信息</h2>
      <div class="info-grid">
        <div class="info-item">
          <label class="info-label">路径:</label>
          <code class="info-value">{{ route.path }}</code>
        </div>
        <div class="info-item">
          <label class="info-label">名称:</label>
          <code class="info-value">{{ route.name || '未设置' }}</code>
        </div>
        <div class="info-item">
          <label class="info-label">参数:</label>
          <code class="info-value">{{ JSON.stringify(route.params) }}</code>
        </div>
        <div class="info-item">
          <label class="info-label">查询:</label>
          <code class="info-value">{{ JSON.stringify(route.query) }}</code>
        </div>
        <div class="info-item">
          <label class="info-label">哈希:</label>
          <code class="info-value">{{ route.hash || '无' }}</code>
        </div>
        <div class="info-item">
          <label class="info-label">元信息:</label>
          <code class="info-value">{{ JSON.stringify(route.meta) }}</code>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from '@ldesign/router'

/**
 * 基础功能概览页面
 * 
 * 功能特性：
 * 1. 功能介绍和导航
 * 2. 快速开始指南
 * 3. 路由信息展示
 * 4. 在线演示链接
 */

const route = useRoute()
const router = useRouter()

// 功能特性数据
const features = ref([
  {
    id: 'navigation',
    title: '导航功能',
    icon: '🧭',
    description: '学习如何使用 RouterLink 组件和编程式导航进行页面跳转',
    status: 'stable',
    path: '/basic/navigation',
    demo: 'navigation-demo',
    examples: [
      'RouterLink 组件使用',
      '编程式导航 (push/replace)',
      '导航守卫',
      '导航历史管理'
    ]
  },
  {
    id: 'params',
    title: '路由参数',
    icon: '🔗',
    description: '了解如何定义和使用动态路由参数，实现灵活的页面路由',
    status: 'stable',
    path: '/basic/params/demo',
    demo: 'params-demo',
    examples: [
      '动态路由参数定义',
      '参数获取和使用',
      '可选参数',
      '参数验证'
    ]
  },
  {
    id: 'query',
    title: '查询参数',
    icon: '❓',
    description: '掌握查询参数的处理，实现复杂的数据传递和状态管理',
    status: 'stable',
    path: '/basic/query',
    demo: 'query-demo',
    examples: [
      '查询参数设置',
      '参数解析和类型转换',
      '参数同步',
      'URL 状态管理'
    ]
  }
])

// 快速开始步骤
const quickStartSteps = ref([
  {
    id: 'install',
    title: '安装路由器',
    description: '首先安装 @ldesign/router 包',
    code: 'pnpm add @ldesign/router'
  },
  {
    id: 'setup',
    title: '创建路由器',
    description: '配置路由器实例和路由规则',
    code: `import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
})`,
    link: {
      path: '/basic/navigation',
      text: '查看导航示例'
    }
  },
  {
    id: 'use',
    title: '使用路由器',
    description: '在 Vue 应用中安装和使用路由器',
    code: `app.use(router)
app.mount('#app')`,
    link: {
      path: '/basic/params/demo',
      text: '查看参数示例'
    }
  }
])

// 方法
const navigateToFeature = (path: string) => {
  router.push(path)
}

const openDemo = (demoId: string) => {
  // 这里可以打开在线演示
  console.log(`打开演示: ${demoId}`)
  
  // 显示通知
  const event = new CustomEvent('notification:show', {
    detail: {
      type: 'info',
      message: `演示功能开发中: ${demoId}`
    }
  })
  window.dispatchEvent(event)
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'stable': return '稳定'
    case 'beta': return '测试'
    case 'alpha': return '预览'
    case 'deprecated': return '已弃用'
    default: return '开发中'
  }
}
</script>

<style lang="less" scoped>
.basic-overview {
  max-width: 1000px;
  margin: 0 auto;
}

// 概览介绍
.overview-intro {
  margin-bottom: var(--ls-margin-xxl);
  text-align: center;
  
  .section-title {
    font-size: var(--ls-font-size-h2);
    font-weight: 600;
    margin-bottom: var(--ls-margin-base);
    color: var(--ldesign-text-color-primary);
  }
  
  .section-description {
    font-size: var(--ls-font-size-lg);
    color: var(--ldesign-text-color-secondary);
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
  }
}

// 功能卡片网格
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: var(--ls-spacing-lg);
  margin-bottom: var(--ls-margin-xxl);
  
  .feature-card {
    .card();
    cursor: pointer;
    .transition();
    
    &:hover {
      transform: translateY(-4px);
      .box-shadow(var(--ls-shadow-xl));
    }
    
    .card-header {
      .flex-between();
      align-items: flex-start;
      margin-bottom: var(--ls-margin-base);
      
      .card-icon {
        font-size: var(--ls-font-size-xl);
        margin-right: var(--ls-margin-sm);
      }
      
      .card-title {
        flex: 1;
        font-size: var(--ls-font-size-lg);
        font-weight: 600;
        margin: 0;
        color: var(--ldesign-text-color-primary);
      }
      
      .card-status {
        font-size: var(--ls-font-size-xs);
        padding: 2px 8px;
        .border-radius(12px);
        font-weight: 600;
        
        &.stable {
          background-color: var(--ldesign-success-color);
          color: white;
        }
        
        &.beta {
          background-color: var(--ldesign-warning-color);
          color: white;
        }
        
        &.alpha {
          background-color: var(--ldesign-brand-color);
          color: white;
        }
      }
    }
    
    .card-description {
      color: var(--ldesign-text-color-secondary);
      line-height: 1.6;
      margin-bottom: var(--ls-margin-base);
    }
    
    .card-examples {
      margin-bottom: var(--ls-margin-base);
      
      .examples-title {
        font-size: var(--ls-font-size-sm);
        font-weight: 600;
        margin-bottom: var(--ls-margin-xs);
        color: var(--ldesign-text-color-primary);
      }
      
      .examples-list {
        list-style: none;
        margin: 0;
        padding: 0;
        
        li {
          font-size: var(--ls-font-size-xs);
          color: var(--ldesign-text-color-secondary);
          margin-bottom: var(--ls-margin-xs);
          padding-left: var(--ls-padding-base);
          position: relative;
          
          &::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--ldesign-brand-color);
          }
          
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
    
    .card-footer {
      .flex-between();
      gap: var(--ls-spacing-sm);
      
      .demo-btn {
        .flex-center();
        gap: var(--ls-spacing-xs);
        padding: var(--ls-padding-xs) var(--ls-padding-sm);
        background-color: var(--ldesign-brand-color-focus);
        color: var(--ldesign-brand-color);
        border: none;
        .border-radius();
        cursor: pointer;
        .transition();
        font-size: var(--ls-font-size-xs);
        
        &:hover {
          background-color: var(--ldesign-brand-color);
          color: white;
        }
      }
      
      .learn-btn {
        .flex-center();
        gap: var(--ls-spacing-xs);
        color: var(--ldesign-brand-color);
        font-size: var(--ls-font-size-sm);
        font-weight: 500;
        .transition();
        
        &:hover {
          color: var(--ldesign-brand-color-hover);
        }
      }
    }
  }
}

// 快速开始
.quick-start {
  margin-bottom: var(--ls-margin-xxl);
  
  .section-title {
    font-size: var(--ls-font-size-h2);
    font-weight: 600;
    margin-bottom: var(--ls-margin-lg);
    color: var(--ldesign-text-color-primary);
    text-align: center;
  }
  
  .start-steps {
    .step-item {
      .flex-center();
      gap: var(--ls-spacing-lg);
      margin-bottom: var(--ls-margin-xl);
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .step-number {
        .flex-center();
        width: 48px;
        height: 48px;
        background-color: var(--ldesign-brand-color);
        color: white;
        font-size: var(--ls-font-size-lg);
        font-weight: 600;
        .border-radius(50%);
        flex-shrink: 0;
      }
      
      .step-content {
        flex: 1;
        
        .step-title {
          font-size: var(--ls-font-size-lg);
          font-weight: 600;
          margin-bottom: var(--ls-margin-sm);
          color: var(--ldesign-text-color-primary);
        }
        
        .step-description {
          color: var(--ldesign-text-color-secondary);
          margin-bottom: var(--ls-margin-sm);
          line-height: 1.6;
        }
        
        .step-code {
          background-color: var(--ldesign-gray-color-1);
          padding: var(--ls-padding-base);
          .border-radius();
          margin-bottom: var(--ls-margin-sm);
          
          pre {
            margin: 0;
            font-size: var(--ls-font-size-sm);
            line-height: 1.5;
          }
        }
        
        .step-link {
          color: var(--ldesign-brand-color);
          font-weight: 500;
          .transition();
          
          &:hover {
            color: var(--ldesign-brand-color-hover);
          }
        }
      }
    }
  }
}

// 路由信息
.route-info {
  .section-title {
    font-size: var(--ls-font-size-h2);
    font-weight: 600;
    margin-bottom: var(--ls-margin-lg);
    color: var(--ldesign-text-color-primary);
    text-align: center;
  }
  
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--ls-spacing-base);
    
    .info-item {
      .flex-between();
      padding: var(--ls-padding-base);
      background-color: var(--ldesign-gray-color-1);
      .border-radius();
      
      .info-label {
        font-weight: 600;
        color: var(--ldesign-text-color-primary);
        margin-right: var(--ls-margin-sm);
      }
      
      .info-value {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: var(--ls-font-size-xs);
        background-color: #fff;
        padding: 2px 6px;
        .border-radius(3px);
        color: var(--ldesign-brand-color);
        word-break: break-all;
      }
    }
  }
}

// 响应式设计
.mobile({
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .start-steps {
    .step-item {
      .flex-column();
      text-align: center;
      gap: var(--ls-spacing-base);
    }
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    
    .info-item {
      .flex-column();
      gap: var(--ls-spacing-xs);
      text-align: center;
    }
  }
});
</style>
