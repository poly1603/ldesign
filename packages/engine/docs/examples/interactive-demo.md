# 🎮 交互式演示

这里提供了一个完整的交互式演示，让你可以直接在浏览器中体验 LDesign Engine 的各种功能。

## 🚀 在线演示

<div class="demo-container">
  <div class="demo-controls">
    <h3>🎛️ 控制面板</h3>

    <!-- 引擎状态 -->
    <div class="control-group">
      <h4>引擎状态</h4>
      <div class="status-display">
        <span>状态: </span>
        <span id="engine-status" class="status">未初始化</span>
      </div>
      <button id="init-engine" class="btn btn-primary">初始化引擎</button>
      <button id="destroy-engine" class="btn btn-danger" disabled>销毁引擎</button>
    </div>

    <!-- 配置管理 -->
    <div class="control-group">
      <h4>配置管理</h4>
      <div class="input-group">
        <input type="text" id="config-key" placeholder="配置键" value="app.theme">
        <input type="text" id="config-value" placeholder="配置值" value="dark">
        <button id="set-config" class="btn">设置</button>
        <button id="get-config" class="btn">获取</button>
      </div>
    </div>

    <!-- 状态管理 -->
    <div class="control-group">
      <h4>状态管理</h4>
      <div class="input-group">
        <input type="text" id="state-key" placeholder="状态键" value="user.name">
        <input type="text" id="state-value" placeholder="状态值" value="张三">
        <button id="set-state" class="btn">设置</button>
        <button id="get-state" class="btn">获取</button>
        <button id="watch-state" class="btn">监听</button>
      </div>
    </div>

    <!-- 事件系统 -->
    <div class="control-group">
      <h4>事件系统</h4>
      <div class="input-group">
        <input type="text" id="event-name" placeholder="事件名称" value="user:login">
        <input type="text" id="event-data" placeholder="事件数据" value="用户登录成功">
        <button id="listen-event" class="btn">监听</button>
        <button id="emit-event" class="btn">触发</button>
      </div>
    </div>

    <!-- 通知系统 -->
    <div class="control-group">
      <h4>通知系统</h4>
      <div class="input-group">
        <select id="notification-type">
          <option value="info">信息</option>
          <option value="success">成功</option>
          <option value="warning">警告</option>
          <option value="error">错误</option>
        </select>
        <input type="text" id="notification-message" placeholder="通知消息" value="这是一条测试通知">
        <button id="show-notification" class="btn">显示通知</button>
      </div>
    </div>

    <!-- 插件系统 -->
    <div class="control-group">
      <h4>插件系统</h4>
      <button id="register-plugin" class="btn">注册测试插件</button>
      <button id="plugin-stats" class="btn">插件统计</button>
    </div>
  </div>

  <div class="demo-output">
    <h3>📊 输出面板</h3>
    <div class="output-tabs">
      <button class="tab-btn active" data-tab="logs">日志</button>
      <button class="tab-btn" data-tab="state">状态</button>
      <button class="tab-btn" data-tab="config">配置</button>
      <button class="tab-btn" data-tab="events">事件</button>
    </div>

    <div class="tab-content">
      <div id="logs-tab" class="tab-pane active">
        <div class="log-header">
          <span>系统日志</span>
          <button id="clear-logs" class="btn btn-sm">清空</button>
        </div>
        <div id="log-output" class="log-container"></div>
      </div>

      <div id="state-tab" class="tab-pane">
        <div class="json-viewer">
          <pre id="state-viewer">{}</pre>
        </div>
      </div>

      <div id="config-tab" class="tab-pane">
        <div class="json-viewer">
          <pre id="config-viewer">{}</pre>
        </div>
      </div>

      <div id="events-tab" class="tab-pane">
        <div class="event-list" id="event-list">
          <p class="empty-state">暂无事件记录</p>
        </div>
      </div>
    </div>
  </div>
</div>

## 📝 代码示例

以下是演示中使用的核心代码：

### 初始化引擎

