<template>
  <div class="profile-view">
    <div class="profile-container">
      <div class="profile-header">
        <h1>{{ t('profile.title') }}</h1>
        <p class="subtitle">{{ t('profile.subtitle') }}</p>
      </div>
      
      <div class="profile-content">
        <div class="profile-card">
          <div class="avatar-section">
            <div class="avatar">
              <img v-if="user?.avatar" :src="user.avatar" :alt="user.username" />
              <div v-else class="avatar-placeholder">
                {{ user?.username?.charAt(0)?.toUpperCase() }}
              </div>
            </div>
            <button class="change-avatar-btn">{{ t('profile.changeAvatar') }}</button>
          </div>
          
          <form @submit.prevent="handleSave" class="profile-form">
            <div class="form-group">
              <label for="username">{{ t('auth.username') }}</label>
              <input
                id="username"
                v-model="profileForm.username"
                type="text"
                required
                :placeholder="t('auth.usernamePlaceholder')"
              >
            </div>
            
            <div class="form-group">
              <label for="email">{{ t('auth.email') }}</label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                required
                :placeholder="t('auth.emailPlaceholder')"
              >
            </div>
            
            <div class="form-group">
              <label for="role">{{ t('profile.role') }}</label>
              <input
                id="role"
                v-model="profileForm.role"
                type="text"
                readonly
                class="readonly"
              >
            </div>
            
            <div class="form-group">
              <label for="createdAt">{{ t('profile.joinDate') }}</label>
              <input
                id="createdAt"
                :value="formatDate(profileForm.createdAt)"
                type="text"
                readonly
                class="readonly"
              >
            </div>
            
            <div class="form-actions">
              <button type="button" @click="handleCancel" class="cancel-btn">
                {{ t('common.cancel') }}
              </button>
              <button type="submit" :disabled="loading" class="save-btn">
                {{ loading ? t('common.loading') : t('common.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from '@ldesign/router'
import { useI18n } from '@ldesign/i18n/vue'
import { useAuthState } from '../stores/auth'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthState()

const loading = ref(false)
const user = ref(authStore.user)

const profileForm = reactive({
  username: '',
  email: '',
  role: '',
  createdAt: ''
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}

const loadProfile = () => {
  if (user.value) {
    profileForm.username = user.value.username
    profileForm.email = user.value.email
    profileForm.role = user.value.role
    profileForm.createdAt = user.value.createdAt
  }
}

const handleSave = async () => {
  loading.value = true
  
  try {
    // 模拟保存用户资料
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新用户信息
    if (user.value) {
      user.value.username = profileForm.username
      user.value.email = profileForm.email
    }
    
    console.log('Profile updated successfully')
  } catch (error) {
    console.error('Failed to update profile:', error)
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.back()
}

onMounted(() => {
  loadProfile()
})
</script>

<style lang="less" scoped>
.profile-view {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 2rem;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
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

.profile-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-section {
  text-align: center;
  margin-bottom: 2rem;
  
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin: 0 auto 1rem;
    overflow: hidden;
    border: 3px solid #e1e5e9;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .avatar-placeholder {
      width: 100%;
      height: 100%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
    }
  }
  
  .change-avatar-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    
    &:hover {
      background: #5a6fd8;
    }
  }
}

.profile-form {
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      
      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
      }
      
      &.readonly {
        background: #f8f9fa;
        color: #6c757d;
        cursor: not-allowed;
      }
    }
  }
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  
  button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
    
    &.cancel-btn {
      background: #6c757d;
      color: white;
      
      &:hover {
        background: #5a6268;
      }
    }
    
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
  }
}
</style>
