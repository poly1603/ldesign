<template>
  <div class="about">
    <h2>📖 关于Engine Router Demo</h2>
    
    <div class="content">
      <section class="section">
        <h3>🎯 项目目标</h3>
        <p>
          这个示例应用旨在展示@ldesign/engine与@ldesign/router的集成使用方式。
          通过实际的代码示例，帮助开发者理解如何在项目中使用这两个库。
        </p>
      </section>

      <section class="section">
        <h3>🏗️ 架构设计</h3>
        <ul>
          <li><strong>Engine核心:</strong> 提供应用创建、插件管理、配置管理等基础功能</li>
          <li><strong>扩展系统:</strong> 通过extensions目录隔离扩展功能，保持核心代码纯净</li>
          <li><strong>Router集成:</strong> 作为Engine扩展，通过配置选项无缝集成</li>
          <li><strong>插件化:</strong> Router提供Engine插件，支持配置驱动的集成方式</li>
        </ul>
      </section>

      <section class="section">
        <h3>💡 使用方式</h3>
        <div class="code-example">
          <pre><code>import { createEngine } from '@ldesign/engine'

const engine = createEngine({
  router: {
    routes: [...],
    preset: 'spa',
    mode: 'history'
  }
})

engine.createApp(App).mount('#app')</code></pre>
        </div>
      </section>

      <section class="section">
        <h3>🔧 技术栈</h3>
        <div class="tech-stack">
          <span class="tech-item">Vue 3</span>
          <span class="tech-item">TypeScript</span>
          <span class="tech-item">@ldesign/engine</span>
          <span class="tech-item">@ldesign/router</span>
          <span class="tech-item">Vite</span>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
}

.about h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.section h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.section p {
  margin: 0;
  color: #6c757d;
  line-height: 1.6;
}

.section ul {
  margin: 0;
  padding-left: 1.5rem;
  color: #6c757d;
}

.section li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.code-example {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 1rem;
  margin-top: 1rem;
}

.code-example pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #495057;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.tech-item {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
}
</style>
