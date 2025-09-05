---
title: CI/CD 集成
description: GitHub Actions / GitLab CI 的构建与制品示例
---

# CI/CD 集成

GitHub Actions、GitLab CI、Jenkins 等流水线示例。

## GitHub Actions

```yaml
name: build
on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm launcher build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist
```

## GitLab CI

```yaml
stages: [build]

build:
  stage: build
  image: node:18
  before_script:
    - npm i -g pnpm
    - pnpm install --frozen-lockfile
  script:
    - pnpm launcher build
  artifacts:
    paths:
      - dist
```
