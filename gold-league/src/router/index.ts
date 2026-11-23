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
    {
      path: "/tft",
      component: () => import("../views/tft/TftRollView.vue"),
      meta: { title: "TFT roll odds", game: "tft" },
    },
    {
      path: "/tft/items",
      component: () => import("../views/tft/TftItemsView.vue"),
      meta: { title: "TFT item ledger", game: "tft" },
    },
    {
      path: "/tft/traits",
      component: () => import("../views/tft/TftTraitsView.vue"),
      meta: { title: "TFT trait prices", game: "tft" },
    },
    {
      path: "/tft/review",
      component: () => import("../views/tft/TftReviewView.vue"),
      meta: { title: "TFT game review", game: "tft" },
    },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
router.afterEach((to) => {
  document.title = `${to.meta.title} · BuildValue`;
  // The Mouseflow snippet in index.html only records the first load; tell it
  // about client-side navigations as the pre-migration router did.
  (window as unknown as { _mfq?: unknown[][] })._mfq?.push([
    "newPageView",
    to.fullPath,
  ]);
});
export default router;
