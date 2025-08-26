<script setup lang="ts">
// 首页不需要额外的逻辑
</script>

<template>
  <div class="home">
    <!-- 英雄区域 -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">@ldesign/store</h1>
        <p class="hero-subtitle">现代化的 Vue 状态管理库</p>
        <p class="hero-description">
          基于 Pinia 构建，提供装饰器、Hooks、类型安全等现代化特性。
          支持多种使用方式：装饰器、函数式、Composition API。
        </p>
        <div class="hero-actions">
          <router-link to="/basic" class="btn btn-primary btn-lg">
            开始体验
          </router-link>
          <a href="https://github.com/ldesign/store" target="_blank" class="btn btn-secondary btn-lg">
            查看源码
          </a>
        </div>
      </div>
    </section>

    <!-- 特性介绍 -->
    <section class="features">
      <div class="section-header">
        <h2>核心特性</h2>
        <p>@ldesign/store 提供了丰富的功能特性，满足各种应用场景需求</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>类型安全</h3>
          <p>完整的 TypeScript 支持，提供强类型约束和智能提示</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>高性能</h3>
          <p>内置缓存、防抖、节流等性能优化机制</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🔧</div>
          <h3>多种语法</h3>
          <p>支持装饰器、函数式、组合式等多种使用方式</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">💾</div>
          <h3>状态持久化</h3>
          <p>支持 localStorage、sessionStorage 等多种持久化方案</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <h3>实时同步</h3>
          <p>支持多窗口、多标签页之间的状态同步</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon">🏢</div>
          <h3>企业级</h3>
          <p>提供完整的企业级应用解决方案</p>
        </div>
      </div>
    </section>

    <!-- 示例导航 -->
    <section class="examples">
      <div class="section-header">
        <h2>示例导航</h2>
        <p>通过实际示例了解 @ldesign/store 的各种功能特性</p>
      </div>

      <div class="examples-grid">
        <router-link to="/basic" class="example-card">
          <h3>基础示例</h3>
          <p>计数器、待办事项、用户管理等基础功能演示</p>
          <span class="example-badge">入门</span>
        </router-link>

        <router-link to="/decorators" class="example-card">
          <h3>装饰器示例</h3>
          <p>使用装饰器语法创建类式 Store</p>
          <span class="example-badge">进阶</span>
        </router-link>

        <router-link to="/functional" class="example-card">
          <h3>函数式示例</h3>
          <p>使用函数式 API 创建 Store</p>
          <span class="example-badge">进阶</span>
        </router-link>

        <router-link to="/composition" class="example-card">
          <h3>组合式示例</h3>
          <p>使用 Composition API 创建 Store</p>
          <span class="example-badge">进阶</span>
        </router-link>

        <router-link to="/performance" class="example-card">
          <h3>性能优化</h3>
          <p>缓存、防抖、节流等性能优化功能</p>
          <span class="example-badge">高级</span>
        </router-link>

        <router-link to="/persistence" class="example-card">
          <h3>状态持久化</h3>
          <p>localStorage、sessionStorage 持久化</p>
          <span class="example-badge">高级</span>
        </router-link>

        <router-link to="/enterprise" class="example-card">
          <h3>企业级功能</h3>
          <p>大型应用的状态管理最佳实践</p>
          <span class="example-badge">专家</span>
        </router-link>

        <router-link to="/realtime" class="example-card">
          <h3>实时同步</h3>
          <p>多窗口、多标签页状态同步</p>
          <span class="example-badge">专家</span>
        </router-link>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-start">
      <div class="section-header">
        <h2>快速开始</h2>
        <p>几分钟内即可上手使用 @ldesign/store</p>
      </div>

      <div class="quick-start-steps">
        <div class="step">
          <div class="step-number">1</div>
          <h3>安装</h3>
          <div class="code-block">npm install @ldesign/store</div>
        </div>

        <div class="step">
          <div class="step-number">2</div>
          <h3>创建 Store</h3>
          <div class="code-block">
            import { BaseStore, State, Action } from '@ldesign/store'

            class CounterStore extends BaseStore {
            @State() count = 0

            @Action()
            increment() {
            this.count++
            }
            }
          </div>
        </div>

        <div class="step">
          <div class="step-number">3</div>
          <h3>在组件中使用</h3>
          <div class="code-block">
            const counterStore = new CounterStore()

            // 在模板中使用
            &lt;template&gt;
            &lt;div&gt;计数: counterStore.count&lt;/div&gt;
            &lt;/template&gt;
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  max-width: none;
  margin: -2rem;
}

/* 英雄区域 */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 2rem;
  text-align: center;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.hero-subtitle {
  font-size: 1.5rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.125rem;
  line-height: 1.7;
  margin: 0 0 2.5rem 0;
  opacity: 0.8;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* 特性介绍 */
.features {
  padding: 4rem 2rem;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.section-header p {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  background: #f8fafc;
  transition: transform 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.feature-card p {
  color: #718096;
  margin: 0;
}

/* 示例导航 */
.examples {
  padding: 4rem 2rem;
  background: #f8fafc;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.example-card {
  display: block;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid #e2e8f0;
}

.example-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.example-card h3 {
  margin: 0 0 0.5rem 0;
  color: #1a202c;
  font-size: 1.125rem;
}

.example-card p {
  margin: 0;
  color: #718096;
  font-size: 0.875rem;
}

.example-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #3182ce;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* 快速开始 */
.quick-start {
  padding: 4rem 2rem;
  background: white;
}

.quick-start-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.step {
  text-align: center;
}

.step-number {
  width: 3rem;
  height: 3rem;
  background: #3182ce;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 auto 1rem auto;
}

.step h3 {
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.step .code-block {
  text-align: left;
  font-size: 0.8rem;
  white-space: pre-wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero {
    padding: 3rem 1rem;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }

  .features,
  .examples,
  .quick-start {
    padding: 3rem 1rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .features-grid,
  .examples-grid,
  .quick-start-steps {
    grid-template-columns: 1fr;
  }
}
</style>
