<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { useRouter } from '@ldesign/router'
import { computed } from 'vue'
import { useAppStore } from '../stores/app'

const router = useRouter()
const appStore = useAppStore()
const { locale, changeLanguage } = useI18n()

// 当前语言
const currentLocale = computed(() => locale.value)

// 计算属性
const stats = computed(() => appStore.performanceStats)

// 切换语言
async function toggleLanguage() {
  const newLocale = locale.value === 'zh-CN' ? 'en' : 'zh-CN'
  console.log('🌍 开始切换语言到:', newLocale)

  try {
    await changeLanguage(newLocale)
    console.log('✅ 语言切换成功:', locale.value)
  }
  catch (error) {
    console.error('❌ 语言切换失败:', error)
  }
}

// 退出登录
function handleLogout() {
  appStore.logout()
  router.push('/login')
}

// 导航到 I18n 演示页面
function goToI18nDemo() {
  router.push('/i18n')
}
</script>

<template>
  <div class="home">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <h1>{{ $t('app.title') }}</h1>
        </div>
        <div class="navbar-actions">
          <span class="user-info">{{ $t('common.hello') }}，{{
            appStore.userInfo?.username || '用户'
          }}！</span>
          <button class="btn btn-secondary" @click="toggleLanguage">
            {{ currentLocale === 'zh-CN' ? 'EN' : '中文' }}
          </button>
          <button class="btn btn-outline" @click="handleLogout">
            {{ $t('common.logout') }}
          </button>
        </div>
      </div>
    </nav>

    <!-- 主要内容区域 -->
    <main class="main-content">
      <div class="container">
        <!-- 欢迎区域 -->
        <section class="welcome">
          <h1 class="welcome-title">
            <span class="gradient-text">{{ $t('home.welcome') }}</span>
          </h1>
          <p class="welcome-description">
            {{ $t('home.description') }}
          </p>
        </section>

        <!-- 仪表板卡片 -->
        <section class="dashboard">
          <div class="dashboard-grid">
            <div class="dashboard-card">
              <div class="card-icon">
                👤
              </div>
              <div class="card-content">
                <h3>{{ $t('home.cards.userInfo.title') }}</h3>
                <p>{{ $t('home.cards.userInfo.description') }}</p>
                <div class="card-stats">
                  <span>{{ $t('home.cards.userInfo.username') }}:
                    {{ appStore.userInfo?.username || 'admin' }}</span>
                </div>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="card-icon">
                📊
              </div>
              <div class="card-content">
                <h3>{{ $t('home.cards.systemStatus.title') }}</h3>
                <p>{{ $t('home.cards.systemStatus.description') }}</p>
                <div class="card-stats">
                  <span>{{ $t('home.cards.systemStatus.status') }}:
                    {{ $t('home.cards.systemStatus.running') }}</span>
                </div>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="card-icon">
                ⚡
              </div>
              <div class="card-content">
                <h3>{{ $t('home.cards.performance.title') }}</h3>
                <p>{{ $t('home.cards.performance.description') }}</p>
                <div class="card-stats">
                  <span>{{ $t('home.cards.performance.responseTime') }}:
                    {{ stats.averageDuration.toFixed(1) }}ms</span>
                </div>
              </div>
            </div>

            <div class="dashboard-card">
              <div class="card-icon">
                🔒
              </div>
              <div class="card-content">
                <h3>{{ $t('home.cards.security.title') }}</h3>
                <p>{{ $t('home.cards.security.description') }}</p>
                <div class="card-stats">
                  <span>{{ $t('home.cards.security.securityLevel') }}:
                    {{ $t('home.cards.security.high') }}</span>
                </div>
              </div>
            </div>

            <div class="dashboard-card clickable" @click="goToI18nDemo">
              <div class="card-icon">
                🌍
              </div>
              <div class="card-content">
                <h3>{{ $t('home.cards.i18nDemo.title') }}</h3>
                <p>{{ $t('home.cards.i18nDemo.description') }}</p>
                <div class="card-stats">
                  <span>{{ $t('home.cards.i18nDemo.features') }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style lang="less" scoped>
.home {
  min-height: 100vh;
  background: #f5f5f5;
}

// 导航栏
.navbar {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  .navbar-brand h1 {
    margin: 0;
    color: #667eea;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .navbar-actions {
    display: flex;
    align-items: center;
    gap: 1rem;

    .user-info {
      color: #666;
      font-size: 0.9rem;
    }
  }
}

// 主要内容
.main-content {
  padding: 2rem 0;

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
}

// 欢迎区域
.welcome {
  text-align: center;
  margin-bottom: 3rem;

  .welcome-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;

    .gradient-text {
      background: linear-gradient(45deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }

  .welcome-description {
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
  }
}

// 仪表板
.dashboard {
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;

    .dashboard-card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &.clickable {
        cursor: pointer;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }
      }
      border: 1px solid #e5e7eb;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }

      .card-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
      }

      .card-content {
        h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }

        p {
          color: #6b7280;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .card-stats {
          font-size: 0.875rem;
          color: #667eea;
          font-weight: 500;
        }
      }
    }
  }
}

// 按钮样式
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;

  &.btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    margin-right: 0.5rem;

    &:hover {
      background: #e5e7eb;
      color: #1f2937;
    }
  }

  &.btn-outline {
    background: transparent;
    border: 1px solid #667eea;
    color: #667eea;

    &:hover {
      background: #667eea;
      color: white;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .navbar .container {
    flex-direction: column;
    gap: 1rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr !important;
  }

  .welcome-title {
    font-size: 2rem !important;
  }
}
</style>
