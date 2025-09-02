/**
 * Playwright 全局清理
 * 
 * 在所有测试运行完成后执行的全局清理
 */

import { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  console.log('🧹 开始 E2E 测试全局清理...');

  // 清理临时文件
  const fs = require('fs');
  const path = require('path');

  // 清理测试过程中生成的临时文件
  const tempDir = path.join(process.cwd(), 'temp');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  // 生成测试报告摘要
  const reportDir = path.join(process.cwd(), 'playwright-report');
  const resultsFile = path.join(reportDir, 'results.json');

  if (fs.existsSync(resultsFile)) {
    try {
      const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
      const summary = {
        total: results.suites?.reduce((acc: number, suite: any) => acc + (suite.specs?.length || 0), 0) || 0,
        passed: 0,
        failed: 0,
        skipped: 0,
      };

      // 统计测试结果
      results.suites?.forEach((suite: any) => {
        suite.specs?.forEach((spec: any) => {
          spec.tests?.forEach((test: any) => {
            switch (test.status) {
              case 'passed':
                summary.passed++;
                break;
              case 'failed':
                summary.failed++;
                break;
              case 'skipped':
                summary.skipped++;
                break;
            }
          });
        });
      });

      console.log('📊 E2E 测试结果摘要:');
      console.log(`   总计: ${summary.total}`);
      console.log(`   通过: ${summary.passed}`);
      console.log(`   失败: ${summary.failed}`);
      console.log(`   跳过: ${summary.skipped}`);

      if (summary.failed > 0) {
        console.log(`❌ 有 ${summary.failed} 个测试失败`);
      } else {
        console.log('✅ 所有测试都通过了');
      }
    } catch (error) {
      console.warn('⚠️ 无法解析测试结果文件:', error);
    }
  }

  console.log('✅ E2E 测试全局清理完成');
}

export default globalTeardown;
