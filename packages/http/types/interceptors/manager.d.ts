import { InterceptorManager, ErrorInterceptor } from '../types/index.js';

/**
 * 拦截器项
 */
interface InterceptorItem<T> {
    fulfilled: T;
    rejected?: ErrorInterceptor;
}
/**
 * 拦截器管理器实现
 */
declare class InterceptorManagerImpl<T> implements InterceptorManager<T> {
    private interceptors;
    /**
     * 添加拦截器
     * @param fulfilled 成功处理函数
     * @param rejected 错误处理函数
     * @returns 拦截器 ID
     */
    use(fulfilled: T, rejected?: ErrorInterceptor): number;
    /**
     * 移除拦截器
     * @param id 拦截器 ID
     */
    eject(id: number): void;
    /**
     * 清空所有拦截器
     */
    clear(): void;
    /**
     * 遍历拦截器
     * @param fn 遍历函数
     */
    forEach(fn: (interceptor: InterceptorItem<T>) => void): void;
    /**
     * 获取所有有效的拦截器
     */
    getInterceptors(): Array<InterceptorItem<T>>;
}

export { InterceptorManagerImpl };
