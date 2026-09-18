export const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "/backend" : "https://valuebuild-web.onrender.com");
export async function apiGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${API_BASE}/api${path}`, {
    signal: signal || AbortSignal.timeout(55000),
  });
  if (!response.ok) throw new Error(`Request failed (${response.status})`);
  return response.json() as Promise<T>;
}
export interface Champion {
  id: string;
  name: string;
  tags: string[];
  rangeType: string;
  patch: string;
}
export interface Analysis {
  status: string;
  configured?: boolean;
  patch?: string;
  generatedAt?: string;
  caveats?: string;
  coreBuild?: { itemIds: string[]; rationale: string };
  progression?: {
    stage: string;
    gold: string;
    itemIds: string[];
    note: string;
  }[];
  situational?: { when: string; itemIds: string[]; why: string }[];
  experimental?: { title: string; itemIds: string[]; rationale: string };
  economy?: { ahead: string; behind: string };
  outliers?: {
    itemId: string;
    name: string;
    efficiency: number;
    direction: string;
    claim: string;
  }[];
  effectSpotlights?: {
    itemId: string;
    name: string;
    effectName: string;
    insight: string;
    analysis?: string;
  }[];
  experimentalBuilds?: {
    title: string;
    itemIds: string[];
    rationale: string;
    champion?: string;
  }[];
  effects?: {
    name: string;
    description?: string;
    estimatedGoldValue?: number;
    reasoning?: string[];
    baseStatEquivalence?: string;
    comparisons?: { stat: string; amount: number; gold: number }[];
    explanation?: string;
    confidence?: string;
  }[];
  summary?: string;
  bestOn?: {
    champions: { name: string; why: string; synergyStat?: string; confidence?: string }[];
    caveats?: string;
  };
}
