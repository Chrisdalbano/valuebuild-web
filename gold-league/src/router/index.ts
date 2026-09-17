import { createRouter, createWebHistory } from "vue-router";
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: () => import("../views/LandingView.vue"),
      meta: { title: "Know what your gold buys" },
    },
    {
      path: "/items",
      component: () => import("../views/ItemsView.vue"),
      meta: { title: "Item explorer" },
    },
    {
      path: "/compare",
      component: () => import("../views/CompareView.vue"),
      meta: { title: "Compare items" },
    },
    {
      path: "/builds",
      component: () => import("../views/BuildsView.vue"),
      meta: { title: "Build lab" },
    },
    {
      path: "/champions",
      component: () => import("../views/ChampionsView.vue"),
      meta: { title: "Champion studies" },
    },
    {
      path: "/research",
      component: () => import("../views/ResearchView.vue"),
      meta: { title: "Research lab" },
    },
    {
      path: "/about",
      component: () => import("../views/AboutView.vue"),
      meta: { title: "Method & sources" },
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
router.afterEach((to) => {
  document.title = `${to.meta.title} · BuildValue`;
});
export default router;
