/**
 * Grid Examples 自动化测试脚本
 * 功能：启动三个示例项目，通过 Playwright 打开浏览器并验证功能
 */

import { spawn } from 'child_process';
import { chromium } from 'playwright';
import { setTimeout } from 'timers/promises';

// 配置
const EXAMPLES = [
  {
    name: 'Vue Demo',
    path: './examples/vue-demo',
    port: 5173,
    url: 'http://localhost:5173'
  },
  {
    name: 'React Demo',
    path: './examples/react-demo',
    port: 5174,
    url: 'http://localhost:5174'
  },
  {
    name: 'Vanilla Demo',
    path: './examples/vanilla-demo',
    port: 5175,
    url: 'http://localhost:5175'
  }
];

// 存储进程引用
const processes = [];

/**
 * 启动开发服务器
 */
async function startDevServer(example) {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 启动 ${example.name}...`);
    
    const proc = spawn('pnpm', ['dev', '--port', example.port], {
      cwd: example.path,
      shell: true,
      stdio: 'pipe'
    });

    processes.push(proc);

    let serverReady = false;

    proc.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`[${example.name}] ${output.trim()}`);
      
      // 检查服务器是否启动成功
      if (output.includes('Local:') || output.includes(`${example.port}`)) {
        if (!serverReady) {
          serverReady = true;
          console.log(`✅ ${example.name} 启动成功: ${example.url}`);
          resolve();
        }
      }
    });

    proc.stderr.on('data', (data) => {
      console.error(`[${example.name} Error] ${data.toString()}`);
    });

    proc.on('error', (error) => {
      reject(new Error(`启动 ${example.name} 失败: ${error.message}`));
    });

    // 超时处理
    setTimeout(() => {
      if (!serverReady) {
        reject(new Error(`${example.name} 启动超时`));
      }
    }, 30000);
  });
}

/**
 * 使用 Playwright 测试示例页面
 */
async function testExample(example, browser) {
  console.log(`\n🧪 测试 ${example.name}...`);
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();

  try {
    // 访问页面
    console.log(`  → 访问 ${example.url}`);
    await page.goto(example.url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // 等待页面加载
    await setTimeout(2000);

    // 截图
    const screenshotPath = `./screenshots/${example.name.replace(/\s+/g, '-')}.png`;
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: true 
    });
    console.log(`  ✓ 截图已保存: ${screenshotPath}`);

    // 检查基本元素
    console.log(`  → 检查页面元素...`);
    
    // 检查标题
    const title = await page.title();
    console.log(`  ✓ 页面标题: ${title}`);

    // 检查是否有 grid 容器
    const hasGrid = await page.locator('.grid-stack').count() > 0;
    if (hasGrid) {
      console.log(`  ✓ Grid 容器已加载`);
    } else {
      console.warn(`  ⚠ 未找到 Grid 容器`);
    }

    // 检查 grid items
    const itemCount = await page.locator('.grid-stack-item').count();
    console.log(`  ✓ Grid 项数量: ${itemCount}`);

    // 测试拖拽功能（如果有 grid items）
    if (itemCount > 0) {
      console.log(`  → 测试拖拽功能...`);
      const firstItem = page.locator('.grid-stack-item').first();
      
      // 获取初始位置
      const initialBox = await firstItem.boundingBox();
      
      // 执行拖拽
      await firstItem.hover();
      await page.mouse.down();
      await page.mouse.move(initialBox.x + 100, initialBox.y + 100);
      await page.mouse.up();
      
      await setTimeout(500);
      
      const finalBox = await firstItem.boundingBox();
      
      if (Math.abs(finalBox.x - initialBox.x) > 50 || Math.abs(finalBox.y - initialBox.y) > 50) {
        console.log(`  ✓ 拖拽功能正常`);
      } else {
        console.warn(`  ⚠ 拖拽可能未生效`);
      }
    }

    // 测试响应式
    console.log(`  → 测试响应式...`);
    await page.setViewportSize({ width: 768, height: 1024 });
    await setTimeout(1000);
    
    const mobileScreenshot = `./screenshots/${example.name.replace(/\s+/g, '-')}-mobile.png`;
    await page.screenshot({ 
      path: mobileScreenshot,
      fullPage: true 
    });
    console.log(`  ✓ 移动端截图已保存: ${mobileScreenshot}`);

    // 检查控制台错误
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await setTimeout(1000);

    if (errors.length > 0) {
      console.warn(`  ⚠ 控制台错误 (${errors.length}):`, errors);
    } else {
      console.log(`  ✓ 无控制台错误`);
    }

    console.log(`✅ ${example.name} 测试完成\n`);
    
    return {
      success: true,
      name: example.name,
      url: example.url,
      itemCount,
      errors: errors.length
    };

  } catch (error) {
    console.error(`❌ ${example.name} 测试失败:`, error.message);
    return {
      success: false,
      name: example.name,
      error: error.message
    };
  } finally {
    await context.close();
  }
}

/**
 * 清理进程
 */
function cleanup() {
  console.log('\n🧹 清理进程...');
  processes.forEach(proc => {
    try {
      proc.kill('SIGTERM');
    } catch (error) {
      console.error('清理进程失败:', error.message);
    }
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('=' .repeat(60));
  console.log('Grid Examples 自动化测试');
  console.log('=' .repeat(60));

  let browser;
  const results = [];

  try {
    // 创建截图目录
    const fs = await import('fs');
    if (!fs.existsSync('./screenshots')) {
      fs.mkdirSync('./screenshots', { recursive: true });
    }

    // 启动所有开发服务器
    console.log('\n📦 启动所有示例项目...\n');
    for (const example of EXAMPLES) {
      await startDevServer(example);
      await setTimeout(3000); // 给服务器一些启动时间
    }

    console.log('\n✅ 所有服务器启动完成');

    // 等待所有服务器稳定
    await setTimeout(5000);

    // 启动浏览器
    console.log('\n🌐 启动 Chromium 浏览器...');
    browser = await chromium.launch({
      headless: false, // 显示浏览器窗口
      args: ['--start-maximized']
    });
    console.log('✅ 浏览器已启动');

    // 测试所有示例
    console.log('\n🧪 开始测试所有示例...');
    for (const example of EXAMPLES) {
      const result = await testExample(example, browser);
      results.push(result);
      await setTimeout(2000); // 测试间隔
    }

    // 输出测试报告
    console.log('\n' + '='.repeat(60));
    console.log('测试报告');
    console.log('='.repeat(60));
    
    results.forEach(result => {
      if (result.success) {
        console.log(`\n✅ ${result.name}`);
        console.log(`   URL: ${result.url}`);
        console.log(`   Grid 项数量: ${result.itemCount}`);
        console.log(`   控制台错误: ${result.errors}`);
      } else {
        console.log(`\n❌ ${result.name}`);
        console.log(`   错误: ${result.error}`);
      }
    });

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log('\n' + '='.repeat(60));
    console.log(`总计: ${results.length} | 成功: ${successCount} | 失败: ${failCount}`);
    console.log('='.repeat(60));

    // 等待用户查看
    console.log('\n💡 浏览器将保持打开状态 30 秒，以便您查看结果...');
    await setTimeout(30000);

  } catch (error) {
    console.error('\n❌ 执行失败:', error);
    process.exit(1);
  } finally {
    // 清理
    if (browser) {
      await browser.close();
      console.log('✅ 浏览器已关闭');
    }
    cleanup();
    console.log('✅ 所有进程已清理');
  }
}

// 处理退出信号
process.on('SIGINT', () => {
  console.log('\n收到中断信号...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n收到终止信号...');
  cleanup();
  process.exit(0);
});

// 运行
main().catch(error => {
  console.error('致命错误:', error);
  cleanup();
  process.exit(1);
});
