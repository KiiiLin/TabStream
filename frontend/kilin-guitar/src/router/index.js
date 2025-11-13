import { createRouter, createWebHistory } from 'vue-router'
import Covers from '../views/Covers.vue'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/covers',
    name: 'Covers',
    component: Covers
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router


