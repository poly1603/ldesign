/**
 * 播放器模拟对象
 */

import { vi } from 'vitest';
import type { IPlayer } from '../../src/types';

/**
 * 创建模拟播放器
 */
export function createMockPlayer(): IPlayer {
  const mockElement = {
    paused: true,
    currentTime: 0,
    duration: 0,
    volume: 1,
    muted: false,
    playbackRate: 1,
    readyState: 0,
    videoWidth: 0,
    videoHeight: 0,
    buffered: {
      length: 0,
      start: vi.fn(),
      end: vi.fn()
    },
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    requestFullscreen: vi.fn().mockResolvedValue(undefined),
    requestPictureInPicture: vi.fn().mockResolvedValue(undefined)
  };

  const mockContainer = document.createElement('div');

  const eventListeners = new Map<string, Set<Function>>();

  const mockPlayer: IPlayer = {
    element: mockElement as any,
    container: mockContainer,
    
    // 播放控制
    play: vi.fn().mockImplementation(() => {
      mockElement.paused = false;
      mockPlayer.emit('media:play', { currentTime: mockElement.currentTime });
      return Promise.resolve();
    }),
    
    pause: vi.fn().mockImplementation(() => {
      mockElement.paused = true;
      mockPlayer.emit('media:pause', { currentTime: mockElement.currentTime });
    }),
    
    seek: vi.fn().mockImplementation((time: number) => {
      mockElement.currentTime = time;
      mockPlayer.emit('media:timeupdate', { 
        currentTime: time, 
        duration: mockElement.duration 
      });
    }),
    
    // 属性访问器
    get currentTime() {
      return mockElement.currentTime;
    },
    
    set currentTime(value: number) {
      mockElement.currentTime = value;
      mockPlayer.emit('media:timeupdate', { 
        currentTime: value, 
        duration: mockElement.duration 
      });
    },
    
    get duration() {
      return mockElement.duration;
    },
    
    get volume() {
      return mockElement.volume;
    },
    
    set volume(value: number) {
      mockElement.volume = Math.max(0, Math.min(1, value));
      mockPlayer.emit('media:volumechange', { volume: mockElement.volume });
    },
    
    get muted() {
      return mockElement.muted;
    },
    
    set muted(value: boolean) {
      mockElement.muted = value;
      mockPlayer.emit('media:volumechange', { 
        volume: mockElement.volume, 
        muted: value 
      });
    },
    
    get playbackRate() {
      return mockElement.playbackRate;
    },
    
    set playbackRate(value: number) {
      mockElement.playbackRate = value;
      mockPlayer.emit('media:ratechange', { playbackRate: value });
    },
    
    get paused() {
      return mockElement.paused;
    },
    
    get ended() {
      return false;
    },
    
    get buffered() {
      return mockElement.buffered;
    },
    
    get readyState() {
      return mockElement.readyState;
    },
    
    get videoWidth() {
      return mockElement.videoWidth;
    },
    
    get videoHeight() {
      return mockElement.videoHeight;
    },
    
    // 事件系统
    on: vi.fn().mockImplementation((event: string, listener: Function) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      eventListeners.get(event)!.add(listener);
    }),
    
    off: vi.fn().mockImplementation((event: string, listener: Function) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.delete(listener);
      }
    }),
    
    once: vi.fn().mockImplementation((event: string, listener: Function) => {
      const onceListener = (...args: any[]) => {
        listener(...args);
        mockPlayer.off(event, onceListener);
      };
      mockPlayer.on(event, onceListener);
    }),
    
    emit: vi.fn().mockImplementation((event: string, data?: any) => {
      const listeners = eventListeners.get(event);
      if (listeners) {
        listeners.forEach(listener => {
          try {
            listener(data);
          } catch (error) {
            console.error('Error in event listener:', error);
          }
        });
      }
    }),
    
    // 插件系统
    use: vi.fn(),
    getPlugin: vi.fn(),
    
    // 生命周期
    destroy: vi.fn().mockImplementation(() => {
      eventListeners.clear();
      return Promise.resolve();
    }),
    
    // 状态
    isDestroyed: false,
    
    // 配置
    config: {},
    
    // 主题
    theme: {
      name: 'default',
      colors: {},
      sizes: {}
    }
  };

  // 设置一些默认值
  mockElement.duration = 100;
  mockElement.videoWidth = 1920;
  mockElement.videoHeight = 1080;
  mockElement.readyState = 4;

  return mockPlayer;
}

/**
 * 创建模拟视频元素
 */
export function createMockVideoElement() {
  const element = document.createElement('video');
  
  // 添加模拟方法
  Object.defineProperty(element, 'play', {
    value: vi.fn().mockResolvedValue(undefined)
  });
  
  Object.defineProperty(element, 'pause', {
    value: vi.fn()
  });
  
  Object.defineProperty(element, 'load', {
    value: vi.fn()
  });
  
  Object.defineProperty(element, 'requestFullscreen', {
    value: vi.fn().mockResolvedValue(undefined)
  });
  
  Object.defineProperty(element, 'requestPictureInPicture', {
    value: vi.fn().mockResolvedValue(undefined)
  });
  
  // 设置默认属性
  Object.defineProperty(element, 'duration', {
    value: 100,
    writable: true
  });
  
  Object.defineProperty(element, 'currentTime', {
    value: 0,
    writable: true
  });
  
  Object.defineProperty(element, 'volume', {
    value: 1,
    writable: true
  });
  
  Object.defineProperty(element, 'playbackRate', {
    value: 1,
    writable: true
  });
  
  Object.defineProperty(element, 'paused', {
    value: true,
    writable: true
  });
  
  Object.defineProperty(element, 'muted', {
    value: false,
    writable: true
  });
  
  Object.defineProperty(element, 'readyState', {
    value: 4,
    writable: true
  });
  
  Object.defineProperty(element, 'videoWidth', {
    value: 1920,
    writable: true
  });
  
  Object.defineProperty(element, 'videoHeight', {
    value: 1080,
    writable: true
  });
  
  Object.defineProperty(element, 'buffered', {
    value: {
      length: 1,
      start: vi.fn().mockReturnValue(0),
      end: vi.fn().mockReturnValue(100)
    }
  });
  
  return element;
}

/**
 * 创建模拟容器元素
 */
export function createMockContainer() {
  const container = document.createElement('div');
  container.style.width = '800px';
  container.style.height = '450px';
  
  // 添加模拟方法
  Object.defineProperty(container, 'requestFullscreen', {
    value: vi.fn().mockResolvedValue(undefined)
  });
  
  return container;
}