```typescript
import { createEngine } from '@ldesign/engine'

// 创建引擎实例
const engine = createEngine({
  appName: 'Interactive Demo',
  debug: true,
  features: {
    enableHotReload: true,
    enableDevTools: true,
    enablePerformanceMonitoring: true,
    enableNotifications: true
  }
})

// 监听生命周期事件
engine.lifecycle.on('afterInit', () => {
  console.log('引擎初始化完成')
  updateStatus('已初始化')
})

engine.lifecycle.on('beforeDestroy', () => {
  console.log('引擎即将销毁')
  updateStatus('已销毁')
})
```

### 配置管理

```typescript
// 设置配置
function setConfig() {
  const key = document.getElementById('config-key').value
  const value = document.getElementById('config-value').value

  engine.config.set(key, value)
  log(`设置配置: ${key} = ${value}`, 'success')
  updateConfigViewer()
}

// 获取配置
function getConfig() {
  const key = document.getElementById('config-key').value
  const value = engine.config.get(key)

  log(`获取配置: ${key} = ${JSON.stringify(value)}`, 'info')
}

// 监听配置变化
engine.config.onChanged((changes) => {
  log(`配置变化: ${JSON.stringify(changes)}`, 'warning')
  updateConfigViewer()
})
```

### 状态管理

```typescript
// 设置状态
function setState() {
  const key = document.getElementById('state-key').value
  const value = document.getElementById('state-value').value

  engine.state.set(key, value)
  log(`设置状态: ${key} = ${value}`, 'success')
  updateStateViewer()
}

// 监听状态变化
function watchState() {
  const key = document.getElementById('state-key').value

  engine.state.watch(key, (newValue, oldValue) => {
    log(`状态变化: ${key} 从 ${oldValue} 变为 ${newValue}`, 'warning')
    updateStateViewer()
  })

  log(`开始监听状态: ${key}`, 'info')
}
```

### 事件系统

```typescript
// 监听事件
function listenEvent() {
  const eventName = document.getElementById('event-name').value

  engine.events.on(eventName, (data) => {
    log(`收到事件: ${eventName}`, 'info')
    addEventRecord(eventName, data, 'received')
  })

  log(`开始监听事件: ${eventName}`, 'info')
}

// 触发事件
function emitEvent() {
  const eventName = document.getElementById('event-name').value
  const eventData = document.getElementById('event-data').value

  engine.events.emit(eventName, eventData)
  log(`触发事件: ${eventName}`, 'success')
  addEventRecord(eventName, eventData, 'emitted')
}
```

### 通知系统

```typescript
// 显示通知
function showNotification() {
  const type = document.getElementById('notification-type').value
  const message = document.getElementById('notification-message').value

  engine.notifications.show({
    type,
    message,
    duration: 3000
  })

  log(`显示通知: [${type}] ${message}`, 'success')
}
```

### 插件系统

```typescript
// 注册测试插件
function registerPlugin() {
  const testPlugin = {
    name: 'demo-plugin',
    version: '1.0.0',
    description: '演示插件',

    install: (context) => {
      const { engine, logger } = context

      // 添加自定义方法
      engine.demoMethod = () => {
        logger.info('演示插件方法被调用')
        return 'Hello from demo plugin!'
      }

      logger.info('演示插件安装完成')
    },

    uninstall: (context) => {
      const { engine, logger } = context
      delete engine.demoMethod
      logger.info('演示插件卸载完成')
    }
  }

  engine.plugins.register(testPlugin)
  log('注册演示插件', 'success')
}

// 获取插件统计
function getPluginStats() {
  const stats = engine.plugins.getStats()
  log(`插件统计: 总数 ${stats.total}, 已加载 ${stats.loaded.length}`, 'info')
}
```

## 🎯 功能特性

### 实时状态监控

演示界面实时显示：
- 引擎状态
- 配置变化
- 状态更新
- 事件流
- 插件信息

### 交互式操作

支持以下交互操作：
- 动态配置修改
- 状态设置和监听
- 事件发布订阅
- 通知显示
- 插件注册

