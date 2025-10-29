import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('../views/Projects.vue'),
  },
  {
    path: '/projects/:id',
    component: () => import('../views/ProjectDetail.vue'),
    children: [
      {
        path: '',
        name: 'ProjectOverview',
        component: () => import('../views/project/Overview.vue'),
      },
      {
        path: 'builder',
        name: 'ProjectBuilder',
        component: () => import('../views/project/Builder.vue'),
      },
      {
        path: 'deployer',
        name: 'ProjectDeployer',
        component: () => import('../views/project/Deployer.vue'),
      },
      {
        path: 'testing',
        name: 'ProjectTesting',
        component: () => import('../views/project/Testing.vue'),
      },
      {
        path: 'git',
        name: 'ProjectGit',
        component: () => import('../views/project/Git.vue'),
      },
      {
        path: 'deps',
        name: 'ProjectDeps',
        component: () => import('../views/project/Deps.vue'),
      },
      {
        path: 'formatter',
        name: 'ProjectFormatter',
        component: () => import('../views/project/Formatter.vue'),
      },
      {
        path: 'security',
        name: 'ProjectSecurity',
        component: () => import('../views/project/Security.vue'),
      },
      {
        path: 'performance',
        name: 'ProjectPerformance',
        component: () => import('../views/project/Performance.vue'),
      },
      {
        path: 'monitor',
        name: 'ProjectMonitor',
        component: () => import('../views/project/Monitor.vue'),
      },
      {
        path: 'changelog',
        name: 'ProjectChangelog',
        component: () => import('../views/project/Changelog.vue'),
      },
      {
        path: 'docs',
        name: 'ProjectDocs',
        component: () => import('../views/project/Docs.vue'),
      },
      {
        path: 'publisher',
        name: 'ProjectPublisher',
        component: () => import('../views/project/Publisher.vue'),
      },
      {
        path: 'translator',
        name: 'ProjectTranslator',
        component: () => import('../views/project/Translator.vue'),
      },
    ],
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('../views/Tasks.vue'),
  },
  {
    path: '/performance',
    name: 'Performance',
    component: () => import('../views/Performance.vue'),
  },
  {
    path: '/dependencies',
    name: 'Dependencies',
    component: () => import('../views/Dependencies.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router


