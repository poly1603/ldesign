<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'

interface Props {
  title?: string
}

defineProps<Props>()

const stats = reactive([
  {
    label: '总访问量',
    value: '12,345',
    change: '+12.5%',
    trend: 'positive',
    icon: '👥',
    color: '#667eea',
  },
  {
    label: '新用户',
    value: '1,234',
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
    value: '¥45,678',
    change: '+15.3%',
    trend: 'positive',
    icon: '💰',
    color: '#9f7aea',
  },
])

const chartData = ref([65, 45, 78, 52, 89, 67, 43, 76, 58, 91, 34, 67])

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
  console.log('刷新仪表板数据')
  // 模拟数据刷新
  stats.forEach((stat) => {
    const randomChange = Math.random() * 20 - 10
    stat.change = `${randomChange > 0 ? '+' : ''}${randomChange.toFixed(1)}%`
    stat.trend = randomChange > 0 ? 'positive' : 'negative'
  })
}

function openSettings() {
  console.log('打开设置')
  alert('打开设置面板')
}

onMounted(() => {
  console.log('桌面端仪表板已加载')
})
</script>

<template>
  <div class="dashboard-desktop">
    <!-- 选择器插槽 - 显示在头部右侧 -->
    <div v-if="$slots.selector" class="dashboard-selector">
      <slot name="selector" />
    </div>

    <div class="dashboard-header">
      <h1>{{ title || '仪表板' }}</h1>
      <div class="header-actions">
        <button class="refresh-btn" @click="refresh">
          刷新
        </button>
        <button class="settings-btn" @click="openSettings">
          设置
        </button>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- 统计卡片 -->
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

      <!-- 图表区域 -->
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

      <!-- 数据表格 -->
      <div class="table-section">
        <div class="table-card">
          <h3>最近活动</h3>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>用户</th>
                  <th>操作</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="activity in activities" :key="activity.id">
                  <td>{{ activity.time }}</td>
                  <td>{{ activity.user }}</td>
                  <td>{{ activity.action }}</td>
                  <td>
                    <span class="status" :class="activity.status">
                      {{ activity.statusText }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-desktop {
  padding: 2rem;
  background: #f7fafc;
  min-height: 100vh;
}

.dashboard-selector {
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0;
  color: #2d3748;
  font-size: 2rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn,
.settings-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-content h3 {
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
}

.stat-content p {
  margin: 0 0 0.25rem;
  color: #718096;
  font-size: 0.875rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.125rem 0.375rem;
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
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card,
.table-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.chart-card h3,
.table-card h3 {
  margin: 0 0 1rem;
  color: #2d3748;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 200px;
  padding: 1rem 0;
}

.bar {
  background: #667eea;
  width: 20px;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s;
}

.bar:hover {
  background: #5a67d8;
}

.pie-chart {
  width: 120px;
  height: 120px;
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
  gap: 0.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-color {
  width: 12px;
  height: 12px;
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

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status.success {
  background: #c6f6d5;
  color: #22543d;
}

.status.warning {
  background: #faf089;
  color: #744210;
}

.status.error {
  background: #fed7d7;
  color: #742a2a;
}
</style>
