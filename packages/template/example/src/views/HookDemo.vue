<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>⚡ Hook 方式演示</h1>
      <p>使用 useTemplate Composition API 管理和渲染内置 login 模板</p>
    </div>

    <div class="demo-content">
      <!-- 基础 Hook 使用 -->
      <section class="demo-section">
        <h2>基础 Hook 用法</h2>
        <p>使用 useTemplate hook 获取模板管理功能</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <div class="demo-controls">
              <button
                @click="renderLoginTemplate"
                :disabled="isLoading"
                class="btn btn-primary"
              >
                {{ isLoading ? '渲染中...' : '渲染登录模板' }}
              </button>

              <button
                @click="clearTemplate"
                :disabled="!currentTemplate"
                class="btn btn-secondary"
              >
                清除模板
              </button>
            </div>
            
            <div class="template-container" v-if="renderedTemplate">
              <component 
                :is="renderedTemplate.component" 
                v-bind="templateProps"
                @login="handleLogin"
              />
            </div>
            
            <div v-else-if="isLoading" class="loading-state">
              <div class="loading-spinner animate-spin"></div>
              <p>正在加载模板...</p>
            </div>

            <div v-else-if="error" class="error-state">
              <h4>❌ 加载失败</h4>
              <p>{{ error?.message || '未知错误' }}</p>
              <button @click="renderLoginTemplate" class="btn btn-danger">重试</button>
            </div>

            <div v-else class="empty-state">
              <h4>🧪 直接渲染测试</h4>
              <p>由于模板管理器问题，这里直接渲染模板组件进行测试</p>
              <div class="direct-render-test">
                <DefaultLoginTemplate
                  title="Hook 方式测试"
                  :show-logo="false"
                  :show-remember-me="true"
                />
              </div>
            </div>
          </div>
          
          <div class="demo-code">
            <h4>代码示例</h4>
            <pre><code>const {
  currentTemplate,
  isLoading,
  error,
  render
} = useTemplate()

// 渲染模板
const result = await render('login', 'desktop')
renderedTemplate.value = result</code></pre>
          </div>
        </div>
      </section>

      <!-- 模板切换演示 -->
      <section class="demo-section">
        <h2>动态模板切换</h2>
        <p>使用 switchTemplate 方法动态切换不同的登录模板</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <div class="demo-controls">
              <div class="control-group">
                <label>选择模板：</label>
                <div class="radio-group">
                  <label v-for="template in availableTemplates" :key="template.name">
                    <input
                      type="radio"
                      :value="template.name"
                      v-model="selectedTemplateName"
                      @change="switchToTemplate"
                    />
                    <span>{{ template.displayName }}</span>
                  </label>
                </div>
              </div>

              <div class="control-group">
                <label>设备类型：</label>
                <div class="radio-group">
                  <label v-for="device in deviceTypes" :key="device.value">
                    <input
                      type="radio"
                      :value="device.value"
                      v-model="selectedDeviceType"
                      @change="switchToTemplate"
                    />
                    <span>{{ device.label }}</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div class="switch-result" v-if="switchedTemplate">
              <component 
                :is="switchedTemplate.component" 
                v-bind="switchTemplateProps"
                @login="handleSwitchLogin"
              />
            </div>
            
            <div v-else-if="switchLoading" class="loading-state">
              <div class="loading-spinner animate-spin"></div>
              <p>正在切换模板...</p>
            </div>
          </div>
          
          <div class="demo-code">
            <h4>代码示例</h4>
            <pre><code>const {
  switchTemplate,
  getTemplates
} = useTemplate()

// 获取可用模板
const templates = getTemplates('login')

