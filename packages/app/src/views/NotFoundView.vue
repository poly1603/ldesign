<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="error-content">
        <div class="error-illustration">
          <div class="error-code">404</div>
          <div class="error-icon">🔍</div>
        </div>
        
        <div class="error-message">
          <h1>{{ t('error.404.title') }}</h1>
          <p class="error-description">{{ t('error.404.message') }}</p>
          
          <div class="error-suggestions">
            <h3>{{ t('error.suggestions.title') }}</h3>
            <ul>
              <li>{{ t('error.suggestions.checkUrl') }}</li>
              <li>{{ t('error.suggestions.useNavigation') }}</li>
              <li>{{ t('error.suggestions.contactSupport') }}</li>
            </ul>
          </div>
        </div>
        
        <div class="error-actions">
          <button @click="goHome" class="home-btn">
            {{ t('error.404.backHome') }}
          </button>
          <button @click="goBack" class="back-btn">
            {{ t('common.back') }}
          </button>
          <button @click="refresh" class="refresh-btn">
            {{ t('common.refresh') }}
          </button>
        </div>
        
        <div class="quick-links">
          <h3>{{ t('error.quickLinks.title') }}</h3>
          <div class="links-grid">
            <router-link to="/dashboard" class="quick-link">
              <span class="link-icon">📊</span>
              <span class="link-text">{{ t('nav.dashboard') }}</span>
            </router-link>
            <router-link to="/templates" class="quick-link">
              <span class="link-icon">🎨</span>
              <span class="link-text">{{ t('nav.templates') }}</span>
            </router-link>
            <router-link to="/settings" class="quick-link">
              <span class="link-icon">⚙️</span>
              <span class="link-text">{{ t('nav.settings') }}</span>
            </router-link>
            <router-link to="/about" class="quick-link">
              <span class="link-icon">ℹ️</span>
              <span class="link-text">{{ t('nav.about') }}</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from '@ldesign/router'
import { useI18n } from '@ldesign/i18n/vue'

const router = useRouter()
const { t } = useI18n()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}

const refresh = () => {
  window.location.reload()
}
</script>

<style lang="less" scoped>
.not-found-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.not-found-container {
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
  position: relative;
  
  .error-code {
    font-size: 8rem;
    font-weight: bold;
    background: linear-gradient(135deg, #667eea, #764ba2);
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

.error-suggestions {
  text-align: left;
  max-width: 500px;
  margin: 0 auto 2rem;
  
  h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
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
        color: #667eea;
        font-weight: bold;
        position: absolute;
        left: 0;
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
    
    &.home-btn {
      background: #667eea;
      color: white;
      
      &:hover {
        background: #5a6fd8;
        transform: translateY(-2px);
      }
    }
    
    &.back-btn {
      background: #6c757d;
      color: white;
      
      &:hover {
        background: #5a6268;
        transform: translateY(-2px);
      }
    }
    
    &.refresh-btn {
      background: #28a745;
      color: white;
      
      &:hover {
        background: #218838;
        transform: translateY(-2px);
      }
    }
  }
}

.quick-links {
  h3 {
    color: #333;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
  }
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.quick-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  text-decoration: none;
  color: #333;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .link-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .link-text {
    font-size: 0.9rem;
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .not-found-view {
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
  
  .links-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .error-illustration .error-code {
    font-size: 4rem;
  }
  
  .links-grid {
    grid-template-columns: 1fr;
  }
}
</style>
