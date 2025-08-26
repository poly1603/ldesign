<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

interface Props {
  title?: string
}

defineProps<Props>()

const stats = reactive([
  {
    label: '访问量',
    value: '12.3K',
    change: '+12.5%',
    trend: 'positive',
    icon: '👥',
    color: '#667eea',
  },
  {
    label: '新用户',
    value: '1.2K',
    change: '+8.2%',
    trend: 'positive',
    icon: '🆕',
    color: '#48bb78',
  },
  {
    label: '转化率',
    value: '3.45%',
    change: '-2.1%',
    trend: 'negative',
    icon: '📈',
    color: '#ed8936',
  },
  {
    label: '收入',
    value: '¥45.7K',
    change: '+15.3%',
    trend: 'positive',
    icon: '💰',
    color: '#9f7aea',
  },
])

const chartData = ref([65, 45, 78, 52, 89, 67, 43, 76])

const activities = reactive([
  {
    id: 1,
    time: '10:30',
    user: '张三',
    action: '登录系统',
    status: 'success',
    statusText: '成功',
  },
  {
    id: 2,
    time: '10:25',
    user: '李四',
    action: '更新资料',
    status: 'success',
    statusText: '成功',
  },
  {
    id: 3,
    time: '10:20',
    user: '王五',
    action: '删除文件',
    status: 'warning',
    statusText: '警告',
  },
  {
    id: 4,
    time: '10:15',
    user: '赵六',
    action: '登录失败',
    status: 'error',
    statusText: '失败',
  },
])

function refresh() {
  console.log('刷新移动端仪表板数据')
  // 模拟数据刷新
  stats.forEach((stat) => {
    const randomChange = (Math.random() * 20 - 10).toFixed(1)
    stat.change = `${Number(randomChange) > 0 ? '+' : ''}${randomChange}%`
    stat.trend = Number(randomChange) > 0 ? 'positive' : 'negative'
  })
}

function openSettings() {
  console.log('打开移动端设置')
  alert('打开设置面板')
}

function viewMoreActivities() {
  console.log('查看更多活动')
  alert('查看更多活动')
}

onMounted(() => {
  console.log('移动端仪表板已加载')
})
</script>

<template>
  <div class="dashboard-mobile">
    <div class="dashboard-header">
      <h1>{{ title || '仪表板' }}</h1>
      <div class="header-actions">
        <button class="refresh-btn" @click="refresh">
          🔄
        </button>
        <button class="settings-btn" @click="openSettings">
          ⚙️
        </button>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 统计卡片 - 移动端2列布局 -->
      <div class="stats-grid">
        <div v-for="stat in stats" :key="stat.label" class="stat-card">
          <div class="stat-icon" :style="{ backgroundColor: stat.color }">
            <span>{{ stat.icon }}</span>
          </div>
          <div class="stat-content">
            <h3>{{ stat.value }}</h3>
            <p>{{ stat.label }}</p>
            <span class="stat-change" :class="stat.trend">
              {{ stat.change }}
            </span>
          </div>
        </div>
      </div>

      <!-- 图表区域 - 移动端垂直布局 -->
      <div class="charts-section">
        <div class="chart-card">
          <h3>访问趋势</h3>
          <div class="chart-placeholder">
            <div class="chart-bars">
              <div
                v-for="(height, index) in chartData" :key="index" class="bar"
                :style="{ height: `${height}%` }"
              />
            </div>
          </div>
        </div>

        <div class="chart-card">
          <h3>设备分布</h3>
          <div class="chart-placeholder">
            <div class="pie-chart">
              <div class="pie-segment desktop" title="桌面端 45%" />
              <div class="pie-segment mobile" title="移动端 35%" />
              <div class="pie-segment tablet" title="平板端 20%" />
            </div>
            <div class="pie-legend">
              <div class="legend-item">
                <span class="legend-color desktop" />
                <span>桌面端 45%</span>
              </div>
              <div class="legend-item">
                <span class="legend-color mobile" />
                <span>移动端 35%</span>
              </div>
              <div class="legend-item">
                <span class="legend-color tablet" />
                <span>平板端 20%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最近活动 - 移动端简化版 -->
      <div class="activity-section">
        <div class="activity-card">
          <h3>最近活动</h3>
          <div class="activity-list">
            <div v-for="activity in activities.slice(0, 3)" :key="activity.id" class="activity-item">
              <div class="activity-time">
                {{ activity.time }}
              </div>
              <div class="activity-content">
                <div class="activity-user">
                  {{ activity.user }}
                </div>
                <div class="activity-action">
                  {{ activity.action }}
                </div>
              </div>
              <div class="activity-status" :class="activity.status">
                {{ activity.statusText }}
              </div>
            </div>
          </div>
          <button class="view-more-btn" @click="viewMoreActivities">
            查看更多
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-mobile {
  padding: 1rem;
  background: #f7fafc;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.dashboard-header h1 {
  margin: 0;
  color: #2d3748;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.refresh-btn,
.settings-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-btn {
  background: #667eea;
  color: white;
}

.refresh-btn:hover {
  background: #5a67d8;
}

.settings-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.settings-btn:hover {
  background: #cbd5e0;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin: 0 auto 0.5rem;
}

.stat-content h3 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-content p {
  margin: 0 0 0.25rem;
  color: #718096;
  font-size: 0.75rem;
}

.stat-change {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.125rem 0.25rem;
  border-radius: 4px;
}

.stat-change.positive {
  background: #c6f6d5;
  color: #22543d;
}

.stat-change.negative {
  background: #fed7d7;
  color: #742a2a;
}

.charts-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chart-card,
.activity-card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.chart-card h3,
.activity-card h3 {
  margin: 0 0 1rem;
  color: #2d3748;
  font-size: 1rem;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 120px;
  padding: 0.5rem 0;
}

.bar {
  background: #667eea;
  flex: 1;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s;
}

.bar:hover {
  background: #5a67d8;
}

.pie-chart {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: conic-gradient(
    #667eea 0deg 162deg,
    #48bb78 162deg 288deg,
    #ed8936 288deg 360deg
  );
  margin: 0 auto 1rem;
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.legend-color {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-color.desktop {
  background: #667eea;
}

.legend-color.mobile {
  background: #48bb78;
}

.legend-color.tablet {
  background: #ed8936;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 8px;
}

.activity-time {
  font-size: 0.75rem;
  color: #718096;
  min-width: 40px;
}

.activity-content {
  flex: 1;
}

.activity-user {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
}

.activity-action {
  font-size: 0.75rem;
  color: #718096;
}

.activity-status {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
}

.activity-status.success {
  background: #c6f6d5;
  color: #22543d;
}

.activity-status.warning {
  background: #faf089;
  color: #744210;
}

.activity-status.error {
  background: #fed7d7;
  color: #742a2a;
}

.view-more-btn {
  width: 100%;
  padding: 0.75rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.view-more-btn:hover {
  background: #5a67d8;
}
</style>
