import { createRouter, createWebHistory } from 'vue-router'
import Covers from '../views/Covers.vue'
import Home from '../views/Home.vue'
import Scores from '../views/Scores.vue'
import Memories from '../views/Memories.vue'

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
  },
  {
    path: '/scores',
    name: 'Scores',
    component: Scores
  },
  {
    path: '/memories',
    name: 'Memories',
    component: Memories
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router


