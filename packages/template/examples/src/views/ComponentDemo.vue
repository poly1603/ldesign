<script setup lang="ts">
import { ref } from 'vue'
import { TemplateRenderer } from '@ldesign/template/vue'

// TemplateRenderer 组件演示页面加载

// 事件日志
const events = ref<Array<{ time: string, type: string, data: string }>>([])

// 自定义配置
const customConfig = {
  title: '自定义登录',
  subtitle: '这是使用自定义配置的模板',
  showThirdPartyLogin: false,
  showRememberMe: true,
}

// 添加事件到日志
function addEvent(type: string, data: any) {
  const time = new Date().toLocaleTimeString()
  events.value.unshift({
    time,
    type,
    data: JSON.stringify(data, null, 2),
  })

  // 限制日志数量
  if (events.value.length > 10) {
    events.value = events.value.slice(0, 10)
  }
}

// 事件处理函数
function handleLogin(data: any) {
  addEvent('登录', data)
  alert(`登录成功！\n用户名: ${data.username}`)
}

function handleRegister() {
  addEvent('注册', {})
  alert('跳转到注册页面')
}

function handleForgotPassword(data: any) {
  addEvent('忘记密码', data)
  alert(`重置密码链接已发送到与用户名 "${data.username}" 关联的邮箱`)
}

function handleThirdPartyLogin(data: any) {
  addEvent('第三方登录', data)
  alert(`使用 ${data.provider} 登录`)
}

function handleTemplateChange(templateId: string) {
  addEvent('模板切换', { templateId })
}

function handleDeviceChange(device: string) {
  addEvent('设备切换', { device })
}

// 清空事件日志
function clearEvents() {
  events.value = []
}
</script>

<template>
  <div class="component-demo">
    <div class="component-demo__header">
      <div class="component-demo__container">
        <router-link to="/" class="component-demo__back">
          ← 返回首页
        </router-link>
        <h1 class="component-demo__title">
          🧩 TemplateRenderer 组件演示
        </h1>
        <p class="component-demo__subtitle">
          使用声明式组件快速渲染模板
        </p>
      </div>
    </div>

    <div class="component-demo__content">
      <div class="component-demo__container">
        <div class="component-demo__section">
          <h2>基础用法</h2>
          <p>最简单的使用方式，只需要指定模板类别：</p>

          <div class="component-demo__example">
            <div class="component-demo__preview">
              <TemplateRenderer
                category="login"
                @login="handleLogin"
                @register="handleRegister"
                @forgot-password="handleForgotPassword"
                @third-party-login="handleThirdPartyLogin"
              />
            </div>

            <div class="component-demo__code">
              <pre><code>&lt;TemplateRenderer
  category="login"
  @login="handleLogin"
  @register="handleRegister"
/&gt;</code></pre>
            </div>
          </div>
        </div>

        <div class="component-demo__section">
          <h2>带选择器的用法</h2>
          <p>显示模板选择器，用户可以自由切换模板：</p>

          <div class="component-demo__example">
            <div class="component-demo__preview">
              <TemplateRenderer
                category="login"
                :show-selector="true"
                selector-position="top"
                @login="handleLogin"
                @register="handleRegister"
                @forgot-password="handleForgotPassword"
                @third-party-login="handleThirdPartyLogin"
                @template-change="handleTemplateChange"
              />
            </div>

            <div class="component-demo__code">
              <pre><code>&lt;TemplateRenderer
  category="login"
  :show-selector="true"
  selector-position="top"
  @template-change="handleTemplateChange"
/&gt;</code></pre>
            </div>
          </div>
        </div>

        <div class="component-demo__section">
          <h2>自动设备检测</h2>
          <p>启用自动设备检测，根据屏幕尺寸自动切换模板：</p>

          <div class="component-demo__example">
            <div class="component-demo__preview">
              <TemplateRenderer
                category="login"
                :show-selector="true"
                :auto-detect-device="true"
                @login="handleLogin"
                @register="handleRegister"
                @forgot-password="handleForgotPassword"
                @third-party-login="handleThirdPartyLogin"
                @device-change="handleDeviceChange"
              />
            </div>

            <div class="component-demo__code">
              <pre><code>&lt;TemplateRenderer
  category="login"
  :show-selector="true"
  :auto-detect-device="true"
  @device-change="handleDeviceChange"
