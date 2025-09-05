# 预览配置 (preview)

用于控制 `launcher preview` 预览服务器的行为。

## 选项

提示：预览服务器同样支持 CORS 配置（默认开启）。

### port
- 类型: `number`
- 默认: `4173`

### host
- 类型: `string | boolean`
- 默认: `127.0.0.1`

### open
- 类型: `boolean`
- 默认: `false`

### https
- 类型: `boolean | { key: Buffer; cert: Buffer }`
- 默认: `false`

## 示例
```ts
export default {
  preview: {
    port: 4173,
    host: '0.0.0.0',
    open: true,
    // https: { key: fs.readFileSync('key.pem'), cert: fs.readFileSync('cert.pem') }
  }
}
```

> 预览服务器仅用于验证构建产物是否可用，不用于生产环境部署。

