# LDesign Template Demo

这是一个最简单的 Vite + Vue3 示例项目，用于演示如何使用 `@ldesign/template` 包渲染一个登录模板。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

浏览器会自动打开 `http://localhost:3000`，你就能看到一个登录页面。

## 代码说明

`src/App.vue` 文件非常简单：

```vue
<template>
  <LoginTemplate 
    title="欢迎登录"
    subtitle="请输入您的账号和密码"
    :on-login="handleLogin"
  />
</template>

<script setup lang="ts">
import LoginTemplate from '../../src/templates/login/desktop/default/index.vue'

const handleLogin = async (data: any) => {
  console.log('登录数据:', data)
  alert(`登录成功！\n用户名: ${data.username}`)
}
</script>
```

就这么简单！只需：
1. 导入登录模板组件
2. 传入 `title`、`subtitle` 和 `onLogin` 回调
3. 处理登录逻辑

## 项目结构

```
demo/
├── src/
│   ├── App.vue          # 主组件（渲染登录模板）
│   ├── main.ts          # 入口文件
│   └── vite-env.d.ts    # TS 类型声明
├── index.html           # HTML 入口
├── package.json         # 项目配置
├── vite.config.ts       # Vite 配置
└── README.md            # 本文档
```

## 模板 Props

登录模板支持以下属性：

- `title`: 标题
- `subtitle`: 副标题
- `logo`: Logo 图片 URL（可选）
- `onLogin`: 登录回调函数
- `onRegister`: 注册回调（可选）
- `onForgotPassword`: 忘记密码回调（可选）
- `showRemember`: 是否显示“记住我”选项
- `showRegister`: 是否显示注册链接
- `showForgotPassword`: 是否显示忘记密码链接

## 构建生产版本

```bash
npm run build
```

## 预览生产构建

```bash
npm run preview
```

## 技术亮点

- 🚀 **TemplateRenderer** 组件 - 自动处理设备检测和模板切换
- 🎯 **useDevice** Hook - 实时监听窗口大小变化
- 📚 **useTemplateList** Hook - 动态获取当前设备的模板列表
- ⚙️ **类型安全** - 完整的 TypeScript 类型支持

## 进阶使用

查看 `example` 目录了解更多高级用法：

- 使用 `TemplateSelector` 可视化选择器
- 使用 `useTemplateScanner` 扫描所有模板
- 自定义模板注册和配置
- 性能优化和缓存策略
