/**
 * 配置预设管理器
 * 
 * 提供各种场景下的预设配置，包括：
 * - 开发环境配置
 * - 生产环境配置
 * - 高性能配置
 * - 低延迟配置
 * - 移动端配置
 * - 调试配置
 * - 安全配置
 */

import type { WebSocketConfig } from '../types'

/**
 * 配置预设类型
 */
export type ConfigPresetType =
  | 'development'    // 开发环境
  | 'production'     // 生产环境
  | 'performance'    // 高性能
  | 'lowLatency'     // 低延迟
  | 'mobile'         // 移动端
  | 'debug'          // 调试
  | 'secure'         // 安全
  | 'minimal'        // 最小化
  | 'robust'         // 健壮性

/**
 * 配置预设接口
 */
export interface ConfigPreset {
  /** 预设名称 */
  name: string
  /** 预设描述 */
  description: string
  /** 预设配置 */
  config: Partial<WebSocketConfig>
  /** 适用场景 */
  scenarios: string[]
  /** 推荐使用条件 */
  recommendations?: string[]
}

/**
 * 配置预设管理器
 */
export class ConfigPresets {
  /**
   * 预设配置映射
   */
  private static readonly presets = new Map<ConfigPresetType, ConfigPreset>([
    ['development', {
      name: '开发环境',
      description: '适用于开发环境的配置，启用详细日志和调试功能',
      scenarios: ['本地开发', '测试环境', '调试'],
      recommendations: ['开发阶段使用', '需要详细日志时'],
      config: {
        logLevel: 'debug',
        debug: true,
        connectionTimeout: 5000,
        reconnect: {
          enabled: true,
          strategy: 'fixed',
          initialDelay: 1000,
          maxDelay: 5000,
          maxAttempts: 3,
          backoffMultiplier: 1,
          jitter: 0
        },
        heartbeat: {
          enabled: true,
          interval: 10000,
          timeout: 3000,
          message: 'dev-ping',
          messageType: 'text',
          maxFailures: 2
        },
        messageQueue: {
          enabled: true,
          maxSize: 100,
          persistent: false,
          storageKey: 'websocket_dev_queue',
          messageExpiry: 60000,
          deduplication: false
        }
      }
    }],

    ['production', {
      name: '生产环境',
      description: '适用于生产环境的稳定配置',
      scenarios: ['生产部署', '正式环境', '用户使用'],
      recommendations: ['生产环境使用', '需要稳定性时'],
      config: {
        logLevel: 'warn',
        debug: false,
        connectionTimeout: 15000,
        reconnect: {
          enabled: true,
          strategy: 'exponential',
          initialDelay: 2000,
          maxDelay: 60000,
          maxAttempts: 10,
          backoffMultiplier: 2,
          jitter: 1000
        },
        heartbeat: {
          enabled: true,
          interval: 45000,
          timeout: 10000,
          message: 'ping',
          messageType: 'text',
          maxFailures: 5
        },
        messageQueue: {
          enabled: true,
          maxSize: 2000,
          persistent: true,
          storageKey: 'websocket_prod_queue',
          messageExpiry: 600000,
          deduplication: true
        },
        compression: true
      }
    }],

    ['performance', {
      name: '高性能',
      description: '优化性能的配置，适用于高并发场景',
      scenarios: ['高并发', '大量数据传输', '性能要求高'],
      recommendations: ['需要高吞吐量时', '服务器性能充足时'],
      config: {
        logLevel: 'error',
        debug: false,
        connectionTimeout: 8000,
        reconnect: {
          enabled: true,
          strategy: 'exponential',
          initialDelay: 500,
          maxDelay: 10000,
          maxAttempts: 15,
          backoffMultiplier: 1.5,
          jitter: 200
        },
        heartbeat: {
          enabled: true,
          interval: 20000,
          timeout: 3000,
          message: 'p',
          messageType: 'text',
          maxFailures: 3
        },
        messageQueue: {
          enabled: true,
          maxSize: 5000,
          persistent: false,
          storageKey: 'websocket_perf_queue',
          messageExpiry: 120000,
          deduplication: false
        },
        compression: true,
        maxMessageSize: 5 * 1024 * 1024 // 5MB
      }
    }],

    ['lowLatency', {
      name: '低延迟',
      description: '优化延迟的配置，适用于实时性要求高的场景',
      scenarios: ['实时游戏', '实时交易', '即时通讯'],
      recommendations: ['需要极低延迟时', '网络条件良好时'],
      config: {
        logLevel: 'error',
        debug: false,
        connectionTimeout: 3000,
        reconnect: {
          enabled: true,
          strategy: 'fixed',
          initialDelay: 100,
          maxDelay: 1000,
          maxAttempts: 20,
          backoffMultiplier: 1,
          jitter: 0
        },
        heartbeat: {
          enabled: true,
          interval: 5000,
          timeout: 1000,
          message: '',
          messageType: 'text',
          maxFailures: 2
        },
        messageQueue: {
          enabled: false,
          maxSize: 50,
          persistent: false,
          storageKey: 'websocket_lowlat_queue',
          messageExpiry: 5000,
          deduplication: false
        },
        compression: false
      }
    }],

    ['mobile', {
      name: '移动端',
      description: '适用于移动设备的配置，考虑网络不稳定和电池消耗',
      scenarios: ['移动应用', '弱网环境', '电池优化'],
      recommendations: ['移动设备使用', '网络不稳定时'],
      config: {
        logLevel: 'warn',
        debug: false,
        connectionTimeout: 20000,
        reconnect: {
          enabled: true,
          strategy: 'exponential',
          initialDelay: 3000,
          maxDelay: 120000,
          maxAttempts: 8,
          backoffMultiplier: 2.5,
          jitter: 2000
        },
        heartbeat: {
          enabled: true,
          interval: 60000,
          timeout: 15000,
          message: 'ping',
          messageType: 'text',
          maxFailures: 3
        },
        messageQueue: {
          enabled: true,
          maxSize: 500,
          persistent: true,
          storageKey: 'websocket_mobile_queue',
          messageExpiry: 300000,
          deduplication: true
        },
        compression: true
      }
    }],

    ['debug', {
      name: '调试',
      description: '专门用于调试的配置，提供最详细的信息',
      scenarios: ['问题排查', '性能分析', '开发调试'],
      recommendations: ['排查问题时', '需要详细信息时'],
      config: {
        logLevel: 'debug',
        debug: true,
        connectionTimeout: 30000,
        reconnect: {
          enabled: true,
          strategy: 'fixed',
          initialDelay: 5000,
          maxDelay: 10000,
          maxAttempts: 3,
          backoffMultiplier: 1,
          jitter: 0
        },
        heartbeat: {
          enabled: true,
          interval: 15000,
          timeout: 5000,
          message: 'debug-ping',
          messageType: 'text',
          maxFailures: 1
        },
        messageQueue: {
          enabled: true,
          maxSize: 200,
          persistent: true,
          storageKey: 'websocket_debug_queue',
          messageExpiry: 600000,
          deduplication: false
        }
      }
    }],

    ['secure', {
      name: '安全',
      description: '注重安全性的配置，适用于敏感数据传输',
      scenarios: ['金融应用', '敏感数据', '安全要求高'],
      recommendations: ['处理敏感数据时', '安全要求高时'],
      config: {
        logLevel: 'warn',
        debug: false,
        connectionTimeout: 10000,
        reconnect: {
          enabled: true,
          strategy: 'exponential',
          initialDelay: 2000,
          maxDelay: 30000,
          maxAttempts: 5,
          backoffMultiplier: 2,
          jitter: 1000
        },
        heartbeat: {
          enabled: true,
          interval: 30000,
          timeout: 8000,
          message: 'ping',
          messageType: 'text',
          maxFailures: 3
        },
        messageQueue: {
          enabled: true,
          maxSize: 1000,
          persistent: false, // 安全考虑，不持久化
          storageKey: 'websocket_secure_queue',
          messageExpiry: 60000, // 较短的过期时间
          deduplication: true
        },
        compression: false, // 避免压缩攻击
        maxMessageSize: 512 * 1024 // 限制消息大小
      }
    }],

    ['minimal', {
      name: '最小化',
      description: '最小化配置，适用于资源受限的环境',
      scenarios: ['嵌入式设备', '资源受限', '简单应用'],
      recommendations: ['资源有限时', '功能要求简单时'],
      config: {
        logLevel: 'error',
        debug: false,
        connectionTimeout: 5000,
        reconnect: {
          enabled: false,
          strategy: 'fixed',
          initialDelay: 1000,
          maxDelay: 5000,
          maxAttempts: 1,
          backoffMultiplier: 1,
          jitter: 0
        },
        heartbeat: {
          enabled: false,
          interval: 60000,
          timeout: 5000,
          message: 'ping',
          messageType: 'text',
          maxFailures: 1
        },
        messageQueue: {
          enabled: false,
          maxSize: 10,
          persistent: false,
          storageKey: 'websocket_minimal_queue',
          messageExpiry: 10000,
          deduplication: false
        },
        compression: false,
        maxMessageSize: 64 * 1024 // 64KB
      }
    }],

    ['robust', {
      name: '健壮性',
      description: '最大化稳定性和容错性的配置',
      scenarios: ['关键业务', '高可用要求', '容错性要求高'],
      recommendations: ['关键业务使用', '需要高可用时'],
      config: {
        logLevel: 'info',
        debug: false,
        connectionTimeout: 30000,
        reconnect: {
          enabled: true,
          strategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 300000, // 5分钟
          maxAttempts: 50,
          backoffMultiplier: 1.8,
          jitter: 5000
        },
        heartbeat: {
          enabled: true,
          interval: 20000,
          timeout: 10000,
          message: 'ping',
          messageType: 'text',
          maxFailures: 5
        },
        messageQueue: {
          enabled: true,
          maxSize: 10000,
          persistent: true,
          storageKey: 'websocket_robust_queue',
          messageExpiry: 1800000, // 30分钟
          deduplication: true
        },
        compression: true
      }
    }]
  ])

