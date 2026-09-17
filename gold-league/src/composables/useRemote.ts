import { shallowRef, watch, toValue, type MaybeRefOrGetter } from "vue";
import { apiGet } from "../domain/api";
export function useRemote<T>(path: MaybeRefOrGetter<string>) {
  const data = shallowRef<T | null>(null),
    loading = shallowRef(false),
    error = shallowRef("");
  const retry = shallowRef(0);
  watch(
    [() => toValue(path), retry],
    async ([url], _, onCleanup) => {
      const controller = new AbortController();
      onCleanup(() => controller.abort());
      data.value = null;
      error.value = "";
      loading.value = !!url;
      if (!url) return;
      const timeout = setTimeout(() => controller.abort("timeout"), 55000);
      try {
        const result = await apiGet<T>(url, controller.signal);
        if (!controller.signal.aborted) data.value = result;
      } catch {
        if (
          !controller.signal.aborted ||
          controller.signal.reason === "timeout"
        )
          error.value =
            "The analysis service could not be reached. Your build is still available.";
      } finally {
        clearTimeout(timeout);
        if (
          !controller.signal.aborted ||
          controller.signal.reason === "timeout"
        )
          loading.value = false;
      }
    },
    { immediate: true },
  );
  return { data, loading, error, reload: () => retry.value++ };
}
