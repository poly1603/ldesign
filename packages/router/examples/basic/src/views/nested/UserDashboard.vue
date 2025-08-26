<script setup lang="ts">
import { reactive } from 'vue'

const stats = reactive({
  pageViews: 1234,
  timeSpent: 45.6,
  posts: 23,
  followers: 567,
})

const recentActivities = reactive([
  {
    id: 1,
    icon: '📝',
    text: '发布了新的文章',
    time: '2小时前',
  },
  {
    id: 2,
    icon: '👍',
    text: '点赞了一篇文章',
    time: '4小时前',
  },
  {
    id: 3,
    icon: '💬',
    text: '回复了评论',
    time: '6小时前',
  },
  {
    id: 4,
    icon: '🔄',
    text: '更新了个人资料',
    time: '1天前',
  },
])
</script>

<template>
  <div class="user-dashboard">
    <h3>📊 用户仪表板</h3>
    <p>查看您的活动统计和数据概览。</p>

    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-icon">
          👁️
        </div>
        <div class="stat-info">
          <div class="stat-value">
            {{ stats.pageViews }}
          </div>
          <div class="stat-label">
            页面浏览量
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          ⏰
        </div>
        <div class="stat-info">
          <div class="stat-value">
            {{ stats.timeSpent }}h
          </div>
          <div class="stat-label">
            在线时长
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          📝
        </div>
        <div class="stat-info">
          <div class="stat-value">
            {{ stats.posts }}
          </div>
          <div class="stat-label">
            发布内容
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">
          👥
        </div>
        <div class="stat-info">
          <div class="stat-value">
            {{ stats.followers }}
          </div>
          <div class="stat-label">
            关注者
          </div>
        </div>
      </div>
    </div>

    <div class="recent-activity">
      <h4>最近活动</h4>
      <div class="activity-list">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon">
            {{ activity.icon }}
          </div>
          <div class="activity-content">
            <div class="activity-text">
              {{ activity.text }}
            </div>
            <div class="activity-time">
              {{ activity.time }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-dashboard h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.recent-activity {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recent-activity h4 {
  margin: 0 0 1rem 0;
  color: #1f2937;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 0.375rem;
}

.activity-icon {
  font-size: 1.25rem;
}

.activity-content {
  flex: 1;
}

.activity-text {
  color: #374151;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: #6b7280;
}
</style>
