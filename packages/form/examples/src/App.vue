<template>
  <div class="app">
    <!-- 头部导航 -->
    <header class="app-header">
      <div class="container">
        <h1 class="logo">
          <router-link to="/">@ldesign/form</router-link>
        </h1>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/basic" class="nav-link">基础表单</router-link>
          <router-link to="/validation" class="nav-link">验证示例</router-link>
          <router-link to="/advanced" class="nav-link">高级功能</router-link>
          <router-link to="/horizontal-layout" class="nav-link">水平布局</router-link>
          <router-link to="/collapsible" class="nav-link">展开/收起</router-link>
          <router-link to="/adapter" class="nav-link">适配器</router-link>
        </nav>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="app-main">
      <div class="container">
        <router-view />
      </div>
    </main>

    <!-- 底部 -->
    <footer class="app-footer">
      <div class="container">
        <p>&copy; 2024 LDesign Team. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// 这里可以添加全局逻辑
</script>

<style lang="less">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-color);
  padding: 0 var(--ls-padding-base);

  .container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
  }

  .logo {
    margin: 0;
    font-size: var(--ls-font-size-lg);
    font-weight: 600;

    a {
      color: var(--ldesign-brand-color);
      text-decoration: none;
    }
  }

  .nav {
    display: flex;
    gap: var(--ls-spacing-lg);
  }

  .nav-link {
    color: var(--ldesign-text-color-secondary);
    text-decoration: none;
    padding: var(--ls-padding-xs) var(--ls-padding-sm);
    border-radius: var(--ls-border-radius-base);
    transition: all 0.2s ease;

    &:hover {
      color: var(--ldesign-brand-color);
      background: var(--ldesign-brand-color-focus);
    }

    &.router-link-active {
      color: var(--ldesign-brand-color);
      background: var(--ldesign-brand-color-focus);
    }
  }
}

.app-main {
  flex: 1;
  padding: var(--ls-padding-xl) var(--ls-padding-base);

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}

.app-footer {
  background: var(--ldesign-bg-color-container);
  border-top: 1px solid var(--ldesign-border-color);
  padding: var(--ls-padding-base);
  text-align: center;

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  p {
    margin: 0;
    color: var(--ldesign-text-color-secondary);
    font-size: var(--ls-font-size-xs);
  }
}
</style>
