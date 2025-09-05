/**
 * 默认配置
 */

import type { ConfigOptions } from './types'

/**
 * 默认配置对象
 */
const defaultConfig: ConfigOptions = {
  apiUrl: 'https://api.example.com',
  timeout: 10000,
  retries: 3,
  debug: false
}

export default defaultConfig
