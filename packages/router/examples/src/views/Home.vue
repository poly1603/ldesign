<template>
  <div class="home-page">
    <!-- 英雄区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-title">
            <span class="brand-name">@ldesign/router</span>
            <span class="hero-subtitle">示例项目</span>
          </h1>
          <p class="hero-description">
            现代化、高性能、类型安全的 Vue 路由库完整功能演示
          </p>
          <div class="hero-features">
            <div class="feature-item">
              <span class="feature-icon">⚡</span>
              <span class="feature-text">极致性能</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🛡️</span>
              <span class="feature-text">类型安全</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🎨</span>
              <span class="feature-text">丰富动画</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📱</span>
              <span class="feature-text">设备适配</span>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink to="/basic" class="action-btn primary">
              <span class="btn-icon">🚀</span>
              <span class="btn-text">开始探索</span>
            </RouterLink>
            <a href="#" class="action-btn secondary">
              <span class="btn-icon">📚</span>
              <span class="btn-text">查看文档</span>
            </a>
          </div>
        </div>
        <div class="hero-visual">
          <div class="visual-container">
            <div class="router-diagram">
              <div class="route-node" v-for="(route, index) in demoRoutes" :key="route.path">
                <div class="node-icon">{{ route.icon }}</div>
                <div class="node-label">{{ route.name }}</div>
                <div class="node-connection" v-if="index < demoRoutes.length - 1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能展示区域 -->
    <section class="features-section">
      <div class="section-header">
        <h2 class="section-title">核心功能</h2>
        <p class="section-description">探索 @ldesign/router 的强大功能</p>
      </div>
      
      <div class="features-grid">
        <div 
          v-for="feature in features" 
          :key="feature.path"
          class="feature-card"
          @click="navigateToFeature(feature.path)"
        >
          <div class="card-header">
            <div class="card-icon">{{ feature.icon }}</div>
            <h3 class="card-title">{{ feature.title }}</h3>
          </div>
          <p class="card-description">{{ feature.description }}</p>
          <div class="card-footer">
            <span class="card-link">了解更多 →</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 统计信息区域 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-item" v-for="stat in stats" :key="stat.label">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- 快速开始区域 -->
    <section class="quickstart-section">
      <div class="quickstart-content">
        <h2 class="quickstart-title">快速开始</h2>
        <p class="quickstart-description">几分钟内掌握 @ldesign/router 的基本用法</p>
        
        <div class="code-example">
          <div class="code-header">
            <span class="code-title">安装和基础使用</span>
            <button class="copy-btn" @click="copyCode">
              <span class="copy-icon">📋</span>
              <span class="copy-text">复制</span>
            </button>
          </div>
          <pre class="code-content"><code>{{ codeExample }}</code></pre>
        </div>
        
        <div class="quickstart-actions">
          <RouterLink to="/basic" class="quickstart-btn">
            查看基础示例
          </RouterLink>
          <a href="#" class="quickstart-link">
            阅读完整文档
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@ldesign/router'

/**
 * 首页组件
 * 
 * 功能特性：
 * 1. 项目介绍和特性展示
 * 2. 功能模块导航
 * 3. 统计信息展示
 * 4. 快速开始指南
 */

const router = useRouter()

// 演示路由数据
const demoRoutes = ref([
  { path: '/', name: 'Home', icon: '🏠' },
  { path: '/basic', name: 'Basic', icon: '📚' }
])

// 功能特性数据
const features = ref([
  {
    path: '/basic',
    icon: '📚',
    title: '基础功能',
    description: '路由配置、导航、参数传递等基础功能演示'
  }
])

// 统计数据
const stats = ref([
  { label: '功能模块', value: '1+' },
  { label: '示例页面', value: '5+' },
  { label: '代码覆盖率', value: '90%' },
  { label: '性能提升', value: '3x' }
])

// 代码示例
const codeExample = `// 安装
pnpm add @ldesign/router

// 基础使用
import { createRouter, createWebHistory } from '@ldesign/router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
})

app.use(router)`

