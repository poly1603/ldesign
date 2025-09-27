import { beforeAll, afterEach, vi } from 'vitest';

// Mock DOM APIs that might not be available in jsdom
beforeAll(() => {
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));

  // Mock MutationObserver
  global.MutationObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(),
  }));

  // Mock getComputedStyle
  global.getComputedStyle = vi.fn().mockImplementation(() => ({
    getPropertyValue: vi.fn(),
  }));

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn().mockImplementation((cb) => {
    return setTimeout(cb, 16);
  });

  global.cancelAnimationFrame = vi.fn().mockImplementation((id) => {
    clearTimeout(id);
  });

  // Mock clipboard API
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
  });

  // Mock document.execCommand
  document.execCommand = vi.fn().mockReturnValue(true);

  // Mock Selection API
  global.getSelection = vi.fn().mockImplementation(() => ({
    rangeCount: 0,
    getRangeAt: vi.fn(),
    removeAllRanges: vi.fn(),
    addRange: vi.fn(),
    toString: vi.fn().mockReturnValue(''),
  }));

  // Mock Range API
  global.Range = vi.fn().mockImplementation(() => ({
    setStart: vi.fn(),
    setEnd: vi.fn(),
    collapse: vi.fn(),
    selectNodeContents: vi.fn(),
    deleteContents: vi.fn(),
    insertNode: vi.fn(),
    cloneContents: vi.fn(),
    getBoundingClientRect: vi.fn().mockReturnValue({
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
      width: 0,
      height: 0,
    }),
  }));
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});