/&gt;</code></pre>
            </div>
          </div>
        </div>

        <div class="component-demo__section">
          <h2>自定义配置</h2>
          <p>传入自定义配置来覆盖默认设置：</p>

          <div class="component-demo__example">
            <div class="component-demo__preview">
              <TemplateRenderer
                category="login"
                :show-selector="true"
                :config="customConfig"
                @login="handleLogin"
                @register="handleRegister"
                @forgot-password="handleForgotPassword"
                @third-party-login="handleThirdPartyLogin"
              />
            </div>

            <div class="component-demo__code">
              <pre><code>&lt;TemplateRenderer
  category="login"
  :show-selector="true"
  :config="customConfig"
/&gt;

// 自定义配置
const customConfig = {
  title: '自定义标题',
  subtitle: '这是自定义的副标题',
  showThirdPartyLogin: false
}</code></pre>
            </div>
          </div>
        </div>

        <div class="component-demo__events">
          <h2>事件日志</h2>
          <div class="component-demo__event-log">
            <div v-if="events.length === 0" class="component-demo__no-events">
              暂无事件，请与模板进行交互
            </div>
            <div
              v-for="(event, index) in events"
              :key="index"
              class="component-demo__event-item"
            >
              <span class="component-demo__event-time">{{ event.time }}</span>
              <span class="component-demo__event-type">{{ event.type }}</span>
              <span class="component-demo__event-data">{{ event.data }}</span>
            </div>
          </div>
          <button class="component-demo__clear-btn" @click="clearEvents">
            清空日志
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.component-demo {
  min-height: 100vh;
  background: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &__header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px 0;
  }

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  &__back {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 14px;
    margin-bottom: 20px;
    display: inline-block;
    transition: color 0.3s ease;

    &:hover {
      color: white;
    }
  }

  &__title {
    font-size: 36px;
    font-weight: 700;
    margin: 0 0 12px 0;
  }

  &__subtitle {
    font-size: 18px;
    opacity: 0.9;
    margin: 0;
  }

  &__content {
    padding: 40px 0;
  }

  &__section {
    background: white;
    border-radius: 16px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #333;
    }

    p {
      font-size: 16px;
      color: #666;
      margin: 0 0 24px 0;
      line-height: 1.6;
    }
  }

  &__example {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    align-items: start;
  }

  &__preview {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 20px;
    min-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__code {
    background: #2d3748;
    color: #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    line-height: 1.5;
    overflow-x: auto;

    pre {
      margin: 0;
      white-space: pre-wrap;
    }

    code {
      background: none;
      color: inherit;
      padding: 0;
      font-size: inherit;
    }
  }

  &__events {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

    h2 {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 20px 0;
      color: #333;
    }
  }

  &__event-log {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 20px;
    max-height: 300px;
    overflow-y: auto;
    margin-bottom: 20px;
  }

  &__no-events {
    text-align: center;
    color: #666;
    font-style: italic;
    padding: 20px;
  }

  &__event-item {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 12px;
    padding: 12px;
    background: white;
    border-radius: 6px;
    margin-bottom: 8px;
    font-size: 14px;
    align-items: start;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__event-time {
    color: #666;
    font-family: monospace;
    white-space: nowrap;
  }

  &__event-type {
    background: #667eea;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
  }

  &__event-data {
    color: #333;
    font-family: monospace;
    font-size: 12px;
    word-break: break-all;
  }

  &__clear-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background: #c82333;
    }
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .component-demo {
    &__example {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    &__preview {
      min-height: 300px;
    }

    &__event-item {
      grid-template-columns: 1fr;
      gap: 8px;
    }

    &__event-time,
    &__event-type {
      justify-self: start;
    }
  }
}
</style>
