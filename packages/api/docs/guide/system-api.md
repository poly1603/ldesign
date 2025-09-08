# 系统 API 指南

内置系统 API 插件提供常用接口：验证码、登录、登出、用户信息、菜单、权限、刷新令牌、修改密码、系统配置等。

## 安装

```ts
import { createApiEngine, systemApiPlugin } from '@ldesign/api'

const api = createApiEngine({
  http: { baseURL: '/api' },
})
await api.use(systemApiPlugin)
```

推荐与认证中间件插件搭配使用：
```ts
import { authMiddlewaresPlugin } from '@ldesign/api'
await api.use(authMiddlewaresPlugin)
```

## 常用调用

```ts
import { SYSTEM_API_METHODS } from '@ldesign/api'

// 登录
const loginResult = await api.call(SYSTEM_API_METHODS.LOGIN, {
  username: 'admin',
  password: '******',
  captcha: '1234',
  captchaId: 'id',
})

// 获取用户信息
const user = await api.call(SYSTEM_API_METHODS.GET_USER_INFO)

// 获取菜单与权限
const menus = await api.call(SYSTEM_API_METHODS.GET_MENUS)
const perms = await api.call(SYSTEM_API_METHODS.GET_PERMISSIONS)

// 登出
await api.call(SYSTEM_API_METHODS.LOGOUT)
```

> 提示：当检测到认证中间件已安装时，系统 API 会自动移除方法级 Authorization 头，由中间件统一注入，避免重复。

## 错误处理与中间件

- 全局中间件（request/response/error）
- 错误中间件可“恢复”错误，返回一个 ResponseData 即视为成功
- 配合重试（fixed/exponential）可显著增强稳定性

```ts
const api = createApiEngine({
  retry: { enabled: true, retries: 2, delay: 200 },
  middlewares: {
    error: [ (err) => { /* 可选：返回 { data, status, ... } */ } ],
  },
})
```

