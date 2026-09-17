import { onMounted, onBeforeUnmount, type Ref } from "vue";
/** Marketing choreography only. Never imported by the component package. */
export function useShowcaseMotion(root: Ref<HTMLElement | null>) {
  let dispose: (() => void) | undefined;
  let cancelled = false;
  onMounted(async () => {
    const [{ gsap }, { ScrollTrigger }] = await Promise.all([
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);
    if (cancelled || !root.value) return;
    gsap.registerPlugin(ScrollTrigger);
    const scope = root.value;
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from(".hero h1", { y: 48, opacity: 0, duration: 1.1 })
          .from(
            ".hero-copy > p, .hero-actions, .hero-note",
            { y: 18, opacity: 0, stagger: 0.12, duration: 0.7 },
            "-=.65",
          )
          .from(
            ".hero-art svg",
            {
              rotate: -7,
              scale: 0.88,
              opacity: 0,
              duration: 1.4,
              clearProps: "transform,opacity",
            },
            0,
          );
        gsap.to(".scroll-progress", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: scope,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        });
        scope.querySelectorAll(".section-heading").forEach((heading) => {
          gsap.from(heading, {
            y: 32,
            duration: 0.85,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: { trigger: heading, start: "top 92%", once: true },
          });
        });
        gsap.from(".motion-tile", {
          y: 55,
          rotate: -4,
          stagger: 0.14,
          duration: 1,
          ease: "power3.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: ".motion-stage",
            start: "top 85%",
            once: true,
          },
        });
        gsap.to(".motion-word", {
          xPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: ".motion-band",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
        gsap.to(".motion-line", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ".motion-stage",
            start: "top 85%",
            end: "bottom 40%",
            scrub: 0.6,
          },
        });
      },
      scope,
    );
    dispose = () => media.revert();
    document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
  });
  onBeforeUnmount(() => {
    cancelled = true;
    dispose?.();
  });
}
