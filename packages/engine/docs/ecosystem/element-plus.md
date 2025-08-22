# Element Plus 集成

LDesign Engine 与 Element Plus 完美集成，提供了丰富的 UI 组件和主题定制功能。

## 基础集成

### 安装和配置

```bash
# 安装 Element Plus
pnpm add element-plus

# 安装图标库
pnpm add @element-plus/icons-vue

# 安装自动导入插件（可选）
pnpm add -D unplugin-vue-components unplugin-auto-import
```

### 基础设置

```typescript
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { createEngine } from '@ldesign/engine'
import ElementPlus from 'element-plus'
// src/main.ts
import { createApp } from 'vue'
import App from './App.vue'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 注册 Element Plus
app.use(ElementPlus)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 创建引擎
const engine = createEngine({
  config: {
    appName: 'My App',
  },
})

app.use(engine)
app.mount('#app')
```

### 按需导入配置

```typescript
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
// vite.config.ts
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

## 主题集成

### 主题管理插件

```typescript
// src/plugins/theme-plugin.ts
import { createPlugin } from '@ldesign/engine'

export const themePlugin = createPlugin({
  name: 'element-theme',

  install: (engine) => {
    const theme = {
      // 当前主题
      current: 'light',

      // 可用主题
      themes: {
        light: {
          primary: '#409eff',
          success: '#67c23a',
          warning: '#e6a23c',
          danger: '#f56c6c',
          info: '#909399',
        },
        dark: {
          primary: '#409eff',
          success: '#67c23a',
          warning: '#e6a23c',
          danger: '#f56c6c',
          info: '#909399',
        },
      },

      // 设置主题
      setTheme(themeName: string) {
        this.current = themeName
        this.applyTheme(themeName)

        // 更新引擎状态
        engine.state.set('ui.theme', themeName)

        // 发送主题变更事件
        engine.events.emit('theme:changed', themeName)
      },

      // 应用主题
      applyTheme(themeName: string) {
        const themeConfig = this.themes[themeName]
        if (!themeConfig)
          return

        // 设置 CSS 变量
        const root = document.documentElement
        Object.entries(themeConfig).forEach(([key, value]) => {
          root.style.setProperty(`--el-color-${key}`, value)
        })

        // 设置 data-theme 属性
        document.documentElement.setAttribute('data-theme', themeName)

        // 更新 Element Plus 主题
        this.updateElementTheme(themeConfig)
      },

      // 更新 Element Plus 主题
      updateElementTheme(config: Record<string, string>) {
        // 动态更新 Element Plus CSS 变量
        const style = document.createElement('style')
        style.id = 'element-theme-vars'

        // 移除旧的样式
        const oldStyle = document.getElementById('element-theme-vars')
        if (oldStyle) {
          oldStyle.remove()
        }

        // 生成新的 CSS 变量
        const cssVars = Object.entries(config)
          .map(([key, value]) => `--el-color-${key}: ${value};`)
          .join('\n')

        style.textContent = `:root { ${cssVars} }`
        document.head.appendChild(style)
      },

      // 切换主题
      toggleTheme() {
        const nextTheme = this.current === 'light' ? 'dark' : 'light'
        this.setTheme(nextTheme)
      },

      // 获取当前主题配置
      getCurrentTheme() {
        return this.themes[this.current]
      },
    }

    // 挂载到引擎
    engine.theme = theme

    // 初始化主题
    const savedTheme = engine.state.get('ui.theme') || 'light'
    theme.setTheme(savedTheme)

    // 监听系统主题变化
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        if (!engine.state.get('ui.themeManual')) {
          theme.setTheme(e.matches ? 'dark' : 'light')
        }
      })
    }
  },
})
```

### 主题切换组件

```vue
<!-- src/components/ThemeToggle.vue -->
<script setup lang="ts">
import { Moon, Sunny } from '@element-plus/icons-vue'
import { useEngine } from '@ldesign/engine/vue'
import { computed } from 'vue'

const engine = useEngine()

const isDark = computed({
  get: () => engine.state.get('ui.theme') === 'dark',
  set: (value: boolean) => {
    const theme = value ? 'dark' : 'light'
    engine.theme.setTheme(theme)
    engine.state.set('ui.themeManual', true)
  },
})

function handleThemeChange(value: boolean) {
  const theme = value ? 'dark' : 'light'
  engine.theme.setTheme(theme)
  engine.notifications.success(`已切换到${theme === 'dark' ? '深色' : '浅色'}主题`)
}
</script>

<template>
  <el-switch
    v-model="isDark"
    inline-prompt
    :active-icon="Moon"
    :inactive-icon="Sunny"
    @change="handleThemeChange"
  />
</template>
```

## 通知系统集成

### Element Plus 通知插件

```typescript
import { createPlugin } from '@ldesign/engine'
// src/plugins/element-notifications.ts
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'

