<template>
  <div class="app-config-panel">
    <div class="panel-header">
      <h3>App Config</h3>
      <button class="refresh" @click="reload">Reload</button>
    </div>

    <div class="grid">
      <div class="card">
        <div class="card-title">Summary</div>
        <ul class="kv">
          <li><span>appName</span><code>{{ cfg.app.name }}</code></li>
          <li><span>version</span><code>{{ cfg.app.version }}</code></li>
          <li><span>api.baseUrl</span><code>{{ cfg.api?.baseUrl }}</code></li>
          <li>
            <span>theme.primaryColor</span><code><span class="color" :style="{ background: cfg.theme?.primaryColor }"></span>{{ cfg.theme?.primaryColor }}</code>
          </li>
          <li><span>名称</span><code>{{ cfg.app.title }}</code></li>
        </ul>
      </div>

      <div class="card">
        <div class="card-title">features</div>
        <pre class="json">{{ pretty(cfg.features) }}</pre>
      </div>

      <div class="card">
        <div class="card-title">Raw</div>
        <pre class="json">{{ pretty(cfg) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

// 通过 import.meta.env.appConfig 获取运行时配置
const cfg = ref<any>(import.meta.env.appConfig || {})

// 便捷格式化
const pretty = (v: any) => JSON.stringify(v, null, 2)

// 简单 reload（在某些情况下可用于强制取最新的注入值）
function reload() {
  // import.meta.env.appConfig 由插件注入，会随 HMR 更新
  cfg.value = import.meta.env.appConfig || {}
}

// 侦听 HMR 变化（若热更新触发时，注入值已更新）
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    cfg.value = import.meta.env.appConfig || {}
  })

  // 监听自定义的配置更新事件
  import.meta.hot.on('app-config-updated', (data) => {
    console.log('🔥 App config updated via HMR:', data)
    cfg.value = data
    // 同时更新 import.meta.env.appConfig
    import.meta.env.appConfig = data
  })
}

// 初次渲染也同步一次
watchEffect(() => {
  cfg.value = import.meta.env.appConfig || {}
})
</script>

<style scoped>
.app-config-panel {
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  padding: 12px;
  background: var(--ldesign-bg-color-container);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.refresh {
  padding: 6px 10px;
  border: 1px solid var(--ldesign-brand-color);
  background: var(--ldesign-brand-color);
  color: #fff;
  border-radius: 6px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.card {
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  background: var(--ldesign-bg-color-component);
  padding: 10px;
}

.card-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.kv {
  list-style: none;
  padding: 0;
  margin: 0;
}

.kv li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px dashed var(--ldesign-border-color);
}

.kv li:last-child {
  border-bottom: none;
}

.kv span {
  color: var(--ldesign-text-color-secondary);
}

.kv code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  background: rgba(0, 0, 0, .04);
  padding: 2px 6px;
  border-radius: 4px;
}

.color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 6px;
  vertical-align: -2px;
}

.json {
  margin: 0;
  max-height: 260px;
  overflow: auto;
}
</style>
