import { Ref } from 'vue'
import { EngineImpl } from '@ldesign/engine'
import { User, Post, NewPost, RequestStats } from '../types/index.js'

/**
 * HTTP 演示功能的自定义 Hook
 * 封装所有 HTTP 请求逻辑和状态管理
 */
declare function useHttpDemo(engine?: EngineImpl): {
  users: Ref<User[]>
  posts: Ref<Post[]>
  newPost: Ref<NewPost>
  loading: Ref<boolean, boolean>
  error: Ref<any, any>
  requestStats: Ref<RequestStats>
  fetchUsers: () => Promise<void>
  fetchPosts: (limit?: number) => Promise<void>
  createPost: () => Promise<void>
  deletePost: (id: number, title: string) => Promise<void>
  fetchUserDetails: (userId: number) => Promise<void>
  fetchAllData: () => Promise<void>
  viewPost: (post: Post) => void
  updateNewPost: (post: NewPost) => void
  cancelAllRequests: () => void
  clearCache: () => void
}

export { useHttpDemo }
