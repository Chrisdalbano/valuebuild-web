<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, useTemplateRef } from "vue";
import { FzIcon } from "@chrisdalbano/forza-ui";
import { useWorkspace } from "../../state/workspace";
import { number } from "../../domain/items";
import ItemArtwork from "../workspace/ItemArtwork.vue";
const { items, compareIds } = useWorkspace();
const examples = computed(() =>
  ["3031", "3036", "3072"].flatMap(
    (id) => items.value.find((item) => item.id === id) || [],
  ),
);
const root = useTemplateRef<HTMLElement>("root");
let cleanup: (() => void) | undefined;
let disposed = false;
onMounted(async () => {
  const [{ gsap }, { ScrollTrigger }] = await Promise.all([
    import("gsap"),
    import("gsap/ScrollTrigger"),
  ]);
  if (disposed || !root.value) return;
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const context = gsap.context(() => {
      gsap.utils
        .toArray<HTMLElement>(".story-reveal")
        .forEach((el) =>
          gsap.from(el, {
            opacity: 0,
            y: 46,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
          }),
        );
      gsap.from(".value-line", {
        scaleX: 0,
        transformOrigin: "left",
        stagger: 0.12,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".comparison-study",
          start: "top 85%",
          once: true,
        },
      });
      gsap.to(".statement-word", {
        xPercent: -12,
        ease: "none",
        scrollTrigger: {
          trigger: ".statement",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }, root.value!);
    return () => context.revert();
  });
  cleanup = () => media.revert();
});
onBeforeUnmount(() => {
  disposed = true;
  cleanup?.();
});
function prepareComparison() {
  compareIds.value = examples.value.map((item) => item.id);
}
</script>
<template>
  <div ref="root">
    <section id="how-it-works" class="product-story">
      <div class="story-heading story-reveal">
        <span class="section-number" aria-hidden="true">01</span>
        <h2>
          THE RIGHT ITEM.<br /><span class="muted">FOR YOUR REASON.</span>
        </h2>
        <p>
          A percentage cannot play your champion.<br />But it can help you ask a
          sharper question.
        </p>
      </div>
      <div class="story-split">
        <div class="story-copy story-reveal">
          <h3>See what changes<br />before you buy.</h3>
          <p>
            Put items side by side. Compare cost, individual stats, and effects
            without jumping between pages.
          </p>
          <RouterLink to="/compare" class="text-link" @click="prepareComparison"
            >Try this comparison <FzIcon name="arrowRight" :size="18"
          /></RouterLink>
        </div>
        <div class="comparison-study story-reveal">
          <div class="study-table-heading">
            <span>Item</span><span>Cost / base-stat efficiency</span>
          </div>
          <div
            v-for="item in examples"
            :key="item.id"
            class="study-comparison-row"
          >
            <ItemArtwork :name="item.name" :src="item.imageUrl" />
            <div>
              <strong>{{ item.name }}</strong>
              <div class="study-bar">
                <span
                  class="value-line"
                  :style="{ width: `${Math.min(item.efficiency / 2, 100)}%` }"
                />
              </div>
            </div>
            <span
              >{{ number(item.cost) }} G<small class="mint"
                >{{ number(item.efficiency) }}%</small
              ></span
            >
          </div>
          <p class="fineprint">
            Priced base stats only. Read the effects before deciding.
          </p>
        </div>
      </div>
    </section>
    <section class="statement" aria-label="Build, question, refine">
      <div class="statement-word" aria-hidden="true">
        BUILD. QUESTION. <span>REFINE.</span>
      </div>
    </section>
    <section class="lab-story">
      <div class="lab-visual story-reveal">
        <div class="lab-track" aria-hidden="true">
          <div v-for="(item, i) in examples" :key="item.id" class="lab-tile">
            <span>0{{ i + 1 }}</span
            ><img
              :src="item.imageUrl"
              alt=""
              width="64"
              height="64"
              loading="lazy"
            />
          </div>
          <div v-for="i in 3" :key="`empty-${i}`" class="lab-tile empty">
            <span>0{{ i + 3 }}</span
            ><FzIcon name="plus" :size="24" />
          </div>
        </div>
        <div class="lab-caption">
          <span>A draft worth keeping.</span
          ><span class="mint"
            >Saved on your device <FzIcon name="check" :size="16"
          /></span>
        </div>
      </div>
      <div class="story-copy story-reveal">
        <span class="section-number" aria-hidden="true">02</span>
        <h2>THINK IN<br /><span class="accent">SIX SLOTS.</span></h2>
        <p>
          Add. Remove. Undo. Your totals move with your decisions. Save an
          experiment, then share it with someone who sees the game differently.
        </p>
        <RouterLink to="/builds" class="button-link"
          >Make a build <FzIcon name="arrowRight"
        /></RouterLink>
      </div>
    </section>
    <section class="forza-credit story-reveal">
      <div>
        <h2>Built to be used.<br />Made with Forza.</h2>
        <p>
          BuildValue is an independent application built with Forza UI. Shared
          components. Traceable data. An open-source UI library you can use.
        </p>
      </div>
      <div class="credit-links">
        <a href="https://forzaui.chrisdalbano.com"
          >Explore Forza UI <FzIcon name="arrowUpRight" /></a
        ><a href="https://github.com/Chrisdalbano/forza-ui"
          >Forza source code <FzIcon name="arrowUpRight" /></a
        ><RouterLink to="/about"
          >Understand the method <FzIcon name="arrowRight"
        /></RouterLink>
      </div>
    </section>
  </div>
</template>
