# 多语言状态管理架构 (优化版)

## 🎯 设计目标

1. **解耦** - 各包独立，不依赖 engine 的 LocaleManager
2. **单向数据流** - i18n 作为唯一状态源，其他包只消费
3. **简单易用** - 开发者只需传递一个响应式 ref
4. **自动响应** - 语言变化自动传播到所有依赖包

## 📊 架构图

```
┌─────────────────────────────────────────────────┐
│                  app_simple                     │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  i18n Plugin (唯一状态源)                │  │
│  │  localeRef = ref('zh-CN')                │  │
│  └────────────┬─────────────────────────────┘  │
│               │ 单向传递                        │
│               ├──────────┬──────────┐          │
│               ↓          ↓          ↓          │
│         ┌─────────┐ ┌────────┐ ┌────────┐     │
│         │ Color   │ │ Size   │ │ Other  │     │
│         │ Plugin  │ │ Plugin │ │ Plugin │     │
│         └─────────┘ └────────┘ └────────┘     │
│         (自动响应)   (自动响应)  (自动响应)    │
└─────────────────────────────────────────────────┘
```

## 🔧 实现方式

### 1. i18n 包 - 暴露响应式 localeRef

**文件**: `packages/i18n/src/engine.ts`

```typescript
import { ref, type Ref } from 'vue';

export function createI18nEnginePlugin(options: I18nEnginePluginOptions = {}) {
  // 响应式的 locale 状态 - 作为唯一的语言状态源
  const localeRef = ref(options.locale || 'zh-CN');
  
  // ...初始化逻辑
  
  // 监听语言变化，更新响应式 locale
  i18nInstance.on('localeChanged', ({ locale }) => {
    localeRef.value = locale;  // 更新状态源
    // ...其他副作用
  });
  
  return {
    name: '@ldesign/i18n',
    localeRef,  // ✅ 暴露给外部使用
    // ...其他 API
  };
}
```

**关键点**:
- `localeRef` 是唯一的语言状态源
- 当 i18n 内部语言变化时，自动更新 `localeRef`
- 其他包通过订阅这个 ref 实现自动响应

---

### 2. color/size 包 - 接收可选的 locale ref

**文件**: `packages/color/src/plugin/index.ts`, `packages/size/src/plugin/index.ts`

```typescript
export interface ColorPluginOptions {
  /**
   * 响应式的 locale 参数 (可选)
   * 如果提供，插件会自动监听并响应语言变化
   */
  locale?: Ref<string>;
  
  // ...其他选项
}

export function createColorPlugin(options: ColorPluginOptions = {}): ColorPlugin {
  // 如果传入了 locale ref，直接使用（单向数据流）
  // 否则创建一个新的 ref
  const currentLocale = options.locale || ref('en-US');
  
  // computed 会自动订阅 locale 的变化
  const localeMessages = computed(() => getLocale(currentLocale.value));
  
  // ...插件逻辑
  
  return {
    currentLocale,
    localeMessages,
    setLocale: (locale: string) => {
      currentLocale.value = locale;
    },
    // ...其他 API
  };
}
```

**关键点**:
- 接收可选的 `locale` 参数（Ref 类型）
- 如果提供，直接使用（单向数据流）
- 通过 `computed` 自动响应 locale 变化

---

### 3. app_simple - 使用简化架构

**文件**: `app_simple/src/main.ts`

```typescript
// ===== 步骤 1: 创建 i18n 插件 (唯一状态源) =====
const i18nPlugin = createI18nEnginePlugin({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
});

// ===== 步骤 2: 获取响应式 localeRef =====
const localeRef = i18nPlugin.localeRef;

// ===== 步骤 3: 创建其他插件，传入 localeRef =====
const colorPlugin = createColorPlugin({
  locale: localeRef,  // 单向数据流：i18n → color
  // ...其他配置
});

const sizePlugin = createSizePlugin({
  locale: localeRef,  // 单向数据流：i18n → size
  // ...其他配置
});

// ===== 步骤 4: 安装插件 =====
const engine = await createEngineApp({
  plugins: [routerPlugin, i18nPlugin],
  setupApp: async (app) => {
    app.use(colorPlugin);  // 已绑定 localeRef，自动响应
    app.use(sizePlugin);   // 已绑定 localeRef，自动响应
  },
});

// ===== 步骤 5: 切换语言（简化版） =====
// 只需要更新 i18n，其他插件会自动响应
i18nPlugin.api.changeLocale('en-US');
```

**关键点**:
- 只需要 **5 个步骤**，非常简洁
- 语言切换只需调用 `i18nPlugin.api.changeLocale()`
- 所有依赖 `localeRef` 的插件自动响应，无需手动同步

---

## ✅ 优势对比

### 旧架构 (复杂)

