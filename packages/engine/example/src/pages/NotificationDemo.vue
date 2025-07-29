<template>
  <div class="notification-demo">
    <div class="demo-header">
      <h1>🔔 通知系统演示</h1>
      <p>展示各种类型的通知和自定义配置</p>
    </div>

    <div class="demo-grid">
      <!-- 基础通知 -->
      <div class="demo-card">
        <h3>📢 基础通知</h3>
        <div class="notification-types">
          <button 
            v-for="type in notificationTypes" 
            :key="type.name"
            @click="showBasicNotification(type.name)"
            class="btn"
            :class="`btn-${type.name}`"
          >
            <span class="btn-icon">{{ type.icon }}</span>
            <span class="btn-text">{{ type.label }}</span>
          </button>
        </div>
        <div class="quick-actions">
          <button @click="showRandomNotification" class="btn btn-secondary">
            随机通知
          </button>
          <button @click="showMultipleNotifications" class="btn btn-info">
            批量通知
          </button>
        </div>
      </div>

      <!-- 自定义通知 -->
      <div class="demo-card">
        <h3>🎨 自定义通知</h3>
        <div class="form-group">
          <label>通知类型:</label>
          <select v-model="customNotification.type" class="form-select">
            <option value="info">信息</option>
            <option value="success">成功</option>
            <option value="warning">警告</option>
            <option value="error">错误</option>
          </select>
        </div>
        <div class="form-group">
          <label>标题:</label>
          <input 
            v-model="customNotification.title" 
            type="text" 
            placeholder="通知标题"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>消息内容:</label>
          <textarea 
            v-model="customNotification.message" 
            class="form-textarea"
            placeholder="通知消息内容"
            rows="3"
          ></textarea>
        </div>
        <div class="form-group">
          <label>显示时长 (毫秒):</label>
          <input 
            v-model.number="customNotification.duration" 
            type="number" 
            min="1000" 
            max="30000"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="customNotification.persistent" type="checkbox">
            持久显示 (需要手动关闭)
          </label>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="customNotification.closable" type="checkbox">
            显示关闭按钮
          </label>
        </div>
        <button @click="showCustomNotification" class="btn btn-primary">
          显示自定义通知
        </button>
      </div>

      <!-- 通知配置 -->
      <div class="demo-card">
        <h3>⚙️ 全局配置</h3>
        <div class="form-group">
          <label>最大通知数量:</label>
          <input 
            v-model.number="globalConfig.maxNotifications" 
            type="number" 
            min="1" 
            max="20"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>默认显示时长 (毫秒):</label>
          <input 
            v-model.number="globalConfig.defaultDuration" 
            type="number" 
            min="1000" 
            max="30000"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>通知位置:</label>
          <select v-model="globalConfig.position" class="form-select">
            <option value="top-right">右上角</option>
            <option value="top-left">左上角</option>
            <option value="bottom-right">右下角</option>
            <option value="bottom-left">左下角</option>
            <option value="top-center">顶部居中</option>
            <option value="bottom-center">底部居中</option>
          </select>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="globalConfig.enableSound" type="checkbox">
            启用声音提示
          </label>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="globalConfig.enableAnimation" type="checkbox">
            启用动画效果
          </label>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input v-model="globalConfig.pauseOnHover" type="checkbox">
            鼠标悬停时暂停
          </label>
        </div>
        <button @click="applyGlobalConfig" class="btn btn-success">
          应用配置
        </button>
      </div>

      <!-- 通知模板 -->
      <div class="demo-card">
        <h3>📋 通知模板</h3>
        <div class="template-list">
          <div 
            v-for="template in notificationTemplates" 
            :key="template.id"
            class="template-item"
          >
            <div class="template-info">
              <div class="template-title">{{ template.name }}</div>
              <div class="template-description">{{ template.description }}</div>
            </div>
            <button 
              @click="showTemplateNotification(template)"
              class="btn btn-sm btn-primary"
            >
              使用模板
            </button>
          </div>
        </div>
        <div class="template-actions">
          <button @click="showCreateTemplateDialog" class="btn btn-secondary">
            创建模板
          </button>
          <button @click="exportTemplates" class="btn btn-info">
            导出模板
          </button>
        </div>
      </div>

      <!-- 通知历史 -->
      <div class="demo-card">
        <h3>📊 通知统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ notificationStats.total }}</div>
            <div class="stat-label">总通知数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ notificationStats.active }}</div>
            <div class="stat-label">当前显示</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ notificationStats.dismissed }}</div>
            <div class="stat-label">已关闭</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ notificationStats.avgDuration }}ms</div>
            <div class="stat-label">平均显示时长</div>
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-title">通知类型分布</div>
          <div class="chart-bars">
            <div 
              v-for="(count, type) in notificationStats.byType" 
              :key="type"
              class="chart-bar"
              :class="`type-${type}`"
              :style="{ height: getBarHeight(count) + '%' }"
              :title="`${type}: ${count} 条`"
            >
              <span class="bar-label">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 通知管理 -->
      <div class="demo-card">
        <h3>🗂️ 通知管理</h3>
        <div class="management-actions">
          <button @click="clearAllNotifications" class="btn btn-danger">
            清空所有通知
          </button>
          <button @click="clearByType" class="btn btn-warning">
            按类型清空
          </button>
          <button @click="pauseAllNotifications" class="btn btn-secondary">
            {{ allPaused ? '恢复' : '暂停' }}所有通知
          </button>
        </div>
        <div class="form-group">
          <label>清空类型:</label>
          <select v-model="clearType" class="form-select">
            <option value="info">信息</option>
            <option value="success">成功</option>
            <option value="warning">警告</option>
            <option value="error">错误</option>
          </select>
        </div>
        <div class="notification-queue">
          <h4>当前通知队列</h4>
          <div class="queue-list">
            <div 
              v-for="(notification, index) in activeNotifications" 
              :key="index"
              class="queue-item"
              :class="`type-${notification.type}`"
            >
              <div class="queue-info">
                <span class="queue-type">{{ notification.type.toUpperCase() }}</span>
                <span class="queue-title">{{ notification.title }}</span>
                <span class="queue-time">{{ formatTime(notification.timestamp) }}</span>
              </div>
              <button 
                @click="dismissNotification(notification.id)"
                class="btn btn-sm btn-danger"
              >
                关闭
              </button>
            </div>
            <div v-if="activeNotifications.length === 0" class="empty-queue">
              当前没有活跃的通知
            </div>
          </div>
        </div>
      </div>

      <!-- 高级功能 -->
      <div class="demo-card full-width">
        <h3>🚀 高级功能演示</h3>
        <div class="advanced-grid">
          <div class="advanced-section">
            <h4>进度通知</h4>
            <button @click="showProgressNotification" class="btn btn-primary">
              显示进度通知
            </button>
            <div class="progress-controls" v-if="progressNotification">
              <label>进度: {{ progressValue }}%</label>
              <input 
                v-model.number="progressValue" 
                type="range" 
                min="0" 
                max="100"
                class="progress-slider"
                @input="updateProgress"
              >
            </div>
          </div>
          
          <div class="advanced-section">
            <h4>交互式通知</h4>
            <button @click="showInteractiveNotification" class="btn btn-success">
              显示交互式通知
            </button>
          </div>
          
          <div class="advanced-section">
            <h4>富文本通知</h4>
            <button @click="showRichNotification" class="btn btn-info">
              显示富文本通知
            </button>
          </div>
          
          <div class="advanced-section">
            <h4>分组通知</h4>
            <button @click="showGroupedNotifications" class="btn btn-warning">
              显示分组通知
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, reactive } from 'vue'
import type { Engine } from '@ldesign/engine'

