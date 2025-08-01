import { RequestConfig, ResponseData } from '@/types';
import { BaseAdapter } from './base.js';

/**
 * Fetch 适配器
 */
declare class FetchAdapter extends BaseAdapter {
    name: string;
    /**
     * 检查是否支持 fetch API
     */
    isSupported(): boolean;
    /**
     * 发送请求
     */
    request<T = any>(config: RequestConfig): Promise<ResponseData<T>>;
    /**
     * 构建请求头
     */
    private buildHeaders;
    /**
     * 构建请求体
     */
    private buildBody;
    /**
     * 处理响应
     */
    private handleResponse;
    /**
     * 解析响应数据
     */
    private parseResponseData;
}

export { FetchAdapter };
