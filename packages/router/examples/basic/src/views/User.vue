<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const userId = computed(() => route.value?.params?.id as string || '')

const userData = computed(() => {
  const users: Record<string, any> = {
    123: { name: '张三', email: 'zhangsan@example.com', role: '前端开发工程师' },
    456: { name: '李四', email: 'lisi@example.com', role: '后端开发工程师' },
    789: { name: '王五', email: 'wangwu@example.com', role: '产品经理' },
    999: { name: '赵六', email: 'zhaoliu@example.com', role: 'UI设计师' },
  }

  return users[userId.value] || {
    name: `用户${userId.value}`,
    email: `user${userId.value}@example.com`,
    role: '普通用户',
  }
})

function switchUser(id: number) {
  router.push(`/user/${id}`)
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div>
    <h2>👤 用户详情</h2>
    <p>这是一个展示动态路由参数的示例页面。</p>

    <div style="margin-top: 20px;">
      <div style="background: #e3f2fd; padding: 15px; border-radius: 6px; border-left: 4px solid #2196f3;">
        <h3>路由信息</h3>
        <p><strong>用户ID:</strong> {{ userId }}</p>
        <p><strong>完整路径:</strong> {{ route?.path || '/' }}</p>
        <p><strong>路由名称:</strong> {{ route?.name || 'unknown' }}</p>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <h3>模拟用户数据</h3>
      <div style="background: white; border: 1px solid #ddd; border-radius: 6px; padding: 15px;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">
            {{ userData.name.charAt(0) }}
          </div>
          <div>
            <h4>{{ userData.name }}</h4>
            <p style="color: #666; margin: 5px 0;">
              {{ userData.email }}
            </p>
            <p style="color: #666;">
              {{ userData.role }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <h3>快速切换用户</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button
          v-for="id in [123, 456, 789, 999]"
          :key="id"
          :style="{
            padding: '8px 16px',
            background: userId === id.toString() ? '#28a745' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }"
          @click="switchUser(id)"
        >
          用户 {{ id }}
        </button>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <button style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" @click="goHome">
        返回首页
      </button>
    </div>
  </div>
</template>
