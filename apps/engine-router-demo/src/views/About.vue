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
  padding: var(--size-lg, 1rem);
  font-size: var(--size-base, 1rem);
  color: var(--color-text, #1a202c);
  transition: all 0.3s ease;
}

.about h2 {
  color: var(--color-text, #1a202c);
  margin-bottom: var(--size-4xl, 2rem);
  font-size: var(--size-3xl, 2rem);
  font-weight: 700;
  text-align: center;
}

.content {
  display: flex;
  flex-direction: column;
  gap: var(--size-4xl, 2rem);
}

.section {
  background: var(--color-surface, white);
  padding: var(--size-2xl, 1.5rem);
  border-radius: var(--size-md, 8px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border, #e2e8f0);
  transition: all 0.3s ease;
}

.section:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.section h3 {
  margin: 0 0 var(--size-lg, 1rem) 0;
  color: var(--color-text, #1a202c);
  font-size: var(--size-xl, 1.25rem);
  font-weight: 600;
}

.section p {
  margin: 0;
  color: var(--color-text-secondary, #4a5568);
  line-height: 1.6;
  font-size: var(--size-base, 1rem);
}

.section ul {
  margin: 0;
  padding-left: var(--size-2xl, 1.5rem);
  color: var(--color-text-secondary, #4a5568);
}

.section li {
  margin-bottom: var(--size-sm, 0.5rem);
  line-height: 1.6;
  font-size: var(--size-base, 1rem);
}

.code-example {
  background: var(--color-muted, #f7fafc);
  border: 1px solid var(--color-border, #e2e8f0);
  border-radius: var(--size-sm, 4px);
  padding: var(--size-lg, 1rem);
  margin-top: var(--size-lg, 1rem);
}

.code-example pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--size-sm, 0.9rem);
  line-height: 1.4;
  color: var(--color-text, #1a202c);
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--size-sm, 0.5rem);
  margin-top: var(--size-lg, 1rem);
}

.tech-item {
  background: var(--color-primary, #3b82f6);
  color: white;
  padding: var(--size-xs, 0.25rem) var(--size-sm, 0.75rem);
  border-radius: var(--size-full, 20px);
  font-size: var(--size-sm, 0.9rem);
  font-weight: 500;
  transition: all 0.2s ease;
}

.tech-item:hover {
  background: var(--color-primary-dark, #2563eb);
  transform: translateY(-1px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .about {
    padding: var(--size-sm, 0.5rem);
  }

  .about h2 {
    font-size: var(--size-2xl, 1.5rem);
    margin-bottom: var(--size-2xl, 1.5rem);
  }

  .content {
    gap: var(--size-2xl, 1.5rem);
  }

  .section {
    padding: var(--size-lg, 1rem);
  }

  .section h3 {
    font-size: var(--size-lg, 1.1rem);
  }

  .section p,
  .section li {
    font-size: var(--size-sm, 0.9rem);
  }

  .code-example {
    padding: var(--size-sm, 0.5rem);
  }

  .code-example pre {
    font-size: var(--size-xs, 0.8rem);
  }

  .tech-item {
    font-size: var(--size-xs, 0.8rem);
    padding: var(--size-xs, 0.2rem) var(--size-sm, 0.5rem);
  }
}
</style>
