<script setup lang="ts">
import { useRouter } from '@ldesign/router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

function logout() {
  userStore.logout()
  router.push('/login')
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div>
    <h2>🔒 受保护的页面</h2>
    <p>这是一个需要登录才能访问的页面，演示了路由守卫的功能。</p>

    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
      <h3>✅ 访问成功</h3>
      <p>恭喜！您已经通过了路由守卫的验证，可以访问这个受保护的页面。</p>
    </div>

    <div style="margin-top: 20px;">
      <h3>路由守卫信息</h3>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-top: 10px;">
        <p><strong>用户状态:</strong> {{ userStore.isLoggedIn ? '已登录' : '未登录' }}</p>
        <p><strong>用户名:</strong> {{ userStore.username || '未设置' }}</p>
        <p><strong>访问时间:</strong> {{ new Date().toLocaleString() }}</p>
        <p><strong>来源页面:</strong> 直接访问</p>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <h3>守卫类型演示</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
        <div style="padding: 15px; background: #fff3cd; border-radius: 6px; border-left: 4px solid #ffc107;">
          <h4>🌐 全局前置守卫</h4>
          <p>在每次路由跳转前检查用户登录状态</p>
        </div>
        <div style="padding: 15px; background: #d4edda; border-radius: 6px; border-left: 4px solid #28a745;">
          <h4>🛡️ 路由独享守卫</h4>
          <p>只在访问特定路由时进行权限检查</p>
        </div>
        <div style="padding: 15px; background: #d1ecf1; border-radius: 6px; border-left: 4px solid #17a2b8;">
          <h4>🔧 组件内守卫</h4>
          <p>在组件内部控制路由的进入和离开</p>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <button style="padding: 10px 20px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px;" @click="logout">
        退出登录
      </button>
      <button style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" @click="goHome">
        返回首页
      </button>
    </div>
  </div>
</template>
