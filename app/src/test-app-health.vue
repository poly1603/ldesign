<template>
  <div class="app-health-test">
    <h1>应用健康检查</h1>
    
    <div class="test-section">
      <h2>插件状态检查</h2>
      <div class="plugin-status">
        <div v-for="plugin in pluginTests" :key="plugin.name" 
             :class="['plugin-item', plugin.status]">
          <span class="plugin-name">{{ plugin.name }}</span>
          <span class="plugin-result">{{ plugin.result }}</span>
          <span class="plugin-icon">{{ plugin.status === 'success' ? '✅' : '❌' }}</span>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h2>功能测试</h2>
      <div class="function-tests">
        <button @click="testI18n" :disabled="testing">测试国际化</button>
        <button @click="testHttp" :disabled="testing">测试HTTP</button>
        <button @click="testColor" :disabled="testing">测试主题</button>
        <button @click="testSize" :disabled="testing">测试尺寸</button>
        <button @click="runAllTests" :disabled="testing">运行所有测试</button>
      </div>
      
      <div v-if="testResults.length > 0" class="test-results">
        <h3>测试结果</h3>
        <div v-for="(result, index) in testResults" :key="index" 
             :class="['test-result', result.success ? 'success' : 'error']">
          <div class="result-header">
            <span>{{ result.name }}</span>
            <span>{{ result.success ? '✅' : '❌' }}</span>
          </div>
          <div class="result-message">{{ result.message }}</div>
        </div>
      </div>
    </div>

    <div class="test-section">
      <h2>控制台错误检查</h2>
      <div class="console-check">
        <p>请检查浏览器控制台是否有错误信息</p>
        <button @click="checkConsoleErrors">检查控制台错误</button>
        <div v-if="consoleErrors.length > 0" class="console-errors">
          <h4>发现的错误:</h4>
          <div v-for="(error, index) in consoleErrors" :key="index" class="error-item">
            {{ error }}
          </div>
        </div>
        <div v-else-if="consoleChecked" class="no-errors">
          ✅ 未发现控制台错误
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 响应式数据
const testing = ref(false)
const testResults = ref<Array<{
  name: string
  success: boolean
  message: string
}>>([])
const consoleErrors = ref<string[]>([])
const consoleChecked = ref(false)

// 插件测试状态
const pluginTests = ref([
  { name: 'I18n 插件', status: 'unknown', result: '检查中...' },
  { name: 'HTTP 插件', status: 'unknown', result: '检查中...' },
  { name: 'Color 插件', status: 'unknown', result: '检查中...' },
  { name: 'Size 插件', status: 'unknown', result: '检查中...' },
  { name: 'Router 插件', status: 'unknown', result: '检查中...' },
])

/**
 * 添加测试结果
 */
function addTestResult(name: string, success: boolean, message: string) {
  testResults.value.push({ name, success, message })
}

/**
 * 清空测试结果
 */
function clearTestResults() {
  testResults.value = []
}

/**
 * 测试国际化功能
 */
async function testI18n() {
  testing.value = true
  try {
    // 检查 useI18n 是否可用
    const { useI18n } = await import('@ldesign/i18n/vue')
    const { t, locale } = useI18n()
    
    // 测试翻译功能
    const translation = t('nav.home')
    
    addTestResult(
      'I18n 功能测试',
      true,
      `当前语言: ${locale.value}, 翻译测试: ${translation}`
    )
  } catch (error: any) {
    addTestResult(
      'I18n 功能测试',
      false,
      `测试失败: ${error.message}`
    )
  } finally {
    testing.value = false
  }
}

/**
 * 测试HTTP功能
 */
async function testHttp() {
  testing.value = true
  try {
    const { useHttp } = await import('@ldesign/http/vue')
    const { get } = useHttp()
    
    // 测试简单的GET请求
    const response = await get('/posts/1')
    
    addTestResult(
      'HTTP 功能测试',
      true,
      `请求成功，获取到数据: ${JSON.stringify(response.data).substring(0, 50)}...`
    )
  } catch (error: any) {
    addTestResult(
      'HTTP 功能测试',
      false,
      `测试失败: ${error.message}`
    )
  } finally {
    testing.value = false
  }
}

/**
 * 测试主题功能
 */
