<template>
  <div class="navigation-demo">
    <h2 class="page-title">导航功能演示</h2>
    <p class="page-description">
      学习如何使用 RouterLink 组件和编程式导航进行页面跳转
    </p>

    <!-- RouterLink 演示 -->
    <section class="demo-section">
      <h3 class="section-title">RouterLink 组件</h3>
      <div class="demo-content">
        <div class="link-examples">
          <RouterLink to="/" class="demo-link">
            <span class="link-icon">🏠</span>
            <span class="link-text">返回首页</span>
          </RouterLink>
          
          <RouterLink to="/basic/params/123" class="demo-link">
            <span class="link-icon">🔗</span>
            <span class="link-text">带参数链接</span>
          </RouterLink>
          
          <RouterLink to="/basic/query?name=demo&type=test" class="demo-link">
            <span class="link-icon">❓</span>
            <span class="link-text">带查询参数</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- 编程式导航演示 -->
    <section class="demo-section">
      <h3 class="section-title">编程式导航</h3>
      <div class="demo-content">
        <div class="nav-buttons">
          <button @click="navigateHome" class="nav-btn primary">
            <span class="btn-icon">🏠</span>
            <span class="btn-text">push('/')</span>
          </button>
          
          <button @click="navigateWithParams" class="nav-btn secondary">
            <span class="btn-icon">🔗</span>
            <span class="btn-text">带参数导航</span>
          </button>
          
          <button @click="replaceRoute" class="nav-btn warning">
            <span class="btn-icon">🔄</span>
            <span class="btn-text">replace 导航</span>
          </button>
          
          <button @click="goBack" class="nav-btn info">
            <span class="btn-icon">←</span>
            <span class="btn-text">返回上一页</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 当前路由信息 -->
    <section class="demo-section">
      <h3 class="section-title">当前路由信息</h3>
      <div class="route-info">
        <div class="info-item">
          <label>路径:</label>
          <code>{{ route.path }}</code>
        </div>
        <div class="info-item">
          <label>名称:</label>
          <code>{{ route.name }}</code>
        </div>
        <div class="info-item">
          <label>完整路径:</label>
          <code>{{ route.fullPath }}</code>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'

const route = useRoute()
const router = useRouter()

const navigateHome = () => {
  router.push('/')
}

const navigateWithParams = () => {
  router.push({
    name: 'BasicParams',
    params: { id: 'navigation-demo' }
  })
}

const replaceRoute = () => {
  router.replace('/basic/query?from=navigation')
}

const goBack = () => {
  router.go(-1)
}
</script>

<style lang="less" scoped>
.navigation-demo {
  max-width: 800px;
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

.link-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--ls-spacing-base);
  
  .demo-link {
    .flex-center();
    gap: var(--ls-spacing-sm);
    padding: var(--ls-padding-base);
    .border-radius();
    .transition();
    border: 2px solid var(--ldesign-border-color);
    color: var(--ldesign-text-color-primary);
    
    &:hover {
      border-color: var(--ldesign-brand-color);
      background-color: var(--ldesign-brand-color-focus);
      color: var(--ldesign-brand-color);
    }
    
    &.router-link-active {
      border-color: var(--ldesign-brand-color);
      background-color: var(--ldesign-brand-color-focus);
      color: var(--ldesign-brand-color);
    }
    
    .link-icon {
      font-size: var(--ls-font-size-lg);
    }
    
    .link-text {
      font-weight: 500;
    }
  }
}

.nav-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--ls-spacing-base);
  
  .nav-btn {
    .flex-center();
    gap: var(--ls-spacing-sm);
    padding: var(--ls-padding-base);
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
    
    &.warning {
      background-color: var(--ldesign-warning-color);
      color: white;
      
      &:hover {
        background-color: var(--ldesign-warning-color-hover);
      }
    }
    
    &.info {
      background-color: var(--ldesign-brand-color);
      color: white;
      
      &:hover {
        background-color: var(--ldesign-brand-color-hover);
      }
    }
    
    .btn-icon {
      font-size: var(--ls-font-size-base);
    }
  }
}

.route-info {
  .info-item {
    .flex-between();
    padding: var(--ls-padding-sm) 0;
    border-bottom: 1px solid var(--ldesign-border-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    label {
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }
    
    code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      background-color: var(--ldesign-gray-color-1);
      padding: 2px 6px;
      .border-radius(3px);
      color: var(--ldesign-brand-color);
    }
  }
}

.mobile({
  .link-examples,
  .nav-buttons {
    grid-template-columns: 1fr;
  }
  
  .route-info {
    .info-item {
      .flex-column();
      gap: var(--ls-spacing-xs);
      align-items: flex-start;
    }
  }
});
</style>
