# Vue I18n 高级功能使用示例

本文档提供了 @ldesign/i18n 高级功能的完整使用示例，展示如何在实际项目中使用这些强大的功能。

## 🚀 完整项目示例

### 1. 项目设置

```typescript
// main.ts
import { createApp } from 'vue'
import { createI18nPlugin, installI18nDevTools } from '@ldesign/i18n/vue'
import App from './App.vue'

const app = createApp(App)

// 创建 I18n 插件
const i18n = createI18nPlugin({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      // 基础翻译
      common: {
        hello: '你好',
        welcome: '欢迎 {name}',
        loading: '加载中...',
        error: '出错了',
        success: '成功'
      },
      
      // 表单验证
      validation: {
        required: '{field}是必填项',
        email: '{field}必须是有效的邮箱地址',
        minLength: '{field}长度不能少于{minLength}个字符',
        maxLength: '{field}长度不能超过{maxLength}个字符'
      },
      
      // 字段标签
      fields: {
        username: '用户名',
        email: '邮箱地址',
        password: '密码',
        confirmPassword: '确认密码'
      },
      
      // 路由标题
      routes: {
        titles: {
          home: '首页',
          about: '关于我们',
          contact: '联系我们',
          profile: '个人资料',
          settings: '设置'
        },
        breadcrumbs: {
          home: '首页',
          about: '关于',
          contact: '联系',
          profile: '资料',
          settings: '设置'
        }
      },
      
      // 条件翻译
      status: {
        online: '在线',
        offline: '离线',
        busy: '忙碌'
      },
      
      // 动态翻译链
      user: {
        role: {
          admin: 'permissions.admin',
          user: 'permissions.user',
          guest: 'permissions.guest'
        }
      },
      
      permissions: {
        admin: '管理员权限',
        user: '用户权限',
        guest: '访客权限'
      }
    },
    'en': {
      // English translations...
      common: {
        hello: 'Hello',
        welcome: 'Welcome {name}',
        loading: 'Loading...',
        error: 'Error occurred',
        success: 'Success'
      },
      // ... 其他英文翻译
    }
  }
})

app.use(i18n)

// 开发模式下安装开发工具
if (process.env.NODE_ENV === 'development') {
  installI18nDevTools(app, i18n, {
    trackTranslations: true,
    trackPerformance: true,
    trackMissing: true,
    trackCoverage: true,
    trackQuality: true,
    verbose: true,
    autoReport: true,
    reportInterval: 30000 // 30秒生成一次报告
  })
}

app.mount('#app')
```

### 2. 电商产品页面示例