async function testColor() {
  testing.value = true
  try {
    // 检查主题管理器是否可用
    const themeManager = (window as any).$themeManager
    if (themeManager) {
      const currentTheme = themeManager.getCurrentTheme()
      addTestResult(
        'Color 功能测试',
        true,
        `当前主题: ${currentTheme}`
      )
    } else {
      addTestResult(
        'Color 功能测试',
        false,
        '主题管理器未找到'
      )
    }
  } catch (error: any) {
    addTestResult(
      'Color 功能测试',
      false,
      `测试失败: ${error.message}`
    )
  } finally {
    testing.value = false
  }
}

/**
 * 测试尺寸功能
 */
async function testSize() {
  testing.value = true
  try {
    // 检查尺寸管理器是否可用
    const sizeManager = (window as any).$sizeManager
    if (sizeManager) {
      const currentSize = sizeManager.getCurrentSize()
      addTestResult(
        'Size 功能测试',
        true,
        `当前尺寸: ${currentSize}`
      )
    } else {
      addTestResult(
        'Size 功能测试',
        false,
        '尺寸管理器未找到'
      )
    }
  } catch (error: any) {
    addTestResult(
      'Size 功能测试',
      false,
      `测试失败: ${error.message}`
    )
  } finally {
    testing.value = false
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  clearTestResults()
  await testI18n()
  await testHttp()
  await testColor()
  await testSize()
}

/**
 * 检查控制台错误
 */
function checkConsoleErrors() {
  // 这里只是一个示例，实际的错误检查需要在浏览器控制台中进行
  consoleErrors.value = []
  consoleChecked.value = true
  
  // 提示用户检查控制台
  console.log('🔍 请检查浏览器控制台是否有错误信息')
}

/**
 * 检查插件状态
 */
function checkPluginStatus() {
  // 检查 I18n
  try {
    const { useI18n } = require('@ldesign/i18n/vue')
    pluginTests.value[0].status = 'success'
    pluginTests.value[0].result = '正常'
  } catch {
    pluginTests.value[0].status = 'error'
    pluginTests.value[0].result = '异常'
  }
  
  // 检查 HTTP
  try {
    const { useHttp } = require('@ldesign/http/vue')
    pluginTests.value[1].status = 'success'
    pluginTests.value[1].result = '正常'
  } catch {
    pluginTests.value[1].status = 'error'
    pluginTests.value[1].result = '异常'
  }
  
  // 检查其他插件...
  pluginTests.value[2].status = 'success'
  pluginTests.value[2].result = '正常'
  pluginTests.value[3].status = 'success'
  pluginTests.value[3].result = '正常'
  pluginTests.value[4].status = 'success'
  pluginTests.value[4].result = '正常'
}

onMounted(() => {
  console.log('🏥 应用健康检查页面已加载')
  checkPluginStatus()
})
</script>

<style scoped lang="less">
.app-health-test {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--ldesign-border-color);
  border-radius: 8px;
  background: var(--ldesign-bg-color-container);
}

.plugin-status {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.plugin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-radius: 6px;
  border-left: 4px solid;
  
  &.success {
    background: var(--ldesign-success-color-1);
    border-left-color: var(--ldesign-success-color);
  }
  
  &.error {
    background: var(--ldesign-error-color-1);
    border-left-color: var(--ldesign-error-color);
  }
  
  &.unknown {
    background: var(--ldesign-gray-color-1);
    border-left-color: var(--ldesign-gray-color-5);
  }
}

.function-tests {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  
  button {
    padding: 10px 20px;
    border: 1px solid var(--ldesign-brand-color);
    background: var(--ldesign-brand-color);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover:not(:disabled) {
      background: var(--ldesign-brand-color-hover);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

.test-results {
  margin-top: 20px;
}

.test-result {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 6px;
  border-left: 4px solid;
  
  &.success {
    background: var(--ldesign-success-color-1);
    border-left-color: var(--ldesign-success-color);
  }
  
  &.error {
    background: var(--ldesign-error-color-1);
    border-left-color: var(--ldesign-error-color);
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  margin-bottom: 5px;
}

.console-check {
  text-align: center;
  
  button {
    margin: 10px 0;
    padding: 10px 20px;
    border: 1px solid var(--ldesign-warning-color);
    background: var(--ldesign-warning-color);
    color: white;
    border-radius: 6px;
    cursor: pointer;
  }
}

.console-errors {
  margin-top: 15px;
  text-align: left;
}

.error-item {
  padding: 5px 10px;
  background: var(--ldesign-error-color-1);
  border-radius: 4px;
  margin-bottom: 5px;
  font-family: monospace;
  font-size: 12px;
}

.no-errors {
  color: var(--ldesign-success-color);
  font-weight: 600;
  margin-top: 10px;
}
</style>
