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
      <button @click="showEngineInfo" class="action-btn">查看Engine信息</button>
      <button @click="showRouterInfo" class="action-btn">查看Router信息</button>
      <button @click="testNavigation" class="action-btn">测试导航</button>
    </div>

    <div v-if="engineInfo" class="info-panel">
      <h4>Engine信息</h4>
      <pre>{{ engineInfo }}</pre>
    </div>

    <div v-if="routerInfo" class="info-panel">
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
}

.features h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.feature-group {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.feature-group h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.feature-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.feature-item h4 {
  margin: 0 0 0.5rem 0;
  color: #007bff;
}

.feature-item p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
}

.demo-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.action-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background: #0056b3;
}

.info-panel {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-panel h4 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.info-panel pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #495057;
  white-space: pre-wrap;
}
</style>
