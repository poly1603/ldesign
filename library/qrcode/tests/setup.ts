import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
 cleanup();
});

// Add custom matchers if needed
expect.extend({
 toBeValidQRCode(received: any) {
  const pass = received && (received instanceof HTMLCanvasElement || received instanceof SVGSVGElement);
  return {
   pass,
   message: () => `expected ${received} to be a valid QR code element`,
  };
 },
});
