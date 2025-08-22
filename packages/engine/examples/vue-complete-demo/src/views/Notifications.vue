<script setup lang="ts">
import { useEngine } from '@ldesign/engine/vue'
import { computed, onMounted, ref } from 'vue'

// 使用引擎组合式API
const { engine } = useEngine()

// 通知历史记录
const notificationHistory = ref([
  {
    id: 1,
    title: '系统更新完成',
    message: '系统已成功更新到最新版本',
    type: 'success',
    duration: 5000,
    timestamp: new Date(Date.now() - 300000).toLocaleString(),
    dismissed: false,
  },
  {
    id: 2,
    title: '性能警告',
    message: 'CPU使用率过高，建议检查系统负载',
    type: 'warning',
    duration: 0,
    timestamp: new Date(Date.now() - 600000).toLocaleString(),
    dismissed: true,
  },
  {
    id: 3,
    title: '新用户注册',
    message: '用户 张三 已成功注册',
    type: 'info',
    duration: 3000,
    timestamp: new Date(Date.now() - 900000).toLocaleString(),
    dismissed: false,
  },
])

// 通知模板
const notificationTemplates = ref([
  {
    id: 'welcome',
    name: '欢迎消息',
    title: '欢迎使用系统',
    message: '感谢您使用我们的系统，祝您使用愉快！',
    type: 'success',
    duration: 5000,
    category: 'user',
  },
  {
    id: 'error-alert',
    name: '错误警告',
    title: '系统错误',
    message: '系统出现异常，请联系管理员',
    type: 'error',
    duration: 0,
    category: 'system',
  },
  {
    id: 'maintenance',
    name: '维护通知',
    title: '系统维护',
    message: '系统将于今晚进行维护，预计2小时',
    type: 'warning',
    duration: 10000,
    category: 'system',
  },
])

// 通知设置
const notificationSettings = ref({
  enabled: true,
  position: 'top-right',
  maxVisible: 5,
  defaultDuration: 5000,
  enableSound: true,
  enableAnimation: true,
  enableGrouping: false,
  autoStackSimilar: true,
})

// 通知统计
const notificationStats = ref({
  totalSent: 1247,
  dismissed: 892,
  clicked: 234,
  errorRate: 2.3,
})

// 新通知表单
const newNotification = ref({
  title: '',
  message: '',
  type: 'info',
  duration: 5000,
  category: 'custom',
})

// 自定义通知类型
const notificationTypes = [
  { value: 'success', label: '成功', icon: '✅', color: '#28a745' },
  { value: 'error', label: '错误', icon: '❌', color: '#dc3545' },
  { value: 'warning', label: '警告', icon: '⚠️', color: '#ffc107' },
  { value: 'info', label: '信息', icon: 'ℹ️', color: '#17a2b8' },
]

// 通知位置选项
const positionOptions = [
  { value: 'top-left', label: '左上角' },
  { value: 'top-center', label: '顶部中央' },
  { value: 'top-right', label: '右上角' },
  { value: 'bottom-left', label: '左下角' },
  { value: 'bottom-center', label: '底部中央' },
  { value: 'bottom-right', label: '右下角' },
]

// 计算属性
const activeNotifications = computed(() => {
  return notificationHistory.value.filter(n => !n.dismissed).length
})

const notificationByType = computed(() => {
  const types = { success: 0, error: 0, warning: 0, info: 0 }
  notificationHistory.value.forEach(n => {
    if (types.hasOwnProperty(n.type)) {
      types[n.type]++
    }
  })
  return types
})

const dismissalRate = computed(() => {
  const total = notificationStats.value.totalSent
  return total > 0 ? ((notificationStats.value.dismissed / total) * 100).toFixed(1) : 0
})

const clickRate = computed(() => {
  const total = notificationStats.value.totalSent
  return total > 0 ? ((notificationStats.value.clicked / total) * 100).toFixed(1) : 0
})

// 发送自定义通知
function sendCustomNotification() {
  if (!newNotification.value.title || !newNotification.value.message) {
    engine.value?.notifications.show({
      title: '❌ 输入错误',
      message: '请填写通知标题和内容',
      type: 'error',
    })
    return
  }
  
  const notification = {
    title: newNotification.value.title,
    message: newNotification.value.message,
    type: newNotification.value.type,
    duration: newNotification.value.duration,
  }
  
  // 发送通知
  engine.value?.notifications.show(notification)
  
  // 添加到历史记录
  addToHistory(notification)
  
  // 重置表单
  newNotification.value = {
    title: '',
    message: '',
    type: 'info',
    duration: 5000,
    category: 'custom',
  }
  
  // 更新统计
  notificationStats.value.totalSent++
}

