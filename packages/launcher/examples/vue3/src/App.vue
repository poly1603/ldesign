<template>
  <div id="app">
    <header class="header">
      <h1>{{ title }}</h1>
      <p class="subtitle">{{ subtitle }}</p>
    </header>

    <main class="main">
      <section class="counter-section">
        <h2>交互式计数器</h2>
        <div class="counter">
          <button @click="decrement" class="btn btn-secondary">-</button>
          <span class="count">{{ count }}</span>
          <button @click="increment" class="btn btn-primary">+</button>
        </div>
        <p class="counter-info">点击按钮来增减计数</p>
      </section>

      <section class="features">
        <h2>Vue 3 特性</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>🚀 Composition API</h3>
            <p>更灵活的组件逻辑组织方式</p>
          </div>
          <div class="feature-card">
            <h3>⚡ 性能提升</h3>
            <p>更快的渲染和更小的包体积</p>
          </div>
          <div class="feature-card">
            <h3>🔧 更好的 TypeScript 支持</h3>
            <p>原生 TypeScript 支持</p>
          </div>
          <div class="feature-card">
            <h3>🎯 Tree-shaking 友好</h3>
            <p>按需引入，减少包体积</p>
          </div>
        </div>
      </section>

      <section class="launcher-info">
        <h2>@ldesign/launcher</h2>
        <p>这个项目使用 <strong>@ldesign/launcher</strong> 构建和开发</p>
        <div class="commands">
          <code>npm run dev</code> - 启动开发服务器<br>
          <code>npm run build</code> - 构建项目<br>
          <code>npm run preview</code> - 预览构建结果
        </div>
      </section>
    </main>

    <footer class="footer">
      <p>Built with ❤️ using Vue 3 + @ldesign/launcher</p>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'App',
  setup() {
    const title = ref('Vue 3 示例项目')
    const subtitle = ref('使用 @ldesign/launcher 构建')
    const count = ref(0)

    const increment = () => {
      count.value++
    }

    const decrement = () => {
      count.value--
    }

    return {
      title,
      subtitle,
      count,
      increment,
      decrement
    }
  }
}
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
}

.header {
  text-align: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 700;
}

.subtitle {
  font-size: 1.2rem;
  color: #666;
  margin: 0;
}

.main {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.counter-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
}

.counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.count {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  min-width: 60px;
  text-align: center;
}

.counter-info {
  color: #666;
  margin: 0;
}

.features {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.features h2 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.feature-card {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.feature-card h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.feature-card p {
  color: #666;
  margin: 0;
}

.launcher-info {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  text-align: center;
}

.launcher-info h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.commands {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: left;
}

.commands code {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.footer {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.8);
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 2rem;
  }
  
  .main {
    padding: 0 1rem;
  }
  
  .counter {
    gap: 0.5rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
  }
  
  .count {
    font-size: 1.5rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
