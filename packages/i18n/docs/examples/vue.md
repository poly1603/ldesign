# Vue 项目示例

本页面展示了如何在 Vue 3 项目中使用 @ldesign/i18n 的完整示例。

## 完整项目结构

```
vue-i18n-example/
├── src/
│   ├── components/
│   │   ├── LanguageSwitcher.vue
│   │   ├── UserProfile.vue
│   │   └── ProductCard.vue
│   ├── locales/
│   │   ├── zh-CN.json
│   │   ├── en.json
│   │   └── index.ts
│   ├── i18n/
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── package.json
└── vite.config.ts
```

## 1. 项目配置

### package.json

```json
{
  "name": "vue-i18n-example",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "@ldesign/i18n": "^2.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^4.0.0"
  }
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    // 环境变量配置
    __I18N_DEFAULT_LOCALE__: JSON.stringify('zh-CN'),
    __I18N_FALLBACK_LOCALE__: JSON.stringify('en')
  }
})
```

## 2. 语言包配置

### src/locales/zh-CN.json

```json
{
  "common": {
    "save": "保存",
    "cancel": "取消",
    "confirm": "确认",
    "delete": "删除",
    "edit": "编辑",
    "loading": "加载中..."
  },
  "nav": {
    "home": "首页",
    "products": "产品",
    "about": "关于我们",
    "contact": "联系我们"
  },
  "user": {
    "profile": "用户资料",
    "name": "姓名",
    "email": "邮箱",
    "phone": "电话",
    "welcome": "欢迎回来，{name}！",
    "lastLogin": "上次登录：{date}"
  },
  "product": {
    "title": "产品名称",
    "price": "价格",
    "description": "产品描述",
    "addToCart": "加入购物车",
    "outOfStock": "缺货",
    "discount": "折扣 {percent}%"
  },
  "validation": {
    "required": "此字段为必填项",
    "email": "请输入有效的邮箱地址",
    "minLength": "最少需要 {min} 个字符",
    "maxLength": "最多允许 {max} 个字符"
  }
}
```

### src/locales/en.json

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading..."
  },
  "nav": {
    "home": "Home",
    "products": "Products",
    "about": "About Us",
    "contact": "Contact Us"
  },
  "user": {
    "profile": "User Profile",
    "name": "Name",
    "email": "Email",
    "phone": "Phone",
    "welcome": "Welcome back, {name}!",
    "lastLogin": "Last login: {date}"
  },
  "product": {
    "title": "Product Name",
    "price": "Price",
    "description": "Product Description",
    "addToCart": "Add to Cart",
    "outOfStock": "Out of Stock",
    "discount": "{percent}% Off"
  },
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email address",
    "minLength": "Minimum {min} characters required",
    "maxLength": "Maximum {max} characters allowed"
  }
}
```

### src/locales/index.ts

```typescript
import zhCN from './zh-CN.json'
import en from './en.json'

export const messages = {
  'zh-CN': zhCN,
  'en': en
}

export const availableLocales = [
  { code: 'zh-CN', name: '中文' },
  { code: 'en', name: 'English' }
]
```

## 3. I18n 配置

### src/i18n/index.ts

```typescript
import { createI18nPlugin } from '@ldesign/i18n/vue'
import { messages } from '../locales'

export const i18nPlugin = createI18nPlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages,
  
  // 存储配置
  storage: 'localStorage',
  storageKey: 'app-locale',
  
  // 自动检测用户语言
  autoDetect: true,
  
  // 缓存配置
  cache: {
    enabled: true,
    maxSize: 1000,
    defaultTTL: 60 * 60 * 1000 // 1小时
  },
  
  // 回调函数
  onLanguageChanged: (locale) => {
    document.documentElement.lang = locale
    console.log('Language changed to:', locale)
  },
  
  onLoadError: (error) => {
    console.error('Failed to load language pack:', error)
  }
})
```

## 4. 主应用配置

### src/main.ts

```typescript
import { createApp } from 'vue'
import App from './App.vue'
import { i18nPlugin } from './i18n'

const app = createApp(App)

// 安装 I18n 插件
app.use(i18nPlugin)