// 使用模板发送通知
function sendTemplateNotification(templateId: string) {
  const template = notificationTemplates.value.find(t => t.id === templateId)
  if (template) {
    const notification = {
      title: template.title,
      message: template.message,
      type: template.type,
      duration: template.duration,
    }
    
    // 发送通知
    engine.value?.notifications.show(notification)
    
    // 添加到历史记录
    addToHistory(notification)
    
    // 更新统计
    notificationStats.value.totalSent++
    
    engine.value?.notifications.show({
      title: '📨 模板通知已发送',
      message: `已使用模板 "${template.name}" 发送通知`,
      type: 'success',
      duration: 3000,
    })
  }
}

// 批量发送通知
function sendBulkNotifications() {
  const notifications = [
    { title: '批量通知 1', message: '这是第一条批量通知', type: 'info' },
    { title: '批量通知 2', message: '这是第二条批量通知', type: 'success' },
    { title: '批量通知 3', message: '这是第三条批量通知', type: 'warning' },
  ]
  
  notifications.forEach((notification, index) => {
    setTimeout(() => {
      engine.value?.notifications.show({
        ...notification,
        duration: 4000,
      })
      
      addToHistory(notification)
      notificationStats.value.totalSent++
    }, index * 1000)
  })
  
  engine.value?.notifications.show({
    title: '📨 批量通知开始发送',
    message: `正在发送 ${notifications.length} 条通知...`,
    type: 'info',
  })
}

// 演示不同类型的通知
function showNotificationDemo(type: string) {
  const demos = {
    success: {
      title: '🎉 操作成功',
      message: '您的操作已成功完成！',
      type: 'success',
      duration: 3000,
    },
    error: {
      title: '❌ 操作失败',
      message: '操作过程中发生错误，请重试。',
      type: 'error',
      duration: 0, // 不自动消失
    },
    warning: {
      title: '⚠️ 注意事项',
      message: '请注意检查您的输入数据。',
      type: 'warning',
      duration: 5000,
    },
    info: {
      title: 'ℹ️ 提示信息',
      message: '这是一条普通的提示信息。',
      type: 'info',
      duration: 4000,
    },
    loading: {
      title: '⏳ 正在处理',
      message: '请稍候，正在处理您的请求...',
      type: 'info',
      duration: 0,
    },
  }
  
  const demo = demos[type]
  if (demo) {
    engine.value?.notifications.show(demo)
    addToHistory(demo)
    notificationStats.value.totalSent++
  }
}

// 演示持久化通知
function showPersistentNotification() {
  const notification = {
    title: '🔔 重要通知',
    message: '这是一条不会自动消失的重要通知，需要手动关闭。',
    type: 'warning',
    duration: 0, // 不自动消失
  }
  
  engine.value?.notifications.show(notification)
  addToHistory(notification)
  notificationStats.value.totalSent++
}

// 演示富文本通知
function showRichNotification() {
  const notification = {
    title: '🎨 富文本通知',
    message: '这是一条包含<strong>粗体</strong>和<em>斜体</em>的通知',
    type: 'info',
    duration: 6000,
  }
  
  engine.value?.notifications.show(notification)
  addToHistory(notification)
  notificationStats.value.totalSent++
}

// 清除所有通知
function clearAllNotifications() {
  engine.value?.notifications.clear?.()
  
  engine.value?.notifications.show({
    title: '🧹 通知已清除',
    message: '所有通知已被清除',
    type: 'info',
    duration: 2000,
  })
}

// 更新通知设置
function updateNotificationSettings() {
  // 这里可以将设置同步到引擎
  if (engine.value?.notifications?.configure) {
    engine.value.notifications.configure(notificationSettings.value)
  }
  
  engine.value?.notifications.show({
    title: '⚙️ 设置已更新',
    message: '通知系统设置已更新',
    type: 'success',
    duration: 3000,
  })
}

