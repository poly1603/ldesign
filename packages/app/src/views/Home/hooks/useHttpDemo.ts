import type { EngineImpl } from '@ldesign/engine'
import type { NewPost, Post, RequestStats, User } from '../types'
import { useHttp } from '@ldesign/http'
import { ref, type Ref } from 'vue'

/**
 * HTTP 演示功能的自定义 Hook
 * 封装所有 HTTP 请求逻辑和状态管理
 */
export function useHttpDemo(engine?: EngineImpl) {
  // HTTP 客户端配置
  const {
    get,
    post,
    delete: del,
    client,
  } = useHttp({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
    // 启用缓存
    cache: {
      enabled: true,
      ttl: 300000, // 5分钟缓存
    },
    // 重试机制
    retry: {
      retries: 3,
      retryCondition: (error: any) => {
        return (
          error.code === 'NETWORK_ERROR' ||
          error.code === 'TIMEOUT' ||
          error.response?.status >= 500
        )
      },
    },
    // 并发控制
    concurrency: {
      maxConcurrent: 3,
    },
  })

  // 状态管理
  const users = ref<User[]>([])
  const posts = ref<Post[]>([])
  const newPost = ref<NewPost>({ title: '', body: '' })
  const loading = ref(false)
  const error = ref<any>(null)

  // HTTP 状态管理
  const requestStats = ref<RequestStats>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cacheHits: 0,
    activeRequests: 0,
  })

  // 请求取消控制器管理
  const abortControllers = ref<Map<string, AbortController>>(new Map())

  // 创建取消控制器
  const createAbortController = (key: string): AbortController => {
    // 如果已存在同类型请求，先取消
    const existingController = abortControllers.value.get(key)
    if (existingController) {
      existingController.abort('新请求取消了之前的请求')
    }

    const controller = new AbortController()
    abortControllers.value.set(key, controller)
    return controller
  }

  // 清理取消控制器
  const cleanupController = (key: string) => {
    abortControllers.value.delete(key)
  }

  // 取消所有请求
  const cancelAllRequests = () => {
    abortControllers.value.forEach((controller, key) => {
      controller.abort('用户取消了所有请求')
      engine?.logger.info('取消请求', { requestKey: key })
    })
    abortControllers.value.clear()
    requestStats.value.activeRequests = 0
  }

  // 清除缓存
  const clearCache = () => {
    try {
      client.clearCache()
      engine?.logger.info('缓存已清除')
      alert('缓存已清除！下次请求将从网络获取最新数据。')
    } catch (err) {
      console.error('清除缓存失败:', err)
    }
  }

  // 获取用户列表
  const fetchUsers = async () => {
    const controller = createAbortController('fetchUsers')
    requestStats.value.totalRequests++
    requestStats.value.activeRequests++
    loading.value = true
    error.value = null

    try {
      const startTime = Date.now()
      const response = await get('/users', {
        signal: controller.signal,
        metadata: { requestType: 'fetchUsers' },
      })

      const duration = Date.now() - startTime
      users.value = Array.isArray(response) ? response : []
      requestStats.value.successfulRequests++

      engine?.logger.info('获取用户列表成功', {
        count: users.value.length,
        duration: `${duration}ms`,
        cached: duration < 100,
      })
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        requestStats.value.failedRequests++
        error.value = err
        console.error('获取用户列表失败:', err)
        engine?.logger.error('获取用户列表失败', {
          error: err.message,
          code: err.code,
          status: err.response?.status,
        })
      }
    } finally {
      loading.value = false
      requestStats.value.activeRequests--
      cleanupController('fetchUsers')
    }
  }

  // 获取文章列表
  const fetchPosts = async (limit: number = 5) => {
    const controller = createAbortController('fetchPosts')
    requestStats.value.totalRequests++
    requestStats.value.activeRequests++
    loading.value = true

    try {
      const startTime = Date.now()
      const response = await get(`/posts?_limit=${limit}`, {
        signal: controller.signal,
        metadata: { requestType: 'fetchPosts', limit },
      })

      const duration = Date.now() - startTime
      posts.value = Array.isArray(response) ? response : []
      requestStats.value.successfulRequests++

      engine?.logger.info('获取文章列表成功', {
        count: posts.value.length,
        limit,
        duration: `${duration}ms`,
        cached: duration < 100,
      })
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        requestStats.value.failedRequests++
        error.value = err
        console.error('获取文章列表失败:', err)
        engine?.logger.error('获取文章列表失败', {
          error: err.message,
          code: err.code,
          status: err.response?.status,
          limit,
        })
      }
    } finally {
      loading.value = false
      requestStats.value.activeRequests--
      cleanupController('fetchPosts')
    }
  }

  // 创建文章
  const createPost = async () => {
    if (!newPost.value.title.trim() || !newPost.value.body.trim()) {
      alert('请填写标题和内容')
      return
    }

    const controller = createAbortController('createPost')
    requestStats.value.totalRequests++
    requestStats.value.activeRequests++
    loading.value = true

    try {
      const startTime = Date.now()
      const postData = {
        title: newPost.value.title.trim(),
        body: newPost.value.body.trim(),
        userId: 1,
      }

      const response = await post('/posts', postData, {
        signal: controller.signal,
        metadata: { requestType: 'createPost' },
      })

      const duration = Date.now() - startTime
      requestStats.value.successfulRequests++

      console.log('创建文章成功:', response)
      newPost.value = { title: '', body: '' }

      engine?.logger.info('创建文章成功', {
        postId: response?.id,
        duration: `${duration}ms`,
        title: postData.title,
      })

      alert(`文章创建成功！\nID: ${response?.id}\n标题: ${postData.title}`)

      // 自动刷新文章列表
      await fetchPosts(5)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        requestStats.value.failedRequests++
        error.value = err
        console.error('创建文章失败:', err)
        engine?.logger.error('创建文章失败', {
          error: err.message,
          code: err.code,
          status: err.response?.status,
          title: newPost.value.title,
        })
        alert(`创建文章失败: ${err.message}`)
      }
    } finally {
      loading.value = false
      requestStats.value.activeRequests--
      cleanupController('createPost')
    }
  }

  // 删除文章
  const deletePost = async (id: number, title: string) => {
    if (!confirm(`确定要删除文章 "${title}" 吗？`)) return

    const controller = createAbortController(`deletePost-${id}`)
    requestStats.value.totalRequests++
    requestStats.value.activeRequests++
    loading.value = true

    try {
      const startTime = Date.now()
      await del(`/posts/${id}`, {
        signal: controller.signal,
        metadata: { requestType: 'deletePost', postId: id },
      })

      const duration = Date.now() - startTime
      requestStats.value.successfulRequests++

      // 从本地列表中移除
      posts.value = posts.value.filter(post => post.id !== id)

      engine?.logger.info('删除文章成功', {
        postId: id,
        title,
        duration: `${duration}ms`,
      })

      alert(`文章删除成功！\n标题: ${title}`)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        requestStats.value.failedRequests++
        error.value = err
        console.error('删除文章失败:', err)
        engine?.logger.error('删除文章失败', {
          postId: id,
          title,
          error: err.message,
          code: err.code,
          status: err.response?.status,
        })
        alert(`删除文章失败: ${err.message}`)
      }
    } finally {
      loading.value = false
      requestStats.value.activeRequests--
      cleanupController(`deletePost-${id}`)
    }
  }

  // 获取用户详情
  const fetchUserDetails = async (userId: number) => {
    const controller = createAbortController(`userDetails-${userId}`)
    requestStats.value.totalRequests += 2 // 两个并发请求
    requestStats.value.activeRequests++
    loading.value = true

    try {
      const startTime = Date.now()
      const [userResponse, postsResponse] = await Promise.all([
        get(`/users/${userId}`, { signal: controller.signal }),
        get(`/posts?userId=${userId}`, { signal: controller.signal }),
      ])

      const duration = Date.now() - startTime
      requestStats.value.successfulRequests += 2 // 两个请求都成功

      const userDetails = {
        ...userResponse,
        posts: postsResponse || [],
      }

      engine?.logger.info('获取用户详情成功', {
        userId,
        postsCount: userDetails.posts.length,
        duration: `${duration}ms`,
      })

      alert(
        `用户详情：\n姓名：${userDetails.name}\n邮箱：${userDetails.email}\n电话：${userDetails.phone}\n网站：${userDetails.website}\n公司：${userDetails.company?.name}\n地址：${userDetails.address?.city}, ${userDetails.address?.street}\n文章数：${userDetails.posts.length}`
      )
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        requestStats.value.failedRequests += 2 // 两个请求都失败
        error.value = err
        console.error('获取用户详情失败:', err)
        engine?.logger.error('获取用户详情失败', {
          userId,
          error: err.message,
        })
        alert(`获取用户详情失败: ${err.message}`)
      }
    } finally {
      loading.value = false
      requestStats.value.activeRequests--
      cleanupController(`userDetails-${userId}`)
    }
  }

  // 批量获取数据
  const fetchAllData = async () => {
    loading.value = true
    try {
      await Promise.all([
        fetchUsers(),
        fetchPosts(10), // 获取更多文章
      ])
      engine?.logger.info('批量数据获取完成')
    } catch (err) {
      console.error('批量获取数据失败:', err)
    } finally {
      loading.value = false
    }
  }

  // 查看文章详情
  const viewPost = (post: Post) => {
    alert(
      `文章详情：\n标题：${post.title}\n内容：${post.body}\n作者ID：${post.userId}`
    )
  }

  // 更新新文章数据
  const updateNewPost = (post: NewPost) => {
    newPost.value = { ...post }
  }

  return {
    // 状态
    users: users as Ref<User[]>,
    posts: posts as Ref<Post[]>,
    newPost: newPost as Ref<NewPost>,
    loading,
    error,
    requestStats: requestStats as Ref<RequestStats>,

    // 方法
    fetchUsers,
    fetchPosts,
    createPost,
    deletePost,
    fetchUserDetails,
    fetchAllData,
    viewPost,
    updateNewPost,
    cancelAllRequests,
    clearCache,
  }
}
