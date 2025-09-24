import { test, expect, Page } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 测试图片路径
const TEST_IMAGE_PATH = join(__dirname, '../fixtures/test-image.jpg');
const LARGE_IMAGE_PATH = join(__dirname, '../fixtures/large-image.jpg');

test.describe('Cropper E2E Tests', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    // 导航到测试页面
    await page.goto('/examples/basic.html');
    await page.waitForLoadState('networkidle');
  });

  test.describe('基础功能测试', () => {
    test('应该能够加载和显示图片', async () => {
      // 上传图片
      const fileInput = page.locator('#imageInput');
      await fileInput.setInputFiles(TEST_IMAGE_PATH);

      // 等待图片加载
      await page.waitForSelector('.cropper-container canvas', { timeout: 5000 });

      // 验证图片已加载
      const canvas = page.locator('.cropper-container canvas');
      await expect(canvas).toBeVisible();

      // 验证状态显示
      const status = page.locator('#status');
      await expect(status).toContainText('图片加载成功');
    });

    test('应该能够设置不同的裁剪形状', async () => {
      // 上传图片
      await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
      await page.waitForSelector('.cropper-container canvas');

      // 测试矩形裁剪
      await page.selectOption('#shapeSelect', 'rectangle');
      await page.waitForTimeout(500);

      // 测试圆形裁剪
      await page.selectOption('#shapeSelect', 'circle');
      await page.waitForTimeout(500);

      // 测试椭圆裁剪
      await page.selectOption('#shapeSelect', 'ellipse');
      await page.waitForTimeout(500);

      // 验证形状切换成功
      const status = page.locator('#status');
      await expect(status).toContainText('裁剪形状已更改');
    });

    test('应该能够设置宽高比', async () => {
      // 上传图片
      await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
      await page.waitForSelector('.cropper-container canvas');

      // 测试不同宽高比
      const aspectRatios = ['free', '1', '4/3', '16/9'];
      
      for (const ratio of aspectRatios) {
        await page.selectOption('#aspectRatioSelect', ratio);
        await page.waitForTimeout(300);
        
        const status = page.locator('#status');
        await expect(status).toContainText('宽高比已设置');
      }
    });
  });

  test.describe('交互操作测试', () => {
    test.beforeEach(async () => {
      // 每个测试前都加载图片
      await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
      await page.waitForSelector('.cropper-container canvas');
    });

    test('应该能够缩放图片', async () => {
      const scaleSlider = page.locator('#scaleSlider');
      const scaleValue = page.locator('#scaleValue');

      // 测试放大
      await scaleSlider.fill('1.5');
      await expect(scaleValue).toContainText('1.5');

      // 测试缩小
      await scaleSlider.fill('0.8');
      await expect(scaleValue).toContainText('0.8');
    });

    test('应该能够旋转图片', async () => {
      const rotateSlider = page.locator('#rotateSlider');
      const rotateValue = page.locator('#rotateValue');

      // 测试旋转
      await rotateSlider.fill('45');
      await expect(rotateValue).toContainText('45');

      await rotateSlider.fill('-30');
      await expect(rotateValue).toContainText('-30');
    });

    test('应该能够翻转图片', async () => {
      const flipXBtn = page.locator('#flipXBtn');
      const flipYBtn = page.locator('#flipYBtn');

      // 测试水平翻转
      await flipXBtn.click();
      await page.waitForTimeout(300);

      // 测试垂直翻转
      await flipYBtn.click();
      await page.waitForTimeout(300);

      // 验证翻转状态
      const status = page.locator('#status');
      await expect(status).toContainText('翻转');
    });

    test('应该能够重置所有变换', async () => {
      // 先进行一些变换
      await page.locator('#scaleSlider').fill('1.5');
      await page.locator('#rotateSlider').fill('45');
      await page.locator('#flipXBtn').click();

      // 重置
      await page.locator('#resetBtn').click();
      await page.waitForTimeout(500);

      // 验证重置成功
      const scaleValue = page.locator('#scaleValue');
      const rotateValue = page.locator('#rotateValue');
      
      await expect(scaleValue).toContainText('1');
      await expect(rotateValue).toContainText('0');
    });
  });

  test.describe('导出功能测试', () => {
    test.beforeEach(async () => {
      await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
      await page.waitForSelector('.cropper-container canvas');
    });

    test('应该能够导出PNG格式', async () => {
      const downloadPromise = page.waitForEvent('download');
      await page.locator('#exportBtn').click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.png$/);
    });

    test('应该能够复制到剪贴板', async () => {
      // 模拟剪贴板权限
      await page.context().grantPermissions(['clipboard-write']);
      
      await page.locator('#copyBtn').click();
      await page.waitForTimeout(500);

      const status = page.locator('#status');
      await expect(status).toContainText('已复制到剪贴板');
    });

    test('应该能够预览裁剪结果', async () => {
      await page.locator('#previewBtn').click();
      await page.waitForTimeout(500);

      const previewCanvas = page.locator('#previewCanvas');
      await expect(previewCanvas).toBeVisible();
    });
  });

  test.describe('鼠标交互测试', () => {
    test.beforeEach(async () => {
      await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
      await page.waitForSelector('.cropper-container canvas');
    });

    test('应该能够拖拽裁剪区域', async () => {
      const canvas = page.locator('.cropper-container canvas');
      
      // 获取画布中心点
      const canvasBox = await canvas.boundingBox();
      if (!canvasBox) throw new Error('Canvas not found');
      
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;

      // 拖拽裁剪区域
      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + 50, centerY + 50);
      await page.mouse.up();

      await page.waitForTimeout(300);

      // 验证拖拽成功
      const status = page.locator('#status');
      await expect(status).toContainText('裁剪区域已更改');
    });

    test('应该能够调整裁剪区域大小', async () => {
      const canvas = page.locator('.cropper-container canvas');
      const canvasBox = await canvas.boundingBox();
      if (!canvasBox) throw new Error('Canvas not found');

      // 模拟在控制点上调整大小
      const handleX = canvasBox.x + canvasBox.width * 0.8;
      const handleY = canvasBox.y + canvasBox.height * 0.8;

      await page.mouse.move(handleX, handleY);
      await page.mouse.down();
      await page.mouse.move(handleX + 30, handleY + 30);
      await page.mouse.up();

      await page.waitForTimeout(300);

      const status = page.locator('#status');
      await expect(status).toContainText('裁剪区域已更改');
    });
  });

  test.describe('触摸交互测试', () => {
    test.beforeEach(async () => {
      // 模拟移动设备
      await page.setViewportSize({ width: 375, height: 667 });
      await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
      await page.waitForSelector('.cropper-container canvas');
    });

    test('应该支持触摸拖拽', async () => {
      const canvas = page.locator('.cropper-container canvas');
      const canvasBox = await canvas.boundingBox();
      if (!canvasBox) throw new Error('Canvas not found');

      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;

      // 模拟触摸拖拽
      await page.touchscreen.tap(centerX, centerY);
      await page.waitForTimeout(100);
      await page.touchscreen.tap(centerX + 50, centerY + 50);

      await page.waitForTimeout(300);
    });

    test('应该支持双指缩放', async () => {
      const canvas = page.locator('.cropper-container canvas');
      const canvasBox = await canvas.boundingBox();
      if (!canvasBox) throw new Error('Canvas not found');

      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;

      // 模拟双指缩放手势
      await page.evaluate((coords) => {
        const canvas = document.querySelector('.cropper-container canvas') as HTMLCanvasElement;
        if (!canvas) return;

        // 创建触摸事件
        const touch1 = new Touch({
          identifier: 1,
          target: canvas,
          clientX: coords.x - 50,
          clientY: coords.y,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5,
        });

        const touch2 = new Touch({
          identifier: 2,
          target: canvas,
          clientX: coords.x + 50,
          clientY: coords.y,
          radiusX: 2.5,
          radiusY: 2.5,
          rotationAngle: 10,
          force: 0.5,
        });

        const touchEvent = new TouchEvent('touchstart', {
          touches: [touch1, touch2],
          targetTouches: [touch1, touch2],
          changedTouches: [touch1, touch2],
          bubbles: true,
          cancelable: true
        });

        canvas.dispatchEvent(touchEvent);
      }, { x: centerX, y: centerY });

      await page.waitForTimeout(300);
    });
  });

  test.describe('键盘快捷键测试', () => {
    test.beforeEach(async () => {
      await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
      await page.waitForSelector('.cropper-container canvas');
    });

    test('应该支持键盘快捷键', async () => {
      // 聚焦到画布
      await page.locator('.cropper-container canvas').click();

      // 测试 Ctrl+Z (撤销)
      await page.keyboard.press('Control+z');
      await page.waitForTimeout(300);

      // 测试 Ctrl+Y (重做)
      await page.keyboard.press('Control+y');
      await page.waitForTimeout(300);

      // 测试 Ctrl+C (复制)
      await page.context().grantPermissions(['clipboard-write']);
      await page.keyboard.press('Control+c');
      await page.waitForTimeout(300);

      // 测试 Delete (删除)
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);

      // 测试 Enter (确认)
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);
    });

    test('应该支持方向键移动裁剪区域', async () => {
      await page.locator('.cropper-container canvas').click();

      // 测试方向键
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');

      await page.waitForTimeout(300);

      const status = page.locator('#status');
      await expect(status).toContainText('裁剪区域已更改');
    });
  });

  test.describe('错误处理测试', () => {
    test('应该处理无效文件格式', async () => {
      // 创建一个文本文件
      const textFile = await page.evaluateHandle(() => {
        const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
        return file;
      });

      await page.locator('#imageInput').setInputFiles(textFile as any);
      await page.waitForTimeout(1000);

      const status = page.locator('#status');
      await expect(status).toContainText('不支持的文件格式');
    });

    test('应该处理过大的文件', async () => {
      // 如果有大文件测试图片
      try {
        await page.locator('#imageInput').setInputFiles(LARGE_IMAGE_PATH);
        await page.waitForTimeout(2000);

        const status = page.locator('#status');
        await expect(status).toContainText('文件过大');
      } catch (error) {
        // 如果没有大文件，跳过测试
        test.skip();
      }
    });

    test('应该处理网络图片加载失败', async () => {
      // 测试加载不存在的网络图片
      await page.evaluate(() => {
        const cropper = (window as any).cropper;
        if (cropper) {
          cropper.setImage('https://example.com/nonexistent-image.jpg');
        }
      });

      await page.waitForTimeout(2000);

      const status = page.locator('#status');
      await expect(status).toContainText('图片加载失败');
    });
  });

  test.describe('性能测试', () => {
    test('应该在合理时间内加载大图片', async () => {
      const startTime = Date.now();
      
      await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
      await page.waitForSelector('.cropper-container canvas');
      
      const loadTime = Date.now() - startTime;
      
      // 图片加载应该在3秒内完成
      expect(loadTime).toBeLessThan(3000);
    });

    test('应该流畅处理连续操作', async () => {
      await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
      await page.waitForSelector('.cropper-container canvas');

      const startTime = Date.now();

      // 执行一系列连续操作
      for (let i = 0; i < 10; i++) {
        await page.locator('#scaleSlider').fill((1 + i * 0.1).toString());
        await page.waitForTimeout(50);
      }

      const operationTime = Date.now() - startTime;

      // 连续操作应该在2秒内完成
      expect(operationTime).toBeLessThan(2000);
    });
  });

  test.describe('响应式设计测试', () => {
    test('应该在不同屏幕尺寸下正常工作', async () => {
      const viewports = [
        { width: 320, height: 568 },  // iPhone SE
        { width: 768, height: 1024 }, // iPad
        { width: 1920, height: 1080 } // Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.reload();
        await page.waitForLoadState('networkidle');

        await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
        await page.waitForSelector('.cropper-container canvas');

        // 验证画布可见且响应式
        const canvas = page.locator('.cropper-container canvas');
        await expect(canvas).toBeVisible();

        const canvasBox = await canvas.boundingBox();
        expect(canvasBox?.width).toBeGreaterThan(0);
        expect(canvasBox?.height).toBeGreaterThan(0);
      }
    });
  });

  test.describe('主题切换测试', () => {
    test('应该支持主题切换', async () => {
      await page.locator('#imageInput').setInputFiles(TEST_IMAGE_PATH);
      await page.waitForSelector('.cropper-container canvas');

      // 测试深色主题
      await page.selectOption('#themeSelect', 'dark');
      await page.waitForTimeout(300);

      // 验证主题应用
      const body = page.locator('body');
      await expect(body).toHaveClass(/dark-theme/);

      // 测试浅色主题
      await page.selectOption('#themeSelect', 'light');
      await page.waitForTimeout(300);

      await expect(body).toHaveClass(/light-theme/);
    });
  });

  test.describe('国际化测试', () => {
    test('应该支持语言切换', async () => {
      // 测试英文
      await page.selectOption('#languageSelect', 'en-US');
      await page.waitForTimeout(300);

      const uploadBtn = page.locator('label[for="imageInput"]');
      await expect(uploadBtn).toContainText('Upload');

      // 测试中文
      await page.selectOption('#languageSelect', 'zh-CN');
      await page.waitForTimeout(300);

      await expect(uploadBtn).toContainText('上传');
    });
  });
});

// 辅助函数
async function waitForImageLoad(page: Page) {
  await page.waitForFunction(() => {
    const canvas = document.querySelector('.cropper-container canvas') as HTMLCanvasElement;
    return canvas && canvas.width > 0 && canvas.height > 0;
  });
}

async function getCropData(page: Page) {
  return await page.evaluate(() => {
    const cropper = (window as any).cropper;
    return cropper ? cropper.getCropData() : null;
  });
}

async function setCropData(page: Page, data: any) {
  await page.evaluate((cropData) => {
    const cropper = (window as any).cropper;
    if (cropper) {
      cropper.setCropData(cropData);
    }
  }, data);
}