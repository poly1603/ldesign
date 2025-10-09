<template>
  <TemplateRenderer category="login" :show-selector="true" :responsive="true" :cache-selection="true"
    :props="templateProps" @template-change="onTemplateChange" @load-error="onLoadError" @load-success="onLoadSuccess">
    <!-- 底部插槽 -->
    <template #footer>
      <div class="login-footer">
        <router-link to="/" class="back-link">
          ← 返回首页
        </router-link>
        <p class="copyright">
          &copy; 2024 LDesign Demo App
        </p>
      </div>
    </template>

    <!-- 额外内容插槽 -->
    <template #extra>
      <div class="demo-info">
        <p>🎨 使用 <strong>@ldesign/template</strong> 内置登录模板</p>
      </div>
    </template>
  </TemplateRenderer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, markRaw, watch } from 'vue'
import { TemplateRenderer } from '@ldesign/template'

// 模板属性 - 使用 markRaw 包装函数，避免Vue响应式对象警告
const templateProps = computed(() => ({
  title: '用户登录',
  subtitle: '欢迎使用 LDesign Demo 系统',
  showRemember: true,
  showRegister: true,
  showForgot: true,
  primaryColor: 'var(--ldesign-brand-color)',
}))
</script>