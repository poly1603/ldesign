<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <header class="page-header">
      <h1 class="page-title">LDesign Form</h1>
      <p class="page-subtitle">Vue 3 示例项目</p>
      <p class="page-description">
        展示如何在 Vue 3 项目中使用 LDesign Form 的组件和 Composition API hooks
      </p>
    </header>

    <!-- 示例导航 -->
    <section class="examples-section">
      <h2 class="section-title">示例列表</h2>
      <div class="examples-grid grid grid-2">
        <!-- 基础表单示例 -->
        <div class="example-card card">
          <div class="example-icon">📝</div>
          <h3 class="card-title">基础表单</h3>
          <p class="card-description">
            展示 LDesignForm 和 LDesignFormItem 组件的基本用法，包括字段验证和状态管理
          </p>
          <div class="example-features">
            <span class="feature-tag">组件用法</span>
            <span class="feature-tag">字段验证</span>
            <span class="feature-tag">状态管理</span>
          </div>
          <router-link to="/basic" class="btn btn-primary">查看示例</router-link>
        </div>

        <!-- 查询表单示例 -->
        <div class="example-card card">
          <div class="example-icon">🔍</div>
          <h3 class="card-title">查询表单</h3>
          <p class="card-description">
            专门用于查询场景的表单组件，支持展开/收起、智能按钮布局和响应式设计
          </p>
          <div class="example-features">
            <span class="feature-tag">展开收起</span>
            <span class="feature-tag">智能布局</span>
            <span class="feature-tag">响应式</span>
            <span class="feature-tag">查询优化</span>
          </div>
          <router-link to="/query" class="btn btn-primary">查看示例</router-link>
        </div>

        <!-- 复杂表单示例 -->
        <div class="example-card card">
          <div class="example-icon">🔧</div>
          <h3 class="card-title">复杂表单</h3>
          <p class="card-description">
            展示动态数组字段、条件字段、嵌套表单等高级功能的使用方法
          </p>
          <div class="example-features">
            <span class="feature-tag">数组字段</span>
            <span class="feature-tag">条件字段</span>
            <span class="feature-tag">嵌套表单</span>
          </div>
          <router-link to="/complex" class="btn btn-primary">查看示例</router-link>
        </div>

        <!-- Hooks 用法示例 -->
        <div class="example-card card">
          <div class="example-icon">🎣</div>
          <h3 class="card-title">Hooks 用法</h3>
          <p class="card-description">
            展示如何直接使用 useForm、useField、useFieldArray 等 Composition API hooks
          </p>
          <div class="example-features">
            <span class="feature-tag">useForm</span>
            <span class="feature-tag">useField</span>
            <span class="feature-tag">useFieldArray</span>
          </div>
          <router-link to="/hooks" class="btn btn-primary">查看示例</router-link>
        </div>

        <!-- 自定义组件示例 -->
        <div class="example-card card">
          <div class="example-icon">🎨</div>
          <h3 class="card-title">自定义组件</h3>
          <p class="card-description">
            展示如何创建自定义表单组件，以及与第三方组件库的集成方法
          </p>
          <div class="example-features">
            <span class="feature-tag">自定义组件</span>
            <span class="feature-tag">组件集成</span>
            <span class="feature-tag">扩展功能</span>
          </div>
          <router-link to="/custom" class="btn btn-primary">查看示例</router-link>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-start-section">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">快速开始</h2>
          <p class="card-description">了解如何在 Vue 3 项目中使用 LDesign Form</p>
        </div>

        <div class="code-examples">
          <div class="code-example">
            <h3>1. 安装依赖</h3>
            <pre><code>npm install @ldesign/form</code></pre>
          </div>

          <div class="code-example">
            <h3>2. 导入组件</h3>
            <pre><code>import { LDesignForm, LDesignFormItem } from '@ldesign/form'</code></pre>
          </div>

          <div class="code-example">
            <h3>3. 使用组件</h3>
            <pre><code>&lt;LDesignForm :initial-values="{ name: '', email: '' }" @submit="handleSubmit"&gt;
  &lt;LDesignFormItem name="name" label="姓名" :required="true"&gt;
    &lt;template #default="{ value, setValue }"&gt;
      &lt;input :value="value" @input="setValue($event.target.value)" /&gt;
    &lt;/template&gt;
  &lt;/LDesignFormItem&gt;
  &lt;button type="submit"&gt;提交&lt;/button&gt;
&lt;/LDesignForm&gt;</code></pre>
          </div>
        </div>
      </div>
    </section>

    <!-- 特性介绍 -->
    <section class="features-section">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">核心特性</h2>
          <p class="card-description">LDesign Form 为 Vue 3 开发者提供的强大功能</p>
        </div>

        <div class="features-grid grid grid-3">
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <h3>高性能</h3>
            <p>优化的响应式系统，最小化不必要的重渲染，提供流畅的用户体验</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔧</div>
            <h3>易于使用</h3>
            <p>简洁的 API 设计，与 Vue 3 Composition API 完美结合，学习成本低</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📝</div>
            <h3>TypeScript</h3>
            <p>完整的 TypeScript 支持，提供优秀的开发体验和类型安全</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✅</div>
            <h3>强大验证</h3>
            <p>内置常用验证器，支持自定义验证规则和异步验证</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <h3>灵活定制</h3>
            <p>支持自定义组件和样式，可以轻松集成到任何设计系统中</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔄</div>
            <h3>状态管理</h3>
            <p>完整的表单和字段状态跟踪，实时反馈用户操作</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// 首页不需要额外的逻辑
</script>

<style scoped>
.section-title {
  font-size: var(--ls-font-size-h2);
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-lg);
  text-align: center;
}

.examples-section {
  margin-bottom: var(--ls-spacing-xxl);
}

.example-card {
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.example-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--ldesign-shadow-2);
}

.example-icon {
  font-size: 48px;
  margin-bottom: var(--ls-spacing-base);
}

.example-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ls-spacing-xs);
  justify-content: center;
  margin: var(--ls-spacing-base) 0;
}

.feature-tag {
  background: var(--ldesign-brand-color-1);
  color: var(--ldesign-brand-color-7);
  padding: 4px var(--ls-spacing-sm);
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-xs);
  font-weight: 500;
}

.quick-start-section,
.features-section {
  margin-bottom: var(--ls-spacing-xxl);
}

.code-examples {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-lg);
}

.code-example h3 {
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-sm);
}

.code-example pre {
  background: var(--ldesign-gray-color-1);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-spacing-base);
  overflow-x: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: var(--ls-font-size-sm);
  line-height: 1.4;
}

.code-example code {
  color: var(--ldesign-text-color-primary);
}

.feature-item {
  text-align: center;
  padding: var(--ls-spacing-base);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: var(--ls-spacing-base);
}

.feature-item h3 {
  font-size: var(--ls-font-size-lg);
  color: var(--ldesign-text-color-primary);
  margin-bottom: var(--ls-spacing-sm);
}

.feature-item p {
  color: var(--ldesign-text-color-secondary);
  line-height: 1.5;
}
</style>
