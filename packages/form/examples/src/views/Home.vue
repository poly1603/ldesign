<template>
  <div class="home">
    <!-- 欢迎区域 -->
    <section class="hero">
      <h1 class="hero__title">@ldesign/form</h1>
      <p class="hero__subtitle">框架无关的现代表单解决方案</p>
      <div class="hero__features">
        <div class="feature">
          <h3>🚀 框架无关</h3>
          <p>核心逻辑完全独立于UI框架，支持Vue、React、Angular等</p>
        </div>
        <div class="feature">
          <h3>⚡ 高性能</h3>
          <p>智能缓存、事件优化、内存管理，确保最佳性能</p>
        </div>
        <div class="feature">
          <h3>🎯 类型安全</h3>
          <p>完整的 TypeScript 支持，提供优秀的开发体验</p>
        </div>
        <div class="feature">
          <h3>🔧 灵活扩展</h3>
          <p>适配器模式支持多框架，插件化验证系统</p>
        </div>
      </div>
    </section>

    <!-- 快速开始 -->
    <section class="quick-start">
      <div class="card">
        <div class="card__header">
          <h3>快速开始</h3>
          <p>选择一个示例开始体验 @ldesign/form 的强大功能</p>
        </div>
        <div class="card__content">
          <div class="examples-grid">
            <router-link to="/basic" class="example-card">
              <h4>基础表单</h4>
              <p>学习如何创建和使用基础表单功能</p>
            </router-link>
            <router-link to="/validation" class="example-card">
              <h4>验证示例</h4>
              <p>探索强大的表单验证功能和自定义验证器</p>
            </router-link>
            <router-link to="/advanced" class="example-card">
              <h4>高级功能</h4>
              <p>了解字段联动、条件渲染等高级特性</p>
            </router-link>
            <router-link to="/adapter" class="example-card">
              <h4>适配器示例</h4>
              <p>体验框架无关的适配器系统</p>
            </router-link>
            <router-link to="/horizontal-layout" class="example-card">
              <h4>水平布局示例</h4>
              <p>体验Grid布局的水平表单排版</p>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- 代码示例 -->
    <section class="code-example">
      <div class="card">
        <div class="card__header">
          <h3>代码示例</h3>
          <p>一个简单的表单创建示例</p>
        </div>
        <div class="card__content">
          <pre><code>{{ codeExample }}</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const codeExample = `import { createForm, VanillaAdapter } from '@ldesign/form'

// 创建表单实例
const form = createForm({
  initialValues: {
    name: '',
    email: ''
  },
  fields: [
    {
      name: 'name',
      label: '姓名',
      type: 'input',
      rules: [{ type: 'required', message: '请输入姓名' }]
    },
    {
      name: 'email',
      label: '邮箱',
      type: 'input',
      rules: [
        { type: 'required', message: '请输入邮箱' },
        { type: 'email', message: '请输入有效的邮箱地址' }
      ]
    }
  ]
}, {
  onSubmit: async (values) => {
    console.log('提交数据:', values)
  }
})

// 使用适配器渲染表单
const adapter = new VanillaAdapter()
adapter.mount(form, '#form-container')`
</script>

<style lang="less" scoped>
.home {
  max-width: 1000px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: var(--ls-padding-xxl) 0;
  margin-bottom: var(--ls-margin-xl);

  &__title {
    font-size: var(--ls-font-size-h1);
    margin: 0 0 var(--ls-margin-base);
    color: var(--ldesign-brand-color);
    font-weight: 700;
  }

  &__subtitle {
    font-size: var(--ls-font-size-lg);
    margin: 0 0 var(--ls-margin-xl);
    color: var(--ldesign-text-color-secondary);
  }

  &__features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--ls-spacing-lg);
    margin-top: var(--ls-margin-xl);
  }
}

.feature {
  text-align: center;
  padding: var(--ls-padding-base);

  h3 {
    margin: 0 0 var(--ls-margin-sm);
    font-size: var(--ls-font-size-base);
    color: var(--ldesign-text-color-primary);
  }

  p {
    margin: 0;
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
    line-height: 1.5;
  }
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--ls-spacing-base);
}

.example-card {
  display: block;
  padding: var(--ls-padding-base);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--ldesign-brand-color);
    box-shadow: var(--ldesign-shadow-2);
    transform: translateY(-2px);
  }

  h4 {
    margin: 0 0 var(--ls-margin-xs);
    color: var(--ldesign-brand-color);
    font-size: var(--ls-font-size-base);
  }

  p {
    margin: 0;
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-sm);
    line-height: 1.4;
  }
}

.code-example {
  pre {
    background: var(--ldesign-bg-color-page);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    padding: var(--ls-padding-base);
    overflow-x: auto;
    font-size: var(--ls-font-size-xs);
    line-height: 1.4;
    color: var(--ldesign-text-color-primary);
  }

  code {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }
}
</style>
