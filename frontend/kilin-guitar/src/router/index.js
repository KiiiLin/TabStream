import { createRouter, createWebHistory } from 'vue-router'
import Covers from '../views/Covers.vue'
import CoversEdit from '../views/CoversEdit.vue'
import Home from '../views/Home.vue'
import Scores from '../views/Scores.vue'
import Memories from '../views/Memories.vue'
import MemoriesEdit from '../views/MemoriesEdit.vue'

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
    path: '/covers/edit',
    name: 'CoversEdit',
    component: CoversEdit
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
  },
  {
    path: '/memories/edit',
    name: 'MemoriesEdit',
    component: MemoriesEdit
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router