// 测试通知性能
function testNotificationPerformance() {
  const startTime = Date.now()
  const count = 50
  
  engine.value?.notifications.show({
    title: '🧪 性能测试开始',
    message: `正在发送 ${count} 条测试通知...`,
    type: 'info',
    duration: 3000,
  })
  
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      engine.value?.notifications.show({
        title: `测试通知 ${i + 1}`,
        message: `这是第 ${i + 1} 条测试通知`,
        type: 'info',
        duration: 1000,
      })
      
      if (i === count - 1) {
        const endTime = Date.now()
        const duration = endTime - startTime
        
        setTimeout(() => {
          engine.value?.notifications.show({
            title: '✅ 性能测试完成',
            message: `发送 ${count} 条通知耗时 ${duration}ms`,
            type: 'success',
            duration: 5000,
          })
        }, 2000)
      }
    }, i * 20) // 每20ms发送一条
  }
  
  notificationStats.value.totalSent += count
}

// 添加到历史记录
function addToHistory(notification: any) {
  const historyItem = {
    id: Date.now(),
    ...notification,
    timestamp: new Date().toLocaleString(),
    dismissed: false,
  }
  
  notificationHistory.value.unshift(historyItem)
  
  // 限制历史记录数量
  if (notificationHistory.value.length > 100) {
    notificationHistory.value = notificationHistory.value.slice(0, 100)
  }
}

// 切换通知状态
function toggleNotificationDismissal(notificationId: number) {
  const notification = notificationHistory.value.find(n => n.id === notificationId)
  if (notification) {
    notification.dismissed = !notification.dismissed
    
    if (notification.dismissed) {
      notificationStats.value.dismissed++
    } else {
      notificationStats.value.dismissed--
    }
  }
}

// 清除历史记录
function clearHistory() {
  notificationHistory.value = []
  
  engine.value?.notifications.show({
    title: '🗑️ 历史记录已清除',
    message: '所有通知历史记录已清除',
    type: 'info',
    duration: 3000,
  })
}

