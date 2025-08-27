<script setup lang="ts">
import { useRouter } from '@ldesign/router'

const router = useRouter()

function goToAbout() {
  router.push('/about')
}

function goToUser() {
  router.push('/user/999')
}
</script>

<template>
  <div>
    <h2>🏠 欢迎来到首页</h2>
    <p>这是使用 @ldesign/router 构建的基础示例应用的首页。</p>

    <div style="margin-top: 20px;">
      <h3>功能特性</h3>
      <ul style="margin-left: 20px; margin-top: 10px;">
        <li>✅ 基础路由导航</li>
        <li>✅ 动态路由参数</li>
        <li>✅ 查询参数支持</li>
        <li>✅ 404错误处理</li>
        <li>✅ 路由状态显示</li>
      </ul>
    </div>

    <div style="margin-top: 20px;">
      <h3>快速导航</h3>
      <div style="display: flex; gap: 10px; margin-top: 10px;">
        <button style="padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;" @click="goToAbout">
          关于页面
        </button>
        <button style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;" @click="goToUser">
          用户详情
        </button>
      </div>
    </div>
  </div>
</template>
