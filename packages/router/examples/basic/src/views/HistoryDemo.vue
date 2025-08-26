<script setup lang="ts">
import { useRoute } from '@ldesign/router'
import { computed, onMounted, reactive, ref } from 'vue'

const route = useRoute()

// 当前模式（模拟）
const currentMode = ref('history')
const selectedMode = ref('history')

// 历史模式配置
const historyModes = [
  {
    type: 'hash',
    name: 'Hash模式',
    icon: '#️⃣',
    shortDesc: '使用URL hash进行路由',
    description: '通过URL的hash部分（#后面的内容）来管理路由，兼容性最好',
    urlFormat: 'example.com/#/page',
    browserSupport: '所有浏览器',
    seoFriendly: false,
  },
  {
    type: 'history',
    name: 'History模式',
    icon: '📜',
    shortDesc: '使用HTML5 History API',
    description: '使用HTML5的pushState API来管理路由，URL更美观',
    urlFormat: 'example.com/page',
    browserSupport: 'HTML5浏览器',
    seoFriendly: true,
  },
  {
    type: 'memory',
    name: 'Memory模式',
    icon: '🧠',
    shortDesc: '在内存中管理历史',
    description: '不依赖浏览器URL，历史记录保存在内存中',
    urlFormat: '内存中存储，不改变URL',
    browserSupport: '所有浏览器',
    seoFriendly: false,
  },
]

// 当前模式信息
const currentModeInfo = computed(() => {
  return historyModes.find(mode => mode.type === currentMode.value) ?? historyModes[1]
})

// 获取选中模式信息
function getSelectedModeInfo() {
  return historyModes.find(mode => mode.type === selectedMode.value) ?? historyModes[1]
}

// 切换模拟
const switchSimulation = reactive({
  active: false,
  currentStep: 0,
  steps: [
    { title: '保存当前状态', description: '保存当前路由状态和组件数据' },
    { title: '销毁当前路由器', description: '清理当前路由器实例和事件监听' },
    { title: '创建新路由器', description: '使用新的历史模式创建路由器实例' },
    { title: '恢复路由状态', description: '恢复之前保存的路由状态' },
    { title: '重新渲染应用', description: '使用新的路由器重新渲染整个应用' },
  ],
})

// 测试路由
const testRoutes = [
  { path: '/', name: '首页' },
  { path: '/about', name: '关于' },
  { path: '/user/123', name: '用户' },
  { path: '/history-demo', name: '历史模式' },
]

// 当前URL信息
const currentUrl = ref(window.location.href)
const urlParts = computed(() => {
  const url = new URL(currentUrl.value)
  return {
    protocol: url.protocol,
    host: url.host,
    pathname: url.pathname,
    hash: url.hash,
  }
})

// 方法
function selectMode(mode: string) {
  selectedMode.value = mode
}

