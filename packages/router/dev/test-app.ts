import type { RouteRecordRaw } from '../src'
import { createApp, defineComponent, h, ref } from 'vue'
import { createRouter, createWebHistory, RouterLink, RouterView } from '../src'

// 测试组件
const Home = defineComponent({
  name: 'Home',
  setup() {
    return () =>
      h('div', { 'data-testid': 'page-content' }, [
        h('h1', 'Router Test App'),
        h('p', 'Welcome to the router test application'),
        h('nav', [
          h(RouterLink, { to: '/about' }, () => 'About'),
          ' | ',
          h(RouterLink, { to: '/user/123' }, () => 'User 123'),
          ' | ',
          h(RouterLink, { to: '/posts' }, () => 'Posts'),
          ' | ',
          h(RouterLink, { to: '/search?q=test&category=all' }, () => 'Search'),
          ' | ',
          h(RouterLink, { to: '/docs#section1' }, () => 'Docs'),
        ]),
      ])
  },
})

const About = defineComponent({
  name: 'About',
  setup() {
    return () =>
      h('div', { 'data-testid': 'page-content' }, [
        h('h1', 'About'),
        h('p', 'This is the about page'),
        h(RouterLink, { to: '/' }, () => 'Back to Home'),
      ])
  },
})

const User = defineComponent({
  name: 'User',
  props: ['id'],
  setup(props) {
    return () =>
      h('div', { 'data-testid': 'page-content' }, [
        h('h1', 'User Profile'),
        h('p', { 'data-testid': 'user-id' }, `User ID: ${props.id}`),
        h(RouterLink, { to: '/' }, () => 'Back to Home'),
      ])
  },
})

const Posts = defineComponent({
  name: 'Posts',
  setup() {
    return () =>
      h('div', { 'data-testid': 'posts-container' }, [
        h('h1', 'Posts'),
        h('p', 'Posts list'),
        h(RouterView),
      ])
  },
})

const Post = defineComponent({
  name: 'Post',
  props: ['id'],
  setup(props) {
    return () =>
      h('div', { 'data-testid': 'post-content' }, [
        h('h2', `Post ${props.id}`),
        h('p', 'Post content here'),
      ])
  },
})

const Search = defineComponent({
  name: 'Search',
  setup() {
    const route = useRoute()
    return () =>
      h('div', { 'data-testid': 'page-content' }, [
        h('h1', 'Search'),
        h(
          'p',
          { 'data-testid': 'search-query' },
          `Query: ${route.query.q || ''}`,
        ),
        h(
          'p',
          { 'data-testid': 'search-category' },
          `Category: ${route.query.category || ''}`,
        ),
        h(RouterLink, { to: '/' }, () => 'Back to Home'),
      ])
  },
})

const Docs = defineComponent({
  name: 'Docs',
  setup() {
    return () =>
      h('div', { 'data-testid': 'page-content' }, [
        h('h1', 'Documentation'),
        h('div', { id: 'section1' }, [
          h('h2', 'Section 1'),
          h('p', 'This is section 1 content'),
        ]),
        h('div', { id: 'section2' }, [
          h('h2', 'Section 2'),
          h('p', 'This is section 2 content'),
        ]),
        h(RouterLink, { to: '/' }, () => 'Back to Home'),
      ])
  },
})

const NotFound = defineComponent({
  name: 'NotFound',
  setup() {
    return () =>
      h('div', { 'data-testid': 'not-found' }, [
        h('h1', '404 - Page Not Found'),
        h('p', 'The page you are looking for does not exist'),
        h(RouterLink, { to: '/' }, () => 'Back to Home'),
      ])
  },
})

const Login = defineComponent({
  name: 'Login',
  setup() {
    return () =>
      h('div', { 'data-testid': 'page-content' }, [
        h('h1', 'Login'),
        h('p', { 'data-testid': 'redirect-message' }, '请先登录'),
        h('button', { onClick: () => console.warn('Login clicked') }, 'Login'),
        h(RouterLink, { to: '/' }, () => 'Back to Home'),
      ])
  },
})

const Profile = defineComponent({
  name: 'Profile',
  setup() {
    return () =>
      h('div', { 'data-testid': 'page-content' }, [
        h('nav', { 'data-testid': 'breadcrumb' }, 'Home > Profile'),
        h('h1', 'Profile'),
        h('p', 'User profile page'),
        h(RouterLink, { to: '/' }, () => 'Back to Home'),
      ])
  },
})

const CachedPage = defineComponent({
  name: 'CachedPage',
  setup() {
    const inputValue = ref('')
    return () =>
      h('div', { 'data-testid': 'page-content' }, [
        h('h1', 'Cached Page'),
        h('input', {
          'data-testid': 'input-field',
          'value': inputValue.value,
          'onInput': (e: any) => (inputValue.value = e.target.value),
        }),
        h(RouterLink, { to: '/' }, () => 'Back to Home'),
      ])
  },
})

// 路由配置
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: Home },
  { path: '/about', name: 'about', component: About },
  {
    path: '/user/:id',
    name: 'user',
    component: User,
    props: true,
  },
  {
    path: '/posts',
    name: 'posts',
    component: Posts,
    children: [
      {
        path: ':id',
        name: 'post',
        component: Post,
        props: true,
      },
    ],
  },
  { path: '/search', name: 'search', component: Search },
  { path: '/docs', name: 'docs', component: Docs },
  { path: '/login', name: 'login', component: Login },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { title: 'Profile', requiresAuth: true },
  },
  { path: '/cached-page', name: 'cached-page', component: CachedPage },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound },
]

// 创建路由器
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - Router Test App`
  }
  else {
    document.title = 'Router Test App'
  }

  // 简单的认证检查
  if (to.path === '/admin') {
    next('/login')
  }
  else {
    next()
  }
})

// 创建应用
const app = createApp({
  setup() {
    return () => h('div', { id: 'app' }, [h(RouterView)])
  },
})

// 全局组件和函数
function useRoute() {
  return router.currentRoute.value
}

app.use(router)

export { app, router }