// 方法
const navigateToFeature = (path: string) => {
  router.push(path)
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(codeExample)
    // 显示成功提示
    const event = new CustomEvent('notification:show', {
      detail: {
        type: 'success',
        message: '代码已复制到剪贴板'
      }
    })
    window.dispatchEvent(event)
  } catch (error) {
    console.error('复制失败:', error)
  }
}

// 生命周期
onMounted(() => {
  // 页面加载完成后的初始化操作
  console.log('首页加载完成')
})
</script>

<style lang="less" scoped>
.home-page {
  min-height: 100vh;
}

// 英雄区域
.hero-section {
  padding: var(--ls-padding-xxl) 0;
  background: linear-gradient(135deg, var(--ldesign-brand-color-1) 0%, var(--ldesign-brand-color-2) 100%);
  
  .hero-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--ls-padding-base);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--ls-spacing-xxl);
    align-items: center;
  }
  
  .hero-text {
    .hero-title {
      font-size: var(--ls-font-size-h1);
      font-weight: 700;
      margin-bottom: var(--ls-margin-base);
      line-height: 1.2;
      
      .brand-name {
        color: var(--ldesign-brand-color);
        display: block;
      }
      
      .hero-subtitle {
        color: var(--ldesign-text-color-secondary);
        font-size: var(--ls-font-size-h3);
        font-weight: 400;
      }
    }
    
    .hero-description {
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-secondary);
      margin-bottom: var(--ls-margin-lg);
      line-height: 1.6;
    }
    
    .hero-features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--ls-spacing-base);
      margin-bottom: var(--ls-margin-xl);
      
      .feature-item {
        .flex-center();
        gap: var(--ls-spacing-sm);
        
        .feature-icon {
          font-size: var(--ls-font-size-lg);
        }
        
        .feature-text {
          font-size: var(--ls-font-size-sm);
          font-weight: 500;
          color: var(--ldesign-text-color-primary);
        }
      }
    }
    
    .hero-actions {
      .flex-center();
      gap: var(--ls-spacing-base);
      
      .action-btn {
        .flex-center();
        gap: var(--ls-spacing-sm);
        padding: var(--ls-padding-base) var(--ls-padding-lg);
        .border-radius();
        .transition();
        font-weight: 600;
        text-decoration: none;
        
        &.primary {
          .button-primary();
        }
        
        &.secondary {
          .button-secondary();
        }
        
        .btn-icon {
          font-size: var(--ls-font-size-base);
        }
      }
    }
  }
  
  .hero-visual {
    .flex-center();
    
    .visual-container {
      width: 100%;
      max-width: 400px;
      
      .router-diagram {
        .flex-column();
        gap: var(--ls-spacing-base);
        
        .route-node {
          .flex-center();
          .flex-column();
          gap: var(--ls-spacing-sm);
          padding: var(--ls-padding-base);
          background-color: #fff;
          .border-radius();
          .box-shadow();
          position: relative;
          
          .node-icon {
            font-size: var(--ls-font-size-xl);
          }
          
          .node-label {
            font-size: var(--ls-font-size-sm);
            font-weight: 600;
            color: var(--ldesign-text-color-primary);
          }
          
          .node-connection {
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 2px;
            height: 20px;
            background-color: var(--ldesign-brand-color);
          }
        }
      }
    }
  }
}

