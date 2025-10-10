#!/usr/bin/env node

/**
 * 复制PDF.js worker文件到示例项目
 */

import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Worker源文件路径
const workerSource = join(rootDir, 'node_modules/pdfjs-dist/build/pdf.worker.min.js');

// 目标路径
const targets = [
  join(rootDir, 'examples/vue3-demo/public/pdf.worker.min.js'),
  join(rootDir, 'examples/vanilla-demo/public/pdf.worker.min.js'),
  join(rootDir, 'docs/public/pdf.worker.min.js'),
];

console.log('📦 开始复制PDF.js Worker文件...\n');

// 检查源文件是否存在
if (!existsSync(workerSource)) {
  console.error('❌ 错误: 找不到worker源文件');
  console.error('请先运行: pnpm install');
  process.exit(1);
}

// 复制到各个目标
targets.forEach((target) => {
  try {
    // 确保目标目录存在
    const targetDir = dirname(target);
    if (!existsSync(targetDir)) {
      mkdirSync(targetDir, { recursive: true });
    }

    // 复制文件
    copyFileSync(workerSource, target);
    console.log(`✅ 已复制到: ${target.replace(rootDir, '.')}`);
  } catch (error) {
    console.error(`❌ 复制失败 ${target}:`, error.message);
  }
});

console.log('\n🎉 Worker文件复制完成！\n');
console.log('现在可以使用本地worker路径:');
console.log('  workerSrc: "/pdf.worker.min.js"\n');