```vue
<!-- ProductPage.vue -->
<template>
  <div class="product-page">
    <!-- 面包屑导航 -->
    <nav class="breadcrumb">
      <span 
        v-for="(item, index) in breadcrumbs" 
        :key="item.name"
        :class="{ active: item.active }"
      >
        {{ item.title }}
        <span v-if="index < breadcrumbs.length - 1"> / </span>
      </span>
    </nav>

    <!-- 产品信息 -->
    <div class="product-info">
      <h1>{{ productTitle }}</h1>
      
      <!-- 价格显示 -->
      <div class="price">
        <I18nC 
          :value="product.price" 
          :currency="userCurrency" 
          :precision="2"
          show-code
        />
        
        <!-- 折扣价格 -->
        <I18nC 
          v-if="product.discountPrice" 
          :value="product.discountPrice" 
          :currency="userCurrency"
          class="discount-price"
        />
      </div>

      <!-- 库存状态 -->
      <div class="stock-status">
        <I18nIf 
          :conditions="[
            { when: 'stock > 10', keypath: 'product.stock.plenty', priority: 10 },
            { when: 'stock > 0', keypath: 'product.stock.limited', priority: 5 },
            { when: 'stock === 0', keypath: 'product.stock.outOfStock', priority: 1 }
          ]"
          :context="{ stock: product.stock }"
          :params="{ count: product.stock }"
        />
      </div>

      <!-- 用户评分 -->
      <div class="rating">
        <I18nP 
          keypath="product.reviews" 
          :count="product.reviewCount"
          :params="{ rating: product.rating }"
        />
      </div>

      <!-- 最后更新时间 -->
      <div class="last-updated">
        <span>{{ t('product.lastUpdated') }}: </span>
        <I18nDT 
          :value="product.updatedAt" 
          format="relative"
          :update-interval="60000"
        />
      </div>
    </div>

    <!-- 产品规格表 -->
    <div class="specifications">
      <h3>{{ t('product.specifications') }}</h3>
      <table>
        <tr v-for="spec in product.specifications" :key="spec.key">
          <td>{{ getFieldLabel(spec.key) }}</td>
          <td>
            <!-- 根据规格类型显示不同格式 -->
            <I18nIf 
              :conditions="[
                { when: 'type === \"weight\"', keypath: 'units.weight' },
                { when: 'type === \"dimension\"', keypath: 'units.dimension' },
                { when: 'type === \"date\"', keypath: 'units.date' }
              ]"
              :context="{ type: spec.type }"
              :params="{ value: spec.value }"
              :default-keypath="'common.value'"
            />
          </td>
        </tr>
      </table>
    </div>

    <!-- 购买表单 -->
    <form @submit.prevent="handlePurchase" class="purchase-form">
      <div class="form-group">
        <label>{{ getFieldLabel('quantity') }}</label>
        <input 
          v-model="form.quantity" 
          type="number" 
          :placeholder="getFieldPlaceholder('quantity')"
          @blur="validateField('quantity')"
        />
        <div v-if="hasFieldError('quantity')" class="error">
          {{ getFirstFieldError('quantity') }}
        </div>
      </div>

      <div class="form-group">
        <label>{{ getFieldLabel('deliveryAddress') }}</label>
        <textarea 
          v-model="form.deliveryAddress"
          :placeholder="getFieldPlaceholder('deliveryAddress')"
          @blur="validateField('deliveryAddress')"
        />
        <div v-if="hasFieldError('deliveryAddress')" class="error">
          {{ getFirstFieldError('deliveryAddress') }}
        </div>
      </div>

      <button type="submit" :disabled="hasErrors">
        {{ t('product.addToCart') }}
      </button>
    </form>

    <!-- 相关产品 -->
    <div class="related-products">
      <h3>{{ t('product.relatedProducts') }}</h3>
      <I18nL 
        :items="relatedProductNames" 
        type="conjunction"
        :max-items="3"
        more-text-key="product.moreProducts"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  useI18n, 
  useI18nValidation, 
  useI18nRouter,
  I18nC, I18nDT, I18nIf, I18nP, I18nL
} from '@ldesign/i18n/vue'

// 基础 I18n
const { t } = useI18n()

// 表单验证
const validation = useI18nValidation({
  defaultMessagePrefix: 'validation',
  labelPrefix: 'fields'
})

// 路由管理
const router = useI18nRouter({
  titlePrefix: 'routes.titles',
  breadcrumbPrefix: 'routes.breadcrumbs'
})

// 注册字段
validation.registerFields([
  {
    name: 'quantity',
    labelKey: 'fields.quantity',
    rules: ['required', 'min'],
    messageKeyPrefix: 'validation.product'
  },
  {
    name: 'deliveryAddress',
    labelKey: 'fields.deliveryAddress',
    rules: ['required', 'minLength'],
    messageKeyPrefix: 'validation.address'
  }
])

// 注册路由
router.registerRoutes([
  { name: 'home', path: '/', titleKey: 'routes.titles.home' },
  { name: 'products', path: '/products', titleKey: 'routes.titles.products', parent: 'home' },
  { name: 'product', path: '/products/:id', titleKey: 'routes.titles.product', parent: 'products' }
])

// 响应式数据
const product = ref({
  id: 1,
  name: 'Amazing Product',
  price: 299.99,
  discountPrice: 199.99,
  stock: 5,
  rating: 4.5,
  reviewCount: 128,
  updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
  specifications: [
    { key: 'weight', value: '2.5kg', type: 'weight' },
    { key: 'dimensions', value: '30x20x10cm', type: 'dimension' },
    { key: 'releaseDate', value: '2023-12-01', type: 'date' }
  ]
})

const form = ref({
  quantity: 1,
  deliveryAddress: ''
})

const userCurrency = ref('USD')
const relatedProductNames = ref(['Product A', 'Product B', 'Product C', 'Product D'])

// 计算属性
const productTitle = computed(() => {
  return t('product.title', { name: product.value.name })
})

const breadcrumbs = computed(() => {
  return router.generateBreadcrumbs('product', { id: product.value.id })
})

// 验证方法
const { 
  getFieldLabel, 
  getFieldPlaceholder, 
  getFirstFieldError, 
  hasFieldError,
  hasErrors,
  addValidationError,
  removeValidationError
} = validation

// 字段验证
function validateField(fieldName: string) {
  removeValidationError(fieldName)
  
  const value = form.value[fieldName as keyof typeof form.value]
  
  if (fieldName === 'quantity') {
    if (!value || value <= 0) {
      addValidationError('quantity', 'required')
    } else if (value > product.value.stock) {
      addValidationError('quantity', 'max', { max: product.value.stock })
    }
  }
  
  if (fieldName === 'deliveryAddress') {
    if (!value || value.length === 0) {
      addValidationError('deliveryAddress', 'required')
    } else if (value.length < 10) {
      addValidationError('deliveryAddress', 'minLength', { minLength: 10 })
    }
  }
}

// 购买处理
function handlePurchase() {
  // 验证所有字段
  Object.keys(form.value).forEach(validateField)
  
  if (!hasErrors.value) {
    console.log('购买成功!', form.value)
  }
}

// 组件挂载
onMounted(() => {
  router.setCurrentRoute('product')
})
</script>

<style lang="less">
.product-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--ls-padding-base);
  
  .breadcrumb {
    margin-bottom: var(--ls-margin-base);
    color: var(--ldesign-text-color-secondary);
    
    .active {
      color: var(--ldesign-text-color-primary);
      font-weight: 500;
    }
  }
  
  .product-info {
    margin-bottom: var(--ls-margin-lg);
    
    h1 {
      color: var(--ldesign-text-color-primary);
      margin-bottom: var(--ls-margin-sm);
    }
    
    .price {
      font-size: var(--ls-font-size-xl);
      margin-bottom: var(--ls-margin-sm);
      
      .discount-price {
        text-decoration: line-through;
        color: var(--ldesign-text-color-placeholder);
        margin-left: var(--ls-margin-xs);
      }
    }
    
    .stock-status {
      padding: var(--ls-padding-xs) var(--ls-padding-sm);
      border-radius: var(--ls-border-radius-base);
      background: var(--ldesign-bg-color-component);
      margin-bottom: var(--ls-margin-sm);
    }
  }
  
  .purchase-form {
    background: var(--ldesign-bg-color-container);
    padding: var(--ls-padding-base);
    border-radius: var(--ls-border-radius-base);
    margin-bottom: var(--ls-margin-lg);
    
    .form-group {
      margin-bottom: var(--ls-margin-base);
      
      label {
        display: block;
        margin-bottom: var(--ls-margin-xs);
        color: var(--ldesign-text-color-primary);
        font-weight: 500;
      }
      
      input, textarea {
        width: 100%;
        padding: var(--ls-padding-sm);
        border: 1px solid var(--ldesign-border-color);
        border-radius: var(--ls-border-radius-base);
        
        &:focus {
          border-color: var(--ldesign-brand-color);
          outline: none;
        }
      }
      
      .error {
        color: var(--ldesign-error-color);
        font-size: var(--ls-font-size-sm);
        margin-top: var(--ls-margin-xs);
      }
    }
    
    button {
      background: var(--ldesign-brand-color);
      color: var(--ldesign-font-white-1);
      border: none;
      padding: var(--ls-padding-sm) var(--ls-padding-base);
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      
      &:disabled {
        background: var(--ldesign-brand-color-disabled);
        cursor: not-allowed;
      }
      
      &:hover:not(:disabled) {
        background: var(--ldesign-brand-color-hover);
      }
    }
  }
  
  .specifications {
    margin-bottom: var(--ls-margin-lg);
    
    table {
      width: 100%;
      border-collapse: collapse;
      
      td {
        padding: var(--ls-padding-sm);
        border-bottom: 1px solid var(--ldesign-border-color);
        
        &:first-child {
          font-weight: 500;
          color: var(--ldesign-text-color-primary);
        }
      }
    }
  }
  
  .related-products {
    h3 {
      margin-bottom: var(--ls-margin-sm);
    }
  }
}
</style>
```

