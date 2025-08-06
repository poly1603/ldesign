<script setup lang="ts">
import type { Engine } from '@ldesign/engine'
import { computed, inject, ref } from 'vue'

const engine = inject<Engine>('engine')!

// 响应式数据
const testInput = ref('')
const testUrl = ref('https://example.com')
const testHtml = ref('<' + 'script>alert("XSS")<' + '/script><p>Hello World</p>')
const testCss = ref('body { background: red; } .malicious { display: none; }')
const sanitizedResults = ref<any>({})
const validationResults = ref<any>({})
const securityLogs = ref<any[]>([])

// 计算属性
const hasResults = computed(() => Object.keys(sanitizedResults.value).length > 0)
const hasValidationResults = computed(() => Object.keys(validationResults.value).length > 0)
const hasSecurityLogs = computed(() => securityLogs.value.length > 0)

// 方法
function sanitizeInput() {
  if (!testInput.value.trim()) {
    engine.notifications.show({
      type: 'warning',
      title: '警告',
      message: '请输入要清理的内容',
      duration: 2000,
    })
    return
  }

  try {
    const result = engine.security.sanitizeInput(testInput.value)
    sanitizedResults.value = {
      original: testInput.value,
      sanitized: result,
      timestamp: new Date().toLocaleString(),
    }

    engine.logger.info('输入清理完成', { original: testInput.value, sanitized: result })

    engine.notifications.show({
      type: 'success',
      title: '成功',
      message: '输入内容已清理',
      duration: 2000,
    })
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '错误',
      message: `清理失败: ${error}`,
      duration: 3000,
    })
  }
}

function validateUrl() {
  if (!testUrl.value.trim()) {
    engine.notifications.show({
      type: 'warning',
      title: '警告',
      message: '请输入要验证的URL',
      duration: 2000,
    })
    return
  }

  try {
    const isValid = engine.security.validateUrl(testUrl.value)
    validationResults.value = {
      ...validationResults.value,
      url: {
        input: testUrl.value,
        isValid,
        timestamp: new Date().toLocaleString(),
      },
    }

    engine.logger.info('URL验证完成', { url: testUrl.value, isValid })

    engine.notifications.show({
      type: isValid ? 'success' : 'warning',
      title: isValid ? 'URL有效' : 'URL无效',
      message: `URL ${isValid ? '通过' : '未通过'}安全验证`,
      duration: 2000,
    })
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '错误',
      message: `验证失败: ${error}`,
      duration: 3000,
    })
  }
}

function sanitizeHtml() {
  if (!testHtml.value.trim()) {
    engine.notifications.show({
      type: 'warning',
      title: '警告',
      message: '请输入要清理的HTML',
      duration: 2000,
    })
    return
  }

  try {
    const result = engine.security.sanitizeHtml(testHtml.value)
    sanitizedResults.value = {
      ...sanitizedResults.value,
      html: {
        original: testHtml.value,
        sanitized: result,
        timestamp: new Date().toLocaleString(),
      },
    }

    engine.logger.info('HTML清理完成', { original: testHtml.value, sanitized: result })

    engine.notifications.show({
      type: 'success',
      title: '成功',
      message: 'HTML内容已清理',
      duration: 2000,
    })
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '错误',
      message: `清理失败: ${error}`,
      duration: 3000,
    })
  }
}

function sanitizeCss() {
  if (!testCss.value.trim()) {
    engine.notifications.show({
      type: 'warning',
      title: '警告',
      message: '请输入要清理的CSS',
      duration: 2000,
    })
    return
  }

  try {
    const result = engine.security.sanitizeCss(testCss.value)
    sanitizedResults.value = {
      ...sanitizedResults.value,
      css: {
        original: testCss.value,
        sanitized: result,
        timestamp: new Date().toLocaleString(),
      },
    }

    engine.logger.info('CSS清理完成', { original: testCss.value, sanitized: result })

    engine.notifications.show({
      type: 'success',
      title: '成功',
      message: 'CSS内容已清理',
      duration: 2000,
    })
  }
  catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '错误',
      message: `清理失败: ${error}`,
      duration: 3000,
    })
  }
}

