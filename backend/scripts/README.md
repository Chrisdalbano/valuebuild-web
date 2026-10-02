# Backend scripts

One-off diagnostics and maintenance scripts. They are not part of the test
suite (that lives in `backend/tests/`) and several of them talk to the network
or to MongoDB. Run them from `backend/` as modules so imports resolve:

```bash
python -m scripts.diagnose_kraken
python -m scripts.smoke_filtering
```

| Script | What it does | Touches |
|---|---|---|
| `diagnose_kraken.py`, `diagnose_missing.py` | Explain why a given item is or is not filtered | Data Dragon |
| `check_missing_items.py`, `check_missing_mythics.py`, `verify_items.py` | Compare the cached catalog against Data Dragon | Data Dragon, MongoDB (read) |
| `smoke_filtering.py` | Run the eligibility filter over a live item file | Data Dragon |
| `smoke_api.py`, `smoke_api_response.py` | Call a running API and print responses | local or hosted API |
| `smoke_etl.py`, `smoke_champion_etl.py` | Run an ETL once | Data Dragon, MongoDB (write) |
| `smoke_best_on.py`, `smoke_champion_prompt.py` | Print the prompts built for the AI studies | none |
| `cleanup_database.py`, `remove_arena_items.py` | Remove stale documents | MongoDB (write) |