const engine = inject<Engine>('engine')!

// 响应式数据
const customNotification = ref({
  type: 'info' as 'info' | 'success' | 'warning' | 'error',
  title: '自定义通知',
  message: '这是一条自定义通知消息',
  duration: 3000,
  persistent: false,
  closable: true
})

const globalConfig = ref({
  maxNotifications: 5,
  defaultDuration: 3000,
  position: 'top-right',
  enableSound: true,
  enableAnimation: true,
  pauseOnHover: true
})

const clearType = ref('info')
const allPaused = ref(false)
const progressValue = ref(0)
const progressNotification = ref<any>(null)

const notificationStats = reactive({
  total: 0,
  active: 0,
  dismissed: 0,
  avgDuration: 0,
  byType: {
    info: 0,
    success: 0,
    warning: 0,
    error: 0
  }
})

const activeNotifications = ref<Array<{
  id: string
  type: string
  title: string
  timestamp: number
}>>([])

// 常量数据
const notificationTypes = [
  { name: 'info', label: '信息', icon: 'ℹ️' },
  { name: 'success', label: '成功', icon: '✅' },
  { name: 'warning', label: '警告', icon: '⚠️' },
  { name: 'error', label: '错误', icon: '❌' }
]

const notificationTemplates = ref([
  {
    id: 'welcome',
    name: '欢迎消息',
    description: '用户登录时的欢迎通知',
    config: {
      type: 'success',
      title: '欢迎回来！',
      message: '您已成功登录系统',
      duration: 4000
    }
  },
  {
    id: 'save-success',
    name: '保存成功',
    description: '数据保存成功的通知',
    config: {
      type: 'success',
      title: '保存成功',
      message: '您的数据已成功保存',
      duration: 2000
    }
  },
  {
    id: 'network-error',
    name: '网络错误',
    description: '网络连接失败的错误通知',
    config: {
      type: 'error',
      title: '网络连接失败',
      message: '请检查您的网络连接并重试',
      duration: 5000
    }
  },
  {
    id: 'update-available',
    name: '更新提醒',
    description: '有新版本可用的提醒',
    config: {
      type: 'info',
      title: '发现新版本',
      message: '有新版本可用，是否立即更新？',
      persistent: true
    }
  }
])