export const elementNotificationsPlugin = createPlugin({
  name: 'element-notifications',

  install: (engine) => {
    // 重写通知管理器
    engine.notifications = {
      // 消息提示
      success(message: string, options = {}) {
        return ElMessage.success({
          message,
          duration: 3000,
          showClose: true,
          ...options,
        })
      },

      error(message: string, options = {}) {
        return ElMessage.error({
          message,
          duration: 5000,
          showClose: true,
          ...options,
        })
      },

      warning(message: string, options = {}) {
        return ElMessage.warning({
          message,
          duration: 4000,
          showClose: true,
          ...options,
        })
      },

      info(message: string, options = {}) {
        return ElMessage.info({
          message,
          duration: 3000,
          showClose: true,
          ...options,
        })
      },

      // 通知
      notify: {
        success(title: string, message?: string, options = {}) {
          return ElNotification.success({
            title,
            message,
            duration: 4000,
            ...options,
          })
        },

        error(title: string, message?: string, options = {}) {
          return ElNotification.error({
            title,
            message,
            duration: 0, // 不自动关闭
            ...options,
          })
        },

        warning(title: string, message?: string, options = {}) {
          return ElNotification.warning({
            title,
            message,
            duration: 5000,
            ...options,
          })
        },

        info(title: string, message?: string, options = {}) {
          return ElNotification.info({
            title,
            message,
            duration: 4000,
            ...options,
          })
        },
      },

      // 确认对话框
      confirm(message: string, title = '确认', options = {}) {
        return ElMessageBox.confirm(message, title, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          ...options,
        })
      },

      // 提示对话框
      alert(message: string, title = '提示', options = {}) {
        return ElMessageBox.alert(message, title, {
          confirmButtonText: '确定',
          ...options,
        })
      },

      // 输入对话框
      prompt(message: string, title = '输入', options = {}) {
        return ElMessageBox.prompt(message, title, {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          ...options,
        })
      },
    }

    // 监听引擎事件，自动显示通知
    engine.events.on('user:login', (user) => {
      engine.notifications.success(`欢迎回来，${user.name}！`)
    })

    engine.events.on('user:logout', () => {
      engine.notifications.info('您已安全退出')
    })

    engine.events.on('error:occurred', (error) => {
      engine.notifications.error('操作失败', error.message)
    })
  },
})
```

## 表单集成

### 表单验证插件

```typescript
// src/plugins/form-validation.ts
import type { FormRules } from 'element-plus'
import { createPlugin } from '@ldesign/engine'

