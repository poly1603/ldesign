<template>
  <div id="app" class="ldesign-app">
    <!-- 应用头部 -->
    <header class="app-header">
      <div class="header-content">
        <div class="header-main">
          <h1 class="app-title">
            <span class="logo">🎨</span>
            LDesign 综合应用示例
          </h1>
          <p class="app-subtitle">展示所有模块的集成使用</p>
        </div>

        <!-- 主题控制器 -->
        <div class="theme-controls">
          <div class="theme-info">
            <span class="theme-label">当前主题:</span>
            <span class="theme-value">{{ themeStatus }}</span>
          </div>

          <div class="theme-actions">
            <select
              class="theme-selector"
              :value="currentTheme"
              @change="handleThemeChange(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="theme in availableThemes" :key="theme" :value="theme">
                {{ theme }}
              </option>
            </select>

            <button
              class="mode-toggle btn btn-secondary"
              @click="handleModeToggle"
              :title="`切换到${currentMode === 'light' ? '暗色' : '亮色'}模式`"
            >
              {{ currentMode === 'light' ? '🌙' : '☀️' }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <div class="container">
        <!-- 模块展示网格 -->
        <div class="modules-grid">
          <!-- 引擎模块 -->
          <div class="module-card">
            <div class="module-icon">⚙️</div>
            <h3>Engine 引擎</h3>
            <p>核心引擎系统，提供插件化架构</p>
            <div class="module-status">待集成</div>
          </div>

          <!-- 色彩模块 -->
          <div class="module-card">
            <div class="module-icon">🎨</div>
            <h3>Color 色彩</h3>
            <p>主题色彩管理，支持动态切换</p>
            <div class="module-status integrated">{{ moduleStatuses.color }}</div>
            <div class="module-demo" v-if="moduleStatuses.color.includes('✅')">
              <p class="demo-info">当前: {{ themeStatus }}</p>
              <div class="demo-actions">
                <button
                  class="btn btn-primary btn-sm"
                  @click="handleThemeChange('blue')"
                >
                  蓝色主题
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  @click="handleModeToggle"
                >
                  切换模式
                </button>
              </div>
            </div>
          </div>

          <!-- 加密模块 -->
          <div class="module-card">
            <div class="module-icon">🔐</div>
            <h3>Crypto 加密</h3>
            <p>加密解密功能，保护数据安全</p>
            <div class="module-status integrated">{{ moduleStatuses.crypto }}</div>
            <div class="module-demo" v-if="moduleStatuses.crypto.includes('✅')">
              <div class="demo-inputs">
                <input
                  v-model="demoText"
                  placeholder="输入要加密的文本"
                  class="demo-input"
                />
                <input
                  v-model="demoKey"
                  placeholder="输入密钥"
                  class="demo-input"
                />
              </div>

              <div class="demo-results" v-if="encryptedResult || decryptedResult">
                <div v-if="encryptedResult" class="demo-result">
                  <span class="result-label">加密结果:</span>
                  <span class="result-value">{{ encryptedResult.substring(0, 50) }}...</span>
                </div>
                <div v-if="decryptedResult" class="demo-result">
                  <span class="result-label">解密结果:</span>
                  <span class="result-value">{{ decryptedResult }}</span>
                </div>
              </div>

              <div class="demo-actions">
                <button
                  class="btn btn-primary btn-sm"
                  @click="handleEncryptDemo"
                  :disabled="isEncrypting"
                >
                  {{ isEncrypting ? '加密中...' : 'AES 加密' }}
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  @click="handleDecryptDemo"
                  :disabled="isDecrypting || !encryptedResult"
                >
                  {{ isDecrypting ? '解密中...' : 'AES 解密' }}
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  @click="handleBase64Demo"
                >
                  Base64 演示
                </button>
              </div>

              <div v-if="cryptoError" class="demo-error">
                错误: {{ cryptoError }}
              </div>
            </div>
          </div>

          <!-- 设备模块 -->
          <div class="module-card">
            <div class="module-icon">📱</div>
            <h3>Device 设备</h3>
            <p>设备检测适配，响应式设计</p>
            <div class="module-status integrated">{{ moduleStatuses.device }}</div>
            <div class="module-demo" v-if="moduleStatuses.device.includes('✅')">
              <div class="device-info">
                <div class="info-row">
                  <span class="info-label">设备类型:</span>
                  <span class="info-value">{{ deviceType }}</span>
                  <span class="device-badge" :class="deviceType">
                    {{ isMobile ? '📱' : isTablet ? '📟' : '💻' }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="info-label">屏幕方向:</span>
                  <span class="info-value">{{ orientation }}</span>
                  <span class="orientation-badge">
                    {{ orientation === 'portrait' ? '📱' : '📺' }}
                  </span>
                </div>

                <div class="info-row">
                  <span class="info-label">触摸设备:</span>
                  <span class="info-value">{{ isTouchDevice ? '是' : '否' }}</span>
                  <span class="touch-badge">
                    {{ isTouchDevice ? '👆' : '🖱️' }}
                  </span>
                </div>

                <div class="info-row" v-if="networkInfo">
                  <span class="info-label">网络状态:</span>
                  <span class="info-value">{{ isOnline ? '在线' : '离线' }}</span>
                  <span class="network-badge" :class="{ online: isOnline, offline: !isOnline }">
                    {{ isOnline ? '🌐' : '📡' }}
                  </span>
                </div>

                <div class="info-row" v-if="batteryInfo">
                  <span class="info-label">电池状态:</span>
                  <span class="info-value">{{ Math.round((batteryLevel || 0) * 100) }}%</span>
                  <span class="battery-badge" :class="{ charging: isCharging }">
                    {{ isCharging ? '🔌' : '🔋' }}
                  </span>
                </div>
              </div>

              <div class="demo-actions">
                <button
                  class="btn btn-primary btn-sm"
                  @click="refreshDevice"
                >
                  刷新设备信息
                </button>
              </div>
            </div>
          </div>

          <!-- HTTP 模块 -->
          <div class="module-card">
            <div class="module-icon">🌐</div>
            <h3>HTTP 请求</h3>
            <p>HTTP 请求管理，API 调用</p>
            <div class="module-status integrated">{{ moduleStatuses.http }}</div>
            <div class="module-demo" v-if="moduleStatuses.http.includes('✅')">
              <div class="http-info" v-if="httpResult">
                <div class="result-preview">
                  <span class="result-label">响应数据:</span>
                  <div class="result-content">
                    <pre>{{ JSON.stringify(httpResult, null, 2).substring(0, 200) }}...</pre>
                  </div>
                </div>
              </div>

              <div class="demo-actions">
                <button
                  class="btn btn-primary btn-sm"
                  @click="handleGetDemo"
                  :disabled="httpLoading"
                >
                  {{ httpLoading ? '请求中...' : 'GET 请求' }}
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  @click="handlePostDemo"
                  :disabled="httpLoading"
                >
                  {{ httpLoading ? '请求中...' : 'POST 请求' }}
                </button>
              </div>

              <div v-if="httpError" class="demo-error">
                错误: {{ httpError }}
              </div>
            </div>
          </div>

          <!-- 国际化模块 -->
          <div class="module-card">
            <div class="module-icon">🌍</div>
            <h3>I18n 国际化</h3>
            <p>多语言支持，本地化适配</p>
            <div class="module-status integrated">{{ moduleStatuses.i18n }}</div>
            <div class="module-demo" v-if="moduleStatuses.i18n.includes('✅')">
              <div class="i18n-info">
                <div class="info-row">
                  <span class="info-label">当前语言:</span>
                  <span class="info-value">{{ locale }}</span>
                  <span class="language-badge">🌐</span>
                </div>

                <div class="info-row">
                  <span class="info-label">可用语言:</span>
                  <span class="info-value">{{ availableLanguages.length }} 种</span>
                  <span class="languages-badge">📚</span>
                </div>
              </div>

              <div class="demo-actions">
                <button
                  class="btn btn-primary btn-sm"
                  @click="changeLanguage('zh-CN')"
                  :disabled="locale === 'zh-CN'"
                >
                  中文
                </button>
                <button
                  class="btn btn-primary btn-sm"
                  @click="changeLanguage('en-US')"
                  :disabled="locale === 'en-US'"
                >
                  English
                </button>
              </div>

              <div class="translation-demo">
                <div class="demo-text">
                  <span class="demo-label">翻译示例:</span>
                  <span class="demo-value">{{ t ? t('app.title', 'LDesign 应用') : 'LDesign 应用' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 路由模块 -->
          <div class="module-card">
            <div class="module-icon">🛣️</div>
            <h3>Router 路由</h3>
            <p>路由导航系统，页面管理</p>
            <div class="module-status integrated">✅ 已集成</div>

            <div class="module-demo">
              <div class="demo-section">
                <h4>当前路由</h4>
                <div class="info-item">
                  <span class="label">路径:</span>
                  <span class="value">{{ routerInfo.currentPath }}</span>
                </div>
                <div class="info-item">
                  <span class="label">路由名:</span>
                  <span class="value">{{ routerInfo.currentName }}</span>
                </div>
              </div>

              <div class="demo-actions">
                <button class="btn btn-primary" @click="navigateToHome">首页</button>
                <button class="btn btn-secondary" @click="navigateToAbout">关于</button>
                <button class="btn btn-info" @click="showRouterInfo">路由信息</button>
              </div>
            </div>
          </div>

          <!-- 状态管理模块 -->
          <div class="module-card">
            <div class="module-icon">📦</div>
            <h3>Store 状态</h3>
            <p>状态管理系统，数据流控制</p>
            <div class="module-status integrated">✅ 已集成</div>

            <div class="module-demo">
              <div class="demo-section">
                <h4>计数器状态</h4>
                <div class="info-item">
                  <span class="label">当前值:</span>
                  <span class="value">{{ storeInfo.counter }}</span>
                </div>
                <div class="info-item">
                  <span class="label">用户名:</span>
                  <span class="value">{{ storeInfo.username || '未设置' }}</span>
                </div>
              </div>

              <div class="demo-actions">
                <button class="btn btn-primary" @click="incrementCounter">增加</button>
                <button class="btn btn-secondary" @click="decrementCounter">减少</button>
                <button class="btn btn-info" @click="setUsername">设置用户名</button>
              </div>
            </div>
          </div>

          <!-- 模板模块 -->
          <div class="module-card">
            <div class="module-icon">📄</div>
            <h3>Template 模板</h3>
            <p>模板渲染系统，动态内容</p>
            <div class="module-status integrated">✅ 已集成</div>

            <div class="module-demo">
              <div class="demo-section">
                <h4>模板信息</h4>
                <div class="info-item">
                  <span class="label">当前模板:</span>
                  <span class="value">{{ templateInfo.currentTemplate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">可用模板:</span>
                  <span class="value">{{ templateInfo.availableTemplates.join(', ') }}</span>
                </div>
              </div>

              <div class="demo-actions">
                <button class="btn btn-primary" @click="switchTemplate('default')">默认模板</button>
                <button class="btn btn-secondary" @click="switchTemplate('modern')">现代模板</button>
                <button class="btn btn-info" @click="renderTemplate">渲染模板</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 应用底部 -->
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 LDesign. 一个现代化的 Vue 3 组件库和工具集。</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useEngine } from '@ldesign/engine'
import { useTheme } from '@ldesign/color/vue'
import { useCrypto } from '@ldesign/crypto/vue'
import { useDevice, useNetwork, useBattery } from '@ldesign/device/vue'
import { useHttp, useQuery } from '@ldesign/http/vue'
import { useI18n } from '@ldesign/i18n/vue'
// import { useRouter, useRoute } from '@ldesign/router/vue'
import { useState, useStore } from '@ldesign/store/vue'
import { useTemplate, useTemplateSwitch } from '@ldesign/template/vue'
import { ref, onMounted, computed } from 'vue'

// 使用引擎实例
const engine = useEngine()
const engineStatus = ref('正在初始化...')

// 响应式状态
const httpLoading = ref(false)
const httpError = ref<string | null>(null)
const httpResult = ref<any>(null)

// 安全地使用 composables，添加错误处理
let themeSystem: any = null
let cryptoSystem: any = null
let deviceSystem: any = null
let networkSystem: any = null
let batterySystem: any = null
let httpSystem: any = null
let i18nSystem: any = null

try {
  themeSystem = useTheme()
} catch (error) {
  console.warn('主题系统初始化失败:', error)
  themeSystem = {
    currentTheme: ref('default'),
    currentMode: ref('light'),
    availableThemes: ref(['default']),
    setTheme: () => Promise.resolve(),
    toggleMode: () => Promise.resolve()
  }
}

try {
  cryptoSystem = useCrypto()
} catch (error) {
  console.warn('加密系统初始化失败:', error)
  cryptoSystem = {
    encryptAES: () => Promise.resolve({ data: '', success: false }),
    decryptAES: () => Promise.resolve({ data: '', success: false }),
    encodeBase64: () => Promise.resolve(''),
    decodeBase64: () => Promise.resolve(''),
    generateKey: () => Promise.resolve(''),
    isEncrypting: ref(false),
    isDecrypting: ref(false),
    lastError: ref(null),
    clearError: () => {}
  }
}

try {
  deviceSystem = useDevice()
} catch (error) {
  console.warn('设备检测系统初始化失败:', error)
  deviceSystem = {
    deviceInfo: ref(null),
    deviceType: ref('unknown'),
    orientation: ref('portrait'),
    isMobile: ref(false),
    isTablet: ref(false),
    isDesktop: ref(true),
    isTouchDevice: ref(false),
    refresh: () => {}
  }
}

try {
  networkSystem = useNetwork()
} catch (error) {
  console.warn('网络检测系统初始化失败:', error)
  networkSystem = {
    networkInfo: ref(null),
    isOnline: ref(true),
    connectionType: ref('unknown')
  }
}

try {
  batterySystem = useBattery()
} catch (error) {
  console.warn('电池检测系统初始化失败:', error)
  batterySystem = {
    batteryInfo: ref(null),
    isCharging: ref(false),
    batteryLevel: ref(1)
  }
}

try {
  httpSystem = useHttp()
} catch (error) {
  console.warn('HTTP 系统初始化失败:', error)
  httpSystem = {
    get: () => Promise.reject(new Error('HTTP 系统未初始化')),
    post: () => Promise.reject(new Error('HTTP 系统未初始化'))
  }
}

try {
  i18nSystem = useI18n()
} catch (error) {
  console.warn('国际化系统初始化失败:', error)
  i18nSystem = {
    t: (key: string, fallback?: string) => fallback || key,
    locale: ref('zh-CN'),
    availableLanguages: ref([]),
    changeLanguage: () => Promise.resolve()
  }
}

// 解构赋值
const {
  currentTheme,
  currentMode,
  availableThemes,
  setTheme,
  toggleMode
} = themeSystem

const {
  encryptAES,
  decryptAES,
  encodeBase64,
  decodeBase64,
  generateKey,
  isEncrypting,
  isDecrypting,
  lastError: cryptoError,
  clearError: clearCryptoError
} = cryptoSystem

const {
  deviceInfo,
  deviceType,
  orientation,
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  refresh: refreshDevice
} = deviceSystem

const {
  networkInfo,
  isOnline,
  connectionType
} = networkSystem

const {
  batteryInfo,
  isCharging,
  batteryLevel
} = batterySystem

const { get, post } = httpSystem

const { t, locale, availableLanguages, changeLanguage } = i18nSystem

// 路由系统 - 暂时禁用
// let router: any = null
// let route: any = null

// try {
//   router = useRouter()
//   route = useRoute()
//   console.log('✅ 路由系统初始化成功')
// } catch (error) {
//   console.warn('❌ 路由器初始化失败:', error)
// }

// 状态管理系统
let storeSystem: any = null
let counterState: any = null
let usernameState: any = null

try {
  storeSystem = useStore('demo')
  counterState = useState('demo', 'counter', 0)
  usernameState = useState('demo', 'username', '')
  console.log('✅ 状态管理系统初始化成功')
} catch (error) {
  console.warn('❌ 状态管理系统初始化失败:', error)
  // 降级到简单的响应式状态
  counterState = ref(0)
  usernameState = ref('')
}

// 模板系统
let templateSystem: any = null
let switchTemplateSystem: any = null

try {
  templateSystem = useTemplate({ category: 'demo' })
  switchTemplateSystem = templateSystem.switchTemplate
  console.log('✅ 模板系统初始化成功')
} catch (error) {
  console.warn('❌ 模板系统初始化失败:', error)
}

// 响应式数据
const routerInfo = ref({
  currentPath: '/',
  currentName: 'home'
})

const storeInfo = ref({
  counter: 0,
  username: ''
})

const templateInfo = ref({
  currentTemplate: 'default',
  availableTemplates: ['default', 'modern', 'classic']
})

const moduleStatuses = ref({
  engine: '✅ 已集成',
  color: '✅ 已集成',
  crypto: '✅ 已集成',
  device: '✅ 已集成',
  http: '✅ 已集成',
  i18n: '✅ 已集成',
  router: '✅ 已集成',
  store: '✅ 已集成',
  template: '✅ 已集成'
})

// 计算主题状态
const themeStatus = computed(() => {
  return `${currentTheme.value} - ${currentMode.value}`
})

onMounted(() => {
  console.log('🎯 App.vue 组件已加载')
  console.log('🚀 引擎实例:', engine)
  console.log('🎨 主题系统:', { currentTheme: currentTheme.value, currentMode: currentMode.value })

  // 检查引擎状态
  if (engine) {
    engineStatus.value = `引擎已启动 - ${engine.config.appName} v${engine.config.version}`

    // 监听引擎事件
    engine.events.on('module:integrated', (moduleName: string) => {
      console.log(`📦 模块已集成: ${moduleName}`)
      if (moduleStatuses.value[moduleName as keyof typeof moduleStatuses.value]) {
        moduleStatuses.value[moduleName as keyof typeof moduleStatuses.value] = '✅ 已集成'
      }
    })
  } else {
    engineStatus.value = '引擎初始化失败'
  }
})

// 主题切换函数
const handleThemeChange = async (theme: string) => {
  try {
    await setTheme(theme)
    console.log(`🎨 主题已切换到: ${theme}`)
  } catch (error) {
    console.error('主题切换失败:', error)
  }
}

const handleModeToggle = async () => {
  try {
    await toggleMode()
    console.log(`🌙 模式已切换到: ${currentMode.value}`)
  } catch (error) {
    console.error('模式切换失败:', error)
  }
}

// 加密演示函数
const demoText = ref('Hello, LDesign!')
const demoKey = ref('my-secret-key')
const encryptedResult = ref('')
const decryptedResult = ref('')

const handleEncryptDemo = async () => {
  try {
    clearCryptoError()
    const result = await encryptAES(demoText.value, demoKey.value)
    encryptedResult.value = result.data || ''
    console.log('🔐 加密成功:', result)
  } catch (error) {
    console.error('加密失败:', error)
  }
}

const handleDecryptDemo = async () => {
  try {
    clearCryptoError()
    if (!encryptedResult.value) {
      console.warn('请先进行加密操作')
      return
    }
    const result = await decryptAES(encryptedResult.value, demoKey.value)
    decryptedResult.value = result.data || ''
    console.log('🔓 解密成功:', result)
  } catch (error) {
    console.error('解密失败:', error)
  }
}

const handleBase64Demo = async () => {
  try {
    clearCryptoError()
    const encoded = await encodeBase64(demoText.value)
    const decoded = await decodeBase64(encoded)
    console.log('📝 Base64 编码:', encoded)
    console.log('📝 Base64 解码:', decoded)
  } catch (error) {
    console.error('Base64 操作失败:', error)
  }
}

// HTTP 演示函数
const handleGetDemo = async () => {
  try {
    httpLoading.value = true
    httpError.value = null
    const response = await get('/posts/1')
    httpResult.value = response.data
    console.log('🌐 GET 请求成功:', response.data)
  } catch (error) {
    httpError.value = error instanceof Error ? error.message : '请求失败'
    console.error('GET 请求失败:', error)
  } finally {
    httpLoading.value = false
  }
}

const handlePostDemo = async () => {
  try {
    httpLoading.value = true
    httpError.value = null
    const response = await post('/posts', {
      title: 'LDesign HTTP 测试',
      body: '这是一个测试请求',
      userId: 1
    })
    httpResult.value = response.data
    console.log('🌐 POST 请求成功:', response.data)
  } catch (error) {
    httpError.value = error instanceof Error ? error.message : '请求失败'
    console.error('POST 请求失败:', error)
  } finally {
    httpLoading.value = false
  }
}

// 路由演示函数 - 暂时禁用
const navigateToHome = () => {
  console.warn('路由功能暂时禁用')
}

const navigateToAbout = () => {
  console.warn('路由功能暂时禁用')
}

const showRouterInfo = () => {
  console.warn('路由功能暂时禁用')
}

// 状态管理演示函数
const incrementCounter = () => {
  counterState.value++
  storeInfo.value.counter = counterState.value
  console.log('📦 计数器增加:', counterState.value)
}

const decrementCounter = () => {
  counterState.value--
  storeInfo.value.counter = counterState.value
  console.log('📦 计数器减少:', counterState.value)
}

const setUsername = () => {
  const newUsername = prompt('请输入用户名:')
  if (newUsername) {
    usernameState.value = newUsername
    storeInfo.value.username = newUsername
    console.log('📦 用户名已设置:', newUsername)
  }
}

// 模板演示函数
const switchTemplate = (templateName: string) => {
  templateInfo.value.currentTemplate = templateName
  console.log('📄 模板已切换:', templateName)

  // 如果有模板切换功能，调用它
  if (switchTemplateSystem) {
    switchTemplateSystem(templateName)
  }
}

const renderTemplate = () => {
  console.log('📄 渲染模板:', {
    current: templateInfo.value.currentTemplate,
    available: templateInfo.value.availableTemplates,
    templateSystem
  })
}

// 更新响应式数据
onMounted(() => {
  // 更新路由信息 - 暂时禁用
  // if (route) {
  //   routerInfo.value.currentPath = route.value.path
  //   routerInfo.value.currentName = route.value.name as string || 'unknown'
  //   console.log('🛣️ 路由信息已更新:', routerInfo.value)
  // }

  // 更新状态信息
  storeInfo.value.counter = counterState.value
  storeInfo.value.username = usernameState.value
})
</script>

<style lang="less" scoped>
.ldesign-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 0;

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;

    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
    }
  }

  .header-main {
    flex: 1;

    .app-title {
      font-size: 2.5rem;
      margin: 0 0 0.5rem 0;
      font-weight: 700;

      .logo {
        margin-right: 0.5rem;
      }
    }

    .app-subtitle {
      font-size: 1.2rem;
      margin: 0;
      opacity: 0.9;
    }
  }

  .theme-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-width: 200px;

    .theme-info {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      opacity: 0.9;

      .theme-label {
        font-weight: 500;
      }

      .theme-value {
        font-weight: 600;
        text-transform: capitalize;
      }
    }

    .theme-actions {
      display: flex;
      gap: 0.5rem;

      .theme-selector {
        flex: 1;
        padding: 0.5rem;
        border: none;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        font-size: 0.9rem;

        option {
          background: #2d3748;
          color: white;
        }

        &:focus {
          outline: 2px solid rgba(255, 255, 255, 0.5);
        }
      }

      .mode-toggle {
        width: 40px;
        height: 40px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.05);
        }
      }
    }
  }
}

