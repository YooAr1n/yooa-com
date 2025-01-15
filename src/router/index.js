import { createRouter, createWebHashHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Math from '../views/Math.vue';
import Cryptography from '../views/Cryptography.vue';
import Statistics from '../views/Statistics.vue';
import Illions from '../views/Illions.vue';
import Numbers from '../views/Numbers.vue';
import Incremental from '../views/Incremental.vue';

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/math', name: 'math', component: Math },
  { path: '/cryptography', name: 'cryptography', component: Cryptography },
  { path: '/statistics', name: 'statistics', component: Statistics },
  { path: '/illions', name: 'illions', component: Illions },
  { path: '/numbers', name: 'numbers', component: Numbers },
  { path: '/incremental', name: 'incremental', component: Incremental },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

// Add the navigation guard to modify the background color
router.beforeEach((to, from, next) => {
  if (to.path === '/incremental') {
    // Set background color to black for the Incremental route
    document.body.style.backgroundColor = 'black';
  } else {
    // Set background color to powderblue for all other routes
    document.body.style.backgroundColor = 'powderblue';
  }
  next(); // Always call next() to allow the navigation to proceed
});

export default router;
