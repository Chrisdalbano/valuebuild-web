import { createRouter, createWebHistory } from 'vue-router'
import ItemTable from '../components/ItemTable.vue'
import ItemCompare from '../components/ItemCompare.vue'
import BuildOptimizer from '../components/BuildOptimizer.vue'
import AboutSection from '../components/AboutSection.vue'

const routes = [
  {
    path: '/',
    name: 'Items',
    component: ItemTable,
    meta: { title: 'Items Database' },
    props: true
  },
  {
    path: '/compare',
    name: 'Compare',
    component: ItemCompare,
    meta: { title: 'Item Comparison' },
    props: true
  },
  {
    path: '/builds',
    name: 'Builds',
    component: BuildOptimizer,
    meta: { title: 'Build Optimizer' },
    props: true
  },
  {
    path: '/about',
    name: 'About',
    component: AboutSection,
    meta: { title: 'About & Documentation' },
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Update document title on route change
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - BuildValue` || 'BuildValue'
  next()
})

export default router

