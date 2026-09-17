<script setup lang="ts">
import {
  computed,
  onMounted,
  onBeforeUnmount,
  shallowRef,
  useTemplateRef,
} from "vue";
import { useRouter } from "vue-router";
import { FzButton, FzIcon } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { number } from "../../domain/items";
const { items, add, dataset } = useWorkspace();
const router = useRouter();
const root = useTemplateRef<HTMLElement>("root");
const active = shallowRef(0);
const studies = computed(() =>
  ["3031", "3089", "3078"].flatMap(
    (id) => items.value.find((item) => item.id === id) || [],
  ),
);
const item = computed(() => studies.value[active.value] || studies.value[0]);
let cleanup: (() => void) | undefined;
let disposed = false;
onMounted(async () => {
  const { gsap } = await import("gsap");
  if (disposed || !root.value) return;
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const context = gsap.context(() => {
      gsap.from(".hero-line span", {
        yPercent: 115,
        rotate: 3,
        duration: 1,
        stagger: 0.12,
        ease: "power4.out",
      });
      gsap.from(".purchase-study", {
        opacity: 0,
        y: 40,
        rotate: -5,
        duration: 1.2,
        delay: 0.2,
        ease: "power3.out",
      });
      gsap.from(".hero-support", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.5,
      });
      gsap.fromTo(
        ".hero-slash",
        { scaleX: 0 },
        { scaleX: 1, duration: 0.9, delay: 0.45, ease: "expo.out" },
      );
    }, root.value!);
    return () => context.revert();
  });
  cleanup = () => media.revert();
});
onBeforeUnmount(() => {
  disposed = true;
  cleanup?.();
});
function tryItem() {
  if (item.value) add(item.value);
  void router.push("/builds");
}
</script>
<template>
  <section ref="root" class="landing-hero">
    <div class="hero-copy">
      <h1>
        <span class="hero-line"><span>KNOW WHAT</span></span
        ><span class="hero-line"><span>YOUR GOLD</span></span
        ><span class="hero-line"><span class="accent">BUYS.</span></span>
      </h1>
      <div class="hero-support">
        <p>
          Better builds start with better questions.<br />Explore League's
          items. See the tradeoffs.<br />Make your next purchase deliberate.
        </p>
        <div class="hero-actions">
          <RouterLink to="/items" class="button-link"
            >Explore items <FzIcon name="arrowRight" /></RouterLink
          ><RouterLink to="/builds" class="text-link"
            >Open build lab <FzIcon name="arrowUpRight" :size="16"
          /></RouterLink>
        </div>
      </div>
    </div>
    <div class="hero-art">
      <div class="hero-slash" aria-hidden="true" />
      <div class="study-orbit" aria-hidden="true">
        <span>VALUE IS A STARTING POINT</span>
      </div>
      <div v-if="item" class="purchase-study">
        <div class="study-top">
          <span>THE PURCHASE STUDY</span><span>0{{ active + 1 }} / 03</span>
        </div>
        <Transition name="study" mode="out-in"
          ><div :key="item.id" class="study-content">
            <div class="study-image">
              <span class="study-crosshair" aria-hidden="true" /><img
                :src="item.imageUrl"
                :alt="item.name"
                width="120"
                height="120"
                fetchpriority="high"
              /><span class="study-id">#{{ item.id }}</span>
            </div>
            <h2>{{ item.name }}</h2>
            <div class="study-metrics">
              <div>
                <span>Gold spent</span
                ><strong>{{ number(item.cost) }}<small> G</small></strong>
              </div>
              <div>
                <span>Base-stat value</span
                ><strong class="mint"
                  >{{ number(item.value) }}<small> G</small></strong
                >
              </div>
            </div>
            <p>
              Stats tell one part of the story.<br />Effects decide the rest.
            </p>
            <FzButton variant="secondary" @click="tryItem"
              >Start with this item <FzIcon name="plus" :size="16"
            /></FzButton></div
        ></Transition>
        <div
          class="study-selector"
          role="group"
          aria-label="Choose a purchase study"
        >
          <button
            v-for="(entry, i) in studies"
            :key="entry.id"
            :aria-label="`Study ${entry.name}`"
            :aria-pressed="active === i"
            @click="active = i"
          >
            <span>0{{ i + 1 }}</span
            ><span class="selector-line" />
          </button>
        </div>
      </div>
    </div>
    <div class="hero-bottom">
      <span
        ><span class="status-dot" />Patch {{ dataset.version }} · Summoner's
        Rift</span
      ><a href="#how-it-works"
        >A closer look <span aria-hidden="true">↓</span></a
      >
    </div>
  </section>
</template>