### 可视化输出

提供多种可视化输出：
- 结构化日志
- JSON 状态查看器
- 事件时间线
- 性能指标

## 🔧 自定义扩展

你可以基于这个演示进行扩展：

### 添加自定义插件

```typescript
const customPlugin = {
  name: 'my-custom-plugin',
  version: '1.0.0',

  install: (context) => {
    // 自定义插件逻辑
    context.engine.myCustomFeature = () => {
      return 'Custom feature activated!'
    }
  }
}

engine.plugins.register(customPlugin)
```

### 扩展状态管理

```typescript
// 添加复杂状态
engine.state.set('app', {
  user: { name: '张三', role: 'admin' },
  settings: { theme: 'dark', language: 'zh-CN' },
  data: { items: [], loading: false }
})

// 监听嵌套状态变化
engine.state.watch('app.user.name', (newName) => {
  console.log('用户名变更:', newName)
})
```

### 自定义事件

```typescript
// 定义自定义事件
engine.events.on('app:ready', () => {
  console.log('应用准备就绪')
})

engine.events.on('user:action', (action) => {
  console.log('用户操作:', action)
})

// 触发自定义事件
engine.events.emit('app:ready')
engine.events.emit('user:action', { type: 'click', target: 'button' })
```

## 📱 移动端适配

演示界面支持移动端访问，自动适配屏幕尺寸和触摸操作。

## 🔗 相关链接

- [快速开始](../guide/getting-started.md)
- [API 参考](../api/)
- [更多示例](./basic.md)
- [最佳实践](../guide/best-practices.md)

<style>
.demo-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
  min-height: 600px;
}

@media (max-width: 768px) {
  .demo-container {
    grid-template-columns: 1fr;
  }
}

.demo-controls, .demo-output {
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  padding: 20px;
  background: var(--vp-c-bg-soft);
}

.control-group {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.control-group:last-child {
  border-bottom: none;
}

.control-group h4 {
  margin: 0 0 10px 0;
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
}

.input-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.input-group input, .input-group select {
  flex: 1;
  min-width: 120px;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
}

.btn {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-brand);
  border-radius: 4px;
  background: var(--vp-c-brand);
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn:hover {
  background: var(--vp-c-brand-dark);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--vp-c-brand);
}

.btn-danger {
  background: #dc3545;
  border-color: #dc3545;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 11px;
}

.status-display {
  margin-bottom: 10px;
  font-size: 14px;
}

.status {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status.success {
  background: #d4edda;
  color: #155724;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
}

.output-tabs {
  display: flex;
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 15px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  color: var(--vp-c-text-2);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-size: 13px;
}

.tab-btn.active {
  color: var(--vp-c-brand);
  border-bottom-color: var(--vp-c-brand);
}

.tab-pane {
  display: none;
}

.tab-pane.active {
  display: block;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-weight: 600;
  font-size: 13px;
}

.log-container {
  height: 300px;
  overflow-y: auto;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  padding: 10px;
  font-family: var(--vp-font-family-mono);
  font-size: 12px;
  line-height: 1.4;
}

.log-entry {
  margin-bottom: 4px;
  padding: 2px 0;
}

.log-entry.info { color: #0066cc; }
.log-entry.success { color: #28a745; }
.log-entry.error { color: #dc3545; }
.log-entry.warning { color: #ffc107; }

.json-viewer {
  height: 300px;
  overflow: auto;
}

.json-viewer pre {
  margin: 0;
  padding: 15px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
}

.event-list {
  height: 300px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  color: var(--vp-c-text-2);
  font-style: italic;
  margin-top: 50px;
}

.event-item {
  padding: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 12px;
}

.event-item:last-child {
  border-bottom: none;
}

.event-name {
  font-weight: 600;
  color: var(--vp-c-brand);
}

.event-time {
  color: var(--vp-c-text-2);
  font-size: 11px;
}
</style>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  // 这里会加载交互式演示的 JavaScript 代码
  // 实际实现会在构建时注入
})
</script>
