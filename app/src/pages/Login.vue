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
import { useRouter } from '@ldesign/router'
import { TemplateRenderer } from '@ldesign/template'
import { useDevice } from '@ldesign/device/vue'
import { useBreakpoints } from '@ldesign/device/vue/composables/useBreakpoints'

/**
 * 登录页面组件
 * 使用 @ldesign/template 内置的登录模板
 * 支持响应式设备检测和模板切换
 */

const router = useRouter()

// 设备检测和断点管理
const { deviceType } = useDevice({
  enableResize: true,
  enableOrientation: true
})

const { current: currentBreakpoint, width } = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1200
})

// 计算当前设备类型，用于模板选择
const currentDevice = computed(() => {
  // 优先使用设备检测结果，如果不可用则使用断点判断
  if (deviceType.value) {
    return deviceType.value
  }

  // 基于断点的设备判断
  if (width.value < 768) return 'mobile'
  if (width.value < 1024) return 'tablet'
  return 'desktop'
})

// 监听设备变化，输出调试信息
watch([currentDevice, currentBreakpoint], ([device, breakpoint]) => {
  console.log(`🔄 设备切换: ${device} (断点: ${breakpoint}, 宽度: ${width.value}px)`)
}, { immediate: true })

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const isLoading = ref(false)

// 当前选中的模板名称 - 让 TemplateRenderer 自己管理模板选择和持久化
const selectedTemplate = ref<string>()

// 模板属性 - 使用 markRaw 包装函数，避免Vue响应式对象警告
const templateProps = computed(() => ({
  title: '用户登录',
  subtitle: '欢迎使用 LDesign Demo 系统',
  showRemember: true,
  showRegister: true,
  showForgot: true,
  primaryColor: 'var(--ldesign-brand-color)',
  formData: loginForm,
  loading: isLoading.value,
  // 使用 markRaw 包装函数，避免Vue将组件设为响应式对象
  onSubmit: markRaw(handleLogin),
  onRegister: markRaw(handleRegister),
  onForgot: markRaw(handleForgot),
  // 添加设备信息用于调试
  debugInfo: {
    deviceType: currentDevice.value,
    templateName: selectedTemplate.value || 'auto',
    isResponsive: true,
    screenWidth: width.value,
    renderMode: 'template-renderer'
  }
}))

// 登录处理
const handleLogin = async (formData?: any) => {
  const data = formData || loginForm

  if (!data.username || !data.password) {
    alert('请输入用户名和密码')
    return
  }

  isLoading.value = true

  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1000))

    alert(`登录成功！欢迎 ${data.username}`)
    router.push('/')
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 注册处理
const handleRegister = () => {
  alert('注册功能演示')
}

// 忘记密码处理
const handleForgot = () => {
  alert('忘记密码功能演示')
}

// 模板事件处理
const onTemplateChange = (templateName: string) => {
  console.log(`🎨 模板切换: ${templateName} (设备: ${currentDevice.value})`)
  selectedTemplate.value = templateName
}

const onLoadError = (error: Error) => {
  console.error('模板加载失败:', error)
}

const onLoadSuccess = (template?: any) => {
  console.log(`✅ 模板加载成功 - 设备: ${currentDevice.value}, 模板: ${template?.name || selectedTemplate.value || 'unknown'}`)
}

// 组件挂载时输出设备信息
onMounted(() => {
  console.log(`🚀 登录页面已挂载 - 当前设备: ${currentDevice.value}`)
})
</script>