<template>
  <div class="demo-page">
    <div class="demo-header">
      <h1>🎨 组件方式演示</h1>
      <p>使用 TemplateRenderer 组件渲染内置 login 模板</p>
    </div>

    <div class="demo-content">
      <!-- 基础组件演示 -->
      <section class="demo-section">
        <h2>基础用法</h2>
        <p>最简单的模板渲染方式，自动检测设备类型并渲染对应模板</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <TemplateRenderer
              category="login"
              :show-selector="false"
              :template-props="basicProps"
              @template-loaded="handleTemplateLoaded"
              @error="handleError"
            />
          </div>
          
          <div class="demo-code">
            <h4>代码示例</h4>
            <pre><code>&lt;TemplateRenderer
  category="login"
  :show-selector="false"
  :template-props="basicProps"
/&gt;</code></pre>
          </div>
        </div>
      </section>

      <!-- 带选择器的演示 -->
      <section class="demo-section">
        <h2>模板选择器</h2>
        <p>启用模板选择器，用户可以切换不同的登录模板样式</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <TemplateRenderer
              category="login"
              :show-selector="true"
              :template-props="selectorProps"
              :selector-options="selectorOptions"
              @template-change="handleTemplateChange"
              @template-loaded="handleTemplateLoaded"
              @error="handleError"
            />
          </div>
          
          <div class="demo-code">
            <h4>代码示例</h4>
            <pre><code>&lt;TemplateRenderer
  category="login"
  :show-selector="true"
  :template-props="selectorProps"
  :selector-options="selectorOptions"
  @template-change="handleTemplateChange"
/&gt;</code></pre>
          </div>
        </div>
      </section>

      <!-- 指定模板演示 -->
      <section class="demo-section">
        <h2>指定模板</h2>
        <p>指定特定的模板名称和设备类型</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <div class="demo-controls">
              <div class="control-group">
                <label>选择模板：</label>
                <select v-model="selectedTemplate" @change="updateSpecificTemplate" class="form-control">
                  <option value="default">默认模板</option>
                  <option value="modern">现代模板</option>
                  <option value="simple">简洁模板</option>
                </select>
              </div>

              <div class="control-group">
                <label>设备类型：</label>
                <select v-model="selectedDevice" @change="updateSpecificTemplate" class="form-control">
                  <option value="desktop">桌面端</option>
                  <option value="tablet">平板端</option>
                  <option value="mobile">移动端</option>
                </select>
              </div>
            </div>
            
            <TemplateRenderer
              category="login"
              :device="selectedDevice"
              :template="selectedTemplate"
              :template-props="specificProps"
              :show-selector="false"
              @template-loaded="handleTemplateLoaded"
              @error="handleError"
            />
          </div>
          
          <div class="demo-code">
            <h4>代码示例</h4>
            <pre><code>&lt;TemplateRenderer
  category="login"
  :device="selectedDevice"
  :template="selectedTemplate"
  :template-props="specificProps"
/&gt;</code></pre>
          </div>
        </div>
      </section>

      <!-- 自定义加载状态 -->
      <section class="demo-section">
        <h2>自定义状态</h2>
        <p>自定义加载、错误和空状态的显示</p>
        
        <div class="demo-container">
          <div class="demo-preview">
            <TemplateRenderer
              category="login"
              :template-props="customProps"
              @template-loaded="handleTemplateLoaded"
              @error="handleError"
            >
              <template #loading>
                <div class="loading-state">
                  <div class="loading-spinner animate-spin"></div>
                  <p>正在加载登录模板...</p>
                </div>
              </template>

              <template #error="{ error, retry }">
                <div class="error-state">
                  <h4>❌ 模板加载失败</h4>
                  <p>{{ error?.message || '未知错误' }}</p>
                  <button @click="retry" class="btn btn-danger">重试</button>
                </div>
              </template>

              <template #empty>
                <div class="empty-state">
                  <h4>📭 暂无可用模板</h4>
                  <p>请检查模板配置或联系管理员</p>
                </div>
              </template>
            </TemplateRenderer>
          </div>
          
          <div class="demo-code">
            <h4>代码示例</h4>
            <pre><code>&lt;TemplateRenderer category="login"&gt;
  &lt;template #loading&gt;
    &lt;div class="custom-loading"&gt;加载中...&lt;/div&gt;
  &lt;/template&gt;

  &lt;template #error="{ error, retry }"&gt;
    &lt;div class="custom-error"&gt;
      &lt;p&gt;{{ error?.message || '未知错误' }}&lt;/p&gt;
      &lt;button @click="retry"&gt;重试&lt;/button&gt;
    &lt;/div&gt;
  &lt;/template&gt;
