<script setup lang="ts">
import CounterExample from './components/CounterExample.vue'
import TodoExample from './components/TodoExample.vue'
import UserExample from './components/UserExample.vue'
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>@ldesign/store 基础示例</h1>
      <p>展示基本的状态管理功能</p>
    </header>

    <main class="main">
      <div class="examples">
        <CounterExample />
        <TodoExample />
        <UserExample />
      </div>
    </main>

    <footer class="footer">
      <p>
        查看
        <a href="https://github.com/ldesign/store" target="_blank">GitHub</a>
        了解更多信息
      </p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 2rem;
}

.header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
}

.header p {
  margin: 0;
  opacity: 0.9;
}

.main {
  flex: 1;
  padding: 2rem;
  background: #f8fafc;
}

.examples {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.footer {
  background: #2d3748;
  color: white;
  text-align: center;
  padding: 1rem;
}

.footer a {
  color: #63b3ed;
  text-decoration: none;
}

.footer a:hover {
  text-decoration: underline;
}
</style>
