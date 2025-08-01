import { Plugin, App } from 'vue';
import { HttpPluginOptions } from '@/types/vue';
import { HttpClient, RequestConfig } from '@/types';

/**
 * Vue 3 HTTP 插件
 */
declare const HttpPlugin: Plugin;
/**
 * 安装插件的便利函数
 */
declare function install(app: App, options?: HttpPluginOptions): void;
/**
 * HTTP Provider 组件
 * 用于在组件树中提供 HTTP 客户端
 */
declare const HttpProvider: {
    name: string;
    props: {
        client: {
            type: () => HttpClient;
            required: boolean;
        };
        config: {
            type: () => RequestConfig;
            required: boolean;
        };
    };
    setup(props: {
        client?: HttpClient;
        config?: RequestConfig;
    }, { slots }: any): () => any;
};
/**
 * 创建 HTTP 插件实例
 */
declare function createHttpPlugin(options?: HttpPluginOptions): Plugin;

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $http: HttpClient;
    }
    interface GlobalComponents {
        HttpProvider: typeof HttpProvider;
    }
}

export { HttpPlugin, HttpProvider, createHttpPlugin, HttpPlugin as default, install };
