<script setup lang="ts">
import { useRouter } from '@ldesign/router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<template>
  <div>
    <h2>📖 关于 @ldesign/router</h2>
    <p>@ldesign/router 是一个功能强大、类型安全的 Vue 3 路由库。</p>

    <div style="margin-top: 20px;">
      <h3>核心特性</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
        <div style="padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #007bff;">
          <h4>🚀 高性能</h4>
          <p>优化的路由匹配算法，支持大规模路由配置</p>
        </div>
        <div style="padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #28a745;">
          <h4>🔒 类型安全</h4>
          <p>完整的 TypeScript 支持，编译时类型检查</p>
        </div>
        <div style="padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #ffc107;">
          <h4>🎨 灵活配置</h4>
          <p>支持多种历史模式和自定义配置</p>
        </div>
        <div style="padding: 15px; background: #f8f9fa; border-radius: 6px; border-left: 4px solid #dc3545;">
          <h4>🔧 插件系统</h4>
          <p>丰富的插件生态，支持缓存、动画等功能</p>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px;">
      <h3>版本信息</h3>
      <p>当前版本: v1.0.0</p>
      <p>构建时间: {{ new Date().toLocaleString() }}</p>
    </div>

    <div style="margin-top: 20px;">
      <button style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;" @click="goBack">
        返回上一页
      </button>
    </div>
  </div>
</template>