## 🎯 高级功能详解

### 1. 货币格式化 (I18nC)

```vue
<template>
  <!-- 基础货币显示 -->
  <I18nC :value="1234.56" currency="USD" />
  <!-- 输出: $1,234.56 -->
  
  <!-- 显示货币代码 -->
  <I18nC :value="999" currency="EUR" show-code />
  <!-- 输出: €999.00 (EUR) -->
  
  <!-- 自定义精度 -->
  <I18nC :value="123.456" currency="JPY" :precision="0" />
  <!-- 输出: ¥123 -->
  
  <!-- 百分比格式 -->
  <I18nC :value="0.15" style="percent" />
  <!-- 输出: 15% -->
</template>
```

### 2. 日期时间格式化 (I18nDT)

```vue
<template>
  <!-- 相对时间（自动更新） -->
  <I18nDT :value="pastDate" format="relative" :update-interval="30000" />
  <!-- 输出: 2 minutes ago -->
  
  <!-- 完整日期时间 -->
  <I18nDT :value="new Date()" format="full" show-time-zone />
  <!-- 输出: Friday, December 25, 2023 at 10:30:00 AM GMT+8 -->
  
  <!-- 自定义格式 -->
  <I18nDT :value="date" format="custom" template="YYYY年MM月DD日 HH:mm" />
  <!-- 输出: 2023年12月25日 10:30 -->
  
  <!-- 时区转换 -->
  <I18nDT :value="utcDate" time-zone="Asia/Shanghai" />
  <!-- 自动转换为上海时区 -->
</template>
```

