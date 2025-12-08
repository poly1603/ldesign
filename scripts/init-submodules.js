#!/usr/bin/env node

/**
 * Submodule 自动初始化脚本
 *
 * 功能：
 * 1. 解析 .gitmodules 文件
 * 2. 初始化并拉取所有 submodule
 * 3. 切换到配置的远程分支
 *
 * 使用：node scripts/init-submodules.js [选项]
 * 选项：
 *   --parallel, -p    并行处理 submodule（默认顺序执行）
 *   --concurrency N   并行数量（默认 4）
 *   --verbose, -v     显示详细日志
 *   --dry-run         仅显示将执行的操作，不实际执行
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module 中获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== 配置 ==========
const ROOT_DIR = path.resolve(__dirname, '..');
const GITMODULES_PATH = path.join(ROOT_DIR, '.gitmodules');

// ========== 解析命令行参数 ==========
const args = process.argv.slice(2);
const OPTIONS = {
  parallel: args.includes('--parallel') || args.includes('-p'),
  verbose: args.includes('--verbose') || args.includes('-v'),
  dryRun: args.includes('--dry-run'),
  concurrency: 4,
};

// 解析 --concurrency N
const concurrencyIndex = args.findIndex((a) => a === '--concurrency');
if (concurrencyIndex !== -1 && args[concurrencyIndex + 1]) {
  OPTIONS.concurrency = parseInt(args[concurrencyIndex + 1], 10) || 4;
}

// ========== 工具函数 ==========
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`[${step}] ${message}`, colors.cyan);
}

function logSuccess(message) {
  log(`✅ ${message}`, colors.green);
}

function logError(message) {
  log(`❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function logVerbose(message) {
  if (OPTIONS.verbose) {
    log(`   ${message}`, colors.gray);
  }
}

function execCommand(command, options = {}) {
  const { cwd = ROOT_DIR, silent = false } = options;

  if (OPTIONS.dryRun) {
    log(`[DRY-RUN] ${command}`, colors.gray);
    return '';
  }

  logVerbose(`执行: ${command}`);

  try {
    const result = execSync(command, {
      cwd,
      encoding: 'utf8',
      stdio: silent ? 'pipe' : OPTIONS.verbose ? 'inherit' : 'pipe',
    });
    return result ? result.trim() : '';
  } catch (error) {
    if (!silent) {
      throw error;
    }
    return '';
  }
}

// ========== 解析 .gitmodules ==========
function parseGitmodules(content) {
  const submodules = [];
  const lines = content.split('\n');

  let currentModule = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // 匹配 [submodule "xxx"]
    const submoduleMatch = trimmed.match(/^\[submodule\s+"(.+)"\]$/);
    if (submoduleMatch) {
      if (currentModule) {
        submodules.push(currentModule);
      }
      currentModule = {
        name: submoduleMatch[1],
        path: '',
        url: '',
        branch: 'main', // 默认分支
      };
      continue;
    }

    if (currentModule) {
      // 匹配 key = value
      const kvMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/);
      if (kvMatch) {
        const [, key, value] = kvMatch;
        if (key === 'path') currentModule.path = value;
        if (key === 'url') currentModule.url = value;
        if (key === 'branch') currentModule.branch = value;
      }
    }
  }

  // 添加最后一个模块
  if (currentModule) {
    submodules.push(currentModule);
  }

  return submodules;
}

// ========== 检查 Git 环境 ==========
function checkGitEnvironment() {
  logStep('1/4', '检查 Git 环境...');

  try {
    const gitVersion = execCommand('git --version', { silent: true });
    logVerbose(`Git 版本: ${gitVersion}`);
  } catch (error) {
    logError('未安装 Git 或 Git 不在 PATH 中');
    process.exit(1);
  }

  // 检查是否在 Git 仓库中
  try {
    execCommand('git rev-parse --git-dir', { silent: true });
  } catch (error) {
    logError('当前目录不是 Git 仓库');
    process.exit(1);
  }

  // 检查 .gitmodules 是否存在
  if (!fs.existsSync(GITMODULES_PATH)) {
    logError('.gitmodules 文件不存在');
    process.exit(1);
  }

  logSuccess('Git 环境检查通过');
}

// ========== 初始化 Submodules ==========
function initSubmodules() {
  logStep('2/4', '初始化 Submodules...');

  try {
    execCommand('git submodule init');
    logSuccess('Submodule 初始化完成');
  } catch (error) {
    logError(`Submodule 初始化失败: ${error.message}`);
    process.exit(1);
  }
}

// ========== 拉取 Submodules ==========
function fetchSubmodules() {
  logStep('3/4', '拉取所有 Submodules（这可能需要一些时间）...');

  try {
    // 使用 --jobs 并行拉取
    const jobs = OPTIONS.parallel ? OPTIONS.concurrency : 1;
    execCommand(`git submodule update --init --recursive --jobs=${jobs}`);
    logSuccess('所有 Submodules 拉取完成');
  } catch (error) {
    logWarning(`部分 Submodule 拉取可能失败: ${error.message}`);
  }
}

// ========== 切换分支 ==========
async function switchBranches(submodules) {
  logStep('4/4', '切换到配置的远程分支...');

  const results = {
    success: [],
    failed: [],
    skipped: [],
  };

  const total = submodules.length;

  if (OPTIONS.parallel) {
    // 并行处理
    await processInParallel(
      submodules,
      async (submodule, index) => {
        const result = await switchBranch(submodule, index, total);
        if (result.success) {
          results.success.push(submodule.name);
        } else if (result.skipped) {
          results.skipped.push(submodule.name);
        } else {
          results.failed.push({ name: submodule.name, error: result.error });
        }
      },
      OPTIONS.concurrency
    );
  } else {
    // 顺序处理
    for (let i = 0; i < submodules.length; i++) {
      const submodule = submodules[i];
      const result = await switchBranch(submodule, i, total);
      if (result.success) {
        results.success.push(submodule.name);
      } else if (result.skipped) {
        results.skipped.push(submodule.name);
      } else {
        results.failed.push({ name: submodule.name, error: result.error });
      }
    }
  }

  return results;
}

async function switchBranch(submodule, index, total) {
  const { name, path: subPath, branch, url } = submodule;
  const fullPath = path.join(ROOT_DIR, subPath);
  const progress = `[${index + 1}/${total}]`;

  // 检查目录是否存在
  if (!fs.existsSync(fullPath)) {
    logWarning(`${progress} ${name}: 目录不存在，跳过`);
    return { skipped: true };
  }

  // 检查是否是有效的 Git 仓库
  const gitDir = path.join(fullPath, '.git');
  if (!fs.existsSync(gitDir)) {
    logWarning(`${progress} ${name}: 不是有效的 Git 仓库，跳过`);
    return { skipped: true };
  }

  // 检查 submodule 是否为空（只有 .git 但没有其他文件）
  const files = fs.readdirSync(fullPath);
  const isEmpty = files.length === 1 && files[0] === '.git';

  if (isEmpty && url) {
    logWarning(`${progress} ${name}: 检测到空仓库，正在重新克隆...`);
    try {
      // 删除空目录
      fs.rmSync(fullPath, { recursive: true, force: true });
      // 重新克隆
      execCommand(`git clone ${url} "${subPath}"`, { cwd: ROOT_DIR, silent: true });
      log(`${progress} ${name}: 重新克隆成功`, colors.green);
    } catch (e) {
      logError(`${progress} ${name}: 重新克隆失败: ${e.message}`);
      return { success: false, error: e.message };
    }
  }

  try {
    if (OPTIONS.dryRun) {
      log(`${progress} [DRY-RUN] ${name} -> ${branch}`, colors.gray);
      return { success: true };
    }

    // 获取远程分支
    execCommand('git fetch origin', { cwd: fullPath, silent: true });

    // 检查远程分支是否存在
    try {
      execCommand(`git rev-parse origin/${branch}`, { cwd: fullPath, silent: true });
    } catch (e) {
      logWarning(`${progress} ${name}: 远程分支 origin/${branch} 不存在，跳过`);
      return { skipped: true };
    }

    // 强制切换到远程分支（初始化场景下总是跟踪远程分支）
    // 使用 git checkout -B 创建或重置本地分支到远程分支
    execCommand(`git checkout -B ${branch} origin/${branch}`, { cwd: fullPath, silent: true });

    // 确保跟踪远程分支
    execCommand(`git branch --set-upstream-to=origin/${branch} ${branch}`, { cwd: fullPath, silent: true });

    log(`${progress} ${name} -> ${colors.green}${branch}${colors.reset}`);
    return { success: true };
  } catch (error) {
    logError(`${progress} ${name}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ========== 并行处理工具 ==========
async function processInParallel(items, handler, concurrency) {
  const queue = [...items.entries()];
  const workers = [];

  for (let i = 0; i < concurrency; i++) {
    workers.push(
      (async () => {
        while (queue.length > 0) {
          const [index, item] = queue.shift();
          await handler(item, index);
        }
      })()
    );
  }

  await Promise.all(workers);
}

// ========== 主函数 ==========
async function main() {
  console.log('\n' + '='.repeat(60));
  log('🚀 LDesign Submodule 初始化工具', colors.bright + colors.cyan);
  console.log('='.repeat(60) + '\n');

  if (OPTIONS.dryRun) {
    logWarning('DRY-RUN 模式：不会执行实际操作\n');
  }

  const startTime = Date.now();

  // 1. 检查环境
  checkGitEnvironment();

  // 2. 解析 .gitmodules
  const gitmodulesContent = fs.readFileSync(GITMODULES_PATH, 'utf8');
  const submodules = parseGitmodules(gitmodulesContent);
  log(`\n📦 发现 ${submodules.length} 个 submodules\n`, colors.blue);

  // 3. 初始化
  initSubmodules();

  // 4. 拉取
  fetchSubmodules();

  // 5. 切换分支
  const results = await switchBranches(submodules);

  // 输出结果
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  log('📊 执行结果', colors.bright);
  console.log('='.repeat(60));

  logSuccess(`成功: ${results.success.length}`);
  if (results.skipped.length > 0) {
    logWarning(`跳过: ${results.skipped.length}`);
  }
  if (results.failed.length > 0) {
    logError(`失败: ${results.failed.length}`);
    results.failed.forEach(({ name, error }) => {
      log(`   - ${name}: ${error}`, colors.red);
    });
  }

  log(`\n⏱️  总耗时: ${duration} 秒`, colors.cyan);

  console.log('\n💡 提示:');
  console.log('   - 使用 --parallel 或 -p 启用并行处理');
  console.log('   - 使用 --concurrency N 设置并行数量（默认 4）');
  console.log('   - 使用 --verbose 或 -v 显示详细日志');
  console.log('   - 使用 --dry-run 预览操作\n');

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

// ========== 运行 ==========
main().catch((error) => {
  logError(`脚本执行出错: ${error.message}`);
  process.exit(1);
});
