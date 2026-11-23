import { shallowRef } from "vue";
import { apiGet, type Champion } from "../domain/api";
/**
 * The champion roster, fetched once and shared, so AI output that names a
 * champion can show its portrait. Nothing is requested until a caller asks.
 */
const roster = shallowRef<Map<string, Champion>>(new Map());
let request: Promise<void> | null = null;
const normal = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, "");
export function useChampions() {
  function ensure() {
    request ??= apiGet<{ champions: Champion[] }>("/champions")
      .then((data) => {
        const byName = new Map<string, Champion>();
        for (const champion of data.champions || []) {
          const key = normal(champion.name);
          const previous = byName.get(key);
          if (
            !previous ||
            champion.patch.localeCompare(previous.patch, undefined, {
              numeric: true,
            }) > 0
          )
            byName.set(key, champion);
        }
        roster.value = byName;
      })
      .catch(() => {
        request = null; // portraits are optional; try again next time
      });
  }
  function portrait(name: string | undefined): string | null {
    const champion = name ? roster.value.get(normal(name)) : undefined;
    return champion
      ? `https://ddragon.leagueoflegends.com/cdn/${champion.patch}/img/champion/${champion.id}.png`
      : null;
  }
  return { ensure, portrait };
}
