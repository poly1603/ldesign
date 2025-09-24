/* Ambient module stubs for external workspace packages used by @ldesign/api
 * These allow local type-checking without requiring built artifacts from sibling packages.
 */

declare module '@ldesign/http' {
  export interface HttpClientConfig { [key: string]: any }
  export interface HttpClient { [key: string]: any }
  export interface RequestConfig { [key: string]: any }
  export interface ResponseData { [key: string]: any }
  export function createHttpClient(...args: any[]): HttpClient
}

declare module '@ldesign/engine' {
  export interface Engine {
    events: { once: (event: string, handler: (...args: any[]) => any) => void }
    [key: string]: any
  }
  export interface EnginePlugin {
    name?: string
    version?: string
    dependencies?: string[]
    install?: (engine: Engine) => void | Promise<void>
    uninstall?: (engine: Engine) => void | Promise<void>
  }
  export type Plugin = EnginePlugin
}