  /**
   * 获取预设配置
   * 
   * @param type 预设类型
   * @returns 预设配置对象
   */
  static getPreset(type: ConfigPresetType): ConfigPreset | undefined {
    return this.presets.get(type)
  }

  /**
   * 获取预设配置的配置部分
   * 
   * @param type 预设类型
   * @returns 配置对象
   */
  static getPresetConfig(type: ConfigPresetType): Partial<WebSocketConfig> | undefined {
    const preset = this.presets.get(type)
    return preset?.config
  }

  /**
   * 获取所有可用的预设类型
   * 
   * @returns 预设类型数组
   */
  static getAvailablePresets(): ConfigPresetType[] {
    return Array.from(this.presets.keys())
  }

  /**
   * 获取所有预设信息
   * 
   * @returns 预设信息数组
   */
  static getAllPresets(): ConfigPreset[] {
    return Array.from(this.presets.values())
  }

  /**
   * 根据场景推荐预设
   * 
   * @param scenario 使用场景
   * @returns 推荐的预设类型数组
   */
  static recommendPresets(scenario: string): ConfigPresetType[] {
    const recommendations: ConfigPresetType[] = []

    for (const [type, preset] of this.presets) {
      if (preset.scenarios.some(s => s.includes(scenario) || scenario.includes(s))) {
        recommendations.push(type)
      }
    }

    return recommendations
  }

  /**
   * 合并多个预设配置
   * 
   * @param types 预设类型数组，后面的会覆盖前面的
   * @returns 合并后的配置
   */
  static mergePresets(...types: ConfigPresetType[]): Partial<WebSocketConfig> {
    let mergedConfig: Partial<WebSocketConfig> = {}

    for (const type of types) {
      const preset = this.presets.get(type)
      if (preset) {
        mergedConfig = { ...mergedConfig, ...preset.config }
      }
    }

    return mergedConfig
  }

  /**
   * 创建自定义预设
   *
   * @param name 预设名称
   * @param preset 预设配置
   */
  static createCustomPreset(name: string, preset: ConfigPreset): void {
    // 扩展预设类型以支持自定义预设
    this.presets.set(name as ConfigPresetType, preset)
  }

  /**
   * 删除自定义预设
   *
   * @param name 预设名称
   */
  static removeCustomPreset(name: string): boolean {
    return this.presets.delete(name as ConfigPresetType)
  }
}
