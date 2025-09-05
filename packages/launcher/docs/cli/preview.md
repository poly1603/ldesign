---
title: preview 命令
---

# preview 命令

在本地启动一个仅用于预览的静态服务器，用于验证生产构建产物。

## 语法

```bash
launcher preview [options]
```

## 选项

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| --port | number | 4173 | 监听端口 |
| --host | string | 127.0.0.1 | 监听地址 |
| --open | boolean | false | 启动后自动打开浏览器 |
| --https | boolean | false | 启用 HTTPS |
| --cors | boolean | true | 启用 CORS |

## 示例

```bash
launcher preview --port 5000 --open
```

> 预览命令不会参与打包，只读取 dist（或你在 build.outDir 指定的目录）。

