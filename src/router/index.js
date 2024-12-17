import Vue from 'vue'
import VueRouter from 'vue-router'
import { authStore } from '@/store/auth'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/stock',
    name: 'Stock',
    component: () => import('@/views/Stock.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: () => import('@/views/Customers.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/suppliers',
    name: 'Suppliers',
    component: () => import('@/views/Suppliers.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/sales',
    name: 'Sales',
    component: () => import('@/views/Sales.vue'),
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach(async (to, from, next) => {
  if (authStore.loading) {
    // Esperar a inicialização do auth store
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (!authStore.loading) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !authStore.user) {
    next('/login')
  } else if (requiresGuest && authStore.user) {
    next('/')
  } else {
    next()
  }
})

export default router
