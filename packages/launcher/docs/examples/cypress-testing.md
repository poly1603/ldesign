---
title: Cypress 测试
description: 在 Launcher 项目中进行端到端测试的最佳实践
---

# Cypress 测试

端到端测试在 launcher 项目中的最佳实践与配置。

## 安装

```bash
pnpm add -D cypress start-server-and-test
```

## 脚本

```json
{
  "scripts": {
    "dev": "launcher dev",
    "test:e2e": "start-server-and-test dev http://127.0.0.1:3000 cy:run",
    "cy:run": "cypress run --browser chrome"
  }
}
```

## 目录结构

```
cypress/
  e2e/
    home.cy.ts
```

## 示例用例

```ts
// cypress/e2e/home.cy.ts
describe('home page', () => {
  it('should render', () => {
    cy.visit('http://127.0.0.1:3000')
    cy.contains('Hello')
  })
})
```
