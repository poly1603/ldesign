import { HttpAdapter, RequestConfig, ResponseData, HttpError } from '@/types';

/**
 * 适配器基类
 */
declare abstract class BaseAdapter implements HttpAdapter {
    abstract name: string;
    /**
     * 发送请求的抽象方法
     */
    abstract request<T = any>(config: RequestConfig): Promise<ResponseData<T>>;
    /**
     * 检查是否支持当前环境
     */
    abstract isSupported(): boolean;
    /**
     * 处理请求配置
     */
    protected processConfig(config: RequestConfig): RequestConfig;
    /**
     * 处理响应数据
     */
    protected processResponse<T>(data: T, status: number, statusText: string, headers: Record<string, string>, config: RequestConfig, raw?: any): ResponseData<T>;
    /**
     * 处理错误
     */
    protected processError(error: any, config: RequestConfig, response?: ResponseData): HttpError;
    /**
     * 创建超时控制器
     */
    protected createTimeoutController(timeout?: number): {
        signal: AbortSignal;
        cleanup: () => void;
    };
    /**
     * 合并 AbortSignal
     */
    protected mergeAbortSignals(signals: (AbortSignal | undefined)[]): AbortSignal;
    /**
     * 解析响应头
     */
    protected parseHeaders(headers: Headers | Record<string, string>): Record<string, string>;
}

export { BaseAdapter };
