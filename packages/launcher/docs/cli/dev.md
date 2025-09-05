---
title: dev 命令
---

# dev 命令

启动开发服务器，支持热更新（HMR）、代理、HTTPS、自动打开浏览器等能力。

## 语法

```bash
launcher dev [options]
```

## 常用选项

| 选项 | 简写 | 类型 | 默认值 | 说明 |
|---|---|---|---|---|
| --port | -p | number | 3000 | 指定端口号 |
| --host | -H | string | 127.0.0.1 | 指定监听地址，0.0.0.0 允许外部访问 |
| --open | -o | boolean | false | 启动后自动打开浏览器（可传路径） |
| --https |  | boolean | false | 启用 HTTPS 开发服务器 |
| --force | -f | boolean | false | 强制重新预构建依赖 |
| --cors |  | boolean | true | 启用 CORS |
| --strictPort |  | boolean | false | 端口占用时是否报错退出（不自动递增） |
| --clearScreen |  | boolean | true | 启动前清理屏幕输出 |
| --mode | -m | string | development | 指定运行模式（读取对应 .env 文件） |
| --debug | -d | boolean | false | 输出调试日志 |
| --silent | -s | boolean | false | 静默模式，仅输出错误 |

## 示例

- 在 8080 端口启动并允许外部访问：
```bash
launcher dev --port 8080 --host 0.0.0.0
```

- 启动后自动打开浏览器：
```bash
launcher dev --open
```

- 严格端口，不自动递增查找：
```bash
launcher dev --strictPort --port 3000
```

- 开启 HTTPS：
```bash
launcher dev --https
```

- 使用自定义配置文件：
```bash
launcher dev --config ./configs/dev.config.ts
```

- 配合代理：
```ts
// launcher.config.ts
export default {
  server: {
    proxy: {
      '/api': { target: 'http://127.0.0.1:7001', changeOrigin: true }
    }
  }
}
```

## 与配置文件联动

上述选项均可在 launcher.config.* 中配置，例如：

```ts
export default {
  server: { port: 5173, host: '0.0.0.0', open: true },
  optimizeDeps: { force: false }
}
```

## 故障排查
- 端口占用：使用 --port 指定其他端口或关闭占用进程
- 无法外部访问：确认 --host 0.0.0.0 并检查系统/路由器防火墙
- HMR 失败：检查代理配置、浏览器控制台与终端日志（配合 --debug）
- 证书报错（HTTPS）：检查本地证书是否可信或改用 --https 自签名证书方案

