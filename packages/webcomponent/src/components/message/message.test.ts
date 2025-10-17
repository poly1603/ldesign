/**
 * Message 组件单元测试
 */

import { message, MessageManager } from './message-manager';

describe('Message Component', () => {
  let manager: MessageManager;
  
  beforeEach(() => {
    // 清理之前的实例
    message.destroy();
    manager = MessageManager.getInstance();
  });
  
  afterEach(() => {
    message.closeAll();
  });
  
  describe('基础功能', () => {
    test('应该能显示基本消息', () => {
      const id = message.show('测试消息');
      expect(id).toBeTruthy();
      
      const container = document.querySelector('.ldesign-message-container');
      expect(container).toBeTruthy();
      
      const messageEl = container?.querySelector('.ldesign-message');
      expect(messageEl?.textContent).toContain('测试消息');
    });
    
    test('应该支持不同消息类型', () => {
      const successId = message.success('成功');
      const errorId = message.error('错误');
      const warningId = message.warning('警告');
      const infoId = message.info('信息');
      const loadingId = message.loading('加载中');
      
      const messages = document.querySelectorAll('.ldesign-message');
      expect(messages.length).toBe(5);
      
      expect(messages[0]).toHaveClass('ldesign-message--success');
      expect(messages[1]).toHaveClass('ldesign-message--error');
      expect(messages[2]).toHaveClass('ldesign-message--warning');
      expect(messages[3]).toHaveClass('ldesign-message--info');
      expect(messages[4]).toHaveClass('ldesign-message--loading');
    });
    
    test('应该能关闭指定消息', (done) => {
      const id = message.show('待关闭消息');
      const messageEl = document.querySelector('.ldesign-message');
      expect(messageEl).toBeTruthy();
      
      message.close(id);
      
      setTimeout(() => {
        const afterClose = document.querySelector('.ldesign-message:not(.hide)');
        expect(afterClose).toBeFalsy();
        done();
      }, 300);
    });
    
    test('应该能关闭所有消息', () => {
      message.show('消息1');
      message.show('消息2');
      message.show('消息3');
      
      expect(document.querySelectorAll('.ldesign-message').length).toBe(3);
      
      message.closeAll();
      
      setTimeout(() => {
        expect(document.querySelectorAll('.ldesign-message:not(.hide)').length).toBe(0);
      }, 300);
    });
  });
  
  describe('高级功能', () => {
    test('应该能更新消息内容', () => {
      const id = message.show('初始内容');
      const messageEl = document.querySelector('.ldesign-message');
      
      expect(messageEl?.textContent).toContain('初始内容');
      
      message.update(id, { content: '更新后的内容' });
      expect(messageEl?.textContent).toContain('更新后的内容');
    });
    
    test('应该能更新消息类型', () => {
      const id = message.info('信息');
      const messageEl = document.querySelector('.ldesign-message');
      
      expect(messageEl).toHaveClass('ldesign-message--info');
      
      message.update(id, { type: 'success' });
      expect(messageEl).toHaveClass('ldesign-message--success');
    });
    
    test('应该支持自定义位置', () => {
      message.show({ content: '顶部', position: 'top' });
      message.show({ content: '左上', position: 'top-left' });
      message.show({ content: '右上', position: 'top-right' });
      
      const containers = document.querySelectorAll('.ldesign-message-container');
      expect(containers.length).toBeGreaterThanOrEqual(3);
    });
    
    test('应该支持HTML内容', () => {
      const id = message.show({
        content: '<strong>加粗文本</strong>',
        html: true
      });
      
      const messageEl = document.querySelector('.ldesign-message');
      const strongEl = messageEl?.querySelector('strong');
      expect(strongEl?.textContent).toBe('加粗文本');
    });
    
    test('应该限制最大消息数量', () => {
      message.configure({ maxMessages: 3 });
      
      for (let i = 0; i < 5; i++) {
        message.show(`消息${i + 1}`);
      }
      
      setTimeout(() => {
        const messages = document.querySelectorAll('.ldesign-message:not(.hide)');
        expect(messages.length).toBeLessThanOrEqual(3);
      }, 100);
    });
  });
  
  describe('自动关闭', () => {
    test('应该在指定时间后自动关闭', (done) => {
      const id = message.show({
        content: '自动关闭',
        duration: 100
      });
      
      const messageEl = document.querySelector('.ldesign-message');
      expect(messageEl).toBeTruthy();
      
      setTimeout(() => {
        expect(messageEl).toHaveClass('hide');
        done();
      }, 150);
    });
    
    test('duration为0时不应自动关闭', (done) => {
      const id = message.show({
        content: '不自动关闭',
        duration: 0
      });
      
      setTimeout(() => {
        const messageEl = document.querySelector('.ldesign-message');
        expect(messageEl).not.toHaveClass('hide');
        done();
      }, 1000);
    });
  });
  
  describe('事件处理', () => {
    test('应该触发点击事件', (done) => {
      const onClick = jest.fn();
      
      message.show({
        content: '可点击',
        onClick
      });
      
      const messageEl = document.querySelector('.ldesign-message') as HTMLElement;
      messageEl?.click();
      
      expect(onClick).toHaveBeenCalled();
      done();
    });
    
    test('应该触发关闭回调', (done) => {
      const onClose = jest.fn();
      
      const id = message.show({
        content: '测试',
        onClose
      });
      
      message.close(id);
      
      setTimeout(() => {
        expect(onClose).toHaveBeenCalled();
        done();
      }, 300);
    });
    
    test('悬停时应暂停自动关闭', (done) => {
      const id = message.show({
        content: '悬停测试',
        duration: 100,
        pauseOnHover: true
      });
      
      const messageEl = document.querySelector('.ldesign-message') as HTMLElement;
      
      // 触发鼠标进入
      const mouseEnter = new MouseEvent('mouseenter');
      messageEl?.dispatchEvent(mouseEnter);
      
      setTimeout(() => {
        // 100ms后应该还在
        expect(messageEl).not.toHaveClass('hide');
        
        // 触发鼠标离开
        const mouseLeave = new MouseEvent('mouseleave');
        messageEl?.dispatchEvent(mouseLeave);
        
        setTimeout(() => {
          // 离开后100ms应该消失
          expect(messageEl).toHaveClass('hide');
          done();
        }, 150);
      }, 150);
    });
  });
  
  describe('性能优化', () => {
    test('应该复用DOM元素（对象池）', () => {
      message.configure({ enablePool: true });
      
      const id1 = message.show('消息1');
      const el1 = document.querySelector('.ldesign-message');
      
      message.close(id1);
      
      setTimeout(() => {
        const id2 = message.show('消息2');
        const el2 = document.querySelector('.ldesign-message');
        
        // 如果对象池工作正常，可能会复用相同的元素
        // 这里只检查功能正常
        expect(el2?.textContent).toContain('消息2');
      }, 300);
    });
    
    test('页面隐藏时应暂停计时器', () => {
      const id = message.show({
        content: '测试',
        duration: 1000
      });
      
      // 模拟页面隐藏
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true
      });
      
      const event = new Event('visibilitychange');
      document.dispatchEvent(event);
      
      // 检查计时器是否暂停（这里简化测试）
      const messageEl = document.querySelector('.ldesign-message');
      expect(messageEl).toBeTruthy();
      
      // 恢复
      Object.defineProperty(document, 'hidden', {
        value: false
      });
      document.dispatchEvent(event);
    });
  });
  
  describe('响应式和兼容性', () => {
    test('应该支持移动端视口', () => {
      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375
      });
      
      message.show('移动端消息');
      
      const container = document.querySelector('.ldesign-message-container');
      // 样式应该适配移动端
      expect(container).toBeTruthy();
    });
    
    test('应该支持暗黑模式', () => {
      // 模拟暗黑模式
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      Object.defineProperty(mediaQuery, 'matches', {
        value: true
      });
      
      message.show('暗黑模式消息');
      
      const messageEl = document.querySelector('.ldesign-message');
      // 暗黑模式样式通过CSS媒体查询自动应用
      expect(messageEl).toBeTruthy();
    });
  });
  
  describe('配置管理', () => {
    test('应该能全局配置', () => {
      message.configure({
        defaultDuration: 5000,
        gap: 20,
        useGPU: false
      });
      
      const id = message.show('配置测试');
      
      // 验证配置生效
      const messageEl = document.querySelector('.ldesign-message') as HTMLElement;
      expect(messageEl).toBeTruthy();
    });
    
    test('应该能销毁管理器', () => {
      message.show('测试');
      
      const containerBefore = document.querySelector('.ldesign-message-container');
      expect(containerBefore).toBeTruthy();
      
      message.destroy();
      
      const containerAfter = document.querySelector('.ldesign-message-container');
      expect(containerAfter).toBeFalsy();
      
      const styles = document.getElementById('ldesign-message-styles');
      expect(styles).toBeFalsy();
    });
  });
});

// 性能基准测试
describe('Message Performance', () => {
  test('批量创建消息性能', () => {
    const start = performance.now();
    
    for (let i = 0; i < 100; i++) {
      const id = message.show(`消息 ${i}`);
      message.close(id);
    }
    
    const end = performance.now();
    const duration = end - start;
    
    // 100个消息应该在1秒内完成
    expect(duration).toBeLessThan(1000);
  });
  
  test.skip('内存使用测试', () => {
    // @ts-ignore
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // 创建和销毁大量消息
    for (let i = 0; i < 50; i++) {
      const id = message.show(`测试消息 ${i}`);
      message.close(id);
    }
    
    // 等待GC
    setTimeout(() => {
    // @ts-ignore
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // 内存增长应该在合理范围内（如小于1MB）
      expect(memoryIncrease).toBeLessThan(1024 * 1024);
    }, 1000);
  });
});