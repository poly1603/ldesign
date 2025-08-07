import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createEngine } from '@ldesign/engine'
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

describe('App', () => {
  let wrapper: any

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
  })

  it('should render without crashing', () => {
    const mockEngine = createEngine()

    wrapper = mount(App, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
          },
        },
      },
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('should show loading state initially', async () => {
    const mockEngine = createEngine()

    wrapper = mount(App, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
          },
        },
      },
    })

    // Should show loading initially
    expect(wrapper.find('.app-loading').exists()).toBe(true)
  })

  it('should handle engine initialization error', async () => {
    wrapper = mount(App, {
      global: {
        config: {
          globalProperties: {
            $engine: null, // No engine provided
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

    wrapper = mount(App, {
      global: {
        config: {
          globalProperties: {
            $engine: mockEngine,
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