function runSecurityScan() {
  const testData = {
    input: testInput.value,
    url: testUrl.value,
    html: testHtml.value,
    css: testCss.value,
  }

  engine.logger.info('开始安全扫描', testData)

  // 模拟安全扫描
  const scanResults = []

  if (testData.input.includes('<script>')) {
    scanResults.push({ type: 'XSS', severity: 'high', field: 'input' })
  }

  if (testData.url.includes('javascript:')) {
    scanResults.push({ type: 'JavaScript URL', severity: 'high', field: 'url' })
  }

  if (testData.html.includes('<script>')) {
    scanResults.push({ type: 'Script Injection', severity: 'high', field: 'html' })
  }

  if (testData.css.includes('expression(')) {
    scanResults.push({ type: 'CSS Expression', severity: 'medium', field: 'css' })
  }

  securityLogs.value.unshift({
    timestamp: new Date().toLocaleString(),
    results: scanResults,
    summary: `发现 ${scanResults.length} 个安全问题`,
  })

  engine.notifications.show({
    type: scanResults.length > 0 ? 'warning' : 'success',
    title: '安全扫描完成',
    message: `发现 ${scanResults.length} 个安全问题`,
    duration: 3000,
  })
}

function clearResults() {
  sanitizedResults.value = {}
  validationResults.value = {}
  securityLogs.value = []

  engine.notifications.show({
    type: 'info',
    title: '已清空',
    message: '所有结果已清空',
    duration: 2000,
  })
}