// 功能展示区域
.features-section {
  padding: var(--ls-padding-xxl) 0;
  max-width: 1200px;
  margin: 0 auto;
  
  .section-header {
    text-align: center;
    margin-bottom: var(--ls-margin-xxl);
    
    .section-title {
      font-size: var(--ls-font-size-h2);
      font-weight: 600;
      margin-bottom: var(--ls-margin-base);
      color: var(--ldesign-text-color-primary);
    }
    
    .section-description {
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-secondary);
    }
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--ls-spacing-lg);
    padding: 0 var(--ls-padding-base);
    
    .feature-card {
      .card();
      cursor: pointer;
      .transition();
      
      &:hover {
        transform: translateY(-4px);
        .box-shadow(var(--ls-shadow-xl));
      }
      
      .card-header {
        .flex-center();
        gap: var(--ls-spacing-base);
        margin-bottom: var(--ls-margin-base);
        
        .card-icon {
          font-size: var(--ls-font-size-xl);
        }
        
        .card-title {
          font-size: var(--ls-font-size-lg);
          font-weight: 600;
          margin: 0;
          color: var(--ldesign-text-color-primary);
        }
      }
      
      .card-description {
        color: var(--ldesign-text-color-secondary);
        line-height: 1.6;
        margin-bottom: var(--ls-margin-base);
      }
      
      .card-footer {
        .card-link {
          color: var(--ldesign-brand-color);
          font-weight: 500;
          font-size: var(--ls-font-size-sm);
        }
      }
    }
  }
}

// 统计信息区域
.stats-section {
  padding: var(--ls-padding-xl) 0;
  background-color: var(--ldesign-gray-color-1);
  
  .stats-grid {
    max-width: 800px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--ls-spacing-lg);
    padding: 0 var(--ls-padding-base);
    
    .stat-item {
      text-align: center;
      
      .stat-value {
        font-size: var(--ls-font-size-h2);
        font-weight: 700;
        color: var(--ldesign-brand-color);
        margin-bottom: var(--ls-margin-sm);
      }
      
      .stat-label {
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-secondary);
        font-weight: 500;
      }
    }
  }
}

// 快速开始区域
.quickstart-section {
  padding: var(--ls-padding-xxl) 0;
  max-width: 800px;
  margin: 0 auto;
  
  .quickstart-content {
    padding: 0 var(--ls-padding-base);
    text-align: center;
    
    .quickstart-title {
      font-size: var(--ls-font-size-h2);
      font-weight: 600;
      margin-bottom: var(--ls-margin-base);
      color: var(--ldesign-text-color-primary);
    }
    
    .quickstart-description {
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-secondary);
      margin-bottom: var(--ls-margin-xl);
    }
    
    .code-example {
      .card();
      text-align: left;
      margin-bottom: var(--ls-margin-xl);
      
      .code-header {
        .flex-between();
        padding-bottom: var(--ls-padding-base);
        border-bottom: 1px solid var(--ldesign-border-color);
        margin-bottom: var(--ls-margin-base);
        
        .code-title {
          font-weight: 600;
          color: var(--ldesign-text-color-primary);
        }
        
        .copy-btn {
          .flex-center();
          gap: var(--ls-spacing-xs);
          padding: var(--ls-padding-xs) var(--ls-padding-sm);
          background: none;
          border: 1px solid var(--ldesign-border-color);
          .border-radius();
          cursor: pointer;
          .transition();
          
          &:hover {
            background-color: var(--ldesign-bg-color-container-hover);
            border-color: var(--ldesign-brand-color);
          }
        }
      }
      
      .code-content {
        margin: 0;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: var(--ls-font-size-sm);
        line-height: 1.6;
        color: var(--ldesign-text-color-primary);
        background: none;
        padding: 0;
      }
    }
    
    .quickstart-actions {
      .flex-center();
      gap: var(--ls-spacing-base);
      
      .quickstart-btn {
        .button-primary();
        padding: var(--ls-padding-base) var(--ls-padding-lg);
      }
      
      .quickstart-link {
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

// 响应式设计
.mobile({
  .hero-section {
    .hero-content {
      grid-template-columns: 1fr;
      gap: var(--ls-spacing-lg);
      text-align: center;
    }
    
    .hero-features {
      grid-template-columns: 1fr;
    }
    
    .hero-actions {
      .flex-column();
    }
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quickstart-actions {
    .flex-column();
  }
});

.tablet({
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
});
</style>
