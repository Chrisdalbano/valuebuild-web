/**
 * The TFT game review reads one configured account through a Riot API key on
 * the backend. The public site has no such key, so a production build leaves
 * the page out entirely: no link, no route, no mention. It is on in
 * development and tests, and in a build made with VITE_TFT_REVIEW=1 for a
 * private deployment that has the key.
 */
export const tftReviewEnabled: boolean =
  import.meta.env.DEV || import.meta.env.VITE_TFT_REVIEW === "1";
