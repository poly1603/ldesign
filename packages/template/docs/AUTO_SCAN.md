# 自动模板扫描功能

## 🚀 概述

`@ldesign/template` 现在支持**自动扫描模板目录**功能！这意味着你只需要按照约定的目录结构添加新模板，系统就会自动识别和注册，**无需修改任何代码**。

## ✨ 特性

- 🔍 **自动发现** - 自动扫描 `templates` 目录下的所有模板
- 📦 **零配置** - 按照约定的目录结构即可
- 🎯 **元数据驱动** - 通过 `meta.json` 文件配置模板信息
- ⚡ **懒加载** - 模板组件按需加载，优化性能
- 🔧 **向后兼容** - 支持传统的手动注册方式

## 📁 目录结构约定

```
packages/template/src/templates/
├── {category}/                    # 模板分类（如 login, dashboard）
│   ├── {device}/                  # 设备类型（desktop, mobile, tablet）
│   │   ├── {name}/                # 模板名称
│   │   │   ├── index.vue          # 模板组件（必需）
│   │   │   └── meta.json          # 元数据文件（必需）
```

### 示例结构

```
templates/
├── login/
│   ├── desktop/
│   │   ├── default/
│   │   │   ├── index.vue
│   │   │   └── meta.json
│   │   └── split/
│   │       ├── index.vue
│   │       └── meta.json
│   ├── mobile/
│   │   └── default/
│   │       ├── index.vue
│   │       └── meta.json
│   └── tablet/
│       └── simple/
│           ├── index.vue
│           └── meta.json
├── dashboard/
│   ├── desktop/
│   │   └── default/
│   │       ├── index.vue
│   │       └── meta.json
└── [其他分类]/
```

## 📝 meta.json 格式

每个模板必须包含 `meta.json` 文件，用于描述模板的元信息：

```json
{
  "displayName": "默认登录页",
  "description": "简洁大方的桌面端登录页面",
  "version": "1.0.0",
  "author": "LDesign Team",
  "tags": ["login", "desktop", "default", "simple"],
  "isDefault": true
}
```

### 字段说明

| 字段 | 类型 | 必需 | 描述 |
|-----|------|------|------|
| displayName | string | ✅ | 模板显示名称 |
| description | string | ❌ | 模板描述 |
| version | string | ❌ | 版本号，默认 "1.0.0" |
| author | string | ❌ | 作者，默认 "Unknown" |
| tags | string[] | ❌ | 标签列表，用于搜索和分类 |
| isDefault | boolean | ❌ | 是否为该设备类型的默认模板 |

## 🎯 使用方法

### 1. 启用自动扫描

在创建插件时开启 `autoScan` 选项：

```typescript
import { createTemplatePlugin } from '@ldesign/template'

const app = createApp(App)

// 开启自动扫描模式
app.use(createTemplatePlugin({
  autoScan: true,      // ← 启用自动扫描
  debug: true          // 可选：显示扫描日志
}))
```

### 2. 添加新模板

#### 步骤 1: 创建目录

```bash
# 创建新的模板目录
mkdir -p src/templates/login/desktop/minimal
```

#### 步骤 2: 创建模板组件

`src/templates/login/desktop/minimal/index.vue`:

```vue
<template>
  <div class="minimal-login">
    <h1>{{ title }}</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  title?: string
  onLogin?: (data: any) => void
}>()

const username = ref('')
const password = ref('')

function handleLogin() {
  props.onLogin?.({ username: username.value, password: password.value })
}
</script>

<style scoped>
.minimal-login {
  /* 样式 */
}
</style>
```

#### 步骤 3: 创建元数据文件

`src/templates/login/desktop/minimal/meta.json`:

```json
{
  "displayName": "极简登录页",
  "description": "极简主义风格的登录页面",
  "version": "1.0.0",
  "author": "Your Name",
  "tags": ["login", "desktop", "minimal", "simple"],
  "isDefault": false
}
```

#### 步骤 4: 完成！

无需修改任何代码，重新启动开发服务器，新模板就会自动被发现和注册！

## 🔄 混合模式

你也可以同时使用自动扫描和手动注册：

```typescript
app.use(createTemplatePlugin({
  autoScan: true,                           // 自动扫描
  registerCustomTemplates: (manager) => {   // 手动注册额外的模板
    manager.register(
      'special',
      'desktop',
      'custom',
      { displayName: '特殊模板', ... },
      () => import('./my-special-template.vue')
    )
  }
}))
```

## 🎨 实际示例

### 添加一个新的仪表板模板

1. **创建目录结构**：

```bash
src/templates/dashboard/desktop/modern/
├── index.vue
└── meta.json
```

2. **编写 meta.json**：

```json
{
  "displayName": "现代仪表板",
  "description": "采用现代设计风格的仪表板",
  "version": "1.0.0",
  "author": "Design Team",
  "tags": ["dashboard", "desktop", "modern", "dark"],
  "isDefault": false
}
```

3. **实现组件** (`index.vue`)：

```vue
<template>
  <div class="modern-dashboard">
    <!-- 你的仪表板实现 -->
  </div>
</template>

<script setup lang="ts">
// 组件逻辑
</script>
```

4. **完成！** 模板会自动被系统识别并可在模板切换器中使用。

## 🔍 调试

开启调试模式查看扫描过程：

```typescript
app.use(createTemplatePlugin({
  autoScan: true,
  debug: true  // 显示详细日志
}))
```

控制台输出示例：

```
[autoRegisterTemplates] 发现模板文件: 12
[autoRegisterTemplates] 发现元数据文件: 12
[autoRegisterTemplates] 注册成功: login-desktop-default
[autoRegisterTemplates] 注册成功: login-desktop-split
...
[autoRegisterTemplates] 共注册 12 个模板
```

## ⚠️ 注意事项

1. **目录命名** - 必须严格遵循 `{category}/{device}/{name}` 结构
2. **meta.json** - 每个模板必须包含此文件
3. **组件导出** - `index.vue` 必须是有效的 Vue 组件
4. **设备类型** - 必须是 `desktop`、`mobile` 或 `tablet` 之一
5. **唯一性** - 同一 category/device/name 组合必须唯一

## 🚀 性能优化

- 模板组件使用动态导入，实现懒加载
- 元数据文件在构建时静态分析
- 使用 Vite 的 glob import 功能，构建时优化

## 📊 对比

| 特性 | 手动注册 | 自动扫描 |
|-----|---------|---------|
| 添加新模板需要修改代码 | ✅ | ❌ |
| 支持懒加载 | ✅ | ✅ |
| 类型安全 | ✅ | ⚠️ (运行时) |
| 灵活性 | 高 | 中 |
| 易用性 | 中 | 高 |
| 适合场景 | 少量固定模板 | 大量动态模板 |

## 总结

自动扫描功能让添加新模板变得极其简单：

1. ✅ 创建目录
2. ✅ 添加组件和元数据
3. ✅ 完成！

不需要：
- ❌ 修改注册代码
- ❌ 更新导入语句
- ❌ 重新构建包

这大大提高了开发效率，特别适合需要频繁添加新模板的项目！