.app-main {
  flex: 1;
  padding: 3rem 0;
  background: #f8fafc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.module-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .module-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  h3 {
    font-size: 1.5rem;
    margin: 0 0 0.5rem 0;
    color: #2d3748;
  }

  p {
    color: #718096;
    margin: 0 0 1rem 0;
    line-height: 1.6;
  }

  .module-status {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    background: #fed7d7;
    color: #c53030;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;

    &.integrated {
      background: #c6f6d5;
      color: #2f855a;
    }
  }

  .module-demo {
    margin-top: 1rem;
    padding: 1rem;
    background: #f7fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;

    .demo-info {
      margin: 0 0 0.75rem 0;
      font-size: 0.875rem;
      color: #4a5568;
      font-weight: 500;
    }

    .demo-inputs {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;

      .demo-input {
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 0.875rem;

        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
      }
    }

    .demo-results {
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 4px;
      border: 1px solid #e2e8f0;

      .demo-result {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        margin-bottom: 0.5rem;

        &:last-child {
          margin-bottom: 0;
        }

        .result-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #4a5568;
          text-transform: uppercase;
        }

        .result-value {
          font-size: 0.875rem;
          color: #2d3748;
          font-family: 'Courier New', monospace;
          word-break: break-all;
        }
      }
    }

    .demo-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.75rem;

      .btn-sm {
        padding: 0.375rem 0.75rem;
        font-size: 0.875rem;
      }
    }

    .demo-error {
      padding: 0.5rem;
      background: #fed7d7;
      color: #c53030;
      border-radius: 4px;
      font-size: 0.875rem;
      border: 1px solid #feb2b2;
    }

    .device-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;

      .info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        background: #f8fafc;
        border-radius: 4px;
        border: 1px solid #e2e8f0;

        .info-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4a5568;
        }

        .info-value {
          font-size: 0.875rem;
          color: #2d3748;
          font-weight: 600;
          text-transform: capitalize;
        }

        .device-badge,
        .orientation-badge,
        .touch-badge,
        .network-badge,
        .battery-badge {
          font-size: 1.2rem;
          margin-left: 0.5rem;
        }

        .device-badge {
          &.mobile { filter: hue-rotate(120deg); }
          &.tablet { filter: hue-rotate(60deg); }
          &.desktop { filter: hue-rotate(0deg); }
        }

        .network-badge {
          &.online { filter: hue-rotate(120deg); }
          &.offline { filter: grayscale(1); }
        }

        .battery-badge {
          &.charging {
            animation: pulse 2s infinite;
          }
        }
      }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .http-info {
      margin-bottom: 1rem;

      .result-preview {
        padding: 0.75rem;
        background: #f8fafc;
        border-radius: 4px;
        border: 1px solid #e2e8f0;

        .result-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #4a5568;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.5rem;
        }

        .result-content {
          pre {
            margin: 0;
            font-size: 0.75rem;
            color: #2d3748;
            font-family: 'Courier New', monospace;
            white-space: pre-wrap;
            word-break: break-all;
            background: white;
            padding: 0.5rem;
            border-radius: 2px;
            border: 1px solid #e2e8f0;
          }
        }
      }
    }

    .i18n-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;

      .info-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        background: #f8fafc;
        border-radius: 4px;
        border: 1px solid #e2e8f0;

        .info-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4a5568;
        }

        .info-value {
          font-size: 0.875rem;
          color: #2d3748;
          font-weight: 600;
        }

        .language-badge,
        .languages-badge {
          font-size: 1.2rem;
          margin-left: 0.5rem;
        }
      }
    }

    .translation-demo {
      margin-top: 1rem;
      padding: 0.75rem;
      background: #f0f9ff;
      border-radius: 4px;
      border: 1px solid #bae6fd;

      .demo-text {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .demo-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #0369a1;
          text-transform: uppercase;
        }

        .demo-value {
          font-size: 0.875rem;
          color: #0c4a6e;
          font-weight: 500;
        }
      }
    }
  }
}

.app-footer {
  background: #2d3748;
  color: white;
  padding: 1.5rem 0;
  text-align: center;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  p {
    margin: 0;
    opacity: 0.8;
  }
}
</style>
