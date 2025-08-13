/**
 * Home 页面相关的类型定义
 */
interface User {
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
interface Post {
  id: number
  userId: number
  title: string
  body: string
}
interface RequestStats {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  cacheHits: number
  activeRequests: number
}
interface NewPost {
  title: string
  body: string
}
interface UserCardProps {
  user: User
  loading?: boolean
  onViewDetails?: (userId: number) => void
}
interface PostCardProps {
  post: Post
  loading?: boolean
  onDelete?: (id: number, title: string) => void
  onView?: (post: Post) => void
}
interface HttpStatsPanelProps {
  stats: RequestStats
  loading: boolean
  error: any
  apiUrl: string
}
interface InfoPanelProps {
  title: string
  icon: string
  children?: any
}
interface HttpActionsPanelProps {
  loading: boolean
  activeRequests: number
  onFetchUsers: () => void
  onFetchPosts: (limit?: number) => void
  onFetchAllData: () => void
  onCancelAllRequests: () => void
  onClearCache: () => void
}
interface CreatePostFormProps {
  newPost: NewPost
  loading: boolean
  onUpdatePost: (post: NewPost) => void
  onCreatePost: () => void
}
interface DeviceInfo {
  type: string
  orientation: string
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}
interface RouteInfo {
  path: string
  name: string
  title: string
}
interface UserInfo {
  username: string
  loginTime: string
  device: string
}

export type {
  CreatePostFormProps,
  DeviceInfo,
  HttpActionsPanelProps,
  HttpStatsPanelProps,
  InfoPanelProps,
  NewPost,
  Post,
  PostCardProps,
  RequestStats,
  RouteInfo,
  User,
  UserCardProps,
  UserInfo,
}
