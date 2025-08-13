/**
 * Home 页面相关的类型定义
 */

// 用户数据类型
export interface User {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
  company?: {
    name: string
    catchPhrase?: string
    bs?: string
  }
  address?: {
    street: string
    suite: string
    city: string
    zipcode: string
    geo?: {
      lat: string
      lng: string
    }
  }
}

// 文章数据类型
export interface Post {
  id: number
  userId: number
  title: string
  body: string
}

// HTTP 请求统计类型
export interface RequestStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  cacheHits: number
  activeRequests: number
}

// 新文章表单类型
export interface NewPost {
  title: string
  body: string
}

// 用户卡片组件 Props
export interface UserCardProps {
  user: User
  loading?: boolean
  onViewDetails?: (userId: number) => void
}

// 文章卡片组件 Props
export interface PostCardProps {
  post: Post
  loading?: boolean
  onDelete?: (id: number, title: string) => void
  onView?: (post: Post) => void
}

// HTTP 状态面板 Props
export interface HttpStatsPanelProps {
  stats: RequestStats
  loading: boolean
  error: any
  apiUrl: string
}

// 信息面板 Props
export interface InfoPanelProps {
  title: string
  icon: string
  children?: any
}

// HTTP 操作面板 Props
export interface HttpActionsPanelProps {
  loading: boolean
  activeRequests: number
  onFetchUsers: () => void
  onFetchPosts: (limit?: number) => void
  onFetchAllData: () => void
  onCancelAllRequests: () => void
  onClearCache: () => void
}

// 创建文章表单 Props
export interface CreatePostFormProps {
  newPost: NewPost
  loading: boolean
  onUpdatePost: (post: NewPost) => void
  onCreatePost: () => void
}

// 设备信息类型
export interface DeviceInfo {
  type: string
  orientation: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

// 路由信息类型
export interface RouteInfo {
  path: string
  name: string
  title: string
}

// 用户信息类型
export interface UserInfo {
  username: string
  loginTime: string
  device: string
}