### 3. 条件翻译 (I18nIf)

```vue
<template>
  <!-- 基于数值的条件翻译 -->
  <I18nIf 
    :conditions="[
      { when: 'score >= 90', keypath: 'grade.excellent', priority: 10 },
      { when: 'score >= 80', keypath: 'grade.good', priority: 8 },
      { when: 'score >= 60', keypath: 'grade.pass', priority: 5 },
      { when: 'score < 60', keypath: 'grade.fail', priority: 1 }
    ]"
    :context="{ score: userScore }"
    :params="{ score: userScore }"
  />
  
  <!-- 基于用户状态的条件翻译 -->
  <I18nIf 
    :conditions="[
      { 
        when: (ctx) => ctx.user.isVip && ctx.user.isActive, 
        keypath: 'status.vip',
        priority: 10
      },
      { 
        when: (ctx) => ctx.user.isActive, 
        keypath: 'status.active',
        priority: 5
      }
    ]"
    :context="{ user }"
    default-keypath="status.inactive"
  />
</template>
```

### 4. 翻译链 (I18nChain)

```vue
<template>
  <!-- 动态翻译链 -->
  <I18nChain keypath="user.role" :params="{ userId: currentUser.id }" />
  <!-- 
    翻译过程:
    1. user.role -> "permissions.admin"
    2. permissions.admin -> "管理员权限"
  -->
  
  <!-- 预定义翻译链 -->
  <I18nChain 
    :chain="['step1', 'step2', 'step3']"
    param-mode="accumulate"
  />
  
  <!-- 带循环检测的翻译链 -->
  <I18nChain 
    keypath="dynamic.key"
    :max-depth="5"
    circular-detection
    debug
  />
</template>
```

这些高级功能让 @ldesign/i18n 成为了一个功能完整、性能优秀的企业级国际化解决方案，能够满足各种复杂的多语言需求。
