import { ApiEngineConfig } from './types/index.js';
export { ApiMethod, ApiPlugin, CacheConfig, CaptchaInfo, DebounceConfig, DeduplicationConfig, LoginParams, LoginResponse, MenuItem, SessionInfo, SystemApiResponse, UserInfo } from './types/index.js';
export { ApiEngineImpl as ApiEngine, createApiEngine } from './core/api-engine.js';
export { CacheManager } from './core/cache-manager.js';
export { DebounceManager } from './core/debounce-manager.js';
export { DeduplicationManager } from './core/deduplication-manager.js';
export { PluginManager } from './core/plugin-manager.js';
export { SYSTEM_API_METHODS, SystemApiConfig, SystemApiEndpoints, SystemApiMethodName, createSystemApiPlugin, systemApiPlugin } from './plugins/system-apis.js';
export { debounce, deepMerge, formatError, generateId, get, isEmpty, isObject, isValidInput, retry, safeJsonParse, safeJsonStringify, set, sleep, throttle } from './utils/index.js';
export { HttpClientConfig, RequestConfig, ResponseData } from './node_modules/@ldesign/http/types/types/index.d.js';

declare function createApi(config?: ApiEngineConfig): any;
declare const _default: {
    createApi: typeof createApi;
};

export { ApiEngineConfig, createApi, _default as default };