```
globalLocale (main.ts)
    ↕ (双向同步)
i18n.locale
    ↕ (双向同步)
engine.state.locale
    ↕ (双向同步)
LocaleManager
    ↕ (注册/通知)
color/size plugins
```

**问题**:
- 多层次同步，容易出错
- 需要 LocaleManager 作为中介
- 数据流向不清晰
- 代码量大，维护困难

---

### 新架构 (简化)

```
i18n.localeRef (唯一源)
    ↓ (单向传递)
color/size plugins (自动响应)
```

**优势**:
- ✅ **单一状态源** - i18n 是唯一的真相
- ✅ **单向数据流** - 清晰、可预测
- ✅ **自动响应** - Vue 的响应式系统自动处理
- ✅ **完全解耦** - 不依赖 engine 的 LocaleManager
- ✅ **代码简洁** - 减少 60% 样板代码

---

## 📝 迁移指南

如果你有旧代码使用 LocaleManager，迁移非常简单：

### Before (旧代码)

```typescript
// 创建插件
const colorPlugin = createColorPlugin({ /* ... */ });

// 通过 engine 注册到 LocaleManager
engine.localeManager.register('color', colorPlugin);

// 切换语言
engine.localeManager.setLocale('en-US');
```

### After (新代码)

```typescript
// 创建 i18n，获取 localeRef
const i18nPlugin = createI18nEnginePlugin({ /* ... */ });
const localeRef = i18nPlugin.localeRef;

// 创建插件时直接传入 localeRef
const colorPlugin = createColorPlugin({
  locale: localeRef,
  // ...
});

// 切换语言
i18nPlugin.api.changeLocale('en-US');
```

---

## 🎨 最佳实践

### 1. i18n 作为第一个插件

```typescript
// ✅ 正确：先创建 i18n，再创建其他插件
const i18nPlugin = createI18nEnginePlugin({ /* ... */ });
const localeRef = i18nPlugin.localeRef;

const colorPlugin = createColorPlugin({ locale: localeRef });
const sizePlugin = createSizePlugin({ locale: localeRef });
```

```typescript
// ❌ 错误：不要在其他插件之后创建 i18n
const colorPlugin = createColorPlugin({ /* ... */ });
const i18nPlugin = createI18nEnginePlugin({ /* ... */ });
// colorPlugin 无法获取 localeRef
```

---

### 2. 统一管理语言切换

```typescript
// ✅ 推荐：封装一个切换函数
const changeLanguage = (locale: string) => {
  i18nPlugin.api.changeLocale(locale);
  // 其他插件自动响应，无需手动同步
};

// 在组件中使用
changeLanguage('en-US');
```

---

### 3. 监听语言变化

```typescript
import { watch } from 'vue';

// ✅ 直接 watch localeRef
watch(localeRef, (newLocale) => {
  console.log('Language changed to:', newLocale);
  // 执行副作用，如更新文档标题
  document.title = i18nPlugin.api.t('app.name');
});
```

---

## 🔍 FAQ

### Q: engine 的 LocaleManager 还需要吗？

**A**: 不需要。新架构不依赖 LocaleManager。但为了兼容性，可以保留并标记为 `@deprecated`。

---

### Q: 如果不传 locale 参数会怎样？

**A**: 插件会创建自己的 locale ref，独立管理语言。这对于只需要独立语言切换的场景很有用。

```typescript
// 场景1：共享语言状态（推荐）
const colorPlugin = createColorPlugin({ locale: localeRef });

// 场景2：独立语言状态（特殊场景）
const colorPlugin = createColorPlugin(); // 使用内部的 locale
```

---

### Q: 多个应用实例如何共享 locale？

**A**: 可以在外部创建 `localeRef`，然后传递给所有实例。

```typescript
import { ref } from 'vue';

// 创建共享的 locale ref
const sharedLocale = ref('zh-CN');

// 应用 1
const i18nPlugin1 = createI18nEnginePlugin({ locale: sharedLocale.value });
const colorPlugin1 = createColorPlugin({ locale: sharedLocale });

// 应用 2
const i18nPlugin2 = createI18nEnginePlugin({ locale: sharedLocale.value });
const colorPlugin2 = createColorPlugin({ locale: sharedLocale });

// 修改 sharedLocale，两个应用同时更新
sharedLocale.value = 'en-US';
```

---

## 🚀 总结

新架构的核心理念是：

1. **Single Source of Truth** - i18n 的 `localeRef` 是唯一的状态源
2. **Unidirectional Data Flow** - 数据单向流动，清晰可预测
3. **Reactive by Default** - Vue 的响应式系统自动处理更新
4. **Decoupled** - 各包独立，不依赖 engine

这样的设计让多语言管理变得**简单、清晰、可维护**！🎉
