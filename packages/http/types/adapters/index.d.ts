import { HttpAdapter } from '@/types';
export { AlovaAdapter } from './alova.js';
export { AxiosAdapter } from './axios.js';
export { BaseAdapter } from './base.js';
export { FetchAdapter } from './fetch.js';

/**
 * 适配器工厂
 */
declare class AdapterFactory {
    private static adapters;
    /**
     * 注册适配器
     */
    static register(name: string, factory: () => HttpAdapter): void;
    /**
     * 创建适配器
     */
    static create(name: string): HttpAdapter;
    /**
     * 获取可用的适配器
     */
    static getAvailable(): string[];
    /**
     * 获取默认适配器
     */
    static getDefault(): HttpAdapter;
    /**
     * 获取所有注册的适配器名称
     */
    static getRegistered(): string[];
}
/**
 * 创建 HTTP 适配器
 */
declare function createAdapter(adapter?: string | HttpAdapter): HttpAdapter;
/**
 * 检查适配器是否可用
 */
declare function isAdapterAvailable(name: string): boolean;

export { AdapterFactory, createAdapter, isAdapterAvailable };
