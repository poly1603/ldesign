<template>
  <div class="login-view">
    <!-- 模板切换器 -->
    <div class="template-switcher">
      <div class="switcher-content">
        <label for="template-select">选择模板：</label>
        <select
          id="template-select"
          v-model="currentTemplate"
          class="template-select"
          @change="switchTemplate"
        >
          <option value="classic">经典模板</option>
          <option value="modern">现代模板</option>
          <option value="minimal">简约模板</option>
          <option value="creative">创意模板</option>
        </select>
      </div>
    </div>

    <!-- 简单的登录表单 -->
    <div class="login-container">
      <div class="login-card" :class="`template-${currentTemplate}`">
        <div class="login-header">
          <div class="logo">
            <h1>LDesign</h1>
          </div>
          <p class="subtitle">{{ t('auth.login.subtitle') }}</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-group">
            <input
              v-model="form.username"
              type="text"
              class="form-control"
              :placeholder="t('auth.login.username')"
              required
            />
          </div>

          <div class="form-group">
            <input
              v-model="form.password"
              type="password"
              class="form-control"
              :placeholder="t('auth.login.password')"
              required
            />
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="form.remember" type="checkbox" />
              <span class="checkmark"></span>
              {{ t('auth.login.remember') }}
            </label>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner"></span>
            {{ loading ? t('common.loading') : t('auth.login.loginButton') }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthState } from '../stores/auth'
import { useEngine } from '@ldesign/engine/vue'
import { useRouter } from '@ldesign/router'
import { useI18n } from '@ldesign/i18n/vue'
import type { LoginCredentials } from '../stores/auth'

const router = useRouter()
const authStore = useAuthState()
const engine = useEngine()
const { t } = useI18n()

// 当前选中的模板
const currentTemplate = ref('classic')

// 加载状态
const loading = ref(false)

// 表单数据
const form = reactive<LoginCredentials>({
  username: '',
  password: '',
  remember: false
})

// 处理登录
const handleLogin = async () => {
  if (loading.value) return

  loading.value = true

  try {
    await authStore.login(form)

    engine.notifications.show({
      type: 'success',
      title: '登录成功',
      message: '欢迎回来！'
    })

    // 重定向到仪表板
    router.push('/dashboard')

  } catch (error: any) {
    engine.notifications.show({
      type: 'error',
      title: '登录失败',
      message: error.message || '用户名或密码错误'
    })
  } finally {
    loading.value = false
  }
}

// 切换模板
const switchTemplate = () => {
  localStorage.setItem('preferred-login-template', currentTemplate.value)

  engine.notifications.show({
    type: 'info',
    title: '模板已切换',
    message: `已切换到${getTemplateName(currentTemplate.value)}模板`
  })
}

// 获取模板名称
const getTemplateName = (templateId: string) => {
  const names: Record<string, string> = {
    classic: '经典模板',
    modern: '现代模板',
    minimal: '简约模板',
    creative: '创意模板'
  }
  return names[templateId] || templateId
}

// 组件挂载时恢复用户偏好
onMounted(() => {
  const savedTemplate = localStorage.getItem('preferred-login-template')
  if (savedTemplate) {
    currentTemplate.value = savedTemplate
  }
})
</script>

<style lang="less" scoped>
.login-view {
  position: relative;
  min-height: 100vh;
  
  .template-switcher {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: @border-radius-lg;
    padding: 12px 16px;
    box-shadow: @shadow;
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    .switcher-content {
      display: flex;
      align-items: center;
      gap: 12px;
      
      label {
        font-size: @font-size-sm;
        font-weight: @font-weight-medium;
        color: @text-primary;
        white-space: nowrap;
      }
      
      .template-select {
        padding: 6px 12px;
        border: 1px solid @border-color;
        border-radius: @border-radius;
        background: white;
        font-size: @font-size-sm;
        cursor: pointer;
        min-width: 120px;
        
        &:focus {
          outline: none;
          border-color: @primary-color;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }
      }
    }
  }
  
  .template-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 16px;
    
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid @border-light;
      border-top: 3px solid @primary-color;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    p {
      color: @text-secondary;
      font-size: @font-size-base;
      margin: 0;
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: @screen-md) {
  .login-view {
    .template-switcher {
      top: 10px;
      right: 10px;
      padding: 8px 12px;
      
      .switcher-content {
        flex-direction: column;
        gap: 8px;
        
        label {
          font-size: @font-size-xs;
        }
        
        .template-select {
          font-size: @font-size-xs;
          min-width: 100px;
        }
      }
    }
  }
}
</style>
