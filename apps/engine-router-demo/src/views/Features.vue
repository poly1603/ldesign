<template>
  <div class="features">
    <h2>✨ 功能特性</h2>
    
    <div class="features-list">
      <div class="feature-group">
        <h3>🚀 Engine核心功能</h3>
        <div class="feature-items">
          <div class="feature-item">
            <h4>插件系统</h4>
            <p>强大的插件架构，支持插件的注册、卸载和生命周期管理</p>
          </div>
          <div class="feature-item">
            <h4>配置管理</h4>
            <p>统一的配置管理系统，支持配置验证、自动保存等功能</p>
          </div>
          <div class="feature-item">
            <h4>事件系统</h4>
            <p>发布订阅模式的事件管理，支持组件间通信</p>
          </div>
          <div class="feature-item">
            <h4>中间件支持</h4>
            <p>请求/响应处理管道，支持自定义中间件</p>
          </div>
        </div>
      </div>

      <div class="feature-group">
        <h3>🛣️ Router功能</h3>
        <div class="feature-items">
          <div class="feature-item">
            <h4>高性能匹配</h4>
            <p>基于Trie树的路由匹配算法，比传统方案快3-5倍</p>
          </div>
          <div class="feature-item">
            <h4>智能预加载</h4>
            <p>支持hover、visible、idle三种预加载策略</p>
          </div>
          <div class="feature-item">
            <h4>缓存优化</h4>
            <p>多种缓存策略，自动内存管理和垃圾回收</p>
          </div>
          <div class="feature-item">
            <h4>动画效果</h4>
            <p>内置fade、slide、scale等过渡动画效果</p>
          </div>
        </div>
      </div>

      <div class="feature-group">
        <h3>🔧 集成特性</h3>
        <div class="feature-items">
          <div class="feature-item">
            <h4>配置驱动</h4>
            <p>通过简单配置即可启用路由功能，无需复杂设置</p>
          </div>
          <div class="feature-item">
            <h4>扩展架构</h4>
            <p>模块化扩展系统，保持核心代码纯净</p>
          </div>
          <div class="feature-item">
            <h4>类型安全</h4>
            <p>完整的TypeScript支持，编译时类型检查</p>
          </div>
          <div class="feature-item">
            <h4>按需加载</h4>
            <p>动态导入避免强制依赖，支持按需加载</p>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-actions">
      <button
        class="action-btn"
        @click="showEngineInfo"
      >
        查看Engine信息
      </button>
      <button
        class="action-btn"
        @click="showRouterInfo"
      >
        查看Router信息
      </button>
      <button
        class="action-btn"
        @click="testNavigation"
      >
        测试导航
      </button>
    </div>

    <div
      v-if="engineInfo"
      class="info-panel"
    >
      <h4>Engine信息</h4>
      <pre>{{ engineInfo }}</pre>
    </div>

    <div
      v-if="routerInfo"
      class="info-panel"
    >
      <h4>Router信息</h4>
      <pre>{{ routerInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const engineInfo = ref('')
const routerInfo = ref('')

const showEngineInfo = () => {
  engineInfo.value = JSON.stringify({
    message: 'Engine信息展示功能',
    note: '实际项目中可以通过useEngine等hooks获取引擎信息',
  }, null, 2)
}

const showRouterInfo = () => {
  routerInfo.value = JSON.stringify({
    message: 'Router信息展示功能',
    note: '实际项目中可以通过useRouter等hooks获取路由信息',
  }, null, 2)
}

const testNavigation = () => {
  const routes = ['/', '/about', '/config']
  const randomRoute = routes[Math.floor(Math.random() * routes.length)]
  window.location.hash = randomRoute
}
</script>

<style scoped>
.features {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--size-lg, 1rem);
  font-size: var(--size-base, 1rem);
  color: var(--color-text, #1a202c);
  transition: all 0.3s ease;
}

.features h2 {
  color: var(--color-text, #1a202c);
  margin-bottom: var(--size-4xl, 2rem);
  font-size: var(--size-3xl, 2rem);
  font-weight: 700;
  text-align: center;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: var(--size-4xl, 2rem);
  margin-bottom: var(--size-4xl, 2rem);
}

.feature-group {
  background: var(--color-surface, white);
  padding: var(--size-2xl, 1.5rem);
  border-radius: var(--size-md, 8px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border, #e2e8f0);
  transition: all 0.3s ease;
}

.feature-group:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.feature-group h3 {
  margin: 0 0 var(--size-lg, 1rem) 0;
  color: var(--color-text, #1a202c);
  font-size: var(--size-xl, 1.25rem);
  font-weight: 600;
}

.feature-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--size-lg, 1rem);
}

.feature-item {
  padding: var(--size-lg, 1rem);
  background: var(--color-muted, #f7fafc);
  border-radius: var(--size-sm, 4px);
  border: 1px solid var(--color-border, #e2e8f0);
  transition: all 0.2s ease;
}

.feature-item:hover {
  background: var(--color-surface, white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.feature-item h4 {
  margin: 0 0 var(--size-sm, 0.5rem) 0;
  color: var(--color-primary, #3b82f6);
  font-size: var(--size-lg, 1.1rem);
  font-weight: 600;
}

.feature-item p {
  margin: 0;
  color: var(--color-text-secondary, #4a5568);
  font-size: var(--size-sm, 0.9rem);
  line-height: 1.5;
}

.demo-actions {
  display: flex;
  gap: var(--size-lg, 1rem);
  justify-content: center;
  margin-bottom: var(--size-4xl, 2rem);
  flex-wrap: wrap;
}

.action-btn {
  background: var(--color-primary, #3b82f6);
  color: white;
  border: none;
  padding: var(--size-sm, 0.75rem) var(--size-2xl, 1.5rem);
  border-radius: var(--size-sm, 4px);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--size-base, 1rem);
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.action-btn:hover {
  background: var(--color-primary-dark, #2563eb);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

.action-btn:active {
  transform: translateY(0);
}

.info-panel {
  background: var(--color-muted, #f7fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--size-sm, 4px);
  padding: var(--size-lg, 1rem);
  margin-bottom: var(--size-lg, 1rem);
}

.info-panel h4 {
  margin: 0 0 var(--size-lg, 1rem) 0;
  color: var(--color-text, #1a202c);
  font-size: var(--size-lg, 1.1rem);
  font-weight: 600;
}

.info-panel pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--size-sm, 0.9rem);
  line-height: 1.4;
  color: var(--color-text, #1a202c);
  white-space: pre-wrap;
  background: var(--color-surface, white);
  padding: var(--size-sm, 0.5rem);
  border-radius: var(--size-xs, 2px);
  border: 1px solid var(--color-border, #e2e8f0);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .features {
    padding: var(--size-sm, 0.5rem);
  }

  .features h2 {
    font-size: var(--size-2xl, 1.5rem);
    margin-bottom: var(--size-2xl, 1.5rem);
  }

  .features-list {
    gap: var(--size-2xl, 1.5rem);
    margin-bottom: var(--size-2xl, 1.5rem);
  }

  .feature-group {
    padding: var(--size-lg, 1rem);
  }

  .feature-group h3 {
    font-size: var(--size-lg, 1.1rem);
  }

  .feature-items {
    grid-template-columns: 1fr;
    gap: var(--size-sm, 0.5rem);
  }

  .feature-item {
    padding: var(--size-sm, 0.5rem);
  }

  .feature-item h4 {
    font-size: var(--size-base, 1rem);
  }

  .feature-item p {
    font-size: var(--size-xs, 0.8rem);
  }

  .demo-actions {
    flex-direction: column;
    align-items: center;
    gap: var(--size-sm, 0.5rem);
  }

  .action-btn {
    width: 100%;
    max-width: 200px;
    padding: var(--size-sm, 0.5rem) var(--size-lg, 1rem);
    font-size: var(--size-sm, 0.9rem);
  }

  .info-panel {
    padding: var(--size-sm, 0.5rem);
  }

  .info-panel pre {
    font-size: var(--size-xs, 0.8rem);
  }
}
</style>