// 导出通知数据
function exportNotificationData() {
  const data = {
    timestamp: new Date().toISOString(),
    settings: notificationSettings.value,
    stats: notificationStats.value,
    history: notificationHistory.value,
    templates: notificationTemplates.value,
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notifications-data-${Date.now()}.json`
  a.click()
  
  URL.revokeObjectURL(url)
  
  engine.value?.notifications.show({
    title: '📊 数据导出成功',
    message: '通知数据已导出到文件',
    type: 'success',
  })
}

// 组件挂载
onMounted(() => {
  engine.value?.logger.info('通知系统页面已加载')
  
  // 发送欢迎通知
  setTimeout(() => {
    engine.value?.notifications.show({
      title: '🎉 欢迎来到通知系统',
      message: '您可以在这里测试和管理各种通知功能',
      type: 'success',
      duration: 5000,
    })
  }, 1000)
})
</script>

<template>
  <div class="notifications">
    <div class="page-header">
      <h1>🔔 通知系统</h1>
      <p>强大的通知管理系统，支持多种类型、模板和个性化设置</p>
    </div>

    <!-- 通知统计概览 -->
    <div class="stats-overview">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📨</div>
          <div class="stat-content">
            <div class="stat-value">{{ notificationStats.totalSent }}</div>
            <div class="stat-label">总发送量</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👁️</div>
          <div class="stat-content">
            <div class="stat-value">{{ activeNotifications }}</div>
            <div class="stat-label">活跃通知</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👆</div>
          <div class="stat-content">
            <div class="stat-value">{{ clickRate }}%</div>
            <div class="stat-label">点击率</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">❌</div>
          <div class="stat-content">
            <div class="stat-value">{{ dismissalRate }}%</div>
            <div class="stat-label">关闭率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知类型演示 -->
    <div class="section">
      <h2>🎨 通知类型演示</h2>
      <div class="demo-grid">
        <div v-for="type in notificationTypes" :key="type.value" class="demo-card">
          <div class="demo-header">
            <span class="demo-icon">{{ type.icon }}</span>
            <span class="demo-label">{{ type.label }}</span>
          </div>
          <div class="demo-stats">
            <span class="demo-count">{{ notificationByType[type.value] }} 条</span>
          </div>
          <button 
            class="btn demo-btn"
            :style="{ backgroundColor: type.color }"
            @click="showNotificationDemo(type.value)"
          >
            发送 {{ type.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 特殊演示 -->
    <div class="section">
      <h2>✨ 特殊功能演示</h2>
      <div class="special-demos">
        <div class="demo-group">
          <h3>基础功能</h3>
          <div class="demo-buttons">
            <button class="btn btn-primary" @click="showPersistentNotification">
              🔔 持久化通知
            </button>
            <button class="btn btn-primary" @click="showRichNotification">
              🎨 富文本通知
            </button>
            <button class="btn btn-primary" @click="sendBulkNotifications">
              📨 批量通知
            </button>
          </div>
        </div>
        
        <div class="demo-group">
          <h3>进阶功能</h3>
          <div class="demo-buttons">
            <button class="btn btn-secondary" @click="testNotificationPerformance">
              🧪 性能测试
            </button>
            <button class="btn btn-secondary" @click="clearAllNotifications">
              🧹 清除所有
            </button>
            <button class="btn btn-secondary" @click="exportNotificationData">
              📊 导出数据
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建自定义通知 -->
    <div class="section">
      <h2>➕ 创建自定义通知</h2>
      <div class="create-notification">
        <div class="form-row">
          <div class="form-group">
            <label>通知标题</label>
            <input 
              v-model="newNotification.title" 
              type="text" 
              placeholder="输入通知标题"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label>通知类型</label>
            <select v-model="newNotification.type" class="form-select">
              <option v-for="type in notificationTypes" :key="type.value" :value="type.value">
                {{ type.icon }} {{ type.label }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>持续时间 (ms)</label>
            <input 
              v-model.number="newNotification.duration" 
              type="number" 
              min="0"
              step="1000"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label>通知内容</label>
          <textarea 
            v-model="newNotification.message" 
            placeholder="输入通知内容，支持HTML标签"
            class="form-textarea"
            rows="3"
          />
        </div>
        
        <button class="btn btn-primary" @click="sendCustomNotification">
          🚀 发送通知
        </button>
      </div>
    </div>

    <!-- 通知模板 -->
    <div class="section">
      <h2>📋 通知模板</h2>
      <div class="templates-grid">
        <div v-for="template in notificationTemplates" :key="template.id" class="template-card">
          <div class="template-header">
            <div class="template-info">
              <h3 class="template-name">{{ template.name }}</h3>
              <div class="template-meta">
                <span :class="['template-type', template.type]">
                  {{ notificationTypes.find(t => t.value === template.type)?.icon }}
                  {{ template.type }}
                </span>
                <span class="template-category">{{ template.category }}</span>
              </div>
            </div>
          </div>
          
          <div class="template-content">
            <div class="template-title">{{ template.title }}</div>
            <div class="template-message">{{ template.message }}</div>
          </div>
          
          <div class="template-actions">
            <button class="btn btn-primary" @click="sendTemplateNotification(template.id)">
              📨 使用模板
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知设置 -->
    <div class="section">
      <h2>⚙️ 通知设置</h2>
      <div class="notification-settings">
        <div class="settings-grid">
          <div class="setting-group">
            <h3>基本设置</h3>
            <div class="setting-item">
              <label>
                <input 
                  v-model="notificationSettings.enabled" 
                  type="checkbox"
                  @change="updateNotificationSettings"
                >
                启用通知系统
              </label>
            </div>
            
            <div class="setting-item">
              <label>通知位置</label>
              <select 
                v-model="notificationSettings.position" 
                class="form-select"
                @change="updateNotificationSettings"
              >
                <option v-for="option in positionOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>
            
            <div class="setting-item">
              <label>最大显示数量</label>
              <input 
                v-model.number="notificationSettings.maxVisible" 
                type="number" 
                min="1"
                max="10"
                class="form-input"
                @change="updateNotificationSettings"
              >
            </div>
            
            <div class="setting-item">
              <label>默认持续时间 (ms)</label>
              <input 
                v-model.number="notificationSettings.defaultDuration" 
                type="number" 
                min="0"
                step="1000"
                class="form-input"
                @change="updateNotificationSettings"
              >
            </div>
          </div>
          
          <div class="setting-group">
            <h3>高级设置</h3>
            <div class="setting-item">
              <label>
                <input 
                  v-model="notificationSettings.enableSound" 
                  type="checkbox"
                  @change="updateNotificationSettings"
                >
                启用提示音
              </label>
            </div>
            
            <div class="setting-item">
              <label>
                <input 
                  v-model="notificationSettings.enableAnimation" 
                  type="checkbox"
                  @change="updateNotificationSettings"
                >
                启用动画效果
              </label>
            </div>
            
            <div class="setting-item">
              <label>
                <input 
                  v-model="notificationSettings.enableGrouping" 
                  type="checkbox"
                  @change="updateNotificationSettings"
                >
                启用通知分组
              </label>
            </div>
            
            <div class="setting-item">
              <label>
                <input 
                  v-model="notificationSettings.autoStackSimilar" 
                  type="checkbox"
                  @change="updateNotificationSettings"
                >
                自动堆叠相似通知
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知历史 -->
    <div class="section">
      <div class="section-header">
        <h2>📚 通知历史</h2>
        <button class="btn btn-sm btn-secondary" @click="clearHistory">
          🗑️ 清除历史
        </button>
      </div>
      
      <div class="history-container">
        <div v-if="notificationHistory.length === 0" class="empty-history">
          <div class="empty-icon">📚</div>
          <p>暂无通知历史</p>
        </div>
        
        <div v-for="notification in notificationHistory.slice(0, 20)" :key="notification.id" class="history-item">
          <div class="history-indicator">
            <span :class="['history-type', notification.type]">
              {{ notificationTypes.find(t => t.value === notification.type)?.icon || 'ℹ️' }}
            </span>
          </div>
          
          <div class="history-content">
            <div class="history-title">{{ notification.title }}</div>
            <div class="history-message">{{ notification.message }}</div>
            <div class="history-meta">
              <span :class="['history-type-label', notification.type]">{{ notification.type }}</span>
              <span class="history-time">{{ notification.timestamp }}</span>
              <span v-if="notification.duration === 0" class="history-persistent">持久化</span>
            </div>
          </div>
          
          <div class="history-actions">
            <button 
              :class="['dismiss-btn', notification.dismissed ? 'dismissed' : 'active']"
              @click="toggleNotificationDismissal(notification.id)"
            >
              {{ notification.dismissed ? '↩️' : '❌' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #666;
  font-size: 1.1rem;
}

.stats-overview {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.demo-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s;
}

.demo-card:hover {
  transform: translateY(-2px);
}

.demo-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.demo-icon {
  font-size: 1.5rem;
}

.demo-label {
  font-weight: bold;
  color: #2c3e50;
}

.demo-stats {
  margin-bottom: 1rem;
}

.demo-count {
  color: #666;
  font-size: 0.9rem;
}

.demo-btn {
  width: 100%;
  color: white;
  border: none;
}

.special-demos {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.demo-group h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.demo-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.create-notification {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
}

.form-textarea {
  resize: vertical;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.template-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.template-header {
  margin-bottom: 1rem;
}

.template-name {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.template-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.template-type {
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: capitalize;
}

.template-type.success {
  background: #d4edda;
  color: #155724;
}

.template-type.error {
  background: #f8d7da;
  color: #721c24;
}

.template-type.warning {
  background: #fff3cd;
  color: #856404;
}

.template-type.info {
  background: #d1ecf1;
  color: #0c5460;
}

.template-category {
  background: #e2e3e5;
  color: #383d41;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
}

.template-content {
  margin-bottom: 1rem;
}

.template-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.template-message {
  color: #666;
  line-height: 1.5;
}

.notification-settings {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.setting-group h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #2c3e50;
}

.setting-item input[type="checkbox"] {
  width: auto;
}

.history-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-height: 500px;
  overflow-y: auto;
}

.empty-history {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.history-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
  transition: background-color 0.3s;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background-color: #f8f9fa;
}

.history-indicator {
  font-size: 1.5rem;
  margin-top: 0.2rem;
}

.history-content {
  flex: 1;
}

.history-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.history-message {
  color: #666;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.history-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.9rem;
}

.history-type-label {
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
}

.history-type-label.success {
  background: #d4edda;
  color: #155724;
}

.history-type-label.error {
  background: #f8d7da;
  color: #721c24;
}

.history-type-label.warning {
  background: #fff3cd;
  color: #856404;
}

.history-type-label.info {
  background: #d1ecf1;
  color: #0c5460;
}

.history-time {
  color: #666;
}

.history-persistent {
  background: #e2e3e5;
  color: #383d41;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
}

.history-actions {
  display: flex;
  align-items: center;
}

.dismiss-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  transition: transform 0.3s;
  opacity: 0.7;
}

.dismiss-btn:hover {
  transform: scale(1.1);
  opacity: 1;
}

.dismiss-btn.dismissed {
  opacity: 0.5;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

@media (max-width: 768px) {
  .special-demos {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .history-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
