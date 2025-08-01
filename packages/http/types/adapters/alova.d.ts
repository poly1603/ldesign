import { RequestConfig, ResponseData } from '@/types';
import { BaseAdapter } from './base.js';

/**
 * Alova 适配器
 */
declare class AlovaAdapter extends BaseAdapter {
    name: string;
    private alova;
    private alovaInstance;
    constructor(alovaInstance?: any);
    /**
     * 检查是否支持 alova
     */
    isSupported(): boolean;
    /**
     * 发送请求
     */
    request<T = any>(config: RequestConfig): Promise<ResponseData<T>>;
    /**
     * 创建默认的 alova 实例
     */
    private createDefaultAlovaInstance;
    /**
     * 创建 alova 方法
     */
    private createAlovaMethod;
    /**
     * 转换 alova 响应为标准格式
     */
    private convertFromAlovaResponse;
    /**
     * 处理 alova 错误
     */
    private handleAlovaError;
}

export { AlovaAdapter };
