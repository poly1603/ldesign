#!/usr/bin/env node

/**
 * 构建所有项目的脚本
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 构建任务配置
const buildTasks = [
  {
    name: '主库',
    cwd: rootDir,
    command: 'pnpm',
    args: ['build']
  },
  {
    name: 'Vue3示例',
    cwd: join(rootDir, 'examples/vue3-demo'),
    command: 'pnpm',
    args: ['build']
  },
  {
    name: '原生JS示例',
    cwd: join(rootDir, 'examples/vanilla-demo'),
    command: 'pnpm',
    args: ['build']
  },
  {
    name: '文档',
    cwd: rootDir,
    command: 'pnpm',
    args: ['docs:build']
  }
];

// 执行构建任务
async function runTask(task) {
  return new Promise((resolve, reject) => {
    console.log(`\n📦 构建 ${task.name}...`);
    console.log(`   目录: ${task.cwd}`);
    console.log(`   命令: ${task.command} ${task.args.join(' ')}\n`);

    const child = spawn(task.command, task.args, {
      cwd: task.cwd,
      stdio: 'inherit',
      shell: true
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${task.name} 构建成功\n`);
        resolve();
      } else {
        reject(new Error(`${task.name} 构建失败，退出代码: ${code}`));
      }
    });
  });
}

// 按顺序执行所有任务
async function buildAll() {
  console.log('🚀 开始构建所有项目...\n');
  console.log('=' .repeat(50));

  const startTime = Date.now();

  try {
    for (const task of buildTasks) {
      await runTask(task);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('=' .repeat(50));
    console.log(`\n🎉 所有项目构建完成！耗时: ${duration}秒\n`);
  } catch (error) {
    console.error('\n❌ 构建失败:', error.message);
    process.exit(1);
  }
}

buildAll();
