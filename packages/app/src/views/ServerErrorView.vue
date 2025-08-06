<template>
  <div class="server-error-view">
    <div class="error-container">
      <div class="error-content">
        <div class="error-illustration">
          <div class="error-code">500</div>
          <div class="error-icon">⚠️</div>
        </div>
        
        <div class="error-message">
          <h1>{{ t('error.500.title') }}</h1>
          <p class="error-description">{{ t('error.500.message') }}</p>
          
          <div class="error-details" v-if="showDetails">
            <h3>{{ t('error.details.title') }}</h3>
            <div class="error-info">
              <p><strong>{{ t('error.details.time') }}:</strong> {{ errorTime }}</p>
              <p><strong>{{ t('error.details.id') }}:</strong> {{ errorId }}</p>
              <p><strong>{{ t('error.details.status') }}:</strong> 500 Internal Server Error</p>
            </div>
          </div>
        </div>
        
        <div class="error-actions">
          <button @click="retry" :disabled="retrying" class="retry-btn">
            {{ retrying ? t('common.loading') : t('error.500.retry') }}
          </button>
          <button @click="goHome" class="home-btn">
            {{ t('error.404.backHome') }}
          </button>
          <button @click="toggleDetails" class="details-btn">
            {{ showDetails ? t('error.hideDetails') : t('error.showDetails') }}
          </button>
        </div>
        
        <div class="error-suggestions">
          <h3>{{ t('error.suggestions.title') }}</h3>
          <ul>
            <li>{{ t('error.suggestions.waitAndRetry') }}</li>
            <li>{{ t('error.suggestions.checkStatus') }}</li>
            <li>{{ t('error.suggestions.contactAdmin') }}</li>
            <li>{{ t('error.suggestions.reportIssue') }}</li>
          </ul>
        </div>
        
        <div class="contact-support">
          <h3>{{ t('error.support.title') }}</h3>
          <p>{{ t('error.support.description') }}</p>
          <div class="support-actions">
            <button @click="reportIssue" class="report-btn">
              {{ t('error.support.reportIssue') }}
            </button>
            <button @click="contactSupport" class="contact-btn">
              {{ t('error.support.contactSupport') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@ldesign/router'
import { useI18n } from '@ldesign/i18n/vue'

const router = useRouter()
const { t } = useI18n()

const showDetails = ref(false)
const retrying = ref(false)
const errorTime = ref('')
const errorId = ref('')

const generateErrorId = () => {
  return 'ERR-' + Math.random().toString(36).substr(2, 9).toUpperCase()
}

const formatTime = () => {
  return new Date().toLocaleString()
}

const retry = async () => {
  retrying.value = true
  
  try {
    // 模拟重试延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 重新加载当前页面
    window.location.reload()
  } catch (error) {
    console.error('Retry failed:', error)
  } finally {
    retrying.value = false
  }
}

const goHome = () => {
  router.push('/')
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

const reportIssue = () => {
  // 这里可以集成错误报告系统
  const issueData = {
    errorId: errorId.value,
    time: errorTime.value,
    userAgent: navigator.userAgent,
    url: window.location.href
  }
  
  console.log('Reporting issue:', issueData)
  alert(t('error.support.issueReported'))
}

const contactSupport = () => {
  // 这里可以打开支持页面或邮件客户端
  window.open('mailto:support@ldesign.com?subject=Server Error Report&body=' + 
    encodeURIComponent(`Error ID: ${errorId.value}\nTime: ${errorTime.value}\nURL: ${window.location.href}`))
}

onMounted(() => {
  errorTime.value = formatTime()
  errorId.value = generateErrorId()
})
</script>

<style lang="less" scoped>
.server-error-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-container {
  max-width: 800px;
  width: 100%;
}

.error-content {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.error-illustration {
  margin-bottom: 2rem;
  
  .error-code {
    font-size: 8rem;
    font-weight: bold;
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
    margin-bottom: 1rem;
  }
  
  .error-icon {
    font-size: 4rem;
    opacity: 0.7;
  }
}

.error-message {
  margin-bottom: 3rem;
  
  h1 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 1rem;
  }
  
  .error-description {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.6;
  }
}

.error-details {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  text-align: left;
  
  h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  .error-info {
    p {
      margin: 0.5rem 0;
      color: #666;
      font-family: monospace;
      font-size: 0.9rem;
      
      strong {
        color: #333;
        font-family: inherit;
      }
    }
  }
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  
  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    &.retry-btn {
      background: #ff6b6b;
      color: white;
      
      &:hover:not(:disabled) {
        background: #ff5252;
        transform: translateY(-2px);
      }
    }
    
    &.home-btn {
      background: #6c757d;
      color: white;
      
      &:hover {
        background: #5a6268;
        transform: translateY(-2px);
      }
    }
    
    &.details-btn {
      background: #17a2b8;
      color: white;
      
      &:hover {
        background: #138496;
        transform: translateY(-2px);
      }
    }
  }
}

.error-suggestions {
  text-align: left;
  max-width: 500px;
  margin: 0 auto 3rem;
  
  h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
    text-align: center;
  }
  
  ul {
    list-style: none;
    padding: 0;
    
    li {
      padding: 0.5rem 0;
      color: #666;
      position: relative;
      padding-left: 1.5rem;
      
      &::before {
        content: '•';
        color: #ff6b6b;
        font-weight: bold;
        position: absolute;
        left: 0;
      }
    }
  }
}

.contact-support {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
  
  h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  p {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
}

.support-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  
  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
    
    &.report-btn {
      background: #ffc107;
      color: #212529;
      
      &:hover {
        background: #e0a800;
        transform: translateY(-2px);
      }
    }
    
    &.contact-btn {
      background: #28a745;
      color: white;
      
      &:hover {
        background: #218838;
        transform: translateY(-2px);
      }
    }
  }
}

@media (max-width: 768px) {
  .server-error-view {
    padding: 1rem;
  }
  
  .error-content {
    padding: 2rem;
  }
  
  .error-illustration .error-code {
    font-size: 6rem;
  }
  
  .error-message h1 {
    font-size: 1.5rem;
  }
  
  .error-actions {
    flex-direction: column;
    align-items: center;
    
    button {
      width: 100%;
      max-width: 200px;
    }
  }
  
  .support-actions {
    flex-direction: column;
    align-items: center;
    
    button {
      width: 100%;
      max-width: 200px;
    }
  }
}

@media (max-width: 480px) {
  .error-illustration .error-code {
    font-size: 4rem;
  }
}
</style>
