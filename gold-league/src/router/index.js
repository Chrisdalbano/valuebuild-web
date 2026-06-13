import { createRouter, createWebHistory } from 'vue-router'
import ItemExplorer from '../components/organisms/ItemExplorer.vue'
import CompareBoard from '../components/organisms/CompareBoard.vue'
import BuildBoard from '../components/organisms/BuildBoard.vue'
import ChampionsBoard from '../components/organisms/ChampionsBoard.vue'
import ResearchBoard from '../components/organisms/ResearchBoard.vue'
import AboutSection from '../components/organisms/AboutSection.vue'

const routes = [
  {
    path: '/',
    name: 'Items',
    component: ItemExplorer,
    meta: { title: 'Items Database' },
    props: true
  },
  {
    path: '/compare',
    name: 'Compare',
    component: CompareBoard,
    meta: { title: 'Item Comparison' },
    props: true
  },
  {
    path: '/builds',
    name: 'Builds',
    component: BuildBoard,
    meta: { title: 'Build Optimizer' },
    props: true
  },
  {
    path: '/champions',
    name: 'Champions',
    component: ChampionsBoard,
    meta: { title: 'Champions' },
    props: true
  },
  {
    path: '/research',
    name: 'Research',
    component: ResearchBoard,
    meta: { title: 'Research Lab' },
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

// Track page views in Mouseflow after each route change
router.afterEach((to) => {
  if (typeof window._mfq !== 'undefined') {
    window._mfq.push(['newPageView', to.fullPath])
  }
})

export default router

