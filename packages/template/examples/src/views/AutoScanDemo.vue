<script setup lang="ts">
import { TemplateRenderer } from '@ldesign/template/vue'
import { ref, onMounted } from 'vue'
import { TemplateScanner } from '@ldesign/template/core'

// 简单的登录面板组件
const LoginPanel = {
  name: 'LoginPanel',
  emits: ['login', 'register', 'forgot-password', 'third-party-login'],
  setup(props: any, { emit }: any) {
    const formData = ref({
      username: '',
      password: '',
      rememberMe: false
    })

    const handleSubmit = () => {
      emit('login', formData.value)
    }

    return () => (
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
        <h2>自动扫描登录演示</h2>
        <div style={{ marginBottom: '15px' }}>
          <input
            v-model={formData.value.username}
            placeholder="用户名"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <input
            v-model={formData.value.password}
            type="password"
            placeholder="密码"
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
        </div>
        <button
          onClick={handleSubmit}
          style={{
            width: '100%',
            padding: '12px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          登录
        </button>
      </div>
    )
  }
}

// 扫描统计信息
const scanStats = ref<any>(null)

// 测试自动扫描功能
const testAutoScan = async () => {
  try {
    const scanner = new TemplateScanner({ debug: true })
    const result = await scanner.scanTemplates()
    
    scanStats.value = {
      ...result,
      stats: scanner.getStats()
    }
    
    console.log('🎉 自动扫描测试结果:', scanStats.value)
  } catch (error) {
    console.error('❌ 自动扫描测试失败:', error)
  }
}

// 事件处理
function handleLogin(data: any) {
  console.log('登录:', data)
  alert(`登录成功: ${data.username}`)
}

function handleRegister() {
  console.log('注册')
  alert('跳转到注册页面')
}

function handleForgotPassword() {
  console.log('忘记密码')
  alert('跳转到忘记密码页面')
}

function handleThirdPartyLogin(data: any) {
  console.log('第三方登录:', data)
  alert(`使用 ${data.provider} 登录`)
}

// 组件挂载时测试扫描
onMounted(() => {
  testAutoScan()
})
</script>

<template>
  <div class="auto-scan-demo">
    <div class="demo-header">
      <h1>🚀 自动扫描模板系统演示</h1>
      <p>基于文件系统约定的零配置模板发现机制</p>
      
      <!-- 扫描统计信息 -->
      <div v-if="scanStats" class="scan-stats">
        <h3>📊 扫描统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">发现模板:</span>
            <span class="stat-value">{{ scanStats.count }} 个</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">扫描模式:</span>
            <span class="stat-value">{{ scanStats.scanMode }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">扫描耗时:</span>
            <span class="stat-value">{{ scanStats.duration }}ms</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">可用分类:</span>
            <span class="stat-value">{{ scanStats.stats?.categories?.join(', ') }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">支持设备:</span>
            <span class="stat-value">{{ scanStats.stats?.devices?.join(', ') }}</span>
          </div>
        </div>
        
        <!-- 模板列表 -->
        <div class="template-list">
          <h4>🎨 发现的模板:</h4>
          <div class="template-grid">
            <div 
              v-for="template in scanStats.templates" 
              :key="template.id"
              class="template-card"
            >
              <div class="template-info">
                <h5>{{ template.name }}</h5>
                <p>{{ template.description }}</p>
                <div class="template-meta">
                  <span class="meta-tag">{{ template.category }}</span>
                  <span class="meta-tag">{{ template.device }}</span>
                  <span class="meta-tag">{{ template.template }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模板渲染器 - 自动使用扫描到的模板 -->
    <TemplateRenderer
      category="login"
      device="desktop"
      template="adaptive"
      :template-props="{ loginPanel: LoginPanel }"
      @login="handleLogin"
      @register="handleRegister"
      @forgot-password="handleForgotPassword"
      @third-party-login="handleThirdPartyLogin"
    />
  </div>
</template>

<style lang="less" scoped>
.auto-scan-demo {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.demo-header {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 999;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;

  h1 {
    margin: 0 0 10px 0;
    font-size: 18px;
    color: #333;
  }

  p {
    margin: 0 0 20px 0;
    font-size: 14px;
    color: #666;
    line-height: 1.5;
  }
}

.scan-stats {
  h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #333;
  }
}

.stats-grid {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 123, 255, 0.1);
  border-radius: 6px;
  font-size: 12px;

  .stat-label {
    color: #666;
    font-weight: 500;
  }

  .stat-value {
    color: #333;
    font-weight: 600;
  }
}

.template-list {
  h4 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #333;
  }
}

.template-grid {
  display: grid;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.template-card {
  padding: 10px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);

  .template-info {
    h5 {
      margin: 0 0 5px 0;
      font-size: 12px;
      color: #333;
    }

    p {
      margin: 0 0 8px 0;
      font-size: 10px;
      color: #666;
      line-height: 1.3;
    }
  }
}

.template-meta {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.meta-tag {
  padding: 2px 6px;
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
  border-radius: 3px;
  font-size: 9px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .demo-header {
    position: relative;
    top: auto;
    left: auto;
    margin: 0 0 20px 0;
    max-width: none;
    max-height: none;
  }
}
</style>
