import { shallowRef } from "vue";
import { apiGet } from "../domain/api";
import type { TftSet } from "../domain/tft/types";
import snapshot from "../data/tft.snapshot.json";
/**
 * TFT set data. The page opens on the bundled snapshot and then asks the
 * backend for the live trimmed set, exactly as the League catalog does. A
 * failed or malformed refresh leaves the snapshot in place and says so.
 */
const data = shallowRef<TftSet>(snapshot as unknown as TftSet);
const source = shallowRef("Bundled snapshot");
const loading = shallowRef(false);
let asked = false;
function valid(value: unknown): value is TftSet {
  const set = value as TftSet;
  return (
    !!set &&
    Array.isArray(set.units) &&
    set.units.length > 0 &&
    Array.isArray(set.traits) &&
    Array.isArray(set.items) &&
    Array.isArray(set.components) &&
    !!set.economy?.shopOdds &&
    Array.isArray(set.economy.poolSize) &&
    typeof set.set?.number === "number"
  );
}
async function refresh() {
  if (loading.value) return;
  loading.value = true;
  try {
    const next = await apiGet<TftSet>("/tft/set");
    if (!valid(next)) throw new Error("Invalid TFT data");
    data.value = next;
    source.value = "BuildValue API";
  } catch {
    if (source.value !== "BuildValue API")
      source.value = "Bundled snapshot · offline fallback";
  } finally {
    loading.value = false;
  }
}
/**
 * `live` asks the backend for the current set once. Only the TFT pages pass
 * it, so a League visitor never causes a TFT request.
 */
export function useTft(options: { live?: boolean } = {}) {
  if (options.live && !asked) {
    asked = true;
    void refresh();
  }
  return { data, source, loading, refresh };
}
