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
  padding: var(--size-lg, 1rem);
  font-size: var(--size-base, 1rem);
  color: var(--color-text, #1a202c);
  transition: all 0.3s ease;
}

.config h2 {
  color: var(--color-text, #1a202c);
  margin-bottom: var(--size-4xl, 2rem);
  font-size: var(--size-3xl, 2rem);
  font-weight: 700;
  text-align: center;
}

.config-sections {
  display: flex;
  flex-direction: column;
  gap: var(--size-4xl, 2rem);
}

.config-section {
  background: var(--color-surface, white);
  padding: var(--size-2xl, 1.5rem);
  border-radius: var(--size-md, 8px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border, #e2e8f0);
  transition: all 0.3s ease;
}

.config-section:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.config-section h3 {
  margin: 0 0 var(--size-lg, 1rem) 0;
  color: var(--color-text, #1a202c);
  font-size: var(--size-xl, 1.25rem);
  font-weight: 600;
}

.code-block {
  background: var(--color-muted, #f7fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--size-sm, 4px);
  padding: var(--size-lg, 1rem);
  overflow-x: auto;
  margin-top: var(--size-sm, 0.5rem);
}

.code-block pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--size-sm, 0.9rem);
  line-height: 1.4;
  color: var(--color-text, #1a202c);
}

.preset-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--size-lg, 1rem);
  margin-top: var(--size-sm, 0.5rem);
}

.preset-item {
  background: var(--color-muted, #f7fafc);
  padding: var(--size-lg, 1rem);
  border-radius: var(--size-sm, 4px);
  border: 1px solid var(--color-border, #e2e8f0);
  transition: all 0.2s ease;
}

.preset-item:hover {
  background: var(--color-surface, white);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.preset-item h4 {
  margin: 0 0 var(--size-sm, 0.5rem) 0;
  color: var(--color-primary, #3b82f6);
  font-size: var(--size-lg, 1.1rem);
  font-weight: 600;
}

.preset-item p {
  margin: 0;
  color: var(--color-text-secondary, #4a5568);
  font-size: var(--size-sm, 0.9rem);
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config {
    padding: var(--size-sm, 0.5rem);
  }

  .config h2 {
    font-size: var(--size-2xl, 1.5rem);
    margin-bottom: var(--size-2xl, 1.5rem);
  }

  .config-sections {
    gap: var(--size-2xl, 1.5rem);
  }

  .config-section {
    padding: var(--size-lg, 1rem);
  }

  .config-section h3 {
    font-size: var(--size-lg, 1.1rem);
  }

  .code-block {
    padding: var(--size-sm, 0.5rem);
    font-size: var(--size-xs, 0.8rem);
  }

  .code-block pre {
    font-size: var(--size-xs, 0.8rem);
  }

  .preset-options {
    grid-template-columns: 1fr;
    gap: var(--size-sm, 0.5rem);
  }

  .preset-item {
    padding: var(--size-sm, 0.5rem);
  }

  .preset-item h4 {
    font-size: var(--size-base, 1rem);
  }

  .preset-item p {
    font-size: var(--size-xs, 0.8rem);
  }
}
</style>
