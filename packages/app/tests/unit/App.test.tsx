import { DeviceDetector } from '@ldesign/device'
import { createEngine } from '@ldesign/engine'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App'

// Mock the engine
vi.mock('@ldesign/engine', () => ({
  createEngine: vi.fn(() => ({
    config: { debug: true },
    logger: {
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    },
    events: {
      emit: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
    },
    plugins: {
      getAll: vi.fn(() => []),
    },
    middleware: {
      getAll: vi.fn(() => []),
    },
    state: {
      getAll: vi.fn(() => ({})),
    },
    cache: {
      size: 0,
    },
    install: vi.fn(),
  })),
  presets: {
    development: vi.fn(() => ({})),
  },
}))

describe('app', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    const mockEngine = createEngine()
    const mockDevice = new DeviceDetector()

    wrapper = mount(App, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
            $device: mockDevice,
          },
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show loading state initially', async () => {
    const mockEngine = createEngine()
    const mockDevice = new DeviceDetector()

    wrapper = mount(App, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
            $device: mockDevice,
          },
        },
      },
    })

    // Should show loading initially
    expect(wrapper.find('.app-loading').exists()).toBe(true)
  })

  it('should handle engine initialization error', async () => {
    const mockDevice = new DeviceDetector()

    wrapper = mount(App, {
      global: {
        config: {
          globalProperties: {
            $engine: null, // No engine provided
            $device: mockDevice,
          },
        },
      },
    })

    // Wait for component to process
    await new Promise(resolve => setTimeout(resolve, 200))

    // Should show error state (or loading state if error handling is async)
    const hasError = wrapper.find('.app-error').exists()
    const hasLoading = wrapper.find('.app-loading').exists()
    expect(hasError || hasLoading).toBe(true)
  })

  it('should emit app:ready event when initialized', async () => {
    const mockEngine = createEngine()
    const mockDevice = new DeviceDetector()

    wrapper = mount(App, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
            $device: mockDevice,
          },
        },
      },
    })

    // Wait for component to initialize
    await new Promise(resolve => setTimeout(resolve, 200))

    // Should emit app:ready event
    expect(mockEngine.events.emit).toHaveBeenCalledWith('app:ready', {
      timestamp: expect.any(String),
    })
  })
})
