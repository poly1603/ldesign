<template>
  <div class="settings-view">
    <div class="settings-container">
      <div class="settings-header">
        <h1>{{ t('settings.title') }}</h1>
        <p class="subtitle">{{ t('settings.subtitle') }}</p>
      </div>
      
      <div class="settings-content">
        <div class="settings-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            :class="['tab-btn', { active: activeTab === tab.key }]"
            @click="activeTab = tab.key"
          >
            {{ t(tab.label) }}
          </button>
        </div>
        
        <div class="settings-panel">
          <!-- 外观设置 -->
          <div v-if="activeTab === 'appearance'" class="setting-section">
            <h3>{{ t('settings.appearance.title') }}</h3>
            
            <div class="setting-item">
              <label>{{ t('settings.appearance.theme.label') }}</label>
              <select v-model="settings.theme">
                <option value="light">{{ t('settings.appearance.theme.light') }}</option>
                <option value="dark">{{ t('settings.appearance.theme.dark') }}</option>
                <option value="auto">{{ t('settings.appearance.theme.auto') }}</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label>{{ t('settings.appearance.watermark.title') }}</label>
              <div class="checkbox-group">
                <label class="checkbox-label">
                  <input
                    v-model="settings.watermark.enabled"
                    type="checkbox"
                  >
                  {{ t('settings.appearance.watermark.enabled') }}
                </label>
              </div>
              
              <div v-if="settings.watermark.enabled" class="watermark-settings">
                <div class="setting-item">
                  <label>{{ t('settings.appearance.watermark.text') }}</label>
                  <input
                    v-model="settings.watermark.text"
                    type="text"
                    :placeholder="t('settings.appearance.watermark.text')"
                  >
                </div>
                
                <div class="setting-item">
                  <label>{{ t('settings.appearance.watermark.opacity') }}</label>
                  <input
                    v-model="settings.watermark.opacity"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                  >
                  <span class="range-value">{{ settings.watermark.opacity }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 安全设置 -->
          <div v-if="activeTab === 'security'" class="setting-section">
            <h3>{{ t('settings.security.title') }}</h3>
            
            <div class="setting-item">
              <label>{{ t('settings.security.changePassword') }}</label>
              <button class="action-btn">{{ t('settings.security.changePassword') }}</button>
            </div>
            
            <div class="setting-item">
              <label>{{ t('settings.security.twoFactor') }}</label>
              <button class="action-btn">{{ t('common.configure') }}</button>
            </div>
            
            <div class="setting-item">
              <label>{{ t('settings.security.loginHistory') }}</label>
              <button class="action-btn">{{ t('common.view') }}</button>
            </div>
          </div>
          
          <!-- 通知设置 -->
          <div v-if="activeTab === 'notifications'" class="setting-section">
            <h3>{{ t('settings.notifications') }}</h3>
            
            <div class="setting-item">
              <label class="checkbox-label">
                <input
                  v-model="settings.notifications.email"
                  type="checkbox"
                >
                {{ t('settings.emailNotifications') }}
              </label>
            </div>
            
            <div class="setting-item">
              <label class="checkbox-label">
                <input
                  v-model="settings.notifications.push"
                  type="checkbox"
                >
                {{ t('settings.pushNotifications') }}
              </label>
            </div>
          </div>
        </div>
        
        <div class="settings-actions">
          <button @click="handleSave" :disabled="loading" class="save-btn">
            {{ loading ? t('common.loading') : t('common.save') }}
          </button>
          <button @click="handleReset" class="reset-btn">
            {{ t('common.reset') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'

const { t } = useI18n()

const activeTab = ref('appearance')
const loading = ref(false)

const tabs = [
  { key: 'appearance', label: 'settings.appearanceTab' },
  { key: 'security', label: 'settings.securityTab' },
  { key: 'notifications', label: 'settings.notifications' }
]

const settings = reactive({
  theme: 'light',
  watermark: {
    enabled: true,
    text: 'LDesign',
    opacity: 0.1
  },
  notifications: {
    email: true,
    push: false
  }
})

const handleSave = async () => {
  loading.value = true
  
  try {
    // 模拟保存设置
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Settings saved:', settings)
  } catch (error) {
    console.error('Failed to save settings:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  settings.theme = 'light'
  settings.watermark.enabled = true
  settings.watermark.text = 'LDesign'
  settings.watermark.opacity = 0.1
  settings.notifications.email = true
  settings.notifications.push = false
}
</script>

<style lang="less" scoped>
.settings-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.settings-container {
  max-width: 1000px;
  margin: 0 auto;
}

.settings-header {
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  .subtitle {
    color: #666;
    font-size: 1rem;
  }
}

.settings-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-tabs {
  display: flex;
  border-bottom: 1px solid #e1e5e9;
  
  .tab-btn {
    flex: 1;
    padding: 1rem;
    border: none;
    background: #f8f9fa;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background: #e9ecef;
    }
    
    &.active {
      background: white;
      color: #667eea;
      border-bottom: 2px solid #667eea;
    }
  }
}

.settings-panel {
  padding: 2rem;
}

.setting-section {
  h3 {
    color: #333;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
  }
}

.setting-item {
  margin-bottom: 1.5rem;
  
  > label {
    display: block;
    margin-bottom: 0.5rem;
    color: #555;
    font-weight: 500;
  }
  
  input[type="text"],
  select {
    width: 100%;
    max-width: 300px;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
  
  input[type="range"] {
    width: 200px;
    margin-right: 1rem;
  }
  
  .range-value {
    color: #666;
    font-size: 0.9rem;
  }
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  cursor: pointer;
  
  input[type="checkbox"] {
    margin-right: 0.5rem;
  }
}

.checkbox-group {
  margin-bottom: 1rem;
}

.watermark-settings {
  margin-left: 1.5rem;
  padding-left: 1rem;
  border-left: 2px solid #e1e5e9;
}

.action-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #5a6fd8;
  }
}

.settings-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem 2rem;
  border-top: 1px solid #e1e5e9;
  background: #f8f9fa;
  
  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    
    &.save-btn {
      background: #667eea;
      color: white;
      
      &:hover:not(:disabled) {
        background: #5a6fd8;
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
    
    &.reset-btn {
      background: #6c757d;
      color: white;
      
      &:hover {
        background: #5a6268;
      }
    }
  }
}
</style>