// 切换模板
const result = await switchTemplate(
  'login', 
  templateName, 
  deviceType
)</code></pre>
          </div>
        </div>
      </section>

      <!-- 响应式状态演示 -->
      <section class="demo-section">
        <h2>响应式状态管理</h2>
        <p>展示 useTemplate 提供的响应式状态和计算属性</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <div class="reactive-demo">
              <div class="state-display">
                <h4>当前状态</h4>
                <div class="status-grid">
                  <div class="status-item">
                    <strong>设备类型：</strong>
                    <span class="badge badge-primary">
                      {{ currentDevice }}
                    </span>
                  </div>

                  <div class="status-item">
                    <strong>加载状态：</strong>
                    <span class="badge" :class="isLoading ? 'badge-warning' : 'badge-success'">
                      {{ isLoading ? '加载中' : '空闲' }}
                    </span>
                  </div>

                  <div class="status-item">
                    <strong>当前模板：</strong>
                    <span class="badge badge-info" v-if="currentTemplate">
                      {{ currentTemplate.displayName }}
                    </span>
                    <span v-else class="badge badge-secondary">无</span>
                  </div>

                  <div class="status-item">
                    <strong>可用模板数：</strong>
                    <span class="badge badge-success">{{ availableTemplates.length }}</span>
                  </div>
                </div>
              </div>
              
              <div class="demo-controls">
                <button @click="refreshTemplates" class="btn btn-outline">
                  刷新模板列表
                </button>
                <button @click="detectDevice" class="btn btn-outline">
                  重新检测设备
                </button>
                <button @click="toggleAutoDetect" class="btn btn-outline">
                  {{ autoDetectEnabled ? '禁用' : '启用' }}自动检测
                </button>
              </div>
            </div>
          </div>
          
          <div class="demo-code">
            <h4>代码示例</h4>
            <pre><code>const {
  currentDevice,
  currentTemplate,
  isLoading,
  availableTemplates,
  scanTemplates
} = useTemplate()

// 响应式计算属性
const templateCount = computed(() => 
  availableTemplates.value.length
)

// 监听状态变化
watch(currentDevice, (newDevice) => {
  console.log('设备切换:', newDevice)
})</code></pre>
          </div>
        </div>
      </section>

      <!-- 错误处理演示 -->
      <section class="demo-section">
        <h2>错误处理</h2>
        <p>演示如何处理模板加载和渲染过程中的错误</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <div class="error-demo">
              <div class="demo-controls">
                <button @click="triggerLoadError" class="btn btn-danger">
                  触发加载错误
                </button>
                <button @click="triggerRenderError" class="btn btn-danger">
                  触发渲染错误
                </button>
                <button @click="clearError" class="btn btn-secondary">
                  清除错误
                </button>
              </div>
              
              <div v-if="error" class="error-display">
                <h4>🚨 错误信息</h4>
                <div class="error-details">
                  <p><strong>类型：</strong> {{ error?.name || 'Error' }}</p>
                  <p><strong>消息：</strong> {{ error?.message || '未知错误' }}</p>
                  <p><strong>时间：</strong> {{ errorTime }}</p>
                </div>
              </div>
              
              <div v-else class="no-error">
                <p>✅ 当前无错误</p>
              </div>
            </div>
          </div>
          
          <div class="demo-code">
            <h4>代码示例</h4>
            <pre><code>const { error, render } = useTemplate()

try {
  await render('login', 'desktop', 'nonexistent')
} catch (err) {
  console.error('模板加载失败:', err)
  // 错误会自动更新到 error ref
}

// 监听错误变化
watch(error, (newError) => {
  if (newError) {
    showErrorNotification(newError?.message || '未知错误')
  }
})</code></pre>
          </div>
        </div>
      </section>

      <!-- 性能监控 -->
      <section class="demo-section">
        <h2>性能监控</h2>
        <div class="performance-info">
          <div class="perf-item">
            <strong>渲染次数：</strong>
            <span class="perf-value">{{ renderCount }}</span>
          </div>
          <div class="perf-item">
            <strong>平均加载时间：</strong>
            <span class="perf-value">{{ averageLoadTime }}ms</span>
          </div>
          <div class="perf-item">
            <strong>缓存命中率：</strong>
            <span class="perf-value">{{ cacheHitRate }}%</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useTemplate } from '@ldesign/template'
