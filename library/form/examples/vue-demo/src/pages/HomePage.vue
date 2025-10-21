<template>
  <div class="home-page">
    <div class="hero-section">
      <h1 class="hero-title">@ldesign/form</h1>
      <p class="hero-subtitle">功能完整的企业级表单解决方案</p>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-number">13</div>
          <div class="stat-label">字段组件</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">22</div>
          <div class="stat-label">验证规则</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">12</div>
          <div class="stat-label">演示页面</div>
        </div>
      </div>
    </div>

    <div class="features-section">
      <h2 class="section-title">✨ 核心特性</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🚀</div>
          <h3>完整的组件库</h3>
          <p>13个字段组件覆盖所有常见场景</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">✅</div>
          <h3>强大的验证</h3>
          <p>22个验证规则，支持异步和跨字段验证</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎨</div>
          <h3>主题定制</h3>
          <p>支持浅色/深色主题和完整的样式定制</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📱</div>
          <h3>响应式布局</h3>
          <p>自适应多列布局和智能间距计算</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <h3>动态数组</h3>
          <p>支持动态添加/删除/排序表单项</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎯</div>
          <h3>条件渲染</h3>
          <p>根据字段值动态显示/隐藏字段</p>
        </div>
      </div>
    </div>

    <div class="quick-start-section">
      <h2 class="section-title">🚀 快速开始</h2>
      <div class="code-example">
        <pre><code>{{ quickStartCode }}</code></pre>
      </div>
    </div>

    <div class="categories-section">
      <h2 class="section-title">📚 演示分类</h2>
      <div class="categories-grid">
        <div class="category-card" @click="navigateTo('/all-fields')">
          <div class="category-icon">📦</div>
          <h3>字段组件</h3>
          <p>查看所有字段类型和验证规则</p>
        </div>
        <div class="category-card" @click="navigateTo('/user-profile')">
          <div class="category-icon">🎯</div>
          <h3>真实场景</h3>
          <p>用户资料、商品编辑、问卷调查等</p>
        </div>
        <div class="category-card" @click="navigateTo('/array-fields')">
          <div class="category-icon">🔧</div>
          <h3>高级功能</h3>
          <p>动态数组、条件字段、表单分组等</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { navigateTo } from '../router'

const quickStartCode = `import {
  InputField,
  SelectField,
  DatePickerField
} from '@ldesign/form/vue/fields'

// 在模板中使用
<InputField v-model="username" clearable />
<SelectField v-model="category" :options="options" />
<DatePickerField v-model="birthday" />`
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-section {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 32px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 40px;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 42px;
  font-weight: 700;
  color: #722ED1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

.features-section,
.quick-start-section,
.categories-section {
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  margin-bottom: 32px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 32px;
  text-align: center;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.feature-card {
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
  text-align: center;
  transition: all 0.3s;
}

.feature-card:hover {
  background: #f0e5ff;
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
  color: rgba(0, 0, 0, 0.85);
}

.feature-card p {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.6;
}

.code-example {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 24px;
  border-radius: 8px;
  overflow-x: auto;
}

.code-example pre {
  margin: 0;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.category-card {
  padding: 32px;
  background: #fafafa;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.category-card:hover {
  background: #722ED1;
  color: #fff;
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(114, 46, 209, 0.2);
}

.category-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.category-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.category-card p {
  font-size: 14px;
  opacity: 0.8;
}

.category-card:hover h3,
.category-card:hover p {
  color: #fff;
}
</style>



