import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'

import EnterpriseDemo from './views/EnterpriseDemo.vue'
import Home from './views/Home.vue'
import PerformanceDemo from './views/PerformanceDemo.vue'
import RealTimeDemo from './views/RealTimeDemo.vue'
import StorePoolDemo from './views/StorePoolDemo.vue'
import 'reflect-metadata'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/performance', component: PerformanceDemo },
    { path: '/store-pool', component: StorePoolDemo },
    { path: '/enterprise', component: EnterpriseDemo },
    { path: '/realtime', component: RealTimeDemo },
  ],
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.mount('#app')
