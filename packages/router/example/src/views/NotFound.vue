<script setup lang="ts">
import { RouterLink, useRoute, useRouter } from '@ldesign/router'
import { onMounted, ref } from 'vue'

const router = useRouter()
const route = useRoute()

const errorTime = ref('')
const referrer = ref('')

const suggestions = [
  {
    path: '/',
    icon: '🏠',
    title: '首页',
    description: '返回应用首页',
  },
  {
    path: '/basic',
    icon: '📝',
    title: '基础路由',
    description: '查看基础路由功能演示',
  },
  {
    path: '/nested',
    icon: '🏗️',
    title: '嵌套路由',
    description: '了解嵌套路由的使用',
  },
  {
    path: '/dynamic/123',
    icon: '🔄',
    title: '动态路由',
    description: '体验动态路由参数',
  },
  {
    path: '/plugins',
    icon: '🔌',
    title: '插件演示',
    description: '查看插件系统功能',
  },
  {
    path: '/lazy',
    icon: '⚡',
    title: '懒加载',
    description: '了解组件懒加载',
  },
]

function goHome() {
  router.push('/')
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  }
  else {
    router.push('/')
  }
}

function refresh() {
  window.location.reload()
}

onMounted(() => {
  errorTime.value = new Date().toLocaleString()
  referrer.value = document.referrer ? new URL(document.referrer).pathname : ''

  // 记录 404 错误
  console.warn(`404 Error: Page not found - ${route.path}`)
})
</script>

<template>
  <div class="not-found">
    <div class="not-found-container">
      <div class="error-illustration">
        <div class="error-code">
          404
        </div>
        <div class="error-icon">
          🔍
        </div>
      </div>

      <div class="error-content">
        <h1>页面未找到</h1>
        <p>抱歉，您访问的页面不存在或已被移动。</p>

        <div class="error-details">
          <div class="detail-item">
            <strong>请求路径:</strong> {{ route.path }}
          </div>
          <div class="detail-item">
            <strong>错误时间:</strong> {{ errorTime }}
          </div>
          <div class="detail-item">
            <strong>来源页面:</strong> {{ referrer || '直接访问' }}
          </div>
        </div>

        <div class="error-actions">
          <button class="btn btn-primary btn-lg" @click="goHome">
            返回首页
          </button>
          <button class="btn btn-secondary btn-lg" @click="goBack">
            返回上页
          </button>
          <button class="btn btn-info btn-lg" @click="refresh">
            刷新页面
          </button>
        </div>

        <div class="suggestions">
          <h3>您可能在寻找:</h3>
          <div class="suggestion-links">
            <RouterLink
              v-for="suggestion in suggestions"
              :key="suggestion.path"
              :to="suggestion.path"
              class="suggestion-link"
            >
              <span class="suggestion-icon">{{ suggestion.icon }}</span>
              <div class="suggestion-content">
                <div class="suggestion-title">
                  {{ suggestion.title }}
                </div>
                <div class="suggestion-desc">
                  {{ suggestion.description }}
                </div>
              </div>
            </RouterLink>
          </div>
        </div>

        <div class="help-section">
          <h3>需要帮助？</h3>
          <div class="help-options">
            <div class="help-item">
              <span class="help-icon">📧</span>
              <div class="help-content">
                <strong>联系支持</strong>
                <p>发送邮件至 support@ldesign.com</p>
              </div>
            </div>
            <div class="help-item">
              <span class="help-icon">📚</span>
              <div class="help-content">
                <strong>查看文档</strong>
                <p>访问我们的在线文档获取帮助</p>
              </div>
            </div>
            <div class="help-item">
              <span class="help-icon">🐛</span>
              <div class="help-content">
                <strong>报告问题</strong>
                <p>在 GitHub 上提交 issue</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, @gray-50 0%, @gray-100 100%);
  padding: @spacing-md;
}

.not-found-container {
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.error-illustration {
  position: relative;
  margin-bottom: @spacing-2xl;

  .error-code {
    font-size: 8rem;
    font-weight: 900;
    color: @primary-color;
    opacity: 0.1;
    line-height: 1;
  }

  .error-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    animation: float 3s ease-in-out infinite;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(-50%, -50%) translateY(0px);
  }
  50% {
    transform: translate(-50%, -50%) translateY(-10px);
  }
}

.error-content {
  h1 {
    color: @gray-800;
    margin-bottom: @spacing-md;
    font-size: @font-size-3xl;
  }

  > p {
    color: @gray-600;
    font-size: @font-size-lg;
    margin-bottom: @spacing-xl;
  }
}

.error-details {
  background: white;
  padding: @spacing-lg;
  border-radius: @border-radius-lg;
  box-shadow: @shadow-md;
  margin-bottom: @spacing-xl;
  text-align: left;

  .detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: @spacing-sm 0;
    border-bottom: 1px solid @gray-200;
    font-size: @font-size-sm;

    &:last-child {
      border-bottom: none;
    }

    strong {
      color: @gray-700;
    }
  }
}

.error-actions {
  display: flex;
  gap: @spacing-md;
  justify-content: center;
  margin-bottom: @spacing-2xl;
  flex-wrap: wrap;
}

.suggestions {
  background: white;
  padding: @spacing-lg;
  border-radius: @border-radius-lg;
  box-shadow: @shadow-md;
  margin-bottom: @spacing-xl;
  text-align: left;

  h3 {
    color: @gray-800;
    margin-bottom: @spacing-lg;
    text-align: center;
  }

  .suggestion-links {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: @spacing-md;
  }

  .suggestion-link {
    display: flex;
    align-items: center;
    gap: @spacing-md;
    padding: @spacing-md;
    background: @gray-50;
    border-radius: @border-radius-md;
    text-decoration: none;
    color: inherit;
    transition: all @transition-base;

    &:hover {
      background: @primary-color;
      color: white;
      transform: translateY(-2px);
      box-shadow: @shadow-md;
    }

    .suggestion-icon {
      font-size: @font-size-xl;
      flex-shrink: 0;
    }

    .suggestion-content {
      flex: 1;

      .suggestion-title {
        font-weight: 600;
        margin-bottom: @spacing-xs;
      }

      .suggestion-desc {
        font-size: @font-size-sm;
        opacity: 0.8;
      }
    }
  }
}

.help-section {
  background: white;
  padding: @spacing-lg;
  border-radius: @border-radius-lg;
  box-shadow: @shadow-md;
  text-align: left;

  h3 {
    color: @gray-800;
    margin-bottom: @spacing-lg;
    text-align: center;
  }

  .help-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: @spacing-lg;
  }

  .help-item {
    display: flex;
    align-items: flex-start;
    gap: @spacing-md;

    .help-icon {
      font-size: @font-size-xl;
      flex-shrink: 0;
    }

    .help-content {
      flex: 1;

      strong {
        display: block;
        color: @gray-800;
        margin-bottom: @spacing-xs;
      }

      p {
        font-size: @font-size-sm;
        color: @gray-600;
        margin: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .error-illustration .error-code {
    font-size: 6rem;
  }

  .error-illustration .error-icon {
    font-size: 3rem;
  }

  .error-content h1 {
    font-size: @font-size-2xl;
  }

  .error-actions {
    flex-direction: column;
    align-items: center;

    .btn {
      width: 100%;
      max-width: 300px;
    }
  }

  .suggestions .suggestion-links {
    grid-template-columns: 1fr;
  }

  .help-section .help-options {
    grid-template-columns: 1fr;
  }

  .error-details .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: @spacing-xs;
  }
}
</style>
