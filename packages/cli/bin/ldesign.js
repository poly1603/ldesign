#!/usr/bin/env node

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

// 动态加载主入口文件
const cliPath = join(__dirname, '../dist/index.js');

try {
  // 尝试加载编译后的文件
  const { main } = await import(cliPath);
  await main();
} catch (error) {
  // 如果编译后的文件不存在，尝试直接加载源文件（开发模式）
  try {
    const srcPath = join(__dirname, '../src/index.ts');
    const { main } = await jiti.import(srcPath);
    await main();
  } catch (devError) {
    console.error('Failed to start CLI:', error.message);
    console.error('Development mode also failed:', devError.message);
    process.exit(1);
  }
}
