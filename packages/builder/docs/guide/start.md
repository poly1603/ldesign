---
title: 快速开始
---

# 快速开始

LDesign Builder 是一个面向前端库的打包工具，基于 Rollup API，提供零配置、多格式输出、类型声明生成与项目分析能力。

## 安装

```bash
npm i -D @ldesign/builder
```

## 最简单的构建

```bash
npx ldesign-builder build
```

会自动：

- 扫描 `src/` 入口（如 `src/index.ts`）
- 自动选择合适插件（TS、PostCSS、Vue 等）
- 产出默认格式：ESM、CJS

## 指定入口与格式

```bash
npx ldesign-builder build src/index.ts -f esm,cjs,umd
```

## 监听开发

```bash
npx ldesign-builder watch
```


