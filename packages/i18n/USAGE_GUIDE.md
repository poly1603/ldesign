# @ldesign/i18n 使用指南

## 📦 安装

```bash
npm install @ldesign/i18n
# or
pnpm add @ldesign/i18n
# or
yarn add @ldesign/i18n
```

## 🚀 在 Vue 3 中使用

### 基础设置

```typescript
// main.ts
import { createApp } from 'vue';
import { setupI18n } from '@ldesign/i18n/vue';
import App from './App.vue';

// 导入预设翻译
import zhCN from '@ldesign/i18n/presets/zh-CN/common';
import enUS from '@ldesign/i18n/presets/en-US/common';

const app = createApp(App);

// 设置 i18n
const i18n = setupI18n(app, {
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
});

app.mount('#app');
```

### 在 Vue 组件中使用

#### 使用 Composition API

```vue
<template>
  <div>
    <!-- 使用翻译函数 -->
    <h1>{{ t('navigation.home') }}</h1>
    <p>{{ t('message.welcome', { name: userName }) }}</p>
    
    <!-- 使用组件 -->
    <I18nText keypath="actions.confirm" />
    
    <!-- 复数化 -->
    <p>{{ tc('items', itemCount, { count: itemCount }) }}</p>
    
    <!-- 格式化日期 -->
    <p>{{ d(currentDate, 'short') }}</p>
    
    <!-- 格式化数字 -->
    <p>{{ n(12345.67, 'currency') }}</p>
    
    <!-- 语言切换器 -->
    <LocaleSwitcher />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from '@ldesign/i18n/vue';

// 使用 i18n
const { t, tc, d, n, locale, setLocale } = useI18n();

const userName = ref('张三');
const itemCount = ref(5);
const currentDate = new Date();

// 切换语言
async function switchLanguage() {
  await setLocale(locale.value === 'zh-CN' ? 'en-US' : 'zh-CN');
}
</script>
```

#### 使用指令

```vue
<template>
  <div>
    <!-- 基础翻译指令 -->
    <button v-t="'actions.save'"></button>
    
    <!-- 带参数的翻译 -->
    <span v-t="{ key: 'message.welcome', params: { name: 'Vue' } }"></span>
    
    <!-- HTML 内容翻译 -->
    <div v-t-html="'rich.content'"></div>
    
    <!-- 复数化指令 -->
    <p v-t-plural="{ key: 'items', count: 5 }"></p>
  </div>
</template>
```

#### 局部作用域

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue';

// 创建局部 i18n 作用域
const { t } = useI18n({
  useScope: 'local',
  messages: {
    en: {
      hello: 'Hello from component'
    },
    zh: {
      hello: '来自组件的问候'
    }
  }
});
</script>
```

#### 使用命名空间

```vue
<script setup lang="ts">
import { useI18n } from '@ldesign/i18n/vue';

// 使用命名空间简化键名
const { t } = useI18n({ namespace: 'user.profile' });

// 现在 t('name') 实际上会访问 'user.profile.name'
console.log(t('name')); // 不需要写完整路径
</script>
```

## ⚛️ 在 React 中使用

### 基础设置

```tsx
// App.tsx
import React from 'react';
import { setupI18n, I18nProvider } from '@ldesign/i18n/react';

// 导入预设翻译
import zhCN from '@ldesign/i18n/presets/zh-CN/common';
import enUS from '@ldesign/i18n/presets/en-US/common';

// 创建 i18n 实例
const i18n = setupI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
});

function App() {
  return (
    <I18nProvider i18n={i18n}>
      <YourAppContent />
    </I18nProvider>
  );
}

export default App;
```

### 在 React 组件中使用

#### 使用 Hooks

```tsx
import React from 'react';
import { useI18n } from '@ldesign/i18n/react';

function MyComponent() {
  const { t, tc, d, n, locale, setLocale } = useI18n();
  
  const userName = 'John';
  const itemCount = 5;
  const currentDate = new Date();
  
  return (
    <div>
      {/* 基础翻译 */}
      <h1>{t('navigation.home')}</h1>
      
      {/* 带参数的翻译 */}
      <p>{t('message.welcome', { name: userName })}</p>
      
      {/* 复数化 */}
      <p>{tc('items', itemCount, { count: itemCount })}</p>
      
      {/* 格式化日期 */}
      <p>{d(currentDate, 'short')}</p>
      
      {/* 格式化数字 */}
      <p>{n(12345.67, 'currency')}</p>
      
      {/* 语言切换 */}
      <button onClick={() => setLocale('en-US')}>
        English
      </button>
      <button onClick={() => setLocale('zh-CN')}>
        中文
      </button>
    </div>
  );
}
```

#### 使用组件

```tsx
import React from 'react';
import { Trans, I18nText, I18nNumber, I18nDate } from '@ldesign/i18n/react';

function ComponentExample() {
  return (
    <div>
      {/* 基础文本组件 */}
      <I18nText keypath="actions.confirm" />
      
      {/* 带插值的组件 */}
      <Trans 
        keypath="message.welcome" 
        params={{ name: 'React' }} 
      />
      
      {/* 数字格式化组件 */}
      <I18nNumber value={12345.67} format="currency" />
      
      {/* 日期格式化组件 */}
      <I18nDate value={new Date()} format="full" />
    </div>
  );
}
```

#### 使用 HOC

```tsx
import React from 'react';
import { withI18n, withTranslation } from '@ldesign/i18n/react';

