---
title: config 命令
---

# config 命令

配置管理工具，提供查看、设置、校验与初始化等能力。

## 子命令与用法

### list
查看当前生效的配置：
```bash
launcher config list [--json] [--pretty]
```
可配合 --global 查看全局配置（如工具自身的全局默认行为）。

### get
读取某个配置项：
```bash
launcher config get server.port
launcher config get build.outDir
```
支持点号路径（如 server.port）。

### set
设置某个配置项（会写回配置文件，如不存在则创建）：
```bash
launcher config set server.port 8080
launcher config set build.sourcemap true
```
如需设置全局配置，加上 --global。

### delete
删除某个配置项：
```bash
launcher config delete build.sourcemap
```

### validate
校验配置文件并输出错误/警告：
```bash
launcher config validate
```

### init
初始化一个默认配置文件：
```bash
launcher config init
```
将生成 launcher.config.ts（或根据当前项目环境选择合适的扩展名），内容包含合理默认值。

## 示例输出

```bash
$ launcher config list --json
{
  "server": { "host": "127.0.0.1", "port": 3000, "open": false, "cors": true },
  "build": { "outDir": "dist", "minify": true, "sourcemap": false },
  "preview": { "host": "127.0.0.1", "port": 4173 }
}
```

## 提示
- 支持点号路径（如 server.port）
- --json 输出用于脚本处理的 JSON 格式，配合 --pretty 可美化输出
- 配置文件优先级：--config 指定 > 项目根目录默认配置文件（详见 CLI 总览）
- 校验失败时会输出详细错误条目，可按提示修正

