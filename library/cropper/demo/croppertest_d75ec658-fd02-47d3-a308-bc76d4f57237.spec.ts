
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('CropperTest_2025-10-14', async ({ page, context }) => {
  
    // Fill input field
    await page.fill('input[type='text']', 'test');

    // Fill input field
    await page.fill('input', 'test input');

    // Select option
    await page.selectOption('select', '1');

    // Hover over element
    await page.hover('body');
});