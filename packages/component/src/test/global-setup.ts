/**
 * Playwright 全局设置
 * 
 * 在所有测试运行前执行的全局设置
 */

import { FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
  console.log('🚀 开始 E2E 测试全局设置...');

  // 设置测试环境变量
  process.env.NODE_ENV = 'test';
  process.env.TEST_MODE = 'e2e';

  // 清理之前的测试结果
  const fs = require('fs');
  const path = require('path');

  const testResultsDir = path.join(process.cwd(), 'test-results');
  const playwrightReportDir = path.join(process.cwd(), 'playwright-report');

  if (fs.existsSync(testResultsDir)) {
    fs.rmSync(testResultsDir, { recursive: true, force: true });
  }

  if (fs.existsSync(playwrightReportDir)) {
    fs.rmSync(playwrightReportDir, { recursive: true, force: true });
  }

  console.log('✅ E2E 测试全局设置完成');
}

export default globalSetup;
