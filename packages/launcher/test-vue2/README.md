# Vue 2 测试项目

这是一个用于测试 `@ldesign/launcher` 功能的 Vue 2 项目。

## 功能特性

- ✅ Vue 2.7 + Options API
- ✅ TypeScript 支持
- ✅ 热重载开发体验
- ✅ 生产构建优化
- ✅ @ldesign/launcher 集成

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm run dev
```

访问 http://localhost:3001

### 生产构建

```bash
pnpm run build
```

### 预览构建结果

```bash
pnpm run preview
```

## 测试功能

### 1. 开发服务器测试
- 启动开发服务器
- 验证热重载功能
- 检查控制台输出

### 2. 构建测试
- 执行生产构建
- 检查构建产物
- 验证代码压缩和优化

### 3. 预览测试
- 启动预览服务器
- 验证构建产物运行正常

### 4. 生命周期钩子测试
- 观察启动前后钩子执行
- 观察构建前后钩子执行

## 项目结构

```
test-vue2/
├── src/
│   ├── App.vue          # 主应用组件
│   └── main.ts          # 应用入口
├── index.html           # HTML 模板
├── launcher.config.ts   # Launcher 配置
├── package.json         # 项目配置
└── README.md           # 项目说明
```

## 配置说明

项目使用 `launcher.config.ts` 配置文件，包含：

- Vue 2 插件配置
- 开发服务器配置（端口 3001）
- 构建选项配置
- 生命周期钩子配置

## 验证清单

- [ ] 开发服务器正常启动
- [ ] 页面正常显示
- [ ] 热重载功能正常
- [ ] 计数器功能正常
- [ ] 时间显示正常更新
- [ ] Vue 版本显示正确
- [ ] 生产构建成功
- [ ] 构建产物正常运行
- [ ] 生命周期钩子正常执行
- [ ] 控制台无错误信息

## 与 Vue 3 项目的区别

- 使用 Vue 2.7 和 Options API
- 使用 `@vitejs/plugin-vue2` 插件
- 端口设置为 3001 避免冲突
- 组件使用 Vue.extend 语法
