// Minimal runtime stub for @ldesign/http used in tests
export interface HttpClientConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string | (() => string)>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any
}

export interface RequestConfig {
  method?: string
  url?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  headers?: Record<string, any>
}

export interface ResponseData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
  status: number
  statusText: string
  headers: Record<string, unknown>
  config: RequestConfig
}

export interface HttpClient {
  request: (config: RequestConfig) => Promise<ResponseData>
}

export function createHttpClient(_config: HttpClientConfig = {}): HttpClient {
  return {
    async request(config: RequestConfig): Promise<ResponseData> {
      return {
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    },
  }
}

