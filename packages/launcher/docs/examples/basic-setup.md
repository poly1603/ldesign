---
title: 基础项目设置
description: 从零开始搭建并运行一个使用 @ldesign/launcher 的最小项目
---

# 基础项目设置

本示例展示如何从零开始快速搭建一个使用 @ldesign/launcher 的前端项目。

## 目录结构
```
my-app/
├─ index.html
├─ src/
│  └─ main.js
└─ launcher.config.js
```

## 步骤 1：初始化
```bash
mkdir my-app && cd my-app
pnpm init -y
pnpm add @ldesign/launcher
```

## 步骤 2：创建入口文件
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

```js
// src/main.js
document.querySelector('#app').innerHTML = 'Hello Launcher!'
```

## 步骤 3：创建配置
```js
// launcher.config.js
export default {
  server: { port: 3000, open: true }
}
```

## 步骤 4：启动
```bash
npx launcher dev
```

浏览器访问 http://127.0.0.1:3000 即可看到页面。
