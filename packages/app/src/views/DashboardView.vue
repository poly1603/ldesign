<template>
  <div class="dashboard-view">
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="page-title">{{ t('dashboard.title') }}</h1>
        <p class="welcome-message">
          {{ t('dashboard.welcome', { username: user?.username || 'User' }) }}
        </p>
      </div>

      <div class="header-actions">
        <button class="btn btn-outline-primary" @click="toggleTheme">
          {{ isDarkMode ? '浅色模式' : '深色模式' }}
        </button>
        <button class="btn btn-outline-secondary" @click="logout">
          {{ t('nav.logout') }}
        </button>
      </div>
    </div>
    
    <div class="dashboard-content">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>总访问量</h3>
            <p class="stat-number">12,345</p>
            <span class="stat-change positive">+12%</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>活跃用户</h3>
            <p class="stat-number">1,234</p>
            <span class="stat-change positive">+8%</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>总收入</h3>
            <p class="stat-number">¥56,789</p>
            <span class="stat-change negative">-3%</span>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>转化率</h3>
            <p class="stat-number">3.45%</p>
            <span class="stat-change positive">+15%</span>
          </div>
        </div>
      </div>
      
      <!-- 功能区域 -->
      <div class="feature-grid">
        <div class="feature-card">
          <h3>🎨 模板展示</h3>
          <p>查看和切换不同的登录模板</p>
          <router-link to="/templates" class="btn btn-primary">
            查看模板
          </router-link>
        </div>
        
        <div class="feature-card">
          <h3>⚙️ 系统设置</h3>
          <p>配置应用的各种设置选项</p>
          <router-link to="/settings" class="btn btn-primary">
            打开设置
          </router-link>
        </div>
        
        <div class="feature-card">
          <h3>👤 个人资料</h3>
          <p>管理您的个人信息和偏好</p>
          <router-link to="/profile" class="btn btn-primary">
            编辑资料
          </router-link>
        </div>
        
        <div class="feature-card">
          <h3>📖 关于应用</h3>
          <p>了解LDesign应用的更多信息</p>
          <router-link to="/about" class="btn btn-primary">
            了解更多
          </router-link>
        </div>
      </div>
      
      <!-- 最近活动 -->
      <div class="recent-activity">
        <h3>{{ $t('dashboard.recentActivity') }}</h3>
        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon">🔐</div>
            <div class="activity-content">
              <p class="activity-title">用户登录</p>
              <p class="activity-time">2分钟前</p>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon">🎨</div>
            <div class="activity-content">
              <p class="activity-title">切换到现代模板</p>
              <p class="activity-time">5分钟前</p>
            </div>
          </div>
          
          <div class="activity-item">
            <div class="activity-icon">⚙️</div>
            <div class="activity-content">
              <p class="activity-title">更新系统设置</p>
              <p class="activity-time">10分钟前</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from '../composables/useRouter'
import { useI18n } from '../composables/useI18n'
import { useAuthState } from '../stores/auth'
import { useGlobalState } from '../stores/global'
import { useEngine } from '../composables/useEngine'

const router = useRouter()
const authStore = useAuthState()
const globalStore = useGlobalState()
const engine = useEngine()
const { t } = useI18n()

// 计算属性
const user = computed(() => authStore.user)
const isDarkMode = computed(() => globalStore.isDarkMode)

// 切换主题
const toggleTheme = () => {
  const newMode = isDarkMode.value ? 'light' : 'dark'
  globalStore.setThemeMode(newMode)
  
  engine.notifications.show({
    type: 'info',
    title: '主题已切换',
    message: `已切换到${newMode === 'dark' ? '深色' : '浅色'}模式`
  })
}

// 退出登录
const logout = async () => {
  try {
    await authStore.logout()
    
    engine.notifications.show({
      type: 'success',
      title: '退出成功',
      message: '您已安全退出登录'
    })
    
    router.push('/login')
  } catch (error) {
    engine.notifications.show({
      type: 'error',
      title: '退出失败',
      message: '退出登录时发生错误'
    })
  }
}
</script>

<style lang="less" scoped>
.dashboard-view {
  min-height: 100vh;
  background: @bg-secondary;
  
  .dashboard-header {
    background: white;
    padding: 24px 32px;
    border-bottom: 1px solid @border-color;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .header-content {
      .page-title {
        font-size: @font-size-3xl;
        font-weight: @font-weight-bold;
        color: @text-primary;
        margin: 0 0 8px 0;
      }
      
      .welcome-message {
        font-size: @font-size-base;
        color: @text-secondary;
        margin: 0;
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .dashboard-content {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
    
    .stat-card {
      background: white;
      border-radius: @border-radius-lg;
      padding: 24px;
      box-shadow: @shadow-sm;
      border: 1px solid @border-color;
      display: flex;
      align-items: center;
      gap: 16px;
      
      .stat-icon {
        font-size: 32px;
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: @bg-secondary;
        border-radius: @border-radius;
      }
      
      .stat-content {
        flex: 1;
        
        h3 {
          font-size: @font-size-sm;
          font-weight: @font-weight-medium;
          color: @text-secondary;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .stat-number {
          font-size: @font-size-2xl;
          font-weight: @font-weight-bold;
          color: @text-primary;
          margin: 0 0 4px 0;
        }
        
        .stat-change {
          font-size: @font-size-sm;
          font-weight: @font-weight-medium;
          
          &.positive {
            color: @success-color;
          }
          
          &.negative {
            color: @danger-color;
          }
        }
      }
    }
  }
  
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
    
    .feature-card {
      background: white;
      border-radius: @border-radius-lg;
      padding: 24px;
      box-shadow: @shadow-sm;
      border: 1px solid @border-color;
      text-align: center;
      
      h3 {
        font-size: @font-size-lg;
        font-weight: @font-weight-semibold;
        color: @text-primary;
        margin: 0 0 12px 0;
      }
      
      p {
        font-size: @font-size-base;
        color: @text-secondary;
        margin: 0 0 20px 0;
        line-height: @line-height-base;
      }
      
      .btn {
        width: 100%;
      }
    }
  }
  
  .recent-activity {
    background: white;
    border-radius: @border-radius-lg;
    padding: 24px;
    box-shadow: @shadow-sm;
    border: 1px solid @border-color;
    
    h3 {
      font-size: @font-size-lg;
      font-weight: @font-weight-semibold;
      color: @text-primary;
      margin: 0 0 20px 0;
    }
    
    .activity-list {
      .activity-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 12px 0;
        border-bottom: 1px solid @border-light;
        
        &:last-child {
          border-bottom: none;
        }
        
        .activity-icon {
          font-size: 24px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: @bg-secondary;
          border-radius: @border-radius;
        }
        
        .activity-content {
          flex: 1;
          
          .activity-title {
            font-size: @font-size-base;
            font-weight: @font-weight-medium;
            color: @text-primary;
            margin: 0 0 4px 0;
          }
          
          .activity-time {
            font-size: @font-size-sm;
            color: @text-muted;
            margin: 0;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: @screen-md) {
  .dashboard-view {
    .dashboard-header {
      padding: 16px 20px;
      flex-direction: column;
      gap: 16px;
      text-align: center;
      
      .header-actions {
        justify-content: center;
      }
    }
    
    .dashboard-content {
      padding: 20px;
    }
    
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .feature-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
