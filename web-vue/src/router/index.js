import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/information',
      name: 'information',
      component: () => import('../views/Information.vue')
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('../views/Chat.vue')
    },
    {
      path: '/album',
      name: 'album',
      component: () => import('../views/Album.vue')
    },
    {
      path: '/board',
      name: 'board',
      component: () => import('../views/Board.vue')
    }
  ]
})

export default router