// 计算属性
const maxCount = computed(() => {
  return Math.max(...Object.values(notificationStats.byType))
})

// 方法
const showBasicNotification = (type: string) => {
  const messages = {
    info: { title: '信息通知', message: '这是一条信息通知' },
    success: { title: '操作成功', message: '操作已成功完成' },
    warning: { title: '警告提示', message: '请注意这个警告信息' },
    error: { title: '错误提示', message: '发生了一个错误' }
  }
  
  const config = messages[type as keyof typeof messages]
  const notification = engine.notifications.show({
    type: type as any,
    title: config.title,
    message: config.message,
    duration: globalConfig.value.defaultDuration
  })
  
  updateStats(type, notification)
}

const showCustomNotification = () => {
  if (!customNotification.value.title.trim() || !customNotification.value.message.trim()) {
    engine.notifications.show({
      type: 'error',
      title: '输入错误',
      message: '请填写标题和消息内容'
    })
    return
  }
  
  const config: any = {
    type: customNotification.value.type,
    title: customNotification.value.title,
    message: customNotification.value.message,
    closable: customNotification.value.closable
  }
  
  if (!customNotification.value.persistent) {
    config.duration = customNotification.value.duration
  }
  
  const notification = engine.notifications.show(config)
  updateStats(customNotification.value.type, notification)
}

const showRandomNotification = () => {
  const types = ['info', 'success', 'warning', 'error']
  const randomType = types[Math.floor(Math.random() * types.length)]
  
  const randomMessages = [
    '这是一条随机生成的通知消息',
    '系统正在执行后台任务',
    '数据同步已完成',
    '检测到新的活动',
    '用户操作已记录',
    '缓存已更新',
    '定时任务执行完毕'
  ]
  
  const randomMessage = randomMessages[Math.floor(Math.random() * randomMessages.length)]
  
  const notification = engine.notifications.show({
    type: randomType as any,
    title: '随机通知',
    message: randomMessage,
    duration: Math.random() * 3000 + 2000
  })
  
  updateStats(randomType, notification)
}

const showMultipleNotifications = () => {
  const notifications = [
    { type: 'info', title: '开始处理', message: '正在初始化系统...' },
    { type: 'success', title: '连接成功', message: '数据库连接已建立' },
    { type: 'warning', title: '注意', message: '检测到高内存使用率' },
    { type: 'error', title: '错误', message: '某个服务暂时不可用' }
  ]
  
  notifications.forEach((config, index) => {
    setTimeout(() => {
      const notification = engine.notifications.show({
        type: config.type as any,
        title: config.title,
        message: config.message,
        duration: 4000
      })
      updateStats(config.type, notification)
    }, index * 500)
  })
}

