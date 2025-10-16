# 模板插槽支持更新状态

## ✅ 已完成

### Desktop (桌面端)
- ✅ `login/desktop/default` - 已添加完整插槽支持
- ✅ `login/desktop/split` - 已添加完整插槽支持  
- ✅ `login/desktop/advanced` - 已添加完整插槽支持（最早实现）

### Mobile (移动端)
- ✅ `login/mobile/default` - 已添加完整插槽支持
- ✅ `login/mobile/card` - 已添加完整插槽支持 ✅

### Tablet (平板端)
- ✅ `login/tablet/default` - 已添加完整插槽支持 ✅
- ✅ `login/tablet/simple` - 已添加完整插槽支持 ✅

## 📝 所有登录模板统一支持的插槽

每个登录模板现在都支持以下核心插槽：

### 1. `logo` 插槽
- **描述**: 自定义 Logo 区域
- **Props**: 无
- **示例**:
```vue
<template #logo>
  <img src="/my-logo.png" alt="Logo" />
</template>
```

### 2. `header` 插槽
- **描述**: 自定义标题区域
- **Props**: 
  - `title`: 标题文本
  - `subtitle`: 副标题文本
- **示例**:
```vue
<template #header="{ title, subtitle }">
  <h1>{{ title }}</h1>
  <p>{{ subtitle }}</p>
</template>
```

### 3. `loginPanel` 插槽（核心）
- **描述**: 完全自定义登录面板
- **Props**:
  - `form`: 表单数据对象
  - `loading`: 加载状态
  - `error`: 错误信息
  - `handleSubmit`: 提交处理函数
- **示例**:
```vue
<template #loginPanel="{ handleSubmit, loading, error }">
  <CustomLoginForm 
    :on-submit="handleSubmit"
    :loading="loading"
    :error="error"
  />
</template>
```

### 4. `socialLogin` 插槽
- **描述**: 社交登录区域
- **Props**:
  - `providers`: 社交登录提供商列表
- **示例**:
```vue
<template #socialLogin="{ providers }">
  <div class="social-buttons">
    <button v-for="p in providers" :key="p.name">
      {{ p.label }}
    </button>
  </div>
</template>
```

### 5. `footer` 插槽
- **描述**: 底部链接区域
- **Props**: 无
- **示例**:
```vue
<template #footer>
  <a href="/register">注册</a>
  <a href="/forgot">忘记密码</a>
</template>
```

### 6. `extra` 插槽
- **描述**: 额外内容区域
- **Props**: 无
- **示例**:
```vue
<template #extra>
  <div class="terms">登录即表示同意服务条款</div>
</template>
```

## 🔧 使用方式

### 在 TemplateRenderer 中使用

```vue
<template>
  <TemplateRenderer
    category="login"
    :device="device"
    :name="templateName"
    :component-props="{
      title: '欢迎登录',
      subtitle: '请输入您的账号信息'
    }"
  >
    <!-- 自定义任意插槽 -->
    <template #loginPanel="{ handleSubmit, loading, error }">
      <MyCustomLoginPanel 
        :on-submit="handleSubmit"
        :loading="loading"
        :error="error"
      />
    </template>
    
    <template #logo>
      <MyLogo />
    </template>
    
    <!-- 其他插槽... -->
  </TemplateRenderer>
</template>
```

### 直接使用模板组件

```vue
<template>
  <component :is="loginTemplate">
    <template #loginPanel="{ handleSubmit }">
      <!-- 自定义内容 -->
    </template>
  </component>
</template>

<script setup>
import LoginDefault from '@ldesign/template/templates/login/desktop/default'
</script>
```

## 🎯 设计原则

1. **向后兼容**: 所有插槽都有默认实现，不使用插槽时模板正常工作
2. **渐进式定制**: 可以只替换需要的部分，其他部分使用默认实现
3. **一致性**: 所有登录模板提供相同的插槽接口
4. **类型安全**: 插槽 props 都有 TypeScript 类型定义

## 📋 待办事项

- [x] 为 `login/mobile/card` 添加插槽支持 ✅
- [x] 为 `login/tablet/default` 添加插槽支持 ✅
- [x] 为 `login/tablet/simple` 添加插槽支持 ✅
- [x] 更新所有登录模板的 config.ts 文件，声明支持的插槽 ✅
- [ ] 为 dashboard 类型的模板考虑是否需要插槽支持
- [ ] 创建插槽使用示例和最佳实践文档
- [ ] 添加单元测试验证插槽功能

## 💡 注意事项

1. **移动端性能**: 移动端模板的插槽应该尽量简单，避免过度复杂的自定义
2. **样式继承**: 插槽内容应该能够继承模板的基础样式
3. **响应式设计**: 自定义内容需要考虑不同设备的适配