// 使用 withI18n HOC
const MyComponent = withI18n()(({ i18n, t, locale }) => {
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>Current locale: {locale}</p>
    </div>
  );
});

// 使用 withTranslation HOC (带命名空间)
const UserProfile = withTranslation('user.profile')(({ t }) => {
  return (
    <div>
      <h2>{t('name')}</h2>
      <p>{t('bio')}</p>
    </div>
  );
});
```

#### 使用命名空间

```tsx
import { useI18n } from '@ldesign/i18n/react';

function UserComponent() {
  // 使用命名空间
  const { t } = useI18n('user.profile');
  
  // 现在 t('name') 实际上会访问 'user.profile.name'
  return <div>{t('name')}</div>;
}
```

## 🌐 加载和管理翻译

### 动态加载翻译

```typescript
import { useI18n } from '@ldesign/i18n/vue'; // 或 /react

const { mergeMessages, setLocale } = useI18n();

// 动态加载语言包
async function loadLanguage(locale: string) {
  const messages = await import(`./locales/${locale}.json`);
  mergeMessages(locale, messages.default);
  await setLocale(locale);
}
```

### 使用预设翻译

```typescript
// 导入特定语言的预设
import zhCommon from '@ldesign/i18n/presets/zh-CN/common';
import enCommon from '@ldesign/i18n/presets/en-US/common';

// 合并到你的翻译中
const messages = {
  'zh-CN': {
    ...zhCommon,
    // 你的自定义翻译
    custom: {
      welcome: '欢迎使用 LDesign'
    }
  },
  'en-US': {
    ...enCommon,
    custom: {
      welcome: 'Welcome to LDesign'
    }
  }
};
```

## 🎯 高级功能

### 性能优化

```typescript
// 使用优化版本的 i18n 引擎
import { OptimizedI18n } from '@ldesign/i18n/core/i18n-optimized';

const i18n = new OptimizedI18n({
  // 配置项
});
```

### 懒加载插件

```typescript
import { PluginLoader } from '@ldesign/i18n';

// 按需加载插件
const aiTranslator = await PluginLoader.load('ai-translator');
i18n.use(aiTranslator);
```

### 条件功能加载

```typescript
import { LazyFeatures } from '@ldesign/i18n';

// 只在需要时加载高级功能
if (needABTesting) {
  const { ABTestingManager } = await LazyFeatures.loadABTesting();
  // 使用 A/B 测试功能
}
```

## 📝 TypeScript 支持

### 类型安全的键名

```typescript
// 定义消息类型
interface MyMessages {
  navigation: {
    home: string;
    about: string;
  };
  actions: {
    save: string;
    cancel: string;
  };
}

// 创建类型安全的 i18n
const i18n = createI18n<MyMessages>({
  messages: {
    'en-US': {
      navigation: {
        home: 'Home',
        about: 'About'
      },
      actions: {
        save: 'Save',
        cancel: 'Cancel'
      }
    }
  }
});

// 现在会有类型提示和检查
const { t } = useI18n<MyMessages>();
t('navigation.home'); // ✅ 类型安全
t('invalid.key');    // ❌ TypeScript 错误
```

## 🔧 配置选项

```typescript
const config = {
  // 基础配置
  locale: 'zh-CN',              // 默认语言
  fallbackLocale: 'en-US',      // 回退语言
  
  // 高级配置
  lazy: false,                  // 是否懒加载
  cache: true,                  // 启用缓存
  
  // 自定义分隔符
  keySeparator: '.',            // 键分隔符
  namespaceSeparator: ':',      // 命名空间分隔符
  
  // 错误处理
  missingKeyHandler: (key) => { // 缺失键处理
    console.warn(`Missing key: ${key}`);
    return key;
  },
  
  // 插件
  plugins: [                    // 要加载的插件
    // 插件列表
  ]
};
```

## 🎨 最佳实践

1. **组织翻译文件**：按功能模块组织，使用命名空间分隔
2. **使用预设**：利用内置的常用翻译，避免重复工作
3. **懒加载**：对大型应用，使用动态导入按需加载语言包
4. **缓存策略**：合理配置缓存提高性能
5. **类型安全**：使用 TypeScript 定义消息类型
6. **性能优化**：生产环境使用 OptimizedI18n

## 🆘 故障排除

### 找不到翻译键

```typescript
// 检查键是否存在
const { te } = useI18n();
if (!te('some.key')) {
  console.warn('Key not found');
}
```

### 语言切换不生效

```typescript
// 确保异步等待
await setLocale('en-US');
// 或监听事件
i18n.on('localeChanged', ({ locale }) => {
  console.log('Locale changed to:', locale);
});
```

### 性能问题

```typescript
// 使用优化版本
import { OptimizedI18n } from '@ldesign/i18n/core/i18n-optimized';

// 启用缓存
const i18n = new OptimizedI18n({
  cache: {
    enabled: true,
    maxSize: 1000
  }
});
```