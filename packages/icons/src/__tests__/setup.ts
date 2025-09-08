import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// 全局测试设置
beforeAll(() => {
  // 设置测试环境
  process.env.NODE_ENV = 'test';
  
  // 模拟 console 方法以避免测试输出污染
  global.console = {
    ...console,
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {}
  };
});

afterAll(() => {
  // 清理测试环境
});

beforeEach(() => {
  // 每个测试前的设置
});

afterEach(() => {
  // 每个测试后的清理
});

// 扩展 expect 匹配器
expect.extend({
  toBeValidSvg(received: string) {
    const pass = /<svg[\s\S]*<\/svg>/.test(received);
    return {
      pass,
      message: () => pass 
        ? `Expected ${received} not to be a valid SVG`
        : `Expected ${received} to be a valid SVG`
    };
  },
  
  toContainSvgElement(received: string, element: string) {
    const pass = new RegExp(`<${element}[^>]*>`).test(received);
    return {
      pass,
      message: () => pass
        ? `Expected ${received} not to contain SVG element ${element}`
        : `Expected ${received} to contain SVG element ${element}`
    };
  }
});

// 类型声明
declare global {
  namespace Vi {
    interface AsymmetricMatchersContaining {
      toBeValidSvg(): any;
      toContainSvgElement(element: string): any;
    }
  }
}