app.mount('#app')
```

## 5. 组件示例

### src/components/LanguageSwitcher.vue

```vue
<template>
  <div class="language-switcher">
    <label>{{ t('common.language') }}:</label>
    <select :value="locale" @change="handleLanguageChange">
      <option 
        v-for="lang in availableLocales" 
        :key="lang.code" 
        :value="lang.code"
      >
        {{ lang.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'
import { availableLocales } from '../locales'

const { t, locale, setLocale } = useI18n()

const handleLanguageChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  await setLocale(target.value)
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
}

select {
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
```

### src/components/UserProfile.vue

```vue
<template>
  <div class="user-profile">
    <h2>{{ t('user.profile') }}</h2>
    
    <!-- 使用组合式 API -->
    <div class="welcome-message">
      {{ t('user.welcome', { name: user.name }) }}
    </div>
    
    <!-- 使用组件 -->
    <div class="last-login">
      <I18nT 
        keypath="user.lastLogin" 
        :params="{ date: formatDate(user.lastLogin) }" 
      />
    </div>
    
    <!-- 使用指令 -->
    <form @submit.prevent="saveProfile">
      <div class="form-group">
        <label v-t="'user.name'"></label>
        <input 
          v-model="user.name" 
          :placeholder="t('user.name')"
          required
        />
      </div>
      
      <div class="form-group">
        <label v-t="'user.email'"></label>
        <input 
          v-model="user.email" 
          type="email"
          :placeholder="t('user.email')"
          required
        />
      </div>
      
      <div class="form-group">
        <label v-t="'user.phone'"></label>
        <input 
          v-model="user.phone" 
          :placeholder="t('user.phone')"
        />
      </div>
      
      <div class="form-actions">
        <button type="submit" v-t="'common.save'"></button>
        <button type="button" v-t="'common.cancel'" @click="resetForm"></button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'

const { t } = useI18n()

const user = reactive({
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000',
  lastLogin: new Date('2024-01-15T10:30:00')
})

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const saveProfile = () => {
  console.log('Saving profile:', user)
  // 保存逻辑
}

const resetForm = () => {
  // 重置表单逻辑
}
</script>

<style scoped>
.user-profile {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-message {
  background: #f0f9ff;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  color: #0369a1;
}

.last-login {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.form-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.form-actions button[type="submit"] {
  background: #3b82f6;
  color: white;
}

.form-actions button[type="button"] {
  background: #6b7280;
  color: white;
}
</style>
```

### src/components/ProductCard.vue

```vue
<template>
  <div class="product-card">
    <div class="product-image">
      <img :src="product.image" :alt="product.title" />
      
      <!-- 折扣标签 -->
      <div v-if="product.discount" class="discount-badge">
        <I18nT 
          keypath="product.discount" 
          :params="{ percent: product.discount }" 
        />
      </div>
    </div>
    
    <div class="product-info">
      <h3 class="product-title">{{ product.title }}</h3>
      <p class="product-description">{{ product.description }}</p>
      
      <!-- 价格显示 -->
      <div class="product-price">
        <I18nN 
          :value="product.price" 
          format="currency" 
          currency="CNY" 
        />
      </div>
      
      <!-- 操作按钮 -->
      <div class="product-actions">
        <button 
          v-if="product.inStock" 
          class="add-to-cart-btn"
          @click="addToCart"
        >
          {{ t('product.addToCart') }}
        </button>
        <button v-else class="out-of-stock-btn" disabled>
          {{ t('product.outOfStock') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue'

interface Product {
  id: string
  title: string
  description: string
  price: number
  image: string
  inStock: boolean
  discount?: number
}

const props = defineProps<{
  product: Product
}>()

const { t } = useI18n()

const addToCart = () => {
  console.log('Adding to cart:', props.product.id)
  // 添加到购物车逻辑
}
</script>

<style scoped>
.product-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.product-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #ef4444;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.product-info {
  padding: 16px;
}

.product-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #111827;
}

.product-description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 12px;
  line-height: 1.5;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: #059669;
  margin-bottom: 16px;
}

.product-actions button {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-to-cart-btn {
  background: #3b82f6;
  color: white;
}

.add-to-cart-btn:hover {
  background: #2563eb;
}

.out-of-stock-btn {
  background: #9ca3af;
  color: white;
  cursor: not-allowed;
}
</style>
```

## 6. 主应用组件

### src/App.vue

```vue
<template>
  <div id="app">
    <header class="app-header">
      <nav class="app-nav">
        <div class="nav-brand">
          <h1>{{ t('nav.home') }}</h1>
        </div>
        
        <div class="nav-links">
          <a href="#" v-t="'nav.home'"></a>
          <a href="#" v-t="'nav.products'"></a>
          <a href="#" v-t="'nav.about'"></a>
          <a href="#" v-t="'nav.contact'"></a>
        </div>
        
        <LanguageSwitcher />
      </nav>
    </header>
    
    <main class="app-main">
      <UserProfile />
      
      <section class="products-section">
        <h2 v-t="'nav.products'"></h2>
        <div class="products-grid">
          <ProductCard 
            v-for="product in products" 
            :key="product.id" 
            :product="product" 
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@ldesign/i18n/vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'
import UserProfile from './components/UserProfile.vue'
import ProductCard from './components/ProductCard.vue'

const { t } = useI18n()

const products = ref([
  {
    id: '1',
    title: 'iPhone 15 Pro',
    description: '最新的 iPhone，配备 A17 Pro 芯片',
    price: 7999,
    image: '/images/iphone15pro.jpg',
    inStock: true,
    discount: 10
  },
  {
    id: '2',
    title: 'MacBook Air M2',
    description: '轻薄便携的笔记本电脑',
    price: 8999,
    image: '/images/macbook-air.jpg',
    inStock: false
  },
  {
    id: '3',
    title: 'AirPods Pro',
    description: '主动降噪无线耳机',
    price: 1899,
    image: '/images/airpods-pro.jpg',
    inStock: true
  }
])
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
}

.app-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 20px;
}

.app-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
  height: 64px;
}

.nav-brand h1 {
  color: #3b82f6;
  font-size: 24px;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  text-decoration: none;
  color: #374151;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #3b82f6;
}

.app-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.products-section {
  margin-top: 60px;
}

.products-section h2 {
  font-size: 28px;
  margin-bottom: 24px;
  color: #111827;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}
</style>
```

## 7. 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

这个完整的示例展示了如何在 Vue 3 项目中使用 @ldesign/i18n 的所有主要功能，包括组合式 API、组件、指令、格式化等。