export const formValidationPlugin = createPlugin({
  name: 'form-validation',

  install: (engine) => {
    const validation = {
      // 常用验证规则
      rules: {
        required: { required: true, message: '此字段为必填项', trigger: 'blur' },
        email: { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
        phone: { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
        password: { min: 6, max: 20, message: '密码长度为6-20位', trigger: 'blur' },
        url: { type: 'url', message: '请输入正确的URL', trigger: 'blur' },
      },

      // 创建验证规则
      createRules(config: Record<string, any>): FormRules {
        const rules: FormRules = {}

        Object.entries(config).forEach(([field, ruleConfig]) => {
          rules[field] = Array.isArray(ruleConfig) ? ruleConfig : [ruleConfig]
        })

        return rules
      },

      // 自定义验证器
      validators: {
        // 确认密码验证
        confirmPassword: (password: string) => {
          return (rule: any, value: string, callback: Function) => {
            if (value !== password) {
              callback(new Error('两次输入的密码不一致'))
            }
            else {
              callback()
            }
          }
        },

        // 用户名验证
        username: (rule: any, value: string, callback: Function) => {
          if (!value) {
            callback(new Error('请输入用户名'))
          }
          else if (!/^\w{3,16}$/.test(value)) {
            callback(new Error('用户名只能包含字母、数字和下划线，长度3-16位'))
          }
          else {
            callback()
          }
        },

        // 异步验证用户名是否存在
        checkUsername: async (rule: any, value: string, callback: Function) => {
          if (!value) {
            callback()
            return
          }

          try {
            const exists = await engine.api.checkUsername(value)
            if (exists) {
              callback(new Error('用户名已存在'))
            }
            else {
              callback()
            }
          }
          catch (error) {
            callback(new Error('验证失败，请重试'))
          }
        },
      },
    }

    // 挂载到引擎
    engine.validation = validation
  },
})
```

### 表单组件示例

```vue
<!-- src/components/UserForm.vue -->
<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { useEngine } from '@ldesign/engine/vue'
import { computed, reactive, ref } from 'vue'

const engine = useEngine()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const rules = computed(() =>
  engine.validation.createRules({
    username: [
      engine.validation.rules.required,
      { validator: engine.validation.validators.username, trigger: 'blur' },
      { validator: engine.validation.validators.checkUsername, trigger: 'blur' },
    ],
    email: [engine.validation.rules.required, engine.validation.rules.email],
    password: [engine.validation.rules.required, engine.validation.rules.password],
    confirmPassword: [
      engine.validation.rules.required,
      { validator: engine.validation.validators.confirmPassword(form.password), trigger: 'blur' },
    ],
  })
)

async function handleSubmit() {
  if (!formRef.value)
    return

  try {
    await formRef.value.validate()

    loading.value = true

    // 提交表单
    await engine.api.createUser(form)

    engine.notifications.success('用户创建成功')

    // 重置表单
    handleReset()
  }
  catch (error) {
    if (error !== false) {
      // 不是验证错误
      engine.notifications.error('创建用户失败')
    }
  }
  finally {
    loading.value = false
  }
}

function handleReset() {
  formRef.value?.resetFields()
}
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
    @submit.prevent="handleSubmit"
  >
    <el-form-item label="用户名" prop="username">
      <el-input v-model="form.username" placeholder="请输入用户名" />
    </el-form-item>

    <el-form-item label="邮箱" prop="email">
      <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
    </el-form-item>

    <el-form-item label="密码" prop="password">
      <el-input v-model="form.password" type="password" placeholder="请输入密码" />
    </el-form-item>

    <el-form-item label="确认密码" prop="confirmPassword">
      <el-input v-model="form.confirmPassword" type="password" placeholder="请确认密码" />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        提交
      </el-button>
      <el-button @click="handleReset">
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>
```

## 表格集成

### 表格增强插件

```typescript
// src/plugins/table-enhancement.ts
import { createPlugin } from '@ldesign/engine'

export const tableEnhancementPlugin = createPlugin({
  name: 'table-enhancement',

  install: (engine) => {
    const table = {
      // 创建分页配置
      createPagination(total: number, pageSize = 10, currentPage = 1) {
        return {
          total,
          pageSize,
          currentPage,
          pageSizes: [10, 20, 50, 100],
          layout: 'total, sizes, prev, pager, next, jumper',
        }
      },

      // 处理排序
      handleSort(column: any, prop: string, order: string) {
        const sortConfig = {
          prop,
          order: order === 'ascending' ? 'asc' : 'desc',
        }

        engine.events.emit('table:sort-change', sortConfig)
        return sortConfig
      },

      // 处理筛选
      handleFilter(filters: Record<string, any>) {
        engine.events.emit('table:filter-change', filters)
        return filters
      },

      // 导出数据
      exportData(data: any[], filename = 'export.csv') {
        const csv = this.convertToCSV(data)
        this.downloadCSV(csv, filename)
      },

      // 转换为 CSV
      convertToCSV(data: any[]): string {
        if (!data.length)
          return ''

        const headers = Object.keys(data[0])
        const csvContent = [
          headers.join(','),
          ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(',')),
        ].join('\n')

        return csvContent
      },

      // 下载 CSV
      downloadCSV(csv: string, filename: string) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')

        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', filename)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      },
    }

    // 挂载到引擎
    engine.table = table
  },
})
```

## 最佳实践

### 1. 组件封装

```typescript
// 封装常用的 Element Plus 组件
export function useElementComponents() {
  const engine = useEngine()

  return {
    // 确认删除
    confirmDelete: (message = '确定要删除吗？') => {
      return engine.notifications.confirm(message, '删除确认', {
        type: 'warning',
      })
    },

    // 成功提示
    successMessage: (message: string) => {
      engine.notifications.success(message)
    },

    // 错误提示
    errorMessage: (message: string) => {
      engine.notifications.error(message)
    },
  }
}
```

### 2. 主题定制

```scss
// src/styles/element-variables.scss
@use 'element-plus/theme-chalk/src/common/var.scss' as *;

// 自定义主题变量
:root {
  --el-color-primary: #409eff;
  --el-color-success: #67c23a;
  --el-color-warning: #e6a23c;
  --el-color-danger: #f56c6c;
  --el-color-info: #909399;
}

// 深色主题
[data-theme='dark'] {
  --el-bg-color: #1a1a1a;
  --el-text-color-primary: #e5eaf3;
  --el-text-color-regular: #cfd3dc;
  --el-border-color: #4c4d4f;
}
```

### 3. 国际化

```typescript
import en from 'element-plus/dist/locale/en.mjs'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
// src/plugins/i18n.ts
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'zh-cn',
  messages: {
    'zh-cn': {
      el: zhCn.el,
      // 自定义消息
    },
    'en': {
      el: en.el,
      // 自定义消息
    },
  },
})

// 在 Element Plus 中使用
app.use(ElementPlus, {
  locale: zhCn,
})
```

通过这些集成方式，你可以充分利用 Element Plus 的丰富组件，同时享受 LDesign Engine 提供的强大功能。