import type { TemplateInfo, DeviceType, LoadResult } from '@ldesign/template'
// 不再需要直接导入模板组件，使用内置模板系统

// 使用模板管理 Hook
const {
  currentDevice,
  currentTemplate,
  isLoading,
  error,
  availableTemplates,
  render,
  switchTemplate,
  getTemplates,
  scanTemplates,
  hasTemplate
} = useTemplate()

// 响应式数据
const renderedTemplate = ref<LoadResult | null>(null)
const switchedTemplate = ref<LoadResult | null>(null)
const switchLoading = ref(false)
const selectedTemplateName = ref('default')
const selectedDeviceType = ref<DeviceType>('desktop')
const autoDetectEnabled = ref(true)
const errorTime = ref<string>('')
const renderCount = ref(0)
const loadTimes = ref<number[]>([])

// 模板属性
const templateProps = ref({
  title: 'Hook 方式登录',
  subtitle: '使用 useTemplate hook 渲染',
  showRememberMe: true,
  showForgotPassword: true
})

const switchTemplateProps = ref({
  title: '动态切换模板',
  subtitle: '实时切换不同的登录模板',
  showRememberMe: false,
  showForgotPassword: true
})

// 设备类型选项
const deviceTypes = [
  { value: 'desktop', label: '🖥️ 桌面端' },
  { value: 'tablet', label: '📱 平板端' },
  { value: 'mobile', label: '📱 移动端' }
]

// 计算属性
const averageLoadTime = computed(() => {
  if (loadTimes.value.length === 0) return 0
  const sum = loadTimes.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / loadTimes.value.length)
})

const cacheHitRate = computed(() => {
  // 模拟缓存命中率计算
  return Math.round(Math.random() * 100)
})

// 方法
const renderLoginTemplate = async () => {
  try {
    if (!currentDevice.value) {
      throw new Error('设备类型未检测到')
    }

    const startTime = Date.now()
    const result = await render('login', currentDevice.value, 'default', templateProps.value)

    if (!result) {
      throw new Error('模板渲染结果为空')
    }

    const loadTime = Date.now() - startTime

    renderedTemplate.value = result
    renderCount.value++
    loadTimes.value.push(loadTime)

    console.log('模板渲染成功:', result)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '未知错误'
    console.error('模板渲染失败:', errorMsg)
    renderedTemplate.value = null
  }
}

const clearTemplate = () => {
  renderedTemplate.value = null
}

const switchToTemplate = async () => {
  try {
    if (!selectedTemplateName.value || !selectedDeviceType.value) {
      throw new Error('模板名称或设备类型未选择')
    }

    switchLoading.value = true
    const result = await switchTemplate(
      'login',
      selectedTemplateName.value,
      selectedDeviceType.value
    )

    if (!result) {
      throw new Error('模板切换结果为空')
    }

    switchedTemplate.value = result
    renderCount.value++

    console.log('模板切换成功:', result)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '未知错误'
    console.error('模板切换失败:', errorMsg)
    switchedTemplate.value = null
  } finally {
    switchLoading.value = false
  }
}

const refreshTemplates = async () => {
  try {
    await scanTemplates()
    console.log('模板列表已刷新，当前可用模板数:', availableTemplates.value.length)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '未知错误'
    console.error('刷新模板列表失败:', errorMsg)
  }
}

const detectDevice = () => {
  try {
    // 触发设备重新检测
    console.log('重新检测设备类型，当前设备:', currentDevice.value)
    // 这里可以添加实际的设备检测逻辑
  } catch (err) {
    console.error('设备检测失败:', err)
  }
}

const toggleAutoDetect = () => {
  try {
    autoDetectEnabled.value = !autoDetectEnabled.value
    console.log('自动检测:', autoDetectEnabled.value ? '启用' : '禁用')
    // 这里可以添加实际的自动检测开关逻辑
  } catch (err) {
    console.error('切换自动检测状态失败:', err)
  }
}

