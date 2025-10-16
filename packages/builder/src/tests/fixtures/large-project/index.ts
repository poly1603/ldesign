// 模拟一个较大的项目文件
export interface Config {
  apiUrl: string
  timeout: number
  retries: number
}

export class ApiClient {
  private config: Config

  constructor(config: Config) {
    this.config = config
  }

  async get(endpoint: string): Promise<any> {
    const url = `${this.config?.apiUrl}${endpoint}`
    let retries = this.config?.retries
    
    while (retries > 0) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          return await response.json()
        }
        
        throw new Error(`HTTP ${response.status}`)
      } catch (error) {
        retries--
        if (retries === 0) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  async post(endpoint: string, data: any): Promise<any> {
    const url = `${this.config?.apiUrl}${endpoint}`
    let retries = this.config?.retries
    
    while (retries > 0) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        
        if (response.ok) {
          return await response.json()
        }
        
        throw new Error(`HTTP ${response.status}`)
      } catch (error) {
        retries--
        if (retries === 0) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
}

export function createApiClient(config: Config): ApiClient {
  return new ApiClient(config)
}

export const defaultConfig: Config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
}

// 添加更多代码以增加文件大小
export class DataProcessor {
  private data: any[] = []

  addData(item: any): void {
    this.data.push(item)
  }

  processData(): any[] {
    return this.data.map(item => ({
      ...item,
      processed: true,
      timestamp: Date.now()
    }))
  }

  filterData(predicate: (item: any) => boolean): any[] {
    return this.data.filter(predicate)
  }

  sortData(compareFn?: (a: any, b: any) => number): any[] {
    return [...this.data].sort(compareFn)
  }
}

export class EventEmitter {
  private events: Map<string, Function[]> = new Map()

  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(listener)
  }

  off(event: string, listener: Function): void {
    const listeners = this.events.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const listeners = this.events.get(event)
    if (listeners) {
      listeners.forEach(listener => listener(...args))
    }
  }
}

export default {
  ApiClient,
  DataProcessor,
  EventEmitter,
  createApiClient,
  defaultConfig
}