const showTemplateNotification = (template: any) => {
  const notification = engine.notifications.show(template.config)
  updateStats(template.config.type, notification)
}

const showProgressNotification = () => {
  progressValue.value = 0
  progressNotification.value = engine.notifications.show({
    type: 'info',
    title: '处理中...',
    message: `进度: ${progressValue.value}%`,
    persistent: true,
    closable: false
  })
  
  // 模拟进度更新
  const interval = setInterval(() => {
    progressValue.value += 10
    updateProgress()
    
    if (progressValue.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        if (progressNotification.value) {
          engine.notifications.dismiss(progressNotification.value.id)
          progressNotification.value = null
        }
        engine.notifications.show({
          type: 'success',
          title: '完成',
          message: '处理已完成！',
          duration: 2000
        })
      }, 500)
    }
  }, 300)
}

const updateProgress = () => {
  if (progressNotification.value) {
    engine.notifications.update(progressNotification.value.id, {
      message: `进度: ${progressValue.value}%`
    })
  }
}

const showInteractiveNotification = () => {
  const notification = engine.notifications.show({
    type: 'info',
    title: '确认操作',
    message: '是否要删除这个项目？',
    persistent: true,
    actions: [
      {
        label: '确认',
        action: () => {
          engine.notifications.show({
            type: 'success',
            title: '已删除',
            message: '项目已成功删除'
          })
        }
      },
      {
        label: '取消',
        action: () => {
          engine.notifications.show({
            type: 'info',
            title: '已取消',
            message: '操作已取消'
          })
        }
      }
    ]
  })
  
  updateStats('info', notification)
}

const showRichNotification = () => {
  const notification = engine.notifications.show({
    type: 'info',
    title: '系统更新',
    message: `
      <div>
        <p><strong>版本 2.1.0 现已可用</strong></p>
        <ul>
          <li>✨ 新增暗色主题</li>
          <li>🚀 性能优化 30%</li>
          <li>🐛 修复已知问题</li>
        </ul>
        <p><em>建议立即更新以获得最佳体验</em></p>
      </div>
    `,
    duration: 8000,
    html: true
  })
  
  updateStats('info', notification)
}

const showGroupedNotifications = () => {
  const group = 'system-alerts'
  
  for (let i = 1; i <= 3; i++) {
    setTimeout(() => {
      const notification = engine.notifications.show({
        type: 'warning',
        title: `系统警告 ${i}`,
        message: `这是第 ${i} 个系统警告消息`,
        group: group,
        duration: 5000
      })
      updateStats('warning', notification)
    }, i * 200)
  }
}

const applyGlobalConfig = () => {
  // 这里应该调用引擎的配置方法
  // engine.notifications.configure(globalConfig.value)
  
  engine.notifications.show({
    type: 'success',
    title: '配置已更新',
    message: '全局通知配置已应用'
  })
}

const clearAllNotifications = () => {
  engine.notifications.clear()
  activeNotifications.value = []
  notificationStats.active = 0
  
  engine.notifications.show({
    type: 'info',
    title: '已清空',
    message: '所有通知已清空'
  })
}

const clearByType = () => {
  // engine.notifications.clearByType(clearType.value)
  
  engine.notifications.show({
    type: 'warning',
    title: '按类型清空',
    message: `${clearType.value.toUpperCase()} 类型的通知已清空`
  })
}

const pauseAllNotifications = () => {
  allPaused.value = !allPaused.value
  
  // engine.notifications.pauseAll(allPaused.value)
  
  engine.notifications.show({
    type: 'info',
    title: allPaused.value ? '已暂停' : '已恢复',
    message: `所有通知已${allPaused.value ? '暂停' : '恢复'}`
  })
}

const dismissNotification = (id: string) => {
  engine.notifications.dismiss(id)
  activeNotifications.value = activeNotifications.value.filter(n => n.id !== id)
  notificationStats.active--
  notificationStats.dismissed++
}

const showCreateTemplateDialog = () => {
  engine.notifications.show({
    type: 'info',
    title: '创建模板',
    message: '模板创建功能正在开发中...',
    duration: 2000
  })
}

