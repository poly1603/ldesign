<script setup lang="ts">
import { RouterLink } from '@ldesign/router'
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 响应式数据
const screenWidth = ref(window.innerWidth)
const screenHeight = ref(window.innerHeight)
const deviceLogs = ref<Array<{ time: string, event: string, detail: string }>>([])

// 设备类型检测
const isMobile = computed(() => screenWidth.value < 768)
const isTablet = computed(() => screenWidth.value >= 768 && screenWidth.value < 1024)

const deviceType = computed(() => {
  if (isMobile.value)
    return 'mobile'
  if (isTablet.value)
    return 'tablet'
  return 'desktop'
})

const deviceTypeText = computed(() => {
  if (isMobile.value)
    return '移动设备'
  if (isTablet.value)
    return '平板设备'
  return '桌面设备'
})

const deviceIcon = computed(() => {
  if (isMobile.value)
    return '📱'
  if (isTablet.value)
    return '📟'
  return '🖥️'
})

// 屏幕分类
const screenCategory = computed(() => {
  if (screenWidth.value < 480)
    return 'XS - 超小屏'
  if (screenWidth.value < 768)
    return 'SM - 小屏'
  if (screenWidth.value < 1024)
    return 'MD - 中屏'
  if (screenWidth.value < 1440)
    return 'LG - 大屏'
  return 'XL - 超大屏'
})

// 设备方向
const orientation = computed(() => screenWidth.value > screenHeight.value ? 'landscape' : 'portrait')
const orientationText = computed(() => orientation.value === 'landscape' ? '横屏' : '竖屏')
const orientationIcon = computed(() => orientation.value === 'landscape' ? '📐' : '📏')

// 触摸支持检测
const touchSupported = computed(() => 'ontouchstart' in window || navigator.maxTouchPoints > 0)

// 导航数据
const mobileNavItems = [
  { name: '首页', icon: '🏠' },
  { name: '搜索', icon: '🔍' },
  { name: '收藏', icon: '❤️' },
  { name: '我的', icon: '👤' },
]

const tabletMenuItems = ['仪表板', '项目管理', '团队协作', '文档中心', '设置']
const desktopTools = ['新建', '编辑', '删除', '导入', '导出', '分享', '设置']

// 添加设备变化日志
function addDeviceLog(event: string, detail: string) {
  const now = new Date()
  const time = now.toLocaleTimeString()
  deviceLogs.value.unshift({ time, event, detail })

  // 只保留最近10条记录
  if (deviceLogs.value.length > 10) {
    deviceLogs.value = deviceLogs.value.slice(0, 10)
  }
}

// 窗口大小变化监听
function handleResize() {
  const oldWidth = screenWidth.value
  const oldHeight = screenHeight.value
  const oldType = deviceType.value

  screenWidth.value = window.innerWidth
  screenHeight.value = window.innerHeight

  const newType = deviceType.value

  if (oldType !== newType) {
    addDeviceLog('设备类型变化', `${oldType} → ${newType}`)
  }

  if (Math.abs(oldWidth - screenWidth.value) > 50 || Math.abs(oldHeight - screenHeight.value) > 50) {
    addDeviceLog('屏幕尺寸变化', `${oldWidth}×${oldHeight} → ${screenWidth.value}×${screenHeight.value}`)
  }
}

// 方向变化监听
function handleOrientationChange() {
  setTimeout(() => {
    addDeviceLog('设备方向变化', `${orientationText.value} (${screenWidth.value}×${screenHeight.value})`)
  }, 100)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleOrientationChange)

  // 初始日志
  addDeviceLog('页面加载', `${deviceTypeText.value} - ${screenWidth.value}×${screenHeight.value}`)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('orientationchange', handleOrientationChange)
})
</script>

