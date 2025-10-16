
import { test } from '@playwright/test';
import { expect } from '@playwright/test';

test('Test_2025-10-16', async ({ page, context }) => {
  
    // Click element
    await page.click('button:has-text('B')');
});