/**
 * REST API 连接器
 */

import type { RestConfig } from '../../types';

/**
 * REST 连接器类
 */
export class RestConnector {
  /**
   * 执行请求
   */
  async fetch(config: RestConfig): Promise<any> {
    const { url, method, headers, params, body, timeout = 30000 } = config;

    // 构建完整URL
    let fullUrl = url;
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params as any).toString();
      fullUrl += (url.includes('?') ? '&' : '?') + queryString;
    }

    // 构建请求选项
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    // 添加请求体
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(body);
    }

    // 创建超时Promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('请求超时')), timeout);
    });

    // 执行请求
    const fetchPromise = fetch(fullUrl, options).then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // 解析响应
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return response.json();
      } else {
        return response.text();
      }
    });

    // 返回带超时的请求
    return Promise.race([fetchPromise, timeoutPromise]);
  }
}



