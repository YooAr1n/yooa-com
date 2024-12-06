import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Math from '../views/Math.vue'
import Cryptography from '../views/Cryptography.vue'
import Statistics from '../views/Statistics.vue'
import Illions from '../views/Illions.vue'
import Numbers from '../views/Numbers.vue'
import Incremental from '../views/Incremental.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/math',
    name: 'math',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: Math
  },
  {
    path: '/cryptography',
    name: 'cryptography',
    component: Cryptography
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: Statistics
  },
  {
    path: '/illions',
    name: 'illions',
    component: Illions
  },
  {
    path: '/numbers',
    name: 'numbers',
    component: Numbers
  },
  {
    path: '/incremental',
    name: 'incremental',
    component: Incremental
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router