function exportSecurityReport() {
  const report = {
    timestamp: new Date().toISOString(),
    sanitizedResults: sanitizedResults.value,
    validationResults: validationResults.value,
    securityLogs: securityLogs.value,
  }

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `security-report-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)

  engine.notifications.show({
    type: 'success',
    title: '导出成功',
    message: '安全报告已导出',
    duration: 2000,
  })
}
</script>

<template>
  <div class="security-demo">
    <header class="demo-header">
      <h1>🔒 安全管理器演示</h1>
      <p>展示引擎的安全功能，包括输入清理、URL验证、HTML/CSS清理等</p>
    </header>

    <div class="demo-content">
      <!-- 输入清理测试 -->
      <section class="demo-section">
        <h2>输入清理测试</h2>
        <div class="input-group">
          <label>测试输入（可能包含恶意内容）:</label>
          <textarea
            v-model="testInput"
            placeholder="输入可能包含恶意内容的文本，如: <script>alert('XSS')</script>Hello"
            rows="3"
          />
          <button class="btn btn-primary" @click="sanitizeInput">
            清理输入
          </button>
        </div>
      </section>

      <!-- URL验证测试 -->
      <section class="demo-section">
        <h2>URL验证测试</h2>
        <div class="input-group">
          <label>测试URL:</label>
          <input
            v-model="testUrl"
            type="text"
            placeholder="输入要验证的URL，如: javascript:alert('XSS')"
          >
          <button class="btn btn-primary" @click="validateUrl">
            验证URL
          </button>
        </div>
      </section>

      <!-- HTML清理测试 -->
      <section class="demo-section">
        <h2>HTML清理测试</h2>
        <div class="input-group">
          <label>测试HTML:</label>
          <textarea
            v-model="testHtml"
            placeholder="输入包含潜在危险的HTML代码"
            rows="4"
          />
          <button class="btn btn-primary" @click="sanitizeHtml">
            清理HTML
          </button>
        </div>
      </section>

      <!-- CSS清理测试 -->
      <section class="demo-section">
        <h2>CSS清理测试</h2>
        <div class="input-group">
          <label>测试CSS:</label>
          <textarea
            v-model="testCss"
            placeholder="输入可能包含危险的CSS代码"
            rows="3"
          />
          <button class="btn btn-primary" @click="sanitizeCss">
            清理CSS
          </button>
        </div>
      </section>

      <!-- 操作按钮 -->
      <section class="demo-actions">
        <button class="btn btn-warning" @click="runSecurityScan">
          🔍 运行安全扫描
        </button>
        <button class="btn btn-success" @click="exportSecurityReport">
          📤 导出安全报告
        </button>
        <button class="btn btn-secondary" @click="clearResults">
          🗑️ 清空结果
        </button>
      </section>

      <!-- 清理结果显示 -->
      <section v-if="hasResults" class="results-section">
        <h2>清理结果</h2>
        <div class="results-grid">
          <div v-if="sanitizedResults.original" class="result-card">
            <h3>输入清理结果</h3>
            <div class="result-item">
              <strong>原始内容:</strong>
              <code>{{ sanitizedResults.original }}</code>
            </div>
            <div class="result-item">
              <strong>清理后:</strong>
              <code>{{ sanitizedResults.sanitized }}</code>
            </div>
            <div class="result-meta">
              清理时间: {{ sanitizedResults.timestamp }}
            </div>
          </div>

          <div v-if="sanitizedResults.html" class="result-card">
            <h3>HTML清理结果</h3>
            <div class="result-item">
              <strong>原始HTML:</strong>
              <code>{{ sanitizedResults.html.original }}</code>
            </div>
            <div class="result-item">
              <strong>清理后:</strong>
              <code>{{ sanitizedResults.html.sanitized }}</code>
            </div>
            <div class="result-meta">
              清理时间: {{ sanitizedResults.html.timestamp }}
            </div>
          </div>

          <div v-if="sanitizedResults.css" class="result-card">
            <h3>CSS清理结果</h3>
            <div class="result-item">
              <strong>原始CSS:</strong>
              <code>{{ sanitizedResults.css.original }}</code>
            </div>
            <div class="result-item">
              <strong>清理后:</strong>
              <code>{{ sanitizedResults.css.sanitized }}</code>
            </div>
            <div class="result-meta">
              清理时间: {{ sanitizedResults.css.timestamp }}
            </div>
          </div>
        </div>
      </section>

      <!-- 验证结果显示 -->
      <section v-if="hasValidationResults" class="results-section">
        <h2>验证结果</h2>
        <div class="validation-results">
          <div v-if="validationResults.url" class="validation-card">
            <h3>URL验证结果</h3>
            <div class="validation-item">
              <strong>URL:</strong> {{ validationResults.url.input }}
            </div>
            <div class="validation-item">
              <strong>验证结果:</strong>
              <span :class="validationResults.url.isValid ? 'status-valid' : 'status-invalid'">
                {{ validationResults.url.isValid ? '✅ 有效' : '❌ 无效' }}
              </span>
            </div>
            <div class="result-meta">
              验证时间: {{ validationResults.url.timestamp }}
            </div>
          </div>
        </div>
      </section>

      <!-- 安全扫描日志 -->
      <section v-if="hasSecurityLogs" class="logs-section">
        <h2>安全扫描日志</h2>
        <div class="logs-container">
          <div v-for="(log, index) in securityLogs" :key="index" class="log-entry">
            <div class="log-header">
              <span class="log-time">{{ log.timestamp }}</span>
              <span class="log-summary">{{ log.summary }}</span>
            </div>
            <div v-if="log.results.length > 0" class="log-results">
              <div
                v-for="(result, resultIndex) in log.results"
                :key="resultIndex"
                class="security-issue"
                :class="`severity-${result.severity}`"
              >
                <span class="issue-type">{{ result.type }}</span>
                <span class="issue-field">{{ result.field }}</span>
                <span class="issue-severity">{{ result.severity }}</span>
              </div>
            </div>
            <div v-else class="no-issues">
              ✅ 未发现安全问题
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.security-demo {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-header {
  text-align: center;
  margin-bottom: 3rem;
}

.demo-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.demo-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.demo-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.demo-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.input-group label {
  font-weight: 500;
  color: #34495e;
}

.input-group input,
.input-group textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
  border-color: #3498db;
}

.demo-actions {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
  transform: translateY(-1px);
}

.results-section,
.logs-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.results-section h2,
.logs-section h2 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.5rem;
}

.results-grid {
  display: grid;
  gap: 1.5rem;
}

.result-card,
.validation-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #3498db;
}

.result-card h3,
.validation-card h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.2rem;
}

.result-item,
.validation-item {
  margin-bottom: 1rem;
}

.result-item strong,
.validation-item strong {
  display: block;
  margin-bottom: 0.25rem;
  color: #34495e;
}

.result-item code {
  background: #e9ecef;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  display: block;
  word-break: break-all;
}

.result-meta {
  font-size: 0.75rem;
  color: #7f8c8d;
  margin-top: 1rem;
}

.status-valid {
  color: #27ae60;
  font-weight: 500;
}

.status-invalid {
  color: #e74c3c;
  font-weight: 500;
}

.logs-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-entry {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #95a5a6;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.log-time {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.log-summary {
  font-weight: 500;
  color: #2c3e50;
}

.log-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.security-issue {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.security-issue.severity-high {
  background: #ffeaea;
  border-left: 4px solid #e74c3c;
}

.security-issue.severity-medium {
  background: #fff3cd;
  border-left: 4px solid #f39c12;
}

.security-issue.severity-low {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
}

.issue-type {
  font-weight: 500;
}

.issue-field {
  color: #7f8c8d;
}

.issue-severity {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 500;
}

.severity-high .issue-severity {
  color: #e74c3c;
}

.severity-medium .issue-severity {
  color: #f39c12;
}

.severity-low .issue-severity {
  color: #17a2b8;
}

.no-issues {
  color: #27ae60;
  font-weight: 500;
  text-align: center;
  padding: 1rem;
}

@media (max-width: 768px) {
  .security-demo {
    padding: 1rem;
  }

  .demo-header h1 {
    font-size: 2rem;
  }

  .demo-actions {
    flex-direction: column;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .security-issue {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