const exportTemplates = () => {
  const data = {
    templates: notificationTemplates.value,
    exportTime: Date.now()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notification-templates-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  engine.notifications.show({
    type: 'success',
    title: '导出成功',
    message: '通知模板已导出到文件'
  })
}

const updateStats = (type: string, notification: any) => {
  notificationStats.total++
  notificationStats.active++
  notificationStats.byType[type as keyof typeof notificationStats.byType]++
  
  // 添加到活跃通知列表
  activeNotifications.value.push({
    id: notification.id || Date.now().toString(),
    type,
    title: notification.title || '通知',
    timestamp: Date.now()
  })
  
  // 计算平均显示时长
  const totalDuration = notificationStats.total * notificationStats.avgDuration + (notification.duration || globalConfig.value.defaultDuration)
  notificationStats.avgDuration = Math.round(totalDuration / notificationStats.total)
}

const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString()
}

const getBarHeight = (count: number) => {
  return maxCount.value > 0 ? (count / maxCount.value) * 100 : 0
}

onMounted(() => {
  engine.logger.info('通知系统演示页面已加载')
  
  // 显示欢迎通知
  setTimeout(() => {
    const notification = engine.notifications.show({
      type: 'success',
      title: '欢迎使用通知系统',
      message: '这里展示了各种通知功能和配置选项',
      duration: 4000
    })
    updateStats('success', notification)
  }, 500)
})
</script>

<style scoped>
.notification-demo {
  padding: 2rem;
  max-width: 1400px;
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
  font-size: 1.2rem;
  color: #7f8c8d;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.demo-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.demo-card.full-width {
  grid-column: 1 / -1;
}

.demo-card h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.3rem;
}

.notification-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.quick-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

.form-textarea {
  resize: vertical;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 1rem;
}

.btn-text {
  font-weight: 500;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.btn-error {
  background: #dc3545;
  color: white;
}

.btn-error:hover {
  background: #c82333;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
}

.template-list {
  margin-bottom: 1.5rem;
}

.template-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  transition: all 0.3s ease;
}

.template-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.template-info {
  flex: 1;
}

.template-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.template-description {
  font-size: 0.875rem;
  color: #7f8c8d;
}

.template-actions {
  display: flex;
  gap: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chart-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.chart-title {
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 500;
  color: #2c3e50;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 120px;
  gap: 1rem;
}

.chart-bar {
  flex: 1;
  min-height: 20px;
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  align-items: end;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.chart-bar:hover {
  opacity: 0.8;
}

.chart-bar.type-info {
  background: #17a2b8;
}

.chart-bar.type-success {
  background: #28a745;
}

.chart-bar.type-warning {
  background: #ffc107;
}

.chart-bar.type-error {
  background: #dc3545;
}

.bar-label {
  position: absolute;
  top: -20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: #2c3e50;
}

.management-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.notification-queue {
  margin-top: 1.5rem;
}

.notification-queue h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.queue-list {
  max-height: 300px;
  overflow-y: auto;
}

.queue-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.queue-item:hover {
  border-color: #3498db;
}

.queue-item.type-info {
  border-left: 4px solid #17a2b8;
}

.queue-item.type-success {
  border-left: 4px solid #28a745;
}

.queue-item.type-warning {
  border-left: 4px solid #ffc107;
}

.queue-item.type-error {
  border-left: 4px solid #dc3545;
}

.queue-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.queue-type {
  font-size: 0.75rem;
  font-weight: 600;
  color: #7f8c8d;
}

.queue-title {
  font-weight: 500;
  color: #2c3e50;
}

.queue-time {
  font-size: 0.75rem;
  color: #7f8c8d;
}

.empty-queue {
  text-align: center;
  color: #7f8c8d;
  padding: 2rem;
  font-style: italic;
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.advanced-section {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.advanced-section h4 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.progress-controls {
  margin-top: 1rem;
}

.progress-controls label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #495057;
}

.progress-slider {
  width: 100%;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .notification-types {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions,
  .template-actions,
  .management-actions {
    flex-direction: column;
  }
  
  .template-item,
  .queue-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .advanced-grid {
    grid-template-columns: 1fr;
  }
}
</style>