<script setup lang="ts">
import { useRoute, useRouter } from '@ldesign/router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

const currentPath = computed(() => {
  return route.value?.path || window.location.pathname
})

function goHome() {
  router.push('/')
}

function goBack() {
  router.back()
}

function refresh() {
  window.location.reload()
}
</script>

<template>
  <div style="text-align: center; padding: 40px 20px;">
    <div style="font-size: 120px; margin-bottom: 20px;">
      🔍
    </div>
    <h2 style="color: #dc3545; margin-bottom: 15px;">
      404 - 页面未找到
    </h2>
    <p style="color: #666; margin-bottom: 30px; font-size: 18px;">
      抱歉，您访问的页面 <code style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px;">{{ currentPath }}</code> 不存在。
    </p>

    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 20px; margin: 20px 0; text-align: left;">
      <h4 style="color: #856404; margin-bottom: 10px;">
        💡 可能的原因：
      </h4>
      <ul style="color: #856404; margin-left: 20px;">
        <li>URL 地址输入错误</li>
        <li>页面已被移动或删除</li>
        <li>链接已过期</li>
        <li>您没有访问权限</li>
      </ul>
    </div>

    <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 30px;">
      <button
        style="padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;"
        @click="goHome"
      >
        🏠 返回首页
      </button>
      <button
        style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;"
        @click="goBack"
      >
        ⬅️ 返回上页
      </button>
      <button
        style="padding: 12px 24px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;"
        @click="refresh"
      >
        🔄 刷新页面
      </button>
    </div>

    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 14px;">
        如果问题持续存在，请联系网站管理员
      </p>
    </div>
  </div>
</template>
