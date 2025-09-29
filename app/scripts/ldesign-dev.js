#!/usr/bin/env node

/**
 * LDesign CLI 开发版本启动脚本
 * 直接使用 CLI 源码，无需打包，支持实时调试
 */

import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import createJiti from 'jiti';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// 使用 jiti 来支持 TypeScript 和 ESM
const jiti = createJiti(__filename, {
  interopDefault: true,
  esmResolve: true
});

// CLI 源码路径（相对于 app 目录）
const cliSrcPath = join(__dirname, '../../packages/cli/src/index.ts');

console.log('🔧 [开发模式] 使用 CLI 源码启动...');
console.log(`📁 CLI 源码路径: ${cliSrcPath}`);

try {
  // 直接加载 CLI 源文件
  const { main } = await jiti.import(cliSrcPath);
  await main();
} catch (error) {
  console.error('❌ CLI 源码启动失败:', error.message);
  console.error('📋 错误详情:', error.stack);
  process.exit(1);
}
