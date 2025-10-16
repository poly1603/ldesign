<template>
  <div class="social-login">
    <div class="divider">
      <span class="divider-text">{{ dividerText }}</span>
    </div>
    
    <div class="social-icons">
      <div
        v-for="item in socialList"
        :key="item.type"
        class="social-icon-wrapper"
        :title="item.title"
        @click="handleSocialLogin(item.type)"
      >
        <div class="social-icon" :class="`icon-${item.type}`" :style="{ backgroundColor: item.color }">
          <component :is="getIconComponent(item.type)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import type { SocialLoginType, SocialLoginConfig } from '../types'

interface Props {
  dividerText?: string
  socialList?: SocialLoginConfig[]
}

const props = withDefaults(defineProps<Props>(), {
  dividerText: '其他登录方式',
  socialList: () => [
    { type: 'wechat', icon: 'wechat', title: '微信登录', color: '#07c160' },
    { type: 'qq', icon: 'qq', title: 'QQ登录', color: '#1890ff' },
    { type: 'github', icon: 'github', title: 'GitHub登录', color: '#24292e' },
    { type: 'google', icon: 'google', title: 'Google登录', color: '#4285f4' }
  ]
})

const emit = defineEmits<{
  'social-login': [type: SocialLoginType]
}>()

const handleSocialLogin = (type: SocialLoginType) => {
  emit('social-login', type)
}

// 图标组件映射
const getIconComponent = (type: SocialLoginType) => {
  const icons = {
    wechat: () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '24',
      height: '24'
    }, [
      h('path', {
        d: 'M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.117-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982z'
      })
    ]),
    qq: () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '24',
      height: '24'
    }, [
      h('path', {
        d: 'M12 2C9.239 2 7 4.239 7 7v7c0 1.304-.836 2.403-2 2.816V17c0 2.761 2.239 5 5 5h4c2.761 0 5-2.239 5-5v-.184c-1.164-.413-2-1.512-2-2.816V7c0-2.761-2.239-5-5-5zm-1.5 4.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'
      })
    ]),
    github: () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '24',
      height: '24'
    }, [
      h('path', {
        d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'
      })
    ]),
    google: () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '24',
      height: '24'
    }, [
      h('path', {
        d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
      }),
      h('path', {
        d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
      }),
      h('path', {
        d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
      }),
      h('path', {
        d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
      })
    ]),
    facebook: () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
      width: '24',
      height: '24'
    }, [
      h('path', {
        d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z'
      })
    ])
  }
  
  return icons[type] || icons.github
}
</script>

<style scoped>
.social-login {
  margin-top: 32px;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #e0e0e0 20%, #e0e0e0 80%, transparent);
}

.divider-text {
  position: relative;
  display: inline-block;
  padding: 0 16px;
  background: white;
  color: #999;
  font-size: 12px;
}

.social-icons {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.social-icon-wrapper {
  cursor: pointer;
  transition: transform 0.3s;
}

.social-icon-wrapper:hover {
  transform: translateY(-4px);
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  color: white;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.social-icon:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.social-icon svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* 默认图标颜色 */
.icon-wechat {
  background-color: #07c160;
}

.icon-qq {
  background-color: #1890ff;
}

.icon-github {
  background-color: #24292e;
}

.icon-google {
  background: #fff;
  color: #4285f4;
  border: 1px solid #e0e0e0;
}

.icon-facebook {
  background-color: #1877f2;
}
</style>