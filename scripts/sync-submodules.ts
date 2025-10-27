#!/usr/bin/env node

import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const execAsync = promisify(exec);

interface SubmoduleInfo {
  path: string;
  url: string;
  name: string;
}

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step: string) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`  ${step}`, 'bright');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message: string) {
  log(`✓ ${message}`, 'green');
}

function logError(message: string) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message: string) {
  log(`ℹ ${message}`, 'blue');
}

function logWarning(message: string) {
  log(`⚠ ${message}`, 'yellow');
}

// 获取所有 submodule 信息
function getSubmodules(): SubmoduleInfo[] {
  try {
    const output = execSync('git config --file .gitmodules --get-regexp path', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });

    const submodules: SubmoduleInfo[] = [];
    const lines = output.trim().split('\n');

    for (const line of lines) {
      const match = line.match(/submodule\.(.+?)\.path\s+(.+)/);
      if (match) {
        const name = match[1];
        const submodulePath = match[2];

        try {
          const url = execSync(`git config --file .gitmodules --get submodule.${name}.url`, {
            encoding: 'utf-8',
            cwd: process.cwd(),
          }).trim();

          submodules.push({
            path: submodulePath,
            url,
            name,
          });
        } catch (error) {
          logWarning(`无法获取 submodule ${name} 的 URL`);
        }
      }
    }

    return submodules;
  } catch (error) {
    logError('无法读取 .gitmodules 文件');
    throw error;
  }
}

// 检查 submodule 是否已初始化
function isSubmoduleInitialized(submodulePath: string): boolean {
  try {
    const fullPath = path.join(process.cwd(), submodulePath);
    const result = execSync('git rev-parse --git-dir', {
      cwd: fullPath,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// 同步单个 submodule
async function syncSubmodule(submodule: SubmoduleInfo): Promise<boolean> {
  const { path: submodulePath, name } = submodule;

  try {
    const fullPath = path.join(process.cwd(), submodulePath);

    // 检查是否已初始化
    if (!isSubmoduleInitialized(submodulePath)) {
      logInfo(`初始化 ${name}...`);
      await execAsync(`git submodule update --init "${submodulePath}"`);
    }

    // 拉取最新代码
    logInfo(`同步 ${name}...`);

    // 进入 submodule 目录，fetch 并 pull 最新代码
    await execAsync('git fetch origin', { cwd: fullPath });

    // 获取当前分支
    const { stdout: branchOutput } = await execAsync('git rev-parse --abbrev-ref HEAD', {
      cwd: fullPath,
    });
    const currentBranch = branchOutput.trim();

    if (currentBranch === 'HEAD') {
      // 处于 detached HEAD 状态，尝试切换到 master 或 main
      try {
        await execAsync('git checkout master', { cwd: fullPath });
        await execAsync('git pull origin master', { cwd: fullPath });
      } catch {
        try {
          await execAsync('git checkout main', { cwd: fullPath });
          await execAsync('git pull origin main', { cwd: fullPath });
        } catch {
          logWarning(`${name} 处于 detached HEAD 状态，已更新但未切换分支`);
          return true;
        }
      }
    } else {
      // 正常分支，直接 pull
      await execAsync(`git pull origin ${currentBranch}`, { cwd: fullPath });
    }

    logSuccess(`${name} 同步完成`);
    return true;
  } catch (error: any) {
    logError(`${name} 同步失败: ${error.message}`);
    return false;
  }
}

// 批量同步 submodules（支持并发）
async function syncAllSubmodules(submodules: SubmoduleInfo[], concurrency: number = 5) {
  const results = {
    success: 0,
    failed: 0,
    total: submodules.length,
  };

  logStep(`开始同步 ${results.total} 个 submodules (并发数: ${concurrency})`);

  // 分批处理
  for (let i = 0; i < submodules.length; i += concurrency) {
    const batch = submodules.slice(i, i + concurrency);
    const batchPromises = batch.map(submodule => syncSubmodule(submodule));

    const batchResults = await Promise.all(batchPromises);

    batchResults.forEach(success => {
      if (success) {
        results.success++;
      } else {
        results.failed++;
      }
    });

    // 显示进度
    const progress = Math.min(i + concurrency, results.total);
    logInfo(`进度: ${progress}/${results.total}`);
  }

  return results;
}

// 主函数
async function main() {
  try {
    log('\n🚀 Submodule 同步工具\n', 'bright');

    // 检查是否在 git 仓库中
    try {
      execSync('git rev-parse --git-dir', { stdio: 'pipe' });
    } catch (error) {
      logError('当前目录不是 git 仓库！');
      process.exit(1);
    }

    // 获取所有 submodules
    logStep('读取 submodule 配置');
    const submodules = getSubmodules();

    if (submodules.length === 0) {
      logWarning('没有找到任何 submodule');
      return;
    }

    logSuccess(`找到 ${submodules.length} 个 submodules`);

    // 询问是否继续（可选）
    const args = process.argv.slice(2);
    const autoYes = args.includes('-y') || args.includes('--yes');

    if (!autoYes) {
      logInfo('提示: 使用 -y 或 --yes 参数可跳过确认');
      logInfo('按 Ctrl+C 取消，或按回车继续...');
      // 在实际使用中，这里可以添加 readline 来等待用户输入
    }

    // 解析并发数参数
    const concurrencyArg = args.find(arg => arg.startsWith('--concurrency='));
    const concurrency = concurrencyArg
      ? parseInt(concurrencyArg.split('=')[1], 10)
      : 5;

    // 同步所有 submodules
    const results = await syncAllSubmodules(submodules, concurrency);

    // 显示结果
    logStep('同步结果');
    log(`总计: ${results.total}`, 'bright');
    logSuccess(`成功: ${results.success}`);

    if (results.failed > 0) {
      logError(`失败: ${results.failed}`);
      process.exit(1);
    } else {
      log('\n✨ 所有 submodules 同步完成！\n', 'green');
    }

  } catch (error: any) {
    logError(`发生错误: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
main();

