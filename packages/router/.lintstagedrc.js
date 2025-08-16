/**
 * lint-staged 配置
 *
 * 在 git commit 前对暂存的文件执行检查和修复
 */

module.exports = {
  // TypeScript 和 JavaScript 文件
  '*.{ts,tsx,js,jsx}': [
    // 1. ESLint 检查和自动修复
    'eslint --fix',
    // 2. TypeScript 类型检查
    () => 'pnpm type-check',
    // 3. 运行相关测试
    () => 'pnpm test:run',
  ],

  // Vue 文件
  '*.vue': ['eslint --fix', () => 'pnpm type-check', () => 'pnpm test:run'],

  // 样式文件
  '*.{css,less,scss,sass}': ['eslint --fix'],

  // JSON 文件
  '*.json': ['eslint --fix'],

  // Markdown 文件
  '*.md': ['eslint --fix'],

  // 包配置文件变更时重新构建
  'package.json': [() => 'pnpm build'],

  // 源码变更时重新构建和测试
  'src/**/*.{ts,tsx,vue}': [() => 'pnpm build', () => 'pnpm test:run'],
}
