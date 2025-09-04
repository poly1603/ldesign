/**
 * API 插件集成
 * 基于 @ldesign/api 包实现的 API 接口管理系统
 */

import { createApiEnginePlugin, systemApiPlugin } from '@ldesign/api'

/**
 * API 插件配置
 */
export const apiPlugin = createApiEnginePlugin({
  name: 'api',
  version: '1.0.0',
  clientConfig: {
    debug: import.meta.env.DEV,
    appName: 'LDesign Demo App',
    version: '1.0.0',
    http: {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'https://jsonplaceholder.typicode.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    },
    cache: {
      enabled: true,
      ttl: 300000, // 5分钟缓存
      maxSize: 100,
      storage: 'memory',
    },
    debounce: {
      enabled: true,
      delay: 300,
    },
    deduplication: {
      enabled: true,
    },
  },
  globalInjection: true,
  globalPropertyName: '$api',
})

/**
 * 系统 API 插件
 * 提供登录、用户信息、菜单等常用接口
 */
export const systemPlugin = {
  name: 'system-api',
  version: '1.0.0',
  dependencies: ['api'],

  async install(engine: any) {
    console.log('[System API Plugin] 正在安装系统 API 插件...')

    // 延迟安装，避免时序问题
    setTimeout(async () => {
      // 等待API引擎插件完全安装
      let attempts = 0
      const maxAttempts = 50

      while (attempts < maxAttempts && !engine.apiEngine) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (engine.apiEngine) {
        try {
          await engine.apiEngine.use(systemApiPlugin)
          console.log('[System API Plugin] 系统 API 插件安装成功')
        } catch (error) {
          console.error('[System API Plugin] 安装失败:', error)
        }
      } else {
        // 静默跳过，因为API演示页面会手动注册方法
        console.debug('[System API Plugin] API 引擎未找到，使用手动注册方式')
      }
    }, 2000)
  },

  async uninstall(engine: any) {
    console.log('[System API Plugin] 正在卸载系统 API 插件...')

    if (engine.apiEngine) {
      await engine.apiEngine.unuse('system-apis')
      console.log('[System API Plugin] 系统 API 插件卸载成功')
    }
  },
}

/**
 * 自定义 API 方法插件
 * 演示如何扩展 API 方法
 */
export const customApiPlugin = {
  name: 'custom-api',
  version: '1.0.0',
  dependencies: ['api'],

  async install(engine: any) {
    console.log('[Custom API Plugin] 正在安装自定义 API 插件...')

    // 延迟安装，避免时序问题
    setTimeout(async () => {
      // 等待API引擎插件完全安装
      let attempts = 0
      const maxAttempts = 50

      while (attempts < maxAttempts && !engine.apiEngine) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (engine.apiEngine) {

        // 创建自定义API插件
        const customApiPlugin = {
          name: 'custom-apis',
          version: '1.0.0',
          apis: {
            // 获取文章列表
            getPosts: {
              name: 'getPosts',
              config: {
                method: 'GET',
                url: '/posts',
              },
              transform: (response: any) => response.data,
              cache: {
                enabled: true,
                ttl: 600000, // 10分钟缓存
              },
            },

            // 获取单个文章
            getPost: {
              name: 'getPost',
              config: (params: { id: number }) => ({
                method: 'GET',
                url: `/posts/${params.id}`,
              }),
              transform: (response: any) => response.data,
              cache: {
                enabled: true,
                ttl: 300000, // 5分钟缓存
              },
            },

            // 创建文章
            createPost: {
              name: 'createPost',
              config: (params: { title: string; body: string; userId: number }) => ({
                method: 'POST',
                url: '/posts',
                data: params,
              }),
              transform: (response: any) => response.data,
              onSuccess: (data: any) => {
                console.log('文章创建成功:', data)
              },
              cache: {
                enabled: false, // 创建操作不缓存
              },
            },

            // 更新文章
            updatePost: {
              name: 'updatePost',
              config: (params: { id: number; title?: string; body?: string; userId?: number }) => ({
                method: 'PUT',
                url: `/posts/${params.id}`,
                data: params,
              }),
              transform: (response: any) => response.data,
              onSuccess: (data: any) => {
                console.log('文章更新成功:', data)
              },
              cache: {
                enabled: false,
              },
            },

            // 删除文章
            deletePost: {
              name: 'deletePost',
              config: (params: { id: number }) => ({
                method: 'DELETE',
                url: `/posts/${params.id}`,
              }),
              onSuccess: () => {
                console.log('文章删除成功')
              },
              cache: {
                enabled: false,
              },
            },

            // 获取用户列表
            getUsers: {
              name: 'getUsers',
              config: {
                method: 'GET',
                url: '/users',
              },
              transform: (response: any) => response.data,
              cache: {
                enabled: true,
                ttl: 1800000, // 30分钟缓存
              },
            },

            // 获取评论列表
            getComments: {
              name: 'getComments',
              config: (params?: { postId?: number }) => ({
                method: 'GET',
                url: '/comments',
                params,
              }),
              transform: (response: any) => response.data,
              cache: {
                enabled: true,
                ttl: 300000, // 5分钟缓存
              },
            },
          },
          install: (engine: any) => {
            console.log('[Custom API Plugin] 自定义 API 插件已安装')
          },
          uninstall: (engine: any) => {
            console.log('[Custom API Plugin] 自定义 API 插件已卸载')
          },
        }

        try {
          // 使用API引擎的use方法安装插件
          await engine.apiEngine.use(customApiPlugin)
          console.log('[Custom API Plugin] 自定义 API 插件安装成功')
        } catch (error) {
          console.error('[Custom API Plugin] 安装失败:', error)
        }
      } else {
        // 静默跳过，因为API演示页面会手动注册方法
        console.debug('[Custom API Plugin] API 引擎未找到，使用手动注册方式')
      }
    }, 3000)
  },

  async uninstall(engine: any) {
    console.log('[Custom API Plugin] 正在卸载自定义 API 插件...')

    if (engine.apiEngine) {
      // 取消注册自定义 API 方法
      const methods = [
        'getPosts', 'getPost', 'createPost', 'updatePost', 'deletePost',
        'getUsers', 'getComments'
      ]

      methods.forEach(method => {
        engine.apiEngine.unregister(method)
      })

      console.log('[Custom API Plugin] 自定义 API 插件卸载成功')
    }
  },
}

// 导出所有插件
export { apiPlugin as default }
