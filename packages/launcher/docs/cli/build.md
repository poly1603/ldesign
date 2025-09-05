---
title: build 命令
---

# build 命令

执行生产构建，输出可部署的静态资源。

## 语法

```bash
launcher build [options]
```

## 常用选项

| 选项 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| --outDir | string | dist | 输出目录 |
| --mode | string | production | 指定模式（影响 .env 读取与构建优化） |
| --sourcemap | boolean | false | 生成 sourcemap 文件（支持 inline/hidden） |
| --minify | boolean | true | 压缩代码（内部可使用 esbuild/terser） |
| --target | string | modules | 目标环境（例如 es2020） |
| --emptyOutDir | boolean | true | 构建前清空输出目录 |
| --watch | boolean | false | 启用监听模式（增量构建） |
| --report | boolean | false | 生成构建报告（如体积分布） |
| --analyze | boolean | false | 启用体积分析（需安装可视化插件） |
| --debug | boolean | false | 输出调试信息 |

## 示例

- 基础构建：
```bash
launcher build
```

- 输出到自定义目录并生成报告：
```bash
launcher build --outDir build --report
```

- 指定环境模式：
```bash
launcher build --mode staging
```

- 监听模式（适合与文件监控/CI 增量构建配合）：
```bash
launcher build --watch
```

## 与配置文件联动

```ts
export default {
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true,
    emptyOutDir: true,
    target: 'es2020'
  }
}
```

## 常见问题
- 体积过大：开启 minify，合理配置代码拆分（比如 manualChunks），剔除无用依赖
- Source Map：生产推荐关闭或上传到私有制品库，避免泄露源码
- 产物校验：使用 preview 命令在本地验证构建产物是否可用

