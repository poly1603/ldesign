/**
 * 测试环境设置
 */

// 模拟浏览器 API
global.navigator = {
  ...global.navigator,
  geolocation: {
    getCurrentPosition: vi.fn((success) => {
      success({
        coords: {
          latitude: 30.4596106,
          longitude: 114.4200347,
          accuracy: 41.928,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      })
    }),
    watchPosition: vi.fn(() => 1),
    clearWatch: vi.fn(),
  },
  getBattery: vi.fn(() =>
    Promise.resolve({
      level: 0.8,
      charging: true,
      chargingTime: null,
      dischargingTime: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  ),
  connection: {
    effectiveType: '4g',
    downlink: 1.55,
    rtt: 300,
    saveData: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  onLine: true,
}

// 模拟 window 对象
global.window = {
  ...global.window,
  innerWidth: 1024,
  innerHeight: 768,
  screen: {
    width: 1920,
    height: 1080,
    orientation: {
      type: 'landscape-primary',
      angle: 0,
    },
  },
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}

// 模拟 matchMedia
global.matchMedia = vi.fn(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))