&lt;/TemplateRenderer&gt;</code></pre>
          </div>
        </div>
      </section>

      <!-- 状态信息 -->
      <section class="demo-section">
        <h2>状态信息</h2>
        <div class="status-grid">
          <div class="status-item">
            <strong>当前设备：</strong>
            <span class="badge badge-primary">
              {{ deviceDisplayName }}
            </span>
          </div>

          <div class="status-item" v-if="currentTemplate">
            <strong>当前模板：</strong>
            <span class="badge badge-info">{{ currentTemplate.displayName }}</span>
          </div>

          <div class="status-item" v-if="loadingState">
            <strong>加载状态：</strong>
            <span class="badge badge-success">{{ loadingState }}</span>
          </div>

          <div class="status-item" v-if="errorMessage">
            <strong>错误信息：</strong>
            <span class="badge badge-danger">{{ errorMessage }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { TemplateRenderer, useTemplate } from '@ldesign/template'
import type { TemplateInfo, DeviceType } from '@ldesign/template'

// 使用模板管理器获取设备信息
const { currentDevice } = useTemplate()

// 响应式数据
const selectedTemplate = ref<string>('default')
const selectedDevice = ref<DeviceType>('desktop')
const currentTemplate = ref<TemplateInfo | null>(null)
const loadingState = ref<string>('')
const errorMessage = ref<string>('')

// 模板属性配置
const basicProps = ref({
  title: '欢迎登录',
  subtitle: '请输入您的账号信息',
  showRememberMe: true,
  showForgotPassword: true
})

const selectorProps = ref({
  title: '选择登录方式',
  subtitle: '您可以切换不同的登录模板',
  showRememberMe: true,
  showForgotPassword: true
})

const specificProps = ref({
  title: '指定模板演示',
  subtitle: '当前使用指定的模板和设备类型',
  showRememberMe: true,
  showForgotPassword: false
})

const customProps = ref({
  title: '自定义状态演示',
  subtitle: '展示自定义的加载和错误状态',
  showRememberMe: false,
  showForgotPassword: true
})

// 选择器配置
const selectorOptions = ref({
  position: 'top-right',
  theme: 'light',
  showPreview: true,
  allowDeviceSwitch: true
})

// 计算属性
const deviceDisplayName = computed(() => {
  const names = {
    desktop: '🖥️ 桌面端',
    tablet: '📱 平板端',
    mobile: '📱 移动端'
  }
  return names[currentDevice.value] || '未知设备'
})

// 事件处理
const handleTemplateLoaded = (template: TemplateInfo) => {
  try {
    currentTemplate.value = template
    loadingState.value = '加载完成'
    errorMessage.value = ''
    console.log('模板加载成功:', template)
  } catch (err) {
    console.error('处理模板加载事件时出错:', err)
    errorMessage.value = '处理模板加载事件失败'
  }
}

const handleTemplateChange = (template: TemplateInfo) => {
  try {
    currentTemplate.value = template
    console.log('模板切换:', template)
  } catch (err) {
    console.error('处理模板切换事件时出错:', err)
    errorMessage.value = '处理模板切换事件失败'
  }
}

const handleError = (error: Error) => {
  try {
    errorMessage.value = error?.message || '未知错误'
    loadingState.value = '加载失败'
    console.error('模板加载错误:', error)
  } catch (err) {
    console.error('处理错误事件时出错:', err)
    errorMessage.value = '处理错误事件失败'
  }
}

const updateSpecificTemplate = () => {
  try {
    // 更新指定模板的属性
    if (!selectedTemplate.value || !selectedDevice.value) {
      console.warn('模板名称或设备类型未选择')
      return
    }

    specificProps.value = {
      ...specificProps.value,
      title: `${selectedTemplate.value} - ${selectedDevice.value}`,
      subtitle: `当前模板: ${selectedTemplate.value}, 设备: ${selectedDevice.value}`
    }
  } catch (err) {
    console.error('更新指定模板属性时出错:', err)
    errorMessage.value = '更新模板属性失败'
  }
}

// 生命周期
onMounted(() => {
  console.log('组件演示页面已加载')
  loadingState.value = '初始化完成'
})
</script>

<!-- 使用共享样式系统，无需额外样式定义 -->
