import { RequestConfig, ResponseData } from '@/types';
import { BaseAdapter } from './base.js';

/**
 * Axios 适配器
 */
declare class AxiosAdapter extends BaseAdapter {
    name: string;
    private axios;
    constructor();
    /**
     * 检查是否支持 axios
     */
    isSupported(): boolean;
    /**
     * 发送请求
     */
    request<T = any>(config: RequestConfig): Promise<ResponseData<T>>;
    /**
     * 转换配置为 axios 格式
     */
    private convertToAxiosConfig;
    /**
     * 转换 axios 响应为标准格式
     */
    private convertFromAxiosResponse;
    /**
     * 处理 axios 错误
     */
    private handleAxiosError;
}

export { AxiosAdapter };
