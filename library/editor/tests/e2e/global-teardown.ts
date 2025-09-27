import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');
  
  // Perform any global cleanup tasks here
  // For example: clean up test data, close connections, etc.
  
  console.log('✅ Global teardown completed!');
}

export default globalTeardown;