async function simulateSwitch() {
  if (selectedMode.value === currentMode.value)
    return

  switchSimulation.active = true
  switchSimulation.currentStep = 0

  // 模拟切换过程
  for (let i = 0; i < switchSimulation.steps.length; i++) {
    switchSimulation.currentStep = i
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // 完成切换
  currentMode.value = selectedMode.value
  switchSimulation.currentStep = switchSimulation.steps.length

  setTimeout(() => {
    switchSimulation.active = false
    switchSimulation.currentStep = 0
  }, 1500)
}

function resetDemo() {
  selectedMode.value = 'history'
  currentMode.value = 'history'
  switchSimulation.active = false
  switchSimulation.currentStep = 0
}

function getUrlForMode(mode: string) {
  const baseUrl = window.location.origin
  const currentPath = route.value?.path || '/history-demo'

  switch (mode) {
    case 'hash':
      return `${baseUrl}/#${currentPath}`
    case 'history':
      return `${baseUrl}${currentPath}`
    case 'memory':
      return `${baseUrl} (内存中: ${currentPath})`
    default:
      return baseUrl
  }
}

function navigateToRoute(path: string) {
  // 模拟导航，更新URL显示
  const baseUrl = window.location.origin
  switch (currentMode.value) {
    case 'hash':
      currentUrl.value = `${baseUrl}/#${path}`
      break
    case 'history':
      currentUrl.value = `${baseUrl}${path}`
      break
    case 'memory':
      currentUrl.value = `${baseUrl} (内存中: ${path})`
      break
  }
}

onMounted(() => {
  // 检测当前实际使用的历史模式
  if (window.location.hash.startsWith('#/')) {
    currentMode.value = 'hash'
    selectedMode.value = 'hash'
  }
  else {
    currentMode.value = 'history'
    selectedMode.value = 'history'
  }
})
</script>

<template>
  <div class="history-demo">
    <h2>📚 历史模式演示</h2>
    <p>这个页面演示了@ldesign/router支持的三种历史模式：Hash模式、History模式和Memory模式。</p>

    <!-- 当前模式信息 -->
    <div class="current-mode">
      <h3>🔍 当前历史模式</h3>
      <div class="mode-info">
        <div class="mode-card current">
          <div class="mode-header">
            <span class="mode-icon">{{ currentModeInfo?.icon || '📜' }}</span>
            <span class="mode-name">{{ currentModeInfo?.name || 'History模式' }}</span>
            <span class="mode-badge">当前使用</span>
          </div>
          <div class="mode-description">
            {{ currentModeInfo?.description || '使用HTML5的pushState API来管理路由，URL更美观' }}
          </div>
          <div class="mode-details">
            <div class="detail-item">
              <span class="detail-label">URL格式:</span>
              <span class="detail-value">{{ currentModeInfo?.urlFormat || 'example.com/page' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">浏览器支持:</span>
              <span class="detail-value">{{ currentModeInfo?.browserSupport || 'HTML5浏览器' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">SEO友好:</span>
              <span class="detail-value">{{ currentModeInfo?.seoFriendly ? '是' : '否' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模式对比 -->
    <div class="mode-comparison">
      <h3>⚖️ 模式对比</h3>
      <div class="comparison-table">
        <div class="table-header">
          <div class="header-cell">
            特性
          </div>
          <div class="header-cell">
            Hash模式
          </div>
          <div class="header-cell">
            History模式
          </div>
          <div class="header-cell">
            Memory模式
          </div>
        </div>

        <div class="table-row">
          <div class="cell feature">
            URL格式
          </div>
          <div class="cell">
            example.com/#/page
          </div>
          <div class="cell">
            example.com/page
          </div>
          <div class="cell">
            内存中存储
          </div>
        </div>

        <div class="table-row">
          <div class="cell feature">
            浏览器兼容性
          </div>
          <div class="cell good">
            所有浏览器
          </div>
          <div class="cell warning">
            HTML5浏览器
          </div>
          <div class="cell good">
            所有浏览器
          </div>
        </div>

        <div class="table-row">
          <div class="cell feature">
            SEO友好
          </div>
          <div class="cell bad">
            否
          </div>
          <div class="cell good">
            是
          </div>
          <div class="cell bad">
            否
          </div>
        </div>

        <div class="table-row">
          <div class="cell feature">
            服务器配置
          </div>
          <div class="cell good">
            无需配置
          </div>
          <div class="cell warning">
            需要配置
          </div>
          <div class="cell good">
            无需配置
          </div>
        </div>

        <div class="table-row">
          <div class="cell feature">
            刷新页面
          </div>
          <div class="cell good">
            正常工作
          </div>
          <div class="cell warning">
            需要服务器支持
          </div>
          <div class="cell bad">
            会丢失状态
          </div>
        </div>

        <div class="table-row">
          <div class="cell feature">
            适用场景
          </div>
          <div class="cell">
            传统应用、快速开发
          </div>
          <div class="cell">
            现代应用、生产环境
          </div>
          <div class="cell">
            测试、SSR、移动应用
          </div>
        </div>
      </div>
    </div>

    <!-- 模式切换演示 -->
    <div class="mode-switching">
      <h3>🔄 模式切换演示</h3>
      <p>点击下面的按钮体验不同历史模式的效果（注意：实际切换需要重新初始化路由器）：</p>

      <div class="switch-controls">
        <div class="mode-options">
          <div
            v-for="mode in historyModes"
            :key="mode.type"
            class="mode-option"
            :class="{ active: selectedMode === mode.type }"
            @click="selectMode(mode.type)"
          >
            <div class="option-header">
              <span class="option-icon">{{ mode.icon }}</span>
              <span class="option-name">{{ mode.name }}</span>
            </div>
            <div class="option-description">
              {{ mode.shortDesc }}
            </div>
          </div>
        </div>

        <div class="switch-actions">
          <button class="switch-btn" :disabled="selectedMode === currentMode" @click="simulateSwitch">
            切换到{{ getSelectedModeInfo()?.name || '选中模式' }}
          </button>
          <button class="reset-btn" @click="resetDemo">
            重置演示
          </button>
        </div>
      </div>

      <!-- 切换效果演示 -->
      <div v-if="switchSimulation.active" class="switch-simulation">
        <h4>切换过程演示</h4>
        <div class="simulation-steps">
          <div
            v-for="(step, index) in switchSimulation.steps"
            :key="index"
            class="simulation-step"
            :class="{
              active: index === switchSimulation.currentStep,
              completed: index < switchSimulation.currentStep,
            }"
          >
            <div class="step-number">
              {{ index + 1 }}
            </div>
            <div class="step-content">
              <div class="step-title">
                {{ step.title }}
              </div>
              <div class="step-description">
                {{ step.description }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- URL变化演示 -->
    <div class="url-demo">
      <h3>🔗 URL变化演示</h3>
      <p>观察不同历史模式下URL的变化：</p>

      <div class="url-examples">
        <div class="url-group">
          <h4>当前页面在不同模式下的URL</h4>
          <div class="url-list">
            <div class="url-item">
              <span class="url-mode">Hash模式:</span>
              <code class="url-value">{{ getUrlForMode('hash') }}</code>
            </div>
            <div class="url-item">
              <span class="url-mode">History模式:</span>
              <code class="url-value">{{ getUrlForMode('history') }}</code>
            </div>
            <div class="url-item">
              <span class="url-mode">Memory模式:</span>
              <code class="url-value">{{ getUrlForMode('memory') }}</code>
            </div>
          </div>
        </div>

        <div class="url-group">
          <h4>导航测试</h4>
          <div class="nav-test">
            <div class="test-links">
              <button
                v-for="testRoute in testRoutes"
                :key="testRoute.path"
                class="test-link"
                @click="navigateToRoute(testRoute.path)"
              >
                {{ testRoute.name }}
              </button>
            </div>
            <div class="url-display">
              <div class="current-url">
                <span class="url-label">当前URL:</span>
                <code>{{ currentUrl }}</code>
              </div>
              <div class="url-parts">
                <div class="url-part">
                  <span class="part-label">协议:</span>
                  <span class="part-value">{{ urlParts.protocol }}</span>
                </div>
                <div class="url-part">
                  <span class="part-label">域名:</span>
                  <span class="part-value">{{ urlParts.host }}</span>
                </div>
                <div class="url-part">
                  <span class="part-label">路径:</span>
                  <span class="part-value">{{ urlParts.pathname }}</span>
                </div>
                <div class="url-part">
                  <span class="part-label">Hash:</span>
                  <span class="part-value">{{ urlParts.hash || '无' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 最佳实践建议 -->
    <div class="best-practices">
      <h3>💡 最佳实践建议</h3>
      <div class="practice-cards">
        <div class="practice-card">
          <div class="practice-header">
            <span class="practice-icon">🏭</span>
            <span class="practice-title">生产环境</span>
          </div>
          <div class="practice-content">
            <p><strong>推荐：History模式</strong></p>
            <ul>
              <li>URL更美观，SEO友好</li>
              <li>用户体验更好</li>
              <li>需要配置服务器支持</li>
            </ul>
          </div>
        </div>

        <div class="practice-card">
          <div class="practice-header">
            <span class="practice-icon">🚀</span>
            <span class="practice-title">快速开发</span>
          </div>
          <div class="practice-content">
            <p><strong>推荐：Hash模式</strong></p>
            <ul>
              <li>无需服务器配置</li>
              <li>兼容性好</li>
              <li>开发调试方便</li>
            </ul>
          </div>
        </div>

        <div class="practice-card">
          <div class="practice-header">
            <span class="practice-icon">🧪</span>
            <span class="practice-title">测试环境</span>
          </div>
          <div class="practice-content">
            <p><strong>推荐：Memory模式</strong></p>
            <ul>
              <li>不影响浏览器历史</li>
              <li>测试隔离性好</li>
              <li>适合单元测试</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.current-mode, .mode-comparison, .mode-switching, .url-demo, .best-practices {
  margin: 40px 0;
  padding: 25px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.mode-info {
  margin-top: 20px;
}

.mode-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 2px solid #dee2e6;
  transition: all 0.3s;
}

.mode-card.current {
  border-color: #28a745;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.2);
}

.mode-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.mode-icon {
  font-size: 24px;
}

.mode-name {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
}

.mode-badge {
  background: #28a745;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.mode-description {
  color: #6c757d;
  margin-bottom: 15px;
  line-height: 1.5;
}

.mode-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-weight: 500;
  color: #495057;
}

.detail-value {
  color: #007bff;
  font-weight: 600;
}

.comparison-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-top: 20px;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  background: #495057;
  color: white;
}

.header-cell {
  padding: 15px;
  font-weight: 600;
  text-align: center;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  border-bottom: 1px solid #dee2e6;
}

.table-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 12px 15px;
  text-align: center;
  border-right: 1px solid #f1f3f4;
}

.cell:last-child {
  border-right: none;
}

.cell.feature {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
  text-align: left;
}

.cell.good {
  background: #d4edda;
  color: #155724;
}

.cell.warning {
  background: #fff3cd;
  color: #856404;
}

.cell.bad {
  background: #f8d7da;
  color: #721c24;
}

.switch-controls {
  margin-top: 20px;
}

.mode-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.mode-option {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #dee2e6;
  cursor: pointer;
  transition: all 0.3s;
}

.mode-option:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.2);
}

.mode-option.active {
  border-color: #007bff;
  background: #e3f2fd;
}

.option-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.option-icon {
  font-size: 20px;
}

.option-name {
  font-weight: 600;
  color: #495057;
}

.option-description {
  color: #6c757d;
  font-size: 14px;
}

.switch-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.switch-btn, .reset-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.switch-btn {
  background: #007bff;
  color: white;
}

.switch-btn:hover:not(:disabled) {
  background: #0056b3;
}

.switch-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.reset-btn {
  background: #6c757d;
  color: white;
}

.reset-btn:hover {
  background: #545b62;
}

.switch-simulation {
  margin-top: 30px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.simulation-steps {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.simulation-step {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  transition: all 0.3s;
}

.simulation-step.active {
  background: #fff3cd;
  border-color: #ffc107;
}

.simulation-step.completed {
  background: #d4edda;
  border-color: #28a745;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.simulation-step.active .step-number {
  background: #ffc107;
  color: #212529;
}

.simulation-step.completed .step-number {
  background: #28a745;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
}

.step-description {
  color: #6c757d;
  font-size: 14px;
}

.url-examples {
  margin-top: 20px;
}

.url-group {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  margin-bottom: 20px;
}

.url-group h4 {
  margin: 0 0 15px 0;
  color: #495057;
}

.url-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.url-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.url-mode {
  font-weight: 600;
  color: #495057;
  min-width: 100px;
}

.url-value {
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: monospace;
  color: #007bff;
  flex: 1;
}

.nav-test {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.test-links {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.test-link {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.test-link:hover {
  background: #0056b3;
}

.url-display {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 6px;
}

.current-url {
  margin-bottom: 15px;
}

.url-label {
  font-weight: 600;
  color: #495057;
  margin-right: 10px;
}

.current-url code {
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  color: #007bff;
  font-family: monospace;
}

.url-parts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.url-part {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.part-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 600;
}

.part-value {
  color: #495057;
  font-family: monospace;
  background: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.practice-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.practice-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  transition: all 0.3s;
}

.practice-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.practice-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.practice-icon {
  font-size: 24px;
}

.practice-title {
  font-size: 18px;
  font-weight: 600;
  color: #495057;
}

.practice-content p {
  margin: 0 0 10px 0;
  color: #007bff;
  font-weight: 600;
}

.practice-content ul {
  margin: 0;
  padding-left: 20px;
  color: #6c757d;
}

.practice-content li {
  margin: 5px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .history-demo {
    padding: 15px;
  }

  .table-header, .table-row {
    grid-template-columns: 1fr;
  }

  .header-cell, .cell {
    text-align: left;
    border-right: none;
    border-bottom: 1px solid #dee2e6;
  }

  .cell.feature {
    background: #495057;
    color: white;
    font-weight: 600;
  }

  .mode-options {
    grid-template-columns: 1fr;
  }

  .switch-actions {
    flex-direction: column;
  }

  .test-links {
    flex-direction: column;
  }

  .url-parts {
    grid-template-columns: 1fr;
  }

  .practice-cards {
    grid-template-columns: 1fr;
  }

  .url-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .url-mode {
    min-width: auto;
  }
}
</style>
