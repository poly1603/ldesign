<template>
  <div class="config">
    <h2>⚙️ 配置示例</h2>
    
    <div class="config-sections">
      <section class="config-section">
        <h3>Engine配置</h3>
        <div class="code-block">
          <pre><code>const engine = createEngine({
  config: {
    debug: true,
    app: {
      name: 'Engine Router Demo',
      version: '1.0.0',
    },
    environment: 'development',
    features: {
      enableHotReload: true,
      enableDevTools: true,
      enablePerformanceMonitoring: true,
      enableErrorReporting: true,
      enableCaching: true,
    },
  },
  // ... 其他配置
})</code></pre>
        </div>
      </section>

      <section class="config-section">
        <h3>Router插件配置</h3>
        <div class="code-block">
          <pre><code>import { createRouterEnginePlugin } from '@ldesign/router'

// 创建Router插件
const routerPlugin = createRouterEnginePlugin({
  routes: [...],
  mode: 'history',
  base: '/',
  preset: 'spa',
  preload: {
    strategy: 'hover',
    enabled: true,
  },
  cache: {
    strategy: 'memory',
    enabled: true,
  },
  animation: {
    type: 'fade',
    enabled: true,
  },
  performance: {
    enableLazyLoading: true,
    enableCodeSplitting: true,
    enablePrefetch: true,
  },
})

// 安装到Engine
await engine.use(routerPlugin)</code></pre>
        </div>
      </section>

      <section class="config-section">
        <h3>预设配置</h3>
        <div class="preset-options">
          <div class="preset-item">
            <h4>SPA预设</h4>
            <p>适用于单页应用，启用hover预加载、memory缓存、fade动画</p>
          </div>
          <div class="preset-item">
            <h4>Mobile预设</h4>
            <p>适用于移动端应用，使用hash模式、visible预加载、session缓存</p>
          </div>
          <div class="preset-item">
            <h4>Admin预设</h4>
            <p>适用于管理后台，启用idle预加载、local缓存、scale动画</p>
          </div>
        </div>
      </section>

      <section class="config-section">
        <h3>完整示例</h3>
        <div class="code-block">
          <pre><code>import { createEngine } from '@ldesign/engine'
import { createRouterEnginePlugin } from '@ldesign/router'
import App from './App.vue'
import { routes } from './router'

async function main() {
  // 创建Engine实例
  const engine = createEngine({
    config: {
      debug: process.env.NODE_ENV === 'development',
      environment: process.env.NODE_ENV,
    },
  })

  // 创建Router插件
  const routerPlugin = createRouterEnginePlugin({
    routes,
    preset: 'spa',
    mode: 'history',
  })

  // 安装Router插件
  await engine.use(routerPlugin)

  // 创建并挂载应用
  engine.createApp(App).mount('#app')
}

main().catch(console.error)</code></pre>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.config {
  max-width: 1000px;
  margin: 0 auto;
}

.config h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.config-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.config-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.config-section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.code-block {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
}

.code-block pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #495057;
}

.preset-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.preset-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.preset-item h4 {
  margin: 0 0 0.5rem 0;
  color: #007bff;
}

.preset-item p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>
