#!/usr/bin/env node

/**
 * 通用开发脚本
 * 自动检测操作系统并使用适当的进程管理方式
 * 解决 Windows 下 Ctrl+C 无法正确终止子进程的问题
 */

import { spawn } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');
const isWindows = platform() === 'win32';

// 存储所有子进程
const childProcesses = new Set();
let isCleaningUp = false;

/**
 * 清理所有子进程
 */
function cleanup(exitCode = 0) {
  if (isCleaningUp) return;
  isCleaningUp = true;

  console.log('\n\n🛑 正在停止所有开发服务器...');

  const killPromises = Array.from(childProcesses).map(proc => {
    return new Promise((resolve) => {
      if (!proc || proc.killed) {
        resolve();
        return;
      }

      const pid = proc.pid;
      console.log(`  📌 正在终止进程 PID: ${pid}`);

      // 根据系统选择终止方式
      let killProc;
      if (isWindows) {
        // Windows 下使用 taskkill 强制终止进程树
        killProc = spawn('taskkill', ['/pid', pid.toString(), '/f', '/t'], {
          shell: true,
          stdio: 'ignore'
        });
      } else {
        // Unix/Linux/macOS 下使用 kill
        try {
          process.kill(-pid, 'SIGTERM');
          console.log(`  ✅ 进程 ${pid} 已终止`);
          resolve();
          return;
        } catch (err) {
          console.error(`  ❌ 终止进程 ${pid} 失败:`, err.message);
          resolve();
          return;
        }
      }

      // 设置超时以防 taskkill 挂起
      const timeout = setTimeout(() => {
        console.log(`  ⚠️  进程 ${pid} 终止超时`);
        resolve();
      }, 3000);

      killProc.on('close', () => {
        clearTimeout(timeout);
        console.log(`  ✅ 进程 ${pid} 已终止`);
        resolve();
      });

      killProc.on('error', (err) => {
        clearTimeout(timeout);
        console.error(`  ❌ 终止进程 ${pid} 失败:`, err.message);
        resolve();
      });
    });
  });

  Promise.all(killPromises).then(() => {
    console.log('✅ 所有服务已停止\n');
    process.exit(exitCode);
  });
}

/**
 * 启动子进程
 */
function startProcess(name, command, args, options = {}) {
  console.log(`📦 启动 ${name}...`);
  console.log(`   命令: ${command} ${args.join(' ')}`);
  console.log(`   工作目录: ${options.cwd || projectRoot}\n`);

  const proc = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    // Unix/Linux/macOS 下使用 detached 创建进程组
    detached: !isWindows,
    ...options,
    env: {
      ...process.env,
      ...options.env,
      FORCE_COLOR: '1'
    }
  });

  childProcesses.add(proc);

  proc.on('error', (error) => {
    console.error(`\n❌ ${name} 启动失败:`, error.message);
    cleanup(1);
  });

  proc.on('exit', (code, signal) => {
    childProcesses.delete(proc);
    
    if (code !== 0 && code !== null && !isCleaningUp) {
      console.error(`\n❌ ${name} 异常退出 (code: ${code}, signal: ${signal})`);
      cleanup(1);
    }
  });

  return proc;
}

/**
 * 设置信号处理
 */
function setupSignalHandlers() {
  // 标准信号处理
  process.on('SIGINT', () => {
    console.log('\n\n接收到 SIGINT 信号 (Ctrl+C)');
    cleanup(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n接收到 SIGTERM 信号');
    cleanup(0);
  });

  process.on('SIGBREAK', () => {
    console.log('\n\n接收到 SIGBREAK 信号');
    cleanup(0);
  });

  // Windows 特别处理: 启用原始模式捕获 Ctrl+C
  if (isWindows && process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (key) => {
      // Ctrl+C
      if (key === '\u0003') {
        console.log('\n\n捕获到 Ctrl+C');
        cleanup(0);
      }
      // Ctrl+D (EOF)
      if (key === '\u0004') {
        console.log('\n\n捕获到 Ctrl+D');
        cleanup(0);
      }
    });
  }

  // 异常处理
  process.on('uncaughtException', (error) => {
    console.error('\n❌ 未捕获的异常:', error);
    cleanup(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('\n❌ 未处理的 Promise 拒绝:', reason);
    cleanup(1);
  });

  // 进程退出前清理
  process.on('beforeExit', () => {
    if (!isCleaningUp) {
      cleanup(0);
    }
  });
}

/**
 * 主函数
 */
async function main() {
  console.clear();
  const osInfo = isWindows ? 'Windows' : platform();
  console.log(`🚀 启动 LDesign CLI 开发环境 (${osInfo})\n`);
  console.log('📁 项目根目录:', projectRoot);
  console.log('💡 提示: 按 Ctrl+C 停止所有服务\n');
  console.log('─'.repeat(60));
  console.log('');

  // 设置信号处理
  setupSignalHandlers();

  // 启动 Web 开发服务器
  const webDir = resolve(projectRoot, 'src/web');
  startProcess(
    'Web 开发服务器',
    'pnpm',
    ['dev'],
    { cwd: webDir }
  );

  // 等待一秒让 Web 服务器先启动
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 启动后端开发服务器
  startProcess(
    'Server 开发服务器',
    'tsx',
    ['watch', '--clear-screen=false', 'src/server/dev.ts'],
    { cwd: projectRoot }
  );

  console.log('');
  console.log('─'.repeat(60));
  console.log('');
  console.log('✅ 所有开发服务器已启动！');
  console.log('');
  console.log('📝 服务信息:');
  console.log('   🌐 Web 服务: 查看上方输出的端口号');
  console.log('   🔧 API 服务: 查看上方输出的端口号');
  console.log('');
  console.log('⚠️  重要: 使用 Ctrl+C 停止服务(可能需要按 2-3 次)');
  console.log('');
}

// 启动
main().catch(error => {
  console.error('❌ 启动失败:', error);
  cleanup(1);
});