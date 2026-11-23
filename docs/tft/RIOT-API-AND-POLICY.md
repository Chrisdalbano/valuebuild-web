# Teamfight Tactics: Riot API, keys and policy

What BuildValue's TFT section may do, what it needs from Riot, and what is still the owner's to arrange. Read on 2026-11-23 from the pages named. Quotes are verbatim. Anything marked *unconfirmed* was not found on a page that could be fetched that day.

## Where BuildValue stands

| Part | Riot API key | Status |
|---|---|---|
| Roll odds, item ledger, trait prices | none | Works from Community Dragon's static data and a bundled snapshot. |
| Game review (`GET /api/tft/review`) | yes, on the backend | Built and tested against fixtures. **Never run against the real API**: there is no key in this repository, on this machine, or in `render.yaml`. Whether one is set in the Render dashboard cannot be seen from the code. |

The game review reads two environment variables on the backend, `RIOT_API_KEY` and `TFT_REVIEW_RIOT_ID`. It reviews that one account. There is no player search, on purpose (see "What a TFT product may do").

## What needs the owner

1. **Register the change.** "All products must be registered in, and audited by Riot Games through the Developer Portal", and "Any new features or changes to a product must be audited through the product's page in the Developer Portal" ([general policies](https://developer.riotgames.com/policies/general), last updated 2025-05-29). Adding TFT to BuildValue is such a change. Whether BuildValue is registered today is not known from the repository.
2. **Decide whether the game review is public or private.** Public needs a production key and Riot Sign On. Private (the owner's own account, on his own machine or a non-public backend) fits a personal key.
3. **Do not set `RIOT_API_KEY` on the public Render service** until item 2 is settled. With both variables set, the public site would show one account's review to every visitor on a key that is not allowed to serve the public.
4. **Decide on the notice wording.** Riot's required text is longer than the footer's current sentence (below).

## Keys

From the [Developer Portal docs](https://developer.riotgames.com/docs/portal):

| Key | For | Limits | Notes |
|---|---|---|---|
| Development | trying the API | *unconfirmed on the page*; commonly 20 requests a second and 100 every two minutes | "They also deactivate every 24 hours." "You may not maintain a public product with a development API key." |
| Personal | "products that are intended for just the developer or a small private community" | "20 requests every 1 second / 100 requests every 2 minutes" per region | Needs product registration with a description; no verification; "won't be approved for rate limit increases". "You may not run your application for public consumption using a personal key, regardless of how long the approval process for your production key takes." |
| Production | public products | "500 requests every 10 seconds / 30,000 requests every 10 minutes" per region to start | "Typically requires a working prototype before receiving an API key." One product per key. |

Riot Sign On: "This access is only available to developers with Production Level API Keys."

Whether one product registration or one key can cover both League and TFT is *unconfirmed*. The TFT docs list separate approved uses for TFT, and the portal registers a product under a game; check in the portal before assuming the League registration extends to TFT.

One review costs at most 22 requests (one account lookup, one match list, up to 20 matches), spaced 80 ms apart and cached for 15 minutes, which fits a personal or development key.

## Endpoints the review uses

Shapes from the OpenAPI mirror of Riot's reference (`mingweisamuel.com/riotapi-schema`), routing from [developer.riotgames.com/docs/tft](https://developer.riotgames.com/docs/tft).

| API | Call | Host |
|---|---|---|
| account-v1 | `GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}` | regional: `americas`, `europe`, `asia` |
| tft-match-v1 | `GET /tft/match/v1/matches/by-puuid/{puuid}/ids?count=` | regional (also `sea`) |
| tft-match-v1 | `GET /tft/match/v1/matches/{matchId}` | regional |

Not used: tft-league-v1 and tft-summoner-v1 (rank and profile are leaderboard material, which this section does not do). Players are identified by PUUID everywhere; `summonerId` is gone from the league DTOs.

Fields read from each match, and only from the reviewed player's own row: `placement`, `level`, `gold_left`, `last_round`, `units[].character_id`, `units[].tier`, `units[].itemNames`, `traits[].tier_current`, `traits[].style`, plus `info.queue_id` (1100 is ranked), `info.tft_set_number` and `info.game_datetime`.

Unverified against a live response, because no call was made: that `character_id` matches Community Dragon's `apiName` for set 18 (the review matches them case-insensitively and counts units it cannot price), and that `itemNames` uses the `TFT_Item_*` names. `augments` is optional in the schema and is not used.

## What a TFT product may do

From the "General Teamfight Tactics Policy" and use-case lists on [developer.riotgames.com/docs/tft](https://developer.riotgames.com/docs/tft):

- Encouraged: "Products that help players improve their skills over time are encouraged. Pre-game best practices or post-game analysis are great spaces for this."
- Allowed: "Having a static recommendation for a player pre-game is acceptable, even if that same recommendation is available to you the entire game."
- Not allowed: "Scouting - tracking the champions opponents have on their boards.", "Apps that provide dynamic, real-time information.", "Apps that dictate player decisions.", and "Products cannot display win rates for Legends and Legend-based Augments."
- "Products should not remove game decisions, but may highlight decisions that are important and give multiple choices to help players make good decisions."
- "Products may not provide information that was not available prior to the game."

Approved uses by key:

| Use | Needs |
|---|---|
| "Personal sites.", "School projects.", "Creating a proof of concept for Production Key request." | personal key |
| "Aggregate player stats (no specific players)." "Official Ladder Leaderboards." | production key |
| "Showing (self) player stats." "Training tools that allow players to view their own match histories and aggregate stats." | production key **with RSO** |

How BuildValue's tools sit against that:

- The three static tools take no game state and read no match. They are pre-game arithmetic over published data. The roll page shows the chance under two plans and says which is higher "in this model"; it does not tell the player what to do in a live game, and it cannot, because it has no live game.
- The game review is post-game and about the player's own rows only. Other participants are never read (there is a test for that). It is a "training tool that lets a player view their own match history", which on a public product needs RSO. That is why it has no search box and is tied to one configured account.

General policy, same page as item 1 above: "Products cannot create alternatives for official skill ranking systems such as the ranked ladder. Prohibited alternatives include MMR or ELO calculators." "Products cannot de-anonymize players who cannot reasonably be identified from visible information." "Do not include your API key in your code". Monetising needs an Approved or Acknowledged product and a free tier. BuildValue has no ranking, no accounts and no monetisation.

## Notice and assets

Riot's required text: "[Your product] isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc." It must be "in a location that is readily visible to players".

The footer currently reads "BuildValue is not endorsed by Riot Games. League of Legends, Teamfight Tactics and their assets belong to Riot Games." That keeps the wording the site has had since launch and adds TFT. It is shorter than Riot's text. Switching to the exact text is a one-line change in `gold-league/src/components/layout/AppFooter.vue` and is left as the owner's decision.

Assets: unit, item and trait pictures are loaded from Community Dragon's CDN (`raw.communitydragon.org/latest/game/...`), not copied into the repository, the same way League item art is loaded from Data Dragon. No Riot logo or wordmark is used. "Products cannot closely resemble Riot's games or products in style or function": the pages use BuildValue's own interface. A rule about using "TFT" or "League" in a product name was not found on the pages read (*unconfirmed*); BuildValue's name contains neither.

## Static data and the set change

- Source: `https://raw.communitydragon.org/latest/cdragon/tft/en_us.json` (24 MB, all sets). The backend keeps the highest numbered set, units that have traits, and the standard two-component items. Riot's own Data Dragon TFT files exist but carry no stats, recipes or breakpoints.
- Shop odds: Riot's `tft-shop-drop-rates-data.json` on Data Dragon (16.23.1), which matches the table in the game data and the patch notes for 16.1 and 17.1.
- Pool sizes (30 / 25 / 18 / 10 / 9) and units per tier (14 / 13 / 14 / 14 / 10): the set 18 shop bags in Community Dragon's `map22.bin.json`; the League Wiki agrees.
- XP per level, reroll price, shop size, XP purchase, interest: League Wiki (`TFT:Experience`, `TFT:Champion`, `TFT:Gold`). The XP for levels 8 to 10 also match Riot's 16.1 and 16.4 patch notes; levels 3 to 7 rest on the wiki alone.
- Star scaling (180% health and 150% attack damage per star) and the resistance formula: League Wiki, `TFT:Champion`.

**Set 18 (Enchanted Wilds) is ending.** Patch 18.7 of 2026-11-17 is its last, and Riot dates set 19.1 at 2026-12-01 with a new Data Dragon format produced by the new client. The set 18 data on Community Dragon comes from the legacy client. When set 19 is live:

1. Run `cd backend && python -m scripts.sync_tft_snapshot`. If Community Dragon no longer carries TFT, the script will keep producing set 18 and the source needs replacing (Riot's new Data Dragon export is the candidate).
2. Add a set 19 entry to `backend/tft/economy.py` with odds, pool sizes and XP re-read from the sources above. Until then the pages show "These constants were checked for a different set" and should be treated as approximate.
3. Check the set mechanic. Set 18's Wisps take a shop slot every other shop (`slotPattern`); set 19 will have its own.
4. Rerun `python -m scripts.make_tft_review_example` so the example uses current units.
