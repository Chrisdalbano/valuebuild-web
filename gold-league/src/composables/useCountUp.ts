import {
  onBeforeUnmount,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from "vue";
/** True when the visitor asked the system for less motion. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}
/**
 * A number that travels to its new value instead of jumping, so a change in a
 * total reads as a change. With reduced motion it is set at once. The final
 * value is always exact; only the frames in between are interpolated.
 */
export function useCountUp(
  target: MaybeRefOrGetter<number>,
  duration = 420,
) {
  const shown = shallowRef(toValue(target));
  let frame = 0;
  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };
  watch(
    () => toValue(target),
    (to, from) => {
      stop();
      const start = Number.isFinite(shown.value) ? shown.value : (from ?? 0);
      if (
        prefersReducedMotion() ||
        !Number.isFinite(to) ||
        start === to ||
        typeof requestAnimationFrame !== "function"
      ) {
        shown.value = to;
        return;
      }
      const began = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - began) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        shown.value = t >= 1 ? to : start + (to - start) * eased;
        frame = t >= 1 ? 0 : requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    },
  );
  onBeforeUnmount(stop);
  return shown;
}