<template>
  <div class="device-demo">
    <h2>📱 设备适配演示</h2>
    <p>这个页面演示了设备检测、响应式设计和设备适配路由的功能。</p>

    <!-- 当前设备信息 -->
    <div class="device-info">
      <h3>🔍 当前设备信息</h3>
      <div class="info-grid">
        <div class="info-card">
          <h4>设备类型</h4>
          <div class="device-type" :class="deviceType">
            <span class="icon">{{ deviceIcon }}</span>
            <span class="text">{{ deviceTypeText }}</span>
          </div>
        </div>

        <div class="info-card">
          <h4>屏幕尺寸</h4>
          <div class="screen-size">
            <span>{{ screenWidth }} × {{ screenHeight }}</span>
            <small>{{ screenCategory }}</small>
          </div>
        </div>

        <div class="info-card">
          <h4>方向</h4>
          <div class="orientation" :class="orientation">
            <span class="icon">{{ orientationIcon }}</span>
            <span class="text">{{ orientationText }}</span>
          </div>
        </div>

        <div class="info-card">
          <h4>触摸支持</h4>
          <div class="touch-support" :class="{ supported: touchSupported }">
            <span class="icon">{{ touchSupported ? '✅' : '❌' }}</span>
            <span class="text">{{ touchSupported ? '支持' : '不支持' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 响应式布局演示 -->
    <div class="responsive-demo">
      <h3>📐 响应式布局演示</h3>
      <p>调整浏览器窗口大小或旋转设备来查看布局变化：</p>

      <div class="layout-container">
        <div v-for="i in 6" :key="i" class="layout-item">
          <div class="item-content">
            <h4>卡片 {{ i }}</h4>
            <p>这是一个响应式卡片，会根据屏幕大小自动调整布局。</p>
            <button class="demo-button">
              操作按钮
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备特定组件演示 -->
    <div class="device-components">
      <h3>🎨 设备特定组件</h3>
      <p>根据不同设备类型显示不同的组件和交互方式：</p>

      <!-- 移动端组件 -->
      <div v-if="isMobile" class="mobile-component">
        <h4>📱 移动端专用组件</h4>
        <div class="mobile-nav">
          <button v-for="item in mobileNavItems" :key="item.name" class="nav-item">
            <span class="nav-icon">{{ item.icon }}</span>
            <span class="nav-text">{{ item.name }}</span>
          </button>
        </div>
        <div class="mobile-actions">
          <button class="action-btn primary">
            主要操作
          </button>
          <button class="action-btn secondary">
            次要操作
          </button>
        </div>
      </div>

      <!-- 平板端组件 -->
      <div v-else-if="isTablet" class="tablet-component">
        <h4>📟 平板端适配组件</h4>
        <div class="tablet-layout">
          <div class="sidebar">
            <h5>侧边栏</h5>
            <ul class="sidebar-menu">
              <li v-for="item in tabletMenuItems" :key="item">
                {{ item }}
              </li>
            </ul>
          </div>
          <div class="main-content">
            <h5>主要内容区域</h5>
            <p>平板端可以显示更多内容，采用侧边栏+主内容的布局。</p>
          </div>
        </div>
      </div>

      <!-- 桌面端组件 -->
      <div v-else class="desktop-component">
        <h4>🖥️ 桌面端完整组件</h4>
        <div class="desktop-layout">
          <div class="toolbar">
            <button v-for="tool in desktopTools" :key="tool" class="tool-btn">
              {{ tool }}
            </button>
          </div>
          <div class="content-area">
            <div class="left-panel">
              <h5>左侧面板</h5>
              <p>桌面端可以显示复杂的多面板布局。</p>
            </div>
            <div class="center-panel">
              <h5>中央内容</h5>
              <p>主要工作区域，支持更复杂的交互。</p>
            </div>
            <div class="right-panel">
              <h5>右侧面板</h5>
              <p>辅助信息和工具面板。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 设备适配路由演示 -->
    <div class="adaptive-routing">
      <h3>🔄 设备适配路由</h3>
      <p>根据设备类型显示不同的路由选项：</p>

      <div class="route-options">
        <div v-if="isMobile" class="mobile-routes">
          <h4>移动端路由</h4>
          <div class="route-list">
            <RouterLink to="/mobile-home" class="route-link mobile">
              📱 移动端首页
            </RouterLink>
            <RouterLink to="/mobile-profile" class="route-link mobile">
              👤 个人中心
            </RouterLink>
            <RouterLink to="/mobile-settings" class="route-link mobile">
              ⚙️ 设置
            </RouterLink>
          </div>
        </div>

        <div v-else-if="isTablet" class="tablet-routes">
          <h4>平板端路由</h4>
          <div class="route-list">
            <RouterLink to="/tablet-dashboard" class="route-link tablet">
              📊 仪表板
            </RouterLink>
            <RouterLink to="/tablet-workspace" class="route-link tablet">
              💼 工作区
            </RouterLink>
            <RouterLink to="/tablet-library" class="route-link tablet">
              📚 资源库
            </RouterLink>
          </div>
        </div>

        <div v-else class="desktop-routes">
          <h4>桌面端路由</h4>
          <div class="route-list">
            <RouterLink to="/desktop-admin" class="route-link desktop">
              🔧 管理后台
            </RouterLink>
            <RouterLink to="/desktop-analytics" class="route-link desktop">
              📈 数据分析
            </RouterLink>
            <RouterLink to="/desktop-tools" class="route-link desktop">
              🛠️ 开发工具
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- 实时监听演示 -->
    <div class="live-monitoring">
      <h3>📡 实时设备监听</h3>
      <p>实时监听设备变化（调整窗口大小或旋转设备）：</p>

      <div class="monitoring-log">
        <div class="log-header">
          <span>时间</span>
          <span>事件</span>
          <span>详情</span>
        </div>
        <div class="log-entries">
          <div v-for="(log, index) in deviceLogs" :key="index" class="log-entry">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-event">{{ log.event }}</span>
            <span class="log-detail">{{ log.detail }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.device-info {
  margin: 30px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.info-card {
  background: white;
  padding: 15px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.info-card h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
}

.device-type, .orientation {
  display: flex;
  align-items: center;
  gap: 8px;
}

.device-type.mobile { color: #e83e8c; }
.device-type.tablet { color: #fd7e14; }
.device-type.desktop { color: #20c997; }

.screen-size {
  font-weight: bold;
  color: #007bff;
}

.screen-size small {
  display: block;
  font-weight: normal;
  color: #6c757d;
  margin-top: 4px;
}

.orientation.landscape { color: #28a745; }
.orientation.portrait { color: #17a2b8; }

.touch-support.supported { color: #28a745; }
.touch-support:not(.supported) { color: #dc3545; }

.responsive-demo {
  margin: 30px 0;
}

.layout-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.layout-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.layout-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.item-content {
  padding: 20px;
}

.item-content h4 {
  margin: 0 0 10px 0;
  color: #495057;
}

.item-content p {
  margin: 0 0 15px 0;
  color: #6c757d;
  line-height: 1.5;
}

.demo-button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.demo-button:hover {
  background: #0056b3;
}

.device-components {
  margin: 30px 0;
}

.mobile-component, .tablet-component, .desktop-component {
  background: #e3f2fd;
  padding: 20px;
  border-radius: 8px;
  margin-top: 15px;
}

.mobile-nav {
  display: flex;
  justify-content: space-around;
  background: white;
  padding: 10px;
  border-radius: 25px;
  margin: 15px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.2s;
}

.nav-item:hover {
  background: #f8f9fa;
}

.nav-icon {
  font-size: 20px;
}

.nav-text {
  font-size: 12px;
  color: #6c757d;
}

.mobile-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.action-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn.primary {
  background: #007bff;
  color: white;
}

.action-btn.primary:hover {
  background: #0056b3;
}

.action-btn.secondary {
  background: #6c757d;
  color: white;
}

.action-btn.secondary:hover {
  background: #545b62;
}

.tablet-layout {
  display: flex;
  gap: 20px;
  margin-top: 15px;
}

.sidebar {
  width: 200px;
  background: white;
  padding: 15px;
  border-radius: 6px;
}

.sidebar h5 {
  margin: 0 0 10px 0;
  color: #495057;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-menu li {
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
  cursor: pointer;
  transition: color 0.2s;
}

.sidebar-menu li:hover {
  color: #007bff;
}

.main-content {
  flex: 1;
  background: white;
  padding: 15px;
  border-radius: 6px;
}

.main-content h5 {
  margin: 0 0 10px 0;
  color: #495057;
}

.desktop-layout {
  margin-top: 15px;
}

.toolbar {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 6px 6px 0 0;
  border-bottom: 1px solid #dee2e6;
}

.tool-btn {
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.content-area {
  display: flex;
  background: white;
  border-radius: 0 0 6px 6px;
  min-height: 200px;
}

.left-panel, .center-panel, .right-panel {
  padding: 15px;
  border-right: 1px solid #f1f3f4;
}

.left-panel {
  width: 200px;
}

.center-panel {
  flex: 1;
}

.right-panel {
  width: 200px;
  border-right: none;
}

.left-panel h5, .center-panel h5, .right-panel h5 {
  margin: 0 0 10px 0;
  color: #495057;
}

.adaptive-routing {
  margin: 30px 0;
}

.route-options {
  margin-top: 20px;
}

.route-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.route-link {
  display: inline-block;
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
}

.route-link.mobile {
  background: #e83e8c;
  color: white;
}

.route-link.mobile:hover {
  background: #d91a72;
}

.route-link.tablet {
  background: #fd7e14;
  color: white;
}

.route-link.tablet:hover {
  background: #e8690b;
}

.route-link.desktop {
  background: #20c997;
  color: white;
}

.route-link.desktop:hover {
  background: #1aa179;
}

.live-monitoring {
  margin: 30px 0;
}

.monitoring-log {
  background: #f8f9fa;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 15px;
}

.log-header {
  display: grid;
  grid-template-columns: 100px 120px 1fr;
  gap: 15px;
  padding: 10px 15px;
  background: #495057;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.log-entries {
  max-height: 200px;
  overflow-y: auto;
}

.log-entry {
  display: grid;
  grid-template-columns: 100px 120px 1fr;
  gap: 15px;
  padding: 8px 15px;
  border-bottom: 1px solid #e9ecef;
  font-size: 14px;
}

.log-entry:nth-child(even) {
  background: #ffffff;
}

.log-time {
  color: #6c757d;
  font-family: monospace;
}

.log-event {
  color: #007bff;
  font-weight: 500;
}

.log-detail {
  color: #495057;
}

/* 响应式样式 */
@media (max-width: 767px) {
  .device-demo {
    padding: 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .layout-container {
    grid-template-columns: 1fr;
  }

  .tablet-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .content-area {
    flex-direction: column;
  }

  .left-panel, .center-panel, .right-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #f1f3f4;
  }

  .right-panel {
    border-bottom: none;
  }

  .toolbar {
    flex-wrap: wrap;
  }

  .log-header, .log-entry {
    grid-template-columns: 80px 100px 1fr;
    gap: 10px;
  }

  .route-list {
    flex-direction: column;
  }

  .route-link {
    text-align: center;
  }
}

@media (max-width: 480px) {
  .mobile-nav {
    padding: 8px;
  }

  .nav-item {
    padding: 6px 8px;
  }

  .nav-icon {
    font-size: 18px;
  }

  .nav-text {
    font-size: 11px;
  }

  .mobile-actions {
    flex-direction: column;
  }
}
</style>
