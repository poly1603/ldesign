# 环境变量 (env)

@ldesign/launcher 默认读取以 `VITE_` 开头的变量，并通过 `import.meta.env` 注入到客户端。

## 文件约定
- `.env` 通用
- `.env.development`、`.env.production`、`.env.staging` 按模式区分
- `.env.local` 仅本机，通常不提交到仓库

```bash
# .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App
```

## 使用方式
```ts
// 代码中读取
console.log(import.meta.env.VITE_API_URL)
```

```ts
// 配置中使用
export default ({ mode }) => ({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __MODE__: JSON.stringify(mode)
  }
})
```

## 变量前缀约定

- 以 VITE_ 开头的环境变量会被注入到客户端（通过 import.meta.env 访问）。
- 以 LAUNCHER_ 开头的变量用于控制 CLI/运行时行为（不会注入到客户端）。

请不要将密钥、令牌等敏感信息以可注入前缀存放在 .env 中。推荐通过后端或运行时安全注入。