const triggerLoadError = async () => {
  try {
    await render('login', 'desktop' as DeviceType, 'nonexistent-template')
  } catch (err) {
    errorTime.value = new Date().toLocaleTimeString()
    const errorMsg = err instanceof Error ? err.message : '未知错误'
    console.log('故意触发的加载错误:', errorMsg)
  }
}

const triggerRenderError = async () => {
  try {
    // 传递无效的属性来触发渲染错误
    await render('login', 'desktop' as DeviceType, 'default', { invalidProp: null })
  } catch (err) {
    errorTime.value = new Date().toLocaleTimeString()
    const errorMsg = err instanceof Error ? err.message : '未知错误'
    console.log('故意触发的渲染错误:', errorMsg)
  }
}

const clearError = () => {
  try {
    // 清除错误状态
    errorTime.value = ''
    console.log('错误状态已清除')
  } catch (err) {
    console.error('清除错误状态失败:', err)
  }
}

const handleLogin = (credentials: any) => {
  try {
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('无效的登录凭据')
    }

    const username = credentials.username || '未知用户'
    console.log('基础模板登录:', credentials)
    alert(`登录成功！用户名: ${username}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '登录处理失败'
    console.error('处理登录事件失败:', errorMsg)
    alert(`登录失败: ${errorMsg}`)
  }
}

const handleSwitchLogin = (credentials: any) => {
  try {
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('无效的登录凭据')
    }

    const username = credentials.username || '未知用户'
    console.log('切换模板登录:', credentials)
    alert(`切换模板登录成功！用户名: ${username}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '登录处理失败'
    console.error('处理切换模板登录事件失败:', errorMsg)
    alert(`登录失败: ${errorMsg}`)
  }
}

// 监听器
const stopErrorWatch = watch(error, (newError, oldError) => {
  try {
    if (newError && newError !== oldError) {
      errorTime.value = new Date().toLocaleTimeString()
      console.error('检测到错误:', newError?.message || newError)
    }
  } catch (err) {
    console.error('处理错误监听器时出错:', err)
  }
})

const stopDeviceWatch = watch(currentDevice, (newDevice, oldDevice) => {
  try {
    if (newDevice !== oldDevice) {
      console.log('设备类型变化:', `${oldDevice} -> ${newDevice}`)
    }
  } catch (err) {
    console.error('处理设备变化监听器时出错:', err)
  }
})

const stopTemplateWatch = watch(currentTemplate, (newTemplate, oldTemplate) => {
  try {
    if (newTemplate !== oldTemplate) {
      console.log('当前模板变化:', {
        from: oldTemplate?.displayName || '无',
        to: newTemplate?.displayName || '无'
      })
    }
  } catch (err) {
    console.error('处理模板变化监听器时出错:', err)
  }
})

// 生命周期
onMounted(async () => {
  try {
    console.log('Hook 演示页面已加载')

    // 初始化时扫描可用模板
    await scanTemplates()
    console.log('可用模板数量:', availableTemplates.value.length)

    // 初始化性能监控
    renderCount.value = 0
    loadTimes.value = []

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : '未知错误'
    console.error('初始化失败:', errorMsg)
    errorTime.value = new Date().toLocaleTimeString()
  }
})

// 组件卸载时清理资源
import { onUnmounted } from 'vue'

onUnmounted(() => {
  try {
    // 停止所有监听器
    stopErrorWatch?.()
    stopDeviceWatch?.()
    stopTemplateWatch?.()

    // 清理状态
    renderedTemplate.value = null
    switchedTemplate.value = null
    loadTimes.value = []

    console.log('Hook 演示页面资源已清理')
  } catch (err) {
    console.error('清理资源时出错:', err)
  }
})
</script>

<!-- 使用共享样式系统，无需额外样式定义 -->
